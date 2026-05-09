import { ref } from 'vue'
import type { HistoryEntry } from '../types/history'

const HISTORY_KEY = 'password-gen-history'
const MAX_ENTRIES = 50

const history = ref<HistoryEntry[]>(loadHistory())

function loadHistory(): HistoryEntry[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveHistory() {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
  } catch { /* ignore */ }
}

export function usePasswordHistory() {
  function addEntry(password: string, mode: 'password' | 'passphrase', config: string) {
    const entry: HistoryEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      password,
      mode,
      config,
      date: new Date().toLocaleString(),
    }
    history.value.unshift(entry)
    if (history.value.length > MAX_ENTRIES) {
      history.value = history.value.slice(0, MAX_ENTRIES)
    }
    saveHistory()
  }

  function clearHistory() {
    history.value = []
    saveHistory()
  }

  function removeEntry(id: string) {
    history.value = history.value.filter((e) => e.id !== id)
    saveHistory()
  }

  return { history, addEntry, clearHistory, removeEntry }
}
