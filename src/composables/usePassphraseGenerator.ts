import { words } from '../data/words'

export interface PassphraseOptions {
  wordCount: number
  separator: string
  capitalize: boolean
  appendNumber: boolean
}

function getRandomIndex(max: number): number {
  const buffer = new Uint8Array(1)
  crypto.getRandomValues(buffer)
  return buffer[0] % max
}

export function usePassphraseGenerator() {
  function generatePassphrase(options: PassphraseOptions): string {
    const selected: string[] = []
    const used = new Set<number>()

    for (let i = 0; i < options.wordCount; i++) {
      let index: number
      do {
        index = getRandomIndex(words.length)
      } while (used.has(index))
      used.add(index)

      let word = words[index]
      if (options.capitalize) {
        word = word.charAt(0).toUpperCase() + word.slice(1)
      }
      selected.push(word)
    }

    let passphrase = selected.join(options.separator)

    if (options.appendNumber) {
      const numBuffer = new Uint8Array(2)
      crypto.getRandomValues(numBuffer)
      const num = 10 + (numBuffer[0] + numBuffer[1]) % 90
      passphrase += options.separator + num
    }

    return passphrase
  }

  return { generatePassphrase }
}
