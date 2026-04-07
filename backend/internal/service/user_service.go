package service

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"wish-piece/internal/dto"
	"wish-piece/internal/models"
	"wish-piece/internal/repository"
)

var ErrUserNotFound = errors.New("user not found")
var ErrInvalidPassword = errors.New("invalid password")

type UserService struct {
	Repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) *UserService {
	return &UserService{Repo: repo}
}

func (s *UserService) GetUserByID(ctx context.Context, userIDStr string) (*models.User, error) {
	id, err := uuid.Parse(userIDStr)
	if err != nil {
		return nil, ErrUserNotFound
	}
	user, err := s.Repo.FindByID(ctx, id)
	if err != nil || user == nil {
		return nil, ErrUserNotFound
	}
	return user, nil
}

func (s *UserService) UpdateUser(ctx context.Context, userIDStr string, req dto.UpdateUserRequest) (*models.User, error) {
	id, err := uuid.Parse(userIDStr)
	if err != nil {
		return nil, ErrUserNotFound
	}

	user, err := s.Repo.FindByID(ctx, id)
	if err != nil || user == nil {
		return nil, ErrUserNotFound
	}

	if req.Login != nil && *req.Login != user.Login {
		if existing, _ := s.Repo.FindByLoginOrEmail(ctx, *req.Login); existing != nil && existing.ID != id {
			return nil, ErrUserAlreadyExists // берём из auth_service.go
		}
		user.Login = *req.Login
	}

	if req.Email != nil && *req.Email != user.Email {
		if existing, _ := s.Repo.FindByLoginOrEmail(ctx, *req.Email); existing != nil && existing.ID != id {
			return nil, ErrUserAlreadyExists
		}
		user.Email = *req.Email
	}

	if req.Phone != nil {
		user.Phone = req.Phone
	}
	if req.AvatarURL != nil {
		user.AvatarURL = req.AvatarURL
	}

	if err := s.Repo.Update(ctx, user); err != nil {
		return nil, err
	}
	
	return s.Repo.FindByID(ctx, id)
}

func (s *UserService) DeleteUser(ctx context.Context, userIDStr, password string) error {
	id, err := uuid.Parse(userIDStr)
	if err != nil {
		return ErrUserNotFound
	}

	user, err := s.Repo.FindByID(ctx, id)
	if err != nil || user == nil {
		return ErrUserNotFound
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return ErrInvalidPassword
	}

	return s.Repo.Delete(ctx, id)
}