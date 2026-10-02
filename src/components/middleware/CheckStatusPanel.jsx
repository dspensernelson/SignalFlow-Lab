import { useState } from 'react'
import { Badge, Button, Icon, ScrollArea, SectionLabel } from '../ui'

function CopyCommand({ command }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }
  return (
    <div className="flex items-center gap-1 rounded-md border border-sf-border-subtle bg-sf-surface-subtle pl-2">
      <code className="min-w-0 flex-1 truncate py-1.5 font-mono text-[11px] text-sf-body" title={command}>
        {command}
      </code>
      <Button variant="link" size="sm" icon={copied ? 'check' : 'copy'} onClick={copy} className="!px-2" title="Copy command">
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  )
}

function StatusLine({ status, result }) {
  if (status === 'passed') {
    return (
      <div className="flex items-center gap-2 text-sm text-sf-complete-text">
        <Icon name="circle-check" size={16} />
        <span className="font-medium">Check passed{result?.timestamp ? ` - ${new Date(result.timestamp).toLocaleString()}` : ''}</span>
      </div>
    )
  }
  if (status === 'skipped') {
    return (
      <div className="flex items-center gap-2 text-sm text-sf-needs-inputs-text">
        <Icon name="arrow-right" size={16} />
        <span className="font-medium">Skipped. A passing check later will mark it passed.</span>
      </div>
    )
  }
  if (result && !result.passed) {
    return (
      <div className="flex items-center gap-2 text-sm text-sf-progress-text">
        <Icon name="triangle-alert" size={16} />
        <span className="font-medium">
          {result.failing.length} failing test{result.failing.length === 1 ? '' : 's'}
          {result.timestamp ? ` - ${new Date(result.timestamp).toLocaleString()}` : ''}
        </span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2 text-sm text-sf-muted">
      <Icon name="circle" size={16} />
      <span>No result yet. Run the check, then refresh.</span>
    </div>
  )
}

// The Check beat. Bounded: one status line, one command, one bounded list of
// failing tests, one row of actions. Never a growing stack of callouts.
export default function CheckStatusPanel({ lesson, status, result, checks, onRefresh, onSkip, onMarkDone }) {
  const kind = lesson.check.kind
  const live = checks.mode === 'live'
  const unavailable = checks.mode === 'unavailable'
  const canSkip = status === 'ready' || status === 'failed'
  const done = status === 'passed' || status === 'skipped'

  return (
    <section className="flex min-h-0 flex-col rounded-xl border border-sf-border bg-sf-surface shadow-sf-sm">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-sf-border-subtle px-3 py-2">
        <SectionLabel>Check</SectionLabel>
        <div className="flex items-center gap-1.5">
          {kind === 'pytest' && (
            <Badge tone={live ? 'trusted' : unavailable ? 'locked' : 'neutral'} icon={live ? 'activity' : 'circle-help'}>
              {live ? 'Reading results' : unavailable ? 'Run locally' : 'Connecting'}
            </Badge>
          )}
          {kind === 'explain' && <Badge tone="info">Explain-it</Badge>}
          {kind === 'none' && <Badge tone="neutral">Manual</Badge>}
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
        <p className="shrink-0 text-xs leading-snug text-sf-muted">{lesson.check.summary}</p>
        {kind === 'pytest' && (
          <>
            <CopyCommand command={lesson.check.command} />
            <StatusLine status={status} result={result} />
            {unavailable && !done && (
              <p className="shrink-0 rounded-md border border-sf-border-subtle bg-sf-surface-subtle p-2 text-xs leading-snug text-sf-body">
                This site cannot see your check results. Clone the repo, run <code className="font-mono">npm run dev</code>,
                run the command above from the repo root, then refresh here. Or skip for now.
              </p>
            )}
            {result && !result.passed && result.failing.length > 0 && (
              <ScrollArea className="min-h-0 flex-1" viewportClassName="rounded-md border border-sf-border-subtle bg-sf-surface-subtle p-2" fadeClass="from-sf-surface-subtle" hint="More failures">
                <ul className="flex flex-col gap-1 font-mono text-[11px] leading-snug text-sf-body">
                  {result.failing.map((f) => (
                    <li key={f} className="truncate" title={f}>{f.replace(/^checks\//, '')}</li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </>
        )}
        {kind === 'explain' && (
          <StatusLine status={status} result={null} />
        )}
        {kind === 'none' && <StatusLine status={status} result={null} />}
        <div className="mt-auto flex shrink-0 flex-wrap items-center gap-2 pt-1">
          {kind === 'pytest' && (
            <Button variant="primary" size="sm" icon="rotate-cw" onClick={onRefresh}>
              Refresh checks
            </Button>
          )}
          {kind === 'explain' && (
            <span className="text-xs text-sf-muted">Answer the explain-it questions on the next step to pass.</span>
          )}
          {kind === 'none' && !done && (
            <Button variant="primary" size="sm" icon="check" onClick={onMarkDone}>
              Mark done
            </Button>
          )}
          {canSkip && (
            <Button variant="ghost" size="sm" iconRight="arrow-right" onClick={onSkip} title="Record a skip and unlock the next lesson">
              Skip for now
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
