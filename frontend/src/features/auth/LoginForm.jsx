import { memo, useState } from 'react';
import { loginRequest, useSessionStore } from '@/entities/session';
import styles from './AuthForm.module.css';

export const LoginForm = memo(({ onSuccess }) => {
  const addAccount = useSessionStore((s) => s.addAccount);
  const [form, setForm] = useState({ login_or_email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginRequest(form);
      if (data.token) {
        addAccount(data.token, data.user);
        onSuccess?.();
      } else {
        setError(data.message ?? data.error ?? 'Неверный логин или пароль');
      }
    } catch {
      setError('Ошибка сети, попробуйте позже');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        placeholder="Логин или email"
        value={form.login_or_email}
        onChange={(e) =>
          setForm((f) => ({ ...f, login_or_email: e.target.value }))
        }
      />
      <input
        className={styles.input}
        type="password"
        placeholder="Пароль"
        value={form.password}
        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
      />
      {error && <p className={styles.error}>{error}</p>}
      <button className={styles.button} type="submit" disabled={loading}>
        {loading ? 'Входим...' : 'Войти'}
      </button>
    </form>
  );
});
