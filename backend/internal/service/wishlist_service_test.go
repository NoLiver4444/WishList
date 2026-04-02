package service_test

import (
	"testing"
	"wishlist-backend/internal/models"
	"wishlist-backend/internal/repository"
	"wishlist-backend/internal/service"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
)

func TestWishlistService_Create(t *testing.T) {
	// Arrange
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	repo := repository.NewWishlistRepository(db)
	cardRepo := repository.NewCardRepository(db)
	svc := service.NewWishlistService(repo, cardRepo)

	mock.ExpectQuery("INSERT INTO wishlists").
		WithArgs(int64(1), "Мой вишлист", "2026-12-31", "").
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(42))

	wishlist := &models.Wishlist{
		UserID:      1,
		Name:        "Мой вишлист",
		Date:        "2026-12-31",
		Description: "",
	}

	// Act
	err = svc.Create(wishlist)

	// Assert
	assert.NoError(t, err)
	assert.Equal(t, int64(42), wishlist.ID)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestWishlistService_GetAll(t *testing.T) {
	db, mock, err := sqlmock.New()
	assert.NoError(t, err)
	defer db.Close()

	repo := repository.NewWishlistRepository(db)
	cardRepo := repository.NewCardRepository(db)
	svc := service.NewWishlistService(repo, cardRepo)

	rows := sqlmock.NewRows([]string{"id", "user_id", "name", "date", "description"}).
		AddRow(1, 1, "Вишлист 1", "2026-01-01", "").
		AddRow(2, 1, "Вишлист 2", "2026-06-01", "Описание")

	mock.ExpectQuery("SELECT .* FROM wishlists").
		WillReturnRows(rows)

	// Act
	wishlists, err := svc.GetAll(models.GetWishlistsRequest{UserID: 1})

	// Assert
	assert.NoError(t, err)
	assert.Len(t, wishlists, 2)
	assert.Equal(t, "Вишлист 1", wishlists[0].Name)
	assert.NoError(t, mock.ExpectationsWereMet())
}