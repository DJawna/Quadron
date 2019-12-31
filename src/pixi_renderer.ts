import * as pix from "pixi.js";
import {IRenderer, Texture} from "./draw_contracts";
import * as collections from "typescript-collections";


/**
need to try this for the texture with different frames:

 cells.forEach((row)=>{
    row.forEach((col)=>{
      // create sprite
      let frame = selectTerrain(col);
      console.log(frame);
      // The baseTexture is the image, we want to share that between every sprite.
      const baseTx = PIXI.loader.resources[terrainSource].texture.baseTexture;
      // The texture combines a baseTexture and a frame to create a view into our image.
      // Don't want to share this, so create a new one for each frame.
      const texture = new PIXI.Texture(baseTx, frame);
      let cell = new Sprite(texture);

      cell.x = col.x;
      cell.y = col.y;
      addText(cell, col.row, col.col);

      baseCont.addChild(cell);
    });
  });


 * 
 */


export class pixi_renderer implements IRenderer{

    readonly app: pix.Application; 
    readonly tLoader: pix.Loader;
    // key: hascode of texture
    readonly loadedTextures: collections.Dictionary<number,pix.Texture>;


    constructor(window : Window, width: number, height: number) {

        let lookedUpElement  = window.document.getElementById("playArea");
        this.tLoader = new pix.Loader();
        if(lookedUpElement == null) throw "playArea Element does not exist!";

        this.app = new pix.Application( {width,height});
        lookedUpElement.appendChild(this.app.view);
        this.loadedTextures = new collections.Dictionary<number,pix.Texture>();
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
        const cThis = this;
        const drawCommand = () => {

            let tf = cThis.framedTextures.getValue(texture.hash);
            if(tf ===undefined){
                tf = cThis.tLoader.resources[texture.img].texture;

                if(tf === undefined) 
                {
                    console.log("resource texture undefined");
                    return;
                }
                console.log("resource texture defined");


                tf.frame = new pix.Rectangle(texture.sx,texture.sy,texture.swidth, texture.sheight);
                cThis.framedTextures.setValue(texture.hash,tf);
            }
            const sprite = new pix.Sprite(tf);
            //sprite.texture = tf;
            sprite.x = x;
            sprite.y = y;
            sprite.width = width;
            sprite.height = height;
            sprite.alpha = opacity;
            this.app.stage.addChild(sprite);
        };
        
        if (!this.loadedTextures.getValue(texture.hash)){
            this.loadedTextures.push(texture.img);
            this.tLoader.add(texture.img).load(() => {
                const foo = this.tLoader.resources[texture.img];
                if(foo !==undefined){
                    foo.
                }
            });
        }else{
            drawCommand();
        }
    }

    public flushDrawBuffers(): void {
        this.app.render();
        this.app.stage.removeChildren();
        
    }

}