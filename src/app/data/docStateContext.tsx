import React, { createContext, useContext, useState, useEffect } from 'react';
import { ALL_REQUIS_DOCS, ALL_HISTORIQUE, type DocStatus, type HistoEntry, type HistoActionType } from './demoStore';
import { useClientContext } from '../contexts/ClientContext';

// ─── Shared doc shape (live state) ───────────────────────────────────────────

export interface SharedDoc {
  id: string;
  label: string;
  status: DocStatus;
  commentaire?: string;
  dateValidation?: string;
  agentName?: string;
  version: number;
  submittedLabel?: string;
  date?: string;
  taille?: string;
}

// ─── Context interface ────────────────────────────────────────────────────────

interface DocStateCtx {
  requisDocs: SharedDoc[];
  history: HistoEntry[];
  acceptDoc: (docId: string, agentName: string) => void;
  refuseDoc: (docId: string, agentName: string, comment: string) => void;
  requestReplacement: (docId: string, agentName: string, comment: string) => void;
  remettreVerification: (docId: string, agentName: string) => void;
}

const DocStateContext = createContext<DocStateCtx | null>(null);

// ─── Per-client localStorage keys ────────────────────────────────────────────

const LS_DOCS_KEY    = (id: string) => `cpi_docs_${id}`;
const LS_HISTORY_KEY = (id: string) => `cpi_history_${id}`;

const ALL_CLIENT_IDS = Object.keys(ALL_REQUIS_DOCS);

const getInitialDocs = (clientId: string): SharedDoc[] => {
  const source = ALL_REQUIS_DOCS[clientId] ?? [];
  return source.map(d => ({
    id: d.id, label: d.label, status: d.status,
    commentaire: d.commentaire, dateValidation: d.dateValidation,
    agentName: undefined, version: d.version,
    submittedLabel: d.submittedLabel, date: d.date, taille: d.taille,
  }));
};

const loadAllDocs = (): Record<string, SharedDoc[]> => {
  // Migrate legacy single-client key for Aïssatou
  let aissatouLegacy: SharedDoc[] | null = null;
  try {
    const s = localStorage.getItem('cpi_demo_requis_docs');
    if (s) aissatouLegacy = JSON.parse(s) as SharedDoc[];
  } catch {}

  const result: Record<string, SharedDoc[]> = {};
  for (const clientId of ALL_CLIENT_IDS) {
    try {
      const s = localStorage.getItem(LS_DOCS_KEY(clientId));
      if (s) { result[clientId] = JSON.parse(s) as SharedDoc[]; continue; }
    } catch {}
    result[clientId] = clientId === 'c-aissatou' && aissatouLegacy
      ? aissatouLegacy
      : getInitialDocs(clientId);
  }
  return result;
};

const loadAllHistory = (): Record<string, HistoEntry[]> => {
  let aissatouLegacy: HistoEntry[] | null = null;
  try {
    const s = localStorage.getItem('cpi_demo_requis_history');
    if (s) aissatouLegacy = JSON.parse(s) as HistoEntry[];
  } catch {}

  const result: Record<string, HistoEntry[]> = {};
  for (const clientId of ALL_CLIENT_IDS) {
    try {
      const s = localStorage.getItem(LS_HISTORY_KEY(clientId));
      if (s) { result[clientId] = JSON.parse(s) as HistoEntry[]; continue; }
    } catch {}
    result[clientId] = clientId === 'c-aissatou' && aissatouLegacy
      ? aissatouLegacy
      : [...(ALL_HISTORIQUE[clientId] ?? [])];
  }
  return result;
};

// ─── Provider ────────────────────────────────────────────────────────────────

export function DocStateProvider({ children }: { children: React.ReactNode }) {
  const { selectedClientId, allClients } = useClientContext();

  const [allDocs,    setAllDocs]    = useState<Record<string, SharedDoc[]>>(loadAllDocs);
  const [allHistory, setAllHistory] = useState<Record<string, HistoEntry[]>>(loadAllHistory);

  // Persist per-client state on every change
  useEffect(() => {
    for (const [clientId, docs] of Object.entries(allDocs)) {
      try { localStorage.setItem(LS_DOCS_KEY(clientId), JSON.stringify(docs)); } catch {}
    }
  }, [allDocs]);

  useEffect(() => {
    for (const [clientId, hist] of Object.entries(allHistory)) {
      try { localStorage.setItem(LS_HISTORY_KEY(clientId), JSON.stringify(hist)); } catch {}
    }
  }, [allHistory]);

  // Derived values for the currently selected client
  const requisDocs: SharedDoc[] = allDocs[selectedClientId] ?? getInitialDocs(selectedClientId);
  const history:    HistoEntry[] = allHistory[selectedClientId] ?? [];

  const clientName = allClients.find(c => c.id === selectedClientId)?.name ?? selectedClientId;

  const nowStamp = () => {
    const d = new Date();
    return {
      date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
      heure: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const pushHistory = (entry: Omit<HistoEntry, 'id'>) => {
    setAllHistory(prev => ({
      ...prev,
      [selectedClientId]: [{ ...entry, id: 'h-live-' + Date.now() }, ...(prev[selectedClientId] ?? [])],
    }));
  };

  const docLabel = (docId: string) =>
    requisDocs.find(d => d.id === docId)?.label ?? docId;

  const updateDocs = (docId: string, patch: Partial<SharedDoc>) => {
    setAllDocs(prev => ({
      ...prev,
      [selectedClientId]: (prev[selectedClientId] ?? getInitialDocs(selectedClientId)).map(d =>
        d.id !== docId ? d : { ...d, ...patch }
      ),
    }));
  };

  const acceptDoc = (docId: string, agentName: string) => {
    const { date, heure } = nowStamp();
    updateDocs(docId, { status: 'accepte', dateValidation: date, agentName });
    pushHistory({
      date, heure, utilisateur: agentName, role: 'Agent CPI',
      action: `${docLabel(docId)} validé${docId === 'identite' ? 'e' : ''}`,
      type: 'validation' as HistoActionType, cible: clientName,
    });
  };

  const refuseDoc = (docId: string, agentName: string, comment: string) => {
    const { date, heure } = nowStamp();
    updateDocs(docId, { status: 'refuse', commentaire: comment, agentName });
    pushHistory({
      date, heure, utilisateur: agentName, role: 'Agent CPI',
      action: `${docLabel(docId)} refusé${docId === 'identite' ? 'e' : ''}`,
      type: 'refus' as HistoActionType, cible: clientName,
    });
  };

  const requestReplacement = (docId: string, agentName: string, comment: string) => {
    const { date, heure } = nowStamp();
    updateDocs(docId, { status: 'a-remplacer', commentaire: comment, agentName });
    pushHistory({
      date, heure, utilisateur: agentName, role: 'Agent CPI',
      action: `Remplacement demandé — ${docLabel(docId)}`,
      type: 'refus' as HistoActionType, cible: clientName,
    });
  };

  const remettreVerification = (docId: string, agentName: string) => {
    const { date, heure } = nowStamp();
    updateDocs(docId, { status: 'verification', agentName });
    pushHistory({
      date, heure, utilisateur: agentName, role: 'Agent CPI',
      action: `${docLabel(docId)} remis en vérification`,
      type: 'document' as HistoActionType, cible: clientName,
    });
  };

  return (
    <DocStateContext.Provider value={{
      requisDocs, history,
      acceptDoc, refuseDoc, requestReplacement, remettreVerification,
    }}>
      {children}
    </DocStateContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDocState(): DocStateCtx {
  const ctx = useContext(DocStateContext);
  if (!ctx) throw new Error('useDocState must be used within DocStateProvider');
  return ctx;
}
