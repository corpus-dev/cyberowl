<template>
  <q-page padding>
    <div class="text-h4 text-center text-bold q-mb-md top-title">
      {{ $t("top.volunteers") }}
    </div>
    <q-tabs v-model="activeTab" dense class="top-tabs">
      <q-tab name="day" :label="$t('top.day')" />
      <q-tab name="week" :label="$t('top.week')" />
      <q-tab name="month" :label="$t('top.month')" />
    </q-tabs>

    <q-separator class="q-mb-sm" />

    <q-tab-panels v-model="activeTab" animated class="bg-transparent">
      <q-tab-panel name="day" class="bg-transparent">
        <div class="top-list">
          <q-card
            v-for="row in topDay"
            :key="row.login + row.traffic"
            flat
            bordered
            class="top-list-item"
            :class="[row.rank === 1 ? 'top-list-item--rank1' : row.rank <= 3 ? 'top-list-item--rank2' : '']"
          >
            <div class="top-list-rank">#{{ row.rank }}</div>

            <div class="top-list-label">Name</div>
            <div class="top-list-value">{{ row.login }}</div>

            <div class="top-list-label">Traffic</div>
            <div class="top-list-value">{{ humanBytesString(row.traffic) }}</div>

            <div class="top-list-label">Tools</div>
            <div class="top-list-value">{{ formatTools(row.byTool) }}</div>
          </q-card>
        </div>
      </q-tab-panel>
      <q-tab-panel name="week" class="bg-transparent">
        <div class="top-list">
          <q-card
            v-for="row in topWeek"
            :key="row.login + row.traffic"
            flat
            bordered
            class="top-list-item"
            :class="[row.rank === 1 ? 'top-list-item--rank1' : row.rank <= 3 ? 'top-list-item--rank2' : '']"
          >
            <div class="top-list-rank">#{{ row.rank }}</div>

            <div class="top-list-label">Name</div>
            <div class="top-list-value">{{ row.login }}</div>

            <div class="top-list-label">Traffic</div>
            <div class="top-list-value">{{ humanBytesString(row.traffic) }}</div>

            <div class="top-list-label">Tools</div>
            <div class="top-list-value">{{ formatTools(row.byTool) }}</div>
          </q-card>
        </div>
      </q-tab-panel>
      <q-tab-panel name="month" class="bg-transparent">
        <div class="top-list">
          <q-card
            v-for="row in topMonth"
            :key="row.login + row.traffic"
            flat
            bordered
            class="top-list-item"
            :class="[row.rank === 1 ? 'top-list-item--rank1' : row.rank <= 3 ? 'top-list-item--rank2' : '']"
          >
            <div class="top-list-rank">#{{ row.rank }}</div>

            <div class="top-list-label">Name</div>
            <div class="top-list-value">{{ row.login }}</div>

            <div class="top-list-label">Traffic</div>
            <div class="top-list-value">{{ humanBytesString(row.traffic) }}</div>

            <div class="top-list-label">Tools</div>
            <div class="top-list-value">{{ formatTools(row.byTool) }}</div>
          </q-card>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const activeTab = ref('day')

function humanBytesString (bytes: number, dp = 1) {
  const thresh = 1024

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B'
  }

  const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  let u = -1
  const r = 10 ** dp

  do {
    bytes /= thresh
    ++u
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  )

  return bytes.toFixed(dp) + ' ' + units[u]
}

function formatTools (byTool: Record<string, string>): string {
  return Object.entries(byTool)
    .map(([tool, bytes]) => `${tool} (${humanBytesString(Number(bytes))})`)
    .join(', ')
}

interface TopItem {
  rank: number
  login: string
  traffic: number
  byTool: Record<string, string>
  byOS: Record<string, string>
  bySource: Record<string, string>
}

const topDay = ref<TopItem[]>([])
const topWeek = ref<TopItem[]>([])
const topMonth = ref<TopItem[]>([])

async function loadTop () {
  const data = await window.topAPI.getWeeklyTop()
  topDay.value = (data.day || []).map((item) => ({
    rank: item.rank,
    login: item.login,
    traffic: Number(item.traffic),
    byTool: item.byTool || {},
    byOS: item.byOS || {},
    bySource: item.bySource || {}
  }))
  topWeek.value = (data.week || []).map((item) => ({
    rank: item.rank,
    login: item.login,
    traffic: Number(item.traffic),
    byTool: item.byTool || {},
    byOS: item.byOS || {},
    bySource: item.bySource || {}
  }))
  topMonth.value = (data.month || []).map((item) => ({
    rank: item.rank,
    login: item.login,
    traffic: Number(item.traffic),
    byTool: item.byTool || {},
    byOS: item.byOS || {},
    bySource: item.bySource || {}
  }))
}

onMounted(async () => {
  await loadTop()
})
</script>

<style scoped>
.top-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.top-list-item {
  padding: 12px;
  border-radius: 12px;
  background: var(--app-soft-surface);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--app-soft-border);
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
}

.top-list-item--rank1 {
  border-color: var(--app-accent-warm);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--app-accent-warm) 25%, transparent);
}

.top-list-item--rank2 {
  border-color: color-mix(in srgb, var(--app-accent-warm) 35%, transparent);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--app-accent-warm) 12%, transparent);
}

.top-title {
  color: var(--app-shell-text);
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

.top-list-label {
  font-size: 12px;
  text-transform: uppercase;
  color: var(--app-muted-text);
  margin-bottom: 2px;
  letter-spacing: 0.4px;
}

.top-list-value {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
  word-break: break-word;
  color: var(--app-shell-text);
}

.top-list-rank {
  position: absolute;
  top: 8px;
  left: 8px;
  background: var(--app-accent-warm);
  color: #111;
  font-weight: 800;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 6px;
}

@media (max-width: 1400px) {
  .top-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .top-list {
    grid-template-columns: 1fr;
  }
}
</style>
