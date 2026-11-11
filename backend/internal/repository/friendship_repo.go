package repository

import (
	"context"
	"errors"
	"strings"

	"wish-piece/internal/dto"
	"wish-piece/internal/models"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type FriendshipRepo struct {
	Pool *pgxpool.Pool
}

func NewFriendshipRepo(pool *pgxpool.Pool) *FriendshipRepo {
	return &FriendshipRepo{Pool: pool}
}

func (r *FriendshipRepo) SearchByLogin(ctx context.Context, login string, currentUserID uuid.UUID) ([]dto.UserSearchResult, error) {
	query := `
        SELECT id, login, avatar_url FROM users
        WHERE login ILIKE $1 ESCAPE '\'
        AND id != $2
        ORDER BY login
        LIMIT 10`

	rows, err := r.Pool.Query(ctx, query, "%"+likeEscaper.Replace(login)+"%", currentUserID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	results := make([]dto.UserSearchResult, 0)
	for rows.Next() {
		var u dto.UserSearchResult
		if err := rows.Scan(&u.ID, &u.Login, &u.AvatarURL); err != nil {
			return nil, err
		}
		results = append(results, u)
	}
	return results, rows.Err()
}

func (r *FriendshipRepo) Create(ctx context.Context, userID, friendID uuid.UUID) (*models.Friendship, error) {
	var f models.Friendship
	query := `
        INSERT INTO friendships (user_id, friend_id, status)
        VALUES ($1, $2, 'pending')
        RETURNING id, user_id, friend_id, status, created_at`

	err := r.Pool.QueryRow(ctx, query, userID, friendID).
		Scan(&f.ID, &f.UserID, &f.FriendID, &f.Status, &f.CreatedAt)
	if err != nil {
		switch {
		case isPgError(err, pgUniqueViolation):
			return nil, ErrFriendshipAlreadyExists
		case isPgError(err, pgForeignKeyViolation):
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return &f, nil
}

// Reopen превращает отклонённую заявку в новую заявку userID → friendID.
// Если строка уже не в статусе declined, возвращает ErrFriendshipAlreadyExists.
func (r *FriendshipRepo) Reopen(ctx context.Context, friendshipID, userID, friendID uuid.UUID) (*models.Friendship, error) {
	var f models.Friendship
	err := r.Pool.QueryRow(ctx, `
        UPDATE friendships
        SET user_id = $2, friend_id = $3, status = 'pending', created_at = NOW()
        WHERE id = $1 AND status = 'declined'
        RETURNING id, user_id, friend_id, status, created_at`,
		friendshipID, userID, friendID).
		Scan(&f.ID, &f.UserID, &f.FriendID, &f.Status, &f.CreatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrFriendshipAlreadyExists
		}
		return nil, err
	}
	return &f, nil
}

// Respond переводит входящую заявку recipientID из pending в status.
// Возвращает ErrFriendshipNotFound, если такой ожидающей заявки нет.
func (r *FriendshipRepo) Respond(ctx context.Context, friendshipID, recipientID uuid.UUID, status models.FriendshipStatus) error {
	tag, err := r.Pool.Exec(ctx, `
        UPDATE friendships SET status = $1
        WHERE id = $2 AND friend_id = $3 AND status = 'pending'`,
		status, friendshipID, recipientID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrFriendshipNotFound
	}
	return nil
}

// FindBetween возвращает связь между двумя пользователями в любом направлении или (nil, nil).
func (r *FriendshipRepo) FindBetween(ctx context.Context, a, b uuid.UUID) (*models.Friendship, error) {
	var f models.Friendship
	err := r.Pool.QueryRow(ctx, `
        SELECT id, user_id, friend_id, status, created_at
        FROM friendships
        WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`, a, b).
		Scan(&f.ID, &f.UserID, &f.FriendID, &f.Status, &f.CreatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &f, nil
}

// AreFriends сообщает, есть ли между пользователями принятая дружба.
func (r *FriendshipRepo) AreFriends(ctx context.Context, a, b uuid.UUID) (bool, error) {
	var ok bool
	err := r.Pool.QueryRow(ctx, `
        SELECT EXISTS (
            SELECT 1 FROM friendships
            WHERE status = 'accepted'
              AND ((user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1))
        )`, a, b).Scan(&ok)
	return ok, err
}

func (r *FriendshipRepo) GetFriends(ctx context.Context, userID uuid.UUID) ([]dto.FriendDTO, error) {
	query := `
        SELECT f.id, u.id, u.login, u.avatar_url, f.status, f.created_at
            FROM friendships f
            JOIN users u ON u.id = f.friend_id
            WHERE f.user_id = $1 AND f.status = 'accepted'

            UNION ALL

            SELECT f.id, u.id, u.login, u.avatar_url, f.status, f.created_at
            FROM friendships f
            JOIN users u ON u.id = f.user_id
            WHERE f.friend_id = $1 AND f.status = 'accepted'
        `

	rows, err := r.Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	friends := make([]dto.FriendDTO, 0)
	for rows.Next() {
		var f dto.FriendDTO
		if err := rows.Scan(&f.FriendshipID, &f.ID, &f.Login, &f.AvatarURL, &f.Status, &f.CreatedAt); err != nil {
			return nil, err
		}
		friends = append(friends, f)
	}
	return friends, rows.Err()
}

func (r *FriendshipRepo) GetIncomingRequests(ctx context.Context, userID uuid.UUID) ([]dto.FriendDTO, error) {
	query := `
        SELECT f.id, u.id, u.login, u.avatar_url, f.status, f.created_at
        FROM friendships f
        JOIN users u ON f.user_id = u.id
        WHERE f.friend_id = $1 AND f.status = 'pending'`

	rows, err := r.Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	requests := make([]dto.FriendDTO, 0)
	for rows.Next() {
		var f dto.FriendDTO
		if err := rows.Scan(&f.FriendshipID, &f.ID, &f.Login, &f.AvatarURL, &f.Status, &f.CreatedAt); err != nil {
			return nil, err
		}
		requests = append(requests, f)
	}
	return requests, rows.Err()
}

func (r *FriendshipRepo) Delete(ctx context.Context, friendshipID uuid.UUID) error {
	tag, err := r.Pool.Exec(ctx, `DELETE FROM friendships WHERE id=$1`, friendshipID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrFriendshipNotFound
	}
	return nil
}

func (r *FriendshipRepo) FindByID(ctx context.Context, id uuid.UUID) (*models.Friendship, error) {
	var f models.Friendship
	err := r.Pool.QueryRow(ctx, `
        SELECT id, user_id, friend_id, status, created_at
        FROM friendships WHERE id=$1`, id).
		Scan(&f.ID, &f.UserID, &f.FriendID, &f.Status, &f.CreatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &f, nil
}

var likeEscaper = strings.NewReplacer(`\`, `\\`, `%`, `\%`, `_`, `\_`)
