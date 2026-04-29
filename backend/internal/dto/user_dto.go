package dto

type UpdateUserRequest struct {
	Login     *string `json:"login,omitempty" validate:"omitempty,min=3,max=50"`
	Email     *string `json:"email,omitempty" validate:"omitempty,email"`
	Phone     *string `json:"phone,omitempty"`
	AvatarURL *string `json:"avatar_url,omitempty" validate:"omitempty,uri"`
	Birthday  *string `json:"birthday,omitempty" validate:"omitempty,datetime=2006-01-02"`
}

type DeleteUserRequest struct {
	Password string `json:"password" validate:"required"`
}
