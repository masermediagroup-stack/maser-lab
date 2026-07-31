import type {
  Group,
  LineBasicMaterial,
  Mesh,
  MeshStandardMaterial,
} from "three";

export type { MotionMode, KineticBarsParams } from "./kinetic-bars-params";

export type KineticBarHandle = {
  group: Group | null;
  /** Invisible mesh matching the bar’s current height — used for pointer hits. */
  hitMesh: Mesh | null;
  fillMaterial: MeshStandardMaterial | null;
  edgeMaterial: LineBasicMaterial | null;
  baseY: number;
  index: number;
  height: number;
};

export type WaveSample = {
  elevation: number;
  intensity: number;
};

export type PointerInfluenceState = {
  active: boolean;
  nearestIndex: number;
  strengths: Float32Array;
};

export type RippleEvent = {
  originIndex: number;
  startTime: number;
  active: boolean;
};
