package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"log"

	"wish-piece/internal/dto"
	"wish-piece/internal/middleware"
	"wish-piece/internal/models"
	"wish-piece/internal/service"

	"github.com/go-playground/validator/v10"
)

type FriendshipHandler struct {
	Service   *service.FriendshipService
	Validator *validator.Validate
}

func (h *FriendshipHandler) SearchUsers(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		RespondError(w, http.StatusUnauthorized, "Unauthorized", "UNAUTHORIZED")
		return
	}

	login := r.URL.Query().Get("login")
	if len(login) < 2 {
		RespondError(w, http.StatusBadRequest, "Login too short", "VALIDATION_ERROR")
		return
	}

	results, err := h.Service.SearchUsers(r.Context(), login, userID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "Internal error", "INTERNAL_ERROR")
		return
	}

	RespondJSON(w, http.StatusOK, results)
}

func (h *FriendshipHandler) SendRequest(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		RespondError(w, http.StatusUnauthorized, "Unauthorized", "UNAUTHORIZED")
		return
	}

	var req dto.FriendRequestDTO
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid JSON", "PARSE_ERROR")
		return
	}
	if err := h.Validator.Struct(req); err != nil {
		RespondError(w, http.StatusBadRequest, "Validation error", "VALIDATION_ERROR")
		return
	}

	friendship, err := h.Service.SendRequest(r.Context(), userID, req)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrFriendshipAlreadyExists):
			RespondError(w, http.StatusConflict, "Already sent", "CONFLICT")
		case errors.Is(err, service.ErrCannotAddSelf):
			RespondError(w, http.StatusBadRequest, "Cannot add yourself", "BAD_REQUEST")
		default:
			RespondError(w, http.StatusInternalServerError, "Internal error", "INTERNAL_ERROR")
		}
		return
	}

	RespondJSON(w, http.StatusCreated, friendship)
}

func (h *FriendshipHandler) RespondToRequest(w http.ResponseWriter, r *http.Request) {
	friendshipID := r.PathValue("id") // Go 1.22+
	status := models.FriendshipStatus(r.URL.Query().Get("status"))

	if status != models.FriendshipAccepted && status != models.FriendshipDeclined {
		RespondError(w, http.StatusBadRequest, "Invalid status", "VALIDATION_ERROR")
		return
	}

	if err := h.Service.RespondToRequest(r.Context(), friendshipID, status); err != nil {
		RespondError(w, http.StatusNotFound, "Friendship not found", "NOT_FOUND")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *FriendshipHandler) GetFriends(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		RespondError(w, http.StatusUnauthorized, "Unauthorized", "UNAUTHORIZED")
		return
	}

	friends, err := h.Service.GetFriends(r.Context(), userID)
	if err != nil {
	    log.Printf("GetFriends error: %v", err)
		RespondError(w, http.StatusInternalServerError, "Internal error", "INTERNAL_ERROR")
		return
	}

	RespondJSON(w, http.StatusOK, friends)
}

func (h *FriendshipHandler) GetIncomingRequests(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		RespondError(w, http.StatusUnauthorized, "Unauthorized", "UNAUTHORIZED")
		return
	}

	requests, err := h.Service.GetIncomingRequests(r.Context(), userID)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "Internal error", "INTERNAL_ERROR")
		return
	}

	RespondJSON(w, http.StatusOK, requests)
}

func (h *FriendshipHandler) DeleteFriend(w http.ResponseWriter, r *http.Request) {
    friendshipID := r.PathValue("id")
    if err := h.Service.DeleteFriend(r.Context(), friendshipID); err != nil {
        RespondError(w, http.StatusNotFound, "Not found", "NOT_FOUND")
        return
    }
    w.WriteHeader(http.StatusNoContent)
}