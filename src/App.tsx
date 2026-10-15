import { useState } from 'react'
import { useAlbum } from './hooks/useAlbum'

// Temporary harness to verify useAlbum end-to-end; replaced in a later stage.
function App() {
  const { stands, unlockedIds, progress, isCompleted, userId, unlockByToken, resetAlbum } =
    useAlbum()
  const [lastMessage, setLastMessage] = useState('')

  return (
    <main className="space-y-3 p-6">
      <h1 className="font-display text-4xl text-brand-magenta">Puerta 18 · Debug</h1>
      <p>User ID: {userId}</p>
      <p>Progress: {progress}%</p>
      <p>
        Unlocked: {unlockedIds.length} / {stands.length}
      </p>
      <p>Completed: {isCompleted ? 'yes' : 'no'}</p>
      <div className="space-x-2">
        <button
          type="button"
          className="rounded bg-brand-surface px-3 py-1"
          onClick={() => setLastMessage(unlockByToken('a8f9C2').message)}
        >
          Unlock a8f9C2
        </button>
        <button
          type="button"
          className="rounded bg-brand-surface px-3 py-1"
          onClick={() => setLastMessage(unlockByToken('invalid').message)}
        >
          Unlock invalid token
        </button>
        <button
          type="button"
          className="rounded bg-brand-surface px-3 py-1"
          onClick={() => {
            resetAlbum()
            setLastMessage('Album reset')
          }}
        >
          Reset
        </button>
      </div>
      {lastMessage && <p className="text-brand-cyan">{lastMessage}</p>}
    </main>
  )
}

export default App
