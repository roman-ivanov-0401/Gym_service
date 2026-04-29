/**
 * Данные сессии, которые host передаёт в remote без useAuth / AuthContext внутри microfrontend.
 */
export interface RemoteUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface RemoteSessionProps {
  user: RemoteUser | null;
  isAdmin: boolean;
}
