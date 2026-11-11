package repository

import (
	"context"
	"errors"

	"wish-piece/internal/models"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ProductRepo хранит товары (желания). Владелец — products.owner_id,
// поэтому создание и удаление выполняются одним запросом и не требуют транзакции.
type ProductRepo struct {
	Pool *pgxpool.Pool
}

func NewProductRepo(pool *pgxpool.Pool) *ProductRepo {
	return &ProductRepo{Pool: pool}
}

const productColumns = `id, owner_id, title, url, image_url, description, price, created_at`

func scanProduct(row pgx.Row) (*models.Product, error) {
	var p models.Product
	err := row.Scan(&p.ID, &p.OwnerID, &p.Title, &p.URL, &p.ImageURL, &p.Description, &p.Price, &p.CreatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrProductNotFound
		}
		return nil, err
	}
	return &p, nil
}

func (r *ProductRepo) Create(ctx context.Context, p *models.Product) error {
	query := `INSERT INTO products (owner_id, title, url, image_url, description, price)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, created_at`

	err := r.Pool.QueryRow(ctx, query,
		p.OwnerID, p.Title, p.URL, p.ImageURL, p.Description, p.Price).
		Scan(&p.ID, &p.CreatedAt)
	if isPgError(err, pgForeignKeyViolation) {
		return ErrUserNotFound
	}
	return err
}

// Update перезаписывает поля товара, принадлежащего p.OwnerID.
func (r *ProductRepo) Update(ctx context.Context, p *models.Product) error {
	query := `UPDATE products SET
    title = $1, url = $2, image_url = $3, description = $4, price = $5
    WHERE id = $6 AND owner_id = $7
    RETURNING created_at`

	err := r.Pool.QueryRow(ctx, query,
		p.Title, p.URL, p.ImageURL, p.Description, p.Price, p.ID, p.OwnerID).Scan(&p.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return ErrProductNotFound
	}
	return err
}

func (r *ProductRepo) FindByID(ctx context.Context, id uuid.UUID) (*models.Product, error) {
	query := `SELECT ` + productColumns + ` FROM products WHERE id = $1`
	return scanProduct(r.Pool.QueryRow(ctx, query, id))
}

func (r *ProductRepo) FindByOwner(ctx context.Context, ownerID uuid.UUID) ([]*models.Product, error) {
	query := `SELECT ` + productColumns + ` FROM products WHERE owner_id = $1 ORDER BY created_at DESC`

	rows, err := r.Pool.Query(ctx, query, ownerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	products := make([]*models.Product, 0)
	for rows.Next() {
		p, err := scanProduct(rows)
		if err != nil {
			return nil, err
		}
		products = append(products, p)
	}
	return products, rows.Err()
}

// Delete удаляет товар, если он принадлежит ownerID.
func (r *ProductRepo) Delete(ctx context.Context, id, ownerID uuid.UUID) error {
	result, err := r.Pool.Exec(ctx, `DELETE FROM products WHERE id = $1 AND owner_id = $2`, id, ownerID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return ErrProductNotFound
	}
	return nil
}
