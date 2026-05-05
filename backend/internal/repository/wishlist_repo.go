package repository

import (
	"context"
	"errors"

	"wish-piece/internal/models"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrWishlistNotFound = errors.New("wishlist not found")
var ErrWishlistNotOwned = errors.New("user does not own this wishlist")

type WishlistRepo struct {
	Pool *pgxpool.Pool
}

func NewWishlistRepo(pool *pgxpool.Pool) *WishlistRepo {
	return &WishlistRepo{Pool: pool}
}

func (r *WishlistRepo) Create(ctx context.Context, wl *models.Wishlist) error {
	query := `INSERT INTO wishlists (user_id, name, description, privacy, deadline)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING id, created_at, updated_at`

	err := r.Pool.QueryRow(ctx, query,
		wl.UserID, wl.Name, wl.Description, wl.Privacy, wl.Deadline).
		Scan(&wl.ID, &wl.CreatedAt, &wl.UpdatedAt)

	return err
}

func (r *WishlistRepo) FindByID(ctx context.Context, id uuid.UUID) (*models.Wishlist, error) {
	var wl models.Wishlist
	query := `SELECT id, user_id, name, description, privacy, deadline, created_at, updated_at
  FROM wishlists WHERE id = $1`

	err := r.Pool.QueryRow(ctx, query, id).
		Scan(&wl.ID, &wl.UserID, &wl.Name, &wl.Description, &wl.Privacy, &wl.Deadline, &wl.CreatedAt, &wl.UpdatedAt)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrWishlistNotFound
	}
	return &wl, err
}

func (r *WishlistRepo) FindByUserID(ctx context.Context, userID uuid.UUID) ([]*models.Wishlist, error) {
	query := `SELECT id, user_id, name, description, privacy, deadline, created_at, updated_at
  FROM wishlists WHERE user_id = $1 ORDER BY created_at DESC`

	rows, err := r.Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var wishlists []*models.Wishlist
	for rows.Next() {
		var wl models.Wishlist
		err := rows.Scan(&wl.ID, &wl.UserID, &wl.Name, &wl.Description, &wl.Privacy, &wl.Deadline, &wl.CreatedAt, &wl.UpdatedAt)
		if err != nil {
			return nil, err
		}
		wishlists = append(wishlists, &wl)
	}
	return wishlists, rows.Err()
}

func (r *WishlistRepo) Update(ctx context.Context, wl *models.Wishlist) error {
	query := `UPDATE wishlists SET
  name = $1, description = $2, privacy = $3, deadline = $4, updated_at = NOW()
  WHERE id = $5`

	result, err := r.Pool.Exec(ctx, query, wl.Name, wl.Description, wl.Privacy, wl.Deadline, wl.ID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return ErrWishlistNotFound
	}
	return nil
}

func (r *WishlistRepo) Delete(ctx context.Context, id uuid.UUID) error {
	result, err := r.Pool.Exec(ctx, `DELETE FROM wishlists WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return ErrWishlistNotFound
	}
	return nil
}

func (r *WishlistRepo) IsOwner(ctx context.Context, wlID, userID uuid.UUID) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM wishlists WHERE id = $1 AND user_id = $2)`
	err := r.Pool.QueryRow(ctx, query, wlID, userID).Scan(&exists)
	return exists, err
}
