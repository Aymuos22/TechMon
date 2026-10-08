export type ItemType =
  | 'healing'
  | 'upgrade'
  | 'scanner'
  | 'battle'
  | 'quest'
  | 'key';

export type ItemEffect =
  | { kind: 'heal'; amount: number }
  | { kind: 'heal_percent'; percent: number }
  | { kind: 'clear_status' }
  | { kind: 'boost_stat'; stat: 'attack' | 'defense' | 'speed'; stages: number }
  | { kind: 'xp_boost'; multiplier: number; battles: number }
  | { kind: 'capture' }
  | { kind: 'key' };

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  price: number;
  sellPrice: number;
  effect?: ItemEffect;
  usableInBattle: boolean;
  usableInField: boolean;
  discardable: boolean;
}

export interface InventorySlot {
  itemId: string;
  quantity: number;
}

export type Inventory = InventorySlot[];
