/* SignalFlow Lab UI kit — selected-node detail panel (right rail). */
const { Badge, Chip, SectionLabel, Button, Icon } = window.SignalFlowLabDesignSystem_4c48cf;

const TYPE_LABEL = {
  source: 'Source object', reference: 'Reference object', artifact: 'Artifact',
  process: 'Process step', decision: 'Decision point', handoff: 'Handoff',
  output: 'Output', archive: 'Archive',
};
const TYPE_VAR = {
  source: 'var(--sf-type-source)', reference: 'var(--sf-type-reference)',
  artifact: 'var(--sf-type-artifact)', process: 'var(--sf-type-process)',
  decision: 'var(--sf-type-decision)', handoff: 'var(--sf-type-handoff)',
  output: 'var(--sf-type-output)', archive: 'var(--sf-type-archive)',
};
const STATUS_BADGE = {
  context:        { tone: 'context',  label: 'Context' },
  locked:         { tone: 'locked',   label: 'Upcoming' },
  upcoming:       { tone: 'locked',   label: 'Upcoming' },
  ready:          { tone: 'ready',    label: 'Ready' },
  'in-progress':  { tone: 'progress', label: 'In progress' },
  'needs-inputs': { tone: 'progress', label: 'Needs inputs' },
  complete:       { tone: 'complete', label: 'Complete' },
};

function PanelSection({ title, children }) {
  return (
    <div style={{ borderTop: '1px solid var(--sf-border-subtle)', paddingTop: 10, marginTop: 10 }}>
      <SectionLabel size="xs">{title}</SectionLabel>
      <div style={{ marginTop: 5, fontSize: 'var(--sf-text-11)', lineHeight: 'var(--sf-leading-snug)', color: 'var(--sf-text-body)' }}>
        {children}
      </div>
    </div>
  );
}

function LinkRow({ items, color, onSelect }) {
  if (!items.length) return <span style={{ color: 'var(--sf-text-subtle)' }}>—</span>;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 8px' }}>
      {items.map((it, i) => (
        <button key={it.id} type="button" onClick={() => onSelect(it.id)}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', fontWeight: 600, color }}>
          {it.label}{i < items.length - 1 ? ' ·' : ''}
        </button>
      ))}
    </div>
  );
}

function NodeDetailPanel({ node, nodesById, edges, onSelect, onStart, onViewArtifact }) {
  if (!node) {
    return (
      <div style={{ background: 'var(--sf-surface)', border: '1px solid var(--sf-border)', borderRadius: 'var(--sf-radius-xl)', padding: 16, fontSize: 12, color: 'var(--sf-text-muted)' }}>
        Select a node in the workflow map to inspect it.
      </div>
    );
  }
  const accent = TYPE_VAR[node.type];
  const badge = STATUS_BADGE[node.status] || STATUS_BADGE.locked;
  const feedsInto = edges.filter((e) => e.from === node.id).map((e) => ({ id: e.to, label: nodesById[e.to].label }));
  const dependsOn = edges.filter((e) => e.to === node.id).map((e) => ({ id: e.from, label: nodesById[e.from].label }));
  const buildable = !!node.lessonId;

  return (
    <div style={{
      background: 'var(--sf-surface)', border: '1px solid var(--sf-border)',
      borderLeft: `var(--sf-border-accent) solid ${accent}`,
      borderRadius: 'var(--sf-radius-xl)', padding: 14, boxShadow: 'var(--sf-shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 'var(--sf-text-9)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'var(--sf-tracking-wide)', color: accent }}>
            {TYPE_LABEL[node.type]}
          </div>
          <h3 style={{ margin: '2px 0 0', fontSize: 'var(--sf-text-sm)', fontWeight: 700, lineHeight: 1.2, color: 'var(--sf-text)' }}>{node.label}</h3>
          {node.artifactName && (
            <div style={{ marginTop: 2, fontFamily: 'var(--sf-font-mono)', fontSize: 'var(--sf-text-10)', color: 'var(--sf-text-muted)' }}>{node.artifactName}</div>
          )}
        </div>
        <Badge tone={badge.tone} icon={
          node.status === 'complete'      ? 'circle-check' :
          node.status === 'needs-inputs'  ? 'alert-circle'  :
          (node.status === 'locked' || node.status === 'upcoming') ? 'lock' : undefined
        }>{badge.label}</Badge>
      </div>

      <p style={{ margin: '10px 0 0', fontSize: 'var(--sf-text-11)', lineHeight: 'var(--sf-leading-snug)', color: 'var(--sf-text-muted)' }}>{node.description}</p>

      <PanelSection title="What you'll do">{node.intent}</PanelSection>
      <PanelSection title="Concepts">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {node.concepts.map((c) => <Chip key={c}>{c}</Chip>)}
        </div>
      </PanelSection>
      <PanelSection title="In the lab">{node.labVersion}</PanelSection>
      <PanelSection title="Depends on">
        {dependsOn.length === 0 ? <span style={{ color: 'var(--sf-text-subtle)' }}>Entry point</span>
          : <LinkRow items={dependsOn} color="var(--sf-signal-raw)" onSelect={onSelect} />}
      </PanelSection>
      <PanelSection title="Feeds into">
        {feedsInto.length === 0 ? <span style={{ color: 'var(--sf-text-subtle)' }}>Nothing downstream</span>
          : <LinkRow items={feedsInto} color="var(--sf-signal-reuse)" onSelect={onSelect} />}
      </PanelSection>
      <PanelSection title="Governance">{node.governance}</PanelSection>

      <div style={{ marginTop: 12 }}>
        {buildable && node.status === 'ready' && (
          <Button variant="primary" fullWidth iconRight="arrow-right" onClick={() => onStart(node)}>Start lesson</Button>
        )}
        {buildable && node.status === 'complete' && (
          <Button variant="success" fullWidth icon="braces" onClick={() => onViewArtifact(node)}>View artifact</Button>
        )}
        {!buildable && (
          <p style={{ margin: 0, padding: '8px 10px', borderRadius: 'var(--sf-radius-lg)', background: 'var(--sf-surface-subtle)', fontSize: 'var(--sf-text-11)', lineHeight: 1.4, color: 'var(--sf-text-muted)' }}>
            {node.status === 'context'
              ? 'Inspection node — read its provenance and reuse; nothing to build here.'
              : 'Lesson defined — the interaction is coming in a later pass.'}
          </p>
        )}
      </div>
    </div>
  );
}

window.NodeDetailPanel = NodeDetailPanel;
