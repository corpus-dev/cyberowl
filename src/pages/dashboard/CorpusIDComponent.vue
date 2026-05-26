<template>
  <q-card flat bordered class="row bg-transparent full-height items-stretch" style="height: 100%;">
    <div class="stat-icon-box">
      <q-icon name="fa-solid fa-user"></q-icon>
    </div>
    <div class="col q-pa-sm">
      <div class="text-caption text-uppercase text-bold text-grey">
        Corpus ({{ configDetails }})

        <q-icon
          name="info"
          size="20px"
          style="margin-bottom: 2px"
          color="negative"
          v-if="corpusNameLoadError != ''"
          ><q-tooltip> {{ corpusNameLoadError }} </q-tooltip></q-icon
        >

        <q-icon
          name="info"
          size="20px"
          style="margin-bottom: 2px"
          color="info"
          v-if="corpusAPIKeyEmpty"
          ><q-tooltip>
            {{ $t("dashboard.corpusAPIKeyEmpty") }}
          </q-tooltip></q-icon
        >
      </div>
      <div class="text-subtitle1 text-bold">{{ name }} {{ uuid }}</div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useCorpusStats } from 'src/composables/useCorpusStats'

const configDetails = ref('Corpus ID + Corpus API Key')
const name = ref('')
const uuid = ref('NOT CONFIGURED')

const corpusNameLoadError = ref('')
const corpusAPIKeyEmpty = ref(false)
const { login, error, apiKeyEmpty, hasData } = useCorpusStats()

async function loadId () {
  const settings = await window.settingsAPI.get()
  if (settings.corpus.uuid !== '') {
    uuid.value = settings.corpus.uuid
    uuid.value =
      uuid.value.substr(0, 1) +
      '...' +
      uuid.value.substr(uuid.value.length - 3, uuid.value.length)
  }

  if (settings.corpus.uuid !== '' && settings.corpus.apiKey !== '') {
    configDetails.value = 'Corpus ID + Corpus API Key'
  } else if (settings.corpus.uuid !== '') {
    configDetails.value = 'ID'
  } else if (settings.corpus.apiKey !== '') {
    configDetails.value = 'Corpus API Key'
  } else {
    configDetails.value = 'NOT CONFIGURED'
  }
}

onMounted(async () => {
  await loadId()
})

watch([login, error, apiKeyEmpty, hasData], () => {
  if (hasData.value) {
    name.value = login.value
    corpusAPIKeyEmpty.value = false
    corpusNameLoadError.value = ''
    return
  }

  if (apiKeyEmpty.value) {
    name.value = ''
    corpusAPIKeyEmpty.value = true
    corpusNameLoadError.value = ''
    return
  }

  if (error.value !== '') {
    name.value = ''
    corpusAPIKeyEmpty.value = false
    corpusNameLoadError.value = error.value
  }
}, { immediate: true })
</script>
