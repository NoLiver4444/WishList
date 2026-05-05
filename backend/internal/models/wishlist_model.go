package models

import (
	"time"

	"wish-piece/internal/dto"

	"github.com/google/uuid"
)

// PrivacyStatus соответствует enum privacy_status в БД
type PrivacyStatus string

const (
	PrivacyPrivate PrivacyStatus = "private"
	PrivacyFriends PrivacyStatus = "friends"
	PrivacyPublic  PrivacyStatus = "public"
)

type Wishlist struct {
	ID          uuid.UUID     `db:"id"`
	UserID      uuid.UUID     `db:"user_id"`
	Name        string        `db:"name"`
	Description *string       `db:"description"`
	Privacy     PrivacyStatus `db:"privacy"`
	Deadline    *time.Time    `db:"deadline"`
	CreatedAt   time.Time     `db:"created_at"`
	UpdatedAt   time.Time     `db:"updated_at"`
}

func (w *Wishlist) ToDTO() dto.WishlistDTO {
	return dto.WishlistDTO{
		ID:          w.ID,
		Name:        w.Name,
		Description: w.Description,
		Privacy:     string(w.Privacy),
		Deadline:    w.Deadline,
		CreatedAt:   w.CreatedAt,
		UpdatedAt:   w.UpdatedAt,
	}
}
