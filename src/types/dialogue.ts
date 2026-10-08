export type DialogueAction =
  | { kind: 'give_starter'; technologyIds: string[] }
  | { kind: 'give_item'; itemId: string; quantity: number }
  | { kind: 'give_money'; amount: number }
  | { kind: 'give_technology'; technologyId: string; level: number }
  | { kind: 'heal_party' }
  | { kind: 'open_shop'; shopId: string }
  | { kind: 'start_battle'; trainerId: string }
  | { kind: 'start_quest'; questId: string }
  | { kind: 'complete_quest_step'; questId: string; stepId: string }
  | { kind: 'give_badge'; badgeId: string }
  | { kind: 'set_flag'; flag: string; value: boolean }
  | { kind: 'teleport'; mapId: string; x: number; y: number }
  | { kind: 'open_gym_puzzle'; gymId: string }
  | { kind: 'save_game' };

export interface DialogueChoice {
  label: string;
  nextId?: string;
  action?: DialogueAction;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  nextId?: string;
  choices?: DialogueChoice[];
  action?: DialogueAction;
}
