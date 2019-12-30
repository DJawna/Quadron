
class canvas_draw {
    readonly canvasCtxt : CanvasRenderingContext2D;

    public constructor(document : Document, canvasID: string,width: number, height: number){
        let lookedUpElement  = document.getElementById(canvasID);
        if(lookedUpElement == null) throw `the following canvasID: ${canvasID} does not exist in the html document!`;
        let canvasElement : HTMLCanvasElement = <HTMLCanvasElement> lookedUpElement;
        canvasElement.width = width;
        canvasElement.height = height;
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


// no longer needed, the constructor will do that!
export const setupCanvas = function (document : any, canvasID: string,width: number, height: number): any {
    let canvasElement = document.getElementById(canvasID);
    canvasElement.width = width;
    canvasElement.height = height;
    return canvasElement.getContext("2d");
};

export const fillCanvas = function (canvasCtxt: any, x: number, y: number, width: number, height: number, color: string, opacity: number): void {
    canvasCtxt.globalAlpha = opacity;
    canvasCtxt.fillStyle = color;
    canvasCtxt.fillRect(x, y, width, height);
    canvasCtxt.globalAlpha = 1.0;
};

export const drawCellTexture = function(canvasCtxt: any,texture: Texture,x: number,y: number,width: number,height: number,opacity:number): void{
    canvasCtxt.globalAlpha = opacity;
    canvasCtxt.drawImage(texture.img,
                         texture.sx,
                         texture.sy,
                         texture.swidth,
                         texture.sheight,
                         x,
                         y,
                         width,
                         height);
    canvasCtxt.globalAlpha = 1.0;
    canvasCtxt.globalAlpha = 1.0;
};

export class Texture{
    public readonly img: any;
    public readonly sx: number;
    public readonly sy: number;
    public readonly swidth: number;
    public readonly sheight: number;
    
    public constructor(img: any,sx: number,sy: number,swidth: number,sheight: number ){
        this.img = img;
        this.sx = sx;
        this.sy = sy;
        this.swidth = swidth;
        this.sheight = sheight;
    }

}



export const clearCanvas =function (canvasCtxt: any,topX: number,topY: number,Width: number,Height: number): void {
    canvasCtxt.save();

    canvasCtxt.setTransform(1,0,0,1,0,0);

    canvasCtxt.clearRect(topX,topY,Width,Height);

    canvasCtxt.restore();
};