import { Vec2 } from "./math.js";

export class BoundingBox {
  pos: Vec2;
  size: Vec2;
  offset: Vec2;

  constructor(pos: Vec2, size: Vec2, offset: Vec2) {
    this.pos = pos;
    this.size = size;
    this.offset = offset;
  }

  overlaps(box: BoundingBox) {
    if (
      this.bottom > box.top &&
      this.top < box.bottom &&
      this.left < box.right &&
      this.right > box.left
    ) {
      return true;
    }
    return false;
  }

  get bottom() {
    return this.pos.y + this.size.y + this.offset.y;
  }

  set bottom(y) {
    this.pos.y = y - (this.size.y + this.offset.y);
  }

  get top() {
    return this.pos.y + this.offset.y;
  }

  set top(y) {
    this.pos.y = y - this.offset.y;
  }

  get left() {
    return this.pos.x + this.offset.x;
  }

  set left(x) {
    this.pos.x = x - this.offset.x;
  }

  get right() {
    return this.pos.x + this.size.x + this.offset.x;
  }

  set right(x) {
    this.pos.x = x - (this.size.x + this.offset.x);
  }
}
