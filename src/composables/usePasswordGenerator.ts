import type { PasswordOptions } from '../types/password'

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`'
const AMBIGUOUS = '0O1lI'

function shuffleArray(array: Uint8Array): Uint8Array {
  const a = new Uint8Array(array)
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getRandomIndex(max: number): number {
  const buffer = new Uint8Array(1)
  crypto.getRandomValues(buffer)
  return buffer[0] % max
}

function pickRandomChar(chars: string): string {
  return chars[getRandomIndex(chars.length)]
}

export function usePasswordGenerator() {
  function generatePassword(options: PasswordOptions): string {
    const activeSets: string[] = []

    if (options.includeUppercase) activeSets.push(UPPERCASE)
    if (options.includeLowercase) activeSets.push(LOWERCASE)
    if (options.includeNumbers) activeSets.push(NUMBERS)
    if (options.includeSymbols) activeSets.push(SYMBOLS)

    if (activeSets.length === 0) return ''

    let pool = activeSets.join('')

    if (options.excludeAmbiguous) {
      for (const ch of AMBIGUOUS) {
        pool = pool.replace(ch, '')
      }
    }

    const guaranteed: string[] = activeSets.map((set) => {
      let chars = set
      if (options.excludeAmbiguous) {
        for (const ch of AMBIGUOUS) {
          chars = chars.replace(ch, '')
        }
      }
      return pickRandomChar(chars)
    })

    const remaining = options.length - guaranteed.length
    const randomBytes = new Uint8Array(remaining)
    crypto.getRandomValues(randomBytes)

    for (let i = 0; i < remaining; i++) {
      guaranteed.push(pool[randomBytes[i] % pool.length])
    }

    const shuffled = shuffleArray(new Uint8Array(guaranteed.map((c) => c.charCodeAt(0))))

    return Array.from(shuffled, (b) => String.fromCharCode(b)).join('')
  }

  return { generatePassword }
}
