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

	wishlistService := service.NewWishlistService(wishlistRepo, itemRepo, productRepo)
	wishlistHandler := &handler.WishlistHandler{
		Service:   wishlistService,
		Validator: val,
	}

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

	r := router.New(authHandler, userHandler, wishlistHandler, productHandler, cfg.Auth.JWTSecret)

	srv := &http.Server{Addr: fmt.Sprintf(":%d", cfg.App.Port), Handler: r}
	go func() {
		log.Printf("Server starting on http://localhost:%d", cfg.App.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal(err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Graceful shutdown...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	srv.Shutdown(ctx)
	log.Println("Server exited properly")
}
