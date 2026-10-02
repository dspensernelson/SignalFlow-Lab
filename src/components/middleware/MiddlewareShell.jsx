import TrackSwitch from '../TrackSwitch'
import { Logo, ThemeToggle } from '../ui'

// Placeholder shell for the middleware track. Replaced by the real shell in
// a later commit; exists so the track switch is wired end to end first.
export default function MiddlewareShell({ theme, onToggleTheme, track, onTrackChange }) {
  return (
    <div className="min-h-full text-left text-sf-text">
      <header className="sticky top-0 z-20 border-b border-sf-border bg-sf-surface">
        <div className="mx-auto flex w-full max-w-[1680px] items-center justify-between gap-4 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <Logo size={22} uppercase wordmark="SignalFlow Lab" />
            <TrackSwitch value={track} onChange={onTrackChange} />
          </div>
          <ThemeToggle value={theme} onChange={onToggleTheme} />
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-semibold text-sf-text">SignalFlow Lab: Middleware</h1>
        <p className="mt-1 text-sm text-sf-muted">Coming soon.</p>
      </div>
    </div>
  )
}
