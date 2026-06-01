import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import path from 'path'
import fs from 'fs'
import os from 'os'

const mockAppDataPath = vi.hoisted(() => ({ current: '' }))

vi.mock('electron', () => ({
  app: {
    getPath: () => mockAppDataPath.current,
    getVersion: () => '1.0.0',
    setLoginItemSettings: vi.fn(),
    quit: vi.fn(),
    relaunch: vi.fn()
  },
  ipcMain: {
    handle: vi.fn()
  },
  EventEmitter: class {
    on () { return this }
    emit () { return false }
  }
}))

import { Settings } from './settings'

function createTestDir (): string {
  return path.join(os.tmpdir(), 'cyberowl-test-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8))
}

describe('Settings window bounds', () => {
  let testDir: string

  beforeEach(async () => {
    testDir = createTestDir()
    mockAppDataPath.current = testDir
    await fs.promises.mkdir(testDir, { recursive: true })
  })

  afterEach(async () => {
    mockAppDataPath.current = ''
    await fs.promises.rm(testDir, { recursive: true, force: true })
  })

  it('creates default data with window bounds', async () => {
    const settings = new Settings()
    const data = await settings.getData()
    expect(data.window).toBeDefined()
    expect(data.window.width).toBe(1400)
    expect(data.window.height).toBe(660)
    expect(data.window.x).toBeUndefined()
    expect(data.window.y).toBeUndefined()
    expect(data.window.maximized).toBe(false)
  })

  it('saves and retrieves window bounds', async () => {
    const settings = new Settings()
    const bounds = { x: 100, y: 200, width: 1920, height: 1080, maximized: true }
    await settings.setWindowBounds(bounds)

    const savedData = JSON.parse(
      fs.readFileSync(Settings.settingsFile, 'utf-8')
    )
    expect(savedData.window).toEqual(bounds)
  })

  it('persists bounds across Settings instances', async () => {
    const s1 = new Settings()
    await s1.setWindowBounds({ x: 50, y: 60, width: 800, height: 600, maximized: false })

    const s2 = new Settings()
    const data = await s2.getData()
    expect(data.window).toEqual({ x: 50, y: 60, width: 800, height: 600, maximized: false })
  })

  it('updates only x/y when partial bounds are set', async () => {
    const settings = new Settings()
    await settings.setWindowBounds({ x: 10, y: 20, width: 1400, height: 660, maximized: false })
    const data = await settings.getData()
    expect(data.window.x).toBe(10)
    expect(data.window.y).toBe(20)
    expect(data.window.width).toBe(1400)
    expect(data.window.height).toBe(660)
  })

  it('handles maximized state correctly', async () => {
    const settings = new Settings()
    await settings.setWindowBounds({ x: 0, y: 0, width: 1400, height: 660, maximized: true })
    const data = await settings.getData()
    expect(data.window.maximized).toBe(true)
  })
})

describe('Settings backward compatibility', () => {
  let testDir: string

  beforeEach(async () => {
    testDir = createTestDir()
    mockAppDataPath.current = testDir
    await fs.promises.mkdir(testDir, { recursive: true })
  })

  afterEach(async () => {
    mockAppDataPath.current = ''
    await fs.promises.rm(testDir, { recursive: true, force: true })
  })

  it('adds window field when loading legacy settings without it', async () => {
    const legacyData = {
      system: { autoUpdate: true, hideInTray: false, startOnBoot: false, language: 'en-US' },
      corpus: { uuid: '', apiKey: '' },
      bootstrap: { step: 'LANGUAGE', selectedModulesConfig: 'NONE' },
      gui: { theme: 'light', mode: 'default', unlockedModes: [], lastSeenAppVersion: '1.0.0' },
      schedule: { enabled: false, startTime: '07:30', endTime: '17:30', activity: 'DO_NOTHING', modules: ['DISTRESS'], intervals: [] },
      modules: { dataPath: path.join(mockAppDataPath.current, 'modules') },
      execution: {}
    }
    fs.writeFileSync(Settings.settingsFile, JSON.stringify(legacyData))

    const settings = new Settings()
    const data = await settings.getData()
    expect(data.window).toBeDefined()
    expect(data.window.width).toBe(1400)
    expect(data.window.height).toBe(660)
  })
})
