import { useState } from 'react'
import { Button } from '../components/ui'
import { renderPython } from '../runtime/codegen/python.js'

// The Python skin: the same flow as a script. Read-only; switch skins to edit.
export default function CodeView({ flow, moduleData }) {
  const [copied, setCopied] = useState(false)
  const code = renderPython(flow, moduleData)
  function copy() {
    if (navigator.clipboard) navigator.clipboard.writeText(code).then(() => setCopied(true))
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-sf-muted">Your flow as a Python script. Every comment names a step you assembled. Read-only here - flip to another view to edit.</p>
        <Button variant="neutral" size="sm" icon="copy" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <pre className="max-h-[70vh] overflow-auto rounded-xl border border-sf-border bg-sf-surface-inset p-3 font-mono text-[11px] leading-relaxed text-sf-body">
        <code>{code}</code>
      </pre>
    </div>
  )
}
