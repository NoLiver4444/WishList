import { useState } from 'react';
import { registerRequest, useSessionStore } from '@/entities/session';
import styles from './AuthForm.module.css';

export const RegisterForm = ({ onSuccess }) => {
  const setSession = useSessionStore((s) => s.setSession);
  const [form, setForm] = useState({ login: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await registerRequest(form);
      if (data.token) {
        setSession(data.token, data.user);
        onSuccess?.();
      } else {
        setError(data.message ?? 'Ошибка регистрации');
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
        placeholder="Логин"
        value={form.login}
        onChange={(e) => setForm((f) => ({ ...f, login: e.target.value }))}
      />
      <input
        className={styles.input}
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
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
        {loading ? 'Регистрируем...' : 'Зарегистрироваться'}
      </button>
    </form>
  );
};
