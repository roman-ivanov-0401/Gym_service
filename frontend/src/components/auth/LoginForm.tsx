'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { loginFormAction, type AuthFormState } from '@/actions/auth';

const initial: AuthFormState = { error: null };

const inputClass =
  'w-full border border-zinc-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 text-sm bg-zinc-50/50';

export default function LoginForm({ notice }: { notice: string | null }) {
  const [state, formAction, pending] = useActionState(loginFormAction, initial);

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-card-lg p-8 w-full max-w-md ring-1 ring-zinc-200/80">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">💪</div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">С возвращением!</h1>
          <p className="text-zinc-500 text-sm mt-1">Войдите в свой аккаунт</p>
        </div>
        {notice && (
          <p className="mb-4 text-sm text-center text-teal-800 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">{notice}</p>
        )}
        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-600 mb-1">
              Электронная почта
            </label>
            <input id="email" name="email" type="email" required className={inputClass} placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-600 mb-1">
              Пароль
            </label>
            <input id="password" name="password" type="password" required className={inputClass} placeholder="••••••••" />
          </div>
          {(state?.error ?? null) && <p className="text-red-600 text-sm text-center">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? 'Вход…' : 'Войти'}
          </button>
        </form>
        <p className="text-center text-sm text-zinc-500 mt-6">
          Нет аккаунта?{' '}
          <Link href="/register" className="text-teal-700 font-medium hover:text-teal-900 hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
