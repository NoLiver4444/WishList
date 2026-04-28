/**
 * @file Хук доступа к контексту поиска.
 * @module shared/hooks/useSearch
 */

import { useContext } from 'react';
import { SearchContext } from '../context/SearchContext.jsx';

/**
 * Хук для доступа к состоянию поиска.
 * @returns {{
 *   searchQuery: string,
 *   setSearchQuery: function
 * }}
 */

export const useSearch = () => useContext(SearchContext);
