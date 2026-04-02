package service

import (
	"wishlist-backend/internal/models"
	"wishlist-backend/internal/repository"
)

type CardService struct {
	repo *repository.CardRepository
}

func NewCardService(repo *repository.CardRepository) *CardService {
	return &CardService{repo: repo}
}

func (s *CardService) Create(card *models.Card) error {
	return s.repo.Create(card)
}

func (s *CardService) GetByWishlistID(wishlistID int64) ([]models.Card, error) {
	return s.repo.GetByWishlistID(wishlistID)
}

func (s *CardService) Update(id int64, req models.UpdateCardRequest) error {
	return s.repo.Update(id, req)
}

func (s *CardService) Delete(id int64) error {
	return s.repo.Delete(id)
}