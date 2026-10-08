import type { Position, Direction } from './common';

export type MovementPattern =
  | { kind: 'static' }
  | { kind: 'horizontal'; minX: number; maxX: number; intervalMs: number }
  | { kind: 'vertical'; minY: number; maxY: number; intervalMs: number }
  | { kind: 'patrol'; points: Position[]; waitMs: number }
  | { kind: 'random'; radius: number; intervalMs: number };

export type NPCInteraction =
  | { kind: 'dialogue'; dialogueId: string }
  | { kind: 'shop'; shopId: string }
  | { kind: 'heal' }
  | { kind: 'trainer'; trainerId: string }
  | { kind: 'gym_leader'; gymId: string }
  | { kind: 'quest_giver'; questId: string };

export interface NPCDefinition {
  id: string;
  name: string;
  mapId: string;
  position: Position;
  direction: Direction;
  color: string;
  dialogueId: string;
  movement?: MovementPattern;
  interaction?: NPCInteraction;
  facingBlocks?: boolean;
  /** Tiles of line-of-sight for trainer engagement (0 = interact only) */
  sightRange?: number;
}
