import { SpriteSheet } from "../spritesheet.js";
import { Entity, TileProp, Tile } from "../entity.js";
import { Level } from "../level.js";
import { Camera } from "../camera.js";
import { TileResolver } from "../tileresolver.js";
import { Matrix } from "../math.js";

export function createBackgroundLayer(
  level: Level,
  tiles: Matrix<TileProp>,
  sprites: SpriteSheet
) {
  const resolver = new TileResolver(tiles);

  const buffer = document.createElement("canvas");
  buffer.width = 256 + 16;
  buffer.height = 256;
  const context = buffer.getContext("2d");

  // level.tiles.forEach((tile, x, y) => {
  //     sprites.drawTile(tile.name, context, x, y);
  // })

  //only draw x axis range tiles [drawFrom, drawTo] --> [0, width]
  function redraw(startIndex: number, endIndex: number) {
    context.clearRect(0, 0, buffer.width, buffer.height);
    for (let x = startIndex; x <= endIndex; ++x) {
      const col = tiles.grid[x];
      if (col) {
        col.forEach((tile, y) => {
          if (sprites.animations.has(tile.name)) {
            sprites.drawAni(
              tile.name,
              context,
              x - startIndex,
              y,
              level.totalTime
            );
          } else {
            sprites.drawTile(tile.name, context, x - startIndex, y);
          }
        });
      }
    }
  }

  return function drawBackgroundLayer(
    context: CanvasRenderingContext2D,
    camera: Camera
  ) {
    const drawWidth = resolver.toIndex(camera.size.x);
    const drawFrom = resolver.toIndex(camera.pos.x);
    const drawTo = drawFrom + drawWidth;

    redraw(drawFrom, drawTo);

    context.drawImage(
      buffer,
      -(Math.floor(camera.pos.x) % resolver.tileSize),
      -Math.floor(camera.pos.y)
    );
  };
}
