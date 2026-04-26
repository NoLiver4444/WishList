package models

import (
	"time"

	"wish-piece/internal/dto"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID `db:"id"`
	Login        string    `db:"login"`
	Email        string    `db:"email"`
	Phone        *string   `db:"phone"`
	PasswordHash string    `db:"password_hash"`
	AvatarURL    *string   `db:"avatar_url"`
	CreatedAt    time.Time `db:"created_at"`
}

// ToDTO конвертирует модель БД в публичный DTO
func (u *User) ToDTO() dto.UserDTO {
	return dto.UserDTO{
		ID:        u.ID,
		Login:     u.Login,
		Email:     u.Email,
		Phone:     u.Phone,
		AvatarURL: u.AvatarURL,
		CreatedAt: u.CreatedAt,
	}
}
