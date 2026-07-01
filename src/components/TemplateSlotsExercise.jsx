import CopilotPromptCard from './CopilotPromptCard'
import { Button, CodeBlock } from './ui'
import { loadArtifacts } from '../lib/progress'

// Exercise workspace for interactionType "templateSlots" (assembly lessons).
// Left: the artifact shelf - the learner's stored upstream artifacts, each
// expandable, so slot values are LOOKED UP rather than re-derived. Right: the
// governed template with one inline input per {{slotId}} token. The answer is
// serialized as { slotId: value } and validated by the templateSlots validator.

// Splits the template into text/slot segments in document order.
function parseTemplate(template) {
  const segments = []
  const pattern = /\{\{(\w+)\}\}/g
  let lastIndex = 0
  let match
  while ((match = pattern.exec(template)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ kind: 'text', value: template.slice(lastIndex, match.index) })
    }
    segments.push({ kind: 'slot', id: match[1] })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < template.length) {
    segments.push({ kind: 'text', value: template.slice(lastIndex) })
  }
  return segments
}

export default function TemplateSlotsExercise({
  lesson,
  answer,
  onAnswerChange,
  onValidate,
  results,
  passed,
  onContinue,
}) {
  const slots = lesson.validation?.slots || []
  const template = lesson.validation?.template || ''
  const shelf = lesson.shelf || []
  const artifacts = loadArtifacts()

  let values = {}
  try {
    const parsed = JSON.parse(answer)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) values = parsed
  } catch {
    values = {}
  }

  const hasResults = Boolean(results && results.length > 0)
  const resultBySlot = {}
  if (hasResults) {
    results.forEach((r) => {
      const match = r.id.match(/^slot-(.+)$/)
      if (match) resultBySlot[match[1]] = r
    })
  }
  const slotById = Object.fromEntries(slots.map((s) => [s.id, s]))
  const failedSlots = slots.filter((s) => resultBySlot[s.id] && !resultBySlot[s.id].passed)
  const primary = failedSlots[0]
  const correctCount = slots.length - failedSlots.length

  function setValue(slotId, value) {
    onAnswerChange(JSON.stringify({ ...values, [slotId]: value }))
  }

  const segments = parseTemplate(template)

  return (
    <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-12">
      {/* Left: assembly rule + artifact shelf */}
      <div className="flex flex-col gap-3 lg:col-span-5">
        <div className="rounded-xl border border-sf-border bg-sf-surface p-3 shadow-sf-sm">
          <h3 className="text-sm font-semibold uppercase tracking-sf-wide text-sf-subtle">
            {lesson.inputLabel || 'Assembly Rule'}
          </h3>
          <pre className="mt-1 whitespace-pre-wrap rounded-md bg-sf-surface-subtle p-3 text-xs text-sf-body">
            {lesson.input}
          </pre>
        </div>

        <div className="rounded-xl border border-sf-border bg-sf-surface p-3 shadow-sf-sm">
          <h3 className="text-sm font-semibold uppercase tracking-sf-wide text-sf-subtle">
            Artifact shelf
          </h3>
          <p className="mt-1 text-xs text-sf-muted">
            Look values up here - the pipeline already did the work.
          </p>
          <div className="mt-2 flex max-h-72 flex-col gap-1.5 overflow-y-auto">
            {shelf.map((item) => {
              const artifact = artifacts[item.nodeId]
              if (artifact === undefined || artifact === null) {
                return (
                  <div
                    key={item.nodeId}
                    className="rounded-md border border-dashed border-sf-border-strong px-2.5 py-1.5 text-xs text-sf-muted"
                  >
                    <span className="font-mono">{item.artifactName}</span> - locked. Complete
                    &ldquo;{item.producedBy}&rdquo; first.
                  </div>
                )
              }
              return (
                <details
                  key={item.nodeId}
                  className="rounded-md border border-sf-border bg-sf-surface-subtle px-2.5 py-1.5"
                >
                  <summary className="cursor-pointer font-mono text-xs text-sf-body">
                    {item.artifactName}
                  </summary>
                  <CodeBlock wrap className="mt-1.5 text-xs">
                    {artifact}
                  </CodeBlock>
                </details>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right: the template with inline slot inputs */}
      <div className="flex flex-col gap-3 lg:col-span-7">
        <div className="rounded-xl border border-sf-border bg-sf-surface p-3 shadow-sf-sm">
          <h3 className="text-sm font-semibold uppercase tracking-sf-wide text-sf-subtle">
            {lesson.intro?.artifactName || 'Deliverable'}
          </h3>
          <div className="mt-2 whitespace-pre-wrap rounded-md bg-sf-surface-subtle p-3 font-mono text-sm leading-7 text-sf-body">
            {segments.map((segment, index) => {
              if (segment.kind === 'text') {
                return <span key={index}>{segment.value}</span>
              }
              const slot = slotById[segment.id]
              const result = resultBySlot[segment.id]
              const failed = Boolean(result && !result.passed)
              const ok = Boolean(result && result.passed)
              return (
                <input
                  key={index}
                  type="text"
                  value={values[segment.id] ?? ''}
                  onChange={(e) => setValue(segment.id, e.target.value)}
                  placeholder={slot ? slot.label : segment.id}
                  title={slot?.hint}
                  size={Math.max(slot ? slot.label.length : 8, 8)}
                  className={`mx-0.5 inline-block rounded border px-1.5 py-0.5 align-baseline font-mono text-sm ${
                    failed
                      ? 'border-sf-warning bg-sf-progress-weak text-sf-progress-text'
                      : ok
                        ? 'border-sf-complete bg-sf-success-weak text-sf-complete-text'
                        : 'border-sf-border-strong bg-sf-surface text-sf-text'
                  } focus:border-sf-accent focus:outline-none focus:ring-1 focus:ring-sf-ring`}
                />
              )
            })}
          </div>
          <div className="mt-3">
            <Button variant="primary" size="md" onClick={onValidate}>
              {lesson.validateLabel || 'Validate'}
            </Button>
          </div>
        </div>

        {hasResults &&
          (passed ? (
            <div className="rounded-xl border border-sf-complete bg-sf-success-weak p-3 shadow-sf-sm">
              <h3 className="text-xs font-semibold uppercase tracking-sf-wide text-sf-complete-text">
                Workflow readiness
              </h3>
              <ul className="mt-2 flex flex-col gap-1 text-sm text-sf-complete-text">
                <li className="flex items-center gap-2">
                  <span aria-hidden="true">{'✓'}</span>
                  {slots.length} of {slots.length} slots traced to stored artifacts
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden="true">{'✓'}</span>
                  {lesson.intro?.artifactName || 'The deliverable'} is rendered and ready to ship.
                </li>
              </ul>
              <Button
                variant="success"
                size="md"
                iconRight="arrow-right"
                className="mt-3"
                onClick={onContinue}
              >
                Continue to Takeaway
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-sf-warning bg-sf-progress-weak p-3 shadow-sf-sm">
              <h3 className="text-xs font-semibold uppercase tracking-sf-wide text-sf-progress-text">
                Workflow readiness
              </h3>
              {primary ? (
                <div className="mt-2 rounded-md border border-sf-warning bg-sf-surface p-3">
                  <p className="text-sm font-semibold text-sf-progress-text">
                    Fix this next: {primary.label}
                  </p>
                  <p className="mt-1 text-sm text-sf-body">{resultBySlot[primary.id].message}</p>
                </div>
              ) : null}
              {failedSlots.length > 1 && (
                <p className="mt-2 text-xs text-sf-progress-text">
                  {failedSlots.length - 1} more{' '}
                  {failedSlots.length - 1 === 1 ? 'slot is' : 'slots are'} highlighted in the
                  template.
                </p>
              )}
              {correctCount > 0 && (
                <p className="mt-2 text-xs text-sf-progress-text">
                  {'✓'} {correctCount} of {slots.length} slots look good
                </p>
              )}
            </div>
          ))}

        <details className="rounded-xl border border-sf-border bg-sf-surface p-3 shadow-sf-sm">
          <summary className="cursor-pointer text-sm text-sf-body">
            Need help? Show Copilot prompt
          </summary>
          <div className="mt-3">
            <CopilotPromptCard prompt={lesson.copilotPrompt} />
          </div>
        </details>
      </div>
    </div>
  )
}
