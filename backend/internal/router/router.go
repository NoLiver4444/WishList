package router

import (
	"net/http"

	"wish-piece/internal/handler"
	"wish-piece/internal/middleware"
)

// maxBodyBytes — ограничение размера тела запроса (JSON).
const maxBodyBytes = 1 << 20

type Handlers struct {
	Auth         *handler.AuthHandler
	User         *handler.UserHandler
	Wishlist     *handler.WishlistHandler
	Product      *handler.ProductHandler
	Friendship   *handler.FriendshipHandler
	Notification *handler.NotificationHandler
}

type Options struct {
	JWTSecret  string
	CORSOrigin string
}

func New(h Handlers, opts Options) http.Handler {
	mainMux := http.NewServeMux()

	// Публичные маршруты
	mainMux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("OK"))
	})

	mainMux.HandleFunc("POST /v1/auth/register", h.Auth.Register)
	mainMux.HandleFunc("POST /v1/auth/login", h.Auth.Login)

	// Публичный просмотр (только вишлисты с privacy = public)
	mainMux.HandleFunc("GET /v1/public/wishlists/{id}", h.Wishlist.GetPublic)
	mainMux.HandleFunc("GET /v1/public/wishlists/{id}/items", h.Wishlist.ListItemsPublic)

	// Защищённые маршруты
	protectedMux := http.NewServeMux()

	// Пользователи
	protectedMux.HandleFunc("GET /v1/users/me", h.User.GetMe)
	protectedMux.HandleFunc("PATCH /v1/users/me", h.User.UpdateMe)
	protectedMux.HandleFunc("DELETE /v1/users/me", h.User.DeleteMe)

	// Продукты (желания пользователя)
	protectedMux.HandleFunc("GET /v1/products/me", h.Product.ListMine)
	protectedMux.HandleFunc("POST /v1/products", h.Product.Create)
	protectedMux.HandleFunc("PUT /v1/products/{id}", h.Product.Update)
	protectedMux.HandleFunc("DELETE /v1/products/{id}", h.Product.Delete)

	// Вишлисты
	protectedMux.HandleFunc("GET /v1/wishlists", h.Wishlist.List)
	protectedMux.HandleFunc("POST /v1/wishlists", h.Wishlist.Create)
	protectedMux.HandleFunc("GET /v1/wishlists/{id}", h.Wishlist.Get)
	protectedMux.HandleFunc("PUT /v1/wishlists/{id}", h.Wishlist.Update)
	protectedMux.HandleFunc("DELETE /v1/wishlists/{id}", h.Wishlist.Delete)

	// Элементы вишлиста
	protectedMux.HandleFunc("POST /v1/wishlists/{id}/items", h.Wishlist.AddItem)
	protectedMux.HandleFunc("GET /v1/wishlists/{id}/items", h.Wishlist.ListItems)
	protectedMux.HandleFunc("POST /v1/items/{itemId}/reserve", h.Wishlist.ReserveItem)
	protectedMux.HandleFunc("DELETE /v1/items/{itemId}/reserve", h.Wishlist.UnreserveItem)
	protectedMux.HandleFunc("DELETE /v1/items/{itemId}", h.Wishlist.RemoveItem)

	// Друзья
	protectedMux.HandleFunc("GET /v1/users/search", h.Friendship.SearchUsers)
	protectedMux.HandleFunc("GET /v1/friends", h.Friendship.GetFriends)
	protectedMux.HandleFunc("GET /v1/friends/requests", h.Friendship.GetIncomingRequests)
	protectedMux.HandleFunc("POST /v1/friends/request", h.Friendship.SendRequest)
	protectedMux.HandleFunc("PATCH /v1/friends/{id}/respond", h.Friendship.RespondToRequest)
	protectedMux.HandleFunc("DELETE /v1/friends/{id}", h.Friendship.DeleteFriend)

	// Уведомления
	protectedMux.HandleFunc("GET /v1/notifications/stream", h.Notification.Stream)
	protectedMux.HandleFunc("PATCH /v1/notifications/{id}/read", h.Notification.MarkRead)
	protectedMux.HandleFunc("PATCH /v1/notifications/read-all", h.Notification.MarkAllRead)

	protected := middleware.AuthMiddleware(opts.JWTSecret, protectedMux)
	for _, prefix := range []string{
		"/v1/users/", "/v1/wishlists", "/v1/wishlists/", "/v1/items/",
		"/v1/products", "/v1/products/", "/v1/friends", "/v1/friends/",
		"/v1/notifications/",
	} {
		mainMux.Handle(prefix, protected)
	}

	return middleware.CORS(opts.CORSOrigin, middleware.MaxBodySize(maxBodyBytes, mainMux))
}
