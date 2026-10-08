import type {
  BattleAction,
  BattleLogEntry,
  BattleState,
  BattleStatId,
  StatStages,
} from '../../types/battle';
import { createNeutralStages, stageMultiplier } from '../../types/battle';
import type { OwnedTechnology, StatusEffectId } from '../../types/technology';
import { getSkill } from '../../data/skills';
import { getTechnology } from '../../data/technologies';
import { getWeaknesses } from '../../data/typeChart';
import { calculateDamage } from './DamageCalculator';
import { chooseEnemyAction } from './BattleAI';
import { applyXp, ensureSkillEP } from '../technologies/TechnologyEngine';
import { getSkillMaxEP } from '../../data/skills';

let logCounter = 0;

function log(text: string): BattleLogEntry {
  return { id: `log_${++logCounter}`, text };
}

function clampStage(value: number): number {
  return Math.max(-6, Math.min(6, value));
}

export function applyStatStage(
  stages: StatStages,
  stat: BattleStatId,
  delta: number,
): { stages: StatStages; changed: boolean; label: string } {
  const before = stages[stat];
  const after = clampStage(before + delta);
  if (after === before) {
    return { stages, changed: false, label: `${stat} can't go any further!` };
  }
  const dir = after > before ? 'rose' : 'fell';
  return {
    stages: { ...stages, [stat]: after },
    changed: true,
    label: `${stat} ${dir}! (${after > 0 ? '+' : ''}${after})`,
  };
}

function tickStatus(tech: OwnedTechnology): { tech: OwnedTechnology; messages: string[] } {
  const messages: string[] = [];
  let updated = { ...tech, stats: { ...tech.stats } };
  if (!updated.status) return { tech: updated, messages };

  const name = getTechnology(updated.definitionId).name;

  switch (updated.status) {
    case 'bugged':
    case 'memory_leak': {
      const dmg = Math.max(1, Math.floor(updated.maxHp * 0.08));
      updated.currentHp = Math.max(0, updated.currentHp - dmg);
      messages.push(`${name} suffers from ${updated.status.replace('_', ' ')}! (-${dmg} HP)`);
      break;
    }
    case 'crashed':
      messages.push(`${name} is crashed and cannot act!`);
      break;
    case 'overloaded':
      messages.push(`${name} is overloaded (speed down)...`);
      break;
    case 'rate_limited':
      messages.push(`${name} is rate limited.`);
      break;
    case 'compiling':
      messages.push(`${name} is still compiling a powerful strike...`);
      break;
    case 'deprecated':
      messages.push(`${name} feels deprecated (power down).`);
      break;
  }

  if (updated.statusTurns !== undefined) {
    updated.statusTurns -= 1;
    if (updated.statusTurns <= 0) {
      if (updated.status !== 'compiling') {
        messages.push(`${name} recovered from ${updated.status.replace('_', ' ')}.`);
        updated.status = undefined;
        updated.statusTurns = undefined;
      }
    }
  }

  return { tech: updated, messages };
}

function applyStatus(
  tech: OwnedTechnology,
  status: StatusEffectId,
): OwnedTechnology {
  const turns: Record<StatusEffectId, number> = {
    bugged: 3,
    memory_leak: 4,
    deprecated: 3,
    rate_limited: 2,
    crashed: 1,
    overloaded: 3,
    compiling: 2,
  };
  return { ...tech, status, statusTurns: turns[status] };
}

function participant(
  tech: OwnedTechnology,
  extras?: Partial<BattleState['player']>,
): BattleState['player'] {
  const normalized = ensureSkillEP(tech);
  return {
    tech: {
      ...normalized,
      stats: { ...normalized.stats },
      skillIds: [...normalized.skillIds],
      skillEP: { ...normalized.skillEP },
    },
    analyzed: false,
    revealedTypes: [],
    revealedWeaknesses: [],
    stages: createNeutralStages(),
    ...extras,
  };
}

export function createBattleState(opts: {
  playerParty: OwnedTechnology[];
  enemy: OwnedTechnology;
  isWild: boolean;
  canEscape: boolean;
  isGym?: boolean;
  trainerName?: string;
  xpReward?: number;
  moneyReward?: number;
}): BattleState {
  const active = opts.playerParty.find((t) => t.currentHp > 0) ?? opts.playerParty[0];
  return {
    id: `battle_${Date.now()}`,
    phase: 'intro',
    player: participant(active),
    enemy: participant(opts.enemy),
    playerParty: opts.playerParty.map((t) => {
      const n = ensureSkillEP(t);
      return {
        ...n,
        stats: { ...n.stats },
        skillIds: [...n.skillIds],
        skillEP: { ...n.skillEP },
      };
    }),
    log: [
      log(
        opts.isWild
          ? `A wild ${getTechnology(opts.enemy.definitionId).name} appeared!`
          : `${opts.trainerName ?? 'Trainer'} wants to battle!`,
      ),
    ],
    canEscape: opts.canEscape,
    isWild: opts.isWild,
    isGym: opts.isGym ?? false,
    xpReward: opts.xpReward ?? opts.enemy.level * 8,
    moneyReward: opts.moneyReward ?? 0,
    turn: 0,
    lastDamage: 0,
    critical: false,
    effectiveness: 1,
  };
}

export interface BattleTurnResult {
  state: BattleState;
  leveledUp?: OwnedTechnology[];
  escaped?: boolean;
  captured?: boolean;
}

function syncParty(state: BattleState): OwnedTechnology[] {
  return state.playerParty.map((t) =>
    t.instanceId === state.player.tech.instanceId ? { ...state.player.tech } : t,
  );
}

function effectiveSpeed(tech: OwnedTechnology, stages: StatStages): number {
  let spd = tech.stats.speed * stageMultiplier(stages.speed);
  if (tech.status === 'overloaded') spd *= 0.5;
  return spd;
}

export function advanceToPlayerTurn(state: BattleState): BattleState {
  return {
    ...state,
    phase: 'player_turn',
    log: [...state.log, log('What will you deploy?')],
  };
}

function applySkillSideEffects(
  state: BattleState,
  side: 'player' | 'enemy',
  skillId: string,
): BattleState {
  const skill = getSkill(skillId);
  let next = { ...state, log: [...state.log] };
  const self = side === 'player' ? next.player : next.enemy;
  const name = getTechnology(self.tech.definitionId).name;

  if (skill.effect?.kind === 'heal') {
    const heal = Math.floor(self.tech.maxHp * (skill.effect.percent / 100));
    const tech = {
      ...self.tech,
      currentHp: Math.min(self.tech.maxHp, self.tech.currentHp + heal),
    };
    if (side === 'player') next.player = { ...next.player, tech };
    else next.enemy = { ...next.enemy, tech };
    next.log = [...next.log, log(`${name} restored ${heal} HP!`)];
    return next;
  }

  if (skill.effect?.kind === 'self_status') {
    const tech = applyStatus(self.tech, skill.effect.status);
    if (side === 'player') next.player = { ...next.player, tech };
    else next.enemy = { ...next.enemy, tech };
    next.log = [
      ...next.log,
      log(`${name} entered ${skill.effect.status.replace('_', ' ')} state.`),
    ];
    return next;
  }

  if (skill.effect?.kind === 'stat_mod') {
    const stat = skill.effect.stat as BattleStatId;
    if (
      stat === 'attack' ||
      stat === 'defense' ||
      stat === 'specialAttack' ||
      stat === 'specialDefense' ||
      stat === 'speed'
    ) {
      const result = applyStatStage(self.stages, stat, skill.effect.stages);
      if (side === 'player') next.player = { ...next.player, stages: result.stages };
      else next.enemy = { ...next.enemy, stages: result.stages };
      next.log = [...next.log, log(`${name}'s ${result.label}`)];
    }
    return next;
  }

  return next;
}

export function executePlayerAction(state: BattleState, action: BattleAction): BattleTurnResult {
  let next: BattleState = {
    ...state,
    turn: state.turn + 1,
    phase: 'animating',
    log: [...state.log],
  };

  if (action.kind === 'escape') {
    if (!state.canEscape) {
      next.log = [...next.log, log('You cannot escape this battle!')];
      next.phase = 'player_turn';
      return { state: next };
    }
    const pSpd = effectiveSpeed(state.player.tech, state.player.stages);
    const eSpd = effectiveSpeed(state.enemy.tech, state.enemy.stages);
    if (Math.random() < 0.55 || pSpd >= eSpd) {
      next.phase = 'escaped';
      next.log = [...next.log, log('Got away safely!')];
      return { state: next, escaped: true };
    }
    next.log = [...next.log, log('Could not escape!')];
    return runEnemyTurn(next);
  }

  if (action.kind === 'swap') {
    const forced = state.phase === 'must_switch';
    const target = state.playerParty[action.partyIndex];
    if (!target || target.currentHp <= 0 || target.instanceId === state.player.tech.instanceId) {
      next.log = [...next.log, log('Cannot swap to that technology.')];
      next.phase = forced ? 'must_switch' : 'player_turn';
      return { state: next };
    }
    next.playerParty = syncParty(next);
    next.player = participant(target);
    next.log = [...next.log, log(`Go, ${getTechnology(target.definitionId).name}!`)];
    // Forced switch after DOWN does not give the enemy a free turn
    if (forced) {
      next.phase = 'player_turn';
      return { state: next };
    }
    return runEnemyTurn(next);
  }

  if (action.kind === 'register') {
    next.log = [...next.log, log('Registration is handled by the scanner UI.')];
    next.phase = 'player_turn';
    return { state: next };
  }

  if (action.kind === 'debug') {
    if (next.player.tech.status) {
      next.log = [...next.log, log(`Debugged! Cleared ${next.player.tech.status.replace('_', ' ')}.`)];
      next.player = {
        ...next.player,
        tech: { ...next.player.tech, status: undefined, statusTurns: undefined },
      };
    } else {
      next.log = [...next.log, log('Nothing to debug.')];
    }
    next.player = {
      ...next.player,
      tech: {
        ...next.player.tech,
        currentHp: Math.min(next.player.tech.maxHp, next.player.tech.currentHp + 15),
      },
    };
    return runEnemyTurn(next);
  }

  if (action.kind === 'analyze') {
    const types = getTechnology(next.enemy.tech.definitionId).types;
    const weaknesses = getWeaknesses(types);
    next.enemy = {
      ...next.enemy,
      analyzed: true,
      revealedTypes: types,
      revealedWeaknesses: weaknesses,
    };
    const buff = applyStatStage(next.player.stages, 'specialAttack', 1);
    next.player = { ...next.player, stages: buff.stages };
    next.log = [
      ...next.log,
      log(`Analyzed! Types: ${types.join(', ')}. Weak to: ${weaknesses.join(', ') || 'none'}.`),
      log(`Insight gained — ${buff.label}`),
    ];
    return runEnemyTurn(next);
  }

  if (action.kind === 'execute') {
    return resolveSpeedOrderedRound(next, action.skillId);
  }

  return runEnemyTurn(next);
}

/** Player Execute vs enemy attack — faster Speed acts first (GBA-style). */
function resolveSpeedOrderedRound(state: BattleState, playerSkillId: string): BattleTurnResult {
  let next = { ...state, log: [...state.log] };
  const skill = getSkill(playerSkillId);
  const playerName = getTechnology(next.player.tech.definitionId).name;
  const playerTech = ensureSkillEP(next.player.tech);
  const maxEP = getSkillMaxEP(skill);
  const currentEP = playerTech.skillEP[playerSkillId] ?? maxEP;

  if (next.player.tech.status === 'crashed') {
    next.log = [...next.log, log(`${playerName} is DOWN and skips the turn!`)];
    next.player = {
      ...next.player,
      tech: { ...next.player.tech, status: undefined, statusTurns: undefined },
    };
    return runEnemyTurn(next);
  }

  if (currentEP <= 0) {
    next.log = [...next.log, log(`${skill.name} has no EP left!`)];
    next.phase = 'player_turn';
    return { state: next };
  }

  // Spend EP up front so both sides commit
  next.player = {
    ...next.player,
    tech: {
      ...playerTech,
      skillEP: {
        ...playerTech.skillEP,
        [playerSkillId]: Math.max(0, currentEP - 1),
      },
    },
  };

  const playerBlocked =
    next.player.tech.status === 'rate_limited' && skill.power >= 70;

  const pSpd = effectiveSpeed(next.player.tech, next.player.stages);
  const eSpd = effectiveSpeed(next.enemy.tech, next.enemy.stages);
  const playerFirst = pSpd >= eSpd;

  const enemyAction = chooseEnemyAction(next.enemy.tech, next.player.tech, next.enemy.stages);

  const runPlayer = (): BattleTurnResult | null => {
    if (playerBlocked) {
      next.log = [
        ...next.log,
        log(`${playerName} is rate limited! ${skill.name} unavailable.`),
      ];
      return null;
    }
    next.log = [
      ...next.log,
      log(`${playerName} used ${skill.name}! (EP ${currentEP - 1}/${maxEP})`),
    ];
    next = applyPlayerSkill(next, playerSkillId);
    if (next.enemy.tech.currentHp <= 0) return resolveVictory(next);
    return null;
  };

  const runEnemy = (): BattleTurnResult | null => {
    next = applyEnemySkill(next, enemyAction);
    next.playerParty = syncParty(next);
    if (next.player.tech.currentHp <= 0) return resolvePlayerFaint(next);
    if (next.enemy.tech.currentHp <= 0) return resolveVictory(next);
    return null;
  };

  // Status ticks once per round before attacks
  next = tickBothStatuses(next);
  if (next.player.tech.currentHp <= 0) return resolvePlayerFaint(next);
  if (next.enemy.tech.currentHp <= 0) return resolveVictory(next);

  if (playerFirst) {
    const early = runPlayer();
    if (early) return early;
    const early2 = runEnemy();
    if (early2) return early2;
  } else {
    next.log = [...next.log, log(`${getTechnology(next.enemy.tech.definitionId).name} is faster!`)];
    const early = runEnemy();
    if (early) return early;
    const early2 = runPlayer();
    if (early2) return early2;
  }

  next.playerParty = syncParty(next);
  next.phase = 'player_turn';
  return { state: next };
}

function tickBothStatuses(state: BattleState): BattleState {
  let next = { ...state, log: [...state.log] };
  const playerTick = tickStatus(next.player.tech);
  next.player = { ...next.player, tech: playerTick.tech };
  next.log = [...next.log, ...playerTick.messages.map(log)];
  const enemyTick = tickStatus(next.enemy.tech);
  next.enemy = { ...next.enemy, tech: enemyTick.tech };
  next.log = [...next.log, ...enemyTick.messages.map(log)];
  return next;
}

function applyPlayerSkill(state: BattleState, skillId: string): BattleState {
  let next = { ...state, log: [...state.log] };
  const skill = getSkill(skillId);

  if (skill.category === 'status' || skill.power <= 0) {
    return applySkillSideEffects(next, 'player', skillId);
  }

  const result = calculateDamage(
    next.player.tech,
    next.enemy.tech,
    skill,
    next.player.stages,
    next.enemy.stages,
  );
  next.lastDamage = result.damage;
  next.critical = result.critical;
  next.effectiveness = result.effectiveness;

  if (result.missed) {
    next.log = [...next.log, log('The attack missed!')];
  } else {
    next.enemy = {
      ...next.enemy,
      tech: {
        ...next.enemy.tech,
        currentHp: Math.max(0, next.enemy.tech.currentHp - result.damage),
      },
    };
    next.log = [...next.log, log(`Dealt ${result.damage} damage!`)];
    if (result.critical) next.log = [...next.log, log('CRITICAL EXECUTION!')];
    if (result.effectivenessLabel) next.log = [...next.log, log(result.effectivenessLabel)];

    if (skill.effect?.kind === 'status' && Math.random() * 100 < skill.effect.chance) {
      next.enemy = {
        ...next.enemy,
        tech: applyStatus(next.enemy.tech, skill.effect.status),
      };
      next.log = [...next.log, log(`Enemy is now ${skill.effect.status.replace('_', ' ')}!`)];
    }
  }

  if (next.player.tech.status === 'compiling') {
    next.player = {
      ...next.player,
      tech: { ...next.player.tech, status: undefined, statusTurns: undefined },
    };
    next.log = [...next.log, log('Compile finished — boost spent.')];
  }
  return next;
}

function applyEnemySkill(state: BattleState, action: BattleAction): BattleState {
  let next = { ...state, log: [...state.log] };
  const enemyName = getTechnology(next.enemy.tech.definitionId).name;

  if (next.enemy.tech.status === 'crashed') {
    next.log = [...next.log, log(`${enemyName} is DOWN!`)];
    next.enemy = {
      ...next.enemy,
      tech: { ...next.enemy.tech, status: undefined, statusTurns: undefined },
    };
    return next;
  }

  if (action.kind !== 'execute') return next;

  const skill = getSkill(action.skillId);
  next.log = [...next.log, log(`${enemyName} used ${skill.name}!`)];

  if (skill.category === 'status' || skill.power <= 0) {
    return applySkillSideEffects(next, 'enemy', action.skillId);
  }
  if (next.enemy.tech.status === 'rate_limited' && skill.power >= 70) {
    next.log = [...next.log, log(`${enemyName} is rate limited!`)];
    return next;
  }

  const result = calculateDamage(
    next.enemy.tech,
    next.player.tech,
    skill,
    next.enemy.stages,
    next.player.stages,
  );
  if (result.missed) {
    next.log = [...next.log, log('It missed!')];
  } else {
    next.player = {
      ...next.player,
      tech: {
        ...next.player.tech,
        currentHp: Math.max(0, next.player.tech.currentHp - result.damage),
      },
    };
    next.log = [...next.log, log(`Took ${result.damage} damage!`)];
    if (result.critical) next.log = [...next.log, log('CRITICAL EXECUTION!')];
    if (result.effectivenessLabel) next.log = [...next.log, log(result.effectivenessLabel)];

    if (skill.effect?.kind === 'status' && Math.random() * 100 < skill.effect.chance) {
      next.player = {
        ...next.player,
        tech: applyStatus(next.player.tech, skill.effect.status),
      };
      next.log = [...next.log, log(`Your tech is ${skill.effect.status.replace('_', ' ')}!`)];
    }
  }

  if (next.enemy.tech.status === 'compiling') {
    next.enemy = {
      ...next.enemy,
      tech: { ...next.enemy.tech, status: undefined, statusTurns: undefined },
    };
  }
  return next;
}

export function resolveEnemyTurn(state: BattleState): BattleTurnResult {
  return runEnemyTurn({
    ...state,
    turn: state.turn + 1,
    phase: 'animating',
  });
}

function runEnemyTurn(state: BattleState): BattleTurnResult {
  let next = tickBothStatuses({ ...state, log: [...state.log] });
  if (next.player.tech.currentHp <= 0) return resolvePlayerFaint(next);
  if (next.enemy.tech.currentHp <= 0) return resolveVictory(next);

  const action = chooseEnemyAction(next.enemy.tech, next.player.tech, next.enemy.stages);
  next = applyEnemySkill(next, action);
  next.playerParty = syncParty(next);

  if (next.player.tech.currentHp <= 0) return resolvePlayerFaint(next);
  if (next.enemy.tech.currentHp <= 0) return resolveVictory(next);

  next.phase = 'player_turn';
  return { state: next };
}

function resolveVictory(state: BattleState): BattleTurnResult {
  let next = { ...state, phase: 'victory' as const, log: [...state.log] };
  const enemyName = getTechnology(next.enemy.tech.definitionId).name;
  next.log = [...next.log, log(`${enemyName} is DOWN! VICTORY!`)];

  const leveledUp: OwnedTechnology[] = [];
  const xp = next.xpReward;
  next.playerParty = next.playerParty.map((t) => {
    if (t.instanceId === next.player.tech.instanceId || t.currentHp > 0) {
      const result = applyXp(
        t.instanceId === next.player.tech.instanceId ? next.player.tech : t,
        t.instanceId === next.player.tech.instanceId ? xp : Math.floor(xp * 0.5),
      );
      if (result.leveled) {
        leveledUp.push(result.tech);
        next.log = [
          ...next.log,
          log(`${getTechnology(result.tech.definitionId).name} grew to Lv.${result.newLevel}!`),
        ];
        if (result.unlockedSkill) {
          next.log = [...next.log, log('Learned a new skill!')];
        }
      }
      if (t.instanceId === next.player.tech.instanceId) {
        next.player = { ...next.player, tech: result.tech };
      }
      return result.tech;
    }
    return t;
  });

  return { state: next, leveledUp };
}

function resolvePlayerFaint(state: BattleState): BattleTurnResult {
  let next = { ...state, log: [...state.log], playerParty: syncParty(state) };
  next.log = [
    ...next.log,
    log(`${getTechnology(next.player.tech.definitionId).name} is DOWN!`),
  ];

  const alive = next.playerParty.some((t) => t.currentHp > 0);
  if (alive) {
    next.phase = 'must_switch';
    next.log = [...next.log, log('Choose a technology to continue.')];
    return { state: next };
  }

  next.phase = 'defeat';
  next.log = [
    ...next.log,
    log('Your technologies have crashed. Returning to the nearest Code Center...'),
  ];
  return { state: next };
}
