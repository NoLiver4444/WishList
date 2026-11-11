package dto

import (
	"strings"
	"time"

	"github.com/google/uuid"
)

// CreateUserRequest — тело запроса регистрации.
// Логин не может содержать «@», чтобы вход по логину или email был однозначным.
type CreateUserRequest struct {
	Login    string     `json:"login" validate:"required,min=3,max=50,excludes=@"`
	Email    string     `json:"email" validate:"required,email,max=100"`
	Phone    *string    `json:"phone,omitempty" validate:"omitempty,max=20"`
	Birthday *time.Time `json:"birthday,omitempty"`
	Password string     `json:"password" validate:"required,min=6,max=72"`
}

// Normalize обрезает пробелы и приводит email к нижнему регистру.
func (r *CreateUserRequest) Normalize() {
	r.Login = strings.TrimSpace(r.Login)
	r.Email = strings.ToLower(strings.TrimSpace(r.Email))
}

type LoginRequest struct {
	LoginOrEmail string `json:"login_or_email" validate:"required"`
	Password     string `json:"password" validate:"required"`
}

func (r *LoginRequest) Normalize() {
	r.LoginOrEmail = strings.TrimSpace(r.LoginOrEmail)
}

type AuthResponse struct {
	Token string  `json:"token"`
	User  UserDTO `json:"user"`
}

type UserDTO struct {
	ID        uuid.UUID  `json:"id"`
	Login     string     `json:"login"`
	Email     string     `json:"email"`
	Phone     *string    `json:"phone,omitempty"`
	AvatarURL *string    `json:"avatar_url,omitempty"`
	Birthday  *time.Time `json:"birthday,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}
