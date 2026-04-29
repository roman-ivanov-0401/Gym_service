import React from 'react';
import type { RemoteSessionProps } from '@gym/shared/remoteSession';
import { useAuth } from '../context/AuthContext';

/**
 * Прокидывает user/isAdmin в remote-приложение при standalone-запуске.
 * В составе host сессия передаётся из RemoteWrapper без useAuth внутри microfrontend.
 */
export function RemoteSessionOutlet({ App: AppComponent }: { App: React.ComponentType<RemoteSessionProps> }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  return <AppComponent user={user} isAdmin={!!isAdmin} />;
}
