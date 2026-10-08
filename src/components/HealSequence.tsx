import { useEffect, useState } from 'react';

const STEPS = [
  'Technology scanning...',
  'System diagnostics...',
  'Restoring memory...',
  'Optimizing runtime...',
  'Restoring Execution Points...',
  'Complete!',
];

interface Props {
  onDone: () => void;
}

export function HealSequence({ onDone }: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= STEPS.length - 1) {
      const t = window.setTimeout(onDone, 700);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), 550);
    return () => window.clearTimeout(t);
  }, [step, onDone]);

  return (
    <div className="overlay-panel heal-panel gba-panel">
      <h2>CODE CENTER</h2>
      <p className="speaker">Nurse Byte</p>
      <div className="heal-anim">
        <div className="heal-pulse" />
        <p className="heal-step">{STEPS[step]}</p>
        <div className="heal-bar">
          <div
            className="heal-bar-fill"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
