package dto

import (
	"time"

	"github.com/google/uuid"
)

type FriendRequestDTO struct {
	FriendID uuid.UUID `json:"friend_id" validate:"required"`
}

type UserSearchResult struct {
	ID        uuid.UUID `json:"id"`
	Login     string    `json:"login"`
	AvatarURL *string   `json:"avatar_url"`
}

type FriendDTO struct {
    FriendshipID uuid.UUID `json:"friendship_id"`
	ID        uuid.UUID `json:"id"`
	Login     string    `json:"login"`
	AvatarURL *string   `json:"avatar_url"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}
