export function createAnimation(frames: string[], frameLen) {
  return function resolveFrame(distance) {
    const frameIndex = Math.floor(distance / frameLen) % frames.length;
    return frames[frameIndex];
  };
}
