import { useState } from 'react'

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
    <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
      <h3 className="text-sm font-semibold text-indigo-900">Copilot Prompt Coach</h3>
      <pre className="mt-2 whitespace-pre-wrap rounded-md border border-indigo-100 bg-white p-3 text-sm text-gray-800">
        {prompt}
      </pre>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {copied ? 'Copied!' : 'Copy Prompt'}
        </button>
        <p className="text-xs text-indigo-800">
          Use this prompt when asking Copilot to help with a similar workflow.
        </p>
      </div>
    </div>
  )
}
