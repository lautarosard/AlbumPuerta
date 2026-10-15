export const USER_ID_KEY = 'p18_user_id'
export const UNLOCKED_STANDS_KEY = 'p18_unlocked_stands'

// localStorage can throw (private mode, blocked site data, quota), so every
// access goes through these wrappers and falls back to "nothing stored".
function readItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Progress just won't persist on this device.
  }
}

function removeItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}

// crypto.randomUUID only exists in secure contexts (HTTPS or localhost), so
// testing on a phone over plain http on the LAN needs a fallback.
function generateUuid(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'))
  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-')
}

export function getUserId(): string {
  const existing = readItem(USER_ID_KEY)
  if (existing) return existing

  const userId = generateUuid()
  writeItem(USER_ID_KEY, userId)
  return userId
}

/** Parses a stored value into a deduplicated list of IDs, ignoring corrupt data. */
export function parseUnlockedStands(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return [...new Set(parsed.filter((id): id is string => typeof id === 'string'))]
  } catch {
    return []
  }
}

export function getUnlockedStands(): string[] {
  return parseUnlockedStands(readItem(UNLOCKED_STANDS_KEY))
}

export function saveUnlockedStand(standId: string): void {
  const unlocked = getUnlockedStands()
  if (unlocked.includes(standId)) return
  writeItem(UNLOCKED_STANDS_KEY, JSON.stringify([...unlocked, standId]))
}

export function resetProgress(): void {
  removeItem(UNLOCKED_STANDS_KEY)
}
