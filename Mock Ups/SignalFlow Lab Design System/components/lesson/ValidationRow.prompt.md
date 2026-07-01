**ValidationRow** — one deterministic check result. Green on pass, red on fail; the `hint` shows only on failure.

```jsx
<ValidationRow passed label="hub" message="Matches expected value ERCOT." />
<ValidationRow label="peakPrice" message="Value not recognized." hint="Find the spike value before it settled." />
```
