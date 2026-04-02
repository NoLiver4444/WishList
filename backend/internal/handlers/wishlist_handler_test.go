package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"wishlist-backend/internal/models"
	"wishlist-backend/internal/service"
)

// Mock сервиса WishlistService
type mockWishlistService struct {
	mock.Mock
}

func (m *mockWishlistService) Create(wishlist *models.Wishlist) error {
	return m.Called(wishlist).Error(0)
}

func (m *mockWishlistService) GetAll(req models.GetWishlistsRequest) ([]models.Wishlist, error) {
	args := m.Called()
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.Wishlist), args.Error(1)
}

func TestCreateCard_Success(t *testing.T) {
	// Arrange
	mockSvc := new(MockCardService)
	handler := NewCardHandler(mockSvc)

	mockSvc.On("Create", &models.CreateCardRequest{
		Name: "Test Card",
	}).Return(&models.Card{ID: 1, Name: "Test Card"}, nil)

	router := gin.New()
	handler := NewCardHandler(mockSvc)

	reqBody := `{"name":"Test Card","wishlist_id":1}`
	req, _ := http.NewRequest(http.MethodPost, "/cards", bytes.NewBufferString(`{"name":"Test Card","wishlist_id":1}`))
	req.Header.Set("Content-Type", "application/json")

	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())
	ctx.Request = &http.Request{
		Method: http.MethodPost,
		URL:    &url.URL{Path: "/cards"},
	}
	ctx.Request.Header.Set("Content-Type", "application/json")

	ctx.Request = ctx.Request.WithContext(context.Background())

	// Act
	handler := NewCardHandler(mockSvc)
	handler.Create(ctx)

	// Assert
	assert.Equal(t, http.StatusCreated, w.Code)
}