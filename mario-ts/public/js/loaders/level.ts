import { Level } from "../level.js";
import { Tile, TileProp, Entity } from "../entity.js";
import { createSpriteLayer } from "../layers/sprites.js";
import { createBackgroundLayer } from "../layers/background.js";

import { loadJSON, loadSpriteSheet } from "../loader.js";

import { Matrix } from "../math.js";

import { SpriteSheet } from "../spritesheet.js";

function createCollisionGrid(tiles, patterns) {
  const grid = new Matrix();
  for (const { tile, x, y } of expandTiles(tiles, patterns)) {
    grid.set(x, y, {
      name: tile.name,
      type: tile.type
    });
  }
  return grid;
}

function createBackgroundGrid(tiles, patterns) {
  const grid = new Matrix<TileProp>();
  for (const { tile, x, y } of expandTiles(tiles, patterns)) {
    grid.set(x, y, {
      name: tile.name,
      type: tile.type
    });
  }
  return grid;
}

function* expandSpan(xStart, xLen, yStart, yLen) {
  const xEnd = xStart + xLen;
  const yEnd = yStart + yLen;
  for (let x = xStart; x < xEnd; ++x) {
    for (let y = yStart; y < yEnd; ++y) {
      yield { x, y };
    }
  }
}

function expandRange(range) {
  if (range.length === 4) {
    const [xStart, xLen, yStart, yLen] = range;
    return expandSpan(xStart, xLen, yStart, yLen);
  } else if (range.length === 2) {
    const [xStart, yStart] = range;
    return expandSpan(xStart, 1, yStart, 1);
  } else if (range.length === 3) {
    const [xStart, xLen, yStart] = range;
    return expandSpan(xStart, xLen, yStart, 1);
  }
}

function* expandRanges(ranges) {
  for (const range of ranges) {
    // for (const item of expandRange(range)) {
    //     yield item
    // }
    yield* expandRange(range);
  }
}

function* expandTiles(tiles: Array<Tile>, patterns) {
  function* walkTiles(tiles: Array<Tile>, offsetX, offsetY) {
    for (const tile of tiles) {
      for (const { x, y } of expandRanges(tile.ranges)) {
        const derivedX = x + offsetX;
        const derivedY = y + offsetY;
        if (tile.pattern) {
          const tiles = patterns[tile.pattern].tiles;
          yield* walkTiles(tiles, derivedX, derivedY);
        } else {
          yield {
            tile,
            x: derivedX,
            y: derivedY
          };
        }
      }
    }
  }

  yield* walkTiles(tiles, 0, 0);
}

function setupCollision(levelSpec, level: Level) {
  const mergedTiles = levelSpec.layers.reduce((mergedTiles, layerSpec) => {
    return mergedTiles.concat(layerSpec.tiles);
  }, []);
  const collisonGrid = createCollisionGrid(mergedTiles, levelSpec.patterns);
  level.setCollisionGrid(collisonGrid);
}

function setupBackground(
  levelSpec,
  level: Level,
  backgroundSprites: SpriteSheet
) {
  levelSpec.layers.forEach(layer => {
    const backgroundGrid = createBackgroundGrid(
      layer.tiles,
      levelSpec.patterns
    );
    const backgroundLayer = createBackgroundLayer(
      level,
      backgroundGrid,
      backgroundSprites
    );
    level.comp.layers.push(backgroundLayer);
  });
}

function setupEntities(levelSpec, level: Level, entityFactory) {
  const marioLayer = createSpriteLayer(level.entities);
  level.comp.layers.push(marioLayer);

  levelSpec.entities.forEach(({ name, pos: [x, y] }) => {
    const createEntity = entityFactory[name];
    const entity = createEntity() as Entity;
    entity.pos.set(x, y);
    level.entities.add(entity);
  });
}

export function createLevelLoader(entityFactory) {
  return function loadLevel(name): Promise<Level> {
    return loadJSON(`./levels/${name}.json`)
      .then(levelSpec =>
        Promise.all([levelSpec, loadSpriteSheet(levelSpec.spriteSheet)])
      )
      .then(([levelSpec, backgroundSprites]) => {
        const level = new Level();

        setupCollision(levelSpec, level);

        setupBackground(levelSpec, level, backgroundSprites);

        setupEntities(levelSpec, level, entityFactory);

        return level;
      });
  };
}
