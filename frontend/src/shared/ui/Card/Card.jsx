import { ArrowRight, Ellipsis, Plus } from 'lucide-react';
import { FriendHeader, WishHeader, WishlistHeader } from './CardHeaders';
import Avatar from '@/shared/ui/Avatar';
import styles from './Card.module.css';

const Card = ({item, onMenuClick, onAddWish, type}) => {
	const cardWish = type === 'wishes';
	const cardWishlist = type === 'wishlists';
	const cardFriend = type === 'friends';

	const {name, date, price, image, imageUrl, url, description, counts, friendId, previewImage} = item;

	const dateOptions = {year: 'numeric', month: 'long', day: 'numeric'};
	const resolvedImage = image instanceof File
		? URL.createObjectURL(image)
		: (imageUrl || null);

	const headers = {
		wishes: <WishHeader name={name} date={date} dateOptions={dateOptions}/>,
		wishlists: <WishlistHeader name={name} date={date} counts={counts} dateOptions={dateOptions}/>,
		friends: <FriendHeader name={name} friendId={friendId}/>,
	};

	return (
		<li className={`${styles.card} ${styles[type]}`}>
			<div className={styles.header}>
				{headers[type]}

				<button onClick={onMenuClick} className={styles.menuButton}>
					<Ellipsis className="icon" size={20} strokeWidth={2}/>
				</button>
			</div>

			<div className={styles.body}>
				{cardWish && (
					<div className={styles.imageWrapper}>
						{resolvedImage
							? <img src={resolvedImage} alt={name} className={styles.image}/>
							: <div className={styles.imagePlaceholder}/>
						}
					</div>
				)}

				{description && (
					<p className={styles.description}>{description}</p>
				)}

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
								Перейти <ArrowRight size={14}/>
							</a>
						)}
					</div>
				)}

				{cardWishlist && (
					<div className={styles.wishlistBody}>
						{previewImage
							? <img src={previewImage} alt={name} className={styles.image}/>
							: counts === 0
								? (
									<button className={styles.addWish} onClick={onAddWish}>
										<Plus size={32} strokeWidth={1.5}/>
										<span>Добавить желание</span>
									</button>
								)
								: <div className={styles.imagePlaceholder}/>
						}
					</div>
				)}

				{cardFriend && (
					<div className={styles.friendBody}>
						<Avatar
							src={item.avatarUrl}
							alt={name}
							size={80}
						/>
					</div>
				)}
			</div>
		</li>
	);
};

export default Card;
