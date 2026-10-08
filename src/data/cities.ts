import type { MapData, MinimapLandmark } from '../types/map';
import {
  createByteburg,
  createPlayerHouse,
  createTechLab,
  createCodeCenter,
  createTechMart,
  createFrontendGym,
  createPipelineRoute,
  createStackhaven,
  createCloudCenter,
  createAiLab,
  createTechMarket,
  createProductionGym,
  createDevopsTower,
  createDatabaseDistrict,
  createTournamentArena,
} from './maps';
import { expansionMaps } from './worldExpansion';

const allMaps: MapData[] = [
  createByteburg(),
  createPlayerHouse(),
  createTechLab(),
  createCodeCenter(),
  createTechMart(),
  createFrontendGym(),
  createPipelineRoute(),
  createStackhaven(),
  createCloudCenter(),
  createAiLab(),
  createTechMarket(),
  createProductionGym(),
  createDevopsTower(),
  createDatabaseDistrict(),
  createTournamentArena(),
  ...expansionMaps,
];

export const mapsById: Record<string, MapData> = Object.fromEntries(
  allMaps.map((m) => [m.id, m]),
);

export function getMap(id: string): MapData {
  const map = mapsById[id];
  if (!map) throw new Error(`Unknown map: ${id}`);
  return map;
}

export const minimapLandmarks: MinimapLandmark[] = [
  { id: 'lm_bb', name: 'Byteburg', mapId: 'byteburg', kind: 'city' },
  { id: 'lm_route', name: 'Pipeline Route', mapId: 'pipeline_route', kind: 'route', unlockedBy: 'starter_chosen' },
  { id: 'lm_sh', name: 'Stackhaven', mapId: 'stackhaven', kind: 'city', unlockedBy: 'badge_frontend' },
  { id: 'lm_fgym', name: 'Frontend Gym', mapId: 'frontend_gym', kind: 'gym' },
  { id: 'lm_pgym', name: 'Production Gym', mapId: 'production_gym', kind: 'gym', unlockedBy: 'badge_frontend' },
  { id: 'lm_db', name: 'Database District', mapId: 'database_district', kind: 'building', unlockedBy: 'badge_frontend' },
  { id: 'lm_ops', name: 'DevOps Tower', mapId: 'devops_tower', kind: 'building', unlockedBy: 'badge_frontend' },
  { id: 'lm_ai', name: 'AI Lab', mapId: 'ai_lab', kind: 'building', unlockedBy: 'badge_frontend' },
  { id: 'lm_cove', name: 'Container Cove', mapId: 'container_cove', kind: 'city', unlockedBy: 'badge_production' },
  { id: 'lm_dgym', name: 'DevOps Gym', mapId: 'devops_gym', kind: 'gym', unlockedBy: 'badge_production' },
  { id: 'lm_legacy', name: 'Legacy Crossing', mapId: 'legacy_crossing', kind: 'city', unlockedBy: 'badge_devops' },
  { id: 'lm_lgym', name: 'Legacy Gym', mapId: 'legacy_gym', kind: 'gym', unlockedBy: 'badge_devops' },
  { id: 'lm_service', name: 'Service Square', mapId: 'service_square', kind: 'city', unlockedBy: 'badge_legacy' },
  { id: 'lm_sgym', name: 'Billing Gym', mapId: 'service_gym', kind: 'gym', unlockedBy: 'badge_legacy' },
  { id: 'lm_faang', name: 'FAANG Heights', mapId: 'faang_heights', kind: 'city', unlockedBy: 'badge_service' },
  { id: 'lm_leet', name: 'Leetcode Gym', mapId: 'faang_gym', kind: 'gym', unlockedBy: 'badge_service' },
  { id: 'lm_layoff', name: 'LayOff Tower', mapId: 'layoff_tower', kind: 'building', unlockedBy: 'badge_faang' },
];

export interface TrainerDef {
  id: string;
  name: string;
  party: Array<{ technologyId: string; level: number }>;
  rewardMoney: number;
  isGym?: boolean;
  /** Dialogue tree id (e.g. maya_intro) for post-win scene */
  winDialogueTreeId?: string;
  /** Node within that tree (e.g. maya_win) */
  winDialogueId?: string;
}

export const trainers: Record<string, TrainerDef> = {
  trainer_rookie: {
    id: 'trainer_rookie',
    name: 'Rookie Dev',
    party: [{ technologyId: 'html', level: 3 }],
    rewardMoney: 150,
  },
  trainer_frontend: {
    id: 'trainer_frontend',
    name: 'Frontend Engineer',
    party: [
      { technologyId: 'css', level: 6 },
      { technologyId: 'javascript', level: 7 },
    ],
    rewardMoney: 400,
  },
  trainer_backend: {
    id: 'trainer_backend',
    name: 'Backend Engineer',
    party: [
      { technologyId: 'node', level: 8 },
      { technologyId: 'postgresql', level: 8 },
    ],
    rewardMoney: 500,
  },
  trainer_devops: {
    id: 'trainer_devops',
    name: 'DevOps Engineer',
    party: [
      { technologyId: 'docker', level: 9 },
      { technologyId: 'redis', level: 8 },
    ],
    rewardMoney: 550,
  },
  trainer_data: {
    id: 'trainer_data',
    name: 'Data Engineer',
    party: [
      { technologyId: 'postgresql', level: 8 },
      { technologyId: 'kafka', level: 9 },
    ],
    rewardMoney: 520,
  },
  trainer_debugger: {
    id: 'trainer_debugger',
    name: 'Debugger',
    party: [
      { technologyId: 'python', level: 7 },
      { technologyId: 'javascript', level: 8 },
    ],
    rewardMoney: 480,
  },
  trainer_ai: {
    id: 'trainer_ai',
    name: 'AI Engineer',
    party: [
      { technologyId: 'pytorch', level: 14 },
      { technologyId: 'langchain', level: 15 },
    ],
    rewardMoney: 900,
  },
  trainer_dba: {
    id: 'trainer_dba',
    name: 'Schema Specialist',
    party: [
      { technologyId: 'postgresql', level: 13 },
      { technologyId: 'mongodb', level: 13 },
      { technologyId: 'redis', level: 14 },
    ],
    rewardMoney: 850,
  },
  trainer_tower_k8s: {
    id: 'trainer_tower_k8s',
    name: 'Cluster Operator',
    party: [
      { technologyId: 'docker', level: 14 },
      { technologyId: 'terraform', level: 15 },
      { technologyId: 'kubernetes', level: 16 },
    ],
    rewardMoney: 950,
  },
  trainer_lab_ai: {
    id: 'trainer_lab_ai',
    name: 'ML Engineer',
    party: [
      { technologyId: 'tensorflow', level: 14 },
      { technologyId: 'pytorch', level: 15 },
      { technologyId: 'langgraph', level: 16 },
    ],
    rewardMoney: 980,
  },
  gym_trainer_be: {
    id: 'gym_trainer_be',
    name: 'API Gatekeeper',
    party: [
      { technologyId: 'node', level: 14 },
      { technologyId: 'spring_boot', level: 15 },
    ],
    rewardMoney: 700,
  },
  gym_trainer_infra: {
    id: 'gym_trainer_infra',
    name: 'Infra Sentinel',
    party: [
      { technologyId: 'docker', level: 15 },
      { technologyId: 'kubernetes', level: 16 },
    ],
    rewardMoney: 750,
  },
  trainer_cloud_street: {
    id: 'trainer_cloud_street',
    name: 'Cloud Engineer',
    party: [
      { technologyId: 'aws', level: 13 },
      { technologyId: 'azure', level: 13 },
      { technologyId: 'gcp', level: 14 },
    ],
    rewardMoney: 880,
  },
  trainer_architect: {
    id: 'trainer_architect',
    name: 'Software Architect',
    party: [
      { technologyId: 'typescript', level: 14 },
      { technologyId: 'kafka', level: 15 },
      { technologyId: 'nextjs', level: 15 },
    ],
    rewardMoney: 920,
  },
  arena_champ: {
    id: 'arena_champ',
    name: 'Arena Champion',
    party: [
      { technologyId: 'rust', level: 16 },
      { technologyId: 'kubernetes', level: 17 },
      { technologyId: 'aws', level: 17 },
      { technologyId: 'langgraph', level: 18 },
    ],
    rewardMoney: 1500,
  },
  gym_maya: {
    id: 'gym_maya',
    name: 'Maya',
    party: [
      { technologyId: 'html', level: 8 },
      { technologyId: 'css', level: 9 },
      { technologyId: 'javascript', level: 10 },
      { technologyId: 'react', level: 12 },
    ],
    rewardMoney: 1200,
    isGym: true,
    winDialogueTreeId: 'maya_intro',
    winDialogueId: 'maya_win',
  },
  gym_arjun: {
    id: 'gym_arjun',
    name: 'Arjun',
    party: [
      { technologyId: 'node', level: 16 },
      { technologyId: 'spring_boot', level: 17 },
      { technologyId: 'docker', level: 18 },
      { technologyId: 'kubernetes', level: 20 },
    ],
    rewardMoney: 2000,
    isGym: true,
    winDialogueTreeId: 'arjun_intro',
    winDialogueId: 'arjun_win',
  },
  trainer_ops_road: {
    id: 'trainer_ops_road',
    name: 'Pipeline Intern',
    party: [
      { technologyId: 'docker', level: 17 },
      { technologyId: 'redis', level: 18 },
    ],
    rewardMoney: 700,
  },
  trainer_cove_yaml: {
    id: 'trainer_cove_yaml',
    name: 'YAML Sailor',
    party: [
      { technologyId: 'docker', level: 19 },
      { technologyId: 'kubernetes', level: 20 },
      { technologyId: 'terraform', level: 20 },
    ],
    rewardMoney: 900,
  },
  gym_helm: {
    id: 'gym_helm',
    name: 'Helm',
    party: [
      { technologyId: 'docker', level: 22 },
      { technologyId: 'terraform', level: 23 },
      { technologyId: 'go', level: 23 },
      { technologyId: 'kubernetes', level: 25 },
    ],
    rewardMoney: 2500,
    isGym: true,
    winDialogueTreeId: 'helm_intro',
    winDialogueId: 'helm_win',
  },
  trainer_legacy_road: {
    id: 'trainer_legacy_road',
    name: 'Punch-Card Dev',
    party: [
      { technologyId: 'java', level: 20 },
      { technologyId: 'cobol', level: 21 },
    ],
    rewardMoney: 850,
  },
  trainer_legacy_batch: {
    id: 'trainer_legacy_batch',
    name: 'Night Batch',
    party: [
      { technologyId: 'cobol', level: 22 },
      { technologyId: 'mainframe', level: 23 },
      { technologyId: 'postgresql', level: 22 },
    ],
    rewardMoney: 1000,
  },
  gym_cobol: {
    id: 'gym_cobol',
    name: 'Cobol',
    party: [
      { technologyId: 'java', level: 24 },
      { technologyId: 'cobol', level: 25 },
      { technologyId: 'postgresql', level: 25 },
      { technologyId: 'mainframe', level: 27 },
    ],
    rewardMoney: 2800,
    isGym: true,
    winDialogueTreeId: 'cobol_intro',
    winDialogueId: 'cobol_win',
  },
  trainer_service_road: {
    id: 'trainer_service_road',
    name: 'Bench Warmer',
    party: [
      { technologyId: 'java', level: 23 },
      { technologyId: 'salesforce', level: 24 },
    ],
    rewardMoney: 900,
  },
  trainer_service_bench: {
    id: 'trainer_service_bench',
    name: 'Onsite Lead',
    party: [
      { technologyId: 'angular', level: 24 },
      { technologyId: 'spring_boot', level: 25 },
      { technologyId: 'salesforce', level: 25 },
    ],
    rewardMoney: 1100,
  },
  gym_billing: {
    id: 'gym_billing',
    name: 'Billing',
    party: [
      { technologyId: 'java', level: 26 },
      { technologyId: 'angular', level: 26 },
      { technologyId: 'spring_boot', level: 27 },
      { technologyId: 'salesforce', level: 28 },
    ],
    rewardMoney: 3000,
    isGym: true,
    winDialogueTreeId: 'billing_intro',
    winDialogueId: 'billing_win',
  },
  trainer_faang_road: {
    id: 'trainer_faang_road',
    name: 'Onsite Shadow',
    party: [
      { technologyId: 'python', level: 26 },
      { technologyId: 'react', level: 26 },
    ],
    rewardMoney: 1200,
  },
  trainer_faang_lc: {
    id: 'trainer_faang_lc',
    name: 'LC Grinder',
    party: [
      { technologyId: 'cpp', level: 27 },
      { technologyId: 'python', level: 28 },
      { technologyId: 'rust', level: 28 },
    ],
    rewardMoney: 1400,
  },
  gym_leet: {
    id: 'gym_leet',
    name: 'Leet',
    party: [
      { technologyId: 'python', level: 28 },
      { technologyId: 'react', level: 29 },
      { technologyId: 'aws', level: 29 },
      { technologyId: 'kubernetes', level: 30 },
    ],
    rewardMoney: 3500,
    isGym: true,
    winDialogueTreeId: 'leet_intro',
    winDialogueId: 'leet_win',
  },
  villain_dario: {
    id: 'villain_dario',
    name: 'Dario Amodei',
    party: [
      { technologyId: 'pytorch', level: 32 },
      { technologyId: 'langgraph', level: 33 },
      { technologyId: 'claude', level: 35 },
    ],
    rewardMoney: 5000,
    winDialogueTreeId: 'dario_intro',
    winDialogueId: 'dario_win',
  },
  villain_sam: {
    id: 'villain_sam',
    name: 'Sam Altman',
    party: [
      { technologyId: 'python', level: 32 },
      { technologyId: 'langchain', level: 33 },
      { technologyId: 'openai_codex', level: 35 },
    ],
    rewardMoney: 5000,
    winDialogueTreeId: 'sam_intro',
    winDialogueId: 'sam_win',
  },
};
