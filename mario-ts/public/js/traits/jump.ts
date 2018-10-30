import { Sides, EntityTrait, Entity } from "../entity.js";

export class Jump extends EntityTrait {
  NAME: "jump";
  duration: number;
  velocity: number;
  engageTime: number;
  ready: number;
  requestTime: number;
  gracyPeriod: number;
  speedBoost: number;

  constructor() {
    super("jump");
    this.duration = 0.3;
    this.velocity = 200;
    this.engageTime = 0;
    this.ready = 0;
    this.requestTime = 0;
    this.gracyPeriod = 0.1;
    this.speedBoost = 0.2;
  }

  start() {
    this.requestTime = this.gracyPeriod;
  }

  //when cancel vel.y is still negative so mario will keep go up for a little time
  cancel() {
    this.engageTime = 0;
    this.requestTime = 0;
  }

  get falling() {
    return this.ready < 0;
  }

  obstruct(entity: Entity, side: Symbol) {
    if (side === Sides.BOTTOM) {
      this.ready = 1;
    } else if (side === Sides.TOP) {
      this.cancel();
    }
  }

  update(entity: Entity, deltaTime: number) {
    if (this.requestTime > 0) {
      if (this.ready > 0) {
        this.engageTime = this.duration;
        this.requestTime = 0;
      }
      this.requestTime -= deltaTime;
    }

    if (this.engageTime > 0) {
      entity.vel.y = -(
        this.velocity +
        Math.abs(entity.vel.x) * this.speedBoost
      );
      this.engageTime -= deltaTime;
    }
    this.ready--;
  }
}
