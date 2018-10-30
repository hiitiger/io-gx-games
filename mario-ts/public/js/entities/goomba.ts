import { Entity, EntityTrait } from "../entity.js";
import { loadSpriteSheet } from "../loader.js";
import { SpriteSheet } from "../spritesheet.js";

import { PendulumMove } from "../traits/pendulummove.js";
import { Killable } from "../traits/killable.js";
import { Solid } from "../traits/solid.js";
import { Physics } from "../traits/physics.js";

export function loadGoomba() {
  return loadSpriteSheet("goomba").then(sprites => {
    return createGoombaFactory(sprites);
  });
}

class Behavior extends EntityTrait {
  constructor() {
    super("behavior");
  }

  collides(us: Entity, them: Entity) {
    if ((<any>us).killable.dead) {
      return;
    }

    if ("stomper" in <any>them) {
      if (them.vel.y > us.vel.y) {
        (<any>us).killable.kill();
        (<any>us).pendulumMove.speed = 0;
      } else {
        (<any>them).killable.kill();
      }
    }
  }
}

function createGoombaFactory(sprites: SpriteSheet) {
  const walkAni = sprites.animations.get("walk");

  function routeAnim(goomba) {
    if (goomba.killable.dead) {
      return "flat";
    }
    return walkAni(goomba.lifeTime);
  }

  function drawGoomba(context: CanvasRenderingContext2D) {
    sprites.draw(routeAnim(this), context, 0, 0);
  }

  return function createGoomba() {
    const goomba = new Entity();
    goomba.size.set(16, 16);
    goomba.draw = drawGoomba;

    goomba.addTraits(new Physics());
    goomba.addTraits(new Solid());
    goomba.addTraits(new PendulumMove());
    goomba.addTraits(new Behavior());
    goomba.addTraits(new Killable());

    return goomba;
  };
}
