package handler

import (
	"net/http"

	"wish-piece/internal/dto"
	"wish-piece/internal/service"

	"github.com/go-playground/validator/v10"
)

type UserHandler struct {
	Service   *service.UserService
	Validator *validator.Validate
}

func (h *UserHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	userID, ok := currentUserID(w, r)
	if !ok {
		return
	}

	user, err := h.Service.GetUserByID(r.Context(), userID)
	if err != nil {
		respondServiceError(w, r, err)
		return
	}

	RespondJSON(w, http.StatusOK, user.ToDTO())
}

func (h *UserHandler) UpdateMe(w http.ResponseWriter, r *http.Request) {
	userID, ok := currentUserID(w, r)
	if !ok {
		return
	}

	var req dto.UpdateUserRequest
	if !decodeJSON(w, r, h.Validator, &req) {
		return
	}

	if req.Login == nil && req.Email == nil && req.Phone == nil && req.AvatarURL == nil && req.Birthday == nil {
		RespondError(w, http.StatusBadRequest, "Нет полей для обновления", "EMPTY_UPDATE")
		return
	}

	user, err := h.Service.UpdateUser(r.Context(), userID, req)
	if err != nil {
		respondServiceError(w, r, err)
		return
	}

	RespondJSON(w, http.StatusOK, user.ToDTO())
}

func (h *UserHandler) DeleteMe(w http.ResponseWriter, r *http.Request) {
	userID, ok := currentUserID(w, r)
	if !ok {
		return
	}

	var req dto.DeleteUserRequest
	if !decodeJSON(w, r, h.Validator, &req) {
		return
	}

	if err := h.Service.DeleteUser(r.Context(), userID, req.Password); err != nil {
		respondServiceError(w, r, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
