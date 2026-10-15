import { Suspense, lazy } from 'react'
import { Redirect, useLocation } from './router'
import AlbumView from './views/AlbumView'
import ScanRedirect from './views/ScanRedirect'

// The scanner pulls in html5-qrcode, so it is split into its own chunk and
// only downloaded when a visitor opens the in-app camera.
const ScannerView = lazy(() => import('./views/ScannerView'))

function App() {
  const { pathname } = useLocation()

  switch (pathname) {
    case '/':
      return <AlbumView />
    case '/scan':
      return <ScanRedirect />
    case '/scanner':
      return (
        <Suspense fallback={<p className="p-8 text-center text-white/70">Cargando escáner…</p>}>
          <ScannerView />
        </Suspense>
      )
    default:
      return <Redirect to="/" />
  }
}

export default App
