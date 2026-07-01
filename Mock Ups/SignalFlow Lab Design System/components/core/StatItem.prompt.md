**StatItem** — an icon + big value + caption metric, as in the header summary and the bottom "Workflow Health" bar.

```jsx
<StatItem icon="circle-check-big" value={4} label="Artifacts built" tone="complete" />
<StatItem icon="circle-play" value={6} label="Processes available" tone="ready" />
<StatItem icon="clock" value={7} label="Waiting on inputs" tone="progress" />
<StatItem icon="lock" value={3} label="Future nodes locked" tone="locked" />
```
