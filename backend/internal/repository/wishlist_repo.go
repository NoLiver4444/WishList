package repository

import (
	"database/sql"
	"wishlist-backend/internal/models"
)

type WishlistRepository struct {
	db *sql.DB
}

func NewWishlistRepository(db *sql.DB) *WishlistRepository {
	return &WishlistRepository{db: db}
}

func (r *WishlistRepository) Create(wishlist *models.Wishlist) error {
	query := `INSERT INTO wishlists (user_id, name, date, description, created_at, updated_at) 
			  VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id`
	
	return r.db.QueryRow(query, 
		wishlist.UserID, 
		wishlist.Name, 
		wishlist.Date, 
		wishlist.Description).Scan(&wishlist.ID)
}

func (r *WishlistRepository) GetAll(req models.GetWishlistsRequest) ([]models.Wishlist, error) {
	query := `SELECT id, user_id, name, date, description, created_at, updated_at 
			  FROM wishlists WHERE 1=1`
	
	args := []interface{}{}
	argIndex := 1
	
	if req.UserID > 0 {
		query += " AND user_id = $" + string(rune(argIndex))
		args = append(args, req.UserID)
		argIndex++
	}
	
	switch req.SortBy {
	case models.SortByName:
		query += " ORDER BY name"
	case models.SortByEventDate:
		query += " ORDER BY date"
	default:
		query += " ORDER BY created_at DESC"
	}

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var wishlists []models.Wishlist
	for rows.Next() {
		var w models.Wishlist
		err := rows.Scan(&w.ID, &w.UserID, &w.Name, &w.Date, &w.Description, &w.CreatedAt, &w.UpdatedAt)
		if err != nil {
			return nil, err
		}
		wishlists = append(wishlists, w)
	}

	return wishlists, nil
}

func (r *WishlistRepository) GetByID(id int64) (*models.Wishlist, error) {
	query := `SELECT id, user_id, name, date, description, created_at, updated_at 
			  FROM wishlists WHERE id = $1`
	
	var w models.Wishlist
	err := r.db.QueryRow(query, id).Scan(
		&w.ID, &w.UserID, &w.Name, &w.Date, &w.Description, &w.CreatedAt, &w.UpdatedAt)
	
	if err != nil {
		return nil, err
	}
	
	return &w, nil
}

func (r *WishlistRepository) Update(id int64, req models.UpdateWishlistRequest) error {
	query := `UPDATE wishlists SET name = $1, date = $2, description = $3, updated_at = NOW() 
			  WHERE id = $4`
	
	_, err := r.db.Exec(query, req.Name, req.Date, req.Description, id)
	return err
}

func (r *WishlistRepository) Delete(id int64) error {
	query := `DELETE FROM wishlists WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}

func (r *WishlistRepository) GetCountByWishlistID(wishlistID int64) (int, error) {
	query := `SELECT COUNT(*) FROM cards WHERE wishlist_id = $1`
	var count int
	err := r.db.QueryRow(query, wishlistID).Scan(&count)
	return count, err
}