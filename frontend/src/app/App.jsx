import { memo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProductsPage from '@/pages/ProductsPage';
import WishlistsPage from '@/pages/WishlistsPage';
import FriendsPage from '@/pages/FriendsPage';
import CalendarPage from '@/pages/CalendarPage';
import SettingsPage from '@/pages/SettingsPage';
import AuthPage from '@/pages/AuthPage';
import PublicWishlistPage from '@/pages/PublicWishlistPage';
import WishlistPage from '@/pages/WishlistPage';
import ProtectedRoute from '@/app/routing/ProtectedRoute';
import { SearchProvider } from '@/shared/context/SearchContext.jsx';
import Header from '@/widgets/Header';
import Footer from '@/widgets/Footer';
import './styles';

const App = () => {
  return (
    <>
      <SearchProvider>
        <Toaster position="bottom-center" />
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/view/:id"
            element={
              <div className="app">
                <Header />
                <main className="main">
                  <PublicWishlistPage />
                </main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/wishlists/:id"
            element={
              <ProtectedRoute>
                <div className="app">
                  <Header />
                  <main className="main">
                    <WishlistPage />
                  </main>
                  <Footer />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="app">
                  <Header />
                  <main className="main">
                    <Routes>
                      <Route path="/" element={<ProductsPage />} />
                      <Route path="/wishlists" element={<WishlistsPage />} />
                      <Route path="/friends" element={<FriendsPage />} />
                      <Route path="/calendar" element={<CalendarPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </SearchProvider>
    </>
  );
};

export default memo(App);
