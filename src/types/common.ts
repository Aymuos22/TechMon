export interface Position {
  x: number;
  y: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export const TILE_SIZE = 32;
export const VIEWPORT_WIDTH = 480;
export const VIEWPORT_HEIGHT = 320;
export const MOVE_DURATION_MS = 150;
export const MAX_PARTY_SIZE = 6;
/** Max skills / moves a technology may know at once */
export const MAX_SKILLS = 4;
export const SAVE_VERSION = 2;
export const SAVE_KEY = 'techmon_save_v2';
