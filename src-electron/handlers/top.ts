import { ipcMain } from 'electron'
import { electronNetFetch } from '../../lib/utils/electronNet'

export interface TopItem {
    rank: number
    login: string
    traffic: string
    byTool: Record<string, string>
    byOS: Record<string, string>
    bySource: Record<string, string>
}

export interface PeriodData {
    date?: string
    week?: string
    month?: string
    items: TopItem[]
}

export interface TopApiResponse {
    success: boolean
    error: string
    data: {
        periods: {
            day: PeriodData
            week: PeriodData
            month: PeriodData
        }
    }
}

export interface TopData {
    day: TopItem[]
    week: TopItem[]
    month: TopItem[]
}

async function getTopData (): Promise<TopData> {
  try {
    const response = await electronNetFetch('https://corpsstats.bl4ck.dev/api/tools/global-topusers')
    if (response.status !== 200) {
      return {
        day: [],
        week: [],
        month: []
      }
    }
    const json = await response.json() as TopApiResponse
    return {
      day: json.data.periods.day.items || [],
      week: json.data.periods.week.items || [],
      month: json.data.periods.month.items || []
    }
  } catch {
    return {
      day: [],
      week: [],
      month: []
    }
  }
}

export function handleTop () {
  ipcMain.handle('top:getWeeklyTop', async () => {
    return await getTopData()
  })
}
