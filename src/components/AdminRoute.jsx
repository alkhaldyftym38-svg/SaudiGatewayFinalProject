import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function AdminRoute({ children }) {
  const { sessionUser, authLoading } = useApp();
  const location = useLocation();
  const returnTo = `${location.pathname}${location.search}`;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!sessionUser) {
    return <Navigate to="/login" replace state={{ from: returnTo }} />;
  }
  if (sessionUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
