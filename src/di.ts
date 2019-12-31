import {IRenderer} from "./draw_contracts";
import {canvas_draw} from "./canvas_draw";
/**
 * This is the DI Registry
 */

export const getRenderer = function(document: Document, width: number,height: number): IRenderer {
    return new canvas_draw(document,width,height)
}