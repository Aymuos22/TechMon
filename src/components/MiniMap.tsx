import type { PlayerState } from '../types/player';
import { minimapLandmarks, getMap } from '../data/cities';

interface Props {
  player: PlayerState;
  onClose: () => void;
}

export function MiniMap({ player, onClose }: Props) {
  const map = getMap(player.mapId);
  const unlocked = minimapLandmarks.filter((lm) => {
    if (!lm.unlockedBy) return true;
    return player.flags[lm.unlockedBy];
  });

  return (
    <div className="overlay-panel map-panel">
      <header>
        <h2>World Map</h2>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </header>
      <p className="meta">
        Current: <strong>{map.name}</strong> ({player.position.x}, {player.position.y})
      </p>
      <div className="minimap-grid">
        {Array.from({ length: Math.min(map.height, 16) }, (_, y) => (
          <div key={y} className="minimap-row">
            {Array.from({ length: Math.min(map.width, 24) }, (_, x) => {
              const isPlayer = x === player.position.x && y === player.position.y;
              const tile = map.tiles[y]?.[x] ?? 0;
              const walkable = map.collision[y] ? !map.collision[y][x] : false;
              return (
                <span
                  key={x}
                  className={`minimap-cell ${isPlayer ? 'player' : walkable ? 'walk' : 'wall'} t${tile}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <ul className="landmark-list">
        {unlocked.map((lm) => (
          <li key={lm.id}>
            <span className={`lm-${lm.kind}`} />
            {lm.name}
            {lm.mapId === player.mapId ? ' ◀' : ''}
          </li>
        ))}
      </ul>
      <div className="badge-row">
        Badges:{' '}
        {player.badges.length === 0
          ? 'None'
          : player.badges.map((b) => (
              <span key={b} className="badge-chip">
                {b}
              </span>
            ))}
      </div>
    </div>
  );
}
