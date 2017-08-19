/*jslint es6 */

"use strict";

let currentWindow = null;


let currentQuad = null;
let currentPlayField = null;
let currentctxt = null;
const cellSize = 30;
const cellOffset = 0;
const previewLenght =4;
const previewCellsize = 24;
const previewCellOffset =1;
let lastRenderTimeStamp =0;
let fpsIndicator = null;
let nextQuads =[];

const fallingIntervall = 500;
let fallingTimer =0;
let rowsToBeEliminated =[];
const vanishingRowsLifeTime =4000;
let remainingRowsLifeTime =0;
let currentLevel =0;
let currentScore =0;
let rowsEliminatedSoFar =0;

let scoreIndicator =null;
let levelIndicator =null;
let lineIndicator = null;
let firstPreviewCanvas = null;
let secondPreviewCanvas = null;
let thirdPreviewCanvas =null;

let firstPreviewCtxt = null;
let secondPreviewCtxt = null;
let thirdPreviewCtxt =null;
let quadTextures = null;
let TextureDictionary = null;





const GAME_STATE = {
	started : 1,
	paused : 2,
	notStarted : 3,
    gameOver :4,
    elimination: 5,
    landing : 6
};

let currentGameState = GAME_STATE.notStarted;

let gameStarted = false;

let Key_mappings = {
  fastLandButton : 32,
  moveLeftButton : 37,
  rotateButton : 38,
  moveRightButton : 39,
  moveDownbutton : 40,
  enter : 13,
    pauseKey : 27
};


function keyHandler(e) {

    switch (currentGameState){
        case GAME_STATE.started:
            inGameKeyInputHandler(e.keyCode);
            break;

        case GAME_STATE.paused:
            pauseScreenKeyInputHandler(e.keyCode);
            break;
    }


}


function inGameKeyInputHandler(keyCode){
	        switch(keyCode){
            case Key_mappings.fastLandButton:
                while(moveDown());
                return;
            break;
            
            case Key_mappings.rotateButton:
                quadron.rotateQuad(false, currentQuad);
                if(quadron.checkQuadOverlaps(currentPlayField, currentQuad)) {
                    quadron.rotateQuad(true, currentQuad);
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
                    currentGameState = GAME_STATE.paused;
                    break;
        }
        quadron.updateShadow(currentQuad,currentPlayField);

}

function pauseScreenKeyInputHandler(keyCode){
    switch (keyCode) {
        case  Key_mappings.pauseKey:
            currentGameState = GAME_STATE.started;
            break;

    }
}


function moveLeft () {
    currentQuad.TopX--;
    if(quadron.checkQuadOverlaps(currentPlayField,currentQuad)){
        currentQuad.TopX++;
     }
}

function moveRight() {
    currentQuad.TopX++;
    if(quadron.checkQuadOverlaps(currentPlayField,currentQuad)){
        currentQuad.TopX--;
    }    
}

function moveDown() {
    currentQuad.TopY++;
    if(quadron.checkQuadOverlaps(currentPlayField,currentQuad)){
        currentQuad.TopY--;
        // and land the Quad:

        quadron.landQuad(currentPlayField,currentQuad);

        currentGameState = GAME_STATE.landing;
        currentQuad = null;
        
               
        return false;
    }
    return true;
}

function renderGame(timeStamp){
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
    
    drawPlayField(currentPlayField,currentQuad,currentctxt);
    
    
    currentWindow.requestAnimationFrame(renderGame)

}

function calculateCurrentFallingIntervall(level) {
    if(level >9) {
        return fallingIntervall - 450;
    }

    return fallingIntervall - (level *50);
}

function calculateGameState(timeStamp){
    fallingTimer += (timeStamp - lastRenderTimeStamp);
    lastRenderTimeStamp = timeStamp;
    
    // falling function:
    if(fallingTimer / calculateCurrentFallingIntervall(currentLevel) > 1) {
        fallingTimer = 0;
        fallingFunction();
    }
        
    
    
    if(null === currentQuad){
        fallingTimer =0;
        
        if(nextQuads.length ===0){
            replenishQuad();
        }
        currentQuad = nextQuads.shift();
        quadron.updateShadow(currentQuad,currentPlayField);
        replenishQuad();
        if( quadron.checkQuadOverlaps(currentPlayField,currentQuad)){
            currentGameState = GAME_STATE.gameOver;

            toggleGameScren(currentWindow,false);
            toggleGameOverScren(currentWindow,true);

        }
    }
}

function calculateEliminationState(timeStamp) {
    
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
                let cell = quadron.CellTemplate();
                cell.color = currentPlayField.Cells[rowIndex][column].color;
                cell.opacity = newOpacity;
                currentPlayField.Cells[rowIndex][column] = cell;
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

function calculateLandingState(timeStamp) {
    currentGameState = GAME_STATE.elimination;
}

function resetGame(){
    currentPlayField = quadron.PlayfieldTemplate();
    currentQuad = null;
    nextQuads.length =0;
    
    
    currentLevel =0;
    currentScore =0;

    rowsEliminatedSoFar =0;
    
}

function replenishQuad(){
    while (nextQuads.length<=3){
        nextQuads.push(quadron.getRandomQuad(Math.floor(Math.random() * 100)));
    }
}



function setup(windowHandle) {



    toggleGameOverScren(windowHandle,false);
    
    setupStartButtonCallback(windowHandle);
    
    levelIndicator = windowHandle.document.getElementById("levelindicator");
    scoreIndicator = windowHandle.document.getElementById("scoreindicator");
    lineIndicator = windowHandle.document.getElementById("LinesIndicator");
    
    
    // getting the context from canvas element:
    currentctxt = drawing.setupCanvas(windowHandle.document, 
                                      "theCanvas",
                                      quadron.PLAYFIELDDIMENSIONS.Columns * (cellSize + cellOffset),
                                      quadron.PLAYFIELDDIMENSIONS.Rows * (cellSize + cellOffset));

    quadTextures = windowHandle.document.getElementById("quadTextures");
    quadTextures.style.display ="none";


    TextureDictionary = createTextureDictionary(quadTextures);
                                      
                                      
    firstPreviewCanvas = windowHandle.document.getElementById("firstPreview");
    secondPreviewCanvas = windowHandle.document.getElementById("secondPreview");
    thirdPreviewCanvas =windowHandle.document.getElementById("thirdPreview");
 

    firstPreviewCtxt = drawing.setupCanvas(windowHandle.document, 
                                      "firstPreview",
                                      previewLenght * (previewCellsize +previewCellOffset),
                                      previewLenght * (previewCellsize +previewCellOffset));           
    

    secondPreviewCtxt = drawing.setupCanvas(windowHandle.document, 
                                  "secondPreview",
                                  previewLenght * (previewCellsize +previewCellOffset),
                                  previewLenght * (previewCellsize +previewCellOffset));

    thirdPreviewCtxt = drawing.setupCanvas(windowHandle.document, 
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
}

function toggleGameOverScren(windowHandle, showGameOverScreen){

    if(showGameOverScreen){
        windowHandle.document.getElementById("GameOverScreen").style.display = "";
        windowHandle.document.getElementById("endScoreIndicator").innerText = currentScore;
        windowHandle.document.getElementById("endLinesIndicator").innerText = rowsEliminatedSoFar;

    }else {
        windowHandle.document.getElementById("GameOverScreen").style.display ="none";
    }
}

function toggleGameScren(windowHandle, showGameOverScreen){
    windowHandle.document.getElementById("GameContainer").style.display = (showGameOverScreen) ? "" : "none";
}

function setupStartButtonCallback(windowHandle) {

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


function startNewGame() {
    // reset the playfield:
    resetGame();
    currentGameState = GAME_STATE.started;



    currentWindow.requestAnimationFrame(renderGame);
}

function fallingFunction() {
    if(null !== currentQuad) {
        moveDown();
    }
}


function drawPlayField(playField, quad, ctxt){

    drawing.clearCanvas(
    ctxt, 
    0, 
    0,
    playField.Cells[0].length * (cellSize +cellOffset), 
    playField.Cells.length * (cellSize +cellOffset));

    // first render the field without the quad:
    drawCells(ctxt,playField.Cells,cellSize,cellOffset,0,0);

    //drawing.drawCellTexture(currentctxt,TextureDictionary.getTextureByID("Green"),50,50,20,20,1.0);
    
    
    if(null !== quad){
        drawCells(ctxt,quad.Cells,cellSize,cellOffset,quad.TopX,quad.ShadowTopY,0.4);
        drawCells(ctxt,quad.Cells,cellSize,cellOffset,quad.TopX,quad.TopY,1.0);

    }
    
    levelIndicator.innerText = currentLevel;
    scoreIndicator.innerText = currentScore;
    lineIndicator.innerText = rowsEliminatedSoFar;
    
    if(null !== nextQuads){
        let sizeOfPreview =previewLenght * (previewCellsize +previewCellOffset);
        drawing.clearCanvas(firstPreviewCtxt,0,0,sizeOfPreview,sizeOfPreview);
        drawing.clearCanvas(secondPreviewCtxt,0,0,sizeOfPreview,sizeOfPreview);
        drawing.clearCanvas(thirdPreviewCtxt,0,0,sizeOfPreview,sizeOfPreview);
        if(null !== nextQuads[0]){
            drawCells(firstPreviewCtxt,nextQuads[0].Cells,previewCellsize,previewCellOffset,0,0,1.0);
        }
        
        if(null !== nextQuads[1]){
            drawCells(secondPreviewCtxt,nextQuads[1].Cells,previewCellsize,previewCellOffset,0,0,1.0);
        }
        if(null !== nextQuads[2]){
            drawCells(thirdPreviewCtxt,nextQuads[2].Cells,previewCellsize,previewCellOffset,0,0,1.0);
        }   
    }
    
}
function createTextureDictionary (textureAtlas) {
    const _greyTexture = texture(textureAtlas,0,0,30,30);
    const _goldTexture = texture(textureAtlas,30,0,30,30);
    const _orangeTexture = texture(textureAtlas,60,0,30,30);
    const _blueTexture = texture(textureAtlas,90,0,30,30);
    const _cyanTexture = texture(textureAtlas,120,0,30,30);
    const _greenTexture = texture(textureAtlas,150,0,30,30);
    const _redTexture = texture(textureAtlas,180,0,30,30);
    const _blueVioletTexture = texture(textureAtlas,210,0,30,30);

    return {
        getTextureByID : function (id) {
            switch (id){
                case quadron.CELL_COLORS.Border:
                 return _greyTexture;
                 break;

                case quadron.CELL_COLORS.OColor:
                    return _goldTexture;
                    break;

                case  quadron.CELL_COLORS.LColor:
                    return _orangeTexture;
                    break;

                case quadron.CELL_COLORS.JColor:
                    return _blueTexture;
                    break;

                case quadron.CELL_COLORS.IColor:
                    return _cyanTexture;
                    break;

                case quadron.CELL_COLORS.SColor:
                    return _greenTexture;
                    break;

                case quadron.CELL_COLORS.ZColor:
                    return _redTexture;
                    break;

                case quadron.CELL_COLORS.TColor:
                    return _blueVioletTexture;
                    break;

                default:
                    return _greyTexture;
                    break;
            }
        }
    }

}


function drawCells(ctxt,CellsToDraw,cellSize,cellOffset,startingColumn,startingRow,opacity){
        for(let row = 0;row < CellsToDraw.length; row++){
            for(let column = 0; column < CellsToDraw[row].length; column++) {
                if(CellsToDraw[row][column].visible){

                    let currentopacity = opacity;
                    if(typeof opacity === "undefined"){
                        currentopacity =CellsToDraw[row][column].opacity;
                    }

                    drawing.drawCellTexture(ctxt,
                                            TextureDictionary.getTextureByID(CellsToDraw[row][column].color),
                                            (cellSize +cellOffset) * (column +startingColumn),
                                            (cellSize +cellOffset)* (row +startingRow),cellSize,cellSize,currentopacity);

                }
                
            }
    }
}


