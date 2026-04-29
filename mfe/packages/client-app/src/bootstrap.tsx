import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

/** Не монтировать при загрузке как remote с host: иначе перезапишем #root хоста без AuthProvider. */
const rootEl = document.getElementById('root');
if (rootEl?.getAttribute('data-gym-app') === 'client') {
  void Promise.all([import('host/AuthContext'), import('host/RemoteSessionOutlet')]).then(
    ([{ AuthProvider }, { RemoteSessionOutlet }]) => {
      ReactDOM.createRoot(rootEl).render(
        <React.StrictMode>
          <AuthProvider>
            <BrowserRouter>
              <RemoteSessionOutlet App={App} />
            </BrowserRouter>
          </AuthProvider>
        </React.StrictMode>,
      );
    },
  );
}
