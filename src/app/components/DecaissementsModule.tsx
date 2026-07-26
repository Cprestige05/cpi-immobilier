import React, { useState } from 'react';
import {
  Banknote, CheckCircle2, Clock, ChevronDown, ChevronUp, MessageSquare,
  Search, MapPin, Hammer, Landmark, Send, Circle,
} from 'lucide-react';
import { useClientContext } from '../contexts/ClientContext';
import { useDocState } from '../data/docStateContext';
import { resolveClientBank } from '../data/bankRegistry';
import { logActivity } from '../data/activityLog';
import {
  loadDecaissements, saveDecaissements, defaultDecaissement,
  FONCIER_STEPS, CONSTRUCTION_TRANCHES, type DecaissementState,
} from '../data/decaissementStore';

const fmtFCFA = (n: number) => n.toLocaleString('fr-FR') + ' FCFA';
const parseAmount = (s: string) => parseInt(s.replace(/\D/g, ''), 10) || 0;
const today = () => new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

export default function DecaissementsModule() {
  const { allClients } = useClientContext();
  const { pushNotification } = useDocState();

  const [state, setState] = useState<Record<string, DecaissementState>>(() => {
    const loaded = loadDecaissements();
    const map: Record<string, DecaissementState> = {};
    allClients.forEach(c => { map[c.id] = loaded[c.id] ?? defaultDecaissement(); });
    return map;
  });
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(allClients[0]?.id ?? null);
  const [commentFor, setCommentFor] = useState<{ id: string; tr: number } | null>(null);
  const [commentText, setCommentText] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2800); };

  const mutate = (id: string, updater: (s: DecaissementState) => DecaissementState) =>
    setState(prev => { const next = { ...prev, [id]: updater(prev[id] ?? defaultDecaissement()) }; saveDecaissements(next); return next; });

  const st = (id: string) => state[id] ?? defaultDecaissement();
  const bankFor = (id: string) => { const b = resolveClientBank(id); return b !== '—' ? b : ''; };

  // ── Actions ──────────────────────────────────────────────────────────────────
  const setTerrain = (id: string, n: number) => mutate(id, s => ({ ...s, terrainMontant: n }));
  const decaisserTerrain = (id: string, name: string) => {
    const montant = st(id).terrainMontant;
    mutate(id, s => ({ ...s, terrainDecaisse: true, terrainDate: today(), foncier: s.foncier.map((v, i) => i <= 1 ? true : v) }));
    pushNotification(id, `Décaissement du prix du terrain effectué (${fmtFCFA(montant)}).`, 'Notification', 'CPI');
    logActivity({ utilisateur: 'CPI', role: 'Agent CPI', action: `Prix du terrain décaissé — ${fmtFCFA(montant)}`, type: 'decaissement', cible: name });
    showToast(`Prix du terrain décaissé pour ${name} · client notifié.`);
  };
  const validateFoncier = (id: string, idx: number, name: string) => {
    mutate(id, s => ({ ...s, foncier: s.foncier.map((v, i) => i <= idx ? true : v) }));
    logActivity({ utilisateur: 'CPI', role: 'Agent CPI', action: `Étape foncière validée — ${FONCIER_STEPS[idx]}`, type: 'validation', cible: name });
  };
  const activateConstruction = (id: string, name: string) => {
    mutate(id, s => ({ ...s, constructionActive: true }));
    logActivity({ utilisateur: 'CPI', role: 'Agent CPI', action: `Construction lancée — ${fmtFCFA(st(id).constructionMontant)}`, type: 'decaissement', cible: name });
  };
  const setConstruction = (id: string, n: number) => mutate(id, s => ({ ...s, constructionMontant: n }));
  const validateTranche = (id: string, tr: number, name: string) => {
    mutate(id, s => ({ ...s, tranches: s.tranches.map((t, i) => i === tr ? { ...t, validated: true, date: today() } : t) }));
    const montant = Math.round(st(id).constructionMontant * CONSTRUCTION_TRANCHES[tr].pct / 100);
    pushNotification(id, `Tranche ${tr + 1} décaissée (${CONSTRUCTION_TRANCHES[tr].label}) — ${fmtFCFA(montant)}.`, 'Notification', 'CPI');
    logActivity({ utilisateur: 'CPI', role: 'Agent CPI', action: `Tranche ${tr + 1} décaissée (${CONSTRUCTION_TRANCHES[tr].label}) — ${fmtFCFA(montant)}`, type: 'decaissement', cible: name });
    showToast(`Tranche ${tr + 1} décaissée pour ${name} · client notifié.`);
  };
  const saveComment = () => {
    if (!commentFor) return;
    mutate(commentFor.id, s => ({ ...s, tranches: s.tranches.map((t, i) => i === commentFor.tr ? { ...t, comment: commentText.trim() } : t) }));
    setCommentFor(null); setCommentText(''); showToast('Commentaire enregistré.');
  };

  // ── KPI ──────────────────────────────────────────────────────────────────────
  const rows = allClients.map(c => ({ c, s: st(c.id) }));
  const nbDossiers = rows.length;
  const parcellesDecaissees = rows.filter(r => r.s.terrainDecaisse).length;
  const enConstruction = rows.filter(r => r.s.constructionActive).length;
  const totalDecaisse = rows.reduce((n, r) => {
    let m = r.s.terrainDecaisse ? r.s.terrainMontant : 0;
    if (r.s.constructionActive) r.s.tranches.forEach((t, i) => { if (t.validated) m += Math.round(r.s.constructionMontant * CONSTRUCTION_TRANCHES[i].pct / 100); });
    return n + m;
  }, 0);

  const q = query.trim().toLowerCase();
  const list = rows.filter(r => !q || r.c.name.toLowerCase().includes(q) || r.c.ref.toLowerCase().includes(q));

  const card: React.CSSProperties = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden' };
  const amountInput = (value: number, onChange: (n: number) => void, disabled?: boolean) => (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '6px 10px', background: disabled ? 'var(--muted)' : 'var(--input-background)' }}>
      <input value={value ? value.toLocaleString('fr-FR') : ''} disabled={disabled} onChange={e => onChange(parseAmount(e.target.value))} placeholder="0"
        style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', fontWeight: 700, color: 'var(--foreground)', width: 120, textAlign: 'right' }} />
      <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>FCFA</span>
    </div>
  );

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--foreground)', margin: '0 0 4px' }}>Décaissements bancaires</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', margin: 0 }}>Acquisition foncière (décaissement unique) puis construction par tranches. Les informations sont visibles par le client.</p>
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        {[
          { l: 'Dossiers suivis', v: String(nbDossiers), c: 'var(--primary)' },
          { l: 'Parcelles financées', v: String(parcellesDecaissees), c: 'var(--success)' },
          { l: 'En construction', v: String(enConstruction), c: '#C8921A' },
          { l: 'Total décaissé', v: fmtFCFA(totalDecaisse), c: 'var(--foreground)' },
        ].map(s => (
          <div key={s.l} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '14px 16px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: s.l === 'Total décaissé' ? '1.0625rem' : '1.5rem', fontWeight: 800, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Recherche */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', background: 'var(--card)' }}>
        <Search size={16} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher un dossier (nom, n°)…" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', color: 'var(--foreground)' }} />
      </div>

      {/* Liste */}
      {list.length === 0 ? (
        <div style={{ ...card, padding: '40px 20px', textAlign: 'center' }}>
          <Banknote size={26} style={{ color: 'var(--border)', margin: '0 auto 10px', display: 'block' }} />
          <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{nbDossiers === 0 ? 'Aucun dossier pour le moment.' : 'Aucun dossier ne correspond.'}</div>
        </div>
      ) : list.map(({ c, s }) => {
        const isOpen = expanded === c.id;
        const bank = bankFor(c.id);
        const tranchesDone = s.tranches.filter(t => t.validated).length;
        return (
          <div key={c.id} style={card}>
            <button onClick={() => setExpanded(isOpen ? null : c.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', flexWrap: 'wrap' }}>
              <Banknote size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--foreground)' }}>{c.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: 2 }}>{c.ref} · {c.projectNom} · {bank || 'Banque à assigner'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.625rem', fontWeight: 700, padding: '3px 9px', borderRadius: 'var(--r-full)', color: s.terrainDecaisse ? 'var(--success)' : '#C8921A', background: s.terrainDecaisse ? 'rgba(26,107,68,0.1)' : 'rgba(200,146,26,0.1)' }}>
                  {s.terrainDecaisse ? 'Terrain financé' : 'Terrain à financer'}
                </span>
                {s.constructionActive && <span style={{ fontSize: '0.625rem', fontWeight: 700, padding: '3px 9px', borderRadius: 'var(--r-full)', color: 'var(--primary)', background: 'var(--secondary)' }}>Construction {tranchesDone}/4</span>}
                {isOpen ? <ChevronUp size={15} style={{ color: 'var(--muted-foreground)' }} /> : <ChevronDown size={15} style={{ color: 'var(--muted-foreground)' }} />}
              </div>
            </button>

            {isOpen && (
              <div style={{ borderTop: '1px solid var(--border)', padding: 18, display: 'flex', flexDirection: 'column', gap: 20, background: 'var(--background)' }}>

                {/* ── Phase 1 — Acquisition foncière ── */}
                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                    <MapPin size={16} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--foreground)' }}>Phase 1 · Acquisition foncière</span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}>— décaissement unique (crédit conso)</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>Prix du terrain</span>
                      {amountInput(s.terrainMontant, n => setTerrain(c.id, n), s.terrainDecaisse)}
                      {bank && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: 'var(--muted-foreground)' }}><Landmark size={12} /> {bank}</span>}
                    </div>
                    {s.terrainDecaisse ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', fontWeight: 700, color: 'var(--success)' }}><CheckCircle2 size={15} /> Décaissé le {s.terrainDate}</span>
                    ) : (
                      <button onClick={() => decaisserTerrain(c.id, c.name)} disabled={s.terrainMontant <= 0}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 'var(--r-sm)', border: 'none', background: s.terrainMontant > 0 ? 'var(--success)' : 'var(--muted)', color: '#fff', fontSize: '0.8125rem', fontWeight: 700, cursor: s.terrainMontant > 0 ? 'pointer' : 'not-allowed' }}>
                        <Send size={13} /> Décaisser le prix du terrain
                      </button>
                    )}
                  </div>

                  {/* Parcours foncier 5 étapes */}
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Parcours foncier</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {FONCIER_STEPS.map((step, i) => {
                      const done = s.foncier[i];
                      const isNext = !done && s.foncier.slice(0, i).every(Boolean);
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: done ? 'rgba(26,107,68,0.06)' : 'var(--background)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                          {done ? <CheckCircle2 size={16} style={{ color: 'var(--success)', flexShrink: 0 }} /> : <Circle size={16} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />}
                          <span style={{ flex: 1, fontSize: '0.8125rem', fontWeight: done ? 600 : 500, color: done ? 'var(--foreground)' : 'var(--muted-foreground)' }}>{i + 1}. {step}</span>
                          {isNext && <button onClick={() => validateFoncier(c.id, i, c.name)} style={btnSm('var(--success)', 'rgba(26,107,68,0.10)')}>Valider</button>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Phase 2 — Construction ── */}
                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                    <Hammer size={16} style={{ color: '#C8921A' }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--foreground)' }}>Phase 2 · Construction de la villa</span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}>— décaissement par tranches</span>
                  </div>

                  {!s.constructionActive ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>Coût de construction</span>
                      {amountInput(s.constructionMontant, n => setConstruction(c.id, n))}
                      <button onClick={() => activateConstruction(c.id, c.name)} disabled={s.constructionMontant <= 0 || !s.terrainDecaisse}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 'var(--r-sm)', border: 'none', background: s.constructionMontant > 0 && s.terrainDecaisse ? '#C8921A' : 'var(--muted)', color: '#fff', fontSize: '0.8125rem', fontWeight: 700, cursor: s.constructionMontant > 0 && s.terrainDecaisse ? 'pointer' : 'not-allowed' }}>
                        <Hammer size={13} /> Lancer la construction
                      </button>
                      {!s.terrainDecaisse && <span style={{ fontSize: '0.6875rem', color: '#C8921A', fontStyle: 'italic' }}>Le terrain doit d'abord être financé.</span>}
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>Coût total</span>
                        {amountInput(s.constructionMontant, n => setConstruction(c.id, n))}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {CONSTRUCTION_TRANCHES.map((tr, i) => {
                          const t = s.tranches[i];
                          const montant = Math.round(s.constructionMontant * tr.pct / 100);
                          const prevDone = i === 0 ? true : s.tranches[i - 1].validated;
                          return (
                            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 12, background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', flexWrap: 'wrap' }}>
                              <div style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.8125rem', color: t.validated ? 'var(--success)' : 'var(--primary)', background: t.validated ? 'rgba(26,107,68,0.1)' : 'var(--secondary)' }}>T{i + 1}</div>
                              <div style={{ flex: 1, minWidth: 200 }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--foreground)' }}>Tranche {i + 1} — {tr.label}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{tr.pct}% · <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{fmtFCFA(montant)}</span></div>
                                <div style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)', marginTop: 2 }}>{tr.detail}</div>
                                {t.comment && <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontStyle: 'italic', marginTop: 3 }}>"{t.comment}"</div>}
                                {t.validated && t.date && <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, marginTop: 3 }}>Décaissé le {t.date}</div>}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                {t.validated ? (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.6875rem', fontWeight: 700, color: 'var(--success)', background: 'rgba(26,107,68,0.1)', padding: '3px 9px', borderRadius: 'var(--r-full)' }}><CheckCircle2 size={11} /> Décaissé</span>
                                ) : prevDone ? (
                                  <button onClick={() => validateTranche(c.id, i, c.name)} style={btnSm('var(--success)', 'rgba(26,107,68,0.10)')}><Send size={11} /> Décaisser</button>
                                ) : (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.6875rem', fontWeight: 700, color: '#C8921A', background: 'rgba(200,146,26,0.1)', padding: '3px 9px', borderRadius: 'var(--r-full)' }}><Clock size={11} /> En attente</span>
                                )}
                                <button onClick={() => { setCommentFor({ id: c.id, tr: i }); setCommentText(t.comment || ''); }} style={btnSm('var(--primary)', 'var(--secondary)')}><MessageSquare size={11} /> Commenter</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Comment modal */}
      {commentFor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', width: '100%', maxWidth: 440, padding: 24 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: 12 }}>Commenter la tranche T{commentFor.tr + 1}</div>
            <textarea value={commentText} onChange={e => setCommentText(e.target.value)} rows={3} placeholder="Ex : Décaissement effectué après inspection du chantier." style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', background: 'var(--input-background)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', outline: 'none', fontSize: '0.875rem', color: 'var(--foreground)', resize: 'vertical', lineHeight: 1.55, marginBottom: 14 }} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setCommentFor(null)} style={btnOutline}>Annuler</button>
              <button onClick={saveComment} style={btnPrimary}><CheckCircle2 size={13} /> Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--foreground)', color: 'var(--background)', padding: '12px 18px', borderRadius: 'var(--r-sm)', fontSize: '0.875rem', fontWeight: 600, zIndex: 300, maxWidth: 360 }}>{toast}</div>
      )}
    </div>
  );
}

function btnSm(color: string, bg: string): React.CSSProperties {
  return { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: bg, color, border: 'none', borderRadius: 'var(--r-sm)', fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' };
}
const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 'var(--r-sm)', background: 'var(--primary)', color: 'var(--primary-foreground)', border: 'none', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' };
const btnOutline: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 'var(--r-sm)', background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border)', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' };
