import p5 from "p5";
import "p5/lib/addons/p5.sound";

import { ENABLE_MUSIC, ASSETS_DIRECTORY_PATH as ASSETS } from "./settings";

let volume = 0;
let music: p5.SoundFile;
let gunSound: p5.SoundFile;
let bombSound: p5.SoundFile;
let preAppearanceSound: p5.SoundFile;
let appearanceSound: p5.SoundFile;
let damageSound: p5.SoundFile;

const createLoadFile = (p: p5) => {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const p5Sound = (p as any) as p5.SoundFile;

  return (file: string): p5.SoundFile => p5Sound.loadSound(`${ASSETS}/${file}`);
};

export const load = (
  p: p5,
  files: {
    music: string;
    gunSound: string;
    bombSound: string;
    preAppearanceSound: string;
    appearanceSound: string;
    damageSound: string;
  }
) => {
  const loadFile = createLoadFile(p);

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const pAny = p as any;

  if (ENABLE_MUSIC) {
    pAny.soundFormats("ogg", "mp3");

    music = loadFile(files.music);
    music.setLoop(true);
  }

  pAny.soundFormats("wav");

  gunSound = loadFile(files.gunSound);
  gunSound.setLoop(true);

  bombSound = loadFile(files.bombSound);
  preAppearanceSound = loadFile(files.preAppearanceSound);
  appearanceSound = loadFile(files.appearanceSound);
  damageSound = loadFile(files.damageSound);

  const tmpDiv = p.createDiv();
  tmpDiv.position(0, 0);
  pAny.userStartAudio().then(() => tmpDiv.remove());
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
