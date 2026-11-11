package handler

import (
	"net/http"
	"strings"

	"wish-piece/internal/dto"
	"wish-piece/internal/models"
	"wish-piece/internal/service"

	"github.com/go-playground/validator/v10"
)

type FriendshipHandler struct {
	Service   *service.FriendshipService
	Validator *validator.Validate
}

func (h *FriendshipHandler) SearchUsers(w http.ResponseWriter, r *http.Request) {
	userID, ok := currentUserID(w, r)
	if !ok {
		return
	}

	login := strings.TrimSpace(r.URL.Query().Get("login"))
	if len([]rune(login)) < 2 {
		RespondError(w, http.StatusBadRequest, "Слишком короткий запрос", "VALIDATION_ERROR")
		return
	}

	results, err := h.Service.SearchUsers(r.Context(), login, userID)
	if err != nil {
		respondServiceError(w, r, err)
		return
	}

	RespondJSON(w, http.StatusOK, results)
}

func (h *FriendshipHandler) SendRequest(w http.ResponseWriter, r *http.Request) {
	userID, ok := currentUserID(w, r)
	if !ok {
		return
	}

	var req dto.FriendRequestDTO
	if !decodeJSON(w, r, h.Validator, &req) {
		return
	}

	friendship, err := h.Service.SendRequest(r.Context(), userID, req.FriendID)
	if err != nil {
		respondServiceError(w, r, err)
		return
	}

	RespondJSON(w, http.StatusCreated, friendship)
}

// RespondToRequest принимает (?status=accepted) или отклоняет (?status=declined) входящую заявку.
func (h *FriendshipHandler) RespondToRequest(w http.ResponseWriter, r *http.Request) {
	userID, ok := currentUserID(w, r)
	if !ok {
		return
	}
	friendshipID, ok := pathUUID(w, r, "id")
	if !ok {
		return
	}

	status := models.FriendshipStatus(r.URL.Query().Get("status"))
	if status != models.FriendshipAccepted && status != models.FriendshipDeclined {
		RespondError(w, http.StatusBadRequest, "Некорректный статус", "VALIDATION_ERROR")
		return
	}

	if err := h.Service.RespondToRequest(r.Context(), userID, friendshipID, status); err != nil {
		respondServiceError(w, r, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *FriendshipHandler) GetFriends(w http.ResponseWriter, r *http.Request) {
	userID, ok := currentUserID(w, r)
	if !ok {
		return
	}

	friends, err := h.Service.GetFriends(r.Context(), userID)
	if err != nil {
		respondServiceError(w, r, err)
		return
	}

	RespondJSON(w, http.StatusOK, friends)
}

func (h *FriendshipHandler) GetIncomingRequests(w http.ResponseWriter, r *http.Request) {
	userID, ok := currentUserID(w, r)
	if !ok {
		return
	}

	requests, err := h.Service.GetIncomingRequests(r.Context(), userID)
	if err != nil {
		respondServiceError(w, r, err)
		return
	}

	RespondJSON(w, http.StatusOK, requests)
}

func (h *FriendshipHandler) DeleteFriend(w http.ResponseWriter, r *http.Request) {
	userID, ok := currentUserID(w, r)
	if !ok {
		return
	}
	friendshipID, ok := pathUUID(w, r, "id")
	if !ok {
		return
	}

	if err := h.Service.DeleteFriend(r.Context(), userID, friendshipID); err != nil {
		respondServiceError(w, r, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
