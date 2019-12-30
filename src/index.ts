import  * as quadron from "./quadron";
import * as draw from "./draw";

let currentWindow: any = null;

let currentPlayField: quadron.PlayField = new quadron.PlayField();
let currentctxt: any = null;
const cellSize: number = 30;
const cellOffset: number = 0;
const previewLenght: number =4;
const previewCellsize: number = 24;
const previewCellOffset: number =1;
let lastRenderTimeStamp: number =0;
let fpsIndicator = null;

const fallingIntervall: number = 500;
let rowsToBeEliminated: number[] =[];
const vanishingRowsLifeTime: number =4000;
let remainingRowsLifeTime: number =0;
let currentLevel: number =0;
let currentScore: number =0;
let rowsEliminatedSoFar: number =0;

let scoreIndicator: any =null;
let levelIndicator: any =null;
let lineIndicator: any = null;
let firstPreviewCanvas = null;
let secondPreviewCanvas = null;
let thirdPreviewCanvas =null;

let firstPreviewCtxt: any = null;
let secondPreviewCtxt: any = null;
let thirdPreviewCtxt: any =null;
let quadTextures = null;
let TextureDictionary: any = null;
let pauseLabel: any = null;
let PauseButton: any = null;



enum GAME_STATE{
    started=1,
    paused,
    notStarted,
    gameOver,
    elimination,
    landing
}

let currentGameState: GAME_STATE = GAME_STATE.notStarted;

let gameStarted: boolean = false;

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
    pauseLabel.style.display ="";

}

const unPauseGame = function(): void {
    currentGameState = GAME_STATE.started;
    pauseLabel.style.display ="none";
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
            calculateLandingState(timeStamp);
        break;   
    }
    drawPlayField(currentPlayField,currentctxt);
    
    currentWindow.requestAnimationFrame(renderGame);
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
        pauseLabel.style.display ="none";
        toggleGameScren(currentWindow,false);
        toggleGameOverScren(currentWindow,true);
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
        currentWindow.console.log("newopacity: "+ newOpacity);

        
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

const calculateLandingState = function(timeStamp: number) : void {
    currentGameState = GAME_STATE.elimination;
}

const resetGame = function(): void{
    currentPlayField = new quadron.PlayField();  
    
    currentLevel =0;
    currentScore =0;

    rowsEliminatedSoFar =0;

    
}


const toggleGameOverScren = function(windowHandle : any, showGameOverScreen: boolean): void{

    if(showGameOverScreen){
        windowHandle.document.getElementById("GameOverScreen").style.display = "";
        windowHandle.document.getElementById("endScoreIndicator").innerText = currentScore;
        windowHandle.document.getElementById("endLinesIndicator").innerText = rowsEliminatedSoFar;

    }else {
        windowHandle.document.getElementById("GameOverScreen").style.display ="none";
    }
}

const toggleGameScren= function(windowHandle: any, showGameOverScreen: boolean): void{
    windowHandle.document.getElementById("GameContainer").style.display = (showGameOverScreen) ? "" : "none";
}

const setupStartButtonCallback= function(windowHandle: any) {

    let startNewGameAfterGameOver = windowHandle.document.getElementById("restartGameButton");
    let startnewGameButton = windowHandle.document.getElementById("startNewGameButton");

    startnewGameButton.onclick = function () {
        startNewGame();

    };

    startNewGameAfterGameOver.onclick = function (){
        toggleGameOverScren(currentWindow,false);
        toggleGameScren(currentWindow,true);
        startNewGame();

    }
}


const startNewGame = function():void {
    // reset the playfield:
    resetGame();
    currentGameState = GAME_STATE.started;
    PauseButton.style.display ="";
    pauseLabel.style.display ="none";



    currentWindow.requestAnimationFrame(renderGame);
}

const fallingFunction= function(): void {
    if(null !== currentPlayField.CurrentQuad) {
        moveDown();
    }
}


const drawPlayField= function(playField: quadron.PlayField, ctxt: any): void{

    draw.clearCanvas(
    ctxt, 
    0, 
    0,
    playField.Cells[0].length * (cellSize +cellOffset), 
    playField.Cells.length * (cellSize +cellOffset));

    // first render the field without the quad:
    drawCells(ctxt,playField.Cells,cellSize,cellOffset,0,0);

    //drawing.drawCellTexture(currentctxt,TextureDictionary.getTextureByID("Green"),50,50,20,20,1.0);
    drawCells(ctxt,playField.CurrentQuad.Cells,cellSize,cellOffset,playField.CurrentQuad.TopX,playField.CurrentQuad.ShadowTopY,0.4);
    drawCells(ctxt,playField.CurrentQuad.Cells,cellSize,cellOffset,playField.CurrentQuad.TopX,playField.CurrentQuad.TopY);

    
    
    levelIndicator.innerText = currentLevel;
    scoreIndicator.innerText = currentScore;
    lineIndicator.innerText = rowsEliminatedSoFar;
    

    let sizeOfPreview =previewLenght * (previewCellsize +previewCellOffset);
    draw.clearCanvas(firstPreviewCtxt,0,0,sizeOfPreview,sizeOfPreview);
    draw.clearCanvas(secondPreviewCtxt,0,0,sizeOfPreview,sizeOfPreview);
    draw.clearCanvas(thirdPreviewCtxt,0,0,sizeOfPreview,sizeOfPreview);

    drawCells(firstPreviewCtxt,currentPlayField.nextQuads[0].Cells,previewCellsize,previewCellOffset,0,0,1.0);
    drawCells(secondPreviewCtxt,currentPlayField.nextQuads[1].Cells,previewCellsize,previewCellOffset,0,0,1.0);
    drawCells(thirdPreviewCtxt,currentPlayField.nextQuads[2].Cells,previewCellsize,previewCellOffset,0,0,1.0);
    
}
const createTextureDictionary = function(textureAtlas: any) {
    const _greyTexture = new draw.Texture(textureAtlas,0,0,30,30);
    const _goldTexture = new draw.Texture(textureAtlas,30,0,30,30);
    const _orangeTexture = new draw.Texture(textureAtlas,60,0,30,30);
    const _blueTexture = new draw.Texture(textureAtlas,90,0,30,30);
    const _cyanTexture = new draw.Texture(textureAtlas,120,0,30,30);
    const _greenTexture = new draw.Texture(textureAtlas,150,0,30,30);
    const _redTexture = new draw.Texture(textureAtlas,180,0,30,30);
    const _blueVioletTexture = new draw.Texture(textureAtlas,210,0,30,30);

    return {
        getTextureByID : function (id: quadron.CELL_COLORS) {
            
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
        }
    }

}


const drawCells= function(ctxt : any,CellsToDraw: quadron.Cell[][],cellSize: number,cellOffset: number,startingColumn: number,startingRow: number,opacity: number |undefined=undefined): void{
        for(let row = 0;row < CellsToDraw.length; row++){
            for(let column = 0; column < CellsToDraw[row].length; column++) {
                if(CellsToDraw[row][column].visible){

                    let currentopacity = CellsToDraw[row][column].opacity;
                    if(opacity !== undefined){
                        currentopacity =opacity;
                    }

                    draw.drawCellTexture(ctxt,
                                            TextureDictionary.getTextureByID(CellsToDraw[row][column].color),
                                            (cellSize +cellOffset) * (column +startingColumn),
                                            (cellSize +cellOffset)* (row +startingRow),cellSize,cellSize,currentopacity);

                }
                
            }
    }
}


const main = function(windowHandle: any) : void {

    pauseLabel = windowHandle.document.getElementById("pauseLabel");
    pauseLabel.style.display ="none";

    PauseButton = windowHandle.document.getElementById("PauseButton");
    PauseButton.style.display = "none";

    toggleGameOverScren(windowHandle,false);
    
    setupStartButtonCallback(windowHandle);

    PauseButton.onclick = function () {
        switch (currentGameState){
            case GAME_STATE.started:
                pauseGame();
                break;

            case GAME_STATE.paused:
                unPauseGame();
        }
    };
    
    levelIndicator = windowHandle.document.getElementById("levelindicator");
    scoreIndicator = windowHandle.document.getElementById("scoreindicator");
    lineIndicator = windowHandle.document.getElementById("LinesIndicator");
    
    
    // getting the context from canvas element:
    currentctxt = draw.setupCanvas(windowHandle.document, 
                                      "theCanvas",
                                      quadron.PlayField.DefaultColumnNumber * (cellSize + cellOffset),
                                      quadron.PlayField.DefaultRowNumber * (cellSize + cellOffset));

    quadTextures = windowHandle.document.getElementById("quadTextures");
    quadTextures.style.display ="none";


    TextureDictionary = createTextureDictionary(quadTextures);
                                      
                                      
    firstPreviewCanvas = windowHandle.document.getElementById("firstPreview");
    secondPreviewCanvas = windowHandle.document.getElementById("secondPreview");
    thirdPreviewCanvas =windowHandle.document.getElementById("thirdPreview");
 

    firstPreviewCtxt = draw.setupCanvas(windowHandle.document, 
                                      "firstPreview",
                                      previewLenght * (previewCellsize +previewCellOffset),
                                      previewLenght * (previewCellsize +previewCellOffset));           
    

    secondPreviewCtxt = draw.setupCanvas(windowHandle.document, 
                                  "secondPreview",
                                  previewLenght * (previewCellsize +previewCellOffset),
                                  previewLenght * (previewCellsize +previewCellOffset));

    thirdPreviewCtxt = draw.setupCanvas(windowHandle.document, 
                                      "thirdPreview",
                                      previewLenght * (previewCellsize +previewCellOffset),
                                      previewLenght * (previewCellsize +previewCellOffset));
                                  
    fpsIndicator = windowHandle.document.getElementById("fps");
    
    


    //setup controls
    currentWindow = windowHandle;
    currentWindow.onkeydown = keyHandler;

    resetGame();

    currentGameState = GAME_STATE.notStarted;
    
    currentWindow.requestAnimationFrame(renderGame);
};

main(window);