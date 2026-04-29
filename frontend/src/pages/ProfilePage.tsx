import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useCreateProfileMutation, useGetMyProfileQuery, useUpdateProfileMutation } from '../store/gymApi';
import { getApiErrorMessage } from '../utils/apiError';

const inputClass =
  'w-full border border-zinc-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 text-sm bg-zinc-50/50';

export default function ProfilePage() {
  const { data: profile, isLoading: profileLoading } = useGetMyProfileQuery();
  const [createProfile, { isLoading: creating }] = useCreateProfileMutation();
  const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [message, setMessage] = useState('');
  const [messageIsError, setMessageIsError] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name,
        email: profile.email,
        phone: profile.phone ?? '',
      });
    }
  }, [profile]);

  const saving = creating || updating;
  const hasProfile = profile != null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      if (hasProfile) {
        await updateProfile({ name: form.name, email: form.email, phone: form.phone || undefined }).unwrap();
      } else {
        await createProfile({ name: form.name, email: form.email, phone: form.phone || undefined }).unwrap();
      }
      setMessageIsError(false);
      setMessage('Профиль успешно сохранён');
    } catch (e: unknown) {
      setMessageIsError(true);
      setMessage(getApiErrorMessage(e, 'Не удалось сохранить'));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Мой профиль</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {hasProfile ? 'Обновите свои данные' : 'Создайте профиль спортзала'}
          </p>
        </div>

        {profileLoading ? (
          <p className="text-teal-700 animate-pulse font-medium">Загрузка…</p>
        ) : (
          <div className="bg-white rounded-xl shadow-card-lg p-6 border border-zinc-200/80 ring-1 ring-zinc-100">
            {profile && (
              <div className="mb-6 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">Клиент с</p>
                <p className="text-sm font-semibold text-zinc-900 mt-0.5">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-1">Имя</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-1">Электронная почта</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-600 mb-1">Телефон</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputClass}
                  placeholder="+7 (999) 000-00-00"
                />
              </div>
              {message && (
                <p className={`text-sm text-center ${messageIsError ? 'text-red-600' : 'text-teal-800'}`}>
                  {message}
                </p>
              )}
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Сохранение…' : hasProfile ? 'Сохранить изменения' : 'Создать профиль'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
