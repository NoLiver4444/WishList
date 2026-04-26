package dto

import (
	"time"

	"github.com/google/uuid"
)

type CreateProductRequest struct {
	Title       string   `json:"title" validate:"required,max=200"`
	URL         *string  `json:"url,omitempty" validate:"omitempty,url"`
	ImageURL    *string  `json:"image_url,omitempty" validate:"omitempty,url"`
	Description *string  `json:"description,omitempty"`
	Price       *float64 `json:"price,omitempty" validate:"omitempty,min=0"`
}

type ProductResponseDTO struct {
	ID          uuid.UUID `json:"id"`
	Title       string    `json:"title"`
	URL         *string   `json:"url,omitempty"`
	ImageURL    *string   `json:"image_url,omitempty"`
	Description *string   `json:"description,omitempty"`
	Price       *float64  `json:"price,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}
