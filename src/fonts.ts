import p5 from "p5";

export let jp: p5.Font;
export let en: p5.Font;

export const setJp = (p5Font: p5.Font) => {
  jp = p5Font;
};
export const setEn = (p5Font: p5.Font) => {
  en = p5Font;
};
