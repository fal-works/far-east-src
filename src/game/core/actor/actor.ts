import { StructureOfArrays } from "@fal-works/creative-coding-core";

export type RunCallback = (
  data: StructureOfArrays.Data<Unit>,
  index: number
) => void;

export interface Unit {
  active: boolean;
  frameCount: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotationAngle: number;
  scaleFactor: number;
  drawGraphics: () => void;
  drawGraphicsDamaged: (() => void) | null;
  run: RunCallback;
  collisionDistance: number;
  life: number;
  damagedRemainingCount: number;
}
