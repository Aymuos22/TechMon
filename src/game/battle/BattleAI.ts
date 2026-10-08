import type { OwnedTechnology } from '../../types/technology';
import type { BattleAction, StatStages } from '../../types/battle';
import { getSkill } from '../../data/skills';
import { getTechnology } from '../../data/technologies';
import { getTypeEffectiveness } from '../../data/typeChart';

export function chooseEnemyAction(
  enemy: OwnedTechnology,
  player: OwnedTechnology,
  _enemyStages?: StatStages,
): BattleAction {
  if (enemy.status === 'crashed') {
    return { kind: 'execute', skillId: enemy.skillIds[0] };
  }

  // Prefer compile setup if available and not already compiling
  if (enemy.status !== 'compiling') {
    const compileSkill = enemy.skillIds.find((id) => {
      const s = getSkill(id);
      return s.effect?.kind === 'self_status' && s.effect.status === 'compiling';
    });
    if (compileSkill && enemy.currentHp > enemy.maxHp * 0.45 && Math.random() < 0.35) {
      return { kind: 'execute', skillId: compileSkill };
    }
  }

  if (enemy.status === 'bugged' || enemy.status === 'memory_leak') {
    const healSkill = enemy.skillIds.find((id) => {
      const s = getSkill(id);
      return s.effect?.kind === 'heal';
    });
    if (healSkill && enemy.currentHp < enemy.maxHp * 0.4) {
      return { kind: 'execute', skillId: healSkill };
    }
  }

  // Prefer buffs early
  if (Math.random() < 0.25) {
    const buff = enemy.skillIds.find((id) => getSkill(id).effect?.kind === 'stat_mod');
    if (buff) return { kind: 'execute', skillId: buff };
  }

  let bestId = enemy.skillIds[0];
  let bestScore = -1;
  const playerTypes = getTechnology(player.definitionId).types;
  const compileBonus = enemy.status === 'compiling' ? 1.4 : 1;

  for (const skillId of enemy.skillIds) {
    const skill = getSkill(skillId);
    if (skill.category === 'status') {
      const score = 18 + Math.random() * 12;
      if (score > bestScore) {
        bestScore = score;
        bestId = skillId;
      }
      continue;
    }
    if (enemy.status === 'rate_limited' && skill.power >= 70) continue;
    const eff = getTypeEffectiveness(skill.type, playerTypes);
    const score = skill.power * eff * compileBonus + Math.random() * 15;
    if (score > bestScore) {
      bestScore = score;
      bestId = skillId;
    }
  }

  return { kind: 'execute', skillId: bestId };
}
