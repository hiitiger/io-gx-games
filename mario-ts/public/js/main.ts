import { createLevelLoader } from "./loaders/level.js";
import { loadEntites } from "./entities.js";

import { Timer } from "./timer.js";
import { Camera } from "./camera.js";

import { createCollisionLayer } from "./layers/collision.js";
import { createCameraLayer } from "./layers/camera";
import { setupKeyboard } from "./input.js";
import { setupMouseControl } from "./debug.js";

import { Entity } from "./entity.js";
import { PlayerController } from "./traits/playercontroller.js";

function createPlayeEnv(playerEntity) {
  const playerEnv = new Entity();
  const playerController = new PlayerController();
  playerController.checkPoint.set(64, 64);
  playerController.setPlayer(playerEntity);
  playerEnv.addTraits(playerController);

  return playerEnv;
}

async function main(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");

  const entityFactory = await loadEntites();
  const loadLevel = await createLevelLoader(entityFactory);
  const level = await loadLevel("1-1");

  const camera = new Camera();
  (<any>window).camera = camera;

  const mario = entityFactory.mario();

  const playerEnv = createPlayeEnv(mario);
  level.entities.add(playerEnv);

  const input = setupKeyboard(mario);
  input.listenTo(window);

  level.comp.layers.push(
    createCollisionLayer(level)
    // createCameraLayer(camera)
  );

  setupMouseControl(canvas, mario, camera);

  const timer = new Timer(1 / 60);
  timer.update = function update(deltaTime) {
    level.update(deltaTime);

    context.fillRect(0, 0, 256, 240);

    level.comp.draw(context, camera);
    if (mario.vel.x !== 0) {
      camera.pos.set(mario.pos.x - 64, 0);
    }
  };
  timer.start();
}

const canvas = document.getElementById("screen") as HTMLCanvasElement;
main(canvas);
