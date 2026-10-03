const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
const NUMBERS = "0123456789"
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>/?~"

export const MIN_LENGTH = 4
export const MAX_LENGTH = 128
export const DEFAULT_LENGTH = 32

export function buildCharset(numbers: boolean, symbols: boolean): string {
  return LETTERS + (numbers ? NUMBERS : "") + (symbols ? SYMBOLS : "")
}

export function clampLength(value: number): number {
  return Math.min(
    MAX_LENGTH,
    Math.max(MIN_LENGTH, Math.floor(value) || MIN_LENGTH)
  )
}

export function makeSecret(length: number, charset: string): string {
  const charsetLen = charset.length
  // Reject bytes in the final incomplete block so every character is uniform.
  const maxByte = 256 - (256 % charsetLen)
  const buf = new Uint8Array(128)
  let out = ""
  while (out.length < length) {
    crypto.getRandomValues(buf)
    for (let i = 0; i < buf.length && out.length < length; i++) {
      if (buf[i] < maxByte) out += charset[buf[i] % charsetLen]
    }
  }
  return out
}
