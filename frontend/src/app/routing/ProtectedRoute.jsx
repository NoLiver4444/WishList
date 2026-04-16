import { Navigate } from 'react-router-dom';
import { useSessionStore } from '@/entities/session';

const ProtectedRoute = ({ children }) => {
  const isAuth = useSessionStore((s) => s.isAuth);
  return isAuth ? children : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
