package main

import (
	"log"

	"github.com/gin-gonic/gin"

	"wishlist-backend/internal/config"
	"wishlist-backend/internal/handlers"
	"wishlist-backend/internal/middleware"
	"wishlist-backend/internal/repository"
	"wishlist-backend/internal/service"
	"wishlist-backend/pkg/database"
)

func main() {
	// 1. Загрузка конфигурации
	cfg, err := config.LoadConfig("configs/config.yaml")
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// 2. Инициализация базы данных
	db, err := database.NewPostgresDB(cfg.Database)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// 3. Инициализация репозиториев
	wishlistRepo := repository.NewWishlistRepository(db)
	cardRepo := repository.NewCardRepository(db)
	userRepo := repository.NewUserRepository(db)

	// 4. Инициализация сервисов
	wishlistService := service.NewWishlistService(wishlistRepo, cardRepo)
	cardService := service.NewCardService(cardRepo)
	userService := service.NewUserService(userRepo)

	// 5. Инициализация хендлеров
	wishlistHandler := handlers.NewWishlistHandler(wishlistService)
	cardHandler := handlers.NewCardHandler(cardService)
	userHandler := handlers.NewUserHandler(userService, cfg.JWT.Secret, cfg.JWT.Expiration)

	// 6. Настройка Gin
	gin.SetMode(cfg.Server.Mode)
	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(middleware.CORSMiddleware(cfg.CORS.AllowedOrigins))

	// 7. Публичные маршруты (без авторизации)
	public := router.Group("/api")
	{
		public.POST("/auth/register", userHandler.Register)
		public.POST("/auth/login", userHandler.Login)
	}

	// 8. Защищённые маршруты (требуют JWT)
	protected := router.Group("/api")
	protected.Use(middleware.AuthMiddleware(cfg.JWT.Secret))
	{
		// === Wishlist routes ===
		protected.GET("/wishlists", wishlistHandler.GetAll)
		protected.POST("/wishlists", wishlistHandler.Create)

		// ⭐ ВАЖНО: специфичные маршруты с вложенностью регистрируем ПЕРЕД общими с :id
		protected.GET("/wishlists/:id/cards", cardHandler.GetByWishlistID)

		// Общие маршруты с :id
		protected.GET("/wishlists/:id", wishlistHandler.GetByID)
		protected.PUT("/wishlists/:id", wishlistHandler.Update)
		protected.DELETE("/wishlists/:id", wishlistHandler.Delete)

		// === Card routes ===
		protected.POST("/cards", cardHandler.Create)
		protected.PUT("/cards/:id", cardHandler.Update)
		protected.DELETE("/cards/:id", cardHandler.Delete)

		// === User routes ===
		protected.GET("/users/me", userHandler.Me)
	}

	// 9. Запуск сервера
	log.Printf("Server starting on port %s in %s mode", cfg.Server.Port, cfg.Server.Mode)
	if err := router.Run(cfg.Server.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}