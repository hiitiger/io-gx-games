import { EntityTrait, Entity } from "../entity.js";
import { Level } from "../level.js";

import { Vec2 } from "../math.js";

export class PlayerController extends EntityTrait {
  NAME: "playerController";
  player: Entity;
  checkPoint: Vec2;

  constructor() {
    super("playerController");
    this.player = null;
    this.checkPoint = new Vec2(0, 0);
  }

  setPlayer(entity: Entity) {
    this.player = entity;
  }

  update(entity: Entity, deltaTime: number, level: Level) {
    if (!level.entities.has(this.player)) {
      (<any>this.player).killable.revive();
      this.player.pos.set(this.checkPoint.x, this.checkPoint.y);
      level.entities.add(this.player);
    }
  }
}
