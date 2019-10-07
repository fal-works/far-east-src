import { Random } from "@fal-works/creative-coding-core";
import * as Core from "./core/game-core";
import { LOGICAL_CANVAS_SIZE } from "../settings";

export const enum State {
  ACTIVE = "ACTIVE",
  APPROACHING = "APPROACHING",
  ABSENT = "ABSENT"
}

export interface Unit {
  readonly x: number;
  readonly y: number;
  index: number;
  state: State;
}

export const list: readonly Unit[] = [
  {
    x: 0.25 * LOGICAL_CANVAS_SIZE.width,
    y: 0.25 * LOGICAL_CANVAS_SIZE.height,
    index: -1,
    state: State.ABSENT
  },
  {
    x: 0.5 * LOGICAL_CANVAS_SIZE.width,
    y: 0.15 * LOGICAL_CANVAS_SIZE.height,
    index: -1,
    state: State.ABSENT
  },
  {
    x: 0.75 * LOGICAL_CANVAS_SIZE.width,
    y: 0.25 * LOGICAL_CANVAS_SIZE.height,
    index: -1,
    state: State.ABSENT
  }
];

export const reset = (addEnemy: (slot: Unit) => void) => {
  for (let i = 0; i < list.length; i += 1) {
    const slot = list[i];
    addEnemy(slot);
  }
};

export const update = (addEnemy: (slot: Unit) => void) => {
  for (let i = 0; i < list.length; i += 1) {
    const slot = list[i];
    switch (slot.state) {
      case State.ACTIVE:
        if (!Core.enemyIsActive(slot.index)) slot.state = State.ABSENT;
        break;
      case State.ABSENT:
        if (Random.bool(0.02)) addEnemy(slot);
        break;
    }
  }
};
