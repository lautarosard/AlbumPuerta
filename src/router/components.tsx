import { useEffect } from 'react'
import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { navigate } from './history'

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string
  replace?: boolean
}

export function Link({ to, replace, onClick, ...rest }: LinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)
    // Let the browser handle new-tab/window clicks and non-primary buttons.
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      rest.target
    ) {
      return
    }
    event.preventDefault()
    navigate(to, { replace })
  }

  return <a href={to} onClick={handleClick} {...rest} />
}

export function Redirect({ to }: { to: string }) {
  useEffect(() => {
    navigate(to, { replace: true })
  }, [to])
  return null
}
