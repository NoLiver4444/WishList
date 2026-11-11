package repository

import (
	"context"
	"errors"

	"wish-piece/internal/models"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepo struct {
	Pool *pgxpool.Pool
}

func NewUserRepo(pool *pgxpool.Pool) *UserRepo {
	return &UserRepo{Pool: pool}
}

const userColumns = `id, login, email, phone, password_hash, avatar_url, birthday, created_at, updated_at`

func scanUser(row pgx.Row) (*models.User, error) {
	var u models.User
	err := row.Scan(&u.ID, &u.Login, &u.Email, &u.Phone, &u.PasswordHash, &u.AvatarURL, &u.Birthday, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &u, nil
}

func (r *UserRepo) Create(ctx context.Context, user *models.User) error {
	query := `INSERT INTO users (login, email, phone, password_hash, avatar_url, birthday)
			  VALUES ($1, $2, $3, $4, $5, $6)
			  RETURNING id, created_at, updated_at`
	err := r.Pool.QueryRow(ctx, query, user.Login, user.Email, user.Phone, user.PasswordHash, user.AvatarURL, user.Birthday).
		Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		if isPgError(err, pgUniqueViolation) {
			return ErrUserAlreadyExists
		}
		return err
	}
	return nil
}

// FindByLoginOrEmail ищет пользователя по логину или email без учёта регистра.
// Логин не может содержать «@», поэтому совпадение однозначно. Возвращает (nil, nil), если не найден.
func (r *UserRepo) FindByLoginOrEmail(ctx context.Context, val string) (*models.User, error) {
	query := `SELECT ` + userColumns + ` FROM users WHERE lower(login) = lower($1) OR lower(email) = lower($1)`
	return scanUser(r.Pool.QueryRow(ctx, query, val))
}

// FindByID возвращает (nil, nil), если пользователь не найден.
func (r *UserRepo) FindByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	query := `SELECT ` + userColumns + ` FROM users WHERE id = $1`
	return scanUser(r.Pool.QueryRow(ctx, query, id))
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
		if isPgError(err, pgUniqueViolation) {
			return ErrUserAlreadyExists
		}
		return err
	}
	return nil
}

func (r *UserRepo) Delete(ctx context.Context, id uuid.UUID) error {
	tag, err := r.Pool.Exec(ctx, `DELETE FROM users WHERE id=$1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrUserNotFound
	}
	return nil
}
