<template>
  <q-card flat bordered class="row bg-transparent full-height items-stretch" style="height: 100%;">
    <div class="stat-icon-box">
      <q-icon name="fa-solid fa-arrow-up"></q-icon>
    </div>
    <div class="col q-pa-sm">
      <div class="text-caption text-uppercase text-bold text-grey">
        {{ $t("dashboard.bytes") }}
        <q-icon name="info" size="20px" style="margin-bottom: 3px"
          ><q-tooltip style="width: 400px">
            {{ $t("dashboard.bytesHint") }}</q-tooltip
          ></q-icon
        >
      </div>
      <div class="row q-mt-xs" style="gap: 6px;">
        <div class="col metric-card">
          <div class="metric-label">{{ $t("dashboard.bytesSentLabel") }}</div>
          <div class="metric-value">{{ humanBytesString(totalBytesSend, 1, locale) }}</div>
        </div>
        <div class="col metric-card">
          <div class="metric-label">{{ $t("dashboard.bytesSpeedLabel") }}</div>
          <div class="metric-value">{{ humanBitsString(bps * 8, 1, locale) }}</div>
        </div>
        <div class="col metric-card" v-if="totalStatisticsAvailable">
          <div class="metric-label">{{ $t("dashboard.bytesCreditedLabel") }}</div>
          <div class="metric-value">{{ humanBytesString(totalBytesSendFromAllTools, 1, locale) }}</div>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script lang="ts" setup>
import { humanBytesString, humanBitsString, isSameDay } from 'app/lib/utils/trafficUnits'
import {
  ModuleExecutionStatisticsEventData
} from 'app/lib/module/module'
import { IpcRendererEvent } from 'electron'
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCorpusStats } from 'src/composables/useCorpusStats'

const { locale } = useI18n()

const totalBytesSend = ref(0)
const bps = ref(0)
let lastEventTimestamp = 0

function onStatisticsUpdate (
  _e: IpcRendererEvent,
  data: ModuleExecutionStatisticsEventData
) {
  if (lastEventTimestamp && !isSameDay(lastEventTimestamp, data.timestamp)) {
    totalBytesSend.value = 0
  }
  lastEventTimestamp = data.timestamp
  totalBytesSend.value += data.bytesSend
  bps.value = data.currentSendBitrate
}

async function loadLastStatistics () {
  const state = await window.executionEngineAPI.getState()
  if (state.statistics.length > 0) {
    const lastStatistics = state.statistics[state.statistics.length - 1]
    lastEventTimestamp = lastStatistics.timestamp
    if (isSameDay(lastEventTimestamp, Date.now())) {
      totalBytesSend.value = state.statisticsTotals.totalBytesSent
    }
    bps.value = lastStatistics.currentSendBitrate
  }
}

const {
  totalTraffic: totalBytesSendFromAllTools,
  hasData: totalStatisticsAvailable
} = useCorpusStats()

onMounted(async () => {
  await loadLastStatistics()
  window.executionEngineAPI.listenForStatistics(onStatisticsUpdate)
})

onUnmounted(() => {
  window.executionEngineAPI.stopListeningForStatistics(onStatisticsUpdate)
})
</script>

<style scoped>
.metric-card {
  border: 1px solid var(--app-soft-border);
  border-radius: 8px;
  padding: 5px 9px;
  min-width: 80px;
  background: var(--app-soft-surface);
}

.metric-label {
  font-size: 11px;
  letter-spacing: 0;
  text-transform: uppercase;
  color: var(--app-muted-text);
}

.metric-value {
  font-size: 14px;
  font-weight: 700;
}
</style>
