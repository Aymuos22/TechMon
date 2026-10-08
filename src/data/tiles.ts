import type { TileDef } from '../types/map';

export const TILE = {
  VOID: 0,
  GRASS: 1,
  PATH: 2,
  FLOOR: 3,
  WALL: 4,
  WATER: 5,
  TREE: 6,
  BRIDGE: 7,
  DOOR: 8,
  TALL_GRASS: 9,
  SAND: 10,
  BUILDING: 11,
  SIGN: 12,
  CARPET: 13,
  FLOWER: 14,
  FLOOR_DARK: 15,
  WALL_ALT: 16,
  WATER_DEEP: 17,
  FENCE: 18,
  ROOF: 19,
  FOUNTAIN: 20,
  BENCH: 21,
  COUNTER: 22,
  SHELF: 23,
  MACHINE: 24,
  COMPUTER: 25,
} as const;

export const tileDefs: Record<number, TileDef> = {
  [TILE.VOID]: { id: 0, kind: 'void', walkable: false, color: '#0a0a12' },
  [TILE.GRASS]: { id: 1, kind: 'grass', walkable: true, color: '#4a8c3f', accent: '#5da34f' },
  [TILE.PATH]: { id: 2, kind: 'path', walkable: true, color: '#c4a574', accent: '#b8956a' },
  [TILE.FLOOR]: { id: 3, kind: 'floor', walkable: true, color: '#d4c4a8', accent: '#cbb896' },
  [TILE.WALL]: { id: 4, kind: 'wall', walkable: false, color: '#5a4a3a', accent: '#3d3228' },
  [TILE.WATER]: {
    id: 5,
    kind: 'water',
    walkable: false,
    color: '#3a7ca5',
    accent: '#2e6a8f',
    water: true,
  },
  [TILE.TREE]: {
    id: 6,
    kind: 'tree',
    walkable: false,
    color: '#2d5a27',
    accent: '#1e3d1a',
    foreground: true,
  },
  [TILE.BRIDGE]: { id: 7, kind: 'bridge', walkable: true, color: '#8b6914', accent: '#6d5210' },
  [TILE.DOOR]: { id: 8, kind: 'door', walkable: true, color: '#6b4423', accent: '#4a2f18' },
  [TILE.TALL_GRASS]: {
    id: 9,
    kind: 'tall_grass',
    walkable: true,
    color: '#3d7a35',
    accent: '#2f5f29',
    encounterable: true,
  },
  [TILE.SAND]: { id: 10, kind: 'sand', walkable: true, color: '#e2d5a3', accent: '#d4c48a' },
  [TILE.BUILDING]: { id: 11, kind: 'building', walkable: false, color: '#7a8a9a', accent: '#5a6a7a' },
  [TILE.SIGN]: { id: 12, kind: 'sign', walkable: false, color: '#8b6914', accent: '#5c4510' },
  [TILE.CARPET]: { id: 13, kind: 'carpet', walkable: true, color: '#a33b5a', accent: '#8a2f4a' },
  [TILE.FLOWER]: { id: 14, kind: 'flower', walkable: true, color: '#4a8c3f', accent: '#e8a0bf' },
  [TILE.FLOOR_DARK]: { id: 15, kind: 'floor', walkable: true, color: '#3a3a48', accent: '#2e2e3a' },
  [TILE.WALL_ALT]: { id: 16, kind: 'wall', walkable: false, color: '#4a5568', accent: '#2d3748' },
  [TILE.WATER_DEEP]: {
    id: 17,
    kind: 'water',
    walkable: false,
    color: '#1e4d6b',
    accent: '#163a52',
    water: true,
  },
  [TILE.FENCE]: { id: 18, kind: 'fence', walkable: false, color: '#8b6914', accent: '#5c4510' },
  [TILE.ROOF]: {
    id: 19,
    kind: 'roof',
    walkable: false,
    color: '#8b3a3a',
    accent: '#6b2a2a',
    foreground: true,
  },
  [TILE.FOUNTAIN]: {
    id: 20,
    kind: 'fountain',
    walkable: false,
    color: '#5dade2',
    accent: '#3a7ca5',
  },
  [TILE.BENCH]: { id: 21, kind: 'bench', walkable: false, color: '#6d5210', accent: '#8b6914' },
  [TILE.COUNTER]: {
    id: 22,
    kind: 'counter',
    walkable: false,
    color: '#c4a574',
    accent: '#8b6914',
  },
  [TILE.SHELF]: {
    id: 23,
    kind: 'shelf',
    walkable: false,
    color: '#6b8e23',
    accent: '#4a6220',
  },
  [TILE.MACHINE]: {
    id: 24,
    kind: 'machine',
    walkable: false,
    color: '#f0e6f0',
    accent: '#e8a0bf',
  },
  [TILE.COMPUTER]: {
    id: 25,
    kind: 'computer',
    walkable: false,
    color: '#3a3a48',
    accent: '#3ecf8e',
  },
};

export function createGrid(width: number, height: number, fill: number): number[][] {
  return Array.from({ length: height }, () => Array.from({ length: width }, () => fill));
}

export function fillRect(
  tiles: number[][],
  x: number,
  y: number,
  w: number,
  h: number,
  tile: number,
): void {
  for (let row = y; row < y + h; row++) {
    for (let col = x; col < x + w; col++) {
      if (row >= 0 && row < tiles.length && col >= 0 && col < tiles[0].length) {
        tiles[row][col] = tile;
      }
    }
  }
}

export function setTile(tiles: number[][], x: number, y: number, tile: number): void {
  if (y >= 0 && y < tiles.length && x >= 0 && x < tiles[0].length) {
    tiles[y][x] = tile;
  }
}

export function buildCollision(tiles: number[][]): boolean[][] {
  return tiles.map((row) =>
    row.map((id) => !(tileDefs[id]?.walkable ?? false)),
  );
}

export function drawBorder(tiles: number[][], tile: number = TILE.TREE): void {
  const h = tiles.length;
  const w = tiles[0].length;
  for (let x = 0; x < w; x++) {
    tiles[0][x] = tile;
    tiles[h - 1][x] = tile;
  }
  for (let y = 0; y < h; y++) {
    tiles[y][0] = tile;
    tiles[y][w - 1] = tile;
  }
}

export function drawRoom(
  tiles: number[][],
  x: number,
  y: number,
  w: number,
  h: number,
  floor: number = TILE.FLOOR,
  wall: number = TILE.WALL,
): void {
  fillRect(tiles, x, y, w, h, wall);
  fillRect(tiles, x + 1, y + 1, w - 2, h - 2, floor);
}
