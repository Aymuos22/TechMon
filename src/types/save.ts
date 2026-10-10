import type { PlayerState } from './player';

export type WeatherState = 'clear' | 'rain';

export interface WorldState {
  defeatedTrainers: string[];
  openedChests: string[];
  /** Alias for collected overworld items (persisted with openedChests) */
  collectedItems: string[];
  foundBugs: string[];
  unlockedAreas: string[];
  dayNightMs: number;
  isNight: boolean;
  weather: WeatherState;
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  textSpeed: 'slow' | 'normal' | 'fast';
  showMobileControls: boolean;
}

export interface SaveGame {
  version: number;
  timestamp: number;
  player: PlayerState;
  worldState: WorldState;
  settings: GameSettings;
}

export type GameScreen =
  | 'title'
  | 'playing'
  | 'battle'
  | 'dialogue'
  | 'menu'
  | 'inventory'
  | 'techdex'
  | 'party'
  | 'storage'
  | 'engineer_card'
  | 'quests'
  | 'map'
  | 'shop'
  | 'settings'
  | 'credits'
  | 'challenge'
  | 'gym_puzzle'
  | 'upgrade'
  | 'heal'
  | 'victory';
