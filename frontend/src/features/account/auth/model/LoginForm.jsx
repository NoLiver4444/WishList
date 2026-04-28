/**
 * @file Компонент-обертки над AuthForm для авторизации пользователя.
 * @module features/account/auth/model/LoginForm
 */

import { AuthForm } from '../ui/AuthForm.jsx';
import { loginFields } from '../config/AuthForm.config.js';
import { validateLoginField } from '../lib/validate.js';
import { loginRequest, useSessionStore } from '@/entities/session/index.js';

/**
 * Форма входа в систему.
 * Использует конфиг `loginFields` и связывает форму с `loginRequest`.
 * @param {Object} props
 * @param {Function} [props.onSuccess] - Callback, вызываемый после успешного входа и добавления аккаунта в стор.
 */
export const LoginForm = ({ onSuccess }) => {
  const addAccount = useSessionStore((s) => s.addAccount);

  return (
    <AuthForm
      fields={loginFields}
      submitText="Войти"
      validateField={validateLoginField}
      onSubmit={async (form) => {
        const data = await loginRequest(form);

        if (!data.token) {
          throw new Error(data.message || 'Неверный логин или пароль');
        }

        addAccount(data.token, data.user);
        onSuccess?.();
      }}
    />
  );
};
