import * as pix from "pixi.js";
import {IRenderer, Texture,TextStyle} from "./draw_contracts";
import * as collections from "typescript-collections";

export class pixi_renderer implements IRenderer{
    readonly app: pix.Application; 
    readonly tLoader: pix.Loader;
    graphics: pix.Graphics |null;
   
    // key: hashcode of Texture object.
    // this will cache the actual frames which were prepared for the sprites
    // they are just a part of the entire texture.
    readonly loadedFrames: collections.Dictionary<number,pix.Texture>;
    readonly usedSprites: Array<pix.Sprite>;
    readonly unusedSprites: Array<pix.Sprite>;


    constructor(window : Window, width: number, height: number, textureFiles: string[], onReady: () => void) {
        this.usedSprites = new Array<pix.Sprite>();
        this.unusedSprites = new Array<pix.Sprite>();
        let lookedUpElement  = window.document.getElementById("playArea");
        this.tLoader = new pix.Loader();
        if(lookedUpElement == null) throw "playArea Element does not exist!";

        this.app = new pix.Application( {width,height});
        lookedUpElement.appendChild(this.app.view);
        this.loadedFrames = new collections.Dictionary<number,pix.Texture>();

        
        for(let textureFile of textureFiles){
            this.tLoader.add(textureFile);
            if( this.tLoader.resources[textureFile] === undefined){
                console.log("still undefined!");
            }
        }
        this.tLoader.load(onReady);
        this.graphics =null;
    }

    public clearCanvas(topX: number, topY: number, Width: number, Height: number): void {
        const graph = this.provideGraphicsOnce();
        graph.beginFill(0x000000);
        graph.drawRect(topX,topY,Width,Height);
        graph.endFill();
        graph.x=0;
        graph.y=0;
    }

    // Todo: now lookup the proper framed texture, the "raw" textures are all looked up now!
    public drawCellTexture(texture: Texture, x: number, y: number, width: number, height: number, opacity: number): void {
       const currentTexture = (function (_this: pixi_renderer): pix.Texture{
           const lookup = _this.loadedFrames.getValue(texture.hash);
            if(lookup !== undefined) return lookup;
            
            // get Entire texture first:
            const baseTexture = _this.tLoader.resources[texture.img].texture.baseTexture;
            const rect = new pix.Rectangle(texture.sx,texture.sy,texture.swidth,texture.sheight);
            const framedTexture = new pix.Texture(baseTexture,rect);
            _this.loadedFrames.setValue(texture.hash,framedTexture);
            return framedTexture;
        })(this);

        
        const provideSpriteOnce = function(pr: pixi_renderer, currentTexture: pix.Texture): pix.Sprite{
            if(pr.unusedSprites.length===0){
                const newSprite = new pix.Sprite(currentTexture);
                pr.usedSprites.push(newSprite);
                pr.app.stage.addChild(newSprite);
                return newSprite;
            }
            const existingSprite = pr.unusedSprites.pop();
            if(existingSprite === undefined)
                throw "existing sprite is undefined";

            existingSprite.texture = currentTexture;
            pr.usedSprites.push(existingSprite);
            return existingSprite;
        };

        const sprite =provideSpriteOnce(this,currentTexture);
        //sprite.texture = tf;
        sprite.x = x;
        sprite.y = y;
        sprite.width = width;
        sprite.height = height;
        sprite.alpha = opacity;

    }

    public flushDrawBuffers(): void {
        // add the textures

        // add the graphics
        if(this.graphics!==null){
            this.app.stage.addChild(this.graphics);
            this.graphics = null;
        }
        this.app.render();
        this.app.stage.removeChildren();
        
    }

    drawText(text: string, topX: number, topY: number, textStyle: TextStyle): void {
        const pixTextStyle = new pix.TextStyle({
            fill: textStyle.color,
            fontSize: textStyle.font_size
        }); 
        const basicText = new pix.Text(text,pixTextStyle);
        basicText.x = topX;
        basicText.y = topY;
        this.app.stage.addChild(basicText);
    }

    provideGraphicsOnce(): pix.Graphics {
        if(this.graphics === null)
            this.graphics = new pix.Graphics();

        return this.graphics;
    }

    drawRectangle(x: number, y: number, width: number, height: number, opacity: number, color: number): void {
        const graph = this.provideGraphicsOnce();

        graph.beginFill(color);
        graph.drawRect(x,y,width,height);
        graph.endFill();
    }

}