import { Home, ChevronLeft, ChevronRight, Info } from 'lucide-react';

// Dark forest green from the convention document palette — not in design system tokens
const FOREST = '#163824';
const FOREST_LIGHT = '#1F4D32';
const FOREST_HEADER = '#1B4530';
const GOLD = '#C8A84B';

interface Row {
  label: string;
  value: string;
  highlight?: 'bordeaux' | 'green';
}

const CLASSIQUE_ROWS: Row[] = [
  { label: 'Cible',             value: 'Fonctionnaires & Décisionnaires', highlight: 'bordeaux' },
  { label: 'Revenus min.',      value: '350 000 FCFA/mois' },
  { label: 'Cap. endettement',  value: '45 % à 60 % selon revenus' },
  { label: 'Taux d\'intérêt HT', value: '6,8 % (sans rachat)' },
  { label: 'Durée max.',        value: '300 mois (25 ans)' },
  { label: 'Apport',            value: 'Financement à 100 % possible' },
  { label: 'Garantie',          value: 'Hypothèque 1er rang\n+ délégation assurance' },
];

const AMSAKAR_ROWS: Row[] = [
  { label: 'Cible',             value: 'Fonctionnaires (titres précaires)', highlight: 'green' },
  { label: 'Revenus min.',      value: '250 000 FCFA/mois' },
  { label: 'Cap. endettement',  value: '45 % à 60 % selon revenus' },
  { label: 'Taux d\'intérêt HT', value: '8,5 % (<15 ans) / 9 % (15-25 ans)' },
  { label: 'Durée max.',        value: '300 mois (25 ans)' },
  { label: 'Apport',            value: 'Financement à 100 % possible' },
  { label: 'Titres acceptés',   value: 'Permis d\'occuper, délibération\ncommunale, attribution domaines' },
];

function ProductCard({
  number,
  title,
  subtitle,
  rows,
  accent,
  headerBg,
  icon,
}: {
  number: string;
  title: string;
  subtitle: string;
  rows: Row[];
  accent: string;
  headerBg: string;
  icon?: React.ReactNode;
}) {
  return (
    <div style={{
      flex: 1,
      minWidth: 0,
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '6px',
      overflow: 'hidden',
      background: 'white',
    }}>
      {/* Card header */}
      <div style={{
        background: headerBg,
        padding: '16px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '22px', height: '22px',
            borderRadius: '50%',
            border: '1.5px solid rgba(255,255,255,0.6)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.6875rem', fontWeight: 700,
            color: 'white',
            flexShrink: 0,
          }}>{number}</span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.9375rem', fontWeight: 700,
            color: 'white',
            letterSpacing: '0.04em',
            textTransform: 'uppercase' as const,
          }}>{title}</span>
          {icon}
        </div>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.65)',
          marginLeft: '32px',
          fontStyle: 'italic',
        }}>{subtitle}</p>
      </div>

      {/* Comparison rows */}
      {rows.map((row, i) => (
        <div key={row.label} style={{
          display: 'flex',
          borderBottom: i < rows.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
          padding: '11px 20px',
          background: i % 2 === 0 ? 'white' : '#FAFAF9',
          alignItems: 'flex-start',
          gap: '12px',
        }}>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.8125rem',
            color: 'var(--muted-foreground)',
            fontWeight: 500,
            width: '148px',
            flexShrink: 0,
          }}>{row.label}</span>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.8125rem',
            fontWeight: row.highlight ? 700 : 500,
            color: row.highlight === 'bordeaux'
              ? 'var(--primary)'
              : row.highlight === 'green'
              ? '#1A6B44'
              : 'var(--foreground)',
            whiteSpace: 'pre-line' as const,
            lineHeight: 1.5,
          }}>{row.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function ConventionBancairePage() {
  return (
    <div style={{
      minHeight: '100%',
      background: FOREST,
      borderRadius: '4px',
      overflow: 'hidden',
    }}>
      {/* Inner content */}
      <div style={{ padding: '32px 32px 40px' }}>

        {/* Breadcrumb / chapter tag */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          marginBottom: '10px',
        }}>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.6875rem', fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase' as const,
            color: GOLD,
          }}>
            Convention de financement — 2/3
          </span>
        </div>

        {/* Page heading */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          fontWeight: 700,
          color: 'white',
          lineHeight: 1.2,
          marginBottom: '28px',
        }}>
          Les Deux Produits Financiers Clés
        </h1>

        {/* Cards row */}
        <div style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
        }}>
          <ProductCard
            number="①"
            title="Crédit Immobilier Classique"
            subtitle="Avec Titre Foncier ou Bail"
            rows={CLASSIQUE_ROWS}
            accent="var(--primary)"
            headerBg="var(--sidebar)"
          />
          <ProductCard
            number="②"
            title="Offre AM SA KER"
            subtitle="Pour fonctionnaires sans Titre Foncier (titres précaires)"
            rows={AMSAKAR_ROWS}
            accent="#1A6B44"
            headerBg={FOREST_HEADER}
            icon={<Home size={15} style={{ color: 'rgba(255,255,255,0.8)', flexShrink: 0 }} />}
          />
        </div>

        {/* Info note */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          marginTop: '24px',
          padding: '10px 16px',
          background: 'rgba(255,255,255,0.07)',
          borderRadius: '4px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <Info size={13} style={{ color: GOLD, flexShrink: 0 }} />
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.55)',
          }}>
            Convention de financement · Articles I &amp; II · Taux susceptibles d'évoluer selon conditions marché
          </span>
        </div>

        {/* Pagination nav */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: '24px',
        }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '4px', padding: '7px 14px',
            fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: 500,
            color: 'rgba(255,255,255,0.65)', cursor: 'pointer',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          >
            <ChevronLeft size={14} /> Précédent
          </button>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[1,2,3].map(n => (
              <div key={n} style={{
                width: '28px', height: '4px',
                borderRadius: '2px',
                background: n === 2 ? GOLD : 'rgba(255,255,255,0.2)',
              }} />
            ))}
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: GOLD, border: 'none',
            borderRadius: '4px', padding: '7px 14px',
            fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: 700,
            color: FOREST, cursor: 'pointer',
            transition: 'opacity 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Suivant <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
