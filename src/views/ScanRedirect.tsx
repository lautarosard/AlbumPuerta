import { useEffect, useRef } from 'react'
import { useAlbum } from '../hooks/useAlbum'
import { navigate, useLocation } from '../router'
import type { AlbumLocationState } from '../types'
import {
  INVALID_TOKEN_RESULT,
  MISSING_TOKEN_RESULT,
  getRawTokenParam,
  sanitizeToken,
} from '../utils/token'

/** Landing route for native-camera QR scans: /scan?t=<token>. */
export default function ScanRedirect() {
  const { search } = useLocation()
  const { unlockByToken } = useAlbum()
  // StrictMode runs effects twice in development; without this guard the
  // second run would report the stand as "already unlocked".
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const rawToken = getRawTokenParam(search)
    const token = sanitizeToken(rawToken)
    let unlockResult = MISSING_TOKEN_RESULT
    if (token) unlockResult = unlockByToken(token)
    else if (rawToken) unlockResult = INVALID_TOKEN_RESULT

    // Replace so the back button never re-processes the scan URL.
    const state: AlbumLocationState = { unlockResult }
    navigate('/', { replace: true, state })
  }, [search, unlockByToken])

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-white/70">Abriendo tu álbum…</p>
    </main>
  )
}
