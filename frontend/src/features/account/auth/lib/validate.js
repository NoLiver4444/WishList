/**
 * @file Логика валидации полей ввода на стороне клиента.
 * @module features/account/auth/lib/validate.js
 */

/**
 * Валидатор для формы входа.
 * Проверяет только наличие значения (required).
 * @param {string} name - Имя поля.
 * @param {string} value - Значение поля.
 * @returns {string|null} Текст ошибки или null, если поле валидно.
 */

export const validateLoginField = (name, value) => {
  if (!value) return 'Поле обязательно';
  return null;
};

/**
 * Валидатор для формы регистрации.
 * Включает проверку длины логина (3-50 символов), формат email и длину пароля (min 6).
 * @param {string} name - Имя поля.
 * @param {string} value - Значение поля.
 * @returns {string|null} Текст ошибки или null.
 */
export const validateRegisterField = (name, value) => {
  switch (name) {
    case 'login':
      if (value.length < 3) return 'Минимум 3 символа';
      if (value.length > 50) return 'Максимум 50 символов';
      return null;

    case 'email':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return 'Некорректный email';
      return null;

    case 'password':
      if (value.length < 6) return 'Минимум 6 символов';
      return null;

    default:
      return null;
  }
};
