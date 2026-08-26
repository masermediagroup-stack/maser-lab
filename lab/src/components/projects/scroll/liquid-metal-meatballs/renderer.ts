import {
  LMM_ALBEDO_RGB,
  LMM_CREASE_RGB,
  LMM_MERGE_K,
  LMM_SPEC_RGB,
  MAX_CHARGES,
} from "./constants";
import { FRAG_SRC, VERT_SRC } from "./shaders";

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Failed to create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader) ?? "unknown";
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${info}`);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext): WebGLProgram {
  const vs = createShader(gl, gl.VERTEX_SHADER, VERT_SRC);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
  const program = gl.createProgram();
  if (!program) throw new Error("Failed to create program");
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program) ?? "unknown";
    gl.deleteProgram(program);
    throw new Error(`Program link error: ${info}`);
  }
  return program;
}

let webgl2Availability: boolean | undefined;

export function isWebGL2Available(): boolean {
  if (typeof document === "undefined") return false;
  if (webgl2Availability !== undefined) return webgl2Availability;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", { alpha: true });
    webgl2Availability = Boolean(gl);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return webgl2Availability;
  } catch {
    webgl2Availability = false;
    return false;
  }
}

export class MeatballRenderer {
  private readonly gl: WebGL2RenderingContext;
  private readonly program: WebGLProgram;
  private readonly ballsLoc: WebGLUniformLocation | null;
  private readonly resolutionLoc: WebGLUniformLocation | null;
  private readonly mergeKLoc: WebGLUniformLocation | null;
  private readonly deviceCharges = new Float32Array(MAX_CHARGES * 4);
  private dpr = 1;
  private bufferW = 0;
  private bufferH = 0;
  private disposed = false;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });
    if (!gl) throw new Error("WebGL2 unavailable");
    this.gl = gl;
    this.program = createProgram(gl);
    gl.useProgram(this.program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);

    this.ballsLoc = gl.getUniformLocation(this.program, "uBalls[0]");
    this.resolutionLoc = gl.getUniformLocation(this.program, "uResolution");
    this.mergeKLoc = gl.getUniformLocation(this.program, "uMergeK");

    gl.uniform3f(
      gl.getUniformLocation(this.program, "uAlbedo"),
      LMM_ALBEDO_RGB[0],
      LMM_ALBEDO_RGB[1],
      LMM_ALBEDO_RGB[2],
    );
    gl.uniform3f(
      gl.getUniformLocation(this.program, "uCrease"),
      LMM_CREASE_RGB[0],
      LMM_CREASE_RGB[1],
      LMM_CREASE_RGB[2],
    );
    gl.uniform3f(
      gl.getUniformLocation(this.program, "uSpec"),
      LMM_SPEC_RGB[0],
      LMM_SPEC_RGB[1],
      LMM_SPEC_RGB[2],
    );
  }

  setSize(cssWidth: number, cssHeight: number, dpr: number): void {
    const gl = this.gl;
    const w = Math.max(1, Math.floor(cssWidth * dpr));
    const h = Math.max(1, Math.floor(cssHeight * dpr));
    /* Skip tiny scroll-linked viewport jitter — reallocating the
       drawing buffer clears the canvas and reads as a hitch/flash. */
    if (
      Math.abs(this.bufferW - w) <= 2 &&
      Math.abs(this.bufferH - h) <= 2 &&
      this.dpr === dpr &&
      this.bufferW > 0
    ) {
      return;
    }
    this.dpr = dpr;
    this.bufferW = w;
    this.bufferH = h;
    if (gl.canvas.width !== w || gl.canvas.height !== h) {
      gl.canvas.width = w;
      gl.canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    gl.uniform2f(this.resolutionLoc, w, h);
    gl.uniform1f(this.mergeKLoc, LMM_MERGE_K * dpr);
  }

  draw(cssCharges: Float32Array): void {
    if (this.disposed) return;
    const gl = this.gl;
    const dpr = this.dpr;
    for (let i = 0; i < MAX_CHARGES; i += 1) {
      const src = i * 4;
      const dst = i * 4;
      this.deviceCharges[dst] = cssCharges[src] * dpr;
      this.deviceCharges[dst + 1] = cssCharges[src + 1] * dpr;
      this.deviceCharges[dst + 2] = cssCharges[src + 2] * dpr;
      this.deviceCharges[dst + 3] = cssCharges[src + 3];
    }
    gl.uniform4fv(this.ballsLoc, this.deviceCharges);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /**
   * Drop GL objects. `loseContext` is for true unmount only — losing context
   * on a live `<canvas>` makes the next `getContext('webgl2')` return a dead
   * context (frozen last frame until a full page reload).
   */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    const gl = this.gl;
    gl.deleteProgram(this.program);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
