package handler

import (
	"net/http"

	"wish-piece/internal/dto"
	"wish-piece/internal/service"

	"github.com/go-playground/validator/v10"
)

type AuthHandler struct {
	Service   *service.AuthService
	Validator *validator.Validate
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateUserRequest
	if !decodeJSON(w, r, h.Validator, &req) {
		return
	}

	resp, err := h.Service.Register(r.Context(), req)
	if err != nil {
		respondServiceError(w, r, err)
		return
	}

	RespondJSON(w, http.StatusCreated, resp)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req dto.LoginRequest
	if !decodeJSON(w, r, h.Validator, &req) {
		return
	}

	resp, err := h.Service.Login(r.Context(), req)
	if err != nil {
		respondServiceError(w, r, err)
		return
	}

	RespondJSON(w, http.StatusOK, resp)
}
