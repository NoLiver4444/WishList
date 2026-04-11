package models

import (
	"time"

	"wish-piece/internal/dto"

	"github.com/google/uuid"
)

type Product struct {
	ID          uuid.UUID `db:"id"`
	Title       string    `db:"title"`
	URL         *string   `db:"url"`
	ImageURL    *string   `db:"image_url"`
	Description *string   `db:"description"`
	Price       *float64  `db:"price"`
	CreatedAt   time.Time `db:"created_at"`
}

func (p *Product) ToDTO() dto.ProductDTO {
	return dto.ProductDTO{
		ID:          p.ID,
		Title:       p.Title,
		URL:         p.URL,
		ImageURL:    p.ImageURL,
		Description: p.Description,
		Price:       p.Price,
		CreatedAt:   p.CreatedAt,
	}
}
