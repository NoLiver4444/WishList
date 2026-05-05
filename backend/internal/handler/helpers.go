package handler

import (
	"encoding/json"
	"net/http"
)

func RespondJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if payload != nil {
		json.NewEncoder(w).Encode(payload)
	}
}

// main
// 1
func RespondError(w http.ResponseWriter, status int, message, code string) {
	RespondJSON(w, status, map[string]any{
		"status":  status,
		"message": message,
		"code":    code,
	})
}
