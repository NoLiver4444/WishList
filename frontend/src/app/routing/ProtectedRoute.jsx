/**
 * @file Компонент для защиты приватных маршрутов.
 * @module routing/ProtectedRoute
 */

import { Navigate } from 'react-router-dom';
import { memo } from 'react';
import { useSessionStore } from '@/entities/session';

/**
 * Компонент ProtectedRoute.
 * Проверяет наличие активных аккаунтов в сессии.
 * Если пользователь авторизован (accounts.length > 0), отрисовывает дочерние компоненты.
 * В противном случае перенаправляет на страницу авторизации '/auth'.
 * * @component
 * @param {Object} props - Свойства компонента.
 * @param {React.ReactNode} props.children - Дочерние элементы, которые нужно отобразить при успешной проверке.
 * @returns {React.ReactElement} Возвращает дочерние элементы или компонент Navigate для перенаправления.
 */
const ProtectedRoute = ({ children }) => {
  const accounts = useSessionStore((s) => s.accounts);
  return accounts.length > 0 ? children : <Navigate to="/auth" replace />;
};

export default memo(ProtectedRoute);
