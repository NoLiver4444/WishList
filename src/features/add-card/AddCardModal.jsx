import { useCallback, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FIELDS } from './AddCardModal.config.js';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { useEscClose } from '@/shared/hooks/useEscClose';
import { useEnterPress } from '@/shared/hooks/useEnterPress';
import styles from './AddCardModal.module.css';

const AddCardModal = ({ isOpen, onClose, onSubmit, type, title }) => {
  const fields = useMemo(() => FIELDS[type] ?? FIELDS.wishes, [type]);
  const empty = useMemo(
    () => Object.fromEntries(fields.map((f) => [f.name, ''])),
    [fields]
  );

  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const modalRef = useRef(null);

  const validate = useCallback(() => {
    const newErrors = {};
    fields.forEach((field) => {
      const value = form[field.name];
      const trimmedValue = typeof value === 'string' ? value.trim() : value;

      if (field.required && !trimmedValue && trimmedValue !== 0) {
        newErrors[field.name] = 'Это поле обязательно для заполнения';
        return;
      }

      if (!trimmedValue && trimmedValue !== 0) return;

      if (field.type === 'number') {
        const num = Number(trimmedValue);
        if (field.min !== undefined && num < field.min) {
          newErrors[field.name] = `Минимум: ${field.min}`;
        } else if (field.max !== undefined && num > field.max) {
          newErrors[field.name] = `Максимум: ${field.max}`;
        }
      }

      if (field.type === 'date') {
        if (field.min && trimmedValue < field.min) {
          newErrors[field.name] = `Дата не может быть раньше ${field.min}`;
        } else if (field.max && trimmedValue > field.max) {
          newErrors[field.name] = `Дата не может быть позже ${field.max}`;
        }
      }

      if (field.pattern && !new RegExp(field.pattern).test(trimmedValue)) {
        newErrors[field.name] = field.errorText || 'Неверный формат';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fields, form]);

  const handleChange = useCallback(
    (e) => {
      const { name, value, type } = e.target;
      let finalValue = value;

      if (type === 'number') {
        finalValue = value.replace(/\D/g, '');
      }

      setForm((prev) => ({
        ...prev,
        [name]: finalValue,
      }));

      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    },
    [errors]
  );

  const handleClose = useCallback(() => {
    setErrors({});
    setForm(empty);
    onClose();
  }, [onClose, empty]);

  const handleSubmit = useCallback(() => {
    if (validate()) {
      onSubmit(form);
      handleClose();
    }
  }, [form, onSubmit, validate, handleClose]);

  const handleNumberKeyPress = useCallback((e) => {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
    ];

    if (allowedKeys.includes(e.key)) return;

    if (!/\d/.test(e.key)) {
      e.preventDefault();
    }
  }, []);

  const handleStep = useCallback(
    (name, step) => {
      const currentValue = Number(form[name]) || 0;
      const fieldConfig = fields.find((f) => f.name === name);
      const newValue = currentValue + step;

      if (fieldConfig.min !== undefined && newValue < fieldConfig.min) return;
      if (fieldConfig.max !== undefined && newValue > fieldConfig.max) return;

      setForm({
        ...form,
        [name]: newValue,
      });
    },
    [fields, form]
  );

  const handleBlur = (e) => {
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
  };

  useClickOutside(modalRef, handleClose);
  useEscClose(handleClose, isOpen);
  useEnterPress(handleSubmit, isOpen);

  if (!isOpen) return null;

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        ref={modalRef}
        className={styles.modal}
        initial={{ scale: 0.9, opacity: 0, y: -100 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 100 }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300,
        }}
      >
        <h2>{title}</h2>

        <div className={styles.formContent}>
          {fields.map((field) => (
            <div key={field.name} className={styles.field}>
              <label className={styles.label}>
                {field.label}{' '}
                {field.required && <span className={styles.required}>*</span>}
              </label>

              {field.type === 'select' ? (
                <select
                  className={`${styles.input} ${styles.select} ${errors[field.name] ? styles.inputError : ''}`}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                >
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  className={`${styles.input} ${styles.textarea} ${errors[field.name] ? styles.inputError : ''}`}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                />
              ) : field.type === 'number' ? (
                <div
                  className={`${styles.numberContainer} ${errors[field.name] ? styles.inputError : ''}`}
                >
                  <input
                    type="number"
                    className={styles.cleanInput}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    onKeyDown={handleNumberKeyPress}
                    min={field.min}
                    max={field.max}
                  />
                  <button
                    type="button"
                    onClick={() => handleStep(field.name, -1)}
                    className={styles.stepButton}
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStep(field.name, 1)}
                    className={styles.stepButton}
                  >
                    +
                  </button>
                </div>
              ) : field.type === 'date' ? (
                <input
                  type="date"
                  className={styles.dateInput}
                  name={field.name}
                  value={form[field.name]}
                  min={field.min}
                  max={field.max}
                  onBlur={handleBlur}
                  onClick={(e) => {
                    e.target.showPicker();
                  }}
                  placeholder={field.placeholder}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  className={`${styles.input} ${field.isSmall ? styles.inputSmall : ''} ${errors[field.name] ? styles.inputError : ''}`}
                  min={field.min}
                  max={field.max}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                />
              )}

              {errors[field.name] && (
                <span className={styles.errorText}>{errors[field.name]}</span>
              )}
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button className={styles.cancel} onClick={handleClose}>
            Отмена
          </button>
          <button className={styles.submit} onClick={handleSubmit}>
            Добавить
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddCardModal;
