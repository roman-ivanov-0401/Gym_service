import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import RemoteWrapper from './components/RemoteWrapper';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const loadClientApp = () => import('clientApp/App');
const loadAdminApp = () => import('adminApp/App');

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-zinc-100">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/dashboard"
                element={<ProtectedRoute><RemoteWrapper loader={loadClientApp} serviceName="клиентского сервиса" /></ProtectedRoute>}
              />
              <Route
                path="/profile"
                element={<ProtectedRoute><RemoteWrapper loader={loadClientApp} serviceName="клиентского сервиса" /></ProtectedRoute>}
              />
              <Route
                path="/subscriptions"
                element={<ProtectedRoute><RemoteWrapper loader={loadClientApp} serviceName="клиентского сервиса" /></ProtectedRoute>}
              />
              <Route
                path="/admin"
                element={<AdminRoute><RemoteWrapper loader={loadAdminApp} serviceName="админ-сервиса" /></AdminRoute>}
              />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
