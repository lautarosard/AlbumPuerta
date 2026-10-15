import { Link } from '../../router'
import { CameraIcon } from './icons'

/** Fixed bottom "scan" action, kept within the mobile column on wide screens. */
export function ScanFab() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-transparent pt-10">
      <div className="pb-safe mx-auto max-w-md px-4">
        <Link
          to="/scanner"
          className="shadow-sticker pointer-events-auto flex -rotate-1 items-center justify-center gap-3 rounded-2xl border-2 border-brand-dark bg-brand-magenta py-3 font-display text-3xl tracking-wider text-white transition-transform duration-150 hover:rotate-0 active:translate-x-1 active:translate-y-1 active:shadow-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
        >
          <CameraIcon className="h-7 w-7" strokeWidth={2.5} />
          ESCANEAR QR
        </Link>
      </div>
    </div>
  )
}
