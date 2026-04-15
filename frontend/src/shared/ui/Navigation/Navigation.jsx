import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NAV_ITEMS } from './config/Navigation.config.js';
import HeaderButton from '../HeaderButton/index.js';
import styles from './Navigation.module.css';

const Navigation = () => {
	const location = useLocation();
	const [capsule, setCapsule] = useState({left: 0, width: 0});
	const itemRefs = useRef({});
	const listRef = useRef(null);

	const updateCapsule = useCallback(() => {
		const activeItem = NAV_ITEMS.find(
			(item) => item.path === location.pathname,
		);
		if (!activeItem) return;

		const el = itemRefs.current[activeItem.id];
		const list = listRef.current;
		if (!el || !list) return;

		const elRect = el.getBoundingClientRect();
		const listRect = list.getBoundingClientRect();

		setCapsule({
			left: elRect.left - listRect.left,
			width: elRect.width,
		});
	}, [location.pathname]);

	useEffect(() => {
		updateCapsule();

		const resizeObserver = new ResizeObserver(() => {
			updateCapsule();
		});

		if (listRef.current) {
			resizeObserver.observe(listRef.current);
		}

		return () => resizeObserver.disconnect();
	}, [updateCapsule]);

	return (
		<nav className={styles.navigation}>
			<ul className={styles.list} ref={listRef}>
				<motion.span
					className={styles.capsule}
					animate={{left: capsule.left, width: capsule.width}}
					transition={{type: 'spring', stiffness: 400, damping: 30}}
				/>
				{NAV_ITEMS.map((item) => (
					<HeaderButton
						key={item.path}
						item={item}
						ref={(el) => (itemRefs.current[item.id] = el)}
						className={styles.chapter}
					/>
				))}
			</ul>
		</nav>
	);
};

export default Navigation;
