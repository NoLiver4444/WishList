export const validate = (fields, form) => {
  const newErrors = {};

  fields.forEach((field) => {
    const value = form[field.name];

    // Приводим к строке и убираем пробелы
    const trimmedValue =
      value !== undefined && value !== null ? String(value).trim() : '';

    const isEmpty = trimmedValue === '';

    // 1. Проверка required
    if (field.required && isEmpty) {
      newErrors[field.name] = 'Это поле обязательно для заполнения';
      return;
    }

    // 2. Если поле пустое и не required — дальше не валидируем
    if (isEmpty) return;

    // 3. Валидация числа
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

    // 4. Валидация даты
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

    // 5. Валидация по регулярке
    if (field.pattern) {
      const regex = new RegExp(field.pattern);

      if (!regex.test(trimmedValue)) {
        newErrors[field.name] = field.errorText || 'Неверный формат';
      }
    }
  });

  return newErrors;
};
