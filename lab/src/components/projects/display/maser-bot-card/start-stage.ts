import type { Effect, FrameLoopHandle, Gpu, Surface } from "vgpu";
import { effect, frameLoop, init, surface } from "vgpu";
import stageShader from "./stage.wgsl";

export type StageUniforms = {
  time: number;
  pointerX: number;
  pointerY: number;
  tracking: number;
  intensity: number;
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
      pointer_x: values.pointerX,
      pointer_y: values.pointerY,
      tracking: values.tracking,
      intensity: values.intensity,
      reduced: values.reduced,
      pad0: 0,
      pad1: 0,
    },
  };
}

/** vgpu stage: black field + TL grey wash + quiet pointer cloud. Not the card face. */
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
      label: "maser-bot-card-stage-cloud",
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
