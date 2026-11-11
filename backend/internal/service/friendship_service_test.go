package service

import (
	"context"
	"errors"
	"testing"

	"wish-piece/internal/models"

	"github.com/google/uuid"
)

type frFixture struct {
	svc     *FriendshipService
	repo    *mockFriendshipRepo
	notifs  *mockNotificationRepo
	a, b, c uuid.UUID
}

func newFRFixture(rows ...*models.Friendship) *frFixture {
	f := &frFixture{a: uuid.New(), b: uuid.New(), c: uuid.New(), notifs: &mockNotificationRepo{}}
	users := newMockUserRepo(
		&models.User{ID: f.a, Login: "alice"},
		&models.User{ID: f.b, Login: "bob"},
		&models.User{ID: f.c, Login: "carol"},
	)
	f.repo = newMockFriendshipRepo(rows...)
	f.svc = NewFriendshipService(f.repo, f.notifs, users)
	return f
}

func TestRespondToRequest(t *testing.T) {
	ctx := context.Background()

	setup := func() (*frFixture, uuid.UUID) {
		f := newFRFixture()
		fr, err := f.svc.SendRequest(ctx, f.a, f.b)
		if err != nil {
			t.Fatal(err)
		}
		f.notifs.created = nil
		return f, fr.ID
	}

	t.Run("third party cannot respond", func(t *testing.T) {
		f, id := setup()
		if err := f.svc.RespondToRequest(ctx, f.c, id, models.FriendshipAccepted); !errors.Is(err, ErrForbidden) {
			t.Fatalf("expected ErrForbidden, got %v", err)
		}
	})

	t.Run("sender cannot accept own request", func(t *testing.T) {
		f, id := setup()
		if err := f.svc.RespondToRequest(ctx, f.a, id, models.FriendshipAccepted); !errors.Is(err, ErrForbidden) {
			t.Fatalf("expected ErrForbidden, got %v", err)
		}
	})

	t.Run("recipient accepts once, notification once", func(t *testing.T) {
		f, id := setup()
		if err := f.svc.RespondToRequest(ctx, f.b, id, models.FriendshipAccepted); err != nil {
			t.Fatal(err)
		}
		if len(f.notifs.created) != 1 || f.notifs.created[0].UserID != f.a {
			t.Fatalf("expected one notification to sender, got %+v", f.notifs.created)
		}
		if err := f.svc.RespondToRequest(ctx, f.b, id, models.FriendshipAccepted); !errors.Is(err, ErrFriendshipNotFound) {
			t.Fatalf("repeat accept: expected ErrFriendshipNotFound, got %v", err)
		}
		if len(f.notifs.created) != 1 {
			t.Fatalf("repeat accept must not notify")
		}
	})

	t.Run("unknown request", func(t *testing.T) {
		f, _ := setup()
		if err := f.svc.RespondToRequest(ctx, f.b, uuid.New(), models.FriendshipDeclined); !errors.Is(err, ErrFriendshipNotFound) {
			t.Fatalf("expected ErrFriendshipNotFound, got %v", err)
		}
	})
}

func TestDeleteFriend(t *testing.T) {
	ctx := context.Background()
	f := newFRFixture()
	fr, _ := f.svc.SendRequest(ctx, f.a, f.b)
	_ = f.svc.RespondToRequest(ctx, f.b, fr.ID, models.FriendshipAccepted)

	if err := f.svc.DeleteFriend(ctx, f.c, fr.ID); !errors.Is(err, ErrForbidden) {
		t.Fatalf("third party delete: expected ErrForbidden, got %v", err)
	}
	if err := f.svc.DeleteFriend(ctx, f.b, fr.ID); err != nil {
		t.Fatalf("participant delete: %v", err)
	}
	if err := f.svc.DeleteFriend(ctx, f.a, fr.ID); !errors.Is(err, ErrFriendshipNotFound) {
		t.Fatalf("delete missing: expected ErrFriendshipNotFound, got %v", err)
	}
}

func TestSendRequest(t *testing.T) {
	ctx := context.Background()

	t.Run("self", func(t *testing.T) {
		f := newFRFixture()
		if _, err := f.svc.SendRequest(ctx, f.a, f.a); !errors.Is(err, ErrCannotAddSelf) {
			t.Fatalf("expected ErrCannotAddSelf, got %v", err)
		}
	})

	t.Run("unknown user", func(t *testing.T) {
		f := newFRFixture()
		if _, err := f.svc.SendRequest(ctx, f.a, uuid.New()); !errors.Is(err, ErrUserNotFound) {
			t.Fatalf("expected ErrUserNotFound, got %v", err)
		}
	})

	t.Run("duplicate and counter request are rejected", func(t *testing.T) {
		f := newFRFixture()
		if _, err := f.svc.SendRequest(ctx, f.a, f.b); err != nil {
			t.Fatal(err)
		}
		if _, err := f.svc.SendRequest(ctx, f.a, f.b); !errors.Is(err, ErrFriendshipAlreadyExists) {
			t.Fatalf("duplicate: expected ErrFriendshipAlreadyExists, got %v", err)
		}
		if _, err := f.svc.SendRequest(ctx, f.b, f.a); !errors.Is(err, ErrFriendshipAlreadyExists) {
			t.Fatalf("counter: expected ErrFriendshipAlreadyExists, got %v", err)
		}
	})

	t.Run("request after decline reopens", func(t *testing.T) {
		f := newFRFixture()
		fr, _ := f.svc.SendRequest(ctx, f.a, f.b)
		if err := f.svc.RespondToRequest(ctx, f.b, fr.ID, models.FriendshipDeclined); err != nil {
			t.Fatal(err)
		}
		again, err := f.svc.SendRequest(ctx, f.b, f.a)
		if err != nil {
			t.Fatalf("reopen: %v", err)
		}
		if again.ID != fr.ID || again.UserID != f.b || again.Status != models.FriendshipPending {
			t.Fatalf("unexpected reopened row: %+v", again)
		}
	})
}
