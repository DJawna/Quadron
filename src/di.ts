import {IRenderer} from "./draw_contracts";
import {pixi_renderer} from "./pixi_renderer";
/**
 * This is the DI Registry
 */

export const getRenderer = function(window: Window, width: number,height: number,textureFiles: string[], onReady: () =>void, numberOfFields: number): IRenderer {
    return  new pixi_renderer(window,width,height, textureFiles,onReady,numberOfFields);  /* new canvas_draw(window,width,height)*/
}