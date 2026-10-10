import { TILE_SIZE, VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from '../../types/common';

export class Camera {
  x = 0;
  y = 0;
  private initialized = false;
  private shakeX = 0;
  private shakeY = 0;
  private shakeTimer = 0;

  follow(worldX: number, worldY: number, mapPixelW: number, mapPixelH: number, snap = false): void {
    const targetX = worldX - VIEWPORT_WIDTH / 2 + TILE_SIZE / 2;
    const targetY = worldY - VIEWPORT_HEIGHT / 2 + TILE_SIZE / 2;
    const maxX = Math.max(0, mapPixelW - VIEWPORT_WIDTH);
    const maxY = Math.max(0, mapPixelH - VIEWPORT_HEIGHT);
    const clampedX = Math.max(0, Math.min(targetX, maxX));
    const clampedY = Math.max(0, Math.min(targetY, maxY));
    if (snap || !this.initialized) {
      this.x = clampedX;
      this.y = clampedY;
      this.initialized = true;
      return;
    }
    this.x += (clampedX - this.x) * 0.42;
    this.y += (clampedY - this.y) * 0.42;
  }

  /** Subtle one-shot shake (overworld events / crits) */
  shake(intensity = 2, duration = 0.12): void {
    this.shakeTimer = duration;
    this.shakeX = intensity;
    this.shakeY = intensity;
  }

  update(dt: number): void {
    if (this.shakeTimer <= 0) {
      this.shakeX = 0;
      this.shakeY = 0;
      return;
    }
    this.shakeTimer -= dt;
    const mag = this.shakeTimer > 0 ? 1 : 0;
    this.shakeX = (Math.random() * 2 - 1) * 2 * mag;
    this.shakeY = (Math.random() * 2 - 1) * 2 * mag;
  }

  get renderX(): number {
    return Math.round(this.x + this.shakeX);
  }

  get renderY(): number {
    return Math.round(this.y + this.shakeY);
  }

  worldToScreen(wx: number, wy: number): { x: number; y: number } {
    return { x: wx - this.renderX, y: wy - this.renderY };
  }
}
