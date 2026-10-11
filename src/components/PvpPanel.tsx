import { useEffect, useMemo, useState } from 'react';
import { getSkill, getSkillMaxEP } from '../data/skills';
import { getTechnology } from '../data/technologies';
import {
  createPvpRoom,
  joinPvpRoom,
  leavePvpRoom,
  loadPvpRoom,
  submitPvpAction,
} from '../game/pvp/PvpClient';
import type { BattleAction } from '../types/battle';
import type { PlayerState } from '../types/player';
import type { PvpRoomView, PvpSide } from '../types/pvp';
import { HealthBar } from './HealthBar';
import { TechLogo } from './TechLogo';

interface Props {
  player: PlayerState;
  signedIn: boolean;
  onClose: () => void;
  onToast: (text: string) => void;
}

function opposite(side: PvpSide): PvpSide {
  return side === 'host' ? 'guest' : 'host';
}

function formatCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
}

export function PvpPanel({ player, signedIn, onClose, onToast }: Props) {
  const [view, setView] = useState<PvpRoomView | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [panel, setPanel] = useState<'main' | 'skills' | 'party'>('main');

  const hasReadyParty = player.party.some((tech) => tech.currentHp > 0);
  const room = view?.room;
  const side = view?.side;
  const self = room && side ? room[side] : null;
  const foe = room && side ? room[opposite(side)] : null;
  const selfDef = self ? getTechnology(self.participant.tech.definitionId) : null;
  const foeDef = foe ? getTechnology(foe.participant.tech.definitionId) : null;
  const waitingForOpponent = room?.status === 'waiting';
  const waitingForTurn =
    room?.status === 'active' && !!self?.pendingAction && !foe?.pendingAction;
  const bothCommitted =
    room?.status === 'active' && !!self?.pendingAction && !!foe?.pendingAction;
  const canAct = room?.status === 'active' && !!foe && !self?.pendingAction;

  const latestLog = useMemo(() => room?.log.slice(-5) ?? [], [room?.log]);

  useEffect(() => {
    if (!room || room.status === 'finished') return;
    const id = window.setInterval(() => {
      void loadPvpRoom(room.code)
        .then(setView)
        .catch(() => undefined);
    }, 1400);
    return () => window.clearInterval(id);
  }, [room]);

  async function run(label: string, task: () => Promise<PvpRoomView>): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      const next = await task();
      setView(next);
      setPanel('main');
    } catch (err) {
      const message = err instanceof Error ? err.message : `${label}_failed`;
      setError(message);
      onToast(message.replaceAll('_', ' '));
    } finally {
      setBusy(false);
    }
  }

  const submitAction = (action: BattleAction) => {
    if (!room || !canAct) return;
    void run('action', () => submitPvpAction(room.code, action));
  };

  return (
    <div className="overlay-panel pvp-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">FAANG Heights</p>
          <h2>Live Coding Tower</h2>
        </div>
        <button type="button" onClick={onClose}>×</button>
      </div>

      {!signedIn && (
        <div className="pvp-empty">
          <h3>Google sign-in required</h3>
          <p>PvP rooms use cloud identity so two different accounts can share one battle id.</p>
          <button type="button" onClick={() => { window.location.href = '/api/auth/login'; }}>
            Sign in with Google
          </button>
        </div>
      )}

      {signedIn && !hasReadyParty && (
        <div className="pvp-empty">
          <h3>No battle-ready tech</h3>
          <p>Heal or register at least one technology before entering PvP.</p>
        </div>
      )}

      {signedIn && hasReadyParty && !room && (
        <div className="pvp-lobby">
          <button
            type="button"
            disabled={busy}
            onClick={() => void run('create', () => createPvpRoom(player.name, player.party))}
          >
            Create Battle ID
          </button>
          <div className="pvp-join">
            <input
              value={joinCode}
              onChange={(event) => setJoinCode(formatCode(event.target.value))}
              placeholder="BATTLE ID"
              maxLength={8}
            />
            <button
              type="button"
              disabled={busy || joinCode.length < 4}
              onClick={() => void run('join', () => joinPvpRoom(joinCode, player.name, player.party))}
            >
              Join
            </button>
          </div>
        </div>
      )}

      {room && self && (
        <div className="pvp-room">
          <div className="pvp-code">
            <span>Battle ID</span>
            <strong>{room.code}</strong>
          </div>

          {waitingForOpponent && (
            <div className="pvp-empty compact">
              <h3>Waiting for opponent</h3>
              <p>Share this battle id with another signed-in player.</p>
            </div>
          )}

          {foe && selfDef && foeDef && (
            <div className="pvp-arena">
              <div className="pvp-side">
                <span>{foe.name}</span>
                <TechLogo technologyId={foeDef.id} size="lg" />
                <strong>{foeDef.name} Lv{foe.participant.tech.level}</strong>
                <HealthBar current={foe.participant.tech.currentHp} max={foe.participant.tech.maxHp} compact />
                {foe.pendingAction && <small>Committed</small>}
              </div>
              <div className="pvp-side self">
                <span>{self.name}</span>
                <TechLogo technologyId={selfDef.id} size="lg" />
                <strong>{selfDef.name} Lv{self.participant.tech.level}</strong>
                <HealthBar current={self.participant.tech.currentHp} max={self.participant.tech.maxHp} compact />
                {self.pendingAction && <small>Committed</small>}
              </div>
            </div>
          )}

          <div className="pvp-log">
            {latestLog.map((entry) => (
              <p key={entry.id}>{entry.text}</p>
            ))}
            {waitingForTurn && <p>Waiting for opponent to commit...</p>}
            {bothCommitted && <p>Resolving turn...</p>}
            {room.status === 'finished' && (
              <p>{room.winner === side ? 'You won the live coding battle!' : 'Opponent won this one.'}</p>
            )}
          </div>

          {room.status === 'active' && selfDef && (
            <div className="pvp-actions">
              {!canAct && <p className="pvp-wait">Move committed. Polling the tower server...</p>}
              {canAct && panel === 'main' && (
                <div className="fr-command-grid">
                  <button type="button" onClick={() => setPanel('skills')}>FIGHT</button>
                  <button type="button" onClick={() => submitAction({ kind: 'analyze' })}>ANALYZE</button>
                  <button type="button" onClick={() => submitAction({ kind: 'debug' })}>DEBUG</button>
                  <button type="button" onClick={() => setPanel('party')}>TECH</button>
                </div>
              )}
              {canAct && panel === 'skills' && (
                <div className="fr-move-grid">
                  {self.participant.tech.skillIds.map((skillId) => {
                    const skill = getSkill(skillId);
                    const maxEP = getSkillMaxEP(skill);
                    const ep = self.participant.tech.skillEP[skillId] ?? maxEP;
                    return (
                      <button
                        key={skillId}
                        type="button"
                        disabled={ep <= 0}
                        onClick={() => submitAction({ kind: 'execute', skillId })}
                      >
                        {skill.name}
                        <small>{skill.type} · EP {ep}/{maxEP}</small>
                      </button>
                    );
                  })}
                  <button type="button" className="back" onClick={() => setPanel('main')}>CANCEL</button>
                </div>
              )}
              {canAct && panel === 'party' && (
                <div className="fr-party-list">
                  {self.party.map((tech, index) => {
                    const def = getTechnology(tech.definitionId);
                    return (
                      <button
                        key={tech.instanceId}
                        type="button"
                        disabled={tech.currentHp <= 0 || index === self.activeIndex}
                        onClick={() => submitAction({ kind: 'swap', partyIndex: index })}
                      >
                        {def.name}
                        <small>Lv{tech.level} · {tech.currentHp}/{tech.maxHp}</small>
                      </button>
                    );
                  })}
                  <button type="button" className="back" onClick={() => setPanel('main')}>CANCEL</button>
                </div>
              )}
            </div>
          )}

          <div className="pvp-footer">
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (room.status === 'finished') {
                  setView(null);
                } else {
                  void run('leave', () => leavePvpRoom(room.code));
                }
              }}
            >
              {room.status === 'finished' ? 'Close Room' : 'Forfeit / Leave'}
            </button>
          </div>
        </div>
      )}

      {error && <p className="pvp-error">{error.replaceAll('_', ' ')}</p>}
    </div>
  );
}
