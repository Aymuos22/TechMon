interface Props {
  engine: {
    input: {
      virtualPress: (key: string) => void;
      virtualRelease: (key: string) => void;
    };
  } | null;
  visible: boolean;
}

export function MobileControls({ engine, visible }: Props) {
  if (!visible || !engine) return null;

  const press = (key: string) => () => engine.input.virtualPress(key);
  const release = (key: string) => () => engine.input.virtualRelease(key);

  return (
    <div className="mobile-controls">
      <div className="dpad">
        <button
          type="button"
          className="up"
          onTouchStart={press('up')}
          onTouchEnd={release('up')}
          onMouseDown={press('up')}
          onMouseUp={release('up')}
        >
          ▲
        </button>
        <button
          type="button"
          className="left"
          onTouchStart={press('left')}
          onTouchEnd={release('left')}
          onMouseDown={press('left')}
          onMouseUp={release('left')}
        >
          ◀
        </button>
        <button
          type="button"
          className="right"
          onTouchStart={press('right')}
          onTouchEnd={release('right')}
          onMouseDown={press('right')}
          onMouseUp={release('right')}
        >
          ▶
        </button>
        <button
          type="button"
          className="down"
          onTouchStart={press('down')}
          onTouchEnd={release('down')}
          onMouseDown={press('down')}
          onMouseUp={release('down')}
        >
          ▼
        </button>
      </div>
      <div className="action-btns">
        <button
          type="button"
          className="btn-b"
          onTouchStart={press('cancel')}
          onTouchEnd={release('cancel')}
          onMouseDown={press('cancel')}
          onMouseUp={release('cancel')}
        >
          B
        </button>
        <button
          type="button"
          className="btn-a"
          onTouchStart={press('confirm')}
          onTouchEnd={release('confirm')}
          onMouseDown={press('confirm')}
          onMouseUp={release('confirm')}
        >
          A
        </button>
      </div>
    </div>
  );
}
