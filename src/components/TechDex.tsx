import { useMemo, useState } from 'react';
import { technologies } from '../data/technologies';
import type { TechDexEntry } from '../types/technology';
import type { TechnologyType } from '../types/technology';
import { TechLogo } from './TechLogo';

interface Props {
  techDex: Record<string, TechDexEntry>;
  onClose: () => void;
}

export function TechDex({ techDex, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<TechnologyType | 'all' | 'registered' | 'seen'>('all');
  const [selected, setSelected] = useState(technologies[0].id);

  const list = useMemo(() => {
    return technologies.filter((t) => {
      const entry = techDex[t.id];
      if (query && !t.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (filter === 'registered') return entry?.registered;
      if (filter === 'seen') return entry?.discovered;
      if (filter !== 'all' && !t.types.includes(filter as TechnologyType)) return false;
      return true;
    });
  }, [techDex, query, filter]);

  const tech = technologies.find((t) => t.id === selected) ?? technologies[0];
  const entry = techDex[tech.id];
  const known = entry?.discovered;

  return (
    <div className="overlay-panel techdex-panel">
      <header>
        <h2>TechDex</h2>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </header>
      <div className="techdex-controls">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search technologies..."
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
        >
          <option value="all">All</option>
          <option value="registered">Registered</option>
          <option value="seen">Discovered</option>
          <option value="frontend">Frontend</option>
          <option value="backend">Backend</option>
          <option value="language">Language</option>
          <option value="database">Database</option>
          <option value="cloud">Cloud</option>
          <option value="devops">DevOps</option>
          <option value="ai">AI</option>
          <option value="messaging">Messaging</option>
        </select>
      </div>
      <div className="split-view">
        <ul className="item-list">
          {list.map((t) => {
            const e = techDex[t.id];
            const label = e?.registered ? t.name : e?.discovered ? t.name : '???';
            return (
              <li key={t.id}>
                <button
                  type="button"
                  className={selected === t.id ? 'selected' : ''}
                  onClick={() => setSelected(t.id)}
                >
                  <TechLogo
                    technologyId={t.id}
                    size="sm"
                    silhouette={!e?.discovered}
                    className="dex-list-logo"
                  />
                  #{String(t.dexNumber).padStart(3, '0')} {label}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="item-detail techdex-entry">
          <div className="dex-number">#{String(tech.dexNumber).padStart(3, '0')}</div>
          <TechLogo
            technologyId={tech.id}
            size="lg"
            silhouette={!known}
            className="dex-detail-logo"
          />
          <h3 style={{ color: known ? tech.color : '#888' }}>
            {known ? tech.name : 'Undiscovered'}
          </h3>
          {known ? (
            <>
              <div className="type-tags">
                {tech.types.map((ty) => (
                  <span key={ty} className={`type-tag type-${ty}`}>
                    {ty}
                  </span>
                ))}
              </div>
              <p>{tech.description}</p>
              <p className="meta">Difficulty: {tech.difficulty}</p>
              <p className="meta">Speciality: {tech.speciality}</p>
              <p className="meta">
                Status: {entry?.registered ? 'Registered' : 'Discovered'}
              </p>
            </>
          ) : (
            <p>Keep exploring to discover this technology.</p>
          )}
        </div>
      </div>
    </div>
  );
}
