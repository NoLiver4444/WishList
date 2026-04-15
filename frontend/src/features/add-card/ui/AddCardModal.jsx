import { useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { useEscClose } from '@/shared/hooks/useEscClose';
import { useEnterPress } from '@/shared/hooks/useEnterPress';
import { FIELDS } from '../config/AddCardModal.config.js';
import { useAddCardForm } from '../model/useAddCardForm';
import { FormField } from './FormField.jsx';
import styles from './AddCardModal.module.css';

const AddCardModal = ({ isOpen, onClose, onSubmit, type, title }) => {
  const modalRef = useRef(null);
  const fields = useMemo(() => FIELDS[type] ?? FIELDS.wishes, [type]);
  const emptyForm = useMemo(
    () => Object.fromEntries(fields.map((f) => [f.name, ''])),
    [fields]
  );

  const {
    form,
    errors,
    handleChange,
    handleStep,
    handleBlur,
    handleSubmit,
    handleClose,
  } = useAddCardForm({ fields, onSubmit, onClose, emptyForm });

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
            Добавить
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddCardModal;
