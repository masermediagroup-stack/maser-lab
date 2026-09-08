import type { Effect, FrameLoopHandle, Gpu, Surface } from "vgpu";
import { effect, frameLoop, init, surface } from "vgpu";
import stageShader from "./stage.wgsl";

export type StageUniforms = {
  time: number;
  intensity: number;
  speed: number;
  reduced: number;
};

export type StartStageOptions = {
  canvas: HTMLCanvasElement;
  uniformsRef: { current: StageUniforms };
  onPainted: () => void;
};

function stageSet(values: StageUniforms) {
  return {
    stage: {
      time: values.time,
      intensity: values.intensity,
      speed: values.speed,
      reduced: values.reduced,
    },
  };
}

/** vgpu stage: black field + grey dither. Not the plate. */
export function startStage({
  canvas,
  uniformsRef,
  onPainted,
}: StartStageOptions): () => void {
  let disposed = false;
  let loop: FrameLoopHandle | undefined;
  let gpu: Gpu | undefined;
  let painted = false;
  let clock = 0;
  let last = 0;

  void (async () => {
    try {
      gpu = await init();
    } catch {
      return;
    }
    if (disposed) {
      gpu.dispose();
      return;
    }

    const canvasSurface = surface(gpu, canvas, {
      dpr: [1, 2],
      alphaMode: "opaque",
      clearColor: [0, 0, 0, 1],
      label: "maser-bot-card-stage",
    });

    const wash: Effect = effect(gpu, stageShader, {
      label: "maser-bot-card-stage-dither",
      set: stageSet(uniformsRef.current),
    });

    try {
      await wash.compile(canvasSurface);
    } catch {
      gpu.dispose();
      return;
    }
    if (disposed) {
      gpu.dispose();
      return;
    }

    const stageSurface: Surface = canvasSurface;

    loop = frameLoop(gpu, (frame) => {
      const now = performance.now();
      const dt = last ? Math.min((now - last) / 1000, 0.064) : 0;
      last = now;
      const values = uniformsRef.current;
      if (values.reduced < 0.5) {
        clock += dt;
      }
      wash.set(
        stageSet({
          ...values,
          time: clock,
        }),
      );
      frame.pass(stageSurface, wash);
      if (painted || !gpu) return;
      painted = true;
      void gpu.settled().then(() => {
        if (!disposed) onPainted();
      });
    });
  })();

  return () => {
    disposed = true;
    loop?.stop();
    gpu?.dispose();
  };
}
