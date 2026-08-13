import {
  ACESFilmicToneMapping,
  Clock,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
  type BufferGeometry,
  type Texture,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {
  DEFAULT_STUDIO_PARAMS,
  EXPORT_SIZE,
  GALLERY_DPR_MAX,
  MATERIAL_ORDER,
  STUDIO_DPR_MAX,
} from "../constants";
import type { GalleryMode, MaterialId, StudioParams } from "../types";
import { createLogoGeometry } from "./create-logo-geometry";
import {
  applyEnvIntensity,
  applyGlassThickness,
  createMaterials,
  disposeMaterials,
  type MaterialMap,
} from "./create-materials";
import {
  createProceduralTextures,
  disposeProceduralTextures,
  type ProceduralTextures,
} from "./procedural-textures";

export type ViewTarget = {
  id: MaterialId;
  element: HTMLElement;
};

type ViewRig = {
  id: MaterialId;
  scene: Scene;
  camera: PerspectiveCamera;
  group: Group;
  mesh: Mesh;
  key: DirectionalLight;
  fill: HemisphereLight;
  rim: DirectionalLight;
  spinOffset: number;
};

function isOffscreen(
  rect: DOMRect,
  canvasWidth: number,
  canvasHeight: number,
): boolean {
  return (
    rect.bottom < 0 ||
    rect.top > canvasHeight ||
    rect.right < 0 ||
    rect.left > canvasWidth
  );
}

export class LogoGalleryEngine {
  private renderer: WebGLRenderer;
  private clock = new Clock();
  private geometry: BufferGeometry;
  private textures: ProceduralTextures;
  private materials: MaterialMap;
  private envMap: Texture;
  private pmrem: PMREMGenerator;
  private room: RoomEnvironment;
  private views = new Map<MaterialId, ViewRig>();
  private studio: ViewRig;
  private targets: ViewTarget[] = [];
  private studioElement: HTMLElement | null = null;
  private mode: GalleryMode = "gallery";
  private studioMaterial: MaterialId = "gold";
  private params: StudioParams = { ...DEFAULT_STUDIO_PARAMS };
  private reducedMotion = false;
  private running = false;
  private gallerySpin = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(this.currentDpr());
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    this.pmrem = new PMREMGenerator(this.renderer);
    this.room = new RoomEnvironment();
    this.envMap = this.pmrem.fromScene(this.room, 0.04).texture;
    this.room.dispose();

    this.textures = createProceduralTextures(512);
    this.geometry = createLogoGeometry(this.params.depth);
    this.materials = createMaterials({
      textures: this.textures,
      envMap: this.envMap,
      envIntensity: this.params.envIntensity,
      depth: this.params.depth,
    });

    MATERIAL_ORDER.forEach((id, index) => {
      this.views.set(id, this.createRig(id, index));
    });
    this.studio = this.createRig(this.studioMaterial, 0);
    this.studio.mesh.material = this.materials[this.studioMaterial];
  }

  private currentDpr(): number {
    const max = this.mode === "studio" ? STUDIO_DPR_MAX : GALLERY_DPR_MAX;
    if (typeof window === "undefined") return 1;
    const narrow = window.innerWidth < 768;
    return Math.min(window.devicePixelRatio, narrow ? Math.min(max, 1.5) : max);
  }

  private createRig(id: MaterialId, index: number): ViewRig {
    const scene = new Scene();
    scene.background = new Color(0x050506);
    scene.environment = this.envMap;

    const camera = new PerspectiveCamera(28, 1, 0.1, 40);
    camera.position.set(0, 0.08, 7.35);
    camera.lookAt(0, 0, 0);

    const group = new Group();
    group.rotation.x = 0.16;
    group.rotation.y = index * 0.55;

    const mesh = new Mesh(this.geometry, this.materials[id]);
    group.add(mesh);
    scene.add(group);

    const key = new DirectionalLight(0xfff6ea, this.params.keyLight);
    key.position.set(2.6, 3.4, 4.2);
    scene.add(key);

    const fill = new HemisphereLight(0xb9d4ea, 0x0a0a0c, 0.55);
    scene.add(fill);

    const rim = new DirectionalLight(0x9ecfff, 0.35);
    rim.position.set(-3.2, 1.2, -2.4);
    scene.add(rim);

    return {
      id,
      scene,
      camera,
      group,
      mesh,
      key,
      fill,
      rim,
      spinOffset: index * 0.55,
    };
  }

  setGalleryTargets(targets: ViewTarget[]): void {
    this.targets = targets;
  }

  setStudioElement(element: HTMLElement | null): void {
    this.studioElement = element;
  }

  setMode(mode: GalleryMode): void {
    if (mode === "studio" && this.mode !== "studio") {
      const from = this.views.get(this.studioMaterial);
      if (from) this.studio.group.rotation.copy(from.group.rotation);
    }
    this.mode = mode;
    this.renderer.setPixelRatio(this.currentDpr());
  }

  setStudioMaterial(id: MaterialId): void {
    this.studioMaterial = id;
    this.studio.mesh.material = this.materials[id];
    this.studio.id = id;
  }

  private depthFrame = 0;

  setParams(params: StudioParams): void {
    const depthChanged = Math.abs(params.depth - this.params.depth) > 0.0001;
    this.params = params;
    this.applyLights();
    applyEnvIntensity(this.materials, params.envIntensity);
    if (depthChanged) {
      cancelAnimationFrame(this.depthFrame);
      this.depthFrame = requestAnimationFrame(() => {
        this.rebuildGeometry(this.params.depth);
      });
    }
    const scale = this.mode === "studio" ? params.scale : 1;
    this.studio.group.scale.setScalar(scale);
  }

  setReducedMotion(value: boolean): void {
    this.reducedMotion = value;
  }

  private applyLights(): void {
    const intensity = this.params.keyLight;
    for (const rig of this.views.values()) {
      rig.key.intensity = intensity;
    }
    this.studio.key.intensity = intensity;
  }

  private rebuildGeometry(depth: number): void {
    const next = createLogoGeometry(depth);
    for (const rig of this.views.values()) {
      rig.mesh.geometry = next;
    }
    this.studio.mesh.geometry = next;
    this.geometry.dispose();
    this.geometry = next;
    applyGlassThickness(this.materials, depth);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    this.renderer.setAnimationLoop(this.tick);
  }

  private tick = (): void => {
    const dt = this.clock.getDelta();
    const spinning = !this.reducedMotion && !this.params.paused;
    const gallerySpeed = spinning ? DEFAULT_STUDIO_PARAMS.spinSpeed : 0;
    const studioSpeed = spinning ? this.params.spinSpeed : 0;

    this.gallerySpin += gallerySpeed * dt;
    for (const rig of this.views.values()) {
      rig.group.rotation.y = rig.spinOffset + this.gallerySpin;
      rig.group.scale.setScalar(1);
    }

    if (this.mode === "studio") {
      this.studio.group.rotation.y += studioSpeed * dt;
      this.studio.group.scale.setScalar(this.params.scale);
    }

    this.renderFrame();
  };

  private resizeRenderer(): void {
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const dpr = this.currentDpr();
    if (
      canvas.width !== Math.floor(width * dpr) ||
      canvas.height !== Math.floor(height * dpr)
    ) {
      this.renderer.setPixelRatio(dpr);
      this.renderer.setSize(width, height, false);
    }
  }

  private renderRig(rig: ViewRig, element: HTMLElement): void {
    const canvas = this.renderer.domElement;
    const rect = element.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    if (isOffscreen(rect, canvasRect.width, canvasRect.height)) return;

    const left = rect.left - canvasRect.left;
    const bottom = canvasRect.bottom - rect.bottom;
    const width = rect.width;
    const height = rect.height;

    rig.camera.aspect = width / height;
    rig.camera.updateProjectionMatrix();

    this.renderer.setViewport(left, bottom, width, height);
    this.renderer.setScissor(left, bottom, width, height);
    this.renderer.render(rig.scene, rig.camera);
  }

  private renderFrame(): void {
    this.resizeRenderer();
    this.renderer.setScissorTest(false);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.clear();
    this.renderer.setScissorTest(true);

    if (this.mode === "studio") {
      if (this.studioElement) this.renderRig(this.studio, this.studioElement);
      return;
    }

    for (const target of this.targets) {
      const rig = this.views.get(target.id);
      if (rig) this.renderRig(rig, target.element);
    }
  }

  async exportPng(size = EXPORT_SIZE): Promise<Blob> {
    const canvas = this.renderer.domElement;
    const prevWidth = canvas.clientWidth;
    const prevHeight = canvas.clientHeight;
    const prevPr = this.renderer.getPixelRatio();
    const prevBg = this.studio.scene.background;
    const prevAspect = this.studio.camera.aspect;

    this.renderer.setAnimationLoop(null);

    this.studio.scene.background = null;
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setScissorTest(false);
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(size, size, false);
    this.studio.camera.aspect = 1;
    this.studio.camera.updateProjectionMatrix();
    this.renderer.setViewport(0, 0, size, size);
    this.renderer.clear();
    this.renderer.render(this.studio.scene, this.studio.camera);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error("PNG export failed"));
      }, "image/png");
    });

    this.studio.scene.background = prevBg;
    this.renderer.setPixelRatio(prevPr);
    this.renderer.setSize(prevWidth, prevHeight, false);
    this.studio.camera.aspect = prevAspect;
    this.studio.camera.updateProjectionMatrix();
    this.renderer.setAnimationLoop(this.tick);

    return blob;
  }

  dispose(): void {
    this.running = false;
    cancelAnimationFrame(this.depthFrame);
    this.renderer.setAnimationLoop(null);
    this.geometry.dispose();
    disposeMaterials(this.materials);
    disposeProceduralTextures(this.textures);
    this.envMap.dispose();
    this.pmrem.dispose();
    this.renderer.dispose();
  }
}
