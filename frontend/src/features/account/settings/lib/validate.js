/**
 * @file Валидация полей настроек профиля.
 * @module features/account/settings/lib/validate.js
 */

/**
 * Проверяет корректность введенных данных в полях профиля.
 * @param {string} name - Имя поля (login, email, new_password).
 * @param {string} value - Значение поля.
 * @returns {string|null} Текст ошибки или null, если валидация прошла успешно.
 */

export const validateSettingsField = (name, value) => {
  if (!value) return null;

  if (name === 'login' && value.length < 3) return 'Минимум 3 символа';

  if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return 'Некорректный email';

  if (name === 'new_password' && value.length < 6) return 'Минимум 6 символов';

  if (name === 'birthday') {
    if (!value) return null;

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) return 'Выберите корректную дату';
  }

  if (name === 'phone') {
    const phoneRegex = /^\+7\d{10}$/;
    if (!phoneRegex.test(value)) return 'Формат: +79991234567';
  }

  return null;
};
