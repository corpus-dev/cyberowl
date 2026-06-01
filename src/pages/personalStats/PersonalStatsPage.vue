<template>
  <q-page class="q-pa-md personal-stats-page">
    <div class="stats-header q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold personal-stats-title">
          {{ $t('personalStats.title') }}
        </div>
        <div class="text-caption stats-muted">
          {{ $t('personalStats.updatedFromApi') }}
        </div>
      </div>

      <q-btn
        round
        flat
        color="primary"
        icon="refresh"
        :loading="loading"
        :disable="!apiKey.trim()"
        @click="loadStats(true)"
      >
        <q-tooltip>{{ $t('personalStats.refresh') }}</q-tooltip>
      </q-btn>
    </div>

    <div v-if="loading" class="row justify-center q-my-xl">
      <q-spinner color="primary" size="3em" />
    </div>

    <q-banner v-else-if="error" rounded class="stats-error q-mb-md">
      <template #avatar>
        <q-icon name="error_outline" />
      </template>
      {{ error }}
    </q-banner>

    <div v-else-if="stats" class="stats-grid">
      <section class="summary-grid">
        <q-card flat bordered class="stat-card summary-card">
          <q-card-section>
            <div class="stat-kicker">{{ $t('personalStats.login') }}</div>
            <div class="stat-main">{{ displayLogin }}</div>
            <div class="stat-sub">{{ $t('personalStats.createdDate') }}: {{ formatDate(stats.createdDate) }}</div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="stat-card metric-card">
          <q-card-section>
            <div class="stat-kicker">{{ $t('personalStats.totalTraffic') }}</div>
            <div class="stat-main stat-main--traffic">{{ humanBytesString(Number(stats.totalTraffic), 1, locale) }}</div>
            <div class="stat-sub">{{ $t('personalStats.allTime') }}</div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="stat-card metric-card">
          <q-card-section>
            <div class="stat-kicker">{{ $t('personalStats.machine') }}</div>
            <div class="stat-main">{{ formatNumber(stats.machine) }}</div>
            <div class="stat-sub">{{ $t('personalStats.uniqueMachines') }}</div>
          </q-card-section>
        </q-card>

        <q-card v-if="chartTools.length > 0" flat bordered class="stat-card chart-card">
          <q-card-section>
            <VueApexCharts type="donut" :options="totalChartOptions" :series="totalChartSeries" height="190" />
          </q-card-section>
        </q-card>
      </section>

      <section>
        <div class="section-title">{{ $t('personalStats.periods') }}</div>
        <div class="period-grid">
          <q-card v-for="period in periodCards" :key="period.key" flat bordered class="stat-card period-card">
            <q-card-section>
              <div class="period-topline">
                <q-icon :name="period.icon" size="20px" />
                <span>{{ period.label }}</span>
              </div>
              <div class="period-traffic">{{ humanBytesString(Number(period.data.traffic), 1, locale) }}</div>
              <div class="period-meta">
                <span>{{ period.periodKey }}</span>
                <span v-if="period.data.machine > 0">{{ formatNumber(period.data.machine) }} {{ $t('personalStats.machineShort') }}</span>
              </div>
              <div class="period-breakdown q-mt-md">
                <period-breakdown-list
                  :label="$t('personalStats.byTool')"
                  :rows="topTools(period.data.byTool, 4)"
                />
                <period-breakdown-list
                  :label="$t('personalStats.bySource')"
                  :rows="dimensionRows(period.data.bySource, 'source', 4)"
                />
                <period-breakdown-list
                  :label="$t('personalStats.byAttacker')"
                  :rows="dimensionRows(period.data.byAttacker, 'attacker', 4)"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </section>

      <section class="detail-grid">
        <q-card v-if="toolRows.length > 0" flat bordered class="stat-card">
          <q-card-section>
            <stat-list
              :title="$t('personalStats.byTool')"
              icon="construction"
              :rows="toolRows"
            />
          </q-card-section>
        </q-card>

        <q-card v-if="sourceRows.length > 0" flat bordered class="stat-card">
          <q-card-section>
            <stat-list
              :title="$t('personalStats.bySource')"
              icon="hub"
              :rows="sourceRows"
            />
          </q-card-section>
        </q-card>

        <q-card v-if="attackerRows.length > 0" flat bordered class="stat-card">
          <q-card-section>
            <stat-list
              :title="$t('personalStats.byAttacker')"
              icon="track_changes"
              :rows="attackerRows"
            />
          </q-card-section>
        </q-card>

        <q-card v-if="osRows.length > 0" flat bordered class="stat-card">
          <q-card-section>
            <stat-list
              :title="$t('personalStats.byOS')"
              icon="devices"
              :rows="osRows"
              machine-only
            />
          </q-card-section>
        </q-card>
      </section>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import VueApexCharts from 'vue3-apexcharts'

interface ToolStat {
  traffic: string
  machine: number
}

interface DimensionStat {
  tool: string
  source?: string
  attacker?: string
  os?: string
  traffic: string
  machine: number
}

interface PeriodStat {
  date?: string
  week?: string
  month?: string
  traffic: string
  machine: number
  byTool: Record<string, ToolStat>
  bySource: DimensionStat[]
  byOS: DimensionStat[]
  byAttacker: DimensionStat[]
}

interface TrafficStats {
  login: string
  createdDate: string
  totalTraffic: string
  machine: number
  byTool: Record<string, ToolStat>
  byOS: DimensionStat[]
  bySource: DimensionStat[]
  byAttacker: DimensionStat[]
  periods: {
    day: PeriodStat
    week: PeriodStat
    month: PeriodStat
  }
}

interface DisplayRow {
  name: string
  detail?: string
  traffic: string
  machine: number
}

const StatList = defineComponent({
  name: 'StatList',
  props: {
    title: { type: String, required: true },
    icon: { type: String, required: true },
    rows: { type: Array as () => DisplayRow[], required: true },
    machineOnly: { type: Boolean, default: false }
  },
  setup (props) {
    return () => h('div', { class: 'stat-list' }, [
      h('div', { class: 'stat-list-header' }, [
        h('i', { class: 'q-icon material-icons', 'aria-hidden': 'true' }, props.icon),
        h('span', props.title)
      ]),
      props.rows.length === 0
        ? h('div', { class: 'empty-state' }, t('sidebarStats.noStats'))
        : h('div', { class: 'stat-list-rows' }, props.rows.map((row) => h('div', { class: 'stat-row', key: row.name + row.detail }, [
          h('div', { class: 'stat-row-name' }, [
            h('strong', row.name),
            row.detail ? h('span', row.detail) : null
          ]),
          h('div', { class: ['stat-row-values', props.machineOnly ? 'stat-row-values--machine-only' : ''] }, [
            props.machineOnly ? null : h('strong', humanBytesString(Number(row.traffic), 1, locale.value)),
            row.machine > 0 ? h('span', `${formatNumber(row.machine)} ${t('personalStats.machineShort')}`) : null
          ])
        ])))
    ])
  }
})

const PeriodBreakdownList = defineComponent({
  name: 'PeriodBreakdownList',
  props: {
    label: { type: String, required: true },
    rows: { type: Array as () => DisplayRow[], required: true }
  },
  setup (props) {
    return () => {
      if (props.rows.length === 0) return null
      return h('div', { class: 'period-breakdown-list' }, [
        h('div', { class: 'period-breakdown-label' }, props.label),
        h('div', { class: 'period-breakdown-rows' }, props.rows.map((row) => h('div', { class: 'period-breakdown-row', key: `${row.detail || ''}:${row.name}` }, [
          h('div', { class: 'period-breakdown-name' }, [
            h('span', row.name),
            row.detail ? h('em', row.detail) : null
          ]),
          h('strong', humanBytesString(Number(row.traffic), 1, locale.value))
        ])))
      ])
    }
  }
})

const apiKey = ref('')
const loading = ref(false)
const error = ref('')
const stats = ref<TrafficStats | null>(null)
const { t, locale } = useI18n()

const displayLogin = computed(() => stats.value?.login || '---')

const chartTools = computed(() => topTools(stats.value?.byTool || {}, 8))
const totalChartSeries = computed(() => chartTools.value.map((row) => Number(row.traffic)))
const totalChartLabels = computed(() => chartTools.value.map((row) => row.name))

const totalChartOptions = computed(() => ({
  chart: { type: 'donut', sparkline: { enabled: false } },
  labels: totalChartLabels.value,
  colors: ['#c28f2c', '#3e7782', '#52652d', '#8f6f2b', '#4f9aa4', '#76884b', '#9d3030', '#b6842d'],
  legend: {
    position: 'bottom',
    fontSize: '11px',
    labels: { colors: 'var(--app-shell-text)' }
  },
  dataLabels: { enabled: false },
  stroke: { show: true, width: 2, colors: ['var(--app-panel-bg)'] },
  plotOptions: {
    pie: {
      donut: {
        size: '68%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            color: 'var(--app-muted-text)',
            formatter: () => humanBytesString(Number(stats.value?.totalTraffic || 0), 1, locale.value)
          },
          value: {
            color: 'var(--app-shell-text)',
            formatter: (value: string) => humanBytesString(Number(value), 1, locale.value)
          }
        }
      }
    }
  },
  tooltip: { y: { formatter: (value: number) => humanBytesString(value, 1, locale.value) } }
}))

const periodCards = computed(() => {
  const periods = stats.value?.periods
  if (!periods) return []
  return [
    { key: 'day', icon: 'today', label: t('personalStats.day'), periodKey: periods.day.date || '-', data: periods.day },
    { key: 'week', icon: 'calendar_view_week', label: t('personalStats.week'), periodKey: periods.week.week || '-', data: periods.week },
    { key: 'month', icon: 'calendar_month', label: t('personalStats.month'), periodKey: periods.month.month || '-', data: periods.month }
  ]
})

const toolRows = computed(() => topTools(stats.value?.byTool || {}, 20).map((row) => ({
  name: row.name,
  traffic: row.traffic,
  machine: row.machine
})))

const sourceRows = computed(() => dimensionRows(stats.value?.bySource || [], 'source'))
const attackerRows = computed(() => dimensionRows(stats.value?.byAttacker || [], 'attacker'))
const osRows = computed(() => machineRows(stats.value?.byOS || [], 'os'))

function topTools (tools: Record<string, ToolStat>, limit: number) {
  return Object.entries(tools)
    .map(([name, value]) => ({ name, traffic: value.traffic, machine: value.machine || 0 }))
    .filter((row) => Number(row.traffic) > 0 || row.machine > 0)
    .sort((a, b) => Number(b.traffic) - Number(a.traffic))
    .slice(0, limit)
}

function dimensionRows (items: DimensionStat[], field: 'source' | 'attacker' | 'os', limit?: number): DisplayRow[] {
  return items
    .filter((item) => Number(item.traffic) > 0 || item.machine > 0)
    .map((item) => ({
      name: String(item[field] || '-'),
      detail: item.tool,
      traffic: item.traffic,
      machine: item.machine || 0
    }))
    .sort((a, b) => Number(b.traffic) - Number(a.traffic))
    .slice(0, limit)
}

function machineRows (items: DimensionStat[], field: 'source' | 'attacker' | 'os'): DisplayRow[] {
  return items
    .filter((item) => item.machine > 0)
    .map((item) => ({
      name: String(item[field] || '-'),
      detail: item.tool,
      traffic: item.traffic,
      machine: item.machine || 0
    }))
    .sort((a, b) => b.machine - a.machine)
}

const BYTE_BASE_UNIT: Record<string, string> = {
  'en-US': 'B',
  'ua-UA': '\u0411',
  'de-DE': 'B'
}

const BYTE_UNITS: Record<string, string[]> = {
  'en-US': ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
  'ua-UA': ['\u043a\u0411', '\u041c\u0411', '\u0413\u0411', '\u0422\u0411', '\u041f\u0411', '\u0415\u0411', '\u0417\u0411', '\u0419\u0411'],
  'de-DE': ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
}

function humanBytesString (bytes: number, dp = 1, loc = 'en-US'): string {
  if (!Number.isFinite(bytes)) return '0 ' + (BYTE_BASE_UNIT[loc] ?? 'B')
  const thresh = 1000
  if (Math.abs(bytes) < thresh) return `${bytes} ${BYTE_BASE_UNIT[loc] ?? 'B'}`
  const units = BYTE_UNITS[loc] ?? BYTE_UNITS['en-US']!
  let u = -1
  const r = 10 ** dp
  do {
    bytes /= thresh
    ++u
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)
  return `${bytes.toFixed(dp)} ${units[u]}`
}

function formatNumber (value: number): string {
  return new Intl.NumberFormat().format(value || 0)
}

function formatDate (dateStr: string): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString()
}

async function loadStats (force = false) {
  if (!apiKey.value.trim() || loading.value) return
  loading.value = true
  error.value = ''

  try {
    const result = await window.corpusAPI.getUserTraffic(apiKey.value.trim(), force)
    if (!result.success) {
      error.value = result.error || 'Unable to load statistics'
      return
    }
    if (!result.data) {
      error.value = 'No data returned'
      return
    }
    stats.value = result.data as unknown as TrafficStats
  } catch (err) {
    error.value = String(err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const settings = await window.settingsAPI.get()
    apiKey.value = settings.corpus.apiKey || ''
    if (apiKey.value.trim()) {
      await loadStats()
    } else {
      error.value = 'Corpus API Key is not configured'
    }
  } catch (err) {
    error.value = String(err)
  }
})
</script>

<style scoped>
.personal-stats-page {
  max-width: 1320px;
  margin: 0 auto;
  color: var(--app-shell-text);
}

.stats-header,
.period-topline,
.period-meta,
.stat-list-header,
.stat-row,
.stat-row-values,
.mini-row {
  display: flex;
  align-items: center;
}

.stats-header {
  justify-content: space-between;
  gap: 16px;
}

.stats-muted,
.stat-sub,
.stat-kicker,
.period-meta,
.stat-row-name span,
.stat-row-values span {
  color: var(--app-muted-text);
}

.stats-grid {
  display: grid;
  gap: 16px;
}

.summary-grid,
.period-grid,
.detail-grid {
  display: grid;
  gap: 12px;
}

.summary-grid {
  grid-template-columns: 1.1fr 1fr 0.8fr 1.2fr;
}

.period-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.detail-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.stat-card {
  min-height: 100%;
  border-radius: 8px;
  background: var(--app-panel-bg);
  border: 1px solid var(--app-panel-border);
  content-visibility: auto;
  contain-intrinsic-size: 220px;
}

.summary-card {
  border-left: 4px solid var(--app-accent-cool);
}

.metric-card {
  border-left: 4px solid var(--app-accent-warm);
}

.chart-card {
  min-height: 220px;
}

.stat-kicker,
.section-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0;
}

.stat-main {
  margin-top: 6px;
  font-size: 28px;
  line-height: 1.12;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.stat-main--traffic,
.period-traffic {
  color: var(--app-accent-warm);
}

.section-title {
  margin: 4px 0 8px;
  color: var(--app-shell-text);
}

.period-card {
  overflow: hidden;
}

.period-card :deep(.q-card__section) {
  padding: 14px;
}

.period-topline {
  gap: 8px;
  color: var(--app-shell-text);
  font-weight: 700;
}

.period-traffic {
  margin-top: 10px;
  font-size: 24px;
  line-height: 1.1;
  font-weight: 800;
}

.period-meta {
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
  font-size: 12px;
}

.period-breakdown,
.stat-list-rows {
  display: grid;
  gap: 8px;
}

.period-breakdown-list {
  display: grid;
  gap: 6px;
}

.period-breakdown-label {
  color: var(--app-muted-text);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.period-breakdown-rows {
  display: grid;
  gap: 6px;
}

.period-breakdown-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 28px;
  padding: 5px 8px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--app-accent-cool) 10%, transparent);
  font-size: 12px;
}

.period-breakdown-name {
  display: grid;
  min-width: 0;
  gap: 1px;
}

.period-breakdown-name span,
.period-breakdown-name em,
.period-breakdown-row strong,
.stat-row-name strong,
.stat-row-name span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.period-breakdown-name em {
  color: var(--app-muted-text);
  font-size: 11px;
  font-style: normal;
}

.period-breakdown-row strong {
  color: var(--app-accent-warm);
  font-size: 12px;
}

:deep(.period-breakdown) {
  display: grid;
  gap: 10px;
}

:deep(.period-breakdown-list) {
  display: grid;
  gap: 6px;
}

:deep(.period-breakdown-label) {
  color: var(--app-muted-text);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

:deep(.period-breakdown-rows) {
  display: grid;
  gap: 6px;
}

:deep(.period-breakdown-row) {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  min-height: 34px;
  padding: 7px 9px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--app-accent-cool) 10%, transparent);
}

:deep(.period-breakdown-name) {
  display: grid;
  min-width: 0;
  gap: 3px;
}

:deep(.period-breakdown-name span),
:deep(.period-breakdown-name em),
:deep(.period-breakdown-row strong) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.period-breakdown-name span) {
  color: var(--app-shell-text);
  font-size: 13px;
  font-weight: 700;
}

:deep(.period-breakdown-name em) {
  width: fit-content;
  max-width: 100%;
  padding: 1px 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--app-accent-warm) 14%, transparent);
  color: var(--app-muted-text);
  font-size: 11px;
  font-style: normal;
}

:deep(.period-breakdown-row strong) {
  color: var(--app-accent-warm);
  font-size: 13px;
  font-weight: 800;
}

.stat-list-header {
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 800;
}

.stat-list-header .q-icon {
  color: var(--app-accent-cool);
  font-size: 20px;
}

.stat-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  padding: 10px 0;
  border-top: 1px solid var(--app-panel-header-border);
}

.stat-row-name,
.stat-row-values {
  display: grid;
  min-width: 0;
  gap: 3px;
}

.stat-row-name strong,
.stat-row-name span,
.stat-row-values strong,
.stat-row-values span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-row-name strong {
  font-size: 14px;
}

.stat-row-name span {
  font-size: 12px;
}

.stat-row-values {
  justify-items: end;
  text-align: right;
  flex-shrink: 0;
}

.stat-row-values strong {
  color: var(--app-accent-warm);
}

:deep(.stat-list) {
  display: grid;
  gap: 10px;
}

:deep(.stat-list-header) {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-weight: 800;
}

:deep(.stat-list-header .q-icon) {
  color: var(--app-accent-cool);
  font-size: 20px;
}

:deep(.stat-list-rows) {
  display: grid;
  gap: 8px;
}

:deep(.stat-row) {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  min-height: 42px;
  padding: 8px 10px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--app-accent-cool) 9%, transparent);
  border: 1px solid color-mix(in srgb, var(--app-accent-cool) 14%, transparent);
}

:deep(.stat-row-name),
:deep(.stat-row-values) {
  display: grid;
  min-width: 0;
  gap: 3px;
}

:deep(.stat-row-name strong),
:deep(.stat-row-name span),
:deep(.stat-row-values strong),
:deep(.stat-row-values span) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.stat-row-name strong) {
  color: var(--app-shell-text);
  font-size: 14px;
}

:deep(.stat-row-name span),
:deep(.stat-row-values span) {
  color: var(--app-muted-text);
  font-size: 12px;
}

:deep(.stat-row-values) {
  justify-items: end;
  text-align: right;
}

:deep(.stat-row-values strong) {
  color: var(--app-accent-warm);
  font-size: 14px;
}

:deep(.stat-row-values--machine-only span) {
  color: var(--app-accent-warm);
  font-size: 14px;
  font-weight: 800;
}

.empty-state,
.stats-error {
  color: var(--app-muted-text);
}

.stats-error {
  background: color-mix(in srgb, var(--app-danger) 12%, var(--app-panel-bg));
  border: 1px solid color-mix(in srgb, var(--app-danger) 35%, transparent);
}

@media (max-width: 1180px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .summary-grid,
  .period-grid,
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
