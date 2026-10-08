import { useEffect, useRef } from 'react';
import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from '../types/common';
import type { GameEngine } from '../game/engine/GameEngine';

interface Props {
  engine: GameEngine | null;
}

export function GameCanvas({ engine }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !engine) return;
    engine.mount(canvas);
    return () => {
      engine.unmount();
    };
  }, [engine]);

  return (
    <canvas
      ref={ref}
      width={VIEWPORT_WIDTH}
      height={VIEWPORT_HEIGHT}
      className="game-canvas"
      aria-label="TECHMON game world"
    />
  );
}
