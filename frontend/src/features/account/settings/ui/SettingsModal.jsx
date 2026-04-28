/**
 * @file Модальное окно настроек профиля и безопасности.
 * @module features/account/settings/ui/SettingsModal
 */

import { memo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, X } from 'lucide-react';
import { useClickOutside } from '@/shared/hooks/useClickOutside.jsx';
import { useEscClose } from '@/shared/hooks/useEscClose.jsx';
import { useSessionStore } from '@/entities/session/index.js';
import { uploadImage } from '@/shared/lib/uploadImage.js';
import { AuthForm } from '@/features/account/auth/ui/AuthForm.jsx';
import { validateSettingsField } from '../lib/validate.js';
import { deleteUserRequest, updateUserRequest } from '../api/settingsApi.js';
import {
  dangerFields,
  getProfileFields,
  passwordFields,
} from '../config/SettingsForm.config.js';
import styles from './SettingsModal.module.css';

/**
 * Компонент SettingsModal.
 * Предоставляет интерфейс для смены аватара, редактирования профиля,
 * изменения пароля и удаления аккаунта.
 * @param {Object} props
 * @param {boolean} props.isOpen - Состояние открытия модального окна.
 * @param {Function} props.onClose - Функция закрытия окна.
 */
const SettingsModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);
  const currentUser = useSessionStore((s) => s.accounts[s.activeIndex]?.user);
  const updateUser = useSessionStore((s) => s.updateCurrentUser);
  const logout = useSessionStore((s) => s.logout);
  const [tab, setTab] = useState('profile');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const profileFields = getProfileFields();

  useClickOutside([modalRef], onClose);
  useEscClose(onClose, isOpen);

  if (!isOpen) return null;

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      const url = await uploadImage(file);
      const updated = await updateUserRequest({ avatar_url: url });
      updateUser(updated);
    } catch (err) {
      console.error('Ошибка загрузки аватара:', err);
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          ref={modalRef}
          className={styles.modal}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className={styles.header}>
            <h2 className={styles.title}>Настройки</h2>
            <button className={styles.close} onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className={styles.avatarSection}>
            <label className={styles.avatarWrapper}>
              {currentUser?.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt="аватар"
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarPlaceholder} />
              )}
              <div className={styles.avatarOverlay}>
                {avatarLoading ? '...' : <Camera size={20} />}
              </div>
              <input
                type="file"
                accept="image/*"
                className={styles.avatarInput}
                onChange={handleAvatarChange}
              />
            </label>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{currentUser?.login}</span>
              <span className={styles.userEmail}>{currentUser?.email}</span>
            </div>
          </div>

          <div className={styles.tabs}>
            {[
              { id: 'profile', label: 'Профиль' },
              { id: 'password', label: 'Пароль' },
              { id: 'danger', label: 'Удалить аккаунт' },
            ].map((t) => (
              <button
                key={t.id}
                className={`${styles.tab} ${tab === t.id ? styles.activeTab : ''} ${t.id === 'danger' ? styles.dangerTab : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className={styles.content}>
            {tab === 'profile' && (
              <AuthForm
                fields={profileFields}
                submitText="Сохранить"
                validateField={validateSettingsField}
                onSubmit={async (form) => {
                  const updated = await updateUserRequest({
                    login: form.login || undefined,
                    email: form.email || undefined,
                    phone: form.phone || undefined,
                  });
                  updateUser(updated);
                  onClose();
                }}
              />
            )}

            {tab === 'password' && (
              <AuthForm
                fields={passwordFields}
                submitText="Изменить пароль"
                validateField={validateSettingsField}
                onSubmit={async (form) => {
                  await updateUserRequest({ password: form.new_password });
                  onClose();
                }}
              />
            )}

            {tab === 'danger' && (
              <div className={styles.dangerZone}>
                <p className={styles.dangerText}>
                  Это действие необратимо. Все ваши данные будут удалены.
                </p>
                <AuthForm
                  fields={dangerFields}
                  submitText="Удалить аккаунт"
                  validateField={validateSettingsField}
                  onSubmit={async (form) => {
                    await deleteUserRequest({ password: form.password });
                    logout();
                  }}
                />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default memo(SettingsModal);
