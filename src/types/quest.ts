export type QuestStepKind =
  | 'talk'
  | 'collect'
  | 'battle'
  | 'quiz'
  | 'reach'
  | 'inspect'
  | 'flag';

export interface QuestStep {
  id: string;
  description: string;
  kind: QuestStepKind;
  targetId?: string;
  quizId?: string;
  completed: boolean;
}

export interface QuestReward {
  xp?: number;
  money?: number;
  items?: Array<{ itemId: string; quantity: number }>;
  technologyId?: string;
}

export interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  steps: Omit<QuestStep, 'completed'>[];
  reward: QuestReward;
  prerequisiteFlags?: string[];
  startDialogueId?: string;
}

export interface QuestProgress {
  questId: string;
  stepIndex: number;
  completedStepIds: string[];
}
