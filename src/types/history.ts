export interface HistoryEntry {
  id: string
  password: string
  mode: 'password' | 'passphrase'
  config: string
  date: string
}
