import {
  Euler,
  Group,
  PMREMGenerator,
  Quaternion,
  Scene,
  Vector2,
  type PerspectiveCamera,
  type Shape,
  type WebGLRenderer,
  type WebGLRenderTarget,
} from "three";
import type {
  CameraSettings,
  ChromeMarkSettings,
  LogoInfo,
  TraceSettings,
  ViewPresetId,
} from "../types";
import { LogoLoadError } from "../types";
import { CAMERA_DEFAULTS, DEFAULT_SETTINGS, VIEW_PRESETS } from "../defaults";
import {
  applyChromeMaterials,
  createChromeMaterials,
  disposeChromeMaterials,
  type ChromeMaterials,
} from "./create-chrome-material";
import { createLogoGeometry, disposeLogoGroup } from "./create-logo-geometry";
import { createChromeRenderer } from "./create-renderer";
import {
  EXPORT_GEOMETRY_QUALITY,
  INTERACTIVE_GEOMETRY_QUALITY,
  tessellateGeometry,
  type GeometryQualityId,
} from "./geometry-quality";
import { createStudioEnvironment } from "./create-studio-environment";
import { createProductCamera, applyCameraSettings, fitLogoToCamera } from "./fit-camera";
import { loadSvgLogo } from "./load-svg-logo";
import { resolveSpinAxis, spinSign } from "./animation";
import { tracePngLogo } from "./trace-png-logo";

const RESUME_MS = 600;

type PointerMode = "idle" | "orbit" | "pan" | "pinch";

export class ChromeEngine {
  readonly canvas: HTMLCanvasElement;
  readonly renderer: WebGLRenderer;
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  readonly orientation = new Group();
  readonly pose = new Group();

  private readonly pmrem: PMREMGenerator;
  private materials: ChromeMaterials;
  private envTarget: WebGLRenderTarget | null = null;
  private logoGroup: Group | null = null;
  private shapes: Shape[] | null = null;
  private rasterBlob: Blob | null = null;
  private settings: ChromeMarkSettings = structuredClone(DEFAULT_SETTINGS);
  private logoInfo: LogoInfo | null = null;
  private raf = 0;
  private lastTime = 0;
  private width = 1;
  private height = 1;
  private reducedMotion = false;
  private disposed = false;
  private spinAngle = 0;
  private yaw = 0;
  private pitch = 0;
  private yawVel = 0;
  private pitchVel = 0;
  private suspended = false;
  private resumeAt = 0;
  private pointerMode: PointerMode = "idle";
  private lastPointer = new Vector2();
  private pointers = new Map<number, Vector2>();
  private pinchStart = 0;
  private pinchDistance0 = 0;
  private geomKey = "";
  private envKey = "";
  private geometryQuality: GeometryQualityId = INTERACTIVE_GEOMETRY_QUALITY;
  private container: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;

  onCameraChange: ((camera: CameraSettings) => void) | null = null;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute("aria-label", "ChromeMark 3D viewport");
    this.renderer = createChromeRenderer(this.canvas);
    this.scene = new Scene();
    this.scene.background = null;
    this.camera = createProductCamera();
    this.pmrem = new PMREMGenerator(this.renderer);
    this.materials = createChromeMaterials(this.settings.material);
    this.scene.add(this.orientation);
    this.orientation.add(this.pose);
    this.rebuildEnvironment(true);
    this.bindPointer();
  }

  attach(container: HTMLElement): void {
    this.container = container;
    container.appendChild(this.canvas);
    this.resizeObserver?.disconnect();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();
    this.lastTime = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObserver?.disconnect();
    this.unbindPointer();
    disposeLogoGroup(this.logoGroup);
    disposeChromeMaterials(this.materials);
    this.envTarget?.dispose();
    this.pmrem.dispose();
    this.renderer.dispose();
    this.canvas.remove();
  }

  setReducedMotion(value: boolean): void {
    this.reducedMotion = value;
  }

  resetInteraction(): void {
    this.resetGrab();
    this.orientation.quaternion.identity();
  }

  getLogoInfo(): LogoInfo | null {
    return this.logoInfo;
  }

  getMaxTextureSize(): number {
    return this.renderer.capabilities.maxTextureSize;
  }

  setSettings(next: ChromeMarkSettings): void {
    const prev = this.settings;
    this.settings = next;
    this.renderer.toneMappingExposure = next.environment.exposure;
    this.scene.environmentIntensity = next.environment.envIntensity;
    this.scene.environmentRotation.set(
      0,
      (next.environment.envRotation * Math.PI) / 180,
      0,
    );
    applyChromeMaterials(this.materials, next.material);
    this.applyPose(next.camera);

    const geomKey = JSON.stringify({
      g: next.geometry,
      t: next.trace,
      q: this.geometryQuality,
    });
    if (this.shapes && geomKey !== this.geomKey) {
      if (this.rasterBlob && rasterTraceChanged(prev.trace, next.trace)) {
        void this.reloadRaster(next.trace);
      } else {
        this.rebuildGeometry();
      }
    }

    const envKey = JSON.stringify({
      keyWidth: next.environment.keyWidth,
      keyAngle: next.environment.keyAngle,
      stripStrength: next.environment.stripStrength,
      stripWidth: next.environment.stripWidth,
      blockerStrength: next.environment.blockerStrength,
    });
    if (envKey !== this.envKey) this.rebuildEnvironment(false);

    this.applyCamera();
  }

  async loadFile(file: File): Promise<LogoInfo> {
    const name = file.name || "logo";
    const type = file.type || "";
    if (type.includes("svg") || name.toLowerCase().endsWith(".svg")) {
      const text = await file.text();
      return this.loadSvg(text, name);
    }
    if (
      type.includes("png") ||
      name.toLowerCase().endsWith(".png") ||
      type.includes("image")
    ) {
      return this.loadRaster(file, name);
    }
    throw new LogoLoadError(
      "unsupported",
      "Use a filled or stroked SVG, or a transparent PNG.",
    );
  }

  loadSvg(text: string, filename: string): LogoInfo {
    const shapes = loadSvgLogo(text);
    this.rasterBlob = null;
    this.shapes = shapes;
    const info: LogoInfo = {
      filename,
      kind: "svg",
      opaqueRaster: false,
    };
    this.logoInfo = info;
    this.rebuildGeometry();
    this.resetGrab();
    this.resize();
    this.fitLogo();
    return info;
  }

  async loadRaster(file: Blob, filename: string): Promise<LogoInfo> {
    this.rasterBlob = file;
    const traced = await tracePngLogo(file, this.settings.trace);
    this.shapes = traced.shapes;
    const info: LogoInfo = {
      filename,
      kind: "png",
      width: traced.width,
      height: traced.height,
      opaqueRaster: traced.opaqueRaster,
    };
    this.logoInfo = info;
    this.rebuildGeometry();
    this.resetGrab();
    this.resize();
    this.fitLogo();
    return info;
  }

  applyViewPreset(preset: ViewPresetId): CameraSettings {
    const next = { ...this.settings.camera };
    if (preset === "reset") {
      next.azimuth = CAMERA_DEFAULTS.azimuth;
      next.polar = CAMERA_DEFAULTS.polar;
      next.panX = 0;
      next.panY = 0;
      next.fov = CAMERA_DEFAULTS.fov;
      if (this.logoGroup) {
        next.distance = fitLogoToCamera(
          this.camera,
          this.logoGroup,
          next,
          this.width,
          this.height,
        );
      } else {
        next.distance = CAMERA_DEFAULTS.distance;
      }
    } else {
      const view = VIEW_PRESETS[preset];
      next.azimuth = view.azimuth;
      next.polar = view.polar;
    }
    this.settings = { ...this.settings, camera: next };
    this.applyCamera();
    return next;
  }

  fitLogo(): CameraSettings {
    if (!this.logoGroup) return this.settings.camera;
    const distance = fitLogoToCamera(
      this.camera,
      this.logoGroup,
      this.settings.camera,
      this.width,
      this.height,
    );
    const camera = { ...this.settings.camera, distance };
    this.settings = { ...this.settings, camera };
    this.applyCamera();
    return camera;
  }

  getOrientation(): Quaternion {
    return this.orientation.quaternion.clone();
  }

  setOrientation(q: Quaternion): void {
    this.orientation.quaternion.copy(q);
  }

  async withExportGeometry<T>(fn: () => Promise<T>): Promise<T> {
    const previous = this.geometryQuality;
    this.geometryQuality = EXPORT_GEOMETRY_QUALITY;
    this.rebuildGeometry();
    try {
      return await fn();
    } finally {
      this.geometryQuality = previous;
      this.rebuildGeometry();
    }
  }

  snapshotSpin(): { quaternion: Quaternion; spinAngle: number } {
    return {
      quaternion: this.orientation.quaternion.clone(),
      spinAngle: this.spinAngle,
    };
  }

  renderFrame(): void {
    this.renderer.setRenderTarget(null);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
  }

  private rebuildGeometry(): void {
    if (!this.shapes) return;
    disposeLogoGroup(this.logoGroup);
    this.logoGroup = createLogoGeometry(
      this.shapes,
      tessellateGeometry(this.settings.geometry, this.geometryQuality),
      this.materials,
    );
    this.pose.add(this.logoGroup);
    this.geomKey = JSON.stringify({
      g: this.settings.geometry,
      t: this.settings.trace,
      q: this.geometryQuality,
    });
  }

  private rebuildEnvironment(force: boolean): void {
    const env = this.settings.environment;
    const envKey = JSON.stringify({
      keyWidth: env.keyWidth,
      keyAngle: env.keyAngle,
      stripStrength: env.stripStrength,
      stripWidth: env.stripWidth,
      blockerStrength: env.blockerStrength,
    });
    if (!force && envKey === this.envKey) return;
    const created = createStudioEnvironment(
      this.renderer,
      this.pmrem,
      env,
      this.envTarget,
    );
    this.envTarget = created.target;
    this.scene.environment = created.texture;
    this.envKey = envKey;
    this.scene.environmentIntensity = env.envIntensity;
    this.scene.environmentRotation.set(
      0,
      (env.envRotation * Math.PI) / 180,
      0,
    );
  }

  private applyCamera(): void {
    applyCameraSettings(this.camera, this.settings.camera, this.width, this.height);
  }

  private applyPose(camera: CameraSettings): void {
    this.pose.rotation.set(
      (camera.objectRotX * Math.PI) / 180,
      (camera.objectRotY * Math.PI) / 180,
      (camera.objectRotZ * Math.PI) / 180,
    );
  }

  private async reloadRaster(trace: TraceSettings): Promise<void> {
    if (!this.rasterBlob) return;
    const traced = await tracePngLogo(this.rasterBlob, trace);
    this.shapes = traced.shapes;
    if (this.logoInfo) {
      this.logoInfo = { ...this.logoInfo, opaqueRaster: traced.opaqueRaster };
    }
    this.rebuildGeometry();
  }

  private resize(): void {
    if (!this.container || this.disposed) return;
    const rect = this.container.getBoundingClientRect();
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(this.width, this.height, false);
    this.applyCamera();
  }

  private tick = (time: number): void => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.tick);
    const dt = Math.min(0.05, (time - this.lastTime) / 1000 || 0);
    this.lastTime = time;
    this.stepAnimation(dt, time);
    this.renderFrame();
  };

  private stepAnimation(dt: number, now: number): void {
    if (this.pointerMode === "idle") {
      this.yaw += this.yawVel * dt;
      this.pitch += this.pitchVel * dt;
      this.yawVel *= Math.pow(0.08, dt * 60);
      this.pitchVel *= Math.pow(0.08, dt * 60);
      if (Math.abs(this.yawVel) < 1e-4) this.yawVel = 0;
      if (Math.abs(this.pitchVel) < 1e-4) this.pitchVel = 0;
    }

    if (
      this.suspended &&
      this.pointerMode === "idle" &&
      now >= this.resumeAt
    ) {
      this.suspended = false;
    }

    const anim = this.settings.animation;
    const canSpin =
      anim.playing &&
      !this.reducedMotion &&
      !this.suspended &&
      this.pointerMode === "idle";
    if (canSpin) {
      this.spinAngle +=
        spinSign(anim.direction) * anim.speed * Math.PI * 2 * dt;
    }

    const q = new Quaternion();
    q.setFromEuler(new Euler(this.pitch, this.yaw, 0, "YXZ"));
    const spin = new Quaternion().setFromAxisAngle(
      resolveSpinAxis(anim),
      this.spinAngle,
    );
    this.orientation.quaternion.copy(q).multiply(spin);
  }

  private resetGrab(): void {
    this.yaw = 0;
    this.pitch = 0;
    this.spinAngle = 0;
    this.yawVel = 0;
    this.pitchVel = 0;
  }

  private bindPointer(): void {
    const el = this.canvas;
    el.addEventListener("pointerdown", this.onPointerDown);
    el.addEventListener("pointermove", this.onPointerMove);
    el.addEventListener("pointerup", this.onPointerUp);
    el.addEventListener("pointercancel", this.onPointerUp);
    el.addEventListener("wheel", this.onWheel, { passive: false });
    el.addEventListener("contextmenu", this.onContext);
  }

  private unbindPointer(): void {
    const el = this.canvas;
    el.removeEventListener("pointerdown", this.onPointerDown);
    el.removeEventListener("pointermove", this.onPointerMove);
    el.removeEventListener("pointerup", this.onPointerUp);
    el.removeEventListener("pointercancel", this.onPointerUp);
    el.removeEventListener("wheel", this.onWheel);
    el.removeEventListener("contextmenu", this.onContext);
  }

  private onContext = (event: Event): void => {
    event.preventDefault();
  };

  private onPointerDown = (event: PointerEvent): void => {
    this.canvas.setPointerCapture(event.pointerId);
    this.pointers.set(event.pointerId, new Vector2(event.clientX, event.clientY));
    this.suspended = true;
    this.yawVel = 0;
    this.pitchVel = 0;
    if (this.pointers.size === 2) {
      this.pointerMode = "pinch";
      const pts = [...this.pointers.values()];
      this.pinchDistance0 = pts[0]!.distanceTo(pts[1]!);
      this.pinchStart = this.settings.camera.distance;
      return;
    }
    this.pointerMode = event.shiftKey ? "pan" : "orbit";
    this.lastPointer.set(event.clientX, event.clientY);
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (!this.pointers.has(event.pointerId)) return;
    this.pointers.set(event.pointerId, new Vector2(event.clientX, event.clientY));
    if (this.pointerMode === "pinch" && this.pointers.size === 2) {
      const pts = [...this.pointers.values()];
      const dist = pts[0]!.distanceTo(pts[1]!);
      const ratio = this.pinchDistance0 / Math.max(dist, 1);
      this.settings = {
        ...this.settings,
        camera: {
          ...this.settings.camera,
          distance: Math.min(12, Math.max(0.7, this.pinchStart * ratio)),
        },
      };
      this.applyCamera();
      this.onCameraChange?.(this.settings.camera);
      return;
    }
    if (this.pointerMode === "idle") return;
    const dx = event.clientX - this.lastPointer.x;
    const dy = event.clientY - this.lastPointer.y;
    this.lastPointer.set(event.clientX, event.clientY);
    if (this.pointerMode === "pan") {
      const panScale = this.settings.camera.distance * 0.0018;
      this.settings = {
        ...this.settings,
        camera: {
          ...this.settings.camera,
          panX: this.settings.camera.panX - dx * panScale,
          panY: this.settings.camera.panY + dy * panScale,
        },
      };
      this.applyCamera();
      this.onCameraChange?.(this.settings.camera);
      return;
    }
    const sens = 0.005;
    this.yaw += dx * sens;
    this.pitch += dy * sens;
    this.pitch = Math.max(-1.2, Math.min(1.2, this.pitch));
    this.yawVel = dx * sens * 48;
    this.pitchVel = dy * sens * 48;
  };

  private onPointerUp = (event: PointerEvent): void => {
    this.pointers.delete(event.pointerId);
    if (this.pointers.size === 0) {
      this.pointerMode = "idle";
      this.resumeAt = performance.now() + RESUME_MS;
    } else if (this.pointers.size === 1) {
      this.pointerMode = "orbit";
      const remaining = [...this.pointers.values()][0]!;
      this.lastPointer.copy(remaining);
    }
  };

  private onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    const factor = Math.exp(event.deltaY * 0.0012);
    this.settings = {
      ...this.settings,
      camera: {
        ...this.settings.camera,
        distance: Math.min(
          12,
          Math.max(0.7, this.settings.camera.distance * factor),
        ),
      },
    };
    this.applyCamera();
    this.onCameraChange?.(this.settings.camera);
  };
}

function rasterTraceChanged(a: TraceSettings, b: TraceSettings): boolean {
  return (
    a.alphaThreshold !== b.alphaThreshold ||
    a.traceDetail !== b.traceDetail ||
    a.smoothing !== b.smoothing
  );
}
