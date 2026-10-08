import type { Direction, Position } from '../../types/common';

type KeyHandler = (key: string, pressed: boolean) => void;

export class InputManager {
  private keys = new Set<string>();
  private justPressed = new Set<string>();
  private handlers = new Set<KeyHandler>();
  private enabled = true;

  constructor() {
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }

  attach(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  detach(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  setEnabled(value: boolean): void {
    this.enabled = value;
    if (!value) {
      this.keys.clear();
      this.justPressed.clear();
    }
  }

  private normalize(key: string): string {
    const map: Record<string, string> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      w: 'up',
      W: 'up',
      s: 'down',
      S: 'down',
      a: 'left',
      A: 'left',
      d: 'right',
      D: 'right',
      Enter: 'confirm',
      ' ': 'confirm',
      z: 'confirm',
      Z: 'confirm',
      Escape: 'cancel',
      x: 'cancel',
      X: 'cancel',
      e: 'menu',
      E: 'menu',
      m: 'menu',
      M: 'menu',
    };
    return map[key] ?? key.toLowerCase();
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (!this.enabled) return;
    const key = this.normalize(e.key);
    if (['up', 'down', 'left', 'right', 'confirm', 'cancel', 'menu', ' '].includes(key) || e.key === ' ') {
      e.preventDefault();
    }
    if (!this.keys.has(key)) {
      this.justPressed.add(key);
      this.handlers.forEach((h) => h(key, true));
    }
    this.keys.add(key);
  }

  private onKeyUp(e: KeyboardEvent): void {
    const key = this.normalize(e.key);
    this.keys.delete(key);
    this.handlers.forEach((h) => h(key, false));
  }

  isDown(key: string): boolean {
    return this.keys.has(key);
  }

  consumeJustPressed(key: string): boolean {
    if (this.justPressed.has(key)) {
      this.justPressed.delete(key);
      return true;
    }
    return false;
  }

  endFrame(): void {
    this.justPressed.clear();
  }

  getDirection(): Direction | null {
    if (this.isDown('up')) return 'up';
    if (this.isDown('down')) return 'down';
    if (this.isDown('left')) return 'left';
    if (this.isDown('right')) return 'right';
    return null;
  }

  /** Virtual control press from mobile UI */
  virtualPress(key: string): void {
    if (!this.keys.has(key)) {
      this.justPressed.add(key);
    }
    this.keys.add(key);
  }

  virtualRelease(key: string): void {
    this.keys.delete(key);
  }

  on(handler: KeyHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }
}

export function directionDelta(dir: Direction): Position {
  switch (dir) {
    case 'up':
      return { x: 0, y: -1 };
    case 'down':
      return { x: 0, y: 1 };
    case 'left':
      return { x: -1, y: 0 };
    case 'right':
      return { x: 1, y: 0 };
  }
}
