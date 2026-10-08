import { useCallback, useEffect, useState, type MouseEvent, type TouchEvent } from 'react';

interface Props {
  engine: {
    input: {
      virtualPress: (key: string) => void;
      virtualRelease: (key: string) => void;
    };
  } | null;
  visible: boolean;
}

type VirtualKey = 'up' | 'down' | 'left' | 'right' | 'confirm' | 'cancel' | 'menu';

function bindHandlers(
  engine: NonNullable<Props['engine']>,
  key: VirtualKey,
) {
  const onStart = (e: TouchEvent | MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    engine.input.virtualPress(key);
  };
  const onEnd = (e: TouchEvent | MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    engine.input.virtualRelease(key);
  };
  return {
    onTouchStart: onStart,
    onTouchEnd: onEnd,
    onTouchCancel: onEnd,
    onMouseDown: onStart,
    onMouseUp: onEnd,
    onMouseLeave: onEnd,
    onContextMenu: (e: MouseEvent) => e.preventDefault(),
  };
}

export function MobileControls({ engine, visible }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  // Release all held keys if controls hide mid-press
  useEffect(() => {
    if (!visible || collapsed || !engine) return;
    return () => {
      for (const key of ['up', 'down', 'left', 'right', 'confirm', 'cancel', 'menu'] as const) {
        engine.input.virtualRelease(key);
      }
    };
  }, [visible, collapsed, engine]);

  const toggle = useCallback(() => setCollapsed((c) => !c), []);

  if (!visible || !engine) return null;

  if (collapsed) {
    return (
      <div className="mobile-controls mobile-controls-collapsed">
        <button type="button" className="mobile-show-btn" onClick={toggle}>
          Show Controls
        </button>
      </div>
    );
  }

  return (
    <div className="mobile-controls" aria-label="Touch controls">
      <div className="dpad" role="group" aria-label="D-pad">
        <button type="button" className="dpad-btn up" aria-label="Up" {...bindHandlers(engine, 'up')}>
          ▲
        </button>
        <button type="button" className="dpad-btn left" aria-label="Left" {...bindHandlers(engine, 'left')}>
          ◀
        </button>
        <span className="dpad-center" aria-hidden />
        <button type="button" className="dpad-btn right" aria-label="Right" {...bindHandlers(engine, 'right')}>
          ▶
        </button>
        <button type="button" className="dpad-btn down" aria-label="Down" {...bindHandlers(engine, 'down')}>
          ▼
        </button>
      </div>

      <div className="mobile-mid">
        <button type="button" className="btn-menu" aria-label="Menu" {...bindHandlers(engine, 'menu')}>
          MENU
        </button>
        <button type="button" className="mobile-hide-btn" onClick={toggle}>
          Hide
        </button>
      </div>

      <div className="action-btns" role="group" aria-label="Actions">
        <button type="button" className="btn-b" aria-label="B / Cancel" {...bindHandlers(engine, 'cancel')}>
          B
        </button>
        <button type="button" className="btn-a" aria-label="A / Confirm" {...bindHandlers(engine, 'confirm')}>
          A
        </button>
      </div>
    </div>
  );
}

/** Prefer touch controls on phones / coarse pointers */
export function shouldShowMobileControls(forced: boolean): boolean {
  if (forced) return true;
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(max-width: 900px)').matches ||
    window.matchMedia('(pointer: coarse)').matches ||
    navigator.maxTouchPoints > 0
  );
}
