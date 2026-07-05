**Logo** — the SignalFlow Lab brand lockup: a blue signal-bars glyph with an optional wordmark. Use in app headers and any branded surface.

```jsx
<Logo />                                   {/* glyph + "SignalFlow Lab" */}
<Logo uppercase size={22} />               {/* compact header style: SIGNALFLOW LAB */}
<Logo showWordmark={false} size={32} />    {/* glyph only */}
```

- `uppercase` switches the wordmark to the tracked uppercase header treatment seen in the product top bar.
- `color` recolors only the glyph; the wordmark always uses `--sf-text`.
