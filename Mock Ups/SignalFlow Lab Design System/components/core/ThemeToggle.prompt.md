**ThemeToggle** — the segmented Light/Dark control from the top bar. Controlled; flip `data-theme` on a wrapper in `onChange`.

```jsx
const [theme, setTheme] = useState('light')
<div data-theme={theme === 'dark' ? 'dark' : undefined}>
  <ThemeToggle value={theme} onChange={setTheme} />
</div>
```
