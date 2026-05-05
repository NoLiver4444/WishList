package models

import (
	"time"

	"wish-piece/internal/dto"

	"github.com/google/uuid"
)

type WishlistItem struct {
	ID         uuid.UUID  `db:"id"`
	WishlistID uuid.UUID  `db:"wishlist_id"`
	ProductID  uuid.UUID  `db:"product_id"`
	ReservedBy *uuid.UUID `db:"reserved_by"`
	Comment    *string    `db:"comment"`
	Order      *int       `db:"order"`
	CreatedAt  time.Time  `db:"created_at"`
	UpdatedAt  time.Time  `db:"updated_at"`

	// Поля для JOIN-запросов (не мапятся в БД)
	Product *Product `db:"-"`
}

func (wi *WishlistItem) ToDTO() dto.WishlistItemDTO {
	dto := dto.WishlistItemDTO{
		ID:         wi.ID,
		Comment:    wi.Comment,
		Order:      wi.Order,
		CreatedAt:  wi.CreatedAt,
		UpdatedAt:  wi.UpdatedAt,
		IsReserved: wi.ReservedBy != nil,
	}
	if wi.Product != nil {
		dto.Product = wi.Product.ToDTO()
	}
	return dto
}
