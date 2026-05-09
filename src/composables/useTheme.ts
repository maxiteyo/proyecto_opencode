import { ref, watch } from 'vue'

type Theme = 'light' | 'dark' | 'system'

const THEME_KEY = 'password-gen-theme'

const currentTheme = ref<Theme>(loadTheme())

function loadTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null
    return stored || 'system'
  } catch {
    return 'system'
  }
}

function applyTheme(theme: Theme) {
  const html = document.documentElement
  html.classList.remove('theme-light', 'theme-dark')

  if (theme === 'light') {
    html.classList.add('theme-light')
  } else if (theme === 'dark') {
    html.classList.add('theme-dark')
  }
}

function setTheme(theme: Theme) {
  currentTheme.value = theme
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch { /* ignore */ }
  applyTheme(theme)
}

export function useTheme() {
  applyTheme(currentTheme.value)

  watch(currentTheme, (t) => applyTheme(t))

  return { currentTheme, setTheme }
}
