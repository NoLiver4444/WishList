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

type WishlistHandler struct {
	Service   *service.WishlistService
	Validator *validator.Validate
}

// ============ WISHLIST ============

func (h *WishlistHandler) Create(w http.ResponseWriter, r *http.Request) {
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

	var req dto.CreateWishlistRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid JSON", "PARSE_ERROR")
		return
	}

	if err := h.Validator.Struct(req); err != nil {
		RespondError(w, http.StatusBadRequest, "Validation error", "VALIDATION_ERROR")
		return
	}

	result, err := h.Service.CreateWishlist(r.Context(), userID, req)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to create wishlist", "INTERNAL_ERROR")
		return
	}

	RespondJSON(w, http.StatusCreated, result)
}

func (h *WishlistHandler) List(w http.ResponseWriter, r *http.Request) {
	userIDStr, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		RespondError(w, http.StatusUnauthorized, "User ID not found", "UNAUTHORIZED")
		return
	}
	userID, _ := uuid.Parse(userIDStr)

	results, err := h.Service.ListUserWishlists(r.Context(), userID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to list wishlists", "INTERNAL_ERROR")
		return
	}

	RespondJSON(w, http.StatusOK, results)
}

func (h *WishlistHandler) Get(w http.ResponseWriter, r *http.Request) {
	userIDStr, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		RespondError(w, http.StatusUnauthorized, "User ID not found", "UNAUTHORIZED")
		return
	}
	userID, _ := uuid.Parse(userIDStr)

	wlIDStr := r.PathValue("id")
	wlID, err := uuid.Parse(wlIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid wishlist ID", "PARSE_ERROR")
		return
	}

	withItems := r.URL.Query().Get("with_items") == "true"

	result, err := h.Service.GetWishlist(r.Context(), userID, wlID, withItems)
	if err != nil {
		if err == service.ErrWishlistNotFound {
			RespondError(w, http.StatusNotFound, "Wishlist not found", "NOT_FOUND")
			return
		}
		if err == service.ErrWishlistNotOwned {
			RespondError(w, http.StatusForbidden, "Access denied", "FORBIDDEN")
			return
		}
		RespondError(w, http.StatusInternalServerError, "Failed to get wishlist", "INTERNAL_ERROR")
		return
	}

	RespondJSON(w, http.StatusOK, result)
}

func (h *WishlistHandler) Update(w http.ResponseWriter, r *http.Request) {
	userIDStr, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		RespondError(w, http.StatusUnauthorized, "User ID not found", "UNAUTHORIZED")
		return
	}
	userID, _ := uuid.Parse(userIDStr)

	wlIDStr := r.PathValue("id")
	wlID, err := uuid.Parse(wlIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid wishlist ID", "PARSE_ERROR")
		return
	}

	var req dto.UpdateWishlistRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid JSON", "PARSE_ERROR")
		return
	}

	if err := h.Validator.Struct(req); err != nil {
		RespondError(w, http.StatusBadRequest, "Validation error", "VALIDATION_ERROR")
		return
	}

	result, err := h.Service.UpdateWishlist(r.Context(), userID, wlID, req)
	if err != nil {
		if err == service.ErrWishlistNotFound {
			RespondError(w, http.StatusNotFound, "Wishlist not found", "NOT_FOUND")
			return
		}
		if err == service.ErrWishlistNotOwned {
			RespondError(w, http.StatusForbidden, "Access denied", "FORBIDDEN")
			return
		}
		RespondError(w, http.StatusInternalServerError, "Failed to update wishlist", "INTERNAL_ERROR")
		return
	}

	RespondJSON(w, http.StatusOK, result)
}

func (h *WishlistHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userIDStr, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		RespondError(w, http.StatusUnauthorized, "User ID not found", "UNAUTHORIZED")
		return
	}
	userID, _ := uuid.Parse(userIDStr)

	wlIDStr := r.PathValue("id")
	wlID, err := uuid.Parse(wlIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid wishlist ID", "PARSE_ERROR")
		return
	}

	err = h.Service.DeleteWishlist(r.Context(), userID, wlID)
	if err != nil {
		if err == service.ErrWishlistNotFound {
			RespondError(w, http.StatusNotFound, "Wishlist not found", "NOT_FOUND")
			return
		}
		if err == service.ErrWishlistNotOwned {
			RespondError(w, http.StatusForbidden, "Access denied", "FORBIDDEN")
			return
		}
		RespondError(w, http.StatusInternalServerError, "Failed to delete wishlist", "INTERNAL_ERROR")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ============ ITEMS ============

func (h *WishlistHandler) AddItem(w http.ResponseWriter, r *http.Request) {
	userIDStr, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		RespondError(w, http.StatusUnauthorized, "User ID not found", "UNAUTHORIZED")
		return
	}
	userID, _ := uuid.Parse(userIDStr)

	wlIDStr := r.PathValue("id")
	wlID, err := uuid.Parse(wlIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid wishlist ID", "PARSE_ERROR")
		return
	}

	var req dto.AddItemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid JSON", "PARSE_ERROR")
		return
	}

	if err := h.Validator.Struct(req); err != nil {
		RespondError(w, http.StatusBadRequest, "Validation error", "VALIDATION_ERROR")
		return
	}

	result, err := h.Service.AddItem(r.Context(), userID, wlID, req)
	if err != nil {
		if err == service.ErrWishlistNotOwned {
			RespondError(w, http.StatusForbidden, "Access denied", "FORBIDDEN")
			return
		}
		if err == service.ErrProductNotFound {
			RespondError(w, http.StatusNotFound, "Product not found", "NOT_FOUND")
			return
		}
		RespondError(w, http.StatusInternalServerError, "Failed to add item", "INTERNAL_ERROR")
		return
	}

	RespondJSON(w, http.StatusCreated, result)
}

func (h *WishlistHandler) ListItems(w http.ResponseWriter, r *http.Request) {
	userIDStr, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		RespondError(w, http.StatusUnauthorized, "User ID not found", "UNAUTHORIZED")
		return
	}
	userID, _ := uuid.Parse(userIDStr)

	wlIDStr := r.PathValue("id")
	wlID, err := uuid.Parse(wlIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid wishlist ID", "PARSE_ERROR")
		return
	}

	items, err := h.Service.ListItems(r.Context(), userID, wlID)
	if err != nil {
		if err == service.ErrWishlistNotFound {
			RespondError(w, http.StatusNotFound, "Wishlist not found", "NOT_FOUND")
			return
		}
		if err == service.ErrWishlistNotOwned {
			RespondError(w, http.StatusForbidden, "Access denied", "FORBIDDEN")
			return
		}
		RespondError(w, http.StatusInternalServerError, "Failed to list items", "INTERNAL_ERROR")
		return
	}

	RespondJSON(w, http.StatusOK, items)
}

func (h *WishlistHandler) ReserveItem(w http.ResponseWriter, r *http.Request) {
	userIDStr, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		RespondError(w, http.StatusUnauthorized, "User ID not found", "UNAUTHORIZED")
		return
	}
	userID, _ := uuid.Parse(userIDStr)

	itemIDStr := r.PathValue("itemId")
	itemID, err := uuid.Parse(itemIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid item ID", "PARSE_ERROR")
		return
	}

	var req dto.ReserveItemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid JSON", "PARSE_ERROR")
		return
	}

	if err := h.Validator.Struct(req); err != nil {
		RespondError(w, http.StatusBadRequest, "Validation error", "VALIDATION_ERROR")
		return
	}

	err = h.Service.ReserveItem(r.Context(), userID, itemID, req.Action)
	if err != nil {
		if err == service.ErrItemNotFound || err == service.ErrWishlistNotFound {
			RespondError(w, http.StatusNotFound, "Not found", "NOT_FOUND")
			return
		}
		if err == service.ErrWishlistNotOwned {
			RespondError(w, http.StatusForbidden, "Access denied", "FORBIDDEN")
			return
		}
		RespondError(w, http.StatusInternalServerError, "Failed to reserve item", "INTERNAL_ERROR")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *WishlistHandler) RemoveItem(w http.ResponseWriter, r *http.Request) {
	userIDStr, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		RespondError(w, http.StatusUnauthorized, "User ID not found", "UNAUTHORIZED")
		return
	}
	userID, _ := uuid.Parse(userIDStr)

	itemIDStr := r.PathValue("itemId")
	itemID, err := uuid.Parse(itemIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid item ID", "PARSE_ERROR")
		return
	}

	err = h.Service.RemoveItem(r.Context(), userID, itemID)
	if err != nil {
		if err == service.ErrItemNotFound {
			RespondError(w, http.StatusNotFound, "Item not found", "NOT_FOUND")
			return
		}
		if err == service.ErrWishlistNotOwned {
			RespondError(w, http.StatusForbidden, "Access denied", "FORBIDDEN")
			return
		}
		RespondError(w, http.StatusInternalServerError, "Failed to remove item", "INTERNAL_ERROR")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *WishlistHandler) GetPublic(w http.ResponseWriter, r *http.Request) {
	wlIDStr := r.PathValue("id")
	wlID, err := uuid.Parse(wlIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid wishlist ID", "PARSE_ERROR")
		return
	}

	result, err := h.Service.GetWishlistPublic(r.Context(), wlID)
	if err != nil {
		if err == service.ErrWishlistNotFound {
			RespondError(w, http.StatusNotFound, "Wishlist not found", "NOT_FOUND")
			return
		}
		RespondError(w, http.StatusInternalServerError, "Failed to get wishlist", "INTERNAL_ERROR")
		return
	}

	RespondJSON(w, http.StatusOK, result)
}

func (h *WishlistHandler) ListItemsPublic(w http.ResponseWriter, r *http.Request) {
	wlIDStr := r.PathValue("id")
	wlID, err := uuid.Parse(wlIDStr)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid wishlist ID", "PARSE_ERROR")
		return
	}

	items, err := h.Service.ListItemsPublic(r.Context(), wlID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to list items", "INTERNAL_ERROR")
		return
	}

	RespondJSON(w, http.StatusOK, items)
}