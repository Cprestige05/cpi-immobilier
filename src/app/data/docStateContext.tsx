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
  allDocsByClient: Record<string, SharedDoc[]>;
  acceptDoc: (docId: string, agentName: string, clientId?: string) => void;
  refuseDoc: (docId: string, agentName: string, comment: string, clientId?: string) => void;
  requestReplacement: (docId: string, agentName: string, comment: string, clientId?: string) => void;
  remettreVerification: (docId: string, agentName: string, clientId?: string) => void;
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

  const nameFor = (clientId: string) => allClients.find(c => c.id === clientId)?.name ?? clientId;

  const nowStamp = () => {
    const d = new Date();
    return {
      date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
      heure: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const pushHistoryFor = (clientId: string, entry: Omit<HistoEntry, 'id'>) => {
    setAllHistory(prev => ({
      ...prev,
      [clientId]: [{ ...entry, id: 'h-live-' + Date.now() }, ...(prev[clientId] ?? [])],
    }));
  };

  const docLabelFor = (clientId: string, docId: string) =>
    (allDocs[clientId] ?? getInitialDocs(clientId)).find(d => d.id === docId)?.label ?? docId;

  const updateDocs = (clientId: string, docId: string, patch: Partial<SharedDoc>) => {
    setAllDocs(prev => ({
      ...prev,
      [clientId]: (prev[clientId] ?? getInitialDocs(clientId)).map(d =>
        d.id !== docId ? d : { ...d, ...patch }
      ),
    }));
  };

  const acceptDoc = (docId: string, agentName: string, clientId: string = selectedClientId) => {
    const { date, heure } = nowStamp();
    updateDocs(clientId, docId, { status: 'accepte', dateValidation: date, agentName });
    pushHistoryFor(clientId, {
      date, heure, utilisateur: agentName, role: 'Agent CPI',
      action: `${docLabelFor(clientId, docId)} validé${docId === 'identite' ? 'e' : ''}`,
      type: 'validation' as HistoActionType, cible: nameFor(clientId),
    });
  };

  const refuseDoc = (docId: string, agentName: string, comment: string, clientId: string = selectedClientId) => {
    const { date, heure } = nowStamp();
    updateDocs(clientId, docId, { status: 'refuse', commentaire: comment, agentName });
    pushHistoryFor(clientId, {
      date, heure, utilisateur: agentName, role: 'Agent CPI',
      action: `${docLabelFor(clientId, docId)} refusé${docId === 'identite' ? 'e' : ''}`,
      type: 'refus' as HistoActionType, cible: nameFor(clientId),
    });
  };

  const requestReplacement = (docId: string, agentName: string, comment: string, clientId: string = selectedClientId) => {
    const { date, heure } = nowStamp();
    updateDocs(clientId, docId, { status: 'a-remplacer', commentaire: comment, agentName });
    pushHistoryFor(clientId, {
      date, heure, utilisateur: agentName, role: 'Agent CPI',
      action: `Remplacement demandé — ${docLabelFor(clientId, docId)}`,
      type: 'refus' as HistoActionType, cible: nameFor(clientId),
    });
  };

  const remettreVerification = (docId: string, agentName: string, clientId: string = selectedClientId) => {
    const { date, heure } = nowStamp();
    updateDocs(clientId, docId, { status: 'verification', agentName });
    pushHistoryFor(clientId, {
      date, heure, utilisateur: agentName, role: 'Agent CPI',
      action: `${docLabelFor(clientId, docId)} remis en vérification`,
      type: 'document' as HistoActionType, cible: nameFor(clientId),
    });
  };

  return (
    <DocStateContext.Provider value={{
      requisDocs, history, allDocsByClient: allDocs,
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
