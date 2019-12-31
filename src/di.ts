import {IRenderer} from "./draw_contracts";
import {canvas_draw} from "./canvas_draw";
/**
 * This is the DI Registry
 */

export const getRenderer = function(window: Window, width: number,height: number): IRenderer {
    return new canvas_draw(window,width,height)
}