import type { MapData } from '../../types/map';
import type { Direction, Position } from '../../types/common';
import type { WeatherState } from '../../types/save';
import { TILE_SIZE, VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from '../../types/common';
import { tileDefs, TILE } from '../../data/tiles';
import type { Camera } from './Camera';

export interface RenderActor {
  x: number;
  y: number;
  pixelX: number;
  pixelY: number;
  direction: Direction;
  color: string;
  gender?: 'male' | 'female';
  appearance?: 'developer';
  name?: string;
  walkFrame: number;
  isPlayer?: boolean;
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private animTime = 0;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context');
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
  }

  update(dt: number): void {
    this.animTime += dt;
  }

  clear(): void {
    this.ctx.fillStyle = '#0a0a12';
    this.ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
  }

  /**
   * Layered overworld render:
   * Ground → decorations/objects (base) → building labels →
   * (actors drawn separately, Y-sorted) → foreground canopies → night
   */
  renderMap(map: MapData, camera: Camera, isNight: boolean, phase: 'base' | 'foreground' = 'base'): void {
    const camX = camera.renderX;
    const camY = camera.renderY;
    const startCol = Math.floor(camX / TILE_SIZE);
    const startRow = Math.floor(camY / TILE_SIZE);
    const endCol = Math.min(map.width, startCol + Math.ceil(VIEWPORT_WIDTH / TILE_SIZE) + 1);
    const endRow = Math.min(map.height, startRow + Math.ceil(VIEWPORT_HEIGHT / TILE_SIZE) + 1);

    for (let row = Math.max(0, startRow); row < endRow; row++) {
      for (let col = Math.max(0, startCol); col < endCol; col++) {
        const tileId = map.tiles[row][col];
        const def = tileDefs[tileId];
        if (!def) continue;
        const sx = Math.round(col * TILE_SIZE - camX);
        const sy = Math.round(row * TILE_SIZE - camY);
        if (phase === 'base') {
          this.drawTileBase(sx, sy, tileId, def.color, def.accent);
        } else if (def.foreground || tileId === TILE.TREE || tileId === TILE.ROOF) {
          this.drawTileForeground(sx, sy, tileId, def.color, def.accent);
        }
      }
    }

    if (phase === 'base') {
      for (const b of map.buildings) {
        this.drawBuildingFacade(map, b, camX, camY);
      }
    }

    if (phase === 'foreground' && isNight && !map.isInterior) {
      this.ctx.fillStyle = 'rgba(10, 15, 40, 0.45)';
      this.ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
    }
  }

  private drawBuildingFacade(
    map: MapData,
    b: MapData['buildings'][number],
    camX: number,
    camY: number,
  ): void {
    const sx = Math.round(b.position.x * TILE_SIZE - camX);
    const sy = Math.round(b.position.y * TILE_SIZE - camY);
    const w = b.width * TILE_SIZE;
    const h = b.height * TILE_SIZE;
    const roof = b.roofColor ?? b.color;
    const wall = b.color;
    const wallDark = this.shadeColor(wall, -28);
    const wallLight = this.shadeColor(wall, 28);
    const roofDark = this.shadeColor(roof, -35);
    const roofLight = this.shadeColor(roof, 30);
    const doorX = sx + (b.door.x - b.position.x) * TILE_SIZE;
    const doorY = sy + (b.door.y - b.position.y) * TILE_SIZE;

    // Soft ground shadow.
    this.ctx.fillStyle = 'rgba(0,0,0,0.28)';
    this.ctx.fillRect(sx + 4, sy + h - 5, w - 8, 7);

    // Wall body with border and subtle side depth.
    this.ctx.fillStyle = wallDark;
    this.ctx.fillRect(sx + 1, sy + 12, w - 2, h - 14);
    this.ctx.fillStyle = wall;
    this.ctx.fillRect(sx + 3, sy + 14, w - 6, h - 18);
    this.ctx.fillStyle = wallLight;
    this.ctx.fillRect(sx + 5, sy + 16, w - 10, 2);
    this.ctx.fillStyle = 'rgba(255,255,255,0.12)';
    this.ctx.fillRect(sx + 4, sy + 15, 2, h - 22);
    this.ctx.fillStyle = 'rgba(0,0,0,0.16)';
    this.ctx.fillRect(sx + w - 6, sy + 15, 3, h - 22);

    // Pixel brick / panel lines.
    this.ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let row = sy + 25; row < sy + h - 9; row += 14) {
      this.ctx.fillRect(sx + 5, row, w - 10, 1);
    }
    this.ctx.fillStyle = 'rgba(0,0,0,0.12)';
    for (let col = sx + 18; col < sx + w - 8; col += 32) {
      this.ctx.fillRect(col, sy + 16, 1, h - 26);
    }

    // Layered roof with eaves.
    this.ctx.fillStyle = roofDark;
    this.ctx.fillRect(sx - 2, sy + 6, w + 4, 12);
    this.ctx.fillStyle = roof;
    this.ctx.fillRect(sx, sy + 2, w, 12);
    this.ctx.fillStyle = roofLight;
    this.ctx.fillRect(sx + 3, sy + 4, w - 6, 3);
    this.ctx.fillStyle = 'rgba(0,0,0,0.25)';
    this.ctx.fillRect(sx - 2, sy + 15, w + 4, 3);

    // Windows on each interior column row, skipping the door column.
    for (let i = 1; i < b.width - 1; i++) {
      const tx = b.position.x + i;
      const ty = b.position.y + 1;
      if (ty >= map.height || tx >= map.width) continue;
      if (map.tiles[ty]?.[tx] === TILE.DOOR) continue;
      if (b.door.x === tx) continue;
      const wx = sx + i * TILE_SIZE + 9;
      const wy = sy + TILE_SIZE + 1;
      this.drawBuildingWindow(wx, wy, i);
      if (b.height >= 5) {
        this.drawBuildingWindow(wx, wy + TILE_SIZE, i + 3);
      }
    }

    // Door with frame, threshold, and highlight.
    this.ctx.fillStyle = '#2b1a12';
    this.ctx.fillRect(doorX + 5, doorY + 1, 22, 31);
    this.ctx.fillStyle = '#6b4423';
    this.ctx.fillRect(doorX + 8, doorY + 5, 16, 27);
    this.ctx.fillStyle = '#8b5a32';
    this.ctx.fillRect(doorX + 10, doorY + 7, 12, 6);
    this.ctx.fillStyle = '#f5d76e';
    this.ctx.fillRect(doorX + 20, doorY + 18, 2, 3);
    this.ctx.fillStyle = 'rgba(255,255,255,0.14)';
    this.ctx.fillRect(doorX + 10, doorY + 6, 2, 22);
    this.ctx.fillStyle = 'rgba(0,0,0,0.34)';
    this.ctx.fillRect(doorX + 4, doorY + 30, 24, 3);

    // Name plate, centered and framed.
    const plateW = Math.min(w - 10, Math.max(34, b.name.length * 5 + 10));
    const plateX = sx + Math.floor((w - plateW) / 2);
    this.ctx.fillStyle = 'rgba(7,10,18,0.78)';
    this.ctx.fillRect(plateX, sy + 6, plateW, 9);
    this.ctx.strokeStyle = 'rgba(245,215,110,0.85)';
    this.ctx.strokeRect(plateX + 0.5, sy + 6.5, plateW - 1, 8);
    this.ctx.fillStyle = '#f0e6d0';
    this.ctx.font = '6px monospace';
    this.ctx.fillText(b.name, plateX + 5, sy + 13);
  }

  private drawBuildingWindow(x: number, y: number, seed: number): void {
    const lit = Math.sin(this.animTime * 1.4 + seed * 1.7) > -0.35;
    this.ctx.fillStyle = '#203142';
    this.ctx.fillRect(x - 2, y - 2, 12, 12);
    this.ctx.fillStyle = lit ? '#f5d76e' : '#5a718a';
    this.ctx.fillRect(x, y, 8, 8);
    this.ctx.fillStyle = lit ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.18)';
    this.ctx.fillRect(x + 1, y + 1, 3, 2);
    this.ctx.fillStyle = 'rgba(0,0,0,0.25)';
    this.ctx.fillRect(x + 3, y, 1, 8);
    this.ctx.fillRect(x, y + 4, 8, 1);
  }

  private shadeColor(color: string, amount: number): string {
    if (!color.startsWith('#') || color.length !== 7) return color;
    const num = Number.parseInt(color.slice(1), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 255) + amount));
    const b = Math.max(0, Math.min(255, (num & 255) + amount));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  /** Ground + object base (tree trunks, walls, grass) */
  private drawTileBase(x: number, y: number, id: number, color: string, accent?: string): void {
    if (id === TILE.TREE) {
      // Grass under + trunk only; canopy in foreground
      this.ctx.fillStyle = '#4a8c3f';
      this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      this.ctx.fillStyle = '#5c4033';
      this.ctx.fillRect(x + 13, y + 18, 6, 12);
      return;
    }
    if (id === TILE.ROOF) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      return;
    }

    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    if (id === TILE.GRASS || id === TILE.TALL_GRASS || id === TILE.FLOWER) {
      this.drawCircuitGround(x, y, color, accent);
      if (id === TILE.TALL_GRASS) {
        this.drawServerPatch(x, y);
      }
      if (id === TILE.FLOWER) {
        this.drawDataBeacon(x, y);
      }
    } else if (id === TILE.WATER || id === TILE.WATER_DEEP) {
      this.ctx.fillStyle = accent ?? color;
      const ox = Math.floor(Math.sin(this.animTime * 3 + y) * 3);
      this.ctx.fillRect(x + 6 + ox, y + 10, 10, 2);
      this.ctx.fillRect(x + 14 - ox, y + 20, 12, 2);
    } else if (id === TILE.FOUNTAIN) {
      this.ctx.fillStyle = '#7a8a9a';
      this.ctx.fillRect(x + 4, y + 20, 24, 8);
      this.ctx.fillStyle = accent ?? '#3a7ca5';
      this.ctx.fillRect(x + 8, y + 8, 16, 14);
      const splash = Math.floor(Math.sin(this.animTime * 5) * 2);
      this.ctx.fillStyle = '#a8d8f0';
      this.ctx.fillRect(x + 14, y + 4 + splash, 4, 6);
      this.ctx.fillRect(x + 10, y + 10, 3, 3);
      this.ctx.fillRect(x + 19, y + 12, 3, 3);
    } else if (id === TILE.BENCH) {
      this.ctx.fillStyle = accent ?? '#8b6914';
      this.ctx.fillRect(x + 4, y + 14, 24, 6);
      this.ctx.fillStyle = '#5c4510';
      this.ctx.fillRect(x + 6, y + 20, 4, 8);
      this.ctx.fillRect(x + 22, y + 20, 4, 8);
    } else if (id === TILE.COUNTER) {
      // Desk top + front lip
      this.ctx.fillStyle = '#e8d4a8';
      this.ctx.fillRect(x, y + 8, TILE_SIZE, 16);
      this.ctx.fillStyle = accent ?? '#8b6914';
      this.ctx.fillRect(x, y + 22, TILE_SIZE, 6);
      this.ctx.fillStyle = '#f5e6c8';
      this.ctx.fillRect(x + 2, y + 10, TILE_SIZE - 4, 3);
    } else if (id === TILE.SHELF) {
      this.ctx.fillStyle = '#5c4033';
      this.ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
      this.ctx.fillStyle = accent ?? '#4a6220';
      this.ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, 6);
      this.ctx.fillRect(x + 4, y + 13, TILE_SIZE - 8, 6);
      this.ctx.fillRect(x + 4, y + 22, TILE_SIZE - 8, 6);
      this.ctx.fillStyle = '#c0392b';
      this.ctx.fillRect(x + 6, y + 5, 4, 4);
      this.ctx.fillStyle = '#3498db';
      this.ctx.fillRect(x + 14, y + 14, 4, 4);
      this.ctx.fillStyle = '#f1c40f';
      this.ctx.fillRect(x + 20, y + 23, 4, 4);
    } else if (id === TILE.MACHINE) {
      // Code Center heal pods
      this.ctx.fillStyle = '#f8f0f8';
      this.ctx.fillRect(x + 4, y + 4, 24, 24);
      this.ctx.fillStyle = accent ?? '#e8a0bf';
      this.ctx.fillRect(x + 8, y + 8, 16, 12);
      const pulse = Math.floor(Math.sin(this.animTime * 4) * 1.5);
      this.ctx.fillStyle = '#fff';
      this.ctx.fillRect(x + 12, y + 10 + pulse, 8, 4);
      this.ctx.fillStyle = '#c0392b';
      this.ctx.fillRect(x + 14, y + 22, 4, 4);
    } else if (id === TILE.COMPUTER) {
      // Floor under desk
      this.ctx.fillStyle = '#d4c4a8';
      this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      // Desk
      this.ctx.fillStyle = '#6d5210';
      this.ctx.fillRect(x + 1, y + 20, 30, 10);
      this.ctx.fillStyle = '#8b6914';
      this.ctx.fillRect(x + 1, y + 20, 30, 3);
      // Monitor bezel
      this.ctx.fillStyle = '#1e1e28';
      this.ctx.fillRect(x + 5, y + 2, 22, 16);
      // Screen
      const blink = Math.sin(this.animTime * 3) > 0.7;
      this.ctx.fillStyle = accent ?? '#3ecf8e';
      this.ctx.fillRect(x + 7, y + 4, 18, 12);
      this.ctx.fillStyle = '#0a2018';
      this.ctx.fillRect(x + 8, y + 5, 16, 10);
      // Terminal text lines
      this.ctx.fillStyle = accent ?? '#3ecf8e';
      this.ctx.fillRect(x + 9, y + 6, 10, 1);
      this.ctx.fillRect(x + 9, y + 9, 14, 1);
      this.ctx.fillRect(x + 9, y + 12, 8, 1);
      if (blink) this.ctx.fillRect(x + 18, y + 12, 2, 2);
      // Stand
      this.ctx.fillStyle = '#2a2a32';
      this.ctx.fillRect(x + 14, y + 17, 4, 3);
      this.ctx.fillRect(x + 10, y + 19, 12, 2);
      // Keyboard
      this.ctx.fillStyle = '#222230';
      this.ctx.fillRect(x + 6, y + 23, 20, 5);
      this.ctx.fillStyle = '#3a3a48';
      for (let kx = 0; kx < 5; kx++) {
        this.ctx.fillRect(x + 8 + kx * 3, y + 24, 2, 2);
      }
      // Tower / CPU on side
      this.ctx.fillStyle = '#2a2a32';
      this.ctx.fillRect(x + 26, y + 10, 5, 12);
      this.ctx.fillStyle = blink ? '#3ecf8e' : '#1a5a3a';
      this.ctx.fillRect(x + 27, y + 12, 2, 2);
    } else if (id === TILE.FENCE) {
      this.ctx.fillStyle = accent ?? '#5c4510';
      this.ctx.fillRect(x + 2, y + 10, 28, 3);
      this.ctx.fillRect(x + 2, y + 20, 28, 3);
      this.ctx.fillRect(x + 6, y + 8, 3, 18);
      this.ctx.fillRect(x + 23, y + 8, 3, 18);
    } else if (id === TILE.SIGN) {
      this.ctx.fillStyle = '#5c4510';
      this.ctx.fillRect(x + 14, y + 14, 4, 14);
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x + 6, y + 4, 20, 12);
      this.ctx.fillStyle = '#f0e6d0';
      this.ctx.fillRect(x + 8, y + 6, 16, 2);
      this.ctx.fillRect(x + 8, y + 10, 10, 2);
    } else if (id === TILE.WALL || id === TILE.WALL_ALT || id === TILE.BUILDING) {
      this.ctx.fillStyle = accent ?? '#333';
      this.ctx.fillRect(x, y + TILE_SIZE - 4, TILE_SIZE, 4);
      this.ctx.fillRect(x, y, TILE_SIZE, 3);
    } else if (id === TILE.PATH || id === TILE.BRIDGE || id === TILE.SAND) {
      this.ctx.fillStyle = accent ?? color;
      this.ctx.fillRect(x + 8, y + 8, 2, 2);
      this.ctx.fillRect(x + 20, y + 18, 2, 2);
    } else if (id === TILE.DOOR) {
      this.ctx.fillStyle = accent ?? '#3a2010';
      this.ctx.fillRect(x + 6, y + 4, 20, 28);
      this.ctx.fillStyle = '#f5d76e';
      this.ctx.fillRect(x + 20, y + 16, 3, 3);
    } else if (id === TILE.CARPET) {
      this.ctx.strokeStyle = accent ?? '#fff';
      this.ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    }
  }

  private drawCircuitGround(x: number, y: number, color: string, accent?: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    this.ctx.fillStyle = 'rgba(10, 30, 24, 0.22)';
    this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    this.ctx.fillStyle = accent ?? '#5da34f';
    this.ctx.fillRect(x + 3, y + 7, 10, 1);
    this.ctx.fillRect(x + 12, y + 7, 1, 8);
    this.ctx.fillRect(x + 18, y + 20, 11, 1);
    this.ctx.fillRect(x + 18, y + 14, 1, 7);
    this.ctx.fillRect(x + 5, y + 24, 8, 1);
    this.ctx.fillRect(x + 25, y + 4, 1, 7);

    const pulse = Math.sin(this.animTime * 3 + x * 0.2 + y * 0.13) > 0.55;
    this.ctx.fillStyle = pulse ? '#8cffc1' : '#2f7a55';
    this.ctx.fillRect(x + 11, y + 6, 3, 3);
    this.ctx.fillRect(x + 17, y + 19, 3, 3);
    this.ctx.fillRect(x + 24, y + 10, 3, 3);
  }

  private drawServerPatch(x: number, y: number): void {
    this.ctx.fillStyle = 'rgba(6, 12, 18, 0.34)';
    this.ctx.fillRect(x + 2, y + 4, 28, 24);

    const blinkA = Math.sin(this.animTime * 5 + x) > 0;
    const blinkB = Math.sin(this.animTime * 7 + y) > 0.35;
    const racks = [
      { x: 4, y: 5, h: 22 },
      { x: 13, y: 2, h: 26 },
      { x: 22, y: 6, h: 21 },
    ];

    for (const rack of racks) {
      this.ctx.fillStyle = '#182231';
      this.ctx.fillRect(x + rack.x, y + rack.y, 7, rack.h);
      this.ctx.fillStyle = '#2f3d52';
      this.ctx.fillRect(x + rack.x + 1, y + rack.y + 2, 5, rack.h - 4);
      this.ctx.fillStyle = '#0b111a';
      for (let slot = 0; slot < rack.h - 6; slot += 5) {
        this.ctx.fillRect(x + rack.x + 2, y + rack.y + 4 + slot, 3, 1);
      }
      this.ctx.fillStyle = blinkA ? '#3ecf8e' : '#1f6feb';
      this.ctx.fillRect(x + rack.x + 1, y + rack.y + 4, 1, 2);
      this.ctx.fillStyle = blinkB ? '#f5d76e' : '#2ecc71';
      this.ctx.fillRect(x + rack.x + 5, y + rack.y + rack.h - 6, 1, 2);
    }

    const flow = Math.floor((this.animTime * 8 + x + y) % 10);
    this.ctx.fillStyle = '#3ecf8e';
    this.ctx.fillRect(x + 8 + flow, y + 29, 2, 1);
    this.ctx.fillRect(x + 16 - Math.floor(flow / 2), y + 1, 2, 1);
    this.ctx.fillStyle = 'rgba(62, 207, 142, 0.36)';
    this.ctx.fillRect(x + 5, y + 29, 22, 1);
    this.ctx.fillRect(x + 5, y + 1, 22, 1);
  }

  private drawDataBeacon(x: number, y: number): void {
    const pulse = Math.floor(Math.sin(this.animTime * 5 + x) * 2);
    this.ctx.fillStyle = '#182231';
    this.ctx.fillRect(x + 10, y + 11, 12, 12);
    this.ctx.fillStyle = '#3ecf8e';
    this.ctx.fillRect(x + 13, y + 14 + pulse, 6, 3);
    this.ctx.fillStyle = '#f5d76e';
    this.ctx.fillRect(x + 15, y + 16 + pulse, 2, 2);
    this.ctx.strokeStyle = 'rgba(62, 207, 142, 0.5)';
    this.ctx.strokeRect(x + 8, y + 9, 16, 16);
  }

  /** Tree canopies / roof tops drawn after characters for depth */
  private drawTileForeground(
    x: number,
    y: number,
    id: number,
    color: string,
    accent?: string,
  ): void {
    if (id === TILE.TREE) {
      this.ctx.fillStyle = accent ?? '#1e3d1a';
      this.ctx.fillRect(x + 4, y + 0, 24, 18);
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x + 8, y + 4, 16, 12);
      this.ctx.fillStyle = '#3d7a35';
      this.ctx.fillRect(x + 10, y + 6, 4, 4);
      return;
    }
    if (id === TILE.ROOF) {
      this.ctx.fillStyle = accent ?? color;
      this.ctx.fillRect(x, y + 20, TILE_SIZE, 6);
    }
  }

  renderActors(actors: RenderActor[], camera: Camera): void {
    const camX = camera.renderX;
    const camY = camera.renderY;
    const sorted = [...actors].sort((a, b) => a.pixelY - b.pixelY || a.pixelX - b.pixelX);
    for (const actor of sorted) {
      const sx = Math.round(actor.pixelX - camX);
      const sy = Math.round(actor.pixelY - camY);
      this.drawCharacter(sx, sy, actor);
    }
  }

  renderWeather(weather: WeatherState, isInterior?: boolean): void {
    if (isInterior || weather !== 'rain') return;

    this.ctx.save();
    this.ctx.fillStyle = 'rgba(8, 18, 34, 0.18)';
    this.ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    this.ctx.fillStyle = 'rgba(155, 190, 220, 0.08)';
    for (let y = 0; y < VIEWPORT_HEIGHT; y += 26) {
      this.ctx.fillRect(0, y + Math.sin(this.animTime * 1.4 + y) * 2, VIEWPORT_WIDTH, 1);
    }

    this.drawRainLayer(54, 260, 18, 0.34, 0.45);
    this.drawRainLayer(76, 390, 25, 0.66, 0.8);

    const splashPhase = Math.floor(this.animTime * 18);
    this.ctx.strokeStyle = 'rgba(190, 225, 255, 0.32)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < 26; i++) {
      const x = (i * 73 + splashPhase * 11) % VIEWPORT_WIDTH;
      const y = VIEWPORT_HEIGHT - 18 - ((i * 19 + splashPhase) % 80);
      const width = 4 + ((i * 7 + splashPhase) % 10);
      this.ctx.beginPath();
      this.ctx.moveTo(x - width, y);
      this.ctx.quadraticCurveTo(x, y - 2, x + width, y);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  private drawRainLayer(
    count: number,
    speed: number,
    length: number,
    alpha: number,
    width: number,
  ): void {
    this.ctx.strokeStyle = `rgba(185, 220, 255, ${alpha})`;
    this.ctx.lineWidth = width;
    for (let i = 0; i < count; i++) {
      const seed = i * 97;
      const drift = ((seed * 37) % 53) - 26;
      const localLength = length + (seed % 12);
      const y = (seed * 29 + this.animTime * speed) % (VIEWPORT_HEIGHT + 80) - 40;
      const x =
        (seed * 53 + Math.sin(this.animTime * 1.7 + i) * 18 + drift) %
        (VIEWPORT_WIDTH + 80);
      const sx = x - 40;
      this.ctx.beginPath();
      this.ctx.moveTo(sx, y);
      this.ctx.lineTo(sx - localLength * 0.42, y + localLength);
      this.ctx.stroke();
    }
  }

  private drawCharacter(sx: number, sy: number, actor: RenderActor): void {
    if (actor.isPlayer) {
      this.drawPlayer(sx, sy, actor);
      return;
    }
    this.drawNpc(sx, sy, actor);
  }

  /** Distinct junior-engineer look: teal hoodie, amber backpack, messy hair */
  private drawPlayer(sx: number, sy: number, actor: RenderActor): void {
    // 4-frame walk: 0 idle, 1/3 step, 2 mid
    const frame = actor.walkFrame % 4;
    const bob = frame === 1 || frame === 3 ? 1 : 0;
    const leg = frame === 0 ? 0 : frame === 2 ? 2 : 1;

    // shadow
    this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
    this.ctx.fillRect(sx + 7, sy + 28, 18, 4);

    // backpack (visible when facing up / left / right)
    if (actor.direction !== 'down') {
      this.ctx.fillStyle = '#c97b2a';
      this.ctx.fillRect(sx + 9, sy + 12 - bob, 14, 10);
      this.ctx.fillStyle = '#8a5018';
      this.ctx.fillRect(sx + 11, sy + 14 - bob, 10, 2);
    }

    // hoodie body (teal — not NPC solid color block)
    this.ctx.fillStyle = '#1fa87a';
    this.ctx.fillRect(sx + 8, sy + 11 - bob, 16, 13);
    // hoodie pouch
    this.ctx.fillStyle = '#178a64';
    this.ctx.fillRect(sx + 11, sy + 17 - bob, 10, 5);
    // hoodie strings
    this.ctx.fillStyle = '#e8eef8';
    this.ctx.fillRect(sx + 13, sy + 12 - bob, 1, 4);
    this.ctx.fillRect(sx + 18, sy + 12 - bob, 1, 4);

    // arms / sleeves
    this.ctx.fillStyle = '#1fa87a';
    if (actor.direction === 'left') {
      this.ctx.fillRect(sx + 4, sy + 13 - bob, 5, 8);
    } else if (actor.direction === 'right') {
      this.ctx.fillRect(sx + 23, sy + 13 - bob, 5, 8);
    } else {
      this.ctx.fillRect(sx + 5, sy + 13 - bob, 4, 7);
      this.ctx.fillRect(sx + 23, sy + 13 - bob, 4, 7);
    }

    // head
    this.ctx.fillStyle = '#e8b89a';
    this.ctx.fillRect(sx + 10, sy + 2 - bob, 12, 10);

    // messy auburn hair + side fringe
    this.ctx.fillStyle = '#6b2d1a';
    this.ctx.fillRect(sx + 9, sy + 0 - bob, 14, 5);
    this.ctx.fillRect(sx + 8, sy + 3 - bob, 3, 5);
    this.ctx.fillRect(sx + 21, sy + 3 - bob, 3, 4);
    this.ctx.fillRect(sx + 12, sy + 1 - bob, 3, 2);

    // eyes + tiny highlight
    this.ctx.fillStyle = '#1a1a1a';
    if (actor.direction === 'left') {
      this.ctx.fillRect(sx + 11, sy + 6 - bob, 2, 2);
      this.ctx.fillStyle = '#fff';
      this.ctx.fillRect(sx + 11, sy + 6 - bob, 1, 1);
    } else if (actor.direction === 'right') {
      this.ctx.fillRect(sx + 19, sy + 6 - bob, 2, 2);
      this.ctx.fillStyle = '#fff';
      this.ctx.fillRect(sx + 20, sy + 6 - bob, 1, 1);
    } else if (actor.direction === 'up') {
      // back of head — hair only
    } else {
      this.ctx.fillRect(sx + 12, sy + 6 - bob, 2, 2);
      this.ctx.fillRect(sx + 18, sy + 6 - bob, 2, 2);
      this.ctx.fillStyle = '#fff';
      this.ctx.fillRect(sx + 12, sy + 6 - bob, 1, 1);
      this.ctx.fillRect(sx + 18, sy + 6 - bob, 1, 1);
    }

    // jeans + sneakers
    this.ctx.fillStyle = '#2a3f6b';
    this.ctx.fillRect(sx + 10, sy + 24, 5, 5 + (leg ? 0 : 1));
    this.ctx.fillRect(sx + 17, sy + 24, 5, 5 + (leg ? 1 : 0));
    this.ctx.fillStyle = '#e8eef8';
    this.ctx.fillRect(sx + 10, sy + 29, 5, 2);
    this.ctx.fillRect(sx + 17, sy + 29, 5, 2);

    // backpack when facing down (straps only)
    if (actor.direction === 'down') {
      this.ctx.fillStyle = '#c97b2a';
      this.ctx.fillRect(sx + 9, sy + 12 - bob, 2, 8);
      this.ctx.fillRect(sx + 21, sy + 12 - bob, 2, 8);
    }
  }

  private drawNpc(sx: number, sy: number, actor: RenderActor): void {
    if (actor.name === 'UJJWAL') {
      this.drawLargeNpc(sx, sy, actor);
      return;
    }
    if (actor.appearance === 'developer') {
      this.drawDeveloperNpc(sx, sy, actor);
      return;
    }

    const bob = actor.walkFrame % 2 === 1 ? 1 : 0;
    // shadow
    this.ctx.fillStyle = 'rgba(0,0,0,0.25)';
    this.ctx.fillRect(sx + 8, sy + 28, 16, 4);

    const isFemale = actor.gender === 'female';

    // body
    this.ctx.fillStyle = actor.color;
    if (isFemale) {
      this.ctx.fillRect(sx + 9, sy + 10 - bob, 14, 10);
      this.ctx.fillRect(sx + 7, sy + 20 - bob, 18, 5);
    } else {
      this.ctx.fillRect(sx + 7, sy + 10 - bob, 18, 14);
      this.ctx.fillStyle = 'rgba(0,0,0,0.16)';
      this.ctx.fillRect(sx + 8, sy + 10 - bob, 16, 3);
    }

    // head
    this.ctx.fillStyle = '#f5d0a9';
    this.ctx.fillRect(sx + 10, sy + 2 - bob, 12, 10);

    // hair
    this.ctx.fillStyle = isFemale ? '#4b2418' : '#1a1a1a';
    if (isFemale) {
      this.ctx.fillRect(sx + 9, sy + 0 - bob, 14, 5);
      this.ctx.fillRect(sx + 8, sy + 4 - bob, 4, 9);
      this.ctx.fillRect(sx + 20, sy + 4 - bob, 4, 9);
      this.ctx.fillStyle = '#6b3322';
      this.ctx.fillRect(sx + 14, sy + 1 - bob, 5, 2);
    } else {
      this.ctx.fillRect(sx + 10, sy + 1 - bob, 12, 3);
      this.ctx.fillRect(sx + 9, sy + 3 - bob, 3, 3);
    }

    // eyes facing direction
    this.ctx.fillStyle = '#1a1a1a';
    if (actor.direction === 'left') {
      this.ctx.fillRect(sx + 11, sy + 6 - bob, 2, 2);
    } else if (actor.direction === 'right') {
      this.ctx.fillRect(sx + 19, sy + 6 - bob, 2, 2);
    } else if (actor.direction === 'up') {
      this.ctx.fillRect(sx + 12, sy + 5 - bob, 2, 2);
      this.ctx.fillRect(sx + 18, sy + 5 - bob, 2, 2);
    } else {
      this.ctx.fillRect(sx + 12, sy + 6 - bob, 2, 2);
      this.ctx.fillRect(sx + 18, sy + 6 - bob, 2, 2);
    }

    if (isFemale && actor.direction !== 'up') {
      this.ctx.fillStyle = '#f6d365';
      this.ctx.fillRect(sx + 9, sy + 8 - bob, 1, 2);
      this.ctx.fillRect(sx + 22, sy + 8 - bob, 1, 2);
    }

    // legs
    const legOffset = actor.walkFrame % 2 === 0 ? 0 : 2;
    if (isFemale) {
      this.ctx.fillStyle = '#2c3e50';
      this.ctx.fillRect(sx + 10, sy + 25, 4, 5 + (legOffset ? 0 : 1));
      this.ctx.fillRect(sx + 18, sy + 25, 4, 5 + (legOffset ? 1 : 0));
      this.ctx.fillStyle = '#202a36';
      this.ctx.fillRect(sx + 9, sy + 30, 5, 2);
      this.ctx.fillRect(sx + 18, sy + 30, 5, 2);
    } else {
      this.ctx.fillStyle = '#2c3e50';
      this.ctx.fillRect(sx + 9, sy + 24, 6, 6 + (legOffset ? 0 : 1));
      this.ctx.fillRect(sx + 17, sy + 24, 6, 6 + (legOffset ? 1 : 0));
      this.ctx.fillStyle = '#202a36';
      this.ctx.fillRect(sx + 8, sy + 30, 7, 2);
      this.ctx.fillRect(sx + 17, sy + 30, 7, 2);
    }
  }

  private drawDeveloperNpc(sx: number, sy: number, actor: RenderActor): void {
    const bob = actor.walkFrame % 2 === 1 ? 1 : 0;
    const coat = '#f7f2df';
    const shirt = '#1f6feb';
    const trim = '#f39c12';

    this.ctx.fillStyle = 'rgba(0,0,0,0.32)';
    this.ctx.fillRect(sx + 6, sy + 28, 20, 4);

    // Laptop backpack / creator kit.
    if (actor.direction !== 'down') {
      this.ctx.fillStyle = '#2c3e50';
      this.ctx.fillRect(sx + 8, sy + 11 - bob, 16, 13);
      this.ctx.fillStyle = trim;
      this.ctx.fillRect(sx + 10, sy + 13 - bob, 12, 2);
    }

    // Long cream developer jacket over blue shirt.
    this.ctx.fillStyle = coat;
    this.ctx.fillRect(sx + 7, sy + 10 - bob, 18, 16);
    this.ctx.fillStyle = shirt;
    this.ctx.fillRect(sx + 11, sy + 11 - bob, 10, 13);
    this.ctx.fillStyle = trim;
    this.ctx.fillRect(sx + 8, sy + 10 - bob, 2, 16);
    this.ctx.fillRect(sx + 22, sy + 10 - bob, 2, 16);
    this.ctx.fillRect(sx + 12, sy + 15 - bob, 8, 2);

    // Arms with rolled sleeves.
    this.ctx.fillStyle = coat;
    this.ctx.fillRect(sx + 4, sy + 13 - bob, 4, 9);
    this.ctx.fillRect(sx + 24, sy + 13 - bob, 4, 9);
    this.ctx.fillStyle = '#e8b89a';
    this.ctx.fillRect(sx + 4, sy + 21 - bob, 4, 3);
    this.ctx.fillRect(sx + 24, sy + 21 - bob, 4, 3);

    // Floating dev badge.
    this.ctx.fillStyle = '#111827';
    this.ctx.fillRect(sx + 1, sy + 8 - bob, 7, 6);
    this.ctx.fillStyle = '#3ecf8e';
    this.ctx.fillRect(sx + 2, sy + 10 - bob, 5, 1);
    this.ctx.fillRect(sx + 3, sy + 12 - bob, 3, 1);

    // Head and styled hair.
    this.ctx.fillStyle = '#e8b89a';
    this.ctx.fillRect(sx + 10, sy + 2 - bob, 12, 10);
    this.ctx.fillStyle = '#2b1b12';
    this.ctx.fillRect(sx + 9, sy + 0 - bob, 14, 5);
    this.ctx.fillRect(sx + 8, sy + 3 - bob, 3, 4);
    this.ctx.fillRect(sx + 20, sy + 2 - bob, 4, 4);
    this.ctx.fillStyle = '#7c4a25';
    this.ctx.fillRect(sx + 13, sy + 1 - bob, 5, 2);

    // Glasses.
    this.ctx.strokeStyle = '#111827';
    this.ctx.lineWidth = 1;
    if (actor.direction !== 'up') {
      this.ctx.strokeRect(sx + 11.5, sy + 5.5 - bob, 4, 3);
      this.ctx.strokeRect(sx + 17.5, sy + 5.5 - bob, 4, 3);
      this.ctx.fillStyle = '#111827';
      this.ctx.fillRect(sx + 16, sy + 7 - bob, 2, 1);
    }

    // Trousers and shoes.
    const legOffset = actor.walkFrame % 2 === 0 ? 0 : 1;
    this.ctx.fillStyle = '#243447';
    this.ctx.fillRect(sx + 9, sy + 25, 6, 5 + (legOffset ? 0 : 1));
    this.ctx.fillRect(sx + 17, sy + 25, 6, 5 + (legOffset ? 1 : 0));
    this.ctx.fillStyle = '#111827';
    this.ctx.fillRect(sx + 8, sy + 30, 7, 2);
    this.ctx.fillRect(sx + 17, sy + 30, 7, 2);
  }

  private drawLargeNpc(sx: number, sy: number, actor: RenderActor): void {
    const bob = actor.walkFrame % 2 === 1 ? 1 : 0;

    // Wider footprint, but still centered on the same tile for collision.
    this.ctx.fillStyle = 'rgba(0,0,0,0.32)';
    this.ctx.fillRect(sx + 0, sy + 28, 32, 5);

    // Broad body / shirt
    this.ctx.fillStyle = actor.color;
    this.ctx.fillRect(sx + 1, sy + 10 - bob, 30, 15);
    this.ctx.fillStyle = '#a86a38';
    this.ctx.fillRect(sx + 4, sy + 16 - bob, 24, 9);

    // Rounded belly highlight
    this.ctx.fillStyle = 'rgba(255,255,255,0.18)';
    this.ctx.fillRect(sx + 7, sy + 15 - bob, 18, 7);

    // Arms
    this.ctx.fillStyle = '#f5d0a9';
    if (actor.direction === 'left') {
      this.ctx.fillRect(sx - 1, sy + 14 - bob, 7, 10);
      this.ctx.fillRect(sx + 26, sy + 15 - bob, 6, 9);
    } else if (actor.direction === 'right') {
      this.ctx.fillRect(sx + 0, sy + 15 - bob, 6, 9);
      this.ctx.fillRect(sx + 27, sy + 14 - bob, 7, 10);
    } else {
      this.ctx.fillRect(sx - 1, sy + 14 - bob, 7, 10);
      this.ctx.fillRect(sx + 27, sy + 14 - bob, 7, 10);
    }

    // Larger head
    this.ctx.fillStyle = '#f5d0a9';
    this.ctx.fillRect(sx + 9, sy + 1 - bob, 14, 11);

    // Half-bald hairline
    this.ctx.fillStyle = '#f5d0a9';
    this.ctx.fillRect(sx + 11, sy + 0 - bob, 10, 4);
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(sx + 8, sy + 0 - bob, 4, 4);
    this.ctx.fillRect(sx + 20, sy + 0 - bob, 4, 4);
    this.ctx.fillRect(sx + 8, sy + 3 - bob, 3, 3);
    this.ctx.fillRect(sx + 21, sy + 3 - bob, 3, 3);
    this.ctx.fillStyle = 'rgba(255,255,255,0.28)';
    this.ctx.fillRect(sx + 14, sy + 1 - bob, 4, 1);

    // Eyes facing direction
    this.ctx.fillStyle = '#1a1a1a';
    if (actor.direction === 'left') {
      this.ctx.fillRect(sx + 11, sy + 6 - bob, 2, 2);
    } else if (actor.direction === 'right') {
      this.ctx.fillRect(sx + 20, sy + 6 - bob, 2, 2);
    } else if (actor.direction === 'up') {
      this.ctx.fillRect(sx + 12, sy + 5 - bob, 2, 2);
      this.ctx.fillRect(sx + 18, sy + 5 - bob, 2, 2);
    } else {
      this.ctx.fillRect(sx + 12, sy + 6 - bob, 2, 2);
      this.ctx.fillRect(sx + 18, sy + 6 - bob, 2, 2);
    }

    // Short legs
    this.ctx.fillStyle = '#2c3e50';
    const legOffset = actor.walkFrame % 2 === 0 ? 0 : 1;
    this.ctx.fillRect(sx + 7, sy + 25, 7, 5 + (legOffset ? 0 : 1));
    this.ctx.fillRect(sx + 18, sy + 25, 7, 5 + (legOffset ? 1 : 0));
    this.ctx.fillStyle = '#202a36';
    this.ctx.fillRect(sx + 6, sy + 30, 8, 2);
    this.ctx.fillRect(sx + 18, sy + 30, 8, 2);
  }

  renderLocationLabel(name: string): void {
    this.ctx.fillStyle = 'rgba(10,10,20,0.7)';
    this.ctx.fillRect(8, 8, name.length * 7 + 16, 18);
    this.ctx.strokeStyle = '#f0e6d0';
    this.ctx.strokeRect(8.5, 8.5, name.length * 7 + 15, 17);
    this.ctx.fillStyle = '#f0e6d0';
    this.ctx.font = '10px monospace';
    this.ctx.fillText(name, 16, 21);
  }

  /** Screen fade for map/battle transitions (0 = clear, 1 = black) */
  renderFade(alpha: number): void {
    if (alpha <= 0) return;
    this.ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, alpha)})`;
    this.ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
  }

  /** Retro encounter wipe / flash stripes */
  renderBattleFlash(progress: number): void {
    const p = Math.min(1, Math.max(0, progress));
    this.ctx.fillStyle = `rgba(255, 255, 255, ${0.55 * (1 - p)})`;
    this.ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
    const bands = 8;
    const bandH = VIEWPORT_HEIGHT / bands;
    this.ctx.fillStyle = '#000';
    for (let i = 0; i < bands; i++) {
      const grow = p * VIEWPORT_WIDTH;
      if (i % 2 === 0) {
        this.ctx.fillRect(0, i * bandH, grow, bandH + 1);
      } else {
        this.ctx.fillRect(VIEWPORT_WIDTH - grow, i * bandH, grow, bandH + 1);
      }
    }
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }
}

export function tileToPixel(pos: Position): { x: number; y: number } {
  return { x: pos.x * TILE_SIZE, y: pos.y * TILE_SIZE };
}
