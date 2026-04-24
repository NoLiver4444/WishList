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
	productHandler *handler.ProductHandler,
	jwtSecret string,
) http.Handler {
	mainMux := http.NewServeMux()

	// Публичные маршруты
	mainMux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	mainMux.HandleFunc("/v1/auth/register", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		authHandler.Register(w, r)
	})

	mainMux.HandleFunc("/v1/auth/login", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		authHandler.Login(w, r)
	})

	// Публичный просмотр
	mainMux.HandleFunc("GET /v1/public/wishlists/{id}", wishlistHandler.GetPublic)
	mainMux.HandleFunc("GET /v1/public/wishlists/{id}/items", wishlistHandler.ListItemsPublic)

	// Защищённые маршруты
	protectedMux := http.NewServeMux()

	// Пользователи
	protectedMux.HandleFunc("GET /v1/users/me", userHandler.GetMe)
	protectedMux.HandleFunc("PATCH /v1/users/me", userHandler.UpdateMe)
	protectedMux.HandleFunc("DELETE /v1/users/me", userHandler.DeleteMe)

	// Продукты (желания пользователя)
	protectedMux.HandleFunc("GET /v1/products/me", productHandler.ListMine)
	protectedMux.HandleFunc("POST /v1/products", productHandler.Create)
	protectedMux.HandleFunc("PATCH /v1/products/{id}", productHandler.Update)
	protectedMux.HandleFunc("DELETE /v1/products/{id}", productHandler.Delete)

	// Вишлисты
	protectedMux.HandleFunc("GET /v1/wishlists", wishlistHandler.List)
	protectedMux.HandleFunc("POST /v1/wishlists", wishlistHandler.Create)
	protectedMux.HandleFunc("GET /v1/wishlists/{id}", wishlistHandler.Get)
	protectedMux.HandleFunc("PUT /v1/wishlists/{id}", wishlistHandler.Update)
	protectedMux.HandleFunc("DELETE /v1/wishlists/{id}", wishlistHandler.Delete)

	// Элементы вишлиста
	protectedMux.HandleFunc("POST /v1/wishlists/{id}/items", wishlistHandler.AddItem)
	protectedMux.HandleFunc("GET /v1/wishlists/{id}/items", wishlistHandler.ListItems)
	protectedMux.HandleFunc("POST /v1/items/{itemId}/reserve", wishlistHandler.ReserveItem)
	protectedMux.HandleFunc("DELETE /v1/items/{itemId}", wishlistHandler.RemoveItem)

	protectedHandler := middleware.AuthMiddleware(jwtSecret, protectedMux)

	mainMux.Handle("/v1/users/", withOptions(protectedHandler))
	mainMux.Handle("/v1/wishlists", withOptions(protectedHandler))
	mainMux.Handle("/v1/wishlists/", withOptions(protectedHandler))
	mainMux.Handle("/v1/items/", withOptions(protectedHandler))
	mainMux.Handle("/v1/products", withOptions(protectedHandler))
	mainMux.Handle("/v1/products/", withOptions(protectedHandler))

	return applyCORS(mainMux)
}

func applyCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func withOptions(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}