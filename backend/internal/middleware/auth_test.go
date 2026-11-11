package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func TestQueryTokenOnlyForSSE(t *testing.T) {
	const secret = "s"
	tok, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": "u", "exp": time.Now().Add(time.Hour).Unix(),
	}).SignedString([]byte(secret))

	h := AuthMiddleware(secret, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	cases := map[string]int{
		QueryTokenPath + "?token=" + tok:  http.StatusOK,
		"/v1/users/me?token=" + tok:       http.StatusUnauthorized,
		"/v1/wishlists?token=" + tok:      http.StatusUnauthorized,
		QueryTokenPath + "?token=garbage": http.StatusUnauthorized,
	}
	for url, want := range cases {
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, url, nil))
		if rec.Code != want {
			t.Errorf("%s: got %d, want %d", url, rec.Code, want)
		}
	}
}
