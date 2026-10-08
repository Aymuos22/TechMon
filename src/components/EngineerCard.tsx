import type { PlayerState } from '../types/player';
import { technologies } from '../data/technologies';
import { ALL_BADGE_IDS } from '../data/gymConfig';

interface Props {
  player: PlayerState;
  onClose: () => void;
}

function formatPlaytime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

export function EngineerCard({ player, onClose }: Props) {
  const registered = Object.values(player.techDex).filter((e) => e.registered).length;
  const seen = Object.values(player.techDex).filter((e) => e.discovered).length;

  return (
    <div className="overlay-panel engineer-card gba-panel">
      <header>
        <h2>ENGINEER CARD</h2>
        <button type="button" onClick={onClose}>
          B / Close
        </button>
      </header>
      <div className="card-body">
        <p className="card-name">{player.name}</p>
        <p className="meta">ID: {player.id.toUpperCase()}</p>
        <p>Credits: ₿ {player.money.toLocaleString()}</p>
        <p>Playtime: {formatPlaytime(player.playtime)}</p>
        <p>
          TechDex: {registered} / {technologies.length} registered ({seen} seen)
        </p>
        <h3>Badges</h3>
        <div className="badge-row">
          {ALL_BADGE_IDS.map((b) => (
            <span
              key={b}
              className={`badge-slot ${player.badges.includes(b) ? 'earned' : 'empty'}`}
              title={b}
            >
              {player.badges.includes(b) ? b.slice(0, 2).toUpperCase() : '·'}
            </span>
          ))}
        </div>
        {player.achievements.length > 0 && (
          <>
            <h3>Achievements</h3>
            <ul className="item-list compact">
              {player.achievements.slice(0, 6).map((a) => (
                <li key={a}>{a.replace(/_/g, ' ')}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
