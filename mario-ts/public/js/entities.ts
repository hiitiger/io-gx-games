import { loadMario } from "./entities/mario.js";
import { loadGoomba } from "./entities/goomba.js";
import { loadKoopa } from "./entities/koopa.js";

export function loadEntites(): any {
  const entityFactories = {};

  function addAs(name: string) {
    return factory => (entityFactories[name] = factory);
  }

  return Promise.all([
    loadMario().then(addAs("mario")),
    loadGoomba().then(addAs("goomba")),
    loadKoopa().then(addAs("koopa"))
  ]).then(() => entityFactories);
}
