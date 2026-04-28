import { memo } from 'react';
import styles from './AddCardModal.module.css';

export const FormField = memo(
  ({ field, value, error, onChange, onStep, onBlur }) => {
    const isError = !!error;

    const renderInput = () => {
      switch (field.type) {
        case 'select':
          return (
            <select
              className={`${styles.input} ${styles.select} ${isError ? styles.inputError : ''}`}
              name={field.name}
              value={value}
              onChange={onChange}
            >
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        case 'number':
          return (
            <div
              className={`${styles.numberContainer} ${isError ? styles.inputError : ''}`}
            >
              <input
                type="text"
                inputMode="numeric"
                className={styles.cleanInput}
                name={field.name}
                value={value}
                placeholder={field.placeholder}
                onChange={(e) => {
                  let value = e.target.value;

                  value = value.replace(/\D/g, '');

                  onChange({
                    target: {
                      name: field.name,
                      value,
                    },
                  });
                }}
                min={field.min}
                max={field.max}
                onKeyDown={(e) => {
                  if (
                    ['e', 'E', '+', '-', '.'].includes(e.key) &&
                    field.type === 'number'
                  ) {
                    e.preventDefault();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => onStep(field.name, -1)}
                className={styles.stepButton}
              >
                −
              </button>
              <button
                type="button"
                onClick={() => onStep(field.name, 1)}
                className={styles.stepButton}
              >
                +
              </button>
            </div>
          );
        case 'date':
          return (
            <input
              type="date"
              className={`${styles.dateInput} ${isError ? styles.inputError : ''}`}
              name={field.name}
              value={value}
              min={field.min}
              max={field.max}
              onBlur={onBlur}
              onClick={(e) => e.target.showPicker()}
              onChange={onChange}
            />
          );
        case 'file':
          return (
            <div className={styles.fileWrapper}>
              {value && (
                <img
                  src={
                    typeof value === 'string'
                      ? value
                      : URL.createObjectURL(value)
                  }
                  alt="превью"
                  className={styles.filePreview}
                />
              )}
              <label
                className={`${styles.fileLabel} ${isError ? styles.inputError : ''}`}
              >
                {value ? 'Изменить фото' : 'Выбрать файл'}
                <input
                  type="file"
                  accept={field.accept ?? 'image/*'}
                  className={styles.fileInput}
                  name={field.name}
                  onChange={onChange}
                />
              </label>
            </div>
          );
        default:
          return (
            <input
              type={field.type || 'text'}
              className={`${styles.input} ${field.isSmall ? styles.inputSmall : ''} ${isError ? styles.inputError : ''}`}
              name={field.name}
              value={value}
              onChange={onChange}
              placeholder={field.placeholder}
            />
          );
      }
    };

    return (
      <div className={styles.field}>
        <label className={styles.label}>
          {field.label}{' '}
          {field.required && <span className={styles.required}>*</span>}
        </label>
        {renderInput()}
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  }
);
