/**
 * @file Конфигурация полей для форм в настройках профиля.
 * Содержит наборы полей для редактирования профиля, смены пароля и удаления аккаунта.
 * @module features/account/settings/config
 */

import { useSessionStore } from '@/entities/session/index.js';

/**
 * Возвращает набор полей для редактирования основной информации профиля.
 * Значения placeholder заполняются текущими данными пользователя из store.
 * @function getProfileFields
 * @returns {Array<Object>} Массив конфигураций полей формы.
 * @property {string} name - Ключ поля в объекте состояния формы.
 * @property {string} label - Отображаемое название поля.
 * @property {string} [placeholder] - Текущее значение пользователя, отображаемое как подсказка.
 */
export const getProfileFields = () => {
  const currentUser =
    useSessionStore.getState().accounts[useSessionStore.getState().activeIndex]
      ?.user;

  return [
    {
      name: 'login',
      label: 'Логин',
      placeholder: currentUser?.login,
    },
    {
      name: 'email',
      label: 'Email',
      placeholder: currentUser?.email,
    },
    {
      name: 'phone',
      label: 'Телефон',
      placeholder: currentUser?.phone ?? '+7...',
    },
  ];
};

/**
 * Поля для формы смены пароля.
 * @type {Array<Object>}
 */
export const passwordFields = [
  {
    name: 'current_password',
    label: 'Текущий пароль',
    type: 'password',
    placeholder: '••••••',
  },
  {
    name: 'new_password',
    label: 'Новый пароль',
    type: 'password',
    placeholder: '••••••',
  },
];

/**
 * Поля для подтверждения удаления аккаунта.
 * @type {Array<Object>}
 */
export const dangerFields = [
  {
    name: 'password',
    label: 'Подтвердите пароль',
    type: 'password',
    placeholder: '••••••',
  },
];
