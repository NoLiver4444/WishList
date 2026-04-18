import { UserRound } from 'lucide-react';
import styles from './Avatar.module.css';

const Avatar = ({src, alt, size = 32}) => {
	if (src) {
		return (
			<img
				src={src}
				alt={alt ?? 'аватар'}
				className={styles.avatar}
				style={{width: size, height: size}}
			/>
		);
	}

	return (
		<div className={styles.placeholder} style={{width: size, height: size}}>
			<UserRound size={size * 0.6}/>
		</div>
	);
};

export default Avatar;