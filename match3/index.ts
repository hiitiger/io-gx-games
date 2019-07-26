const canvas = document.getElementById('match3') as HTMLCanvasElement;
const context = canvas.getContext('2d');
const state = document.getElementById('state') as HTMLDivElement;

function loadImage(url): Promise<HTMLImageElement> {
    return new Promise(resolve => {
        const image = new Image();
        image.addEventListener('load', () => {
            resolve(image)
        });
        image.src = url;
    });
}


class SpriteSheet {
    image: HTMLImageElement
    width: number
    height: number
    tiles: Map<string, HTMLCanvasElement>

    constructor(image, width, height) {
        this.image = image;
        this.width = width;
        this.height = height;
        this.tiles = new Map<string, HTMLCanvasElement>();
    }

    define(name: string, x: number, y: number, width: number, height: number) {
        const buffer = document.createElement('canvas');
        buffer.width = width;
        buffer.height = height;
        const context = buffer.getContext('2d');

        context.drawImage(this.image, x, y, width, height,
            0, 0, width, height);
        this.tiles.set(name, buffer);
    }

    defineTile(name, x, y) {
        this.define(name, x * this.width, y * this.height, this.width, this.height);
    }

    draw(name: string, context: CanvasRenderingContext2D, x: number, y: number) {
        const buffer = this.tiles.get(name);
        context.drawImage(buffer, x, y);
    }

    drawTile(name: string, context: CanvasRenderingContext2D, x: number, y: number) {
        const buffer = this.tiles.get(name)[0];
        context.drawImage(buffer, x * this.width, y * this.width);
    }
}

interface Gem {
    x: number
    y: number
    row: number
    col: number
    type: number
    match: number
    alpha: number
}

class MatchGame {
    boxSize: number
    boxTypes: 7
    boxNumber: 8
    sprites: SpriteSheet
    gems: Array<Array<Gem>>

    isDeleting: boolean
    isMoving: boolean
    isSwap: boolean

    clickCount: number;
    clickPos: { x: number, y: number }
    firstCol: number
    firstRow: number
    secondCol: number
    secondRow: number
    hasMatch: boolean

    gameScore: number
    matchCounter: number

    constructor() {
        this.sprites = null;
        this.boxSize = 50;
        this.boxNumber = 8;
        this.gems = new Array<Array<Gem>>();

        this.boxTypes = 7;

        const gemsNumber = this.boxNumber + 2;
        for (let i = 0; i < gemsNumber; ++i) {
            this.gems.push(new Array<Gem>());
            for (let j = 0; j < gemsNumber; ++j) {
                this.gems[i].push({
                    x: 0, y: 0,
                    row: i, col: j,
                    match: 0,
                    type: -1,
                    alpha: 1,
                })
            }
        }

        this.isDeleting = false;
        this.isMoving = false;
        this.isSwap = false;
        this.clickCount = 0;
        this.clickPos = { x: 0, y: 0 };
        this.firstCol = 0;
        this.firstRow = 0;
        this.secondCol = 0;
        this.secondRow = 0;
        this.hasMatch = false;
        this.gameScore = 0;
        this.matchCounter = 0;

        this.onMouseDown = this.onMouseDown.bind(this);
        canvas.addEventListener('mousedown', this.onMouseDown);
    }

    async load() {
        const tileSize = 49;
        const gemsImage = await loadImage('./img/gems.png');
        this.sprites = new SpriteSheet(gemsImage, tileSize, tileSize);
        for (let i = 0; i < this.boxTypes; ++i) {
            this.sprites.define(`gem${i}`, i * tileSize, 0, tileSize, tileSize);
        }
    }

    restartGame() {
        for (let i = 1; i <= this.boxNumber; ++i) {
            for (let j = 1; j <= this.boxNumber; ++j) {
                this.gems[i][j].type = Math.floor(Math.random() * (this.boxTypes));
            }
        }
        this.isDeleting = false;
        this.isMoving = false;
        this.isSwap = false;
        this.clickCount = 0;
        this.clickPos = { x: 0, y: 0 };
        this.firstCol = 0;
        this.firstRow = 0;
        this.secondCol = 0;
        this.secondRow = 0;
        this.hasMatch = false;
        this.gameScore = 0;
        this.matchCounter = 0;
    }

    swapGem(row1: number, col1: number, row2: number, col2: number) {
        const p1 = this.gems[row1][col1];
        const p2 = this.gems[row2][col2];
        [p2.row, p2.col, p1.row, p1.col] = [p1.row, p1.col, p2.row, p2.col];

        this.gems[row1][col1] = this.gems[row2][col2];
        this.gems[row2][col2] = p1;
    }

    swapIfClick() {

        if (!this.isSwap && !this.isMoving) {
            if (this.clickPos.x != 0 && this.clickPos.y != 0){
                this.clickCount += 1;
                if (this.clickCount == 1) {
                    this.firstCol = Math.floor(this.clickPos.x / this.boxSize) + 1;
                    this.firstRow = Math.floor(this.clickPos.y / this.boxSize) + 1;
                }
                else if (this.clickCount == 2) {
                    this.secondCol = Math.floor(this.clickPos.x / this.boxSize) + 1;
                    this.secondRow = Math.floor(this.clickPos.y / this.boxSize) + 1;
                    if (Math.abs(this.firstCol - this.secondCol) + Math.abs(this.firstRow - this.secondRow) == 1) {
                        this.swapGem(this.firstRow, this.firstCol, this.secondRow, this.secondCol);
                        this.isSwap = true;
                        this.clickCount = 0;
                        this.matchCounter = 0;
                    }
                    else {
                        this.clickCount = 1;
                    }
                }
            }
        }

        if (this.isMoving || this.isDeleting) {
            this.clickCount = 0;
        }

        this.clickPos.x = 0;
        this.clickPos.y = 0;
    }

    moveGems() {
        if (!this.isDeleting) {
            this.isMoving = false;
            for (let i = 1; i <= this.boxNumber; ++i) {
                for (let j = 1; j <= this.boxNumber; ++j) {
                    const gem = this.gems[i][j];
                    let dx = 0, dy = 0;
                    for (let n = 0; n < 4; ++n) {
                        dx = gem.col * this.boxSize - gem.x;
                        dy = gem.row * this.boxSize - gem.y;
                        if (dx) {
                            gem.x += dx / Math.abs(dx);
                        }
                        if (dy) {
                            gem.y += dy / Math.abs(dy);
                        }
                        if (dx || dy) {
                            this.isMoving = true;
                        }
                    }
                }
            }
        }
    }

    checkMatch() {
        if (!this.isMoving && !this.isDeleting) {
            this.hasMatch = false;
            for (let i = 1; i <= this.boxNumber; ++i) {
                for (let j = 1; j <= this.boxNumber; ++j) {
                    if (this.gems[i][j].type === this.gems[i + 1][j].type
                        && this.gems[i][j].type === this.gems[i - 1][j].type) {
                        this.gems[i][j].match += 1;
                        this.gems[i + 1][j].match += 1;
                        this.gems[i - 1][j].match += 1;
                        this.hasMatch = true;
                    }
                    if (this.gems[i][j].type === this.gems[i][j + 1].type
                        && this.gems[i][j].type === this.gems[i][j - 1].type) {
                        this.gems[i][j].match += 1;
                        this.gems[i][j + 1].match += 1;
                        this.gems[i][j - 1].match += 1;
                        this.hasMatch = true;
                    }
                }
            }

            if (this.hasMatch) {
                this.matchCounter += 1;
                for (let i = 1; i <= this.boxNumber; ++i) {
                    for (let j = 1; j <= this.boxNumber; ++j) {
                        if (this.gems[i][j].match > 0) {
                            this.gameScore += 10 * this.matchCounter;
                        }
                    }
                }
            }
        }
    }

    swapbackIfNomatch() {
        if (this.isSwap && !this.isMoving) {
            if (!this.hasMatch) {
                this.swapGem(this.firstRow, this.firstCol, this.secondRow, this.secondCol);
            }
            this.isSwap = false;
        }
    }

    deleteIfMatch() {
        this.isDeleting = false;
        if (!this.isMoving && this.hasMatch) {
            for (let i = 1; i <= this.boxNumber; ++i) {
                for (let j = 1; j <= this.boxNumber; ++j) {
                    if (this.gems[i][j].match > 0) {
                        if (this.gems[i][j].alpha > 0.1) {
                            this.gems[i][j].alpha *= 0.9;
                            this.isDeleting = true;
                        }
                    }
                }
            }
        }
    }

    updateIfMatch() {
        if (!this.isMoving && !this.isDeleting) {
            for (let i = this.boxNumber; i >= 1; --i) {
                for (let j = 1; j <= this.boxNumber; ++j) {
                    if (this.gems[i][j].match > 0) {
                        for (let n = i; n >= 1; --n) {
                            if (this.gems[n][j].match === 0) {
                                this.swapGem(n, j, i, j);
                                break;
                            }
                        }
                    }
                }
            }

            for (let col = 1; col <= this.boxNumber; ++col) {
                let n = 0;
                for (let row = this.boxNumber; row >= 1; --row) {
                    if (this.gems[row][col].match) {
                        this.gems[row][col].y = - this.boxSize * n++;
                        this.gems[row][col].alpha = 1;
                        this.gems[row][col].match = 0;
                        this.gems[row][col].type = Math.floor(Math.random() * (this.boxTypes));
                        if (this.gems[row][col].type === -1) {
                            debugger;
                        }
                    }
                }
            }
        }
    }


    drawGame() {
        state.innerHTML = `score: ${this.gameScore}`
        this.drawCanvas();
        this.drawGems();
    }

    drawCanvas() {
        const gemsNumber = this.boxNumber + 2;

        context.fillStyle = '#F0F4F0'
        context.fillRect(0, 0, gemsNumber * this.boxSize, gemsNumber * this.boxSize);
        for (let i = 0; i < gemsNumber; ++i) {
            for (let j = 0; j < gemsNumber; ++j) {
                if ((i % 2 == 0 && j % 2 == 1)
                    || (i % 2 == 1 && j % 2 == 0)) {
                    context.fillStyle = '#858A85'
                    context.fillRect(j * this.boxSize, i * this.boxSize, this.boxSize, this.boxSize);
                }
            }
        }

        if (this.clickCount == 1 && this.firstCol > 0 && this.firstRow > 0) {
            context.fillStyle = 'red';
            context.fillRect(this.firstCol * this.boxSize - this.boxSize,
                this.firstRow * this.boxSize - this.boxSize,
                this.boxSize, this.boxSize);
        }

    }


    drawGems() {
        for (let i = 1; i <= this.boxNumber; ++i) {
            for (let j = 1; j <= this.boxNumber; ++j) {
                const gem = this.gems[i][j];
                const type = gem.type;
                const x = gem.x;
                const y = gem.y;
                const spriteName = `gem${type}`;

                context.save();
                context.globalAlpha = gem.alpha;
                this.sprites.draw(spriteName, context, x - this.boxSize, y - this.boxSize);
                context.restore();
            }
        }
    }

    update(time = 0) {
        this.swapIfClick();
        this.moveGems();
        this.checkMatch();
        this.swapbackIfNomatch();
        this.deleteIfMatch();
        this.updateIfMatch();

        this.drawGame();
        requestAnimationFrame(this.update.bind(this))
    }

    onMouseDown(e: MouseEvent) {
        if (e.buttons == 1) {
            this.clickPos = { x: e.offsetX, y: e.offsetY };
        }
    }
}

const matchGame = new MatchGame();
matchGame.load().then(() => {
    matchGame.restartGame();
    matchGame.update();
});

