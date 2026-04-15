package repository

import (
	"context"
	"errors"

	"wish-piece/internal/models"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrProductNotFound = errors.New("product not found")

type ProductRepo struct {
	Pool *pgxpool.Pool
}

func NewProductRepo(pool *pgxpool.Pool) *ProductRepo {
	return &ProductRepo{Pool: pool}
}

func (r *ProductRepo) FindByID(ctx context.Context, id uuid.UUID) (*models.Product, error) {
	var p models.Product
	query := `SELECT id, title, url, image_url, description, price, created_at FROM products WHERE id = $1`

	err := r.Pool.QueryRow(ctx, query, id).
		Scan(&p.ID, &p.Title, &p.URL, &p.ImageURL, &p.Description, &p.Price, &p.CreatedAt)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrProductNotFound
	}
	return &p, err
}
