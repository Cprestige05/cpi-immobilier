/**
 * useClientData — Single Source of Truth for all client-specific data.
 *
 * Returns the full client record for the currently selected client from
 * demoStore, keyed by the ClientContext's selectedClientId.
 *
 * All pages MUST derive their client data from this hook instead of
 * importing CLIENT_AISSATOU directly, so that:
 *  - Agent views that switch clients stay consistent
 *  - A single data change propagates everywhere immediately
 *  - There is zero duplication of client constants across components
 *
 * Usage:
 *   const client = useClientData();
 *   // client.name, client.ref, client.projectNom, client.conseiller …
 *   // client.chantier.progression, client.tranches[0].montant …
 */

import { useMemo } from 'react';
import { useClientContext } from '../contexts/ClientContext';
import {
  CLIENT_AISSATOU,
  CLIENT_MAMADOU,
  CLIENT_FATOU,
  CLIENT_IBRAHIM,
  CHANTIER_AISSATOU,
  CHANTIER_MAMADOU,
  TRANCHES_AISSATOU,
  TRANCHES_MAMADOU,
  DISBURSEMENTS_AISSATOU,
  NOTIFICATIONS_AISSATOU,
  HISTORIQUE_AISSATOU,
  ALL_REQUIS_DOCS,
} from './demoStore';

// ─── All clients map ──────────────────────────────────────────────────────────

const ALL_CLIENTS = {
  'c-aissatou': CLIENT_AISSATOU,
  'c-mamadou':  CLIENT_MAMADOU,
  'c-fatou':    CLIENT_FATOU,
  'c-ibrahim':  CLIENT_IBRAHIM,
} as const;

// Chantier data per client (only Aïssatou and Mamadou have chantier data)
const ALL_CHANTIERS = {
  'c-aissatou': CHANTIER_AISSATOU,
  'c-mamadou':  CHANTIER_MAMADOU,
  'c-fatou':    null,
  'c-ibrahim':  null,
} as const;

// Tranche data per client
const ALL_TRANCHES = {
  'c-aissatou': TRANCHES_AISSATOU,
  'c-mamadou':  TRANCHES_MAMADOU,
  'c-fatou':    [],
  'c-ibrahim':  [],
} as const;

// Disbursements per client
const ALL_DISBURSEMENTS = {
  'c-aissatou': DISBURSEMENTS_AISSATOU,
  'c-mamadou':  [],
  'c-fatou':    [],
  'c-ibrahim':  [],
} as const;

// Notifications per client
const ALL_NOTIFICATIONS = {
  'c-aissatou': NOTIFICATIONS_AISSATOU,
  'c-mamadou':  [],
  'c-fatou':    [],
  'c-ibrahim':  [],
} as const;

// Historique per client
const ALL_HISTO = {
  'c-aissatou': HISTORIQUE_AISSATOU,
  'c-mamadou':  [],
  'c-fatou':    [],
  'c-ibrahim':  [],
} as const;

type ClientId = keyof typeof ALL_CLIENTS;

function isKnownClientId(id: string): id is ClientId {
  return id in ALL_CLIENTS;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

const ZERO_FINANCE = {
  montantFinance:    0,
  echeanceMensuelle: 0,
  moisPayes:         0,
  montantPaye:       0,
  moisRestants:      0,
  dureeTotal:        0,
};

export function useClientData() {
  const { selectedClientId, allClients } = useClientContext();

  return useMemo(() => {
    if (isKnownClientId(selectedClientId)) {
      const id = selectedClientId;
      const client   = ALL_CLIENTS[id];
      const chantier = ALL_CHANTIERS[id as keyof typeof ALL_CHANTIERS];
      const tranches = ALL_TRANCHES[id as keyof typeof ALL_TRANCHES] as typeof TRANCHES_AISSATOU | typeof TRANCHES_MAMADOU | [];
      const disbursements = ALL_DISBURSEMENTS[id as keyof typeof ALL_DISBURSEMENTS];
      const notifications = ALL_NOTIFICATIONS[id as keyof typeof ALL_NOTIFICATIONS];
      const historique    = ALL_HISTO[id as keyof typeof ALL_HISTO];
      const requisDocs    = ALL_REQUIS_DOCS[id] ?? [];

      // Derived loan finance figures (static demo values for Aïssatou)
      const finance = id === 'c-aissatou'
        ? {
            montantFinance:    25_000_000,
            echeanceMensuelle:    208_400,
            moisPayes:                 14,
            montantPaye:        2_917_600,
            moisRestants:             166,
            dureeTotal:               180,
          }
        : ZERO_FINANCE;

      return {
        ...client,
        chantier,
        tranches,
        disbursements,
        notifications,
        historique,
        requisDocs,
        finance,
      };
    }

    // Nouveau client inscrit — aucune donnée démo, tout part de zéro.
    const summary = allClients.find(c => c.id === selectedClientId);
    const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

    return {
      id: selectedClientId,
      name: summary?.name ?? 'Nouveau client',
      projectNom: summary?.projectNom ?? '—',
      adresse: summary?.adresse ?? '—',
      ref: summary?.ref ?? selectedClientId,
      dateOuverture: today,
      conseiller: 'Non assigné',
      banque: '—',
      statut: summary?.statut ?? 'Dossier en préparation',
      nextEtape: 'Dépôt du dossier',
      progression: summary?.progression ?? 0,
      phone: '—',
      email: '—',
      address: '—',
      employer: '—',
      fonction: '—',
      adhesionDate: today,
      chantier: null,
      tranches: [] as typeof TRANCHES_AISSATOU | typeof TRANCHES_MAMADOU | [],
      disbursements: [] as typeof DISBURSEMENTS_AISSATOU | [],
      notifications: [] as typeof NOTIFICATIONS_AISSATOU | [],
      historique: [] as typeof HISTORIQUE_AISSATOU | [],
      requisDocs: [] as typeof ALL_REQUIS_DOCS[ClientId],
      finance: ZERO_FINANCE,
    };
  }, [selectedClientId, allClients]);
}

export type ClientData = ReturnType<typeof useClientData>;
