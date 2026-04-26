package repository

import (
	"context"
	"errors"

	"wish-piece/internal/models"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrItemNotFound = errors.New("wishlist item not found")

type WishlistItemRepo struct {
	Pool *pgxpool.Pool
}

func NewWishlistItemRepo(pool *pgxpool.Pool) *WishlistItemRepo {
	return &WishlistItemRepo{Pool: pool}
}

func (r *WishlistItemRepo) AddItem(ctx context.Context, item *models.WishlistItem) error {
	query := `INSERT INTO wishlist_items (wishlist_id, product_id, reserved_by, comment, "order")
  VALUES ($1, $2, $3, $4, $5)
  RETURNING id, created_at, updated_at`

	err := r.Pool.QueryRow(ctx, query,
		item.WishlistID, item.ProductID, item.ReservedBy, item.Comment, item.Order).
		Scan(&item.ID, &item.CreatedAt, &item.UpdatedAt)

	return err
}

func (r *WishlistItemRepo) ListItems(ctx context.Context, wishlistID uuid.UUID) ([]*models.WishlistItem, error) {
	query := `SELECT id, wishlist_id, product_id, reserved_by, comment, "order", created_at, updated_at
  FROM wishlist_items WHERE wishlist_id = $1 ORDER BY "order" ASC, created_at ASC`

	return r.scanItems(r.Pool.Query(ctx, query, wishlistID))
}

// ListItemsWithProducts — JOIN с таблицей products
func (r *WishlistItemRepo) ListItemsWithProducts(ctx context.Context, wishlistID uuid.UUID) ([]*models.WishlistItem, error) {
	query := `SELECT
    wi.id, wi.wishlist_id, wi.product_id, wi.reserved_by, wi.comment, wi."order", wi.created_at, wi.updated_at,
    p.id, p.title, p.url, p.image_url, p.description, p.price, p.created_at
    FROM wishlist_items wi
    JOIN products p ON wi.product_id = p.id
    WHERE wi.wishlist_id = $1
    ORDER BY wi."order" ASC, wi.created_at ASC`

	rows, err := r.Pool.Query(ctx, query, wishlistID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*models.WishlistItem
	for rows.Next() {
		var wi models.WishlistItem
		var p models.Product

		err := rows.Scan(
			&wi.ID, &wi.WishlistID, &wi.ProductID, &wi.ReservedBy, &wi.Comment, &wi.Order, &wi.CreatedAt, &wi.UpdatedAt,
			&p.ID, &p.Title, &p.URL, &p.ImageURL, &p.Description, &p.Price, &p.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		wi.Product = &p
		items = append(items, &wi)
	}
	return items, rows.Err()
}

func (r *WishlistItemRepo) UpdateItem(ctx context.Context, item *models.WishlistItem) error {
	query := `UPDATE wishlist_items SET
  comment = $1, "order" = $2, updated_at = NOW()
  WHERE id = $3`

	result, err := r.Pool.Exec(ctx, query, item.Comment, item.Order, item.ID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return ErrItemNotFound
	}
	return nil
}

func (r *WishlistItemRepo) RemoveItem(ctx context.Context, itemID uuid.UUID) error {
	result, err := r.Pool.Exec(ctx, `DELETE FROM wishlist_items WHERE id = $1`, itemID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return ErrItemNotFound
	}
	return nil
}

func (r *WishlistItemRepo) ReserveItem(ctx context.Context, itemID uuid.UUID, userID *uuid.UUID) error {
	query := `UPDATE wishlist_items SET reserved_by = $1, updated_at = NOW() WHERE id = $2`
	result, err := r.Pool.Exec(ctx, query, userID, itemID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return ErrItemNotFound
	}
	return nil
}

func (r *WishlistItemRepo) FindByID(ctx context.Context, id uuid.UUID) (*models.WishlistItem, error) {
	var item models.WishlistItem
	query := `SELECT id, wishlist_id, product_id, reserved_by, comment, "order", created_at, updated_at
  FROM wishlist_items WHERE id = $1`

	err := r.Pool.QueryRow(ctx, query, id).
		Scan(&item.ID, &item.WishlistID, &item.ProductID, &item.ReservedBy, &item.Comment, &item.Order, &item.CreatedAt, &item.UpdatedAt)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrItemNotFound
	}
	return &item, err
}

// Вспомогательный метод для сканирования строк
func (r *WishlistItemRepo) scanItems(rows pgx.Rows, err error) ([]*models.WishlistItem, error) {
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*models.WishlistItem
	for rows.Next() {
		var wi models.WishlistItem
		err := rows.Scan(&wi.ID, &wi.WishlistID, &wi.ProductID, &wi.ReservedBy, &wi.Comment, &wi.Order, &wi.CreatedAt, &wi.UpdatedAt)
		if err != nil {
			return nil, err
		}
		items = append(items, &wi)
	}
	return items, rows.Err()
}
