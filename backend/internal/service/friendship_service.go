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
	Repo         *repository.FriendshipRepo
	Notification *repository.NotificationRepo
	UserRepo     *repository.UserRepo
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

	sender, err := s.UserRepo.FindByID(ctx, userID)
	if err == nil && sender != nil {
		_ = s.Notification.Create(ctx,
			req.FriendID,
			userID,
			models.NotifFriendRequest,
			"Новая заявка в друзья",
			sender.Login+" хочет добавить вас в друзья",
		)
	}

	return friendship, nil
}

func (s *FriendshipService) RespondToRequest(ctx context.Context, friendshipID string, status models.FriendshipStatus) error {
	id, err := uuid.Parse(friendshipID)
	if err != nil {
		return ErrFriendshipNotFound
	}

	if err := s.Repo.UpdateStatus(ctx, id, status); err != nil {
		return err
	}

	if status == models.FriendshipAccepted {
		friendship, err := s.Repo.FindByID(ctx, id)
		if err == nil && friendship != nil {
			acceptor, err := s.UserRepo.FindByID(ctx, friendship.FriendID)
			if err == nil && acceptor != nil {
				_ = s.Notification.Create(ctx,
					friendship.UserID,
					friendship.FriendID,
					models.NotifFriendAccepted,
					"Заявка принята",
					acceptor.Login+" принял вашу заявку в друзья",
				)
			}
		}
	}

	return nil
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
