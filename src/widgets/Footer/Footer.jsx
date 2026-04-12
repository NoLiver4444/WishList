import styles from './Footer.module.css'

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <h3 className={styles.title}>Wish-piece</h3>
      <div className={styles.content}>
        <div>© 2026 Los huilos</div>
        <a
          href="https://t.me/AISAAAAUUUU"
          className={styles.link}
          target="_blank"
        >
          Поддержка
        </a>
        <a
          href="https://github.com/NoLiver4444/WishList"
          className={styles.link}
          target="_blank"
        >
          О проекте
        </a>
      </div>
    </footer>
  );
};

export default Footer;