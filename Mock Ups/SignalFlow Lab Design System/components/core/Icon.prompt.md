**Icon** — a line icon from SignalFlow Lab's curated Lucide subset; use anywhere the UI needs an inline glyph (node types, status, controls). Inherits `currentColor`.

```jsx
<Icon name="braces" size={16} />
<span style={{ color: 'var(--sf-type-output)' }}><Icon name="circle-check" size={18} /></span>
```

- `name` — see `ICON_NAMES`. Node-type glyphs: `file-text` (source/output), `flag` (trader flag), `database` (price feed), `braces` (artifact/JSON), `shield` (policy/risk), `line-chart`/`activity` (process), `user-check` (decision), `send` (handoff), `archive`, `git-branch`.
- Status glyphs: `circle-check`, `circle-check-big`, `clock`, `lock`, `circle-play`, `triangle-alert`.
- `size` (default 16), `strokeWidth` (default 2). Color via the parent's `color`.
