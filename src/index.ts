import  * as quadron from "./quadron";
import {Texture, IRenderer, TextStyle} from "./draw_contracts";
import * as di from "./di";

let currentPlayField: quadron.PlayField = new quadron.PlayField();
const cellSize: number = 30;
const cellOffset: number = 0;
const firstRowOffset: number= 5;
let lastRenderTimeStamp: number =0;
const fallingIntervall: number = 500;
let rowsToBeEliminated: number[] =[];
const vanishingRowsLifeTime: number =4000;
let remainingRowsLifeTime: number =0;
let currentLevel: number =0;
let currentScore: number =0;
let rowsEliminatedSoFar: number =0;
let PauseButton: any = null;
let debugMode: boolean = true;

enum GAME_STATE{
    started=1,
    paused,
    notStarted,
    gameOver,
    elimination,
    landing
}

let currentGameState: GAME_STATE = GAME_STATE.notStarted;

enum Key_mappings {
  fastLandButton = 32,
  moveLeftButton = 37,
  rotateButton = 38,
  moveRightButton = 39,
  moveDownbutton = 40,
  enter = 13,
  pauseKey = 27
};


const keyHandler = function(e: any): void {
    switch (currentGameState){
        case GAME_STATE.started:
            inGameKeyInputHandler(e.keyCode,currentPlayField);
            break;

        case GAME_STATE.paused:
            pauseScreenKeyInputHandler(e.keyCode);
            break;
    }
}


const inGameKeyInputHandler = function(keyCode: Key_mappings, playField: quadron.PlayField): void{
    switch(keyCode){
    case Key_mappings.fastLandButton:
        while(moveDown());
        return;

    case Key_mappings.rotateButton:
        
            playField.CurrentQuad.rotateQuad(false);
            
                if(quadron.checkQuadOverlaps(playField)) {
                    playField.CurrentQuad.rotateQuad(true);
                }
    break;

    case Key_mappings.moveLeftButton:
        moveLeft();
    break;
        
    case Key_mappings.moveRightButton:
        moveRight();
    break;

    case Key_mappings.moveDownbutton:
        moveDown();
    break;

    case Key_mappings.pauseKey:
        pauseGame();
        break;
    }
    quadron.updateShadow(playField);
}

const pauseGame= function(): void {
    currentGameState = GAME_STATE.paused;

}

const unPauseGame = function(): void {
    currentGameState = GAME_STATE.started;
}

const pauseScreenKeyInputHandler = function(keyCode: Key_mappings): void{
    switch (keyCode) {
        case  Key_mappings.pauseKey:
            unPauseGame();
            break;
    }
}


const moveLeft = function(): void {
    currentPlayField.CurrentQuad.TopX--;
    if(quadron.checkQuadOverlaps(currentPlayField)){
        currentPlayField.CurrentQuad.TopX++;
    }
}

const moveRight= function(): void {
    currentPlayField.CurrentQuad.TopX++;
    if(quadron.checkQuadOverlaps(currentPlayField)){
        currentPlayField.CurrentQuad.TopX--;
    }
}

const moveDown = function(): boolean {
    let retVal: boolean = false;
    currentPlayField.CurrentQuad.TopY++;
        if(quadron.checkQuadOverlaps(currentPlayField)){
            currentPlayField.CurrentQuad.TopY--;
            // and land the Quad:

            quadron.landQuad(currentPlayField);

            currentGameState = GAME_STATE.landing;
            currentPlayField.CurrentQuad = currentPlayField.nextQuad();
            
                
            retVal= false;
        }else {
            retVal = true;
        }
    return retVal;
}

const renderGame = function(timeStamp: number) : void{
    switch(currentGameState) {
        case GAME_STATE.started:
            calculateGameState(timeStamp);
        break;
        
        case GAME_STATE.elimination:
            calculateEliminationState(timeStamp);
        break;
        
        case GAME_STATE.landing:
            currentGameState = GAME_STATE.elimination;
        break; 

    }
    currentctxt.flushDrawBuffers();
    drawPlayField(currentPlayField,currentctxt, timeStamp);
}

const calculateCurrentFallingIntervall = function(level : number): number {
    if(level >9) {
        return fallingIntervall - 450;
    }

    return fallingIntervall - (level *50);
}

const calculateGameState = function(timeStamp: number): void{
    currentPlayField.fallingTimer += (timeStamp - lastRenderTimeStamp);
    lastRenderTimeStamp = timeStamp;
    
    // falling function:
    if(currentPlayField.fallingTimer / calculateCurrentFallingIntervall(currentLevel) > 1) {
        currentPlayField.fallingTimer = 0;
        fallingFunction();
    }

    quadron.updateShadow(currentPlayField);
    if( quadron.checkQuadOverlaps(currentPlayField)){
        currentGameState = GAME_STATE.gameOver;
        PauseButton.style.display ="none";
    }
}

const calculateEliminationState= function(timeStamp: number): void {
    // find removable cells
    if(0 === rowsToBeEliminated.length){
        rowsToBeEliminated = quadron.getCompleteRowIndexes(currentPlayField);
        if(0=== rowsToBeEliminated.length) {
            currentGameState = GAME_STATE.started;
        }else {
            remainingRowsLifeTime = vanishingRowsLifeTime;
        }     
    }
    
    // animate the vanishing rows
    if(remainingRowsLifeTime > 0){

        let newOpacity =  remainingRowsLifeTime / vanishingRowsLifeTime;
         
        for(let i =0;i < rowsToBeEliminated.length; i++) {
            let rowIndex = rowsToBeEliminated[i];
            
            for(let column =1; column < currentPlayField.Cells[rowIndex].length -1;column++){
                let cell = quadron.Cell.CellTemplate();
                cell.color = currentPlayField.Cells[rowIndex][column].color;
                cell.opacity = newOpacity;
                currentPlayField.Cells[rowIndex][column].opacity = newOpacity; // = cell;
            }
        }
        remainingRowsLifeTime -= (timeStamp - lastRenderTimeStamp);
    }
    
    // remove the complete rows:
    if(remainingRowsLifeTime < 0) {
        currentScore +=  quadron.calculateScore(rowsToBeEliminated.length);
        rowsEliminatedSoFar +=rowsToBeEliminated.length;
        currentLevel = Math.floor(rowsEliminatedSoFar / 10);
        quadron.eraseRowsByIndex(currentPlayField, rowsToBeEliminated);
        quadron.stackNonEmptyRowsInPlayField(currentPlayField);
        rowsToBeEliminated.length =0;
    }
}


const resetGame = function(): void{
    currentPlayField = new quadron.PlayField();  
    
    currentLevel =0;
    currentScore =0;

    rowsEliminatedSoFar =0;
}




const setupStartButtonCallback= function(windowHandle: any) {
    let startnewGameButton = windowHandle.document.getElementById("startNewGameButton");

    startnewGameButton.onclick = function () {
        startNewGame();
    };
}


const startNewGame = function():void {
    // reset the playfield:
    resetGame();
    currentGameState = GAME_STATE.started;
    PauseButton.style.display ="";
}

const fallingFunction= function(): void {
    if(null !== currentPlayField.CurrentQuad) {
        moveDown();
    }
}


const drawPlayField= function(playField: quadron.PlayField, ctxt: IRenderer, deltaTime : number): void{
    drawCells(ctxt,playField.Cells,cellSize,cellOffset,0,firstRowOffset);
 
    const drawPreviewIfNotNull = (quads: quadron.Quad[], index: number, xCellOffset: number, yCellOffset: number): void =>{
        if(quads.length >=index){
            drawCells(ctxt,quads[index].Cells,cellSize,cellOffset,quads[index].TopX + xCellOffset,quads[index].TopY + yCellOffset);
        }
    };

    drawPreviewIfNotNull(playField.nextQuads, 0, -4,2);
    drawPreviewIfNotNull(playField.nextQuads, 1, 0,2);
    drawPreviewIfNotNull(playField.nextQuads, 2, 4,2);
    
    drawCells(ctxt,playField.CurrentQuad.Cells,cellSize,cellOffset,playField.CurrentQuad.TopX,playField.CurrentQuad.ShadowTopY+firstRowOffset,0.4);
    drawCells(ctxt,playField.CurrentQuad.Cells,cellSize,cellOffset,playField.CurrentQuad.TopX,playField.CurrentQuad.TopY+firstRowOffset);
    ctxt.drawText(`Score: ${currentScore}`,0,0,new TextStyle(0xffffff,20));
    ctxt.drawText(`Niveau: ${currentLevel}`,132,0,new TextStyle(0xffffff,20));
    ctxt.drawText(`Lines: ${rowsEliminatedSoFar}`,250,0,new TextStyle(0xffffff,20));  
    if(currentGameState === GAME_STATE.paused){
        let x,y,width,height: number;
        x =145;
        y = 420;
        width = 100;
        height = 20;
        ctxt.drawRectangle(x,y,width,height,1.0,0xffffff);
        ctxt.drawText("Pause",x,y,new TextStyle(0x000000,20));
    }

    if(debugMode){
        const x : number =170;
        const y : number =600;
        let fps : number = -1;
        if(deltaTime > 0){
            fps = 1000/deltaTime;
        }
        
        ctxt.drawText(`Debuginfo:\ndeltaMS: ${deltaTime}\nfps: ${fps}\n${ctxt.getDebugInfo()}`,x,y,new TextStyle(0x00ff00,20));
        
    }
}

const TextureDictionary = (function(textureAtlas: string): (id: quadron.CELL_COLORS) => Texture {
    const _greyTexture = new Texture(textureAtlas,0,0,30,30);
    const _goldTexture = new Texture(textureAtlas,30,0,30,30);
    const _orangeTexture = new Texture(textureAtlas,60,0,30,30);
    const _blueTexture = new Texture(textureAtlas,90,0,30,30);
    const _cyanTexture = new Texture(textureAtlas,120,0,30,30);
    const _greenTexture = new Texture(textureAtlas,150,0,30,30);
    const _redTexture = new Texture(textureAtlas,180,0,30,30);
    const _blueVioletTexture = new Texture(textureAtlas,210,0,30,30);
 
    return (id: quadron.CELL_COLORS) => {
            switch (id){
                case quadron.CELL_COLORS.Border:
                 return _greyTexture;

                case quadron.CELL_COLORS.OColor:
                    return _goldTexture;

                case  quadron.CELL_COLORS.LColor:
                    return _orangeTexture;

                case quadron.CELL_COLORS.JColor:
                    return _blueTexture;

                case quadron.CELL_COLORS.IColor:
                    return _cyanTexture;

                case quadron.CELL_COLORS.SColor:
                    return _greenTexture;

                case quadron.CELL_COLORS.ZColor:
                    return _redTexture;

                case quadron.CELL_COLORS.TColor:
                    return _blueVioletTexture;

                default:
                    return _greyTexture;
            }
        };
})("assets/quadronTextures.png");


const drawCells = function(ctxt : IRenderer,CellsToDraw: quadron.Cell[][],cellSize: number,cellOffset: number,startingColumn: number,startingRow: number,opacity: number |undefined=undefined): void{
        for(let row = 0;row < CellsToDraw.length; row++){
            for(let column = 0; column < CellsToDraw[row].length; column++) {
                if(CellsToDraw[row][column].visible){

                    let currentopacity = CellsToDraw[row][column].opacity;
                    if(opacity !== undefined){
                        currentopacity =opacity;
                    }

                    ctxt.drawCellTexture(   TextureDictionary(CellsToDraw[row][column].color),
                                            (cellSize +cellOffset) * (column +startingColumn),
                                            (cellSize +cellOffset)* (row +startingRow),cellSize,cellSize,currentopacity);

                }
            }
    }
}


const main = function() : void {
    PauseButton = window.document.getElementById("PauseButton");
    PauseButton.style.display = "none";

    setupStartButtonCallback(window);

    PauseButton.onclick = function () {
        switch (currentGameState){
            case GAME_STATE.started:
                pauseGame();
                break;

            case GAME_STATE.paused:
                unPauseGame();
        }
    };

                                        
    //setup controls
    window.onkeydown = keyHandler;

    resetGame();

    currentGameState = GAME_STATE.notStarted;
    currentctxt.setGameUpdateCB(renderGame);
};


const currentctxt: IRenderer = di.getRenderer(window, 
    quadron.PlayField.DefaultColumnNumber * (cellSize + cellOffset),
    (quadron.PlayField.DefaultRowNumber+5) * (cellSize + cellOffset),["assets/quadronTextures.png"], main,quadron.PlayField.DefaultColumnNumber * (quadron.PlayField.DefaultRowNumber+5));