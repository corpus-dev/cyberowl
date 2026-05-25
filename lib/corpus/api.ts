import { electronNetFetch } from '../utils/electronNet'

const BASE_URL = 'https://corpsstats.bl4ck.dev/api'

export interface UserStats {
    login: string
    totalTraffic: number
    createdDate: Date
}

export interface GetUserStatsRequest {
    apiKey: string
}
export interface GetUserStatsResponse {
    success: boolean
    error: string
    errorType: 'OK' | 'BAD_STATUS_CODE' | 'ERR_FROM_BACKEND' | 'REQUEST_FAILED'
    data: UserStats
}

export async function getUserStats (params: GetUserStatsRequest): Promise<GetUserStatsResponse> {
  try {
    const statsResponse = await electronNetFetch(`${BASE_URL}/user/get-user-stats?apiKey=${encodeURI(params.apiKey)}`)
    if (statsResponse.status !== 200) {
      return {
        success: false,
        errorType: 'BAD_STATUS_CODE',
        error: `Bad status code: ${statsResponse.status}. Message: ${await statsResponse.text()}`,
        data: undefined as unknown as UserStats
      }
    }

    const responseJSON = await statsResponse.json() as GetUserStatsResponse
    if (!responseJSON.success) {
      return {
        ...responseJSON,
        errorType: 'ERR_FROM_BACKEND'
      }
    }

    if (responseJSON.data?.createdDate) {
      responseJSON.data.createdDate = new Date(responseJSON.data?.createdDate)
    }
    return responseJSON
  } catch (err) {
    return {
      success: false,
      errorType: 'REQUEST_FAILED',
      error: String(err),
      data: undefined as unknown as UserStats
    }
  }
}

export interface DetailedUserStats {
  login: string
  createdDate: string
  totalTraffic: string
  machine: number
  byTool: Record<string, { traffic: string; machine: number }>
  byOS: Array<{ tool: string; os: string; traffic: string; machine: number }>
  bySource: Array<{ tool: string; source: string; traffic: string; machine: number }>
  byAttacker: Array<{ tool: string; attacker: string; traffic: string; machine: number }>
  periods: {
    day: {
      date: string
      traffic: string
      machine: number
      byTool: Record<string, { traffic: string; machine: number }>
      bySource: Array<{ tool: string; source: string; traffic: string; machine: number }>
      byOS: Array<{ tool: string; os: string; traffic: string; machine: number }>
      byAttacker: Array<{ tool: string; attacker: string; traffic: string; machine: number }>
    }
    week: {
      week: string
      traffic: string
      machine: number
      byTool: Record<string, { traffic: string; machine: number }>
      bySource: Array<{ tool: string; source: string; traffic: string; machine: number }>
      byOS: Array<{ tool: string; os: string; traffic: string; machine: number }>
      byAttacker: Array<{ tool: string; attacker: string; traffic: string; machine: number }>
    }
    month: {
      month: string
      traffic: string
      machine: number
      byTool: Record<string, { traffic: string; machine: number }>
      bySource: Array<{ tool: string; source: string; traffic: string; machine: number }>
      byOS: Array<{ tool: string; os: string; traffic: string; machine: number }>
      byAttacker: Array<{ tool: string; attacker: string; traffic: string; machine: number }>
    }
  }
}

export interface GetDetailedUserStatsResponse {
  success: boolean
  error: string
  errorType: 'OK' | 'BAD_STATUS_CODE' | 'ERR_FROM_BACKEND' | 'REQUEST_FAILED'
  data: DetailedUserStats
}

export interface RawTrafficData {
  login: string
  createdDate: string
  period: string
  periodKey: string | null
  totalTraffic: string
  machine: number
  trafficByTool: Record<string, { traffic: string; machine: number }>
  trafficBySource: Array<{ tool: string; source: string; traffic: string; machine: number }>
  trafficByAttacker: Array<{ tool: string; attacker: string; traffic: string; machine: number }>
  trafficByOs: Array<{ tool: string; os: string; traffic: string; machine: number }>
}

export interface TrafficStats {
  login: string
  createdDate: string
  totalTraffic: string
  machine: number
  byTool: Record<string, { traffic: string; machine: number }>
  byOS: Array<{ tool: string; os: string; traffic: string; machine: number }>
  bySource: Array<{ tool: string; source: string; traffic: string; machine: number }>
  byAttacker: Array<{ tool: string; attacker: string; traffic: string; machine: number }>
  periods: {
    day: {
      date: string
      traffic: string
      machine: number
      byTool: Record<string, { traffic: string; machine: number }>
      bySource: Array<{ tool: string; source: string; traffic: string; machine: number }>
      byOS: Array<{ tool: string; os: string; traffic: string; machine: number }>
      byAttacker: Array<{ tool: string; attacker: string; traffic: string; machine: number }>
    }
    week: {
      week: string
      traffic: string
      machine: number
      byTool: Record<string, { traffic: string; machine: number }>
      bySource: Array<{ tool: string; source: string; traffic: string; machine: number }>
      byOS: Array<{ tool: string; os: string; traffic: string; machine: number }>
      byAttacker: Array<{ tool: string; attacker: string; traffic: string; machine: number }>
    }
    month: {
      month: string
      traffic: string
      machine: number
      byTool: Record<string, { traffic: string; machine: number }>
      bySource: Array<{ tool: string; source: string; traffic: string; machine: number }>
      byOS: Array<{ tool: string; os: string; traffic: string; machine: number }>
      byAttacker: Array<{ tool: string; attacker: string; traffic: string; machine: number }>
    }
  }
}

export interface TrafficStatsResponse {
  success: boolean
  error: string
  errorType: 'OK' | 'BAD_STATUS_CODE' | 'ERR_FROM_BACKEND' | 'REQUEST_FAILED'
  data: RawTrafficData | null
}

export interface TransformedTrafficStatsResponse {
  success: boolean
  error: string
  errorType: 'OK' | 'BAD_STATUS_CODE' | 'ERR_FROM_BACKEND' | 'REQUEST_FAILED'
  data: TrafficStats | null
}

async function parseTrafficResponse (response: Awaited<ReturnType<typeof electronNetFetch>>): Promise<TrafficStatsResponse> {
  const body = await response.text()
  try {
    const json = JSON.parse(body) as { success: boolean; error?: string; data?: RawTrafficData }
    if (!json.success) {
      return {
        success: false,
        error: json.error || 'Request failed',
        errorType: 'ERR_FROM_BACKEND',
        data: null
      }
    }
    return {
      success: true,
      error: '',
      errorType: 'OK',
      data: json.data || null
    }
  } catch {
    return {
      success: false,
      error: `Bad status code: ${response.status}. Body: ${body}`,
      errorType: 'BAD_STATUS_CODE',
      data: null
    }
  }
}

export async function getUserTraffic (params: GetUserStatsRequest): Promise<TrafficStatsResponse> {
  try {
    const response = await electronNetFetch(`${BASE_URL}/user/traffic/all?apiKey=${encodeURI(params.apiKey)}`)
    return await parseTrafficResponse(response)
  } catch (err) {
    return {
      success: false,
      errorType: 'REQUEST_FAILED',
      error: String(err),
      data: null
    }
  }
}

export async function getUserTrafficDay (params: GetUserStatsRequest): Promise<TrafficStatsResponse> {
  try {
    const response = await electronNetFetch(`${BASE_URL}/user/traffic/day?apiKey=${encodeURI(params.apiKey)}`)
    return await parseTrafficResponse(response)
  } catch (err) {
    return {
      success: false,
      errorType: 'REQUEST_FAILED',
      error: String(err),
      data: null
    }
  }
}

export async function getUserTrafficWeek (params: GetUserStatsRequest): Promise<TrafficStatsResponse> {
  try {
    const response = await electronNetFetch(`${BASE_URL}/user/traffic/week?apiKey=${encodeURI(params.apiKey)}`)
    return await parseTrafficResponse(response)
  } catch (err) {
    return {
      success: false,
      errorType: 'REQUEST_FAILED',
      error: String(err),
      data: null
    }
  }
}

export async function getUserTrafficMonth (params: GetUserStatsRequest): Promise<TrafficStatsResponse> {
  try {
    const response = await electronNetFetch(`${BASE_URL}/user/traffic/month?apiKey=${encodeURI(params.apiKey)}`)
    return await parseTrafficResponse(response)
  } catch (err) {
    return {
      success: false,
      errorType: 'REQUEST_FAILED',
      error: String(err),
      data: null
    }
  }
}
