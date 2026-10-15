import type { AlbumLocationState, UnlockResult } from '../types'

// Tokens are short alphanumeric codes; anything else is rejected before it
// reaches the lookup, which also caps length on hostile URLs.
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{1,64}$/

export function sanitizeToken(raw: string | null | undefined): string | null {
  const token = raw?.trim()
  return token && TOKEN_PATTERN.test(token) ? token : null
}

/** Reads the raw `t` (or `token`) query param, or null if neither is present. */
export function getRawTokenParam(search: string | URLSearchParams): string | null {
  const params = new URLSearchParams(search)
  return params.get('t') || params.get('token')
}

/**
 * Extracts a token from scanned QR text, which may be a full URL
 * (https://puerta18.org/scan?t=a8f9C2) or the bare token (a8f9C2).
 */
export function extractToken(scannedText: string): string | null {
  const text = scannedText.trim()
  const rawToken = sanitizeToken(text)
  if (rawToken) return rawToken

  try {
    return sanitizeToken(getRawTokenParam(new URL(text).searchParams))
  } catch {
    return null
  }
}

export const INVALID_TOKEN_RESULT: UnlockResult = {
  success: false,
  stand: null,
  isAlreadyUnlocked: false,
  message: 'Código inválido o taller no encontrado',
}

export const MISSING_TOKEN_RESULT: UnlockResult = {
  success: false,
  stand: null,
  isAlreadyUnlocked: false,
  message: 'No encontramos ningún código en el enlace escaneado',
}

export function isAlbumLocationState(value: unknown): value is AlbumLocationState {
  if (typeof value !== 'object' || value === null || !('unlockResult' in value)) return false
  const result = value.unlockResult
  return (
    typeof result === 'object' &&
    result !== null &&
    'message' in result &&
    typeof result.message === 'string'
  )
}
