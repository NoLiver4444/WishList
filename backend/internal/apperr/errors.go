// Package apperr содержит доменные ошибки, общие для репозиториев, сервисов и хендлеров.
// Каждая ошибка объявлена ровно один раз, поэтому сравнение через errors.Is работает на всех слоях.
package apperr

import "errors"

var (
	ErrUserNotFound       = errors.New("user not found")
	ErrUserAlreadyExists  = errors.New("user already exists")
	ErrInvalidCredentials = errors.New("invalid login or password")
	ErrInvalidPassword    = errors.New("invalid password")

	ErrWishlistNotFound = errors.New("wishlist not found")
	ErrItemNotFound     = errors.New("wishlist item not found")
	ErrItemAlreadyAdded = errors.New("product already in wishlist")
	ErrAlreadyReserved  = errors.New("item already reserved")
	ErrProductNotFound  = errors.New("product not found")

	ErrFriendshipNotFound      = errors.New("friendship not found")
	ErrFriendshipAlreadyExists = errors.New("friendship already exists")
	ErrCannotAddSelf           = errors.New("cannot add yourself")

	ErrForbidden    = errors.New("forbidden")
	ErrInvalidInput = errors.New("invalid input")
)
