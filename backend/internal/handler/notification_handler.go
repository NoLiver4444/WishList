package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"wish-piece/internal/middleware"
	"wish-piece/internal/repository"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type NotificationHandler struct {
	Repo      *repository.NotificationRepo
	Validator *validator.Validate
}

func (h *NotificationHandler) Stream(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		RespondError(w, http.StatusUnauthorized, "Unauthorized", "UNAUTHORIZED")
		return
	}

	id, err := uuid.Parse(userID)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Bad request", "BAD_REQUEST")
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")

	flusher, ok := w.(http.Flusher)
	if !ok {
		RespondError(w, http.StatusInternalServerError, "Streaming unsupported", "INTERNAL_ERROR")
		return
	}

	notifications, err := h.Repo.GetUnread(r.Context(), id)
	if err == nil && len(notifications) > 0 {
		for _, n := range notifications {
			data, _ := json.Marshal(n)
			fmt.Fprintf(w, "data: %s\n\n", data)
		}
		flusher.Flush()
	}

	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-r.Context().Done():
			return
		case <-ticker.C:
			notifications, err := h.Repo.GetUnread(r.Context(), id)
			if err != nil {
				log.Printf("SSE GetUnread error: %v", err)
				continue
			}
			for _, n := range notifications {
				data, _ := json.Marshal(n)
				fmt.Fprintf(w, "data: %s\n\n", data)
				flusher.Flush()
			}
		}
	}
}

func (h *NotificationHandler) MarkRead(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		RespondError(w, http.StatusUnauthorized, "Unauthorized", "UNAUTHORIZED")
		return
	}

	notifID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Bad id", "BAD_REQUEST")
		return
	}

	uid, _ := uuid.Parse(userID)
	if err := h.Repo.MarkRead(r.Context(), notifID, uid); err != nil {
		RespondError(w, http.StatusInternalServerError, "Internal error", "INTERNAL_ERROR")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *NotificationHandler) MarkAllRead(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		RespondError(w, http.StatusUnauthorized, "Unauthorized", "UNAUTHORIZED")
		return
	}

	uid, _ := uuid.Parse(userID)
	if err := h.Repo.MarkAllRead(r.Context(), uid); err != nil {
		RespondError(w, http.StatusInternalServerError, "Internal error", "INTERNAL_ERROR")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
