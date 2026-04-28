/**
 * @file Универсальный компонент формы для авторизации и настроек профиля.
 * @module features/account/auth/ui/AuthForm
 */

import { memo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './AuthForm.module.css';

/**
 * Рендерит форму с поддержкой различных типов полей (текст, пароль),
 * управлением состоянием, валидацией при размытии (blur) и обработкой ошибок сервера.
 * * @component
 * @param {Object} props
 * @param {Array<Object>} props.fields - Массив объектов конфигурации полей (name, label, type, placeholder).
 * @param {Function} props.onSubmit - Асинхронный обработчик отправки формы.
 * @param {string} props.submitText - Текст на кнопке действия.
 * @param {Function} [props.validateField] - Функция для валидации отдельного поля (возвращает строку ошибки или null).
 * @returns {React.ReactElement}
 */
export const AuthForm = memo(
  ({ fields, onSubmit, submitText, validateField }) => {
    const [form, setForm] = useState(() =>
      Object.fromEntries(fields.map((f) => [f.name, '']))
    );

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (name, value) => {
      setForm((f) => ({ ...f, [name]: value }));
      setErrors((e) => ({ ...e, [name]: null }));
    };

    const handleBlur = (name) => {
      const error = validateField?.(name, form[name]);
      setErrors((e) => ({ ...e, [name]: error }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      const newErrors = {};
      fields.forEach((f) => {
        const err = validateField?.(f.name, form[f.name]);
        if (err) newErrors[f.name] = err;
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setErrors({});
      setLoading(true);

      try {
        await onSubmit(form);
      } catch (err) {
        setErrors({ form: err.message || 'Ошибка' });
      } finally {
        setLoading(false);
      }
    };

    return (
      <form className={styles.form} onSubmit={handleSubmit}>
        {fields.map((field) => {
          const isPassword = field.type === 'password';

          return (
            <div className={styles.field} key={field.name}>
              <label className={styles.label}>{field.label}</label>

              {!isPassword && (
                <input
                  className={`${styles.input} ${
                    errors[field.name] ? styles.inputError : ''
                  }`}
                  type={field.type || 'text'}
                  value={form[field.name]}
                  placeholder={field.placeholder}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  onBlur={() => handleBlur(field.name)}
                />
              )}

              {isPassword && (
                <div
                  className={`${styles.passwordInfo} ${
                    errors[field.name] ? styles.inputError : ''
                  }`}
                >
                  <input
                    className={styles.passwordInput}
                    type={showPassword ? 'text' : 'password'}
                    value={form[field.name]}
                    placeholder={field.placeholder}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    onBlur={() => handleBlur(field.name)}
                  />

                  <button
                    type="button"
                    className={styles.passwordButton}
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    {showPassword ? (
                      <Eye size={16}></Eye>
                    ) : (
                      <EyeOff size={16}></EyeOff>
                    )}
                  </button>
                </div>
              )}

              {errors[field.name] && (
                <p className={styles.fieldError}>{errors[field.name]}</p>
              )}
            </div>
          );
        })}

        {errors.form && <p className={styles.error}>{errors.form}</p>}

        <button
          className={styles.button}
          type="submit"
          disabled={loading || fields.some((f) => !form[f.name])}
        >
          {loading ? 'Загрузка...' : submitText}
        </button>
      </form>
    );
  }
);
