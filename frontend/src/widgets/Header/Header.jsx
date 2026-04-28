/**
 * @file Компонент шапки сайта.
 * Содержит навигацию, поиск, переключатель аккаунтов и кнопку "поделиться".
 * @module widgets/Header
 */

import { memo, useRef } from 'react';
import { useSearch } from '@/shared/hooks/useSearch.js';
import Logo from '@/shared/ui/Interface/Logo';
import Navigation from '@/shared/ui/Interface/Navigation';
import AccountSwitcher from '@/features/account/account-switch/AccountSwitcher';
import SearchForm from '@/features/interface/search-task/SearchForm';
import ShareButton from '@/features/interface/share-wishlist/index.js';
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
