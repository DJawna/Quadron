export class Texture{
    public readonly img: string;
    public readonly sx: number;
    public readonly sy: number;
    public readonly swidth: number;
    public readonly sheight: number;
    public readonly hash: number;

    
    public constructor(img: string,sx: number,sy: number,swidth: number,sheight: number ){
        this.img = img;
        this.sx = sx;
        this.sy = sy;
        this.swidth = swidth;
        this.sheight = sheight;
        this.hash = this.img.split("").map(i => { 
            const codePoint = i.charCodeAt(0);
            if(codePoint === undefined){
                return 0;
            } 
            return codePoint;
         }).reduce((acc,s)=> acc+s)+sx+sy+swidth+sheight;
    }

}

export class TextStyle{
    public readonly color: number;
    public readonly font_size: number;

    public constructor(color: number, font_size: number){
        this.color = color;
        this.font_size = font_size;
    }
}


export interface IRenderer{
    clearCanvas (topX: number,topY: number,Width: number,Height: number): void;
    drawCellTexture(texture: Texture,x: number,y: number,width: number,height: number,opacity:number): void;
    drawRectangle(x: number, y: number, width: number, height: number,opacity: number, color: number): void;
    flushDrawBuffers(): void;
    drawText (text: string, topX: number, topY: number, textStyle: TextStyle): void;
    setGameUpdateCB(gameUpdateCB: (delta:number) => void): void;
    getDebugInfo(): string
}