import {
  Math as Math2,
  Timer,
  Random,
  Easing
} from "@fal-works/creative-coding-core";
import {
  p,
  canvas,
  setShake,
  ShakeType,
  applyShake,
  drawTransformed
} from "@fal-works/p5-extension";
import * as Core from "./core/game-core";
import * as ActorTypes from "./core/actor-types";
import * as EnemySlot from "./enemy-slot";
import * as Actor from "./core/actor";
import * as Sound from "../sound";

let score = 0;

export const enum State {
  PLAYING = "PLAYING",
  RESULT = "RESULT"
}

export let state = State.PLAYING;

const timerSet = Timer.Set.create(64);

const fireParticles = (
  x: number,
  y: number,
  count: number,
  maxPositionOffset: number,
  maxSpeed: number
) => {
  for (let i = 0; i < count; i += 1)
    Core.fireParticle(
      x + Random.between(-maxPositionOffset, maxPositionOffset),
      y + Random.between(-maxPositionOffset, maxPositionOffset),
      Random.between(5, maxSpeed),
      Random.angle(),
      ActorTypes.randomParticle()
    );
};

const addAppearanceParticle = (x: number, y: number, bearing: number) => {
  const index = Core.useParticle(0, 0, ActorTypes.randomParticle());
  if (index == null) return;

  Core.overrideParticleBehavior(index, (data, i) => {
    const frameCount = data.frameCount[i];
    const progressRatio = frameCount / 60;

    data.rotationAngle[i] -= 0.3;
    data.scaleFactor[i] = 5 * Easing.easeInQuad(progressRatio);

    const currentDistance = (1 - progressRatio) * 100;
    const currentBearing = bearing + frameCount * 0.1;
    data.x[i] = x + currentDistance * Math.cos(currentBearing);
    data.y[i] = y + currentDistance * Math.sin(currentBearing);

    if (frameCount > 60) Core.killParticle(i);
  });
};

const addAppearanceEffect = (x: number, y: number) => {
  for (let i = 0; i < 8; i += 1)
    addAppearanceParticle(x, y, (i / 8) * Math2.TWO_PI);
};

const addEnemy = (slot: EnemySlot.Unit) => {
  const { x, y } = slot;
  addAppearanceEffect(x, y);
  Timer.Set.addTimer(
    timerSet,
    Timer.create(60, undefined, () => {
      const index = Core.useEnemy(x, y, ActorTypes.randomEnemy());
      if (index === null) return;

      slot.index = index;
      slot.state = EnemySlot.State.ACTIVE;

      fireParticles(x, y, 32, 30, 30);
      Sound.playAppearanceSound();
    })
  );

  slot.state = EnemySlot.State.APPROACHING;
  Sound.playPreAppearanceSound();
};

export const reset = (playable: boolean = true) => {
  score = 0;
  state = State.PLAYING;
  Timer.Set.clear(timerSet);

  Core.reset();
  Core.createPlayer(ActorTypes.player);
  if (!playable) Core.killPlayer();

  EnemySlot.reset(addEnemy);
};

const onHitEnemy: Actor.Group.OnCollideCallback = (
  playerBullet,
  playerBulletIndex,
  enemy,
  enemyIndex
) => {
  const x = playerBullet.soa.data.x[playerBulletIndex];
  const y = playerBullet.soa.data.y[playerBulletIndex];
  Actor.Group.kill(playerBullet, playerBulletIndex);

  if (Random.bool(0.2)) fireParticles(x, y, 1, 5, 15);

  const enemyLife = (enemy.soa.data.life[enemyIndex] -= 1);
  enemy.soa.data.damagedRemainingCount[enemyIndex] = 2;

  score += 10;

  if (enemyLife <= 0) {
    Core.killEnemy(enemyIndex);
    fireParticles(x, y, 64, 50, 35);
    score += 8000;
    setShake(0.05, 0.8, ShakeType.VERTICAL);
    Sound.playBombSound();
  }
};

const onHitPlayer: Actor.Group.OnCollideCallback = (
  enemyBullet,
  enemyBulletIndex,
  player,
  playerIndex
) => {
  const x = enemyBullet.soa.data.x[enemyBulletIndex];
  const y = enemyBullet.soa.data.y[enemyBulletIndex];
  Actor.Group.kill(enemyBullet, enemyBulletIndex);

  const playerLife = (player.soa.data.life[playerIndex] -= 1);
  player.soa.data.damagedRemainingCount[playerIndex] = 180;

  if (playerLife > 0) {
    fireParticles(x, y, 64, 30, 30);
    setShake(0.1, 0.9, ShakeType.HORIZONTAL, true);
  } else {
    Core.killPlayer();
    fireParticles(x, y, 128, 50, 30);
    setShake(0.2, 0.95, ShakeType.HORIZONTAL, true);
    state = State.RESULT;
  }

  Sound.playDamageSound();
};

const drawLife = () => {
  const extraLifeCount = Math.max(0, Core.getPlayerLife() - 1);

  let x = 30;
  const y = 30;
  for (let i = 0; i < extraLifeCount; i += 1) {
    drawTransformed(ActorTypes.drawPlayerGraphics, x, y, -Math2.HALF_PI, 0.5);
    x += 60;
  }
};

const drawScore = () => {
  p.textSize(24);
  p.textAlign(p.RIGHT);
  p.text(`SCORE: ${p.nfc(score, 0)}`, canvas.logicalSize.width - 20, 40);
};

const drawResult = () => {
  p.textAlign(p.CENTER);
  p.textSize(64);
  p.text(
    "RESULT",
    canvas.logicalCenterPosition.x,
    canvas.logicalCenterPosition.y
  );
  p.textSize(96);
  p.text(
    p.nfc(score, 0),
    canvas.logicalCenterPosition.x,
    canvas.logicalCenterPosition.y + 128
  );
};

export const run = () => {
  applyShake();
  Core.runAndDraw();
  Core.checkPlayerBulletCollision(onHitEnemy);
  Core.checkEnemyBulletCollision(onHitPlayer);

  Timer.Set.step(timerSet);

  EnemySlot.update(addEnemy);

  switch (state) {
    case State.PLAYING:
      drawScore();
      drawLife();
      break;
    case State.RESULT:
      drawResult();
      break;
  }
};
