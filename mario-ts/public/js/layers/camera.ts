import { Camera } from "../camera.js";

export function createCameraLayer(cameraToDraw: Camera) {
  return function drawCameraRect(
    context: CanvasRenderingContext2D,
    fromCamera: Camera
  ) {
    context.strokeStyle = "purple";
    context.beginPath();
    context.rect(
      cameraToDraw.pos.x - fromCamera.pos.x,
      cameraToDraw.pos.y - fromCamera.pos.y,
      cameraToDraw.size.x,
      cameraToDraw.size.y
    );
    context.stroke();
  };
}
