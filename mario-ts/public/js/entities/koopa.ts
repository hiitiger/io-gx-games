import { Entity, EntityTrait } from "../entity.js";
import { loadSpriteSheet } from "../loader.js";
import { SpriteSheet } from "../spritesheet.js";
import { Level } from "../level.js";

import { PendulumMove } from "../traits/pendulummove.js";
import { Killable } from "../traits/killable.js";
import { Solid } from "../traits/solid.js";

import { Physics } from "../traits/physics.js";

export function loadKoopa() {
  return loadSpriteSheet("koopa").then(sprites => {
    return createKoopaFactory(sprites);
  });
}

const STATE_WALKING = Symbol("walking");
const STATE_HIDING = Symbol("hiding");
const STATE_PANIC = Symbol("panic");

class Behavior extends EntityTrait {
  state: Symbol;
  hideTime: number;
  hideDuration: number;
  panicSpeed: number;
  walkSpeed: number;

  constructor() {
    super("behavior");
    this.state = STATE_WALKING;
    this.hideTime = 0;
    this.hideDuration = 5;
    this.panicSpeed = 300;
    this.walkSpeed = 0;
  }

  collides(us: Entity, them: Entity) {
    if ((<any>us).killable.dead) {
      return;
    }

    if ("stomper" in <any>them) {
      if (them.vel.y > us.vel.y) {
        this.handleStomp(us, them);
      } else {
        // (<any>them).killable.kill();
        this.handleNudge(us, them);
      }
    }
  }

  handleNudge(us: Entity, them: Entity) {
    if (this.state === STATE_WALKING) {
      (<any>them).killable.kill();
    } else if (this.state === STATE_HIDING) {
      this.panic(us, them);
    } else if (this.state === STATE_PANIC) {
      const travelDir = Math.sign(us.vel.x);
      const impactDir = Math.sign(us.pos.x - them.pos.x);
      if (travelDir !== 0 && travelDir !== impactDir) {
        (<any>them).killable.kill();
      }
    }
  }

  handleStomp(us: Entity, them: Entity) {
    if (this.state === STATE_WALKING) {
      this.hide(us);
    } else if (this.state === STATE_HIDING) {
      (<any>us).killable.kill();
      us.vel.set(100, -200);
      (<any>us).solid.obstructs = false;
    } else if (this.state === STATE_PANIC) {
      this.hide(us);
    }
  }

  panic(us: Entity, them: Entity) {
    (<any>us).pendulumMove.enabled = true;
    (<any>us).pendulumMove.speed = this.panicSpeed * Math.sign(them.vel.x);
    this.state = STATE_PANIC;
  }

  hide(us: Entity) {
    us.vel.x = 0;
    (<any>us).pendulumMove.enabled = false;
    if (this.walkSpeed === 0) {
      this.walkSpeed = (<any>us).pendulumMove.speed;
    }
    this.state = STATE_HIDING;
    this.hideTime = 0;
  }

  unhide(us: Entity) {
    (<any>us).pendulumMove.speed = this.walkSpeed;
    (<any>us).pendulumMove.enabled = true;
    this.state = STATE_WALKING;
  }

  update(entity: Entity, deltaTime: number, level: Level) {
    if (this.state === STATE_HIDING) {
      this.hideTime += deltaTime;
      if (this.hideTime > this.hideDuration) {
        this.unhide(entity);
      }
    }
  }
}

function createKoopaFactory(sprites: SpriteSheet) {
  const walkAni = sprites.animations.get("walk");
  const wakeAni = sprites.animations.get("wake");

  function routeAnim(koopa) {
    if (koopa.behavior.state === STATE_HIDING) {
      if (koopa.behavior.hideTime > 3) {
        return wakeAni(koopa.behavior.hideTime);
      }

      return "hiding";
    }

    if (koopa.behavior.state === STATE_PANIC) {
      return "hiding";
    }

    return walkAni(koopa.lifeTime);
  }

  function drawKoopa(context: CanvasRenderingContext2D) {
    sprites.draw(routeAnim(this), context, 0, 0, this.vel.x < 0);
  }

  return function createKoopa() {
    const koopa = new Entity();
    koopa.size.set(16, 16);
    koopa.offset.set(0, 8);

    koopa.draw = drawKoopa;

    koopa.addTraits(new Physics());
    koopa.addTraits(new Solid());
    koopa.addTraits(new PendulumMove());
    koopa.addTraits(new Behavior());
    koopa.addTraits(new Killable());

    return koopa;
  };
}
