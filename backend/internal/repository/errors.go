package repository

import (
	"errors"

	"wish-piece/internal/apperr"

	"github.com/jackc/pgx/v5/pgconn"
)

// Доменные ошибки объявлены в пакете apperr; здесь — синонимы для удобства.
var (
	ErrUserAlreadyExists       = apperr.ErrUserAlreadyExists
	ErrUserNotFound            = apperr.ErrUserNotFound
	ErrWishlistNotFound        = apperr.ErrWishlistNotFound
	ErrItemNotFound            = apperr.ErrItemNotFound
	ErrProductNotFound         = apperr.ErrProductNotFound
	ErrFriendshipAlreadyExists = apperr.ErrFriendshipAlreadyExists
	ErrFriendshipNotFound      = apperr.ErrFriendshipNotFound
)

const (
	pgUniqueViolation     = "23505"
	pgForeignKeyViolation = "23503"
)

func isPgError(err error, code string) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == code
}
