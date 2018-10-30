import { EntityTrait, Entity } from "../entity.js";

export class Go extends EntityTrait {
  NAME: "go";
  dir: number;
  heading: number;
  speed: number;
  acceleration: number;
  deceleration: number;
  dragFactor: number;
  distance: number;

  constructor() {
    super("go");
    this.dir = 0;
    this.heading = 0;
    this.speed = 6000;
    this.acceleration = 400;
    this.deceleration = 300;
    this.dragFactor = 1 / 1000;
    this.distance = 0;
  }

  update(entity: Entity, deltaTime: number) {
    if (this.dir !== 0) {
      entity.vel.x += this.acceleration * this.dir * deltaTime;
      if ((<any>entity).jump) {
        if (!(<any>entity).jump.falling) {
          this.heading = this.dir;
        }
      } else {
        this.heading = this.dir;
      }
    } else if (entity.vel.x !== 0) {
      const decel = Math.min(
        Math.abs(entity.vel.x),
        this.deceleration * deltaTime
      );
      entity.vel.x += entity.vel.x > 0 ? -decel : decel;
    } else {
      this.distance = 0;
    }

    this.distance += Math.abs(entity.vel.x * deltaTime);
    const drag = this.dragFactor * entity.vel.x * Math.abs(entity.vel.x);
    entity.vel.x -= drag;
  }
}
