import { Sides, EntityTrait, TilePropEx, Entity } from "../entity.js";
import { Level } from "../level.js";

export class Physics extends EntityTrait {
  NAME: "physics";

  constructor() {
    super("physics");
  }

  update(entity: Entity, deltaTime: number, level: Level) {
    entity.pos.x += entity.vel.x * deltaTime;
    level.tileCollider.checkX(entity);

    entity.pos.y += entity.vel.y * deltaTime;
    level.tileCollider.checkY(entity);

    entity.vel.y += level.gravity * deltaTime;
  }
}
