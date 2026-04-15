Общее описание проекта:

Fullstack-приложение для управления вишлистами (списками желаний)
Backend: RESTful API на Go с архитектурой Clean Architecture
Frontend: React-приложение на Vite
База данных: PostgreSQL
Зависимости проекта:

Backend (Go): • github.com/jackc/pgx/v5 - драйвер PostgreSQL • github.com/golang-jwt/jwt/v5 - JWT-аутентификация •
github.com/go-playground/validator/v10 - валидация данных • golang.org/x/crypto/bcrypt - хеширование паролей •
github.com/joho/godotenv - загрузка .env

Frontend (JavaScript): • react - UI библиотека • vite - сборщик проекта • axios - HTTP-клиент • react-router-dom -
роутинг

Команда для запуска:

Backend: $ cd backend $ go mod tidy $ go run cmd/server/main.go

Frontend: $ cd frontend $ npm install $ npm run dev