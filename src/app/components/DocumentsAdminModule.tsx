import React, { useState } from 'react';
import {
  Plus, Eye, Download, Send, Archive, FileText, CheckCircle2,
  PenSquare, Shield, EyeOff, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useCpiDocs, type CpiDoc, type CpiDocStatus, type CpiCategorie } from '../data/cpiDocsContext';
import { useClientContext } from '../contexts/ClientContext';

// ─── Config ────────────────────────────────────────────────────────────────────

const CPI_STATUS_CFG: Record<CpiDocStatus, { label: string; color: string; bg: string }> = {
  brouillon:  { label: 'Brouillon',   color: 'var(--muted-foreground)', bg: 'var(--muted)'             },
  publie:     { label: 'Publié',      color: 'var(--success)',          bg: 'rgba(26,107,68,0.10)'     },
  disponible: { label: 'Disponible',  color: 'var(--primary)',          bg: 'var(--secondary)'         },
  'a-signer': { label: 'À signer',    color: '#C0392B',                 bg: 'rgba(192,57,43,0.08)'     },
  signe:      { label: 'Signé',       color: 'var(--success)',          bg: 'rgba(26,107,68,0.10)'     },
  refuse:     { label: 'Refusé',      color: '#C0392B',                 bg: 'rgba(192,57,43,0.08)'     },
  archive:    { label: 'Archivé',     color: '#C8921A',                 bg: 'rgba(200,146,26,0.10)'    },
};

const CATEGORIE_LABELS: Record<CpiCategorie, string> = {
  contrats:     'Contrat',
  conventions:  'Convention',
  bancaires:    'Document bancaire',
  courriers:    'Courrier',
  pv:           'Procès-verbal',
  autorisations:'Autorisation',
};

const CPI_CATEGORIES: CpiCategorie[] = ['contrats', 'conventions', 'bancaires', 'courriers', 'pv', 'autorisations'];

const FILTERS = ['all', 'publie', 'brouillon', 'archive'] as const;
type FilterStatut = typeof FILTERS[number];
const FILTER_LABELS: Record<FilterStatut, string> = { all: 'Tous', publie: 'Publiés/disponibles', brouillon: 'Brouillons', archive: 'Archivés' };
function matchesFilter(status: CpiDocStatus, f: FilterStatut): boolean {
  if (f === 'all') return true;
  if (f === 'publie') return status === 'publie' || status === 'disponible' || status === 'a-signer' || status === 'signe';
  return status === f;
}

const emptyForm = { titre: '', categorie: 'contrats' as CpiCategorie, destinataire: '', note: '' };

interface Props { agentName?: string; }

export default function DocumentsAdminModule({ agentName = 'Agent CPI' }: Props) {
  const { allCpiDocsByClient, publishDoc, archiveDoc, requestSignature, markSigned, retireFromClient, createDoc } = useCpiDocs();
  const { allClients: allClientSummaries, selectedClientId } = useClientContext();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [filterStatut, setFilterStatut] = useState<FilterStatut>('all');
  const [expanded, setExpanded] = useState<string | null>(selectedClientId);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  const handleCreate = (asDraft: boolean) => {
    if (!form.titre || !form.destinataire) return;
    const clientName = allClientSummaries.find(c => c.id === form.destinataire)?.name ?? form.destinataire;
    createDoc(
      { categorie: form.categorie, nom: form.titre, version: 'V1', auteur: agentName, signatureRequise: false, commentaire: form.note || undefined },
      agentName,
      !asDraft,
      form.destinataire,
    );
    showToast(asDraft ? `Brouillon enregistré pour ${clientName}.` : `Document publié dans l'espace client de ${clientName}.`);
    setForm(emptyForm);
    setShowForm(false);
  };

  const th: React.CSSProperties = { padding: '9px 14px', textAlign: 'left', fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--muted-foreground)', whiteSpace: 'nowrap' };
  const td: React.CSSProperties = { padding: '12px 14px', fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: 'var(--foreground)', verticalAlign: 'middle' };
  const card: React.CSSProperties = { background: 'var(--card)', border: '1px solid var(--border)', marginBottom: '12px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 800, color: 'var(--foreground)', margin: '0 0 4px' }}>Documents administratifs</h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--muted-foreground)', margin: 0 }}>Créez et publiez des documents destinés aux clients.</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '9px 16px', background: 'var(--primary)', color: 'var(--primary-foreground)', border: 'none', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
          <Plus size={14} /> Nouveau document
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '20px 20px 18px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '16px' }}>Nouveau document</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>Titre du document</label>
              <input value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} placeholder="Ex : Contrat de réservation" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Destinataire</label>
              <select value={form.destinataire} onChange={e => setForm(f => ({ ...f, destinataire: e.target.value }))} style={inputStyle}>
                <option value="">Sélectionner un client</option>
                {allClientSummaries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Catégorie</label>
              <select value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value as CpiCategorie }))} style={inputStyle}>
                {CPI_CATEGORIES.map(c => <option key={c} value={c}>{CATEGORIE_LABELS[c]}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Note interne (optionnelle)</label>
            <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={2} placeholder="Note visible uniquement par l'équipe..." style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={() => { setShowForm(false); setForm(emptyForm); }} style={btnOutline}>Annuler</button>
            <button onClick={() => handleCreate(true)} style={btnGhost}>Enregistrer brouillon</button>
            <button onClick={() => handleCreate(false)} disabled={!form.titre || !form.destinataire} style={{ ...btnPrimary, opacity: form.titre && form.destinataire ? 1 : 0.5 }}>
              <Send size={13} /> Publier au client
            </button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border)' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilterStatut(f)} style={{ padding: '8px 14px', border: 'none', borderBottom: filterStatut === f ? '2px solid var(--primary)' : '2px solid transparent', background: 'transparent', fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: filterStatut === f ? 700 : 500, color: filterStatut === f ? 'var(--primary)' : 'var(--muted-foreground)', cursor: 'pointer', marginBottom: '-1px' }}>
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Client sections */}
      {allClientSummaries.map(client => {
        const allDocs = allCpiDocsByClient[client.id] ?? [];
        const docs = allDocs.filter(d => matchesFilter(d.status, filterStatut));
        const isOpen = expanded === client.id;
        return (
          <div key={client.id} style={card}>
            <button
              onClick={() => setExpanded(isOpen ? null : client.id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ width: '36px', height: '36px', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary)' }}>
                {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--foreground)' }}>{client.name}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{client.ref}</div>
              </div>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--muted-foreground)', background: 'var(--muted)', padding: '1px 7px', flexShrink: 0 }}>
                {docs.length} doc{docs.length > 1 ? 's' : ''}
              </span>
              {isOpen ? <ChevronUp size={15} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} /> : <ChevronDown size={15} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />}
            </button>

            {isOpen && (
              docs.length === 0 ? (
                <div style={{ borderTop: '1px solid var(--border)', padding: '24px', textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                  Aucun document dans cette catégorie pour {client.name}.
                </div>
              ) : (
              <div style={{ borderTop: '1px solid var(--border)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--background)' }}>
                      <th style={th}>Nom du document</th>
                      <th style={th}>Catégorie</th>
                      <th style={th}>Version</th>
                      <th style={th}>Date</th>
                      <th style={th}>Statut</th>
                      <th style={th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docs.map((doc: CpiDoc, i: number) => {
                      const cfg = CPI_STATUS_CFG[doc.status];
                      const dateDisplay = doc.datePublication || doc.dateCreation || '—';
                      return (
                        <tr key={doc.id} style={{ borderBottom: i < docs.length - 1 ? '1px solid var(--border)' : 'none' }}>
                          <td style={td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FileText size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                              <div>
                                <div style={{ fontWeight: 600, fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: 'var(--foreground)' }}>{doc.nom}</div>
                                {doc.reference && <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}>Réf. {doc.reference}</div>}
                              </div>
                            </div>
                          </td>
                          <td style={td}>
                            <span style={{ padding: '2px 8px', background: 'var(--secondary)', color: 'var(--primary)', fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', fontWeight: 700 }}>{CATEGORIE_LABELS[doc.categorie]}</span>
                          </td>
                          <td style={{ ...td, color: 'var(--muted-foreground)' }}>{doc.version}</td>
                          <td style={{ ...td, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>{dateDisplay}</td>
                          <td style={td}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <span style={{ padding: '2px 8px', background: cfg.bg, color: cfg.color, fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{cfg.label}</span>
                              {!doc.visibleClient && <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.5625rem', color: 'var(--muted-foreground)' }}>non visible</span>}
                            </div>
                          </td>
                          <td style={{ ...td, whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                              <button title="Voir" onClick={() => showToast('Aperçu non disponible en démo.')} style={btnSm('var(--primary)', 'var(--secondary)')}><Eye size={12} /> Voir</button>
                              <button title="Télécharger" onClick={() => showToast('Téléchargement non disponible en démo.')} style={btnSm('var(--muted-foreground)', 'var(--muted)')}><Download size={12} /></button>
                              {doc.status === 'brouillon' && (
                                <button onClick={() => { publishDoc(doc.id, agentName, client.id); showToast(`Document publié dans l'espace client de ${client.name}.`); }} style={btnSm('var(--success)', 'rgba(26,107,68,0.10)')}><Send size={12} /> Publier</button>
                              )}
                              {(doc.status === 'disponible' || doc.status === 'publie') && (
                                <button onClick={() => { requestSignature(doc.id, agentName, client.id); showToast('Signature demandée.'); }} style={btnSm('#8B5CF6', 'rgba(139,92,246,0.10)')}><PenSquare size={12} /> Signer</button>
                              )}
                              {doc.status === 'a-signer' && (
                                <button onClick={() => { markSigned(doc.id, agentName, client.id); showToast('Document marqué comme signé.'); }} style={btnSm('var(--success)', 'rgba(26,107,68,0.10)')}><CheckCircle2 size={12} /> Signé</button>
                              )}
                              {doc.visibleClient && doc.status !== 'archive' && (
                                <button onClick={() => { retireFromClient(doc.id, agentName, client.id); showToast('Document retiré de l\'espace client.'); }} title="Retirer de l'espace client" style={btnSm('var(--muted-foreground)', 'var(--muted)')}><EyeOff size={12} /></button>
                              )}
                              {doc.status !== 'archive' && (
                                <button onClick={() => { archiveDoc(doc.id, agentName, client.id); showToast('Document archivé.'); }} title="Archiver" style={btnSm('#C8921A', 'rgba(200,146,26,0.10)')}><Archive size={12} /></button>
                              )}
                              {doc.status === 'archive' && (
                                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}><Shield size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> Archivé</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              )
            )}
          </div>
        );
      })}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: 'var(--foreground)', color: 'var(--background)', padding: '12px 18px', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 600, zIndex: 300, maxWidth: '360px' }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function btnSm(color: string, bg: string): React.CSSProperties {
  return { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 9px', background: bg, color, border: 'none', fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' };
}
const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '8px 10px', background: 'var(--input-background)', border: '1px solid var(--border)', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--foreground)' };
const labelStyle: React.CSSProperties = { display: 'block', fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'var(--primary)', color: 'var(--primary-foreground)', border: 'none', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' };
const btnOutline: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 14px', background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border)', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' };
const btnGhost: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 14px', background: 'var(--secondary)', color: 'var(--primary)', border: 'none', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' };
