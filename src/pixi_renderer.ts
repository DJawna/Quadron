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
   
    // key: hashcode of Texture object.
    // this will cache the actual frames which were prepared for the sprites
    // they are just a part of the entire texture.
    readonly loadedFrames: collections.Dictionary<number,pix.Texture>;


    constructor(window : Window, width: number, height: number, textureFiles: collections.Set<string>) {
        
        let lookedUpElement  = window.document.getElementById("playArea");
        this.tLoader = new pix.Loader();
        if(lookedUpElement == null) throw "playArea Element does not exist!";

        this.app = new pix.Application( {width,height});
        lookedUpElement.appendChild(this.app.view);
        this.loadedFrames = new collections.Dictionary<number,pix.Texture>();
        for(let textureFile in textureFiles){
            this.tLoader.add(textureFile);
        }
        this.tLoader.load();
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

    // Todo: now lookup the proper framed texture, the "raw" textures are all looked up now!
    public drawCellTexture(texture: Texture, x: number, y: number, width: number, height: number, opacity: number): void {
       if(!this.loadedFrames.containsKey(texture.hash)){
            // get Entire texture first:

       }

        let tf = this.loadedFrames.getValue(texture.hash);
        if(tf ===undefined){
            tf = this.tLoader.resources[texture.img].texture;

            if(tf === undefined) 
            {
                console.log("resource texture undefined");
                return;
            }
            console.log("resource texture defined");


            tf.frame = new pix.Rectangle(texture.sx,texture.sy,texture.swidth, texture.sheight);
            this.loadedFrames.setValue(texture.hash,tf);
        }
        const sprite = new pix.Sprite(tf);
        //sprite.texture = tf;
        sprite.x = x;
        sprite.y = y;
        sprite.width = width;
        sprite.height = height;
        sprite.alpha = opacity;
        this.app.stage.addChild(sprite);
    }

    public flushDrawBuffers(): void {
        this.app.render();
        this.app.stage.removeChildren();
        
    }

}