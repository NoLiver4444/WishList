import { memo, useState } from 'react';
import { registerRequest, useSessionStore } from '@/entities/session';
import styles from './AuthForm.module.css';

const validate = ({ login, email, password }) => {
  if (login.length < 3) return 'Логин должен быть не короче 3 символов';
  if (login.length > 50) return 'Логин должен быть не длиннее 50 символов';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return 'Введите корректный email';
  if (password.length < 6) return 'Пароль должен быть не короче 6 символов';
  return null;
};

const getServerError = (err) => {
  if (err.status === 409) {
    if (err.message?.toLowerCase().includes('email'))
      return 'Этот email уже занят';
    if (err.message?.toLowerCase().includes('login'))
      return 'Этот логин уже занят';
    return 'Пользователь с такими данными уже существует';
  }
  if (err.status === 422) return 'Проверьте правильность введённых данных';
  if (err.status >= 500) return 'Ошибка сервера, попробуйте позже';
  return err.message ?? 'Ошибка регистрации';
};

export const RegisterForm = memo(({ onSuccess }) => {
  const addAccount = useSessionStore((s) => s.addAccount);
  const [form, setForm] = useState({ login: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleBlur = (field) => {
    const fieldErrors = {
      login:
        form.login.length > 0 && form.login.length < 3
          ? 'Минимум 3 символа'
          : null,
      email:
        form.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
          ? 'Некорректный email'
          : null,
      password:
        form.password.length > 0 && form.password.length < 6
          ? 'Минимум 6 символов'
          : null,
    };
    setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate(form);
    if (validationError) {
      setErrors({ form: validationError });
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const data = await registerRequest(form);
      if (data.token) {
        addAccount(data.token, data.user);
        onSuccess?.();
      }
    } catch (err) {
      setErrors({ form: getServerError(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <input
          className={`${styles.input} ${errors.login ? styles.inputError : ''}`}
          placeholder="Логин"
          value={form.login}
          onChange={(e) => setForm((f) => ({ ...f, login: e.target.value }))}
          onBlur={() => handleBlur('login')}
        />
        {errors.login && <p className={styles.fieldError}>{errors.login}</p>}
      </div>

      <div className={styles.field}>
        <input
          className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          onBlur={() => handleBlur('email')}
        />
        {errors.email && <p className={styles.fieldError}>{errors.email}</p>}
      </div>

      <div className={styles.field}>
        <input
          className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
          type="password"
          placeholder="Пароль"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          onBlur={() => handleBlur('password')}
        />
        {errors.password && (
          <p className={styles.fieldError}>{errors.password}</p>
        )}
      </div>

      {errors.form && <p className={styles.error}>{errors.form}</p>}

      <button className={styles.button} type="submit" disabled={loading}>
        {loading ? 'Регистрируем...' : 'Зарегистрироваться'}
      </button>
    </form>
  );
});
