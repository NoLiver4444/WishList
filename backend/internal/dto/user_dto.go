package dto

import "strings"

type UpdateUserRequest struct {
	Login     *string `json:"login,omitempty" validate:"omitempty,min=3,max=50,excludes=@"`
	Email     *string `json:"email,omitempty" validate:"omitempty,email,max=100"`
	Phone     *string `json:"phone,omitempty" validate:"omitempty,max=20"`
	AvatarURL *string `json:"avatar_url,omitempty" validate:"omitempty,uri"`
	Birthday  *string `json:"birthday,omitempty" validate:"omitempty,datetime=2006-01-02"`
}

// Normalize обрезает пробелы и приводит email к нижнему регистру.
func (r *UpdateUserRequest) Normalize() {
	if r.Login != nil {
		v := strings.TrimSpace(*r.Login)
		r.Login = &v
	}
	if r.Email != nil {
		v := strings.ToLower(strings.TrimSpace(*r.Email))
		r.Email = &v
	}
}

type DeleteUserRequest struct {
	Password string `json:"password" validate:"required"`
}
