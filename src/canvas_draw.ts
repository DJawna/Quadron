
import {Texture, IRenderer} from "./draw_contracts";
import * as collections from "typescript-collections";

class CanvasTexture extends Texture {
    imageElement : HTMLImageElement;
    doc: Document;

    constructor(doc: Document,img: string,sx: number,sy: number,swidth: number,sheight: number ){
        super(img,sx,sy,swidth,sheight );
        this.doc = doc;
        
        this.imageElement =new Image(swidth,sheight); //doc.createElement("image"); 
        this.imageElement.style.visibility ="hidden";
        this.imageElement.src = img;
        doc.body.appendChild(this.imageElement);
    }
}


export class canvas_draw implements IRenderer {
    readonly canvasCtxt : CanvasRenderingContext2D;
    readonly textureCache : collections.Dictionary<string,CanvasTexture>;
    readonly window: Window;

    public constructor(window : Window, width: number, height: number){
        this.window = window;
        this.textureCache = new collections.Dictionary<string,CanvasTexture>();
        let lookedUpElement  = window.document.getElementById("playArea");
        if(lookedUpElement == null) throw "playArea Element does not exist!";

        const canvasElement: HTMLCanvasElement = window.document.createElement("canvas");

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
    
    public drawCellTexture(texture: Texture,x: number,y: number,width: number,height: number,opacity:number): void{
        let currentTexture = this.textureCache.getValue(texture.img);
        if(currentTexture === undefined){
            currentTexture = new CanvasTexture(this.window.document,texture.img,x,y,width,height);
            this.textureCache.setValue(texture.img,currentTexture);
        }

        this.canvasCtxt.globalAlpha = opacity;
        this.canvasCtxt.drawImage(currentTexture.imageElement,
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

    public flushDrawBuffers(): void {
        // no op for canvas_draw!
    }
}