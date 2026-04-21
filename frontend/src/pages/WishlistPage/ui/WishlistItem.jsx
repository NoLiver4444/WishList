import { Bookmark, BookmarkCheck, Trash2 } from 'lucide-react';
import styles from './WishlistPage.module.css';

const WishlistItem = ({item, onRemove, onReserve}) => {
	const {product, comment, is_reserved} = item;

	return (
		<li className={styles.item}>
			{product?.image_url && (
				<img
					src={product.image_url}
					alt={product.title}
					className={styles.itemImage}
				/>
			)}

			<div className={styles.itemBody}>
				<h3 className={styles.itemTitle}>{product?.title}</h3>

				{comment && (
					<p className={styles.itemComment}>{comment}</p>
				)}

				{product?.price && (
					<span className={styles.itemPrice}>
            {Number(product.price).toLocaleString('ru-RU')} ₽
          </span>
				)}

				{product?.url && (
					<a
						href={product?.url}
						target="_blank"
						rel="noopener noreferrer"
						className={styles.itemLink}
					>
						Перейти →
					</a>
				)}
			</div>

			<div className={styles.itemActions}>
				<button
					className={`${styles.reserveButton} ${is_reserved ? styles.reserved : ''}`}
					onClick={() => onReserve(item.id, is_reserved)}
					title={is_reserved ? 'Снять резерв' : 'Зарезервировать'}
				>
					{is_reserved ? <BookmarkCheck size={18}/> : <Bookmark size={18}/>}
				</button>

				<button
					className={styles.removeButton}
					onClick={() => onRemove(item.id)}
					title="Удалить"
				>
					<Trash2 size={18}/>
				</button>
			</div>
		</li>
	);
};

export default WishlistItem;