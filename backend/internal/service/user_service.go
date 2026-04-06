package service

import (
	"context"
	"errors"
	"wish-piece/internal/models"
	"wish-piece/internal/repository"

	"github.com/google/uuid"
)

var ErrUserNotFound = errors.New("user not found")

type UserService struct {
	Repo *repository.UserRepo
}

func NewUserService(repo *repository.UserRepo) *UserService {
	return &UserService{Repo: repo}
}

func (s *UserService) GetUserByID(ctx context.Context, userIDStr string) (*models.User, error) {
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return nil, ErrUserNotFound
	}

	user, err := s.Repo.FindByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrUserNotFound
	}

	return user, nil
}