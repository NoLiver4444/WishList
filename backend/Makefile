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
	@echo "$(YELLOW)Available scripts:$(NC)"
	@echo "  make run          - Run server in development mode"
	@echo "  make build        - Build binary file"
	@echo "  make test         - Run tests with coverage"
	@echo "  make clean        - Clean build artifacts"
	@echo "  make docs         - Generate and view documentation (GoDoc)"
	@echo "  make deps         - Install dependencies (go mod tidy)"
	@echo "  make migrate-up   - Apply database migrations"
	@echo "  make migrate-down - Rollback migrations (clear schema)"

# 1. Запуск сервера
run:
	@echo "$(GREEN) Starting server...$(NC)"
	go run $(MAIN_PATH)

# 2. Сборка проекта
build:
	@echo "$(GREEN) Build binary file: $(BINARY_NAME)$(NC)"
	go build -o bin/$(BINARY_NAME) $(MAIN_PATH)
	@echo "$(GREEN) Build successful. Binary file: bin/$(BINARY_NAME)$(NC)"

# 3. Тестирование
test:
	@echo "$(GREEN) Starting tests...$(NC)"
	go test ./... -v -coverprofile=coverage.out
	@echo "$(GREEN) Code coverage:$(NC)"
	go tool cover -func=coverage.out | grep total

# 4. Генерация документации
docs:
	@echo "$(GREEN) Generating documentation at http://localhost:6060$(NC)"
	@echo "Open browser: http://localhost:6060/pkg/wish-piece/"
	godoc -http=:6060

# 5. Управление зависимостями
deps:
	@echo "$(GREEN) Update dependencies...$(NC)"
	go mod tidy

# 6. Очистка
clean:
	@echo "$(YELLOW) Clear artifacts...$(NC)"
	rm -rf bin/ coverage.out

# 7. Миграции БД
migrate-up:
	@echo "$(GREEN) Applying migrations...$(NC)"
	psql $(DB_URL) -f migrations/001_init.sql

migrate-down:
	@echo "$(RED) Rolling back migrations (Warning: all data will be deleted!)$(NC)"
	psql $(DB_URL) -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"