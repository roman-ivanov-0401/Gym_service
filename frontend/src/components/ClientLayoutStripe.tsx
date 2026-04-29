'use client';

import { useEffect, useState } from 'react';

/** Минимальный клиентский фрагмент рядом с серверной навигацией (демонстрация server + client в одном layout). */
export function ClientLayoutStripe() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div
      className={mounted ? 'h-0.5 bg-gradient-to-r from-teal-600/30 via-teal-500/60 to-teal-600/30' : 'h-0.5 bg-zinc-200'}
      title="Клиентский компонент (useEffect + useState)"
      aria-hidden
    />
  );
}
