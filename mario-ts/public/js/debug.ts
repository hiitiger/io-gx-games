import { Camera } from "./camera.js";
import { Entity } from "./entity.js";
export function setupMouseControl(
  canvas: HTMLCanvasElement,
  entity: Entity,
  camera: Camera
) {
  let lastEvent: MouseEvent;

  ["mousedown", "mousemove"].forEach(eventname => {
    canvas.addEventListener(eventname, event => {
      const mouseevent = event as MouseEvent;
      const px = mouseevent.offsetX * (256 / canvas.offsetWidth);
      const py = mouseevent.offsetY * (240 / canvas.offsetHeight);
      if (mouseevent.buttons === 1) {
        entity.vel.set(0, 0);
        entity.pos.set(px + camera.pos.x, py + camera.pos.y);
      } else if (
        mouseevent.buttons == 2 &&
        lastEvent &&
        lastEvent.buttons == 2 &&
        lastEvent.type === "mousemove"
      ) {
        const lpx = lastEvent.offsetX * (256 / canvas.offsetHeight);
        camera.pos.x -= px - lpx;
      }
      lastEvent = mouseevent;
    });
  });

  canvas.addEventListener("contextmenu", event => event.preventDefault());
}
