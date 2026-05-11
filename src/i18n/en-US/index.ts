// This is just an example,
// so you can safely delete all default props below

export default {
  layout: {
    dashboard: 'Dashboard',
    modules: 'Modules',
    settings: 'Settings',
    schedule: 'Schedule',
    top: 'Leaderboard',
    developers: 'Developers',
    appName: 'Cyber Owl'
  },
  schedule: {
    title: 'Scheduling',
    description: 'Automatically start and stop selected modules by time window.',
    enabled: 'Enable Scheduler',
    enabledDescription: 'When enabled, app enforces module run/stop state based on selected time.',
    startTime: 'Start Time',
    endTime: 'End Time',
    intervalModule: 'Module',
    modulesTitle: 'Modules to run in schedule window',
    intervalsTitle: 'Time Intervals',
    noIntervals: 'No intervals configured.',
    daysTitle: 'Days of week',
    addInterval: 'Add Interval',
    removeInterval: 'Remove Interval',
    days: {
      sun: 'Sun',
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
      fri: 'Fri',
      sat: 'Sat'
    },
    close: 'Close',
    autoSaveHint: 'Changes are saved automatically.',
    overlapError: 'Intervals must not overlap.',
    saveFailed: 'Failed to save schedule. Error: {error}'
  },
  modules: {
    menu: {
      main: 'Main',
      active: 'Active Module',
      available: 'Available Modules'
    },
    active: {
      selected: 'Selected Module for Launch',
      enabled: {
        title: 'Activate Module',
        caption: 'Enable or disable module execution'
      },
      executionLog: 'Execution Log',
      stdout: 'Standard Output (stdout)',
      stderr: 'Standard Error Output (stderr)'
    },
    available: {
      configuration: 'Configuration',
      selVersion: 'Select Version',
      selVersionDescription: 'Module version for launch',
      autoupdates: 'Automatic Updates',
      autoupdatesDescription: 'Automatically update the module to the latest version',
      arguments: 'Launch Parameters (for advanced users)',
      argumentsDescription: 'Additional launch parameters to be used during binary file execution',
      versions: {
        versions: 'List of Versions',
        downloadInstall: 'Download and Install',
        selectUse: 'Select for Use'
      }
    },
    mhddosProxy: {
      copies: 'Copies',
      copiesDescription: 'Number of processes (module copies) launched. 0 for auto',
      threads: 'Threads',
      threadsDescription: 'Number of threads launched per process. 0 for auto',
      useMyIp: 'Use My IP',
      useMyIpDescription: 'Percentage of using your own IP address or VPN, if configured'
    },
    distress: {
      concurrency: 'Concurrency',
      concurrencyDescription: 'Number of task creators. 0 sets default to 4096',
      torConnections: 'Tor Connections',
      torConnectionsDescription: 'Use Tor connections for the attack',
      useMyIp: 'Use My IP',
      useMyIpDescription: 'Percentage of using your own IP address or VPN, if configured',
      UDPFlood: 'Disable UDP Flood',
      UDPFloodDescription: 'Disallow UDP flood attack. Works if you use your own IP',
      ICMPFlood: 'Enable ICMP Flood',
      ICMPFloodDescription: 'Allow ICMP flood attack. Works if you use your own IP',
      PACKETFlood: 'Enable PACKET Flood',
      PACKETFloodDescription: 'Not work in OS Windows! Allow PACKET flood attack. Works if you use your own IP'
    }
  },
  top: {
    volunteers: 'TOP VOLUNTEERS',
    week: 'Per Week',
    month: 'Per Month',
    achievements: {
      peopleAreLikeShips: {
        title: 'People are like Ships',
        subtitle: "if they're Russian, they're going *****",

        body: "Looks like you just tried to select Russian language. You need us to rescue you. Don't worry, we'll soon denazify and liberate you.",
        explanationHint: "I don't understand. Clarify this meme for me.",
        explanation: '"russian warship, go fuck yourself", was the final communication made on 24 February, the first day of the 2022 Snake Island campaign, by Ukrainian border guard Roman Hrybov to the russian missile cruiser moskva. On 13 April 2022, moskva was critically damaged by an explosion caused by Ukrainian anti-ship missiles and sank the following day. "People are like ships" is a well-known in Ukraine song by Skryabin band.Denazification and making Ukrainians free - are slogans of russian propaganda of "russian world" doctrine.',

        goodButton: "I'm silly. Please liberate me.",
        badButton: "I don't like Ukraine"
      }
    },

  },
  bootstrap: {
    title: "Looks like this is your first launch. Let's help you",

    header: {
      language: 'Choose Language',
      data: 'Data',
      corpus: 'Corpus ID',
      module: 'Modules'
    },

    language: {
      continueButton: 'Continue'
    },

    data: {
      body: 'The app will automatically download the necessary modules and save them on your PC. Modules and all data will be stored in the folder',
      windows: "Before continuing, make sure you've added the data folder to the windows defender and antivirus exceptions. Otherwise, all downloaded data will be deleted.",
      openDataFolderButton: 'Open Data Folder',
      changeDataFolderButton: 'Change Data Folder',
      continueButton: 'Continue',
      backButton: 'Back'
    },

    corpus: {
      body: 'If you have a Corpus ID, enter it below. If not, press the continue button',
      uuidInputTitle: 'Corpus ID',
      continueButton: 'Continue',
      backButton: 'Back'
    },

    module: {
      body: 'Choose a preset. All data can then be changed',
      installation: {
        title: 'Module Installation'
      },
      preset: {
        government: {
          title: 'Government Institution / Old PC',
          description: 'This preset uses as few resources as possible. This may disable some module functions.'
        },
        laptop: {
          title: 'Laptop',
          description: "This preset will try to use as few resources as possible but won't disable functions."
        },
        comfort: {
          title: 'Comfort',
          description: 'This preset uses resources in comfortable mode. Does not affect the performance of your computer.'
        },
        normal: {
          title: 'Normal',
          description: 'Normal home computer. This preset uses the configuration provided by module developers by default.'
        },
        max: {
          title: 'Maximum',
          description: 'Maximum power. This preset uses the maximum resources of your computer. This may cause lags in other programs.'
        },
        expert: {
          title: 'Expert',
          description: 'This preset does not perform any actions. All settings must be done manually.'
        }
      }
    },

    doneDialog: {
      title: 'Setup Completed',
      body: 'Now you can start using the application. But we need a bit more time to prepare everything (1-3 minutes). During this time there may be no updates on the main dashboard. This is normal for the first launch :) In a few minutes, charts and current information will appear on the main dashboard.',
      finishButton: "Great! Let's start!"
    }
  },
  settings: {
    system: 'System',
    look: 'GUI',
    theme: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    darkMode: 'Dark Mode',
    matrixMode: 'Matrix Mode',
    autoUpdates: 'Automatic Updates',
    autoUpdatesDescription: 'Automatically update the application to the latest version.',
    autoStartup: 'Automatic Startup',
    autoStartupDescription: 'Automatically start the application when the system boots.',
    hideTray: 'Hide App in Tray',
    hideTrayDescription: 'Hide the app in the tray, not close it. Also, do not show the main window during startup.',
    language: 'Language',
    idDescription: 'How to get ID? See ',
    data: 'Storage',
    dataDescription: 'Currently your modules are located in the folder:',
    warnDelStatistics: 'Are you sure you want to delete the statistics?',
    warnDelCache: 'Are you sure you want to delete the modules cache? The app will close after this action and may not restart automatically.',
    warnDelData: 'Do you really want to delete all data, including cache, settings, and modules? The app will close after this action and may not restart automatically.',
    openDataFolder: 'Open Data Folder',
    changeModulesDataLocation: 'Change Modules Data Location',
    deleteStatistics: 'Delete Statistics',
    deleteModulesCache: 'Delete Modules Cache',
    deleteAllTheData: 'Factory Settings',
    dataDeleted: 'Data deleted successfully',
    diagnostics: {
      title: 'Diagnostics',
      description: 'Service tools for troubleshooting.',
      openProfileFolder: 'Profile folder',
      openStabilityLog: 'Stability log'
    },

  },

  dashboard: {
    statistics: 'Attack Power Statistics',
    bytes: 'Sent / Traffic / Total',
    bytesHint: 'Statistics of send traffic may be not accurate. It depends on the module and the way it works. Total statistics is always precise and shows aggregated information from all the running tools.',
    moduleStatus: 'Module Status',
    control: 'System Control',
    autostart: 'Autostart',
    scheduler: 'Scheduler',
    cpuLoad: 'CPU',
    ramLoad: 'RAM',
    on: 'ON',
    off: 'OFF',
    intervals: 'Intervals',
    updates: 'KIT Version',
    latest: 'Current',
    chart: {
      now: 'Now',
      average: 'Average',
      peak: 'Peak',
      bitrate: 'Bitrate',
      trend: 'Trend',
      view: {
        raw: 'Raw',
        smooth: 'Smooth'
      },
      noData: 'No statistics yet',
      events: {
        started: 'Started',
        stopped: 'Stopped',
        error: 'Error'
      },
      ranges: {
        m5: '5m',
        m15: '15m',
        h1: '1h',
        h6: '6h'
      }
    },
    corpusAPIKeyEmpty: 'Corpus ID is not specified. It is not critical, but it is necessary for displaying general statistics. You can specify it in the settings.'
  },

  developers: {
    itaySubtitle: '',
    shieldMore: 'Learn more about us and our operations:',
    partners: 'Colleges and Partners',
    contacts: 'Contacts',
    contactP1: 'For questions about the application, first, ask in the Corpus chat:',
    contactP1_1: 'or, as a last resort, on our channel',
    contactP1_2: 'If you write to us on the channel, remember that we have very few resources and might not respond. But usually, there are community members who can help.',
    contactP2: 'Technical problems with the application - if you know how to use Github, please create an issue in the repository',
    contactP2_1: 'if not - ask in the Corpus chat.',
    contactP3: 'Questions about modules - direct them to the module developers.',
    contributors: 'Contributors',
    contributorsSubtitle: 'Help improve the program and your name will automatically appear in this list. The list also shows contributors to the previous version of the application and some modules.'
  },

}

