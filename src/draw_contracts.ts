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


export interface IRenderer{
    clearCanvas (topX: number,topY: number,Width: number,Height: number): void;

    fillCanvas(x: number, y: number, width: number, height: number, color: string, opacity: number): void;

    drawCellTexture(texture: Texture,x: number,y: number,width: number,height: number,opacity:number): void;
}