import { Entity, EntityTrait } from "../entity.js";

export class Stomper extends EntityTrait {
  NAME: "stomper";
  bounceSpeed: number;

  constructor() {
    super("stomper");
    this.bounceSpeed = 400;
  }

  bounce(us: Entity, them: Entity) {
    us.bounds.bottom = them.bounds.top;
    us.vel.y = -this.bounceSpeed;
  }

  collides(us: Entity, them: Entity) {
    if ("killable" in <any>them)
      if (!(<any>them).killable.dead)
        if (us.vel.y > them.vel.y) this.bounce(us, them);
  }
}
