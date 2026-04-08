import { useState, useRef } from 'react';
import SearchForm from "@/features/search-task/SearchForm";
import HeaderButton from "@/shared/ui/HeaderButton";
import { NAV_ITEMS } from "./Navigation.config.js";
import { Search } from 'lucide-react';
import {useClickOutside} from "@/shared/hooks/useClickOutside.jsx";
import styles from './Navigation.module.css'

const Navigation = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchRef = useRef(null);
  const searchButtonRef = useRef(null);

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log('Ищем:', searchQuery);
    }
  };

  const toggleSearch = () => {
    if (isSearchOpen) {
      handleSearch();
    } else {
      setIsSearchOpen(true);
    }
  };

  useClickOutside(searchRef, closeSearch, [searchButtonRef])

  return (
    <nav className={`${styles.navigation} ${isSearchOpen ? styles.expanded : ''}`}>
      <ul className={styles.list}>
        {!isSearchOpen && NAV_ITEMS.map((item) => (
          <HeaderButton
            key={item.id}
            item={item}
          />
        ))}

        <li className={`${styles.searchContainer} ${isSearchOpen ? styles.fullWidth : ''}`}>
          <button
            ref={searchButtonRef}
            className={`
              ${styles.item} 
              ${isSearchOpen ? styles.searchActiveMode : ''}
            `}
            data-tooltip={isSearchOpen ? "Выполнить поиск" : "Поиск"}
            onClick={toggleSearch}
          >
            <span className={styles.search}>
                <Search size={32} strokeWidth={2.5} />
            </span>
          </button>

          {isSearchOpen && (
            <SearchForm
              ref={searchRef}
              query={searchQuery}
              setQuery={setSearchQuery}
              onSearch={handleSearch}
              onClose={() => { setIsSearchOpen(false); setSearchQuery(''); }}
            />
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;