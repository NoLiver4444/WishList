import Header from "@/widgets/Header";
import Main from "@/widgets/Main";
import Footer from "@/widgets/Footer";
import styles from "./Wishlist.module.css";

const Wishlist = () => {
  return (
    <div className={styles.wishlist}>
      <Header />
      <Main />
      <Footer />
    </div>
  )
}

export default Wishlist