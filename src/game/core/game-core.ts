import { Math as Math2, ArrayUtility } from "@fal-works/creative-coding-core";
import * as Actor from "./actor";
import { LOGICAL_CANVAS_SIZE } from "../../settings";
import * as Sound from "../../sound";

let frameCount = 0;

const playerGroup = Actor.Group.create(1);
export let playerIsActive = false;
export const createPlayer = (type: Actor.Type) => {
  Actor.Group.use(
    playerGroup,
    0.5 * LOGICAL_CANVAS_SIZE.width,
    LOGICAL_CANVAS_SIZE.height - 100,
    0,
    0,
    -Math2.HALF_PI,
    type
  );
  playerIsActive = true;
};
export const killPlayer = () => {
  Actor.Group.kill(playerGroup, 0);
  playerIsActive = false;
  Sound.stopGunSound();
};
export const getPlayerLife = () =>
  playerIsActive ? playerGroup.soa.data.life[0] : 0;

const playerX = playerGroup.soa.data.x;
const playerY = playerGroup.soa.data.y;
export const getDirectionToPlayer = (x: number, y: number) => {
  const xDifference = playerX[0] - x;
  const yDifference = playerY[0] - y;
  if (xDifference === 0 && yDifference === 0) return 0;
  return Math.atan2(yDifference, xDifference);
};

const playerBulletGroup = Actor.Group.create(128);

const fire = (group: Actor.Group.Unit): Actor.FireCallback => (
  x,
  y,
  speed,
  directionAngle,
  type
) =>
  Actor.Group.use(
    group,
    x,
    y,
    speed * Math.cos(directionAngle),
    speed * Math.sin(directionAngle),
    directionAngle,
    type
  );

export const firePlayerBullet = fire(playerBulletGroup);

const enemyGroup = Actor.Group.create(32);
export let enemyCount = 0;
export const useEnemy = (x: number, y: number, type: Actor.Type) => {
  const index = Actor.Group.use(enemyGroup, x, y, 0, 0, Math2.HALF_PI, type);
  if (index != null) enemyCount += 1;
  return index;
};
export const killEnemy = (index: number) => {
  Actor.Group.kill(enemyGroup, index);
  enemyCount -= 1;
};
export const enemyIsActive = (index: number) =>
  enemyGroup.soa.data.active[index];

const enemyBulletGroup = Actor.Group.create(1024);
export const fireEnemyBullet = fire(enemyBulletGroup);

const particleGroup = Actor.Group.create(256);
export const useParticle = (x: number, y: number, type: Actor.Type) =>
  Actor.Group.use(particleGroup, x, y, 0, 0, 0, type);
export const fireParticle = fire(particleGroup);

export const killParticle = (index: number) =>
  Actor.Group.kill(particleGroup, index);

export const overrideParticleBehavior = (
  index: number,
  run: Actor.RunCallback
) => {
  particleGroup.soa.data.run[index] = run;
};

const actorGroups: readonly Actor.Group.Unit[] = [
  particleGroup,
  playerGroup,
  enemyGroup,
  playerBulletGroup,
  enemyBulletGroup
];

export const runAndDraw = () => {
  ArrayUtility.loop(actorGroups, Actor.Group.runAndDraw);
  frameCount += 1;
};

export const reset = () => {
  frameCount = 0;
  ArrayUtility.loop(actorGroups, Actor.Group.reset);
};

export const checkPlayerBulletCollision = (
  onHitEnemy: Actor.Group.OnCollideCallback
) => Actor.Group.checkCollision(playerBulletGroup, enemyGroup, onHitEnemy);

export const checkEnemyBulletCollision = (
  onHitPlayer: Actor.Group.OnCollideCallback
) => {
  if (frameCount % 2 === 0) return;
  if (playerGroup.soa.data.damagedRemainingCount[0] > 0) return;

  Actor.Group.checkCollision(enemyBulletGroup, playerGroup, onHitPlayer);
};
