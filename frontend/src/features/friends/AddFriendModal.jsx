import { memo, useCallback, useState } from 'react';
import { searchUsers, sendFriendRequest } from '@/entities/api';
import { useDebounce } from '@/shared/hooks/useDebounce';
import styles from './AddFriendsModal.module.css';
import Avatar from '@/shared/ui/User/Avatar/Avatar.jsx';

const AddFriendModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle');

  const searchUser = useCallback(async (login) => {
    if (!login.trim()) return;
    setStatus('loading');
    try {
      const data = await searchUsers(login);
      if (data && data?.length > 0) {
        setResult(data[0]);
        setStatus('found');
      } else {
        setStatus('not_found');
      }
    } catch {
      setStatus('error');
    }
  }, []);

  const debouncedSearch = useDebounce(searchUser, 500);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setStatus('idle');
    setResult(null);
    debouncedSearch(val);
  };

  const handleAdd = async () => {
    if (!result) return;
    try {
      await sendFriendRequest(result.id);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Добавить друга</h2>

        <input
          className={styles.input}
          type="text"
          placeholder="Введите логин"
          value={query}
          onChange={handleChange}
          autoFocus
        />

        {status === 'loading' && <p className={styles.status}>Поиск...</p>}
        {status === 'not_found' && (
          <p className={styles.status}>Пользователь не найден</p>
        )}
        {status === 'error' && (
          <p className={styles.errorText}>Что-то пошло не так</p>
        )}
        {status === 'sent' && (
          <p className={styles.status}>Заявка отправлена</p>
        )}

        {status === 'found' && result && (
          <div className={styles.result}>
            <div className={styles.userCard}>
              <Avatar
                src={result?.avatar_url}
                alt={result?.login}
                size={150}
                className={styles.avatar}
              />
              <span className={styles.login}>{result.login}</span>
            </div>
            <button className={styles.submit} onClick={handleAdd}>
              Добавить
            </button>
          </div>
        )}

        <button className={styles.cancel} onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default memo(AddFriendModal);
