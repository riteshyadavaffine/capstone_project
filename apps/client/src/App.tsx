import { LoginPage } from './pages/LoginPage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { auth } = useAuth();

  if (!auth) {
    return <LoginPage />;
  }

  return auth.user.role === 'admin' ? <AdminDashboard /> : <CustomerDashboard />;
}

