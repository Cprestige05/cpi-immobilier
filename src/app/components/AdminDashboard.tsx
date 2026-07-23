import { useState } from 'react';
import {
  TrendingUp, Users, FileText, Building2, CheckCircle2,
  Clock, AlertCircle, XCircle, BarChart3, ArrowUpRight,
  Shield, Banknote, RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import type { AuthUser } from '../App';
import { useClientContext } from '../contexts/ClientContext';
import DocumentsClientsModule from './DocumentsClientsModule';
import DocumentsAdminModule from './DocumentsAdminModule';
import ChantierModule from './ChantierModule';
import DecaissementsModule from './DecaissementsModule';
import NotificationsModule from './NotificationsModule';
import HistoriqueModule from './HistoriqueModule';

interface Props { user: AuthUser; activeNav?: string }

const MONTHLY_DATA = [
  { mois: 'Jan', approuvés: 14, refusés: 3, montant: 182 },
  { mois: 'Fév', approuvés: 18, refusés: 2, montant: 241 },
  { mois: 'Mar', approuvés: 22, refusés: 4, montant: 298 },
  { mois: 'Avr', approuvés: 19, refusés: 3, montant: 263 },
  { mois: 'Mai', approuvés: 27, refusés: 5, montant: 347 },
  { mois: 'Jun', approuvés: 31, refusés: 4, montant: 418 },
];

const PIE_DATA = [
  { name: 'AM SA KER (CHUES)', value: 58, color: '#C8921A' },
  { name: 'Financement standard', value: 42, color: '#7B1A2E' },
];

const PARTNERS = [
  { name: 'CPI', role: 'Promoteur immobilier', dossiers: 131, traites: 112, en_cours: 19, color: '#7B1A2E' },
  { name: 'CHUES', role: 'Coopérative des enseignants', dossiers: 76, traites: 64, en_cours: 12, color: '#1A6B44' },
  { name: 'CBAO', role: 'Partenaire bancaire officiel', dossiers: 131, traites: 98, en_cours: 33, color: '#C8921A' },
];

const RECENT_ACTIVITY = [
  { action: 'Dossier DEM-2026-04721 approuvé', agent: 'F. Sarr (CHUES)', time: 'Il y a 12 min', type: 'approve' },
  { action: 'Nouveau dossier déposé par I. Sall', agent: 'Système', time: 'Il y a 34 min', type: 'new' },
  { action: 'Compléments requis — DEM-2026-04698', agent: 'I. Fall (CPI)', time: 'Il y a 1h 20min', type: 'warn' },
  { action: 'Décaissement effectué — DEM-2026-04589', agent: 'P. Mendy (CBAO)', time: 'Il y a 2h 05min', type: 'disburse' },
  { action: 'Dossier DEM-2026-04512 refusé', agent: 'I. Fall (CPI)', time: 'Il y a 3h 18min', type: 'refuse' },
];

const USERS_BY_ROLE = [
  { role: 'Clients CHUES', count: 1247, color: '#C8921A' },
  { role: 'Clients Grand Public', count: 893, color: '#7B1A2E' },
  { role: 'Agents CPI', count: 8, color: '#6B4A52' },
  { role: 'Agents CHUES', count: 5, color: '#1A6B44' },
  { role: 'Agents CBAO', count: 12, color: '#C8921A' },
];

export default function AdminDashboard({ user, activeNav }: Props) {
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'partners'>('overview');

  const MODULE_NAVS = ['documents-clients', 'documents-admin', 'chantier', 'decaissements', 'notifications-agent', 'historique'];
  if (MODULE_NAVS.includes(activeNav ?? '')) {
    return <AdminModuleView activeNav={activeNav!} agentName={user.name} />;
  }

  return (
    <div className="space-y-6">
      {/* Admin header */}
      <div className="bg-white border border-[rgba(123,26,46,0.1)] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[#C8921A] mb-1" style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Accès Administrateur</div>
            <h2 className="text-[#1C0810]" style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 800 }}>Vue globale de la plateforme</h2>
          </div>
          <div className="flex gap-2">
            {(['overview', 'users', 'partners'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                className={`px-4 py-2 transition-colors ${activeSection === s ? 'bg-[#7B1A2E] text-white' : 'bg-[#F5ECEE] text-[#7B1A2E] hover:bg-[#dce8f8]'}`}
                style={{ fontSize: '0.8125rem', fontWeight: 600 }}
              >
                {s === 'overview' ? 'Vue d\'ensemble' : s === 'users' ? 'Utilisateurs' : 'Partenaires'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeSection === 'overview' && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Dossiers totaux', value: '131', sub: '+12 ce mois', icon: FileText, color: '#7B1A2E', positive: true },
              { label: 'Montant total accordé', value: '1 749 M', sub: 'FCFA engagés', icon: Banknote, color: '#1A6B44', positive: true },
              { label: 'Taux d\'approbation', value: '82%', sub: '↑ 4 pts vs M-1', icon: TrendingUp, color: '#1A6B44', positive: true },
              { label: 'Délai moyen de traitement', value: '4,2 j', sub: '↓ 0,8 j vs M-1', icon: Clock, color: '#C8921A', positive: true },
            ].map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="bg-white border border-[rgba(123,26,46,0.1)] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 flex items-center justify-center" style={{ background: `${kpi.color}12` }}>
                      <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#1A6B44]" />
                  </div>
                  <div className="text-[#1C0810]" style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>{kpi.value}</div>
                  <div className="text-[#6B4A52] mt-0.5" style={{ fontSize: '0.75rem', fontWeight: 500 }}>{kpi.label}</div>
                  <div className="text-[#1A6B44] mt-1" style={{ fontSize: '0.6875rem', fontWeight: 600 }}>{kpi.sub}</div>
                </div>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Monthly bars */}
            <div className="lg:col-span-2 bg-white border border-[rgba(123,26,46,0.1)] p-6">
              <h3 className="text-[#1C0810] mb-5" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Évolution mensuelle des dossiers</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={MONTHLY_DATA} barGap={4}>
                  <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#6B4A52' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B4A52' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ border: '1px solid rgba(123,26,46,0.12)', borderRadius: 0, fontSize: 12, background: 'white' }}
                    cursor={{ fill: 'rgba(123,26,46,0.04)' }}
                  />
                  <Bar dataKey="approuvés" fill="#7B1A2E" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="refusés" fill="#EDE4E6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-5 mt-3">
                <div className="flex items-center gap-2"><div className="w-3 h-3" style={{ background: '#7B1A2E' }} /><span className="text-[#6B4A52]" style={{ fontSize: '0.75rem' }}>Approuvés</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3" style={{ background: '#EDE4E6' }} /><span className="text-[#6B4A52]" style={{ fontSize: '0.75rem' }}>Refusés</span></div>
              </div>
            </div>

            {/* Pie */}
            <div className="bg-white border border-[rgba(123,26,46,0.1)] p-6">
              <h3 className="text-[#1C0810] mb-5" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Répartition par type</h3>
              <div className="flex justify-center">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {PIE_DATA.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ border: '1px solid rgba(123,26,46,0.12)', borderRadius: 0, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {PIE_DATA.map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5" style={{ background: d.color }} />
                      <span className="text-[#6B4A52]" style={{ fontSize: '0.75rem' }}>{d.name}</span>
                    </div>
                    <span className="text-[#1C0810]" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Montants line + Activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white border border-[rgba(123,26,46,0.1)] p-6">
              <h3 className="text-[#1C0810] mb-5" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Montants accordés (M FCFA)</h3>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={MONTHLY_DATA}>
                  <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#6B4A52' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B4A52' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ border: '1px solid rgba(123,26,46,0.12)', borderRadius: 0, fontSize: 12 }} />
                  <Line type="monotone" dataKey="montant" stroke="#C8921A" strokeWidth={2} dot={{ fill: '#C8921A', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Recent activity */}
            <div className="bg-white border border-[rgba(123,26,46,0.1)] p-6">
              <h3 className="text-[#1C0810] mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Activité récente</h3>
              <div className="space-y-3">
                {RECENT_ACTIVITY.map((a, i) => {
                  const icons = {
                    approve: <CheckCircle2 className="w-3.5 h-3.5 text-[#1A6B44]" />,
                    new: <FileText className="w-3.5 h-3.5 text-[#7B1A2E]" />,
                    warn: <AlertCircle className="w-3.5 h-3.5 text-[#C8921A]" />,
                    disburse: <Banknote className="w-3.5 h-3.5 text-[#7B1A2E]" />,
                    refuse: <XCircle className="w-3.5 h-3.5 text-[#C0392B]" />,
                  };
                  return (
                    <div key={i} className="flex items-start gap-3 py-2 border-b border-[rgba(123,26,46,0.05)]">
                      <div className="mt-0.5 flex-shrink-0">{icons[a.type as keyof typeof icons]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[#1C0810]" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{a.action}</div>
                        <div className="text-[#6B4A52]" style={{ fontSize: '0.75rem' }}>{a.agent}</div>
                      </div>
                      <div className="text-[#6B4A52] flex-shrink-0" style={{ fontSize: '0.6875rem' }}>{a.time}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {activeSection === 'users' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white border border-[rgba(123,26,46,0.1)] p-6">
            <h3 className="text-[#1C0810] mb-5" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Répartition des utilisateurs</h3>
            <div className="space-y-3">
              {USERS_BY_ROLE.map((r) => (
                <div key={r.role} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#1C0810]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>{r.role}</span>
                      <span className="text-[#1C0810]" style={{ fontSize: '0.875rem', fontWeight: 700 }}>{r.count.toLocaleString('fr-FR')}</span>
                    </div>
                    <div className="h-1.5 bg-[#EDE4E6] w-full">
                      <div className="h-full transition-all" style={{ width: `${Math.min((r.count / 1247) * 100, 100)}%`, background: r.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-[rgba(123,26,46,0.08)]">
              <div className="flex items-center justify-between">
                <span className="text-[#6B4A52]" style={{ fontSize: '0.875rem' }}>Total utilisateurs</span>
                <span className="text-[#1C0810]" style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800 }}>
                  {USERS_BY_ROLE.reduce((acc, r) => acc + r.count, 0).toLocaleString('fr-FR')}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white border border-[rgba(123,26,46,0.1)] p-6">
            <h3 className="text-[#1C0810] mb-5" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Agents actifs</h3>
            <div className="space-y-3">
              {[
                { name: 'Ibrahima Fall', org: 'CPI', dossiers: 47, rate: '84%' },
                { name: 'Fatou Sarr', org: 'CHUES', dossiers: 38, rate: '89%' },
                { name: 'Pierre Mendy', org: 'CBAO', dossiers: 31, rate: '81%' },
                { name: 'Marème Diop', org: 'CPI', dossiers: 29, rate: '77%' },
                { name: 'Alioune Ndoye', org: 'CBAO', dossiers: 24, rate: '92%' },
              ].map((agent) => (
                <div key={agent.name} className="flex items-center justify-between p-3 bg-[#FAF7F7]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#7B1A2E] flex items-center justify-center text-white" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                      {agent.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-[#1C0810]" style={{ fontSize: '0.875rem', fontWeight: 600 }}>{agent.name}</div>
                      <div className="text-[#6B4A52]" style={{ fontSize: '0.75rem' }}>{agent.org} · {agent.dossiers} dossiers</div>
                    </div>
                  </div>
                  <div className="text-[#1A6B44]" style={{ fontSize: '0.875rem', fontWeight: 700 }}>{agent.rate}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'partners' && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {PARTNERS.map((p) => (
              <div key={p.name} className="bg-white border border-[rgba(123,26,46,0.1)] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 flex items-center justify-center" style={{ background: `${p.color}12`, border: `2px solid ${p.color}25` }}>
                    <Shield className="w-5 h-5" style={{ color: p.color }} />
                  </div>
                  <div>
                    <div className="text-[#1C0810]" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.125rem' }}>{p.name}</div>
                    <div className="text-[#6B4A52]" style={{ fontSize: '0.75rem' }}>{p.role}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Total', value: p.dossiers },
                    { label: 'Traités', value: p.traites },
                    { label: 'En cours', value: p.en_cours },
                  ].map(s => (
                    <div key={s.label} className="p-3 bg-[#FAF7F7] text-center">
                      <div className="text-[#1C0810]" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.125rem' }}>{s.value}</div>
                      <div className="text-[#6B4A52]" style={{ fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 h-1.5 bg-[#EDE4E6]">
                  <div className="h-full" style={{ width: `${Math.round((p.traites / p.dossiers) * 100)}%`, background: p.color }} />
                </div>
                <div className="text-[#6B4A52] mt-1" style={{ fontSize: '0.75rem' }}>
                  {Math.round((p.traites / p.dossiers) * 100)}% de dossiers traités
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-[rgba(123,26,46,0.1)] p-6">
            <h3 className="text-[#1C0810] mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Conventions & SLA</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(123,26,46,0.08)]">
                    {['Partenaire', 'Type de convention', 'Date de signature', 'Validité', 'Statut'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[#6B4A52]" style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { partner: 'CHUES', type: 'Convention AM SA KER — Enseignants CHUES', date: '01 avr. 2026', validity: '31 mars 2027', status: 'Actif' },
                    { partner: 'CBAO', type: 'Convention de financement enseignants', date: '17 mars 2026', validity: '16 mars 2027', status: 'Actif' },
                    { partner: 'CBAO', type: 'Convention de financement enseignants', date: '31 mars 2026', validity: '30 mars 2027', status: 'Actif' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-[rgba(123,26,46,0.05)]">
                      <td className="px-4 py-3 text-[#1C0810]" style={{ fontSize: '0.875rem', fontWeight: 600 }}>{row.partner}</td>
                      <td className="px-4 py-3 text-[#6B4A52]" style={{ fontSize: '0.875rem' }}>{row.type}</td>
                      <td className="px-4 py-3 text-[#6B4A52]" style={{ fontSize: '0.875rem' }}>{row.date}</td>
                      <td className="px-4 py-3 text-[#6B4A52]" style={{ fontSize: '0.875rem' }}>{row.validity}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-[rgba(26,107,68,0.1)] text-[#1A6B44]" style={{ fontSize: '0.6875rem', fontWeight: 700 }}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminModuleView({ activeNav, agentName }: { activeNav: string; agentName: string }) {
  const { selectedClientId, setSelectedClientId, allClients } = useClientContext();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', height: '100%' }}>
      <div style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-foreground)', letterSpacing: '0.05em', textTransform: 'uppercase', flexShrink: 0 }}>Client :</span>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {allClients.map(c => {
            const active = c.id === selectedClientId;
            return (
              <button key={c.id} onClick={() => setSelectedClientId(c.id)} style={{ padding: '5px 12px', background: active ? 'var(--primary)' : 'transparent', color: active ? 'var(--primary-foreground)' : 'var(--muted-foreground)', border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`, fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: active ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{c.name}</span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', opacity: 0.7 }}>{c.ref}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeNav === 'documents-clients'   && <DocumentsClientsModule agentName={agentName} />}
        {activeNav === 'documents-admin'     && <DocumentsAdminModule agentName={agentName} />}
        {activeNav === 'chantier'            && <ChantierModule />}
        {activeNav === 'decaissements'       && <DecaissementsModule />}
        {activeNav === 'notifications-agent' && <NotificationsModule />}
        {activeNav === 'historique'          && <HistoriqueModule />}
      </div>
    </div>
  );
}
