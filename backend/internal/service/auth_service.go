package service

import (
	"context"
	"strings"
	"time"

	"wish-piece/internal/dto"
	"wish-piece/internal/models"
	"wish-piece/internal/repository"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

const tokenTTL = 24 * time.Hour

type AuthService struct {
	Repo      repository.UserRepository
	JWTSecret string
}

func NewAuthService(repo repository.UserRepository, jwtSecret string) *AuthService {
	return &AuthService{Repo: repo, JWTSecret: jwtSecret}
}

func (s *AuthService) Register(ctx context.Context, req dto.CreateUserRequest) (*dto.AuthResponse, error) {
	login := strings.TrimSpace(req.Login)
	email := normalizeEmail(req.Email)

	for _, key := range []string{login, email} {
		existing, err := s.Repo.FindByLoginOrEmail(ctx, key)
		if err != nil {
			return nil, err
		}
		if existing != nil {
			return nil, ErrUserAlreadyExists
		}
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Login:        login,
		Email:        email,
		Phone:        req.Phone,
		Birthday:     req.Birthday,
		PasswordHash: string(hash),
	}

	// Уникальность дополнительно гарантирует БД: при гонке Create вернёт ErrUserAlreadyExists.
	if err := s.Repo.Create(ctx, user); err != nil {
		return nil, err
	}

	return s.authResponse(user)
}

func (s *AuthService) Login(ctx context.Context, req dto.LoginRequest) (*dto.AuthResponse, error) {
	user, err := s.Repo.FindByLoginOrEmail(ctx, strings.TrimSpace(req.LoginOrEmail))
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	return s.authResponse(user)
}

func (s *AuthService) authResponse(user *models.User) (*dto.AuthResponse, error) {
	token, err := s.generateJWT(user.ID)
	if err != nil {
		return nil, err
	}
	return &dto.AuthResponse{Token: token, User: user.ToDTO()}, nil
}

func (s *AuthService) generateJWT(userID uuid.UUID) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID.String(),
		"exp":     time.Now().Add(tokenTTL).Unix(),
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString([]byte(s.JWTSecret))
}
