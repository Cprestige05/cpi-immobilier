// ─────────────────────────────────────────────────────────────────────────────
// Données de DÉMO / TEST — chargées / supprimées à la demande depuis l'Admin.
//
// Toutes les entités portent un id préfixé « demo- » afin de pouvoir être purgées
// intégralement sans jamais toucher aux vrais comptes créés par les utilisateurs.
// Aucun impact serveur : tout vit en localStorage (comme le reste de l'app).
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_PREFIX = 'demo-';
export const isDemoId = (id: string) => id.startsWith(DEMO_PREFIX);

const PRENOMS = ['Awa','Moussa','Fatou','Ibrahima','Aminata','Cheikh','Mariama','Ousmane','Khady','Modou','Aissatou','Babacar','Ndeye','Alioune','Rokhaya','Serigne','Sokhna','Pape','Adama','Bineta','Mamadou','Coumba','Idrissa','Yacine','Abdoulaye','Astou','Lamine','Dieynaba','Malick','Seynabou'];
const NOMS = ['Diop','Ndiaye','Fall','Sarr','Sow','Ba','Gueye','Diallo','Sy','Faye','Cissé','Mbaye','Kane','Thiam','Niang','Sène','Diagne','Camara','Dieng','Toure'];
const COMMUNES = ['Rufisque','Guédiawaye','Pikine','Parcelles Assainies','Yoff','Ngor','Thiès','Mbour','Saint-Louis','Touba'];
const PROJETS = ['Villa R+1','Appartement F4','Terrain viabilisé','Duplex','Maison basse','Villa R+2'];

const today = () => new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
const set = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const makeDocs = (status: string) => [
  { id: 'identite',  label: "Pièce d'identité valide", status, version: status === 'en-attente' ? 0 : 1, date: today() },
  { id: 'revenus',   label: 'Justificatifs de revenus', status, version: status === 'en-attente' ? 0 : 1, date: today() },
  { id: 'bancaires', label: 'Relevés bancaires',        status, version: status === 'en-attente' ? 0 : 1, date: today() },
];

/** Crée 30 dossiers de démo répartis sur tout le pipeline. Renvoie le nombre créé. */
export function seedDemoData(): number {
  const d = today();
  const registry: any[] = (() => { try { return JSON.parse(localStorage.getItem('cpi_clients_registry_v1') || '[]'); } catch { return []; } })();
  const real = registry.filter((c: any) => !isDemoId(c.id));
  const demo: any[] = [];

  const decMap: Record<string, any> = (() => { try { return JSON.parse(localStorage.getItem('cpi_decaissements_v1') || '{}'); } catch { return {}; } })();

  for (let i = 0; i < 30; i++) {
    const id = DEMO_PREFIX + i;
    const pr = PRENOMS[i % PRENOMS.length];
    const nm = NOMS[(i * 7) % NOMS.length];
    const commune = COMMUNES[i % COMMUNES.length];
    const projet = `${PROJETS[i % PROJETS.length]} — ${commune}`;
    const ref = 'CPI-2026-' + String(20001 + i);
    const montant = (10 + (i % 20)) * 1_000_000;

    // Répartition du pipeline : 0-9 pièces à vérifier · 10-19 en analyse · 20-24 à déposer · 25-29 construction
    let statut = 'Demande envoyée', progression = 10, docStatus = 'en-attente', etape: number | null = null;
    if (i < 10)        { statut = 'Pièces à vérifier';  progression = 25; docStatus = 'depose';   etape = 2; }
    else if (i < 20)   { statut = 'En analyse banque';  progression = 45; docStatus = 'accepte';  etape = 3; }
    else if (i < 25)   { statut = 'Demande envoyée';    progression = 10; docStatus = 'en-attente'; etape = null; }
    else               { statut = 'En construction';    progression = 80; docStatus = 'accepte';  etape = 5; }

    demo.push({ id, name: `${pr} ${nm}`, ref, statut, progression, projectNom: projet, adresse: commune, dateInscription: d, email: `${(pr + '.' + nm).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}${i}@demo.sn`, phone: `77 ${100 + i} ${20 + i} ${30 + i}` });

    set(`cpi_demande_v1_${id}`, { submitted: true, submittedAt: d, form: { typeProjet: 'financement', natureProjet: i % 2 ? 'construction' : 'acquisition', montant: String(montant), duree: '15', apport: '0', region: 'Dakar', commune, adresseProjet: `Lot ${i + 1}`, description: `Dossier de démonstration n°${i + 1}` } });
    set(`cpi_docs_v4_${id}`, makeDocs(docStatus));
    if (etape != null) set(`cpi_etape_v4_${id}`, etape);

    // Un contrat à signer pour le tout premier dossier (démo de la signature).
    if (i === 0) {
      set(`cpi_cpidocs_v3_${id}`, [{ id: `cpi-${id}-1`, categorie: 'contrats', nom: 'Contrat de réservation', reference: 'CR-2026-0001', dateCreation: d, datePublication: d, version: '1.0', status: 'a-signer', auteur: 'Agent CPI', visibleClient: true, signatureRequise: true, taille: '240 Ko', format: 'PDF' }]);
    }

    // Décaissements pour les dossiers « en construction ».
    if (i >= 25) {
      decMap[id] = {
        terrainMontant: 15_000_000, terrainDecaisse: true, terrainDate: d,
        foncier: [true, true, true, true, true],
        constructionActive: true, constructionMontant: 30_000_000,
        tranches: [{ validated: true, date: d }, { validated: false }, { validated: false }, { validated: false }],
      };
    }
  }

  set('cpi_clients_registry_v1', [...real, ...demo]);
  set('cpi_decaissements_v1', decMap);
  return demo.length;
}

/** Supprime toutes les données de démo (préfixe demo-). Renvoie le nombre de dossiers retirés. */
export function clearDemoData(): number {
  let removedClients = 0;
  try {
    const registry: any[] = JSON.parse(localStorage.getItem('cpi_clients_registry_v1') || '[]');
    const real = registry.filter((c: any) => !isDemoId(c.id));
    removedClients = registry.length - real.length;
    set('cpi_clients_registry_v1', real);
  } catch {}

  // Clés par client (docs, historiques, étapes, demandes, docs CPI…).
  Object.keys(localStorage).forEach(k => { if (/^cpi_.*demo-\d+/.test(k)) { try { localStorage.removeItem(k); } catch {} } });

  // Décaissements (map unique keyée par clientId).
  try {
    const decMap: Record<string, any> = JSON.parse(localStorage.getItem('cpi_decaissements_v1') || '{}');
    Object.keys(decMap).forEach(id => { if (isDemoId(id)) delete decMap[id]; });
    set('cpi_decaissements_v1', decMap);
  } catch {}

  return removedClients;
}

/** Nombre de dossiers de démo actuellement présents. */
export function countDemoData(): number {
  try {
    const registry: any[] = JSON.parse(localStorage.getItem('cpi_clients_registry_v1') || '[]');
    return registry.filter((c: any) => isDemoId(c.id)).length;
  } catch { return 0; }
}
