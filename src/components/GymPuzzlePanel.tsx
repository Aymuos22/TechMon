import { gymPuzzles } from '../data/quests';
import type { GymPuzzleState } from '../hooks/useGameState';

interface Props {
  puzzle: GymPuzzleState;
  onAnswer: (correct: boolean) => void;
  onClose: () => void;
}

export function GymPuzzlePanel({ puzzle, onAnswer, onClose }: Props) {
  const def = gymPuzzles[puzzle.gymId];
  if (!def) return null;
  const q = def.questions[puzzle.questionIndex];

  return (
    <div className="overlay-panel gym-panel">
      <h2>{def.title}</h2>
      <p className="meta">
        Challenge {puzzle.questionIndex + 1} / {def.questions.length}
      </p>
      <p className="challenge-q">{q.question}</p>
      <div className="challenge-options">
        {q.options.map((opt, i) => (
          <button key={opt} type="button" onClick={() => onAnswer(i === q.correctIndex)}>
            {opt}
          </button>
        ))}
      </div>
      <button type="button" className="back" onClick={onClose}>
        Leave gym
      </button>
    </div>
  );
}
