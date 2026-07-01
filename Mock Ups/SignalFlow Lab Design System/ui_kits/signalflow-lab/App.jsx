/* SignalFlow Lab UI kit — orchestrator: theme, view routing, progress state. */
const { Button, Icon, SectionLabel, Badge } = window.SignalFlowLabDesignSystem_4c48cf;

function ArtifactViewer({ node, onBack }) {
  const artifact = node.id === 'market-intake-record'
    ? { hub: 'ERCOT', peakPrice: '$187/MWh', settledPrice: '$142/MWh', generationFlag: 'Wind underperformed', approvalRequired: true }
    : {};
  return (
    <div style={{ minHeight: '100%', background: 'var(--sf-bg)', color: 'var(--sf-text)', fontFamily: 'var(--sf-font-sans)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <Button variant="link" icon="arrow-left" onClick={onBack}>Back to Canvas</Button>
          <h1 style={{ margin: '6px 0 2px', fontSize: 'var(--sf-text-2xl)', fontWeight: 600 }}>{node.label} Artifact</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--sf-font-mono)', fontSize: 'var(--sf-text-sm)', color: 'var(--sf-text-muted)' }}>{node.artifactName}</span>
            <Badge tone="complete" icon="circle-check">Built</Badge>
          </div>
        </div>
        <pre style={{ margin: 0, padding: 16, borderRadius: 'var(--sf-radius-xl)', border: '1px solid var(--sf-border)', background: 'var(--sf-surface)', fontFamily: 'var(--sf-font-mono)', fontSize: 'var(--sf-text-sm)', color: 'var(--sf-text-body)', overflow: 'auto', boxShadow: 'var(--sf-shadow-sm)' }}>
          {JSON.stringify(artifact, null, 2)}
        </pre>
      </div>
    </div>
  );
}

function App() {
  const [theme, setTheme] = React.useState('light');
  const [nodes, setNodes] = React.useState(() => window.SF_NODES.map((n) => ({ ...n })));
  const [selectedId, setSelectedId] = React.useState('market-intake-record');
  const [view, setView] = React.useState('canvas'); // canvas | lesson | artifact
  const [activeNode, setActiveNode] = React.useState(null);

  const phases = window.SF_PHASES;
  const edges = window.SF_EDGES;

  function startLesson(node) {
    if (node.lessonId !== 'lesson-intake') return; // only Intake is fully interactive
    setActiveNode(node);
    setNodes((prev) => prev.map((n) => n.id === node.id ? { ...n, status: 'in-progress' } : n));
    setView('lesson');
  }
  function completeLesson(nodeId) {
    setNodes((prev) => prev.map((n) => n.id === nodeId ? { ...n, status: 'complete' } : n));
  }
  function viewArtifact(node) { setActiveNode(node); setView('artifact'); }
  function backToCanvas() { setView('canvas'); }
  function reset() {
    setNodes(window.SF_NODES.map((n) => ({ ...n })));
    setSelectedId('market-intake-record'); setView('canvas');
  }

  const WorkflowMap = window.WorkflowMap;
  const LessonWorkspace = window.LessonWorkspace;

  let screen;
  if (view === 'lesson' && activeNode) {
    screen = <LessonWorkspace lesson={window.SF_LESSON_INTAKE} onBack={backToCanvas} onComplete={completeLesson} />;
  } else if (view === 'artifact' && activeNode) {
    screen = <ArtifactViewer node={nodes.find((n) => n.id === activeNode.id)} onBack={backToCanvas} />;
  } else {
    screen = (
      <WorkflowMap nodes={nodes} phases={phases} edges={edges} selectedId={selectedId}
        onSelect={setSelectedId} theme={theme} onToggleTheme={setTheme}
        onStart={startLesson} onViewArtifact={viewArtifact} onReset={reset} />
    );
  }

  return (
    <div data-theme={theme === 'dark' ? 'dark' : undefined} style={{ minHeight: '100vh', background: 'var(--sf-bg)' }}>
      {view === 'canvas' && (
        <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 20 }}>
          {!nodes.find((n) => n.id === 'market-intake-record').status.includes('complete') && (
            <div style={{ background: 'var(--sf-surface)', border: '1px solid var(--sf-border)', borderRadius: 'var(--sf-radius-lg)', boxShadow: 'var(--sf-shadow-lg)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, maxWidth: 280 }}>
              <span style={{ color: 'var(--sf-accent)', display: 'inline-flex' }}><Icon name="circle-help" size={16} /></span>
              <span style={{ fontSize: 'var(--sf-text-xs)', color: 'var(--sf-text-body)', lineHeight: 1.4 }}>
                Try it: select <strong style={{ color: 'var(--sf-text)' }}>Market Intake Record</strong> and Start lesson.
              </span>
            </div>
          )}
        </div>
      )}
      {screen}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
