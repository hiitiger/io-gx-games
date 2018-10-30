import { SpriteSheet } from "./spritesheet.js";
import { createAnimation } from "./animation.js";

export function loadImage(url): Promise<HTMLImageElement> {
  return new Promise(resolve => {
    const image = new Image();
    image.addEventListener("load", () => {
      resolve(image);
    });
    image.src = url;
  });
}

export function loadJSON(url) {
  return fetch(url).then(r => r.json());
}

export function loadSpriteSheet(name) {
  return loadJSON(`./sprites/${name}.json`)
    .then(sheetSpec => Promise.all([sheetSpec, loadImage(sheetSpec.imageUrl)]))
    .then(([sheetSpec, image]) => {
      const sprites = new SpriteSheet(image, sheetSpec.tileW, sheetSpec.tileH);

      if (sheetSpec.tiles) {
        sheetSpec.tiles.forEach(tileSpec => {
          sprites.defineTile(
            tileSpec.name,
            tileSpec.index[0],
            tileSpec.index[1]
          );
        });
      }

      if (sheetSpec.frames) {
        sheetSpec.frames.forEach(frameSpec => {
          let x, y, w, h;
          [x, y, w, h] = frameSpec.rect;
          sprites.define(frameSpec.name, x, y, w, h);
        });
      }

      if (sheetSpec.animations) {
        sheetSpec.animations.forEach(aniSpec => {
          const animation = createAnimation(aniSpec.frames, aniSpec.frameLen);
          sprites.defineAnimation(aniSpec.name, animation);
        });
      }

      return sprites;
    });
}
