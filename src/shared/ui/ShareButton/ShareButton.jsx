import styles from './ShareButton.module.css';

const ShareButton = () => {
  return (
    <div className={styles.wrapper}>
      <button type="button" className={styles.button}>
        Поделиться
      </button>
    </div>
  );
};

export default ShareButton;
