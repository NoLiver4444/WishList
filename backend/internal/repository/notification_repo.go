package repository

import (
	"context"
	"time"

	"wish-piece/internal/dto"
	"wish-piece/internal/models"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// NewNotification описывает создаваемое уведомление.
// ActorID и WishlistID необязательны.
type NewNotification struct {
	UserID     uuid.UUID
	ActorID    *uuid.UUID
	WishlistID *uuid.UUID
	Type       models.NotificationType
	Title      string
	Message    string
}

// DeadlineWishlist — вишлист, у которого скоро дедлайн.
type DeadlineWishlist struct {
	WishlistID uuid.UUID
	UserID     uuid.UUID
	Name       string
	Deadline   time.Time
}

type NotificationRepo struct {
	Pool *pgxpool.Pool
}

func NewNotificationRepo(pool *pgxpool.Pool) *NotificationRepo {
	return &NotificationRepo{Pool: pool}
}

func (r *NotificationRepo) Create(ctx context.Context, n NewNotification) error {
	_, err := r.Pool.Exec(ctx, `
        INSERT INTO notifications (user_id, actor_id, wishlist_id, type, title, message)
        VALUES ($1, $2, $3, $4, $5, $6)`,
		n.UserID, n.ActorID, n.WishlistID, n.Type, n.Title, n.Message,
	)
	return err
}

func (r *NotificationRepo) GetUnread(ctx context.Context, userID uuid.UUID) ([]dto.NotificationDTO, error) {
	rows, err := r.Pool.Query(ctx, `
        SELECT id, type, COALESCE(title, ''), COALESCE(message, ''), is_read, actor_id, created_at
        FROM notifications
        WHERE user_id = $1 AND is_read = FALSE
        ORDER BY created_at ASC`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make([]dto.NotificationDTO, 0)
	for rows.Next() {
		var n dto.NotificationDTO
		if err := rows.Scan(&n.ID, &n.Type, &n.Title, &n.Message, &n.IsRead, &n.ActorID, &n.CreatedAt); err != nil {
			return nil, err
		}
		result = append(result, n)
	}
	return result, rows.Err()
}

func (r *NotificationRepo) MarkRead(ctx context.Context, notifID, userID uuid.UUID) error {
	_, err := r.Pool.Exec(ctx, `
        UPDATE notifications SET is_read = TRUE, read_at = NOW()
        WHERE id = $1 AND user_id = $2`,
		notifID, userID,
	)
	return err
}

func (r *NotificationRepo) MarkAllRead(ctx context.Context, userID uuid.UUID) error {
	_, err := r.Pool.Exec(ctx, `
        UPDATE notifications SET is_read = TRUE, read_at = NOW()
        WHERE user_id = $1 AND is_read = FALSE`,
		userID,
	)
	return err
}

// GetWishlistsNearDeadline возвращает вишлисты с дедлайном в ближайшие daysAhead дней,
// по которым ещё не было уведомления о дедлайне за последние сутки.
func (r *NotificationRepo) GetWishlistsNearDeadline(ctx context.Context, daysAhead int) ([]DeadlineWishlist, error) {
	rows, err := r.Pool.Query(ctx, `
        SELECT w.id, w.user_id, w.name, w.deadline
        FROM wishlists w
        WHERE w.deadline IS NOT NULL
        AND w.deadline BETWEEN NOW() AND NOW() + make_interval(days => $1)
        AND NOT EXISTS (
            SELECT 1 FROM notifications n
            WHERE n.wishlist_id = w.id
            AND n.type = 'wishlist_deadline'
            AND n.created_at > NOW() - interval '23 hours'
        )`,
		daysAhead,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make([]DeadlineWishlist, 0)
	for rows.Next() {
		var item DeadlineWishlist
		if err := rows.Scan(&item.WishlistID, &item.UserID, &item.Name, &item.Deadline); err != nil {
			return nil, err
		}
		result = append(result, item)
	}
	return result, rows.Err()
}
