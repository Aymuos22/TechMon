import { xpForLevel } from '../game/technologies/TechnologyEngine';

interface Props {
  level: number;
  experience: number;
  compact?: boolean;
}

export function XPBar({ level, experience, compact = false }: Props) {
  const needed = xpForLevel(level);
  const pct = needed <= 0 ? 0 : Math.min(100, (experience / needed) * 100);
  return (
    <div
      className={`stat-bar xp-bar has-label${compact ? ' compact' : ''}${
        compact ? '' : ' has-value'
      }`}
    >
      {!compact && <span className="stat-bar-label">LV {level}</span>}
      {compact && <span className="fr-exp-label">EXP</span>}
      <div className="stat-bar-track">
        <div className="stat-bar-fill" style={{ width: `${pct}%`, background: '#3d7cff' }} />
      </div>
      {!compact && (
        <span className="stat-bar-value">
          {experience}/{needed}
        </span>
      )}
    </div>
  );
}
