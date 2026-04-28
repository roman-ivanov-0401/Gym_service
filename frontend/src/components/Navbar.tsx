import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = 'text-sm text-zinc-600 hover:text-teal-800 font-medium transition-colors';
  const linkAdmin = 'text-sm text-zinc-600 hover:text-slate-900 font-medium transition-colors';

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-zinc-200 px-6 py-3.5 flex items-center justify-between shadow-card">
      <Link
        to={user?.role === 'admin' ? '/admin' : '/dashboard'}
        className="text-xl font-bold text-zinc-900 tracking-tight"
      >
        Gym<span className="text-teal-700">App</span>
      </Link>
      <div className="flex items-center gap-5">
        {user?.role === 'admin' ? (
          <Link to="/admin" className={linkAdmin}>
            Панель администратора
          </Link>
        ) : (
          <>
            <Link to="/dashboard" className={linkClass}>
              Главная
            </Link>
            <Link to="/profile" className={linkClass}>
              Профиль
            </Link>
            <Link to="/subscriptions" className={linkClass}>
              Абонементы
            </Link>
          </>
        )}
        <span className="text-sm text-zinc-500 hidden sm:inline">Привет, {user?.name}</span>
        <button
          onClick={handleLogout}
          className="text-sm bg-zinc-800 hover:bg-zinc-900 text-white px-4 py-2 rounded-lg transition font-medium"
        >
          Выйти
        </button>
      </div>
    </nav>
  );
}
