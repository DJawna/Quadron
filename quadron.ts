export enum CELL_COLORS {
    Border =0,
    OColor,
    LColor,
    JColor,
    IColor,
    SColor,
    ZColor,
    TColor
}

export class Cell{
    public readonly occupied: boolean;
    public color: CELL_COLORS;
    public landed: boolean;
    public visible: boolean;
    public opacity: number;
    public readonly specialBlock: boolean;

    public constructor(occupied: boolean, color: CELL_COLORS, landed: boolean, visible: boolean, specialBlock: boolean, opacity: number){
        this.occupied = occupied;
        this.color = color;
        this.landed = landed;
        this.visible = visible;
        this.specialBlock = specialBlock;
        this.opacity = opacity;
    }

    public static CellTemplate(): Cell {
        return new Cell( false, CELL_COLORS.Border,true,true,false,1);
    }

    public static copyCell(input: Cell): Cell {
        return new Cell(input.occupied,input.color, input.landed,input.visible,input.specialBlock,input.opacity);
    }

    public static EmptyCell(): Cell {
        let retVal: Cell = Cell.CellTemplate();
        return new Cell(retVal.occupied,retVal.color,false,false,retVal.specialBlock,0);
    }

    public static OccupiedCell(cellColor: CELL_COLORS): Cell {
        let retVal = Cell.CellTemplate();
        return new Cell(true,cellColor,false,retVal.visible,retVal.specialBlock,1);
    }
}


let rotationArray: Cell[][] | null = null;

const initRotationArray = function(): Cell[][]  {
    return [
        [Cell.EmptyCell(),Cell.EmptyCell(),Cell.EmptyCell(),Cell.EmptyCell()],
        [Cell.EmptyCell(),Cell.EmptyCell(),Cell.EmptyCell(),Cell.EmptyCell()],
        [Cell.EmptyCell(),Cell.EmptyCell(),Cell.EmptyCell(),Cell.EmptyCell()],
        [Cell.EmptyCell(),Cell.EmptyCell(),Cell.EmptyCell(),Cell.EmptyCell()]
    ];
};

const resetRotataionArray = function (): void {
    let cell = Cell.EmptyCell();
    if (rotationArray != null) {
        for(let row =0; row < rotationArray.length; row++) {
            for(let column =0; column < rotationArray[row].length; column++) {
                rotationArray[row][column] = cell;
            }
        }
    }else {
        throw "cannot reset Rotation Array because it is not yet initialized!";
    }

};


export const updateShadow = function (playField: PlayField): void {
    playField.CurrentQuad.ShadowTopY = playField.CurrentQuad.TopY;

    let tempTopY = playField.CurrentQuad.TopY;

    while(!checkQuadOverlaps(playField)){
        playField.CurrentQuad.TopY++;
    }

    playField.CurrentQuad.ShadowTopY = playField.CurrentQuad.TopY;
    playField.CurrentQuad.TopY = tempTopY;

    if(playField.CurrentQuad.ShadowTopY > playField.CurrentQuad.TopY){
        playField.CurrentQuad.ShadowTopY--
    }


};

export class PlayField {
    public static readonly DefaultRowNumber = 24;
    public static readonly DefaultColumnNumber = 12;
    public Cells: Cell[][];
    public fallingTimer: number =0;

    public CurrentQuad: Quad;
    public readonly nextQuads: Quad[] =[];

    public replenishQuads() : void{
        while (this.nextQuads.length<=3){
            this.nextQuads.push(getRandomQuad(Math.floor(Math.random() * 100)));
        }
    }

    public nextQuad() : Quad{
        const nQuad: Quad = (() :Quad=> {
            let retval = this.nextQuads.shift();
            if(retval !== undefined){
                return retval;
            }else{
                throw "no next quad present!";
            }
        })();
        this.fallingTimer =0;
        this.replenishQuads();
        return nQuad;
    }

    constructor(){
        const TempCells: Cell[][] = new Array<Array<Cell>>();
        this.replenishQuads();
        this.CurrentQuad = this.nextQuad();
        for(let rowIndex = 0; rowIndex < PlayField.DefaultRowNumber; rowIndex++) {
            let currentRow: Array<Cell> = new Array<Cell>();
            for(let columnIndex = 0; columnIndex < PlayField.DefaultColumnNumber; columnIndex++){
                let currentCell = Cell.CellTemplate();
                let tcolor = currentCell.color;
                let tlanded = currentCell.landed;
                let toccupied = currentCell.occupied;
                let tspecialBlock = currentCell.specialBlock;
                let tVisible = false;
                if(columnIndex === 0 || columnIndex === 11 || rowIndex ===23){
                    toccupied = true;
                    tcolor = CELL_COLORS.Border;
                    tspecialBlock = true;
                    tVisible = true;
                }
                currentRow.push(new Cell(toccupied,tcolor,tlanded,tVisible,tspecialBlock,currentCell.opacity));
            }
            TempCells.push(currentRow);
        }
        this.Cells = TempCells;
    }
}



enum QUADTYPE {
    O = 0,
    L,
    I,
    Z,
    S,
    T,
    J
};

export const eraseRowsByIndex = function (playField: PlayField, rowIndexes: number[]) : void{
    for(let i = 0; i <  rowIndexes.length; i++) {
        let rowIndex = rowIndexes[i];
        for(let column =1; column < playField.Cells[rowIndex].length-1; column++){
            const cell: Cell = Cell.CellTemplate();
            cell.visible =false;
            playField.Cells[rowIndex][column] = cell;
        }
    }
};

export const stackNonEmptyRowsInPlayField = function (playField: PlayField): void {
    let emptyRows: Cell[][] = [];
    let nonEmptyRows: Cell[][] = [];
    
    for(let row = 0; row < playField.Cells.length; row++) {
        if(checkIfRowisEmpty(playField.Cells[row])){
            emptyRows.push(playField.Cells[row]);
        } else {
            nonEmptyRows.push(playField.Cells[row]);
        }
    }
    
    let rowIndex = playField.Cells.length -1;

    const UnWrapPop = function<T>(stack: Array<T>): T{
        const retVal: T | undefined = stack.pop();
        if (retVal !==undefined)
        {
            return retVal;
        }
        throw "The collection Pop operation has failed!";
    };
    
    while(nonEmptyRows.length > 0) {
        playField.Cells[rowIndex] =  UnWrapPop(nonEmptyRows);
        rowIndex--;
    }
    
    while(emptyRows.length > 0) {
        playField.Cells[rowIndex] = UnWrapPop(emptyRows);
        rowIndex--;
    }
    
};

const checkIfRowisEmpty = function (row: Cell[]): boolean {
    for (let column =1; column < row.length-1; column++){
        if(row[column].occupied || row[column].specialBlock){
            return false;
        }
    }
    return true;
};


export const getCompleteRowIndexes = function(playField: PlayField): number[] {
    const result: number[] = [];
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


const getRandomQuad = function(randomNumber: number): Quad {
    switch(randomNumber % 7){
        case 0:
            return Quad.create_O_Quad();
        
        case 1:
            return Quad.create_L_Quad();

        case 2:
            return Quad.create_J_Quad();

        case 3:
            return Quad.create_I_Quad();

        case 4:
            return Quad.create_S_Quad();

        case 5:
            return Quad.create_Z_Quad();

        default:
            return Quad.create_T_Quad();
    }
};

export class Quad {
    public readonly Cells: Cell[][];
    public readonly type: QUADTYPE;
    public TopX: number;
    public TopY: number;
    public ShadowTopY: number;

    constructor(Cells: Cell[][], type: QUADTYPE, TopX: number, TopY: number, ShadowTopY: number){
        this.Cells = Cells;
        this.type = type;
        this.TopX = TopX;
        this.TopY = TopY;
        this.ShadowTopY = ShadowTopY;
    }

    public static create_O_Quad(): Quad{
        const OOccupiedCell = (): Cell => Cell.OccupiedCell(CELL_COLORS.OColor);

        return new Quad([
            [Cell.EmptyCell(),OOccupiedCell(),OOccupiedCell(),Cell.EmptyCell()],
            [Cell.EmptyCell(),OOccupiedCell(),OOccupiedCell(),Cell.EmptyCell()],
            [Cell.EmptyCell(),Cell.EmptyCell(),Cell.EmptyCell(),Cell.EmptyCell()]
            ],QUADTYPE.O,4,0,0)
    }

    public static create_L_Quad(): Quad {
        const LOccupiedCell = () : Cell => Cell.OccupiedCell(CELL_COLORS.LColor);
        return new Quad([
            [Cell.EmptyCell(),    Cell.EmptyCell(),    LOccupiedCell()],
            [LOccupiedCell(), LOccupiedCell(), LOccupiedCell()],
            [Cell.EmptyCell(),    Cell.EmptyCell(),    Cell.EmptyCell()]
            ],QUADTYPE.L,5,0,0);
    }

    public static create_J_Quad(): Quad {
        const JOccupiedCell = () : Cell => Cell.OccupiedCell(CELL_COLORS.JColor);
        return new Quad([
            [JOccupiedCell(),Cell.EmptyCell(),Cell.EmptyCell()],
            [JOccupiedCell(),JOccupiedCell(),JOccupiedCell()],
            [Cell.EmptyCell(),Cell.EmptyCell(),Cell.EmptyCell()]
            ],QUADTYPE.J,5,0,0);
    }

    public static create_I_Quad(): Quad {
        const IOccupiedCell = () : Cell => Cell.OccupiedCell(CELL_COLORS.IColor);
        return new Quad([
            [Cell.EmptyCell(),Cell.EmptyCell(),Cell.EmptyCell(),Cell.EmptyCell()],
            [IOccupiedCell(),IOccupiedCell(),IOccupiedCell(),IOccupiedCell()],
            [Cell.EmptyCell(),Cell.EmptyCell(),Cell.EmptyCell(),Cell.EmptyCell()],
            [Cell.EmptyCell(),Cell.EmptyCell(),Cell.EmptyCell(),Cell.EmptyCell()]
            ],QUADTYPE.I,4,0,0);
    }


    public static create_S_Quad(): Quad {
        const SOccupiedCell = () : Cell => Cell.OccupiedCell(CELL_COLORS.SColor);
        
        return new Quad([
            [Cell.EmptyCell(),    SOccupiedCell(), SOccupiedCell()],
            [SOccupiedCell(), SOccupiedCell(), Cell.EmptyCell()],
            [Cell.EmptyCell(),    Cell.EmptyCell(),    Cell.EmptyCell()]
            ],QUADTYPE.S,5,0,0);
    }

    public static create_Z_Quad(): Quad {
        const ZOccupiedCell = () : Cell => Cell.OccupiedCell(CELL_COLORS.ZColor);
        return new Quad([
            [ZOccupiedCell(), ZOccupiedCell(),Cell.EmptyCell()],
            [Cell.EmptyCell(),    ZOccupiedCell(),ZOccupiedCell()],
            [Cell.EmptyCell(),    Cell.EmptyCell(),Cell.EmptyCell()]
            ],QUADTYPE.Z,5,0,0);
    }

    public static create_T_Quad(): Quad {     
        const TOccupiedCell = () : Cell => Cell.OccupiedCell(CELL_COLORS.TColor);
        return new Quad([
                [Cell.EmptyCell(),    TOccupiedCell(),Cell.EmptyCell()],
                [TOccupiedCell(), TOccupiedCell(),TOccupiedCell()],
                [Cell.EmptyCell(),    Cell.EmptyCell(),Cell.EmptyCell()]
                ],QUADTYPE.T,5,0,0);
    }   

    public rotateQuad(rotateBack: boolean): void {
        if(QUADTYPE.O !== this.type){
            this.rotateMatrix(rotateBack);
        }
    
    };

    public rotateMatrix(rotateBack: boolean): void {
        if(null === rotationArray){
            rotationArray = initRotationArray();
        }
        resetRotataionArray();
        for(let row = 0; row < this.Cells.length; row++) {
            for(let column =0; column < this.Cells[row].length; column++) {
                let rotationRow = column;
                let rotationColumn = (this.Cells.length -1) -row;
                if(rotateBack){
                    rotationRow = (this.Cells[row].length -1) -column;
                    rotationColumn = row;
                }else {
                    rotationRow = column;
                    rotationColumn = (this.Cells.length -1) -row;
                }
                
                if(rotationArray !==null)
                {
                    rotationArray[rotationRow][rotationColumn] = this.Cells[row][column];
                }
            }
        }
        
        // write back the array
        for(let row = 0; row < this.Cells.length; row++){
            for(let column = 0; column < this.Cells[row].length; column++) {
                this.Cells[row][column] = rotationArray[row][column];
            }
        }
    };
}

export const checkQuadOverlaps = function(playField: PlayField): boolean {
        
        for(let quadRow =0; quadRow < playField.CurrentQuad.Cells.length; quadRow++){
            for(let quadColumn =0; quadColumn < playField.CurrentQuad.Cells[quadRow].length; quadColumn++){
                
                // checks if quad is occupied here:
                if(playField.CurrentQuad.Cells[quadRow][quadColumn].occupied){
                    // then check if it overlaps:
                    let playfieldrow = playField.CurrentQuad.TopY + quadRow;
                    let playfieldcolumn = playField.CurrentQuad.TopX + quadColumn;
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
}

// this will land the quad onto the playfield, after that,
// the quad will be merged with the playfield and its occupied cells
// will be part of it. This function does not check if the quad overlaps,
// or is adjacent to other quad which are already landed.
export const landQuad = function(playField: PlayField): void{
    for(let row = 0; row < playField.CurrentQuad.Cells.length; row++){
        for(let column = 0; column < playField.CurrentQuad.Cells[row].length; column++){
            // transfer the quad cells onto the playfield:
            let currentCell = playField.CurrentQuad.Cells[row][column];
            if(currentCell.occupied){
               currentCell.landed = true;
               playField.Cells[playField.CurrentQuad.TopY + row][playField.CurrentQuad.TopX + column] = currentCell;
            }
            
        }
    }
};

export const calculateScore =function(eliminatedRowNumber: number): number {
    // 10 base score for each row eliminated, time bonus
    return (Math.pow(eliminatedRowNumber,2) *10);
};