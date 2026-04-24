import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm, RegisterForm } from '@/features/auth';
import styles from './AuthPage.module.css';

const AuthPage = () => {
  const [mode, setMode] = useState('login');
  const navigate = useNavigate();

  const handleSuccess = () => navigate('/');

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>WishPiece</h1>
        <div className={styles.tabs}>
          <button
            className={mode === 'login' ? styles.activeTab : styles.tab}
            onClick={() => setMode('login')}
          >
            Войти
          </button>
          <button
            className={mode === 'register' ? styles.activeTab : styles.tab}
            onClick={() => setMode('register')}
          >
            Регистрация
          </button>
        </div>
        {mode === 'login' ? (
          <LoginForm onSuccess={handleSuccess} />
        ) : (
          <RegisterForm onSuccess={handleSuccess} />
        )}
      </div>
    </div>
  );
};

export default memo(AuthPage);
