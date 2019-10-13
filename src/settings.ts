import { HtmlUtility, RectangleSize } from "@fal-works/creative-coding-core";

/**
 * The id of the HTML element to which the canvas should belong.
 */
export const HTML_ELEMENT_ID = "FarEast";

/**
 * The HTML element to which the canvas should belong.
 */
export const HTML_ELEMENT = HtmlUtility.getElementOrBody(HTML_ELEMENT_ID);

/**
 * The logical size of the canvas.
 */
export const LOGICAL_CANVAS_SIZE: RectangleSize.Unit = {
  width: 800,
  height: 800
};

/**
 * If music should be enabled.
 */
export const ENABLE_MUSIC = true;

/**
 * If canvas should be scaled so that it fits to the parent HTML element.
 */
export const ENABLE_CANVAS_SCALING = true;

/**
 * The directory path of assets.
 */
export const ASSETS_DIRECTORY_PATH = "assets";
