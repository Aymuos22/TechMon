import type { SaveGame, GameSettings, WorldState } from '../../types/save';
import type { PlayerState } from '../../types/player';
import { SAVE_KEY, SAVE_VERSION } from '../../types/common';
import { technologies } from '../../data/technologies';
import { createOwnedTechnology, ensureSkillEP } from '../technologies/TechnologyEngine';

const LEGACY_SAVE_KEY = 'techmon_save_v1';

export function defaultSettings(): GameSettings {
  return {
    musicVolume: 0.5,
    sfxVolume: 0.6,
    textSpeed: 'normal',
    showMobileControls: false,
  };
}

export function defaultWorldState(): WorldState {
  return {
    defeatedTrainers: [],
    openedChests: [],
    collectedItems: [],
    foundBugs: [],
    unlockedAreas: [],
    dayNightMs: 0,
    isNight: false,
  };
}

export function createNewPlayer(name: string): PlayerState {
  const techDex: PlayerState['techDex'] = {};
  for (const t of technologies) {
    techDex[t.id] = { discovered: false, registered: false, timesEncountered: 0 };
  }

  return {
    id: 'player_1',
    name,
    position: { x: 6, y: 7 },
    direction: 'down',
    mapId: 'player_house',
    money: 1000,
    party: [],
    storage: [],
    inventory: [
      { itemId: 'debug_patch', quantity: 3 },
    ],
    badges: [],
    completedQuests: [],
    activeQuests: [],
    techDex,
    flags: {},
    playtime: 0,
    achievements: [],
    xpBoosterBattles: 0,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function validateSave(data: unknown): data is SaveGame {
  if (!isObject(data)) return false;
  if (typeof data.version !== 'number' || data.version > SAVE_VERSION) return false;
  if (typeof data.timestamp !== 'number') return false;
  if (!isObject(data.player)) return false;
  if (typeof data.player.name !== 'string') return false;
  if (!Array.isArray(data.player.party)) return false;
  if (!isObject(data.worldState)) return false;
  if (!isObject(data.settings)) return false;
  return true;
}

function migratePlayer(player: PlayerState): PlayerState {
  return {
    ...player,
    party: (player.party ?? []).map((t) => ensureSkillEP(t as PlayerState['party'][number])),
    storage: (player.storage ?? []).map((t) => ensureSkillEP(t as PlayerState['storage'][number])),
  };
}

export class SaveManager {
  save(player: PlayerState, worldState: WorldState, settings: GameSettings): boolean {
    try {
      const payload: SaveGame = {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        player,
        worldState,
        settings,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  }

  load(): SaveGame | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY) ?? localStorage.getItem(LEGACY_SAVE_KEY);
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      if (!validateSave(parsed)) {
        console.warn('Corrupted or incompatible save data');
        return null;
      }
      const ws = parsed.worldState as WorldState;
      return {
        ...parsed,
        version: SAVE_VERSION,
        player: migratePlayer(parsed.player),
        worldState: {
          ...defaultWorldState(),
          ...ws,
          collectedItems: ws.collectedItems ?? ws.openedChests ?? [],
          unlockedAreas: ws.unlockedAreas ?? [],
        },
      };
    } catch {
      console.warn('Failed to parse save data');
      return null;
    }
  }

  hasSave(): boolean {
    return this.load() !== null;
  }

  reset(): void {
    localStorage.removeItem(SAVE_KEY);
  }
}

export const saveManager = new SaveManager();

/** Helper for tests / debugging */
export function grantStarter(player: PlayerState, techId: string): PlayerState {
  const tech = createOwnedTechnology(techId, 5);
  const techDex = { ...player.techDex };
  techDex[techId] = { discovered: true, registered: true, timesEncountered: 1 };
  return {
    ...player,
    party: [...player.party, tech],
    techDex,
    flags: { ...player.flags, starter_chosen: true },
    inventory: player.inventory.some((i) => i.itemId === 'tech_scanner')
      ? player.inventory
      : [...player.inventory, { itemId: 'tech_scanner', quantity: 1 }],
  };
}
