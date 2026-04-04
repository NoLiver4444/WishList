import { useState } from 'react';
import styles from './Navigation.module.css'
import { Heart, Home, Users, Calendar, Search, X } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'favorite', label: 'Желания', icon: <Heart size={32} strokeWidth={2} />, style: styles.favorite },
  { id: 'wishlists', label: 'Вишлисты', icon: <Home size={32} strokeWidth={2} />, style: styles.wishlists },
  { id: 'friends', label: 'Друзья', icon: <Users size={32} strokeWidth={2} />, style: styles.friends },
  { id: 'calendar', label: 'Календарь', icon: <Calendar size={32} strokeWidth={2} />, style: styles.calendar },
];

const Navigation = () => {
  const [active, setActive] = useState('wishlists');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log('Ищем:', searchQuery);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closeSearch();
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <nav className={`${styles.navigation} ${isSearchOpen ? styles.expanded : ''}`}>
      <ul className={styles.list}>
        {/* Показываем основные иконки, только если поиск закрыт */}
        {!isSearchOpen && NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <button
              className={`${styles.item} ${active === item.id ? styles.activeItem : ''}`}
              onClick={() => setActive(item.id)}
              data-tooltip={item.label}
            >
              <span className={`${styles.icon} ${item.style}`}>
                {item.icon}
              </span>
            </button>
          </li>
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
            <div className={styles.inputWrapper}>
              <input
                autoFocus
                type="text"
                className={styles.searchInput}
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className={styles.closeButton} onClick={closeSearch}>
                <X size={28} strokeWidth={2} />
              </button>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;