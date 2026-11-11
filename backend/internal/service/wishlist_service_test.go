package service

import (
	"context"
	"errors"
	"testing"

	"wish-piece/internal/dto"
	"wish-piece/internal/models"

	"github.com/google/uuid"
)

type wlFixture struct {
	svc      *WishlistService
	owner    uuid.UUID
	friend   uuid.UUID
	stranger uuid.UUID
	lists    map[models.PrivacyStatus]*models.Wishlist
	items    *mockItemRepo
	products *mockProductRepo
	notifs   *mockNotificationRepo
}

func newWLFixture() *wlFixture {
	f := &wlFixture{
		owner:    uuid.New(),
		friend:   uuid.New(),
		stranger: uuid.New(),
		lists:    map[models.PrivacyStatus]*models.Wishlist{},
		notifs:   &mockNotificationRepo{},
	}

	var all []*models.Wishlist
	for _, p := range []models.PrivacyStatus{models.PrivacyPrivate, models.PrivacyFriends, models.PrivacyPublic} {
		wl := &models.Wishlist{ID: uuid.New(), UserID: f.owner, Name: string(p), Privacy: p}
		f.lists[p] = wl
		all = append(all, wl)
	}

	product := &models.Product{ID: uuid.New(), OwnerID: f.owner, Title: "Книга"}
	f.products = newMockProductRepo(product)

	var items []*models.WishlistItem
	for _, wl := range all {
		items = append(items, &models.WishlistItem{ID: uuid.New(), WishlistID: wl.ID, ProductID: product.ID, Product: product})
	}
	f.items = newMockItemRepo(items...)

	friends := newMockFriendshipRepo(&models.Friendship{
		ID: uuid.New(), UserID: f.owner, FriendID: f.friend, Status: models.FriendshipAccepted,
	})

	f.svc = NewWishlistService(newMockWishlistRepo(all...), f.items, f.products, friends, f.notifs)
	return f
}

func (f *wlFixture) itemOf(p models.PrivacyStatus) uuid.UUID {
	for id, it := range f.items.items {
		if it.WishlistID == f.lists[p].ID {
			return id
		}
	}
	panic("no item")
}

func TestWishlistAccess(t *testing.T) {
	f := newWLFixture()
	ctx := context.Background()

	cases := []struct {
		privacy models.PrivacyStatus
		viewer  uuid.UUID
		name    string
		allowed bool
	}{
		{models.PrivacyPrivate, f.owner, "private/owner", true},
		{models.PrivacyPrivate, f.friend, "private/friend", false},
		{models.PrivacyPrivate, f.stranger, "private/stranger", false},
		{models.PrivacyFriends, f.owner, "friends/owner", true},
		{models.PrivacyFriends, f.friend, "friends/friend", true},
		{models.PrivacyFriends, f.stranger, "friends/stranger", false},
		{models.PrivacyPublic, f.owner, "public/owner", true},
		{models.PrivacyPublic, f.friend, "public/friend", true},
		{models.PrivacyPublic, f.stranger, "public/stranger", true},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			wlID := f.lists[tc.privacy].ID

			_, err := f.svc.GetWishlist(ctx, tc.viewer, wlID, true)
			checkAccess(t, "GetWishlist", err, tc.allowed)

			_, err = f.svc.ListItems(ctx, tc.viewer, wlID)
			checkAccess(t, "ListItems", err, tc.allowed)
		})
	}
}

func checkAccess(t *testing.T, op string, err error, allowed bool) {
	t.Helper()
	if allowed && err != nil {
		t.Fatalf("%s: expected access, got %v", op, err)
	}
	if !allowed && !errors.Is(err, ErrForbidden) {
		t.Fatalf("%s: expected ErrForbidden, got %v", op, err)
	}
}

func TestPublicEndpointsOnlyPublic(t *testing.T) {
	f := newWLFixture()
	ctx := context.Background()

	for _, p := range []models.PrivacyStatus{models.PrivacyPrivate, models.PrivacyFriends} {
		if _, err := f.svc.GetWishlistPublic(ctx, f.lists[p].ID); !errors.Is(err, ErrWishlistNotFound) {
			t.Fatalf("GetWishlistPublic(%s): expected not found, got %v", p, err)
		}
		if _, err := f.svc.ListItemsPublic(ctx, f.lists[p].ID); !errors.Is(err, ErrWishlistNotFound) {
			t.Fatalf("ListItemsPublic(%s): expected not found, got %v", p, err)
		}
	}

	pub := f.lists[models.PrivacyPublic]
	if _, err := f.svc.GetWishlistPublic(ctx, pub.ID); err != nil {
		t.Fatalf("GetWishlistPublic(public): %v", err)
	}
	// Публичная выдача не раскрывает, кто забронировал.
	if err := f.svc.ReserveItem(ctx, f.stranger, f.itemOf(models.PrivacyPublic)); err != nil {
		t.Fatal(err)
	}
	items, err := f.svc.ListItemsPublic(ctx, pub.ID)
	if err != nil {
		t.Fatal(err)
	}
	if len(items) != 1 || !items[0].IsReserved || items[0].ReservedByMe {
		t.Fatalf("unexpected public items: %+v", items)
	}
}

func TestReserveItem(t *testing.T) {
	ctx := context.Background()

	t.Run("owner cannot reserve own item", func(t *testing.T) {
		f := newWLFixture()
		err := f.svc.ReserveItem(ctx, f.owner, f.itemOf(models.PrivacyPublic))
		if !errors.Is(err, ErrForbidden) {
			t.Fatalf("expected ErrForbidden, got %v", err)
		}
	})

	t.Run("stranger cannot reserve in friends-only list", func(t *testing.T) {
		f := newWLFixture()
		err := f.svc.ReserveItem(ctx, f.stranger, f.itemOf(models.PrivacyFriends))
		if !errors.Is(err, ErrForbidden) {
			t.Fatalf("expected ErrForbidden, got %v", err)
		}
	})

	t.Run("nobody but owner can reserve in private list", func(t *testing.T) {
		f := newWLFixture()
		err := f.svc.ReserveItem(ctx, f.friend, f.itemOf(models.PrivacyPrivate))
		if !errors.Is(err, ErrForbidden) {
			t.Fatalf("expected ErrForbidden, got %v", err)
		}
	})

	t.Run("friend reserves, repeat is idempotent, others get conflict", func(t *testing.T) {
		f := newWLFixture()
		itemID := f.itemOf(models.PrivacyFriends)

		if err := f.svc.ReserveItem(ctx, f.friend, itemID); err != nil {
			t.Fatalf("reserve: %v", err)
		}
		if len(f.notifs.created) != 1 || f.notifs.created[0].UserID != f.owner || f.notifs.created[0].ActorID != nil {
			t.Fatalf("expected one anonymous notification to owner, got %+v", f.notifs.created)
		}
		if err := f.svc.ReserveItem(ctx, f.friend, itemID); err != nil {
			t.Fatalf("repeat reserve should be idempotent, got %v", err)
		}
		if len(f.notifs.created) != 1 {
			t.Fatalf("repeat reserve must not notify again")
		}

		pubItem := f.itemOf(models.PrivacyPublic)
		if err := f.svc.ReserveItem(ctx, f.friend, pubItem); err != nil {
			t.Fatal(err)
		}
		if err := f.svc.ReserveItem(ctx, f.stranger, pubItem); !errors.Is(err, ErrAlreadyReserved) {
			t.Fatalf("expected ErrAlreadyReserved, got %v", err)
		}
	})

	t.Run("reserved_by_me and owner visibility", func(t *testing.T) {
		f := newWLFixture()
		wlID := f.lists[models.PrivacyPublic].ID
		if err := f.svc.ReserveItem(ctx, f.friend, f.itemOf(models.PrivacyPublic)); err != nil {
			t.Fatal(err)
		}

		mine, _ := f.svc.ListItems(ctx, f.friend, wlID)
		if !mine[0].IsReserved || !mine[0].ReservedByMe {
			t.Fatalf("reserver should see reserved_by_me: %+v", mine[0])
		}
		other, _ := f.svc.ListItems(ctx, f.stranger, wlID)
		if !other[0].IsReserved || other[0].ReservedByMe {
			t.Fatalf("other user sees wrong flags: %+v", other[0])
		}
		owner, _ := f.svc.ListItems(ctx, f.owner, wlID)
		if !owner[0].IsReserved || owner[0].ReservedByMe {
			t.Fatalf("owner sees wrong flags: %+v", owner[0])
		}
	})
}

func TestUnreserveItem(t *testing.T) {
	ctx := context.Background()
	f := newWLFixture()
	itemID := f.itemOf(models.PrivacyPublic)

	if err := f.svc.ReserveItem(ctx, f.friend, itemID); err != nil {
		t.Fatal(err)
	}
	if err := f.svc.UnreserveItem(ctx, f.stranger, itemID); !errors.Is(err, ErrForbidden) {
		t.Fatalf("stranger unreserve: expected ErrForbidden, got %v", err)
	}
	if err := f.svc.UnreserveItem(ctx, f.friend, itemID); err != nil {
		t.Fatalf("reserver unreserve: %v", err)
	}
	if err := f.svc.UnreserveItem(ctx, f.friend, itemID); err != nil {
		t.Fatalf("repeat unreserve should be idempotent, got %v", err)
	}
}

func TestAddItemRequiresOwnProduct(t *testing.T) {
	ctx := context.Background()
	f := newWLFixture()

	foreign := &models.Product{ID: uuid.New(), OwnerID: f.stranger, Title: "Чужое"}
	f.products.products[foreign.ID] = foreign

	wlID := f.lists[models.PrivacyPublic].ID
	_, err := f.svc.AddItem(ctx, f.owner, wlID, dto.AddItemRequest{ProductID: foreign.ID})
	if !errors.Is(err, ErrForbidden) {
		t.Fatalf("expected ErrForbidden for foreign product, got %v", err)
	}

	_, err = f.svc.AddItem(ctx, f.stranger, wlID, dto.AddItemRequest{ProductID: foreign.ID})
	if !errors.Is(err, ErrForbidden) {
		t.Fatalf("expected ErrForbidden for foreign wishlist, got %v", err)
	}

	own := &models.Product{ID: uuid.New(), OwnerID: f.owner, Title: "Своё"}
	f.products.products[own.ID] = own
	if _, err := f.svc.AddItem(ctx, f.owner, wlID, dto.AddItemRequest{ProductID: own.ID}); err != nil {
		t.Fatalf("own product: %v", err)
	}
}

func TestWishlistMutationsOwnerOnly(t *testing.T) {
	ctx := context.Background()
	f := newWLFixture()
	wlID := f.lists[models.PrivacyPublic].ID
	name := "hack"

	if _, err := f.svc.UpdateWishlist(ctx, f.friend, wlID, dto.UpdateWishlistRequest{Name: &name}); !errors.Is(err, ErrForbidden) {
		t.Fatalf("update: expected ErrForbidden, got %v", err)
	}
	if err := f.svc.DeleteWishlist(ctx, f.friend, wlID); !errors.Is(err, ErrForbidden) {
		t.Fatalf("delete: expected ErrForbidden, got %v", err)
	}
	if err := f.svc.RemoveItem(ctx, f.friend, f.itemOf(models.PrivacyPublic)); !errors.Is(err, ErrForbidden) {
		t.Fatalf("remove item: expected ErrForbidden, got %v", err)
	}
	if err := f.svc.DeleteWishlist(ctx, f.owner, uuid.New()); !errors.Is(err, ErrWishlistNotFound) {
		t.Fatalf("delete missing: expected ErrWishlistNotFound, got %v", err)
	}
}
