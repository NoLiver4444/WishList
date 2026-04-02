package repository

import (
	"database/sql"
	"wishlist-backend/internal/models"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *models.User) error {
	query := `INSERT INTO users (email, password, name, avatar_url, created_at, updated_at) 
			  VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id`
	
	return r.db.QueryRow(query, user.Email, user.Password, user.Name, user.AvatarURL).Scan(&user.ID)
}

func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
	query := `SELECT id, email, password, name, avatar_url, created_at, updated_at 
			  FROM users WHERE email = $1`
	
	var u models.User
	err := r.db.QueryRow(query, email).Scan(
		&u.ID, &u.Email, &u.Password, &u.Name, &u.AvatarURL, &u.CreatedAt, &u.UpdatedAt)
	
	if err != nil {
		return nil, err
	}
	
	return &u, nil
}

func (r *UserRepository) GetByID(id int64) (*models.User, error) {
	query := `SELECT id, email, password, name, avatar_url, created_at, updated_at 
			  FROM users WHERE id = $1`
	
	var u models.User
	err := r.db.QueryRow(query, id).Scan(
		&u.ID, &u.Email, &u.Password, &u.Name, &u.AvatarURL, &u.CreatedAt, &u.UpdatedAt)
	
	if err != nil {
		return nil, err
	}
	
	return &u, nil
}