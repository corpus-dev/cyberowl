const SI_MULTIPLIERS: Record<string, number> = {
  '': 1,
  k: 1000,
  m: 1000 ** 2,
  g: 1000 ** 3,
  t: 1000 ** 4,
  p: 1000 ** 5,
  e: 1000 ** 6
}

// eslint-disable-next-line no-control-regex
const ANSI_ESCAPE_PATTERN = /\u001b\[[0-9;]*m/g

function normalizeUnitPrefix (rawUnit: string): string {
  const normalized = rawUnit.toLocaleLowerCase()
  if (normalized === '' || normalized === 'b' || normalized === 'bit') {
    return ''
  }

  const prefix = normalized[0] ?? ''
  return prefix in SI_MULTIPLIERS ? prefix : ''
}

function isBitUnit (rawUnit: string): boolean {
  const normalized = rawUnit.toLocaleLowerCase()
  if (normalized === '') {
    return false
  }

  return normalized.includes('bit')
}

type Locale = 'en-US' | 'ua-UA' | 'de-DE'

const BYTE_BASE_UNIT: Record<Locale, string> = {
  'en-US': 'B',
  'ua-UA': '\u0411',
  'de-DE': 'B'
}

const BYTE_UNITS: Record<Locale, string[]> = {
  'en-US': ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
  'ua-UA': ['\u043a\u0411', '\u041c\u0411', '\u0413\u0411', '\u0422\u0411', '\u041f\u0411', '\u0415\u0411', '\u0417\u0411', '\u0419\u0411'],
  'de-DE': ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
}

const BIT_BASE_UNIT: Record<Locale, string> = {
  'en-US': 'b/s',
  'ua-UA': '\u0431/\u0441',
  'de-DE': 'bit/s'
}

const BIT_UNITS: Record<Locale, string[]> = {
  'en-US': ['kb/s', 'Mb/s', 'Gb/s', 'Tb/s', 'Pb/s', 'Eb/s', 'Zb/s', 'Yb/s'],
  'ua-UA': ['\u043a\u0431/\u0441', '\u041c\u0431/\u0441', '\u0413\u0431/\u0441', '\u0422\u0431/\u0441', '\u041f\u0431/\u0441', '\u0415\u0431/\u0441', '\u0417\u0431/\u0441', '\u0419\u0431/\u0441'],
  'de-DE': ['kbit/s', 'Mbit/s', 'Gbit/s', 'Tbit/s', 'Pbit/s', 'Ebit/s', 'Zbit/s', 'Ybit/s']
}

export function humanBytesString (bytes: number, dp = 1, locale: Locale = 'en-US'): string {
  const thresh = 1000

  if (Math.abs(bytes) < thresh) {
    return bytes + ' ' + BYTE_BASE_UNIT[locale]
  }

  const units = BYTE_UNITS[locale]
  let u = -1
  const r = 10 ** dp

  do {
    bytes /= thresh
    ++u
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  )

  return bytes.toFixed(dp) + ' ' + units[u]
}

export function humanBitsString (bits: number, dp = 1, locale: Locale = 'en-US'): string {
  const thresh = 1000

  if (Math.abs(bits) < thresh) {
    return bits + ' ' + BIT_BASE_UNIT[locale]
  }

  const units = BIT_UNITS[locale]
  let u = -1
  const r = 10 ** dp

  do {
    bits /= thresh
    ++u
  } while (
    Math.round(Math.abs(bits) * r) / r >= thresh &&
    u < units.length - 1
  )

  return bits.toFixed(dp) + ' ' + units[u]
}

export function isSameDay (ts1: number, ts2: number): boolean {
  const d1 = new Date(ts1)
  const d2 = new Date(ts2)
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
}

export function formatUptime (startTime: number): string {
  const diff = Math.max(0, Date.now() - startTime)
  const totalSeconds = Math.floor(diff / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function convertTrafficValueToBytes (value: string, asBitrate = false): number {
  const normalizedValue = value
    .replace(ANSI_ESCAPE_PATTERN, '')
    .replace(',', '.')
    .trim()
    .toLocaleLowerCase()

  const match = normalizedValue.match(/([0-9]+(?:\.[0-9]+)?)\s*([kmgtpe]?)(?:i)?(bit|b|byte|bytes)?(?:\/s|ps)?/)
  if (!match) {
    return 0
  }

  const numericPart = Number(match[1])
  if (!Number.isFinite(numericPart)) {
    return 0
  }

  const unitPrefix = normalizeUnitPrefix(match[2] ?? '')
  const unitSuffix = match[3] ?? ''
  const multiplier = SI_MULTIPLIERS[unitPrefix] ?? 1

  if (isBitUnit(unitSuffix)) {
    return numericPart * multiplier / 8
  }

  if (asBitrate && unitSuffix === 'b') {
    return numericPart * multiplier / 8
  }

  return numericPart * multiplier
}
