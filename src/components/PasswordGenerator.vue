<script setup lang="ts">
import { ref } from 'vue'
import { usePasswordGenerator } from '../composables/usePasswordGenerator'
import type { PasswordOptions } from '../types/password'

const { generatePassword } = usePasswordGenerator()

const STORAGE_KEY = 'password-generator-options'

const password = ref('P@ssw0rd!')
const error = ref('')

const options = ref<PasswordOptions>(loadOptions())

function loadOptions(): PasswordOptions {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...defaultOptions(), ...JSON.parse(stored) }
  } catch { /* ignore */ }
  return defaultOptions()
}

function defaultOptions(): PasswordOptions {
  return {
    length: 20,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: false,
  }
}

function saveOptions() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(options.value))
  } catch { /* ignore */ }
}

function activeSetsCount(): number {
  let count = 0
  if (options.value.includeUppercase) count++
  if (options.value.includeLowercase) count++
  if (options.value.includeNumbers) count++
  if (options.value.includeSymbols) count++
  return count
}

function validate(): boolean {
  if (activeSetsCount() === 0) {
    error.value = 'Selecciona al menos un tipo de carácter'
    return false
  }
  if (options.value.length < activeSetsCount()) {
    error.value = `La longitud mínima es ${activeSetsCount()} para los tipos seleccionados`
    return false
  }
  error.value = ''
  return true
}

function generate() {
  if (!validate()) return
  password.value = generatePassword(options.value)
  saveOptions()
}

async function copyPassword() {
  try {
    await navigator.clipboard.writeText(password.value)
  } catch {
    const el = document.createElement('textarea')
    el.value = password.value
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }
}

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
        <p class="subtitle">Crea contraseñas seguras y aleatorias</p>
      </div>

      <div class="password-display">
        <div class="password-field">
          <input
            :value="password"
            type="text"
            readonly
            class="password-input"
            @click="($event.target as HTMLInputElement).select()"
          />
          <button
            class="copy-btn"
            title="Copiar al portapapeles"
            @click="copyPassword"
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
        Generar Nueva Contraseña
      </button>

      <div v-if="error" class="error-message">{{ error }}</div>

      <div class="options">
        <label class="option">
          <input v-model="options.includeUppercase" type="checkbox" @change="generate" />
          <span class="checkmark"></span>
          Mayúsculas (A-Z)
        </label>
        <label class="option">
          <input v-model="options.includeLowercase" type="checkbox" @change="generate" />
          <span class="checkmark"></span>
          Minúsculas (a-z)
        </label>
        <label class="option">
          <input v-model="options.includeNumbers" type="checkbox" @change="generate" />
          <span class="checkmark"></span>
          Números (0-9)
        </label>
        <label class="option">
          <input v-model="options.includeSymbols" type="checkbox" @change="generate" />
          <span class="checkmark"></span>
          Símbolos (!@#$%...)
        </label>
        <label class="option">
          <input v-model="options.excludeAmbiguous" type="checkbox" @change="generate" />
          <span class="checkmark"></span>
          Excluir ambiguos (0/O, 1/l/I)
        </label>
      </div>

      <div class="length-control">
        <label>
          Longitud:         <strong>{{ options.length }}</strong>
        </label>
        <input
          v-model.number="options.length"
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
  margin-bottom: 32px;
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
  margin-bottom: 28px;
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

.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
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
</style>
