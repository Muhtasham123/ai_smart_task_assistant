import { useEffect } from 'react'
import StatusCard from './StatusCard'

// Shows a StatusCard on top of the page with a dimmed backdrop.
// Used for the confirm dialogs in Sprint 1 (log out, delete account, ...).

function Dialog({ open, onClose, title, description, children }) {
  useEffect(() => {
    if (!open) return

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto
        bg-ink/40 p-4"
      onClick={onClose}
    >
      <div onClick={(event) => event.stopPropagation()}>
        <StatusCard title={title} description={description}>
          {children}
        </StatusCard>
      </div>
    </div>
  )
}

export default Dialog
