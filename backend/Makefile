# Makefile для сборки и управления проектом WishPiece Backend
# Язык: Go

# Переменные
BINARY_NAME=wishpiece-server
MAIN_PATH=./cmd/server/main.go
PORT=8080

# Цвета для вывода (опционально, для красоты в терминале)
GREEN  := \033[0;32m
YELLOW := \033[1;33m
NC     := \033[0m # No Color

.PHONY: help run build test clean docs migrate-up migrate-down deps

# Цель по умолчанию: показать помощь
help:
	@echo "$(YELLOW)Доступные команды:$(NC)"
	@echo "  make run          - Запуск сервера в режиме разработки"
	@echo "  make build        - Сборка бинарного файла"
	@echo "  make test         - Запуск тестов с покрытием"
	@echo "  make clean        - Очистка артефактов сборки"
	@echo "  make docs         - Генерация и просмотр документации (GoDoc)"
	@echo "  make deps         - Установка зависимостей (go mod tidy)"
	@echo "  make migrate-up   - Накатка миграций БД"
	@echo "  make migrate-down - Откат миграций (очистка схемы)"

# 1. Запуск сервера (Пункт 1 README.md - команда запуска)
run:
	@echo "$(GREEN)🚀 Запуск сервера...$(NC)"
	go run $(MAIN_PATH)

# 2. Сборка проекта (Пункт 2 методички - система сборки)
build:
	@echo "$(GREEN)📦 Сборка бинарного файла: $(BINARY_NAME)$(NC)"
	go build -o bin/$(BINARY_NAME) $(MAIN_PATH)
	@echo "$(GREEN)✅ Сборка завершена. Бинарник: bin/$(BINARY_NAME)$(NC)"

# 3. Тестирование
test:
	@echo "$(GREEN)🧪 Запуск тестов...$(NC)"
	go test ./... -v -coverprofile=coverage.out
	@echo "$(GREEN)📊 Покрытие кода:$(NC)"
	go tool cover -func=coverage.out | grep total

# 4. Генерация документации (Пункт 4 методички)
docs:
	@echo "$(GREEN)📖 Генерация документации на http://localhost:6060$(NC)"
	@echo "Откройте браузер по адресу: http://localhost:6060/pkg/wish-piece/"
	godoc -http=:6060

# 5. Управление зависимостями
deps:
	@echo "$(GREEN)📥 Обновление зависимостей...$(NC)"
	go mod tidy

# 6. Очистка
clean:
	@echo "$(YELLOW)🧹 Очистка артефактов...$(NC)"
	rm -rf bin/ coverage.out

# 7. Миграции БД (удобная обертка над psql)
migrate-up:
	@echo "$(GREEN)⬆️ Накатка миграций...$(NC)"
	psql $(DB_URL) -f migrations/001_init.sql

migrate-down:
	@echo "$(RED)⬇️ Откат миграций (ВНИМАНИЕ: данные будут удалены!)$(NC)"
	psql $(DB_URL) -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"