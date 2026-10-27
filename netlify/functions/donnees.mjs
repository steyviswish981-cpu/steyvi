import { getStore } from "@netlify/blobs";

const DEFAUT = {
  produits: [
    { id: 1, nom: "T-shirt Steyvi 36", prix: 8000, desc: "Oversize noir, lignes blanches et logo Steyvi.", photo: "", actif: true, stock: 10 },
    { id: 2, nom: "T-shirt Only God Knows", prix: 7000, desc: "Noir, script Only God Knows au dos, flammes rouges.", photo: "", actif: true, stock: 10 },
    { id: 3, nom: "Pull Steyvi", prix: 8000, desc: "Sweat à capuche noir et blanc, coupe oversize.", photo: "", actif: true, stock: 10 },
    { id: 4, nom: "Ensemble Steyvi", prix: 12000, desc: "T-shirt et short noirs assortis, liserés blancs.", photo: "", actif: true, stock: 10 }
  ],
  promos: [],
  partenaires: [],
  commandes: [],
  visites: {}
};

export default async (req) => {
  const store = getStore("steyvi");
  const envoye = req.headers.get("x-mdp");
  const mdpOk = !!envoye && envoye === process.env.STEYVI_MDP;
  const url = new URL(req.url);
  const brut = async () => await store.get("donnees", { type: "json" });
  const lire = async () => (await brut()) || structuredClone(DEFAUT);

  // 1. Commande passée par un client (sans mot de passe)
  if (req.method === "POST") {
    const corps = await req.json().catch(() => null);
    if (!corps || corps.action !== "commande" || !corps.commande) return new Response("Requête invalide", { status: 400 });
    const c = corps.commande;
    if (!c.ref || !c.tel || !Array.isArray(c.lignes) || !c.lignes.length) return new Response("Commande incomplète", { status: 400 });
    const data = await lire();
    data.commandes = data.commandes || [];
    if (!data.commandes.some(x => x.ref === c.ref)) {
      data.commandes.push({ ...c, paiement: "attente", statut: "attente", source: "web", recue: new Date().toISOString() });
      await store.setJSON("donnees", data);
    }
    return Response.json({ ok: true });
  }

  // 2. Suivi d'une commande par le client (référence + téléphone)
  if (req.method === "GET" && url.searchParams.get("ref")) {
    const ref = url.searchParams.get("ref").toUpperCase();
    const tel = (url.searchParams.get("tel") || "").replace(/\D/g, "");
    const data = await lire();
    const c = (data.commandes || []).find(x => x.ref === ref);
    if (!c || (c.tel || "").replace(/\D/g, "").slice(-8) !== tel.slice(-8)) return new Response("Introuvable", { status: 404 });
    return Response.json({ ref: c.ref, date: c.date, client: c.client, adresse: c.adresse, ville: c.ville, lignes: c.lignes, remise: c.remise, code: c.code, total: c.total, tel: c.tel, paiement: c.paiement, statut: c.statut });
  }

  // 3. Sauvegarde envoyée par le propriétaire
  if (req.method === "PUT") {
    if (!mdpOk) return new Response("Non autorisé", { status: 401 });
    const corps = await req.json();
    const actuel = await lire();
    // Les commandes reçues en ligne ne doivent pas disparaître si le propriétaire ne les a pas encore reçues
    const recues = new Set((corps.commandes || []).map(c => c.ref));
    const enPlus = (actuel.commandes || []).filter(c => c.ref && !recues.has(c.ref));
    corps.commandes = [...(corps.commandes || []), ...enPlus];
    corps.version = 1;
    await store.setJSON("donnees", corps);
    return Response.json({ ok: true });
  }

  // 4. Lecture
  if (envoye && !mdpOk) return new Response("Non autorisé", { status: 401 });
  const data = await lire();
  if (mdpOk) return Response.json({ ...data, version: data.version || 0 });

  // Public : produits, codes promo et partenaires en vente (sans stock ni commandes)
  // Tant que le propriétaire n'a pas initialisé la boutique, la boutique garde ses produits d'origine
  if (!data.version) return Response.json({ produits: null, promos: [], partenaires: [] });
  return Response.json({
    produits: data.produits.filter(p => p.actif).map(p => ({ ...p, stock: undefined })),
    promos: (data.promos || []).map(c => ({ code: c.code, pct: c.pct, fin: c.fin, actif: c.actif })),
    partenaires: (data.partenaires || []).filter(x => x.actif)
  });
};
