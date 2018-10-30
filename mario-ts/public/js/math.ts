

export class Matrix<T> {
    grid: Array<Array<T>>

    constructor() {
        this.grid = []
    }

    forEach(callback){
        this.grid.forEach((column, x) => {
            column.forEach((value, y)=>{
                callback(value, x, y);
            })
        });
    }

    get(x: number, y: number): T|undefined {
        const col = this.grid[x];
        if (col) {
            return col[y];
        }
        return undefined;
    }

    set(x: number, y: number, value: T) {
        if (!this.grid[x]) {
            this.grid[x] = []
        }
        this.grid[x][y] = value;
    }
}

export class Vec2 {
    x: number
    y: number
    constructor(x: number, y: number) {
        this.set(x, y)
    }

    set(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

