package repository

import (
	"context"

	"wish-piece/internal/models"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

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
		err := rows.Scan(&p.ID, &p.Title, &p.URL, &p.ImageURL,
			&p.Description, &p.Price, &p.CreatedAt)
		if err != nil {
			return nil, err
		}
		products = append(products, &p)
	}
	return products, rows.Err()
}
