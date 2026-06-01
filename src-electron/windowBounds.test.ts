import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import path from 'path'
import fs from 'fs'
import os from 'os'

const testDir = path.join(os.tmpdir(), 'cyberowl-wb-test-' + Date.now())
const settingsFile = path.join(testDir, 'CyberOwlProfile', 'settings.json')

vi.mock('electron', () => ({
  app: {
    getPath: () => testDir
  }
}))

vi.mock('app/lib/utils/atomicFile', () => ({
  writeFileAtomicWithBackup: vi.fn(async (opts: { targetPath: string; data: string }) => {
    fs.writeFileSync(opts.targetPath, opts.data, 'utf-8')
  })
}))

import { getSavedWindowBounds, persistWindowBounds } from './windowBounds'

const createDir = () => fs.mkdirSync(path.join(testDir, 'CyberOwlProfile'), { recursive: true })
const removeDir = () => fs.rmSync(testDir, { recursive: true, force: true })

describe('getSavedWindowBounds', () => {
  beforeEach(() => createDir())
  afterEach(() => removeDir())

  it('returns defaults when settings file does not exist', () => {
    const result = getSavedWindowBounds()
    expect(result.bounds.width).toBe(1400)
    expect(result.bounds.height).toBe(660)
    expect(result.maximized).toBe(false)
  })

  it('returns defaults when settings file has no window field', () => {
    fs.writeFileSync(settingsFile, JSON.stringify({ system: {} }), 'utf-8')
    const result = getSavedWindowBounds()
    expect(result.bounds.width).toBe(1400)
    expect(result.bounds.height).toBe(660)
  })

  it('returns saved bounds', () => {
    fs.writeFileSync(settingsFile, JSON.stringify({
      window: { x: 100, y: 200, width: 1920, height: 1080, maximized: true }
    }), 'utf-8')
    const result = getSavedWindowBounds()
    expect(result.bounds).toEqual({ x: 100, y: 200, width: 1920, height: 1080 })
    expect(result.maximized).toBe(true)
  })

  it('returns saved bounds without x/y', () => {
    fs.writeFileSync(settingsFile, JSON.stringify({
      window: { width: 800, height: 600, maximized: false }
    }), 'utf-8')
    const result = getSavedWindowBounds()
    expect(result.bounds.width).toBe(800)
    expect(result.bounds.height).toBe(600)
    expect(result.bounds.x).toBeUndefined()
    expect(result.bounds.y).toBeUndefined()
    expect(result.maximized).toBe(false)
  })

  it('handles corrupted JSON gracefully', () => {
    fs.writeFileSync(settingsFile, '{invalid json}', 'utf-8')
    const result = getSavedWindowBounds()
    expect(result.bounds.width).toBe(1400)
    expect(result.bounds.height).toBe(660)
  })

  it('handles missing width/height in window data', () => {
    fs.writeFileSync(settingsFile, JSON.stringify({
      window: { x: 0, y: 0 }
    }), 'utf-8')
    const result = getSavedWindowBounds()
    expect(result.bounds.width).toBe(1400)
    expect(result.bounds.height).toBe(660)
  })
})

describe('persistWindowBounds', () => {
  beforeEach(() => createDir())
  afterEach(() => removeDir())

  it('saves bounds when window is not maximized', async () => {
    fs.writeFileSync(settingsFile, JSON.stringify({ window: { width: 1400, height: 660, maximized: false } }), 'utf-8')

    await persistWindowBounds(
      { width: 1400, height: 660 },
      () => false,
      () => ({ x: 50, y: 60, width: 800, height: 600 })
    )

    const data = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'))
    expect(data.window).toEqual({ x: 50, y: 60, width: 800, height: 600, maximized: false })
  })

  it('saves restoredBounds when window is maximized', async () => {
    fs.writeFileSync(settingsFile, JSON.stringify({ window: { width: 1400, height: 660, maximized: false } }), 'utf-8')

    await persistWindowBounds(
      { x: 10, y: 20, width: 1400, height: 660 },
      () => true,
      () => ({ x: -1, y: -1, width: 9999, height: 9999 })
    )

    const data = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'))
    expect(data.window).toEqual({ x: 10, y: 20, width: 1400, height: 660, maximized: true })
  })

  it('handles missing settings file gracefully', async () => {
    await expect(
      persistWindowBounds(
        { width: 1400, height: 660 },
        () => false,
        () => ({ width: 800, height: 600 })
      )
    ).resolves.toBeUndefined()
  })

  it('handles corrupted settings file gracefully', async () => {
    fs.writeFileSync(settingsFile, '{invalid}', 'utf-8')
    await expect(
      persistWindowBounds(
        { width: 1400, height: 660 },
        () => false,
        () => ({ width: 800, height: 600 })
      )
    ).resolves.toBeUndefined()
  })
})
