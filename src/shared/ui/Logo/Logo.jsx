import {Link} from 'react-router-dom';
import logoIconURL from '@/shared/assets/logo.svg';
import styles from './Logo.module.css';

const Logo = () => {
  return (
    <Link
      to="/"
      className={`${styles.logo}`}
    >
      <img
        src={logoIconURL}
        alt="CardList wish-piece"
        className={styles.icon}
      />
    </Link>
  );
};

export default Logo;
