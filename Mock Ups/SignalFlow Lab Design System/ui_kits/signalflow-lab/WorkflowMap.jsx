/* SignalFlow Lab UI kit — the Workflow Map (home screen). */
const { WorkflowNode, Logo, ThemeToggle, Button, Icon, SectionLabel, StatItem, Badge } = window.SignalFlowLabDesignSystem_4c48cf;

const PHASE_DOT = { complete: 'var(--sf-complete)', 'in-progress': 'var(--sf-progress)', ready: 'var(--sf-ready)' };

function phaseStatus(nodes, phaseId) {
  const ns = nodes.filter((n) => n.phaseId === phaseId);
  if (ns.some((n) => n.status === 'in-progress')) return 'in-progress';
  if (ns.some((n) => n.status === 'ready')) return 'ready';
  if (ns.some((n) => n.lessonId) && ns.filter((n) => n.lessonId).every((n) => n.status === 'complete')) return 'complete';
  return 'locked';
}

function edgeColor(edge, selectedId, statusById) {
  if (edge.from === selectedId) return { c: 'var(--sf-edge-downstream)', w: 2.5, o: 1 };
  if (edge.to === selectedId)   return { c: 'var(--sf-edge-upstream)',   w: 2.5, o: 1 };
  if (statusById[edge.from] === 'complete') return { c: 'var(--sf-edge-completed)', w: 1.5, o: 0.7 };
  return { c: 'var(--sf-edge-muted)', w: 1.5, o: 0.5 };
}

function Canvas({ nodes, phases, edges, selectedId, onSelect, statusById }) {
  const contentRef = React.useRef(null);
  const nodeRefs = React.useRef({});
  const [paths, setPaths] = React.useState([]);
  const [dims, setDims] = React.useState({ w: 0, h: 0 });

  const measure = React.useCallback(() => {
    const content = contentRef.current;
    if (!content) return;
    const base = content.getBoundingClientRect();
    setDims({ w: content.scrollWidth, h: content.scrollHeight });
    const next = [];
    edges.forEach((e) => {
      const a = nodeRefs.current[e.from];
      const b = nodeRefs.current[e.to];
      if (!a || !b) return;
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      const sx = ra.right - base.left, sy = ra.top - base.top + ra.height / 2;
      const tx = rb.left - base.left, ty = rb.top - base.top + rb.height / 2;
      let d;
      if (tx <= sx) { // same/earlier column — bow out to the right
        const bx = Math.max(sx, sx) + 30;
        d = `M ${sx} ${sy} C ${bx} ${sy}, ${bx} ${ty}, ${tx + (rb.width) } ${ty}`;
        d = `M ${sx} ${sy} C ${sx + 34} ${sy}, ${tx - 34} ${ty}, ${tx} ${ty}`;
      } else {
        const dx = (tx - sx) * 0.5;
        d = `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;
      }
      next.push({ key: `${e.from}->${e.to}`, d, ...edgeColor(e, selectedId, statusById) });
    });
    setPaths(next);
  }, [edges, selectedId, statusById]);

  React.useLayoutEffect(() => { measure(); }, [measure, nodes]);
  React.useEffect(() => {
    const ro = new ResizeObserver(() => measure());
    if (contentRef.current) ro.observe(contentRef.current);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [measure]);

  const related = React.useMemo(() => {
    if (!selectedId) return null;
    const s = new Set([selectedId]);
    edges.forEach((e) => { if (e.from === selectedId) s.add(e.to); if (e.to === selectedId) s.add(e.from); });
    return s;
  }, [selectedId, edges]);

  const EDGE_MARKERS = ['var(--sf-edge-downstream)', 'var(--sf-edge-upstream)', 'var(--sf-edge-completed)', 'var(--sf-edge-muted)'];

  return (
    <div style={{ overflowX: 'auto', borderRadius: 'var(--sf-radius-xl)', border: '1px solid var(--sf-border)', background: 'var(--sf-surface)', padding: 14 }}>
      <div ref={contentRef} style={{ position: 'relative', display: 'inline-flex', gap: 18, minWidth: '100%' }}>
        <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }} width={dims.w} height={dims.h} aria-hidden="true">
          <defs>
            {EDGE_MARKERS.map((c, i) => (
              <marker key={i} id={`sf-arrow-${i}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill={c} />
              </marker>
            ))}
          </defs>
          {paths.map((p) => (
            <path key={p.key} d={p.d} fill="none" stroke={p.c} strokeWidth={p.w} opacity={p.o}
              markerEnd={`url(#sf-arrow-${EDGE_MARKERS.indexOf(p.c)})`} />
          ))}
        </svg>

        {phases.map((phase, i) => {
          const ns = nodes.filter((n) => n.phaseId === phase.id);
          const ps = phaseStatus(nodes, phase.id);
          const sel = selectedId && nodes.find((n) => n.id === selectedId)?.phaseId === phase.id;
          return (
            <div key={phase.id} style={{
              position: 'relative', display: 'flex', flexDirection: 'column', gap: 14,
              width: 210, flexShrink: 0, padding: '10px 10px 16px', borderRadius: 'var(--sf-radius-2xl)',
              background: sel ? 'var(--sf-phase-band-sel)' : (i % 2 === 0 ? 'var(--sf-phase-band)' : 'transparent'),
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: PHASE_DOT[ps] || 'var(--sf-locked)' }} />
                  <span style={{ fontSize: 'var(--sf-text-10)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--sf-tracking-widest)', color: sel ? 'var(--sf-accent-text)' : 'var(--sf-text-subtle)' }}>
                    Phase {phase.order}
                  </span>
                </div>
                <div style={{ marginTop: 2, fontSize: 'var(--sf-text-xs)', fontWeight: 600, color: 'var(--sf-text)', lineHeight: 1.2 }}>{phase.title}</div>
                <div style={{ fontSize: 'var(--sf-text-10)', color: 'var(--sf-text-muted)' }}>{phase.goal}</div>
              </div>
              {ns.map((n) => {
                let relation = 'none';
                if (n.id === selectedId) relation = 'selected';
                else if (selectedId) {
                  if (edges.some((e) => e.from === selectedId && e.to === n.id)) relation = 'downstream';
                  else if (edges.some((e) => e.to === selectedId && e.from === n.id)) relation = 'upstream';
                }
                const dimmed = related ? !related.has(n.id) : false;
                return (
                  <div key={n.id} ref={(el) => { nodeRefs.current[n.id] = el; }}>
                    <WorkflowNode type={n.type} label={n.label} artifactName={n.artifactName}
                      status={n.status} relation={relation} dimmed={dimmed}
                      onClick={() => onSelect(n.id)} style={{ width: '100%' }} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WorkflowMap({ nodes, phases, edges, selectedId, onSelect, theme, onToggleTheme, onStart, onViewArtifact, onReset }) {
  const nodesById = React.useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);
  const statusById = React.useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n.status])), [nodes]);
  const selected = nodesById[selectedId];

  const buildable = nodes.filter((n) => n.lessonId);
  const built = buildable.filter((n) => n.status === 'complete').length;
  const ready = nodes.filter((n) => n.status === 'ready').length;
  const waiting = nodes.filter((n) => n.status === 'locked' && n.artifactName).length;
  const locked = nodes.filter((n) => n.status === 'locked').length;
  const NodeDetailPanel = window.NodeDetailPanel;

  return (
    <div style={{ minHeight: '100%', background: 'var(--sf-bg)', color: 'var(--sf-text)', fontFamily: 'var(--sf-font-sans)' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '12px 24px', background: 'var(--sf-surface)', borderBottom: '1px solid var(--sf-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Logo uppercase size={22} />
          <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--sf-border)', paddingLeft: 18 }}>
            <span style={{ fontSize: 'var(--sf-text-9)', textTransform: 'uppercase', letterSpacing: 'var(--sf-tracking-wide)', color: 'var(--sf-text-subtle)' }}>Project</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--sf-text-sm)', fontWeight: 600, color: 'var(--sf-text)' }}>
              Meridian Morning Market Brief <Icon name="chevron-down" size={14} />
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--sf-text-xs)', color: 'var(--sf-text-muted)' }}>
            <Icon name="clock" size={14} /> 6:15 AM CT
          </span>
          <ThemeToggle value={theme} onChange={onToggleTheme} />
          <Button variant="neutral" size="sm" icon="rotate-cw" onClick={onReset}>Start Over</Button>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Project header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
          <div style={{ maxWidth: 760 }}>
            <h1 style={{ margin: 0, fontSize: 'var(--sf-text-2xl)', fontWeight: 600, color: 'var(--sf-text)' }}>Meridian Morning Market Brief</h1>
            <p style={{ margin: '6px 0 0', fontSize: 'var(--sf-text-sm)', lineHeight: 1.5, color: 'var(--sf-text-muted)' }}>
              Build a workplace automation that turns messy overnight market inputs into an approval-ready 7:00 AM brief. The map below is the real dependency graph — phases on the left feed objects that get reused, evaluated, and routed downstream.
            </p>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12, fontSize: 'var(--sf-text-sm)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--sf-text-body)', fontWeight: 500 }}>
                <Icon name="clipboard-list" size={15} /> Interactive tasks built: {built} of {buildable.length}
              </span>
              <span style={{ color: 'var(--sf-border-strong)' }}>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--sf-text-muted)', fontWeight: 500 }}>
                <Icon name="workflow" size={15} /> Workflow lessons defined: {nodes.length} of {nodes.length}
              </span>
            </div>
          </div>
        </div>

        {/* Map + detail */}
        <div>
          <SectionLabel style={{ marginBottom: 10 }}>Workflow Map</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) var(--sf-detail-w)', gap: 20, alignItems: 'start' }}>
            <Canvas nodes={nodes} phases={phases} edges={edges} selectedId={selectedId} onSelect={onSelect} statusById={statusById} />
            <div style={{ position: 'sticky', top: 24 }}>
              <NodeDetailPanel node={selected} nodesById={nodesById} edges={edges} onSelect={onSelect} onStart={onStart} onViewArtifact={onViewArtifact} />
            </div>
          </div>
        </div>

        {/* Workflow health */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap', padding: '16px 20px', background: 'var(--sf-surface)', border: '1px solid var(--sf-border)', borderRadius: 'var(--sf-radius-xl)', boxShadow: 'var(--sf-shadow-sm)' }}>
          <SectionLabel>Workflow Health</SectionLabel>
          <StatItem icon="circle-check-big" value={built} label="Artifacts built" tone="complete" />
          <StatItem icon="circle-play" value={ready} label="Tasks ready" tone="ready" />
          <StatItem icon="clock" value={waiting} label="Waiting on inputs" tone="progress" />
          <StatItem icon="lock" value={locked} label="Future nodes locked" tone="locked" />
        </div>
      </div>
    </div>
  );
}

window.WorkflowMap = WorkflowMap;
