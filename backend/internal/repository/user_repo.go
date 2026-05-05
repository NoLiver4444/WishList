package repository

import (
	"context"
	"errors"

	"wish-piece/internal/models"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrUserAlreadyExists = errors.New("user already exists")
var ErrUserNotFound = errors.New("user not found")

type UserRepo struct {
	Pool *pgxpool.Pool
}

func NewUserRepo(pool *pgxpool.Pool) *UserRepo {
	return &UserRepo{Pool: pool}
}

func (r *UserRepo) Create(ctx context.Context, user *models.User) error {
	query := `INSERT INTO users (login, email, phone, password_hash, avatar_url, birthday) 
			  VALUES ($1, $2, $3, $4, $5, $6) 
			  RETURNING id, created_at, updated_at`
	err := r.Pool.QueryRow(ctx, query, user.Login, user.Email, user.Phone, user.PasswordHash, user.AvatarURL, user.Birthday).
		Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return ErrUserAlreadyExists
		}
		return err
	}
	return nil
}

func (r *UserRepo) FindByLoginOrEmail(ctx context.Context, val string) (*models.User, error) {
	var u models.User
	query := `SELECT id, login, email, phone, password_hash, avatar_url, created_at 
			  FROM users WHERE login=$1 OR email=$1`
	err := r.Pool.QueryRow(ctx, query, val).Scan(&u.ID, &u.Login, &u.Email, &u.Phone, &u.PasswordHash, &u.AvatarURL, &u.CreatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &u, err
}

func (r *UserRepo) FindByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	var u models.User
	query := `SELECT id, login, email, phone, password_hash, avatar_url, birthday, created_at, updated_at 
			  FROM users WHERE id=$1`
	err := r.Pool.QueryRow(ctx, query, id).Scan(&u.ID, &u.Login, &u.Email, &u.Phone, &u.PasswordHash, &u.AvatarURL, &u.Birthday, &u.CreatedAt, &u.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	return &u, nil
}

func (r *UserRepo) Update(ctx context.Context, user *models.User) error {
	query := `UPDATE users SET 
		login=$1, email=$2, phone=$3, avatar_url=$4, birthday=$5, updated_at=NOW() 
		WHERE id=$6
		RETURNING updated_at`

	err := r.Pool.QueryRow(ctx, query,
		user.Login, user.Email, user.Phone, user.AvatarURL, user.Birthday, user.ID,
	).Scan(&user.UpdatedAt)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrUserNotFound
		}
		return err
	}
	return nil
}

func (r *UserRepo) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.Pool.Exec(ctx, `DELETE FROM users WHERE id=$1`, id)
	return err
}
