import React, { createContext, useContext, useState, useEffect } from 'react';
import type { HistoEntry, HistoActionType } from './demoStore';
import { loadClients } from './clientRegistry';
import { useClientContext } from '../contexts/ClientContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CpiDocStatus =
  | 'brouillon'
  | 'publie'
  | 'disponible'
  | 'a-signer'
  | 'signe'
  | 'refuse'
  | 'archive';

export type CpiCategorie =
  | 'contrats'
  | 'conventions'
  | 'bancaires'
  | 'courriers'
  | 'pv'
  | 'autorisations';

export interface CpiDoc {
  id: string;
  categorie: CpiCategorie;
  nom: string;
  reference?: string;
  dateCreation: string;
  datePublication?: string;
  version: string;
  status: CpiDocStatus;
  auteur: string;
  fichier?: string;
  commentaire?: string;
  visibleClient: boolean;
  signatureRequise: boolean;
  taille?: string;
  format?: string;
}

// ─── Context interface ────────────────────────────────────────────────────────

interface CpiDocsCtx {
  cpiDocs: CpiDoc[];
  cpiHistory: HistoEntry[];
  allCpiDocsByClient: Record<string, CpiDoc[]>;
  allCpiHistoryByClient: Record<string, HistoEntry[]>;
  publishDoc: (docId: string, agentName: string, clientId?: string) => void;
  archiveDoc: (docId: string, agentName: string, clientId?: string) => void;
  requestSignature: (docId: string, agentName: string, clientId?: string) => void;
  markSigned: (docId: string, agentName: string, clientId?: string) => void;
  // Signature électronique par le client (depuis « Mon dossier »).
  signDocByClient: (docId: string, clientId?: string) => void;
  retireFromClient: (docId: string, agentName: string, clientId?: string) => void;
  createDoc: (
    fields: Omit<CpiDoc, 'id' | 'dateCreation' | 'datePublication' | 'status' | 'visibleClient'>,
    agentName: string,
    publishNow: boolean,
    clientId?: string,
  ) => void;
}

const CpiDocsContext = createContext<CpiDocsCtx | null>(null);

// ─── Documents CPI initiaux ───────────────────────────────────────────────────
// Base vide : aucun document fictif. Chaque dossier démarre sans document ; les
// documents CPI sont créés par l'Agent CPI (createDoc) pour ses vrais clients.

const INITIAL_DOCS_BY_CLIENT: Record<string, CpiDoc[]> = {};

// Ids recalculés à chaque appel (le registre grandit en cours de session).
const clientIds = (): string[] => loadClients().map(c => c.id);

// ─── localStorage helpers ──────────────────────────────────────────────────────

// Préfixe v3 : base vide — invalide toute donnée de démo persistée.
const LS_CPIDOCS_KEY    = (id: string) => `cpi_cpidocs_v3_${id}`;
const LS_CPIHISTORY_KEY = (id: string) => `cpi_cpihistory_v3_${id}`;

const loadAllCpiDocs = (): Record<string, CpiDoc[]> => {
  const result: Record<string, CpiDoc[]> = {};
  for (const clientId of clientIds()) {
    try {
      const s = localStorage.getItem(LS_CPIDOCS_KEY(clientId));
      if (s) { result[clientId] = JSON.parse(s) as CpiDoc[]; continue; }
    } catch {}
    result[clientId] = [...(INITIAL_DOCS_BY_CLIENT[clientId] ?? [])];
  }
  return result;
};

const loadAllCpiHistory = (): Record<string, HistoEntry[]> => {
  const result: Record<string, HistoEntry[]> = {};
  for (const clientId of clientIds()) {
    try {
      const s = localStorage.getItem(LS_CPIHISTORY_KEY(clientId));
      if (s) { result[clientId] = JSON.parse(s) as HistoEntry[]; continue; }
    } catch {}
    result[clientId] = [];
  }
  return result;
};

// ─── Provider ────────────────────────────────────────────────────────────────

export function CpiDocsProvider({ children }: { children: React.ReactNode }) {
  const { selectedClientId, allClients } = useClientContext();

  const [allCpiDocs,    setAllCpiDocs]    = useState<Record<string, CpiDoc[]>>(loadAllCpiDocs);
  const [allCpiHistory, setAllCpiHistory] = useState<Record<string, HistoEntry[]>>(loadAllCpiHistory);

  useEffect(() => {
    for (const [clientId, docs] of Object.entries(allCpiDocs)) {
      try { localStorage.setItem(LS_CPIDOCS_KEY(clientId), JSON.stringify(docs)); } catch {}
    }
  }, [allCpiDocs]);

  useEffect(() => {
    for (const [clientId, hist] of Object.entries(allCpiHistory)) {
      try { localStorage.setItem(LS_CPIHISTORY_KEY(clientId), JSON.stringify(hist)); } catch {}
    }
  }, [allCpiHistory]);

  const cpiDocs:    CpiDoc[]     = allCpiDocs[selectedClientId]    ?? INITIAL_DOCS_BY_CLIENT[selectedClientId] ?? [];
  const cpiHistory: HistoEntry[] = allCpiHistory[selectedClientId] ?? [];

  const nameFor = (clientId: string) => allClients.find(c => c.id === clientId)?.name ?? clientId;

  const nowStamp = () => {
    const d = new Date();
    return {
      date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
      heure: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const pushHistoryFor = (clientId: string, entry: Omit<HistoEntry, 'id'>) =>
    setAllCpiHistory(prev => ({
      ...prev,
      [clientId]: [{ ...entry, id: 'hcpi-' + Date.now() }, ...(prev[clientId] ?? [])],
    }));

  const updateDocFor = (clientId: string, docId: string, patch: Partial<CpiDoc>) =>
    setAllCpiDocs(prev => ({
      ...prev,
      [clientId]: (prev[clientId] ?? []).map(d => d.id !== docId ? d : { ...d, ...patch }),
    }));

  const docNomFor = (clientId: string, docId: string) =>
    (allCpiDocs[clientId] ?? []).find(d => d.id === docId)?.nom ?? docId;

  const publishDoc = (docId: string, agentName: string, clientId: string = selectedClientId) => {
    const { date, heure } = nowStamp();
    updateDocFor(clientId, docId, { status: 'disponible', visibleClient: true, datePublication: date });
    pushHistoryFor(clientId, { date, heure, utilisateur: agentName, role: 'Agent CPI', action: `Document publié — ${docNomFor(clientId, docId)}`, type: 'document' as HistoActionType, cible: nameFor(clientId) });
  };

  const archiveDoc = (docId: string, agentName: string, clientId: string = selectedClientId) => {
    const { date, heure } = nowStamp();
    updateDocFor(clientId, docId, { status: 'archive', visibleClient: false });
    pushHistoryFor(clientId, { date, heure, utilisateur: agentName, role: 'Agent CPI', action: `Document archivé — ${docNomFor(clientId, docId)}`, type: 'document' as HistoActionType, cible: nameFor(clientId) });
  };

  const requestSignature = (docId: string, agentName: string, clientId: string = selectedClientId) => {
    const { date, heure } = nowStamp();
    updateDocFor(clientId, docId, { status: 'a-signer', signatureRequise: true, visibleClient: true });
    pushHistoryFor(clientId, { date, heure, utilisateur: agentName, role: 'Agent CPI', action: `Signature demandée — ${docNomFor(clientId, docId)}`, type: 'document' as HistoActionType, cible: nameFor(clientId) });
  };

  const markSigned = (docId: string, agentName: string, clientId: string = selectedClientId) => {
    const { date, heure } = nowStamp();
    updateDocFor(clientId, docId, { status: 'signe', signatureRequise: false, datePublication: date });
    pushHistoryFor(clientId, { date, heure, utilisateur: agentName, role: 'Agent CPI', action: `Document signé — ${docNomFor(clientId, docId)}`, type: 'validation' as HistoActionType, cible: nameFor(clientId) });
  };

  const signDocByClient = (docId: string, clientId: string = selectedClientId) => {
    const { date, heure } = nowStamp();
    updateDocFor(clientId, docId, { status: 'signe', signatureRequise: false, datePublication: date });
    pushHistoryFor(clientId, { date, heure, utilisateur: nameFor(clientId), role: 'Client', action: `Document signé — ${docNomFor(clientId, docId)}`, type: 'validation' as HistoActionType, cible: nameFor(clientId) });
  };

  const retireFromClient = (docId: string, agentName: string, clientId: string = selectedClientId) => {
    const { date, heure } = nowStamp();
    updateDocFor(clientId, docId, { visibleClient: false });
    pushHistoryFor(clientId, { date, heure, utilisateur: agentName, role: 'Agent CPI', action: `Document retiré de l'espace client — ${docNomFor(clientId, docId)}`, type: 'document' as HistoActionType, cible: nameFor(clientId) });
  };

  const createDoc = (
    fields: Omit<CpiDoc, 'id' | 'dateCreation' | 'datePublication' | 'status' | 'visibleClient'>,
    agentName: string,
    publishNow: boolean,
    clientId: string = selectedClientId,
  ) => {
    const { date, heure } = nowStamp();
    // Un document publié qui requiert une signature part directement en « à signer »
    // (le client le voit et peut le signer dans « Mon dossier »).
    const publishedStatus = fields.signatureRequise ? 'a-signer' : 'disponible';
    const newDoc: CpiDoc = {
      ...fields, id: 'cpi-' + Date.now(), dateCreation: date,
      status: publishNow ? publishedStatus : 'brouillon',
      visibleClient: publishNow, datePublication: publishNow ? date : undefined,
    };
    setAllCpiDocs(prev => ({
      ...prev,
      [clientId]: [newDoc, ...(prev[clientId] ?? [])],
    }));
    pushHistoryFor(clientId, { date, heure, utilisateur: agentName, role: 'Agent CPI', action: publishNow ? `Document publié — ${fields.nom}` : `Brouillon créé — ${fields.nom}`, type: 'document' as HistoActionType, cible: nameFor(clientId) });
  };

  return (
    <CpiDocsContext.Provider value={{ cpiDocs, cpiHistory, allCpiDocsByClient: allCpiDocs, allCpiHistoryByClient: allCpiHistory, publishDoc, archiveDoc, requestSignature, markSigned, signDocByClient, retireFromClient, createDoc }}>
      {children}
    </CpiDocsContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCpiDocs(): CpiDocsCtx {
  const ctx = useContext(CpiDocsContext);
  if (!ctx) throw new Error('useCpiDocs must be used within CpiDocsProvider');
  return ctx;
}
