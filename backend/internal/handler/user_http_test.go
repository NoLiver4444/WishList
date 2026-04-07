package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"wish-piece/internal/dto"
	"wish-piece/internal/middleware"
	"wish-piece/internal/models"
	"wish-piece/internal/service"
)

// --- Mock Repository ---
type mockUserRepo struct {
	user *models.User
}

func (m *mockUserRepo) Create(ctx context.Context, user *models.User) error          { m.user = user; return nil }
func (m *mockUserRepo) FindByLoginOrEmail(ctx context.Context, val string) (*models.User, error) {
	if m.user != nil && (m.user.Login == val || m.user.Email == val) { return m.user, nil }
	return nil, nil
}
func (m *mockUserRepo) FindByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	if m.user != nil && m.user.ID == id { return m.user, nil }
	return nil, nil
}
func (m *mockUserRepo) Update(ctx context.Context, user *models.User) error          { m.user = user; return nil }
func (m *mockUserRepo) Delete(ctx context.Context, id uuid.UUID) error               { m.user = nil; return nil }

// --- Helpers ---
func generateTestJWT(userID uuid.UUID, secret string) string {
	claims := jwt.MapClaims{
		"user_id": userID.String(),
		"exp":     time.Now().Add(time.Hour).Unix(),
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	s, _ := t.SignedString([]byte(secret))
	return s
}

// setupTestServer создаёт тестовый HTTP-сервер БЕЗ импорта router (чтобы избежать цикла)
func setupTestServer(t *testing.T) (*httptest.Server, string, uuid.UUID) {
	t.Helper()
	
	userID := uuid.New()
	phone := "+79991234567"
	passHash, _ := bcrypt.GenerateFromPassword([]byte("SecurePass1!"), bcrypt.DefaultCost)

	repo := &mockUserRepo{
		user: &models.User{
			ID: userID, Login: "testuser", Email: "test@mail.com",
			Phone: &phone, PasswordHash: string(passHash), AvatarURL: nil, CreatedAt: time.Now(),
		},
	}

	svc := service.NewUserService(repo)
	val := validator.New()
	jwtSecret := "test-jwt-secret-for-http-test"
	token := generateTestJWT(userID, jwtSecret)

	userH := &UserHandler{Service: svc, Validator: val}
	
	// 🔄 Вместо router.New собираем защищённый маршрут вручную
	protectedMux := http.NewServeMux()
	protectedMux.HandleFunc("GET /v1/users/me", userH.GetMe)
	protectedMux.HandleFunc("PATCH /v1/users/me", userH.UpdateMe)
	protectedMux.HandleFunc("DELETE /v1/users/me", userH.DeleteMe)
	
	handler := middleware.AuthMiddleware(jwtSecret, protectedMux)
	ts := httptest.NewServer(handler)
	
	return ts, token, userID
}

// --- Интеграционные тесты через HTTP ---
func TestUserHTTP_GetMe(t *testing.T) {
	ts, token, _ := setupTestServer(t)
	defer ts.Close()
	client := &http.Client{}

	t.Run("returns 200 with user data", func(t *testing.T) {
		req, _ := http.NewRequest("GET", ts.URL+"/v1/users/me", nil)
		req.Header.Set("Authorization", "Bearer "+token)

		resp, err := client.Do(req)
		if err != nil { t.Fatal(err) }
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Fatalf("expected 200, got %d", resp.StatusCode)
		}

		var u dto.UserDTO
		if err := json.NewDecoder(resp.Body).Decode(&u); err != nil { t.Fatal(err) }
		if u.Login != "testuser" || u.Email != "test@mail.com" {
			t.Fatalf("unexpected user data: %+v", u)
		}
	})

	t.Run("returns 401 without token", func(t *testing.T) {
		req, _ := http.NewRequest("GET", ts.URL+"/v1/users/me", nil)
		resp, _ := client.Do(req)
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusUnauthorized {
			t.Fatalf("expected 401, got %d", resp.StatusCode)
		}
	})
}

func TestUserHTTP_UpdateMe(t *testing.T) {
	ts, token, _ := setupTestServer(t)
	defer ts.Close()
	client := &http.Client{}

	tests := []struct {
		name       string
		body       any
		expectCode int
	}{
		{
			name:       "valid update phone",
			body:       map[string]string{"phone": "+7111222333"},
			expectCode: http.StatusOK,
		},
		{
			name:       "invalid json",
			body:       `{bad json`,
			expectCode: http.StatusBadRequest,
		},
		{
			name:       "validation error (short login)",
			body:       map[string]string{"login": "ab"},
			expectCode: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			buf, _ := json.Marshal(tt.body)
			req, _ := http.NewRequest("PATCH", ts.URL+"/v1/users/me", bytes.NewBuffer(buf))
			req.Header.Set("Authorization", "Bearer "+token)
			req.Header.Set("Content-Type", "application/json")

			resp, err := client.Do(req)
			if err != nil { t.Fatal(err) }
			defer resp.Body.Close()

			if resp.StatusCode != tt.expectCode {
				t.Fatalf("expected %d, got %d", tt.expectCode, resp.StatusCode)
			}

			if tt.expectCode == http.StatusOK {
				var u dto.UserDTO
				json.NewDecoder(resp.Body).Decode(&u)
				if u.Phone == nil || *u.Phone != "+7111222333" {
					t.Fatalf("expected phone to be updated")
				}
			}
		})
	}
}

func TestUserHTTP_DeleteMe(t *testing.T) {
	t.Run("returns 204 on valid password", func(t *testing.T) {
		ts, token, _ := setupTestServer(t)
		defer ts.Close()
		client := &http.Client{}

		body, _ := json.Marshal(map[string]string{"password": "SecurePass1!"})
		req, _ := http.NewRequest("DELETE", ts.URL+"/v1/users/me", bytes.NewBuffer(body))
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")

		resp, err := client.Do(req)
		if err != nil { t.Fatal(err) }
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusNoContent {
			t.Fatalf("expected 204, got %d", resp.StatusCode)
		}
	})

	t.Run("returns 403 on wrong password", func(t *testing.T) {
		ts, token, _ := setupTestServer(t) // 🔄 Изолированный сервер для этого кейса
		defer ts.Close()
		client := &http.Client{}

		body, _ := json.Marshal(map[string]string{"password": "wrongpass"})
		req, _ := http.NewRequest("DELETE", ts.URL+"/v1/users/me", bytes.NewBuffer(body))
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")

		resp, err := client.Do(req)
		if err != nil { t.Fatal(err) }
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusForbidden {
			t.Fatalf("expected 403, got %d", resp.StatusCode)
		}
	})
}