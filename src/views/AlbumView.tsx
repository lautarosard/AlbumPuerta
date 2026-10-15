import { useCallback, useEffect, useState } from 'react'
import { AlbumGrid } from '../components/album/AlbumGrid'
import { AlbumHeader } from '../components/album/AlbumHeader'
import { CromoModal } from '../components/album/CromoModal'
import { RewardModal } from '../components/album/RewardModal'
import { PwaBanner } from '../components/ui/PwaBanner'
import { ScanFab } from '../components/ui/ScanFab'
import { Toast } from '../components/ui/Toast'
import type { ToastVariant } from '../components/ui/Toast'
import { useAlbum } from '../hooks/useAlbum'
import { navigate, useLocation } from '../router'
import type { Stand, UnlockResult } from '../types'
import { isAlbumLocationState } from '../utils/token'

interface ToastState {
  message: string
  variant: ToastVariant
  nonce: number
}

const LOCKED_HINT = 'Encontrá este taller en la muestra y escaneá su QR'

function toastFromResult(result: UnlockResult): ToastState {
  const variant: ToastVariant = !result.success
    ? 'error'
    : result.isAlreadyUnlocked
      ? 'info'
      : 'success'
  return { message: result.message, variant, nonce: Date.now() }
}

export default function AlbumView() {
  const { stands, unlockedIds, progress, isCompleted, userId, resetAlbum } = useAlbum()
  const location = useLocation()

  // The scan result handed over by /scan or /scanner, read once on arrival.
  const [scanResult] = useState<UnlockResult | null>(() =>
    isAlbumLocationState(location.state) ? location.state.unlockResult : null,
  )
  const justUnlocked = scanResult?.success && !scanResult.isAlreadyUnlocked
  const scannedId = scanResult?.success ? scanResult.stand?.id : undefined

  const [toast, setToast] = useState<ToastState | null>(() =>
    scanResult ? toastFromResult(scanResult) : null,
  )
  const [selected, setSelected] = useState<Stand | null>(null)
  // Celebrate automatically only when this scan completed the album.
  const [rewardOpen, setRewardOpen] = useState(() => Boolean(justUnlocked && isCompleted))

  // Consume the scan result so a reload doesn't replay the toast/animation.
  useEffect(() => {
    if (isAlbumLocationState(window.history.state)) {
      navigate(window.location.pathname, { replace: true })
    }
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])
  const closeDetail = useCallback(() => setSelected(null), [])
  const closeReward = useCallback(() => setRewardOpen(false), [])
  const showLockedHint = useCallback(() => {
    setToast({ message: LOCKED_HINT, variant: 'info', nonce: Date.now() })
  }, [])

  const selectedNumber = selected ? stands.findIndex((s) => s.id === selected.id) + 1 : 0

  return (
    <>
      <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-4 pb-36 pt-4">
        <PwaBanner />

        <AlbumHeader
          progress={progress}
          unlockedCount={stands.filter((s) => unlockedIds.includes(s.id)).length}
          total={stands.length}
          isCompleted={isCompleted}
          onClaimReward={() => setRewardOpen(true)}
        />

        <AlbumGrid
          stands={stands}
          unlockedIds={unlockedIds}
          focusId={scannedId}
          newId={justUnlocked ? scannedId : undefined}
          onOpen={setSelected}
          onLockedTap={showLockedHint}
        />

        {import.meta.env.DEV && (
          <button
            type="button"
            onClick={resetAlbum}
            className="self-center text-xs text-white/40 underline"
          >
            Reiniciar álbum (solo desarrollo)
          </button>
        )}
      </main>

      <ScanFab />

      <CromoModal stand={selected} number={selectedNumber} onClose={closeDetail} />
      <RewardModal open={rewardOpen} onClose={closeReward} userId={userId} />

      <Toast
        message={toast?.message ?? null}
        variant={toast?.variant}
        nonce={toast?.nonce}
        onDismiss={dismissToast}
        aboveFab
      />
    </>
  )
}
