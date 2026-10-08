import { useEffect, useState } from 'react';

interface Props {
  onSelect: (screen: string) => void;
  onResume: () => void;
  onSave: () => void;
}

const ITEMS = [
  { id: 'party', label: 'TECHNOLOGIES' },
  { id: 'techdex', label: 'TECHDEX' },
  { id: 'inventory', label: 'BAG' },
  { id: 'engineer_card', label: 'ENGINEER CARD' },
  { id: 'quests', label: 'JOURNAL' },
  { id: 'map', label: 'MAP' },
  { id: 'save', label: 'SAVE' },
  { id: 'settings', label: 'OPTIONS' },
  { id: 'resume', label: 'CLOSE' },
];

export function PauseMenu({ onSelect, onResume, onSave }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setIndex((i) => (i - 1 + ITEMS.length) % ITEMS.length);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setIndex((i) => (i + 1) % ITEMS.length);
      } else if (e.key === 'Enter' || e.key === 'z' || e.key === 'Z' || e.key === ' ') {
        e.preventDefault();
        activate(ITEMS[index].id);
      } else if (e.key === 'Escape' || e.key === 'x' || e.key === 'X' || e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        onResume();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const activate = (id: string) => {
    if (id === 'resume') onResume();
    else if (id === 'save') onSave();
    else onSelect(id);
  };

  return (
    <div className="overlay-panel pause-menu gba-panel">
      <h2>TECHMON</h2>
      <ul className="gba-menu-list">
        {ITEMS.map((item, i) => (
          <li key={item.id} className={i === index ? 'selected' : ''}>
            <button type="button" onClick={() => activate(item.id)}>
              {i === index ? '▶ ' : '  '}
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      <p className="hint">↑↓ Select · A/Z Confirm · B/X Back · M Menu</p>
    </div>
  );
}
