<template>
  <q-layout view="lHh Lpr lFf" class="app-shell-layout">
    <q-header bordered class="app-shell-header">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          color="primary"
          icon="menu"
          :aria-label="$t('layout.menuAria')"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title
          class="text-right q-pr-md text-subtitle2 ellipsis"
          style="min-width: 0"
        >
          <ShortStatisticsComponent />
        </q-toolbar-title>

        <div>
          v{{ version }}
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" :width="260" show-if-above bordered class="app-shell-drawer">
      <q-list>
        <q-item-label header class="text-center text-bold text-uppercase app-nav-title">
          {{ $t("layout.appName") }}
        </q-item-label>
        <div class="row justify-center app-logo-wrap">
          <img src="~assets/icon.png" class="app-logo" alt="Cyber Owl" />
        </div>

        <div class="row app-nav-list">
          <div
            v-for="page of pages"
            :key="page.name"
            class="row fit"
            @click="goToPage(page.page)"
          >
            <div
              class="col app-nav-active-rail"
              v-if="($route.name as string).startsWith(page.name)"
            ></div>
            <div
              :class="[
                'col text-subtitle1 text-bold q-pl-md selectable_menu app-nav-item',
                ($route.name as string).startsWith(page.name) ? 'app-nav-item--active' : ''
              ]"
            >
              <q-icon size="xs" :name="page.icon" class="q-mr-xs"></q-icon>
              {{ $t(page.title) }}
            </div>
          </div>
        </div>
        <div class="app-control-wrap">
          <SystemControlStatusComponent />
        </div>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { version } from '../../package.json'

const router = useRouter()

import ShortStatisticsComponent from './ShortStatisticsComponent.vue'
import SystemControlStatusComponent from 'src/pages/dashboard/SystemControlStatusComponent.vue'

const pages = [
  {
    name: 'dashboard',
    title: 'layout.dashboard',
    page: 'dashboard',
    icon: 'dashboard'
  },
  {
    name: 'modules',
    title: 'layout.modules',
    page: 'modules_active',
    icon: 'apps'
  },
  {
    name: 'settings',
    title: 'layout.settings',
    page: 'settings',
    icon: 'settings'
  },
  {
    name: 'schedule',
    title: 'layout.schedule',
    page: 'schedule',
    icon: 'schedule'
  },
  { name: 'personal_stats', title: 'layout.personal_stats', page: 'personal_stats', icon: 'person' },
  { name: 'top', title: 'layout.top', page: 'top', icon: 'leaderboard' },
  {
    name: 'developers',
    title: 'layout.developers',
    page: 'developers',
    icon: 'person'
  }
] as Array<{
  name: string;
  title: string;
  page: string;
  icon: string;
}>

const leftDrawerOpen = ref(false)

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

async function goToPage (page: string) {
  await router.push({ name: page })
}
</script>

<style lang="scss" scoped>
.selectable_menu:hover {
  background-color: var(--app-nav-hover-bg);
  cursor: pointer;
}

.app-shell-header {
  background:
    linear-gradient(90deg, var(--app-shell-surface-strong), var(--app-shell-surface));
  color: var(--app-shell-text);
  border-bottom: 1px solid var(--app-nav-border);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
}

.app-shell-drawer {
  background:
    linear-gradient(180deg, var(--app-shell-surface-strong) 0%, var(--app-shell-surface) 42%, #d6d0b5 100%);
  color: var(--app-shell-text);
  border-right: 1px solid var(--app-nav-border);
}

.app-shell-drawer :deep(.q-drawer__content) {
  background:
    linear-gradient(180deg, var(--app-shell-surface-strong) 0%, var(--app-shell-surface) 48%, #d6d0b5 100%);
  color: var(--app-shell-text);
  overflow-y: auto;
}

:global(body.app-theme--dark) .app-shell-drawer,
:global(body.app-theme--dark) .app-shell-drawer :deep(.q-drawer__content) {
  background:
    linear-gradient(180deg, var(--app-shell-surface-strong) 0%, var(--app-shell-surface) 48%, #252a19 100%);
}

.app-nav-title {
  color: var(--app-shell-text-muted);
  font-size: 28px;
  letter-spacing: 0.04em;
  line-height: 1.18;
  padding: 18px 12px 10px;
}

.app-nav-item {
  color: var(--app-shell-text);
  min-height: 36px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--app-nav-border);
  transition: background-color 0.18s ease, color 0.18s ease;
}

:global(body.app-theme--dark) .app-nav-title,
:global(body.app-theme--dark) .app-nav-item {
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.38);
}

.app-nav-item--active {
  background:
    linear-gradient(90deg, rgba(194, 143, 44, 0.28), transparent 72%),
    var(--app-nav-active-bg);
  color: #fff7d8;
}

.app-nav-list {
  border-top: 1px solid var(--app-nav-border);
}

.app-nav-active-rail {
  max-width: 6px;
  background: var(--app-accent-warm);
  border-bottom: 1px solid var(--app-nav-border);
  box-shadow: 0 0 14px rgba(194, 143, 44, 0.45);
}

.app-logo {
  width: 132px;
  height: 132px;
  object-fit: contain;
  filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.34));
}

.app-logo-wrap {
  margin-top: 2px;
  margin-bottom: 12px;
  position: relative;
  width: 180px;
  height: 138px;
  margin-left: auto;
  margin-right: auto;
}

.app-control-wrap {
  padding: 8px 10px;
}
</style>
