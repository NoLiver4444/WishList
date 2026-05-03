import { memo } from 'react';
import styles from './Tabs.module.css';

const Tabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className={styles.container}>
      <ul className={styles.list}>
        {tabs.map((tab) => (
          <li>
            <button
              key={tab.value}
              className={`${styles.tab} ${activeTab === tab.value ? styles.activeTab : ''}`}
              onClick={() => onTabChange(tab.value)}
            >
              <div className={styles.label}>{tab.label}</div>
              <div className={styles.count}>{tab.counts}</div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default memo(Tabs);
