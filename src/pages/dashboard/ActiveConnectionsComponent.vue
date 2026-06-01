<template>
  <q-card flat bordered class="row bg-transparent full-height items-stretch" style="height: 100%;">
    <div class="stat-icon-box">
      <q-icon name="fa-solid fa-plug"></q-icon>
    </div>
    <div class="col q-pa-sm">
      <div class="text-caption text-uppercase text-bold text-grey">
        {{ $t("dashboard.connections") }}
      </div>
      <div class="text-subtitle1 text-bold">
        <template v-if="moduleRunning">
          {{ activeConnections ?? '—' }}
        </template>
        <template v-else>
          —
        </template>
      </div>
    </div>
  </q-card>
</template>

<script lang="ts" setup>
import { ModuleExecutionStatisticsEventData } from 'app/lib/module/module'
import { IpcRendererEvent } from 'electron'
import { onMounted, onUnmounted, ref } from 'vue'

interface ExecutionLogEntry {
  type: 'STARTED' | 'STOPPED' | 'ERROR';
  moduleName: string;
}

const moduleName = ref('')
const moduleRunning = ref(false)
const activeConnections = ref<number | undefined>()

function onStatisticsUpdate (
  _e: IpcRendererEvent,
  data: ModuleExecutionStatisticsEventData
) {
  activeConnections.value = data.activeConnections
}

function onExecutionLog (_e: IpcRendererEvent, data: ExecutionLogEntry) {
  if (data.type === 'STARTED') {
    moduleRunning.value = true
    moduleName.value = data.moduleName
  } else if (data.type === 'STOPPED' || data.type === 'ERROR') {
    moduleRunning.value = false
    activeConnections.value = undefined
  }
}

async function loadInitialState () {
  const state = await window.executionEngineAPI.getState()
  moduleRunning.value = state.run
  moduleName.value = state.moduleToRun || ''

  if (state.statistics.length > 0) {
    const last = state.statistics[state.statistics.length - 1]
    activeConnections.value = last.activeConnections
  }
}

onMounted(async () => {
  await loadInitialState()
  window.executionEngineAPI.listenForStatistics(onStatisticsUpdate)
  window.executionEngineAPI.listenForExecutionLog(onExecutionLog)
})

onUnmounted(() => {
  window.executionEngineAPI.stopListeningForStatistics(onStatisticsUpdate)
  window.executionEngineAPI.stopListeningForExecutionLog(onExecutionLog)
})
</script>
