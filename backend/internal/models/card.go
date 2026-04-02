package models

import (
	"time"
)

type Card struct {
	ID          int64     `json:"id"`
	WishlistID  int64     `json:"wishlist_id"`
	Name        string    `json:"name"`
	Description string    `json:"description,omitempty"`
	Price       float64   `json:"price,omitempty"`
	Link        string    `json:"link,omitempty"`
	ImageURL    string    `json:"image_url,omitempty"`
	IsPurchased bool      `json:"is_purchased"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CreateCardRequest struct {
	WishlistID  int64   `json:"wishlist_id" binding:"required"`
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Link        string  `json:"link"`
	ImageURL    string  `json:"image_url"`
}

type UpdateCardRequest struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Link        string  `json:"link"`
	ImageURL    string  `json:"image_url"`
	IsPurchased bool    `json:"is_purchased"`
}