package service

import (
	"context"
	"testing"
	"time"

	"wish-piece/internal/dto"
	"wish-piece/internal/models"
	"wish-piece/internal/repository"

	"github.com/google/uuid"
)

// ---- WishlistRepository ----

type mockWishlistRepo struct {
	lists map[uuid.UUID]*models.Wishlist
}

func newMockWishlistRepo(lists ...*models.Wishlist) *mockWishlistRepo {
	m := &mockWishlistRepo{lists: map[uuid.UUID]*models.Wishlist{}}
	for _, wl := range lists {
		m.lists[wl.ID] = wl
	}
	return m
}

func (m *mockWishlistRepo) Create(_ context.Context, wl *models.Wishlist) error {
	wl.ID = uuid.New()
	m.lists[wl.ID] = wl
	return nil
}

func (m *mockWishlistRepo) FindByID(_ context.Context, id uuid.UUID) (*models.Wishlist, error) {
	wl, ok := m.lists[id]
	if !ok {
		return nil, repository.ErrWishlistNotFound
	}
	cp := *wl
	return &cp, nil
}

func (m *mockWishlistRepo) FindByUserID(_ context.Context, userID uuid.UUID) ([]*models.Wishlist, error) {
	var out []*models.Wishlist
	for _, wl := range m.lists {
		if wl.UserID == userID {
			out = append(out, wl)
		}
	}
	return out, nil
}

func (m *mockWishlistRepo) Update(_ context.Context, wl *models.Wishlist) error {
	m.lists[wl.ID] = wl
	return nil
}

func (m *mockWishlistRepo) Delete(_ context.Context, id uuid.UUID) error {
	delete(m.lists, id)
	return nil
}

func (m *mockWishlistRepo) IsOwner(_ context.Context, wlID, userID uuid.UUID) (bool, error) {
	wl, ok := m.lists[wlID]
	return ok && wl.UserID == userID, nil
}

// ---- WishlistItemRepository ----

type mockItemRepo struct {
	items map[uuid.UUID]*models.WishlistItem
}

func newMockItemRepo(items ...*models.WishlistItem) *mockItemRepo {
	m := &mockItemRepo{items: map[uuid.UUID]*models.WishlistItem{}}
	for _, it := range items {
		m.items[it.ID] = it
	}
	return m
}

func (m *mockItemRepo) AddItem(_ context.Context, item *models.WishlistItem) error {
	item.ID = uuid.New()
	m.items[item.ID] = item
	return nil
}

func (m *mockItemRepo) ListItemsWithProducts(_ context.Context, wlID uuid.UUID) ([]*models.WishlistItem, error) {
	var out []*models.WishlistItem
	for _, it := range m.items {
		if it.WishlistID == wlID {
			out = append(out, it)
		}
	}
	return out, nil
}

func (m *mockItemRepo) RemoveItem(_ context.Context, itemID uuid.UUID) error {
	delete(m.items, itemID)
	return nil
}

func (m *mockItemRepo) Reserve(_ context.Context, itemID, userID uuid.UUID) error {
	it, ok := m.items[itemID]
	if !ok {
		return repository.ErrItemNotFound
	}
	if it.ReservedBy != nil {
		return ErrAlreadyReserved
	}
	it.ReservedBy = &userID
	return nil
}

func (m *mockItemRepo) Unreserve(_ context.Context, itemID, reservedBy uuid.UUID) error {
	it, ok := m.items[itemID]
	if !ok || it.ReservedBy == nil || *it.ReservedBy != reservedBy {
		return ErrForbidden
	}
	it.ReservedBy = nil
	return nil
}

func (m *mockItemRepo) FindByID(_ context.Context, id uuid.UUID) (*models.WishlistItem, error) {
	it, ok := m.items[id]
	if !ok {
		return nil, repository.ErrItemNotFound
	}
	cp := *it
	return &cp, nil
}

// ---- ProductRepository ----

type mockProductRepo struct {
	products map[uuid.UUID]*models.Product
}

func newMockProductRepo(products ...*models.Product) *mockProductRepo {
	m := &mockProductRepo{products: map[uuid.UUID]*models.Product{}}
	for _, p := range products {
		m.products[p.ID] = p
	}
	return m
}

func (m *mockProductRepo) Create(_ context.Context, p *models.Product) error {
	p.ID = uuid.New()
	m.products[p.ID] = p
	return nil
}

func (m *mockProductRepo) Update(_ context.Context, p *models.Product) error {
	old, ok := m.products[p.ID]
	if !ok || old.OwnerID != p.OwnerID {
		return repository.ErrProductNotFound
	}
	m.products[p.ID] = p
	return nil
}

func (m *mockProductRepo) FindByID(_ context.Context, id uuid.UUID) (*models.Product, error) {
	p, ok := m.products[id]
	if !ok {
		return nil, repository.ErrProductNotFound
	}
	cp := *p
	return &cp, nil
}

func (m *mockProductRepo) FindByOwner(_ context.Context, ownerID uuid.UUID) ([]*models.Product, error) {
	var out []*models.Product
	for _, p := range m.products {
		if p.OwnerID == ownerID {
			out = append(out, p)
		}
	}
	return out, nil
}

func (m *mockProductRepo) Delete(_ context.Context, id, ownerID uuid.UUID) error {
	p, ok := m.products[id]
	if !ok || p.OwnerID != ownerID {
		return repository.ErrProductNotFound
	}
	delete(m.products, id)
	return nil
}

// ---- FriendshipRepository ----

type mockFriendshipRepo struct {
	rows map[uuid.UUID]*models.Friendship
}

func newMockFriendshipRepo(rows ...*models.Friendship) *mockFriendshipRepo {
	m := &mockFriendshipRepo{rows: map[uuid.UUID]*models.Friendship{}}
	for _, f := range rows {
		m.rows[f.ID] = f
	}
	return m
}

func (m *mockFriendshipRepo) SearchByLogin(context.Context, string, uuid.UUID) ([]dto.UserSearchResult, error) {
	return nil, nil
}

func (m *mockFriendshipRepo) Create(_ context.Context, userID, friendID uuid.UUID) (*models.Friendship, error) {
	f := &models.Friendship{ID: uuid.New(), UserID: userID, FriendID: friendID, Status: models.FriendshipPending}
	m.rows[f.ID] = f
	return f, nil
}

func (m *mockFriendshipRepo) Reopen(_ context.Context, id, userID, friendID uuid.UUID) (*models.Friendship, error) {
	f, ok := m.rows[id]
	if !ok || f.Status != models.FriendshipDeclined {
		return nil, ErrFriendshipAlreadyExists
	}
	f.UserID, f.FriendID, f.Status = userID, friendID, models.FriendshipPending
	return f, nil
}

func (m *mockFriendshipRepo) Respond(_ context.Context, id, recipientID uuid.UUID, status models.FriendshipStatus) error {
	f, ok := m.rows[id]
	if !ok || f.FriendID != recipientID || f.Status != models.FriendshipPending {
		return ErrFriendshipNotFound
	}
	f.Status = status
	return nil
}

func (m *mockFriendshipRepo) FindByID(_ context.Context, id uuid.UUID) (*models.Friendship, error) {
	f, ok := m.rows[id]
	if !ok {
		return nil, nil
	}
	cp := *f
	return &cp, nil
}

func (m *mockFriendshipRepo) FindBetween(_ context.Context, a, b uuid.UUID) (*models.Friendship, error) {
	for _, f := range m.rows {
		if (f.UserID == a && f.FriendID == b) || (f.UserID == b && f.FriendID == a) {
			cp := *f
			return &cp, nil
		}
	}
	return nil, nil
}

func (m *mockFriendshipRepo) AreFriends(ctx context.Context, a, b uuid.UUID) (bool, error) {
	f, _ := m.FindBetween(ctx, a, b)
	return f != nil && f.Status == models.FriendshipAccepted, nil
}

func (m *mockFriendshipRepo) GetFriends(context.Context, uuid.UUID) ([]dto.FriendDTO, error) {
	return nil, nil
}

func (m *mockFriendshipRepo) GetIncomingRequests(context.Context, uuid.UUID) ([]dto.FriendDTO, error) {
	return nil, nil
}

func (m *mockFriendshipRepo) Delete(_ context.Context, id uuid.UUID) error {
	if _, ok := m.rows[id]; !ok {
		return ErrFriendshipNotFound
	}
	delete(m.rows, id)
	return nil
}

// ---- NotificationRepository ----

type mockNotificationRepo struct {
	created []repository.NewNotification
}

func (m *mockNotificationRepo) Create(_ context.Context, n repository.NewNotification) error {
	m.created = append(m.created, n)
	return nil
}

func (m *mockNotificationRepo) GetUnread(context.Context, uuid.UUID) ([]dto.NotificationDTO, error) {
	return nil, nil
}

func (m *mockNotificationRepo) MarkRead(context.Context, uuid.UUID, uuid.UUID) error { return nil }

func (m *mockNotificationRepo) MarkAllRead(context.Context, uuid.UUID) error { return nil }

func (m *mockNotificationRepo) GetWishlistsNearDeadline(context.Context, int) ([]repository.DeadlineWishlist, error) {
	return nil, nil
}

// ---- UserRepository ----

type mockUserRepo struct {
	users map[uuid.UUID]*models.User
}

func newMockUserRepo(users ...*models.User) *mockUserRepo {
	m := &mockUserRepo{users: map[uuid.UUID]*models.User{}}
	for _, u := range users {
		m.users[u.ID] = u
	}
	return m
}

func (m *mockUserRepo) Create(_ context.Context, u *models.User) error {
	u.ID = uuid.New()
	m.users[u.ID] = u
	return nil
}

func (m *mockUserRepo) FindByLoginOrEmail(_ context.Context, val string) (*models.User, error) {
	for _, u := range m.users {
		if u.Login == val || u.Email == val {
			return u, nil
		}
	}
	return nil, nil
}

func (m *mockUserRepo) FindByID(_ context.Context, id uuid.UUID) (*models.User, error) {
	return m.users[id], nil
}

func (m *mockUserRepo) Update(_ context.Context, u *models.User) error {
	m.users[u.ID] = u
	return nil
}

func (m *mockUserRepo) Delete(_ context.Context, id uuid.UUID) error {
	delete(m.users, id)
	return nil
}

func mustDate(t *testing.T, s string) time.Time {
	t.Helper()
	d, err := time.Parse("2006-01-02", s)
	if err != nil {
		t.Fatal(err)
	}
	return d
}
