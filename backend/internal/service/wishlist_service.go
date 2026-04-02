package service

import (
	"wishlist-backend/internal/models"
	"wishlist-backend/internal/repository"
)

type WishlistService struct {
	repo       *repository.WishlistRepository
	cardRepo   *repository.CardRepository
}

func NewWishlistService(repo *repository.WishlistRepository, cardRepo *repository.CardRepository) *WishlistService {
	return &WishlistService{repo: repo, cardRepo: cardRepo}
}

func (s *WishlistService) Create(wishlist *models.Wishlist) error {
	return s.repo.Create(wishlist)
}

func (s *WishlistService) GetAll(req models.GetWishlistsRequest) ([]models.Wishlist, error) {
	wishlists, err := s.repo.GetAll(req)
	if err != nil {
		return nil, err
	}

	// Load cards count for each wishlist
	for i := range wishlists {
		count, err := s.repo.GetCountByWishlistID(wishlists[i].ID)
		if err != nil {
			count = 0
		}
		// We'll add a field to models if needed, or handle in handler
		_ = count
	}

	return wishlists, nil
}

func (s *WishlistService) GetByID(id int64) (*models.Wishlist, error) {
	wishlist, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	cards, err := s.cardRepo.GetByWishlistID(id)
	if err == nil {
		wishlist.Cards = cards
	}

	return wishlist, nil
}

func (s *WishlistService) Update(id int64, req models.UpdateWishlistRequest) error {
	return s.repo.Update(id, req)
}

func (s *WishlistService) Delete(id int64) error {
	return s.repo.Delete(id)
}