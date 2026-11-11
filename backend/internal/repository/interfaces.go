package repository

import (
	"context"

	"wish-piece/internal/dto"
	"wish-piece/internal/models"

	"github.com/google/uuid"
)

// Интерфейсы репозиториев, от которых зависят сервисы (позволяют подменять БД моками в тестах).

type UserRepository interface {
	Create(ctx context.Context, user *models.User) error
	FindByLoginOrEmail(ctx context.Context, val string) (*models.User, error)
	FindByID(ctx context.Context, id uuid.UUID) (*models.User, error)
	Update(ctx context.Context, user *models.User) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type WishlistRepository interface {
	Create(ctx context.Context, wl *models.Wishlist) error
	FindByID(ctx context.Context, id uuid.UUID) (*models.Wishlist, error)
	FindByUserID(ctx context.Context, userID uuid.UUID) ([]*models.Wishlist, error)
	Update(ctx context.Context, wl *models.Wishlist) error
	Delete(ctx context.Context, id uuid.UUID) error
	IsOwner(ctx context.Context, wlID, userID uuid.UUID) (bool, error)
}

type WishlistItemRepository interface {
	AddItem(ctx context.Context, item *models.WishlistItem) error
	ListItemsWithProducts(ctx context.Context, wishlistID uuid.UUID) ([]*models.WishlistItem, error)
	RemoveItem(ctx context.Context, itemID uuid.UUID) error
	Reserve(ctx context.Context, itemID, userID uuid.UUID) error
	Unreserve(ctx context.Context, itemID, reservedBy uuid.UUID) error
	FindByID(ctx context.Context, id uuid.UUID) (*models.WishlistItem, error)
}

type ProductRepository interface {
	Create(ctx context.Context, p *models.Product) error
	Update(ctx context.Context, p *models.Product) error
	FindByID(ctx context.Context, id uuid.UUID) (*models.Product, error)
	FindByOwner(ctx context.Context, ownerID uuid.UUID) ([]*models.Product, error)
	Delete(ctx context.Context, id, ownerID uuid.UUID) error
}

type FriendshipRepository interface {
	SearchByLogin(ctx context.Context, login string, currentUserID uuid.UUID) ([]dto.UserSearchResult, error)
	Create(ctx context.Context, userID, friendID uuid.UUID) (*models.Friendship, error)
	Reopen(ctx context.Context, friendshipID, userID, friendID uuid.UUID) (*models.Friendship, error)
	Respond(ctx context.Context, friendshipID, recipientID uuid.UUID, status models.FriendshipStatus) error
	FindByID(ctx context.Context, id uuid.UUID) (*models.Friendship, error)
	FindBetween(ctx context.Context, a, b uuid.UUID) (*models.Friendship, error)
	AreFriends(ctx context.Context, a, b uuid.UUID) (bool, error)
	GetFriends(ctx context.Context, userID uuid.UUID) ([]dto.FriendDTO, error)
	GetIncomingRequests(ctx context.Context, userID uuid.UUID) ([]dto.FriendDTO, error)
	Delete(ctx context.Context, friendshipID uuid.UUID) error
}

type NotificationRepository interface {
	Create(ctx context.Context, n NewNotification) error
	GetUnread(ctx context.Context, userID uuid.UUID) ([]dto.NotificationDTO, error)
	MarkRead(ctx context.Context, notifID, userID uuid.UUID) error
	MarkAllRead(ctx context.Context, userID uuid.UUID) error
	GetWishlistsNearDeadline(ctx context.Context, daysAhead int) ([]DeadlineWishlist, error)
}

// Проверка соответствия реализаций интерфейсам на этапе компиляции.
var (
	_ UserRepository         = (*UserRepo)(nil)
	_ WishlistRepository     = (*WishlistRepo)(nil)
	_ WishlistItemRepository = (*WishlistItemRepo)(nil)
	_ ProductRepository      = (*ProductRepo)(nil)
	_ FriendshipRepository   = (*FriendshipRepo)(nil)
	_ NotificationRepository = (*NotificationRepo)(nil)
)
