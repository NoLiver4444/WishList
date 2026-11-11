package handler

import (
	"net/http"

	"wish-piece/internal/dto"
	"wish-piece/internal/service"

	"github.com/go-playground/validator/v10"
)

type ProductHandler struct {
	Service   *service.ProductService
	Validator *validator.Validate
}

func (h *ProductHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID, ok := currentUserID(w, r)
	if !ok {
		return
	}

	var req dto.ProductRequest
	if !decodeJSON(w, r, h.Validator, &req) {
		return
	}

	result, err := h.Service.CreateProduct(r.Context(), userID, req)
	if err != nil {
		respondServiceError(w, r, err)
		return
	}

	RespondJSON(w, http.StatusCreated, result)
}

func (h *ProductHandler) ListMine(w http.ResponseWriter, r *http.Request) {
	userID, ok := currentUserID(w, r)
	if !ok {
		return
	}

	products, err := h.Service.ListUserProducts(r.Context(), userID)
	if err != nil {
		respondServiceError(w, r, err)
		return
	}

	RespondJSON(w, http.StatusOK, products)
}

func (h *ProductHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID, ok := currentUserID(w, r)
	if !ok {
		return
	}
	productID, ok := pathUUID(w, r, "id")
	if !ok {
		return
	}

	if err := h.Service.DeleteProduct(r.Context(), userID, productID); err != nil {
		respondServiceError(w, r, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// Update полностью заменяет товар (PUT): отсутствующие необязательные поля очищаются.
func (h *ProductHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID, ok := currentUserID(w, r)
	if !ok {
		return
	}
	productID, ok := pathUUID(w, r, "id")
	if !ok {
		return
	}

	var req dto.ProductRequest
	if !decodeJSON(w, r, h.Validator, &req) {
		return
	}

	result, err := h.Service.UpdateProduct(r.Context(), userID, productID, req)
	if err != nil {
		respondServiceError(w, r, err)
		return
	}

	RespondJSON(w, http.StatusOK, result)
}
