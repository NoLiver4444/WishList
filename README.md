# Общее описание проекта:

**__Fullstack-приложение__** для управления вишлистами (списками желаний).\
**Backend**: RESTful API на Go с архитектурой Clean Architecture\
**Frontend**: React-приложение на Vite
**База данных**: PostgreSQL\
**Зависимости проекта**:

1. Backend (Go):
    - github.com/jackc/pgx/v5
    - драйвер PostgreSQL
    - github.com/golang-jwt/jwt/v5
    - JWT-аутентификация
    - github.com/go-playground/validator/v10 - валидация данных
    - golang.org/x/crypto/bcrypt - хеширование паролей
    - github.com/joho/godotenv - загрузка .env

2. Frontend (JavaScript):
    - react - UI библиотека
    - vite - сборщик проекта
    - axios - HTTP-клиент
    - react-router-dom - роутинг

**Команда для запуска**:

1. Backend:  
   ```cd backend && go run cmd/server/main.go``` или ```cd backend && make run```
2. Frontend: \
   ```cd frontend && npm run dev```
3. Корень проекта: \
   ```docker-compose up --build -d```