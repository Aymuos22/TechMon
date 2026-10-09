import type { Direction, Position } from './common';

export type TileKind =
  | 'grass'
  | 'path'
  | 'floor'
  | 'wall'
  | 'water'
  | 'tree'
  | 'bridge'
  | 'door'
  | 'tall_grass'
  | 'sand'
  | 'building'
  | 'sign'
  | 'carpet'
  | 'flower'
  | 'void'
  | 'fence'
  | 'roof'
  | 'fountain'
  | 'bench'
  | 'counter'
  | 'shelf'
  | 'machine'
  | 'computer';

/** Data-driven tile properties for collision / encounters */
export interface TileProperties {
  walkable: boolean;
  encounterEnabled?: boolean;
  water?: boolean;
  ledge?: boolean;
  interaction?: string;
  /** Draw canopy / eaves after characters for depth */
  foreground?: boolean;
}

export interface TileDef {
  id: number;
  kind: TileKind;
  walkable: boolean;
  color: string;
  accent?: string;
  encounterable?: boolean;
  water?: boolean;
  foreground?: boolean;
}

export interface MapTransition {
  id: string;
  from: Position;
  toMapId: string;
  toPosition: Position;
  /** Facing after arrival */
  toFacing?: Direction;
  requiresFlag?: string;
  requiresAllFlags?: string[];
  message?: string;
  /** If true, only enter via A (not walk-on). Buildings use false so both work. */
  interactOnly?: boolean;
}

export interface InteractionPoint {
  id: string;
  position: Position;
  kind: 'sign' | 'computer' | 'bed' | 'chest' | 'bug' | 'save' | 'info' | 'inspect' | 'door';
  text?: string;
  itemId?: string;
  flag?: string;
  /** Linked warp id for door interactions */
  warpId?: string;
}

export interface BuildingMarker {
  id: string;
  name: string;
  position: Position;
  width: number;
  height: number;
  door: Position;
  color: string;
  roofColor?: string;
}

export interface EncounterEntry {
  technologyId: string;
  weight: number;
  minLevel: number;
  maxLevel: number;
  nightOnly?: boolean;
  dayOnly?: boolean;
}

export interface EncounterTable {
  chance: number;
  entries: EncounterEntry[];
}

export interface MapData {
  id: string;
  name: string;
  width: number;
  height: number;
  /** Ground + objects base layer */
  tiles: number[][];
  collision: boolean[][];
  transitions: MapTransition[];
  interactions: InteractionPoint[];
  buildings: BuildingMarker[];
  encounters?: EncounterTable;
  npcIds: string[];
  music: string;
  isInterior?: boolean;
  parentMapId?: string;
  theme: 'byteburg' | 'route' | 'stackhaven' | 'interior';
}

export interface MinimapLandmark {
  id: string;
  name: string;
  mapId: string;
  kind: 'city' | 'gym' | 'building' | 'route';
  unlockedBy?: string;
  unlockedByAll?: string[];
}
