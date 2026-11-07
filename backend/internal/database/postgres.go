// Package database отвечает за подключение к PostgreSQL и применение миграций.
package database

import (
	"context"
	"fmt"
	"log"

	"wish-piece/internal/config"
	"wish-piece/migrations"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5/stdlib"
	"github.com/pressly/goose/v3"
)

// NewPool создаёт пул соединений и проверяет доступность БД.
// Возвращает функцию для закрытия пула.
func NewPool(cfg *config.DBConfig) (*pgxpool.Pool, func(), error) {
	pool, err := pgxpool.New(context.Background(), cfg.DSN())
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create pool: %w", err)
	}

	if err := pool.Ping(context.Background()); err != nil {
		pool.Close()
		return nil, nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("Successfully connected to PostgreSQL")

	cleanup := func() {
		pool.Close()
		log.Println("Database connection closed")
	}

	return pool, cleanup, nil
}

// Migrate применяет все невыполненные миграции из встроенного каталога migrations.
func Migrate(pool *pgxpool.Pool) error {
	db := stdlib.OpenDBFromPool(pool)
	defer db.Close()

	goose.SetBaseFS(migrations.FS)
	if err := goose.SetDialect("postgres"); err != nil {
		return fmt.Errorf("goose dialect: %w", err)
	}
	if err := goose.Up(db, "."); err != nil {
		return fmt.Errorf("goose up: %w", err)
	}
	return nil
}
