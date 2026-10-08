import type { OwnedTechnology, StatusEffectId, TechnologyType } from './technology';

export type BattleAction =
  | { kind: 'execute'; skillId: string }
  | { kind: 'debug' }
  | { kind: 'analyze' }
  | { kind: 'swap'; partyIndex: number }
  | { kind: 'escape' }
  | { kind: 'item'; itemId: string }
  | { kind: 'register' };

export type BattlePhase =
  | 'intro'
  | 'player_turn'
  | 'enemy_turn'
  | 'animating'
  | 'must_switch'
  | 'victory'
  | 'defeat'
  | 'escaped'
  | 'challenge'
  | 'registered';

export interface BattleLogEntry {
  id: string;
  text: string;
}

export type BattleStatId =
  | 'attack'
  | 'defense'
  | 'specialAttack'
  | 'specialDefense'
  | 'speed';

export type StatStages = Record<BattleStatId, number>;

export function createNeutralStages(): StatStages {
  return {
    attack: 0,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
    speed: 0,
  };
}

/** Pokemon-like stage multiplier: ±1 → 1.5/0.66, ±2 → 2/0.5, clamped ±6 */
export function stageMultiplier(stage: number): number {
  const s = Math.max(-6, Math.min(6, stage));
  if (s >= 0) return (2 + s) / 2;
  return 2 / (2 - s);
}

export interface BattleParticipant {
  tech: OwnedTechnology;
  analyzed: boolean;
  revealedTypes: TechnologyType[];
  revealedWeaknesses: TechnologyType[];
  stages: StatStages;
}

export interface ActiveStatus {
  id: StatusEffectId;
  turnsRemaining: number;
}

export interface BattleState {
  id: string;
  phase: BattlePhase;
  player: BattleParticipant;
  enemy: BattleParticipant;
  playerParty: OwnedTechnology[];
  log: BattleLogEntry[];
  canEscape: boolean;
  isWild: boolean;
  isGym: boolean;
  xpReward: number;
  moneyReward: number;
  turn: number;
  lastDamage: number;
  critical: boolean;
  effectiveness: number;
  challengePassed?: boolean;
  trainerName?: string;
  /** Set for trainer / gym battles */
  trainerId?: string;
  /** Index of the active enemy party member (0-based) */
  trainerPartyIndex?: number;
}

export interface DamageResult {
  damage: number;
  critical: boolean;
  effectiveness: number;
  effectivenessLabel: string;
  missed: boolean;
}
