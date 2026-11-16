import { beforeEach, describe, expect, it, vi } from 'vitest';

const created: { destroyed: boolean }[] = [];

vi.mock('lenis', () => ({
  default: class {
    destroyed = false;
    constructor() {
      created.push(this);
    }
    on() {}
    raf() {}
    resize() {}
    stop() {}
    start() {}
    destroy() {
      this.destroyed = true;
    }
  },
}));
vi.mock('../../src/lib/prefs', () => ({ prefersReducedMotion: () => false, hasFinePointer: () => true }));
vi.mock('../../src/lib/gsap', () => ({
  afterFirstInteraction: () => Promise.resolve(),
  loadGsap: () =>
    Promise.resolve({
      gsap: { ticker: { add() {}, remove() {}, lagSmoothing() {} } },
      ScrollTrigger: { update() {} },
    }),
}));

describe('initSmoothScroll', () => {
  beforeEach(() => {
    created.length = 0;
    vi.resetModules();
  });

  it('shares one instance between overlapping callers (StrictMode double effect)', async () => {
    const { initSmoothScroll } = await import('../../src/lib/scroll');
    // mount → unmount (released as soon as it resolves) → mount again, exactly like App.tsx under StrictMode
    const first = initSmoothScroll();
    const second = initSmoothScroll();
    (await first)();
    const releaseSecond = await second;
    expect(created).toHaveLength(1);
    expect(created[0]!.destroyed).toBe(false);
    releaseSecond();
    expect(created[0]!.destroyed).toBe(true);
  });

  it('creates a fresh instance after the last user released the previous one', async () => {
    const { initSmoothScroll } = await import('../../src/lib/scroll');
    const release = await initSmoothScroll();
    release();
    release(); // idempotent
    const again = await initSmoothScroll();
    expect(created).toHaveLength(2);
    expect(created[1]!.destroyed).toBe(false);
    again();
  });
});
