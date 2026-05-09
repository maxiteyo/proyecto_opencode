<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePasswordGenerator } from '../composables/usePasswordGenerator'
import { usePassphraseGenerator } from '../composables/usePassphraseGenerator'
import type { PasswordOptions } from '../types/password'
import type { PassphraseOptions } from '../composables/usePassphraseGenerator'

const { generatePassword } = usePasswordGenerator()
const { generatePassphrase } = usePassphraseGenerator()

type Mode = 'password' | 'passphrase'

const PWD_STORAGE_KEY = 'password-gen-options'
const PHRASE_STORAGE_KEY = 'passphrase-gen-options'
const MODE_STORAGE_KEY = 'password-gen-mode'

const mode = ref<Mode>(loadMode())
const output = ref('')
const error = ref('')

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

function generate() {
  if (!validate()) return
  if (mode.value === 'password') {
    output.value = generatePassword(passwordOptions.value)
    savePasswordOptions()
  } else {
    output.value = generatePassphrase(passphraseOptions.value)
    savePassphraseOptions()
  }
}

function switchMode(newMode: Mode) {
  mode.value = newMode
  try { localStorage.setItem(MODE_STORAGE_KEY, newMode) } catch { /* ignore */ }
  generate()
}

async function copyOutput() {
  try {
    await navigator.clipboard.writeText(output.value)
  } catch {
    const el = document.createElement('textarea')
    el.value = output.value
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }
}

watch(passphraseOptions, generate, { deep: true })

generate()
</script>

<template>
  <div class="password-generator">
    <div class="card">
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
            class="copy-btn"
            title="Copiar al portapapeles"
            @click="copyOutput"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </div>
      </div>

      <button class="generate-btn" @click="generate">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        {{ mode === 'password' ? 'Generar Contraseña' : 'Generar Passphrase' }}
      </button>

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
    </div>
  </div>
</template>

<style scoped>
.password-generator {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
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
}

.copy-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-bg);
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
</style>
