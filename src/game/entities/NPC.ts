import type { NPCDefinition } from '../../types/npc';
import type { Direction, Position } from '../../types/common';
import { MOVE_DURATION_MS, TILE_SIZE } from '../../types/common';
import { directionDelta } from '../engine/InputManager';

function easeInOut(t: number): number {
  return t * t * (3 - 2 * t);
}

export class NPCEntity {
  readonly def: NPCDefinition;
  tile: Position;
  pixelX: number;
  pixelY: number;
  direction: Direction;
  moving = false;
  walkFrame = 0;
  private fromX = 0;
  private fromY = 0;
  private toX = 0;
  private toY = 0;
  private moveElapsed = 0;
  private waitTimer = 0;
  private patrolIndex = 0;
  private randomTimer = 0;

  constructor(def: NPCDefinition) {
    this.def = def;
    this.tile = { ...def.position };
    this.pixelX = def.position.x * TILE_SIZE;
    this.pixelY = def.position.y * TILE_SIZE;
    this.direction = def.direction;
  }

  update(
    dt: number,
    canMoveTo: (x: number, y: number) => boolean,
    isNight: boolean,
  ): void {
    if (this.moving) {
      this.moveElapsed += dt * 1000;
      const t = Math.min(1, this.moveElapsed / MOVE_DURATION_MS);
      const eased = easeInOut(t);
      this.pixelX = this.fromX + (this.toX - this.fromX) * eased;
      this.pixelY = this.fromY + (this.toY - this.fromY) * eased;
      this.walkFrame = Math.floor(t * 4) % 4;
      if (t >= 1) {
        this.moving = false;
        this.pixelX = this.toX;
        this.pixelY = this.toY;
      }
      return;
    }

    const movement = this.def.movement ?? { kind: 'static' };
    // At night, NPCs move less
    const speedFactor = isNight ? 1.5 : 1;

    if (movement.kind === 'patrol') {
      this.waitTimer += dt;
      if (this.waitTimer < (movement.waitMs / 1000) * speedFactor) return;
      this.waitTimer = 0;
      const next = movement.points[(this.patrolIndex + 1) % movement.points.length];
      this.tryMoveToward(next, canMoveTo);
      this.patrolIndex = (this.patrolIndex + 1) % movement.points.length;
    } else if (movement.kind === 'horizontal') {
      this.randomTimer += dt;
      if (this.randomTimer < (movement.intervalMs / 1000) * speedFactor) return;
      this.randomTimer = 0;
      let dir: Direction =
        this.direction === 'left' || this.direction === 'right' ? this.direction : 'right';
      if (this.tile.x >= movement.maxX) dir = 'left';
      if (this.tile.x <= movement.minX) dir = 'right';
      this.tryStep(dir, canMoveTo);
    } else if (movement.kind === 'vertical') {
      this.randomTimer += dt;
      if (this.randomTimer < (movement.intervalMs / 1000) * speedFactor) return;
      this.randomTimer = 0;
      let dir: Direction =
        this.direction === 'up' || this.direction === 'down' ? this.direction : 'down';
      if (this.tile.y >= movement.maxY) dir = 'up';
      if (this.tile.y <= movement.minY) dir = 'down';
      this.tryStep(dir, canMoveTo);
    } else if (movement.kind === 'random') {
      this.randomTimer += dt;
      if (this.randomTimer < (movement.intervalMs / 1000) * speedFactor) return;
      this.randomTimer = 0;
      const dirs: Direction[] = ['up', 'down', 'left', 'right'];
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      const d = directionDelta(dir);
      const nx = this.tile.x + d.x;
      const ny = this.tile.y + d.y;
      const ox = this.def.position.x;
      const oy = this.def.position.y;
      if (Math.abs(nx - ox) <= movement.radius && Math.abs(ny - oy) <= movement.radius) {
        this.tryStep(dir, canMoveTo);
      }
    }
  }

  private tryMoveToward(target: Position, canMoveTo: (x: number, y: number) => boolean): void {
    let dir: Direction = this.direction;
    if (target.x > this.tile.x) dir = 'right';
    else if (target.x < this.tile.x) dir = 'left';
    else if (target.y > this.tile.y) dir = 'down';
    else if (target.y < this.tile.y) dir = 'up';
    this.tryStep(dir, canMoveTo);
  }

  tryStep(dir: Direction, canMoveTo: (x: number, y: number) => boolean): boolean {
    this.direction = dir;
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
}
