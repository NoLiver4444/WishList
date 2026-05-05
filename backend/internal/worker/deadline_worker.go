package worker

import (
	"context"
	"fmt"
	"log"
	"time"

	"wish-piece/internal/models"
	"wish-piece/internal/repository"
)

type DeadlineWorker struct {
	NotificationRepo *repository.NotificationRepo
	Interval         time.Duration
	DaysAhead        int
}

func NewDeadlineWorker(notifRepo *repository.NotificationRepo) *DeadlineWorker {
	return &DeadlineWorker{
		NotificationRepo: notifRepo,
		Interval:         12 * time.Hour,
		DaysAhead:        3,
	}
}

func (w *DeadlineWorker) Run(ctx context.Context) {
	log.Println("DeadlineWorker started")
	w.check(ctx)

	ticker := time.NewTicker(w.Interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Println("DeadlineWorker stopped")
			return
		case <-ticker.C:
			w.check(ctx)
		}
	}
}

func (w *DeadlineWorker) check(ctx context.Context) {
	wishlists, err := w.NotificationRepo.GetWishlistsNearDeadline(ctx, w.DaysAhead)
	if err != nil {
		log.Printf("DeadlineWorker error: %v", err)
		return
	}

	for _, wl := range wishlists {
		daysLeft := int(time.Until(wl.Deadline).Hours() / 24)
		message := fmt.Sprintf("До дедлайна вишлиста «%s» осталось %d дн.", wl.Name, daysLeft)

		err := w.NotificationRepo.Create(ctx,
			wl.UserID,
			wl.UserID,
			models.NotifWishlistDeadline,
			"Приближается дедлайн",
			message,
		)
		if err != nil {
			log.Printf("DeadlineWorker create notification error: %v", err)
		}
	}

	if len(wishlists) > 0 {
		log.Printf("DeadlineWorker: sent %d deadline notifications", len(wishlists))
	}
}
