export type LoopCallback = (dt: number, now: number) => void;

export class GameLoop {
  private running = false;
  private last = 0;
  private raf = 0;
  private callback: LoopCallback;

  constructor(callback: LoopCallback) {
    this.callback = callback;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const tick = (now: number) => {
      if (!this.running) return;
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.callback(dt, now);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  isRunning(): boolean {
    return this.running;
  }
}
