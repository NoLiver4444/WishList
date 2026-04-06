package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-playground/validator/v10"
	"wish-piece/internal/dto"
	"wish-piece/internal/service"
)

type AuthHandler struct {
	Service   *service.AuthService
	Validator *validator.Validate
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid JSON", "PARSE_ERROR")
		return
	}

	if err := h.Validator.Struct(req); err != nil {
		RespondError(w, http.StatusBadRequest, "Validation error", "VALIDATION_ERROR")
		return
	}

	resp, err := h.Service.Register(r.Context(), req)
	if err != nil {
		if err == service.ErrUserAlreadyExists {
			RespondError(w, http.StatusConflict, "Login or email already exists", "CONFLICT")
			return
		}
		RespondError(w, http.StatusInternalServerError, "Internal server error", "INTERNAL_ERROR")
		return
	}

	RespondJSON(w, http.StatusCreated, resp)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req dto.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid JSON", "PARSE_ERROR")
		return
	}

	if err := h.Validator.Struct(req); err != nil {
		RespondError(w, http.StatusBadRequest, "Validation error", "VALIDATION_ERROR")
		return
	}

	resp, err := h.Service.Login(r.Context(), req)
	if err != nil {
		RespondError(w, http.StatusUnauthorized, "Invalid login or password", "UNAUTHORIZED")
		return
	}

	RespondJSON(w, http.StatusOK, resp)
}