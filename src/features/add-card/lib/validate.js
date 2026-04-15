export const validate = (fields, form) => {
  const newErrors = {};
  fields.forEach((field) => {
    const value = form[field.name];
    const trimmedValue = typeof value === 'string' ? value.trim() : value;

    if (field.required && !trimmedValue && trimmedValue !== 0) {
      newErrors[field.name] = 'Это поле обязательно для заполнения';
      return;
    }

    if (!trimmedValue && trimmedValue !== 0) return;

    if (field.type === 'number') {
      const num = Number(trimmedValue);
      if (field.min !== undefined && num < field.min) {
        newErrors[field.name] = `Минимум: ${field.min}`;
      } else if (field.max !== undefined && num > field.max) {
        newErrors[field.name] = `Максимум: ${field.max}`;
      }
    }

    if (field.type === 'date') {
      if (field.min && trimmedValue < field.min) {
        newErrors[field.name] = `Дата не может быть раньше ${field.min}`;
      } else if (field.max && trimmedValue > field.max) {
        newErrors[field.name] = `Дата не может быть позже ${field.max}`;
      }
    }

    if (field.pattern && !new RegExp(field.pattern).test(trimmedValue)) {
      newErrors[field.name] = field.errorText || 'Неверный формат';
    }
  });

  return newErrors;
};
