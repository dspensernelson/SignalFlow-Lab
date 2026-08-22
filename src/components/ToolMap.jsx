import { Button, Chip, Modal, ScrollArea } from './ui'
import { downloadText } from '../lib/export'
import { TOOL_LABEL, ACTION_KIND, toolMapMarkdown } from '../lib/toolMap'

// The tool map: every step of this project's workflow, what KIND of action it
// is, and which real tools fit it best. Row derivation and the markdown
// rendering live in src/lib/toolMap.js so this file exports only a component.

export default function ToolMapModal({ open, onClose, projectName, rows }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="toolmap-title"
      describedBy="toolmap-body"
      maxWidth="max-w-4xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="toolmap-title" className="text-lg font-semibold text-sf-text">
            Tool map
          </h2>
          <p id="toolmap-body" className="mt-1 text-sm text-sf-body">
            {projectName} step by step: what KIND of action each one is, and the tools that
            fit it. The product is interchangeable; the kind of action is not.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
          Close
        </Button>
      </div>

      <ScrollArea className="mt-4 max-h-[52vh]">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-sf-border text-[11px] uppercase tracking-sf-wide text-sf-subtle">
              <th className="py-2 pr-3 font-semibold">Step</th>
              <th className="py-2 pr-3 font-semibold">Kind of action</th>
              <th className="py-2 pr-3 font-semibold">Best-fit tools</th>
              <th className="py-2 font-semibold">By hand</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const kind = ACTION_KIND[r.actionKind]
              return (
                <tr key={r.nodeId} className="border-b border-sf-border-subtle align-top">
                  <td className="py-2 pr-3 font-medium text-sf-text">{r.step}</td>
                  <td className="py-2 pr-3">
                    <span className="text-sf-body" title={kind ? kind.gloss : undefined}>
                      {kind ? kind.label : r.actionKind}
                    </span>
                  </td>
                  <td className="py-2 pr-3">
                    <div className="flex flex-wrap gap-1">
                      {r.bestFit.map((b) => (
                        <Chip key={b.tool} title={b.how}>
                          {TOOL_LABEL[b.tool] || b.tool}
                        </Chip>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 text-xs leading-snug text-sf-body">{r.byHand}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </ScrollArea>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-sf-border-subtle pt-3">
        <p className="text-[11px] text-sf-subtle">
          {rows.length} step{rows.length === 1 ? '' : 's'}. Hover a tool to see how it does this
          step.
        </p>
        <Button
          variant="neutral"
          size="sm"
          icon="download"
          onClick={() =>
            downloadText(
              `tool-map-${projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`,
              toolMapMarkdown(projectName, rows)
            )
          }
        >
          Download as markdown
        </Button>
      </div>
    </Modal>
  )
}
