import React, { useState } from 'react';
import {
  Search, Filter, CheckCircle2, AlertCircle, XCircle, FileText,
  RefreshCw, Eye, Phone, Mail, User, ChevronDown,
  ChevronUp, Bell, Clock, ShieldCheck, TrendingUp, Users,
  MessageSquare, X, Banknote, Building2, Calendar, Landmark, Send
} from 'lucide-react';
import type { AuthUser, UserRole } from '../App';
import { useClientContext } from '../contexts/ClientContext';
import DocumentsClientsModule from './DocumentsClientsModule';
import DocumentsAdminModule from './DocumentsAdminModule';
import ChantierModule from './ChantierModule';
import DecaissementsModule from './DecaissementsModule';
import NotificationsModule from './NotificationsModule';
import HistoriqueModule from './HistoriqueModule';

interface Props { user: AuthUser; activeNav?: string }

// ─── Data ──────────────────────────────────────────────────────────────────────

type DossierStatus = 'nouveau' | 'analyse' | 'complement' | 'approuve' | 'refuse';

const STATUS_CFG: Record<DossierStatus, { label: string; color: string; bg: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  nouveau:    { label: 'Nouveau',            color: 'var(--primary)',        bg: 'var(--secondary)',                icon: FileText     },
  analyse:    { label: 'En analyse',         color: '#C8921A',               bg: 'rgba(200,146,26,0.12)',           icon: RefreshCw    },
  complement: { label: 'Compléments requis', color: '#8B5CF6',               bg: 'rgba(139,92,246,0.10)',           icon: AlertCircle  },
  approuve:   { label: 'Approuvé',           color: 'var(--success)',        bg: 'rgba(26,107,68,0.10)',            icon: CheckCircle2 },
  refuse:     { label: 'Refusé',             color: '#C0392B',               bg: 'rgba(192,57,43,0.10)',            icon: XCircle      },
};

interface Dossier {
  id: string; client: string; clientId: string; type: 'fonctionnaire' | 'public';
  amount: string; terrainAmount: string | null; date: string; status: DossierStatus;
  agent: string; property: string; transmisALaBanque: boolean; datTransmission?: string;
}

// terrainAmount: 6 500 000 FCFA pour dossiers Fonctionnaire — à déterminer pour clients publics
const DOSSIERS: Dossier[] = [
  { id: 'DEM-2026-04721', client: 'Aminata Diallo', clientId: 'CLI-001', type: 'fonctionnaire',  amount: '18 500 000', terrainAmount: '6 500 000', date: '10 juin 2026', status: 'analyse',    agent: 'F. Sarr',  property: 'Villa R+1, Mbao',          transmisALaBanque: true,  datTransmission: '14 juin 2026' },
  { id: 'DEM-2026-04698', client: 'Ousmane Ba',     clientId: 'CLI-005', type: 'public', amount: '12 000 000', terrainAmount: null,        date: '08 juin 2026', status: 'complement', agent: 'Mme Thiombane',  property: 'F4, Pikine Ext.',           transmisALaBanque: false },
  { id: 'DEM-2026-04641', client: 'Rokhaya Diop',   clientId: 'CLI-003', type: 'fonctionnaire',  amount: '24 000 000', terrainAmount: '6 500 000', date: '02 juin 2026', status: 'approuve',   agent: 'F. Sarr',  property: 'Duplex, Keur Massar',       transmisALaBanque: true,  datTransmission: '07 juin 2026' },
  { id: 'DEM-2026-04589', client: 'Serigne Mbaye',  clientId: 'CLI-006', type: 'public', amount: '8 500 000',  terrainAmount: null,        date: '28 mai 2026',  status: 'approuve',   agent: 'P. Mendy', property: 'F3, Guédiawaye',            transmisALaBanque: true,  datTransmission: '03 juin 2026' },
  { id: 'DEM-2026-04512', client: "Ndèye Faye",     clientId: 'CLI-007', type: 'public', amount: '15 000 000', terrainAmount: null,        date: '20 mai 2026',  status: 'refuse',     agent: 'Mme Thiombane',  property: 'Villa, Thiès',              transmisALaBanque: false },
  { id: 'DEM-2026-04488', client: 'Ibrahima Sall',  clientId: 'CLI-002', type: 'fonctionnaire',  amount: '30 000 000', terrainAmount: '6 500 000', date: '18 mai 2026',  status: 'nouveau',    agent: 'F. Sarr',  property: 'Maison R+2, Dakar Plateau', transmisALaBanque: false },
  { id: 'DEM-2026-04401', client: 'Coumba Ndiaye',  clientId: 'CLI-008', type: 'public', amount: '9 200 000',  terrainAmount: null,        date: '10 mai 2026',  status: 'approuve',   agent: 'P. Mendy', property: 'F3, Parcelles Assainies',   transmisALaBanque: true,  datTransmission: '16 mai 2026' },
  { id: 'DEM-2026-04312', client: 'Modou Diallo',   clientId: 'CLI-004', type: 'fonctionnaire',  amount: '22 000 000', terrainAmount: '6 500 000', date: '02 mai 2026',  status: 'analyse',    agent: 'F. Sarr',  property: 'Villa, Saly',               transmisALaBanque: true,  datTransmission: '09 mai 2026' },
];

interface ClientProfile {
  id: string; name: string; phone: string; email: string;
  memberNumber: string | null; adhesionDate: string | null;
  type: 'fonctionnaire' | 'public'; address: string; employer: string; fonction: string;
}

const CLIENTS: ClientProfile[] = [
  { id: 'CLI-001', name: 'Aminata Diallo', phone: '+221 77 234 56 78', email: 'aminata.diallo@education.sn', memberNumber: 'FCT-4721', adhesionDate: 'Janv. 2019', type: 'fonctionnaire', address: 'Parcelles Assainies, Dakar', employer: "Ministère de l'Éducation", fonction: 'Professeure certifiée' },
  { id: 'CLI-002', name: 'Ibrahima Sall',  phone: '+221 76 890 12 34', email: 'ibrahima.sall@education.sn',  memberNumber: 'FCT-4488', adhesionDate: 'Mars 2017',  type: 'fonctionnaire', address: 'Plateau, Dakar',             employer: 'Université Cheikh Anta Diop', fonction: 'Maître-assistant' },
  { id: 'CLI-003', name: 'Rokhaya Diop',   phone: '+221 70 456 78 90', email: 'rokhaya.diop@education.sn',   memberNumber: 'FCT-4641', adhesionDate: 'Juil. 2020', type: 'fonctionnaire', address: 'Keur Massar, Dakar',         employer: 'Lycée Seydou Nourou Tall',    fonction: 'Proviseure' },
  { id: 'CLI-004', name: 'Modou Diallo',   phone: '+221 78 012 34 56', email: 'modou.diallo@education.sn',   memberNumber: 'FCT-4312', adhesionDate: 'Oct. 2016',  type: 'fonctionnaire', address: 'Saly, Mbour',                employer: "Ministère de l'Éducation",   fonction: 'Inspecteur' },
  { id: 'CLI-005', name: 'Ousmane Ba',     phone: '+221 77 567 89 01', email: 'ousmane.ba@gmail.com',         memberNumber: null,         adhesionDate: null,         type: 'public', address: 'Pikine Extension',          employer: 'Société Nationale',          fonction: 'Ingénieur' },
  { id: 'CLI-006', name: 'Serigne Mbaye',  phone: '+221 76 123 45 67', email: 'serigne.mbaye@gmail.com',      memberNumber: null,         adhesionDate: null,         type: 'public', address: 'Guédiawaye',               employer: 'Employé privé',              fonction: 'Technicien' },
  { id: 'CLI-007', name: "Ndèye Faye",     phone: '+221 70 789 01 23', email: 'ndeye.faye@education.sn',      memberNumber: null,         adhesionDate: null,         type: 'public', address: 'Thiès',                    employer: 'Mairie de Thiès',            fonction: 'Comptable' },
  { id: 'CLI-008', name: 'Coumba Ndiaye',  phone: '+221 78 345 67 89', email: 'coumba.ndiaye@gmail.com',      memberNumber: null,         adhesionDate: null,         type: 'public', address: 'Parcelles Assainies',      employer: 'Commerce',                   fonction: 'Commerçante' },
];

type ConformiteItem = { label: string; status: 'ok' | 'missing' | 'pending' };

function getConformite(d: Dossier): ConformiteItem[] {
  return [
    { label: "Pièce d'identité valide (CNI / Passeport)",  status: 'ok' },
    { label: 'Bulletins de salaire — 3 derniers mois',      status: d.status === 'complement' ? 'missing' : 'ok' },
    { label: "Attestation de l'employeur",                  status: d.status === 'complement' ? 'pending' : 'ok' },
    { label: "Attestation de fonction (fonction publique)", status: d.type === 'fonctionnaire' ? 'ok' : 'missing' },
    { label: 'Plan de masse visé',                          status: d.status === 'nouveau' ? 'pending' : 'ok' },
    { label: 'Devis ou contrat de construction',            status: d.status === 'complement' || d.status === 'nouveau' ? (d.status === 'complement' ? 'missing' : 'pending') : 'ok' },
    { label: 'Titre foncier / bail emphytéotique',          status: d.status === 'complement' ? 'missing' : d.status === 'nouveau' ? 'pending' : 'ok' },
    { label: 'Relevé bancaire — 6 derniers mois',           status: 'ok' },
    { label: 'Formulaire de demande signé',                 status: d.status === 'nouveau' ? 'pending' : 'ok' },
  ];
}

// ─── Role context ──────────────────────────────────────────────────────────────

const ROLE_CTX: Record<UserRole, { title: string; scope: string }> = {
  'agent-cpi':   { title: 'Espace Agent CPI',    scope: 'Tous les dossiers' },
  'agent-banque':{ title: 'Espace Agent Banque', scope: 'Dossiers à financer' },
  'client-fonctionnaire': { title: '', scope: '' }, 'client-public': { title: '', scope: '' }, 'admin': { title: '', scope: '' },
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: DossierStatus }) {
  const cfg = STATUS_CFG[status];
  const Icon = cfg.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 8px',
      background: cfg.bg, color: cfg.color,
      fontSize: '0.6875rem', fontFamily: 'var(--font-sans)', fontWeight: 700,
      whiteSpace: 'nowrap',
    }}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function ConformitePanel({ dossier }: { dossier: Dossier }) {
  const items = getConformite(dossier);
  const ok = items.filter(i => i.status === 'ok').length;
  const missing = items.filter(i => i.status === 'missing').length;
  const pending = items.filter(i => i.status === 'pending').length;
  const pct = Math.round((ok / items.length) * 100);

  const dotColor = { ok: 'var(--success)', missing: '#C0392B', pending: '#C8921A' };
  const dotLabel = { ok: 'Conforme', missing: 'Manquant', pending: 'En attente' };

  return (
    <div style={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '2px' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--foreground)' }}>
          Vérification de conformité
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Progress bar */}
          <div style={{ width: '80px', height: '5px', background: 'var(--muted)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: pct >= 80 ? 'var(--success)' : pct >= 50 ? '#C8921A' : '#C0392B', borderRadius: '3px', transition: 'width 0.4s' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 700, color: pct >= 80 ? 'var(--success)' : '#C8921A' }}>{pct}%</span>
        </div>
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
        {items.map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: 'var(--foreground)' }}>{item.label}</span>
            <span style={{
              fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', fontWeight: 700,
              color: dotColor[item.status], whiteSpace: 'nowrap',
            }}>
              {item.status === 'ok' ? '✓' : item.status === 'missing' ? '✗' : '◷'} {dotLabel[item.status]}
            </span>
          </div>
        ))}
      </div>

      {(missing > 0 || pending > 0) && (
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '16px' }}>
          {missing > 0 && <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: '#C0392B', fontWeight: 600 }}>{missing} document{missing > 1 ? 's' : ''} manquant{missing > 1 ? 's' : ''}</span>}
          {pending > 0 && <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: '#C8921A', fontWeight: 600 }}>{pending} en attente</span>}
        </div>
      )}
    </div>
  );
}

function DossierDetail({ dossier, onClose, isCPI }: { dossier: Dossier; onClose: () => void; isCPI: boolean }) {
  const client = CLIENTS.find(c => c.id === dossier.clientId);

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', marginTop: '0' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '3px' }}>{dossier.id}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--foreground)' }}>{dossier.client}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <StatusBadge status={dossier.status} />
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: '4px' }}>
            <X size={16} />
          </button>
        </div>
      </div>

      <div style={{ padding: '20px', display: 'grid', gap: '20px', gridTemplateColumns: isCPI ? '1fr 1fr' : '1fr' }}>
        {/* Left column: dossier info + actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Dossier details grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { label: 'Montant financement', value: `${dossier.amount} FCFA`, icon: Banknote },
              { label: 'Montant terrain',     value: dossier.terrainAmount ? `${dossier.terrainAmount} FCFA` : 'À déterminer', icon: Landmark },
              { label: 'Bien financé',        value: dossier.property, icon: Building2 },
              { label: 'Type',                value: dossier.type === 'fonctionnaire' ? 'AM SA KER (Fonctionnaire)' : 'Financement standard', icon: FileText },
              { label: 'Date de dépôt',       value: dossier.date, icon: Calendar },
              { label: 'Agent',               value: dossier.agent, icon: User },
            ].map(d => {
              const Icon = d.icon;
              const isUnknown = d.label === 'Montant terrain' && !dossier.terrainAmount;
              return (
                <div key={d.label} style={{ padding: '10px 12px', background: 'var(--background)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--muted-foreground)' }}>
                    <Icon size={11} />
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', fontWeight: 600 }}>{d.label}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: 600, color: isUnknown ? 'var(--muted-foreground)' : 'var(--foreground)', fontStyle: isUnknown ? 'italic' : 'normal' }}>{d.value}</span>
                </div>
              );
            })}
          </div>

          {/* Bank transmission banner */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '11px 14px',
            background: dossier.transmisALaBanque ? 'rgba(26,107,68,0.07)' : 'rgba(200,146,26,0.07)',
            border: `1px solid ${dossier.transmisALaBanque ? 'rgba(26,107,68,0.25)' : 'rgba(200,146,26,0.25)'}`,
          }}>
            <Landmark size={15} style={{ color: dossier.transmisALaBanque ? 'var(--success)' : '#C8921A', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: 700, color: dossier.transmisALaBanque ? 'var(--success)' : '#C8921A' }}>
                {dossier.transmisALaBanque ? 'Dossier transmis à la banque partenaire' : 'Non encore transmis à la banque'}
              </div>
              {dossier.datTransmission && (
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                  Transmis le {dossier.datTransmission}
                </div>
              )}
            </div>
            {!dossier.transmisALaBanque && isCPI && (
              <button style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '6px 12px', background: 'var(--primary)', color: 'white', border: 'none',
                fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0,
              }}>
                <Send size={11} /> Transmettre
              </button>
            )}
          </div>

          {/* Client contact (CPI only) */}
          {isCPI && client && (
            <div style={{ padding: '12px 14px', background: 'var(--secondary)', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--muted-foreground)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>Contact adhérent</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <a href={`tel:${client.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '7px', textDecoration: 'none', color: 'var(--foreground)', fontFamily: 'var(--font-sans)', fontSize: '0.8125rem' }}>
                  <Phone size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} /> {client.phone}
                </a>
                <a href={`mailto:${client.email}`} style={{ display: 'flex', alignItems: 'center', gap: '7px', textDecoration: 'none', color: 'var(--foreground)', fontFamily: 'var(--font-sans)', fontSize: '0.8125rem' }}>
                  <Mail size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} /> {client.email}
                </a>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(dossier.status === 'nouveau' || dossier.status === 'analyse') && (
              <button style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', background: 'var(--success)', color: 'white', border: 'none',
                fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
              }}>
                <CheckCircle2 size={14} /> Approuver
              </button>
            )}
            <button style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', background: 'transparent', color: '#C8921A',
              border: '1.5px solid #C8921A',
              fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
            }}>
              <AlertCircle size={14} /> Demander compléments
            </button>
            {dossier.status !== 'refuse' && dossier.status !== 'approuve' && (
              <button style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', background: 'transparent', color: 'var(--muted-foreground)',
                border: '1.5px solid var(--border)',
                fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
              }}>
                <XCircle size={14} /> Refuser
              </button>
            )}
            {isCPI && (
              <button style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', background: 'transparent', color: 'var(--primary)',
                border: '1.5px solid var(--primary)',
                fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
              }}>
                <Bell size={14} /> Envoyer rappel
              </button>
            )}
          </div>
        </div>

        {/* Right column: conformité (CPI only) */}
        {isCPI && <ConformitePanel dossier={dossier} />}
      </div>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

export default function AgentDashboard({ user, activeNav = 'dashboard' }: Props) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<DossierStatus | 'all'>('all');
  const [selectedDossier, setSelectedDossier] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [reminderNote, setReminderNote] = useState('');

  const isCPI = user.role === 'agent-cpi';
  const ctx = ROLE_CTX[user.role] || { title: 'Espace Agent', scope: 'Dossiers' };

  const visibleDossiers = DOSSIERS;

  const activeDossiers = visibleDossiers.filter(d => d.status !== 'approuve' && d.status !== 'refuse');
  const traitedDossiers = visibleDossiers.filter(d => d.status === 'approuve' || d.status === 'refuse');

  const filtered = (activeNav === 'traites' ? traitedDossiers : activeDossiers).filter(d => {
    const q = search.toLowerCase();
    const matchSearch = d.client.toLowerCase().includes(q) || d.id.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // ── Header banner ────────────────────────────────────────────────────────────
  const Banner = () => (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1875rem', fontWeight: 800, color: 'var(--foreground)', margin: 0 }}>{ctx.title}</h2>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--muted-foreground)', margin: 0 }}>{ctx.scope} · {user.name}</p>
    </div>
  );

  // ── Dashboard overview ───────────────────────────────────────────────────────
  if (activeNav === 'dashboard') {
    const stats = [
      { label: 'Total dossiers',      value: visibleDossiers.length,                                    icon: FileText,    color: 'var(--primary)' },
      { label: 'En analyse',          value: visibleDossiers.filter(d => d.status === 'analyse').length, icon: RefreshCw,   color: '#C8921A' },
      { label: 'Approuvés',           value: visibleDossiers.filter(d => d.status === 'approuve').length,icon: CheckCircle2,color: 'var(--success)' },
      { label: 'Compléments requis',  value: visibleDossiers.filter(d => d.status === 'complement').length,icon: AlertCircle,color: '#8B5CF6' },
    ];

    const urgent = visibleDossiers.filter(d => d.status === 'nouveau' || d.status === 'complement');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Banner />

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          {stats.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '18px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 500, color: 'var(--muted-foreground)' }}>{s.label}</span>
                  <div style={{ width: '28px', height: '28px', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={14} style={{ color: s.color }} />
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--foreground)' }}>{s.value}</div>
              </div>
            );
          })}
        </div>

        {/* Urgent actions */}
        {urgent.length > 0 && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={14} style={{ color: '#C8921A' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--foreground)' }}>Actions requises</span>
              <span style={{ marginLeft: 'auto', padding: '2px 8px', background: 'rgba(200,146,26,0.12)', color: '#C8921A', fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', fontWeight: 700 }}>{urgent.length} dossier{urgent.length > 1 ? 's' : ''}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {urgent.map((d, i) => {
                const cfg = STATUS_CFG[d.status];
                return (
                  <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 18px', borderBottom: i < urgent.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--background)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => setSelectedDossier(selectedDossier === d.id ? null : d.id)}
                  >
                    <div style={{ width: '32px', height: '32px', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {d.client.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)' }}>{d.client}</div>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{d.property}</div>
                    </div>
                    <StatusBadge status={d.status} />
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>{d.amount} FCFA</span>
                    <Eye size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Expanded dossier from urgent list */}
        {selectedDossier && (() => {
          const d = DOSSIERS.find(x => x.id === selectedDossier);
          return d ? <DossierDetail dossier={d} onClose={() => setSelectedDossier(null)} isCPI={isCPI} /> : null;
        })()}

        {/* Quick stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Taux de conformité moyen', value: '74%', icon: ShieldCheck, color: 'var(--success)' },
            { label: 'Délai moyen de traitement', value: '4,2 j', icon: Clock, color: '#C8921A' },
            { label: "Taux d'approbation",         value: '68%', icon: TrendingUp, color: 'var(--primary)' },
            { label: 'Dossiers Fonctionnaire actifs', value: '4',   icon: Users,     color: '#8B5CF6' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '36px', height: '36px', background: `${s.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} style={{ color: s.color }} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--foreground)' }}>{s.value}</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', color: 'var(--muted-foreground)', lineHeight: 1.4 }}>{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Dossiers / Traités views ─────────────────────────────────────────────────
  if (activeNav === 'dossiers' || activeNav === 'traites') {
    const isTraites = activeNav === 'traites';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Banner />

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
              <input
                type="text" placeholder="Rechercher un client ou une réf..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', paddingLeft: '32px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px',
                  background: 'var(--background)', border: '1px solid var(--border)', outline: 'none',
                  fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--foreground)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} style={{ color: 'var(--muted-foreground)' }} />
              <select
                value={filterStatus} onChange={e => setFilterStatus(e.target.value as DossierStatus | 'all')}
                style={{ padding: '8px 10px', background: 'var(--background)', border: '1px solid var(--border)', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--foreground)' }}
              >
                <option value="all">Tous les statuts</option>
                {(Object.keys(STATUS_CFG) as DossierStatus[]).map(s => (
                  <option key={s} value={s}>{STATUS_CFG[s].label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Référence', 'Client', 'Type', 'Financement', 'Terrain', 'Date', 'Statut', ...(isCPI ? ['Conformité', 'Banque'] : []), 'Agent', ''].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => {
                  const items = isCPI ? getConformite(d) : [];
                  const pct = isCPI ? Math.round((items.filter(i => i.status === 'ok').length / items.length) * 100) : 0;
                  const isOpen = selectedDossier === d.id;

                  return (
                    <React.Fragment key={d.id}>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: isOpen ? 'var(--secondary)' : 'transparent', cursor: 'pointer', transition: 'background 0.12s' }}
                      onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = 'var(--background)'; }}
                      onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)' }}>{d.id}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)' }}>{d.client}</div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{d.property}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ padding: '2px 8px', background: d.type === 'fonctionnaire' ? 'rgba(200,146,26,0.15)' : 'var(--secondary)', color: d.type === 'fonctionnaire' ? '#C8921A' : 'var(--primary)', fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', fontWeight: 700 }}>
                          {d.type === 'fonctionnaire' ? 'FONCTIONNAIRE' : 'PUBLIC'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)', whiteSpace: 'nowrap' }}>{d.amount} FCFA</td>
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        {d.terrainAmount
                          ? <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--foreground)' }}>{d.terrainAmount} FCFA</span>
                          : <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--muted-foreground)' }}>À déterminer</span>
                        }
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>{d.date}</td>
                      <td style={{ padding: '12px 14px' }}><StatusBadge status={d.status} /></td>
                      {isCPI && (
                        <>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{ width: '48px', height: '4px', background: 'var(--muted)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${pct}%`, background: pct >= 80 ? 'var(--success)' : pct >= 50 ? '#C8921A' : '#C0392B', borderRadius: '2px' }} />
                              </div>
                              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', fontWeight: 700, color: pct >= 80 ? 'var(--success)' : '#C8921A' }}>{pct}%</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {d.transmisALaBanque
                              ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--success)' }}><CheckCircle2 size={11} /> Transmis</span>
                              : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', fontWeight: 700, color: '#C8921A' }}><Clock size={11} /> En attente</span>
                            }
                          </td>
                        </>
                      )}
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>{d.agent}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <button onClick={() => setSelectedDossier(isOpen ? null : d.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontFamily: 'var(--font-sans)', fontSize: '0.75rem' }}>
                          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          {isOpen ? 'Fermer' : 'Voir'}
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr style={{ background: 'var(--background)' }}>
                        <td colSpan={isCPI ? 11 : 8} style={{ padding: '0 0 16px' }}>
                          <DossierDetail dossier={d} onClose={() => setSelectedDossier(null)} isCPI={isCPI} />
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={isCPI ? 11 : 8} style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                      Aucun dossier trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
            {filtered.length} dossier{filtered.length !== 1 ? 's' : ''} affiché{filtered.length !== 1 ? 's' : ''}
            {isTraites && ` · ${traitedDossiers.filter(d => d.status === 'approuve').length} approuvés, ${traitedDossiers.filter(d => d.status === 'refuse').length} refusés`}
          </div>
        </div>
      </div>
    );
  }

  // ── Clients / Adhérents view ─────────────────────────────────────────────────
  if (activeNav === 'clients') {
    const displayClients = CLIENTS;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Banner />

        {/* Client cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
          {displayClients.map(c => {
            const clientDossiers = DOSSIERS.filter(d => d.clientId === c.id);
            const isExpanded = selectedClient?.id === c.id;

            return (
              <div key={c.id} style={{
                background: 'var(--card)', border: isExpanded ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                transition: 'border-color 0.15s',
              }}>
                {/* Card header */}
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px', flexShrink: 0,
                      background: c.type === 'fonctionnaire' ? 'rgba(200,146,26,0.15)' : 'var(--secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-display)', fontSize: '0.875rem', fontWeight: 800,
                      color: c.type === 'fonctionnaire' ? '#C8921A' : 'var(--primary)',
                    }}>
                      {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--foreground)' }}>{c.name}</div>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{c.fonction} · {c.employer.length > 28 ? c.employer.slice(0, 28) + '…' : c.employer}</div>
                    </div>
                    <span style={{
                      padding: '2px 8px', flexShrink: 0,
                      background: c.type === 'fonctionnaire' ? 'rgba(200,146,26,0.15)' : 'var(--secondary)',
                      color: c.type === 'fonctionnaire' ? '#C8921A' : 'var(--primary)',
                      fontFamily: 'var(--font-sans)', fontSize: '0.625rem', fontWeight: 700,
                    }}>{c.type === 'fonctionnaire' ? 'FONCTIONNAIRE' : 'PUBLIC'}</span>
                  </div>

                  {/* Contact row */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                    <a href={`tel:${c.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '7px', textDecoration: 'none', fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: 'var(--foreground)' }}>
                      <Phone size={12} style={{ color: 'var(--primary)', flexShrink: 0 }} /> {c.phone}
                    </a>
                    <a href={`mailto:${c.email}`} style={{ display: 'flex', alignItems: 'center', gap: '7px', textDecoration: 'none', fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: 'var(--foreground)' }}>
                      <Mail size={12} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</span>
                    </a>
                  </div>

                  {/* Dossier numbers — always visible */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {clientDossiers.length === 0 ? (
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--muted-foreground)', fontStyle: 'italic' }}>Aucun dossier</span>
                    ) : clientDossiers.map(d => (
                      <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', background: 'var(--secondary)', padding: '2px 7px' }}>
                          {d.id}
                        </span>
                        <StatusBadge status={d.status} />
                        {d.transmisALaBanque
                          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontFamily: 'var(--font-sans)', fontSize: '0.625rem', fontWeight: 700, color: 'var(--success)' }}><Landmark size={10} /> Banque ✓</span>
                          : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontFamily: 'var(--font-sans)', fontSize: '0.625rem', fontWeight: 700, color: '#C8921A' }}><Clock size={10} /> Banque en attente</span>
                        }
                        {d.terrainAmount && (
                          <span style={{ fontFamily: 'monospace', fontSize: '0.625rem', color: 'var(--muted-foreground)' }}>Terrain: {d.terrainAmount} FCFA</span>
                        )}
                      </div>
                    ))}
                    {/* Member number + adhesion */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                      {c.memberNumber && (
                        <span style={{ fontFamily: 'monospace', fontSize: '0.6875rem', color: '#C8921A', background: 'rgba(200,146,26,0.1)', padding: '2px 7px' }}>
                          {c.memberNumber}
                        </span>
                      )}
                      {c.adhesionDate && (
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}>Depuis {c.adhesionDate}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions row */}
                <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
                  <a href={`tel:${c.phone}`} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                    padding: '7px 10px', background: 'var(--secondary)', border: 'none',
                    textDecoration: 'none', color: 'var(--primary)',
                    fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 700,
                    cursor: 'pointer',
                  }}>
                    <Phone size={12} /> Appeler
                  </a>
                  <button
                    onClick={() => setSelectedClient(isExpanded ? null : c)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                      padding: '7px 10px',
                      background: isExpanded ? 'var(--primary)' : 'transparent',
                      border: `1px solid ${isExpanded ? 'var(--primary)' : 'var(--border)'}`,
                      color: isExpanded ? 'white' : 'var(--foreground)',
                      fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <User size={12} /> {isExpanded ? 'Fermer' : 'Profil'}
                  </button>
                </div>

                {/* Expanded profile */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)' }}>
                    {/* Profile details */}
                    <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {[
                        { label: 'Adresse',   value: c.address },
                        { label: 'Employeur', value: c.employer },
                        { label: 'Fonction',  value: c.fonction },
                        { label: 'Adhésion',  value: c.adhesionDate ?? 'Non adhérent' },
                      ].map(row => (
                        <div key={row.label} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>{row.label}</span>
                          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: 'var(--foreground)' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Dossiers list */}
                    {clientDossiers.length > 0 && (
                      <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '4px' }}>Dossiers</div>
                        {clientDossiers.map(d => (
                          <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--primary)' }}>{d.id}</span>
                            <StatusBadge status={d.status} />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reminder */}
                    <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px' }}>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <MessageSquare size={11} /> Note de rappel
                      </div>
                      <textarea
                        placeholder="Ajouter une note ou un rappel pour ce client..."
                        value={reminderNote}
                        onChange={e => setReminderNote(e.target.value)}
                        rows={2}
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          padding: '8px 10px', resize: 'vertical',
                          background: 'var(--background)', border: '1px solid var(--border)', outline: 'none',
                          fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: 'var(--foreground)',
                          lineHeight: 1.5,
                        }}
                      />
                      <button style={{
                        marginTop: '8px', width: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '8px', background: 'var(--primary)', color: 'white', border: 'none',
                        fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer',
                      }}>
                        <Bell size={13} /> Envoyer rappel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const MODULE_NAVS = ['documents-clients', 'documents-admin', 'chantier', 'decaissements', 'notifications-agent', 'historique'];
  const isModuleNav = MODULE_NAVS.includes(activeNav ?? '');

  if (isModuleNav) {
    return <AgentModuleView activeNav={activeNav!} agentName={user.name} />;
  }

  return null;
}

function AgentModuleView({ activeNav, agentName }: { activeNav: string; agentName: string }) {
  const { selectedClientId, setSelectedClientId, allClients } = useClientContext();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', height: '100%' }}>
      {/* Client selector strip */}
      <div style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-foreground)', letterSpacing: '0.05em', textTransform: 'uppercase', flexShrink: 0 }}>Client :</span>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {allClients.map(c => {
            const active = c.id === selectedClientId;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedClientId(c.id)}
                style={{
                  padding: '5px 12px',
                  background: active ? 'var(--primary)' : 'transparent',
                  color: active ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                  border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                  fontFamily: 'var(--font-sans)', fontSize: '0.8125rem',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                <span>{c.name}</span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', opacity: 0.7 }}>{c.ref}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Module content */}
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
