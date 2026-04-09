import styles from '@/entities/ui/Navigation/Navigation.module.css'

const HeaderButton = ({ item, isActive, onClick }) => {
  const Icon = item.icon;
  return (
    <li>
      <button
        className={`${styles.item} ${isActive ? styles.activeItem : ''}`}
        onClick={() => onClick(item.id)}
        data-tooltip={item.label}
      >
              <span className={`${styles.icon} ${item.style}`}>
                <Icon size={32} strokeWidth={2} />
              </span>
      </button>
    </li>
  )
}

export default HeaderButton;