import p5 from "p5";

import {
  startSketch,
  p,
  canvas,
  createPixels,
  replaceCanvasPixels,
  // pauseOrResume,
  MoveKeys,
  Mouse
} from "@fal-works/p5-extension";

import {
  HTML_ELEMENT,
  LOGICAL_CANVAS_SIZE,
  ENABLE_CANVAS_SCALING
} from "./settings";

import * as Fonts from "./fonts";
import * as Sounds from "./sound";
import * as Game from "./game";

// ---- variables | functions ----

let drawBackground: () => void;
let volumeSlider: p5.Element;
let gameIsStarted = false;

// ---- reset & initialize ----

const prelaod = (): void => {
  Fonts.load(p, {
    jp: "NotoSerifJP-Medium-subset.otf",
    en: "NotoSerifJP-Bold-subset.otf"
  });

  Sounds.load(p, {
    music: "WELCOMEB4CK.ogg",
    gunSound: "submachinegun1_edit.wav",
    bombSound: "bomb2_edit.wav",
    preAppearanceSound: "enemy-advent1.wav",
    appearanceSound: "punch-high2.wav",
    damageSound: "cannon1_edit.wav"
  });
};

const reset = (): void => {
  Game.reset(gameIsStarted);
};

const updateVolume = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Sounds.setVolume(((volumeSlider.value() as any) as number) * 0.01);
};

const initializeVolumeSlider = () => {
  volumeSlider = p.createSlider(0, 100, 15, 5);
  volumeSlider.position(
    canvas.scaleFactor * 50,
    canvas.scaleFactor * (canvas.logicalSize.height - 40)
  );
  volumeSlider.style("width", `${canvas.scaleFactor * 200}px`);
  volumeSlider.style("height", `${canvas.scaleFactor * 25}px`);
  updateVolume();
};

const initialize = (): void => {
  const backgroundPixels = createPixels(() => {
    canvas.drawScaled(() => {
      const { width, height } = LOGICAL_CANVAS_SIZE;
      p.background(248);
      p.stroke(128, 112, 96, 4);
      p.strokeCap(p.SQUARE);
      p.strokeWeight(20);
      for (let i = 0; i < 2000; i += 1) {
        const x = p.random(0, width);
        const y = p.random(-50, height - 50);
        p.line(x, y, x, y + p.random(50, 200));
      }
    });
  });
  drawBackground = () => replaceCanvasPixels(backgroundPixels);

  p.imageMode(p.CENTER);
  p.textFont(Fonts.en);

  initializeVolumeSlider();

  reset();
};

// ---- draw ----

const drawInstruction = () => {
  p.push();

  p.textFont(Fonts.en, 24);
  p.textAlign(p.LEFT);

  p.text("ARROW / WASD :", 160, 500);
  p.text("MOVE", 460, 500);
  p.text("Z / J / SPACE / ENTER :", 160, 540);
  p.text("SHOOT", 460, 540);

  p.text("PRESS SPACE KEY TO START", 160, 600);

  p.pop();
};

const drawSketch = (): void => {
  Game.run();

  if (!gameIsStarted) drawInstruction();

  p.textFont(Fonts.en, 16);
  p.textAlign(p.LEFT);
  p.text("VOL", 10, canvas.logicalSize.height - 23);
};

const draw = (): void => {
  drawBackground();
  canvas.drawScaled(drawSketch);
  updateVolume();
};

// ---- UI ----

const keyTyped = (): void => {
  switch (p.key) {
    // case "p":
    //   pauseOrResume();
    //   break;
    case "g":
      p.save("image.png");
      break;
  }

  if (!gameIsStarted && p.keyCode === 32) {
    Game.reset(true);
    gameIsStarted = true;
  }

  if (Game.state === Game.State.RESULT) Game.reset(true);
};

// ---- start sketch ----

const setP5Methods = (p: p5): void => {
  p.preload = prelaod;
  p.draw = draw;
  p.mouseMoved = () => {
    Mouse.updatePosition();
    Mouse.onMoved();
  };
  p.mousePressed = Mouse.onPressed;
  p.keyTyped = keyTyped;
  p.keyPressed = () => {
    MoveKeys.onPressed();
    if (MoveKeys.up || MoveKeys.left || MoveKeys.down || MoveKeys.right)
      return false;
  };
  p.keyReleased = () => {
    MoveKeys.onReleased();
  };
};

startSketch({
  htmlElement: HTML_ELEMENT,
  logicalCanvasSize: LOGICAL_CANVAS_SIZE,
  initialize,
  setP5Methods,
  fittingOption: ENABLE_CANVAS_SCALING ? undefined : null
});
