**Button** — the primary action control. Use `primary` for the main step ("Start lesson", "Validate"), `success` to advance a passed lesson, `neutral` for secondary actions ("Restart", "Start Over"), `link` for back-navigation.

```jsx
<Button variant="primary" iconRight="arrow-right">Start lesson</Button>
<Button variant="success">Continue to Takeaway</Button>
<Button variant="neutral" size="sm" icon="rotate-cw">Restart</Button>
<Button variant="link" icon="arrow-left">Back to Canvas</Button>
```

Variants: `primary` (blue), `success` (emerald), `warning` (amber), `neutral` (hairline border), `ghost`, `link`. Sizes: `sm`, `md`. Props: `icon`, `iconRight`, `fullWidth`, `disabled`.
