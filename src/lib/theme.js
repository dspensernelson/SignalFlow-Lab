// Persisted light/dark theme. Dark is applied by setting data-theme="dark"
// on the document root; light is the default (no attribute).
const THEME_KEY = 'signalflow_theme'

export function loadTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    return stored === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme === 'dark' ? 'dark' : 'light')
  } catch {
    // ignore write failures (e.g. storage disabled)
  }
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (theme === 'dark') root.setAttribute('data-theme', 'dark')
  else root.removeAttribute('data-theme')
}
