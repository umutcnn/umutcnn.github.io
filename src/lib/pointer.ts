/**
 * One shared pointer tracker for every pointer-reactive effect (particles, spotlight).
 * A single passive listener writes into a plain object; effects read it inside their own rAF.
 * No React state → no re-renders on pointer move.
 */
export interface PointerState {
  x: number;
  y: number;
  /** -1 … 1 relative to the viewport centre */
  nx: number;
  ny: number;
  active: boolean;
  lastMove: number;
}

export const pointer: PointerState = { x: 0, y: 0, nx: 0, ny: 0, active: false, lastMove: 0 };

let users = 0;

function onMove(e: PointerEvent) {
  if (e.pointerType === 'touch') return; // touch drags scroll; they should not steer effects
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.nx = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.ny = (e.clientY / window.innerHeight) * 2 - 1;
  pointer.active = true;
  pointer.lastMove = performance.now();
}

function onLeave() {
  pointer.active = false;
}

/** Starts tracking (ref-counted). Returns a release function. */
export function acquirePointer(): () => void {
  if (typeof window === 'undefined') return () => {};
  if (users === 0) {
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
  }
  users += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    users -= 1;
    if (users === 0) {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    }
  };
}
