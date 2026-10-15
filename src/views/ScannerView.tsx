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
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center gap-6 px-4 py-8">
      <header className="text-center">
        <h1 className="font-display text-4xl text-brand-cyan">Escanea un cromo</h1>
        <p className="text-sm text-white/70">Apunta la cámara al código QR del taller.</p>
      </header>

      <QrReader onDecode={handleDecode} />

      <Link
        to="/"
        replace
        className="rounded-full border border-white/20 px-6 py-2 text-sm font-semibold hover:border-brand-magenta"
      >
        Cancelar / Volver al Álbum
      </Link>
    </main>
  )
}
