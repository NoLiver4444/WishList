// Package config предоставляет инструменты для управления конфигурацией приложения.
// Пакет поддерживает загрузку настроек из переменных окружения и их валидацию.
package config

import (
	"errors"
	"fmt"
	"os"
	"strconv"
)

// Config объединяет все настройки приложения: сервер, базу данных и аутентификацию.
type Config struct {
	App  AppConfig
	DB   DBConfig
	Auth AuthConfig
}

// AppConfig содержит базовые настройки сервера.
type AppConfig struct {
	Port int // Порт, на котором будет запущен HTTP-сервер.
}

// DBConfig содержит параметры подключения к базе данных PostgreSQL.
type DBConfig struct {
	Host     string
	Port     string
	Name     string
	User     string
	Password string
	SSLMode  string // Режим SSL (например, "disable", "require").
}

// AuthConfig содержит секретные ключи для механизмов безопасности.
type AuthConfig struct {
	JWTSecret string // Секретный ключ для подписи и проверки JWT токенов.
}

// Load считывает конфигурацию из переменных окружения.
// Если переменная отсутствует, используются значения по умолчанию.
// После загрузки выполняется обязательная валидация через метод Validate.
func Load() (*Config, error) {
	cfg := &Config{
		App: AppConfig{Port: getEnvAsInt("PORT", 8080)},
		DB: DBConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			Name:     getEnv("DB_NAME", "wishpiece"),
			User:     getEnv("DB_USER", "wishuser"),
			Password: getEnv("DB_PASSWORD", ""),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		Auth: AuthConfig{JWTSecret: getEnv("JWT_SECRET", "")},
	}

	if err := cfg.Validate(); err != nil {
		return nil, fmt.Errorf("config validation failed: %w", err)
	}
	return cfg, nil
}

// Validate проверяет наличие обязательных параметров конфигурации.
// Возвращает ошибку, если не заданы критические данные, такие как пароль БД или JWT секрет.
func (c *Config) Validate() error {
	if c.DB.Password == "" {
		return errors.New("DB_PASSWORD must be set")
	}
	if c.Auth.JWTSecret == "" {
		return errors.New("JWT_SECRET must be set")
	}
	return nil
}

// DSN формирует строку подключения (Data Source Name) для драйвера PostgreSQL.
// Формат: postgres://user:password@host:port/dbname?sslmode=...
func (c *DBConfig) DSN() string {
	return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s",
		c.User, c.Password, c.Host, c.Port, c.Name, c.SSLMode)
}

// Внутренние вспомогательные функции (не экспортируются)
func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	return fallback
}

func getEnvAsInt(key string, fallback int) int {
	valStr := getEnv(key, "")
	if val, err := strconv.Atoi(valStr); err == nil {
		return val
	}
	return fallback
}
