import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Icon } from './Icon'

// Shared scroll affordance for internally-scrolling exercise panels.
// When the content overflows its viewport, a bottom fade plus a persistent
// "scroll for more" hint appear; both disappear once the learner reaches the
// end. This exists so a bounded panel never silently amputates evidence
// (a complete-looking panel that actually hides material).
//
// Renders the viewport as `as` (default 'div'); pass 'pre' to preserve
// pre-wrapped source narratives. The fade color is set by `fadeClass` so it
// masks against whatever background the viewport uses.
export function ScrollArea({
  as: Tag = 'div',
  children,
  className = '',
  viewportClassName = '',
  fadeClass = 'from-sf-surface-subtle',
  hint = 'Scroll for more',
}) {
  const ref = useRef(null)
  const [{ scrollable, atEnd }, setState] = useState({ scrollable: false, atEnd: true })

  const measure = useCallback(() => {
    const el = ref.current
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    const nextScrollable = max > 2
    const nextAtEnd = max - el.scrollTop <= 2
    setState((s) =>
      s.scrollable === nextScrollable && s.atEnd === nextAtEnd
        ? s
        : { scrollable: nextScrollable, atEnd: nextAtEnd },
    )
  }, [])

  useLayoutEffect(() => {
    measure()
    // Re-measure after paint: the viewport's bounded height often resolves one
    // frame after mount (flex layout), so a synchronous measure can miss it.
    const raf = requestAnimationFrame(measure)
    return () => cancelAnimationFrame(raf)
  }, [measure, children])

  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure])

  const show = scrollable && !atEnd

  return (
    <div className={`relative flex min-h-0 flex-col ${className}`}>
      <Tag
        ref={ref}
        onScroll={measure}
        className={`min-h-0 flex-1 overflow-y-auto ${viewportClassName}`}
      >
        {children}
      </Tag>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-8 rounded-b-md bg-gradient-to-t to-transparent transition-opacity duration-150 ${fadeClass} ${
          show ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-1 flex justify-center transition-opacity duration-150 ${
          show ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="inline-flex items-center gap-1 rounded-full border border-sf-border bg-sf-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-sf-wide text-sf-subtle shadow-sf-sm">
          <Icon name="chevron-down" size={11} />
          {hint}
        </span>
      </div>
    </div>
  )
}
