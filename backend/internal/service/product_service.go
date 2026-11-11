package service

import (
	"context"

	"wish-piece/internal/dto"
	"wish-piece/internal/models"
	"wish-piece/internal/repository"

	"github.com/google/uuid"
)

type ProductService struct {
	Repo repository.ProductRepository
}

func NewProductService(repo repository.ProductRepository) *ProductService {
	return &ProductService{Repo: repo}
}

func (s *ProductService) CreateProduct(ctx context.Context, userID uuid.UUID, req dto.ProductRequest) (*dto.ProductResponseDTO, error) {
	product := &models.Product{
		OwnerID:     userID,
		Title:       req.Title,
		URL:         req.URL,
		ImageURL:    req.ImageURL,
		Description: req.Description,
		Price:       req.Price,
	}

	if err := s.Repo.Create(ctx, product); err != nil {
		return nil, err
	}

	out := product.ToResponseDTO()
	return &out, nil
}

func (s *ProductService) ListUserProducts(ctx context.Context, userID uuid.UUID) ([]dto.ProductResponseDTO, error) {
	products, err := s.Repo.FindByOwner(ctx, userID)
	if err != nil {
		return nil, err
	}

	result := make([]dto.ProductResponseDTO, 0, len(products))
	for _, p := range products {
		result = append(result, p.ToResponseDTO())
	}
	return result, nil
}

// checkOwner возвращает ErrProductNotFound, если товара нет, и ErrForbidden, если он чужой.
func (s *ProductService) checkOwner(ctx context.Context, userID, productID uuid.UUID) error {
	product, err := s.Repo.FindByID(ctx, productID)
	if err != nil {
		return err
	}
	if product.OwnerID != userID {
		return ErrForbidden
	}
	return nil
}

func (s *ProductService) DeleteProduct(ctx context.Context, userID, productID uuid.UUID) error {
	if err := s.checkOwner(ctx, userID, productID); err != nil {
		return err
	}
	return s.Repo.Delete(ctx, productID, userID)
}

// UpdateProduct полностью заменяет поля товара (семантика PUT).
func (s *ProductService) UpdateProduct(ctx context.Context, userID, productID uuid.UUID, req dto.ProductRequest) (*dto.ProductResponseDTO, error) {
	if err := s.checkOwner(ctx, userID, productID); err != nil {
		return nil, err
	}

	product := &models.Product{
		ID:          productID,
		OwnerID:     userID,
		Title:       req.Title,
		URL:         req.URL,
		ImageURL:    req.ImageURL,
		Description: req.Description,
		Price:       req.Price,
	}

	if err := s.Repo.Update(ctx, product); err != nil {
		return nil, err
	}

	out := product.ToResponseDTO()
	return &out, nil
}
