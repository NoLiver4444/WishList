import {useCallback, useMemo, useRef, useState} from "react";
import {FIELDS} from "./AddCardModal.config.js";
import {useClickOutside} from "@/shared/hooks/useClickOutside";
import {useEscClose} from "@/shared/hooks/useEscClose";
import {useEnterPress} from "@/shared/hooks/useEnterPress";
import styles from "./AddCardModal.module.css";

const AddCardModal = ({isOpen, onClose, onSubmit, type, title}) => {
  const fields = useMemo(() => FIELDS[type] ?? FIELDS.wishes, [type]);
  const empty = useMemo(() => Object.fromEntries(fields.map((f) => [f.name, ""])), [fields]);

  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const modalRef = useRef(null);

  const validate = useCallback(() => {
    const newErrors = {};
    fields.forEach((field) => {
      const value = form[field.name]?.trim();

      if (field.required && !value) {
        newErrors[field.name] = "Это поле обязательно для заполнения";
      } else if (field.pattern && value && !new RegExp(field.pattern).test(value)) {
        newErrors[field.name] = field.errorText || "Неверный формат";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fields, form]);

  const handleChange = (e) => {
    const {name, value} = e.target;
    setForm((prev) => ({...prev, [name]: value}));
    if (errors[name]) {
      setErrors((prev) => ({...prev, [name]: ""}));
    }
  };

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
  }, [form, onSubmit, validate, empty]);

  useClickOutside(modalRef, handleClose);
  useEscClose(handleClose, isOpen);
  useEnterPress(handleSubmit, isOpen);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div
        ref={modalRef}
        className={styles.modal}
      >
        <h2>{title}</h2>

        <div className={styles.formContent}>
          {fields.map((field) => (
            <div
              key={field.name}
              className={styles.field}
            >
              <label className={styles.label}>
                {field.label} {field.required &&
                <span className={styles.required}>*</span>}
              </label>

              {field.type === "select" ? (
                  <select
                    className={`${styles.input} ${styles.select} ${errors[field.name] ? styles.inputError : ""}`}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                  >
                    <option value="public">{field.placeholder}</option>
                    <option value="private">Приватный</option>
                    <option value="for_friedns">Только друзья</option>
                  </select>
                ) :
                field.as === "textarea" ? (
                  <textarea
                    className={`${styles.input} ${styles.textarea} ${errors[field.name] ? styles.inputError : ""}`}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                  />
                ) : (
                  <input
                    type={field.type || "text"}
                    className={`${styles.input} ${field.isSmall ? styles.inputSmall : ""} ${errors[field.name] ? styles.inputError : ""}`}
                    min={field.min}
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
          <button
            className={styles.cancel}
            onClick={handleClose}
          >
            Отмена
          </button>
          <button
            className={styles.submit}
            onClick={handleSubmit}
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCardModal;