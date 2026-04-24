import { AuthForm } from './ui/AuthForm';
import { loginFields } from './config/AuthForm.config.js';
import { validateLoginField } from './lib/validate';
import { loginRequest, useSessionStore } from '@/entities/session';

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
