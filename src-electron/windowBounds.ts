import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import { writeFileAtomicWithBackup } from 'app/lib/utils/atomicFile'

export interface WindowBounds {
  x?: number
  y?: number
  width: number
  height: number
}

export interface SavedWindowState {
  bounds: WindowBounds
  maximized: boolean
}

function getSettingsFilePath () {
  return path.join(app.getPath('appData'), 'CyberOwlProfile', 'settings.json')
}

export function getSavedWindowBounds (): SavedWindowState {
  const settingsFile = getSettingsFilePath()
  try {
    const data = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'))
    if (data.window && typeof data.window.width === 'number' && typeof data.window.height === 'number') {
      const bounds: WindowBounds = {
        width: data.window.width,
        height: data.window.height
      }
      if (typeof data.window.x === 'number') bounds.x = data.window.x
      if (typeof data.window.y === 'number') bounds.y = data.window.y
      return { bounds, maximized: !!data.window.maximized }
    }
  } catch {}
  return { bounds: { width: 1400, height: 660 }, maximized: false }
}

export async function persistWindowBounds (
  restoredBounds: WindowBounds,
  getCurrentMaximized: () => boolean,
  getCurrentBounds: () => { x?: number; y?: number; width: number; height: number }
): Promise<void> {
  const maximized = getCurrentMaximized()
  const bounds = maximized ? restoredBounds : getCurrentBounds()
  const settingsFile = getSettingsFilePath()
  try {
    const data = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'))
    data.window = { ...bounds, maximized }
    await writeFileAtomicWithBackup({
      targetPath: settingsFile,
      tempPath: settingsFile + '.tmp',
      backupPath: settingsFile + '.bak',
      data: JSON.stringify(data)
    })
  } catch {}
}
