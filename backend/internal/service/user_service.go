package service

import (
	"context"
	"errors"
	"time"

	"wish-piece/internal/dto"
	"wish-piece/internal/models"
	"wish-piece/internal/repository"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var ErrUserNotFound = errors.New("user not found")
var ErrPizda = errors.New("pizdec")
var ErrInvalidPassword = errors.New("invalid password")

type UserService struct {
	Repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) *UserService {
	return &UserService{Repo: repo}
}

func (s *UserService) GetUserByID(ctx context.Context, userID string) (*models.User, error) {
	id, err := uuid.Parse(userID)
	if err != nil {
		return nil, ErrPizda
	}
	user, err := s.Repo.FindByID(ctx, id)
	if err != nil || user == nil {
		return nil, ErrPizda
	}
	return user, nil
}

func (s *UserService) UpdateUser(ctx context.Context, userID string, req dto.UpdateUserRequest) (*models.User, error) {
	id, err := uuid.Parse(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	user, err := s.Repo.FindByID(ctx, id)
	if err != nil || user == nil {
		return nil, ErrPizda
	}

	if req.Login != nil && *req.Login != user.Login {
		if existing, _ := s.Repo.FindByLoginOrEmail(ctx, *req.Login); existing != nil && existing.ID != id {
			return nil, ErrUserAlreadyExists
		}
		user.Login = *req.Login
	}

	if req.Email != nil && *req.Email != user.Email {
		existing, err := s.Repo.FindByLoginOrEmail(ctx, *req.Email)
		if err != nil {
			return nil, err
		}
		if existing != nil && existing.ID != id {
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

	if req.Birthday != nil {
		parseDate, err := time.Parse("2006-01-02", *req.Birthday)
		if err != nil {
			return nil, errors.New("invalid date format")
		}
		user.Birthday = &parseDate
	}

	if err := s.Repo.Update(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *UserService) DeleteUser(ctx context.Context, userID, password string) error {
	id, err := uuid.Parse(userID)
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
