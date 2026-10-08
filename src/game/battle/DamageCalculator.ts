import type { DamageResult, StatStages } from '../../types/battle';
import { stageMultiplier } from '../../types/battle';
import type { OwnedTechnology, Skill } from '../../types/technology';
import { getTypeEffectiveness, getEffectivenessLabel } from '../../data/typeChart';
import { getTechnology } from '../../data/technologies';

/**
 * Damage formula:
 * Base = ((2*L/5+2) * Power * Atk/Def) / 50 + 2
 * Final = Base × TypeEffectiveness × Critical × Variance × StatusMods × StageMods
 */
export function calculateDamage(
  attacker: OwnedTechnology,
  defender: OwnedTechnology,
  skill: Skill,
  attackerStages?: StatStages,
  defenderStages?: StatStages,
  randomFn: () => number = Math.random,
): DamageResult {
  if (skill.category === 'status' || skill.power <= 0) {
    return { damage: 0, critical: false, effectiveness: 1, effectivenessLabel: '', missed: false };
  }

  if (randomFn() * 100 > skill.accuracy) {
    return { damage: 0, critical: false, effectiveness: 1, effectivenessLabel: '', missed: true };
  }

  const atkStages = attackerStages ?? {
    attack: 0,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
    speed: 0,
  };
  const defStages = defenderStages ?? {
    attack: 0,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
    speed: 0,
  };

  const isSpecial = skill.category === 'special';
  const attackStat =
    (isSpecial ? attacker.stats.specialAttack : attacker.stats.attack) *
    stageMultiplier(isSpecial ? atkStages.specialAttack : atkStages.attack);
  const defenseStat =
    (isSpecial ? defender.stats.specialDefense : defender.stats.defense) *
    stageMultiplier(isSpecial ? defStages.specialDefense : defStages.defense);

  const compilingBonus = attacker.status === 'compiling' ? 1.75 : 1;
  const deprecatedPenalty = attacker.status === 'deprecated' ? 0.7 : 1;
  const overloadedAtkPenalty = attacker.status === 'overloaded' ? 0.9 : 1;

  const base =
    ((2 * attacker.level) / 5 + 2) * skill.power * (attackStat / Math.max(1, defenseStat));
  const baseDamage =
    (base / 50 + 2) * compilingBonus * deprecatedPenalty * overloadedAtkPenalty;

  const defenderTypes = getTechnology(defender.definitionId).types;
  const effectiveness = getTypeEffectiveness(skill.type, defenderTypes);
  // Crit chance rises slightly when analyzing / high speed stage
  const critChance = 0.0625 + Math.max(0, atkStages.speed) * 0.02;
  const critical = randomFn() < critChance;
  const critMod = critical ? 1.5 : 1;
  const variance = 0.85 + randomFn() * 0.15;
  const damage = Math.max(1, Math.floor(baseDamage * effectiveness * critMod * variance));

  return {
    damage,
    critical,
    effectiveness,
    effectivenessLabel: getEffectivenessLabel(effectiveness),
    missed: false,
  };
}
