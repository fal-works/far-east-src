import {
  StructureOfArrays,
  RectangleRegion
} from "@fal-works/creative-coding-core";
import { drawTransformed, canvas } from "@fal-works/p5-extension";
import * as Actor from "./actor";
import { Type } from "./type";

export interface Unit {
  readonly soa: StructureOfArrays.Unit<Actor.Unit>;
  startIndex: number;
  endIndex: number;
}

export const create = (capacity: number): Unit => {
  const prototypeStructure: Actor.Unit = {
    active: false,
    frameCount: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    rotationAngle: 0,
    scaleFactor: 1,
    drawGraphics: () => {},
    drawGraphicsDamaged: null,
    run: () => {},
    collisionDistance: 0,
    life: 0,
    damagedRemainingCount: 0
  };

  return {
    soa: StructureOfArrays.from(prototypeStructure, capacity),
    startIndex: Infinity,
    endIndex: 0
  };
};

/**
 * Activates an actor unit.
 * @param group
 * @param x
 * @param y
 * @param vx
 * @param vy
 * @param angle
 * @param type
 * @return `true` if succeeded.
 */
export const use = (
  group: Unit,
  x: number,
  y: number,
  vx: number,
  vy: number,
  angle: number,
  type: Type
) => {
  const { data, length } = group.soa;
  const { active } = data;

  for (let i = 0; i < length; i += 1) {
    if (active[i]) continue;

    active[i] = true;
    data.x[i] = x;
    data.y[i] = y;
    data.vx[i] = vx;
    data.vy[i] = vy;
    data.rotationAngle[i] = angle;
    data.scaleFactor[i] = 1;
    data.run[i] = type.run;
    data.drawGraphics[i] = type.draw;
    data.drawGraphicsDamaged[i] = type.drawDamaged || null;
    data.collisionDistance[i] = type.collisionDistance;
    data.life[i] = type.maxLife;
    data.frameCount[i] = 0;
    data.damagedRemainingCount[i] = 0;

    if (i < group.startIndex) group.startIndex = i;
    if (i >= group.endIndex) group.endIndex = i + 1;

    return i;
  }

  return null;
};

const findFirstActive = (
  active: boolean[],
  startIndex: number,
  endIndex: number
) => {
  for (let i = startIndex; i < endIndex; i += 1) {
    if (active[i]) return i;
  }

  return Infinity;
};

const findLastActive = (
  active: boolean[],
  startIndex: number,
  endIndex: number
) => {
  for (let i = endIndex - 1; i >= startIndex; i -= 1) {
    if (active[i]) return i;
  }

  return -1;
};

/**
 * Kills an actor unit.
 * @param group
 * @param index
 * @return `true` if killed. `false` if already inactive.
 */
export const kill = (group: Unit, index: number) => {
  const { soa, startIndex, endIndex } = group;
  const { active } = soa.data;

  if (!active[index]) return false;

  active[index] = false;

  if (index === startIndex)
    group.startIndex = findFirstActive(active, startIndex + 1, endIndex);

  if (index === endIndex)
    group.endIndex = findLastActive(active, group.startIndex, endIndex - 1) + 1;

  return true;
};

export const runAndDraw = (group: Unit) => {
  const { soa, startIndex, endIndex } = group;

  if (startIndex >= soa.length) return;

  const { data } = soa;
  const {
    active,
    frameCount,
    drawGraphics,
    drawGraphicsDamaged: drawGraphicsAlternative,
    x,
    y,
    vx,
    vy,
    run,
    rotationAngle,
    scaleFactor,
    damagedRemainingCount
  } = data;
  const tmpPosition = { x: 0, y: 0 };

  for (let i = startIndex; i < endIndex; i += 1) {
    if (!active[i]) continue;

    run[i](data, i);

    tmpPosition.x = x[i] += vx[i];
    tmpPosition.y = y[i] += vy[i];

    if (
      !RectangleRegion.containsPoint(canvas.logicalRegion, tmpPosition, -100)
    ) {
      kill(group, i);
      continue;
    }

    const thisScaleFactor = scaleFactor[i];
    const drawDamaged = drawGraphicsAlternative[i];
    const damaged = damagedRemainingCount[i] > 0;
    if (thisScaleFactor > 0)
      drawTransformed(
        damaged && drawDamaged && frameCount[i] % 4 < 2
          ? drawDamaged
          : drawGraphics[i],
        x[i],
        y[i],
        rotationAngle[i],
        thisScaleFactor
      );

    if (damaged) damagedRemainingCount[i] -= 1;
    frameCount[i] += 1;
  }
};

export const reset = (group: Unit) => {
  const { active, run, drawGraphics } = group.soa.data;

  const emptyFunction = () => {};

  for (let i = 0, len = group.soa.length; i < len; i += 1) {
    active[i] = false;
    run[i] = emptyFunction;
    drawGraphics[i] = emptyFunction;
  }

  group.startIndex = Infinity;
  group.endIndex = 0;

  return group;
};

export type OnCollideCallback = (
  group: Unit,
  index: number,
  otherGroup: Unit,
  otherIndex: number
) => void;

/**
 * A pretty naive function for collision checking.
 * @param group
 * @param otherGroup
 * @param onCollide
 */
export const checkCollision = (
  group: Unit,
  otherGroup: Unit,
  onCollide: OnCollideCallback
) => {
  const data = group.soa.data;
  const otherData = otherGroup.soa.data;
  const { active, x, y, collisionDistance } = data;
  const otherActive = otherData.active;
  const otherX = otherData.x;
  const otherY = otherData.y;
  const otherCollisionDistance = otherData.collisionDistance;

  for (let index = group.startIndex; index < group.endIndex; index += 1) {
    if (!active[index]) continue;
    const thisX = x[index];
    const thisY = y[index];
    const thisCollisionDistance = collisionDistance[index];
    for (
      let otherIndex = otherGroup.startIndex;
      otherIndex < otherGroup.endIndex;
      otherIndex += 1
    ) {
      if (!otherActive[otherIndex]) continue;
      const distanceThreshold =
        thisCollisionDistance + otherCollisionDistance[otherIndex];

      const actualDistanceX = Math.abs(thisX - otherX[otherIndex]);
      if (actualDistanceX > distanceThreshold) continue;

      const actualDistanceY = Math.abs(thisY - otherY[otherIndex]);
      if (actualDistanceY > distanceThreshold) continue;

      onCollide(group, index, otherGroup, otherIndex);
    }
  }
};
