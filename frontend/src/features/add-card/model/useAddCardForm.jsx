import { useCallback, useState } from 'react';
import { validate } from '../lib/validate.js';

export const useAddCardForm = ({ fields, onSubmit, onClose, emptyForm }) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback(
    (e) => {
      const { name, value, files, type } = e.target;

      if (type === 'file') {
        const file = files?.[0] ?? null;
        setForm((prev) => ({ ...prev, image: file, imageUrl: '' })); // сбрасываем ссылку
        return;
      }

      if (name === 'imageUrl') {
        setForm((prev) => {
          const newForm = { ...prev, imageUrl: value, image: '' }; // сбрасываем файл
          const field = fields.find((f) => f.name === name);
          const fieldError = validate([field], newForm);
          setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: fieldError[name],
          }));
          return newForm;
        });
        return;
      }

      setForm((prev) => {
        const newForm = { ...prev, [name]: value };

        const field = fields.find((f) => f.name === name);
        const fieldError = validate([field], newForm);

        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: fieldError[name],
        }));

        return newForm;
      });
    },
    [fields]
  );

  const handleStep = useCallback(
    (name, step) => {
      const currentValue = Number(form[name]) || 0;
      const fieldConfig = fields.find((f) => f.name === name);
      const newValue = currentValue + step;

      if (fieldConfig.min !== undefined && newValue < fieldConfig.min) return;
      if (fieldConfig.max !== undefined && newValue > fieldConfig.max) return;

      setForm((prev) => ({ ...prev, [name]: newValue }));
    },
    [fields, form]
  );

  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      const field = fields.find((f) => f.name === name);
      if (!field || !value) return;

      if (field.type === 'date') {
        if (field.min && value < field.min) {
          setForm((prev) => ({ ...prev, [name]: field.min }));
        } else if (field.max && value > field.max) {
          setForm((prev) => ({ ...prev, [name]: field.max }));
        }
      }
    },
    [fields]
  );

  const handleClose = useCallback(() => {
    setErrors({});
    setForm(emptyForm);
    onClose();
  }, [onClose, emptyForm]);

  const handleSubmit = useCallback(() => {
    const validationErrors = validate(fields, form);
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(form);
      handleClose();
    } else {
      setErrors(validationErrors);
    }
  }, [form, fields, onSubmit, handleClose]);

  return {
    form,
    errors,
    handleChange,
    handleStep,
    handleBlur,
    handleSubmit,
    handleClose,
  };
};
