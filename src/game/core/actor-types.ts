import p5 from "p5";
import { Math as Math2, Random, Easing } from "@fal-works/creative-coding-core";
import {
  p,
  graphicsToImage,
  onSetup,
  KeyBoard,
  MoveKeys,
  canvas
} from "@fal-works/p5-extension";
import * as Fonts from "../../fonts";
import * as Actor from "./actor";
import * as GameCore from "./game-core";
import * as Sound from "../../sound";

export let player: Actor.Type;
export let drawPlayerGraphics: () => void;
let enemies: readonly Actor.Type[];
export const randomEnemy = () => Random.fromArray(enemies);
export let playerBullet: Actor.Type;
export let enemyBullet: Actor.Type;
let particles: readonly Actor.Type[];
export const randomParticle = () => Random.fromArray(particles);

type Direction = 0 | 1 | 2 | 3;

interface BuildParameter {
  char: string;
  dir: Direction;
  flip: boolean;
}

const bulletParameter: BuildParameter = { char: "多", dir: 3, flip: false };

const playerParameter: BuildParameter = { char: "参", dir: 0, flip: false };

const enemyParameters: readonly BuildParameter[] = [
  { char: "欠", dir: 0, flip: false },
  { char: "洞", dir: 0, flip: true },
  { char: "鯵", dir: 3, flip: false },
  { char: "娃", dir: 0, flip: true },
  { char: "辣", dir: 1, flip: true },
  { char: "酔", dir: 0, flip: false },
  { char: "彫", dir: 3, flip: false },
  { char: "委", dir: 2, flip: true },
  { char: "綾", dir: 3, flip: false },
  { char: "儒", dir: 0, flip: true },
  { char: "俺", dir: 0, flip: true },
  { char: "喪", dir: 0, flip: true },
  { char: "沈", dir: 0, flip: true },
  { char: "演", dir: 1, flip: false },
  { char: "晩", dir: 2, flip: false },
  { char: "携", dir: 3, flip: false },
  { char: "詠", dir: 0, flip: true },
  { char: "筆", dir: 0, flip: true },
  { char: "筑", dir: 0, flip: true },
  { char: "苑", dir: 2, flip: true },
  { char: "摘", dir: 1, flip: false },
  { char: "描", dir: 2, flip: true },
  { char: "算", dir: 2, flip: true },
  { char: "輝", dir: 1, flip: false },
  { char: "郷", dir: 1, flip: false },
  { char: "解", dir: 2, flip: true },
  { char: "鑓", dir: 2, flip: true },
  { char: "簸", dir: 3, flip: true },
  { char: "讐", dir: 2, flip: true },
  { char: "濯", dir: 0, flip: true },
  { char: "鋳", dir: 0, flip: true },
  { char: "突", dir: 2, flip: true },
  { char: "探", dir: 2, flip: true },
  { char: "邪", dir: 3, flip: false },
  { char: "淑", dir: 1, flip: true },
  { char: "擁", dir: 1, flip: false },
  { char: "桟", dir: 3, flip: true },
  { char: "呑", dir: 0, flip: true },
  { char: "桑", dir: 0, flip: true }
];

const createCharacterGraphics = (
  param: BuildParameter,
  size: number,
  color: p5.Color
) => {
  const halfSize = 0.5 * size;
  const graphics = p.createGraphics(size, size);
  const g = (graphics as any) as p5; // eslint-disable-line @typescript-eslint/no-explicit-any
  g.push();
  g.translate(halfSize, halfSize);
  g.rotate(param.dir * Math2.HALF_PI);
  if (param.flip) g.scale(-1, 1);
  g.fill(color);
  g.textFont(Fonts.jp, 0.8 * size);
  g.textAlign(p.CENTER, p.CENTER);
  g.text(param.char, 0, -0.2 * size);
  g.pop();

  return graphics;
};

const mirrorGraphics = (graphics: p5.Graphics) => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const img = graphicsToImage(graphics);
  const { width, height } = img;

  const mask = (p.createGraphics(width, height) as any) as p5;
  mask.fill(0);
  mask.noStroke();
  mask.rect(0, 0, width, 0.5 * height);
  img.mask(mask as any);

  const g = (graphics as any) as p5; // just for typing
  g.clear();
  g.image(img, 0, 0);
  g.translate(0, height);
  g.scale(1, -1);
  g.image(img, 0, 0);
  /* eslint-enable */
};

const createActorGraphics = (
  param: BuildParameter,
  size: number,
  color: p5.Color
) => {
  const graphics = createCharacterGraphics(param, size, color);
  mirrorGraphics(graphics);

  return () => {
    p.image(graphics, 0, 0);
  };
};

onSetup.push(p => {
  const emptyFunction = () => {};

  const firePlayerBullet = (x: number, y: number) =>
    GameCore.firePlayerBullet(x, y, 70, -Math2.HALF_PI, playerBullet);

  const shotKeyCodes: readonly number[] = [
    32, // SPACE
    90, // Z
    122, // z
    74, // J
    106, // j
    13, // CR
    10 // LF
  ];

  const margin = 30;
  const keepInScreen: Actor.RunCallback = (data, i) => {
    const x = data.x[i];
    const y = data.y[i];

    const { width, height } = canvas.logicalSize;

    if (x < margin) data.x[i] = margin;
    else if (x >= width - margin) data.x[i] = width - margin - 1;

    if (y < margin) data.y[i] = margin;
    else if (y >= height - margin) data.y[i] = height - margin - 1;
  };

  drawPlayerGraphics = createActorGraphics(
    playerParameter,
    100,
    p.color(0, 64, 0)
  );
  player = {
    run: (data, i) => {
      keepInScreen(data, i);

      const { vx, vy } = data;
      const moveDirection = MoveKeys.unitVector;
      vx[i] = 10 * moveDirection.x;
      vy[i] = 10 * moveDirection.y;

      if (!KeyBoard.anyKeyIsDown(shotKeyCodes)) {
        Sound.stopGunSound();
        return;
      }

      if (data.frameCount[i] % 16 === 0) return;
      if (data.frameCount[i] % 2 === 1) return;

      const x = data.x[i];
      const y = data.y[i];

      firePlayerBullet(x - 45, y);
      firePlayerBullet(x, y - 20);
      firePlayerBullet(x + 45, y);
      firePlayerBullet(x - 45, y - 30);
      firePlayerBullet(x, y - 50);
      firePlayerBullet(x + 45, y - 30);

      Sound.playGunSound();
    },
    draw: drawPlayerGraphics,
    drawDamaged: () => {},
    collisionDistance: 20,
    maxLife: 3
  };
  playerBullet = {
    run: emptyFunction,
    draw: createActorGraphics(bulletParameter, 40, p.color(128, 144, 128)),
    collisionDistance: 15,
    maxLife: 1
  };

  const runEnemyCandidates: readonly Actor.RunCallback[] = [
    (data, i) => {
      const x = data.x[i];
      const y = data.y[i];
      const directionToPlayer = GameCore.getDirectionToPlayer(x, y);
      data.rotationAngle[i] = directionToPlayer;
      if (data.frameCount[i] % 4 === 0 && Random.bool(0.2))
        GameCore.fireEnemyBullet(x, y, 4, directionToPlayer, enemyBullet);
    },
    (data, i) => {
      const frameCount = data.frameCount[i];
      const x = data.x[i];
      const y = data.y[i];
      if (frameCount % 120 < 30) {
        if (frameCount % 6 === 0)
          GameCore.fireEnemyBullet(x, y, 5, data.rotationAngle[i], enemyBullet);
      } else {
        const directionToPlayer = GameCore.getDirectionToPlayer(x, y);
        data.rotationAngle[i] +=
          0.2 * (directionToPlayer - data.rotationAngle[i]);
      }
    },
    (data, i) => {
      const x = data.x[i];
      const y = data.y[i];
      const frameCount = data.frameCount[i];
      const directionToPlayer = GameCore.getDirectionToPlayer(x, y);
      data.rotationAngle[i] = directionToPlayer;

      if (frameCount % 90 < 45) return;

      if (frameCount % 4 === 0) {
        const angle = 0.008 * frameCount;
        for (let i = 0; i < 4; i += 1)
          GameCore.fireEnemyBullet(
            x,
            y,
            8,
            angle + i * Math2.HALF_PI,
            enemyBullet
          );
      }
    },
    (data, i) => {
      const x = data.x[i];
      const y = data.y[i];
      const frameCount = data.frameCount[i];
      const directionToPlayer = GameCore.getDirectionToPlayer(x, y);
      data.rotationAngle[i] = directionToPlayer;

      if (frameCount % 90 > 0) return;

      for (let i = 0; i < 24; i += 1) {
        const angle = (i * Math2.TWO_PI) / 24;
        GameCore.fireEnemyBullet(x, y, 3, angle + frameCount, enemyBullet);
      }
    },
    (data, i) => {
      const x = data.x[i];
      const y = data.y[i];
      const frameCount = data.frameCount[i];

      if (frameCount % 180 < 90) {
        if (frameCount % 4 === 0) {
          const bx = x + Random.between(-50, 50);
          const by = y + Random.between(-50, 50);
          const angle = GameCore.getDirectionToPlayer(bx, by);
          GameCore.fireEnemyBullet(bx, by, 4, angle, enemyBullet);
        }
      } else {
        const directionToPlayer = GameCore.getDirectionToPlayer(x, y);
        data.rotationAngle[i] +=
          0.1 * (directionToPlayer - data.rotationAngle[i]);
      }
    },
    (data, i) => {
      const x = data.x[i];
      const y = data.y[i];
      const frameCount = data.frameCount[i];
      const rotationAngle = data.rotationAngle[i];

      if (frameCount % 180 < 90) {
        if (frameCount % 4 === 0) {
          const speed = 4 + 0.2 * (frameCount % 90);
          const x1 = x - 40;
          GameCore.fireEnemyBullet(x1, y, speed, rotationAngle, enemyBullet);
          const x2 = x + 40;
          GameCore.fireEnemyBullet(x2, y, speed, rotationAngle, enemyBullet);
        }
      } else {
        const directionToPlayer = GameCore.getDirectionToPlayer(x, y);
        data.rotationAngle[i] += 0.1 * (directionToPlayer - rotationAngle);
      }
    }
  ];

  const enemyColor = p.color(32, 0, 0);
  const enemyDamagedColor = p.color(192, 0, 0);

  enemies = enemyParameters.map((param, index) => {
    return {
      run: runEnemyCandidates[index % runEnemyCandidates.length],
      draw: createActorGraphics(param, 160, enemyColor),
      drawDamaged: createActorGraphics(param, 160, enemyDamagedColor),
      collisionDistance: 70,
      maxLife: 200
    };
  });
  enemyBullet = {
    run: emptyFunction,
    draw: createActorGraphics(bulletParameter, 40, p.color(0)),
    collisionDistance: 5,
    maxLife: 1
  };

  const particleColor = p.color(160, 156, 152);
  const runParticle: Actor.RunCallback = (data, i) => {
    const progressRatio = data.frameCount[i] / 45;
    data.scaleFactor[i] = 1 - Easing.easeInQuad(progressRatio);
    data.vx[i] *= 0.9;
    data.vy[i] *= 0.9;
    data.vy[i] += 0.1;
    if (data.frameCount[i] > 45) GameCore.killParticle(i);
  };
  particles = enemyParameters.map(param => {
    return {
      run: runParticle,
      draw: createActorGraphics(param, 32, particleColor),
      collisionDistance: 0,
      maxLife: 0
    };
  });
});

// const directionArray: readonly Direction[] = [0, 1, 2, 3];

// export const createRandom = (collisionDistance: number) => {
//   const char = Random.fromArray(kanjis);
//   const dir = Random.fromArray(directionArray);
//   console.log(`char: ${char}, dir: ${dir}`);

//   return {
//     draw: createActorGraphics({ char, dir, flip: false }, 100, p.color(0)),
//     collisionDistance
//   };
// };
