import type { BattleAction, BattleLogEntry, BattleParticipant, StatStages } from '../../types/battle';
import { createNeutralStages } from '../../types/battle';
import type { PvpBattleRoom, PvpPlayerState, PvpSide } from '../../types/pvp';
import type { OwnedTechnology, StatusEffectId } from '../../types/technology';
import { getSkill, getSkillMaxEP } from '../../data/skills';
import { getTechnology } from '../../data/technologies';
import { getWeaknesses } from '../../data/typeChart';
import { calculateDamage } from './DamageCalculator';
import { ensureSkillEP } from '../technologies/TechnologyEngine';

let pvpLogCounter = 0;

function log(text: string): BattleLogEntry {
  return { id: `pvp_${Date.now()}_${++pvpLogCounter}`, text };
}

function cloneTech(tech: OwnedTechnology): OwnedTechnology {
  const normalized = ensureSkillEP(tech);
  return {
    ...normalized,
    stats: { ...normalized.stats },
    skillIds: [...normalized.skillIds],
    skillEP: { ...normalized.skillEP },
  };
}

function syncParty(player: PvpPlayerState): OwnedTechnology[] {
  return player.party.map((tech, index) =>
    index === player.activeIndex ? cloneTech(player.participant.tech) : cloneTech(tech),
  );
}

function participant(tech: OwnedTechnology): BattleParticipant {
  return {
    tech: cloneTech(tech),
    analyzed: false,
    revealedTypes: [],
    revealedWeaknesses: [],
    stages: createNeutralStages(),
  };
}

export function createPvpPlayer(userId: string, name: string, party: OwnedTechnology[]): PvpPlayerState {
  const readyParty = party.map(cloneTech).filter((tech) => tech.currentHp > 0);
  const fallbackParty = party.map(cloneTech);
  const activeParty = readyParty.length ? readyParty : fallbackParty;
  const active = activeParty[0];
  if (!active) {
    throw new Error('pvp_party_required');
  }
  return {
    userId,
    name,
    party: activeParty,
    activeIndex: 0,
    participant: participant(active),
  };
}

export function createPvpRoom(code: string, host: PvpPlayerState): PvpBattleRoom {
  return {
    code,
    status: 'waiting',
    host,
    turn: 0,
    log: [
      log(`${host.name} opened Live Coding Tower room ${code}.`),
      log('Share the battle id with another signed-in player.'),
    ],
  };
}

export function joinPvpRoom(room: PvpBattleRoom, guest: PvpPlayerState): PvpBattleRoom {
  return {
    ...room,
    status: 'active',
    guest,
    log: [
      ...room.log,
      log(`${guest.name} joined the room.`),
      log(`${room.host.name} vs ${guest.name}. Commit your first move.`),
    ],
  };
}

function stageMultiplier(stage: number): number {
  const s = Math.max(-6, Math.min(6, stage));
  if (s >= 0) return (2 + s) / 2;
  return 2 / (2 - s);
}

function effectiveSpeed(player: PvpPlayerState): number {
  const tech = player.participant.tech;
  let speed = tech.stats.speed * stageMultiplier(player.participant.stages.speed);
  if (tech.status === 'overloaded') speed *= 0.5;
  return speed;
}

function applyStatus(tech: OwnedTechnology, status: StatusEffectId): OwnedTechnology {
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

function tickStatus(player: PvpPlayerState, entries: BattleLogEntry[]): PvpPlayerState {
  const tech = cloneTech(player.participant.tech);
  if (!tech.status) return player;

  const name = getTechnology(tech.definitionId).name;
  if (tech.status === 'bugged' || tech.status === 'memory_leak') {
    const damage = Math.max(1, Math.floor(tech.maxHp * 0.08));
    tech.currentHp = Math.max(0, tech.currentHp - damage);
    entries.push(log(`${name} suffers from ${tech.status.replace('_', ' ')}! (-${damage} HP)`));
  } else if (tech.status === 'crashed') {
    entries.push(log(`${name} is crashed and cannot act!`));
  }

  if (tech.statusTurns !== undefined) {
    tech.statusTurns -= 1;
    if (tech.statusTurns <= 0 && tech.status !== 'compiling') {
      entries.push(log(`${name} recovered from ${tech.status.replace('_', ' ')}.`));
      tech.status = undefined;
      tech.statusTurns = undefined;
    }
  }

  return {
    ...player,
    participant: { ...player.participant, tech },
  };
}

function applyStatStage(stages: StatStages, stat: keyof StatStages, delta: number): StatStages {
  return {
    ...stages,
    [stat]: Math.max(-6, Math.min(6, stages[stat] + delta)),
  };
}

function applySkillSideEffect(
  actor: PvpPlayerState,
  target: PvpPlayerState,
  skillId: string,
  entries: BattleLogEntry[],
): { actor: PvpPlayerState; target: PvpPlayerState } {
  const skill = getSkill(skillId);
  const actorName = getTechnology(actor.participant.tech.definitionId).name;

  if (skill.effect?.kind === 'heal') {
    const heal = Math.floor(actor.participant.tech.maxHp * (skill.effect.percent / 100));
    actor = {
      ...actor,
      participant: {
        ...actor.participant,
        tech: {
          ...actor.participant.tech,
          currentHp: Math.min(actor.participant.tech.maxHp, actor.participant.tech.currentHp + heal),
        },
      },
    };
    entries.push(log(`${actorName} restored ${heal} HP!`));
  } else if (skill.effect?.kind === 'self_status') {
    actor = {
      ...actor,
      participant: {
        ...actor.participant,
        tech: applyStatus(actor.participant.tech, skill.effect.status),
      },
    };
    entries.push(log(`${actorName} entered ${skill.effect.status.replace('_', ' ')} state.`));
  } else if (skill.effect?.kind === 'stat_mod') {
    const stat = skill.effect.stat;
    if (
      stat === 'attack' ||
      stat === 'defense' ||
      stat === 'specialAttack' ||
      stat === 'specialDefense' ||
      stat === 'speed'
    ) {
      actor = {
        ...actor,
        participant: {
          ...actor.participant,
          stages: applyStatStage(actor.participant.stages, stat, skill.effect.stages),
        },
      };
      entries.push(log(`${actorName}'s ${stat} changed.`));
    }
  }

  return { actor, target };
}

function runAnalyze(
  actor: PvpPlayerState,
  target: PvpPlayerState,
  entries: BattleLogEntry[],
): PvpPlayerState {
  const targetDef = getTechnology(target.participant.tech.definitionId);
  const weaknesses = getWeaknesses(targetDef.types);
  entries.push(
    log(
      `${actor.name} analyzed ${targetDef.name}. Types: ${targetDef.types.join(', ')}. Weak to: ${
        weaknesses.join(', ') || 'none'
      }.`,
    ),
  );
  return {
    ...actor,
    participant: {
      ...actor.participant,
      stages: applyStatStage(actor.participant.stages, 'specialAttack', 1),
    },
  };
}

function runDebug(actor: PvpPlayerState, entries: BattleLogEntry[]): PvpPlayerState {
  const tech = actor.participant.tech;
  const name = getTechnology(tech.definitionId).name;
  entries.push(log(`${actor.name} debugged ${name}.`));
  return {
    ...actor,
    participant: {
      ...actor.participant,
      tech: {
        ...tech,
        status: undefined,
        statusTurns: undefined,
        currentHp: Math.min(tech.maxHp, tech.currentHp + 15),
      },
    },
  };
}

function runSwap(actor: PvpPlayerState, partyIndex: number, entries: BattleLogEntry[]): PvpPlayerState {
  const party = syncParty(actor);
  const next = party[partyIndex];
  if (!next || next.currentHp <= 0 || partyIndex === actor.activeIndex) {
    entries.push(log(`${actor.name} tried to swap, but it failed.`));
    return { ...actor, party };
  }
  entries.push(log(`${actor.name} deployed ${getTechnology(next.definitionId).name}!`));
  return {
    ...actor,
    party,
    activeIndex: partyIndex,
    participant: participant(next),
  };
}

function runExecute(
  actor: PvpPlayerState,
  target: PvpPlayerState,
  skillId: string,
  entries: BattleLogEntry[],
): { actor: PvpPlayerState; target: PvpPlayerState } {
  const skill = getSkill(skillId);
  const actorTech = ensureSkillEP(actor.participant.tech);
  const actorName = getTechnology(actorTech.definitionId).name;
  const maxEP = getSkillMaxEP(skill);
  const currentEP = actorTech.skillEP[skillId] ?? maxEP;

  if (actorTech.status === 'crashed') {
    entries.push(log(`${actorName} is crashed and skips the turn!`));
    return {
      actor: {
        ...actor,
        participant: {
          ...actor.participant,
          tech: { ...actorTech, status: undefined, statusTurns: undefined },
        },
      },
      target,
    };
  }

  if (currentEP <= 0) {
    entries.push(log(`${actorName} has no EP left for ${skill.name}.`));
    return { actor, target };
  }

  actor = {
    ...actor,
    participant: {
      ...actor.participant,
      tech: {
        ...actorTech,
        skillEP: { ...actorTech.skillEP, [skillId]: currentEP - 1 },
      },
    },
  };

  if (actor.participant.tech.status === 'rate_limited' && skill.power >= 70) {
    entries.push(log(`${actorName} is rate limited! ${skill.name} unavailable.`));
    return { actor, target };
  }

  entries.push(log(`${actorName} used ${skill.name}!`));
  if (skill.category === 'status' || skill.power <= 0) {
    return applySkillSideEffect(actor, target, skillId, entries);
  }

  const result = calculateDamage(
    actor.participant.tech,
    target.participant.tech,
    skill,
    actor.participant.stages,
    target.participant.stages,
  );

  if (result.missed) {
    entries.push(log('The attack missed!'));
  } else {
    target = {
      ...target,
      participant: {
        ...target.participant,
        tech: {
          ...target.participant.tech,
          currentHp: Math.max(0, target.participant.tech.currentHp - result.damage),
        },
      },
    };
    entries.push(log(`${getTechnology(target.participant.tech.definitionId).name} took ${result.damage} damage!`));
    if (result.critical) entries.push(log('CRITICAL EXECUTION!'));
    if (result.effectivenessLabel) entries.push(log(result.effectivenessLabel));
    if (skill.effect?.kind === 'status' && Math.random() * 100 < skill.effect.chance) {
      target = {
        ...target,
        participant: {
          ...target.participant,
          tech: applyStatus(target.participant.tech, skill.effect.status),
        },
      };
      entries.push(log(`${getTechnology(target.participant.tech.definitionId).name} is ${skill.effect.status.replace('_', ' ')}!`));
    }
  }

  if (actor.participant.tech.status === 'compiling') {
    actor = {
      ...actor,
      participant: {
        ...actor.participant,
        tech: { ...actor.participant.tech, status: undefined, statusTurns: undefined },
      },
    };
  }

  return { actor, target };
}

function withSyncedParty(player: PvpPlayerState): PvpPlayerState {
  return { ...player, party: syncParty(player), pendingAction: undefined };
}

function resolveFainted(room: PvpBattleRoom, side: PvpSide): PvpBattleRoom {
  const player = room[side];
  if (!player) return room;
  const party = syncParty(player);
  const aliveIndex = party.findIndex((tech) => tech.currentHp > 0);
  if (aliveIndex === -1) {
    const winner: PvpSide = side === 'host' ? 'guest' : 'host';
    return {
      ...room,
      status: 'finished',
      winner,
      [side]: { ...player, party, pendingAction: undefined },
      log: [...room.log, log(`${player.name} has no deployable technology left.`), log(`${room[winner]?.name ?? 'Opponent'} wins the PvP battle!`)],
    };
  }
  if (aliveIndex !== player.activeIndex) {
    return {
      ...room,
      [side]: {
        ...player,
        party,
        activeIndex: aliveIndex,
        participant: participant(party[aliveIndex]),
        pendingAction: undefined,
      },
      log: [...room.log, log(`${player.name} auto-deployed ${getTechnology(party[aliveIndex].definitionId).name}.`)],
    };
  }
  return {
    ...room,
    [side]: { ...player, party, pendingAction: undefined },
  };
}

export function submitPvpAction(room: PvpBattleRoom, side: PvpSide, action: BattleAction): PvpBattleRoom {
  if (room.status !== 'active' || !room.guest) return room;
  const allowed =
    action.kind === 'execute' ||
    action.kind === 'debug' ||
    action.kind === 'analyze' ||
    action.kind === 'swap' ||
    action.kind === 'escape';
  if (!allowed) return room;

  const nextRoom: PvpBattleRoom = {
    ...room,
    [side]: { ...room[side], pendingAction: action },
  };
  if (!nextRoom.host.pendingAction || !nextRoom.guest?.pendingAction) return nextRoom;
  return resolvePvpTurn(nextRoom as PvpBattleRoom & { guest: PvpPlayerState });
}

function resolvePvpTurn(room: PvpBattleRoom & { guest: PvpPlayerState }): PvpBattleRoom {
  let host = room.host;
  let guest = room.guest;
  const entries: BattleLogEntry[] = [];
  const hostAction = host.pendingAction;
  const guestAction = guest.pendingAction;

  if (!hostAction || !guestAction) return room;

  if (hostAction.kind === 'escape') {
    return { ...room, status: 'finished', winner: 'guest', log: [...room.log, log(`${host.name} forfeited. ${guest.name} wins!`)] };
  }
  if (guestAction.kind === 'escape') {
    return { ...room, status: 'finished', winner: 'host', log: [...room.log, log(`${guest.name} forfeited. ${host.name} wins!`)] };
  }

  host = tickStatus(host, entries);
  guest = tickStatus(guest, entries);

  if (host.participant.tech.currentHp <= 0 || guest.participant.tech.currentHp <= 0) {
    let faintedRoom: PvpBattleRoom = { ...room, host, guest, log: [...room.log, ...entries], turn: room.turn + 1 };
    if (host.participant.tech.currentHp <= 0) faintedRoom = resolveFainted(faintedRoom, 'host');
    if (faintedRoom.status !== 'finished' && guest.participant.tech.currentHp <= 0) {
      faintedRoom = resolveFainted(faintedRoom, 'guest');
    }
    return faintedRoom;
  }

  const order: PvpSide[] = effectiveSpeed(host) >= effectiveSpeed(guest) ? ['host', 'guest'] : ['guest', 'host'];

  for (const side of order) {
    const action = side === 'host' ? hostAction : guestAction;
    const actor = side === 'host' ? host : guest;
    const target = side === 'host' ? guest : host;
    if (actor.participant.tech.currentHp <= 0) continue;

    if (action.kind === 'swap') {
      if (side === 'host') host = runSwap(host, action.partyIndex, entries);
      else guest = runSwap(guest, action.partyIndex, entries);
    } else if (action.kind === 'debug') {
      if (side === 'host') host = runDebug(host, entries);
      else guest = runDebug(guest, entries);
    } else if (action.kind === 'analyze') {
      if (side === 'host') host = runAnalyze(host, guest, entries);
      else guest = runAnalyze(guest, host, entries);
    } else if (action.kind === 'execute') {
      const result = runExecute(actor, target, action.skillId, entries);
      if (side === 'host') {
        host = result.actor;
        guest = result.target;
      } else {
        guest = result.actor;
        host = result.target;
      }
    }

    if (host.participant.tech.currentHp <= 0 || guest.participant.tech.currentHp <= 0) break;
  }

  let next: PvpBattleRoom = {
    ...room,
    host: withSyncedParty(host),
    guest: withSyncedParty(guest),
    turn: room.turn + 1,
    log: [...room.log, ...entries, log('Next commit window is open.')],
  };

  if (next.host.participant.tech.currentHp <= 0) next = resolveFainted(next, 'host');
  if (next.status !== 'finished' && next.guest && next.guest.participant.tech.currentHp <= 0) {
    next = resolveFainted(next, 'guest');
  }
  return next;
}
