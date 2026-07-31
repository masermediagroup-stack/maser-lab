import { bayerToTextureData } from "../dither/bayer";
import { BLUE_NOISE_SIZE, generateBlueNoiseTexture } from "../dither/blueNoise";
import { createProgram, getUniformLocations } from "./createProgram";
import { FRAG_SRC, VERT_SRC } from "../pipeline/stages";
import type { MonochromeUniformState } from "../../types";
import type { DitherSize } from "../../types";
import type { AnimationUniformPayload } from "../animation/types";
import { IDLE_ANIMATION_PAYLOAD } from "../animation/types";
import type { InteractionUniformPayload } from "../interaction/types";
import { idleInteractionPayload } from "../interaction/types";
import type { ColorUniformPayload } from "../color/types";
import { idleColorPayload } from "../color/types";
import type { LightUniformPayload } from "../lighting/types";
import { idleLightPayload } from "../lighting/types";

const UNIFORM_NAMES = [
  "uResolution",
  "uDpr",
  "uTime",
  "uDitherSize",
  "uPosterization",
  "uNoiseScale",
  "uNoiseSpeed",
  "uContrast",
  "uBrightness",
  "uGradientAngle",
  "uGradientColorA",
  "uGradientColorB",
  "uBloom",
  "uBloomRadius",
  "uGrainAmount",
  "uPixelDensity",
  "uShadowStrength",
  "uHighlightStrength",
  "uSoftEdge",
  "uRandomSeed",
  "uCursorInfluence",
  "uScrollInfluence",
  "uDepth",
  "uLightX",
  "uLightY",
  "uOpacity",
  "uBlueNoiseAmount",
  "uPointer",
  "uScroll",
  "uAnimModeA",
  "uAnimModeB",
  "uAnimBlend",
  "uAnimParamsA0",
  "uAnimParamsA1",
  "uAnimParamsB0",
  "uAnimParamsB1",
  "uIxPointer",
  "uIxVelocity",
  "uIxState",
  "uIxMode",
  "uIxInfluence",
  "uIxHold",
  "uIxFalloffType",
  "uIxFalloffRadius",
  "uIxFalloffSoft",
  "uIxFalloffPower",
  "uIxTrailMode",
  "uIxTrailIntensity",
  "uIxTrailWidth",
  "uIxRippleStyle",
  "uIxRippleFreq",
  "uIxRippleThick",
  "uIxLightCount",
  "uIxDebug",
  "uIxReleasePulse",
  "uIxStateBright",
  "uIxStateBloom",
  "uIxStateContrast",
  "uIxStateRadiusMul",
  "uIxTrailCount",
  "uIxLights0",
  "uIxLights1",
  "uIxLights2",
  "uIxLights3",
  "uIxLights4",
  "uIxLights5",
  "uIxLights6",
  "uIxLights7",
  "uIxLightCol",
  "uIxLightColB",
  "uIxRipples0",
  "uIxRipples1",
  "uIxRipples2",
  "uIxRipples3",
  "uIxTrail0",
  "uIxTrail1",
  "uIxTrail2",
  "uIxTrail3",
  "uBayer2",
  "uBayer4",
  "uBayer8",
  "uBayer32",
  "uBayer64",
  "uBlueNoise",
  "uMatColorEnabled",
  "uMatGradMode",
  "uMatGradBehavior",
  "uMatGradSpeed",
  "uMatGradOffset",
  "uMatBlendMode",
  "uMatBehavior",
  "uMatExposure",
  "uMatGamma",
  "uMatThreshold",
  "uMatDensity",
  "uMatSharpness",
  "uMatSmoothness",
  "uMatBlur",
  "uMatWeight",
  "uMatScatter",
  "uMatC0",
  "uMatC1",
  "uMatC2",
  "uMatC3",
  "uMatC4",
  "uMatC5",
  "uMatC6",
  "uMatC7",
  "uMatC8",
  "uMatC9",
  "uMatC10",
  "uLsShape",
  "uLsCenterX",
  "uLsCenterY",
  "uLsRadius",
  "uLsStretchX",
  "uLsStretchY",
  "uLsRotation",
  "uLsCore",
  "uLsEdge",
  "uLsFalloff",
  "uLsFalloffCurve",
  "uLsContrast",
  "uLsDitherResponse",
  "uLsGradFollows",
  "uLsPointerFollow",
];

function uploadBayer(
  gl: WebGL2RenderingContext,
  size: DitherSize,
  unit: number,
): WebGLTexture {
  const tex = gl.createTexture();
  if (!tex) throw new Error("Failed to create Bayer texture");
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  const data = bayerToTextureData(size);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    size,
    size,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    data,
  );
  return tex;
}

function uploadBlueNoise(
  gl: WebGL2RenderingContext,
  unit: number,
  seed: number,
): WebGLTexture {
  const tex = gl.createTexture();
  if (!tex) throw new Error("Failed to create blue-noise texture");
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  const data = generateBlueNoiseTexture(BLUE_NOISE_SIZE, seed);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    BLUE_NOISE_SIZE,
    BLUE_NOISE_SIZE,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    data,
  );
  return tex;
}

export class SurfaceRenderer {
  readonly canvas: HTMLCanvasElement;
  readonly gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private uniforms: Record<string, WebGLUniformLocation | null>;
  private textures: WebGLTexture[] = [];
  private vao: WebGLVertexArrayObject;
  private disposed = false;
  private lastSeed = -1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });
    if (!gl) throw new Error("WebGL2 unavailable");
    this.gl = gl;

    this.program = createProgram(gl, VERT_SRC, FRAG_SRC);
    this.uniforms = getUniformLocations(gl, this.program, UNIFORM_NAMES);

    const vao = gl.createVertexArray();
    if (!vao) throw new Error("Failed to create VAO");
    this.vao = vao;

    this.textures.push(
      uploadBayer(gl, 2, 0),
      uploadBayer(gl, 4, 1),
      uploadBayer(gl, 8, 2),
      uploadBayer(gl, 32, 3),
      uploadBlueNoise(gl, 4, 0.37),
      uploadBayer(gl, 64, 5),
    );

    gl.useProgram(this.program);
    gl.uniform1i(this.uniforms.uBayer2, 0);
    gl.uniform1i(this.uniforms.uBayer4, 1);
    gl.uniform1i(this.uniforms.uBayer8, 2);
    gl.uniform1i(this.uniforms.uBayer32, 3);
    gl.uniform1i(this.uniforms.uBlueNoise, 4);
    gl.uniform1i(this.uniforms.uBayer64, 5);
  }

  resize(cssWidth: number, cssHeight: number, dpr: number): void {
    if (this.disposed) return;
    const w = Math.max(1, Math.floor(cssWidth * dpr));
    const h = Math.max(1, Math.floor(cssHeight * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.gl.viewport(0, 0, w, h);
  }

  private maybeRefreshBlueNoise(seed: number): void {
    if (Math.abs(seed - this.lastSeed) < 0.001) return;
    this.lastSeed = seed;
    const gl = this.gl;
    const tex = this.textures[4];
    if (!tex) return;
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    const data = generateBlueNoiseTexture(BLUE_NOISE_SIZE, seed);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      BLUE_NOISE_SIZE,
      BLUE_NOISE_SIZE,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      data,
    );
  }

  draw(
    state: MonochromeUniformState,
    anim: AnimationUniformPayload = IDLE_ANIMATION_PAYLOAD,
    ix: InteractionUniformPayload = idleInteractionPayload(),
    color: ColorUniformPayload = idleColorPayload(),
    light: LightUniformPayload = idleLightPayload(),
  ): void {
    if (this.disposed) return;
    const gl = this.gl;
    const u = this.uniforms;

    this.maybeRefreshBlueNoise(state.randomSeed);

    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);

    for (let i = 0; i < this.textures.length; i++) {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, this.textures[i]!);
    }

    const time = anim.time || state.time;

    gl.uniform2f(u.uResolution, state.resolutionX, state.resolutionY);
    gl.uniform1f(u.uDpr, state.dpr);
    gl.uniform1f(u.uTime, time);
    gl.uniform1f(u.uDitherSize, state.ditherSize);
    gl.uniform1f(u.uPosterization, state.posterization);
    gl.uniform1f(u.uNoiseScale, state.noiseScale);
    gl.uniform1f(u.uNoiseSpeed, state.noiseSpeed);
    gl.uniform1f(u.uContrast, state.contrast);
    gl.uniform1f(u.uBrightness, state.brightness);
    gl.uniform1f(u.uGradientAngle, state.gradientAngle);
    gl.uniform1f(u.uGradientColorA, state.gradientColorA);
    gl.uniform1f(u.uGradientColorB, state.gradientColorB);
    gl.uniform1f(u.uBloom, state.bloom);
    gl.uniform1f(u.uBloomRadius, state.bloomRadius);
    gl.uniform1f(u.uGrainAmount, state.grainAmount);
    gl.uniform1f(u.uPixelDensity, state.pixelDensity);
    gl.uniform1f(u.uShadowStrength, state.shadowStrength);
    gl.uniform1f(u.uHighlightStrength, state.highlightStrength);
    gl.uniform1f(u.uSoftEdge, state.softEdge);
    gl.uniform1f(u.uRandomSeed, state.randomSeed);
    gl.uniform1f(u.uCursorInfluence, state.cursorInfluence);
    gl.uniform1f(u.uScrollInfluence, state.scrollInfluence);
    gl.uniform1f(u.uDepth, state.depth);
    gl.uniform1f(u.uLightX, state.lightX);
    gl.uniform1f(u.uLightY, state.lightY);
    gl.uniform1f(u.uOpacity, state.opacity);
    gl.uniform1f(u.uBlueNoiseAmount, state.blueNoiseAmount);
    gl.uniform2f(u.uPointer, ix.pointerX, ix.pointerY);
    gl.uniform1f(u.uScroll, state.scrollY);

    gl.uniform1f(u.uAnimModeA, anim.modeA);
    gl.uniform1f(u.uAnimModeB, anim.modeB);
    gl.uniform1f(u.uAnimBlend, anim.blend);
    gl.uniform4f(
      u.uAnimParamsA0,
      anim.paramsA0[0],
      anim.paramsA0[1],
      anim.paramsA0[2],
      anim.paramsA0[3],
    );
    gl.uniform4f(
      u.uAnimParamsA1,
      anim.paramsA1[0],
      anim.paramsA1[1],
      anim.paramsA1[2],
      anim.paramsA1[3],
    );
    gl.uniform4f(
      u.uAnimParamsB0,
      anim.paramsB0[0],
      anim.paramsB0[1],
      anim.paramsB0[2],
      anim.paramsB0[3],
    );
    gl.uniform4f(
      u.uAnimParamsB1,
      anim.paramsB1[0],
      anim.paramsB1[1],
      anim.paramsB1[2],
      anim.paramsB1[3],
    );

    this.uploadInteraction(gl, u, ix);
    this.uploadLight(gl, u, light);
    this.uploadColor(gl, u, color);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  private uploadLight(
    gl: WebGL2RenderingContext,
    u: Record<string, WebGLUniformLocation | null>,
    light: LightUniformPayload,
  ): void {
    gl.uniform1f(u.uLsShape, light.shape);
    gl.uniform1f(u.uLsCenterX, light.centerX);
    gl.uniform1f(u.uLsCenterY, light.centerY);
    gl.uniform1f(u.uLsRadius, light.radius);
    gl.uniform1f(u.uLsStretchX, light.stretchX);
    gl.uniform1f(u.uLsStretchY, light.stretchY);
    gl.uniform1f(u.uLsRotation, light.rotation);
    gl.uniform1f(u.uLsCore, light.coreBrightness);
    gl.uniform1f(u.uLsEdge, light.edgeDarkness);
    gl.uniform1f(u.uLsFalloff, light.falloff);
    gl.uniform1f(u.uLsFalloffCurve, light.falloffCurve);
    gl.uniform1f(u.uLsContrast, light.lightContrast);
    gl.uniform1f(u.uLsDitherResponse, light.ditherResponse);
    gl.uniform1f(u.uLsGradFollows, light.gradientFollowsLight);
    gl.uniform1f(u.uLsPointerFollow, light.pointerFollow);
  }

  private uploadColor(
    gl: WebGL2RenderingContext,
    u: Record<string, WebGLUniformLocation | null>,
    color: ColorUniformPayload,
  ): void {
    gl.uniform1f(u.uMatColorEnabled, color.colorEnabled);
    gl.uniform1f(u.uMatGradMode, color.gradientMode);
    gl.uniform1f(u.uMatGradBehavior, color.gradientBehavior);
    gl.uniform1f(u.uMatGradSpeed, color.gradientSpeed);
    gl.uniform1f(u.uMatGradOffset, color.gradientOffset);
    gl.uniform1f(u.uMatBlendMode, color.blendMode);
    gl.uniform1f(u.uMatBehavior, color.behavior);
    gl.uniform1f(u.uMatExposure, color.exposure);
    gl.uniform1f(u.uMatGamma, color.gamma);
    gl.uniform1f(u.uMatThreshold, color.threshold);
    gl.uniform1f(u.uMatDensity, color.density);
    gl.uniform1f(u.uMatSharpness, color.sharpness);
    gl.uniform1f(u.uMatSmoothness, color.smoothness);
    gl.uniform1f(u.uMatBlur, color.blur);
    gl.uniform1f(u.uMatWeight, color.materialWeight);
    gl.uniform1f(u.uMatScatter, color.lightScatter);

    const c = color.colors;
    // Pack 14×rgb into vec4 slots matching colorGlsl accessors
    gl.uniform4f(u.uMatC0, c[0]!, c[1]!, c[2]!, c[3]!);
    gl.uniform4f(u.uMatC1, c[4]!, c[5]!, c[6]!, c[7]!);
    gl.uniform4f(u.uMatC2, c[8]!, c[9]!, c[10]!, c[11]!);
    gl.uniform4f(u.uMatC3, c[12]!, c[13]!, c[14]!, c[15]!);
    gl.uniform4f(u.uMatC4, c[16]!, c[17]!, c[18]!, c[19]!);
    gl.uniform4f(u.uMatC5, c[20]!, c[21]!, c[22]!, c[23]!);
    gl.uniform4f(u.uMatC6, c[24]!, c[25]!, c[26]!, c[27]!);
    gl.uniform4f(u.uMatC7, c[28]!, c[29]!, c[30]!, c[31]!);
    gl.uniform4f(u.uMatC8, c[32]!, c[33]!, c[34]!, c[35]!);
    gl.uniform4f(u.uMatC9, c[36]!, c[37]!, c[38]!, c[39]!);
    gl.uniform2f(u.uMatC10, c[40]!, c[41]!);
  }

  private uploadInteraction(
    gl: WebGL2RenderingContext,
    u: Record<string, WebGLUniformLocation | null>,
    ix: InteractionUniformPayload,
  ): void {
    gl.uniform2f(u.uIxPointer, ix.pointerX, ix.pointerY);
    gl.uniform2f(u.uIxVelocity, ix.velocityX, ix.velocityY);
    gl.uniform1f(u.uIxState, ix.state);
    gl.uniform1f(u.uIxMode, ix.mode);
    gl.uniform1f(u.uIxInfluence, ix.influence);
    gl.uniform1f(u.uIxHold, ix.holdCharge);
    gl.uniform1f(u.uIxFalloffType, ix.falloffType);
    gl.uniform1f(u.uIxFalloffRadius, ix.falloffRadius);
    gl.uniform1f(u.uIxFalloffSoft, ix.falloffSoft);
    gl.uniform1f(u.uIxFalloffPower, ix.falloffPower);
    gl.uniform1f(u.uIxTrailMode, ix.trailMode);
    gl.uniform1f(u.uIxTrailIntensity, ix.trailIntensity);
    gl.uniform1f(u.uIxTrailWidth, ix.trailWidth);
    gl.uniform1f(u.uIxRippleStyle, ix.rippleStyle);
    gl.uniform1f(u.uIxRippleFreq, ix.rippleFreq);
    gl.uniform1f(u.uIxRippleThick, ix.rippleThick);
    gl.uniform1f(u.uIxLightCount, ix.lightCount);
    gl.uniform1f(u.uIxDebug, ix.debug);
    gl.uniform1f(u.uIxReleasePulse, ix.releasePulse);
    gl.uniform1f(u.uIxStateBright, ix.stateBrightness);
    gl.uniform1f(u.uIxStateBloom, ix.stateBloom);
    gl.uniform1f(u.uIxStateContrast, ix.stateContrast);
    gl.uniform1f(u.uIxStateRadiusMul, ix.stateRadiusMul);
    gl.uniform1f(u.uIxTrailCount, ix.trailCount);

    const lightUniforms = [
      u.uIxLights0,
      u.uIxLights1,
      u.uIxLights2,
      u.uIxLights3,
      u.uIxLights4,
      u.uIxLights5,
      u.uIxLights6,
      u.uIxLights7,
    ];
    for (let i = 0; i < 8; i++) {
      gl.uniform4f(
        lightUniforms[i]!,
        ix.lightPos[i * 2] ?? 0.5,
        ix.lightPos[i * 2 + 1] ?? 0.5,
        ix.lightRad[i] ?? 0,
        ix.lightInt[i] ?? 0,
      );
    }
    gl.uniform4f(
      u.uIxLightCol,
      ix.lightCol[0] ?? 1,
      ix.lightCol[1] ?? 1,
      ix.lightCol[2] ?? 1,
      ix.lightCol[3] ?? 1,
    );
    gl.uniform4f(
      u.uIxLightColB,
      ix.lightCol[4] ?? 1,
      ix.lightCol[5] ?? 1,
      ix.lightCol[6] ?? 1,
      ix.lightCol[7] ?? 1,
    );

    const rippleUniforms = [
      u.uIxRipples0,
      u.uIxRipples1,
      u.uIxRipples2,
      u.uIxRipples3,
    ];
    for (let i = 0; i < 4; i++) {
      gl.uniform4f(
        rippleUniforms[i]!,
        ix.ripples[i * 4] ?? 0,
        ix.ripples[i * 4 + 1] ?? 0,
        ix.ripples[i * 4 + 2] ?? 0,
        ix.ripples[i * 4 + 3] ?? 0,
      );
    }

    gl.uniform4f(
      u.uIxTrail0,
      ix.trailPts[0] ?? 0,
      ix.trailPts[1] ?? 0,
      ix.trailPts[2] ?? 0,
      ix.trailPts[3] ?? 0,
    );
    gl.uniform4f(
      u.uIxTrail1,
      ix.trailPts[4] ?? 0,
      ix.trailPts[5] ?? 0,
      ix.trailPts[6] ?? 0,
      ix.trailPts[7] ?? 0,
    );
    gl.uniform4f(
      u.uIxTrail2,
      ix.trailPts[8] ?? 0,
      ix.trailPts[9] ?? 0,
      ix.trailPts[10] ?? 0,
      ix.trailPts[11] ?? 0,
    );
    gl.uniform4f(
      u.uIxTrail3,
      ix.trailPts[12] ?? 0,
      ix.trailPts[13] ?? 0,
      ix.trailPts[14] ?? 0,
      ix.trailPts[15] ?? 0,
    );
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    const gl = this.gl;
    for (const tex of this.textures) gl.deleteTexture(tex);
    this.textures = [];
    gl.deleteVertexArray(this.vao);
    gl.deleteProgram(this.program);
    const lose = gl.getExtension("WEBGL_lose_context");
    lose?.loseContext();
  }
}

export function tryCreateSurfaceRenderer(
  canvas: HTMLCanvasElement,
): SurfaceRenderer | null {
  try {
    return new SurfaceRenderer(canvas);
  } catch {
    return null;
  }
}
