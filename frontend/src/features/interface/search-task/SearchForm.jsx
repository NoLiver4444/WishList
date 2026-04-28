/**
 * @file Форма поиска с управляемым инпутом.
 * @module features/interface/search-task/SearchForm
 */

import { forwardRef, memo } from 'react';
import { Search, X } from 'lucide-react';
import styles from './SearchForm.module.css';

/**
 * Компонент поисковой строки.
 * Использует forwardRef для доступа к контейнеру формы.
 * @param {Object} props
 * @param {string} props.query - Текущее значение поиска.
 * @param {Function} props.setQuery - Функция обновления значения.
 * @param {Function} props.onSearch - Вызывается при нажатии Enter.
 * @param {Function} props.onClose - Вызывается при нажатии Escape или клике на крестик.
 * @param {React.RefObject} props.inputRef - Реф для управления фокусом текстового поля.
 */
const SearchForm = forwardRef(
  ({ query, setQuery, onSearch, onClose, inputRef }, ref) => (
    <div ref={ref} className={styles.inputWrapper} tabIndex={-1}>
      <Search
        size={20}
        style={{ cursor: 'pointer' }}
        onClick={() => inputRef.current?.focus()}
      ></Search>
      <span className={styles['blinking-cursor']}></span>
      <input
        autoFocus
        ref={inputRef}
        type="text"
        className={styles.input}
        placeholder="Введите запрос"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSearch();
          if (e.key === 'Escape') onClose();
        }}
      />
      <X size={20} style={{ cursor: 'pointer' }} onClick={onClose}></X>
    </div>
  )
);

export default memo(SearchForm);
