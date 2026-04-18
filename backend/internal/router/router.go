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
	// Главный роутер
	mainMux := http.NewServeMux()

	// Публичные маршруты
	mainMux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})
	mainMux.HandleFunc("POST /v1/auth/register", authHandler.Register)
	mainMux.HandleFunc("POST /v1/auth/login", authHandler.Login)

	// Роутер для защищенных ресурсов
	protectedMux := http.NewServeMux()

	// Профили пользователей
	protectedMux.HandleFunc("GET /v1/users/me", userHandler.GetMe)
	protectedMux.HandleFunc("PATCH /v1/users/me", userHandler.UpdateMe)
	protectedMux.HandleFunc("DELETE /v1/users/me", userHandler.DeleteMe)

	// Вишлисты
	protectedMux.HandleFunc("GET /v1/wishlists", wishlistHandler.List)
	protectedMux.HandleFunc("POST /v1/wishlists", wishlistHandler.Create)
	protectedMux.HandleFunc("GET /v1/wishlists/{id}", wishlistHandler.Get)
	protectedMux.HandleFunc("PUT /v1/wishlists/{id}", wishlistHandler.Update)
	protectedMux.HandleFunc("DELETE /v1/wishlists/{id}", wishlistHandler.Delete)

	// Предметы в вишлистах
	protectedMux.HandleFunc("POST /v1/wishlists/{id}/items", wishlistHandler.AddItem)
	protectedMux.HandleFunc("GET /v1/wishlists/{id}/items", wishlistHandler.ListItems)
	protectedMux.HandleFunc("POST /v1/items/{itemId}/reserve", wishlistHandler.ReserveItem)
	protectedMux.HandleFunc("DELETE /v1/items/{itemId}", wishlistHandler.RemoveItem)

	protectedHandler := middleware.AuthMiddleware(jwtSecret, protectedMux)

	mainMux.Handle("/v1/users/", protectedHandler)
	mainMux.Handle("/v1/wishlists", protectedHandler)
	mainMux.Handle("/v1/wishlists/", protectedHandler)
	mainMux.Handle("/v1/items/", protectedHandler)

	return mainMux
}