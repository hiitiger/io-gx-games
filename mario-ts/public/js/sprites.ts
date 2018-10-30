import { SpriteSheet } from "./spritesheet.js";
import { loadImage } from "./loader.js";

export function loadMarioSprites() {
  return loadImage("./img/characters.gif").then(image => {
    const sprites = new SpriteSheet(image, 16, 16);
    sprites.define("idle", 276, 44, 16, 16);
    sprites.define("standright", 276, 44, 16, 16);
    sprites.define("standleft", 222, 44, 16, 16);
    sprites.define("goright0", 290, 44, 16, 16);
    sprites.define("goright1", 305, 44, 16, 16);
    sprites.define("goright2", 321, 44, 16, 16);
    sprites.define("goleft0", 208, 44, 16, 16);
    sprites.define("goleft1", 193, 44, 16, 16);
    sprites.define("goleft2", 177, 44, 16, 16);

    sprites.define("jumpright", 355, 44, 17, 16);
    sprites.define("jumpleft", 142, 44, 17, 16);
    return sprites;
  });
}
