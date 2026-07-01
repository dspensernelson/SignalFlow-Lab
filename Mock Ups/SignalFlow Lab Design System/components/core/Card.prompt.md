**Card** — the panel primitive every workspace surface is built from. Default is a white (ink in dark) hairline-bordered panel; `tone` tints it; `accent` adds the left type-color strip used on the selected-node panel.

```jsx
<Card>…panel content…</Card>
<Card accent="var(--sf-type-artifact)">…selected node…</Card>
<Card tone="success">Intake record built.</Card>
<Card tone="subtle" padding="sm">…inset…</Card>
```
