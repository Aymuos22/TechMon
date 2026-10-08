import type { PlayerState } from '../../types/player';
import type { QuestProgress } from '../../types/quest';
import { questById } from '../../data/quests';

export function startQuest(player: PlayerState, questId: string): PlayerState {
  if (player.completedQuests.includes(questId)) return player;
  if (player.activeQuests.some((q) => q.questId === questId)) return player;
  const def = questById[questId];
  if (!def) return player;
  if (def.prerequisiteFlags) {
    for (const f of def.prerequisiteFlags) {
      if (!player.flags[f]) return player;
    }
  }
  const progress: QuestProgress = {
    questId,
    stepIndex: 0,
    completedStepIds: [],
  };
  return {
    ...player,
    activeQuests: [...player.activeQuests, progress],
  };
}

export function completeQuestStep(
  player: PlayerState,
  questId: string,
  stepId: string,
): { player: PlayerState; questCompleted: boolean; rewardXp: number; rewardMoney: number; rewardItems: Array<{ itemId: string; quantity: number }> } {
  const empty = { player, questCompleted: false, rewardXp: 0, rewardMoney: 0, rewardItems: [] as Array<{ itemId: string; quantity: number }> };
  const idx = player.activeQuests.findIndex((q) => q.questId === questId);
  if (idx === -1) return empty;

  const def = questById[questId];
  if (!def) return empty;

  const progress = { ...player.activeQuests[idx] };
  if (progress.completedStepIds.includes(stepId)) return empty;

  const step = def.steps.find((s) => s.id === stepId);
  if (!step) return empty;

  // Must complete in order
  const expected = def.steps[progress.stepIndex];
  if (!expected || expected.id !== stepId) return empty;

  progress.completedStepIds = [...progress.completedStepIds, stepId];
  progress.stepIndex += 1;

  let activeQuests = player.activeQuests.map((q, i) => (i === idx ? progress : q));
  let completedQuests = player.completedQuests;
  let questCompleted = false;
  let rewardXp = 0;
  let rewardMoney = 0;
  let rewardItems: Array<{ itemId: string; quantity: number }> = [];

  if (progress.stepIndex >= def.steps.length) {
    questCompleted = true;
    activeQuests = activeQuests.filter((q) => q.questId !== questId);
    completedQuests = [...completedQuests, questId];
    rewardXp = def.reward.xp ?? 0;
    rewardMoney = def.reward.money ?? 0;
    rewardItems = def.reward.items ?? [];
  }

  return {
    player: {
      ...player,
      activeQuests,
      completedQuests,
      money: player.money + rewardMoney,
    },
    questCompleted,
    rewardXp,
    rewardMoney,
    rewardItems,
  };
}

export function tryAdvanceQuestByFlag(player: PlayerState, flag: string): ReturnType<typeof completeQuestStep> {
  for (const aq of player.activeQuests) {
    const def = questById[aq.questId];
    if (!def) continue;
    const step = def.steps[aq.stepIndex];
    if (step && (step.kind === 'flag' || step.kind === 'inspect') && step.targetId === flag) {
      return completeQuestStep(player, aq.questId, step.id);
    }
  }
  return {
    player,
    questCompleted: false,
    rewardXp: 0,
    rewardMoney: 0,
    rewardItems: [],
  };
}

export function tryAdvanceQuestByTalk(player: PlayerState, npcId: string): ReturnType<typeof completeQuestStep> {
  for (const aq of player.activeQuests) {
    const def = questById[aq.questId];
    if (!def) continue;
    const step = def.steps[aq.stepIndex];
    if (step && step.kind === 'talk' && step.targetId === npcId) {
      return completeQuestStep(player, aq.questId, step.id);
    }
  }
  return {
    player,
    questCompleted: false,
    rewardXp: 0,
    rewardMoney: 0,
    rewardItems: [],
  };
}
