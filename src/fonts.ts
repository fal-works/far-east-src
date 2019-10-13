import p5 from "p5";
import { ASSETS_DIRECTORY_PATH as ASSETS } from "./settings";

export let jp: p5.Font;
export let en: p5.Font;

const setJp = (font: p5.Font) => (jp = font);
const setEn = (font: p5.Font) => (en = font);

export const load = (
  p: p5,
  files: {
    jp: string;
    en: string;
  }
): void => {
  p.loadFont(`${ASSETS}/${files.jp}`, setJp);
  p.loadFont(`${ASSETS}/${files.en}`, setEn);
};
