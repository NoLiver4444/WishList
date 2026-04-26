package service

import (
	"context"
	"errors"

	"wish-piece/internal/dto"
	"wish-piece/internal/models"
	"wish-piece/internal/repository"

	"github.com/google/uuid"
)

var (
	ErrWishlistNotFound = errors.New("wishlist not found")
	ErrWishlistNotOwned = errors.New("user does not own this wishlist")
	ErrItemNotFound     = errors.New("item not found")
)

type WishlistService struct {
	WishlistRepo repository.WishlistRepository
	ItemRepo     repository.WishlistItemRepository
	ProductRepo  repository.ProductRepository
}

func NewWishlistService(
	wlRepo repository.WishlistRepository,
	itemRepo repository.WishlistItemRepository,
	prodRepo repository.ProductRepository,
) *WishlistService {
	return &WishlistService{
		WishlistRepo: wlRepo,
		ItemRepo:     itemRepo,
		ProductRepo:  prodRepo,
	}
}

// ============ WISHLIST CRUD ============

func (s *WishlistService) CreateWishlist(ctx context.Context, userID uuid.UUID, req dto.CreateWishlistRequest) (*dto.WishlistDTO, error) {
	privacy := models.PrivacyPrivate
	if req.Privacy != nil {
		privacy = models.PrivacyStatus(*req.Privacy)
	}

	wl := &models.Wishlist{
		UserID:      userID,
		Name:        req.Name,
		Description: req.Description,
		Privacy:     privacy,
		Deadline:    req.Deadline,
	}

	if err := s.WishlistRepo.Create(ctx, wl); err != nil {
		return nil, err
	}
	dto := wl.ToDTO()
	return &dto, nil
}

func (s *WishlistService) GetWishlist(ctx context.Context, userID, wlID uuid.UUID, withItems bool) (*dto.WishlistWithItemsDTO, error) {
	wl, err := s.WishlistRepo.FindByID(ctx, wlID)
	if err != nil {
		return nil, err
	}

	// Проверка прав: приватный вишлист — только владелец
	if wl.Privacy == models.PrivacyPrivate && wl.UserID != userID {
		return nil, ErrWishlistNotOwned
	}

	result := &dto.WishlistWithItemsDTO{WishlistDTO: wl.ToDTO()}

	if withItems {
		items, err := s.ItemRepo.ListItemsWithProducts(ctx, wlID)
		if err != nil {
			return nil, err
		}
		for _, item := range items {
			result.Items = append(result.Items, item.ToDTO())
		}
	}

	return result, nil
}

func (s *WishlistService) ListUserWishlists(ctx context.Context, userID uuid.UUID) ([]*dto.WishlistDTO, error) {
	wishlists, err := s.WishlistRepo.FindByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	result := make([]*dto.WishlistDTO, 0, len(wishlists))
	for _, wl := range wishlists {
		dto := wl.ToDTO()
		result = append(result, &dto)
	}
	return result, nil
}

func (s *WishlistService) UpdateWishlist(ctx context.Context, userID, wlID uuid.UUID, req dto.UpdateWishlistRequest) (*dto.WishlistDTO, error) {
	// Проверка прав
	owned, err := s.WishlistRepo.IsOwner(ctx, wlID, userID)
	if err != nil {
		return nil, err
	}
	if !owned {
		return nil, ErrWishlistNotOwned
	}

	wl, err := s.WishlistRepo.FindByID(ctx, wlID)
	if err != nil {
		return nil, err
	}

	// Обновление полей
	if req.Name != nil {
		wl.Name = *req.Name
	}
	if req.Description != nil {
		wl.Description = req.Description
	}
	if req.Privacy != nil {
		wl.Privacy = models.PrivacyStatus(*req.Privacy)
	}
	if req.Deadline != nil {
		wl.Deadline = req.Deadline
	}

	if err := s.WishlistRepo.Update(ctx, wl); err != nil {
		return nil, err
	}

	dto := wl.ToDTO()
	return &dto, nil
}

func (s *WishlistService) DeleteWishlist(ctx context.Context, userID, wlID uuid.UUID) error {
	owned, err := s.WishlistRepo.IsOwner(ctx, wlID, userID)
	if err != nil {
		return err
	}
	if !owned {
		return ErrWishlistNotOwned
	}
	return s.WishlistRepo.Delete(ctx, wlID)
}

func (s *WishlistService) GetWishlistPublic(ctx context.Context, wlID uuid.UUID) (*dto.WishlistDTO, error) {
	wishlist, err := s.WishlistRepo.FindByID(ctx, wlID)
	if err != nil {
		return nil, err
	}

	return &dto.WishlistDTO{
		ID:          wishlist.ID,
		Name:        wishlist.Name,
		Description: wishlist.Description,
		Privacy:     string(wishlist.Privacy),
		Deadline:    wishlist.Deadline,
		CreatedAt:   wishlist.CreatedAt,
		UpdatedAt:   wishlist.UpdatedAt,
	}, nil
}

// ============ ITEMS ============

func (s *WishlistService) AddItem(ctx context.Context, userID, wlID uuid.UUID, req dto.AddItemRequest) (*dto.WishlistItemDTO, error) {
	// Проверка прав на вишлист
	owned, err := s.WishlistRepo.IsOwner(ctx, wlID, userID)
	if err != nil {
		return nil, err
	}
	if !owned {
		return nil, ErrWishlistNotOwned
	}

	// Проверка существования продукта
	_, err = s.ProductRepo.FindByID(ctx, req.ProductID)
	if err != nil {
		return nil, ErrProductNotFound
	}

	item := &models.WishlistItem{
		WishlistID: wlID,
		ProductID:  req.ProductID,
		Comment:    req.Comment,
		Order:      req.Order,
	}

	if err := s.ItemRepo.AddItem(ctx, item); err != nil {
		return nil, err
	}

	// Загрузить продукт для ответа
	product, _ := s.ProductRepo.FindByID(ctx, req.ProductID)
	item.Product = product

	dto := item.ToDTO()
	return &dto, nil
}

func (s *WishlistService) ListItems(ctx context.Context, userID, wlID uuid.UUID) ([]dto.WishlistItemDTO, error) {
	wl, err := s.WishlistRepo.FindByID(ctx, wlID)
	if err != nil {
		return nil, err
	}

	// Публичные и друзья — можно смотреть всем, приватные — только владелец
	if wl.Privacy == models.PrivacyPrivate && wl.UserID != userID {
		return nil, ErrWishlistNotOwned
	}

	items, err := s.ItemRepo.ListItemsWithProducts(ctx, wlID)
	if err != nil {
		return nil, err
	}

	result := make([]dto.WishlistItemDTO, 0, len(items))
	for _, item := range items {
		result = append(result, item.ToDTO())
	}
	return result, nil
}

func (s *WishlistService) ReserveItem(ctx context.Context, userID, itemID uuid.UUID, action string) error {
	item, err := s.ItemRepo.FindByID(ctx, itemID)
	if err != nil {
		return err
	}

	// Проверка прав на вишлист
	wl, err := s.WishlistRepo.FindByID(ctx, item.WishlistID)
	if err != nil {
		return err
	}

	if wl.Privacy == models.PrivacyPrivate && wl.UserID != userID {
		return ErrWishlistNotOwned
	}

	var reserveBy *uuid.UUID
	if action == "reserve" {
		reserveBy = &userID
	}
	// action == "unreserve" → reserveBy = nil

	return s.ItemRepo.ReserveItem(ctx, itemID, reserveBy)
}

func (s *WishlistService) RemoveItem(ctx context.Context, userID, itemID uuid.UUID) error {
	item, err := s.ItemRepo.FindByID(ctx, itemID)
	if err != nil {
		return err
	}

	// Только владелец вишлиста может удалять товары
	owned, err := s.WishlistRepo.IsOwner(ctx, item.WishlistID, userID)
	if err != nil {
		return err
	}
	if !owned {
		return ErrWishlistNotOwned
	}

	return s.ItemRepo.RemoveItem(ctx, itemID)
}

func (s *WishlistService) ListItemsPublic(ctx context.Context, wlID uuid.UUID) ([]dto.WishlistItemDTO, error) {
	items, err := s.ItemRepo.ListItemsWithProducts(ctx, wlID)
	if err != nil {
		return nil, err
	}

	result := make([]dto.WishlistItemDTO, 0, len(items))
	for _, item := range items {
		var product dto.ProductDTO
		if item.Product != nil {
			product = dto.ProductDTO{
				ID:          item.Product.ID,
				Title:       item.Product.Title,
				URL:         item.Product.URL,
				ImageURL:    item.Product.ImageURL,
				Description: item.Product.Description,
				Price:       item.Product.Price,
				CreatedAt:   item.Product.CreatedAt,
			}
		}
		result = append(result, dto.WishlistItemDTO{
			ID:         item.ID,
			Product:    product,
			Comment:    item.Comment,
			Order:      item.Order,
			IsReserved: item.ReservedBy != nil,
			ReservedBy: item.ReservedBy,
			CreatedAt:  item.CreatedAt,
			UpdatedAt:  item.UpdatedAt,
		})
	}
	return result, nil
}
