const canvas = document.getElementById('tetris') as HTMLCanvasElement;
const context = canvas.getContext('2d');
const state = document.getElementById('state') as HTMLDivElement;

const boxSize = 20;
const boardWidth = 12;
const boardHeight = 20;
let gameScore = 0;

let paused = true;
let speedLevel = 1;
let lastTime = 0;
let delayTime = 0;
let dropDelay = 1000;

let isErasingRow = false;
const erasingDelay = 1000;


function createNewShape() {
    const index = Math.floor(Math.random() * 7 ) ;

    const shapes = [
        {
            name: "square",
            color: "#FF5733",
            matrix: [
                [1, 1],
                [1, 1]
            ]
        },
        {
            name: "Z",
            color: "#DCC770",
            matrix: [
                [2, 2, 0],
                [0, 2, 2],
                [0, 0, 0]
            ]
        },
        {
            name: "S",
            color: "#A4DC70",
            matrix: [
                [0, 3, 3],
                [3, 3, 0],
                [0, 0, 0]
            ]
        },
        {
            name: "L",
            color: "#81CFCF",
            matrix: [
                [0, 4, 0],
                [0, 4, 0],
                [0, 4, 4]
            ]
        },
        {
            name: "J",
            color: "#81A0CF",
            matrix: [
                [0, 5, 0],
                [0, 5, 0],
                [5, 5, 0]
            ]
        },
        {
            name: "T",
            color: "#87847B",
            matrix: [
                [0, 0, 0],
                [6, 6, 6],
                [0, 6, 0]
            ]
        },
        {
            name: "I",
            color: "#A081CF",
            matrix: [
                [0, 0, 0, 0],
                [7, 7, 7, 7],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ]
        }
    ]

    return shapes[index];
}

class ShapeActor {
    pos: { x: number, y: number }
    color: string
    shape: Array<Array<number>>
    shapeName: string

    constructor() {
        this.pos = { x: 0, y: 0 }
        this.color = "",
            this.shape = new Array<Array<number>>()
        this.shapeName = ""
        this.reset()
    }

    reset() {
        const shape = createNewShape()
        this.pos.x = Math.floor(boardWidth / 2 - shape.matrix.length / 2);
        this.pos.y = 0;
        this.shape = shape.matrix
        this.shapeName = shape.name
        this.color = shape.color
    }
}

class TetirsGame {
    width: number
    height: number
    board: Array<Array<{ value: number, color: string }>>
    shapeActor: ShapeActor
    constructor(w: number, h: number) {
        this.width = w;
        this.height = h;
        this.board = new Array<Array<{ value: number, color: string }>>();
        this.shapeActor = new ShapeActor();
        this.resetBoard()

        canvas.addEventListener('keydown', this.onKeydown.bind(this));
        canvas.addEventListener('blur', this.pause.bind(this));
        canvas.addEventListener('focus', this.start.bind(this));
    }

    restartGame() {
        gameScore = 0;
        speedLevel = 0;
        delayTime = 0;
        dropDelay = 1000;

        this.resetBoard();
        this.shapeActor.reset();
    }

    resetBoard() {
        for (let i = 0; i != this.height; ++i) {
            this.board[i] = new Array<{ value: number, color: string }>();
            for (let j = 0; j != this.width; ++j) {
                this.board[i][j] = { value: 0, color: "" };
            }
        }
    }

    calcFilledRow() {
        const filledRows = new Array<number>();
        for (let y = this.height - 1; y >= 0; --y) {
            let isFilledRow = true;
            for (let x = 0; x < this.width; ++x) {
                if (arena.board[y][x].value === 0) {
                    isFilledRow = false;
                    break
                }
            }
            if (isFilledRow) {
                filledRows.push(y);
                const row = this.board[y];
                row.fill({ value: -1, color: "#D8A3AF" });
            }
        }
        return filledRows;
    }

    eraseFilledRow() {
        let filledRow = 1;
        for (let y = this.height - 1; y >= 0; --y) {
            let isFilledRow = this.board[y][0].value === -1;

            if (isFilledRow) {
                const row = this.board.splice(y, 1)[0]
                row.fill({ value: 0, color: "" })
                this.board.unshift(row)

                ++y;

                filledRow *= 2;
                gameScore += filledRow * 10;
            }
        }
    }

    flashFilledRow() {
        for (let y = this.height - 1; y >= 0; --y) {
            let isFilledRow = this.board[y][0].value === -1;

            if (isFilledRow) {
                let newColor = this.board[y][0].color;
                if (newColor !== '') {
                    newColor = ''
                }
                else {
                    newColor = '#c2eebe'
                }
                const row = this.board[y]
                row.fill({ value: -1, color: newColor })
            }
        }
    }




    drawCanvas() {
        context.fillStyle = 'black';
        context.fillRect(0, 0, boxSize * arena.width, boxSize * arena.height)

        context.strokeStyle = '#353535'
        for (let x = 0; x < boardWidth; ++x) {
            context.beginPath();
            context.moveTo(x * boxSize, 0);
            context.lineTo(x * boxSize, boardHeight * boxSize);
            context.stroke();
        }


        for (let y = 0; y < boardHeight; ++y) {
            context.beginPath();
            context.moveTo(0, y * boxSize);
            context.lineTo(boardWidth * boxSize, y * boxSize);
            context.stroke();
        }
    }

    drawShape() {
        context.fillStyle = this.shapeActor.color;
        const shape = this.shapeActor.shape;
        shape.forEach((rowArray, y) => {
            rowArray.forEach((value, x) => {
                const posX = (this.shapeActor.pos.x + x) * boxSize
                const posY = (this.shapeActor.pos.y + y) * boxSize
                if (value != 0) {
                    context.fillRect(posX + 1, posY + 1, boxSize - 2, boxSize - 2)
                }
            });
        });
    }

    drawBoard() {
        this.board.forEach((rowArray, y) => {
            rowArray.forEach((value, x) => {
                const posX = (x) * boxSize
                const posY = (y) * boxSize
                if (value.value != 0) {
                    context.fillStyle = value.color;
                    context.fillRect(posX + 1, posY + 1, boxSize - 2, boxSize - 2)
                }
            });
        });
    }

    rotateMatrix(matrix: Array<Array<any>>, dir: number) {
        const Size = matrix.length;
        for (let x = 0; x < Size; ++x) {
            for (let y = 0; y < x; ++y) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]]
            }
        }
        if (dir > 0)
            matrix.forEach(rowArray => rowArray.reverse());
        else
            matrix.reverse();
    }

    rotateShape(dir: number) {
        const pos = this.shapeActor.pos.x
        let offset = 0;
        this.rotateMatrix(this.shapeActor.shape, dir)
        while (this.collide()) {
            if (offset > this.shapeActor.shape.length) {
                this.rotateMatrix(this.shapeActor.shape, -dir)
                this.shapeActor.pos.x = pos;
                break;
            }
            this.shapeActor.pos.x += offset;
            offset = (Math.abs(offset) + 1) * (offset > 0 ? -1 : 1)
        }
    }

    collide() {
        for (let y = this.shapeActor.shape.length - 1; y >= 0; --y) {
            for (let x = 0; x < this.shapeActor.shape[y].length; ++x) {
                const posX = (this.shapeActor.pos.x + x);
                const posY = (this.shapeActor.pos.y + y);
                if (this.shapeActor.shape[y][x] !== 0) {
                    if (this.board[posY] && this.board[posY][posX]
                        && this.board[posY][posX].value !== 0) {
                        return true;
                    }
                    else if (posX < 0 || posX >= this.width
                        || posY >= this.height) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    merge() {
        this.shapeActor.shape.forEach((rowArray, y) => {
            rowArray.forEach((value, x) => {

                const posX = (this.shapeActor.pos.x + x);
                const posY = (this.shapeActor.pos.y + y);
                if (value !== 0) {
                    this.board[posY][posX] = {
                        value: value,
                        color: this.shapeActor.color
                    }
                }
            })
        })
    }

    dropShape() {
        this.shapeActor.pos.y += 1;

        if (this.collide()) {
            this.shapeActor.pos.y -= 1;
            this.merge();

            this.shapeActor.reset();
            if (this.collide()) {
                this.restartGame();
            }
        }
    }

    moveShape(dir: number) {
        this.shapeActor.pos.x += dir;
        if (this.collide()) {
            this.shapeActor.pos.x -= dir;
        }
    }

    dropDownShape() {
        do {
            this.shapeActor.pos.y += 1;
            if (this.collide()) {
                this.shapeActor.pos.y -= 1;
                this.merge();
                this.shapeActor.reset();
                if (this.collide()) {
                    this.restartGame();
                }
                break;
            }
        } while (true)
    }


    pause() {
        paused = true;
    }

    start() {
        paused = false;
    }

    updateScoreAndSpeed() {
        if (gameScore >= 100 && gameScore < 300) {
            speedLevel = 2;
            dropDelay = 800
        }
        else if (gameScore >= 300 && gameScore < 500) {
            speedLevel = 3;
            dropDelay = 600
        }
        else if (gameScore >= 500 && gameScore < 1000) {
            speedLevel = 4;
            dropDelay = 400
        }
        else if (gameScore >= 1000 && gameScore < 3000) {
            speedLevel = 5;
            dropDelay = 300
        }
        else if (gameScore >= 3000) {
            speedLevel = 6;
            dropDelay = 200
        }

        state.innerHTML = paused ? 'paused ' : '' + `speed: ${speedLevel}, score: ${gameScore}`
    }

    update(time = 0) {
        const deltaTime = time - lastTime;
        lastTime = time;
        if (!paused) {
            if (isErasingRow) {
                delayTime += deltaTime;
                arena.flashFilledRow();
                if (delayTime > erasingDelay) {
                    arena.eraseFilledRow();
                    delayTime = 0;
                    isErasingRow = false;
                }
            }
            else {
                delayTime += deltaTime;
                if (delayTime > dropDelay) {
                    this.dropShape();
                    delayTime = delayTime - dropDelay;
                }
                const filledRows = arena.calcFilledRow();
                if (filledRows.length > 0) {
                    isErasingRow = true;
                    delayTime = 0;
                }
            }

        }

        this.updateScoreAndSpeed();
        this.drawCanvas();
        this.drawBoard();
        this.drawShape();
        requestAnimationFrame(this.update.bind(this));
    }

    onKeydown(event: KeyboardEvent){
        if (paused || isErasingRow) {
            return
        }
    
        if (event.code == 'KeyD') {
            this.moveShape(1)
        }
        else if (event.code == 'KeyA') {
            this.moveShape(-1)
        }
        else if (event.code == 'KeyS') {
            this.dropShape();
        }
        else if (event.code == 'KeyW') {
            this.rotateShape(1)
        }
        else if (event.code == 'KeyR') {
            this.rotateShape(-1)
        }
        else if (event.code == 'Space') {
            this.dropDownShape()
        }
    }
}


const arena = new TetirsGame(12, 20);
arena.restartGame();
arena.update();