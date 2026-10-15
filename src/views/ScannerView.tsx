import { useCallback } from 'react'
import { QrReader } from '../components/album/QrReader'
import { useAlbum } from '../hooks/useAlbum'
import { Link, navigate } from '../router'
import type { AlbumLocationState } from '../types'
import { INVALID_TOKEN_RESULT, extractToken } from '../utils/token'

/** In-app camera scanner for visitors already inside the album. */
export default function ScannerView() {
  const { unlockByToken } = useAlbum()

  const handleDecode = useCallback(
    (text: string) => {
      const token = extractToken(text)
      const unlockResult = token ? unlockByToken(token) : INVALID_TOKEN_RESULT
      // Replace so going back from the album doesn't reopen the camera.
      const state: AlbumLocationState = { unlockResult }
      navigate('/', { replace: true, state })
    },
    [unlockByToken],
  )

  return (
    <main className="pb-safe mx-auto flex min-h-dvh max-w-md flex-col items-center gap-6 px-4 pt-8">
      <header className="text-center">
        <h1 className="text-misprint font-display text-5xl tracking-wide">ESCANEÁ UN CROMO</h1>
        <p className="mt-1 text-sm text-white/70">Apuntá la cámara al código QR del taller.</p>
      </header>

      <div className="w-full max-w-sm rounded-[1.25rem] border-4 border-dashed border-brand-cyan/60 p-1">
        <QrReader onDecode={handleDecode} />
      </div>

      <Link
        to="/"
        replace
        className="mt-auto w-full rounded-2xl border-2 border-white/20 py-3 text-center font-display text-2xl tracking-wider transition-colors hover:border-brand-magenta active:scale-[0.98]"
      >
        Cancelar / Volver al Álbum
      </Link>
    </main>
  )
}
