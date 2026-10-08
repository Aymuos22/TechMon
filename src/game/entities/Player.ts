import type { Direction, Position } from '../../types/common';
import { MOVE_DURATION_MS, TILE_SIZE } from '../../types/common';
import { directionDelta } from '../engine/InputManager';

export class PlayerEntity {
  tile: Position;
  pixelX: number;
  pixelY: number;
  direction: Direction = 'down';
  moving = false;
  private fromX = 0;
  private fromY = 0;
  private toX = 0;
  private toY = 0;
  private moveElapsed = 0;
  walkFrame = 0;
  private walkTimer = 0;

  constructor(tile: Position) {
    this.tile = { ...tile };
    this.pixelX = tile.x * TILE_SIZE;
    this.pixelY = tile.y * TILE_SIZE;
  }

  tryStartMove(dir: Direction, canMoveTo: (x: number, y: number) => boolean): boolean {
    this.direction = dir;
    if (this.moving) return false;
    const d = directionDelta(dir);
    const nx = this.tile.x + d.x;
    const ny = this.tile.y + d.y;
    if (!canMoveTo(nx, ny)) return false;
    this.moving = true;
    this.fromX = this.tile.x * TILE_SIZE;
    this.fromY = this.tile.y * TILE_SIZE;
    this.toX = nx * TILE_SIZE;
    this.toY = ny * TILE_SIZE;
    this.tile = { x: nx, y: ny };
    this.moveElapsed = 0;
    return true;
  }

  update(dt: number): boolean {
    let arrived = false;
    if (this.moving) {
      this.moveElapsed += dt * 1000;
      const t = Math.min(1, this.moveElapsed / MOVE_DURATION_MS);
      this.pixelX = this.fromX + (this.toX - this.fromX) * t;
      this.pixelY = this.fromY + (this.toY - this.fromY) * t;
      this.walkTimer += dt;
      if (this.walkTimer > 0.1) {
        this.walkFrame = (this.walkFrame + 1) % 4;
        this.walkTimer = 0;
      }
      if (t >= 1) {
        this.moving = false;
        this.pixelX = this.toX;
        this.pixelY = this.toY;
        this.walkFrame = 0;
        arrived = true;
      }
    }
    return arrived;
  }

  setTile(pos: Position): void {
    this.tile = { ...pos };
    this.pixelX = pos.x * TILE_SIZE;
    this.pixelY = pos.y * TILE_SIZE;
    this.moving = false;
  }

  facingTile(): Position {
    const d = directionDelta(this.direction);
    return { x: this.tile.x + d.x, y: this.tile.y + d.y };
  }
}
