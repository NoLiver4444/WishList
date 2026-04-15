package repository

import (
	"context"
	"wish-piece/internal/models"

	"github.com/google/uuid"
)

type UserRepository interface {
	Create(ctx context.Context, user *models.User) error
	FindByLoginOrEmail(ctx context.Context, val string) (*models.User, error)
	FindByID(ctx context.Context, id uuid.UUID) (*models.User, error)
	Update(ctx context.Context, user *models.User) error
	Delete(ctx context.Context, id uuid.UUID) error
}

// ============ WISHLIST ============

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
	ListItems(ctx context.Context, wishlistID uuid.UUID) ([]*models.WishlistItem, error)
	ListItemsWithProducts(ctx context.Context, wishlistID uuid.UUID) ([]*models.WishlistItem, error)
	UpdateItem(ctx context.Context, item *models.WishlistItem) error
	RemoveItem(ctx context.Context, itemID uuid.UUID) error
	ReserveItem(ctx context.Context, itemID uuid.UUID, userID *uuid.UUID) error
	FindByID(ctx context.Context, id uuid.UUID) (*models.WishlistItem, error)
}

type ProductRepository interface {
	FindByID(ctx context.Context, id uuid.UUID) (*models.Product, error)
}
