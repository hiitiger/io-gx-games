import { Sides, EntityTrait, TilePropEx, Entity } from "../entity.js";

export class Solid extends EntityTrait {
  NAME: "solid";

  obstructs: boolean;

  constructor() {
    super("solid");
    this.obstructs = true;
  }

  obstruct(entity: Entity, side: Symbol, match: TilePropEx) {
    if (!this.obstructs) {
      return;
    }

    if (side === Sides.BOTTOM) {
      entity.bounds.top = match.y1 - entity.size.y;
      entity.vel.y = 0;
    } else if (side === Sides.TOP) {
      entity.bounds.top = match.y2;
      entity.vel.y = 0;
    } else if (side === Sides.RIGHT) {
      entity.bounds.left = match.x1 - entity.size.x;
      entity.vel.x = 0;
    } else if (side === Sides.LEFT) {
      entity.bounds.left = match.x2;
      entity.vel.x = 0;
    }
  }
}
