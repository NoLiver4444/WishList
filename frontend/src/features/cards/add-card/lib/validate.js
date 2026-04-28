/**
 * @file Утилита для валидации полей формы.
 * @module features/cards/add-card/lib/validate
 */

/**
 * Проверяет данные формы на соответствие правилам из конфигурации полей.
 * @param {Array<Object>} fields - Конфигурация полей (required, type, min, max, pattern).
 * @param {Object} form - Текущие значения полей формы.
 * @returns {Object} Объект с ошибками, где ключ — имя поля, значение — текст ошибки.
 */

export const validate = (fields, form) => {
  const newErrors = {};

  fields.forEach((field) => {
    const value = form[field.name];

    const trimmedValue =
      value !== undefined && value !== null ? String(value).trim() : '';

    const isEmpty = trimmedValue === '';

    if (field.required && isEmpty) {
      newErrors[field.name] = 'Это поле обязательно для заполнения';
      return;
    }

    if (isEmpty) return;

    if (field.type === 'number') {
      const num = Number(trimmedValue);

      if (isNaN(num)) {
        newErrors[field.name] = 'Введите корректное число';
        return;
      }

      if (field.min !== undefined && num < field.min) {
        newErrors[field.name] = `Минимум: ${field.min}`;
        return;
      }

      if (field.max !== undefined && num > field.max) {
        newErrors[field.name] = `Максимум: ${field.max}`;
        return;
      }
    }

    if (field.type === 'date') {
      if (field.min && trimmedValue < field.min) {
        newErrors[field.name] = `Дата не может быть раньше ${field.min}`;
        return;
      }

      if (field.max && trimmedValue > field.max) {
        newErrors[field.name] = `Дата не может быть позже ${field.max}`;
        return;
      }
    }

    if (field.pattern) {
      const regex = new RegExp(field.pattern);

      if (!regex.test(trimmedValue)) {
        newErrors[field.name] = field.errorText || 'Неверный формат';
      }
    }
  });

  return newErrors;
};
