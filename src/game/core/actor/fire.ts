import { Type } from "./type";

export type FireCallback = (
  x: number,
  y: number,
  speed: number,
  directionAngle: number,
  type: Type
) => number | null;
