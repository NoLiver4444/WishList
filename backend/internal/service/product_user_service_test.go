package service

import (
	"context"
	"errors"
	"testing"

	"wish-piece/internal/dto"
	"wish-piece/internal/models"

	"github.com/google/uuid"
)

func TestProductOwnership(t *testing.T) {
	ctx := context.Background()
	owner, other := uuid.New(), uuid.New()
	p := &models.Product{ID: uuid.New(), OwnerID: owner, Title: "A"}
	svc := NewProductService(newMockProductRepo(p))

	if _, err := svc.UpdateProduct(ctx, other, p.ID, dto.ProductRequest{Title: "B"}); !errors.Is(err, ErrForbidden) {
		t.Fatalf("update foreign: expected ErrForbidden, got %v", err)
	}
	if err := svc.DeleteProduct(ctx, other, p.ID); !errors.Is(err, ErrForbidden) {
		t.Fatalf("delete foreign: expected ErrForbidden, got %v", err)
	}
	if err := svc.DeleteProduct(ctx, owner, uuid.New()); !errors.Is(err, ErrProductNotFound) {
		t.Fatalf("delete missing: expected ErrProductNotFound, got %v", err)
	}
	if _, err := svc.UpdateProduct(ctx, owner, p.ID, dto.ProductRequest{Title: "B"}); err != nil {
		t.Fatalf("update own: %v", err)
	}
}

func TestUserServiceNotFound(t *testing.T) {
	svc := NewUserService(newMockUserRepo())
	if _, err := svc.GetUserByID(context.Background(), uuid.New()); !errors.Is(err, ErrUserNotFound) {
		t.Fatalf("expected ErrUserNotFound, got %v", err)
	}
}

func TestRegisterNormalizesEmailAndKeepsBirthday(t *testing.T) {
	repo := newMockUserRepo()
	svc := NewAuthService(repo, "secret")
	bday := mustDate(t, "2000-01-02")

	resp, err := svc.Register(context.Background(), dto.CreateUserRequest{
		Login: "neo", Email: "  Neo@Example.COM ", Password: "secret1", Birthday: &bday,
	})
	if err != nil {
		t.Fatal(err)
	}
	if resp.User.Email != "neo@example.com" {
		t.Fatalf("email not normalized: %q", resp.User.Email)
	}
	if resp.User.Birthday == nil || !resp.User.Birthday.Equal(bday) {
		t.Fatalf("birthday not saved: %v", resp.User.Birthday)
	}
}
