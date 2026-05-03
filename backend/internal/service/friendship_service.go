package service

import (
	"context"
	"errors"

	"wish-piece/internal/dto"
	"wish-piece/internal/models"
	"wish-piece/internal/repository"

	"github.com/google/uuid"
)

var ErrFriendshipAlreadyExists = errors.New("friendship already exists")
var ErrFriendshipNotFound = errors.New("friendship not found")
var ErrCannotAddSelf = errors.New("cannot add yourself")

type FriendshipService struct {
	Repo *repository.FriendshipRepo
}

func NewFriendshipService(repo *repository.FriendshipRepo) *FriendshipService {
	return &FriendshipService{Repo: repo}
}

func (s *FriendshipService) SearchUsers(ctx context.Context, login, currentUserID string) ([]dto.UserSearchResult, error) {
	id, err := uuid.Parse(currentUserID)
	if err != nil {
		return nil, ErrUserNotFound
	}
	return s.Repo.SearchByLogin(ctx, login, id)
}

func (s *FriendshipService) SendRequest(ctx context.Context, currentUserID string, req dto.FriendRequestDTO) (*models.Friendship, error) {
	userID, err := uuid.Parse(currentUserID)
	if err != nil {
		return nil, ErrUserNotFound
	}
	if userID == req.FriendID {
		return nil, ErrCannotAddSelf
	}
	friendship, err := s.Repo.Create(ctx, userID, req.FriendID)
	if errors.Is(err, repository.ErrFriendshipAlreadyExists) {
		return nil, ErrFriendshipAlreadyExists
	}
	return friendship, err
}

func (s *FriendshipService) RespondToRequest(ctx context.Context, friendshipID string, status models.FriendshipStatus) error {
	id, err := uuid.Parse(friendshipID)
	if err != nil {
		return ErrFriendshipNotFound
	}
	return s.Repo.UpdateStatus(ctx, id, status)
}

func (s *FriendshipService) GetFriends(ctx context.Context, userID string) ([]dto.FriendDTO, error) {
	id, err := uuid.Parse(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}
	return s.Repo.GetFriends(ctx, id)
}

func (s *FriendshipService) GetIncomingRequests(ctx context.Context, userID string) ([]dto.FriendDTO, error) {
	id, err := uuid.Parse(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}
	return s.Repo.GetIncomingRequests(ctx, id)
}

func (s *FriendshipService) DeleteFriend(ctx context.Context, friendshipID string) error {
    id, err := uuid.Parse(friendshipID)
    if err != nil {
        return ErrFriendshipNotFound
    }
    return s.Repo.Delete(ctx, id)
}