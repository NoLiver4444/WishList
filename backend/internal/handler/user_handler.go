package handler

import (
	"net/http"
	"wish-piece/internal/dto"
	"wish-piece/internal/middleware"
	"wish-piece/internal/service"
)

type UserHandler struct {
	Service *service.UserService
}

func (h *UserHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		RespondError(w, http.StatusUnauthorized, "User ID not found in context", "UNAUTHORIZED")
		return
	}

	user, err := h.Service.GetUserByID(r.Context(), userID)
	if err != nil {
		if err == service.ErrUserNotFound {
			RespondError(w, http.StatusNotFound, "User not found", "NOT_FOUND")
			return
		}
		RespondError(w, http.StatusInternalServerError, "Internal server error", "INTERNAL_ERROR")
		return
	}
	
	userDTO := dto.UserDTO{
		ID:        user.ID,
		Login:     user.Login,
		Email:     user.Email,
		Phone:     user.Phone,
		AvatarURL: user.AvatarURL,
		CreatedAt: user.CreatedAt,
	}

	RespondJSON(w, http.StatusOK, userDTO)
}