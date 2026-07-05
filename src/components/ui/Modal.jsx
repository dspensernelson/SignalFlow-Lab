import { useEffect, useRef } from 'react'
import { Icon } from './Icon'

// Lightweight centered dialog overlay for one-time "human moments" (welcome,
// tier completion). Renders a scrim + card, closes on Escape or scrim click,
// and moves focus to the card on open. The card is height-bounded and scrolls
// internally, so the overlay never grows the page (no new page scroll).
export function Modal({ open, onClose, labelledBy, describedBy, maxWidth = 'max-w-md', children }) {
  const cardRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    cardRef.current?.focus()
    function onKey(e) {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={`relative w-full ${maxWidth} max-h-[85vh] overflow-y-auto rounded-xl border border-sf-border bg-sf-surface p-6 shadow-sf-lg outline-none`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-md p-1 text-sf-muted transition-colors hover:bg-sf-surface-subtle hover:text-sf-body"
        >
          <Icon name="x" size={18} />
        </button>
        {children}
      </div>
    </div>
  )
}
