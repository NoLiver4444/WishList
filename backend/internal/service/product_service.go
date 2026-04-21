package service

import (
	"context"
	"errors"

	"wish-piece/internal/dto"
	"wish-piece/internal/models"
	"wish-piece/internal/repository"

	"github.com/google/uuid"
)

var ErrProductNotFound = errors.New("product not found")
var ErrProductNotOwned = errors.New("user does not own this product")

type ProductService struct {
	ProductRepo     *repository.ProductRepo
	UserProductRepo *repository.UserProductRepo
}

func (s *ProductService) CreateProduct(ctx context.Context, userID uuid.UUID, req dto.CreateProductRequest) (*dto.ProductResponseDTO, error) {
	product := &models.Product{
		Title:       req.Title,
		URL:         req.URL,
		ImageURL:    req.ImageURL,
		Description: req.Description,
		Price:       req.Price,
	}

	if err := s.ProductRepo.Create(ctx, product); err != nil {
		return nil, err
	}

	// привязываем продукт к пользователю
	if err := s.UserProductRepo.Add(ctx, userID, product.ID); err != nil {
		return nil, err
	}

	return &dto.ProductResponseDTO{
		ID:          product.ID,
		Title:       product.Title,
		URL:         product.URL,
		ImageURL:    product.ImageURL,
		Description: product.Description,
		Price:       product.Price,
		CreatedAt:   product.CreatedAt,
	}, nil
}

func (s *ProductService) ListUserProducts(ctx context.Context, userID uuid.UUID) ([]dto.ProductResponseDTO, error) {
	products, err := s.UserProductRepo.FindByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	result := make([]dto.ProductResponseDTO, 0, len(products))
	for _, p := range products {
		result = append(result, dto.ProductResponseDTO{
			ID:          p.ID,
			Title:       p.Title,
			URL:         p.URL,
			ImageURL:    p.ImageURL,
			Description: p.Description,
			Price:       p.Price,
			CreatedAt:   p.CreatedAt,
		})
	}
	return result, nil
}

func (s *ProductService) DeleteProduct(ctx context.Context, userID uuid.UUID, productID uuid.UUID) error {
	owned, err := s.UserProductRepo.IsOwner(ctx, userID, productID)
	if err != nil {
		return err
	}
	if !owned {
		return ErrProductNotOwned
	}

	if err := s.UserProductRepo.Remove(ctx, userID, productID); err != nil {
		return err
	}

	return s.ProductRepo.Delete(ctx, productID)
}