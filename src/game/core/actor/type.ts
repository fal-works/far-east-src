import * as Actor from "./actor";

export interface Type {
  draw: () => void;
  drawDamaged?: () => void;
  run: Actor.RunCallback;
  collisionDistance: number;
  maxLife: number;
}
