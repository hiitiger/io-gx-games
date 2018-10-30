import { Entity, TileProp, Tile } from "./entity.js";
import { Compositor } from "./compositor.js";
import { TileCollider } from "./tilecollider.js";
import { EntityCollider } from "./entitycollider.js";

export class Level {
  gravity: number;
  comp: Compositor;
  entities: Set<Entity>;
  tileCollider: TileCollider;
  entityCollider: EntityCollider;

  totalTime: number;

  constructor() {
    this.gravity = 1400;
    this.totalTime = 0;
    this.comp = new Compositor();
    this.entities = new Set<Entity>();
    this.tileCollider = null;
    this.entityCollider = new EntityCollider(this.entities);
  }

  setCollisionGrid(matrix) {
    this.tileCollider = new TileCollider(matrix);
  }

  update(deltaTime: number) {
    this.entities.forEach(entity => {
      entity.update(deltaTime, this);
    });

    this.entities.forEach(entity => {
      this.entityCollider.check(entity);
    });

    this.entities.forEach(entity => {
      entity.finalize();
    });

    this.totalTime += deltaTime;
  }
}
