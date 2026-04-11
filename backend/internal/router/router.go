package router

import (
	"net/http"
	"wish-piece/internal/handler"
	"wish-piece/internal/middleware"
)

func New(
	authHandler *handler.AuthHandler,
	userHandler *handler.UserHandler,
	wishlistHandler *handler.WishlistHandler,
	jwtSecret string,
) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})
	mux.HandleFunc("POST /v1/auth/register", authHandler.Register)
	mux.HandleFunc("POST /v1/auth/login", authHandler.Login)

	protectedMux := http.NewServeMux()
	// user routes
	protectedMux.HandleFunc("GET /v1/users/me", userHandler.GetMe)
	protectedMux.HandleFunc("PATCH /v1/users/me", userHandler.UpdateMe)
	protectedMux.HandleFunc("DELETE /v1/users/me", userHandler.DeleteMe)
	// wishlist routes
	protectedMux.HandleFunc("GET /v1/wishlists", wishlistHandler.List)
	protectedMux.HandleFunc("POST /v1/wishlists", wishlistHandler.Create)
	protectedMux.HandleFunc("GET /v1/wishlists/{id}", wishlistHandler.Get)
	protectedMux.HandleFunc("PUT /v1/wishlists/{id}", wishlistHandler.Update)
	protectedMux.HandleFunc("DELETE /v1/wishlists/{id}", wishlistHandler.Delete)
	// item routes
	protectedMux.HandleFunc("POST /v1/wishlists/{id}/items", wishlistHandler.AddItem)
	protectedMux.HandleFunc("GET /v1/wishlists/{id}/items", wishlistHandler.ListItems)
	protectedMux.HandleFunc("POST /v1/items/{itemId}/reserve", wishlistHandler.ReserveItem)
	protectedMux.HandleFunc("DELETE /v1/items/{itemId}", wishlistHandler.RemoveItem)
	authMiddleware := middleware.AuthMiddleware(jwtSecret, protectedMux)

	mux.Handle("/v1/users/", authMiddleware)

	return mux
}
