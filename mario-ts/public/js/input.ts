import { KeyInput, KeyState } from "./keyinput.js";

export function setupKeyboard(mario) {
  const input = new KeyInput();
  input.addMapping("KeyW", keyState => {
    if (keyState === KeyState.PRESSED) {
      (mario as any).jump.start();
    } else {
      (mario as any).jump.cancel();
    }
  });

  input.addMapping("ShiftLeft", keyState => {
    (mario as any).turbo(keyState);
  });

  input.addMapping("KeyD", keyState => {
    (mario as any).go.dir += keyState ? 1 : -1;
  });

  input.addMapping("KeyA", keyState => {
    (mario as any).go.dir += keyState ? -1 : 1;
  });

  return input;
}
