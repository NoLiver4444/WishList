package repository

import (
	"database/sql"
	"wishlist-backend/internal/models"
)

type CardRepository struct {
	db *sql.DB
}

func NewCardRepository(db *sql.DB) *CardRepository {
	return &CardRepository{db: db}
}

func (r *CardRepository) Create(card *models.Card) error {
	query := `INSERT INTO cards (wishlist_id, name, description, price, link, image_url, is_purchased, created_at, updated_at) 
			  VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING id`
	
	return r.db.QueryRow(query,
		card.WishlistID,
		card.Name,
		card.Description,
		card.Price,
		card.Link,
		card.ImageURL,
		card.IsPurchased).Scan(&card.ID)
}

func (r *CardRepository) GetByWishlistID(wishlistID int64) ([]models.Card, error) {
	query := `SELECT id, wishlist_id, name, description, price, link, image_url, is_purchased, created_at, updated_at 
			  FROM cards WHERE wishlist_id = $1 ORDER BY created_at DESC`
	
	rows, err := r.db.Query(query, wishlistID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cards []models.Card
	for rows.Next() {
		var c models.Card
		err := rows.Scan(&c.ID, &c.WishlistID, &c.Name, &c.Description, &c.Price, 
			&c.Link, &c.ImageURL, &c.IsPurchased, &c.CreatedAt, &c.UpdatedAt)
		if err != nil {
			return nil, err
		}
		cards = append(cards, c)
	}

	return cards, nil
}

func (r *CardRepository) Update(id int64, req models.UpdateCardRequest) error {
	query := `UPDATE cards SET name = $1, description = $2, price = $3, link = $4, 
			  image_url = $5, is_purchased = $6, updated_at = NOW() WHERE id = $7`
	
	_, err := r.db.Exec(query, req.Name, req.Description, req.Price, req.Link, 
		req.ImageURL, req.IsPurchased, id)
	return err
}

func (r *CardRepository) Delete(id int64) error {
	query := `DELETE FROM cards WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}