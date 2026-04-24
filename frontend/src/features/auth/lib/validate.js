export const validateLoginField = (name, value) => {
  if (!value) return 'Поле обязательно';
  return null;
};

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
