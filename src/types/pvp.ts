import type { BattleAction, BattleLogEntry, BattleParticipant } from './battle';
import type { OwnedTechnology } from './technology';

export type PvpSide = 'host' | 'guest';
export type PvpRoomStatus = 'waiting' | 'active' | 'finished';

export interface PvpPlayerState {
  userId: string;
  name: string;
  party: OwnedTechnology[];
  activeIndex: number;
  participant: BattleParticipant;
  pendingAction?: BattleAction;
}

export interface PvpBattleRoom {
  code: string;
  status: PvpRoomStatus;
  host: PvpPlayerState;
  guest?: PvpPlayerState;
  turn: number;
  log: BattleLogEntry[];
  winner?: PvpSide;
  updatedAt?: string;
}

export interface PvpRoomView {
  room: PvpBattleRoom;
  side: PvpSide;
}
