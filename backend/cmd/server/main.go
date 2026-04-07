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

	"github.com/go-playground/validator/v10"
	"github.com/joho/godotenv"
	"wish-piece/internal/config"
	"wish-piece/internal/database"
	"wish-piece/internal/handler"
	"wish-piece/internal/repository"
	"wish-piece/internal/router"
	"wish-piece/internal/service"
)

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

	userRepo := repository.NewUserRepo(pool)
	authService := service.NewAuthService(userRepo, cfg.Auth.JWTSecret)
	authHandler := &handler.AuthHandler{Service: authService, Validator: val}

	userService := service.NewUserService(userRepo)
	userHandler := &handler.UserHandler{Service: userService, Validator: val}

	r := router.New(authHandler, userHandler, cfg.Auth.JWTSecret)


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