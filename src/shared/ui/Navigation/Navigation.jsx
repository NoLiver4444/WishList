import favoriteIconURL from '@/shared/assets/favorite.svg'
import homeIconURL from '@/shared/assets/home.svg'
import friendsIconURL from '@/shared/assets/friends.svg'
import presentsIconURL from '@/shared/assets/presents.svg'
import searchIconURL from '@/shared/assets/search.svg'
import styles from './Navigation.module.css'

const Navigation = () => {
  return (
    <ul className={styles.navigation}>
      <li className={styles.item}>
        <img
          src={favoriteIconURL}
          alt='Любимые товары'
          className={styles.icon}
        />
      </li>
      <li className={styles.item}>
        <img
          src={homeIconURL}
          alt='Вишлисты'
          className={styles.icon}
        />
      </li>
      <li className={styles.item}>
        <img
          src={friendsIconURL}
          alt='Друзья'
          className={styles.icon}
        />
      </li>
      <li className={styles.item}>
        <img
          src={presentsIconURL}
          alt='Подарки'
          className={styles.icon}
        />
      </li>
      <li className={styles.item}>
        <img
          src={searchIconURL}
          alt='Поиск'
          className={styles.icon}
        />
      </li>
    </ul>
  )
}

export default Navigation