package dto

import (
	"time"

	"github.com/google/uuid"
)

type NotificationDTO struct {
	ID        uuid.UUID  `json:"id"`
	Type      string     `json:"type"`
	Title     string     `json:"title"`
	Message   string     `json:"message"`
	IsRead    bool       `json:"is_read"`
	ActorID   *uuid.UUID `json:"actor_id"`
	CreatedAt time.Time  `json:"created_at"`
}
