import { useState } from 'react'
import { Button, CodeBlock, Icon } from './ui'

export default function CopilotPromptCard({ prompt }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt)
    } catch {
      // NOTE: fallback for browsers/contexts without async clipboard access.
      const textarea = document.createElement('textarea')
      textarea.value = prompt
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="rounded-xl border border-sf-border bg-sf-surface p-4 shadow-sf-sm"
      style={{ borderLeftColor: 'var(--sf-copilot)', borderLeftWidth: 4 }}
    >
      <h3 className="flex items-center gap-1.5 text-sm font-semibold text-sf-text">
        <Icon name="sparkles" size={15} style={{ color: 'var(--sf-copilot)' }} />
        Copilot Prompt Coach
      </h3>
      <div className="mt-2">
        <CodeBlock wrap>{prompt}</CodeBlock>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Button variant="primary" size="sm" icon={copied ? 'circle-check' : 'copy'} onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy Prompt'}
        </Button>
        <p className="text-xs text-sf-muted">
          Use this prompt when asking Copilot to help with a similar workflow.
        </p>
      </div>
    </div>
  )
}
