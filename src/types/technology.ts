export type TechnologyType =
  | 'frontend'
  | 'backend'
  | 'language'
  | 'database'
  | 'cloud'
  | 'devops'
  | 'ai'
  | 'messaging';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export type StatusEffectId =
  | 'bugged'
  | 'memory_leak'
  | 'deprecated'
  | 'rate_limited'
  | 'crashed'
  | 'overloaded'
  | 'compiling';

export interface TechnologyStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export type SkillEffect =
  | { kind: 'status'; status: StatusEffectId; chance: number }
  | { kind: 'heal'; percent: number }
  | { kind: 'stat_mod'; stat: keyof TechnologyStats; stages: number }
  | { kind: 'self_status'; status: StatusEffectId };

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: TechnologyType;
  power: number;
  accuracy: number;
  category: 'physical' | 'special' | 'status';
  /** Execution Points cost pool size; defaults derived from power if omitted */
  maxEP?: number;
  effect?: SkillEffect;
}

export interface TechnologyUpgrade {
  targetTechnologyId: string;
  requiredLevel: number;
  requiredItems?: string[];
  requiredQuest?: string;
}

export interface TechnologyChallenge {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TechnologyDefinition {
  id: string;
  name: string;
  types: TechnologyType[];
  description: string;
  baseStats: TechnologyStats;
  rarity: Rarity;
  skillIds: string[];
  upgrade?: TechnologyUpgrade;
  challenges: TechnologyChallenge[];
  dexNumber: number;
  difficulty: string;
  speciality: string;
  color: string;
}

export interface OwnedTechnology {
  instanceId: string;
  definitionId: string;
  nickname?: string;
  level: number;
  experience: number;
  currentHp: number;
  maxHp: number;
  stats: TechnologyStats;
  skillIds: string[];
  /** Remaining Execution Points per skill id */
  skillEP: Record<string, number>;
  status?: StatusEffectId;
  statusTurns?: number;
}

export interface TechDexEntry {
  discovered: boolean;
  registered: boolean;
  timesEncountered: number;
}
