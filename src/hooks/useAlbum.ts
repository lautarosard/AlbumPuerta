import { useCallback, useEffect, useMemo, useState } from 'react'
import standsData from '../data/stands.json'
import type { Stand, UnlockResult } from '../types'
import {
  UNLOCKED_STANDS_KEY,
  getUnlockedStands,
  getUserId,
  parseUnlockedStands,
  resetProgress,
  saveUnlockedStand,
} from '../utils/storage'

const stands: Stand[] = standsData

export function useAlbum() {
  const [userId] = useState(getUserId)
  const [unlockedIds, setUnlockedIds] = useState(getUnlockedStands)

  // A QR scan often opens a new tab; keep any already-open album tab in sync.
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === UNLOCKED_STANDS_KEY || event.key === null) {
        setUnlockedIds(parseUnlockedStands(event.newValue))
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Count only IDs that still exist in the dictionary, so stale entries left
  // in storage can't push progress past 100%.
  const progress = useMemo(() => {
    if (stands.length === 0) return 0
    const unlockedCount = stands.filter((stand) => unlockedIds.includes(stand.id)).length
    return Math.round((unlockedCount / stands.length) * 100)
  }, [unlockedIds])

  const unlockByToken = useCallback(
    (hashToken: string): UnlockResult => {
      const stand = stands.find((s) => s.hashToken === hashToken.trim())

      if (!stand) {
        return {
          success: false,
          stand: null,
          isAlreadyUnlocked: false,
          message: 'Código inválido o taller no encontrado',
        }
      }

      if (unlockedIds.includes(stand.id)) {
        return {
          success: true,
          stand,
          isAlreadyUnlocked: true,
          message: '¡Ya tenías este cromo en tu álbum!',
        }
      }

      saveUnlockedStand(stand.id)
      setUnlockedIds((prev) => (prev.includes(stand.id) ? prev : [...prev, stand.id]))
      return {
        success: true,
        stand,
        isAlreadyUnlocked: false,
        message: '¡Nuevo cromo desbloqueado!',
      }
    },
    [unlockedIds],
  )

  const resetAlbum = useCallback(() => {
    resetProgress()
    setUnlockedIds([])
  }, [])

  return {
    stands,
    unlockedIds,
    progress,
    isCompleted: progress === 100,
    userId,
    unlockByToken,
    resetAlbum,
  }
}
