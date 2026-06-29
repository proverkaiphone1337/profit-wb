# Деплой на Timeweb Cloud

Проект собран в статический фронтенд, поэтому на сервер нужно выкладывать содержимое папки `dist/`.

## Что загружать

- Папку `dist/` целиком
- Или архив `wb-profit-calc-dist.zip`, если он создан рядом с проектом

## Вариант 1: Nginx + домен

Скопируйте файлы в директорию сайта, например:

```bash
sudo mkdir -p /var/www/wb-profit-calc
sudo rsync -av --delete dist/ /var/www/wb-profit-calc/
```

Пример конфига Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.example;

    root /var/www/wb-profit-calc;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800, immutable";
    }
}
```

Дальше:

```bash
sudo ln -s /etc/nginx/sites-available/wb-profit-calc /etc/nginx/sites-enabled/wb-profit-calc
sudo nginx -t
sudo systemctl reload nginx
```

## Вариант 2: просто по IP без домена

Можно использовать тот же конфиг, но заменить:

```nginx
server_name _;
```

## Что нужно для реальной выкладки

- IP сервера
- SSH-логин
- Способ входа: пароль или приватный ключ
- Домен или подтверждение, что открываем по IP
- Путь, куда нужно выкладывать сайт, если он уже определен

## Через Termius

1. Подключиться к серверу по SSH.
2. Открыть SFTP-вкладку.
3. Загрузить содержимое `dist/` в `/var/www/wb-profit-calc/`.
4. В терминале на сервере выполнить команды настройки Nginx из примера выше.

