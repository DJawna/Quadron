
export const clearCanvas =function (canvasCtxt: any,topX: number,topY: number,Width: number,Height: number): void {
    canvasCtxt.save();

    canvasCtxt.setTransform(1,0,0,1,0,0);

    canvasCtxt.clearRect(topX,topY,Width,Height);

    canvasCtxt.restore();
};

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

const drawRectangle = function (canvasCtxt: any, x: number, y: number, width: number, height: number, color: string, lineWidht: number): void {
    canvasCtxt.strokeStyle = color;
    canvasCtxt.lineWidth = lineWidht;

    canvasCtxt.rect(x, y, width, height);
    canvasCtxt.stroke();
};


const drawLine = function (canvasCtxt: any, xbegin: number, ybegin: number, xend: number, yend: number, color: string, width: number): void {
    let currentStrokeStyle = canvasCtxt.strokeStyle;
    canvasCtxt.strokeStyle = color;
    canvasCtxt.lineWidth = width;
    canvasCtxt.moveTo(xbegin, ybegin);
    canvasCtxt.lineTo(xend, yend);
    canvasCtxt.stroke();
    canvasCtxt.strokeStyle = currentStrokeStyle;
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