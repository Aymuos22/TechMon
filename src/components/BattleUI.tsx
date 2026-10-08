import { getTechnology } from '../data/technologies';
import { getSkill, getSkillMaxEP } from '../data/skills';
import { getItem } from '../data/items';
import type { BattleState, BattleAction } from '../types/battle';
import type { Inventory } from '../types/item';
import { HealthBar } from './HealthBar';
import { XPBar } from './XPBar';
import { TechLogo } from './TechLogo';
import { useEffect, useState } from 'react';
import { getScannerTier } from '../game/battle/CaptureCalculator';

interface Props {
  battle: BattleState;
  inventory: Inventory;
  onAction: (action: BattleAction) => void;
  levelUpName?: string | null;
}

type Panel = 'main' | 'skills' | 'party' | 'items';

export function BattleUI({ battle, inventory, onAction, levelUpName }: Props) {
  const [panel, setPanel] = useState<Panel>('main');
  const playerDef = getTechnology(battle.player.tech.definitionId);
  const enemyDef = getTechnology(battle.enemy.tech.definitionId);
  const latestLog = battle.log.slice(-3);
  const scannerTier = getScannerTier(inventory);
  const canRegister = battle.isWild && scannerTier !== 'none';

  // Reset command menu on new rounds / forced switch — not while browsing BAG
  useEffect(() => {
    if (battle.phase === 'must_switch') setPanel('party');
    else if (battle.phase === 'player_turn') setPanel('main');
    // intentionally only when phase or turn changes (not when opening BAG)
  }, [battle.phase, battle.turn]);

  const scanners = inventory.filter((slot) => {
    if (slot.quantity <= 0) return false;
    return getItem(slot.itemId).type === 'scanner';
  });

  const battleItems = inventory.filter((slot) => {
    if (slot.quantity <= 0) return false;
    const item = getItem(slot.itemId);
    if (item.type === 'scanner') return false;
    return item.usableInBattle;
  });

  const actionsLocked = battle.phase !== 'player_turn' && battle.phase !== 'must_switch';
  const forcedSwitch = battle.phase === 'must_switch';

  const prompt =
    forcedSwitch
      ? 'Choose a technology!'
      : panel === 'skills'
        ? 'Choose a skill!'
        : panel === 'items'
          ? 'Choose an item!'
          : panel === 'party'
            ? 'Choose a technology!'
            : actionsLocked
              ? latestLog[latestLog.length - 1]?.text ?? '…'
              : `What will\n${playerDef.name.toUpperCase()} do?`;

  return (
    <div className="battle-ui firered-battle">
      <div className="fr-stage">
        {/* Enemy HUD — top left */}
        <div className="fr-hud fr-hud-enemy">
          <div className="fr-hud-name">
            <span>{enemyDef.name}</span>
            <span className="fr-lv">Lv{battle.enemy.tech.level}</span>
          </div>
          <div className="fr-hud-hp-row">
            <span className="fr-hp-label">HP</span>
            <HealthBar
              current={battle.enemy.tech.currentHp}
              max={Math.max(1, battle.enemy.tech.maxHp)}
              showValue={false}
              compact
            />
          </div>
          {battle.enemy.tech.status && (
            <div className="fr-status">{battle.enemy.tech.status}</div>
          )}
          {battle.enemy.analyzed && (
            <div className="fr-types">
              {(battle.enemy.revealedTypes.length
                ? battle.enemy.revealedTypes
                : enemyDef.types
              ).map((t) => (
                <span key={t} className={`type-tag type-${t}`}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Enemy sprite — top right */}
        <TechLogo
          technologyId={enemyDef.id}
          size="xl"
          className="fr-sprite fr-sprite-enemy"
        />

        {/* Player sprite — bottom left */}
        <TechLogo
          technologyId={playerDef.id}
          size="xl"
          className="fr-sprite fr-sprite-player"
        />

        {/* Player HUD — bottom right */}
        <div className="fr-hud fr-hud-player">
          <div className="fr-hud-name">
            <span>{playerDef.name}</span>
            <span className="fr-lv">Lv{battle.player.tech.level}</span>
          </div>
          <div className="fr-hud-hp-row">
            <span className="fr-hp-label">HP</span>
            <HealthBar
              current={battle.player.tech.currentHp}
              max={Math.max(1, battle.player.tech.maxHp)}
              showValue={false}
              compact
            />
          </div>
          <div className="fr-hp-nums">
            {Math.max(0, battle.player.tech.currentHp)}/
            {Math.max(1, battle.player.tech.maxHp)}
          </div>
          <XPBar
            level={battle.player.tech.level}
            experience={battle.player.tech.experience}
            compact
          />
          {battle.player.tech.status && (
            <div className="fr-status">{battle.player.tech.status}</div>
          )}
        </div>
      </div>

      {levelUpName && <div className="level-up-banner">LEVEL UP! {levelUpName}</div>}

      <div className="fr-bottom">
        <div className="fr-message">
          {forcedSwitch && <p className="must-switch-hint">Choose a technology to continue.</p>}
          {!actionsLocked && panel === 'main' && !forcedSwitch ? (
            <p className="fr-prompt">
              What will
              <br />
              <strong>{playerDef.name.toUpperCase()}</strong> do?
            </p>
          ) : (
            latestLog.map((l) => (
              <p key={l.id}>{l.text}</p>
            ))
          )}
          {actionsLocked && latestLog.length === 0 && <p>{prompt}</p>}
        </div>

        {!actionsLocked && (
          <div className={`fr-command ${panel !== 'main' || forcedSwitch ? 'fr-command-wide' : ''}`}>
            {panel === 'main' && !forcedSwitch && (
              <div className="fr-command-grid">
                <button type="button" onClick={() => setPanel('skills')}>
                  FIGHT
                </button>
                <button type="button" onClick={() => setPanel('items')}>
                  BAG
                </button>
                <button type="button" onClick={() => setPanel('party')}>
                  TECH
                </button>
                {battle.canEscape ? (
                  <button type="button" onClick={() => onAction({ kind: 'escape' })}>
                    RUN
                  </button>
                ) : (
                  <button type="button" disabled>
                    RUN
                  </button>
                )}
              </div>
            )}

            {panel === 'skills' && !forcedSwitch && (
              <div className="fr-move-grid">
                <button type="button" onClick={() => onAction({ kind: 'analyze' })}>
                  Analyze
                  <small>Scan types</small>
                </button>
                <button type="button" onClick={() => onAction({ kind: 'debug' })}>
                  Debug
                  <small>Fix status</small>
                </button>
                {battle.player.tech.skillIds.map((id) => {
                  const skill = getSkill(id);
                  const maxEP = getSkillMaxEP(skill);
                  const ep = battle.player.tech.skillEP?.[id] ?? maxEP;
                  return (
                    <button
                      key={id}
                      type="button"
                      disabled={ep <= 0}
                      onClick={() => {
                        setPanel('main');
                        onAction({ kind: 'execute', skillId: id });
                      }}
                    >
                      {skill.name}
                      <small>
                        {skill.type} · EP {ep}/{maxEP}
                      </small>
                    </button>
                  );
                })}
                <button type="button" className="back" onClick={() => setPanel('main')}>
                  CANCEL
                </button>
              </div>
            )}

            {(panel === 'party' || forcedSwitch) && (
              <div className="fr-move-grid">
                {battle.playerParty.map((t, i) => (
                  <button
                    key={t.instanceId}
                    type="button"
                    disabled={t.currentHp <= 0 || t.instanceId === battle.player.tech.instanceId}
                    onClick={() => {
                      setPanel('main');
                      onAction({ kind: 'swap', partyIndex: i });
                    }}
                  >
                    {getTechnology(t.definitionId).name}
                    <small>
                      Lv{t.level} · {t.currentHp}/{t.maxHp}
                      {t.currentHp <= 0 ? ' · DOWN' : ''}
                    </small>
                  </button>
                ))}
                {!forcedSwitch && (
                  <button type="button" className="back" onClick={() => setPanel('main')}>
                    CANCEL
                  </button>
                )}
              </div>
            )}

            {panel === 'items' && !forcedSwitch && (
              <div className="fr-move-grid">
                {canRegister && (
                  <button
                    type="button"
                    className="bag-register"
                    onClick={() => onAction({ kind: 'register' })}
                  >
                    Register
                    <small>
                      Capture wild tech · {scannerTier} scanner
                    </small>
                  </button>
                )}
                {canRegister &&
                  scanners.map((slot) => {
                    const item = getItem(slot.itemId);
                    return (
                      <button
                        key={slot.itemId}
                        type="button"
                        onClick={() => onAction({ kind: 'register' })}
                      >
                        {item.name} ×{slot.quantity}
                        <small>Register with this scanner</small>
                      </button>
                    );
                  })}
                {battleItems.map((slot) => {
                  const item = getItem(slot.itemId);
                  return (
                    <button
                      key={slot.itemId}
                      type="button"
                      onClick={() => {
                        setPanel('main');
                        onAction({ kind: 'item', itemId: slot.itemId });
                      }}
                    >
                      {item.name} ×{slot.quantity}
                      <small>{item.description}</small>
                    </button>
                  );
                })}
                {!canRegister && battleItems.length === 0 && (
                  <button type="button" disabled>
                    {battle.isWild ? 'No scanner or battle items' : 'No battle items'}
                  </button>
                )}
                <button type="button" className="back" onClick={() => setPanel('main')}>
                  CANCEL
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
