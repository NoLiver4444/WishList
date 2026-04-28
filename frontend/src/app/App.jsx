/**
 * @file Корневой компонент приложения (App).
 * @module app/App
 */

import { memo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProductsPage from '@/pages/ProductsPage';
import WishlistsPage from '@/pages/WishlistsPage';
import FriendsPage from '@/pages/FriendsPage';
import CalendarPage from '@/pages/CalendarPage';
import AuthPage from '@/pages/AuthPage';
import WishlistPage from '@/pages/WishlistPage';
import ProtectedRoute from '@/app/routing/ProtectedRoute';
import { SearchProvider } from '@/shared/context/SearchProvider.jsx';
import Header from '@/widgets/Header';
import Footer from '@/widgets/Footer';
import './styles';

/**
 * Основной компонент приложения.
 * Содержит конфигурацию маршрутов, глобальные провайдеры контекста (SearchProvider)
 * и общую структуру макета (Header, Footer).
 * * Маршруты:
 * - /auth: Страница авторизации.
 * - /view/:id: Публичная страница вишлиста.
 * - /wishlists/:id: Приватная страница конкретного вишлиста (защищена).
 * - /*: Группа защищенных роутов (главная, друзья, календарь и др.).
 * * @component
 * @returns {React.ReactElement} Главная иерархия компонентов и роутов.
 */
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
                  <WishlistPage mode="public" />
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
                    <WishlistPage mode="owner" />
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
