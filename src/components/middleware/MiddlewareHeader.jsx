import TrackSwitch from '../TrackSwitch'
import { Button, Icon, Logo, ThemeToggle } from '../ui'

// Sticky app bar for the middleware track. Mirrors the canvas header so the
// two tracks read as one product: Logo, Track switch, breadcrumbs, theme,
// and a track-scoped reset.
export default function MiddlewareHeader({ track, onTrackChange, theme, onToggleTheme, onReset, crumbs = [], canReset }) {
  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-sf-border bg-sf-surface">
      <div className="mx-auto flex w-full max-w-[1680px] items-center justify-between gap-4 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <Logo size={22} uppercase wordmark="SignalFlow Lab" />
          {onTrackChange && <TrackSwitch value={track} onChange={onTrackChange} />}
          <span className="hidden h-6 w-px bg-sf-border sm:inline-block" />
          <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1 text-xs sm:flex">
            {crumbs.map((c, i) => (
              <span key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-1">
                {i > 0 && <Icon name="chevron-right" size={12} className="shrink-0 text-sf-subtle" />}
                {c.onClick ? (
                  <button
                    type="button"
                    onClick={c.onClick}
                    className="truncate font-medium text-sf-accent hover:underline"
                  >
                    {c.label}
                  </button>
                ) : (
                  <span className={`truncate ${i === crumbs.length - 1 ? 'font-medium text-sf-text' : 'text-sf-muted'}`}>
                    {c.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <ThemeToggle value={theme} onChange={onToggleTheme} />
          <Button variant="neutral" size="sm" icon="rotate-cw" onClick={onReset} disabled={!canReset}>
            Reset track
          </Button>
        </div>
      </div>
    </header>
  )
}
