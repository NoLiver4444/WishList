import { useRef, useState } from 'react';
import Logo from '../../shared/ui/Logo/index.js';
import Navigation from '../../shared/ui/Navigation/index.js';
import AccountSwitcher from '../../features/account-switch/AccountSwitcher.jsx';
import SearchForm from '../../features/search-task/SearchForm.jsx';
import ShareButton from '../../shared/ui/ShareButton/index.js';
import styles from './Header.module.css';

const Header = () => {
	const [query, setQuery] = useState('');
	const searchRef = useRef(null);
	const inputRef = useRef(null);

	const handleSearch = () => {
		if (!query.trim()) return;
		console.log('Поиск:', query);
	};

	const handleClose = () => {
		setQuery('');
		inputRef.current?.blur();
	};

	return (
		<header className={styles.header}>
			<AccountSwitcher/>
			<Logo/>
			<Navigation/>
			<SearchForm
				ref={searchRef}
				inputRef={inputRef}
				query={query}
				setQuery={setQuery}
				onSearch={handleSearch}
				onClose={handleClose}
			/>
			<ShareButton/>
		</header>
	);
};

export default Header;
