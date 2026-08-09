/**
 * Shared single-context thumbnail blit for material / animation previews.
 * Captures JPEG data URLs — never mount N WebGL canvases in the grid.
 */

import { MONOCHROME_DEFAULTS } from "../../constants";
import { ProceduralAnimationController } from "../animation/ProceduralAnimationController";
import type { AnimationEngineConfig, AnimationModeId } from "../animation/types";
import { DEFAULT_ANIMATION_CONFIG } from "../animation/types";
import { defaultModeParams } from "../animation/modes/catalog";
import { ColorMaterialController } from "../color/ColorMaterialController";
import type { ColorMaterialConfig } from "../color/types";
import { DEFAULT_COLOR_MATERIAL } from "../color/types";
import {
  tryCreateSurfaceRenderer,
  type SurfaceRenderer,
} from "../core/SurfaceRenderer";
import { UniformStore } from "../core/UniformStore";
import { DitherController } from "../dither/DitherController";
import type { DitherConfig } from "../dither/types";
import { DEFAULT_DITHER_CONFIG } from "../dither/types";
import { InteractionController } from "../interaction/InteractionController";
import { DEFAULT_INTERACTION_CONFIG } from "../interaction/types";
import { LightShapeController } from "../lighting/LightShapeController";
import type { LightShapeConfig } from "../lighting/types";
import { DEFAULT_LIGHT_SHAPE } from "../lighting/types";
import { MaterialController } from "../material/MaterialController";
import type { EngineMaterialId, MaterialEngineConfig } from "../material/types";
import {
  DEFAULT_MATERIAL_CONFIG,
  DEFAULT_MATERIAL_PARAMS,
  createDefaultLayers,
} from "../material/types";
import { applyMaterialDefaults } from "../material/catalog";
import type { MonochromeParams } from "../../types";

export type ThumbScene = {
  params?: Partial<MonochromeParams>;
  color?: Partial<ColorMaterialConfig>;
  light?: Partial<LightShapeConfig>;
  dither?: Partial<DitherConfig>;
  animation?: Partial<AnimationEngineConfig>;
};

function materialConfig(id: EngineMaterialId): MaterialEngineConfig {
  return {
    ...DEFAULT_MATERIAL_CONFIG,
    materialId: id,
    params: {
      ...DEFAULT_MATERIAL_PARAMS,
      ...applyMaterialDefaults(id),
    },
    layers: createDefaultLayers(id),
    lowQuality: true,
  };
}

export class ThumbBlitEngine {
  private canvas: HTMLCanvasElement;
  private store: UniformStore;
  private anim: ProceduralAnimationController;
  private ix: InteractionController;
  private color: ColorMaterialController;
  private light: LightShapeController;
  private dither: DitherController;
  private material: MaterialController;
  private renderer: SurfaceRenderer;
  private disposed = false;
  private size: number;

  constructor(size = 128) {
    this.size = size;
    this.canvas = document.createElement("canvas");
    this.canvas.width = size;
    this.canvas.height = size;
    const webgl = tryCreateSurfaceRenderer(this.canvas);
    if (!webgl) {
      throw new Error("ThumbBlitEngine requires WebGL2");
    }
    this.renderer = webgl;
    this.store = new UniformStore({
      ...MONOCHROME_DEFAULTS,
      contrast: 1.25,
      bloom: 0.42,
      grainAmount: 0.06,
      pixelDensity: 1,
      animationSpeed: 1,
    });
    this.store.setResolution(size, size, 1);
    this.store.snapCurrentToTargets();
    this.anim = new ProceduralAnimationController({
      ...DEFAULT_ANIMATION_CONFIG,
      modeId: "wave",
      blendDuration: 0,
      timeline: { ...DEFAULT_ANIMATION_CONFIG.timeline, playing: true },
    });
    this.ix = new InteractionController({
      ...DEFAULT_INTERACTION_CONFIG,
      enabled: false,
    });
    this.color = new ColorMaterialController(DEFAULT_COLOR_MATERIAL);
    this.light = new LightShapeController(DEFAULT_LIGHT_SHAPE);
    this.dither = new DitherController(DEFAULT_DITHER_CONFIG);
    this.material = new MaterialController(materialConfig("paper"));
  }

  applyScene(scene: ThumbScene): void {
    if (scene.params) {
      this.store.setParams(scene.params);
      this.store.snapCurrentToTargets();
    }
    if (scene.color) this.color.syncFromProps(scene.color);
    if (scene.light) this.light.syncFromProps(scene.light);
    if (scene.dither) this.dither.syncFromProps(scene.dither);
    if (scene.animation) this.anim.syncFromProps(scene.animation);
  }

  captureMaterial(
    id: EngineMaterialId,
    override?: Partial<MaterialEngineConfig>,
    time = 1.4,
  ): string {
    this.material.syncFromProps({ ...materialConfig(id), ...override });
    return this.captureFrame(time);
  }

  /** Low-cost frame for live dock refresh (fewer sim steps, lower JPEG quality). */
  captureMaterialLive(
    id: EngineMaterialId,
    time: number,
  ): string {
    this.material.syncFromProps(materialConfig(id));
    if (this.disposed) return "";
    this.store.setResolution(this.size, this.size, 1);
    this.store.snapCurrentToTargets();
    this.drawOnce(1 / 30);
    this.drawOnce(Math.max(0.02, time % 0.5));
    try {
      return this.canvas.toDataURL("image/jpeg", 0.62);
    } catch {
      return "";
    }
  }

  captureAnimation(modeId: AnimationModeId, time = 1.6): string {
    this.anim.syncFromProps({
      modeId,
      modeParams: defaultModeParams(modeId),
      blendDuration: 0,
      timeline: { ...DEFAULT_ANIMATION_CONFIG.timeline, playing: true },
    });
    return this.captureFrame(time);
  }

  private captureFrame(time: number): string {
    if (this.disposed) return "";
    this.store.setResolution(this.size, this.size, 1);
    this.store.snapCurrentToTargets();
    const dt = 1 / 60;
    for (let i = 0; i < 3; i++) {
      this.drawOnce(dt);
    }
    const steps = 10;
    const stepDt = time / steps;
    for (let i = 0; i < steps; i++) {
      this.drawOnce(stepDt);
    }
    try {
      return this.canvas.toDataURL("image/jpeg", 0.78);
    } catch {
      return "";
    }
  }

  private drawOnce(dt: number): void {
    const current = this.store.current;
    // Snap non-damped fields toward targets for static thumbs
    this.store.snapCurrentToTargets();
    const payload = this.anim.tick(
      dt * Math.max(0.2, current.animationSpeed),
      false,
    );
    current.time = payload.time;
    const ixPayload = this.ix.tick(dt, false, payload.time, {
      lightX: current.lightX,
      lightY: current.lightY,
      influence: 1,
    });
    current.pointerX = ixPayload.pointerX;
    current.pointerY = ixPayload.pointerY;
    this.renderer.draw(
      current,
      payload,
      ixPayload,
      this.color.tick(dt, false),
      this.light.tick(dt, false),
      this.dither.tick(),
      this.material.tick(false),
    );
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.renderer.dispose();
  }
}
