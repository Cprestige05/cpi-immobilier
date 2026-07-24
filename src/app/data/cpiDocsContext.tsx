import React, { createContext, useContext, useState, useEffect } from 'react';
import type { HistoEntry, HistoActionType } from './demoStore';
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
  publishDoc: (docId: string, agentName: string, clientId?: string) => void;
  archiveDoc: (docId: string, agentName: string, clientId?: string) => void;
  requestSignature: (docId: string, agentName: string, clientId?: string) => void;
  markSigned: (docId: string, agentName: string, clientId?: string) => void;
  retireFromClient: (docId: string, agentName: string, clientId?: string) => void;
  createDoc: (
    fields: Omit<CpiDoc, 'id' | 'dateCreation' | 'datePublication' | 'status' | 'visibleClient'>,
    agentName: string,
    publishNow: boolean,
    clientId?: string,
  ) => void;
}

const CpiDocsContext = createContext<CpiDocsCtx | null>(null);

// ─── Initial CPI documents (Aïssatou only — other clients start with empty set) ──

const INITIAL_CPI_DOCS_AISSATOU: CpiDoc[] = [
  { id: 'cpi1', categorie: 'contrats',     nom: 'Contrat de réservation CPI — Réf. CV-2026-04721',  reference: 'CV-2026-04721', version: 'V2', status: 'signe',     visibleClient: true,  signatureRequise: false, dateCreation: '15 juin 2026', datePublication: '15 juin 2026', auteur: 'Mme Thiombane', format: 'PDF', taille: '1,2 Mo' },
  { id: 'cpi2', categorie: 'contrats',     nom: 'Contrat de vente définitif',                       version: '—',               status: 'brouillon',  visibleClient: false, signatureRequise: false, dateCreation: '—',            auteur: 'Mme Thiombane' },
  { id: 'cpi3', categorie: 'conventions',  nom: 'Convention de financement bancaire',               version: 'V1', status: 'a-signer',   visibleClient: true,  signatureRequise: true,  dateCreation: '18 juin 2026', datePublication: '18 juin 2026', auteur: 'Mme Thiombane', format: 'PDF', taille: '0,9 Mo' },
  { id: 'cpi4', categorie: 'bancaires',    nom: 'Offre de prêt bancaire — Conditions personnalisées', version: 'V1', status: 'disponible', visibleClient: true,  signatureRequise: false, dateCreation: '20 juin 2026', datePublication: '20 juin 2026', auteur: 'Mme Thiombane', format: 'PDF', taille: '0,7 Mo' },
  { id: 'cpi5', categorie: 'bancaires',    nom: 'Fiche conditions de prêt bancaire',                version: 'V1', status: 'disponible', visibleClient: true,  signatureRequise: false, dateCreation: '20 juin 2026', datePublication: '20 juin 2026', auteur: 'Mme Thiombane', format: 'PDF', taille: '0,5 Mo' },
  { id: 'cpi6', categorie: 'courriers',    nom: "Accusé de réception du dossier",                   version: 'V1', status: 'disponible', visibleClient: true,  signatureRequise: false, dateCreation: '05 juin 2026', datePublication: '05 juin 2026', auteur: 'Mme Thiombane', format: 'PDF', taille: '0,3 Mo' },
  { id: 'cpi7', categorie: 'courriers',    nom: 'Courrier de confirmation de réservation',          version: 'V1', status: 'disponible', visibleClient: true,  signatureRequise: false, dateCreation: '10 juin 2026', datePublication: '10 juin 2026', auteur: 'Mme Thiombane', format: 'PDF', taille: '0,4 Mo' },
  { id: 'cpi8', categorie: 'pv',           nom: 'PV de réservation — Villa R+1, Ngolfagnick',       version: 'V1', status: 'signe',      visibleClient: true,  signatureRequise: false, dateCreation: '10 juin 2026', datePublication: '10 juin 2026', auteur: 'Mme Thiombane', format: 'PDF', taille: '0,8 Mo' },
  { id: 'cpi9', categorie: 'pv',           nom: 'PV de réception des travaux',                      version: '—',  status: 'brouillon',  visibleClient: false, signatureRequise: false, dateCreation: '—',            auteur: 'Mme Thiombane' },
  { id: 'cpi10',categorie: 'autorisations',nom: 'Autorisation de prélèvement sur salaire',          version: 'V1', status: 'a-signer',   visibleClient: true,  signatureRequise: true,  dateCreation: '20 juin 2026', datePublication: '20 juin 2026', auteur: 'Mme Thiombane', format: 'PDF', taille: '0,3 Mo' },
  { id: 'cpi11',categorie: 'autorisations',nom: 'Autorisation de construire',                       version: 'V1', status: 'disponible', visibleClient: true,  signatureRequise: false, dateCreation: '08 juin 2026', datePublication: '08 juin 2026', auteur: 'Mme Thiombane', format: 'PDF', taille: '0,5 Mo' },
];

const INITIAL_CPI_DOCS_MAMADOU: CpiDoc[] = [
  { id: 'cpi-m1', categorie: 'contrats', nom: 'Contrat de réservation — Villa F3', version: 'V1', status: 'signe', visibleClient: true, signatureRequise: false, dateCreation: '25 mai 2026', datePublication: '25 mai 2026', auteur: 'I. Fall', format: 'PDF', taille: '1,0 Mo' },
  { id: 'cpi-m2', categorie: 'courriers', nom: "Accusé de réception du dossier", version: 'V1', status: 'disponible', visibleClient: true, signatureRequise: false, dateCreation: '21 mai 2026', datePublication: '21 mai 2026', auteur: 'I. Fall', format: 'PDF', taille: '0,2 Mo' },
];

const INITIAL_DOCS_BY_CLIENT: Record<string, CpiDoc[]> = {
  'c-aissatou': INITIAL_CPI_DOCS_AISSATOU,
  'c-mamadou':  INITIAL_CPI_DOCS_MAMADOU,
  'c-fatou':    [],
  'c-ibrahim':  [],
};

const ALL_CLIENT_IDS = Object.keys(INITIAL_DOCS_BY_CLIENT);

// ─── localStorage helpers ──────────────────────────────────────────────────────

// Préfixe v2 : invalide toute donnée de démo persistée avant la purge CHUES/CBAO.
const LS_CPIDOCS_KEY    = (id: string) => `cpi_cpidocs_v2_${id}`;
const LS_CPIHISTORY_KEY = (id: string) => `cpi_cpihistory_v2_${id}`;

const loadAllCpiDocs = (): Record<string, CpiDoc[]> => {
  const result: Record<string, CpiDoc[]> = {};
  for (const clientId of ALL_CLIENT_IDS) {
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
  for (const clientId of ALL_CLIENT_IDS) {
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
    const newDoc: CpiDoc = {
      ...fields, id: 'cpi-' + Date.now(), dateCreation: date,
      status: publishNow ? 'disponible' : 'brouillon',
      visibleClient: publishNow, datePublication: publishNow ? date : undefined,
    };
    setAllCpiDocs(prev => ({
      ...prev,
      [clientId]: [newDoc, ...(prev[clientId] ?? [])],
    }));
    pushHistoryFor(clientId, { date, heure, utilisateur: agentName, role: 'Agent CPI', action: publishNow ? `Document publié — ${fields.nom}` : `Brouillon créé — ${fields.nom}`, type: 'document' as HistoActionType, cible: nameFor(clientId) });
  };

  return (
    <CpiDocsContext.Provider value={{ cpiDocs, cpiHistory, allCpiDocsByClient: allCpiDocs, publishDoc, archiveDoc, requestSignature, markSigned, retireFromClient, createDoc }}>
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
