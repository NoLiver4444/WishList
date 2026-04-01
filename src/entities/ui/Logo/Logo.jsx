import logoIconURL from '@/shared/assets/logo.svg'
import styles from './Logo.module.css'

const Logo = () => {
  return (
    <div className={styles.logo}>
      {/*сделай Link заместе ссылки и укажи путь на домашюю страницу*/}
      <a className={styles.iconButton}>
        <img
          src={logoIconURL}
          alt='CardList wish-piece'
          className={styles.icon}
        />
      </a>
      <h1
        className={styles.title}
      >
        Wish-piece
      </h1>
    </div>
  )
}

export default Logo