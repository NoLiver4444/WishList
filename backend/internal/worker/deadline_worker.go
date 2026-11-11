package worker

import (
	"context"
	"fmt"
	"log"
	"math"
	"time"

	"wish-piece/internal/models"
	"wish-piece/internal/repository"
)

// DeadlineWorker периодически создаёт уведомления о приближающихся дедлайнах вишлистов.
// Дедупликация — по notifications.wishlist_id (не чаще раза в сутки на вишлист).
type DeadlineWorker struct {
	NotificationRepo repository.NotificationRepository
	Interval         time.Duration
	DaysAhead        int
}

func NewDeadlineWorker(notifRepo repository.NotificationRepository) *DeadlineWorker {
	return &DeadlineWorker{
		NotificationRepo: notifRepo,
		Interval:         12 * time.Hour,
		DaysAhead:        3,
	}
}

// Run блокируется до отмены ctx.
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
		if ctx.Err() == nil {
			log.Printf("DeadlineWorker error: %v", err)
		}
		return
	}

	sent := 0
	for _, wl := range wishlists {
		daysLeft := int(math.Ceil(time.Until(wl.Deadline).Hours() / 24))
		message := fmt.Sprintf("До дедлайна вишлиста «%s» осталось %d дн.", wl.Name, daysLeft)

		err := w.NotificationRepo.Create(ctx, repository.NewNotification{
			UserID:     wl.UserID,
			WishlistID: &wl.WishlistID,
			Type:       models.NotifWishlistDeadline,
			Title:      "Приближается дедлайн",
			Message:    message,
		})
		if err != nil {
			log.Printf("DeadlineWorker create notification error: %v", err)
			continue
		}
		sent++
	}

	if sent > 0 {
		log.Printf("DeadlineWorker: sent %d deadline notifications", sent)
	}
}
