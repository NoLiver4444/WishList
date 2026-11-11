package repository

import (
	"context"
	"errors"

	"wish-piece/internal/apperr"
	"wish-piece/internal/models"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type WishlistItemRepo struct {
	Pool *pgxpool.Pool
}

func NewWishlistItemRepo(pool *pgxpool.Pool) *WishlistItemRepo {
	return &WishlistItemRepo{Pool: pool}
}

func (r *WishlistItemRepo) AddItem(ctx context.Context, item *models.WishlistItem) error {
	query := `INSERT INTO wishlist_items (wishlist_id, product_id, comment, "order")
  VALUES ($1, $2, $3, $4)
  RETURNING id, created_at, updated_at`

	err := r.Pool.QueryRow(ctx, query,
		item.WishlistID, item.ProductID, item.Comment, item.Order).
		Scan(&item.ID, &item.CreatedAt, &item.UpdatedAt)
	if isPgError(err, pgUniqueViolation) {
		return apperr.ErrItemAlreadyAdded
	}
	return err
}

func (r *WishlistItemRepo) ListItemsWithProducts(ctx context.Context, wishlistID uuid.UUID) ([]*models.WishlistItem, error) {
	query := `SELECT
    wi.id, wi.wishlist_id, wi.product_id, wi.reserved_by, wi.comment, wi."order", wi.created_at, wi.updated_at,
    p.id, p.owner_id, p.title, p.url, p.image_url, p.description, p.price, p.created_at
    FROM wishlist_items wi
    JOIN products p ON wi.product_id = p.id
    WHERE wi.wishlist_id = $1
    ORDER BY wi."order" ASC, wi.created_at ASC`

	rows, err := r.Pool.Query(ctx, query, wishlistID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]*models.WishlistItem, 0)
	for rows.Next() {
		var wi models.WishlistItem
		var p models.Product

		err := rows.Scan(
			&wi.ID, &wi.WishlistID, &wi.ProductID, &wi.ReservedBy, &wi.Comment, &wi.Order, &wi.CreatedAt, &wi.UpdatedAt,
			&p.ID, &p.OwnerID, &p.Title, &p.URL, &p.ImageURL, &p.Description, &p.Price, &p.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		wi.Product = &p
		items = append(items, &wi)
	}
	return items, rows.Err()
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

// Reserve бронирует свободный элемент за userID.
// Если элемент уже кем-то забронирован, возвращает apperr.ErrAlreadyReserved.
func (r *WishlistItemRepo) Reserve(ctx context.Context, itemID, userID uuid.UUID) error {
	result, err := r.Pool.Exec(ctx, `
        UPDATE wishlist_items
        SET reserved_by = $1, updated_at = NOW()
        WHERE id = $2 AND reserved_by IS NULL`, userID, itemID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return apperr.ErrAlreadyReserved
	}
	return nil
}

// Unreserve снимает бронь, если она всё ещё принадлежит reservedBy
// (защита от гонки с параллельным изменением брони).
func (r *WishlistItemRepo) Unreserve(ctx context.Context, itemID, reservedBy uuid.UUID) error {
	result, err := r.Pool.Exec(ctx, `
        UPDATE wishlist_items
        SET reserved_by = NULL, updated_at = NOW()
        WHERE id = $1 AND reserved_by = $2`, itemID, reservedBy)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return apperr.ErrForbidden
	}
	return nil
}

func (r *WishlistItemRepo) FindByID(ctx context.Context, id uuid.UUID) (*models.WishlistItem, error) {
	var item models.WishlistItem
	query := `SELECT id, wishlist_id, product_id, reserved_by, comment, "order", created_at, updated_at
  FROM wishlist_items WHERE id = $1`

	err := r.Pool.QueryRow(ctx, query, id).
		Scan(&item.ID, &item.WishlistID, &item.ProductID, &item.ReservedBy, &item.Comment, &item.Order, &item.CreatedAt, &item.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrItemNotFound
		}
		return nil, err
	}
	return &item, nil
}
