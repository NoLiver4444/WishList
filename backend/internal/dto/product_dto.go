package dto

import (
	"time"

	"github.com/google/uuid"
)

// ProductRequest — тело запроса создания (POST) и полной замены (PUT) товара.
// Отсутствующие необязательные поля при PUT очищаются.
type ProductRequest struct {
	Title       string   `json:"title" validate:"required,max=200"`
	URL         *string  `json:"url,omitempty" validate:"omitempty,url"`
	ImageURL    *string  `json:"image_url,omitempty" validate:"omitempty,url"`
	Description *string  `json:"description,omitempty" validate:"omitempty,max=2000"`
	Price       *float64 `json:"price,omitempty" validate:"omitempty,min=0,max=99999999"`
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
