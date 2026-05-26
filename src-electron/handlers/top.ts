import { ipcMain } from 'electron'
import { electronNetFetch } from '../../lib/utils/electronNet'

export interface LeaderboardUser {
  rank: number
  login: string
  totalTraffic: string
  machine: number
  trafficByTool: Record<string, { traffic: string; machine: number }>
  trafficBySource: Array<{ tool: string; source: string; traffic: string; machine: number }>
  trafficByAttacker: Array<{ tool: string; attacker: string; traffic: string; machine: number }>
  trafficByOs: Array<{ tool: string; os: string; traffic: string; machine: number }>
}

export interface LeaderboardApiResponse {
  success: boolean
  error: string
  data: {
    period: string
    periodKey: string
    users: LeaderboardUser[]
  }
}

export interface TopData {
  day: LeaderboardUser[]
  week: LeaderboardUser[]
  month: LeaderboardUser[]
  total: LeaderboardUser[]
}

let leaderboardCache: TopData | null = null
let leaderboardCacheTime: Date | null = null
const CACHE_DURATION_MS = 1000 * 60 * 2 // 2 minutes

async function fetchLeaderboard (period: string): Promise<LeaderboardUser[]> {
  try {
    const response = await electronNetFetch(`https://corpsstats.bl4ck.dev/api/user/leaderboard/${period}`)
    if (response.status !== 200) {
      console.warn(`[top] ${period} failed with status ${response.status}`)
      return []
    }
    const json = await response.json() as LeaderboardApiResponse
    if (!json.success) {
      console.warn(`[top] ${period} backend error: ${json.error}`)
      return []
    }
    return json.data?.users || []
  } catch (err) {
    console.error(`[top] ${period} fetch error:`, err)
    return []
  }
}

async function fetchAllLeaderboards (): Promise<TopData> {
  const [day, week, month, total] = await Promise.all([
    fetchLeaderboard('day'),
    fetchLeaderboard('week'),
    fetchLeaderboard('month'),
    fetchLeaderboard('total')
  ])
  return { day, week, month, total }
}

async function getTopData (force = false): Promise<TopData> {
  if (!force && leaderboardCache !== null && leaderboardCacheTime !== null) {
    const now = new Date()
    const diff = now.getTime() - leaderboardCacheTime.getTime()
    if (diff < CACHE_DURATION_MS) {
      return leaderboardCache
    }
  }

  const data = await fetchAllLeaderboards()
  leaderboardCache = data
  leaderboardCacheTime = new Date()
  return data
}

export function handleTop () {
  ipcMain.handle('top:getWeeklyTop', async (_event, force = false) => {
    return await getTopData(force)
  })
}
