/**
 * @file Конфигурация полей для форм авторизации.
 * Описывает структуру данных, которая передается в AuthForm.
 * @module features/account/auth/config
 */

/** * Поля для входа: логин/email и пароль.
 * @type {Array<Object>}
 */
export const loginFields = [
  {
    name: 'login_or_email',
    label: 'Логин или email',
    placeholder: 'bratanchik',
  },
  {
    name: 'password',
    label: 'Пароль',
    placeholder: 'QWERTY',
    type: 'password',
  },
];

/** * Поля для регистрации: логин, email и пароль.
 * @type {Array<Object>}
 */
export const registerFields = [
  { name: 'login', label: 'Логин', placeholder: 'bratanchik' },
  { name: 'email', label: 'Email', placeholder: 'bratanchik@gmail.com' },
  {
    name: 'password',
    label: 'Пароль',
    placeholder: 'QWERTY',
    type: 'password',
  },
];
