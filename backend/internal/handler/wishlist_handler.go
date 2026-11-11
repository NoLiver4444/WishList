package handler

import (
	"net/http"

	"wish-piece/internal/dto"
	"wish-piece/internal/service"

	"github.com/go-playground/validator/v10"
)

type WishlistHandler struct {
	Service   *service.WishlistService
	Validator *validator.Validate
}

// ============ WISHLIST ============

func (h *WishlistHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID, ok := currentUserID(w, r)
	if !ok {
		return
	}

	var req dto.CreateWishlistRequest
	if !decodeJSON(w, r, h.Validator, &req) {
		return
	}

	result, err := h.Service.CreateWishlist(r.Context(), userID, req)
	if err != nil {
		respondServiceError(w, r, err)
		return
	}

	RespondJSON(w, http.StatusCreated, result)
}

func (h *WishlistHandler) List(w http.ResponseWriter, r *http.Request) {
	userID, ok := currentUserID(w, r)
	if !ok {
		return
	}

	results, err := h.Service.ListUserWishlists(r.Context(), userID)
	if err != nil {
		respondServiceError(w, r, err)
		return
	}

	RespondJSON(w, http.StatusOK, results)
}

func (h *WishlistHandler) Get(w http.ResponseWriter, r *http.Request) {
	userID, ok := currentUserID(w, r)
	if !ok {
		return
	}
	wlID, ok := pathUUID(w, r, "id")
	if !ok {
		return
	}

	withItems := r.URL.Query().Get("with_items") == "true"

	result, err := h.Service.GetWishlist(r.Context(), userID, wlID, withItems)
	if err != nil {
		respondServiceError(w, r, err)
		return
	}

	RespondJSON(w, http.StatusOK, result)
}

func (h *WishlistHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID, ok := currentUserID(w, r)
	if !ok {
		return
	}
	wlID, ok := pathUUID(w, r, "id")
	if !ok {
		return
	}

	var req dto.UpdateWishlistRequest
	if !decodeJSON(w, r, h.Validator, &req) {
		return
	}

	result, err := h.Service.UpdateWishlist(r.Context(), userID, wlID, req)
	if err != nil {
		respondServiceError(w, r, err)
		return
	}

	RespondJSON(w, http.StatusOK, result)
}

func (h *WishlistHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID, ok := currentUserID(w, r)
	if !ok {
		return
	}
	wlID, ok := pathUUID(w, r, "id")
	if !ok {
		return
	}

	if err := h.Service.DeleteWishlist(r.Context(), userID, wlID); err != nil {
		respondServiceError(w, r, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ============ ITEMS ============

func (h *WishlistHandler) AddItem(w http.ResponseWriter, r *http.Request) {
	userID, ok := currentUserID(w, r)
	if !ok {
		return
	}
	wlID, ok := pathUUID(w, r, "id")
	if !ok {
		return
	}

	var req dto.AddItemRequest
	if !decodeJSON(w, r, h.Validator, &req) {
		return
	}

	result, err := h.Service.AddItem(r.Context(), userID, wlID, req)
	if err != nil {
		respondServiceError(w, r, err)
		return
	}

	RespondJSON(w, http.StatusCreated, result)
}

func (h *WishlistHandler) ListItems(w http.ResponseWriter, r *http.Request) {
	userID, ok := currentUserID(w, r)
	if !ok {
		return
	}
	wlID, ok := pathUUID(w, r, "id")
	if !ok {
		return
	}

	items, err := h.Service.ListItems(r.Context(), userID, wlID)
	if err != nil {
		respondServiceError(w, r, err)
		return
	}

	RespondJSON(w, http.StatusOK, items)
}

// ReserveItem — POST /v1/items/{itemId}/reserve: забронировать желание.
func (h *WishlistHandler) ReserveItem(w http.ResponseWriter, r *http.Request) {
	userID, ok := currentUserID(w, r)
	if !ok {
		return
	}
	itemID, ok := pathUUID(w, r, "itemId")
	if !ok {
		return
	}

	if err := h.Service.ReserveItem(r.Context(), userID, itemID); err != nil {
		respondServiceError(w, r, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// UnreserveItem — DELETE /v1/items/{itemId}/reserve: снять бронь.
func (h *WishlistHandler) UnreserveItem(w http.ResponseWriter, r *http.Request) {
	userID, ok := currentUserID(w, r)
	if !ok {
		return
	}
	itemID, ok := pathUUID(w, r, "itemId")
	if !ok {
		return
	}

	if err := h.Service.UnreserveItem(r.Context(), userID, itemID); err != nil {
		respondServiceError(w, r, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *WishlistHandler) RemoveItem(w http.ResponseWriter, r *http.Request) {
	userID, ok := currentUserID(w, r)
	if !ok {
		return
	}
	itemID, ok := pathUUID(w, r, "itemId")
	if !ok {
		return
	}

	if err := h.Service.RemoveItem(r.Context(), userID, itemID); err != nil {
		respondServiceError(w, r, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ============ PUBLIC ============

func (h *WishlistHandler) GetPublic(w http.ResponseWriter, r *http.Request) {
	wlID, ok := pathUUID(w, r, "id")
	if !ok {
		return
	}

	result, err := h.Service.GetWishlistPublic(r.Context(), wlID)
	if err != nil {
		respondServiceError(w, r, err)
		return
	}

	RespondJSON(w, http.StatusOK, result)
}

func (h *WishlistHandler) ListItemsPublic(w http.ResponseWriter, r *http.Request) {
	wlID, ok := pathUUID(w, r, "id")
	if !ok {
		return
	}

	items, err := h.Service.ListItemsPublic(r.Context(), wlID)
	if err != nil {
		respondServiceError(w, r, err)
		return
	}

	RespondJSON(w, http.StatusOK, items)
}
