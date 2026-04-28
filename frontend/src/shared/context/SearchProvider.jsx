/**
 * @file Провайдер глобального состояния поиска.
 * @module shared/context/SearchProvider
 */

import { useState } from 'react';
import { SearchContext } from './SearchContext.jsx';

/**
 * Провайдер состояния поиска.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Дочерние компоненты.
 */

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </SearchContext.Provider>
  );
};
