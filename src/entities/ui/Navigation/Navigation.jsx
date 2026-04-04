import { useState, useRef } from 'react';
import SearchForm from "@/features/search-task/SearchForm";
import HeaderButton from "@/shared/ui/HeaderButton";
import { NAV_ITEMS } from "./Navigation.config.js";
import { Search } from 'lucide-react';
import styles from './Navigation.module.css'
import {useClickOutside} from "@/shared/hooks/useClickOutside.jsx";

const Navigation = () => {
  const [active, setActive] = useState('wishlists');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchRef = useRef(null);

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log('Ищем:', searchQuery);
    }
  };

  useClickOutside(searchRef, closeSearch)

  return (
    <nav className={`${styles.navigation} ${isSearchOpen ? styles.expanded : ''}`}>
      <ul className={styles.list}>
        {!isSearchOpen && NAV_ITEMS.map((item) => (
          <HeaderButton
            key={item.id}
            item={item}
            isActive={active === item.id}
            onClick={setActive}
          />
        ))}

        <li className={`${styles.searchContainer} ${isSearchOpen ? styles.fullWidth : ''}`}>
          <button
            className={`
              ${styles.item} 
              ${isSearchOpen ? styles.searchActiveMode : ''} 
              ${active === 'search' || isSearchOpen ? styles.activeSearch : ''}
            `}
            data-tooltip={'Поиск'}
            onClick={() => isSearchOpen ? handleSearch() :setIsSearchOpen(true)}
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