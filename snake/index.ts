const canvas = document.getElementById('snake') as HTMLCanvasElement;
const context = canvas.getContext('2d');
const state = document.getElementById('state') as HTMLDivElement;

const boxSize = 20;
const boardWidth = 20;
const boardHeight = 20;

enum Direction {
    Up = 1,
    Down,
    Left,
    Right,
}

class Snake {
    timerId: number
    direction: Direction

    food: { x: number, y: number }
    snake: Array<{ x: number, y: number }>

    keyDown: string
    keyMap: Map<string, Direction>

    score: number
    paused: boolean

    lastTime: number
    delayTime: number
    moveDelay: number

    constructor() {
        this.direction = 1 + Math.random() * 3 | 0;
        this.snake = new Array<{ x: number, y: number }>();
        this.keyDown = '';
        this.keyMap = new Map<string, Direction>([
            ['KeyW', Direction.Up],
            ['KeyS', Direction.Down],
            ['KeyA', Direction.Left],
            ['KeyD', Direction.Right]
        ]);
        this.score = 0;
        this.paused = true
        this.lastTime = 0;
        this.delayTime = 0;
        this.moveDelay = 200;

        this.update = this.update.bind(this);
        this.onKeyDown =  this.onKeyDown.bind(this);
        this.pause =  this.pause.bind(this);
        this.start =  this.start.bind(this);
        canvas.addEventListener('keydown', this.onKeyDown);
        canvas.addEventListener('blur', this.pause);
        canvas.addEventListener('focus',this.start);
    }

    pause() {
        this.paused = true;
    }

    start() {
        this.paused = false;
    }

    restartGame() {
        this.keyDown = ''
        this.direction = 1 + Math.random() * 3 | 0;
        this.snake = []
        this.score = 0
        this.initSnake()
        this.updateFood();
        this.drawGame();
    }


    initSnake() {
        let initLen = 5;
        let body = {
            x: initLen + (Math.random() * (boardWidth)) | 0,
            y: initLen + (Math.random() * (boardHeight)) | 0
        }
        while (initLen-- > 0)
            this.snake.push(body);
    }

    updateGame() {
        const direction = this.keyMap.get(this.keyDown);
        this.keyDown = '';
        if (direction != undefined) {
            this.direction = direction
        }
        const newHead = {
            x: this.snake[0].x,
            y: this.snake[0].y
        }
        switch (this.direction) {
            case Direction.Up:
                newHead.y -= 1;
                break;
            case Direction.Down:
                newHead.y += 1;
                break;
            case Direction.Left:
                newHead.x -= 1;
                break;
            case Direction.Right:
                newHead.x += 1;
                break;
        }


        if (newHead.x < 0) newHead.x = boardWidth - 1;
        if (newHead.x >= boardWidth) newHead.x = 0;
        if (newHead.y < 0) newHead.y = boardHeight - 1;
        if (newHead.y >= boardHeight) newHead.y = 0;


        if (this.collision(newHead.x, newHead.y)) {
            // this.restartGame();
            this.snake.pop();
            this.score -= 10;
            return;
        }

        const tail = this.snake.pop() as { x: number, y: number };
        this.snake.unshift(newHead);
        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this.snake.push(tail);
            this.updateFood();
            this.score += 10;
        }

    }

    update(time = 0) {
        const delteTime = time - this.lastTime;
        this.lastTime = time;

        if (!this.paused) {

            const direction = this.keyMap.get(this.keyDown);
            if (direction == this.direction) {
                this.moveDelay = 50;
            }
            else {
                this.moveDelay = 200;
            }

            this.delayTime += delteTime;
            if (this.delayTime > this.moveDelay) {
                this.updateGame();
                this.delayTime = 0;
            }
        }

        this.drawGame();

        requestAnimationFrame(this.update);
    }

    collision(nx: number, ny: number) {
        if (nx < 0 || nx >= boardWidth || ny < 0 || ny >= boardHeight) {
            return true;
        }
        else if (this.snake.find((i) => i.x == nx && i.y == ny)) {
            return true;
        }
        return false;
    }

    drawGame() {
        state.innerHTML = this.paused ? 'paused ' : '' + `score: ${this.score}`
        this.drawCanvas();
        this.drawSnake();
        this.drawFood();
    }

    updateFood() {
        let nx: number;
        let ny: number;
        do {
            nx = Math.random() * boardWidth! | 0,
                ny = Math.random() * boardHeight | 0
        } while (this.snake.find((i) => i.x == nx && i.y == ny));
        this.food = { x: nx, y: ny };
    }

    drawCanvas() {
        context.fillStyle = "black";
        context.fillRect(0, 0, boardWidth * boxSize, boardHeight * boxSize);
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

    drawSnake() {
        let head = true
        for (const body of this.snake) {
            this.drawCell(body.x, body.y, head ? '#54C056' : '#494646');
            head = false
        }
    }

    drawFood() {
        this.drawCell(this.food.x, this.food.y, '#FF554A');
    }

    drawCell(x: number, y: number, color: string) {
        context.fillStyle = color;
        context.fillRect(x * boxSize + 1, y * boxSize + 1, boxSize - 2, boxSize - 2)
    };

    onKeyDown(e: KeyboardEvent){
        this.keyDown = e.code
        console.log(e.code);
    }
}

const snake = new Snake();
snake.restartGame();
snake.update();