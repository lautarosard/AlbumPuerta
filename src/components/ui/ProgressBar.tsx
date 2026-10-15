interface ProgressBarProps {
  /** 0–100 */
  value: number
  label: string
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between font-display tracking-wide">
        <span className="text-sm text-white/60">{label}</span>
        <span className="text-xl text-brand-yellow">{clamped}% COMPLETADO</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        className="h-4 overflow-hidden rounded-full border-2 border-white/10 bg-brand-dark"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-cyan via-brand-violet to-brand-magenta transition-[width] duration-700 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
