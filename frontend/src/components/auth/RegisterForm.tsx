'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { registerAndLoginFormAction, type AuthFormState } from '@/actions/auth';

const initial: AuthFormState = { error: null };

const inputClass =
  'w-full border border-zinc-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 text-sm bg-zinc-50/50';

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAndLoginFormAction, initial);

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-card-lg p-8 w-full max-w-md ring-1 ring-zinc-200/80">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🏋️</div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Создать аккаунт</h1>
          <p className="text-zinc-500 text-sm mt-1">Присоединяйтесь к GymApp</p>
        </div>
        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-600 mb-1">
              Имя
            </label>
            <input id="name" name="name" type="text" required className={inputClass} placeholder="Ваше имя" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-600 mb-1">
              Электронная почта
            </label>
            <input id="email" name="email" type="email" required className={inputClass} placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-zinc-600 mb-1">
              Роль
            </label>
            <select id="role" name="role" defaultValue="client" className={inputClass}>
              <option value="client">Клиент</option>
              <option value="admin">Администратор</option>
            </select>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-600 mb-1">
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}"
              title="Минимум 8 символов, включая заглавную, строчную букву и цифру"
              className={inputClass}
              placeholder="••••••••"
            />
          </div>
          {(state?.error ?? null) && <p className="text-red-600 text-sm text-center">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? 'Создание аккаунта…' : 'Зарегистрироваться'}
          </button>
        </form>
        <p className="text-center text-sm text-zinc-500 mt-6">
          Уже есть аккаунт?{' '}
          <Link href="/login" className="text-teal-700 font-medium hover:text-teal-900 hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
