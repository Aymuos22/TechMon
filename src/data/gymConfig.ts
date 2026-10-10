/** Gym leader metadata — keeps GameEngine / puzzles data-driven */
export interface GymLeaderConfig {
  gymId: string;
  trainerId: string;
  badgeId: string;
  dialogueId: string;
  battleNodeId: string;
  winNodeId: string;
  requiredTrainerIds?: string[];
}

export const GYM_LEADERS: Record<string, GymLeaderConfig> = {
  frontend: {
    gymId: 'frontend',
    trainerId: 'gym_maya',
    badgeId: 'frontend',
    dialogueId: 'maya_intro',
    battleNodeId: 'maya_battle',
    winNodeId: 'maya_win',
  },
  production: {
    gymId: 'production',
    trainerId: 'gym_arjun',
    badgeId: 'production',
    dialogueId: 'arjun_intro',
    battleNodeId: 'arjun_battle',
    winNodeId: 'arjun_win',
  },
  devops: {
    gymId: 'devops',
    trainerId: 'gym_helm',
    badgeId: 'devops',
    dialogueId: 'helm_intro',
    battleNodeId: 'helm_battle',
    winNodeId: 'helm_win',
    requiredTrainerIds: ['gym_trainer_manifest', 'gym_trainer_cluster'],
  },
  legacy: {
    gymId: 'legacy',
    trainerId: 'gym_cobol',
    badgeId: 'legacy',
    dialogueId: 'cobol_intro',
    battleNodeId: 'cobol_battle',
    winNodeId: 'cobol_win',
    requiredTrainerIds: ['gym_trainer_jcl', 'gym_trainer_green_screen'],
  },
  service: {
    gymId: 'service',
    trainerId: 'gym_billing',
    badgeId: 'service',
    dialogueId: 'billing_intro',
    battleNodeId: 'billing_battle',
    winNodeId: 'billing_win',
    requiredTrainerIds: ['gym_trainer_timesheet', 'gym_trainer_change_request'],
  },
  faang: {
    gymId: 'faang',
    trainerId: 'gym_leet',
    badgeId: 'faang',
    dialogueId: 'leet_intro',
    battleNodeId: 'leet_battle',
    winNodeId: 'leet_win',
    requiredTrainerIds: ['gym_trainer_interview_loop', 'gym_trainer_system_design'],
  },
  vibe: {
    gymId: 'vibe',
    trainerId: 'gym_agent',
    badgeId: 'vibe',
    dialogueId: 'agent_intro',
    battleNodeId: 'agent_battle',
    winNodeId: 'agent_win',
  },
};

export const ALL_BADGE_IDS = [
  'frontend',
  'production',
  'devops',
  'legacy',
  'service',
  'faang',
  'vibe',
] as const;
