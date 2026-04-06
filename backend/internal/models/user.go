package models

import (
	"time"

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