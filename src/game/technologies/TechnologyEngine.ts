import type { OwnedTechnology, TechnologyStats } from '../../types/technology';
import { getTechnology } from '../../data/technologies';
import { getSkill, getSkillMaxEP } from '../../data/skills';
import { MAX_SKILLS } from '../../types/common';

export function clampSkillIds(skillIds: string[]): string[] {
  return skillIds.slice(0, MAX_SKILLS);
}

/** Skills unlocked by level, never more than MAX_SKILLS */
export function skillsForLevel(definitionSkillIds: string[], level: number): string[] {
  const slots = Math.min(MAX_SKILLS, Math.max(1, 1 + Math.floor(level / 5)));
  const picked = definitionSkillIds.slice(0, slots);
  return picked.length > 0 ? picked : definitionSkillIds.slice(0, 1);
}

export function xpForLevel(level: number): number {
  return Math.floor(level * level * 12 + level * 20);
}

export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) total += xpForLevel(i);
  return total;
}

export function scaleStats(base: TechnologyStats, level: number): TechnologyStats {
  const factor = 1 + (level - 1) * 0.08;
  return {
    hp: Math.floor(base.hp * factor) + level * 2,
    attack: Math.floor(base.attack * factor),
    defense: Math.floor(base.defense * factor),
    specialAttack: Math.floor(base.specialAttack * factor),
    specialDefense: Math.floor(base.specialDefense * factor),
    speed: Math.floor(base.speed * factor),
  };
}

let instanceCounter = 1;

export function buildSkillEP(skillIds: string[]): Record<string, number> {
  const ep: Record<string, number> = {};
  for (const id of skillIds) {
    ep[id] = getSkillMaxEP(getSkill(id));
  }
  return ep;
}

export function restoreSkillEP(tech: OwnedTechnology): OwnedTechnology {
  return {
    ...tech,
    skillEP: buildSkillEP(tech.skillIds),
  };
}

/** Migrate older saves missing skillEP; always clamp to MAX_SKILLS */
export function ensureSkillEP(tech: OwnedTechnology): OwnedTechnology {
  const skillIds = clampSkillIds(tech.skillIds);
  const base = skillIds === tech.skillIds ? tech : { ...tech, skillIds };
  if (base.skillEP && Object.keys(base.skillEP).length > 0) {
    const ep: Record<string, number> = {};
    for (const id of skillIds) {
      ep[id] = base.skillEP[id] ?? getSkillMaxEP(getSkill(id));
    }
    return { ...base, skillIds, skillEP: ep };
  }
  return restoreSkillEP({ ...base, skillIds });
}

/** Set level and rescale stats; fills moves up to MAX_SKILLS from the definition. */
export function setTechnologyLevel(tech: OwnedTechnology, level: number): OwnedTechnology {
  const def = getTechnology(tech.definitionId);
  const capped = Math.max(1, Math.min(100, level));
  const stats = scaleStats(def.baseStats, capped);
  const existing = clampSkillIds(tech.skillIds);
  const target = skillsForLevel(def.skillIds, capped);
  const skillIds = clampSkillIds(
    existing.length >= target.length
      ? existing
      : [...existing, ...target.filter((id) => !existing.includes(id))],
  );
  return {
    ...tech,
    level: capped,
    experience: 0,
    stats,
    maxHp: stats.hp,
    currentHp: stats.hp,
    skillIds,
    skillEP: buildSkillEP(skillIds),
    status: undefined,
    statusTurns: undefined,
  };
}

export function createOwnedTechnology(
  definitionId: string,
  level: number,
  experience = 0,
): OwnedTechnology {
  const def = getTechnology(definitionId);
  const stats = scaleStats(def.baseStats, level);
  const skillIds = skillsForLevel(def.skillIds, level);
  return {
    instanceId: `tech_${instanceCounter++}_${definitionId}`,
    definitionId,
    level,
    experience,
    currentHp: stats.hp,
    maxHp: stats.hp,
    stats,
    skillIds,
    skillEP: buildSkillEP(skillIds),
  };
}

export interface LevelUpResult {
  leveled: boolean;
  newLevel: number;
  unlockedSkill?: string;
  tech: OwnedTechnology;
  statGains?: Partial<TechnologyStats>;
}

export function applyXp(tech: OwnedTechnology, amount: number): LevelUpResult {
  const ensured = ensureSkillEP(tech);
  const updated = {
    ...ensured,
    stats: { ...ensured.stats },
    skillIds: clampSkillIds([...ensured.skillIds]),
    skillEP: { ...(ensured.skillEP ?? {}) },
  };
  updated.experience += amount;
  let leveled = false;
  let unlockedSkill: string | undefined;
  const def = getTechnology(updated.definitionId);
  const statGains: Partial<TechnologyStats> = {};

  while (updated.level < 100 && updated.experience >= xpForLevel(updated.level)) {
    updated.experience -= xpForLevel(updated.level);
    updated.level += 1;
    leveled = true;
    const newStats = scaleStats(def.baseStats, updated.level);
    const hpGain = newStats.hp - updated.maxHp;
    statGains.hp = (statGains.hp ?? 0) + Math.max(0, hpGain);
    statGains.attack = (statGains.attack ?? 0) + (newStats.attack - updated.stats.attack);
    statGains.defense = (statGains.defense ?? 0) + (newStats.defense - updated.stats.defense);
    statGains.specialAttack =
      (statGains.specialAttack ?? 0) + (newStats.specialAttack - updated.stats.specialAttack);
    statGains.specialDefense =
      (statGains.specialDefense ?? 0) + (newStats.specialDefense - updated.stats.specialDefense);
    statGains.speed = (statGains.speed ?? 0) + (newStats.speed - updated.stats.speed);
    updated.stats = newStats;
    updated.maxHp = newStats.hp;
    updated.currentHp = Math.min(updated.maxHp, updated.currentHp + Math.max(0, hpGain));

    const skillSlots = Math.min(MAX_SKILLS, 1 + Math.floor(updated.level / 5));
    if (
      updated.skillIds.length < MAX_SKILLS &&
      skillSlots > updated.skillIds.length &&
      def.skillIds[updated.skillIds.length]
    ) {
      unlockedSkill = def.skillIds[updated.skillIds.length];
      updated.skillIds = clampSkillIds([...updated.skillIds, unlockedSkill]);
      updated.skillEP[unlockedSkill] = getSkillMaxEP(getSkill(unlockedSkill));
    }
  }

  return {
    leveled,
    newLevel: updated.level,
    unlockedSkill,
    tech: updated,
    statGains: leveled ? statGains : undefined,
  };
}

export function healTechnology(tech: OwnedTechnology, amount: number): OwnedTechnology {
  return {
    ...tech,
    currentHp: Math.min(tech.maxHp, tech.currentHp + amount),
  };
}

export function fullHeal(tech: OwnedTechnology): OwnedTechnology {
  const restored = restoreSkillEP(ensureSkillEP(tech));
  return {
    ...restored,
    currentHp: restored.maxHp,
    status: undefined,
    statusTurns: undefined,
  };
}

export function canUpgrade(
  tech: OwnedTechnology,
  inventoryItemIds: string[],
  completedQuests: string[],
): boolean {
  const def = getTechnology(tech.definitionId);
  if (!def.upgrade) return false;
  if (tech.level < def.upgrade.requiredLevel) return false;
  if (def.upgrade.requiredQuest && !completedQuests.includes(def.upgrade.requiredQuest)) {
    return false;
  }
  if (def.upgrade.requiredItems) {
    for (const itemId of def.upgrade.requiredItems) {
      if (!inventoryItemIds.includes(itemId)) return false;
    }
  }
  return true;
}

export function performUpgrade(tech: OwnedTechnology): OwnedTechnology {
  const def = getTechnology(tech.definitionId);
  if (!def.upgrade) throw new Error('No upgrade available');
  const next = createOwnedTechnology(def.upgrade.targetTechnologyId, tech.level, tech.experience);
  next.nickname = tech.nickname;
  return next;
}
