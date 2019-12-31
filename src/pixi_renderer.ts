import * as pix from "pixi.js";

export class pixi_renderer{
    readonly app: pix.Application; 

    constructor(document : Document, width: number, height: number) {
        let lookedUpElement  = document.getElementById("playArea");
        if(lookedUpElement == null) throw "playArea Element does not exist!";

        this.app = new pix.Application( {width,height});
        lookedUpElement.appendChild(this.app.view);
    }

    

}