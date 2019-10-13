import resolve from "rollup-plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import cleanup from "rollup-plugin-cleanup";

// ---- settings ------------

const repositoryURL = "https://github.com/fal-works/far-east-src";
const title = "Far East";
const version = "0.1.0";
const bundleFalWorksLibraries = true;
const additionalBannerComment = `
/**
 * The asset files are NOT for redistribution.
 * Please visit each URL for accessing the original files.
 * 
 * Fonts:
 *   Subset fonts derived from Noto Sans JP.
 *   © 2014-2017 Google Inc.
 *   Licensed under the SIL Open Font License, Version 1.1 (https://scripts.sil.org/OFL).
 *
 * Music:
 *   © 2019 ISAo.
 *   URL: https://dova-s.jp/bgm/play11134.html
 *   Used under the License: https://dova-s.jp/_contents/license/
 *
 * Sounds:
 *   © 効果音ラボ
 *   URL: https://soundeffect-lab.info/
 *   Used under the License: https://soundeffect-lab.info/agreement/
 */
`;

const useP5Sound = true;

// --------------------------

const bundledLibraries = bundleFalWorksLibraries
  ? `
 * Bundled libraries:
 *   @fal-works/creative-coding-core (MIT license)
 *   @fal-works/p5-extension (MIT license)
 * `
  : "";

const bannerComment =
  `/**
 * ${title}.
 * Source code in TypeScript: ${repositoryURL}
 * ${bundledLibraries}
 * @copyright 2019 FAL
 * @version ${version}
 */
` + additionalBannerComment;

const typescriptPlugin = typescript({
  useTsconfigDeclarationDir: true
});

const cleanupPlugin = cleanup({
  comments: /^\*\*/, // preserve multiline comments
  extensions: ["ts"]
});

const globals = {
  p5: "p5"
};
if (!bundleFalWorksLibraries) {
  globals["@fal-works/creative-coding-core"] = "CreativeCodingCore";
  globals["@fal-works/p5-extension"] = "p5ex";
}

const external = ["p5"];
if (useP5Sound) external.push("p5/lib/addons/p5.sound");
if (!bundleFalWorksLibraries)
  external.push("@fal-works/creative-coding-core", "@fal-works/p5-extension");

const plugins = [typescriptPlugin, cleanupPlugin];
if (bundleFalWorksLibraries)
  plugins.unshift(
    resolve({
      extensions: [".mjs"],
      modulesOnly: true
    })
  );

const config = {
  input: "src/main.ts",
  output: {
    file: "dist/main.js",
    format: "iife",
    sourcemap: true,
    banner: bannerComment,
    preferConst: true,
    globals
  },
  external,
  plugins
};

export default config;
