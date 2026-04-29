package handler

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"

	"wish-piece/internal/dto"
	"wish-piece/internal/middleware"
	"wish-piece/internal/service"

	"github.com/go-playground/validator/v10"
)

type UserHandler struct {
	Service   *service.UserService
	Validator *validator.Validate
}

func (h *UserHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		RespondError(w, http.StatusUnauthorized, "User ID not found", "UNAUTHORIZED")
		return
	}

	user, err := h.Service.GetUserByID(r.Context(), userID)
	if err != nil {
		if err == service.ErrUserNotFound {
			RespondError(w, http.StatusNotFound, "User not found", "NOT_FOUND")
			return
		}
		RespondError(w, http.StatusInternalServerError, "Internal error", "INTERNAL_ERROR")
		return
	}

	RespondJSON(w, http.StatusOK, user.ToDTO())
}

func (h *UserHandler) UpdateMe(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		RespondError(w, http.StatusUnauthorized, "User ID not found", "UNAUTHORIZED")
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1048576)

	var req dto.UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid JSON", "PARSE_ERROR")
		return
	}

	if err := h.Validator.Struct(req); err != nil {
		RespondError(w, http.StatusBadRequest, fmt.Sprintf("Validation failed: %v", err), "VALIDATION_ERROR")
		return
	}

	if req.Login == nil && req.Email == nil && req.Phone == nil && req.AvatarURL == nil && req.Birthday == nil {
		RespondError(w, http.StatusBadRequest, "No fields to update", "EMPTY UPDATE")
		return
	}

	user, err := h.Service.UpdateUser(r.Context(), userID, req)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrUserAlreadyExists):
			RespondError(w, http.StatusConflict, "Login or email already taken", "CONFLICT")
		default:
			log.Printf("Update error: %v", err)
			RespondError(w, http.StatusInternalServerError, "Internal error", "INTERNAL_ERROR")
		}

		return
	}

	RespondJSON(w, http.StatusOK, user.ToDTO())
}

func (h *UserHandler) DeleteMe(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		RespondError(w, http.StatusUnauthorized, "User ID not found", "UNAUTHORIZED")
		return
	}

	var req dto.DeleteUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid JSON", "PARSE_ERROR")
		return
	}

	if err := h.Validator.Struct(req); err != nil {
		RespondError(w, http.StatusBadRequest, "Validation error", "VALIDATION_ERROR")
		return
	}

	err := h.Service.DeleteUser(r.Context(), userID, req.Password)
	if err != nil {
		if err == service.ErrInvalidPassword {
			RespondError(w, http.StatusForbidden, "Invalid password", "FORBIDDEN")
			return
		}
		if err == service.ErrUserNotFound {
			RespondError(w, http.StatusNotFound, "User not found", "NOT_FOUND")
			return
		}
		RespondError(w, http.StatusInternalServerError, "Internal error", "INTERNAL_ERROR")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
