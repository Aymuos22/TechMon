import { getTechnology } from '../data/technologies';
import type { ChallengeState } from '../hooks/useGameState';
import { TechLogo } from './TechLogo';

interface Props {
  challenge: ChallengeState;
  onAnswer: (correct: boolean) => void;
  onCancel: () => void;
}

export function ChallengePanel({ challenge, onAnswer, onCancel }: Props) {
  const def = getTechnology(challenge.technologyId);
  const q = def.challenges[challenge.questionIndex % def.challenges.length];

  return (
    <div className="overlay-panel challenge-panel">
      <h2>Tech Scanner</h2>
      <p className="meta">Analyzing architecture: {def.name}</p>
      <TechLogo technologyId={def.id} size="lg" className="challenge-logo" />
      <p className="challenge-q">{q.question}</p>
      <div className="challenge-options">
        {q.options.map((opt, i) => (
          <button key={opt} type="button" onClick={() => onAnswer(i === q.correctIndex)}>
            {String.fromCharCode(65 + i)}. {opt}
          </button>
        ))}
      </div>
      <button type="button" className="back" onClick={onCancel}>
        Cancel analysis
      </button>
    </div>
  );
}
