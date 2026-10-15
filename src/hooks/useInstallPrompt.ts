import { useSyncExternalStore } from 'react'
import { getPwaState, subscribePwa } from '../services/pwa'
import type { PwaState } from '../services/pwa'

export function useInstallPrompt(): PwaState {
  return useSyncExternalStore(subscribePwa, getPwaState)
}
