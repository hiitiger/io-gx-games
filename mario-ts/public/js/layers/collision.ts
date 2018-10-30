import { Entity, TileProp, Tile } from "../entity.js";
import { Level } from "../level.js";
import { Camera } from "../camera.js";
import { TileCollider } from "../tilecollider.js";

function createEntityLayer(entities: Set<Entity>) {
  return function drawBoundingBox(
    context: CanvasRenderingContext2D,
    camera: Camera
  ) {
    context.strokeStyle = "red";
    entities.forEach(entity => {
      context.beginPath();
      context.rect(
        entity.bounds.left - camera.pos.x,
        entity.bounds.top - camera.pos.y,
        entity.size.x,
        entity.size.y
      );
      context.stroke();
    });
  };
}

function createTileColliderLayer(tileCollider: TileCollider) {
  const resolvedTiles = new Array<{ x; y }>();
  const tileResovler = tileCollider.tiles;
  const tileSize = tileResovler.tileSize;

  const getByIndexOriginal = tileResovler.getByIndex;
  tileResovler.getByIndex = function getByIndexFake(x, y) {
    resolvedTiles.push({ x, y });

    return getByIndexOriginal.call(tileResovler, x, y);
  };

  return function drawTileCandidates(
    context: CanvasRenderingContext2D,
    camera: Camera
  ) {
    context.strokeStyle = "blue";
    resolvedTiles.forEach(({ x, y }) => {
      context.beginPath();
      context.rect(
        x * tileSize - camera.pos.x,
        y * tileSize - camera.pos.y,
        tileSize,
        tileSize
      );
      context.stroke();
    });
    resolvedTiles.length = 0;
  };
}

export function createCollisionLayer(level: Level) {
  const drawBoundingBoxes = createEntityLayer(level.entities);
  const drawTileCandidates = createTileColliderLayer(level.tileCollider);

  return function drawCollision(
    context: CanvasRenderingContext2D,
    camera: Camera
  ) {
    drawTileCandidates(context, camera);
    drawBoundingBoxes(context, camera);
  };
}
