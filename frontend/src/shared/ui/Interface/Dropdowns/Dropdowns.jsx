/**
 * @file Компоненты конкретных выпадающих меню (Уведомления, Профиль).
 * @module shared/ui/Interface/Dropdowns
 */

import { memo, useState } from 'react';
import { Check, LogOut, Plus, Settings } from 'lucide-react';
import { markAllNotificationsRead, markNotificationRead } from '@/entities/api/notifications.api';
import Avatar from '@/shared/ui/User/Avatar/index';
import { useEscClose } from '@/shared/hooks/useEscClose';
import { useNotifications } from '@/shared/hooks/useNotifications';
import DropdownContainer from './DropdownContainer';
import ThemeSubmenu from '@/features/interface/theme-switch/ThemeSwitcher';
import styles from '@/shared/ui/Interface/Menu/Menu.module.css';

/**
 * Меню уведомлений.
 * Отображает список актуальных событий или заглушку "Пусто".
 * * @component
 * @param {Object} props
 * @param {Function} props.onClose - Функция закрытия.
 */
export const NotificationDropdown = memo(({onClose}) => {
	const {notifications, dismiss} = useNotifications();
	useEscClose(onClose);

	const handleRead = async (id) => {
		await markNotificationRead(id);
		dismiss(id);
	};

	const handleReadAll = async () => {
		await markAllNotificationsRead();
		notifications.forEach(n => dismiss(n.id));
	};

	return (
		<DropdownContainer>
			<p className={styles.dropdownTitle}>Уведомления</p>
			<hr className={styles.divider}/>

			{notifications.length === 0 ? (
				<div className={styles.notificationText}>
					Пока нет новых уведомлений
				</div>
			) : (
				notifications.map(n => (
					<div key={n.id} className={styles.item}>
						<div className={styles.notificationContainer}>
							<span className={styles.notificationTitle}>{n.title}</span>
							<span className={styles.notificationText}>{n.message}</span>
						</div>
						<button
							className={styles.markRead}
							onClick={() => handleRead(n.id)}
						>
							<Check size={16}/>
						</button>
					</div>
				))
			)}

			{notifications.length > 0 && (
				<button className={styles.readAll} onClick={handleReadAll}>
					Прочитать все
				</button>
			)}
		</DropdownContainer>
	);
});

/**
 * Меню профиля и переключения аккаунтов.
 * Содержит информацию о текущем пользователе, настройки темы,
 * список доступных аккаунтов и кнопки выхода/добавления.
 * * @component
 * @param {Object} props
 * @param {Function} props.onClose - Функция закрытия.
 * @param {Object} props.currentUser - Активный профиль.
 * @param {Array<Object>} props.users - Список всех авторизованных аккаунтов.
 * @param {Function} props.onSelectUser - Смена текущего аккаунта.
 * @param {Function} props.onOpenFullProfile - Переход к детальному просмотру профиля.
 * @param {Function} props.onAddAccount - Логика добавления новой сессии.
 * @param {Function} props.onLogout - Завершение сессии.
 */
export const ProfileDropdown = memo(
	({
		 onClose,
		 currentUser,
		 users,
		 onSelectUser,
		 onOpenFullProfile,
		 onAddAccount,
		 onOpenSettings,
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
					<Avatar
						src={currentUser?.avatar_url}
						alt={currentUser?.login}
						size={32}
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

				<button
					className={styles.menuLink}
					onClick={() => {
						onOpenSettings?.();
						onClose();
					}}
				>
					<Settings size={16}/>
					<span>Настройки</span>
				</button>

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
                <Avatar
	                className={styles.switchAccountIcon}
	                src={user?.avatar_url}
	                alt={user?.login}
	                size={32}
                />
                <span className={styles.switchAccountLogin}>{user?.login}</span>
                <span className={styles.switchAccountEmail}>{user?.email}</span>
              </span>
						</button>
					);
				})}
				<hr className={styles.divider}/>

				<button
					className={styles.menuLink}
					onClick={() => {
						onAddAccount?.();
						onClose();
					}}
				>
					<Plus size={16}/>
					<span>Добавить аккаунт</span>
				</button>
				<hr className={styles.divider}/>

				<button
					className={styles.menuLink}
					onClick={() => {
						onLogout?.();
						onClose();
					}}
				>
					<LogOut size={16}/>
					<span>Выйти</span>
				</button>
			</DropdownContainer>
		);
	},
);
