# CyberOwl

CyberOwl — десктопний застосунок для налаштування, запуску та моніторингу підтримуваних модулів Corpus.

- Версія: `1.0.0`
- Репозиторій: https://github.com/corpus-dev/cyberowl
- Стек: Quasar, Vue 3, Electron, TypeScript
- Ліцензія: GPL-3.0

## Можливості

- Запуск і зупинка активного модуля.
- Моніторинг трафіку, швидкості та статистики виконання.
- Журнал виконання в реальному часі.
- Налаштування модуля, розкладу, мови та теми інтерфейсу.
- Підтримка світлої та темної теми.

## Вимоги

- Node.js `>= 22.12.0`
- Yarn `>= 1.21.1`

## Встановлення

```bash
yarn install
```

## Команди

```bash
yarn dev
```

Запускає застосунок у режимі розробки Electron.

```bash
yarn build
```

Збирає застосунок.

```bash
yarn lint
```

Запускає ESLint.

```bash
yarn smoke:stability
```

Запускає smoke-перевірку стабільності.

## Структура проєкту

- `src/` — клієнтська частина застосунку.
- `src-electron/` — Electron main process, preload та IPC-обробники.
- `lib/` — спільна runtime-логіка та логіка модулів.
- `public/` — статичні ресурси.
- `scripts/` — локальні smoke-скрипти.
- `build/` — ресурси для пакування.

## Пакування

Пакування налаштоване в `quasar.config.js` через `electron-builder`.

Підтримувані цілі:

- Windows: `nsis` для `x64`, `x86` та `arm64`.
- macOS: `dmg` і `zip` для `x64`, `arm64` та `universal`.
- Linux: `deb` і `AppImage` для `x64` та `arm64`.

## Дані застосунку

Робочі дані зберігаються в `CyberOwlProfile` всередині Electron `appData`.

## Corpus statistics views

CyberOwl reads statistics from `https://corpsstats.bl4ck.dev/api/user`.

Personal statistics use the configured Corpus API Key:

```text
GET /api/user/traffic/all?apiKey={apiKey}
GET /api/user/traffic/month?apiKey={apiKey}
GET /api/user/traffic/week?apiKey={apiKey}
GET /api/user/traffic/day?apiKey={apiKey}
```

Users can get their Corpus ID and Corpus API Key from the Telegram bot:
https://t.me/corps_statistics_bot

Top volunteers use:

```text
GET /api/user/leaderboard/total
GET /api/user/leaderboard/month
GET /api/user/leaderboard/week
GET /api/user/leaderboard/day
```

The UI displays traffic, tools, source, attacker, OS, and machine counts, and hides empty dimension values. Manual refresh bypasses the in-app cache; normal background cache TTL is 2 minutes.
