import styles from './Header.module.css'
import Logo from "@/entities/ui/Logo";
import Navigation from "@/entities/ui/Navigation";
import Menu from "@/entities/ui/Menu";

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
};

export default Header;