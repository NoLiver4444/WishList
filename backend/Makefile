# Makefile для сборки и управления проектом WishPiece Backend
# Язык: Go
# .env необязателен: без него переменные берутся из окружения.
-include .env
export

GOOSE   = go run github.com/pressly/goose/v3/cmd/goose@v3.29.0
DB_DSN  = postgres://$(DB_USER):$(DB_PASSWORD)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)?sslmode=$(or $(DB_SSLMODE),disable)

# Переменные
BINARY_NAME=wishpiece-server
MAIN_PATH=./cmd/server/main.go
PORT=8080

# Цвета для вывода (опционально, для красоты в терминале)
GREEN  := \033[0;32m
YELLOW := \033[1;33m
NC     := \033[0m # No Color

.PHONY: help run build test check clean docs migrate-up migrate-down migrate-status deps

# Цель по умолчанию: показать помощь
help:
	@echo "$(YELLOW)Available scripts:$(NC)"
	@echo "  make run          - Run server in development mode"
	@echo "  make build        - Build binary file"
	@echo "  make test         - Run tests with coverage"
	@echo "  make check        - gofmt + go vet + go test"
	@echo "  make clean        - Clean build artifacts"
	@echo "  make docs         - Generate and view documentation (GoDoc)"
	@echo "  make deps         - Install dependencies (go mod tidy)"
	@echo "  make migrate-up     - Apply database migrations (server also applies them on start)"
	@echo "  make migrate-down   - Roll back the last migration"
	@echo "  make migrate-status - Show migration status"

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

check:
	@test -z "$$(gofmt -l .)" || (echo "gofmt needed:"; gofmt -l .; exit 1)
	go vet ./...
	go test ./...

# 4. Генерация документации
docs:
	@echo "$(GREEN) Generating documentation (including private members)...$(NC)"
	godoc -http=:6060 -index

# 5. Управление зависимостями
deps:
	@echo "$(GREEN) Update dependencies...$(NC)"
	go mod tidy

# 6. Очистка
clean:
	@echo "$(YELLOW) Clear artifacts...$(NC)"
	rm -rf bin/ coverage.out

# 7. Миграции БД (goose; сервер применяет их и сам при старте)
migrate-up:
	@echo "$(GREEN)Applying migrations...$(NC)"
	$(GOOSE) -dir migrations postgres "$(DB_DSN)" up

migrate-down:
	@echo "$(YELLOW)Rolling back the last migration...$(NC)"
	$(GOOSE) -dir migrations postgres "$(DB_DSN)" down

migrate-status:
	$(GOOSE) -dir migrations postgres "$(DB_DSN)" status
