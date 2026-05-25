import { Settings } from './settings'
import { CorpusClient } from '../../lib/corpus/client'
import { ipcMain } from 'electron'

export function handleCorpus (settings: Settings) {
  const client = new CorpusClient()

  ipcMain.handle('corpus:getStats', async () => {
    const settingsData = await settings.getData()
    const apiKey = settingsData.corpus.apiKey

    return await client.getUserStats(apiKey)
  })

  ipcMain.handle('corpus:getUserTraffic', async (_e, apiKey: string) => {
    return await client.getUserTraffic(apiKey)
  })

  ipcMain.handle('corpus:getUserTrafficDay', async (_e, apiKey: string) => {
    return await client.getUserTrafficDay(apiKey)
  })

  ipcMain.handle('corpus:getUserTrafficWeek', async (_e, apiKey: string) => {
    return await client.getUserTrafficWeek(apiKey)
  })

  ipcMain.handle('corpus:getUserTrafficMonth', async (_e, apiKey: string) => {
    return await client.getUserTrafficMonth(apiKey)
  })
}
