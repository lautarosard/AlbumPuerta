import { useCallback, useEffect, useMemo, useState } from 'react'
import standsData from '../data/stands.json'
import type { Stand, UnlockResult } from '../types'
import {
  UNLOCKED_CHANGED_EVENT,
  UNLOCKED_STANDS_KEY,
  getUnlockedStands,
  getUserId,
  resetProgress,
  saveUnlockedStand,
} from '../utils/storage'
import { INVALID_TOKEN_RESULT } from '../utils/token'

const stands: Stand[] = standsData

export function useAlbum() {
  const [userId] = useState(getUserId)
  const [unlockedIds, setUnlockedIds] = useState(getUnlockedStands)

  // Keep every useAlbum instance in sync: other tabs (a QR scan often opens a
  // new one) via 'storage', and other views in this tab via our own event.
  useEffect(() => {
    function reload() {
      setUnlockedIds(getUnlockedStands())
    }
    function handleStorage(event: StorageEvent) {
      if (event.key === UNLOCKED_STANDS_KEY || event.key === null) reload()
    }
    window.addEventListener('storage', handleStorage)
    window.addEventListener(UNLOCKED_CHANGED_EVENT, reload)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(UNLOCKED_CHANGED_EVENT, reload)
    }
  }, [])

  // Count only IDs that still exist in the dictionary, so stale entries left
  // in storage can't push progress past 100%.
  const progress = useMemo(() => {
    if (stands.length === 0) return 0
    const unlockedCount = stands.filter((stand) => unlockedIds.includes(stand.id)).length
    return Math.round((unlockedCount / stands.length) * 100)
  }, [unlockedIds])

  const unlockByToken = useCallback((hashToken: string): UnlockResult => {
    const stand = stands.find((s) => s.hashToken === hashToken.trim())

    if (!stand) return INVALID_TOKEN_RESULT

    // Check storage rather than this instance's state, which may lag behind a
    // write made elsewhere in the same render cycle.
    if (getUnlockedStands().includes(stand.id)) {
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
  }, [])

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
