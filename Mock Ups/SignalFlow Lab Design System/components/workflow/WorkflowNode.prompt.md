**WorkflowNode** — the signature clickable object on the SignalFlow Lab canvas. Colored by `type`, skinned by `status`, ringed by its `relation` to the current selection.

```jsx
<WorkflowNode type="artifact" label="Market Intake Record" artifactName="market-intake.json" status="complete" relation="selected" />
<WorkflowNode type="source" label="Analyst Notes" status="context" />
<WorkflowNode type="process" label="Risk Evaluation" artifactName="risk-evaluation.json" status="locked" dimmed />
```

`type`: source · reference · artifact · process · decision · handoff · output · archive. `status`: context · locked · ready · in-progress · complete. `relation`: selected · upstream · downstream · none. Fixed 190×84 design size (`--sf-node-w/h`).
