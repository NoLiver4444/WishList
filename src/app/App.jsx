import {Route, Routes} from 'react-router-dom';
import ProductsPage from '@/pages/ProductsPage'
import WishlistsPage from '@/pages/WishlistsPage'
import FriendsPage from '@/pages/FriendsPage'
import CalendarPage from '@/pages/CalendarPage'
import ProfilePage from '@/pages/ProfilePage'
import SettingsPage from '@/pages/SettingsPage'
import Header from "@/widgets/Header";
import Footer from "@/widgets/Footer";
import './styles'

const App = () => {
  return (
    <div className="app">
      <Header />
      <main>
        <Routes>
          <Route
            path="/"
            element={<ProductsPage />}
          />
          <Route
            path="/wishlists"
            element={<WishlistsPage />}
          />
          <Route
            path="/friends"
            element={<FriendsPage />}
          />
          <Route
            path="/calendar"
            element={<CalendarPage />}
          />
          <Route
            path="/profile"
            element={<ProfilePage />}
          />
          <Route
            path="/settings"
            element={<SettingsPage />}
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
