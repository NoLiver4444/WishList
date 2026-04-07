package router

import (
	"net/http"
	"wish-piece/internal/handler"
	"wish-piece/internal/middleware"
)

func New(authHandler *handler.AuthHandler, userHandler *handler.UserHandler, jwtSecret string) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})
	mux.HandleFunc("POST /v1/auth/register", authHandler.Register)
	mux.HandleFunc("POST /v1/auth/login", authHandler.Login)

	protectedMux := http.NewServeMux()
	protectedMux.HandleFunc("GET /v1/users/me", userHandler.GetMe)
	protectedMux.HandleFunc("PATCH /v1/users/me", userHandler.UpdateMe)
	protectedMux.HandleFunc("DELETE /v1/users/me", userHandler.DeleteMe)

	authMiddleware := middleware.AuthMiddleware(jwtSecret, protectedMux)
	
	mux.Handle("/v1/users/", authMiddleware)

	return mux
}