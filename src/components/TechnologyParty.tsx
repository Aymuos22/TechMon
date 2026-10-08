import { getTechnology } from '../data/technologies';
import type { OwnedTechnology } from '../types/technology';
import { HealthBar } from './HealthBar';
import { XPBar } from './XPBar';
import { getSkill } from '../data/skills';
import { TechLogo } from './TechLogo';

interface Props {
  party: OwnedTechnology[];
  storage: OwnedTechnology[];
  onSwap: (a: number, b: number) => void;
  onToStorage: (index: number) => void;
  onToParty: (index: number) => void;
  onUpgrade: (index: number) => void;
  onUnlearn: (index: number) => void;
  onForgetSkill: (partyIndex: number, skillId: string) => void;
  onClose: () => void;
  /** Only true at Code Center Tech Storage terminal */
  allowStorage?: boolean;
}

export function TechnologyParty({
  party,
  storage,
  onSwap,
  onToStorage,
  onToParty,
  onUpgrade,
  onUnlearn,
  onForgetSkill,
  onClose,
  allowStorage = false,
}: Props) {
  return (
    <div className="overlay-panel party-panel gba-panel">
      <header>
        <h2>{allowStorage ? 'TECH STORAGE' : 'TECHNOLOGIES'}</h2>
        <button type="button" onClick={onClose}>
          B / Close
        </button>
      </header>
      <p className="meta party-hint">
        Tip: click a move to forget it. Unlearn removes the tech from your party.
      </p>
      <h3>Party ({party.length}/6)</h3>
      <div className="party-grid">
        {party.map((t, i) => {
          const def = getTechnology(t.definitionId);
          return (
            <div key={t.instanceId} className="party-card" style={{ borderColor: def.color }}>
              <div className="party-card-head">
                <TechLogo technologyId={def.id} size="sm" />
                <strong>{def.name}</strong>
                <span>Lv{t.level}</span>
              </div>
              <div className="type-tags">
                {def.types.map((ty) => (
                  <span key={ty} className={`type-tag type-${ty}`}>
                    {ty}
                  </span>
                ))}
              </div>
              <HealthBar current={t.currentHp} max={t.maxHp} />
              <XPBar level={t.level} experience={t.experience} />
              <ul className="skill-mini">
                {t.skillIds.map((id) => (
                  <li key={id}>
                    <button
                      type="button"
                      className="skill-forget-btn"
                      title="Forget this move"
                      onClick={() => onForgetSkill(i, id)}
                    >
                      {getSkill(id).name} ✕
                    </button>
                  </li>
                ))}
              </ul>
              <div className="row-actions">
                {i > 0 && (
                  <button type="button" onClick={() => onSwap(i, 0)}>
                    Lead
                  </button>
                )}
                {allowStorage && (
                  <button type="button" onClick={() => onToStorage(i)}>
                    Deposit
                  </button>
                )}
                <button type="button" onClick={() => onUpgrade(i)}>
                  Upgrade
                </button>
                <button type="button" className="danger-btn" onClick={() => onUnlearn(i)}>
                  Unlearn
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {allowStorage && <h3>Tech Storage ({storage.length})</h3>}
      {allowStorage && (
        <ul className="item-list">
          {storage.length === 0 && <li className="empty">Empty</li>}
          {storage.map((t, i) => (
            <li key={t.instanceId}>
              <button type="button" onClick={() => onToParty(i)}>
                {getTechnology(t.definitionId).name} Lv{t.level} — Withdraw
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
