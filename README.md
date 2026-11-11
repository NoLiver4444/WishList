# WishPiece — вишлисты

**Fullstack-приложение** для управления вишлистами (списками желаний): свои желания, вишлисты с приватностью
(публичный / для друзей / приватный), друзья, бронирование подарков и уведомления.

- **Backend** — REST API на Go (Clean Architecture: handler → service → repository), `backend/`
- **Frontend** — React + Vite (Feature-Sliced Design), `frontend/`
- **База данных** — PostgreSQL 13+

## Зависимости

**Backend (Go):**
- `github.com/jackc/pgx/v5` — драйвер PostgreSQL
- `github.com/pressly/goose/v3` — версионируемые миграции (встроены в бинарник, применяются при старте)
- `github.com/golang-jwt/jwt/v5` — JWT-аутентификация
- `github.com/go-playground/validator/v10` — валидация данных
- `golang.org/x/crypto/bcrypt` — хеширование паролей
- `github.com/joho/godotenv` — загрузка `.env`

**Frontend (JavaScript):**
- `react`, `react-router-dom` — UI и роутинг
- `vite` — сборщик
- `zustand` — хранилище сессий (несколько аккаунтов)
- `framer-motion`, `lucide-react`, `react-hot-toast` — анимации, иконки, уведомления
- HTTP — встроенный `fetch` (обёртка `src/shared/api/client.api.js`)

## Запуск через Docker

```bash
cp .env.example .env      # заполнить DB_PASSWORD и JWT_SECRET
docker compose up --build -d
```

Приложение: http://localhost. Nginx отдаёт фронтенд и проксирует `/api/*` на бэкенд (`/v1/*`).
Postgres и API опубликованы только на `127.0.0.1` (5432 и 8080).

## Локальная разработка

1. PostgreSQL — любой локальный или `docker compose up -d postgres`.
2. Backend:
   ```bash
   cd backend
   cp .env.example .env   # заполнить DB_PASSWORD, JWT_SECRET
   make run               # или: go run ./cmd/server
   ```
   Миграции применяются автоматически при старте. Вручную: `make migrate-up`, `make migrate-down`, `make migrate-status`.
3. Frontend:
   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev            # /api проксируется на VITE_PROXY_TARGET (по умолчанию http://localhost:8080)
   ```

### Вёрстка без бэкенда

```bash
cd frontend && npm run devm
```

Поднимает Vite с мок-API (`frontend/dev/mockApi.js`): `/api/*` обслуживается из памяти с демо-данными
(желания, вишлисты разной приватности, друзья, заявка, уведомления). Docker, Go и Postgres не нужны.
Войти можно под любым логином с любым паролем; демо-аккаунт с данными — `demo`. Изменения живут до перезапуска dev-сервера.

## Переменные окружения

| Переменная | Где | Описание |
|---|---|---|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` | backend | Подключение к PostgreSQL (по умолчанию `localhost:5432`, `wishpiece`, `wishuser`) |
| `DB_PASSWORD` | backend, compose | **Обязательна.** Пароль БД |
| `DB_SSLMODE` | backend | Режим SSL (`disable` по умолчанию) |
| `JWT_SECRET` | backend, compose | **Обязательна.** Секрет подписи JWT |
| `PORT` | backend | Порт API (8080) |
| `CORS_ORIGIN` | backend | Разрешённый origin фронтенда; пусто — без CORS-заголовков |
| `VITE_API_URL` | frontend | Базовый URL API; пусто — относительный `/api` |
| `VITE_PROXY_TARGET` | frontend (dev) | Адрес бэкенда для dev-прокси Vite |
| `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET` | frontend | Загрузка картинок в Cloudinary (unsigned preset). Без них картинку можно указать только ссылкой |

Переменные `VITE_*` встраиваются в бандл при сборке (в Docker — через build args из корневого `.env`).

## Проверки

```bash
cd backend  && make check                       # gofmt + go vet + go test
cd frontend && npm run check && npm run build   # prettier + eslint + stylelint, сборка
```

Те же проверки запускает GitHub Actions (`.github/workflows/ci.yml`).
