package dto

import (
	"time"

	"github.com/google/uuid"
)

type CreateWishlistRequest struct {
	Name        string     `json:"name" validate:"required,max=100"`
	Description *string    `json:"description,omitempty" validate:"omitempty,max=500"`
	Privacy     *string    `json:"privacy,omitempty" validate:"omitempty,oneof=private friends public"`
	Deadline    *time.Time `json:"deadline,omitempty"`
}

type UpdateWishlistRequest struct {
	Name        *string    `json:"name,omitempty" validate:"omitempty,max=100"`
	Description *string    `json:"description,omitempty" validate:"omitempty,max=500"`
	Privacy     *string    `json:"privacy,omitempty" validate:"omitempty,oneof=private friends public"`
	Deadline    *time.Time `json:"deadline,omitempty"`
}

type AddItemRequest struct {
	ProductID uuid.UUID `json:"product_id" validate:"required,uuid"`
	Comment   *string   `json:"comment,omitempty" validate:"omitempty,max=500"`
	Order     *int      `json:"order,omitempty"`
}

type ReserveItemRequest struct {
	Action string `json:"action" validate:"required,oneof=reserve unreserve"`
}

type WishlistDTO struct {
	ID          uuid.UUID  `json:"id"`
	Name        string     `json:"name"`
	Description *string    `json:"description,omitempty"`
	Privacy     string     `json:"privacy"`
	Deadline    *time.Time `json:"deadline,omitempty"`
	ItemCount   int        `json:"item_count,omitempty"` // опционально: кол-во товаров
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type ProductDTO struct {
	ID          uuid.UUID `json:"id"`
	Title       string    `json:"title"`
	URL         *string   `json:"url,omitempty"`
	ImageURL    *string   `json:"image_url,omitempty"`
	Description *string   `json:"description,omitempty"`
	Price       *float64  `json:"price,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

type WishlistItemDTO struct {
	ID         uuid.UUID  `json:"id"`
	Product    ProductDTO `json:"product"`
	Comment    *string    `json:"comment,omitempty"`
	Order      *int       `json:"order,omitempty"`
	IsReserved bool       `json:"is_reserved"`
	ReservedBy *uuid.UUID `json:"reserved_by,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}

type WishlistWithItemsDTO struct {
	WishlistDTO
	Items []WishlistItemDTO `json:"items,omitempty"`
}
