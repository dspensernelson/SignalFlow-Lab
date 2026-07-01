import nodes from '../data/workflowNodes.json'
import edges from '../data/workflowEdges.json'
import { Button, Badge, CodeBlock, Card, SectionLabel, SignalFlowDiagram } from './ui'

const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]))

export default function ArtifactViewer({ node, artifact, onBack }) {
  const upstream = edges.filter((e) => e.to === node.id).map((e) => nodeById[e.from]?.label || e.from)
  const downstream = edges.filter((e) => e.from === node.id).map((e) => nodeById[e.to]?.label || e.to)
  const hasFlow = upstream.length > 0 || downstream.length > 0

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 text-left">
      <header className="flex flex-col gap-2">
        <Button variant="link" size="sm" icon="arrow-left" onClick={onBack} className="w-fit">
          Back to Canvas
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold text-sf-text">{node.label} Artifact</h1>
          <Badge tone="trusted" icon="shield-check">
            Trusted
          </Badge>
        </div>
        <p className="font-mono text-sm text-sf-muted">{node.artifactName}</p>
      </header>

      {hasFlow && (
        <Card tone="subtle" padding="md">
          <SectionLabel className="mb-2">Signal path</SectionLabel>
          <SignalFlowDiagram
            inputTone="upstream"
            inputLabel="raw signal"
            inputHeader="Inputs"
            outputTone="completed"
            outputLabel="trusted signal"
            outputHeader="Reused by"
            gap={52}
            inputs={upstream.map((l) => (
              <div
                key={l}
                className="rounded-md border border-sf-border bg-sf-surface px-3 py-2 text-sm font-medium text-sf-body"
              >
                {l}
              </div>
            ))}
            center={
              <div className="w-full rounded-lg border-2 border-sf-trusted-border bg-sf-trusted-weak px-3 py-3 text-center">
                <span className="text-[10px] font-bold uppercase tracking-sf-wide text-sf-trusted-text">
                  This artifact
                </span>
                <p className="font-mono text-xs text-sf-body">{node.artifactName}</p>
              </div>
            }
            consumers={downstream.map((l) => (
              <div
                key={l}
                className="rounded-md border border-sf-border bg-sf-surface px-3 py-2 text-sm font-medium text-sf-body"
              >
                {l}
              </div>
            ))}
          />
        </Card>
      )}

      {artifact === undefined || artifact === null ? (
        <Card tone="warning" padding="md">
          <p className="text-sm text-sf-progress-text">
            No artifact was found for this step yet. Complete the lesson to generate one.
          </p>
        </Card>
      ) : (
        <CodeBlock label={node.artifactName}>{artifact}</CodeBlock>
      )}
    </div>
  )
}
