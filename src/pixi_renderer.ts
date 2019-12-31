import * as pix from "pixi.js";
import {IRenderer, Texture} from "./draw_contracts";

export class pixi_renderer implements IRenderer{

    readonly app: pix.Application; 

    constructor(document : Document, width: number, height: number) {
        let lookedUpElement  = document.getElementById("playArea");
        if(lookedUpElement == null) throw "playArea Element does not exist!";

        this.app = new pix.Application( {width,height});
        lookedUpElement.appendChild(this.app.view);
    }

    clearCanvas(topX: number, topY: number, Width: number, Height: number): void {
        throw new Error("Method not implemented.");
    }

    drawCellTexture(texture: Texture, x: number, y: number, width: number, height: number, opacity: number): void {
        throw new Error("Method not implemented.");
    }

}