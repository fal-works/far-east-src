import p5 from "p5";

export let jpFont: p5.Font;
export let enFont: p5.Font;

export const setJpFont = (p5Font: p5.Font) => {
  jpFont = p5Font;
};
export const setEnFont = (p5Font: p5.Font) => {
  enFont = p5Font;
};
