import { useState, lazy, Suspense } from 'react';
import AuthPage from './components/AuthPage';

// L'app authentifiée (dashboards, modules, graphiques Recharts) est chargée à la
// demande : la landing / connexion reste ultra-légère au premier chargement.
const AppShell = lazy(() => import('./components/AppShell'));

export type UserRole = 'client-fonctionnaire' | 'client-public' | 'agent-cpi' | 'admin';

export interface AuthUser {
  role: UserRole;
  name: string;
  memberNumber?: string;
  clientId?: string;
}

export type AppPage = 'welcome' | 'login' | 'register' | 'dashboard';

// Écran de transition pendant le chargement du chunk de l'espace connecté.
function AppLoader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
      <div style={{ width: 34, height: 34, border: '3px solid var(--secondary)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<AppPage>('welcome');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  const handleLogin = (user: AuthUser) => {
    setAuthUser(user);
    setPage('dashboard');
  };

  const handleLogout = () => {
    setAuthUser(null);
    setPage('welcome');
  };

  if (page === 'dashboard' && authUser) {
    return (
      <Suspense fallback={<AppLoader />}>
        <AppShell user={authUser} onLogout={handleLogout} />
      </Suspense>
    );
  }

  return (
    <AuthPage
      page={page === 'dashboard' ? 'welcome' : page}
      onLogin={handleLogin}
      onNavigate={setPage}
    />
  );
}
