import type { Effect, FrameLoopHandle, Gpu, Surface } from "vgpu";
import { effect, frameLoop, init, surface } from "vgpu";
import plateShader from "./plate.wgsl";

export type PlateUniforms = {
  pointerX: number;
  pointerY: number;
  yaw: number;
  pitch: number;
  shine: number;
  band: number;
  reduced: number;
};

export type StartPlateOptions = {
  front: HTMLCanvasElement;
  back: HTMLCanvasElement;
  uniformsRef: { current: PlateUniforms };
  onPainted: () => void;
};

function plateSet(values: PlateUniforms, face: number) {
  return {
    plate: {
      pointer_x: values.pointerX,
      pointer_y: values.pointerY,
      yaw: values.yaw,
      pitch: values.pitch,
      shine: values.shine,
      band: values.band,
      face,
      reduced: values.reduced,
    },
  };
}

async function bindFace(
  gpu: Gpu,
  canvas: HTMLCanvasElement,
  face: number,
  uniforms: PlateUniforms,
): Promise<{ surface: Surface; wash: Effect } | null> {
  const canvasSurface = surface(gpu, canvas, {
    dpr: [1, 2],
    alphaMode: "opaque",
    clearColor: [0.141, 0.141, 0.161, 1],
    label: face > 0.5 ? "maser-bot-card-back" : "maser-bot-card-front",
  });
  const wash = effect(gpu, plateShader, {
    label: face > 0.5 ? "maser-bot-card-plate-back" : "maser-bot-card-plate-front",
    set: plateSet(uniforms, face),
  });
  try {
    await wash.compile(canvasSurface);
  } catch {
    return null;
  }
  return { surface: canvasSurface, wash };
}

/** vgpu plate: pointer drives shine + light. CSS still owns yaw/pitch pose. */
export function startPlate({
  front,
  back,
  uniformsRef,
  onPainted,
}: StartPlateOptions): () => void {
  let disposed = false;
  let loop: FrameLoopHandle | undefined;
  let gpu: Gpu | undefined;
  let painted = false;

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

    const initial = uniformsRef.current;
    const [frontPass, backPass] = await Promise.all([
      bindFace(gpu, front, 0, initial),
      bindFace(gpu, back, 1, initial),
    ]);
    if (disposed) {
      gpu.dispose();
      return;
    }
    if (!frontPass && !backPass) {
      gpu.dispose();
      return;
    }

    loop = frameLoop(gpu, (frame) => {
      const values = uniformsRef.current;
      if (frontPass) {
        frontPass.wash.set(plateSet(values, 0));
        frame.pass(frontPass.surface, frontPass.wash);
      }
      if (backPass) {
        backPass.wash.set(plateSet(values, 1));
        frame.pass(backPass.surface, backPass.wash);
      }
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
