import { Matrix } from "./math.js";
import { Sides, Entity, TileProp, Tile } from "./entity.js";
import { TileResolver } from "./tileresolver.js";

export class TileCollider {
  tiles: TileResolver;
  constructor(tiles: Matrix<TileProp>) {
    this.tiles = new TileResolver(tiles);
  }

  checkX(entity: Entity) {
    entity.collision[0] = false;
    entity.collision[1] = false;

    let x;
    if (entity.vel.x > 0) {
      x = Math.floor(entity.bounds.right);
    } else if (entity.vel.x < 0) {
      x = Math.floor(entity.bounds.left);
    } else {
      return;
    }
    const matches = this.tiles.searchByRange(
      //entity.bounds.left, entity.bounds.right,
      x,
      x,
      entity.bounds.top,
      entity.bounds.bottom
    );

    matches.forEach(match => {
      if (!match) {
        return;
      }
      if (match.tile.type !== "ground") {
        return;
      }
      if (entity.vel.x > 0) {
        if (entity.bounds.right > match.x1) {
          entity.collision[1] = true;
          entity.obstruct(Sides.RIGHT, match);
        }
      } else if (entity.vel.x < 0) {
        if (entity.bounds.left < match.x2) {
          entity.collision[0] = true;
          entity.obstruct(Sides.LEFT, match);
        }
      }
    });
  }

  checkY(entity: Entity) {
    entity.collision[2] = false;
    entity.collision[3] = false;

    let y;
    if (entity.vel.y > 0) {
      y = Math.floor(entity.bounds.bottom);
    } else if (entity.vel.y < 0) {
      y = Math.floor(entity.bounds.top);
    } else {
      return;
    }

    const matches = this.tiles.searchByRange(
      entity.bounds.left,
      entity.bounds.right,
      y,
      y
    );

    matches.forEach(match => {
      if (!match) {
        return;
      }
      if (match.tile.type !== "ground") {
        return;
      }
      if (entity.vel.y > 0) {
        if (entity.bounds.bottom > match.y1) {
          entity.collision[3] = true;
          entity.obstruct(Sides.BOTTOM, match);
        }
      } else if (entity.vel.y < 0) {
        if (entity.bounds.top < match.y2) {
          entity.collision[2] = true;
          entity.obstruct(Sides.TOP, match);
        }
      }
    });
  }

  test(entity: Entity) {
    this.checkY(entity);
    //const match = this.tiles.matchByPosition(entity.bounds.left, entity.bounds.top);
    //if (match) {
    //    //console.log(match.tile);
    //}
  }
}
