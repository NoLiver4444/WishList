package service

import (
	"context"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"wish-piece/internal/dto"
	"wish-piece/internal/models"
	"wish-piece/internal/repository"
)

var ErrUserAlreadyExists = errors.New("user already exists")
var ErrInvalidCredentials = errors.New("invalid login or password")

type AuthService struct {
	Repo      *repository.UserRepo
	JWTSecret string
}

func NewAuthService(repo *repository.UserRepo, jwtSecret string) *AuthService {
	return &AuthService{Repo: repo, JWTSecret: jwtSecret}
}

func (s *AuthService) Register(ctx context.Context, req dto.CreateUserRequest) (*dto.AuthResponse, error) {
	if existing, _ := s.Repo.FindByLoginOrEmail(ctx, req.Login); existing != nil {
		return nil, ErrUserAlreadyExists
	}
	if existing, _ := s.Repo.FindByLoginOrEmail(ctx, req.Email); existing != nil {
		return nil, ErrUserAlreadyExists
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Login:        req.Login,
		Email:        req.Email,
		Phone:        req.Phone,
		PasswordHash: string(hash),
	}

	if err := s.Repo.Create(ctx, user); err != nil {
		return nil, err
	}

	token, err := s.generateJWT(user.ID)
	if err != nil {
		return nil, err
	}

	return &dto.AuthResponse{
		Token: token,
		User: dto.UserDTO{
			ID:        user.ID,
			Login:     user.Login,
			Email:     user.Email,
			Phone:     user.Phone,
			AvatarURL: user.AvatarURL,
			CreatedAt: user.CreatedAt,
		},
	}, nil
}

func (s *AuthService) Login(ctx context.Context, req dto.LoginRequest) (*dto.AuthResponse, error) {
	user, err := s.Repo.FindByLoginOrEmail(ctx, req.LoginOrEmail)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	token, err := s.generateJWT(user.ID)
	if err != nil {
		return nil, err
	}

	return &dto.AuthResponse{
		Token: token,
		User: dto.UserDTO{
			ID:        user.ID,
			Login:     user.Login,
			Email:     user.Email,
			Phone:     user.Phone,
			AvatarURL: user.AvatarURL,
			CreatedAt: user.CreatedAt,
		},
	}, nil
}

func (s *AuthService) generateJWT(userID uuid.UUID) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID.String(),
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString([]byte(s.JWTSecret))
}