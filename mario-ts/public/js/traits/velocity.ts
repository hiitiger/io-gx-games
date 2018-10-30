import { EntityTrait, Entity } from "../entity.js";

export class Velocity extends EntityTrait {
  NAME: "velocity";
  constructor() {
    super("velocity");
  }

  update(entity: Entity, deltaTime: number) {
    // entity.pos.x += (entity.vel.x * deltaTime);
    // entity.pos.y += (entity.vel.y * deltaTime);
  }
}
