import { defineStore } from 'pinia'
import type { Dark } from 'quasar'
import {
  appearanceThemes,
  getAppearanceTheme,
  normalizeAppearanceThemeId
} from './catalog'

interface AppearanceGuiSettings {
  theme?: string
}

export const useAppearanceStore = defineStore('appearance', {
  state: () => ({
    themeId: normalizeAppearanceThemeId(undefined)
  }),
  getters: {
    currentTheme: (state) => getAppearanceTheme(state.themeId),
    isDarkTheme: (state) => getAppearanceTheme(state.themeId).quasarDark,
    availableThemes: () => appearanceThemes
  },
  actions: {
    hydrate (gui: AppearanceGuiSettings | undefined) {
      this.themeId = normalizeAppearanceThemeId(gui?.theme)
    },
    applyRuntimeAppearance (dark: Dark) {
      dark.set(this.currentTheme.quasarDark)

      const body = document.body
      for (const theme of appearanceThemes) {
        body.classList.toggle(theme.bodyClass, theme.id === this.currentTheme.id)
      }
    },
    async setTheme (themeId: string) {
      this.themeId = normalizeAppearanceThemeId(themeId)
      await window.settingsAPI.gui.setTheme(this.themeId)
    },
    async load () {
      const settings = await window.settingsAPI.get()
      this.hydrate(settings.gui)
    }
  }
})
