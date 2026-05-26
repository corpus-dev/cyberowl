import { UserStats, getUserStats, GetUserStatsResponse, getUserTraffic, getUserTrafficDay, getUserTrafficWeek, getUserTrafficMonth, TrafficStats, RawTrafficData, TransformedTrafficStatsResponse } from './api'

const USERSTATS_CACHE_UPDATE_INTERVAL = 1000 * 60 * 2 // 2 minutes
const TRAFFIC_CACHE_UPDATE_INTERVAL = 1000 * 60 * 2 // 2 minutes
type PeriodTrafficStats = TrafficStats['periods']['day'] & TrafficStats['periods']['week'] & TrafficStats['periods']['month']

export class CorpusClient {
  protected userStatsCache?: UserStats
  protected userStatsCacheTimestamp?: Date
  protected userStatsCacheAPIKeyUsed?: string

  protected trafficStatsCache?: TrafficStats
  protected trafficStatsCacheTimestamp?: Date
  protected trafficStatsCacheAPIKeyUsed?: string

  async getUserStats (apiKey: string): Promise<GetUserStatsResponse> {
    if (apiKey === '') {
      return {
        success: false,
        error: 'EMPTY_API_KEY',
        errorType: 'REQUEST_FAILED',
        data: undefined as unknown as UserStats
      }
    }

    if (this.userStatsCache && this.userStatsCacheTimestamp && apiKey === this.userStatsCacheAPIKeyUsed && (Date.now() - this.userStatsCacheTimestamp.getTime()) < USERSTATS_CACHE_UPDATE_INTERVAL) {
      return {
        success: true,
        error: '',
        errorType: 'OK',
        data: this.userStatsCache
      }
    }

    const trafficResponse = await getUserTraffic({ apiKey })

    if (trafficResponse.success && trafficResponse.data) {
      const mappedStats: UserStats = {
        login: trafficResponse.data.login,
        totalTraffic: Number(trafficResponse.data.totalTraffic || 0),
        createdDate: new Date(trafficResponse.data.createdDate)
      }

      this.userStatsCache = mappedStats
      this.userStatsCacheTimestamp = new Date()
      this.userStatsCacheAPIKeyUsed = apiKey

      return {
        success: true,
        error: '',
        errorType: 'OK',
        data: mappedStats
      }
    }

    const response = await getUserStats({ apiKey })

    if (response.success) {
      this.userStatsCache = response.data
      this.userStatsCacheTimestamp = new Date()
      this.userStatsCacheAPIKeyUsed = apiKey
    }

    return response
  }

  async getUserTraffic (apiKey: string, force = false): Promise<TransformedTrafficStatsResponse> {
    if (apiKey === '') {
      return {
        success: false,
        error: 'EMPTY_API_KEY',
        errorType: 'REQUEST_FAILED',
        data: null
      }
    }

    if (!force && this.trafficStatsCache && this.trafficStatsCacheTimestamp && apiKey === this.trafficStatsCacheAPIKeyUsed && (Date.now() - this.trafficStatsCacheTimestamp.getTime()) < TRAFFIC_CACHE_UPDATE_INTERVAL) {
      return {
        success: true,
        error: '',
        errorType: 'OK',
        data: this.trafficStatsCache
      }
    }

    const [all, day, week, month] = await Promise.all([
      getUserTraffic({ apiKey }),
      getUserTrafficDay({ apiKey }),
      getUserTrafficWeek({ apiKey }),
      getUserTrafficMonth({ apiKey })
    ])

    if (all.success && all.data) {
      const periods: TrafficStats['periods'] = {
        day: this.mapPeriod(day.data, 'day'),
        week: this.mapPeriod(week.data, 'week'),
        month: this.mapPeriod(month.data, 'month')
      }

      const combined: TrafficStats = this.mapTrafficDataToStats(all.data, periods)

      this.trafficStatsCache = combined
      this.trafficStatsCacheTimestamp = new Date()
      this.trafficStatsCacheAPIKeyUsed = apiKey

      return { success: true, error: '', errorType: 'OK', data: combined } as TransformedTrafficStatsResponse
    }

    return all as unknown as TransformedTrafficStatsResponse
  }

  async getUserTrafficDay (apiKey: string): Promise<TransformedTrafficStatsResponse> {
    const response = await getUserTrafficDay({ apiKey })
    if (response.success && response.data) {
      return {
        success: true,
        error: '',
        errorType: 'OK',
        data: this.mapPeriodToStats(response.data)
      } as TransformedTrafficStatsResponse
    }
    return response as unknown as TransformedTrafficStatsResponse
  }

  async getUserTrafficWeek (apiKey: string): Promise<TransformedTrafficStatsResponse> {
    const response = await getUserTrafficWeek({ apiKey })
    if (response.success && response.data) {
      return {
        success: true,
        error: '',
        errorType: 'OK',
        data: this.mapPeriodToStats(response.data)
      } as TransformedTrafficStatsResponse
    }
    return response as unknown as TransformedTrafficStatsResponse
  }

  async getUserTrafficMonth (apiKey: string): Promise<TransformedTrafficStatsResponse> {
    const response = await getUserTrafficMonth({ apiKey })
    if (response.success && response.data) {
      return {
        success: true,
        error: '',
        errorType: 'OK',
        data: this.mapPeriodToStats(response.data)
      } as TransformedTrafficStatsResponse
    }
    return response as unknown as TransformedTrafficStatsResponse
  }

  private mapPeriodToStats (data: RawTrafficData): TrafficStats {
    const period = this.mapPeriod(data, data.period === 'week' || data.period === 'month' ? data.period : 'day')

    return {
      login: data.login,
      createdDate: data.createdDate,
      totalTraffic: data.totalTraffic,
      machine: data.machine || 0,
      byTool: this.normalizeTools(data),
      bySource: data.trafficBySource || [],
      byOS: data.trafficByOs || [],
      byAttacker: data.trafficByAttacker || [],
      periods: {
        day: { ...this.emptyPeriod(), ...(data.period === 'day' ? period : {}) },
        week: { ...this.emptyPeriod(), ...(data.period === 'week' ? period : {}) },
        month: { ...this.emptyPeriod(), ...(data.period === 'month' ? period : {}) }
      }
    }
  }

  private mapTrafficDataToStats (data: RawTrafficData, periods: TrafficStats['periods']): TrafficStats {
    return {
      login: data.login,
      createdDate: data.createdDate,
      totalTraffic: data.totalTraffic,
      machine: data.machine || 0,
      byTool: this.normalizeTools(data),
      byOS: data.trafficByOs || [],
      bySource: data.trafficBySource || [],
      byAttacker: data.trafficByAttacker || [],
      periods
    }
  }

  private emptyPeriod (): PeriodTrafficStats {
    return {
      date: '',
      week: '',
      month: '',
      traffic: '0',
      machine: 0,
      byTool: {},
      bySource: [],
      byOS: [],
      byAttacker: []
    }
  }

  private mapPeriod (data: RawTrafficData | null, period: 'day' | 'week' | 'month'): PeriodTrafficStats {
    if (!data) {
      return this.emptyPeriod()
    }

    return {
      date: data.periodKey || '',
      week: data.periodKey || '',
      month: data.periodKey || '',
      period,
      traffic: data.totalTraffic,
      machine: data.machine || 0,
      byTool: this.normalizeTools(data),
      bySource: data.trafficBySource || [],
      byOS: data.trafficByOs || [],
      byAttacker: data.trafficByAttacker || []
    }
  }

  private normalizeTools (data: RawTrafficData): Record<string, { traffic: string; machine: number }> {
    return data.trafficByTool || {}
  }
}
