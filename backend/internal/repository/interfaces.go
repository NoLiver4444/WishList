package repository

import (
	"context"
	"github.com/google/uuid"
	"wish-piece/internal/models"
)

type UserRepository interface {
	Create(ctx context.Context, user *models.User) error
	FindByLoginOrEmail(ctx context.Context, val string) (*models.User, error)
	FindByID(ctx context.Context, id uuid.UUID) (*models.User, error)
	Update(ctx context.Context, user *models.User) error
	Delete(ctx context.Context, id uuid.UUID) error
}