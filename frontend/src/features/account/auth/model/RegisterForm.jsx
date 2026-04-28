/**
 * @file Компонент-обертки над AuthForm для регистрации пользователя.
 * @module features/account/auth/model/RegisterForm
 */

import { AuthForm } from '../ui/AuthForm.jsx';
import { registerFields } from '../config/AuthForm.config.js';
import { validateRegisterField } from '../lib/validate.js';
import { registerRequest, useSessionStore } from '@/entities/session/index.js';

/**
 * Форма регистрации нового пользователя.
 * Использует конфиг `registerFields` и связывает форму с `registerRequest`.
 * @param {Object} props
 * @param {Function} [props.onSuccess] - Callback, вызываемый после успешного создания аккаунта.
 */
export const RegisterForm = ({ onSuccess }) => {
  const addAccount = useSessionStore((s) => s.addAccount);

  return (
    <AuthForm
      fields={registerFields}
      submitText="Зарегистрироваться"
      validateField={validateRegisterField}
      onSubmit={async (form) => {
        const data = await registerRequest(form);

        if (!data.token) {
          throw new Error(data.message || 'Ошибка регистрации');
        }

        addAccount(data.token, data.user);
        onSuccess?.();
      }}
    />
  );
};
