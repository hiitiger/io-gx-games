import { EntityTrait, Entity } from "../entity.js";
import { Level } from "../level.js";

export class Killable extends EntityTrait {
  NAME: "killable";
  dead: boolean;
  deadTime: number;
  removeAfter: number;

  constructor() {
    super("killable");
    this.dead = false;
    this.deadTime = 0;
    this.removeAfter = 2;
  }

  kill() {
    this.queue(() => (this.dead = true));
  }

  revive() {
    this.dead = false;
    this.deadTime = 0;
  }

  update(entity: Entity, deltaTime: number, level: Level) {
    if (this.dead) {
      this.deadTime += deltaTime;
      if (this.deadTime > this.removeAfter) {
        this.queue(() => {
          level.entities.delete(entity);
        });
      }
    }
  }
}
