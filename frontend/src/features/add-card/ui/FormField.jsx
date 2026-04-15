import styles from './AddCardModal.module.css';

export const FormField = ({
  field,
  value,
  error,
  onChange,
  onStep,
  onBlur,
}) => {
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
              type="number"
              className={styles.cleanInput}
              name={field.name}
              value={value}
              onChange={onChange}
              min={field.min}
              max={field.max}
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
          />
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
};
