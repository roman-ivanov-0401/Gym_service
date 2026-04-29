import React, { Suspense, lazy, useMemo, useState } from 'react';
import type { RemoteSessionProps } from '@gym/shared/remoteSession';
import { useAuth } from '../context/AuthContext';

type RemoteApp = React.ComponentType<RemoteSessionProps>;

interface Props {
  loader: () => Promise<{ default: RemoteApp }>;
  serviceName?: string;
}

export default function RemoteWrapper({ loader, serviceName = 'сервиса' }: Props) {
  const [attempt, setAttempt] = useState(0);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const session: RemoteSessionProps = { user, isAdmin: !!isAdmin };

  const Component = useMemo(
    () =>
      lazy(async () => {
        try {
          return await loader();
        } catch (error) {
          console.error('Remote microfrontend failed to load:', error);
          return {
            default: function RemoteUnavailable(_props: RemoteSessionProps) {
              return (
                <div className="min-h-[50vh] flex items-center justify-center px-4">
                  <div className="max-w-lg w-full bg-white border border-zinc-200 rounded-xl shadow-card-lg p-6 text-center">
                    <h2 className="text-lg font-semibold text-zinc-900">Сервис временно недоступен</h2>
                    <p className="text-sm text-zinc-500 mt-2">
                      Не удалось загрузить микрофронтенд {serviceName}. Проверьте, что сервис запущен, и попробуйте снова.
                    </p>
                    <button
                      type="button"
                      onClick={() => setAttempt((prev) => prev + 1)}
                      className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium transition"
                    >
                      Повторить
                    </button>
                  </div>
                </div>
              );
            },
          };
        }
      }),
    [loader, serviceName, attempt],
  );

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-teal-700 animate-pulse text-lg font-medium">Загрузка приложения...</div>}>
      <Component {...session} />
    </Suspense>
  );
}
