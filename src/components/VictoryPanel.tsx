import { getTechnology } from '../data/technologies';
import type { OwnedTechnology } from '../types/technology';
import { XPBar } from './XPBar';
import { TechLogo } from './TechLogo';

export interface VictorySummary {
  xpGained: number;
  creditsGained: number;
  party: OwnedTechnology[];
  leveled: OwnedTechnology[];
  enemyName: string;
}

interface Props {
  summary: VictorySummary;
  onContinue: () => void;
}

export function VictoryPanel({ summary, onContinue }: Props) {
  return (
    <div className="overlay-panel victory-panel gba-panel">
      <h2>VICTORY!</h2>
      <p className="meta">{summary.enemyName} is DOWN!</p>
      {summary.creditsGained > 0 && (
        <p className="victory-line">Got ₿ {summary.creditsGained} Credits!</p>
      )}
      <p className="victory-line">Gained {summary.xpGained} XP!</p>
      <ul className="victory-party">
        {summary.party
          .filter((t) => t.currentHp > 0)
          .slice(0, 3)
          .map((t) => {
            const def = getTechnology(t.definitionId);
            const didLevel = summary.leveled.some((l) => l.instanceId === t.instanceId);
            return (
              <li key={t.instanceId}>
                <div className="row-between">
                  <span className="victory-tech">
                    <TechLogo technologyId={def.id} size="sm" />
                    <strong>
                      {def.name} <span>Lv{t.level}</span>
                    </strong>
                  </span>
                  {didLevel && <em className="level-up-tag">LEVEL UP!</em>}
                </div>
                <XPBar level={t.level} experience={t.experience} />
              </li>
            );
          })}
      </ul>
      <button type="button" className="gba-confirm" onClick={onContinue}>
        Continue (A / Enter)
      </button>
    </div>
  );
}
