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

// ToDTO конвертирует элемент в DTO с точки зрения viewerID.
// ID бронирующего не раскрывается: отдаётся только флаг reserved_by_me.
// Для анонимного просмотра передавайте uuid.Nil.
func (wi *WishlistItem) ToDTO(viewerID uuid.UUID) dto.WishlistItemDTO {
	out := dto.WishlistItemDTO{
		ID:           wi.ID,
		Comment:      wi.Comment,
		Order:        wi.Order,
		CreatedAt:    wi.CreatedAt,
		UpdatedAt:    wi.UpdatedAt,
		IsReserved:   wi.ReservedBy != nil,
		ReservedByMe: wi.ReservedBy != nil && viewerID != uuid.Nil && *wi.ReservedBy == viewerID,
	}
	if wi.Product != nil {
		out.Product = wi.Product.ToDTO()
	}
	return out
}
