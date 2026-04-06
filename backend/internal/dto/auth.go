package dto

import (
	"time"

	"github.com/google/uuid"
)

type CreateUserRequest struct {
	Login    string  `json:"login" validate:"required,min=3,max=50"`
	Email    string  `json:"email" validate:"required,email"`
	Phone    *string `json:"phone,omitempty"`
	Password string  `json:"password" validate:"required,min=6"`
}

type LoginRequest struct {
	LoginOrEmail string `json:"login_or_email" validate:"required"`
	Password     string `json:"password" validate:"required"`
}

type AuthResponse struct {
	Token string  `json:"token"`
	User  UserDTO `json:"user"`
}

type UserDTO struct {
	ID        uuid.UUID `json:"id"`
	Login     string    `json:"login"`
	Email     string    `json:"email"`
	Phone     *string   `json:"phone,omitempty"`
	AvatarURL *string   `json:"avatar_url,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}