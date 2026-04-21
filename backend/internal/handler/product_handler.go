package handler

import (
	"encoding/json"
	"net/http"

	"wish-piece/internal/dto"
	"wish-piece/internal/middleware"
	"wish-piece/internal/service"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type ProductHandler struct {
	Service   *service.ProductService
	Validator *validator.Validate
}

func (h *ProductHandler) Create(w http.ResponseWriter, r *http.Request) {
	userIDStr, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		RespondError(w, http.StatusUnauthorized, "User ID not found", "UNAUTHORIZED")
		return
	}
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "Invalid user ID", "INTERNAL_ERROR")
		return
	}

	var req dto.CreateProductRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid JSON", "PARSE_ERROR")
		return
	}

	if err := h.Validator.Struct(req); err != nil {
		RespondError(w, http.StatusBadRequest, "Validation error", "VALIDATION_ERROR")
		return
	}

	result, err := h.Service.CreateProduct(r.Context(), userID, req)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to create product", "INTERNAL_ERROR")
		return
	}

	RespondJSON(w, http.StatusCreated, result)
}

func (h *ProductHandler) ListMine(w http.ResponseWriter, r *http.Request) {
	userIDStr, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		RespondError(w, http.StatusUnauthorized, "User ID not found", "UNAUTHORIZED")
		return
	}
	userID, _ := uuid.Parse(userIDStr)

	products, err := h.Service.ListUserProducts(r.Context(), userID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to list products", "INTERNAL_ERROR")
		return
	}

	RespondJSON(w, http.StatusOK, products)
}

func (h *ProductHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userIDStr, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		RespondError(w, http.StatusUnauthorized, "User ID not found", "UNAUTHORIZED")
		return
	}
	userID, _ := uuid.Parse(userIDStr)

	productIDStr := r.PathValue("id")
	productID, err := uuid.Parse(productIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid product ID", "PARSE_ERROR")
		return
	}

	err = h.Service.DeleteProduct(r.Context(), userID, productID)
	if err != nil {
		if err == service.ErrProductNotFound {
			RespondError(w, http.StatusNotFound, "Product not found", "NOT_FOUND")
			return
		}
		if err == service.ErrProductNotOwned {
			RespondError(w, http.StatusForbidden, "Access denied", "FORBIDDEN")
			return
		}
		RespondError(w, http.StatusInternalServerError, "Failed to delete product", "INTERNAL_ERROR")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}