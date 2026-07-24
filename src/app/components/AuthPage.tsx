import { useState } from 'react';
import {
  Eye, EyeOff, Shield, Zap, Headphones, Handshake, Lock,
  ChevronRight, ArrowLeft, CheckSquare, Square,
  Landmark, Briefcase, UserCircle, ArrowRight, CheckCircle,
} from 'lucide-react';
import type { AuthUser, UserRole, AppPage } from '../App';
import bgWelcome from '../../imports/BG.png';
import cpiLogo from '../../imports/image.png';

type ProfilType = 'fonctionnaire' | 'prive' | 'autre';

const PROFIL_OPTIONS: {
  type: ProfilType;
  label: string;
  sub: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  color: string;
  bg: string;
  cardBg: string;
  textColor: string;
  subColor: string;
  borderColor: string;
}[] = [
  {
    type: 'fonctionnaire',
    label: 'Fonctionnaire',
    sub: 'État, collectivités, établissements publics',
    icon: Landmark,
    color: '#1E4D8C',
    bg: 'rgba(30,77,140,0.08)',
    cardBg: 'var(--card)',
    textColor: 'var(--foreground)',
    subColor: 'var(--muted-foreground)',
    borderColor: 'rgba(30,77,140,0.14)',
  },
  {
    type: 'prive',
    label: 'Secteur privé',
    sub: "CDI, CDD, chef d'entreprise",
    icon: Briefcase,
    color: 'var(--success)',
    bg: 'rgba(26,107,68,0.08)',
    cardBg: 'var(--card)',
    textColor: 'var(--foreground)',
    subColor: 'var(--muted-foreground)',
    borderColor: 'rgba(26,107,68,0.14)',
  },
  {
    type: 'autre',
    label: 'Autre profil',
    sub: 'Profession libérale, indépendant, diaspora',
    icon: UserCircle,
    color: 'var(--accent)',
    bg: 'rgba(200,146,26,0.08)',
    cardBg: 'var(--card)',
    textColor: 'var(--foreground)',
    subColor: 'var(--muted-foreground)',
    borderColor: 'rgba(200,146,26,0.14)',
  },
];

const DEMO_ACCOUNTS: { role: UserRole; name: string; desc: string }[] = [
  { role: 'client-public', name: 'Aïssatou Ndiaye', desc: 'Cliente'        },
  { role: 'agent-cpi',     name: 'Mme Thiombane',   desc: 'Agent CPI'      },
  { role: 'admin',         name: 'Admin CPI',        desc: 'Administrateur' },
];

interface Props {
  page: AppPage;
  onLogin: (user: AuthUser) => void;
  onNavigate: (p: AppPage) => void;
}

// ─── Shared: Field input ──────────────────────────────────────────────────────
function Field({ label, type = 'text', placeholder, value, onChange }: {
  label: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  const isPwd = type === 'password';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: 'var(--font-weight-medium)' as any, color: 'var(--foreground)' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={isPwd && show ? 'text' : type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '10px 14px', paddingRight: isPwd ? '40px' : '14px',
            border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            background: 'var(--input-background)',
            fontFamily: 'var(--font-sans)', fontSize: '0.9375rem',
            color: 'var(--foreground)', outline: 'none',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--ring)'; e.target.style.boxShadow = '0 0 0 2px rgba(123,26,46,0.1)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
        />
        {isPwd && (
          <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: 0 }}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: 'var(--font-weight-medium)' as any, color: 'var(--foreground)' }}>
        {label}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '10px 14px',
          border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          background: 'var(--input-background)',
          fontFamily: 'var(--font-sans)', fontSize: '0.9375rem',
          color: value ? 'var(--foreground)' : 'var(--muted-foreground)', outline: 'none',
          appearance: 'none',
          cursor: 'pointer',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--ring)'; e.target.style.boxShadow = '0 0 0 2px rgba(123,26,46,0.1)'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function PrimaryBtn({ children, onClick, type = 'button', fullWidth = true, disabled = false }: {
  children: React.ReactNode; onClick?: () => void; type?: 'button' | 'submit'; fullWidth?: boolean; disabled?: boolean;
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{
        width: fullWidth ? '100%' : 'auto',
        padding: '12px 24px', background: disabled ? 'var(--muted)' : 'var(--primary)',
        color: disabled ? 'var(--muted-foreground)' : 'var(--primary-foreground)',
        border: 'none', borderRadius: 'var(--radius)',
        fontFamily: 'var(--font-sans)', fontSize: '0.9375rem', fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer', letterSpacing: '0.03em', transition: 'opacity 0.15s',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
      {children}
    </button>
  );
}

// ─── SCREEN 1 — Welcome ───────────────────────────────────────────────────────
function WelcomeScreen({ onNavigate, onLogin, onProfileSelect }: {
  onNavigate: (p: AppPage) => void;
  onLogin: (u: AuthUser) => void;
  onProfileSelect: (p: ProfilType) => void;
}) {
  const [showDemo, setShowDemo] = useState(false);
  const [hovered, setHovered] = useState<ProfilType | null>(null);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      backgroundImage: `url(${bgWelcome})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundColor: '#f0ede8',
    }}>
      {/* Topbar */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px',
      }}>
        <img src={cpiLogo} alt="CPI" style={{ height: '52px', width: 'auto' }} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(255,255,255,0.95)',
          border: '1px solid rgba(0,0,0,0.07)',
          borderRadius: '99px',
          padding: '6px 14px 6px 10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <div style={{
            width: '26px', height: '26px',
            background: 'var(--secondary)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={13} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1.3 }}>Plateforme sécurisée</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.5625rem', color: 'var(--muted-foreground)', lineHeight: 1.3 }}>Vos données sont protégées</div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '8px 24px 36px', gap: '0',
      }}>
        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '28px', maxWidth: '680px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.9)', border: '1px solid var(--border)',
            borderRadius: '99px', padding: '4px 12px', marginBottom: '14px',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--foreground)', letterSpacing: '0.04em' }}>
              Ouvert à tous les travailleurs sénégalais
            </span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 3.6vw, 2.25rem)',
            fontWeight: 700, color: 'var(--foreground)',
            lineHeight: 1.22, marginBottom: '12px', letterSpacing: '-0.01em',
          }}>
            Votre projet immobilier,<br />peu importe votre secteur.
          </h1>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.9375rem', color: 'var(--muted-foreground)', lineHeight: 1.6,
          }}>
            Sélectionnez votre profil pour un accompagnement personnalisé.
          </p>
        </div>

        {/* Profile cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '14px',
          width: '100%', maxWidth: '720px',
          marginBottom: '20px',
        }} className="profile-grid">
          {PROFIL_OPTIONS.map(p => {
            const Icon = p.icon;
            const isHov = hovered === p.type;
            return (
              <div
                key={p.type}
                onClick={() => onProfileSelect(p.type)}
                onMouseEnter={() => setHovered(p.type)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: p.cardBg,
                  border: `1px solid ${p.borderColor}`,
                  borderRadius: '12px',
                  padding: '22px 20px 18px',
                  cursor: 'pointer',
                  boxShadow: isHov ? '0 12px 36px rgba(0,0,0,0.12)' : '0 2px 10px rgba(0,0,0,0.07)',
                  transform: isHov ? 'translateY(-4px)' : 'none',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  width: '42px', height: '42px',
                  background: p.bg, borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '14px',
                }}>
                  <Icon size={20} style={{ color: p.color }} />
                </div>

                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.9375rem', fontWeight: 700,
                  color: p.textColor, lineHeight: 1.3, marginBottom: '6px',
                }}>
                  {p.label}
                </div>
                <div style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.75rem', color: p.subColor,
                  lineHeight: 1.5, marginBottom: '14px',
                }}>
                  {p.sub}
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: 600,
                  color: 'var(--primary)',
                }}>
                  Commencer <ArrowRight size={13} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Already have account */}
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
            Déjà inscrit ?{' '}
          </span>
          <button type="button" onClick={() => onNavigate('login')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)', padding: 0 }}>
            Accéder à mon espace
          </button>
        </div>

        {/* Trust strip */}
        <div style={{
          display: 'flex',
          width: '100%', maxWidth: '920px',
          background: 'rgba(255,255,255,0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.95)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.09), 0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }} className="trust-strip">
          {([
            { icon: Zap,        label: 'Processus simple',         sub: 'Des étapes claires à chaque stade',       color: '#7B1A2E', bg: 'var(--secondary)' },
            { icon: Shield,     label: 'Données sécurisées',       sub: 'Chiffrement SSL — confidentialité totale', color: '#1E4D8C', bg: 'rgba(30,77,140,0.08)' },
            { icon: Headphones, label: 'Support dédié',            sub: "Une équipe disponible à chaque étape",    color: 'var(--success)', bg: 'rgba(26,107,68,0.08)' },
            { icon: Handshake,  label: 'Partenaires officiels',    sub: 'CPI · Banques partenaires',    color: 'var(--accent)', bg: 'rgba(200,146,26,0.10)' },
          ] as const).map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={b.label} style={{
                flex: 1,
                display: 'flex', alignItems: 'center', gap: '13px',
                padding: '18px 22px',
                borderLeft: i > 0 ? '1px solid rgba(123,26,46,0.07)' : 'none',
              }}>
                <div style={{
                  width: '40px', height: '40px', flexShrink: 0,
                  background: b.bg,
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={18} style={{ color: b.color }} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1.3, marginBottom: '3px', whiteSpace: 'nowrap' }}>{b.label}</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.725rem', color: 'var(--muted-foreground)', lineHeight: 1.45, whiteSpace: 'nowrap' }}>{b.sub}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Demo access */}
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button type="button" onClick={() => setShowDemo(!showDemo)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--muted-foreground)', textDecoration: 'underline' }}>
            {showDemo ? 'Masquer les accès démo' : 'Accès démonstration →'}
          </button>
          {showDemo && (
            <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
              {DEMO_ACCOUNTS.map(acc => (
                <button key={acc.role}
                  onClick={() => onLogin({ role: acc.role, name: acc.name })}
                  style={{
                    padding: '5px 12px',
                    background: 'rgba(255,255,255,0.92)', border: '1px solid var(--border)', borderRadius: '99px',
                    fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--foreground)', cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--secondary)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.92)'; }}>
                  {acc.desc}
                </button>
              ))}
            </div>
          )}
        </div>

        <a href="https://cpi.sn" target="_blank" rel="noopener noreferrer"
          style={{ marginTop: '12px', fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', color: 'var(--muted-foreground)', textDecoration: 'none' }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--primary)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--muted-foreground)'; }}>
          ← Retour sur cpi.sn
        </a>
      </main>

      <style>{`
        @media (max-width: 600px) {
          .profile-grid { grid-template-columns: 1fr !important; }
          .trust-strip { flex-direction: column !important; border-radius: 12px !important; }
          .trust-strip > div { border-left: none !important; border-top: 1px solid rgba(123,26,46,0.07) !important; padding: 14px 16px !important; }
          .trust-strip > div:first-child { border-top: none !important; }
        }
        @media (min-width: 601px) and (max-width: 860px) {
          .profile-grid { grid-template-columns: repeat(2,1fr) !important; }
          .trust-strip > div { padding: 16px 12px !important; gap: 10px !important; }
        }
      `}</style>
    </div>
  );
}

// ─── SCREEN 2 — Login ─────────────────────────────────────────────────────────
function LoginScreen({ onLogin, onNavigate }: { onLogin: (u: AuthUser) => void; onNavigate: (p: AppPage) => void }) {
  const [nom, setNom] = useState('');
  const [tel, setTel] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({ role: 'client-public', name: nom || 'Utilisateur' });
    }, 900);
  };

  const PHOTO = 'https://images.unsplash.com/photo-1721978536434-3cd55a457672?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200';

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }} className="auth-split">
      {/* Left — photo */}
      <div style={{
        position: 'relative', display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end', padding: '48px 40px',
        backgroundImage: `url(${PHOTO})`,
        backgroundSize: 'cover', backgroundPosition: 'center top', minHeight: '100vh',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(28,8,16,0.25) 0%, rgba(28,8,16,0.82) 60%, rgba(28,8,16,0.97) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <img src={cpiLogo} alt="CPI" style={{ height: '40px', marginBottom: '28px', display: 'block' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: '14px' }}>
            Réalisez votre projet<br />immobilier en toute<br />sérénité.
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9375rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, marginBottom: '28px', maxWidth: '360px' }}>
            Enseignants, fonctionnaires, salariés du privé — CPI vous accompagne à chaque étape de votre projet immobilier, de la demande jusqu'à la remise des clés.
          </p>
          <button type="button" onClick={() => onNavigate('register')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 22px', background: 'transparent', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 'var(--radius)', fontFamily: 'var(--font-sans)', fontSize: '0.9375rem', fontWeight: 700, color: 'white', cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.35)'; }}>
            Déposer ma demande <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Right — form */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 40px', background: 'var(--card)' }} className="auth-form-panel">
        <button type="button" onClick={() => onNavigate('welcome')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '32px', padding: 0 }}>
          <ArrowLeft size={16} /> Retour
        </button>

        <div style={{ maxWidth: '360px', width: '100%' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--foreground)', marginBottom: '6px' }}>Connexion</h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9375rem', color: 'var(--muted-foreground)', marginBottom: '28px' }}>Accédez à votre espace personnel.</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Field label="Nom" placeholder="Nom complet" value={nom} onChange={setNom} />
            <Field label="Téléphone" type="tel" placeholder="77 010 00 00" value={tel} onChange={setTel} />
            <Field label="E-mail" type="email" placeholder="bonjour@email.com" value={email} onChange={setEmail} />
            <div style={{ marginTop: '4px' }}>
              <PrimaryBtn type="submit">
                {loading
                  ? <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                      Connexion…
                    </span>
                  : 'CONNECTER'}
              </PrimaryBtn>
            </div>
          </form>

          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--muted-foreground)', marginTop: '20px', textAlign: 'center' }}>
            Pas de compte ?{' '}
            <button type="button" onClick={() => onNavigate('register')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', padding: 0 }}>
              Créer mon compte
            </button>
          </p>

          {/* Demo */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '10px', textAlign: 'center' }}>Connexion rapide (démo)</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {DEMO_ACCOUNTS.map(acc => (
                <button key={acc.role} onClick={() => onLogin({ role: acc.role, name: acc.name })}
                  style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--input-background)', fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--foreground)', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--secondary)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--input-background)'; }}>
                  {acc.name}<br />
                  <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>{acc.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .auth-split { grid-template-columns: 1fr !important; }
          .auth-split > :first-child { min-height: 260px !important; }
          .auth-form-panel { padding: 32px 24px !important; }
        }
      `}</style>
    </div>
  );
}

// ─── SCREEN 3 — Register (2 steps) ───────────────────────────────────────────
function RegisterScreen({ onLogin, onNavigate, initialProfile }: {
  onLogin: (u: AuthUser) => void;
  onNavigate: (p: AppPage) => void;
  initialProfile: ProfilType | null;
}) {
  const [step, setStep] = useState<1 | 2>(initialProfile ? 2 : 1);
  const [profil, setProfil] = useState<ProfilType | null>(initialProfile);
  const [hovered, setHovered] = useState<ProfilType | null>(null);
  const [form, setForm] = useState({
    nom: '', email: '', tel: '',
    employeur: '', revenus: '',
    pwd: '', pwd2: '',
  });
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const profilInfo = PROFIL_OPTIONS.find(p => p.type === profil);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted || !profil) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const role: UserRole = profil === 'fonctionnaire' ? 'client-fonctionnaire' : 'client-public';
      const clientId = `c-new-${Date.now()}`;
      onLogin({ role, name: form.nom || 'Nouveau client', clientId });
    }, 900);
  };

  const REVENUS_OPTIONS = [
    { value: '150000-250000', label: '150 000 – 250 000 FCFA / mois' },
    { value: '250000-400000', label: '250 000 – 400 000 FCFA / mois' },
    { value: '400000-600000', label: '400 000 – 600 000 FCFA / mois' },
    { value: '600000-900000', label: '600 000 – 900 000 FCFA / mois' },
    { value: '900000+',       label: 'Plus de 900 000 FCFA / mois' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }} className="auth-split">
      {/* Left panel — dark */}
      <div style={{
        position: 'relative', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '48px 40px',
        background: 'var(--sidebar)', minHeight: '100vh', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '320px', height: '320px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '36px' }}>
            <img
              src={cpiLogo}
              alt="CPI"
              style={{ height: '56px', width: 'auto', display: 'block', filter: 'brightness(0) invert(1)' }}
            />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.375rem, 3vw, 2rem)', fontWeight: 800, color: 'white', lineHeight: 1.25, marginBottom: '16px' }}>
            Accédez au financement<br />qui vous correspond.
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9375rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: '320px', marginBottom: '32px' }}>
            Que vous soyez enseignant, fonctionnaire ou employé du secteur privé, CPI vous accompagne dans la réalisation de votre projet immobilier.
          </p>

          {/* Steps indicator */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { n: 1, label: 'Choisissez votre profil' },
              { n: 2, label: "Complétez votre inscription" },
              { n: 3, label: 'Suivez votre dossier en ligne' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: s.n < step ? 1 : s.n === step ? 1 : 0.4 }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: s.n < step ? 'var(--success)' : s.n === step ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                  border: s.n === step ? '2px solid rgba(255,255,255,0.2)' : 'none',
                }}>
                  {s.n < step
                    ? <CheckCircle size={14} style={{ color: 'white' }} />
                    : <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', fontWeight: 700, color: 'white' }}>{s.n}</span>
                  }
                </div>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: s.n === step ? 700 : 400, color: s.n === step ? 'white' : 'rgba(255,255,255,0.55)' }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.06em' }}>
              Banques partenaires agréées de CPI
            </span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px', background: 'var(--card)', overflowY: 'auto' }} className="auth-form-panel">

        {step === 1 ? (
          /* ── Step 1: Profile selection ── */
          <div>
            <button type="button" onClick={() => onNavigate('welcome')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '28px', padding: 0 }}>
              <ArrowLeft size={16} /> Retour
            </button>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--foreground)', marginBottom: '6px' }}>
              Quel est votre profil ?
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '24px' }}>
              Sélectionnez votre situation professionnelle pour un accompagnement adapté.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
              {PROFIL_OPTIONS.map(p => {
                const Icon = p.icon;
                const isHov = hovered === p.type;
                return (
                  <div
                    key={p.type}
                    onClick={() => { setProfil(p.type); setStep(2); }}
                    onMouseEnter={() => setHovered(p.type)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      background: p.cardBg,
                      border: `1.5px solid ${isHov ? p.color : p.borderColor}`,
                      borderRadius: '10px',
                      padding: '16px 14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isHov ? '0 6px 20px rgba(0,0,0,0.10)' : 'none',
                    }}
                  >
                    <div style={{
                      width: '36px', height: '36px',
                      background: p.bg, borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '10px',
                    }}>
                      <Icon size={17} style={{ color: p.color }} />
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.875rem', fontWeight: 700, color: p.textColor, lineHeight: 1.3, marginBottom: '4px' }}>
                      {p.label}
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', color: p.subColor, lineHeight: 1.4 }}>
                      {p.sub}
                    </div>
                  </div>
                );
              })}
            </div>

            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--muted-foreground)', textAlign: 'center' }}>
              Déjà inscrit ?{' '}
              <button type="button" onClick={() => onNavigate('login')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', padding: 0 }}>
                Connexion
              </button>
            </p>
          </div>

        ) : (
          /* ── Step 2: Form ── */
          <div>
            <button type="button" onClick={() => setStep(1)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '20px', padding: 0 }}>
              <ArrowLeft size={16} /> Retour
            </button>

            {/* Profile badge */}
            {profilInfo && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '5px 12px 5px 8px',
                background: 'var(--input-background)',
                border: `1px solid ${profilInfo.borderColor}`,
                borderRadius: '99px', marginBottom: '18px',
              }}>
                <div style={{
                  width: '22px', height: '22px',
                  background: profilInfo.bg,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {(() => { const Icon = profilInfo.icon; return <Icon size={11} style={{ color: profilInfo.color }} />; })()}
                </div>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--foreground)' }}>
                  {profilInfo.label}
                </span>
              </div>
            )}

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--foreground)', marginBottom: '4px' }}>
              Créez votre compte
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '20px' }}>
              Quelques informations pour constituer votre dossier.
            </p>

            <div style={{ maxWidth: '400px' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Field label="Nom complet *" placeholder="Prénom Nom" value={form.nom} onChange={set('nom')} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <Field label="E-mail *" type="email" placeholder="vous@email.com" value={form.email} onChange={set('email')} />
                  <Field label="Téléphone *" type="tel" placeholder="+221 7X XXX XX XX" value={form.tel} onChange={set('tel')} />
                </div>

                <Field
                  label={profil === 'fonctionnaire' ? 'Ministère / Structure *' : "Employeur / Entreprise *"}
                  placeholder={profil === 'fonctionnaire' ? "Ex: Ministère de l'Éducation" : "Ex: Sonatel, Orange SN..."}
                  value={form.employeur}
                  onChange={set('employeur')}
                />

                <SelectField
                  label="Revenus nets mensuels *"
                  value={form.revenus}
                  onChange={set('revenus')}
                  options={REVENUS_OPTIONS}
                  placeholder="Sélectionnez une tranche"
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <Field label="Mot de passe *" type="password" placeholder="Min. 8 caractères" value={form.pwd} onChange={set('pwd')} />
                  <Field label="Confirmer *" type="password" placeholder="Répétez" value={form.pwd2} onChange={set('pwd2')} />
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => setAccepted(!accepted)}>
                  {accepted
                    ? <CheckSquare size={18} style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }} />
                    : <Square size={18} style={{ color: 'var(--border)', marginTop: '2px', flexShrink: 0 }} />
                  }
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
                    {"J'accepte les "}
                    <a href="#" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}
                      onClick={e => e.stopPropagation()}>
                      conditions d'utilisation
                    </a>
                  </span>
                </div>

                <div style={{ marginTop: '4px' }}>
                  <PrimaryBtn type="submit" disabled={!accepted}>
                    {loading
                      ? <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                          Création en cours…
                        </span>
                      : 'CRÉER MON COMPTE'}
                  </PrimaryBtn>
                </div>
              </form>

              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--muted-foreground)', marginTop: '16px', textAlign: 'center' }}>
                Déjà un compte ?{' '}
                <button type="button" onClick={() => onNavigate('login')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', padding: 0 }}>
                  CONNEXION
                </button>
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .auth-split { grid-template-columns: 1fr !important; }
          .auth-split > :first-child { min-height: 200px !important; justify-content: flex-end !important; }
          .auth-form-panel { padding: 32px 24px !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Root router ──────────────────────────────────────────────────────────────
export default function AuthPage({ page, onLogin, onNavigate }: Props) {
  const [regProfile, setRegProfile] = useState<ProfilType | null>(null);

  const handleProfileSelect = (p: ProfilType) => {
    setRegProfile(p);
    onNavigate('register');
  };

  if (page === 'register') return <RegisterScreen onLogin={onLogin} onNavigate={onNavigate} initialProfile={regProfile} />;
  if (page === 'login')    return <LoginScreen    onLogin={onLogin} onNavigate={onNavigate} />;
  return                          <WelcomeScreen  onLogin={onLogin} onNavigate={onNavigate} onProfileSelect={handleProfileSelect} />;
}
