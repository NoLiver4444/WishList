// Package main является точкой входа в приложение WishPiece Backend.
// Данный пакет отвечает за инициализацию конфигурации, подключение к базе данных,
// настройку зависимостей (DI) и запуск HTTP-сервера с поддержкой graceful shutdown.
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"wish-piece/internal/config"
	"wish-piece/internal/database"
	"wish-piece/internal/handler"
	"wish-piece/internal/repository"
	"wish-piece/internal/router"
	"wish-piece/internal/service"
	"wish-piece/internal/worker"

	"github.com/go-playground/validator/v10"
	"github.com/joho/godotenv"
)

// main инициализирует и запускает HTTP-сервер.
//
// Процесс запуска включает в себя:
//  1. Загрузку переменных окружения из .env [cite: 1]
//  2. Инициализацию пула соединений с БД [cite: 1, 4]
//  3. Регистрацию репозиториев, сервисов и хендлеров
//  4. Запуск сервера на порту, указанном в конфигурации [cite: 2]
//
// При получении сигналов SIGINT или SIGTERM сервер завершает работу корректно,
// ожидая завершения активных запросов в течение 5 секунд.
func main() {
	godotenv.Load()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Config error: %v", err)
	}

	pool, dbClose, err := database.NewPool(&cfg.DB)
	if err != nil {
		log.Fatalf("Database error: %v", err)
	}
	defer dbClose()

	val := validator.New()

	// Auth
	userRepo := repository.NewUserRepo(pool)
	authService := service.NewAuthService(userRepo, cfg.Auth.JWTSecret)
	authHandler := &handler.AuthHandler{Service: authService, Validator: val}

	// Users
	userService := service.NewUserService(userRepo)
	userHandler := &handler.UserHandler{Service: userService, Validator: val}

	// Wishlists
	wishlistRepo := repository.NewWishlistRepo(pool)
	itemRepo := repository.NewWishlistItemRepo(pool)
	productRepo := repository.NewProductRepo(pool)

	// Products
	userProductRepo := repository.NewUserProductRepo(pool)

	productService := &service.ProductService{
		ProductRepo:     productRepo,
		UserProductRepo: userProductRepo,
	}

	productHandler := &handler.ProductHandler{
		Service:   productService,
		Validator: val,
	}

	// Friendship
	friendshipRepo := repository.NewFriendshipRepo(pool)

	// Notifications
	notificationRepo := repository.NewNotificationRepo(pool)
	notificationHandler := &handler.NotificationHandler{
		Repo: notificationRepo,
	}

	wishlistService := service.NewWishlistService(wishlistRepo, itemRepo, productRepo, notificationRepo, userRepo)
	wishlistHandler := &handler.WishlistHandler{
		Service:   wishlistService,
		Validator: val,
	}

	friendshipService := &service.FriendshipService{
		Repo:         friendshipRepo,
		Notification: notificationRepo,
		UserRepo:     userRepo,
	}
	friendshipHandler := &handler.FriendshipHandler{
		Service:   friendshipService,
		Validator: val,
	}

	r := router.New(authHandler, userHandler, wishlistHandler, productHandler, friendshipHandler, notificationHandler, cfg.Auth.JWTSecret)

	srv := &http.Server{Addr: fmt.Sprintf(":%d", cfg.App.Port), Handler: r}
	go func() {
		log.Printf("Server starting on http://localhost:%d", cfg.App.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal(err)
		}
	}()

	ctx, cancel := context.WithCancel(context.Background())

	deadlineWorker := worker.NewDeadlineWorker(notificationRepo)
	go deadlineWorker.Run(ctx)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Graceful shutdown...")
	cancel()

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()
	srv.Shutdown(shutdownCtx)
}
