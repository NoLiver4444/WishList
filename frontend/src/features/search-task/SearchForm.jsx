import { forwardRef, memo } from 'react';
import { Search, X } from 'lucide-react';
import styles from './SearchForm.module.css';

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
