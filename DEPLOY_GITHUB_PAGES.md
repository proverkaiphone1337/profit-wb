# Деплой на GitHub Pages

Проект уже подготовлен под GitHub Pages:

- в [vite.config.ts](/J:/Бот WBA/WB/vite.config.ts) включен `base: './'`
- в [.github/workflows/deploy-github-pages.yml](/J:/Бот WBA/WB/.github/workflows/deploy-github-pages.yml) добавлен автодеплой

## Что сделать на GitHub

1. Создать репозиторий и залить туда проект.
2. Пушить в ветку `main`.
3. В GitHub открыть `Settings -> Pages`.
4. В `Source` выбрать `GitHub Actions`.
5. После первого пуша дождаться завершения workflow `Deploy to GitHub Pages`.

## Если нужен свой домен

1. В `Settings -> Pages` указать `Custom domain`.
2. У регистратора домена прописать DNS:
   - для поддомена `www` обычно `CNAME -> <username>.github.io`
   - для корневого домена обычно `A`/`ALIAS` по инструкции GitHub
3. Когда домен уже известен, добавь файл `public/CNAME` с одной строкой:

```txt
your-domain.example
```

После этого снова сделай `git push`, чтобы `CNAME` попал в билд.

## Важно

- `localStorage` будет отдельным для каждого домена
- сайт будет публичным, но сами Excel-отчеты обрабатываются в браузере пользователя
- если позже появится backend, GitHub Pages уже не подойдет как полная платформа
