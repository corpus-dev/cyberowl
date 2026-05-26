import { boot } from 'quasar/wrappers'

function serializeReason (reason: unknown) {
  if (reason instanceof Error) {
    return {
      name: reason.name,
      message: reason.message,
      stack: reason.stack
    }
  }

  return reason
}

function getRendererContext () {
  return {
    href: window.location.href,
    userAgent: window.navigator.userAgent,
    visibilityState: document.visibilityState,
    readyState: document.readyState
  }
}

function runWhenIdle (callback: () => void) {
  const requestIdle = window.requestIdleCallback ?? ((handler: (deadline: { didTimeout: boolean, timeRemaining: () => number }) => void) => {
    return window.setTimeout(() => handler({
      didTimeout: false,
      timeRemaining: () => 0
    }), 1200)
  })

  requestIdle(callback, { timeout: 3500 })
}

function warmRouteChunks () {
  runWhenIdle(() => {
    void Promise.allSettled([
      import('pages/dashboard/DashboardPage.vue'),
      import('pages/modules/ActiveModulePage.vue'),
      import('pages/modules/mhddosproxyPage.vue'),
      import('pages/modules/distressPage.vue'),
      import('pages/SettingsPage.vue'),
      import('pages/SchedulePage.vue'),
      import('pages/personalStats/PersonalStatsPage.vue'),
      import('pages/top/TopPage.vue'),
      import('pages/developers/DevelopersPage.vue')
    ])
  })
}

export default boot(({ app, router }) => {
  window.addEventListener('error', (event) => {
    void window.helpersAPI.logRendererEvent('window-error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: serializeReason(event.error),
      context: getRendererContext()
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    void window.helpersAPI.logRendererEvent('window-unhandledrejection', {
      reason: serializeReason(event.reason),
      context: getRendererContext()
    })
  })

  app.config.errorHandler = (error, instance, info) => {
    console.error('[renderer] vue error', error)
    void window.helpersAPI.logRendererEvent('vue-error', {
      error: serializeReason(error),
      info,
      component: instance?.$options?.name ?? instance?.$options?.__name ?? 'unknown',
      context: getRendererContext()
    })
  }

  router.onError((error) => {
    console.error('[renderer] router error', error)
    void window.helpersAPI.logRendererEvent('router-error', {
      error: serializeReason(error),
      context: getRendererContext()
    })
  })

  if (typeof window !== 'undefined') {
    window.addEventListener('load', warmRouteChunks, { once: true })
  }
})
