import { ProgressBar } from '../ui/ProgressBar'
import { TrophyIcon } from '../ui/icons'

interface AlbumHeaderProps {
  progress: number
  unlockedCount: number
  total: number
  isCompleted: boolean
  onClaimReward: () => void
}

export function AlbumHeader({
  progress,
  unlockedCount,
  total,
  isCompleted,
  onClaimReward,
}: AlbumHeaderProps) {
  return (
    <header className="space-y-5">
      <h1 className="leading-none">
        <span className="inline-block -rotate-2 bg-brand-cyan px-2 font-display text-xl tracking-[0.2em] text-brand-dark">
          ÁLBUM DIGITAL
        </span>
        <span className="sr-only"> - </span>
        <span className="text-misprint mt-1 block font-display text-6xl tracking-wide text-white">
          EXPO <span className="text-brand-magenta">PUERTA 18</span>
        </span>
      </h1>

      <ProgressBar value={progress} label={`${unlockedCount}/${total} CROMOS`} />

      {isCompleted && (
        <button
          type="button"
          onClick={onClaimReward}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-yellow py-3 font-display text-2xl tracking-wider text-brand-dark transition-transform active:scale-95 motion-safe:animate-glow"
        >
          <TrophyIcon className="h-6 w-6" strokeWidth={2.5} />
          ¡Reclamar Premio!
        </button>
      )}
    </header>
  )
}
