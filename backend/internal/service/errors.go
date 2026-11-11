package service

import (
	"context"
	"log"
	"strings"

	"wish-piece/internal/apperr"
	"wish-piece/internal/repository"
)

// Доменные ошибки объявлены в пакете apperr; здесь — синонимы, чтобы хендлеры
// могли ссылаться на service.ErrX. Сравнивать нужно через errors.Is.
var (
	ErrUserNotFound            = apperr.ErrUserNotFound
	ErrUserAlreadyExists       = apperr.ErrUserAlreadyExists
	ErrInvalidCredentials      = apperr.ErrInvalidCredentials
	ErrInvalidPassword         = apperr.ErrInvalidPassword
	ErrWishlistNotFound        = apperr.ErrWishlistNotFound
	ErrItemNotFound            = apperr.ErrItemNotFound
	ErrItemAlreadyAdded        = apperr.ErrItemAlreadyAdded
	ErrAlreadyReserved         = apperr.ErrAlreadyReserved
	ErrProductNotFound         = apperr.ErrProductNotFound
	ErrFriendshipNotFound      = apperr.ErrFriendshipNotFound
	ErrFriendshipAlreadyExists = apperr.ErrFriendshipAlreadyExists
	ErrCannotAddSelf           = apperr.ErrCannotAddSelf
	ErrForbidden               = apperr.ErrForbidden
	ErrInvalidInput            = apperr.ErrInvalidInput
)

// normalizeEmail приводит email к каноническому виду для хранения и поиска.
func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

// notify создаёт уведомление; ошибка не прерывает основную операцию, но логируется.
func notify(ctx context.Context, repo repository.NotificationRepository, n repository.NewNotification) {
	if repo == nil {
		return
	}
	if err := repo.Create(ctx, n); err != nil {
		log.Printf("notification create (%s) error: %v", n.Type, err)
	}
}
