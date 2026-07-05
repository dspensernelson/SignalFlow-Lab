/* SignalFlow Lab UI kit — the three-step Lesson Workspace (Intro → Exercise → Takeaway). */
const { Stepper, Card, CodeBlock, FieldGuideRow, ValidationRow, Button, Badge, SectionLabel, Icon, Chip } = window.SignalFlowLabDesignSystem_4c48cf;

function validateIntake(answerText, lesson) {
  let obj;
  try { obj = JSON.parse(answerText); }
  catch { return { ok: false, results: [{ label: 'JSON', message: 'Could not parse — check for missing quotes or commas.', passed: false, hint: 'Every key and string value needs double quotes.' }] }; }

  const norm = (v) => String(v == null ? '' : v).toLowerCase().trim();
  const checks = [
    { id: 'hub', label: 'hub', test: () => norm(obj.hub).includes('ercot'), msg: () => obj.hub ? 'Matches expected hub ERCOT.' : 'Missing or wrong hub.', hint: 'Look for the named trading hub or region.' },
    { id: 'peakPrice', label: 'peakPrice', test: () => norm(obj.peakPrice).includes('187'), msg: () => 'Peak price captured.', hint: 'Find the spike value before it settled ($187).' },
    { id: 'settledPrice', label: 'settledPrice', test: () => norm(obj.settledPrice).includes('142'), msg: () => 'Settled price captured.', hint: 'Find the price the note says it settled near ($142).' },
    { id: 'generationFlag', label: 'generationFlag', test: () => norm(obj.generationFlag).includes('wind') && norm(obj.generationFlag).includes('under'), msg: () => 'Generation status captured.', hint: 'Name the source and that it underperformed.' },
    { id: 'approvalRequired', label: 'approvalRequired', test: () => obj.approvalRequired === true, msg: () => 'Approval flag correctly set to true.', hint: 'The trader flagged it — use the boolean true.' },
  ];
  const results = checks.map((c) => {
    const passed = c.test();
    return { label: c.label, message: passed ? c.msg() : 'Value not recognized.', passed, hint: c.hint };
  });
  return { ok: results.every((r) => r.passed), results };
}

function CopilotPromptCard({ prompt }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <Card tone="info" padding="sm">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: 'var(--sf-info)', display: 'inline-flex' }}><Icon name="braces" size={15} /></span>
        <span style={{ fontSize: 'var(--sf-text-sm)', fontWeight: 600, color: 'var(--sf-info)' }}>Copilot Prompt Coach</span>
      </div>
      <div style={{ marginTop: 8 }}><CodeBlock wrap>{prompt}</CodeBlock></div>
      <div style={{ marginTop: 10 }}>
        <Button size="sm" variant="neutral" icon={copied ? 'check' : 'copy'}
          onClick={() => { try { navigator.clipboard.writeText(prompt); } catch {} setCopied(true); setTimeout(() => setCopied(false), 1600); }}>
          {copied ? 'Copied!' : 'Copy Prompt'}
        </Button>
      </div>
    </Card>
  );
}

function LessonWorkspace({ lesson, onBack, onComplete }) {
  const STEPS = ['Intro', 'Exercise', 'Takeaway'];
  const [step, setStep] = React.useState(0);
  const [answer, setAnswer] = React.useState(lesson.starterAnswer);
  const [results, setResults] = React.useState(null);
  const [passed, setPassed] = React.useState(false);
  const [checked, setChecked] = React.useState(lesson.instructions.map(() => false));

  function handleValidate() {
    const r = validateIntake(answer, lesson);
    setResults(r.results);
    setPassed(r.ok);
    if (r.ok) onComplete(lesson.nodeId, lesson.solution);
  }

  return (
    <div style={{ minHeight: '100%', background: 'var(--sf-bg)', color: 'var(--sf-text)', fontFamily: 'var(--sf-font-sans)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <Button variant="link" icon="arrow-left" onClick={onBack}>Back to Canvas</Button>
          <h1 style={{ margin: '6px 0 2px', fontSize: 'var(--sf-text-2xl)', fontWeight: 600 }}>{lesson.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--sf-text-sm)', color: 'var(--sf-text-muted)' }}>
            <Badge tone="info">{lesson.difficulty}</Badge> {lesson.skill}
          </div>
        </div>
        <Stepper steps={STEPS} current={step} />

        {step === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, alignItems: 'start' }}>
            <Card padding="lg">
              <h2 style={{ margin: 0, fontSize: 'var(--sf-text-lg)', fontWeight: 600, color: 'var(--sf-text)' }}>{lesson.intro.heading}</h2>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {lesson.intro.sections.map((s) => (
                  <div key={s.title}>
                    <h3 style={{ margin: 0, fontSize: 'var(--sf-text-sm)', fontWeight: 600, color: 'var(--sf-text)' }}>{s.title}</h3>
                    <p style={{ margin: '4px 0 0', fontSize: 'var(--sf-text-sm)', lineHeight: 1.5, color: 'var(--sf-text-body)' }}>{s.body}</p>
                  </div>
                ))}
              </div>
            </Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Card><SectionLabel>JSON Example</SectionLabel><div style={{ marginTop: 8 }}><CodeBlock>{lesson.jsonExample}</CodeBlock></div></Card>
              <Card>
                <SectionLabel>You will produce</SectionLabel>
                <div style={{ marginTop: 4, fontSize: 'var(--sf-text-sm)', fontWeight: 600, color: 'var(--sf-text)', fontFamily: 'var(--sf-font-mono)' }}>{lesson.nodeId === 'lesson-intake' ? 'market-intake.json' : ''}</div>
                <div style={{ marginTop: 10 }}><SectionLabel>Skill you are practicing</SectionLabel></div>
                <div style={{ marginTop: 4, fontSize: 'var(--sf-text-sm)', fontWeight: 600, color: 'var(--sf-text)' }}>{lesson.skill}</div>
              </Card>
            </div>
            <div><Button variant="primary" iconRight="arrow-right" onClick={() => setStep(1)}>Continue to Exercise</Button></div>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 0.9fr', gap: 16, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Card><SectionLabel>{lesson.inputLabel}</SectionLabel><div style={{ marginTop: 8 }}><CodeBlock wrap>{lesson.input}</CodeBlock></div></Card>
              <Card>
                <SectionLabel>Instructions</SectionLabel>
                <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {lesson.instructions.map((ins, i) => (
                    <li key={i}>
                      <label style={{ display: 'flex', gap: 8, cursor: 'pointer', fontSize: 'var(--sf-text-sm)', color: 'var(--sf-text-body)' }}>
                        <input type="checkbox" checked={checked[i]} onChange={() => setChecked((p) => p.map((v, j) => j === i ? !v : v))} style={{ marginTop: 2, accentColor: 'var(--sf-accent)' }} />
                        <span style={{ textDecoration: checked[i] ? 'line-through' : 'none', color: checked[i] ? 'var(--sf-text-subtle)' : 'var(--sf-text-body)' }}>{ins}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card>
                <SectionLabel>Field Guide</SectionLabel>
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {lesson.fieldGuide.map((f, i) => <FieldGuideRow key={f.field} divider={i !== 0} {...f} />)}
                </div>
              </Card>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Card>
                <SectionLabel>Your Answer (JSON)</SectionLabel>
                <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} spellCheck={false} rows={13}
                  style={{ marginTop: 8, width: '100%', boxSizing: 'border-box', resize: 'vertical', borderRadius: 'var(--sf-radius-md)', border: '1px solid var(--sf-border-strong)', background: 'var(--sf-surface)', color: 'var(--sf-text)', padding: 12, fontFamily: 'var(--sf-font-mono)', fontSize: 'var(--sf-text-sm)', lineHeight: 1.5, outline: 'none' }} />
                <div style={{ marginTop: 12 }}><Button variant="primary" icon="circle-check" onClick={handleValidate}>Validate</Button></div>
              </Card>
              {passed && (
                <Card tone="success">
                  <p style={{ margin: 0, fontSize: 'var(--sf-text-sm)', fontWeight: 600, color: 'var(--sf-green-800)' }}>{lesson.successMessage}</p>
                  <div style={{ marginTop: 12 }}><Button variant="success" iconRight="arrow-right" onClick={() => setStep(2)}>Continue to Takeaway</Button></div>
                </Card>
              )}
              <CopilotPromptCard prompt={lesson.copilotPrompt} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Card>
                <SectionLabel>Validation Results</SectionLabel>
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {results ? results.map((r, i) => <ValidationRow key={i} {...r} />)
                    : <p style={{ margin: 0, fontSize: 'var(--sf-text-sm)', color: 'var(--sf-text-muted)' }}>Validate your answer to see per-field results and hints here.</p>}
                </div>
              </Card>
              {passed && (
                <Card>
                  <SectionLabel>Output Preview</SectionLabel>
                  <div style={{ marginTop: 8 }}><CodeBlock>{lesson.solution}</CodeBlock></div>
                </Card>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, alignItems: 'start' }}>
            <Card tone="success" padding="lg">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--sf-complete)', display: 'inline-flex' }}><Icon name="circle-check-big" size={22} /></span>
                <h2 style={{ margin: 0, fontSize: 'var(--sf-text-lg)', fontWeight: 600, color: 'var(--sf-green-900)' }}>{lesson.takeaway.heading}</h2>
              </div>
              <ul style={{ listStyle: 'none', margin: '14px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {lesson.takeaway.points.map((p, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, fontSize: 'var(--sf-text-sm)', color: 'var(--sf-green-900)' }}>
                    <span style={{ color: 'var(--sf-complete)', display: 'inline-flex', marginTop: 1 }}><Icon name="check" size={15} strokeWidth={2.5} /></span>{p}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 18 }}><Button variant="success" icon="workflow" onClick={onBack}>Return to Canvas</Button></div>
            </Card>
            <Card>
              <SectionLabel>Artifact produced</SectionLabel>
              <div style={{ marginTop: 4, fontFamily: 'var(--sf-font-mono)', fontSize: 'var(--sf-text-sm)', fontWeight: 600, color: 'var(--sf-text)' }}>market-intake.json</div>
              <div style={{ marginTop: 12 }}><CodeBlock>{lesson.solution}</CodeBlock></div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

window.LessonWorkspace = LessonWorkspace;
