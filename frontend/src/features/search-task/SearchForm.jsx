import React, { forwardRef } from "react";
import { X } from 'lucide-react';
import styles from '@/entities/ui/Navigation/Navigation.module.css'

const SearchForm = forwardRef(({ query, setQuery, onSearch, onClose }, ref) => (
  <div ref={ref} className={styles.inputWrapper}>
    <input
      autoFocus
      type="text"
      className={styles.searchInput}
      placeholder="Поиск..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSearch();
        if (e.key === 'Escape') onClose();
      }}
    />
    <button className={styles.closeButton} onClick={onClose}>
      <X size={32} strokeWidth={2} />
    </button>
  </div>
));

export default SearchForm;