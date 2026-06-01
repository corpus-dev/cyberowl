<template>
  {{ $t("layout.runTime") }}: {{ uptime }} | {{ userName + " | " + selectedModule }} |
  <span
    :class="
      moduleState == 'RUNNING'
        ? 'text-positive'
        : moduleState == 'ERROR'
        ? 'text-negative'
        : ''
    "
    >{{ moduleStateLabel }}</span
  >
  | {{ moduleTraffic }} | {{ moduleTotalBytesSend }}
</template>

<script setup lang="ts">
import { humanBytesString, formatUptime } from 'app/lib/utils/trafficUnits'
import { ModuleExecutionStatisticsEventData } from 'app/lib/module/module'
import { ExecutionLogEntry } from 'app/src-electron/handlers/engine'
import { IpcRendererEvent } from 'electron/renderer'
import { useI18n } from 'vue-i18n'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useCorpusStats } from 'src/composables/useCorpusStats'

const { t, locale } = useI18n()
const selectedModule = ref('')
const moduleState = ref('')
const moduleTraffic = ref('')
const uptime = ref('00:00:00')
let uptimeTick: number | undefined
let appStartTime = 0
const { login, totalTraffic, hasData } = useCorpusStats()
const userName = computed(() => login.value)
const moduleTotalBytesSend = computed(() => hasData.value ? humanBytesString(totalTraffic.value, 1, locale.value) : '')
const moduleStateLabel = computed(() => {
  if (moduleState.value === 'RUNNING') return t('layout.running')
  if (moduleState.value === 'ERROR') return t('layout.error')
  return t('layout.idle')
})

async function loadInitialState () {
  const executionEngineState = await window.executionEngineAPI.getState()
  selectedModule.value = executionEngineState.moduleToRun || ''
  moduleState.value = executionEngineState.run ? 'RUNNING' : 'IDLE'

  appStartTime = executionEngineState.appStartTime
  uptime.value = formatUptime(appStartTime)

  let bitrate = 0
  if (executionEngineState.statistics.length > 0) {
    bitrate =
      executionEngineState.statistics[
        executionEngineState.statistics.length - 1
      ].currentSendBitrate
  }
  moduleTraffic.value = humanBytesString(bitrate, 1, locale.value) + '/s'
}

function onExecutionLog (_e: IpcRendererEvent, data: ExecutionLogEntry) {
  selectedModule.value = data.moduleName
  if (data.type === 'STARTED') {
    moduleState.value = 'RUNNING'
  } else if (data.type === 'STOPPED') {
    moduleState.value = 'IDLE'
  } else if (data.type === 'ERROR') {
    moduleState.value = 'ERROR'
  }
}

function onStatisticsUpdate (
  _e: IpcRendererEvent,
  data: ModuleExecutionStatisticsEventData
) {
  moduleTraffic.value = humanBytesString(data.currentSendBitrate, 1, locale.value) + '/s'
}

onMounted(async () => {
  window.executionEngineAPI.listenForStatistics(onStatisticsUpdate)
  window.executionEngineAPI.listenForExecutionLog(onExecutionLog)
  await loadInitialState()
  uptimeTick = window.setInterval(() => {
    uptime.value = formatUptime(appStartTime)
  }, 1000)
})

onUnmounted(() => {
  if (uptimeTick !== undefined) {
    clearInterval(uptimeTick)
    uptimeTick = undefined
  }
  window.executionEngineAPI.stopListeningForExecutionLog(onExecutionLog)
  window.executionEngineAPI.stopListeningForStatistics(onStatisticsUpdate)
})
</script>
