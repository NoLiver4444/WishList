package config

import (
	"errors"
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	App  AppConfig
	DB   DBConfig
	Auth AuthConfig
}

type AppConfig struct{ Port int }
type DBConfig struct { Host, Port, Name, User, Password, SSLMode string }
type AuthConfig struct { JWTSecret string }

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

func (c *Config) Validate() error {
	if c.DB.Password == "" {
		return errors.New("DB_PASSWORD must be set")
	}
	if c.Auth.JWTSecret == "" {
		return errors.New("JWT_SECRET must be set")
	}
	return nil
}

func (c *DBConfig) DSN() string {
	return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s",
		c.User, c.Password, c.Host, c.Port, c.Name, c.SSLMode)
}

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