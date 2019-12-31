export class Texture{
    public readonly img: string;
    public readonly sx: number;
    public readonly sy: number;
    public readonly swidth: number;
    public readonly sheight: number;
    
    public constructor(img: string,sx: number,sy: number,swidth: number,sheight: number ){
        this.img = img;
        this.sx = sx;
        this.sy = sy;
        this.swidth = swidth;
        this.sheight = sheight;
    }

}


export interface IRenderer{
    clearCanvas (topX: number,topY: number,Width: number,Height: number): void;
    drawCellTexture(texture: Texture,x: number,y: number,width: number,height: number,opacity:number): void;
    flushDrawBuffers(): void;
}