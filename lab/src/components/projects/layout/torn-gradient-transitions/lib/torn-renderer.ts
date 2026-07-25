import * as THREE from "three";
import {
  TORN_FRAGMENT_SHADER,
  TORN_VERTEX_SHADER,
} from "../shaders/torn-transition.glsl";
import { DIRECTION_MODE_INDEX } from "./transition-state-machine";
import type {
  QualityMode,
  TornTransitionSettings,
  TransitionOrigin,
} from "./transition-types";
import {
  COSINE_PALETTES,
  EDGE_PROFILES,
  PALETTE_MODE_INDEX,
  QUALITY_PROFILES,
  REVEAL_MODE_INDEX,
  edgeMargin,
  hexToLinear,
} from "./transition-utils";

export type RenderFrame = {
  lead: number;
  trail: number;
  origin: TransitionOrigin;
  pointer: TransitionOrigin;
  /** Shader clock in seconds. The caller owns it so it can be paused. */
  time: number;
};

type Uniforms = Record<string, THREE.IUniform>;

function vec3(x = 0, y = 0, z = 0) {
  return new THREE.Vector3(x, y, z);
}

/**
 * Owns the one WebGL context this project ever creates.
 *
 * The class is deliberately outside React: uniforms are mutated in place from
 * the animation loop, so a running transition produces zero React renders.
 * Only the phase changes (a handful per transition) cross back into state.
 */
export class TornRenderer {
  readonly canvas: HTMLCanvasElement;

  private renderer: THREE.WebGLRenderer | null = null;
  private scene = new THREE.Scene();
  private camera = new THREE.Camera();
  private geometry: THREE.PlaneGeometry | null = null;
  private material: THREE.ShaderMaterial | null = null;
  private mesh: THREE.Mesh | null = null;
  private uniforms: Uniforms;

  private quality: QualityMode;
  private width = 1;
  private height = 1;
  private dpr = 1;
  private contextLost = false;

  constructor(canvas: HTMLCanvasElement, quality: QualityMode) {
    this.canvas = canvas;
    this.quality = quality;
    this.uniforms = createUniforms();

    canvas.addEventListener("webglcontextlost", this.handleContextLost);
    canvas.addEventListener("webglcontextrestored", this.handleContextRestored);

    this.build();
  }

  get isReady() {
    return this.renderer !== null && !this.contextLost;
  }

  get renderSize() {
    return {
      width: Math.round(this.width * this.dpr),
      height: Math.round(this.height * this.dpr),
      dpr: this.dpr,
    };
  }

  private handleContextLost = (event: Event) => {
    // Preventing the default is what makes a restore possible at all.
    event.preventDefault();
    this.contextLost = true;
  };

  private handleContextRestored = () => {
    this.contextLost = false;
    this.disposeGpu();
    this.build();
    this.resize(this.width, this.height, this.dpr);
  };

  private build() {
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: false,
        premultipliedAlpha: false,
        powerPreference: "high-performance",
        depth: false,
        stencil: false,
      });
    } catch {
      this.renderer = null;
      return;
    }

    this.renderer.setClearColor(0x000000, 0);
    this.renderer.autoClear = true;

    this.geometry = new THREE.PlaneGeometry(2, 2);
    this.material = new THREE.ShaderMaterial({
      vertexShader: TORN_VERTEX_SHADER,
      fragmentShader: TORN_FRAGMENT_SHADER,
      uniforms: this.uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      // One quad, nothing underneath in the scene: straight alpha out, and the
      // browser composites the canvas over the DOM.
      blending: THREE.NoBlending,
      defines: {
        FBM_OCTAVES: QUALITY_PROFILES[this.quality].fbmOctaves,
      },
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
  }

  setQuality(quality: QualityMode) {
    if (quality === this.quality) return;
    this.quality = quality;
    if (!this.material) return;
    // Octave count is a compile-time constant, so the program must rebuild.
    this.material.defines = {
      FBM_OCTAVES: QUALITY_PROFILES[quality].fbmOctaves,
    };
    this.material.needsUpdate = true;
  }

  resize(width: number, height: number, dpr: number) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.dpr = Math.max(0.5, dpr);

    if (!this.renderer) return;
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(this.width, this.height, false);
    this.uniforms.uAspect.value = this.width / this.height;
  }

  /** Pushes every setting into the uniform block. Cheap enough to call per frame. */
  applySettings(settings: TornTransitionSettings) {
    const u = this.uniforms;
    const profile = EDGE_PROFILES[settings.edgeProfile];

    u.uMargin.value = edgeMargin(settings);
    u.uRevealMode.value = REVEAL_MODE_INDEX[settings.revealMode];
    u.uDirMode.value = DIRECTION_MODE_INDEX[settings.direction];

    // Shape
    u.uBandWidth.value = settings.bandWidth;
    u.uTearAmp.value = settings.tearAmplitude;
    u.uTearFreq.value = settings.tearFrequency;
    u.uEdgeRough.value = settings.edgeRoughness;
    u.uEdgeSharp.value = settings.edgeSharpness;
    u.uEdgeThickness.value = settings.edgeThickness;
    u.uSecondaryOffset.value = settings.secondaryEdgeOffset;
    u.uFragment.value = settings.fragmentAmount;
    u.uHole.value = settings.holeAmount;
    u.uStretch.value = settings.directionalStretch;
    (u.uProfileWeights.value as THREE.Vector4).set(...profile.weights);
    u.uProfileFeather.value = profile.feather;
    u.uDeckle.value = settings.deckleStrength;

    // Bubbles
    u.uBubbleAmount.value = settings.bubbleAmount;
    u.uBubbleScale.value = settings.bubbleScale;
    u.uBubbleVariation.value = settings.bubbleVariation;
    u.uBubbleInflation.value = settings.bubbleInflation;
    u.uBubbleMerge.value = settings.bubbleMerge;
    u.uBubbleSpeed.value = settings.bubbleSpeed;
    u.uBubbleEdge.value = settings.bubbleEdgeConcentration;
    u.uPointerInfluence.value = settings.pointerInfluence;

    // Paper
    u.uFiberAmount.value = settings.fiberAmount;
    u.uFiberLength.value = settings.fiberLength;
    u.uFiberDir.value = settings.fiberDirection;
    u.uPulpGrain.value = settings.pulpGrain;
    u.uSpeckle.value = settings.speckleAmount;
    u.uWrinkleAmount.value = settings.wrinkleAmount;
    u.uWrinkleScale.value = settings.wrinkleScale;
    u.uPaperDensity.value = settings.paperDensity;
    u.uFoldAmount.value = settings.foldAmount;

    // Depth & lighting
    u.uSurfaceDepth.value = settings.surfaceDepth;
    u.uDisplacement.value = settings.displacementStrength;
    (u.uLightDir.value as THREE.Vector3)
      .set(settings.lightX, settings.lightY, settings.lightHeight)
      .normalize();
    u.uDiffuse.value = settings.diffuseStrength;
    u.uRim.value = settings.rimStrength;
    u.uSpecular.value = settings.specularStrength;
    u.uRoughness.value = settings.roughness;
    u.uCavity.value = settings.cavityShadow;
    u.uCastShadow.value = settings.castShadowStrength;
    u.uEdgeHighlight.value = settings.edgeHighlight;
    u.uUnderside.value = settings.undersideDarkness;

    // Gradient
    u.uPaletteMode.value = PALETTE_MODE_INDEX[settings.paletteMode];
    u.uStopCount.value = Math.round(settings.stopCount);
    (u.uColor1.value as THREE.Vector3).set(...hexToLinear(settings.color1));
    (u.uColor2.value as THREE.Vector3).set(...hexToLinear(settings.color2));
    (u.uColor3.value as THREE.Vector3).set(...hexToLinear(settings.color3));
    (u.uColor4.value as THREE.Vector3).set(...hexToLinear(settings.color4));

    const cos = COSINE_PALETTES[settings.cosinePalette];
    (u.uCosA.value as THREE.Vector3).set(...cos.a);
    (u.uCosB.value as THREE.Vector3).set(...cos.b);
    (u.uCosC.value as THREE.Vector3).set(...cos.c);
    (u.uCosD.value as THREE.Vector3).set(...cos.d);

    u.uGradAngle.value = settings.gradientAngle;
    u.uGradScale.value = settings.gradientScale;
    u.uGradMotion.value = settings.gradientMotion;
    u.uHueTravel.value = settings.hueTravel;
    u.uSaturation.value = settings.saturation;
    u.uBrightness.value = settings.brightness;
    u.uContrast.value = settings.contrast;
    u.uColorDistortion.value = settings.colorDistortion;
    u.uIridescence.value = settings.iridescence;

    // Finishing
    u.uGrain.value = settings.grain;
    u.uDither.value = settings.dither;
    u.uBlur.value = settings.blur;
    u.uEdgeGlow.value = settings.edgeGlow;
    u.uChroma.value = settings.chromaticSeparation;
    u.uVignette.value = settings.vignette;
    u.uAlpha.value = settings.alpha;
    u.uTextureScale.value = settings.textureScale;
  }

  render(frame: RenderFrame) {
    if (!this.renderer || this.contextLost) return;
    const u = this.uniforms;
    u.uLead.value = frame.lead;
    u.uTrail.value = frame.trail;
    u.uTime.value = frame.time;
    (u.uOrigin.value as THREE.Vector2).set(frame.origin.x, frame.origin.y);
    (u.uPointer.value as THREE.Vector2).set(frame.pointer.x, frame.pointer.y);
    this.renderer.render(this.scene, this.camera);
  }

  clear() {
    this.renderer?.clear();
  }

  private disposeGpu() {
    if (this.mesh) this.scene.remove(this.mesh);
    this.geometry?.dispose();
    this.material?.dispose();
    this.renderer?.dispose();
    this.geometry = null;
    this.material = null;
    this.mesh = null;
    this.renderer = null;
  }

  dispose() {
    this.canvas.removeEventListener("webglcontextlost", this.handleContextLost);
    this.canvas.removeEventListener(
      "webglcontextrestored",
      this.handleContextRestored,
    );
    this.disposeGpu();
  }
}

function createUniforms(): Uniforms {
  return {
    uAspect: { value: 1 },
    uTime: { value: 0 },

    uLead: { value: 0 },
    uTrail: { value: 0 },
    uDirMode: { value: 0 },
    uRevealMode: { value: 0 },
    uOrigin: { value: new THREE.Vector2(0.5, 0.5) },
    uPointer: { value: new THREE.Vector2(0.5, 0.5) },
    uMargin: { value: 0.3 },

    uBandWidth: { value: 0.22 },
    uTearAmp: { value: 0.11 },
    uTearFreq: { value: 1.5 },
    uEdgeRough: { value: 0.8 },
    uEdgeSharp: { value: 0.72 },
    uEdgeThickness: { value: 0.16 },
    uSecondaryOffset: { value: 0.05 },
    uFragment: { value: 0.3 },
    uHole: { value: 0.16 },
    uStretch: { value: 2.6 },
    uProfileWeights: { value: new THREE.Vector4(0.5, 0.34, 0.24, 0.18) },
    uProfileFeather: { value: 1 },
    uDeckle: { value: 0.3 },

    uBubbleAmount: { value: 0.55 },
    uBubbleScale: { value: 5.5 },
    uBubbleVariation: { value: 0.7 },
    uBubbleInflation: { value: 1 },
    uBubbleMerge: { value: 0.35 },
    uBubbleSpeed: { value: 0.4 },
    uBubbleEdge: { value: 0.7 },
    uPointerInfluence: { value: 0.35 },

    uFiberAmount: { value: 0.5 },
    uFiberLength: { value: 2.2 },
    uFiberDir: { value: 0.35 },
    uPulpGrain: { value: 0.55 },
    uSpeckle: { value: 0.3 },
    uWrinkleAmount: { value: 0.4 },
    uWrinkleScale: { value: 2.4 },
    uPaperDensity: { value: 0.5 },
    uFoldAmount: { value: 0.24 },

    uSurfaceDepth: { value: 1 },
    uDisplacement: { value: 0.85 },
    uLightDir: { value: vec3(-0.45, 0.62, 0.7).normalize() },
    uDiffuse: { value: 1 },
    uRim: { value: 0.35 },
    uSpecular: { value: 0.25 },
    uRoughness: { value: 0.72 },
    uCavity: { value: 0.45 },
    uCastShadow: { value: 0.5 },
    uEdgeHighlight: { value: 0.4 },
    uUnderside: { value: 0.5 },

    uPaletteMode: { value: 0 },
    uStopCount: { value: 3 },
    uColor1: { value: vec3(1, 1, 1) },
    uColor2: { value: vec3(0.7, 0.7, 0.7) },
    uColor3: { value: vec3(0.4, 0.4, 0.45) },
    uColor4: { value: vec3(0.1, 0.1, 0.12) },
    uCosA: { value: vec3(0.5, 0.5, 0.5) },
    uCosB: { value: vec3(0.5, 0.5, 0.5) },
    uCosC: { value: vec3(1, 1, 1) },
    uCosD: { value: vec3(0, 0.33, 0.67) },
    uSaturation: { value: 1 },
    uBrightness: { value: 1 },
    uContrast: { value: 1 },

    uGradAngle: { value: 0.5 },
    uGradScale: { value: 0.9 },
    uGradMotion: { value: 0.3 },
    uHueTravel: { value: 0.12 },
    uColorDistortion: { value: 0.4 },
    uIridescence: { value: 0.25 },

    uGrain: { value: 0.12 },
    uDither: { value: 0.6 },
    uBlur: { value: 0 },
    uEdgeGlow: { value: 0.15 },
    uChroma: { value: 0.12 },
    uVignette: { value: 0.15 },
    uAlpha: { value: 1 },
    uTextureScale: { value: 1 },
  };
}
