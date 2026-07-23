import { useState } from 'react';
import {
  Star, CheckCircle2, Clock, FileText, Upload,
  TrendingUp, AlertCircle, Download, RefreshCw, Banknote,
  Calendar, Phone, Home, Info, ShieldCheck
} from 'lucide-react';
import type { AuthUser } from '../App';
import ConventionCBAOPage from './ConventionCBAOPage';

interface Props { user: AuthUser }

type LoanStatus = 'draft' | 'submitted' | 'reviewing' | 'approved' | 'disbursed';

const STATUS_CONFIG: Record<LoanStatus, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  draft: { label: 'Brouillon', color: '#6B4A52', bg: '#EDE4E6', icon: FileText },
  submitted: { label: 'Soumis', color: '#7B1A2E', bg: '#F5ECEE', icon: Clock },
  reviewing: { label: 'En analyse', color: '#C8921A', bg: 'rgba(200,146,26,0.12)', icon: RefreshCw },
  approved: { label: 'Approuvé', color: '#1A6B44', bg: 'rgba(26,107,68,0.1)', icon: CheckCircle2 },
  disbursed: { label: 'Décaissé', color: '#1A6B44', bg: 'rgba(26,107,68,0.1)', icon: Banknote },
};

const LOAN_STEPS = [
  { id: 'submitted', label: 'Dossier soumis' },
  { id: 'reviewing', label: 'Analyse CPI' },
  { id: 'approved', label: 'Accord de principe' },
  { id: 'disbursed', label: 'Décaissement' },
];

const STATUS_ORDER: LoanStatus[] = ['draft', 'submitted', 'reviewing', 'approved', 'disbursed'];

const DOCUMENTS = [
  { name: 'Pièce d\'identité (CNI)', status: 'ok', date: '12 juin 2026' },
  { name: 'Justificatif de salaire (3 derniers mois)', status: 'ok', date: '12 juin 2026' },
  { name: 'Attestation d\'adhésion CHUES', status: 'ok', date: '12 juin 2026' },
  { name: 'Plan de masse du terrain', status: 'pending', date: null },
  { name: 'Devis de construction', status: 'pending', date: null },
  { name: 'Titre foncier ou bail emphytéotique', status: 'missing', date: null },
];

const REPAYMENT_SCHEDULE = [
  { month: 'Août 2026', amount: '183 750', status: 'upcoming' },
  { month: 'Sept. 2026', amount: '183 750', status: 'upcoming' },
  { month: 'Oct. 2026', amount: '183 750', status: 'upcoming' },
];

export default function ClientCHUESDashboard({ user }: Props) {
  const [loanStatus] = useState<LoanStatus>('reviewing');
  const [activeTab, setActiveTab] = useState<'apercu' | 'documents' | 'echeances' | 'convention'>('apercu');

  const statusConfig = STATUS_CONFIG[loanStatus];
  const StatusIcon = statusConfig.icon;
  const stepIndex = STATUS_ORDER.indexOf(loanStatus);

  const loanDetails = {
    amount: '18 500 000',
    duration: '15 ans',
    rate: '6,5%',
    monthlyPayment: '183 750',
    ref: 'DEM-2026-04721',
    submitDate: '10 juin 2026',
    property: 'Villa R+1, Parcelle 47-B, Mbao',
  };

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden p-6" style={{ background: 'linear-gradient(135deg, #38080F 0%, #7B1A2E 100%)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.05]" style={{ background: 'radial-gradient(circle, #C8921A 0%, transparent 70%)' }} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
          <div>
            <div className="text-[#F0B840] mb-1" style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              ✦ Adhérent CHUES · {user.memberNumber}
            </div>
            <h2 className="text-white" style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 800 }}>
              Bonjour, {user.name.split(' ')[0]}
            </h2>
            <p className="text-[#DFC0C8] mt-1" style={{ fontSize: '0.875rem' }}>
              Votre dossier AM SA KER est en cours d'analyse par nos équipes CPI.
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[rgba(200,146,26,0.2)] border border-[rgba(200,146,26,0.4)]">
              <Star className="w-4 h-4 text-[#F0B840]" />
              <span className="text-[#F0B840]" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>AM SA KER</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Montant demandé', value: `${loanDetails.amount} FCFA`, icon: Banknote, color: '#7B1A2E' },
          { label: 'Taux préférentiel', value: loanDetails.rate, icon: TrendingUp, color: '#1A6B44' },
          { label: 'Durée', value: loanDetails.duration, icon: Calendar, color: '#C8921A' },
          { label: 'Mensualité estimée', value: `${loanDetails.monthlyPayment} FCFA`, icon: RefreshCw, color: '#7B1A2E' },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white border border-[rgba(123,26,46,0.1)] p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 flex items-center justify-center" style={{ background: `${m.color}12` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: m.color }} />
                </div>
                <span className="text-[#6B4A52]" style={{ fontSize: '0.75rem', fontWeight: 500 }}>{m.label}</span>
              </div>
              <div className="text-[#1C0810]" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.0625rem' }}>{m.value}</div>
            </div>
          );
        })}
      </div>

      {/* Status tracker */}
      <div className="bg-white border border-[rgba(123,26,46,0.1)] p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-[#1C0810]" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Suivi de votre demande</h3>
            <div className="text-[#6B4A52] mt-0.5" style={{ fontSize: '0.8125rem' }}>Réf. {loanDetails.ref}</div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5" style={{ backgroundColor: statusConfig.bg }}>
            <StatusIcon className="w-3.5 h-3.5" style={{ color: statusConfig.color }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: statusConfig.color }}>{statusConfig.label}</span>
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-0 mb-6">
          {LOAN_STEPS.map((step, i) => {
            const currentIdx = STATUS_ORDER.filter(s => s !== 'draft').indexOf(loanStatus as LoanStatus);
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-8 h-8 flex items-center justify-center border-2 ${done ? 'bg-[#1A6B44] border-[#1A6B44]' : active ? 'bg-[#7B1A2E] border-[#7B1A2E]' : 'bg-white border-[rgba(123,26,46,0.2)]'}`}>
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: active ? 'white' : '#6B4A52' }}>{i + 1}</span>
                    )}
                  </div>
                  <span className={`mt-2 text-center ${active ? 'text-[#7B1A2E]' : done ? 'text-[#1A6B44]' : 'text-[#6B4A52]'}`} style={{ fontSize: '0.6875rem', fontWeight: active || done ? 700 : 400, maxWidth: '72px' }}>
                    {step.label}
                  </span>
                </div>
                {i < LOAN_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${done ? 'bg-[#1A6B44]' : 'bg-[rgba(123,26,46,0.15)]'}`} style={{ marginBottom: '1.5rem' }} />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-start gap-3 p-4 bg-[rgba(200,146,26,0.08)] border border-[rgba(200,146,26,0.2)]">
          <AlertCircle className="w-4 h-4 text-[#C8921A] mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-[#1C0810]" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Analyse en cours</div>
            <div className="text-[#6B4A52]" style={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
              Votre dossier est examiné par l'équipe CPI. Délai estimé : 2 jours ouvrés. Vous serez notifié par e-mail et SMS.
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-[rgba(123,26,46,0.1)]">
        <div className="flex border-b border-[rgba(123,26,46,0.1)] overflow-x-auto">
          {([
            ['apercu', 'Aperçu'],
            ['documents', 'Documents'],
            ['echeances', 'Échéancier'],
            ['convention', 'Convention CBAO-CHUES'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-5 py-3.5 whitespace-nowrap flex-shrink-0 transition-colors ${activeTab === id ? 'border-b-2 border-[#7B1A2E] text-[#7B1A2E]' : 'text-[#6B4A52] hover:text-[#1C0810]'}`}
              style={{ fontSize: '0.875rem', fontWeight: activeTab === id ? 700 : 500 }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={activeTab === 'convention' ? '' : 'p-6'}>
          {activeTab === 'convention' && (
            <div>
              {/* Member intro strip */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '14px',
                padding: '16px 20px',
                background: 'rgba(200,146,26,0.07)',
                borderBottom: '1px solid rgba(200,146,26,0.18)',
              }}>
                <ShieldCheck size={18} style={{ color: '#C8921A', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '4px' }}>
                    Votre accord de financement CHUES × CBAO Attijariwafa Bank
                  </div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: 'var(--muted-foreground)', lineHeight: 1.6, maxWidth: '680px' }}>
                    En tant qu'adhérent CHUES, vous bénéficiez d'une convention exclusive signée entre votre syndicat et la CBAO Attijariwafa Bank.
                    Elle vous ouvre l'accès à deux produits de financement immobilier à des conditions préférentielles réservées aux fonctionnaires membres.
                  </p>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '10px', flexWrap: 'wrap' }}>
                    {[
                      { icon: Home, text: "Financement jusqu'à 100%", color: '#1A6B44' },
                      { icon: Info, text: 'Taux à partir de 6,8% HT', color: '#7B1A2E' },
                      { icon: CheckCircle2, text: "Durée jusqu'à 25 ans", color: '#C8921A' },
                    ].map(({ icon: Icon, text, color }) => (
                      <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icon size={13} style={{ color, flexShrink: 0 }} />
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--foreground)' }}>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Full convention content */}
              <ConventionCBAOPage />
            </div>
          )}

          {activeTab === 'apercu' && (
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-[#1C0810]" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem' }}>Détails du financement</h4>
                {[
                  { label: 'Montant', value: `${loanDetails.amount} FCFA` },
                  { label: 'Taux d\'intérêt', value: `${loanDetails.rate} / an` },
                  { label: 'Durée', value: loanDetails.duration },
                  { label: 'Mensualité', value: `${loanDetails.monthlyPayment} FCFA` },
                  { label: 'Bien financé', value: loanDetails.property },
                  { label: 'Date de soumission', value: loanDetails.submitDate },
                ].map(d => (
                  <div key={d.label} className="flex items-center justify-between py-2 border-b border-[rgba(123,26,46,0.06)]">
                    <span className="text-[#6B4A52]" style={{ fontSize: '0.8125rem' }}>{d.label}</span>
                    <span className="text-[#1C0810]" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{d.value}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <h4 className="text-[#1C0810]" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem' }}>Contact & accompagnement</h4>
                <div className="p-4 bg-[#F5ECEE] border border-[rgba(123,26,46,0.12)]">
                  <div className="text-[#1C0810] mb-1" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Mme Fatou Sarr</div>
                  <div className="text-[#6B4A52]" style={{ fontSize: '0.8125rem' }}>Chargée de dossiers CHUES</div>
                  <div className="flex items-center gap-2 mt-3 text-[#7B1A2E]" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                    <Phone className="w-3.5 h-3.5" />
                    +221 33 822 00 00
                  </div>
                </div>
                <div className="p-4 bg-[rgba(26,107,68,0.06)] border border-[rgba(26,107,68,0.15)]">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1A6B44]" />
                    <span className="text-[#1A6B44]" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>Avantages CHUES actifs</span>
                  </div>
                  <ul className="space-y-1">
                    {['Taux préférentiel 6,5%', 'Frais réduits de 50%', 'Traitement prioritaire', 'Accompagnement dédié'].map(a => (
                      <li key={a} className="flex items-center gap-2 text-[#3D2030]" style={{ fontSize: '0.75rem' }}>
                        <div className="w-1 h-1 bg-[#1A6B44] rounded-full" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[#6B4A52]" style={{ fontSize: '0.875rem' }}>
                  {DOCUMENTS.filter(d => d.status === 'ok').length}/{DOCUMENTS.length} documents fournis
                </p>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#7B1A2E] text-white hover:bg-[#621523] transition-colors" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                  <Upload className="w-3.5 h-3.5" />
                  Ajouter un document
                </button>
              </div>
              {DOCUMENTS.map((doc) => (
                <div key={doc.name} className="flex items-center justify-between p-4 border border-[rgba(123,26,46,0.1)] hover:bg-[#FAF7F7] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${doc.status === 'ok' ? 'bg-[#1A6B44]' : doc.status === 'pending' ? 'bg-[#C8921A]' : 'bg-[#C0392B]'}`} />
                    <span className="text-[#1C0810]" style={{ fontSize: '0.875rem' }}>{doc.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {doc.date && <span className="text-[#6B4A52]" style={{ fontSize: '0.75rem' }}>{doc.date}</span>}
                    {doc.status === 'ok' ? (
                      <span className="flex items-center gap-1 text-[#1A6B44]" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Fourni
                      </span>
                    ) : doc.status === 'pending' ? (
                      <button className="flex items-center gap-1 px-3 py-1 bg-[rgba(200,146,26,0.1)] text-[#C8921A]" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        <Upload className="w-3 h-3" /> À fournir
                      </button>
                    ) : (
                      <button className="flex items-center gap-1 px-3 py-1 bg-red-50 text-[#C0392B]" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        <AlertCircle className="w-3 h-3" /> Manquant
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'echeances' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[#6B4A52]" style={{ fontSize: '0.875rem' }}>Prévisionnel — à confirmer après décaissement</p>
                <button className="flex items-center gap-2 text-[#7B1A2E]" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                  <Download className="w-3.5 h-3.5" />
                  Télécharger
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(123,26,46,0.1)]">
                      {['Échéance', 'Mensualité (FCFA)', 'Statut'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[#6B4A52]" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {REPAYMENT_SCHEDULE.map((r) => (
                      <tr key={r.month} className="border-b border-[rgba(123,26,46,0.06)] hover:bg-[#FAF7F7]">
                        <td className="px-4 py-3 text-[#1C0810]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>{r.month}</td>
                        <td className="px-4 py-3 text-[#1C0810] font-mono" style={{ fontSize: '0.875rem', fontWeight: 600 }}>{r.amount}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-[#F5ECEE] text-[#7B1A2E]" style={{ fontSize: '0.6875rem', fontWeight: 700 }}>À venir</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-[#F5ECEE] border border-[rgba(123,26,46,0.12)]">
                <div className="text-[#6B4A52]" style={{ fontSize: '0.8125rem' }}>
                  L'échéancier définitif sera établi à la signature du contrat de prêt avec la CBAO Attijariwafa Bank.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
