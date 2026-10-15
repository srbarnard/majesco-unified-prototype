/** Sentence-case helper from Joan's claim-refresh-ui.js. */
const KEEP = new Set(['Copilot', 'Medicare', 'Medicaid', 'Majesco', 'CMS', 'ISO', 'AI', 'FNOL', 'UM', 'UIM', 'P&C', 'Suite', 'PDF'])

export function sc(value: string): string {
  const s = String(value ?? '')
  if (!/[A-Z][a-z]/.test(s.slice(1))) return s
  let first = true
  return s.replace(/[A-Za-z][A-Za-z'’&/-]*/g, (word, offset: number) => {
    const isFirst = first
    first = false
    if (isFirst || s.slice(Math.max(0, offset - 3), offset) === ' - ') return word
    if (KEEP.has(word)) return word
    if (word.length > 1 && word === word.toUpperCase()) return word
    if (/^[A-Z][a-z]/.test(word) && word.includes('/')) {
      return word
        .split('/')
        .map((part, index) => (index ? part.charAt(0).toLowerCase() + part.slice(1) : part))
        .join('/')
    }
    return /^[A-Z][a-z]/.test(word) ? word.charAt(0).toLowerCase() + word.slice(1) : word
  })
}
