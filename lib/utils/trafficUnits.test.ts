import { describe, it, expect } from 'vitest'
import {
  humanBytesString,
  humanBitsString,
  isSameDay,
  formatUptime,
  convertTrafficValueToBytes
} from './trafficUnits'

describe('humanBytesString', () => {
  it('formats bytes below threshold with base unit', () => {
    expect(humanBytesString(0)).toBe('0 B')
    expect(humanBytesString(500)).toBe('500 B')
    expect(humanBytesString(999)).toBe('999 B')
  })

  it('formats kB', () => {
    expect(humanBytesString(1000)).toBe('1.0 kB')
    expect(humanBytesString(1500)).toBe('1.5 kB')
    expect(humanBytesString(102400)).toBe('102.4 kB')
  })

  it('formats MB', () => {
    expect(humanBytesString(1048576)).toBe('1.0 MB')
    expect(humanBytesString(5242880)).toBe('5.2 MB')
    expect(humanBytesString(134959000)).toBe('135.0 MB')
  })

  it('formats GB', () => {
    expect(humanBytesString(1073741824)).toBe('1.1 GB')
    expect(humanBytesString(5368709120)).toBe('5.4 GB')
  })

  it('formats TB', () => {
    expect(humanBytesString(1099511627776)).toBe('1.1 TB')
  })

  it('respects decimal places parameter', () => {
    expect(humanBytesString(1536, 0)).toBe('2 kB')
    expect(humanBytesString(1536, 2)).toBe('1.54 kB')
    expect(humanBytesString(1536, 3)).toBe('1.536 kB')
  })

  it('handles zero and negative values', () => {
    expect(humanBytesString(-500)).toBe('-500 B')
    expect(humanBytesString(-1500)).toBe('-1.5 kB')
  })

  it('localizes to ua-UA', () => {
    expect(humanBytesString(500, 1, 'ua-UA')).toBe('500 \u0411')
    expect(humanBytesString(1500, 1, 'ua-UA')).toBe('1.5 \u043a\u0411')
    expect(humanBytesString(1048576, 1, 'ua-UA')).toBe('1.0 \u041c\u0411')
  })

  it('localizes to de-DE', () => {
    expect(humanBytesString(500, 1, 'de-DE')).toBe('500 B')
    expect(humanBytesString(1500, 1, 'de-DE')).toBe('1.5 kB')
    expect(humanBytesString(1048576, 1, 'de-DE')).toBe('1.0 MB')
  })

  it('defaults to en-US', () => {
    expect(humanBytesString(500)).toBe('500 B')
  })
})

describe('humanBitsString', () => {
  it('formats bits below threshold with base unit', () => {
    expect(humanBitsString(0)).toBe('0 b/s')
    expect(humanBitsString(500)).toBe('500 b/s')
    expect(humanBitsString(999)).toBe('999 b/s')
  })

  it('formats kb/s', () => {
    expect(humanBitsString(1000)).toBe('1.0 kb/s')
    expect(humanBitsString(1500)).toBe('1.5 kb/s')
    expect(humanBitsString(102400)).toBe('102.4 kb/s')
  })

  it('formats Mb/s', () => {
    expect(humanBitsString(1048576)).toBe('1.0 Mb/s')
    expect(humanBitsString(5242880)).toBe('5.2 Mb/s')
    expect(humanBitsString(236371000)).toBe('236.4 Mb/s')
  })

  it('formats Gb/s', () => {
    expect(humanBitsString(1073741824)).toBe('1.1 Gb/s')
  })

  it('localizes to ua-UA', () => {
    expect(humanBitsString(500, 1, 'ua-UA')).toBe('500 \u0431/\u0441')
    expect(humanBitsString(1500, 1, 'ua-UA')).toBe('1.5 \u043a\u0431/\u0441')
    expect(humanBitsString(1048576, 1, 'ua-UA')).toBe('1.0 \u041c\u0431/\u0441')
  })

  it('localizes to de-DE', () => {
    expect(humanBitsString(500, 1, 'de-DE')).toBe('500 bit/s')
    expect(humanBitsString(1500, 1, 'de-DE')).toBe('1.5 kbit/s')
    expect(humanBitsString(1048576, 1, 'de-DE')).toBe('1.0 Mbit/s')
  })
})

describe('isSameDay', () => {
  it('returns true for same day timestamps', () => {
    const ts1 = new Date('2024-01-15T10:00:00').getTime()
    const ts2 = new Date('2024-01-15T22:30:00').getTime()
    expect(isSameDay(ts1, ts2)).toBe(true)
  })

  it('returns false for different days', () => {
    const ts1 = new Date('2024-01-15T23:59:59').getTime()
    const ts2 = new Date('2024-01-16T00:00:00').getTime()
    expect(isSameDay(ts1, ts2)).toBe(false)
  })

  it('returns false for different months', () => {
    const ts1 = new Date('2024-01-31T10:00:00').getTime()
    const ts2 = new Date('2024-02-01T10:00:00').getTime()
    expect(isSameDay(ts1, ts2)).toBe(false)
  })

  it('returns false for different years', () => {
    const ts1 = new Date('2023-12-31T10:00:00').getTime()
    const ts2 = new Date('2024-01-01T10:00:00').getTime()
    expect(isSameDay(ts1, ts2)).toBe(false)
  })
})

describe('formatUptime', () => {
  it('formats zero as 00:00:00', () => {
    expect(formatUptime(Date.now())).toBe('00:00:00')
  })

  it('formats seconds', () => {
    const start = Date.now() - 5000
    expect(formatUptime(start)).toBe('00:00:05')
  })

  it('formats minutes and hours', () => {
    const start = Date.now() - 3661000
    expect(formatUptime(start)).toBe('01:01:01')
  })
})

describe('convertTrafficValueToBytes', () => {
  it('parses plain bytes', () => {
    expect(convertTrafficValueToBytes('500')).toBe(500)
    expect(convertTrafficValueToBytes('1024')).toBe(1024)
  })

  it('parses kB', () => {
    expect(convertTrafficValueToBytes('1kB')).toBe(1000)
    expect(convertTrafficValueToBytes('2.5kB')).toBe(2500)
  })

  it('parses MB', () => {
    expect(convertTrafficValueToBytes('1MB')).toBe(1000000)
    expect(convertTrafficValueToBytes('1.5MB')).toBe(1500000)
  })

  it('parses GB', () => {
    expect(convertTrafficValueToBytes('1GB')).toBe(1000000000)
  })

  it('parses bit units by dividing by 8', () => {
    expect(convertTrafficValueToBytes('1Mbit')).toBe(125000)
    expect(convertTrafficValueToBytes('8Mbit')).toBe(1000000)
  })

  it('parses with asBitrate flag for bare b suffix', () => {
    expect(convertTrafficValueToBytes('1Mb', false)).toBe(1000000)
    expect(convertTrafficValueToBytes('1Mb', true)).toBe(125000)
  })

  it('parses with /s suffix', () => {
    expect(convertTrafficValueToBytes('1MB/s')).toBe(1000000)
    expect(convertTrafficValueToBytes('1Mbit/s')).toBe(125000)
  })

  it('parses with ps suffix', () => {
    expect(convertTrafficValueToBytes('1MBps')).toBe(1000000)
  })

  it('parses Kib (kibibytes) as kB', () => {
    expect(convertTrafficValueToBytes('1KiB')).toBe(1000)
    expect(convertTrafficValueToBytes('1MiB')).toBe(1000000)
  })

  it('handles ANSI escape sequences', () => {
    expect(convertTrafficValueToBytes('\u001b[32m1MB\u001b[0m')).toBe(1000000)
  })

  it('handles comma as decimal separator', () => {
    expect(convertTrafficValueToBytes('1,5MB')).toBe(1500000)
  })

  it('returns 0 for unparseable input', () => {
    expect(convertTrafficValueToBytes('')).toBe(0)
    expect(convertTrafficValueToBytes('foobar')).toBe(0)
  })

  it('parses MHDDOS format with bitrate flag', () => {
    expect(convertTrafficValueToBytes('46.7 Mbit/s', true)).toBe(5837500)
  })

  it('parses Distress bps field with bitrate flag', () => {
    expect(convertTrafficValueToBytes('236.371Mb', true)).toBe(29546375)
  })
})
