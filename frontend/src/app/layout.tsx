import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GymApp — фитнес-клуб',
  description: 'Клиентский портал и админка',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
