import { autoUpdater } from 'electron-updater'
import fs from 'fs'
import path from 'path'
import { Settings } from './settings'
import { ExecutionEngine } from './engine'
import { electronNetFetch } from '../../lib/utils/electronNet'
import { writeStabilityLog } from '../../lib/utils/stabilityLog'

export function handleUpdater (settings: Settings, executionEngine: ExecutionEngine) {
  autoUpdater.allowPrerelease = false

  const updateFunction = async () => {
    try {
      const settingsData = await settings.getData()
      if (settingsData.system.autoUpdate) {
        console.log('Checking for updates...')
        await autoUpdater.checkForUpdates()
      }
    } catch (err) {
      console.warn('Auto-update check failed', err)
    }
  }

  void updateFunction()
  setInterval(updateFunction, 1000 * 60 * 30) // 30 minutes

  autoUpdater.on('update-downloaded', async (event) => {
    console.log('Downloaded update file: ' + event.downloadedFile)

    try {
      const fileStats = await fs.promises.stat(event.downloadedFile)
      const appUpdateConfigPath = path.join(process.resourcesPath!, 'app-update.yml')
      if (fs.existsSync(appUpdateConfigPath)) {
        const yamlContent = await fs.promises.readFile(appUpdateConfigPath, 'utf-8')
        const versionMatch = yamlContent.match(/version:\s*(.+)$/m)
        if (versionMatch) {
          const currentVersion = versionMatch[1].trim()
          const githubApiUrl = `https://api.github.com/repos/corpus-dev/cyberowl/releases/tags/${currentVersion}`
          const releaseResponse = await electronNetFetch(githubApiUrl)
          if (releaseResponse.status === 200) {
            const releaseData = await releaseResponse.json() as { assets: Array<{ name: string, size: number }> }
            const asset = releaseData.assets.find((a) => a.name.includes('x64') || a.name.includes('ia32') || a.name.includes('arm64'))
            if (asset !== undefined && fileStats.size === asset.size) {
              writeStabilityLog({ level: 'info', source: 'updater', event: 'update-integrity-verified', details: { size: fileStats.size, version: currentVersion } })
            } else {
              console.warn('[Updater] Asset size mismatch, rejecting update')
              return
            }
          } else {
            console.warn('[Updater] Failed to fetch GitHub release for size verification')
            return
          }
        }
      }
    } catch (error) {
      console.warn('[Updater] Integrity verification error:', error)
      return
    }

    if (process.platform === 'win32') {
      await executionEngine.dispose()
    }

    autoUpdater.quitAndInstall()
  })
  autoUpdater.on('update-available', () => {
    console.log('Update available.')
  })
  autoUpdater.on('update-not-available', () => {
    console.log('Update not available.')
  })
  autoUpdater.on('error', (err) => {
    console.warn('Auto-update error', err)
  })
}
