import { useCallback, useEffect, useState } from 'react'
import { Toast } from '../components/ui/Toast'
import type { ToastVariant } from '../components/ui/Toast'
import { useAlbum } from '../hooks/useAlbum'
import { Link, navigate, useLocation } from '../router'
import type { UnlockResult } from '../types'
import { isAlbumLocationState } from '../utils/token'

function toastVariant(result: UnlockResult): ToastVariant {
  if (!result.success) return 'error'
  return result.isAlreadyUnlocked ? 'info' : 'success'
}

// Placeholder album; the real sticker grid arrives in a later stage.
export default function AlbumView() {
  const { stands, unlockedIds, progress, isCompleted, resetAlbum } = useAlbum()
  const location = useLocation()
  const [result, setResult] = useState<UnlockResult | null>(() =>
    isAlbumLocationState(location.state) ? location.state.unlockResult : null,
  )

  // Consume the scan result once so a reload doesn't show the toast again.
  useEffect(() => {
    if (isAlbumLocationState(window.history.state)) {
      navigate(window.location.pathname, { replace: true })
    }
  }, [])

  const dismissToast = useCallback(() => setResult(null), [])
  const highlightedId = result?.success ? result.stand?.id : undefined

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="font-display text-5xl text-brand-magenta">Puerta 18</h1>
        <p className="text-white/70">
          {unlockedIds.length} / {stands.length} cromos · {progress}%
          {isCompleted && ' · ¡Álbum completo!'}
        </p>
      </header>

      <ul className="space-y-2">
        {stands.map((stand) => {
          const unlocked = unlockedIds.includes(stand.id)
          return (
            <li
              key={stand.id}
              data-highlighted={stand.id === highlightedId || undefined}
              className={`rounded-xl bg-brand-surface px-4 py-3 ${
                stand.id === highlightedId ? 'ring-2 ring-brand-yellow' : ''
              } ${unlocked ? '' : 'opacity-50'}`}
            >
              {unlocked ? stand.name : '???'}
            </li>
          )
        })}
      </ul>

      <Link
        to="/scanner"
        className="rounded-full bg-brand-cyan px-6 py-3 text-center font-semibold text-brand-dark"
      >
        Escanear QR
      </Link>

      {import.meta.env.DEV && (
        <button type="button" onClick={resetAlbum} className="text-xs text-white/50 underline">
          Reiniciar álbum (solo desarrollo)
        </button>
      )}

      <Toast
        message={result?.message ?? null}
        variant={result ? toastVariant(result) : undefined}
        onDismiss={dismissToast}
      />
    </main>
  )
}
