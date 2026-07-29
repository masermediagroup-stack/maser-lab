import { bayerToTextureData } from "../dither/bayer";
import { BLUE_NOISE_SIZE, generateBlueNoiseTexture } from "../dither/blueNoise";
import { createProgram, getUniformLocations } from "./createProgram";
import { FRAG_SRC, VERT_SRC } from "../pipeline/stages";
import type { MonochromeUniformState } from "../../types";
import type { DitherSize } from "../../types";
import type { AnimationUniformPayload } from "../animation/types";
import { IDLE_ANIMATION_PAYLOAD } from "../animation/types";

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
  "uBayer2",
  "uBayer4",
  "uBayer8",
  "uBayer16",
  "uBlueNoise",
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
      uploadBayer(gl, 16, 3),
      uploadBlueNoise(gl, 4, 0.37),
    );

    gl.useProgram(this.program);
    gl.uniform1i(this.uniforms.uBayer2, 0);
    gl.uniform1i(this.uniforms.uBayer4, 1);
    gl.uniform1i(this.uniforms.uBayer8, 2);
    gl.uniform1i(this.uniforms.uBayer16, 3);
    gl.uniform1i(this.uniforms.uBlueNoise, 4);
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
    gl.uniform2f(u.uPointer, state.pointerX, state.pointerY);
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

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
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
