export function ProgressBar({
  progress,
  label,
  value,
}: {
  progress?: number | null;
  label?: string;
  value?: string;
}) {
  const percentage = Math.max(0, Math.min(100, Math.round((progress ?? 0) * 100)));
  return (
    <div className="progress-card">
      {label && <div className="progress-label">{label}</div>}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>
      <div className="progress-value">{value ?? `${percentage}%`}</div>
    </div>
  );
}
