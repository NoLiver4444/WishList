package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"wish-piece/internal/repository"

	"github.com/google/uuid"
)

// sseInterval — период опроса новых уведомлений и отправки keep-alive.
const sseInterval = 10 * time.Second

type NotificationHandler struct {
	Repo repository.NotificationRepository
	// Shutdown закрывается при остановке сервера, чтобы SSE-потоки завершились
	// и не задерживали graceful shutdown. Может быть nil.
	Shutdown <-chan struct{}
}

// Stream — Server-Sent Events. При подключении отправляет все непрочитанные уведомления,
// дальше — только новые (уже отправленные ID запоминаются), между ними шлёт «: ping».
func (h *NotificationHandler) Stream(w http.ResponseWriter, r *http.Request) {
	userID, ok := currentUserID(w, r)
	if !ok {
		return
	}

	flusher, ok := w.(http.Flusher)
	if !ok {
		RespondError(w, http.StatusInternalServerError, "Streaming unsupported", "INTERNAL_ERROR")
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")
	w.WriteHeader(http.StatusOK)

	sent := make(map[uuid.UUID]struct{})

	push := func() {
		notifications, err := h.Repo.GetUnread(r.Context(), userID)
		if err != nil {
			if r.Context().Err() == nil {
				log.Printf("SSE GetUnread error: %v", err)
			}
			return
		}
		unread := make(map[uuid.UUID]struct{}, len(notifications))
		for _, n := range notifications {
			unread[n.ID] = struct{}{}
			if _, done := sent[n.ID]; done {
				continue
			}
			data, err := json.Marshal(n)
			if err != nil {
				log.Printf("SSE marshal error: %v", err)
				continue
			}
			fmt.Fprintf(w, "data: %s\n\n", data)
			sent[n.ID] = struct{}{}
		}
		// Забываем прочитанные, чтобы набор не рос бесконечно.
		for id := range sent {
			if _, still := unread[id]; !still {
				delete(sent, id)
			}
		}
	}

	push()
	flusher.Flush()

	ticker := time.NewTicker(sseInterval)
	defer ticker.Stop()

	for {
		select {
		case <-r.Context().Done():
			return
		case <-h.Shutdown:
			return
		case <-ticker.C:
			push()
			fmt.Fprint(w, ": ping\n\n")
			flusher.Flush()
		}
	}
}

func (h *NotificationHandler) MarkRead(w http.ResponseWriter, r *http.Request) {
	userID, ok := currentUserID(w, r)
	if !ok {
		return
	}
	notifID, ok := pathUUID(w, r, "id")
	if !ok {
		return
	}

	if err := h.Repo.MarkRead(r.Context(), notifID, userID); err != nil {
		respondServiceError(w, r, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *NotificationHandler) MarkAllRead(w http.ResponseWriter, r *http.Request) {
	userID, ok := currentUserID(w, r)
	if !ok {
		return
	}

	if err := h.Repo.MarkAllRead(r.Context(), userID); err != nil {
		respondServiceError(w, r, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
