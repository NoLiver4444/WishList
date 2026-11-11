package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const UserIDKey contextKey = "id"

// QueryTokenPath — единственный маршрут, где токен разрешено передавать в ?token=
// (EventSource в браузере не умеет слать заголовок Authorization).
const QueryTokenPath = "/v1/notifications/stream"

func unauthorized(w http.ResponseWriter, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusUnauthorized)
	_, _ = w.Write([]byte(`{"status":401,"message":"` + message + `","code":"UNAUTHORIZED"}`))
}

func AuthMiddleware(jwtSecret string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")

		if authHeader == "" && r.Method == http.MethodGet && r.URL.Path == QueryTokenPath {
			if token := r.URL.Query().Get("token"); token != "" {
				authHeader = "Bearer " + token
			}
		}

		if authHeader == "" {
			unauthorized(w, "Authorization header required")
			return
		}

		tokenStr, found := strings.CutPrefix(authHeader, "Bearer ")
		if !found || tokenStr == "" {
			unauthorized(w, "Invalid authorization format")
			return
		}

		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (any, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(jwtSecret), nil
		}, jwt.WithExpirationRequired())

		if err != nil || !token.Valid {
			unauthorized(w, "Invalid or expired token")
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			unauthorized(w, "Invalid token claims")
			return
		}

		userID, ok := claims["user_id"].(string)
		if !ok || userID == "" {
			unauthorized(w, "User ID not found in token")
			return
		}

		ctx := context.WithValue(r.Context(), UserIDKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func GetUserIDFromContext(ctx context.Context) (string, bool) {
	userID, ok := ctx.Value(UserIDKey).(string)
	return userID, ok
}
