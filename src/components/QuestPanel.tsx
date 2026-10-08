import type { PlayerState } from '../types/player';
import { questById } from '../data/quests';
import { quizzes } from '../data/quests';

interface Props {
  player: PlayerState;
  onClose: () => void;
  onQuiz: (quizId: string, optionIndex: number) => boolean;
}

export function QuestPanel({ player, onClose, onQuiz }: Props) {
  return (
    <div className="overlay-panel quest-panel">
      <header>
        <h2>Quests</h2>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </header>
      <h3>Active</h3>
      {player.activeQuests.length === 0 && <p className="empty">No active quests.</p>}
      {player.activeQuests.map((aq) => {
        const def = questById[aq.questId];
        if (!def) return null;
        const step = def.steps[aq.stepIndex];
        return (
          <div key={aq.questId} className="quest-card">
            <h4>{def.name}</h4>
            <p>{def.description}</p>
            <p className="meta">
              Step {aq.stepIndex + 1}/{def.steps.length}: {step?.description}
            </p>
            {step?.kind === 'quiz' && step.quizId && quizzes[step.quizId] && (
              <div className="quiz-block">
                <p>{quizzes[step.quizId].question}</p>
                {quizzes[step.quizId].options.map((opt, i) => (
                  <button key={opt} type="button" onClick={() => onQuiz(step.quizId!, i)}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <h3>Completed</h3>
      <ul>
        {player.completedQuests.map((id) => (
          <li key={id}>{questById[id]?.name ?? id}</li>
        ))}
        {player.completedQuests.length === 0 && <li className="empty">None yet</li>}
      </ul>
    </div>
  );
}
