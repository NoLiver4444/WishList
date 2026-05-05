/**
 * @file Хук для управления формами в настройках профиля.
 * @module features/account/settings/hooks/useSettingsForm
 */

import { useCallback, useEffect, useState } from 'react';

/**
 * Хук для управления состоянием и валидацией форм настроек.
 * * @example
 * const { form, errors, handleChange, handleSubmit } = useSettingsForm({
 * fields: profileFields,
 * initialValues: { login: 'admin' },
 * validateField: (name, val) => val.length < 3 ? 'Too short' : null,
 * onSubmit: async (data) => await updateProfile(data),
 * });
 */
export const useSettingsForm = ({
  fields,
  onSubmit,
  initialValues,
  validateField,
}) => {
  const [form, setForm] = useState(initialValues || {});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(initialValues || {});
    setErrors({});
  }, [initialValues]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      setForm((prev) => ({ ...prev, [name]: value }));

      if (validateField) {
        const error = validateField(name, value);
        setErrors((prev) => ({
          ...prev,
          [name]: error,
        }));
      }
    },
    [validateField]
  );

  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();

      const newErrors = {};
      let hasError = false;

      fields.forEach((field) => {
        const error = validateField(field.name, form[field.name]);
        if (error) {
          newErrors[field.name] = error;
          hasError = true;
        }
      });

      if (hasError) {
        setErrors(newErrors);
        return;
      }

      await onSubmit(form);
    },
    [form, fields, onSubmit, validateField]
  );

  return {
    form,
    errors,
    handleChange,
    handleSubmit,
  };
};
