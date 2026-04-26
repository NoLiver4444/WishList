import { memo, useRef } from 'react';
import { useSearch } from '@/shared/context/SearchContext';
import Logo from '@/shared/ui/Logo';
import Navigation from '@/shared/ui/Navigation';
import AccountSwitcher from '@/features/account-switch/AccountSwitcher';
import SearchForm from '@/features/search-task/SearchForm';
import ShareButton from '@/features/share-wishlist/index.js';
import styles from './Header.module.css';

const Header = () => {
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const { searchQuery, setSearchQuery } = useSearch();

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    console.log('Поиск:', searchQuery);
  };

  const handleClose = () => {
    setSearchQuery('');
    inputRef.current?.blur();
  };

  return (
    <header className={styles.header}>
      <AccountSwitcher />
      <Logo />
      <Navigation />
      <SearchForm
        ref={searchRef}
        inputRef={inputRef}
        query={searchQuery}
        setQuery={setSearchQuery}
        onSearch={handleSearch}
        onClose={handleClose}
      />
      <ShareButton />
    </header>
  );
};

export default memo(Header);
