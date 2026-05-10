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
