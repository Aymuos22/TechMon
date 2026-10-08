interface Props {
  current: number;
  max: number;
  label?: string;
  color?: string;
  showValue?: boolean;
  compact?: boolean;
}

export function HealthBar({
  current,
  max,
  label,
  color = '#3ecf8e',
  showValue = true,
  compact = false,
}: Props) {
  const safeMax = Math.max(0, max);
  const safeCurrent = Math.max(0, Math.min(safeMax, current));
  const pct = safeMax <= 0 ? 0 : Math.max(0, Math.min(100, (safeCurrent / safeMax) * 100));
  const barColor = pct < 25 ? '#e74c3c' : pct < 50 ? '#f1c40f' : color;

  return (
    <div
      className={`stat-bar${compact ? ' compact' : ''}${label ? ' has-label' : ''}${
        showValue ? ' has-value' : ''
      }`}
    >
      {label && <span className="stat-bar-label">{label}</span>}
      <div className="stat-bar-track" role="progressbar" aria-valuenow={safeCurrent} aria-valuemin={0} aria-valuemax={safeMax}>
        <div className="stat-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
      </div>
      {showValue && (
        <span className="stat-bar-value">
          {safeCurrent}/{safeMax}
        </span>
      )}
    </div>
  );
}
