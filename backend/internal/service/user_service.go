package service

import (
	"context"
	"strings"
	"time"

	"wish-piece/internal/dto"
	"wish-piece/internal/models"
	"wish-piece/internal/repository"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	Repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) *UserService {
	return &UserService{Repo: repo}
}

func (s *UserService) GetUserByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	user, err := s.Repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrUserNotFound
	}
	return user, nil
}

func (s *UserService) UpdateUser(ctx context.Context, id uuid.UUID, req dto.UpdateUserRequest) (*models.User, error) {
	user, err := s.GetUserByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Login != nil {
		login := strings.TrimSpace(*req.Login)
		if !strings.EqualFold(login, user.Login) {
			if err := s.ensureFree(ctx, id, login); err != nil {
				return nil, err
			}
		}
		user.Login = login
	}

	if req.Email != nil {
		email := normalizeEmail(*req.Email)
		if email != strings.ToLower(user.Email) {
			if err := s.ensureFree(ctx, id, email); err != nil {
				return nil, err
			}
		}
		user.Email = email
	}

	if req.Phone != nil {
		user.Phone = req.Phone
	}
	if req.AvatarURL != nil {
		user.AvatarURL = req.AvatarURL
	}

	if req.Birthday != nil {
		parsed, err := time.Parse("2006-01-02", *req.Birthday)
		if err != nil {
			return nil, ErrInvalidInput
		}
		user.Birthday = &parsed
	}

	// Между проверкой и записью возможна гонка — её ловит уникальный индекс,
	// репозиторий в этом случае возвращает ErrUserAlreadyExists.
	if err := s.Repo.Update(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

// ensureFree проверяет, что логин/email не занят другим пользователем.
func (s *UserService) ensureFree(ctx context.Context, selfID uuid.UUID, loginOrEmail string) error {
	existing, err := s.Repo.FindByLoginOrEmail(ctx, loginOrEmail)
	if err != nil {
		return err
	}
	if existing != nil && existing.ID != selfID {
		return ErrUserAlreadyExists
	}
	return nil
}

func (s *UserService) DeleteUser(ctx context.Context, id uuid.UUID, password string) error {
	user, err := s.GetUserByID(ctx, id)
	if err != nil {
		return err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return ErrInvalidPassword
	}

	return s.Repo.Delete(ctx, id)
}
