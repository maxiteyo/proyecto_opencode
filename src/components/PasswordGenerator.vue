<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { usePasswordGenerator } from '../composables/usePasswordGenerator'
import { usePassphraseGenerator } from '../composables/usePassphraseGenerator'
import { useTheme } from '../composables/useTheme'
import { usePasswordHistory } from '../composables/usePasswordHistory'
import type { PasswordOptions } from '../types/password'
import type { PassphraseOptions } from '../composables/usePassphraseGenerator'

const { generatePassword } = usePasswordGenerator()
const { generatePassphrase } = usePassphraseGenerator()
const { currentTheme, setTheme } = useTheme()
const { history, addEntry, clearHistory, removeEntry } = usePasswordHistory()

type Mode = 'password' | 'passphrase'

const PWD_STORAGE_KEY = 'password-gen-options'
const PHRASE_STORAGE_KEY = 'passphrase-gen-options'
const MODE_STORAGE_KEY = 'password-gen-mode'

const mode = ref<Mode>(loadMode())
const output = ref('')
const error = ref('')
const copied = ref(false)
const historyOpen = ref(false)
const revealedIds = ref<Set<string>>(new Set())
const historyPageSize = 5
const historyShown = ref(historyPageSize)
let copyTimer: ReturnType<typeof setTimeout>

const passwordOptions = ref<PasswordOptions>(loadPasswordOptions())
const passphraseOptions = ref<PassphraseOptions>(loadPassphraseOptions())

function loadMode(): Mode {
  try { return (localStorage.getItem(MODE_STORAGE_KEY) as Mode) || 'password' } catch { return 'password' }
}

function loadPasswordOptions(): PasswordOptions {
  try {
    const stored = localStorage.getItem(PWD_STORAGE_KEY)
    if (stored) return { ...defaultPasswordOptions(), ...JSON.parse(stored) }
  } catch { /* ignore */ }
  return defaultPasswordOptions()
}

function defaultPasswordOptions(): PasswordOptions {
  return {
    length: 20,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: false,
  }
}

function savePasswordOptions() {
  try { localStorage.setItem(PWD_STORAGE_KEY, JSON.stringify(passwordOptions.value)) } catch { /* ignore */ }
}

function loadPassphraseOptions(): PassphraseOptions {
  try {
    const stored = localStorage.getItem(PHRASE_STORAGE_KEY)
    if (stored) return { ...defaultPassphraseOptions(), ...JSON.parse(stored) }
  } catch { /* ignore */ }
  return defaultPassphraseOptions()
}

function defaultPassphraseOptions(): PassphraseOptions {
  return {
    wordCount: 4,
    separator: '-',
    capitalize: false,
    appendNumber: false,
  }
}

function savePassphraseOptions() {
  try { localStorage.setItem(PHRASE_STORAGE_KEY, JSON.stringify(passphraseOptions.value)) } catch { /* ignore */ }
}

function activeSetsCount(): number {
  let count = 0
  if (passwordOptions.value.includeUppercase) count++
  if (passwordOptions.value.includeLowercase) count++
  if (passwordOptions.value.includeNumbers) count++
  if (passwordOptions.value.includeSymbols) count++
  return count
}

function validate(): boolean {
  if (mode.value === 'password') {
    if (activeSetsCount() === 0) {
      error.value = 'Selecciona al menos un tipo de carácter'
      return false
    }
    if (passwordOptions.value.length < activeSetsCount()) {
      error.value = `Longitud mínima: ${activeSetsCount()} para los tipos seleccionados`
      return false
    }
  }
  error.value = ''
  return true
}

function getConfigSummary(): string {
  if (mode.value === 'password') {
    const parts: string[] = []
    if (passwordOptions.value.includeUppercase) parts.push('A-Z')
    if (passwordOptions.value.includeLowercase) parts.push('a-z')
    if (passwordOptions.value.includeNumbers) parts.push('0-9')
    if (passwordOptions.value.includeSymbols) parts.push('!@#')
    if (passwordOptions.value.excludeAmbiguous) parts.push('no ambig')
    return `[${parts.join(', ')}] len:${passwordOptions.value.length}`
  }
  const parts: string[] = []
  parts.push(`${passphraseOptions.value.wordCount} palabras`)
  parts.push(`sep:${passphraseOptions.value.separator === ' ' ? 'space' : passphraseOptions.value.separator}`)
  if (passphraseOptions.value.capitalize) parts.push('Cap')
  if (passphraseOptions.value.appendNumber) parts.push('+num')
  return `[${parts.join(', ')}]`
}

function generate() {
  if (!validate()) return
  if (mode.value === 'password') {
    output.value = generatePassword(passwordOptions.value)
    savePasswordOptions()
  } else {
    output.value = generatePassphrase(passphraseOptions.value)
    savePassphraseOptions()
  }
  addEntry(output.value, mode.value, getConfigSummary())
}

function switchMode(newMode: Mode) {
  mode.value = newMode
  try { localStorage.setItem(MODE_STORAGE_KEY, newMode) } catch { /* ignore */ }
  generate()
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    try {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    } catch { /* ignore */ }
  }
}

async function copyOutput() {
  await copyText(output.value)
  showCopied()
}

function showCopied() {
  copied.value = true
  clearTimeout(copyTimer)
  copyTimer = setTimeout(() => { copied.value = false }, 2000)
}

function toggleHistory() {
  historyOpen.value = !historyOpen.value
  historyShown.value = historyPageSize
}

function toggleReveal(id: string) {
  const s = new Set(revealedIds.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  revealedIds.value = s
}

function maskPassword(pwd: string): string {
  return '•'.repeat(Math.min(pwd.length, 20))
}

const strengthBits = computed(() => {
  if (!output.value) return 0
  if (mode.value === 'password') {
    let poolSize = 0
    if (passwordOptions.value.includeUppercase) poolSize += 26
    if (passwordOptions.value.includeLowercase) poolSize += 26
    if (passwordOptions.value.includeNumbers) poolSize += 10
    if (passwordOptions.value.includeSymbols) poolSize += 30
    return Math.round(Math.log2(poolSize) * output.value.length)
  }
  return Math.round(passphraseOptions.value.wordCount * Math.log2(700))
})

const strengthLabel = computed(() => {
  const bits = strengthBits.value
  if (bits < 40) return 'Débil'
  if (bits < 60) return 'Regular'
  if (bits < 80) return 'Buena'
  if (bits < 100) return 'Fuerte'
  return 'Muy fuerte'
})

const strengthPercent = computed(() => Math.min(100, (strengthBits.value / 120) * 100))

const strengthColor = computed(() => {
  const bits = strengthBits.value
  if (bits < 40) return '#ef4444'
  if (bits < 60) return '#f59e0b'
  if (bits < 80) return '#22c55e'
  if (bits < 100) return '#16a34a'
  return '#6366f1'
})

function exportCSV() {
  const headers = ['Contraseña', 'Modo', 'Configuración', 'Fecha']
  const rows = history.value.map((e) =>
    [e.password, e.mode, e.config, e.date].map((v) => `"${v.replace(/"/g, '""')}"`).join(',')
  )
  const csv = [headers.join(','), ...rows].join('\n')
  downloadFile(csv, 'historial-contraseñas.csv', 'text/csv')
}

function exportJSON() {
  const json = JSON.stringify(history.value, null, 2)
  downloadFile(json, 'historial-contraseñas.json', 'application/json')
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function onKeydown(e: KeyboardEvent) {
  if (e.ctrlKey && e.key === 'g') {
    e.preventDefault()
    generate()
  }
  if ((e.ctrlKey && e.key === 'c') && document.activeElement?.tagName !== 'INPUT') {
    e.preventDefault()
    copyOutput()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  clearTimeout(copyTimer)
})

watch(passphraseOptions, generate, { deep: true })

generate()
</script>

<template>
  <div class="password-generator">
    <div class="card">
      <div class="theme-switcher">
        <button :class="['theme-btn', { active: currentTheme === 'light' }]" title="Claro" @click="setTheme('light')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        </button>
        <button :class="['theme-btn', { active: currentTheme === 'dark' }]" title="Oscuro" @click="setTheme('dark')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
        <button :class="['theme-btn', { active: currentTheme === 'system' }]" title="Sistema" @click="setTheme('system')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </button>
      </div>

      <div class="card-header">
        <svg class="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <h1>Generador de Contraseñas</h1>
        <p class="subtitle">Crea contraseñas y frases seguras</p>
      </div>

      <div class="mode-tabs">
        <button :class="['tab', { active: mode === 'password' }]" @click="switchMode('password')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Contraseña
        </button>
        <button :class="['tab', { active: mode === 'passphrase' }]" @click="switchMode('passphrase')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <line x1="8" y1="7" x2="16" y2="7" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
          Passphrase
        </button>
      </div>

      <div class="password-display">
        <div class="password-field">
          <input
            :value="output"
            type="text"
            readonly
            class="password-input"
            @click="($event.target as HTMLInputElement).select()"
          />
          <button
            :class="['copy-btn', { copied: copied }]"
            title="Copiar al portapapeles"
            @click="copyOutput"
          >
            <svg v-if="!copied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span v-if="copied" class="copy-tooltip">Copiado!</span>
          </button>
        </div>
      </div>

      <div class="strength-bar-container">
        <div class="strength-bar-track">
          <div class="strength-bar-fill" :style="{ width: strengthPercent + '%', backgroundColor: strengthColor }"></div>
        </div>
        <div class="strength-info">
          <span class="strength-label" :style="{ color: strengthColor }">{{ strengthLabel }}</span>
          <span class="strength-bits">{{ strengthBits }} bits</span>
        </div>
      </div>

      <button class="generate-btn" @click="generate">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        {{ mode === 'password' ? 'Generar Contraseña' : 'Generar Passphrase' }}
      </button>

      <p class="shortcut-hint">Ctrl+G para generar · Ctrl+C para copiar</p>

      <div v-if="error" class="error-message">{{ error }}</div>

      <template v-if="mode === 'password'">
        <div class="options">
          <label class="option">
            <input v-model="passwordOptions.includeUppercase" type="checkbox" @change="generate" />
            <span class="checkmark"></span>
            Mayúsculas (A-Z)
          </label>
          <label class="option">
            <input v-model="passwordOptions.includeLowercase" type="checkbox" @change="generate" />
            <span class="checkmark"></span>
            Minúsculas (a-z)
          </label>
          <label class="option">
            <input v-model="passwordOptions.includeNumbers" type="checkbox" @change="generate" />
            <span class="checkmark"></span>
            Números (0-9)
          </label>
          <label class="option">
            <input v-model="passwordOptions.includeSymbols" type="checkbox" @change="generate" />
            <span class="checkmark"></span>
            Símbolos (!@#$%...)
          </label>
          <label class="option">
            <input v-model="passwordOptions.excludeAmbiguous" type="checkbox" @change="generate" />
            <span class="checkmark"></span>
            Excluir ambiguos
          </label>
        </div>

        <div class="length-control">
          <label>
            Longitud: <strong>{{ passwordOptions.length }}</strong>
          </label>
          <input
            v-model.number="passwordOptions.length"
            type="range"
            :min="4"
            :max="128"
            class="slider"
            @input="generate"
          />
          <div class="slider-labels">
            <span>4</span>
            <span>128</span>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="options">
          <div class="option-row">
            <label class="option-label">Cantidad de palabras</label>
            <div class="stepper">
              <button class="stepper-btn" @click="passphraseOptions.wordCount = Math.max(2, passphraseOptions.wordCount - 1)">-</button>
              <span class="stepper-value">{{ passphraseOptions.wordCount }}</span>
              <button class="stepper-btn" @click="passphraseOptions.wordCount = Math.min(12, passphraseOptions.wordCount + 1)">+</button>
            </div>
          </div>
          <div class="option-row">
            <label class="option-label">Separador</label>
            <div class="separator-options">
              <button
                v-for="s in ['-', ' ', '.', '_', '~', ',']" :key="s"
                :class="['sep-btn', { active: passphraseOptions.separator === s }]"
                @click="passphraseOptions.separator = s"
              >{{ s === ' ' ? '␣' : s }}</button>
            </div>
          </div>
        </div>
        <div class="options">
          <label class="option">
            <input v-model="passphraseOptions.capitalize" type="checkbox" />
            <span class="checkmark"></span>
            Capitalizar primera letra
          </label>
          <label class="option">
            <input v-model="passphraseOptions.appendNumber" type="checkbox" />
            <span class="checkmark"></span>
            Agregar número al final
          </label>
        </div>
      </template>

      <div class="history-section">
        <button class="history-toggle" @click="toggleHistory">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          Historial
          <span class="history-count">{{ history.length }}</span>
          <svg :class="['chevron', { open: historyOpen }]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <div v-if="historyOpen" class="history-list">
          <div v-if="history.length === 0" class="history-empty">
            Aún no hay contraseñas generadas
          </div>

          <div v-for="entry in history.slice(0, historyShown)" :key="entry.id" class="history-item">
            <div class="history-item-row">
              <Transition name="reveal" mode="out-in">
                <span :key="entry.id + '-' + revealedIds.has(entry.id)" class="history-password" @click="toggleReveal(entry.id)">
                  {{ revealedIds.has(entry.id) ? entry.password : maskPassword(entry.password) }}
                </span>
              </Transition>
              <div class="history-actions">
                <button class="history-btn" title="Revelar" @click="toggleReveal(entry.id)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
                <button class="history-btn" title="Copiar" @click="copyText(entry.password); showCopied()">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
                <button class="history-btn history-btn--delete" title="Eliminar" @click="removeEntry(entry.id)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="history-meta">
              <span class="history-mode">{{ entry.mode === 'password' ? 'Contraseña' : 'Passphrase' }}</span>
              <span class="history-date">{{ entry.date }}</span>
            </div>
            <div class="history-config">{{ entry.config }}</div>
          </div>

          <button v-if="history.length > historyShown" class="show-more-btn" @click="historyShown += historyPageSize">
            Mostrar más ({{ history.length - historyShown }} restantes)
          </button>

          <div v-if="history.length > 0" class="export-buttons">
            <button class="export-btn" @click="exportCSV">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Exportar CSV
            </button>
            <button class="export-btn" @click="exportJSON">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Exportar JSON
            </button>
          </div>

          <button v-if="history.length > 0" class="clear-btn" @click="clearHistory">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Limpiar historial
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.password-generator {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: 40px 20px;
  box-sizing: border-box;
}

.card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 480px;
  box-shadow: var(--card-shadow);
}

.theme-switcher {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.theme-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s;
}

.theme-btn svg {
  width: 18px;
  height: 18px;
}

.theme-btn:hover {
  border-color: var(--accent-border);
  color: var(--accent);
}

.theme-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

.card-header {
  text-align: center;
  margin-bottom: 20px;
}

.lock-icon {
  width: 40px;
  height: 40px;
  color: var(--accent);
  margin-bottom: 12px;
}

.card-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px;
  color: var(--text-h);
}

.subtitle {
  font-size: 14px;
  color: var(--text);
  margin: 0;
}

.mode-tabs {
  display: flex;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 24px;
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tab svg {
  width: 18px;
  height: 18px;
}

.tab.active {
  background: var(--accent);
  color: white;
}

.tab:not(.active):hover {
  background: var(--accent-bg);
}

.password-display {
  margin-bottom: 20px;
}

.password-field {
  display: flex;
  gap: 8px;
}

.password-input {
  flex: 1;
  padding: 14px 16px;
  border: 2px solid var(--border);
  border-radius: 10px;
  background: var(--input-bg);
  color: var(--text-h);
  font-family: var(--mono);
  font-size: 18px;
  letter-spacing: 1px;
  outline: none;
  transition: border-color 0.2s;
  cursor: pointer;
}

.password-input:focus {
  border-color: var(--accent);
}

.copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  min-width: 48px;
  border: 2px solid var(--border);
  border-radius: 10px;
  background: var(--input-bg);
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.copy-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-bg);
}

.copy-btn.copied {
  border-color: #22c55e;
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.copy-btn svg {
  width: 20px;
  height: 20px;
}

.generate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 14px 24px;
  border: none;
  border-radius: 10px;
  background: var(--accent);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 20px;
}

.generate-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.generate-btn:active {
  transform: translateY(0);
}

.generate-btn svg {
  width: 20px;
  height: 20px;
}

.error-message {
  color: #ef4444;
  font-size: 13px;
  text-align: center;
  padding: 10px 14px;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fef2f2;
  margin-bottom: 16px;
}

@media (prefers-color-scheme: dark) {
  .error-message {
    border-color: #7f1d1d;
    background: #451a1a;
  }
}

.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text);
  transition: all 0.2s;
  user-select: none;
}

.option:hover {
  border-color: var(--accent-border);
  background: var(--accent-bg);
}

.option input {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.option input:checked + .checkmark {
  background: var(--accent);
  border-color: var(--accent);
}

.option input:checked + .checkmark::after {
  content: '';
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  margin-top: -1px;
}

.length-control {
  margin-bottom: 8px;
}

.length-control label {
  display: block;
  font-size: 14px;
  color: var(--text);
  margin-bottom: 12px;
  text-align: center;
}

.length-control label strong {
  color: var(--text-h);
}

.slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--border);
  outline: none;
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  transition: transform 0.15s;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  border: none;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text);
  margin-top: 6px;
}

.option-row {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
}

.option-label {
  font-size: 13px;
  color: var(--text);
}

.stepper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stepper-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--text-h);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.stepper-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.stepper-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-h);
  min-width: 24px;
  text-align: center;
}

.separator-options {
  display: flex;
  gap: 6px;
}

.sep-btn {
  width: 34px;
  height: 34px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--text);
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.sep-btn:hover {
  border-color: var(--accent-border);
}

.sep-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

.copy-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--text-h);
  color: var(--bg);
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  white-space: nowrap;
  animation: fadeIn 0.15s ease;
  pointer-events: none;
}

.copy-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: var(--text-h);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(4px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.shortcut-hint {
  text-align: center;
  font-size: 12px;
  color: var(--text);
  margin: -12px 0 20px;
  opacity: 0.7;
}

.history-section {
  margin-top: 28px;
  border-top: 1px solid var(--border);
  padding-top: 20px;
}

.history-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.history-toggle:hover {
  border-color: var(--accent-border);
  background: var(--accent-bg);
}

.history-toggle svg {
  width: 18px;
  height: 18px;
}

.history-count {
  margin-left: auto;
  background: var(--accent-bg);
  color: var(--accent);
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.chevron {
  transition: transform 0.2s;
}

.chevron.open {
  transform: rotate(180deg);
}

.history-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-empty {
  text-align: center;
  font-size: 13px;
  color: var(--text);
  padding: 20px;
}

.history-item {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
}

.history-item-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.history-password {
  flex: 1;
  font-family: var(--mono);
  font-size: 13px;
  color: var(--text-h);
  cursor: pointer;
  letter-spacing: 0.5px;
  word-break: break-all;
  transition: color 0.15s;
}

.history-password:hover {
  color: var(--accent);
}

.history-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.history-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  transition: all 0.15s;
}

.history-btn svg {
  width: 14px;
  height: 14px;
}

.history-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.history-btn--delete:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.history-meta {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  font-size: 11px;
}

.history-mode {
  color: var(--accent);
  font-weight: 500;
}

.history-date {
  color: var(--text);
}

.history-config {
  font-size: 11px;
  color: var(--text);
  margin-top: 2px;
  opacity: 0.8;
  font-family: var(--mono);
}

.show-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px;
  border: 1px dashed var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--accent);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.show-more-btn:hover {
  background: var(--accent-bg);
  border-color: var(--accent-border);
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: #ef4444;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 4px;
}

.clear-btn svg {
  width: 14px;
  height: 14px;
}

.clear-btn:hover {
  background: #fef2f2;
  border-color: #fecaca;
}

@media (prefers-color-scheme: dark) {
  .clear-btn:hover {
    background: #451a1a;
    border-color: #7f1d1d;
  }
}

.reveal-enter-active,
.reveal-leave-active {
  transition: all 0.2s ease;
}

.reveal-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

.reveal-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

.strength-bar-container {
  margin-bottom: 16px;
}

.strength-bar-track {
  height: 6px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
}

.strength-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.strength-info {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 12px;
}

.strength-label {
  font-weight: 600;
  transition: color 0.3s ease;
}

.strength-bits {
  opacity: 0.6;
  color: var(--text);
}

.export-buttons {
  display: flex;
  gap: 8px;
  margin: 8px 0;
}

.export-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.export-btn svg {
  width: 14px;
  height: 14px;
}

.export-btn:hover {
  border-color: var(--accent-border);
  background: var(--accent-bg);
  color: var(--accent);
}
</style>
