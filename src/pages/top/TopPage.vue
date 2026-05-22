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
        <div class="top-podium">
          <q-card
            v-for="row in topThree"
            :key="row.login + row.traffic"
            flat
            bordered
            class="top-podium-item"
            :class="'top-podium-item--rank' + row.rank"
          >
            <div class="top-podium-rank">#{{ row.rank }}</div>

            <div class="top-podium-name">{{ row.login }}</div>

           <div class="top-podium-label">Traffic</div>
            <div class="top-podium-traffic">{{ humanBytesString(sumTraffic(row)) }}</div>

            <div class="top-podium-label">Tools</div>
            <div class="top-podium-tools">
              <div v-for="(bytes, tool) in row.byTool" :key="tool">{{ tool }}: {{ humanBytesString(Number(bytes)) }}</div>
            </div>

            <div class="top-podium-label">Source</div>
            <div class="top-podium-source">
              <div v-for="(bytes, source) in row.bySource" :key="source">{{ source }}: {{ humanBytesString(Number(bytes)) }}</div>
            </div>
          </q-card>
        </div>

        <div v-if="restItems.length > 0" class="top-rest-list">
          <q-card
            v-for="row in restItems"
            :key="row.login + row.traffic"
            flat
            bordered
            class="top-rest-item"
          >
            <div class="top-rest-rank">#{{ row.rank }}</div>

            <div class="top-rest-label">Name</div>
            <div class="top-rest-name">{{ row.login }}</div>

            <div class="top-rest-label">Traffic</div>
            <div class="top-rest-traffic">{{ humanBytesString(sumTraffic(row)) }}</div>

            <div class="top-rest-label">Tools</div>
            <div class="top-rest-tools">
              <div v-for="(bytes, tool) in row.byTool" :key="tool">{{ tool }}: {{ humanBytesString(Number(bytes)) }}</div>
            </div>

            <div class="top-rest-label">Source</div>
            <div class="top-rest-source">
              <div v-for="(bytes, source) in row.bySource" :key="source">{{ source }}: {{ humanBytesString(Number(bytes)) }}</div>
            </div>
          </q-card>
        </div>
      </q-tab-panel>

      <q-tab-panel name="week" class="bg-transparent">
        <div class="top-podium">
          <q-card
            v-for="row in topThree"
            :key="row.login + row.traffic"
            flat
            bordered
            class="top-podium-item"
            :class="'top-podium-item--rank' + row.rank"
          >
            <div class="top-podium-rank">#{{ row.rank }}</div>

            <div class="top-podium-name">{{ row.login }}</div>

            <div class="top-podium-label">Traffic</div>
            <div class="top-podium-traffic">{{ humanBytesString(sumTraffic(row)) }}</div>

            <div class="top-podium-label">Tools</div>
            <div class="top-podium-tools">
              <div v-for="(bytes, tool) in row.byTool" :key="tool">{{ tool }}: {{ humanBytesString(Number(bytes)) }}</div>
            </div>

            <div class="top-podium-label">Source</div>
            <div class="top-podium-source">
              <div v-for="(bytes, source) in row.bySource" :key="source">{{ source }}: {{ humanBytesString(Number(bytes)) }}</div>
            </div>
          </q-card>
        </div>

        <div v-if="restItems.length > 0" class="top-rest-list">
          <q-card
            v-for="row in restItems"
            :key="row.login + row.traffic"
            flat
            bordered
            class="top-rest-item"
          >
            <div class="top-rest-rank">#{{ row.rank }}</div>

            <div class="top-rest-label">Name</div>
            <div class="top-rest-name">{{ row.login }}</div>

            <div class="top-rest-label">Traffic</div>
            <div class="top-rest-traffic">{{ humanBytesString(sumTraffic(row)) }}</div>

            <div class="top-rest-label">Tools</div>
            <div class="top-rest-tools">
              <div v-for="(bytes, tool) in row.byTool" :key="tool">{{ tool }}: {{ humanBytesString(Number(bytes)) }}</div>
            </div>

            <div class="top-rest-label">Source</div>
            <div class="top-rest-source">
              <div v-for="(bytes, source) in row.bySource" :key="source">{{ source }}: {{ humanBytesString(Number(bytes)) }}</div>
            </div>
          </q-card>
        </div>
      </q-tab-panel>

      <q-tab-panel name="month" class="bg-transparent">
        <div class="top-podium">
          <q-card
            v-for="row in topThree"
            :key="row.login + row.traffic"
            flat
            bordered
            class="top-podium-item"
            :class="'top-podium-item--rank' + row.rank"
          >
            <div class="top-podium-rank">#{{ row.rank }}</div>

            <div class="top-podium-name">{{ row.login }}</div>

            <div class="top-podium-label">Traffic</div>
            <div class="top-podium-traffic">{{ humanBytesString(sumTraffic(row)) }}</div>

            <div class="top-podium-label">Tools</div>
            <div class="top-podium-tools">
              <div v-for="(bytes, tool) in row.byTool" :key="tool">{{ tool }}: {{ humanBytesString(Number(bytes)) }}</div>
            </div>

            <div class="top-podium-label">Source</div>
            <div class="top-podium-source">
              <div v-for="(bytes, source) in row.bySource" :key="source">{{ source }}: {{ humanBytesString(Number(bytes)) }}</div>
            </div>
          </q-card>
        </div>

        <div v-if="restItems.length > 0" class="top-rest-list">
          <q-card
            v-for="row in restItems"
            :key="row.login + row.traffic"
            flat
            bordered
            class="top-rest-item"
          >
            <div class="top-rest-rank">#{{ row.rank }}</div>

            <div class="top-rest-label">Name</div>
            <div class="top-rest-name">{{ row.login }}</div>

            <div class="top-rest-label">Traffic</div>
            <div class="top-rest-traffic">{{ humanBytesString(sumTraffic(row)) }}</div>

            <div class="top-rest-label">Tools</div>
            <div class="top-rest-tools">
              <div v-for="(bytes, tool) in row.byTool" :key="tool">{{ tool }}: {{ humanBytesString(Number(bytes)) }}</div>
            </div>

            <div class="top-rest-label">Source</div>
            <div class="top-rest-source">
              <div v-for="(bytes, source) in row.bySource" :key="source">{{ source }}: {{ humanBytesString(Number(bytes)) }}</div>
            </div>
          </q-card>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const activeTab = ref('day')

function humanBytesString (bytes: number, dp = 1) {
  const thresh = 1024

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B'
  }

  const units = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
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

interface TopItem {
  rank: number
  login: string
  traffic: number
  byTool: Record<string, string>
  byOS: Record<string, string>
  bySource: Record<string, string>
}

function sumTraffic (item: TopItem): number {
  return Object.values(item.byTool).reduce((sum, bytes) => sum + Number(bytes), 0)
}

const topDay = ref<TopItem[]>([])
const topWeek = ref<TopItem[]>([])
const topMonth = ref<TopItem[]>([])

const currentData = computed(() => {
  if (activeTab.value === 'day') return topDay.value
  if (activeTab.value === 'week') return topWeek.value
  return topMonth.value
})

const topThree = computed(() => currentData.value.filter((item) => item.rank <= 3))
const restItems = computed(() => currentData.value.filter((item) => item.rank > 3))

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
.top-podium {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.top-podium-item {
  padding: 24px 16px;
  border-radius: 16px;
  background: var(--app-soft-surface);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--app-soft-border);
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
}

.top-podium-item--rank1 {
  border-color: var(--app-accent-warm);
  box-shadow: 0 8px 32px color-mix(in srgb, var(--app-accent-warm) 30%, transparent);
  background: color-mix(in srgb, var(--app-accent-warm) 8%, var(--app-soft-surface));
  order: 2;
}

.top-podium-item--rank1 .top-podium-rank {
  background: var(--app-accent-warm);
  color: #111;
  font-size: 14px;
  padding: 4px 12px;
  border-radius: 10px;
}

.top-podium-item--rank1 .top-podium-name {
  color: var(--app-accent-warm);
  font-size: 18px;
}

.top-podium-item--rank2 {
  border-color: color-mix(in srgb, var(--app-accent-warm) 40%, transparent);
  order: 1;
}

.top-podium-item--rank2 .top-podium-rank {
  background: color-mix(in srgb, var(--app-accent-warm) 70%, #111);
}

.top-podium-item--rank3 {
  border-color: color-mix(in srgb, var(--app-accent-warm) 25%, transparent);
  order: 3;
}

.top-podium-item--rank3 .top-podium-rank {
  background: color-mix(in srgb, var(--app-accent-warm) 50%, #111);
}

.top-podium-rank {
  position: absolute;
  top: 12px;
  left: 12px;
  background: var(--app-muted-text);
  color: #fff;
  font-weight: 800;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 8px;
}

.top-podium-label {
  font-size: 11px;
  text-transform: uppercase;
  color: var(--app-muted-text);
  margin-bottom: 1px;
  letter-spacing: 0.3px;
}

.top-podium-name {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--app-shell-text);
}

.top-podium-traffic {
  font-size: 15px;
  font-weight: 600;
  color: var(--app-shell-text);
}

.top-podium-tools {
  font-size: 12px;
  color: #1a1a1a;
  word-break: break-word;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-weight: 600;
}

.top-podium-source {
  font-size: 12px;
  color: #1a1a1a;
  word-break: break-word;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-weight: 600;
}

.top-rest-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.top-rest-item {
  padding: 12px;
  border-radius: 12px;
  background: var(--app-soft-surface);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--app-soft-border);
  text-align: center;
  position: relative;
  transition: all 0.2s ease;
}

.top-rest-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.top-rest-rank {
  position: absolute;
  top: 8px;
  left: 8px;
  background: var(--app-muted-text);
  color: #fff;
  font-weight: 800;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 6px;
}

.top-rest-label {
  font-size: 10px;
  text-transform: uppercase;
  color: var(--app-muted-text);
  margin-bottom: 1px;
  letter-spacing: 0.3px;
}

.top-rest-name {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--app-shell-text);
  word-break: break-word;
}

.top-rest-traffic {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--app-shell-text);
}

.top-rest-tools {
  font-size: 11px;
  color: #1a1a1a;
  word-break: break-word;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-weight: 600;
}

.top-rest-source {
  font-size: 11px;
  color: #1a1a1a;
  word-break: break-word;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-weight: 600;
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

@media (max-width: 1400px) {
  .top-podium {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .top-rest-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .top-podium {
    grid-template-columns: 1fr;
    max-width: 320px;
    margin-left: auto;
    margin-right: auto;
  }

  .top-podium-item--rank1 {
    order: 1;
  }

  .top-podium-item--rank2 {
    order: 2;
  }

  .top-podium-item--rank3 {
    order: 3;
  }

  .top-rest-list {
    grid-template-columns: 1fr;
  }
}
</style>
