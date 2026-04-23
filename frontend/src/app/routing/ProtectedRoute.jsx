import { Navigate } from 'react-router-dom';
import { memo } from 'react';
import { useSessionStore } from '@/entities/session';

const ProtectedRoute = ({ children }) => {
  const accounts = useSessionStore((s) => s.accounts);
  return accounts.length > 0 ? children : <Navigate to="/auth" replace />;
};

export default memo(ProtectedRoute);
