
import {Texture, IRenderer} from "./draw_contracts";



export class canvas_draw implements IRenderer {
    readonly canvasCtxt : CanvasRenderingContext2D;

    public constructor(document : Document, canvasID: string,width: number, height: number){
        let lookedUpElement  = document.getElementById("playArea");
        if(lookedUpElement == null) throw "playArea Element does not exist!";

        const canvasElement: HTMLCanvasElement = document.createElement("canvas"); // new HTMLCanvasElement();
        canvasElement.id = canvasID;

        canvasElement.width = width;
        canvasElement.height = height;
        lookedUpElement.appendChild(canvasElement);

        const retval = canvasElement.getContext( "2d");
        if(retval === null) throw "Could not create the 2d rendering context!";
        this.canvasCtxt = retval;
    }

    public clearCanvas (topX: number,topY: number,Width: number,Height: number): void {
        this.canvasCtxt.save();
    
        this.canvasCtxt.setTransform(1,0,0,1,0,0);
    
        this.canvasCtxt.clearRect(topX,topY,Width,Height);
    
        this.canvasCtxt.restore();
    }

    public fillCanvas(x: number, y: number, width: number, height: number, color: string, opacity: number): void {
        this.canvasCtxt.globalAlpha = opacity;
        this.canvasCtxt.fillStyle = color;
        this.canvasCtxt.fillRect(x, y, width, height);
        this.canvasCtxt.globalAlpha = 1.0;
    }
    
    public drawCellTexture(texture: Texture,x: number,y: number,width: number,height: number,opacity:number): void{
        this.canvasCtxt.globalAlpha = opacity;
        this.canvasCtxt.drawImage(texture.img,
                             texture.sx,
                             texture.sy,
                             texture.swidth,
                             texture.sheight,
                             x,
                             y,
                             width,
                             height);
        this.canvasCtxt.globalAlpha = 1.0;
        this.canvasCtxt.globalAlpha = 1.0;
    }
}