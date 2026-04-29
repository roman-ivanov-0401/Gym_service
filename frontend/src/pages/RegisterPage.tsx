import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation, useRegisterMutation } from '../store/authApi';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../utils/apiError';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [registerMut] = useRegisterMutation();
  const [loginMut] = useLoginMutation();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerMut(form).unwrap();
      const res = await loginMut({ email: form.email, password: form.password }).unwrap();
      await authLogin(res.data.accessToken, res.data.refreshToken);
      navigate('/dashboard');
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Не удалось зарегистрироваться'));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full border border-zinc-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 text-sm bg-zinc-50/50';

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-card-lg p-8 w-full max-w-md ring-1 ring-zinc-200/80">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🏋️</div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Создать аккаунт</h1>
          <p className="text-zinc-500 text-sm mt-1">Присоединяйтесь к GymApp</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-600 mb-1">Имя</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              placeholder="Ваше имя"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-600 mb-1">Электронная почта</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-600 mb-1">Роль</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputClass}>
              <option value="client">Клиент</option>
              <option value="admin">Администратор</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-600 mb-1">Пароль</label>
            <input
              type="password"
              required
              minLength={8}
              pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}"
              title="Минимум 8 символов, включая заглавную, строчную букву и цифру"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={inputClass}
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Создание аккаунта…' : 'Зарегистрироваться'}
          </button>
        </form>
        <p className="text-center text-sm text-zinc-500 mt-6">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-teal-700 font-medium hover:text-teal-900 hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
