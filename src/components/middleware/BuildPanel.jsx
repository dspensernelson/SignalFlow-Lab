import { Chip, ScrollArea, SectionLabel } from '../ui'
import { ResourceList } from './ModuleLanding'

// The Build beat: what to make, where, what to ask Claude Code for, and what
// to write yourself. Bounded: the whole panel scrolls internally.
export default function BuildPanel({ build }) {
  return (
    <section className="flex min-h-0 flex-col rounded-xl border border-sf-border bg-sf-surface shadow-sf-sm">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-sf-border-subtle px-3 py-2">
        <SectionLabel>Build</SectionLabel>
        <div className="flex flex-wrap justify-end gap-1">
          {build.files.map((f) => (
            <Chip key={f} mono title={f}>{f.replace(/^middleware\//, '')}</Chip>
          ))}
        </div>
      </header>
      <ScrollArea className="min-h-0 flex-1" viewportClassName="p-3" fadeClass="from-sf-surface">
        <div className="flex flex-col gap-3 text-sm text-sf-body">
          <ol className="flex list-decimal flex-col gap-1 pl-5 leading-snug">
            {build.spec.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-sf-border-subtle bg-sf-surface-subtle p-2.5">
              <SectionLabel size="xs" className="mb-1">Ask Claude Code for</SectionLabel>
              <ul className="flex list-disc flex-col gap-1 pl-4 text-xs leading-snug">
                {build.askClaudeFor.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border border-sf-accent-border bg-sf-accent-weak p-2.5">
              <SectionLabel size="xs" className="mb-1 text-sf-accent-text">Write yourself</SectionLabel>
              <ul className="flex list-disc flex-col gap-1 pl-4 text-xs leading-snug text-sf-text">
                {build.writeYourself.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
          {build.resources?.length > 0 && (
            <div>
              <SectionLabel size="xs" className="mb-1">Go deeper</SectionLabel>
              <ResourceList resources={build.resources} compact />
            </div>
          )}
        </div>
      </ScrollArea>
    </section>
  )
}
