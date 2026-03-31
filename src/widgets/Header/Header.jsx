import styles from './Header.module.css'
import Logo from "@/shared/ui/Logo";
import Navigation from "@/shared/ui/Navigation";
import Menu from "@/shared/ui/Menu";

const Header = () => {
  return (
    <header
      className={styles.header}
    >
      <Logo />
      <Navigation />
      <Menu />
    </header>
  )
}

export default Header