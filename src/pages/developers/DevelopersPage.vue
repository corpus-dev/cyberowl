<template>
  <q-page padding>
    <div class="row q-pt-lg justify-center">
      <q-card class="col-12 col-lg-8 bg-transparent" flat>
      <q-card-section class="row">
        <div class="col q-pl-md">
          <div class="full-width text-h4 text-bold">{{ $t("layout.appName") }}</div>
          <div class="full-width text-subtitle2">
            {{ $t("developers.itaySubtitle") }}
          </div>
          <a href="https://t.me/kiberkorpus" target="_blank"
            >https://t.me/kiberkorpus</a
          >
        </div>
      </q-card-section>

      <div class="text-h5">{{ $t("developers.partners") }}</div>
      <q-separator></q-separator>

      <q-card-section class="items-center allign-center">
        <q-btn
          class="q-pa-sm q-ma-xs"
          @click="openExternalLink('https://artline.ua/uk')"
        >
          <q-avatar
            class="cursor-pointer partner-avatar partner-avatar--artline"
            square
            size="62px"
          >
            <img src="./artline.jpg" class="partner-img partner-img--artline" />
          </q-avatar>
          <q-tooltip>Інтернет магазин Artline</q-tooltip>
        </q-btn>

        <q-btn
          class="q-pa-sm q-ma-xs"
          @click="openExternalLink('https://www.ukraine.com.ua/')"
        >
          <q-avatar
            class="cursor-pointer partner-avatar"
            square
            size="62px"
          >
            <img src="./hosting_ukraine.jpg" class="partner-img" />
          </q-avatar>
          <q-tooltip>Hosting Ukraine</q-tooltip>
        </q-btn>

        <q-btn
          class="q-pa-sm q-ma-xs"
          @click="openExternalLink('https://t.me/studentcyberarmy')"
        >
          <q-avatar
            class="cursor-pointer partner-avatar"
            square
            size="62px"
          >
            <img src="./SKKO.jpg" class="partner-img" />
          </q-avatar>
          <q-tooltip>СККО</q-tooltip>
        </q-btn>
      </q-card-section>

      <div class="text-h5">{{ $t("developers.contacts") }}</div>
      <q-separator></q-separator>
      <q-card-section>
        <p>
          1. {{ $t("developers.contactP1") }}
          <a href="https://t.me/kiberkorpus" target="_blank"
            >https://t.me/kiberkorpus</a
          >. {{ $t("developers.contactP1_2") }}
        </p>
        <p>
          2. {{ $t("developers.contactP2") }}
          <a href="https://github.com/corpus-dev/cyberowl" target="_blank"
            >https://github.com/corpus-dev/cyberowl</a
          >, {{ $t("developers.contactP2_1") }}
        </p>
        <p>3. {{ $t("developers.contactP3") }}</p>
      </q-card-section>

      <div class="text-h5">{{ $t("developers.contributors") }}</div>
      <q-separator></q-separator>

      <q-card-section>
        <q-btn
          v-for="contributor of contributors"
          :key="contributor.id"
          class="q-pa-sm q-ma-xs"
          round
          @click="openContributorPage(contributor)"
        >
          <q-avatar style="outline: 2px solid #555" class="cursor-pointer">
            <img :src="contributor.avatar_url" />
          </q-avatar>
          <q-tooltip>
            {{ contributor.login }}:
            {{ contributor.contributions }} contributions
          </q-tooltip>
        </q-btn>
        <div class="text-subtitle2 text-grey text-center">
          {{ $t("developers.contributorsSubtitle") }}
        </div>
      </q-card-section>
      </q-card>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

import { Contributor } from 'app/src-electron/handlers/developers'

const contributors = ref([] as Contributor[])

async function loadContributors () {
  contributors.value = await window.developersAPI.getContributors()
}

function openContributorPage (contributor: Contributor) {
  window.open(contributor.html_url, '_blank')
}

function openExternalLink (link: string) {
  window.open(link, '_blank')
}

onMounted(async () => {
  await loadContributors()
})
</script>

<style scoped>
.partner-avatar {
  outline: 2px solid #555;
  border-radius: 6px;
  background: #fff;
}

.partner-avatar--artline {
  outline: 3px solid #19bcc9;
  box-shadow: 0 0 0 2px rgba(25, 188, 201, 0.18);
}

.partner-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #fff;
  padding: 4px;
}

.partner-img--artline {
  padding: 3px;
}
</style>
