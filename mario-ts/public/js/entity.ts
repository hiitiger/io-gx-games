import { Vec2 } from "./math.js";
import { BoundingBox } from "./boundingbox.js";
import { Level } from "./level.js";

export const Sides = {
  LEFT: Symbol("Left"),
  RIGHT: Symbol("Right"),
  TOP: Symbol("Top"),
  BOTTOM: Symbol("Bottom")
};

export class EntityTrait {
  NAME: string;
  tasks: Array<Function>;
  constructor(n: string) {
    this.NAME = n;
    this.tasks = new Array<Function>();
  }

  finalize() {
    this.tasks.forEach(task => task());
    this.tasks.length = 0;
  }

  queue(task: Function) {
    this.tasks.push(task);
  }

  update(entity: Entity, deltaTime: number, level: Level) {}
  obstruct(entity: Entity, side: Symbol, match: TilePropEx) {}

  collides(us: Entity, them: Entity) {}
}

export class Entity {
  pos: Vec2;
  vel: Vec2;
  size: Vec2;
  offset: Vec2;
  bounds: BoundingBox;
  lifeTime: number;
  collision: boolean[];
  traits: Array<EntityTrait>;

  canCollide: boolean;

  constructor() {
    this.pos = new Vec2(0, 0);
    this.vel = new Vec2(0, 0);
    this.size = new Vec2(0, 0);
    this.offset = new Vec2(0, 0);
    this.bounds = new BoundingBox(this.pos, this.size, this.offset);
    this.lifeTime = 0;
    this.traits = new Array<EntityTrait>();
    this.collision = [false, false, false, false]; //left, right, top, bottom

    this.canCollide = true;
  }

  addTraits(trait) {
    this.traits.push(trait);
    this[trait.NAME] = trait;
  }

  collides(candidate: Entity) {
    this.traits.forEach(trait => {
      trait.collides(this, candidate);
    });
  }

  obstruct(side: Symbol, match: TilePropEx) {
    this.traits.forEach(trait => {
      trait.obstruct(this, side, match);
    });
  }

  update(deltaTime: number, level: Level) {
    this.lifeTime += deltaTime;
    this.traits.forEach(trait => {
      trait.update(this, deltaTime, level);
    });
  }

  draw(context: CanvasRenderingContext2D): void {}

  finalize() {
    this.traits.forEach(trait => trait.finalize());
  }
}

export interface TileProp {
  name: string;
  type: string;
}

export interface TilePropEx {
  tile: TileProp;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

export interface Tile {
  name: string;
  type: string;
  ranges?: Array<Array<number>>;
  pattern?: any;
}
