import type { Direction, Position } from './common';
import type { Inventory } from './item';
import type { OwnedTechnology, TechDexEntry } from './technology';
import type { QuestProgress } from './quest';

export interface PlayerState {
  id: string;
  name: string;
  position: Position;
  direction: Direction;
  mapId: string;
  money: number;
  party: OwnedTechnology[];
  storage: OwnedTechnology[];
  inventory: Inventory;
  badges: string[];
  completedQuests: string[];
  activeQuests: QuestProgress[];
  techDex: Record<string, TechDexEntry>;
  flags: Record<string, boolean>;
  playtime: number;
  achievements: string[];
  xpBoosterBattles: number;
}
