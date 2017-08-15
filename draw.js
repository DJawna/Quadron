/*jslint es6 */

"use strict";

let drawing = {};

drawing.clearCanvas =function (canvasCtxt,topX,topY,Width,Height) {
    canvasCtxt.save();

    canvasCtxt.setTransform(1,0,0,1,0,0);

    canvasCtxt.clearRect(topX,topY,Width,Height);

    canvasCtxt.restore();


};

drawing.setupCanvas = function (document, canvasID,width, height) {
    let canvasElement = document.getElementById(canvasID);
    canvasElement.width = width;
    canvasElement.height = height;
    return canvasElement.getContext("2d");
};

drawing.fillCanvas = function (canvasCtxt, x, y, width, height, color, opacity) {
    canvasCtxt.globalAlpha = opacity;
    canvasCtxt.fillStyle = color;
    canvasCtxt.fillRect(x, y, width, height);
    canvasCtxt.globalAlpha = 1.0;
};

drawing.drawRectangle = function (canvasCtxt, x, y, width, height, color, lineWidht) {
    canvasCtxt.strokeStyle = color;
    canvasCtxt.lineWidth = lineWidht;

    canvasCtxt.rect(x, y, width, height);
    canvasCtxt.stroke();
};


drawing.drawLine = function (canvasCtxt, xbegin, ybegin, xend, yend, color, width) {
    let currentStrokeStyle = canvasCtxt.strokeStyle;
    canvasCtxt.strokeStyle = color;
    canvasCtxt.lineWidth = width;
    canvasCtxt.moveTo(xbegin, ybegin);
    canvasCtxt.lineTo(xend, yend);
    canvasCtxt.stroke();
    canvasCtxt.strokeStyle = currentStrokeStyle;
};

drawing.drawCellTexture = function(canvasCtxt,texture,x,y,width,height,opacity){
    canvasCtxt.globalAlpha = opacity;
    canvasCtxt.drawImage(texture.img(),
                         texture.sx(),
                         texture.sy(),
                         texture.swidth(),
                         texture.sheight(),
                         x,
                         y,
                         width,
                         height);
    canvasCtxt.globalAlpha = 1.0;
    canvasCtxt.globalAlpha = 1.0;
};

const texture = function (img,sx,sy,swidth,sheight) {
    let _sx =sx;
    let _sy =sy;
    let _shwidth = swidth;
    let _sheight = sheight;
    let _img = img;
    return {
        img : function(){
            return _img;
        },
        sx : function () {
            return _sx;
        },
        sy : function () {
            return _sy;
        },
        swidth : function () {
            return _shwidth;
        },
        sheight : function () {
            return _sheight;
        }

    };
}