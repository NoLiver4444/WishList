package handler

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"wish-piece/internal/apperr"
	"wish-piece/internal/middleware"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

func RespondJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if payload != nil {
		if err := json.NewEncoder(w).Encode(payload); err != nil {
			log.Printf("response encode error: %v", err)
		}
	}
}

// RespondError отправляет ошибку в едином формате {status, message, code}.
func RespondError(w http.ResponseWriter, status int, message, code string) {
	RespondJSON(w, status, map[string]any{
		"status":  status,
		"message": message,
		"code":    code,
	})
}

// currentUserID достаёт ID пользователя из контекста (его кладёт AuthMiddleware).
// При ошибке сам отвечает 401 и возвращает false.
func currentUserID(w http.ResponseWriter, r *http.Request) (uuid.UUID, bool) {
	raw, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		RespondError(w, http.StatusUnauthorized, "Требуется авторизация", "UNAUTHORIZED")
		return uuid.Nil, false
	}
	id, err := uuid.Parse(raw)
	if err != nil {
		RespondError(w, http.StatusUnauthorized, "Некорректный токен", "UNAUTHORIZED")
		return uuid.Nil, false
	}
	return id, true
}

// pathUUID разбирает UUID из параметра пути. При ошибке отвечает 400 и возвращает false.
func pathUUID(w http.ResponseWriter, r *http.Request, name string) (uuid.UUID, bool) {
	id, err := uuid.Parse(r.PathValue(name))
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Некорректный идентификатор", "PARSE_ERROR")
		return uuid.Nil, false
	}
	return id, true
}

// normalizer реализуют DTO, которым нужна предобработка (trim, нижний регистр) до валидации.
type normalizer interface {
	Normalize()
}

// decodeJSON читает тело запроса в dst, нормализует (если dst реализует Normalize)
// и валидирует его (если v != nil).
// При ошибке сам отвечает 400/413 и возвращает false.
func decodeJSON(w http.ResponseWriter, r *http.Request, v *validator.Validate, dst any) bool {
	if err := json.NewDecoder(r.Body).Decode(dst); err != nil {
		var maxErr *http.MaxBytesError
		if errors.As(err, &maxErr) {
			RespondError(w, http.StatusRequestEntityTooLarge, "Слишком большой запрос", "TOO_LARGE")
			return false
		}
		RespondError(w, http.StatusBadRequest, "Некорректный JSON", "PARSE_ERROR")
		return false
	}
	if n, ok := dst.(normalizer); ok {
		n.Normalize()
	}
	if v != nil {
		if err := v.Struct(dst); err != nil {
			RespondError(w, http.StatusBadRequest, "Ошибка валидации: "+err.Error(), "VALIDATION_ERROR")
			return false
		}
	}
	return true
}

type errorMapping struct {
	err     error
	status  int
	message string
	code    string
}

var errorMappings = []errorMapping{
	{apperr.ErrUserNotFound, http.StatusNotFound, "Пользователь не найден", "NOT_FOUND"},
	{apperr.ErrWishlistNotFound, http.StatusNotFound, "Вишлист не найден", "NOT_FOUND"},
	{apperr.ErrItemNotFound, http.StatusNotFound, "Желание не найдено", "NOT_FOUND"},
	{apperr.ErrProductNotFound, http.StatusNotFound, "Товар не найден", "NOT_FOUND"},
	{apperr.ErrFriendshipNotFound, http.StatusNotFound, "Заявка или дружба не найдена", "NOT_FOUND"},

	{apperr.ErrUserAlreadyExists, http.StatusConflict, "Логин или email уже заняты", "CONFLICT"},
	{apperr.ErrFriendshipAlreadyExists, http.StatusConflict, "Заявка уже отправлена или вы уже друзья", "CONFLICT"},
	{apperr.ErrItemAlreadyAdded, http.StatusConflict, "Это желание уже есть в вишлисте", "CONFLICT"},
	{apperr.ErrAlreadyReserved, http.StatusConflict, "Желание уже забронировано", "CONFLICT"},

	{apperr.ErrForbidden, http.StatusForbidden, "Доступ запрещён", "FORBIDDEN"},
	{apperr.ErrInvalidPassword, http.StatusForbidden, "Неверный пароль", "FORBIDDEN"},
	{apperr.ErrInvalidCredentials, http.StatusUnauthorized, "Неверный логин или пароль", "UNAUTHORIZED"},

	{apperr.ErrCannotAddSelf, http.StatusBadRequest, "Нельзя добавить себя в друзья", "BAD_REQUEST"},
	{apperr.ErrInvalidInput, http.StatusBadRequest, "Некорректные данные", "BAD_REQUEST"},
}

// respondServiceError переводит доменную ошибку в HTTP-ответ.
// Неизвестные ошибки логируются и превращаются в 500.
func respondServiceError(w http.ResponseWriter, r *http.Request, err error) {
	for _, m := range errorMappings {
		if errors.Is(err, m.err) {
			RespondError(w, m.status, m.message, m.code)
			return
		}
	}
	log.Printf("%s %s: internal error: %v", r.Method, r.URL.Path, err)
	RespondError(w, http.StatusInternalServerError, "Внутренняя ошибка сервера", "INTERNAL_ERROR")
}
