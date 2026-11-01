export function ProgressBar({
  progress,
  label,
  value,
  indeterminate = false,
}: {
  progress?: number | null;
  label?: string;
  value?: string;
  indeterminate?: boolean;
}) {
  const percentage = Math.max(0, Math.min(100, Math.round((progress ?? 0) * 100)));
  const isIndeterminate = indeterminate || progress == null;
  return (
    <div className="progress-card" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={isIndeterminate ? undefined : percentage} aria-valuetext={value}>
      {label && <div className="progress-label">{label}</div>}
      <div className="progress-track">
        <div className={isIndeterminate ? 'progress-fill progress-indeterminate' : 'progress-fill'} style={isIndeterminate ? undefined : { width: `${percentage}%` }} />
      </div>
      <div className="progress-value">{value ?? (isIndeterminate ? 'Calculating…' : `${percentage}%`)}</div>
    </div>
  );
}
