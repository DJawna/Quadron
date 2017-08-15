/*jslint es6 */

"use strict";


// the quadron namespace
let quadron = {};

quadron.CELL_COLORS = {
    Border :0,
    OColor : 1,
    LColor : 2,
    JColor : 3,
    IColor : 4,
    SColor : 5,
    ZColor : 6,
    TColor : 7

}

quadron.CellTemplate = function () {
    return {
        occupied: false,
        color: quadron.CELL_COLORS.Border,
        landed: true,
        visible: true,
        specialBlock: false
    };

};

quadron.copyCell =function(input) {
    let retVal = {};
    retVal.occupied = input.occupied;
    retVal.color = input.color;
    retVal.landed = input.landed;
    retVal.visible = input.visible;
    retVal.specialBlock = input.specialBlock;

    return retVal;

};

quadron.rotationArray = null;

quadron.initRotationArray = function() {
    return [
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0]
    ];
};

quadron.resetRotataionArray = function () {
    let cell = 0;
    
    for(let row =0; row < quadron.rotationArray.length; row++) {
        for(let column =0; column < quadron.rotationArray[row].length; column++) {
            quadron.rotationArray[row][column] = cell;
        }
    }
};

quadron.rotateQuad = function (rotateBack, quad) {
    if(quadron.QUADTYPE.O !== quad.type){
        quadron.rotateMatrix(rotateBack, quad.Cells);
    }

};

quadron.updateShadow = function (quad, playField) {
    quad.ShadowTopY = quad.TopY;


    let tempTopY = quad.TopY;

    while(!quadron.checkQuadOverlaps(playField,quad)){
        quad.TopY++;
    }

    quad.ShadowTopY = quad.TopY;
    quad.TopY = tempTopY;

    if(quad.ShadowTopY > quad.TopY){
        quad.ShadowTopY--
    }


};



quadron.rotateMatrix = function (rotateBack, matrix) {
    if(null === quadron.rotationArray){
        quadron.rotationArray = quadron.initRotationArray();
    }
    quadron.resetRotataionArray();
    for(let row = 0; row < matrix.length; row++) {
        for(let column =0; column < matrix[row].length; column++) {
            let rotationRow = column;
            let rotationColumn = (matrix.length -1) -row;
            if(rotateBack){
                rotationRow = (matrix[row].length -1) -column;
                rotationColumn = row;
            }else {
                rotationRow = column;
                rotationColumn = (matrix.length -1) -row;
            }
            
            quadron.rotationArray[rotationRow][rotationColumn] = matrix[row][column];
           
        }
    }
    
    // write back the array
    for(let row = 0; row < matrix.length; row++){
        for(let column = 0; column < matrix[row].length; column++) {
            matrix[row][column] = quadron.rotationArray[row][column];
        }
    }
};


// creates the empty Playfield
quadron.PlayfieldTemplate = function () {
    let playField = {};
    playField.Cells = [];
    for(let rowIndex = 0; rowIndex < quadron.PLAYFIELDDIMENSIONS.Rows; rowIndex++) {
        let currentRow = [];
        for(let columnIndex = 0; columnIndex < quadron.PLAYFIELDDIMENSIONS.Columns; columnIndex++){
            let currentCell = quadron.CellTemplate();
            currentCell.visible = false;
            if(columnIndex === 0 || columnIndex === 11 || rowIndex ===23){
                currentCell.occupied = true;
                currentCell.color = quadron.CELL_COLORS.Border;
                currentCell.specialBlock = true;
                currentCell.visible = true;
            }
            currentRow[columnIndex] = currentCell;
        }
        playField.Cells[rowIndex] = currentRow;
    }
    return playField;
};





quadron.PLAYFIELDDIMENSIONS = {
    Rows : 24,
    Columns : 12
    
};

quadron.QUADTYPE = {
    O : 0,
    L : 1,
    I : 2,
    Z : 3,
    S : 4,
    T : 5,
    J : 6
    
};

quadron.eraseRowsByIndex = function (playField, rowIndexes){
    for(let i = 0; i <  rowIndexes.length; i++) {
        let rowIndex = rowIndexes[i];
        for(let column =1; column < playField.Cells[rowIndex].length-1; column++){
            let cell = quadron.CellTemplate();
            cell.visible =false;
            playField.Cells[rowIndex][column] = cell;
        }
    }
};

quadron.stackNonEmptyRowsInPlayField = function (playField) {
    let emptyRows = [];
    let nonEmptyRows = [];
    
    for(let row = 0; row < playField.Cells.length; row++) {
        if(quadron.checkIfRowisEmpty(playField.Cells[row])){
            emptyRows.push(playField.Cells[row]);
        } else {
            nonEmptyRows.push(playField.Cells[row]);
        }
    }
    
    let rowIndex = playField.Cells.length -1;
    
    while(nonEmptyRows.length > 0) {
        playField.Cells[rowIndex] = nonEmptyRows.pop();
        rowIndex--;
    }
    
    while(emptyRows.length > 0) {
        playField.Cells[rowIndex] = emptyRows.pop();
        rowIndex--;
    }
    
};

quadron.checkIfRowisEmpty = function (row) {
    
    for (let column =1; column < row.length-1; column++){
        if(row[column].occupied || row[column].specialBlock){
            return false;
        }
    }
    return true;
    
};


quadron.getCompleteRowIndexes = function(playField) {
    let result = [];
    for(let row =0; row < playField.Cells.length -1; row++) {
        let rowComplete = true;
        for(let column =0; column < playField.Cells[row].length; column++){
            if(!playField.Cells[row][column].occupied){
                rowComplete = false;
                break;
            }
        }
        
        if(rowComplete) {
            result.push(row);
        }
    }
    return result;
};


quadron.getRandomQuad = function(randomNumber) {
    switch(randomNumber % 7){
        case 0:
            return quadron.create_O_Quad();
        break;

    
        case 1:
            return quadron.create_L_Quad();
        break;

        case 2:
            return quadron.create_J_Quad();
        break;

        case 3:
            return quadron.create_I_Quad();
        break;

        case 4:
            return quadron.create_S_Quad();
        break;

        case 5:
            return quadron.create_Z_Quad();
        break;

        default:
            return quadron.create_T_Quad();
        break;
    }
};






quadron.create_O_Quad = function() {
    let Empty = quadron.CellTemplate();
    Empty.visible = false;
    Empty.landed = false;
    let Occupied = quadron.CellTemplate();
    Occupied.color = quadron.CELL_COLORS.OColor;
    Occupied.landed = false;
    Occupied.occupied = true;
    
    let O_quad = {};
    O_quad.Cells = [
    [Empty,Occupied,Occupied,Empty],
    [Empty,Occupied,Occupied,Empty],
    [Empty,Empty,Empty,Empty]
    ];
    O_quad.type = quadron.QUADTYPE.O;
    
    O_quad.TopX = 4;
    O_quad.TopY = 0;

    O_quad.ShadowTopY=0;
    
    return O_quad;
};


quadron.create_L_Quad = function() {
    let Empty = quadron.CellTemplate();
    Empty.visible = false;
    Empty.landed = false;
    let Occupied = quadron.CellTemplate();
    Occupied.color = quadron.CELL_COLORS.LColor;
    Occupied.landed = false;
    Occupied.occupied = true;
    
    let L_quad = {};
    L_quad.Cells = [
    [Empty,    Empty,    Occupied],
    [Occupied, Occupied, Occupied],
    [Empty,    Empty,    Empty]
    ];
    L_quad.type = quadron.QUADTYPE.L;
    
    L_quad.TopX = 5;
    L_quad.TopY = 0;

    L_quad.ShadowTopY =0;
    
    return L_quad;
};

quadron.create_J_Quad = function() {
    let Empty = quadron.CellTemplate();
    Empty.visible = false;
    Empty.landed = false;
    let Occupied = quadron.CellTemplate();
    Occupied.color = quadron.CELL_COLORS.JColor;
    Occupied.landed = false;
    Occupied.occupied = true;
    
    let J_quad = {};
    J_quad.Cells = [
    [Occupied,Empty,Empty],
    [Occupied,Occupied,Occupied],
    [Empty,Empty,Empty]
    ];
    J_quad.type = quadron.QUADTYPE.L;
    
    J_quad.TopX = 5;
    J_quad.TopY = 0;

    J_quad.ShadowTopY =0;
    
    return J_quad;
};

quadron.create_I_Quad = function() {
    let Empty = quadron.CellTemplate();
    Empty.visible = false;
    Empty.landed = false;
    let Occupied = quadron.CellTemplate();
    Occupied.color = quadron.CELL_COLORS.IColor;
    Occupied.landed = false;
    Occupied.occupied = true;
    
    let I_quad = {};
    I_quad.Cells = [
    [Empty,Empty,Empty,Empty],
    [Occupied,Occupied,Occupied,Occupied],
    [Empty,Empty,Empty,Empty],
    [Empty,Empty,Empty,Empty]
    ];
    I_quad.type = quadron.QUADTYPE.I;
    
    I_quad.TopX = 4;
    I_quad.TopY = 0;

    I_quad.ShadowTopY =0;
    
    return I_quad;
};

quadron.create_S_Quad = function() {
    let Empty = quadron.CellTemplate();
    Empty.visible = false;
    Empty.landed = false;
    let Occupied = quadron.CellTemplate();
    Occupied.color = quadron.CELL_COLORS.SColor;
    Occupied.landed = false;
    Occupied.occupied = true;
    
    let S_quad = {};
    S_quad.Cells = [
    [Empty,    Occupied, Occupied],
    [Occupied, Occupied, Empty],
    [Empty,    Empty,    Empty]
    ];
    S_quad.type = quadron.QUADTYPE.S;
    
    S_quad.TopX = 5;
    S_quad.TopY = 0;

    S_quad.ShadowTopY =0;
    
    return S_quad;
};

quadron.create_Z_Quad = function() {
    let Empty = quadron.CellTemplate();
    Empty.visible = false;
    Empty.landed = false;
    let Occupied = quadron.CellTemplate();
    Occupied.color = quadron.CELL_COLORS.ZColor;
    Occupied.landed = false;
    Occupied.occupied = true;
    
    let Z_quad = {};
    Z_quad.Cells = [
    [Occupied, Occupied,Empty],
    [Empty,    Occupied,Occupied],
    [Empty,    Empty,Empty]
    ];
    Z_quad.type = quadron.QUADTYPE.Z;
    
    Z_quad.TopX = 5;
    Z_quad.TopY = 0;

    Z_quad.ShadowTopY =0;
    
    return Z_quad;
};


quadron.create_T_Quad = function() {
    let Empty = quadron.CellTemplate();
    Empty.visible = false;
    Empty.landed = false;
    let Occupied = quadron.CellTemplate();
    Occupied.color = quadron.CELL_COLORS.TColor;
    Occupied.landed = false;
    Occupied.occupied = true;
    
    let T_quad = {};
    T_quad.Cells = [
    [Empty,    Occupied,Empty],
    [Occupied, Occupied,Occupied],
    [Empty,    Empty,Empty]
    ];
    T_quad.type = quadron.QUADTYPE.T;
    
    T_quad.TopX = 5;
    T_quad.TopY = 0;

    T_quad.ShadowTopY =0;
    
    return T_quad;
};




quadron.checkQuadOverlaps = function(playField, quad) {
        for(let quadRow =0; quadRow < quad.Cells.length; quadRow++){
            for(let quadColumn =0; quadColumn < quad.Cells[quadRow].length; quadColumn++){
                
                // checks if quad is occupied here:
                if(quad.Cells[quadRow][quadColumn].occupied){
                    // then check if it overlaps:
                    let playfieldrow = quad.TopY + quadRow;
                    let playfieldcolumn = quad.TopX + quadColumn;
                    if( playfieldrow <0 || 
                        playfieldrow >= playField.Cells.length || // check if out of bounds first
                        playfieldcolumn <0 || 
                        playfieldcolumn >= playField.Cells[0].length ||
                        playField.Cells[playfieldrow][playfieldcolumn].occupied) // now check if occupied
                        {
                           return true;
                       }
                    }            
            }
    }
    return false;
};

// this will land the quad onto the playfield, after that,
// the quad will be merged with the playfield and its occupied cells
// will be part of it. This function does not check if the quad overlaps,
// or is adjacent to other quad which are already landed.
quadron.landQuad = function(playField, quad){
    for(let row = 0; row < quad.Cells.length; row++){
        for(let column = 0; column < quad.Cells[row].length; column++){
            // transfer the quad cells onto the playfield:
            let currentCell = quad.Cells[row][column];
            if(currentCell.occupied){
               currentCell.landed = true;
               playField.Cells[quad.TopY + row][quad.TopX + column] = currentCell;
            }
            
        }
    }
};

quadron.calculateScore =function(eliminatedRowNumber) {
    // 10 base score for each row eliminated, time bonus
    return (Math.pow(eliminatedRowNumber,2) *10);
};

// quadron field:
quadron.PlayField = quadron.PlayfieldTemplate();
