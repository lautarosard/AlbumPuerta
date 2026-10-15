/** A project exhibited at Puerta 18, unlocked by scanning its QR code. */
export interface Stand {
  id: string
  /** Unique code embedded in the stand's QR URL. */
  hashToken: string
  name: string
  zone: string
  creators: string[]
  technologies: string[]
  /** A fun fact or technical challenge the team solved. */
  plotTwist: string
  imageUrl: string
  /** Hex color used to accent this stand's card. */
  themeColor: string
}

/** Outcome of trying to unlock a stand from a scanned token. */
export interface UnlockResult {
  success: boolean
  stand: Stand | null
  isAlreadyUnlocked: boolean
  message: string
}
