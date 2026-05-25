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
        @click="loadStats"
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
            <div class="stat-main stat-main--traffic">{{ humanBytesString(Number(stats.totalTraffic)) }}</div>
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

        <q-card flat bordered class="stat-card chart-card">
          <q-card-section v-if="chartTools.length > 0">
            <VueApexCharts type="donut" :options="totalChartOptions" :series="totalChartSeries" height="190" />
          </q-card-section>
          <q-card-section v-else class="empty-state">
            {{ $t('sidebarStats.noStats') }}
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
              <div class="period-traffic">{{ humanBytesString(Number(period.data.traffic)) }}</div>
              <div class="period-meta">
                <span>{{ period.periodKey }}</span>
                <span>{{ formatNumber(period.data.machine) }} {{ $t('personalStats.machineShort') }}</span>
              </div>
              <div class="mini-bars q-mt-md">
                <div v-for="row in topTools(period.data.byTool, 4)" :key="row.name" class="mini-row">
                  <span>{{ row.name }}</span>
                  <strong>{{ humanBytesString(Number(row.traffic)) }}</strong>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </section>

      <section class="detail-grid">
        <q-card flat bordered class="stat-card">
          <q-card-section>
            <stat-list
              :title="$t('personalStats.byTool')"
              icon="construction"
              :rows="toolRows"
            />
          </q-card-section>
        </q-card>

        <q-card flat bordered class="stat-card">
          <q-card-section>
            <stat-list
              :title="$t('personalStats.bySource')"
              icon="hub"
              :rows="sourceRows"
            />
          </q-card-section>
        </q-card>

        <q-card flat bordered class="stat-card">
          <q-card-section>
            <stat-list
              :title="$t('personalStats.byAttacker')"
              icon="track_changes"
              :rows="attackerRows"
            />
          </q-card-section>
        </q-card>

        <q-card flat bordered class="stat-card">
          <q-card-section>
            <stat-list
              :title="$t('personalStats.byOS')"
              icon="devices"
              :rows="osRows"
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
  detail: string
  traffic: string
  machine: number
}

const StatList = defineComponent({
  name: 'StatList',
  props: {
    title: { type: String, required: true },
    icon: { type: String, required: true },
    rows: { type: Array as () => DisplayRow[], required: true }
  },
  setup (props) {
    return () => h('div', { class: 'stat-list' }, [
      h('div', { class: 'stat-list-header' }, [
        h('i', { class: 'q-icon material-icons', 'aria-hidden': 'true' }, props.icon),
        h('span', props.title)
      ]),
      props.rows.length === 0
        ? h('div', { class: 'empty-state' }, 'No data')
        : h('div', { class: 'stat-list-rows' }, props.rows.map((row) => h('div', { class: 'stat-row', key: row.name + row.detail }, [
          h('div', { class: 'stat-row-name' }, [
            h('strong', row.name),
            h('span', row.detail)
          ]),
          h('div', { class: 'stat-row-values' }, [
            h('strong', humanBytesString(Number(row.traffic))),
            h('span', `${formatNumber(row.machine)} machines`)
          ])
        ])))
    ])
  }
})

const apiKey = ref('')
const loading = ref(false)
const error = ref('')
const stats = ref<TrafficStats | null>(null)
const { t } = useI18n()

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
            formatter: () => humanBytesString(Number(stats.value?.totalTraffic || 0))
          },
          value: {
            color: 'var(--app-shell-text)',
            formatter: (value: string) => humanBytesString(Number(value))
          }
        }
      }
    }
  },
  tooltip: { y: { formatter: (value: number) => humanBytesString(value) } }
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
  detail: `${formatNumber(row.machine)} machines`,
  traffic: row.traffic,
  machine: row.machine
})))

const sourceRows = computed(() => dimensionRows(stats.value?.bySource || [], 'source'))
const attackerRows = computed(() => dimensionRows(stats.value?.byAttacker || [], 'attacker'))
const osRows = computed(() => dimensionRows(stats.value?.byOS || [], 'os'))

function topTools (tools: Record<string, ToolStat>, limit: number) {
  return Object.entries(tools)
    .map(([name, value]) => ({ name, traffic: value.traffic, machine: value.machine || 0 }))
    .filter((row) => Number(row.traffic) > 0 || row.machine > 0)
    .sort((a, b) => Number(b.traffic) - Number(a.traffic))
    .slice(0, limit)
}

function dimensionRows (items: DimensionStat[], field: 'source' | 'attacker' | 'os'): DisplayRow[] {
  return items
    .filter((item) => Number(item.traffic) > 0 || item.machine > 0)
    .map((item) => ({
      name: String(item[field] || '-'),
      detail: item.tool,
      traffic: item.traffic,
      machine: item.machine || 0
    }))
    .sort((a, b) => Number(b.traffic) - Number(a.traffic))
}

function humanBytesString (bytes: number, dp = 1): string {
  if (!Number.isFinite(bytes)) return '0 B'
  const thresh = 1024
  if (Math.abs(bytes) < thresh) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
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

async function loadStats () {
  if (!apiKey.value.trim() || loading.value) return
  loading.value = true
  error.value = ''

  try {
    const result = await window.corpusAPI.getUserTraffic(apiKey.value.trim())
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
      error.value = 'Corpus API key is not configured'
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

.mini-bars,
.stat-list-rows {
  display: grid;
  gap: 8px;
}

.mini-row {
  justify-content: space-between;
  gap: 8px;
  min-height: 24px;
  padding: 4px 8px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--app-accent-cool) 10%, transparent);
  font-size: 12px;
}

.mini-row span,
.stat-row-name strong,
.stat-row-name span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid var(--app-panel-header-border);
}

.stat-row-name,
.stat-row-values {
  display: grid;
  gap: 2px;
}

.stat-row-values {
  justify-items: end;
  text-align: right;
  flex-shrink: 0;
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
