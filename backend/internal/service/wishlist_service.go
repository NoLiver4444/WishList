package service

import (
	"context"

	"wish-piece/internal/dto"
	"wish-piece/internal/models"
	"wish-piece/internal/repository"

	"github.com/google/uuid"
)

type WishlistService struct {
	WishlistRepo   repository.WishlistRepository
	ItemRepo       repository.WishlistItemRepository
	ProductRepo    repository.ProductRepository
	FriendshipRepo repository.FriendshipRepository
	Notification   repository.NotificationRepository
}

func NewWishlistService(
	wlRepo repository.WishlistRepository,
	itemRepo repository.WishlistItemRepository,
	prodRepo repository.ProductRepository,
	friendRepo repository.FriendshipRepository,
	notifRepo repository.NotificationRepository,
) *WishlistService {
	return &WishlistService{
		WishlistRepo:   wlRepo,
		ItemRepo:       itemRepo,
		ProductRepo:    prodRepo,
		FriendshipRepo: friendRepo,
		Notification:   notifRepo,
	}
}

// canView решает, может ли viewerID (uuid.Nil — гость) видеть вишлист:
//   - владелец — всегда;
//   - public — все;
//   - friends — только принятые друзья владельца;
//   - private — только владелец.
func (s *WishlistService) canView(ctx context.Context, viewerID uuid.UUID, wl *models.Wishlist) (bool, error) {
	if viewerID != uuid.Nil && wl.UserID == viewerID {
		return true, nil
	}
	switch wl.Privacy {
	case models.PrivacyPublic:
		return true, nil
	case models.PrivacyFriends:
		if viewerID == uuid.Nil {
			return false, nil
		}
		return s.FriendshipRepo.AreFriends(ctx, viewerID, wl.UserID)
	default:
		return false, nil
	}
}

// loadViewable загружает вишлист и проверяет право просмотра.
func (s *WishlistService) loadViewable(ctx context.Context, viewerID, wlID uuid.UUID) (*models.Wishlist, error) {
	wl, err := s.WishlistRepo.FindByID(ctx, wlID)
	if err != nil {
		return nil, err
	}
	ok, err := s.canView(ctx, viewerID, wl)
	if err != nil {
		return nil, err
	}
	if !ok {
		return nil, ErrForbidden
	}
	return wl, nil
}

// requireOwner возвращает ErrWishlistNotFound, если вишлиста нет, и ErrForbidden, если он чужой.
func (s *WishlistService) requireOwner(ctx context.Context, userID, wlID uuid.UUID) (*models.Wishlist, error) {
	wl, err := s.WishlistRepo.FindByID(ctx, wlID)
	if err != nil {
		return nil, err
	}
	if wl.UserID != userID {
		return nil, ErrForbidden
	}
	return wl, nil
}

func (s *WishlistService) itemsDTO(ctx context.Context, viewerID, wlID uuid.UUID) ([]dto.WishlistItemDTO, error) {
	items, err := s.ItemRepo.ListItemsWithProducts(ctx, wlID)
	if err != nil {
		return nil, err
	}
	result := make([]dto.WishlistItemDTO, 0, len(items))
	for _, item := range items {
		result = append(result, item.ToDTO(viewerID))
	}
	return result, nil
}

// ============ WISHLIST CRUD ============

func (s *WishlistService) CreateWishlist(ctx context.Context, userID uuid.UUID, req dto.CreateWishlistRequest) (*dto.WishlistDTO, error) {
	privacy := models.PrivacyPublic
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
	out := wl.ToDTO()
	return &out, nil
}

func (s *WishlistService) GetWishlist(ctx context.Context, userID, wlID uuid.UUID, withItems bool) (*dto.WishlistWithItemsDTO, error) {
	wl, err := s.loadViewable(ctx, userID, wlID)
	if err != nil {
		return nil, err
	}

	result := &dto.WishlistWithItemsDTO{WishlistDTO: wl.ToDTO()}
	if withItems {
		if result.Items, err = s.itemsDTO(ctx, userID, wlID); err != nil {
			return nil, err
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
		out := wl.ToDTO()
		result = append(result, &out)
	}
	return result, nil
}

func (s *WishlistService) UpdateWishlist(ctx context.Context, userID, wlID uuid.UUID, req dto.UpdateWishlistRequest) (*dto.WishlistDTO, error) {
	wl, err := s.requireOwner(ctx, userID, wlID)
	if err != nil {
		return nil, err
	}

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

	out := wl.ToDTO()
	return &out, nil
}

func (s *WishlistService) DeleteWishlist(ctx context.Context, userID, wlID uuid.UUID) error {
	if _, err := s.requireOwner(ctx, userID, wlID); err != nil {
		return err
	}
	return s.WishlistRepo.Delete(ctx, wlID)
}

// ============ PUBLIC (без авторизации) ============

// loadPublic отдаёт только вишлисты с privacy = public; остальные выглядят несуществующими.
func (s *WishlistService) loadPublic(ctx context.Context, wlID uuid.UUID) (*models.Wishlist, error) {
	wl, err := s.WishlistRepo.FindByID(ctx, wlID)
	if err != nil {
		return nil, err
	}
	if wl.Privacy != models.PrivacyPublic {
		return nil, ErrWishlistNotFound
	}
	return wl, nil
}

func (s *WishlistService) GetWishlistPublic(ctx context.Context, wlID uuid.UUID) (*dto.WishlistDTO, error) {
	wl, err := s.loadPublic(ctx, wlID)
	if err != nil {
		return nil, err
	}
	out := wl.ToDTO()
	return &out, nil
}

func (s *WishlistService) ListItemsPublic(ctx context.Context, wlID uuid.UUID) ([]dto.WishlistItemDTO, error) {
	if _, err := s.loadPublic(ctx, wlID); err != nil {
		return nil, err
	}
	return s.itemsDTO(ctx, uuid.Nil, wlID)
}

// ============ ITEMS ============

func (s *WishlistService) AddItem(ctx context.Context, userID, wlID uuid.UUID, req dto.AddItemRequest) (*dto.WishlistItemDTO, error) {
	if _, err := s.requireOwner(ctx, userID, wlID); err != nil {
		return nil, err
	}

	product, err := s.ProductRepo.FindByID(ctx, req.ProductID)
	if err != nil {
		return nil, err
	}
	if product.OwnerID != userID {
		return nil, ErrForbidden
	}

	item := &models.WishlistItem{
		WishlistID: wlID,
		ProductID:  req.ProductID,
		Comment:    req.Comment,
		Order:      req.Order,
		Product:    product,
	}

	if err := s.ItemRepo.AddItem(ctx, item); err != nil {
		return nil, err
	}

	out := item.ToDTO(userID)
	return &out, nil
}

func (s *WishlistService) ListItems(ctx context.Context, userID, wlID uuid.UUID) ([]dto.WishlistItemDTO, error) {
	if _, err := s.loadViewable(ctx, userID, wlID); err != nil {
		return nil, err
	}
	return s.itemsDTO(ctx, userID, wlID)
}

// ReserveItem бронирует желание за actorID.
// Владелец не может бронировать свои желания; повторная бронь своим же пользователем идемпотентна.
func (s *WishlistService) ReserveItem(ctx context.Context, actorID, itemID uuid.UUID) error {
	item, err := s.ItemRepo.FindByID(ctx, itemID)
	if err != nil {
		return err
	}

	wl, err := s.loadViewable(ctx, actorID, item.WishlistID)
	if err != nil {
		return err
	}
	if wl.UserID == actorID {
		return ErrForbidden
	}

	if item.ReservedBy != nil {
		if *item.ReservedBy == actorID {
			return nil
		}
		return ErrAlreadyReserved
	}

	if err := s.ItemRepo.Reserve(ctx, itemID, actorID); err != nil {
		return err
	}

	message := "Кто-то зарезервировал ваше желание, ждите сюрприз"
	if product, err := s.ProductRepo.FindByID(ctx, item.ProductID); err == nil {
		message = "«" + product.Title + "» кто-то зарезервировал, ждите сюрприз"
	}
	// actor не указываем, чтобы не раскрывать владельцу, кто забронировал.
	notify(ctx, s.Notification, repository.NewNotification{
		UserID:     wl.UserID,
		WishlistID: &wl.ID,
		Type:       models.NotifItemReserved,
		Title:      "Желание зарезервировано",
		Message:    message,
	})

	return nil
}

// UnreserveItem снимает бронь. Снять может тот, кто бронировал, или владелец вишлиста.
// Если брони нет, операция идемпотентна.
func (s *WishlistService) UnreserveItem(ctx context.Context, actorID, itemID uuid.UUID) error {
	item, err := s.ItemRepo.FindByID(ctx, itemID)
	if err != nil {
		return err
	}

	wl, err := s.loadViewable(ctx, actorID, item.WishlistID)
	if err != nil {
		return err
	}

	if item.ReservedBy == nil {
		return nil
	}
	if *item.ReservedBy != actorID && wl.UserID != actorID {
		return ErrForbidden
	}

	return s.ItemRepo.Unreserve(ctx, itemID, *item.ReservedBy)
}

func (s *WishlistService) RemoveItem(ctx context.Context, userID, itemID uuid.UUID) error {
	item, err := s.ItemRepo.FindByID(ctx, itemID)
	if err != nil {
		return err
	}

	if _, err := s.requireOwner(ctx, userID, item.WishlistID); err != nil {
		return err
	}

	return s.ItemRepo.RemoveItem(ctx, itemID)
}
