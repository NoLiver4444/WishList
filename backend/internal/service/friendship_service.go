package service

import (
	"context"

	"wish-piece/internal/dto"
	"wish-piece/internal/models"
	"wish-piece/internal/repository"

	"github.com/google/uuid"
)

type FriendshipService struct {
	Repo         repository.FriendshipRepository
	Notification repository.NotificationRepository
	UserRepo     repository.UserRepository
}

func NewFriendshipService(
	repo repository.FriendshipRepository,
	notif repository.NotificationRepository,
	userRepo repository.UserRepository,
) *FriendshipService {
	return &FriendshipService{Repo: repo, Notification: notif, UserRepo: userRepo}
}

func (s *FriendshipService) SearchUsers(ctx context.Context, login string, currentUserID uuid.UUID) ([]dto.UserSearchResult, error) {
	return s.Repo.SearchByLogin(ctx, login, currentUserID)
}

// SendRequest отправляет заявку userID → friendID.
//   - между пользователями уже есть заявка (в любом направлении) или дружба → ErrFriendshipAlreadyExists;
//   - прошлая заявка была отклонена → она переоткрывается как новая заявка;
//   - адресат не существует → ErrUserNotFound.
func (s *FriendshipService) SendRequest(ctx context.Context, userID, friendID uuid.UUID) (*models.Friendship, error) {
	if userID == friendID {
		return nil, ErrCannotAddSelf
	}

	target, err := s.UserRepo.FindByID(ctx, friendID)
	if err != nil {
		return nil, err
	}
	if target == nil {
		return nil, ErrUserNotFound
	}

	existing, err := s.Repo.FindBetween(ctx, userID, friendID)
	if err != nil {
		return nil, err
	}

	var friendship *models.Friendship
	switch {
	case existing == nil:
		friendship, err = s.Repo.Create(ctx, userID, friendID)
	case existing.Status == models.FriendshipDeclined:
		friendship, err = s.Repo.Reopen(ctx, existing.ID, userID, friendID)
	default:
		return nil, ErrFriendshipAlreadyExists
	}
	if err != nil {
		return nil, err
	}

	sender, err := s.UserRepo.FindByID(ctx, userID)
	if err == nil && sender != nil {
		notify(ctx, s.Notification, repository.NewNotification{
			UserID:  friendID,
			ActorID: &userID,
			Type:    models.NotifFriendRequest,
			Title:   "Новая заявка в друзья",
			Message: sender.Login + " хочет добавить вас в друзья",
		})
	}

	return friendship, nil
}

// RespondToRequest принимает или отклоняет входящую заявку.
// Отвечать может только адресат заявки и только пока она в статусе pending.
func (s *FriendshipService) RespondToRequest(ctx context.Context, userID, friendshipID uuid.UUID, status models.FriendshipStatus) error {
	if status != models.FriendshipAccepted && status != models.FriendshipDeclined {
		return ErrInvalidInput
	}

	f, err := s.Repo.FindByID(ctx, friendshipID)
	if err != nil {
		return err
	}
	if f == nil {
		return ErrFriendshipNotFound
	}
	if f.FriendID != userID {
		return ErrForbidden
	}
	if f.Status != models.FriendshipPending {
		return ErrFriendshipNotFound
	}

	// Условие status = 'pending' повторяется в UPDATE, поэтому уведомление уходит
	// только при реальном переходе pending → accepted.
	if err := s.Repo.Respond(ctx, friendshipID, userID, status); err != nil {
		return err
	}

	if status == models.FriendshipAccepted {
		acceptor, err := s.UserRepo.FindByID(ctx, userID)
		if err == nil && acceptor != nil {
			notify(ctx, s.Notification, repository.NewNotification{
				UserID:  f.UserID,
				ActorID: &userID,
				Type:    models.NotifFriendAccepted,
				Title:   "Заявка принята",
				Message: acceptor.Login + " принял(а) вашу заявку в друзья",
			})
		}
	}

	return nil
}

func (s *FriendshipService) GetFriends(ctx context.Context, userID uuid.UUID) ([]dto.FriendDTO, error) {
	return s.Repo.GetFriends(ctx, userID)
}

func (s *FriendshipService) GetIncomingRequests(ctx context.Context, userID uuid.UUID) ([]dto.FriendDTO, error) {
	return s.Repo.GetIncomingRequests(ctx, userID)
}

// DeleteFriend удаляет дружбу или заявку. Доступно только её участникам.
func (s *FriendshipService) DeleteFriend(ctx context.Context, userID, friendshipID uuid.UUID) error {
	f, err := s.Repo.FindByID(ctx, friendshipID)
	if err != nil {
		return err
	}
	if f == nil {
		return ErrFriendshipNotFound
	}
	if f.UserID != userID && f.FriendID != userID {
		return ErrForbidden
	}
	return s.Repo.Delete(ctx, friendshipID)
}
