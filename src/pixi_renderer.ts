import * as pix from "pixi.js";
import {IRenderer, Texture} from "./draw_contracts";

export class pixi_renderer implements IRenderer{

    readonly app: pix.Application; 
    readonly tLoader: pix.Loader;
    readonly loadedTextures: string[]=[];

    constructor(window : Window, width: number, height: number) {

        let lookedUpElement  = window.document.getElementById("playArea");
        this.tLoader = new pix.Loader();
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
        const drawCommand = () => {
            const sprite = new pix.Sprite();
            sprite.texture = this.tLoader.resources[texture.img].texture;
            sprite.x = x;
            sprite.y = y;
            sprite.width = width;
            sprite.height = height;
            sprite.alpha = opacity;
            this.app.stage.addChild(sprite);
        };
        
        if (!this.loadedTextures.includes(texture.img)){
            this.loadedTextures.push(texture.img);
            this.tLoader.add(texture.img).load(drawCommand);
        }else{
            drawCommand();
        }
    }

    public flushDrawBuffers(): void {
        this.app.render();
        this.app.stage.removeChildren();
        
    }

}