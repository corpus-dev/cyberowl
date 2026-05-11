<template>
  <q-page class="">
    <q-card flat class="bg-transparent">
      <q-card-section>
        <div class="text-h6">{{ $t("settings.system") }}</div>
        <q-separator class="q-mt-xs q-mb-xs" />
        <q-item
          class=""
          v-ripple
          clickable
          @click="setSystemAutoUpdate(!systemAutoUpdate)"
        >
          <q-item-section>
            <q-item-label>{{ $t("settings.autoUpdates") }}</q-item-label>
            <q-item-label caption>{{
              $t("settings.autoUpdatesDescription")
            }}</q-item-label>
          </q-item-section>
          <q-item-section side top>
            <q-toggle
              color="primary"
              v-model="systemAutoUpdate"
              @update:model-value="setSystemAutoUpdate"
            />
          </q-item-section>
        </q-item>

        <q-item
          class=""
          v-ripple
          clickable
          @click="setSystemAutoStartup(!systemAutoStartup)"
        >
          <q-item-section>
            <q-item-label>{{ $t("settings.autoStartup") }}</q-item-label>
            <q-item-label caption>{{
              $t("settings.autoStartupDescription")
            }}</q-item-label>
          </q-item-section>
          <q-item-section side top>
            <q-toggle
              color="primary"
              v-model="systemAutoStartup"
              @update:model-value="setSystemAutoStartup"
            />
          </q-item-section>
        </q-item>

        <q-item
          class=""
          v-ripple
          clickable
          @click="setSystemHideInTray(!systemHideInTray)"
        >
          <q-item-section>
            <q-item-label>{{ $t("settings.hideTray") }}</q-item-label>
            <q-item-label caption>{{
              $t("settings.hideTrayDescription")
            }}</q-item-label>
          </q-item-section>
          <q-item-section side top>
            <q-toggle
              color="primary"
              v-model="systemHideInTray"
              @update:model-value="setSystemHideInTray"
            />
          </q-item-section>
        </q-item>

        <div class="q-pt-sm">
          <div class="text-h6">{{ $t("settings.language") }}</div>
          <q-separator class="q-mt-xs q-mb-sm" />
          <LanguageSelectorComponent />
        </div>
      </q-card-section>

      <!-- TODO Schedule -->

      <!-- <q-card-section>
                <div class="text-h5">Schedule</div>
                <q-separator class="q-mt-xs q-mb-xs"/>
                <q-item class="" v-ripple clickable @click="setSystemSheduleEnabled(!systemSheduleEnabled)" disable>
                    <q-item-section>
                        <q-item-label>Enable</q-item-label>
                        <q-item-label caption>Enable or disable sheduler. It changes behaviour of the tool in specified hour (for example during the work you can lower resource usage)</q-item-label>
                    </q-item-section>
                    <q-item-section side top>
                        <q-toggle color="primary" v-model="systemSheduleEnabled" @update:model-value="setSystemSheduleEnabled" disable/>
                    </q-item-section>
                </q-item>
                <div class="row fit q-mt-sm">
                    <div class="col-6 q-pr-xs">
                        <q-input outlined v-model="sheduleStartTime" mask="time" :rules="['time']" label="Start time" :disable="!systemSheduleEnabled">
                            <template v-slot:append>
                            <q-icon name="access_time" class="cursor-pointer">
                                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-time v-model="sheduleStartTime">
                                    <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Close" color="primary" flat />
                                    </div>
                                </q-time>
                                </q-popup-proxy>
                            </q-icon>
                            </template>
                        </q-input>
                    </div>

                    <div class="col-6 q-pl-xs">
                        <q-input outlined v-model="sheduleEndTime" mask="time" :rules="['time']" label="End time" :disable="!systemSheduleEnabled">
                            <template v-slot:append>
                            <q-icon name="access_time" class="cursor-pointer">
                                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-time v-model="sheduleEndTime">
                                    <div class="row items-center justify-end">
                                    <q-btn v-close-popup label="Close" color="primary" flat />
                                    </div>
                                </q-time>
                                </q-popup-proxy>
                            </q-icon>
                            </template>
                        </q-input>
                    </div>
                </div>
                <q-select outlined v-model="sheduleActivity" type="number" class="" :options="sheduleActivityOptions" @update:model-value="setSheduleActivity" label="Replacing activity" :disable="!systemSheduleEnabled" />
            </q-card-section> -->

      <!-- END TODO -->

      <!-- TODO: ID та API Key — тимчасово прибрано до відновлення серверу статистики -->
      <!--
      <q-card-section>
        <div class="text-h6">{{ $t("layout.appName") }}</div>
        <span
          >{{ $t("settings.idDescription") }}
          <a
            href="https://github.com/corpus-dev/cyberowl/blob/main/statistics.md"
            target="_blank"
            rel="noopener noreferrer"
            >https://github.com/corpus-dev/cyberowl/blob/main/statistics.md</a
          >
        </span>
        <q-separator class="q-mt-xs q-mb-sm" />
        <q-input
          outlined
          label="Corpus ID"
          v-model="corpusUUID"
          @update:model-value="setCorpusUUID"
          debounce="500"
          type="number"
        />
        <q-input
          outlined
          label="Corpus API Key"
          class="q-mt-sm"
          v-model="corpusAPIKey"
          @update:model-value="setCorpusAPIKey"
          debounce="500"
          type="password"
        />
      </q-card-section>
      -->

      <q-card-section>
        <div class="text-h6">{{ $t("settings.look") }}</div>
        <q-separator class="q-mt-xs q-mb-xs" />
        <q-item>
          <q-item-section>
            <q-item-label>{{ $t("settings.theme") }}</q-item-label>
          </q-item-section>
          <q-item-section side top>
            <q-select
              dense
              outlined
              emit-value
              map-options
              style="min-width: 180px"
              :model-value="selectedThemeId"
              :options="themeOptions"
              @update:model-value="setTheme"
              label="Theme"
            />
          </q-item-section>
        </q-item>
      </q-card-section>

      <q-card-section>
        <div class="text-h6">{{ $t("settings.data") }}</div>
        <q-separator class="q-mt-xs q-mb-xs" />
        <div>
          <span class="">{{ $t("settings.dataDescription") }}</span>
          <b>{{ modulesDataFolderPath }}</b>
        </div>
        <q-btn
          outline
          :label="$t('settings.openDataFolder')"
          class="fit q-mt-sm"
          @click="openModulesDataFolder"
        />
        <q-btn
          outline
          :label="$t('settings.changeModulesDataLocation')"
          class="fit q-mt-sm"
          @click="selectFolderForModulesData"
        />
        <q-btn
          outline
          :label="$t('settings.deleteStatistics')"
          color="negative"
          class="fit q-mt-sm"
          @click="deleteStatisticsDialog = true"
        />
        <q-btn
          outline
          :label="$t('settings.deleteModulesCache')"
          color="negative"
          class="fit q-mt-sm"
          @click="deleteModuelsCacheDialog = true"
        />
        <q-btn
          outline
          :label="$t('settings.deleteAllTheData')"
          color="negative"
          class="fit q-mt-sm"
          @click="deleteAllDataDialog = true"
        />
      </q-card-section>
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium">{{ $t("settings.diagnostics.title") }}</div>
        <div class="text-caption text-grey-7 q-mt-xs">
          {{ $t("settings.diagnostics.description") }}
        </div>
        <div class="row q-gutter-sm q-mt-sm">
          <q-btn
            outline
            dense
            no-caps
            size="sm"
            icon="folder_open"
            :label="$t('settings.diagnostics.openProfileFolder')"
            @click="openProfileFolder"
          />
          <q-btn
            outline
            dense
            no-caps
            size="sm"
            icon="description"
            :label="$t('settings.diagnostics.openStabilityLog')"
            @click="openStabilityLog"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-page>

  <q-dialog v-model="deleteStatisticsDialog">
    <q-card class="q-pa-md" flat style="border: solid 3px red">
      <q-card-section class="text-center text-h5 text-bold">
        {{ $t("settings.warnDelStatistics") }}
      </q-card-section>
      <q-card-actions>
        <q-btn
          label="Delete"
          class="fit"
          color="negative"
          outline
          @click="deleteStatistics"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="deleteModulesCacheDialog">
    <q-card class="q-pa-md" flat style="border: solid 3px red">
      <q-card-section class="text-center text-h5 text-bold">
        {{ $t("settings.warnDelCache") }}
      </q-card-section>
      <q-card-actions>
        <q-btn
          label="Delete"
          class="fit"
          color="negative"
          outline
          @click="deleteModulesCache"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="deleteAllDataDialog">
    <q-card class="q-pa-md" flat style="border: solid 3px red">
      <q-card-section class="text-center text-h5 text-bold">
        {{ $t("settings.warnDelData") }}
      </q-card-section>
      <q-card-actions>
        <q-btn
          label="Delete"
          class="fit"
          color="negative"
          outline
          @click="deleteAllData"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>


</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar'
import LanguageSelectorComponent from './settings/LanguageSelectorComponent.vue'

import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useAppearanceStore } from 'src/appearance/store'


const $q = useQuasar()
const { t } = useI18n()
const appearanceStore = useAppearanceStore()

const systemAutoUpdate = ref(true)
async function setSystemAutoUpdate (newValue: boolean) {
  await window.settingsAPI.system.setAutoUpdate(newValue)
  systemAutoUpdate.value = newValue
}

const systemAutoStartup = ref(true)
async function setSystemAutoStartup (newValue: boolean) {
  await window.settingsAPI.system.setStartOnBoot(newValue)
  systemAutoStartup.value = newValue
}

const systemHideInTray = ref(true)
async function setSystemHideInTray (newValue: boolean) {
  await window.settingsAPI.system.setHideInTray(newValue)
  systemHideInTray.value = newValue
}

const modulesDataFolderPath = ref('')
async function selectFolderForModulesData () {
  await window.settingsAPI.modules.promptForDataPath()
  await loadSettings()
}
async function openModulesDataFolder () {
  await window.settingsAPI.modules.openDataFolder()
}

async function openProfileFolder () {
  await window.helpersAPI.openProfileFolder()
}
async function openStabilityLog () {
  await window.helpersAPI.openStabilityLog()
}
const corpusUUID = ref('')
async function setCorpusUUID (newValue: string | number | null) {
  await window.settingsAPI.corpus.setUUID(String(newValue))
}

const corpusAPIKey = ref('')
async function setCorpusAPIKey (newValue: string | number | null) {
  await window.settingsAPI.corpus.setAPIKey(String(newValue).replace(/\s/g, ''))
}

const deleteStatisticsDialog = ref(false)
async function deleteStatistics () {
  await window.executionEngineAPI.deleteStatistics()
  deleteStatisticsDialog.value = false
}

const deleteModulesCacheDialog = ref(false)
async function deleteModulesCache () {
  await window.settingsAPI.modules.deleteData()
  $q.notify({
    color: 'negative',
    textColor: 'white',
    message: t('settings.dataDeleted'),
    icon: 'warning',
    position: 'bottom'
  })
}

const deleteAllDataDialog = ref(false)
async function deleteAllData () {
  await window.settingsAPI.deleteData()
  deleteAllDataDialog.value = false
}

const themeOptions = ref<Array<{label: string, value: string}>>([
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' }
])

const selectedThemeId = ref(appearanceStore.themeId)
async function setTheme (themeId: string) {
  await appearanceStore.setTheme(themeId)
  appearanceStore.applyRuntimeAppearance($q.dark)
  selectedThemeId.value = appearanceStore.themeId
}

async function loadSettings () {
  const settings = await window.settingsAPI.get()
  systemAutoUpdate.value = settings.system.autoUpdate
  systemAutoStartup.value = settings.system.startOnBoot
  systemHideInTray.value = settings.system.hideInTray
  modulesDataFolderPath.value = settings.modules.dataPath
  corpusUUID.value = settings.corpus.uuid
  corpusAPIKey.value = settings.corpus.apiKey
  appearanceStore.hydrate(settings.gui)
  selectedThemeId.value = appearanceStore.themeId
}

onMounted(async () => {
  await loadSettings()
})
</script>
