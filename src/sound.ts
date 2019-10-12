import p5 from "p5";
import "p5/lib/addons/p5.sound";

import { ENABLE_MUSIC } from "./settings";

let volume = 0;
let music: p5.SoundFile;
let gunSound: p5.SoundFile;
let bombSound: p5.SoundFile;
let preAppearanceSound: p5.SoundFile;
let appearanceSound: p5.SoundFile;
let damageSound: p5.SoundFile;

export const loadSounds = (
  p: p5,
  paths: {
    music: string;
    gunSound: string;
    bombSound: string;
    preAppearanceSound: string;
    appearanceSound: string;
    damageSound: string;
  }
) => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const p5Any = p as any;
  const p5Sound = p5Any as p5.SoundFile;

  if (ENABLE_MUSIC) {
    p5Any.soundFormats("ogg", "mp3");

    music = p5Sound.loadSound(paths.music);
    music.setLoop(true);
  }

  p5Any.soundFormats("wav");

  gunSound = p5Sound.loadSound(paths.gunSound);
  gunSound.setLoop(true);

  bombSound = p5Sound.loadSound(paths.bombSound);
  preAppearanceSound = p5Sound.loadSound(paths.preAppearanceSound);
  appearanceSound = p5Sound.loadSound(paths.appearanceSound);
  damageSound = p5Sound.loadSound(paths.damageSound);

  const tmpDiv = p.createDiv();
  tmpDiv.position(0, 0);
  (p as any).userStartAudio().then(() => tmpDiv.remove());
  /* eslint-enable */
};

const playMusic = () => {
  if (ENABLE_MUSIC) music.play();
};

const stopMusic = () => {
  if (ENABLE_MUSIC) music.stop();
};

export const setVolume = (vol: number) => {
  if (ENABLE_MUSIC) music.setVolume(vol);
  gunSound.setVolume(0.25 * vol);
  bombSound.setVolume(0.65 * vol);
  preAppearanceSound.setVolume(0.3 * vol);
  appearanceSound.setVolume(0.5 * vol);
  damageSound.setVolume(1.0 * vol);

  if (volume === 0 && vol > 0) playMusic();
  else if (volume > 0 && vol === 0) stopMusic();

  volume = vol;
};

export const playGunSound = () => {
  if (!gunSound.isPlaying()) gunSound.play();
};
export const stopGunSound = () => {
  if (gunSound.isPlaying()) gunSound.stop();
};

const playRestart = (sound: p5.SoundFile) => {
  if (sound.isPlaying()) sound.stop();
  sound.play();
};

export const playBombSound = () => playRestart(bombSound);
export const playPreAppearanceSound = () => playRestart(preAppearanceSound);
export const playAppearanceSound = () => playRestart(appearanceSound);
export const playDamageSound = () => playRestart(damageSound);
