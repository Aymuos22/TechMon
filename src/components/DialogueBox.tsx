import { useEffect, useState } from 'react';
import type { DialogueEngine } from '../game/dialogue/DialogueEngine';

interface Props {
  dialogue: DialogueEngine;
  onClose?: () => void;
}

export function DialogueBox({ dialogue }: Props) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 50);
    return () => window.clearInterval(id);
  }, []);

  const session = dialogue.getSession();
  if (!session) return null;

  const choices = dialogue.getChoices();
  const showChoices = dialogue.isTextComplete() && choices.length > 0;

  return (
    <div className="dialogue-box" role="dialog" aria-live="polite">
      <div className="dialogue-speaker">{session.current.speaker}</div>
      <div className="dialogue-text">
        {session.displayedText}
        {!dialogue.isTextComplete() && <span className="cursor-blink">▌</span>}
      </div>
      {showChoices && (
        <ul className="dialogue-choices">
          {choices.map((c, i) => (
            <li key={c.label} className={i === session.choiceIndex ? 'selected' : ''}>
              {i === session.choiceIndex ? '▶ ' : '  '}
              {c.label}
            </li>
          ))}
        </ul>
      )}
      {!showChoices && dialogue.isTextComplete() && (
        <div className="dialogue-hint">▼ A / Z / Enter</div>
      )}
    </div>
  );
}
