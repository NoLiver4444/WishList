package repository

import (
	"context"
	"errors"

	"wish-piece/internal/models"

	"github.com/google/uuid"
	"github.com/jackc/pgx"
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

// repository/user_product_repo.go
type UserProductRepo struct {
	Pool *pgxpool.Pool
}

func NewUserProductRepo(pool *pgxpool.Pool) *UserProductRepo {
	return &UserProductRepo{Pool: pool}
}

func (r *UserProductRepo) Add(ctx context.Context, userID, productID uuid.UUID) error {
	_, err := r.Pool.Exec(ctx,
		`INSERT INTO user_products (user_id, product_id) VALUES ($1, $2)`,
		userID, productID)
	return err
}

func (r *UserProductRepo) Remove(ctx context.Context, userID, productID uuid.UUID) error {
	_, err := r.Pool.Exec(ctx,
		`DELETE FROM user_products WHERE user_id = $1 AND product_id = $2`,
		userID, productID)
	return err
}

func (r *UserProductRepo) IsOwner(ctx context.Context, userID, productID uuid.UUID) (bool, error) {
	var exists bool
	err := r.Pool.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM user_products WHERE user_id = $1 AND product_id = $2)`,
		userID, productID).Scan(&exists)
	return exists, err
}

func (r *UserProductRepo) FindByUserID(ctx context.Context, userID uuid.UUID) ([]*models.Product, error) {
	query := `SELECT p.id, p.title, p.url, p.image_url, p.description, p.price, p.created_at
	FROM products p
	JOIN user_products up ON p.id = up.product_id
	WHERE up.user_id = $1
	ORDER BY up.created_at DESC`

	rows, err := r.Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []*models.Product
	for rows.Next() {
		var p models.Product
		err := rows.Scan(&p.ID, &p.Title, &p.URL, &p.ImageURL, &p.Description, &p.Price, &p.CreatedAt)
		if err != nil {
			return nil, err
		}
		products = append(products, &p)
	}
	return products, rows.Err()
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