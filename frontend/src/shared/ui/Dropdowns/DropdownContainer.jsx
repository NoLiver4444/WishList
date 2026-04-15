import { motion } from 'framer-motion';
import styles from '../Menu/Menu.module.css';

export const DropdownContainer = ({children}) => (
	<motion.div
		className={styles.dropdown}
		initial={{scale: 0.9, opacity: 0, y: -15}}
		animate={{scale: 1, opacity: 1, y: 0}}
		exit={{scale: 0.9, opacity: 0, y: -15}}
		transition={{type: 'spring', damping: 25, stiffness: 400}}
	>
		{children}
	</motion.div>
);

export default DropdownContainer;
