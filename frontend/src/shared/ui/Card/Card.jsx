import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ellipsis, Plus } from 'lucide-react';
import { FriendHeader, WishHeader, WishlistHeader } from './CardHeaders';
import Avatar from '@/shared/ui/Avatar';
import CardMenu from '@/shared/ui/CardMenu';
import styles from './Card.module.css';

const Card = ({item, type, onAddWish, onEdit, onDelete}) => {
	const [menuOpen, setMenuOpen] = useState(false);
	const navigate = useNavigate();

	const cardWish = type === 'wishes';
	const cardWishlist = type === 'wishlists';
	const cardFriend = type === 'friends';

	const {
		name,
		date,
		price,
		image,
		imageUrl,
		url,
		description,
		counts,
		friendId,
		previewImage,
	} = item;

	const dateOptions = {year: 'numeric', month: 'long', day: 'numeric'};
	const resolvedImage =
		image instanceof File ? URL.createObjectURL(image) : imageUrl || null;

	const handleCardClick = (e) => {
		if (e.target.closest(`.${styles.menuButton}`)) return;
		if (cardWishlist) navigate(`/wishlists/${item.id}`);
	};

	const handleAction = (action) => {
		if (action === 'view') navigate(`/wishlists/${item.id}`);
		if (action === 'edit') onEdit?.(item);
		if (action === 'delete') onDelete?.(item.id);
	};

	return (
		<li
			className={`${styles.card} ${styles[type]}`}
			onClick={handleCardClick}
			style={{cursor: cardWishlist ? 'pointer' : 'default'}}
		>
			<div className={styles.header}>
				{cardWish && <WishHeader name={name} date={date} dateOptions={dateOptions}/>}
				{cardWishlist && <WishlistHeader name={name} date={date} counts={counts} dateOptions={dateOptions}/>}
				{cardFriend && <FriendHeader name={name} friendId={friendId}/>}

				<div className={styles.menuWrapper}>
					<button
						className={styles.menuButton}
						onClick={e => {
							e.stopPropagation();
							setMenuOpen(v => !v);
						}}
					>
						<Ellipsis size={20} strokeWidth={2}/>
					</button>
					<CardMenu
						type={type}
						isOpen={menuOpen}
						onClose={() => setMenuOpen(false)}
						onAction={handleAction}
					/>
				</div>
			</div>

			<div className={styles.body}>
				{cardWish && (
					<div className={styles.imageWrapper}>
						{resolvedImage ? (
							<img src={resolvedImage} alt={name} className={styles.image}/>
						) : (
							<div className={styles.imagePlaceholder}/>
						)}
					</div>
				)}

				{description && <p className={styles.description}>{description}</p>}

				{cardWish && price !== undefined && (
					<div className={styles.priceRow}>
            <span className={styles.price}>
              {Number(price).toLocaleString('ru-RU')} ₽
            </span>
						{url && (
							<a
								href={url}
								target="_blank"
								rel="noopener noreferrer"
								className={styles.link}
							>
								Перейти
							</a>
						)}
					</div>
				)}

				{cardWishlist && (
					<div className={styles.wishlistBody}>
						{previewImage ? (
							<img src={previewImage} alt={name} className={styles.image}/>
						) : counts === 0 ? (
							<button className={styles.addWish} onClick={onAddWish}>
								<Plus size={32} strokeWidth={1.5}/>
								<span>Добавить желание</span>
							</button>
						) : (
							<div className={styles.imagePlaceholder}/>
						)}
					</div>
				)}

				{cardFriend && (
					<div className={styles.friendBody}>
						<Avatar src={item.avatarUrl} alt={name} size={80}/>
					</div>
				)}
			</div>
		</li>
	);
};

export default Card;
