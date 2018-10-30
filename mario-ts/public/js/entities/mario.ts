import { Entity, EntityTrait } from "../entity.js";
import { Velocity } from "../traits/velocity.js";
import { Jump } from "../traits/jump.js";
import { Go } from "../traits/go.js";
import { Stomper } from "../traits/stomper.js";
import { Killable } from "../traits/killable.js";
import { Solid } from "../traits/solid.js";
import { Physics } from "../traits/physics.js";

import { loadSpriteSheet } from "../loader.js";
import { createAnimation } from "../animation.js";
import { SpriteSheet } from "../spritesheet.js";

export function loadMario() {
  return loadSpriteSheet("mario").then(sprites => {
    return createMarioFactory(sprites);
  });
}

function createMarioFactory(sprites: SpriteSheet) {
  const runAni = sprites.animations.get("run");

  function routeFrame(mario) {
    if (mario.jump.falling) {
      return "jump";
    }

    if (mario.go.distance !== 0) {
      if (
        (mario.vel.x > 0 && mario.go.dir < 0) ||
        (mario.vel.x < 0 && mario.go.dir > 0)
      ) {
        return "break";
      }
      return runAni(mario.go.distance);
    }
    return "idle";
  }

  function setTurboState(on) {
    this.go.dragFactor = on ? 1 / 5000 : 1 / 1500;
  }

  function drawMario(context) {
    sprites.draw(routeFrame(this), context, 0, 0, this.go.heading < 0);
  }

  return function createMario() {
    const mario = new Entity();
    mario.size.set(14, 16);

    mario.addTraits(new Physics());
    mario.addTraits(new Solid());
    mario.addTraits(new Go());
    mario.addTraits(new Jump());
    //mario.addTraits(new Velocity());

    mario.addTraits(new Stomper());
    mario.addTraits(new Killable());
    (<any>mario).killable.removeAfter = 0;

    (<any>mario).state = "";
    (<any>mario).turbo = setTurboState;
    mario.draw = drawMario;

    (<any>mario).turbo(false);

    return mario;
  };
}
