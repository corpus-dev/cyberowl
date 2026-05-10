export const DEFAULT_THEME_ID = 'light'
export const DEFAULT_MODE_ID = 'default'

export interface AppearanceThemeDefinition {
  id: string
  labelKey: string
  quasarDark: boolean
  bodyClass: string
}

export const appearanceThemes: AppearanceThemeDefinition[] = [
  {
    id: 'light',
    labelKey: 'settings.themeLight',
    quasarDark: false,
    bodyClass: 'app-theme--light'
  },
  {
    id: 'dark',
    labelKey: 'settings.themeDark',
    quasarDark: true,
    bodyClass: 'app-theme--dark'
  }
]

export function getAppearanceTheme (themeId: string): AppearanceThemeDefinition {
  return appearanceThemes.find((theme) => theme.id === themeId) ?? appearanceThemes[0]
}

export function normalizeAppearanceThemeId (themeId: unknown): string {
  if (typeof themeId !== 'string') {
    return DEFAULT_THEME_ID
  }

  return getAppearanceTheme(themeId).id
}
