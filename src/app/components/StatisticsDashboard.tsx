import { useState } from 'react';
import {
  TrendingUp, TrendingDown, FileText, CheckCircle2, XCircle,
  Clock, Banknote, Users, BarChart3, ArrowUpRight, ArrowDownRight,
  Calendar, Download, Filter
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  CartesianGrid, Legend, FunnelChart, Funnel, LabelList
} from 'recharts';
import type { AuthUser, UserRole } from '../App';

interface Props { user: AuthUser }

// ─── Palette ───────────────────────────────────────────────────────────────
const C = {
  bordeaux: '#7B1A2E',
  bordeauxLight: '#F5ECEE',
  bordeauxMid: '#B05070',
  gold: '#C8921A',
  goldLight: '#F0B840',
  green: '#1A6B44',
  greenLight: 'rgba(26,107,68,0.1)',
  purple: '#6D28D9',
  purpleLight: 'rgba(109,40,217,0.1)',
  muted: '#6B4A52',
  border: 'rgba(123,26,46,0.1)',
  bg: '#FAF7F7',
  text: '#1C0810',
};

// ─── Mock data ──────────────────────────────────────────────────────────────
const MONTHLY = [
  { mois: 'Jan', deposes: 21, approuves: 14, refuses: 3, montant: 182, delai: 5.8 },
  { mois: 'Fév', deposes: 26, approuves: 18, refuses: 2, montant: 241, delai: 5.1 },
  { mois: 'Mar', deposes: 31, approuves: 22, refuses: 4, montant: 298, delai: 4.7 },
  { mois: 'Avr', deposes: 27, approuves: 19, refuses: 3, montant: 263, delai: 4.5 },
  { mois: 'Mai', deposes: 38, approuves: 27, refuses: 5, montant: 347, delai: 4.2 },
  { mois: 'Jun', deposes: 42, approuves: 31, refuses: 4, montant: 418, delai: 3.9 },
];

const BY_TYPE = [
  { name: 'AM SA KER (Fonctionnaire)', value: 76, color: C.gold },
  { name: 'Financement standard', value: 55, color: C.bordeaux },
];

const BY_STATUS = [
  { name: 'Approuvés', value: 131, color: C.green },
  { name: 'En analyse', value: 18, color: C.gold },
  { name: 'Compléments requis', value: 7, color: C.purple },
  { name: 'Refusés', value: 21, color: '#C0392B' },
  { name: 'Nouveaux', value: 8, color: C.bordeaux },
];

const BY_BIEN = [
  { type: 'Villa R+1', count: 48, montant: 624 },
  { type: 'Villa F4', count: 31, montant: 294 },
  { type: 'Parcelle 200m²', count: 29, montant: 203 },
  { type: 'Duplex', count: 17, montant: 272 },
  { type: 'Parcelle 100m²', count: 6, montant: 36 },
];

const BY_AGENT = [
  { nom: 'Mme Thiombane', org: 'CPI', deposes: 47, approuves: 38, taux: 81, delai: 4.1 },
  { nom: 'Fatou Sarr', org: 'CPI', deposes: 38, approuves: 34, taux: 89, delai: 3.6 },
  { nom: 'Pierre Mendy', org: 'Banque', deposes: 31, approuves: 25, taux: 81, delai: 4.8 },
  { nom: 'Marème Diop', org: 'CPI', deposes: 29, approuves: 22, taux: 76, delai: 4.9 },
  { nom: 'Alioune Ndoye', org: 'Banque', deposes: 24, approuves: 22, taux: 92, delai: 3.2 },
];

const FUNNEL_DATA = [
  { name: 'Dossiers déposés', value: 185, fill: C.bordeaux },
  { name: 'Dossiers complets', value: 161, fill: C.bordeauxMid },
  { name: 'Dossiers analysés', value: 152, fill: C.gold },
  { name: 'Accord de principe', value: 131, fill: C.green },
  { name: 'Financement décaissé', value: 98, fill: '#15803D' },
];

const MONTHLY_AMOUNT = MONTHLY.map(m => ({ mois: m.mois, montant: m.montant, cumulé: 0 })).map((m, i, arr) => ({
  ...m,
  cumulé: arr.slice(0, i + 1).reduce((s, x) => s + x.montant, 0),
}));

const PERIODS = ['3 mois', '6 mois', '12 mois', 'Tout'];

// ─── Helper components ──────────────────────────────────────────────────────
function KpiCard({ label, value, sub, delta, positive, icon: Icon, color }: {
  label: string; value: string; sub: string; delta?: string; positive?: boolean;
  icon: React.ComponentType<{ className?: string }>; color: string;
}) {
  return (
    <div className="bg-white p-5" style={{ border: `1px solid ${C.border}` }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 flex items-center justify-center" style={{ background: `${color}14` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        {delta && (
          <div className={`flex items-center gap-1 px-2 py-0.5 ${positive ? 'text-[#1A6B44]' : 'text-[#C0392B]'}`}
            style={{ fontSize: '0.6875rem', fontWeight: 700, background: positive ? C.greenLight : 'rgba(192,57,43,0.08)' }}>
            {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {delta}
          </div>
        )}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.875rem', fontWeight: 800, color: C.text }}>{value}</div>
      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: C.text, marginTop: '2px' }}>{label}</div>
      <div style={{ fontSize: '0.75rem', color: C.muted, marginTop: '2px' }}>{sub}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: C.text, marginBottom: '1.25rem' }}>
      {children}
    </h3>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white p-3 shadow-sm" style={{ border: `1px solid ${C.border}`, fontSize: '0.8125rem' }}>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: '4px' }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2" style={{ background: p.color }} />
          <span style={{ color: C.muted }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: C.text }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Main component ──────────────────────────────────────────────────────────
export default function StatisticsDashboard({ user }: Props) {
  const [period, setPeriod] = useState('6 mois');
  const [activeTab, setActiveTab] = useState<'volume' | 'financier' | 'agents' | 'entonnoir'>('volume');

  const isAdmin = user.role === 'admin';
  const isAgentCPI = user.role === 'agent-cpi';

  const totalDossiers = MONTHLY.reduce((s, m) => s + m.deposes, 0);
  const totalApprouves = MONTHLY.reduce((s, m) => s + m.approuves, 0);
  const totalMontant = MONTHLY.reduce((s, m) => s + m.montant, 0);
  const tauxApprobation = Math.round((totalApprouves / totalDossiers) * 100);
  const delaiMoyen = (MONTHLY.reduce((s, m) => s + m.delai, 0) / MONTHLY.length).toFixed(1);

  return (
    <div className="space-y-6" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div className="bg-white p-5" style={{ border: `1px solid ${C.border}` }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.gold, marginBottom: '4px' }}>
              Rapports & Analyses
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 800, color: C.text }}>
              Tableau de bord statistique
            </h2>
            <p style={{ fontSize: '0.8125rem', color: C.muted, marginTop: '2px' }}>
              {isAdmin ? 'Plateforme CPI — Vue globale' : `Espace ${user.name} · CPI`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1" style={{ background: C.bordeauxLight }}>
              {PERIODS.map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className="px-3 py-1.5 transition-colors"
                  style={{ fontSize: '0.75rem', fontWeight: 600, background: period === p ? C.bordeaux : 'transparent', color: period === p ? 'white' : C.bordeaux }}>
                  {p}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 transition-colors"
              style={{ border: `1px solid ${C.border}`, color: C.muted, fontSize: '0.8125rem', fontWeight: 600 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.bordeauxLight; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              <Download className="w-3.5 h-3.5" /> Exporter
            </button>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Dossiers déposés" value={String(totalDossiers)} sub="6 derniers mois" delta="+18%" positive icon={FileText} color={C.bordeaux} />
        <KpiCard label="Dossiers approuvés" value={String(totalApprouves)} sub={`${tauxApprobation}% d'approbation`} delta="+4 pts" positive icon={CheckCircle2} color={C.green} />
        <KpiCard label="Montant accordé" value={`${totalMontant} M`} sub="FCFA engagés" delta="+23%" positive icon={Banknote} color={C.gold} />
        <KpiCard label="Délai moyen" value={`${delaiMoyen} j`} sub="De dépôt à décision" delta="-1,9 j" positive icon={Clock} color={C.bordeauxMid} />
        <KpiCard label="Dossiers refusés" value={String(MONTHLY.reduce((s, m) => s + m.refuses, 0))} sub="Taux de refus : 11%" delta="-2 pts" positive icon={XCircle} color="#C0392B" />
      </div>

      {/* Tab navigation */}
      <div className="bg-white" style={{ border: `1px solid ${C.border}` }}>
        <div className="flex border-b overflow-x-auto" style={{ borderColor: C.border }}>
          {([
            ['volume', 'Volume & Activité'],
            ['financier', 'Analyse financière'],
            ['agents', 'Performance agents'],
            ['entonnoir', 'Entonnoir de conversion'],
          ] as const).map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className="px-5 py-3.5 whitespace-nowrap transition-colors flex-shrink-0"
              style={{
                fontSize: '0.875rem', fontWeight: activeTab === id ? 700 : 500,
                color: activeTab === id ? C.bordeaux : C.muted,
                borderBottom: activeTab === id ? `2px solid ${C.bordeaux}` : '2px solid transparent',
              }}>
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ── Tab: Volume ──────────────────────────────────────────────── */}
          {activeTab === 'volume' && (
            <div className="space-y-8">
              {/* Monthly bar + line */}
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <SectionTitle>Évolution mensuelle des dossiers</SectionTitle>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={MONTHLY} barGap={4} barSize={18}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(123,26,46,0.06)" vertical={false} />
                      <XAxis dataKey="mois" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(123,26,46,0.04)' }} />
                      <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '12px' }} />
                      <Bar dataKey="deposes" name="Déposés" fill={C.bordeauxLight} stroke={C.bordeaux} strokeWidth={1} radius={[2, 2, 0, 0]} />
                      <Bar dataKey="approuves" name="Approuvés" fill={C.bordeaux} radius={[2, 2, 0, 0]} />
                      <Bar dataKey="refuses" name="Refusés" fill="#EDE4E6" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <SectionTitle>Répartition par type</SectionTitle>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={BY_TYPE} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={4} dataKey="value">
                        {BY_TYPE.map((e, i) => <Cell key={`type-cell-${i}`} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ border: `1px solid ${C.border}`, borderRadius: 0, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {BY_TYPE.map(d => (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 flex-shrink-0" style={{ background: d.color }} />
                          <span style={{ fontSize: '0.75rem', color: C.muted }}>{d.name}</span>
                        </div>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: C.text }}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status + Biens */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <SectionTitle>Répartition par statut</SectionTitle>
                  <div className="space-y-3">
                    {BY_STATUS.map(s => {
                      const total = BY_STATUS.reduce((a, x) => a + x.value, 0);
                      const pct = Math.round((s.value / total) * 100);
                      return (
                        <div key={s.name}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 flex-shrink-0" style={{ background: s.color }} />
                              <span style={{ fontSize: '0.8125rem', color: C.text, fontWeight: 500 }}>{s.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: C.text }}>{s.value}</span>
                              <span style={{ fontSize: '0.75rem', color: C.muted }}>({pct}%)</span>
                            </div>
                          </div>
                          <div className="h-1.5" style={{ background: 'rgba(123,26,46,0.08)' }}>
                            <div className="h-full transition-all" style={{ width: `${pct}%`, background: s.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <SectionTitle>Types de bien financé</SectionTitle>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={BY_BIEN} layout="vertical" barSize={14}>
                      <XAxis type="number" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="type" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} width={110} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(123,26,46,0.04)' }} />
                      <Bar dataKey="count" name="Dossiers" fill={C.bordeaux} radius={[0, 2, 2, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Délai moyen */}
              <div>
                <SectionTitle>Délai moyen de traitement (jours)</SectionTitle>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={MONTHLY}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(123,26,46,0.06)" vertical={false} />
                    <XAxis dataKey="mois" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} domain={[3, 7]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="delai" name="Délai (j)" stroke={C.gold} strokeWidth={2.5}
                      dot={{ fill: C.gold, r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: C.gold }} />
                  </LineChart>
                </ResponsiveContainer>
                <p style={{ fontSize: '0.75rem', color: C.muted, marginTop: '8px' }}>
                  Le délai moyen est passé de 5,8 jours en janvier à 3,9 jours en juin — amélioration de 33%.
                </p>
              </div>
            </div>
          )}

          {/* ── Tab: Financier ─────────────────────────────────────────── */}
          {activeTab === 'financier' && (
            <div className="space-y-8">
              {/* KPIs financiers */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Montant total accordé', value: `${totalMontant} M FCFA`, color: C.bordeaux },
                  { label: 'Montant moyen / dossier', value: `${Math.round(totalMontant / totalApprouves * 1000).toLocaleString('fr-FR')} FCFA`, color: C.gold },
                  { label: 'Montant AM SA KER', value: '1 027 M FCFA', color: C.gold },
                  { label: 'Montant standard', value: '722 M FCFA', color: C.bordeaux },
                ].map(k => (
                  <div key={k.label} className="p-5 bg-white" style={{ border: `1px solid ${C.border}` }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 800, color: k.color }}>{k.value}</div>
                    <div style={{ fontSize: '0.8125rem', color: C.muted, marginTop: '4px' }}>{k.label}</div>
                  </div>
                ))}
              </div>

              {/* Montant mensuel area + cumulé */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <SectionTitle>Montants accordés par mois (M FCFA)</SectionTitle>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={MONTHLY}>
                      <defs>
                        <linearGradient id="colorMontant" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={C.bordeaux} stopOpacity={0.15} />
                          <stop offset="95%" stopColor={C.bordeaux} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(123,26,46,0.06)" vertical={false} />
                      <XAxis dataKey="mois" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="montant" name="Montant (M FCFA)"
                        stroke={C.bordeaux} strokeWidth={2.5} fill="url(#colorMontant)"
                        dot={{ fill: C.bordeaux, r: 3, strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <SectionTitle>Cumul des financements (M FCFA)</SectionTitle>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={MONTHLY_AMOUNT}>
                      <defs>
                        <linearGradient id="colorCumul" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={C.gold} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={C.gold} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(123,26,46,0.06)" vertical={false} />
                      <XAxis dataKey="mois" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="cumulé" name="Cumul (M FCFA)"
                        stroke={C.gold} strokeWidth={2.5} fill="url(#colorCumul)"
                        dot={{ fill: C.gold, r: 3, strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Montant par type de bien */}
              <div>
                <SectionTitle>Volume financier par type de bien (M FCFA)</SectionTitle>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={BY_BIEN} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(123,26,46,0.06)" vertical={false} />
                    <XAxis dataKey="type" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(123,26,46,0.04)' }} />
                    <Bar dataKey="montant" name="Montant (M FCFA)" radius={[3, 3, 0, 0]}>
                      {BY_BIEN.map((_, i) => (
                        <Cell key={`bien-cell-${i}`} fill={i % 2 === 0 ? C.bordeaux : C.bordeauxMid} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Comparatif Fonctionnaire vs Standard */}
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'AM SA KER — Fonctionnaire', dossiers: 76, montant: 1027, taux: '6,5%', delai: '3,6 j', color: C.gold },
                  { label: 'Financement standard', dossiers: 55, montant: 722, taux: '9,5%', delai: '4,8 j', color: C.bordeaux },
                ].map(o => (
                  <div key={o.label} className="p-5" style={{ border: `2px solid ${o.color}30`, background: `${o.color}06` }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: o.color, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
                      {o.label}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { l: 'Dossiers', v: o.dossiers },
                        { l: 'Montant total', v: `${o.montant} M` },
                        { l: 'Taux moyen', v: o.taux },
                        { l: 'Délai moyen', v: o.delai },
                      ].map(({ l, v }) => (
                        <div key={l} className="p-3 bg-white" style={{ border: `1px solid ${C.border}` }}>
                          <div style={{ fontSize: '0.625rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.0625rem', fontWeight: 800, color: C.text, marginTop: '2px' }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Tab: Agents ────────────────────────────────────────────── */}
          {activeTab === 'agents' && (
            <div className="space-y-8">
              {/* Overview */}
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: 'Agents actifs', value: '25', sub: 'CPI + Banques partenaires', color: C.bordeaux },
                  { label: 'Taux moyen d\'approbation', value: '83,8%', sub: 'Sur tous les agents', color: C.green },
                  { label: 'Délai moyen/agent', value: '4,1 j', sub: 'De réception à décision', color: C.gold },
                ].map(k => (
                  <div key={k.label} className="p-5 bg-white" style={{ border: `1px solid ${C.border}` }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: k.color }}>{k.value}</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: C.text, marginTop: '2px' }}>{k.label}</div>
                    <div style={{ fontSize: '0.75rem', color: C.muted }}>{k.sub}</div>
                  </div>
                ))}
              </div>

              {/* Agent table */}
              <div>
                <SectionTitle>Performance individuelle des agents</SectionTitle>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                        {['Agent', 'Organisation', 'Déposés', 'Approuvés', 'Taux', 'Délai moy.', 'Performance'].map(h => (
                          <th key={h} className="px-4 py-3 text-left" style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.muted }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {BY_AGENT.map((a) => {
                        const orgColor = a.org === 'CPI' ? C.bordeaux : C.gold;
                        const perfColor = a.taux >= 85 ? C.green : a.taux >= 75 ? C.gold : '#C0392B';
                        return (
                          <tr key={a.nom} style={{ borderBottom: `1px solid rgba(123,26,46,0.05)` }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.bg; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white'; }}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 flex items-center justify-center text-white flex-shrink-0"
                                  style={{ background: orgColor, fontSize: '0.6875rem', fontWeight: 700 }}>
                                  {a.nom.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: C.text }}>{a.nom}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5" style={{ background: `${orgColor}14`, color: orgColor, fontSize: '0.6875rem', fontWeight: 700 }}>{a.org}</span>
                            </td>
                            <td className="px-4 py-3 font-mono" style={{ fontSize: '0.875rem', fontWeight: 600, color: C.text }}>{a.deposes}</td>
                            <td className="px-4 py-3 font-mono" style={{ fontSize: '0.875rem', fontWeight: 600, color: C.green }}>{a.approuves}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5" style={{ background: `${perfColor}14`, color: perfColor, fontSize: '0.75rem', fontWeight: 700 }}>{a.taux}%</span>
                            </td>
                            <td className="px-4 py-3 font-mono" style={{ fontSize: '0.875rem', color: C.muted }}>{a.delai} j</td>
                            <td className="px-4 py-3" style={{ minWidth: '120px' }}>
                              <div className="h-1.5" style={{ background: 'rgba(123,26,46,0.1)' }}>
                                <div className="h-full" style={{ width: `${a.taux}%`, background: perfColor }} />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Taux par organisation */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <SectionTitle>Volume par organisation</SectionTitle>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[
                      { org: 'CPI', deposes: 114, approuves: 94 },
                      { org: 'Banque', deposes: 55, approuves: 47 },
                    ]} barGap={4} barSize={22}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(123,26,46,0.06)" vertical={false} />
                      <XAxis dataKey="org" tick={{ fontSize: 12, fill: C.muted }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(123,26,46,0.04)' }} />
                      <Bar dataKey="deposes" name="Déposés" fill={C.bordeauxLight} stroke={C.bordeaux} strokeWidth={1} radius={[2, 2, 0, 0]} />
                      <Bar dataKey="approuves" name="Approuvés" fill={C.bordeaux} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <SectionTitle>Taux d'approbation par organisation</SectionTitle>
                  <div className="space-y-4 pt-2">
                    {[
                      { org: 'Banque', taux: 85, color: C.gold },
                      { org: 'CPI', taux: 79, color: C.bordeaux },
                    ].map(o => (
                      <div key={o.org}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: C.text }}>{o.org}</span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: o.color }}>{o.taux}%</span>
                        </div>
                        <div className="h-2" style={{ background: 'rgba(123,26,46,0.08)' }}>
                          <div className="h-full" style={{ width: `${o.taux}%`, background: o.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Entonnoir ─────────────────────────────────────────── */}
          {activeTab === 'entonnoir' && (
            <div className="space-y-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Funnel visual */}
                <div>
                  <SectionTitle>Entonnoir de conversion</SectionTitle>
                  <div className="space-y-2">
                    {FUNNEL_DATA.map((step, i) => {
                      const prev = i === 0 ? step.value : FUNNEL_DATA[i - 1].value;
                      const convRate = i === 0 ? 100 : Math.round((step.value / FUNNEL_DATA[0].value) * 100);
                      const stepRate = i === 0 ? 100 : Math.round((step.value / prev) * 100);
                      const width = Math.round((step.value / FUNNEL_DATA[0].value) * 100);
                      return (
                        <div key={step.name}>
                          <div className="flex items-center justify-between mb-1">
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: C.text }}>{step.name}</span>
                            <div className="flex items-center gap-3">
                              {i > 0 && (
                                <span style={{ fontSize: '0.6875rem', color: C.muted }}>
                                  Étape: {stepRate}%
                                </span>
                              )}
                              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: C.text, fontFamily: 'var(--font-display)' }}>{step.value}</span>
                            </div>
                          </div>
                          <div className="relative h-8 flex items-center" style={{ background: 'rgba(123,26,46,0.06)' }}>
                            <div className="h-full flex items-center justify-end pr-3 transition-all"
                              style={{ width: `${width}%`, background: step.fill, minWidth: '2rem' }}>
                              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'white' }}>{convRate}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 p-4" style={{ background: C.bordeauxLight, border: `1px solid rgba(123,26,46,0.15)` }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: C.bordeaux }}>Taux de conversion global</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: C.bordeaux }}>53%</div>
                    <div style={{ fontSize: '0.75rem', color: C.muted }}>Des dossiers déposés aboutissent à un décaissement</div>
                  </div>
                </div>

                {/* Conversion breakdown */}
                <div>
                  <SectionTitle>Analyse des pertes</SectionTitle>
                  <div className="space-y-4">
                    {[
                      { etape: 'Dossiers incomplets', pertes: 24, raison: 'Documents manquants ou incorrects', color: C.gold },
                      { etape: 'Non éligibles', pertes: 9, raison: 'Critères d\'éligibilité non satisfaits', color: C.bordeauxMid },
                      { etape: 'Refusés en analyse', pertes: 21, raison: 'Capacité de remboursement insuffisante', color: '#C0392B' },
                      { etape: 'Sans suite', pertes: 33, raison: 'Client désisté avant décaissement', color: C.muted },
                    ].map(p => (
                      <div key={p.etape} className="p-4 bg-white" style={{ border: `1px solid ${C.border}` }}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: C.text }}>{p.etape}</div>
                            <div style={{ fontSize: '0.75rem', color: C.muted }}>{p.raison}</div>
                          </div>
                          <div className="px-3 py-1" style={{ background: `${p.color}14`, color: p.color, fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 800 }}>
                            -{p.pertes}
                          </div>
                        </div>
                        <div className="h-1" style={{ background: 'rgba(123,26,46,0.08)' }}>
                          <div className="h-full" style={{ width: `${Math.round((p.pertes / 185) * 100)}%`, background: p.color }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <SectionTitle>Évolution du taux de conversion</SectionTitle>
                    <ResponsiveContainer width="100%" height={140}>
                      <LineChart data={[
                        { mois: 'Jan', taux: 44 },
                        { mois: 'Fév', taux: 48 },
                        { mois: 'Mar', taux: 50 },
                        { mois: 'Avr', taux: 49 },
                        { mois: 'Mai', taux: 52 },
                        { mois: 'Jun', taux: 53 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(123,26,46,0.06)" vertical={false} />
                        <XAxis dataKey="mois" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                        <YAxis domain={[40, 60]} tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="taux" name="Taux (%)" stroke={C.green} strokeWidth={2.5}
                          dot={{ fill: C.green, r: 4, strokeWidth: 0 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Conversion par type */}
              <div>
                <SectionTitle>Taux de conversion : AM SA KER vs Standard</SectionTitle>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: 'AM SA KER (Fonctionnaire)', deposes: 100, convertis: 62, taux: 62, color: C.gold },
                    { label: 'Financement standard', deposes: 85, convertis: 36, taux: 42, color: C.bordeaux },
                  ].map(o => (
                    <div key={o.label} className="p-5 bg-white" style={{ border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: o.color, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
                        {o.label}
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {[
                          { l: 'Déposés', v: o.deposes },
                          { l: 'Décaissés', v: o.convertis },
                          { l: 'Taux', v: `${o.taux}%` },
                        ].map(({ l, v }) => (
                          <div key={l} className="text-center p-2" style={{ background: C.bg }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: C.text }}>{v}</div>
                            <div style={{ fontSize: '0.625rem', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l}</div>
                          </div>
                        ))}
                      </div>
                      <div className="h-2.5" style={{ background: 'rgba(123,26,46,0.08)' }}>
                        <div className="h-full" style={{ width: `${o.taux}%`, background: o.color }} />
                      </div>
                      <p style={{ fontSize: '0.75rem', color: C.muted, marginTop: '8px' }}>
                        {o.label === 'AM SA KER (Fonctionnaire)'
                          ? 'Les dossiers Fonctionnaire présentent un taux de conversion supérieur de 20 pts grâce à des dossiers mieux préparés.'
                          : 'Le suivi renforcé pourrait améliorer ce taux — réduction des dossiers incomplets recommandée.'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
