
export interface Point {
    x: number
    y: number
}

export class SpriteSheet {
    image: HTMLImageElement
    width: number
    height: number
    tiles: Map<string, HTMLCanvasElement[]>
    animations: Map<string, (distance: any) => string>

    constructor(image, width, height) {
        this.image = image;
        this.width = width;
        this.height = height;
        this.tiles = new Map<string, HTMLCanvasElement[]>();
        this.animations = new Map<string, (distance: any) => string>();
    }

    defineAnimation(name: string, animation: (distance: any) => string) {
        this.animations.set(name, animation);
    }

    define(name: string, x: number, y: number, width: number, height: number) {
        const buffers = [false, true].map(flip => {
            const buffer = document.createElement('canvas');
            buffer.width = width;
            buffer.height = height;

            const context = buffer.getContext('2d');

            if (flip) {
                context.scale(-1, 1);
                context.translate(-width, 0)
            }
            context.drawImage(this.image, x, y, width, height,
                0, 0, width, height);

            return buffer;
        })

        this.tiles.set(name, buffers);
    }

    defineTile(name, x, y) {
        this.define(name, x * this.width, y * this.height, this.width, this.height);
    }

    draw(name: string, context: CanvasRenderingContext2D, x: number, y: number, flip = false) {
        const buffer = this.tiles.get(name)[flip ? 1 : 0];
        context.drawImage(buffer, x, y);
    }

    drawTile(name: string, context: CanvasRenderingContext2D, x: number, y: number) {
        const buffer = this.tiles.get(name)[0];
        context.drawImage(buffer, x * this.width, y * this.width);
    }

    drawAni(name: string, context: CanvasRenderingContext2D, x: number, y: number, distance) {
        const animation = this.animations.get(name)
        this.drawTile(animation(distance), context, x, y);
    }
}