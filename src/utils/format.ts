import type { CSSProperties } from 'react'
import type { Stand } from '../types'

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

/** Returns the color if it is a valid #rgb/#rrggbb hex, otherwise null. */
export function validHexColor(color: string | undefined): string | null {
  return color && HEX_COLOR.test(color) ? color : null
}

/**
 * Whether dark text reads better than white on top of `hex` (WCAG relative
 * luminance). Stand colors come from data, so text on them can't be fixed.
 */
export function prefersDarkText(hex: string): boolean {
  const valid = validHexColor(hex)
  if (!valid) return false
  const digits =
    valid.length === 4
      ? valid
          .slice(1)
          .split('')
          .map((d) => d + d)
          .join('')
      : valid.slice(1)
  const [r, g, b] = [0, 2, 4].map((i) => {
    const channel = parseInt(digits.slice(i, i + 2), 16) / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  // Contrast vs black beats contrast vs white above ~0.179 luminance.
  return luminance > 0.179
}

const listFormat = new Intl.ListFormat('es', { style: 'long', type: 'conjunction' })

/** "Ana, Beto y Caro" */
export function formatNames(names: string[]): string {
  return listFormat.format(names)
}

/** "N° 07" */
export function stickerNumber(n: number): string {
  return `N° ${String(n).padStart(2, '0')}`
}

/** Sets --accent from the stand's color; invalid data keeps the theme default. */
export function accentStyle(stand: Stand): CSSProperties | undefined {
  const color = validHexColor(stand.themeColor)
  return color ? ({ '--accent': color } as CSSProperties) : undefined
}
