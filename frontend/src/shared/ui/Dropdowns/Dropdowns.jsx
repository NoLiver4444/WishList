import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Check, LogOut, Plus, Settings } from 'lucide-react';
import { useEscClose } from '@/shared/hooks/useEscClose';
import DropdownContainer from './DropdownContainer.jsx';
import ThemeSubmenu from '@/features/theme-switch/ThemeSwitcher';
import styles from '@/shared/ui/Menu/Menu.module.css';

export const NotificationDropdown = ({onClose}) => {
	useEscClose(onClose);

	return (
		<DropdownContainer>
			<p className={styles.dropdownTitle}>Уведомления</p>
			<div className={styles.notificationsSubtitle}>
				Пока нет новых сообщений
			</div>
		</DropdownContainer>
	);
};

export const ProfileDropdown = ({
	                                onClose,
	                                currentUser,
	                                users,
	                                onSelectUser,
	                                onOpenFullProfile,
	                                onAddAccount,
	                                onLogout,
                                }) => {
	useEscClose(onClose);

	const [showThemeSubmenu, setShowThemeSubmenu] = useState(false);

	const handleSelect = (user) => {
		onSelectUser(user);
		onClose();
	};

	return (
		<DropdownContainer>
			<div className={styles.profileData}>
				<img
					className={styles.profileIcon}
					onClick={onOpenFullProfile}
					src={currentUser?.avatarURL}
					alt="Ваша аватарка"
				/>
				<span className={styles.profileInfo}>
          <span
	          className={styles.profileLogin}
	          onClick={onOpenFullProfile}
	          style={{textDecoration: 'none'}}
          >
            {currentUser?.login}
          </span>
          <span className={styles.profileEmail}>{currentUser?.email}</span>
          <span className={styles.viewProfileLabel}>Посмотреть профиль</span>
        </span>
			</div>
			<hr className={styles.divider}/>

			<Link to="/settings" className={styles.menuLink} onClick={onClose}>
				<Settings size={16}/>
				<span>Настройки</span>
			</Link>

			<ThemeSubmenu
				isOpen={showThemeSubmenu}
				onMouseEnter={() => setShowThemeSubmenu(true)}
				onMouseLeave={() => setShowThemeSubmenu(false)}
			/>
			<hr className={styles.divider}/>

			<h3 className={styles.subtitle}>Сменить аккаунт</h3>
			{users?.map((user) => {
				const isSelected = user.id === currentUser?.id;
				return (
					<button
						key={user.id}
						className={styles.menuLink}
						onClick={() => handleSelect(user)}
					>
						{isSelected ? <Check size={16}/> : <div style={{width: 16}}/>}
						<span className={styles.switchAccount}>
              <img
	              className={styles.switchAccountIcon}
	              src={user?.avatarURL}
	              alt=""
              />
              <span className={styles.switchAccountLogin}>{user?.login}</span>
              <span className={styles.switchAccountEmail}>{user?.email}</span>
            </span>
					</button>
				);
			})}
			<hr className={styles.divider}/>

			<button className={styles.menuLink} onClick={() => {
				onAddAccount?.();
				onClose();
			}}>
				<Plus size={16}/>
				<span>Добавить аккаунт</span>
			</button>
			<hr className={styles.divider}/>

			<button className={styles.menuLink} onClick={() => {
				onLogout?.();
				onClose();
			}}>
				<LogOut size={16}/>
				<span>Выйти</span>
			</button>
		</DropdownContainer>
	);
};
