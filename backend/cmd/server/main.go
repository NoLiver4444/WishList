// Package main является точкой входа в приложение WishPiece Backend.
// Данный пакет отвечает за инициализацию конфигурации, подключение к базе данных,
// применение миграций, настройку зависимостей (DI) и запуск HTTP-сервера с поддержкой graceful shutdown.
package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
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

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

// run инициализирует зависимости и запускает HTTP-сервер.
//
// Процесс запуска:
//  1. Загрузка переменных окружения (.env необязателен).
//  2. Подключение к БД и применение миграций (goose).
//  3. Регистрация репозиториев, сервисов и хендлеров.
//  4. Запуск сервера и фонового воркера дедлайнов.
//
// При SIGINT/SIGTERM сервер завершает активные запросы (до 10 секунд) и дожидается остановки воркера.
func run() error {
	_ = godotenv.Load()

	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("config error: %w", err)
	}

	pool, dbClose, err := database.NewPool(&cfg.DB)
	if err != nil {
		return fmt.Errorf("database error: %w", err)
	}
	defer dbClose()

	if err := database.Migrate(pool); err != nil {
		return fmt.Errorf("migration error: %w", err)
	}

	val := validator.New()

	// Репозитории
	userRepo := repository.NewUserRepo(pool)
	wishlistRepo := repository.NewWishlistRepo(pool)
	itemRepo := repository.NewWishlistItemRepo(pool)
	productRepo := repository.NewProductRepo(pool)
	friendshipRepo := repository.NewFriendshipRepo(pool)
	notificationRepo := repository.NewNotificationRepo(pool)

	// Сервисы
	authService := service.NewAuthService(userRepo, cfg.Auth.JWTSecret)
	userService := service.NewUserService(userRepo)
	productService := service.NewProductService(productRepo)
	wishlistService := service.NewWishlistService(wishlistRepo, itemRepo, productRepo, friendshipRepo, notificationRepo)
	friendshipService := service.NewFriendshipService(friendshipRepo, notificationRepo, userRepo)

	// Закрывается при Shutdown, чтобы долгие SSE-соединения завершились.
	streamsDone := make(chan struct{})

	r := router.New(router.Handlers{
		Auth:         &handler.AuthHandler{Service: authService, Validator: val},
		User:         &handler.UserHandler{Service: userService, Validator: val},
		Wishlist:     &handler.WishlistHandler{Service: wishlistService, Validator: val},
		Product:      &handler.ProductHandler{Service: productService, Validator: val},
		Friendship:   &handler.FriendshipHandler{Service: friendshipService, Validator: val},
		Notification: &handler.NotificationHandler{Repo: notificationRepo, Shutdown: streamsDone},
	}, router.Options{
		JWTSecret:  cfg.Auth.JWTSecret,
		CORSOrigin: cfg.App.CORSOrigin,
	})

	// WriteTimeout намеренно не задан: он оборвал бы SSE-поток уведомлений.
	srv := &http.Server{
		Addr:              fmt.Sprintf(":%d", cfg.App.Port),
		Handler:           r,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		IdleTimeout:       120 * time.Second,
	}
	srv.RegisterOnShutdown(func() { close(streamsDone) })

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		defer wg.Done()
		worker.NewDeadlineWorker(notificationRepo).Run(ctx)
	}()

	serverErr := make(chan error, 1)
	go func() {
		log.Printf("Server starting on http://localhost:%d", cfg.App.Port)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			serverErr <- err
		}
		close(serverErr)
	}()

	var runErr error
	select {
	case <-ctx.Done():
		log.Println("Graceful shutdown...")
	case err := <-serverErr:
		runErr = fmt.Errorf("server error: %w", err)
	}
	stop()

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("server shutdown error: %v", err)
	}

	wg.Wait()
	return runErr
}
