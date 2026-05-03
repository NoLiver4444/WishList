package models

import (
	"time"

	"github.com/google/uuid"
)

type FriendshipStatus string

const (
	FriendshipPending  FriendshipStatus = "pending"
	FriendshipAccepted FriendshipStatus = "accepted"
	FriendshipDeclined FriendshipStatus = "declined"
)

type Friendship struct {
	ID        uuid.UUID        `db:"id"`
	UserID    uuid.UUID        `db:"user_id"`
	FriendID  uuid.UUID        `db:"friend_id"`
	Status    FriendshipStatus `db:"status"`
	CreatedAt time.Time        `db:"created_at"`
}
