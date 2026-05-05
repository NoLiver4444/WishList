package database

import (
	"context"
	"fmt"
	"log"

	"wish-piece/internal/config"

	"github.com/jackc/pgx/v5/pgxpool"
)

// main
// 1
func NewPool(cfg *config.DBConfig) (*pgxpool.Pool, func(), error) {
	pool, err := pgxpool.New(context.Background(), cfg.DSN())
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create pool: %w", err)
	}

	if err := pool.Ping(context.Background()); err != nil {
		pool.Close()
		return nil, nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("✅ Successfully connected to PostgreSQL")

	cleanup := func() {
		pool.Close()
		log.Println("🔌 Database connection closed")
	}

	return pool, cleanup, nil
}
