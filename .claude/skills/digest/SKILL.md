---
name: digest
description: Управление Telegram AI Digest — парсинг каналов, сборка, деплой
tools: Bash, Read, Edit, Write, Grep
---

# Telegram AI Digest — Skill

## Что это
Инструмент для управления дайджестом AI Telegram-каналов. Парсит публичные каналы через t.me/s/, генерирует статический сайт, деплоит на GitHub Pages.

## Проект
- Путь: `/Users/techno/Desktop/AI/RSS`
- Репо: `Techno911/RSS`
- URL: https://techno911.github.io/RSS/

## Команды

### Обновить дайджест
```bash
cd /Users/techno/Desktop/AI/RSS
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
npx tsx parser/src/index.ts
```
Парсит все каналы из `.env`, сохраняет в `data/posts.json`.

### Добавить канал
1. Открой `/Users/techno/Desktop/AI/RSS/.env`
2. Добавь хендл канала через запятую в строку `CHANNELS=`
3. Запусти парсинг (см. выше)
4. Закоммить и запуши — деплой автоматический

### Собрать и задеплоить
```bash
cd /Users/techno/Desktop/AI/RSS
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
git add -A && git commit -m "feat: update digest" && git push
```
GitHub Actions автоматически спарсит каналы и задеплоит.

### Проверить TypeScript
```bash
cd /Users/techno/Desktop/AI/RSS/web
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
npx tsc --noEmit
```

## Файловая структура
- `.env` — список каналов (CHANNELS=handle1,handle2,...)
- `parser/src/scraper.ts` — логика парсинга t.me/s/
- `web/src/App.tsx` — корневой React-компонент
- `web/src/components/` — UI компоненты
- `.github/workflows/deploy.yml` — CI/CD (ежедневно 8:00 МСК)

## Важно
- Парсер использует cheerio, не Telegram API — никаких токенов не нужно
- Rate limit 1.5s между запросами к t.me
- Данные встраиваются в бандл при сборке (Vite JSON import)
