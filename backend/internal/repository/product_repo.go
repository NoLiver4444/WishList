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

func (r *ProductRepo) Create(ctx context.Context, p *models.Product) error {
	query := `INSERT INTO products (title, url, image_url, description, price)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, created_at`

	return r.Pool.QueryRow(ctx, query,
		p.Title, p.URL, p.ImageURL, p.Description, p.Price).
		Scan(&p.ID, &p.CreatedAt)
}

func (r *ProductRepo) Update(ctx context.Context, p *models.Product) error {
	query := `UPDATE products SET
    title = $1, url = $2, image_url = $3, description = $4, price = $5
    WHERE id = $6`

	result, err := r.Pool.Exec(ctx, query,
		p.Title, p.URL, p.ImageURL, p.Description, p.Price, p.ID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return ErrProductNotFound
	}
	return nil
}

func (r *ProductRepo) FindByID(ctx context.Context, id uuid.UUID) (*models.Product, error) {
	var p models.Product
	query := `SELECT id, title, url, image_url, description, price, created_at
	FROM products WHERE id = $1`

	err := r.Pool.QueryRow(ctx, query, id).
		Scan(&p.ID, &p.Title, &p.URL, &p.ImageURL, &p.Description, &p.Price, &p.CreatedAt)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrProductNotFound
	}
	return &p, err
}

func (r *ProductRepo) Delete(ctx context.Context, id uuid.UUID) error {
	result, err := r.Pool.Exec(ctx, `DELETE FROM products WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return ErrProductNotFound
	}
	return nil
}
