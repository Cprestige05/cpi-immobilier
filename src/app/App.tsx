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
  const bar = (w: string, h = 12, r = 'var(--r-sm)') =>
    <div className="cpi-skeleton" style={{ width: w, height: h, borderRadius: r }} />;
  const card = (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="cpi-skeleton" style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)' }} />
      {bar('60%', 22)}
      {bar('40%')}
    </div>
  );
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', padding: '20px', boxSizing: 'border-box' }}>
      {/* Topbar factice */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="cpi-skeleton" style={{ width: 28, height: 28, borderRadius: 'var(--r-sm)' }} />
          {bar('120px', 16)}
        </div>
        <div className="cpi-skeleton" style={{ width: 40, height: 40, borderRadius: 'var(--r-full)' }} />
      </div>
      {/* Titre */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, maxWidth: 480 }}>
        {bar('220px', 26)}
        {bar('320px', 14)}
      </div>
      {/* Grille de cartes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {[0, 1, 2, 3].map(i => <div key={i}>{card}</div>)}
      </div>
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }} role="status" aria-live="polite">Chargement de votre espace…</span>
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
