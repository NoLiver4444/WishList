import { AuthForm } from './ui/AuthForm';
import { registerFields } from './config/AuthForm.config.js';
import { validateRegisterField } from './lib/validate';
import { registerRequest, useSessionStore } from '@/entities/session';

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
