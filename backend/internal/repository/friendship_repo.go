package repository

import (
	"context"
	"errors"

	"wish-piece/internal/dto"
	"wish-piece/internal/models"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrFriendshipAlreadyExists = errors.New("friendship already exists")
var ErrFriendshipNotFound = errors.New("friendship not found")

type FriendshipRepo struct {
	Pool *pgxpool.Pool
}

func NewFriendshipRepo(pool *pgxpool.Pool) *FriendshipRepo {
	return &FriendshipRepo{Pool: pool}
}

func (r *FriendshipRepo) SearchByLogin(ctx context.Context, login string, currentUserID uuid.UUID) ([]dto.UserSearchResult, error) {
	query := `
        SELECT id, login, avatar_url FROM users
        WHERE login ILIKE $1
        AND id != $2
        LIMIT 10`

	rows, err := r.Pool.Query(ctx, query, "%"+login+"%", currentUserID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []dto.UserSearchResult
	for rows.Next() {
		var u dto.UserSearchResult
		if err := rows.Scan(&u.ID, &u.Login, &u.AvatarURL); err != nil {
			return nil, err
		}
		results = append(results, u)
	}
	return results, nil
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
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, ErrFriendshipAlreadyExists
		}
		return nil, err
	}
	return &f, nil
}

func (r *FriendshipRepo) UpdateStatus(ctx context.Context, friendshipID uuid.UUID, status models.FriendshipStatus) error {
	query := `UPDATE friendships SET status=$1 WHERE id=$2`
	tag, err := r.Pool.Exec(ctx, query, status, friendshipID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrFriendshipNotFound
	}
	return nil
}

func (r *FriendshipRepo) GetFriends(ctx context.Context, userID uuid.UUID) ([]dto.FriendDTO, error) {
	query := `
        SELECT f.id, u.id, u.login, u.avatar_url, f.status, f.created_at
            FROM friendships f
            JOIN users u ON u.id = f.friend_id
            WHERE f.user_id = $1 AND f.status = 'accepted'

            UNION

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
	return friends, nil
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
    return requests, nil
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