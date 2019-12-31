import * as pix from "pixi.js";
import {IRenderer, Texture} from "./draw_contracts";

export class pixi_renderer implements IRenderer{

    readonly app: pix.Application; 

    constructor(window : Window, width: number, height: number) {
        let lookedUpElement  = window.document.getElementById("playArea");
        if(lookedUpElement == null) throw "playArea Element does not exist!";

        this.app = new pix.Application( {width,height});
        lookedUpElement.appendChild(this.app.view);
    }

    public clearCanvas(topX: number, topY: number, Width: number, Height: number): void {
        const rect = new pix.Graphics();
        rect.beginFill(0x000000);
        rect.drawRect(topX,topY,Width,Height);
        rect.endFill();
        rect.x=0;
        rect.y=0;
        this.app.stage.addChild(rect);
    }

    public drawCellTexture(texture: Texture, x: number, y: number, width: number, height: number, opacity: number): void {
        throw new Error("Method not implemented.");
    }

    public flushDrawBuffers(): void {
        this.app.render();
    }

}