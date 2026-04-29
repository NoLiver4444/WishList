/**
 * @file Модальное окно настроек профиля и безопасности.
 * @module features/account/settings/ui/SettingsModal
 */

import { memo, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, X } from 'lucide-react';
import { useClickOutside } from '@/shared/hooks/useClickOutside.jsx';
import { useEscClose } from '@/shared/hooks/useEscClose.jsx';
import { useSessionStore } from '@/entities/session/index.js';
import { uploadImage } from '@/shared/lib/uploadImage.js';
import { validateSettingsField } from '../lib/validate.js';
import { deleteUserRequest, updateUserRequest } from '../api/settingsApi.js';
import {
  dangerFields,
  getProfileFields,
  passwordFields,
} from '../config/SettingsForm.config.js';
import { useSettingsForm } from '@/features/account/settings/model/useSettingsForm.jsx';
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

  const currentConfig = useMemo(() => {
    switch (tab) {
      case 'password':
        return {
          fields: passwordFields,
          initial: { current_password: '', new_password: '' },
          submit: async (form) => {
            await updateUserRequest({ password: form.new_password });
            onClose();
          },
        };
      case 'danger':
        return {
          fields: dangerFields,
          initial: { password: '' },
          submit: async (form) => {
            await deleteUserRequest({ password: form.password });
            logout();
          },
        };
      default:
        return {
          fields: profileFields,
          initial: {
            login: currentUser?.login || '',
            email: currentUser?.email || '',
            phone: currentUser?.phone || '',
            birthday: currentUser?.birthday
              ? currentUser.birthday.split('T')[0]
              : '',
          },
          submit: async (formData) => {
            const updated = await updateUserRequest({
              login: formData.login || undefined,
              email: formData.email || undefined,
              phone: formData.phone || undefined,
              ...(formData.birthday ? { birthday: formData.birthday } : {}),
            });
            updateUser(updated);
            onClose();
          },
        };
    }
  }, [tab, currentUser, onClose, updateUser, logout, profileFields]);

  useClickOutside([modalRef], onClose);
  useEscClose(onClose, isOpen);

  const { form, errors, handleChange, handleSubmit } = useSettingsForm({
    fields: currentConfig.fields,
    initialValues: currentConfig.initial,
    validateField: validateSettingsField,
    onSubmit: currentConfig.submit,
  });

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
            <form onSubmit={handleSubmit} className={styles.content}>
              {currentConfig.fields.map((field) => (
                <div key={field.name} className={styles.field}>
                  <label className={styles.label}>{field.label}</label>
                  <input
                    className={`${styles.input} ${errors[field.name] ? styles.inputError : ''}`}
                    name={field.name}
                    type={field.type}
                    value={form[field.name] || ''}
                    placeholder={field.placeholder}
                    onChange={handleChange}
                    min={field.min}
                    max={field.max}
                  />
                  {errors[field.name] && (
                    <span className={styles.errorText}>
                      {errors[field.name]}
                    </span>
                  )}
                </div>
              ))}

              <button type="submit" className={styles.submit}>
                {tab === 'profile'
                  ? 'Сохранить'
                  : tab === 'password'
                    ? 'Сменить пароль'
                    : 'Удалить'}
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default memo(SettingsModal);
