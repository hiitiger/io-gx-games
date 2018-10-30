import { Sides, EntityTrait, Entity } from "../entity.js";

export class PendulumMove extends EntityTrait {
  NAME: "pendulumMove";
  speed: number;
  enabled: boolean;

  constructor() {
    super("pendulumMove");
    this.speed = -30;
    this.enabled = true;
  }

  obstruct(entity: Entity, side: Symbol) {
    if (side === Sides.LEFT || side === Sides.RIGHT) {
      this.speed = -this.speed;
    }
  }

  update(entity: Entity, deltaTime: number) {
    if (this.enabled) {
      entity.vel.x = this.speed;
    }
  }
}
