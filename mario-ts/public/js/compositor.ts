import { Camera } from "./camera.js";

export interface LayerFunc {
  (context: CanvasRenderingContext2D, camera: Camera): void;
}

export class Compositor {
  layers: Array<LayerFunc>;
  constructor() {
    this.layers = new Array<LayerFunc>();
  }

  draw(context: CanvasRenderingContext2D, camera: Camera) {
    this.layers.forEach(layer => {
      layer(context, camera);
    });
  }
}
