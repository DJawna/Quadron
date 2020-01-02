import {IRenderer} from "./draw_contracts";
import {canvas_draw} from "./canvas_draw";
import {pixi_renderer} from "./pixi_renderer";
import * as collections from "typescript-collections";
/**
 * This is the DI Registry
 */

export const getRenderer = function(window: Window, width: number,height: number,textureFiles: collections.Set<string>): IRenderer {
    return  new pixi_renderer(window,width,height, textureFiles);  /* new canvas_draw(window,width,height)*/
}