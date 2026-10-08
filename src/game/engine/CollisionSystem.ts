import type { MapData } from '../../types/map';
import { tileDefs } from '../../data/tiles';
import type { Position } from '../../types/common';

export class CollisionSystem {
  isWalkable(map: MapData, x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= map.width || y >= map.height) return false;
    return !map.collision[y][x];
  }

  blocksEntity(
    map: MapData,
    x: number,
    y: number,
    occupied: Position[],
    ignore?: Position,
  ): boolean {
    if (!this.isWalkable(map, x, y)) return true;
    return occupied.some(
      (p) => p.x === x && p.y === y && !(ignore && ignore.x === x && ignore.y === y),
    );
  }

  getTileKind(map: MapData, x: number, y: number): string | null {
    if (x < 0 || y < 0 || x >= map.width || y >= map.height) return null;
    return tileDefs[map.tiles[y][x]]?.kind ?? null;
  }

  isEncounterTile(map: MapData, x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= map.width || y >= map.height) return false;
    return tileDefs[map.tiles[y][x]]?.encounterable === true;
  }
}
