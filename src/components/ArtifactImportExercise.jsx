import { useEffect, useRef, useState } from 'react'
import CopilotPromptCard from './CopilotPromptCard'
import { Button } from './ui'

// Exercise workspace for interactionType "artifactImport" (the Module 1
// solo-rebuild capstone). The learner rebuilds the pipeline OUTSIDE the app in
// any tool, then proves it by importing the files their rebuild produced. Each
// import row accepts a file (read as text) or a pasted fallback; the four raw
// texts are serialized as { key: rawText } and graded by the existing easy-tier
// validators through the artifactImport validator.
export default function ArtifactImportExercise({
  lesson,
  answer,
  onAnswerChange,
  onValidate,
  results,
  passed,
  onContinue,
}) {
  const imports = lesson.validation?.imports || []
  const [openPaste, setOpenPaste] = useState(null)
  const [fileNames, setFileNames] = useState({})

  let values = {}
  try {
    const parsed = JSON.parse(answer)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) values = parsed
  } catch {
    values = {}
  }
  // Ref keeps concurrent async file reads from clobbering each other. It is
  // synced from the external answer via an effect (never during render) and
  // advanced eagerly inside setValue so back-to-back reads compose correctly.
  const valuesRef = useRef(values)
  useEffect(() => {
    valuesRef.current = values
  }, [answer]) // eslint-disable-line react-hooks/exhaustive-deps

  function setValue(key, text) {
    const next = { ...valuesRef.current, [key]: text }
    valuesRef.current = next
    onAnswerChange(JSON.stringify(next))
  }

  function handleFile(key, file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setValue(key, String(reader.result || ''))
      setFileNames((prev) => ({ ...prev, [key]: file.name }))
    }
    reader.readAsText(file)
  }

  // Closing any open paste box before grading keeps the results state (the
  // tallest state) free of an open textarea, so the Exercise never page-scrolls.
  function handleValidate() {
    setOpenPaste(null)
    onValidate()
  }

  const hasResults = Boolean(results && results.length > 0)

  // Group result rows by import key so each row shows its own status.
  function rowsFor(key) {
    return hasResults
      ? results.filter((r) => r.id === `import-${key}` || r.id.startsWith(`${key}:`))
      : []
  }

  const firstFailed = hasResults ? results.find((r) => !r.passed) : null
  const totalChecks = results ? results.length : 0
  const correctChecks = results ? results.filter((r) => r.passed).length : 0
  const failedCount = totalChecks - correctChecks

  return (
    <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-12">
      {/* Left: the rebuild runbook */}
      <div className="flex flex-col gap-3 lg:col-span-5">
        <div className="rounded-xl border border-sf-border bg-sf-surface p-3 shadow-sf-sm">
          <h3 className="text-sm font-semibold uppercase tracking-sf-wide text-sf-subtle">
            {lesson.inputLabel || 'Rebuild runbook'}
          </h3>
          <pre className="mt-1 max-h-[460px] overflow-y-auto whitespace-pre-wrap rounded-md bg-sf-surface-subtle p-3 text-xs leading-5 text-sf-body">
            {lesson.input}
          </pre>
        </div>

        <details className="rounded-xl border border-sf-border bg-sf-surface p-3 shadow-sf-sm">
          <summary className="cursor-pointer text-sm text-sf-body">
            Need help? Show Copilot prompt
          </summary>
          <div className="mt-3">
            <CopilotPromptCard prompt={lesson.copilotPrompt} />
          </div>
        </details>
      </div>

      {/* Right: the four imports + readiness */}
      <div className="flex flex-col gap-3 lg:col-span-7">
        <div className="rounded-xl border border-sf-border bg-sf-surface p-3 shadow-sf-sm">
          <h3 className="text-sm font-semibold uppercase tracking-sf-wide text-sf-subtle">
            Import your rebuilt files
          </h3>
          <p className="mt-1 text-xs text-sf-muted">
            Upload the file your rebuild produced, or paste its contents. Any tool is allowed - the
            acceptance bar is the same as the app.
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            {imports.map((imp) => {
              const rows = rowsFor(imp.key)
              const failed = rows.filter((r) => !r.passed)
              const loaded = typeof values[imp.key] === 'string' && values[imp.key].trim().length > 0
              let chip
              if (hasResults && rows.length > 0) {
                chip =
                  failed.length === 0
                    ? { text: 'Validated', tone: 'ok' }
                    : { text: `${failed.length} to fix`, tone: 'bad' }
              } else if (loaded) {
                chip = { text: 'Loaded', tone: 'ready' }
              } else {
                chip = { text: 'No file', tone: 'muted' }
              }
              const chipClass =
                chip.tone === 'ok'
                  ? 'border-sf-complete bg-sf-success-weak text-sf-complete-text'
                  : chip.tone === 'bad'
                    ? 'border-sf-danger bg-sf-danger-weak text-sf-danger'
                    : chip.tone === 'ready'
                      ? 'border-sf-accent bg-sf-accent-weak text-sf-accent-text'
                      : 'border-sf-border bg-sf-surface-subtle text-sf-muted'
              return (
                <li
                  key={imp.key}
                  className="rounded-md border border-sf-border bg-sf-surface-subtle p-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-sf-body">{imp.label}</span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${chipClass}`}
                    >
                      {chip.text}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <label className="inline-flex cursor-pointer items-center rounded-md border border-sf-border-strong bg-sf-surface px-2 py-1 text-xs text-sf-body hover:border-sf-accent">
                      Choose file
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFile(imp.key, e.target.files?.[0])}
                      />
                    </label>
                    {fileNames[imp.key] && (
                      <span className="truncate font-mono text-[11px] text-sf-muted">
                        {fileNames[imp.key]}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setOpenPaste(openPaste === imp.key ? null : imp.key)}
                      className="text-xs text-sf-accent-text underline-offset-2 hover:underline"
                    >
                      {openPaste === imp.key ? 'Hide paste' : 'Paste instead'}
                    </button>
                  </div>
                  {openPaste === imp.key && (
                    <textarea
                      value={values[imp.key] ?? ''}
                      onChange={(e) => setValue(imp.key, e.target.value)}
                      spellCheck={false}
                      rows={3}
                      placeholder={`Paste ${imp.label} contents`}
                      className="mt-2 w-full rounded-md border border-sf-border-strong bg-sf-surface p-2 font-mono text-xs leading-5 text-sf-text focus:border-sf-accent focus:outline-none focus:ring-1 focus:ring-sf-ring"
                    />
                  )}
                </li>
              )
            })}
          </ul>
          <div className="mt-3">
            <Button variant="primary" size="md" onClick={handleValidate}>
              {lesson.validateLabel || 'Validate imports'}
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
                  <span aria-hidden="true">{'\u2713'}</span>
                  {imports.length} of {imports.length} files imported and validated
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden="true">{'\u2713'}</span>
                  You rebuilt the pipeline outside the app and proved it by import.
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
              {firstFailed && (
                <div className="mt-2 rounded-md border border-sf-warning bg-sf-surface p-3">
                  <p className="text-sm font-semibold text-sf-progress-text">
                    Fix this next: <span className="font-mono">{firstFailed.label}</span>
                  </p>
                  <p className="mt-1 text-sm text-sf-body">{firstFailed.message}</p>
                </div>
              )}
              {failedCount > 1 && (
                <p className="mt-2 text-xs text-sf-progress-text">
                  {failedCount - 1} more {failedCount - 1 === 1 ? 'check is' : 'checks are'} still
                  failing across the imports.
                </p>
              )}
              {correctChecks > 0 && (
                <p className="mt-2 text-xs text-sf-progress-text">
                  {'\u2713'} {correctChecks} of {totalChecks} checks look good
                </p>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}
