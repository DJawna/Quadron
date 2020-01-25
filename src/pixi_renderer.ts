import * as pix from "pixi.js";
import {IRenderer, Texture,TextStyle} from "./draw_contracts";
import * as collections from "typescript-collections";

export class pixi_renderer implements IRenderer{

    readonly app: pix.Application; 
    readonly tLoader: pix.Loader;
    readonly graphics: pix.Graphics;
   
    // key: hashcode of Texture object.
    // this will cache the actual frames which were prepared for the sprites
    // they are just a part of the entire texture.
    readonly loadedFrames: collections.Dictionary<number,pix.Texture>;
    readonly usedSprites: Array<pix.Sprite>;
    usedSpriteIndex : number;
    readonly textureContainer: pix.Container;
    readonly textContainer: pix.Container;


    constructor(window : Window, width: number, height: number, textureFiles: string[], onReady: () => void, numberOfFields: number) {
        this.usedSprites = new Array<pix.Sprite>(numberOfFields);
        this.usedSpriteIndex = 0;
        for(let spriteIndex =0; spriteIndex<numberOfFields;spriteIndex++){
            const currentSprite = new pix.Sprite();
            currentSprite.x = 0;
            currentSprite.y = 0;
            currentSprite.visible = false;
            this.usedSprites[spriteIndex]= currentSprite;
        }
        this.textContainer = new pix.Container();
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
        this.textureContainer = new pix.Container();
        this.tLoader.load(onReady);
        this.graphics =new pix.Graphics();

        this.app.stage.addChild(this.graphics);
        this.app.stage.addChild(this.textureContainer);
        this.app.stage.addChild(this.textContainer);
    }

    public clearCanvas(topX: number, topY: number, Width: number, Height: number): void {
        this.graphics.beginFill(0x000000);
        this.graphics.drawRect(topX,topY,Width,Height);
        this.graphics.endFill();
        this.graphics.x=0;
        this.graphics.y=0;
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

        const sprite =this.usedSprites[this.usedSpriteIndex];
        this.usedSpriteIndex++;
        sprite.texture = currentTexture;
        //sprite.texture = tf;
        sprite.x = x;
        sprite.y = y;
        sprite.width = width;
        sprite.height = height;
        sprite.alpha = opacity;
    }

    public flushDrawBuffers(): void {
        // add the graphics
        this.graphics.clear();
        this.textContainer.removeChildren();
        this.usedSprites.forEach(i => {
            i.visible = false;
        });
        this.usedSpriteIndex =0;
    }

    drawText(text: string, topX: number, topY: number, textStyle: TextStyle): void {
        const pixTextStyle = new pix.TextStyle({
            fill: textStyle.color,
            fontSize: textStyle.font_size
        }); 
        const basicText = new pix.Text(text,pixTextStyle);
        basicText.x = topX;
        basicText.y = topY;
        this.textContainer.addChild(basicText);
    }


    drawRectangle(x: number, y: number, width: number, height: number, opacity: number, color: number): void {
        this.graphics.beginFill(color);
        this.graphics.drawRect(x,y,width,height);
        this.graphics.endFill();
    }

    setGameUpdateCB(gameUpdateCB: (delta:number) => void): void{
        this.app.ticker.add(gameUpdateCB);
    }

    getDebugInfo(): string {
        
        return `total Sprites: ${this.usedSprites.length}\nLoaded Frames: ${this.loadedFrames.keys.length}`;
    }

}