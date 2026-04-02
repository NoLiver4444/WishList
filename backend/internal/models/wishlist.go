package models

import (
	"time"
)

type Wishlist struct {
	ID          int64     `json:"id"`
	UserID      int64     `json:"user_id"`
	Name        string    `json:"name"`
	Date        string    `json:"date"`
	Description string    `json:"description,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Cards       []Card    `json:"cards,omitempty"`
}

type CreateWishlistRequest struct {
	Name        string `json:"name" binding:"required"`
	Date        string `json:"date"`
	Description string `json:"description"`
}

type UpdateWishlistRequest struct {
	Name        string `json:"name"`
	Date        string `json:"date"`
	Description string `json:"description"`
}

type SortOption string

const (
	SortByDateAdded   SortOption = "date_added"
	SortByName        SortOption = "name"
	SortByEventDate   SortOption = "event_date"
)

type GetWishlistsRequest struct {
	SortBy SortOption `form:"sort_by"`
	UserID int64      `form:"user_id"`
}