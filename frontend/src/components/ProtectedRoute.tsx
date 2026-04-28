import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100">
        <div className="text-teal-700 text-lg font-medium animate-pulse">Загрузка…</div>
      </div>
    );
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}
