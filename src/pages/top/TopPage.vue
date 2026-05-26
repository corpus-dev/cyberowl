<template>
  <q-page padding class="top-page">
    <div class="top-header q-mb-md">
      <div>
        <div class="text-h4 text-bold top-title">{{ $t('top.volunteers') }}</div>
        <div class="text-caption top-muted">{{ $t('top.subtitle') }}</div>
      </div>

      <q-btn round flat color="primary" icon="refresh" :loading="loading" @click="loadTop(true)">
        <q-tooltip>{{ $t('top.refresh') }}</q-tooltip>
      </q-btn>
    </div>

    <q-tabs v-model="activeTab" dense class="top-tabs q-mb-md" align="left">
      <q-tab name="day" icon="today" :label="$t('top.day')" />
      <q-tab name="week" icon="calendar_view_week" :label="$t('top.week')" />
      <q-tab name="month" icon="calendar_month" :label="$t('top.month')" />
      <q-tab name="total" icon="leaderboard" :label="$t('top.total')" />
    </q-tabs>

    <div v-if="loading" class="row justify-center q-my-xl">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else>
      <section class="leader-summary q-mb-md">
        <q-card flat bordered class="leader-summary-card">
          <q-card-section>
            <div class="summary-kicker">{{ $t('top.currentPeriod') }}</div>
            <div class="summary-main">{{ currentPeriodLabel }}</div>
          </q-card-section>
        </q-card>
        <q-card flat bordered class="leader-summary-card">
          <q-card-section>
            <div class="summary-kicker">{{ $t('top.totalTraffic') }}</div>
            <div class="summary-main">{{ humanBytesString(currentTotalTraffic) }}</div>
          </q-card-section>
        </q-card>
      </section>

      <section v-if="topThree.length > 0" class="top-podium q-mb-lg">
        <q-card
          v-for="row in topThree"
          :key="row.rank + row.login + row.traffic"
          flat
          bordered
          class="top-card top-podium-item"
          :class="'top-podium-item--rank' + row.rank"
        >
          <q-card-section>
            <div class="leader-card-head">
              <div class="rank-pill">#{{ row.rank }}</div>
              <div v-if="row.rank === 1" class="top-one-badge">
                <q-icon name="workspace_premium" size="16px" />
                <span>{{ $t('top.leader') }}</span>
              </div>
            </div>
            <div class="leader-name">{{ row.login }}</div>
            <div class="leader-traffic">{{ humanBytesString(Number(row.traffic)) }}</div>
            <div v-if="activeTab !== 'total'" class="leader-machines">
              <q-icon name="dns" size="16px" />
              <span>{{ formatNumber(row.machine) }} {{ $t('top.machines') }}</span>
            </div>

            <div class="leader-block q-mt-md">
              <stat-chip-list :label="$t('top.tools')" :rows="toolRows(row)" :machine-label="$t('top.machines')" :show-machines="activeTab !== 'total'" />
              <stat-chip-list :label="$t('top.sources')" :rows="sourceRows(row)" :machine-label="$t('top.machines')" :show-machines="activeTab !== 'total'" />
              <stat-chip-list :label="$t('top.attackers')" :rows="attackerRows(row)" :machine-label="$t('top.machines')" :show-machines="activeTab !== 'total'" />
              <stat-chip-list :label="$t('top.os')" :rows="osRows(row)" :machine-label="$t('top.machines')" machine-only />
            </div>
          </q-card-section>
        </q-card>
      </section>

      <section v-if="restItems.length > 0" class="top-rest-list">
        <q-card
          v-for="row in restItems"
          :key="row.rank + row.login + row.traffic"
          flat
          bordered
          class="top-card top-rest-item"
        >
          <q-card-section>
            <div class="rest-head">
              <span class="rank-pill">#{{ row.rank }}</span>
              <strong>{{ row.login }}</strong>
            </div>
            <div class="rest-metrics">
              <span>{{ humanBytesString(Number(row.traffic)) }}</span>
              <span v-if="activeTab !== 'total'">{{ formatNumber(row.machine) }} {{ $t('top.machines') }}</span>
            </div>
            <div class="rest-details q-mt-sm">
              <stat-chip-list :label="$t('top.tools')" :rows="toolRows(row)" :machine-label="$t('top.machines')" compact :show-machines="activeTab !== 'total'" />
              <stat-chip-list :label="$t('top.sources')" :rows="sourceRows(row)" :machine-label="$t('top.machines')" compact :show-machines="activeTab !== 'total'" />
              <stat-chip-list :label="$t('top.attackers')" :rows="attackerRows(row)" :machine-label="$t('top.machines')" compact :show-machines="activeTab !== 'total'" />
              <stat-chip-list :label="$t('top.os')" :rows="osRows(row)" :machine-label="$t('top.machines')" compact machine-only />
            </div>
          </q-card-section>
        </q-card>
      </section>

      <div v-if="currentData.length === 0" class="empty-state">
        {{ $t('sidebarStats.noStats') }}
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface MetricValue {
  traffic: string
  machine: number
}

interface DimensionValue {
  tool: string
  source?: string
  attacker?: string
  os?: string
  traffic: string
  machine: number
}

interface ChipRow {
  name: string
  detail?: string
  traffic: string
  machine: number
}

interface TopItem {
  rank: number
  login: string
  traffic: string
  machine: number
  byTool: Record<string, MetricValue>
  bySource: DimensionValue[]
  byAttacker: DimensionValue[]
  byOS: DimensionValue[]
}

interface LeaderboardApiUser {
  rank: number
  login: string
  totalTraffic: string
  machine: number
  trafficByTool?: Record<string, MetricValue>
  trafficBySource?: DimensionValue[]
  trafficByAttacker?: DimensionValue[]
  trafficByOs?: DimensionValue[]
}

const StatChipList = defineComponent({
  name: 'StatChipList',
  props: {
    label: { type: String, required: true },
    rows: { type: Array as () => ChipRow[], required: true },
    machineLabel: { type: String, required: true },
    compact: { type: Boolean, default: false },
    showMachines: { type: Boolean, default: true },
    machineOnly: { type: Boolean, default: false }
  },
  setup (props) {
    return () => {
      if (props.rows.length === 0) return null
      return h('div', { class: ['chip-list', props.compact ? 'chip-list--compact' : ''] }, [
        h('div', { class: 'chip-list-label' }, props.label),
        h('div', { class: 'chips' }, props.rows.map((row) => h('div', { class: 'stat-chip', key: `${row.detail || ''}:${row.name}` }, [
          h('div', { class: 'stat-chip-label' }, [
            h('span', { class: 'stat-chip-name' }, row.name),
            row.detail ? h('span', { class: 'stat-chip-detail' }, row.detail) : null
          ]),
          h('div', { class: ['stat-chip-values', props.machineOnly ? 'stat-chip-values--machine-only' : ''] }, [
            props.machineOnly
              ? null
              : h('strong', humanBytesString(Number(row.traffic))),
            (props.machineOnly || props.showMachines) && row.machine > 0
              ? h('em', `${formatNumber(row.machine)} ${props.machineLabel}`)
              : null
          ])
        ])))
      ])
    }
  }
})

const { t } = useI18n()
const activeTab = ref<'day' | 'week' | 'month' | 'total'>('day')
const loading = ref(false)

const topDay = ref<TopItem[]>([])
const topWeek = ref<TopItem[]>([])
const topMonth = ref<TopItem[]>([])
const topTotal = ref<TopItem[]>([])

const currentData = computed(() => {
  if (activeTab.value === 'day') return topDay.value
  if (activeTab.value === 'week') return topWeek.value
  if (activeTab.value === 'total') return topTotal.value
  return topMonth.value
})

const topThree = computed(() => currentData.value.slice(0, 3))
const restItems = computed(() => currentData.value.slice(3))
const currentTotalTraffic = computed(() => currentData.value.reduce((sum, item) => sum + Number(item.traffic || 0), 0))
const currentPeriodLabel = computed(() => t(`top.${activeTab.value}`))

function filterPositive (items: ChipRow[], limit = 4): ChipRow[] {
  return items
    .filter((item) => Number(item.traffic) > 0 || item.machine > 0)
    .sort((a, b) => Number(b.traffic) - Number(a.traffic))
    .slice(0, limit)
}

function filterMachines (items: ChipRow[], limit = 4): ChipRow[] {
  return items
    .filter((item) => item.machine > 0)
    .sort((a, b) => b.machine - a.machine)
    .slice(0, limit)
}

function toolRows (row: TopItem): ChipRow[] {
  return filterPositive(Object.entries(row.byTool || {}).map(([name, value]) => ({
    name,
    traffic: value.traffic,
    machine: value.machine || 0
  })))
}

function dimensionRows (items: DimensionValue[], field: 'source' | 'attacker' | 'os'): ChipRow[] {
  return filterPositive((items || []).map((item) => ({
    name: String(item[field] || '-'),
    detail: item.tool,
    traffic: item.traffic,
    machine: item.machine || 0
  })))
}

function sourceRows (row: TopItem): ChipRow[] {
  return dimensionRows(row.bySource, 'source')
}

function attackerRows (row: TopItem): ChipRow[] {
  return dimensionRows(row.byAttacker, 'attacker')
}

function osRows (row: TopItem): ChipRow[] {
  return filterMachines((row.byOS || []).map((item) => ({
    name: String(item.os || '-'),
    detail: item.tool,
    traffic: item.traffic,
    machine: item.machine || 0
  })))
}

function humanBytesString (bytes: number, dp = 1) {
  if (!Number.isFinite(bytes)) return '0 B'
  const thresh = 1024

  if (Math.abs(bytes) < thresh) {
    return `${bytes} B`
  }

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

function mapUser (item: LeaderboardApiUser): TopItem {
  return {
    rank: item.rank,
    login: item.login,
    traffic: item.totalTraffic,
    machine: item.machine || 0,
    byTool: item.trafficByTool || {},
    bySource: item.trafficBySource || [],
    byAttacker: item.trafficByAttacker || [],
    byOS: item.trafficByOs || []
  }
}

async function loadTop (force = false) {
  loading.value = true
  try {
    const data = await window.topAPI.getWeeklyTop(force)
    topDay.value = (data.day || []).map(mapUser)
    topWeek.value = (data.week || []).map(mapUser)
    topMonth.value = (data.month || []).map(mapUser)
    topTotal.value = (data.total || []).map(mapUser)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadTop()
})
</script>

<style scoped>
.top-page {
  max-width: 1380px;
  margin: 0 auto;
  color: var(--app-shell-text);
}

.top-header,
.leader-summary,
.leader-machines,
.rest-head,
.rest-metrics {
  display: flex;
  align-items: center;
}

.top-header {
  justify-content: space-between;
  gap: 16px;
}

.top-title {
  color: var(--app-shell-text);
}

.top-muted,
.summary-kicker,
.leader-machines,
.chip-list-label,
.stat-chip em,
.rest-metrics {
  color: var(--app-muted-text);
}

.top-tabs :deep(.q-tab) {
  color: var(--app-muted-text);
}

.top-tabs :deep(.q-tab--active) {
  color: var(--app-shell-text);
}

.top-tabs :deep(.q-tab__indicator) {
  background: var(--app-accent-warm);
}

.leader-summary {
  gap: 12px;
  max-width: 680px;
}

.leader-summary-card {
  flex: 1;
  border-radius: 8px;
  background: var(--app-panel-bg);
  border: 1px solid var(--app-panel-border);
}

.summary-kicker {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0;
}

.summary-main {
  margin-top: 6px;
  font-size: 22px;
  line-height: 1.1;
  font-weight: 800;
}

.top-podium {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.top-card {
  border-radius: 8px;
  background: var(--app-panel-bg);
  border: 1px solid var(--app-panel-border);
  content-visibility: auto;
  contain-intrinsic-size: 360px;
}

.top-podium-item {
  position: relative;
  min-height: 100%;
}

.top-podium-item--rank1 {
  border: 2px solid color-mix(in srgb, var(--app-accent-warm) 82%, var(--app-panel-border));
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--app-accent-warm) 14%, transparent), transparent 42%),
    var(--app-panel-bg);
  box-shadow: 0 10px 28px color-mix(in srgb, var(--app-accent-warm) 22%, transparent);
  order: 2;
}

.top-podium-item--rank2 {
  order: 1;
}

.top-podium-item--rank3 {
  order: 3;
}

.leader-card-head,
.top-one-badge {
  display: flex;
  align-items: center;
}

.leader-card-head {
  justify-content: space-between;
  gap: 12px;
}

.top-one-badge {
  gap: 5px;
  padding: 4px 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--app-accent-warm) 18%, transparent);
  color: var(--app-shell-text);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.rank-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--app-nav-active-bg);
  color: #fff;
  font-weight: 800;
}

.top-podium-item--rank1 .rank-pill {
  background: var(--app-accent-warm);
  color: #111;
}

.leader-name {
  margin-top: 14px;
  font-size: 20px;
  line-height: 1.15;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.leader-traffic {
  margin-top: 8px;
  font-size: 26px;
  line-height: 1.1;
  font-weight: 900;
  color: var(--app-accent-warm);
}

.leader-machines {
  gap: 6px;
  margin-top: 8px;
  font-size: 13px;
}

.leader-block,
.rest-details,
.chip-list {
  display: grid;
  gap: 8px;
}

.chip-list-label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0;
}

.chips {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.chip-list--compact .chips {
  grid-template-columns: 1fr;
}

.stat-chip {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  min-width: 0;
  min-height: 44px;
  padding: 10px 12px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--app-accent-cool) 9%, transparent);
  border: 1px solid color-mix(in srgb, var(--app-accent-cool) 16%, transparent);
}

.stat-chip-label,
.stat-chip-values {
  display: grid;
  min-width: 0;
}

.stat-chip-label {
  gap: 2px;
}

.stat-chip-values {
  justify-items: end;
  text-align: right;
  gap: 2px;
}

.stat-chip-name,
.stat-chip-detail,
.stat-chip strong,
.stat-chip em {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-chip-name {
  font-weight: 700;
  font-size: 13px;
  color: var(--app-shell-text);
}

.stat-chip strong {
  font-size: 14px;
  font-weight: 800;
  color: var(--app-accent-warm);
}

.stat-chip-detail,
.stat-chip em {
  font-style: normal;
  font-size: 11px;
  color: var(--app-muted-text);
}

.chip-empty {
  color: var(--app-muted-text);
  font-size: 12px;
}

:deep(.chip-list) {
  display: grid;
  gap: 8px;
}

:deep(.chip-list-label) {
  color: var(--app-muted-text);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

:deep(.chips) {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

:deep(.stat-chip) {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  min-width: 0;
  min-height: 44px;
  padding: 10px 12px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--app-accent-cool) 9%, transparent);
  border: 1px solid color-mix(in srgb, var(--app-accent-cool) 16%, transparent);
}

:deep(.stat-chip-label),
:deep(.stat-chip-values) {
  display: grid;
  min-width: 0;
}

:deep(.stat-chip-label) {
  gap: 2px;
}

:deep(.stat-chip-values) {
  justify-items: end;
  text-align: right;
  gap: 2px;
}

:deep(.stat-chip-name),
:deep(.stat-chip-detail),
:deep(.stat-chip strong),
:deep(.stat-chip em) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.stat-chip-name) {
  font-size: 13px;
  font-weight: 700;
  color: var(--app-shell-text);
}

:deep(.stat-chip strong) {
  font-size: 14px;
  font-weight: 800;
  color: var(--app-accent-warm);
}

:deep(.stat-chip-detail),
:deep(.stat-chip em) {
  font-size: 11px;
  font-style: normal;
  color: var(--app-muted-text);
}

:deep(.stat-chip-values--machine-only em) {
  color: var(--app-accent-warm);
  font-size: 14px;
  font-weight: 800;
}

.top-rest-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.rest-head,
.rest-metrics {
  justify-content: space-between;
  gap: 12px;
}

.rest-head strong {
  min-width: 0;
  overflow-wrap: anywhere;
  text-align: right;
}

.rest-metrics {
  margin-top: 10px;
  font-weight: 700;
}

.empty-state {
  padding: 24px;
  text-align: center;
  color: var(--app-muted-text);
}

@media (max-width: 1180px) {
  .top-podium,
  .top-rest-list {
    grid-template-columns: 1fr;
  }

  .top-podium-item--rank1,
  .top-podium-item--rank2,
  .top-podium-item--rank3 {
    order: initial;
  }
}

@media (max-width: 760px) {
  .leader-summary {
    display: grid;
  }

  .chips {
    grid-template-columns: 1fr;
  }
}
</style>
