import {IRenderer} from "./draw_contracts";
import {pixi_renderer} from "./pixi_renderer";
/**
 * This is the DI Registry
 */

export const getRenderer = function(window: Window, width: number,height: number,textureFiles: string[], onReady: () =>void): IRenderer {
    return  new pixi_renderer(window,width,height, textureFiles,onReady);  /* new canvas_draw(window,width,height)*/
}