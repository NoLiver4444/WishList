/**
 * @file Универсальная модалка для создания и редактирования сущностей (желания, вишлисты).
 * @module features/cards/add-card/ui/AddCardModal
 */

import { memo, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useClickOutside } from '@/shared/hooks/useClickOutside.jsx';
import { useEscClose } from '@/shared/hooks/useEscClose.jsx';
import { useEnterPress } from '@/shared/hooks/useEnterPress.jsx';
import { FIELDS } from '../config/AddCardModal.config.js';
import { useAddCardForm } from '../model/useAddCardForm.jsx';
import { FormField } from './FormField.jsx';
import styles from './AddCardModal.module.css';

/**
 * Компонент AddCardModal.
 * Автоматически строит форму на основе переданного типа.
 * @param {Object} props
 * @param {boolean} props.isOpen - Состояние видимости.
 * @param {Function} props.onClose - Закрытие модалки.
 * @param {Function} props.onSubmit - Отправка данных.
 * @param {'wishes'|'wishlists'} props.type - Тип формы, определяющий набор полей.
 * @param {string} props.title - Заголовок модального окна.
 * @param {Object} [props.initialValues] - Данные для предзаполнения (при редактировании).
 */
const AddCardModal = ({
  isOpen,
  onClose,
  onSubmit,
  type,
  title,
  initialValues,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef(null);
  const fields = useMemo(() => FIELDS[type] ?? FIELDS.wishes, [type]);

  const emptyForm = useMemo(
    () => Object.fromEntries(fields.map((f) => [f.name, ''])),
    [fields]
  );
  const defaultForm = useMemo(
    () => (initialValues ? { ...emptyForm, ...initialValues } : emptyForm),
    [emptyForm, initialValues]
  );

  const handleSubmitWithLoading = async (formData) => {
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  const {
    form,
    errors,
    handleChange,
    handleStep,
    handleBlur,
    handleSubmit,
    handleClose,
  } = useAddCardForm({
    fields,
    onSubmit: handleSubmitWithLoading,
    onClose,
    emptyForm: defaultForm,
  });

  useClickOutside(modalRef, handleClose);
  useEscClose(handleClose, isOpen);
  useEnterPress(handleSubmit, isOpen);

  if (!isOpen) return null;

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        ref={modalRef}
        className={styles.modal}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <h2>{title}</h2>

        <div className={styles.formContent}>
          {fields.map((field) => (
            <FormField
              key={field.name}
              field={field}
              value={form[field.name]}
              error={errors[field.name]}
              onChange={handleChange}
              onStep={handleStep}
              onBlur={handleBlur}
            />
          ))}
        </div>

        <div className={styles.actions}>
          <button className={styles.cancel} onClick={handleClose}>
            Отмена
          </button>
          <button className={styles.submit} onClick={handleSubmit}>
            {submitting
              ? 'Загрузка...'
              : initialValues
                ? 'Сохранить'
                : 'Добавить'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default memo(AddCardModal);
