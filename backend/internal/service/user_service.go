package service

import (
	"errors"
	"golang.org/x/crypto/bcrypt"
	"wishlist-backend/internal/models"
	"wishlist-backend/internal/repository"
)

type UserService struct {
	repo *repository.UserRepository
}

func NewUserService(repo *repository.UserRepository) *UserService {
	return &UserService{repo: repo}
}

func (s *UserService) Register(req models.RegisterRequest) (*models.User, error) {
	// Check if user exists
	_, err := s.repo.GetByEmail(req.Email)
	if err == nil {
		return nil, errors.New("user already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Email:    req.Email,
		Password: string(hashedPassword),
		Name:     req.Name,
	}

	if err := s.repo.Create(user); err != nil {
		return nil, err
	}

	user.Password = "" // Don't return password
	return user, nil
}

func (s *UserService) Login(req models.LoginRequest) (*models.User, error) {
	user, err := s.repo.GetByEmail(req.Email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	user.Password = ""
	return user, nil
}

func (s *UserService) GetByID(id int64) (*models.User, error) {
	return s.repo.GetByID(id)
}