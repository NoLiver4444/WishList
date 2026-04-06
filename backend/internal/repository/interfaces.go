package repository

import (
	"context"
	"wish-piece/internal/models"
)

type UserRepository interface {
	Create(ctx context.Context, user *models.User) error
	FindByLoginOrEmail(ctx context.Context, val string) (*models.User, error)
}