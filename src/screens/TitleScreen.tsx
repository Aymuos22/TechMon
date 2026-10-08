import { useEffect, useState } from 'react';
import { audioManager } from '../game/audio/AudioManager';

interface Props {
  hasSave: boolean;
  onNewGame: (name: string) => void;
  onContinue: () => void;
  onTechDex: () => void;
  onSettings: () => void;
  onCredits: () => void;
}

export function TitleScreen({
  hasSave,
  onNewGame,
  onContinue,
  onTechDex,
  onSettings,
  onCredits,
}: Props) {
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('Byte');
  const [selected, setSelected] = useState(0);

  const options = [
    { id: 'new', label: 'NEW GAME', action: () => setNaming(true) },
    ...(hasSave
      ? [{ id: 'continue', label: 'CONTINUE', action: onContinue }]
      : []),
    { id: 'techdex', label: 'TECHDEX', action: onTechDex },
    { id: 'settings', label: 'SETTINGS', action: onSettings },
    { id: 'credits', label: 'CREDITS', action: onCredits },
  ];

  useEffect(() => {
    audioManager.playMusic('title');
  }, []);

  useEffect(() => {
    if (naming) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') {
        setSelected((s) => (s - 1 + options.length) % options.length);
        audioManager.playSfx('ui');
      }
      if (e.key === 'ArrowDown' || e.key === 's') {
        setSelected((s) => (s + 1) % options.length);
        audioManager.playSfx('ui');
      }
      if (e.key === 'Enter' || e.key === 'z' || e.key === ' ') {
        void audioManager.resume();
        options[selected]?.action();
        audioManager.playSfx('menu');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="title-screen">
      <div className="title-bg" />
      <div className="title-content">
        <p className="title-eyebrow">A CODE FRONTIER PRODUCTION</p>
        <h1 className="title-logo">
          <span>TECHMON</span>
          <span className="subtitle">CODE FRONTIER</span>
        </h1>
        <p className="tagline">Build. Battle. Deploy.</p>

        {!naming ? (
          <ul className="title-menu">
            {options.map((opt, i) => (
              <li key={opt.id}>
                <button
                  type="button"
                  className={i === selected ? 'selected' : ''}
                  onClick={() => {
                    void audioManager.resume();
                    opt.action();
                  }}
                  onMouseEnter={() => setSelected(i)}
                >
                  {i === selected ? '▶ ' : ''}
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <form
            className="name-form"
            onSubmit={(e) => {
              e.preventDefault();
              void audioManager.resume();
              onNewGame(name.trim() || 'Byte');
            }}
          >
            <label>
              Enter your name
              <input
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 12))}
                maxLength={12}
                autoFocus
              />
            </label>
            <div className="row-actions">
              <button type="submit">Start</button>
              <button type="button" onClick={() => setNaming(false)}>
                Back
              </button>
            </div>
          </form>
        )}
      </div>
      <div className="title-scanlines" />
    </div>
  );
}
