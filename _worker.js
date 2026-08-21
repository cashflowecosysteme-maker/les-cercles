// ============================================================
// NyXia — Le Cercle (Admin + Promoteur) — Worker fidèle Studio (chats + voix + images) + D1 Cercles
// ============================================================

const SYSTEM_PROMPTS = {
  // 💜 DIANE — Créatrice · entraide · motivation · cercles
  diane: `Tu es **Diane Boyer** — personnage de formation sur le portail **Le Cercle**.
Tu es la créatrice de l'univers NyXia et l'autrice des livres utilisés en formation conversationnelle.
Tu n'es **jamais** une « IA » ni un « robot » : tu es un **personnage**.

PHILOSOPHIE DU CERCLE (centrale, non négociable)
Ici on ne parle **pas** de MLM, de paliers, de niveaux de vente, ni de vente dure.
On parle d'un **cercle d'entraide** : chacun gagne à aider les autres à réussir.
Le plaisir et le bonheur d'un autre que soi font partie du chemin.

🎯 TA MISSION AVEC {first_name}
- L'aider à **comprendre le fonctionnement des cercles** (lien, équipe, entraide) simplement.
- Lui faire sentir l'**importance de l'entraide** et du bonheur partagé.
- La **motiver** et la **soutenir** quand ça va moins bien ou pas assez vite.
- Une idée à la fois, langage clair, zéro jargon technique inutile.

Tu t'appuies sur tes livres (vectorisation) : Psychologie du Clic, CashFlow Neuro Généré, Lexique Marketing — sans réciter des manuels.

⚠️ TU NE FAIS PAS
- Support technique de navigation (→ NyXia).
- Rédaction de posts / réponses MP détaillées (→ Éric).
- Vente agressive, discours de réseau type MLM.

TON TON : Chaleureux, humain, québécois, patient. Tu tutoies. Tu dis {first_name}.
Emojis : 💜 ✨ 🪞 ✦
⚠️ Ne te réintroduis jamais. Réponds au besoin tout de suite.`,

  // ✦ NYXIA — Assistante centrale · orientation · technique plateforme
  nyxia: `Tu es **NyXia** — personnage central de l'écosystème, sur le portail **Le Cercle**.
Tu n'es **jamais** une « IA » ni un « robot » : tu es un **personnage**.

L'univers est bâti autour de toi. Tu connais **tous les personnages** et ce que chacun fait, avec précision.

PHILOSOPHIE DU CERCLE
Cercle d'entraide — pas MLM, pas paliers, pas vente dure. Chacun gagne à aider les autres à réussir.

🎯 TA MISSION AVEC {first_name}
1. **Technique plateforme** : l'aider à retrouver et comprendre le fonctionnement du Cercle (liens, menu, produits, équipe, réglages) — étape par étape, simple.
2. **Orientation chirurgicale** : si le vrai besoin est ailleurs, tu réfères le bon personnage.
   Exemple : gros blocage de confiance en soi → tu orientes vers **Séléna** après avoir écouté.
   Comprendre l'entraide / les cercles / la motivation → **Diane**.
   Publication, commentaire, message privé → **Éric**.
3. Tu connais l'écosystème des portails ; tu orientes sans noyer.

Livres de base (vectorisation) + fonctionnement technique de la plateforme Cercle.

⚠️ TU NE FAIS PAS
- Cours long sur le sens de l'entraide (→ Diane).
- Textes de vente / posts complets à sa place (→ Éric).

TON TON : Clair, rassurant, québécois, précis sans être froid. Tu tutoies. Tu dis {first_name}.
Emojis : ✦ 💜 🔮
⚠️ Ne te réintroduis jamais.`,

  // 🔥 ÉRIC — Communication · relation humaine · textes à coller
  eric: `Tu es **Éric** — personnage de communication sur le portail **Le Cercle**.
Tu n'es **jamais** une « IA » ni un « robot » : tu es un **personnage**.

Tu portes en toi le livre **La communication à l'ère numérique**.
Tu peux y faire **référence** (donner envie d'aller plus loin / vers CashFlow) **sans** dérouler tout le détail de l'autre produit — respect du produit CashFlow.

PHILOSOPHIE DU CERCLE
Entraide, relation humaine, confiance. **Pas** de vente dure, **pas** de discours MLM / paliers.

🎯 TA MISSION AVEC {first_name}
1. **Publications** (Instagram, Facebook, TikTok) : textes qui provoquent une **relation humaine chaleureuse** et de la **confiance** — pas du matraquage.
2. **Commentaires & messages privés** : {first_name} **colle** le message reçu dans le chat. Tu lui dis **précisément quoi écrire** pour avancer vers son objectif (obtenir un courriel, envoyer un PDF d'explication + lien, recruter dans l'entraide, ou présenter une offre) — toujours dans le respect et la confiance.
3. Les infos « lien d'affiliation + PDF explicatif / recruter ou présenter l'offre » restent un **outil interne** d'entraide, jamais un script de pression.

Quand tu livres un texte prêt à coller :
[PROMPT]
le texte exact
[/PROMPT]

⚠️ TU NE FAIS PAS
- Pression, manipulation, « close » agressif.
- Expliquer longuement les cercles (→ Diane).
- Support technique du menu (→ NyXia).

TON TON : Humain, direct, québécois, chaleureux. Tu tutoies. Tu dis {first_name}.
Emojis : 🔥 💬 ✦
⚠️ Ne te réintroduis jamais.`,

  kael: `Tu es Kael. Sur Le Cercle, oriente vers Diane, NyXia ou Éric selon le besoin.`,
  lena: `Tu es Léna. Sur Le Cercle, oriente vers Diane, NyXia ou Éric selon le besoin.`,
  selena: `Tu es Séléna. Sur Le Cercle, tu peux accueillir les besoins de confiance en soi ; sinon oriente vers Diane, NyXia ou Éric.`,
  alex: `Tu es Alex. Sur Le Cercle, oriente vers Diane, NyXia ou Éric selon le besoin.`,
};



const OPENROUTER_MODEL = 'deepseek/deepseek-v3.2';
const OPENROUTER_FALLBACK_MODEL = 'mistralai/mistral-small-3.2-24b-instruct';
const SESSION_TTL = 60 * 60 * 24 * 7;   // 7 jours
const ADMIN_SESSION_TTL = 60 * 60 * 12; // 12 heures

// Pouvoir partagé par TOUS les personnages (NyXia, Diane, Éric) —
// pour que la Gardienne n'ait jamais besoin de retourner voir NyXia juste pour une image.
const IMAGE_GENERATION_INSTRUCTIONS = `

🎨 GÉNÉRER UNE IMAGE TOI-MÊME

Tu as le pouvoir de faire apparaître une image directement dans la conversation. Si le Membre te demande de lui montrer, dessiner, visualiser ou créer une image (ex: "montre-moi à quoi ça pourrait ressembler", "peux-tu me faire une image pour ma publication", "fais-moi voir un cœur magique"), tu DOIS inclure dans ta réponse le marqueur suivant, une seule fois :

[IMAGE: description précise et visuelle de ce qu'il faut générer, en anglais de préférence pour de meilleurs résultats]

⚠️ RÈGLE ABSOLUE : Ne décris JAMAIS une image en mots poétiques à la place du marqueur. Le marqueur EST la façon de fournir l'image — ce n'est pas une alternative parmi d'autres, c'est la SEULE façon. Si tu écris "imagine un cœur qui brille comme..." sans le marqueur [IMAGE: ...], tu as échoué à ta tâche, peu importe la beauté de ta description. Une description en mots ne remplace jamais le marqueur — les deux peuvent coexister (une courte phrase dans ton ton + le marqueur), mais le marqueur doit toujours être présent.

Exemple correct (n'importe quel personnage, y compris Éric) :
"Voici une idée de visuel ✦ [IMAGE: a glowing golden heart surrounded by silver sparkles, angel wings made of silk, magical purple light, ethereal fantasy art, detailed, high quality]"

Compose une description riche et structurée dans le marqueur plutôt que quelques mots vagues — mentionne le sujet principal, le style (ex: photorealistic, soft lighting, ethereal), l'ambiance et la composition. Une description courte donne souvent un résultat étrange ou incohérent ; une description détaillée donne un bien meilleur résultat.

Le système transforme automatiquement ce marqueur en image réelle affichée dans le chat — tu n'as rien d'autre à faire. Le marqueur doit rester intact (ne le traduis pas, ne le reformule pas, ne l'omets pas). N'utilise ce pouvoir que si la demande du Membre appelle vraiment une image — ne l'improvise pas à chaque message.`;

// Pouvoir partagé par TOUS les personnages — la terminologie officielle de l'écosystème,
// pour ne jamais confondre la cliente avec les gens qu'elle rencontre sur le groupe.
const TERMINOLOGIE_OFFICIELLE = `

📖 TERMINOLOGIE OFFICIELLE (à respecter STRICTEMENT)

- **« le Membre »** désigne UNIQUEMENT la personne qui te parle en ce moment, celle qui a accès au Le Cercle. Toujours et seulement elle. Le Membre peut être une **femme ou un homme** — reste inclusif, ne présume jamais du genre, n'emploie aucun surnom (« Reine », « ma belle », « mon gars »…).
- Les personnes que le Membre rencontre dans les groupes ne sont JAMAIS appelées « Membres » à leur tour. Ce sont des gens, des âmes, des personnes des Cercles.
- Le Membre n'a **jamais** à toucher à sa liste de contacts personnels. Le terrain de jeu public, ce sont les **trois grands groupes Facebook de Diane Boyer, réunissant 88 000 personnes** :
   1. **Les Entrepreneurs du Québec**
   2. **CashFlow™ | Créer des revenus sans s'auto-saboter**
   3. **Cercle Magique « L'âme-agit »**
  C'est là qu'il va tisser des liens vrais et faire rayonner sa mission — jamais en dérangeant ses proches.
- « Son Cercle » ou « sa lignée » désigne l'équipe personnelle du Membre — à ne jamais confondre avec les groupes publics.`;

const PEDAGOGIE_FORMATEUR = `

🎓 TON ÂME DE FORMATEUR (règle fondamentale, avant tout le reste)

Tu n'es PAS un chatbot qui répond à des questions. Tu es un FORMATEUR : tu prends l'étudiant par la main et tu le fais cheminer à travers le savoir, UN SEUL CONCEPT À LA FOIS.

COMMENT TU ENSEIGNES (toujours) :
- Une seule idée à la fois. JAMAIS de mur de texte. Des petites bouchées digestes.
- Après chaque idée, tu VÉRIFIES la compréhension avant d'avancer : « Est-ce que c'est clair avant qu'on continue ? »
- Tu n'avances PAS tant que l'étudiant n'est pas prêt. C'est LUI qui donne le rythme, jamais toi.
- S'il ne comprend pas, tu RÉEXPLIQUES AUTREMENT : un autre angle, un exemple concret, une image, une analogie — jamais la même phrase répétée. Tu n'es JAMAIS lassé de recommencer.
- Tu proposes un chemin : « On peut explorer ceci, puis cela. Par où veux-tu commencer ? »
- Tu célèbres chaque petit pas, chaque déclic. Tu encourages sans jamais juger ni condescendre.
- Aux transitions, tu récapitules brièvement pour ancrer ce qui vient d'être compris.

MODE TDAH (adopte-le par défaut — c'est le cœur de ta mission) :
Beaucoup de tes étudiants ont un cerveau TDAH : ils décrochent devant un pavé, se perdent dans un cours linéaire, et n'osent pas redemander. Pour eux, tu es un tuteur privé infiniment patient, disponible à toute heure, sans aucun jugement. Concrètement : phrases courtes, UNE question à la fois, tu découpes le complexe en tout petits morceaux faciles à réussir, tu relances en douceur, et tu rends chaque étape gagnable.

⚠️ Tu t'ancres FIDÈLEMENT dans les livres et documents de ta base de connaissances (fournis dans ton contexte). Tu n'inventes rien : si tu n'as pas l'information, tu le dis honnêtement et tu proposes d'explorer un concept que tu maîtrises.`;

const PROMPT_MARKER_INSTRUCTIONS = `

📋 TEXTE À COPIER (publications, réponses MP, commentaires)

Quand tu livres un **texte prêt à coller** (publication, réponse à un commentaire, message privé, script), tu DOIS l'entourer avec ce marqueur exact :

[PROMPT]
{le texte complet, prêt à copier-coller}
[/PROMPT]

⚠️ RÈGLES ABSOLUES :
- À L'INTÉRIEUR du marqueur : SEULEMENT le texte utilisable — rien d'autre.
- EN DEHORS du marqueur : ta voix (intro, conseil, question).
- Le système affiche un bouton **Copier** — le marqueur doit rester intact.
- N'utilise ce marqueur QUE pour un texte destiné à être collé ailleurs — pas pour une simple explication.

Si tu proposes plusieurs variantes, mets chaque texte dans son propre bloc [PROMPT]...[/PROMPT].`;

// ───────────── UTILITAIRES ─────────────

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function randomSalt() {
  return crypto.randomUUID();
}

function randomToken() {
  return crypto.randomUUID() + crypto.randomUUID();
}

async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  return [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password, salt, hash) {
  const computed = await hashPassword(password, salt);
  return computed === hash;
}

// ───────────── ROUTAGE PRINCIPAL ─────────────


// ───────────── MARKETPLACE PRODUITS (D1) ─────────────
async function handleListProducts(request, env) {
  if (env.DB) await ensureMarketplaceBillingColumns(env);
  await ensureMarketplacePromoColumns(env);
  if (!env.DB) return json({ products: [] });
  try {
    await ensureSchema(env);
    const { results } = await env.DB.prepare(
      `SELECT id, title, description_short, price, price_monthly, billing_type, status, image_url, promo_code, commission_n1, commission_n2, commission_n3, seller_id, created_at
       FROM marketplace_products ORDER BY created_at DESC LIMIT 200`
    ).all();
    return json({ products: results || [] });
  } catch (e) {
    console.error('list products', e);
    return json({ products: [], error: String(e.message || e) });
  }
}



async function sessionFromRequest(request, env, body) {
  const token = (body && body.token) || request.headers.get('X-Cercle-Token') || request.headers.get('X-Univers-Token') || '';
  if (!token || !env.CASHFLOW_KV) return null;
  const raw = await env.CASHFLOW_KV.get('session:' + token);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (_) { return null; }
}

function isSuperAdminProduct(row) {
  if (!row) return false;
  const s = row.seller_id;
  return s == null || s === '' || s === 'superadmin' || s === 'SUPERADMIN';
}


async function ensureMarketplacePromoColumns(env) {
  if (!env.DB) return;
  try { await env.DB.prepare(`ALTER TABLE marketplace_products ADD COLUMN promo_guide TEXT`).run(); } catch (_) {}
  try { await env.DB.prepare(`ALTER TABLE marketplace_products ADD COLUMN join_url TEXT`).run(); } catch (_) {}
  try { await env.DB.prepare(`ALTER TABLE marketplace_products ADD COLUMN join_type TEXT DEFAULT 'free'`).run(); } catch (_) {}
}

async function ensureMarketplaceBillingColumns(env) {
  if (!env.DB) return;
  try { await env.DB.prepare(`ALTER TABLE marketplace_products ADD COLUMN price_monthly REAL DEFAULT 0`).run(); } catch (_) {}
  try { await env.DB.prepare(`ALTER TABLE marketplace_products ADD COLUMN billing_type TEXT DEFAULT 'one_time'`).run(); } catch (_) {}
}


async function handleUpdateProduct(request, env) {
  if (!env.DB) return json({ error: 'DB absente' }, 500);
  if (typeof ensureMarketplaceBillingColumns === 'function') await ensureMarketplaceBillingColumns(env);
  await ensureMarketplacePromoColumns(env);
  const body = await request.json().catch(() => ({}));
  const id = (body.id || '').trim();
  if (!id) return json({ error: 'Id requis.' }, 400);
  try {
    const row = await env.DB.prepare('SELECT id, seller_id FROM marketplace_products WHERE id = ?').bind(id).first();
    if (!row) return json({ error: 'Produit introuvable.' }, 404);
    if (isSuperAdminProduct(row)) {
      return json({ error: 'Ce produit appartient au Super Admin. Modification réservée au Super Admin Univers.' }, 403);
    }
    const status = body.status != null ? String(body.status) : null;
    await env.DB.prepare(
      `UPDATE marketplace_products SET
        title = COALESCE(?, title),
        description_short = COALESCE(?, description_short),
        price = COALESCE(?, price),
        price_monthly = COALESCE(?, price_monthly),
        billing_type = COALESCE(?, billing_type),
        affiliate_link = COALESCE(?, affiliate_link),
        image_url = COALESCE(?, image_url),
        promo_code = COALESCE(?, promo_code),
        status = COALESCE(?, status),
        updated_at = datetime('now')
       WHERE id = ?`
    ).bind(
      body.title || null,
      body.description || body.description_short || null,
      body.price != null ? Number(body.price) : null,
      body.price_monthly != null ? Number(body.price_monthly) : null,
      body.billing_type || null,
      body.affiliateLink || body.affiliate_link || null,
      body.imageUrl || body.image_url || null,
      body.promoCode || body.promo_code || null,
      status,
      id
    ).run();
    return json({ success: true, id, status });
  } catch (e) {
    return json({ error: String(e.message || e) }, 500);
  }
}


async function handleDeleteProduct(request, env) {
  if (!env.DB) return json({ error: 'DB absente' }, 500);
  const body = await request.json().catch(() => ({}));
  const id = (body.id || '').trim();
  if (!id) return json({ error: 'Id requis.' }, 400);
  try {
    const row = await env.DB.prepare('SELECT id, seller_id FROM marketplace_products WHERE id = ?').bind(id).first();
    if (!row) return json({ error: 'Produit introuvable.' }, 404);
    if (isSuperAdminProduct(row)) {
      return json({ error: 'Ce produit appartient au Super Admin. Suppression réservée au Super Admin Univers.' }, 403);
    }
    await env.DB.prepare('DELETE FROM marketplace_products WHERE id = ?').bind(id).run();
    return json({ success: true });
  } catch (e) {
    return json({ error: String(e.message || e) }, 500);
  }
}


async function handleCreateProduct(request, env) {
  if (env.DB) await ensureMarketplaceBillingColumns(env);
  await ensureMarketplacePromoColumns(env);
  if (!env.DB) return json({ error: 'Base non configurée.' }, 500);
  const body = await request.json().catch(() => ({}));
  const token = body.token || request.headers.get('X-Cercle-Token');
  let sellerId = null;
  if (token) {
    const raw = await env.CASHFLOW_KV.get('session:' + token);
    if (raw) {
      try { sellerId = JSON.parse(raw).userId || null; } catch (_) {}
    }
  }
  const title = (body.title || '').trim();
  if (!title) return json({ error: 'Titre requis.' }, 400);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const status = body.status === 'active' || body.status === 'published' ? 'active' : 'draft';
  await ensureSchema(env);
  await env.DB.prepare(
    `INSERT INTO marketplace_products
     (id, seller_id, title, description_short, image_url, price, price_monthly, billing_type, commission_n1, commission_n2, commission_n3, affiliate_link, promo_code, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    sellerId,
    title,
    (body.description || body.description_short || '').trim(),
    (body.imageUrl || body.image_url || '').trim() || null,
    Number(body.price || 0),
    Number(body.price_monthly || body.priceMonthly || 0),
    (['one_time','subscription','both'].includes(String(body.billing_type || body.billingType || ''))
      ? String(body.billing_type || body.billingType)
      : 'one_time'),
    body.commission_n1 != null ? Number(body.commission_n1) : null,
    body.commission_n2 != null ? Number(body.commission_n2) : null,
    body.commission_n3 != null ? Number(body.commission_n3) : null,
    (body.affiliateLink || body.affiliate_link || '').trim() || null,
    (body.promoCode || body.promo_code || '').trim() || null,
    status,
    now,
    now
  ).run();
  
  await ensureMarketplacePromoColumns(env);
  try {
    await env.DB.prepare(
      `UPDATE marketplace_products SET promo_guide = ?, join_url = ?, join_type = ? WHERE id = ?`
    ).bind(
      (body.promo_guide || body.promoGuide || '').trim() || null,
      (body.join_url || body.joinUrl || '').trim() || null,
      (body.join_type || body.joinType || 'free'),
      id
    ).run();
  } catch (e) { console.error('promo fields', e); }
return json({ success: true, id, status });
}



async function handleGetProduct(request, env, url) {
  if (!env.DB) return json({ error: 'DB absente' }, 500);
  await ensureMarketplaceBillingColumns(env);
  await ensureMarketplacePromoColumns(env);
  const id = (url.searchParams.get('id') || '').trim();
  if (!id) return json({ error: 'id requis' }, 400);
  try {
    let row;
    try {
      row = await env.DB.prepare(
        `SELECT id, title, description_short, description_long, price, price_monthly, billing_type, image_url, promo_code, affiliate_link, promo_guide, join_url, join_type, status, created_at
         FROM marketplace_products WHERE id = ? LIMIT 1`
      ).bind(id).first();
    } catch (e) {
      row = await env.DB.prepare(
        `SELECT id, title, description_short, description_long, price, image_url, promo_code, affiliate_link, promo_guide, join_url, join_type, status, created_at
         FROM marketplace_products WHERE id = ? LIMIT 1`
      ).bind(id).first();
    }
    if (!row) return json({ error: 'Produit introuvable' }, 404);
    if (row.status !== 'active' && row.status !== 'published') {
      return json({ error: 'Produit non publié' }, 404);
    }
    return json({ product: row });
  } catch (e) {
    return json({ error: String(e.message || e) }, 500);
  }
}

async function handlePublicRepertoire(request, env) {
  if (!env.DB) return json({ products: [], error: 'DB absente' });
  try {
    await ensureSchema(env);
    await ensureMarketplaceBillingColumns(env);
  await ensureMarketplacePromoColumns(env);
    let results = [];
    try {
      const r = await env.DB.prepare(
        `SELECT id, title, description_short, price, price_monthly, billing_type, image_url, status, promo_code, affiliate_link, promo_guide, join_url, join_type, created_at
         FROM marketplace_products
         WHERE status = 'active' OR status = 'published'
         ORDER BY created_at DESC LIMIT 200`
      ).all();
      results = r.results || [];
    } catch (e1) {
      const r = await env.DB.prepare(
        `SELECT id, title, description_short, price, image_url, status, promo_code, affiliate_link, created_at
         FROM marketplace_products
         WHERE status = 'active' OR status = 'published'
         ORDER BY created_at DESC LIMIT 200`
      ).all();
      results = r.results || [];
    }
    return json({ products: results });
  } catch (e) {
    console.error('repertoire', e);
    return json({ products: [], error: String(e.message || e) });
  }
}

// ───────────── HELPDESK PUBLIC (NyXia · OpenRouter) ─────────────
// Chat d'accueil PUBLIC du Répertoire — aucune session requise.
// Persona NyXia, orienté aide + conversion douce vers « Demander mon espace ».
// Réutilise OPENROUTER_MODEL / OPENROUTER_FALLBACK_MODEL / retrieveBrain / json déjà définis.
const HELPDESK_SYSTEM = `Tu es **NyXia**, l'accueil vivant du **Répertoire du Cercle NyXia**.
Tu parles à une personne qui visite le Répertoire : elle a peut-être une entreprise en ligne et cherche soit un produit digital, soit à rendre sa propre offre visible et à créer son équipe.

TON RÔLE : accueillir, rassurer, répondre simplement aux questions sur le Répertoire et le Cercle, et guider avec chaleur vers l'action.

L'ESPRIT DU CERCLE (jamais de MLM, de paliers, de vente dure) : partager, recommander, prospérer ensemble. Chacun gagne à aider les autres à réussir.

CE QUE TU PEUX EXPLIQUER SIMPLEMENT :
- Le Répertoire réunit des produits digitaux partagés par la communauté.
- Toute personne (peu importe son genre) qui a une entreprise en ligne peut y rendre son offre visible et créer son équipe.
- Pour obtenir son espace, on écrit à l'équipe via Messenger : https://m.me/LeMiroirdeNyXia

💳 TARIFS — LE RÉPERTOIRE EST UN SERVICE PAYANT. Ne dis JAMAIS qu'il est « gratuit », « sans frais » ou « sans investissement ». Deux chemins selon la personne :
- Si elle veut PARTAGER les produits du Cercle et bâtir son équipe : un léger abonnement de **9 $ par mois**, qui couvre sa formation et le support technique pour l'accompagner vers la réussite.
- Si elle a une entreprise / un produit digital et veut le RENDRE VISIBLE dans le Répertoire : il y a un abonnement mensuel, mais le montant se fixe **ensemble lors d'une courte rencontre**, après une petite évaluation de son produit. Dans ce cas, ne donne AUCUN prix précis — invite-la chaleureusement à en parler avec l'équipe via Messenger pour organiser cette rencontre.
- N'invente jamais d'autres chiffres, de réductions ni de promesses. Pour tout le reste, oriente vers Messenger.

RÈGLES :
- Tutoiement, chaleureux, français de France. Appelle la personne par son prénom si elle te le donne.
- Réponses COURTES (2 à 5 phrases), une idée à la fois, zéro jargon technique.
- Tu n'es jamais « une IA » ni « un robot » : tu es NyXia, une présence.
- Dès que la personne montre de l'intérêt pour avoir son espace / vendre / rejoindre, invite-la naturellement à écrire via Messenger (le lien ci-dessus). Jamais insistante.
- N'invente jamais de prix, de chiffres ni de promesses. Si tu ne sais pas, propose d'en parler avec l'équipe via Messenger.
- Vocabulaire : entraide, partage, cercle, équipe, marraine ou parrain — jamais vente/commission/MLM/recruter/filleul.`;

async function handleHelpdesk(request, env) {
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Requête invalide.' }, 400); }

  const message = String(body.message || '').slice(0, 2000);
  if (!message.trim()) return json({ error: 'Message vide.' }, 400);

  // Historique limité (coût maîtrisé pour un endpoint public)
  const history = Array.isArray(body.history)
    ? body.history
        .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .slice(-10)
    : [];

  let systemPrompt = HELPDESK_SYSTEM;

  // Cohérence avec l'univers : on pioche un peu dans le cerveau NyXia si disponible.
  try {
    const brain = await retrieveBrain(env, 'nyxia', message, 4);
    if (brain) systemPrompt += `\n\n🔮 MÉMOIRE DE L'UNIVERS (pour rester cohérente, sans réciter ni citer de numéros) :\n\n${brain}`;
  } catch (e) { /* le chat continue même si le cerveau est indisponible */ }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: message }
  ];

  const apiKey = env.OPENROUTER_API_KEY || env.AI_API_KEY;
  if (!apiKey) return json({ content: 'Je reviens dans un instant 💜 (petite configuration en cours).' });

  async function callModel(model) {
    return await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://repertoire.nyxia.top',
        'X-Title': 'NyXia — Répertoire (Helpdesk)'
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1200,
        reasoning: { enabled: false }
      })
    });
  }

  try {
    let resp = await callModel(OPENROUTER_MODEL);
    if (!resp.ok) resp = await callModel(OPENROUTER_FALLBACK_MODEL);
    if (!resp.ok) return json({ content: 'Petite interruption dans le miroir… réessaie dans un instant 💜' });
    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content || 'Je t\'écoute 💜';
    return json({ content });
  } catch (e) {
    return json({ content: 'Petite interruption dans le miroir… réessaie dans un instant 💜' });
  }
}


async function generateAffiliateCode(env) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let attempt = 0; attempt < 12; attempt++) {
    let code = '';
    const buf = crypto.getRandomValues(new Uint8Array(8));
    for (let i = 0; i < 8; i++) code += chars[buf[i] % chars.length];
    const exists = await env.DB.prepare('SELECT id FROM users WHERE affiliate_code = ?').bind(code).first();
    if (!exists) return code;
  }
  return crypto.randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase();
}

// Inscription public — promo / cercle (lien de parrainage)
async function handleSignup(request, env) {
  if (!env.DB) return json({ error: 'Base non configurée.' }, 500);
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const fullName = String(body.fullName || body.full_name || '').trim();
  const referralCode = String(body.referralCode || body.referral_code || body.ref || '').trim().toUpperCase();

  if (!email || !password || !fullName) {
    return json({ error: 'Nom, courriel et mot de passe sont requis.' }, 400);
  }
  if (password.length < 6) {
    return json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' }, 400);
  }

  await ensureSchema(env);

  // Même email autorisé sur d'autres portails ; ici on évite le doublon sur CE cercle
  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ? AND role = ?').bind(email, 'affiliate').first();
  if (existing) {
    return json({ error: 'Ce courriel a déjà un espace promo. Connecte-toi plutôt.' }, 409);
  }

  let parentId = null;
  if (referralCode) {
    const parent = await env.DB.prepare(
      `SELECT id FROM users WHERE affiliate_code = ?`
    ).bind(referralCode).first();
    if (parent) parentId = parent.id;
  }

  const id = crypto.randomUUID();
  const affiliateCode = await generateAffiliateCode(env);
  const passwordHash = await hashPasswordAffil(password);
  const now = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO users (id, email, password_hash, full_name, role, affiliate_code, parent_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'affiliate', ?, ?, ?, ?)`
  ).bind(id, email, passwordHash, fullName, affiliateCode, parentId, now, now).run();

  // Ligne affiliates pour la chaîne 3 niveaux (si table présente)
  try {
    let parentAffId = null;
    let grandparentAffId = null;
    if (parentId) {
      const pAff = await env.DB.prepare('SELECT id, parent_affiliate_id FROM affiliates WHERE user_id = ?').bind(parentId).first();
      if (pAff) {
        parentAffId = pAff.id;
        grandparentAffId = pAff.parent_affiliate_id || null;
      }
    }
    const affId = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO affiliates (id, user_id, parent_affiliate_id, grandparent_affiliate_id, status, created_at)
       VALUES (?, ?, ?, ?, 'active', ?)`
    ).bind(affId, id, parentAffId, grandparentAffId, now).run();
  } catch (e) {
    console.error('affiliates insert', e);
  }

  const token = randomToken();
  if (env.CASHFLOW_KV) {
    await env.CASHFLOW_KV.put('session:' + token, JSON.stringify({
      userId: id, email, firstname: fullName.split(' ')[0], role: 'affiliate', code: affiliateCode
    }), { expirationTtl: SESSION_TTL });
  }

  return json({
    success: true,
    token,
    firstname: fullName.split(' ')[0],
    code: affiliateCode,
    role: 'affiliate'
  });
}



// ───────────── WEBHOOK SYSTEME.IO ─────────────
// Configure dans Systeme.io : URL = https://TON-DOMAINE/api/webhooks/systeme
// Header optionnel : X-Webhook-Secret = valeur de SYSTEME_WEBHOOK_SECRET (Cloudflare var)
//
// À l'achat "promoteurs" (9 $/mois) : crée / met à jour le membre affiliate + code.
// Upsell Éric 30j (49 $) : à brancher quand la page produit Éric existe (KV TTL 2592000).

async function handleSystemeWebhook(request, env) {
  const secret = env.SYSTEME_WEBHOOK_SECRET || '';
  if (secret) {
    const hdr = request.headers.get('X-Webhook-Secret') || request.headers.get('X-Systeme-Secret') || '';
    if (hdr !== secret) return json({ error: 'Secret invalide.' }, 401);
  }

  const body = await request.json().catch(() => ({}));
  // Systeme.io : le courriel est souvent dans data.customer.email
  const data = body.data || body.payload || body;
  const customer = (data && data.customer) || body.customer || (data && data.contact) || body.contact || {};
  const email = String(
    (customer && customer.email) ||
    body.email ||
    (body.contact && body.contact.email) ||
    body.customer_email ||
    (data && data.email) ||
    ''
  ).trim().toLowerCase();
  const fullName = String(
    (customer && (customer.full_name || customer.name)) ||
    [customer && (customer.first_name || customer.firstname), customer && (customer.last_name || customer.lastname)].filter(Boolean).join(' ') ||
    body.full_name || body.fullName || body.first_name ||
    (body.contact && (body.contact.name || body.contact.first_name)) ||
    (data && data.first_name) ||
    'Membre'
  ).trim();
  const referralCode = String(
    body.ref || (data && data.ref) || body.referral_code || (data && data.referral_code) ||
    body.affiliate_code || body.parrain || (customer && customer.ref) || ''
  ).trim().toUpperCase();
  const product = String(
    body.product || (data && data.product) || body.product_name || (data && data.product_name) ||
    body.offer || (data && data.offer) || body.tag || (data && data.tag) ||
    (data && data.price_item && data.price_item.name) || ''
  ).toLowerCase();
  const event = String(body.event || (data && data.event) || body.type || body.action || 'purchase').toLowerCase();

  if (!email) return json({ error: 'email manquant' }, 400);
  if (!env.DB) return json({ error: 'DB absente' }, 500);

  await ensureSchema(env);

  // Upsell Éric 30 jours — réserve (page produit pas encore en ligne)
  const isEric30 = /eric|éric|30\s*j|mentor/.test(product) && /49|upsell|order.?bump/.test(product + event + JSON.stringify(body).toLowerCase());
  if (isEric30 || body.grant_eric_30 === true) {
    let uid = null;
    if (env.DB) {
      try {
        const user = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
        if (user) uid = user.id;
      } catch (_) {}
    }
    await grantEricAccess(env, uid, email);
    return json({ success: true, granted: 'eric_30', email, userId: uid });
  }

  // Achat / abo promoteur principal → compte affiliate
  let user = await env.DB.prepare('SELECT id, affiliate_code, role FROM users WHERE email = ?').bind(email).first();
  let userId;
  let affiliateCode;

  if (user) {
    userId = user.id;
    affiliateCode = user.affiliate_code;
  } else {
    let parentId = null;
    if (referralCode) {
      const parent = await env.DB.prepare('SELECT id FROM users WHERE affiliate_code = ?').bind(referralCode).first();
      if (parent) parentId = parent.id;
    }
    userId = crypto.randomUUID();
    affiliateCode = await generateAffiliateCode(env);
    const now = new Date().toISOString();
    // Mot de passe temporaire : la personne se connectera via magic link / reset plus tard, ou Systeme envoie accès
    const tempPass = await hashPasswordAffil(crypto.randomUUID().slice(0, 12));
    await env.DB.prepare(
      `INSERT INTO users (id, email, password_hash, full_name, role, affiliate_code, parent_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'affiliate', ?, ?, ?, ?)`
    ).bind(userId, email, tempPass, fullName, affiliateCode, parentId, now, now).run();
    try {
      let parentAffId = null, grandparentAffId = null;
      if (parentId) {
        const pAff = await env.DB.prepare('SELECT id, parent_affiliate_id FROM affiliates WHERE user_id = ?').bind(parentId).first();
        if (pAff) { parentAffId = pAff.id; grandparentAffId = pAff.parent_affiliate_id || null; }
      }
      await env.DB.prepare(
        `INSERT INTO affiliates (id, user_id, parent_affiliate_id, grandparent_affiliate_id, status, created_at)
         VALUES (?, ?, ?, ?, 'active', ?)`
      ).bind(crypto.randomUUID(), userId, parentAffId, grandparentAffId, now).run();
    } catch (e) { console.error('aff', e); }
  }

  // Marqueur d'accès promo actif (abo)
  if (env.CASHFLOW_KV) {
    await env.CASHFLOW_KV.put('promo_access:' + userId, JSON.stringify({
      email, active: true, since: new Date().toISOString(), source: 'systeme', event
    }));
  }

  return json({ success: true, userId, email, code: affiliateCode, role: 'affiliate' });
}


export default {
  async fetch(request, env) {
    
    try { if (env.DB) await ensureSchema(env); } catch (e) { console.error("schema", e); }
const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/' || path === '') {
      return env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
    }
    // Lien de création d'équipe / parrainage → inscription
    if (path.startsWith('/r/')) {
      const code = path.slice(3).split('/')[0];
      return Response.redirect(url.origin + '/inscription.html?ref=' + encodeURIComponent(code), 302);
    }

    try {
      if (path === '/api/signup' && request.method === 'POST') return await handleSignup(request, env);
      if (path === '/api/login' && request.method === 'POST') return await handleLogin(request, env);
      if (path === '/api/check-auth' && request.method === 'POST') return await handleCheckAuth(request, env);
      if (path === '/api/logout' && request.method === 'POST') return await handleLogout(request, env);
      if ((path === '/api/repertoire' || path === '/api/marketplace/public') && request.method === 'GET') return await handlePublicRepertoire(request, env);
      if (path === '/api/product' && request.method === 'GET') return await handleGetProduct(request, env, url);
      if (path === '/api/helpdesk' && request.method === 'POST') return await handleHelpdesk(request, env);
      if (path === '/api/products' && request.method === 'GET') return await handleListProducts(request, env);
      if (path === '/api/products' && request.method === 'POST') return await handleCreateProduct(request, env);
      if (path === '/api/products/update' && request.method === 'POST') return await handleUpdateProduct(request, env);
      if (path === '/api/products/delete' && request.method === 'POST') return await handleDeleteProduct(request, env);
      if (path === '/api/eric/access' && request.method === 'POST') {
        const body = await request.json().catch(() => ({}));
        const token = body.token || '';
        const session = await getSessionOrNull(token, env);
        if (!session) return json({ ok: false, error: 'Session expirée.' }, 401);
        const ok = await hasEricAccess(env, session);
        return json({ ok, expired: !ok, renew_url: 'https://www.publication-web.com/nyxia/promoteurs' });
      }
      if (path === '/api/chat' && request.method === 'POST') return await handleChat(request, env);
      if (path === '/api/studio-chat' && request.method === 'POST') return await handleStudioChat(request, env);

      // ── Ingestion des livres Markdown dans Vectorize (Sécurisé Admin) ──
      if (path === '/api/ingest-book' && request.method === 'POST') return await handleIngestBook(request, env);
      if (path === '/api/admin/clear-brain' && request.method === 'POST') return await handleClearBrain(request, env);
      if (path === '/api/admin/list-brain' && request.method === 'POST') return await handleListBrain(request, env);
      if (path === '/api/admin/setup-vectorize' && request.method === 'POST') return await handleSetupVectorize(request, env);

      if (path === '/api/admin/login' && request.method === 'POST') return await handleAdminLogin(request, env);
      if (path === '/api/admin/clients' && request.method === 'GET') return await handleAdminListClients(request, env);
      if (path === '/api/admin/clients' && request.method === 'POST') return await handleAdminCreateClient(request, env);
      if (path === '/api/admin/clients/update' && request.method === 'POST') return await handleAdminUpdateClient(request, env);
      if (path === '/api/admin/clients/delete' && request.method === 'POST') return await handleAdminDeleteClient(request, env);
      if (path === '/api/admin/change-password' && request.method === 'POST') return await handleAdminChangePassword(request, env);

      // ── Messagerie interne ──
      if (path === '/api/gardiennes/list' && request.method === 'POST') return await handleListGardiennes(request, env);
      if (path === '/api/messages' && request.method === 'POST') return await handleListMessages(request, env);
      if (path === '/api/messages/send' && request.method === 'POST') return await handleSendMessage(request, env);
      if (path === '/api/messages/read' && request.method === 'POST') return await handleMarkMessageRead(request, env);
      if (path === '/api/messages/delete' && request.method === 'POST') return await handleDeleteMessage(request, env);
      if (path === '/api/admin/messages/send' && request.method === 'POST') return await handleAdminSendMessage(request, env);
      if (path === '/api/admin/messagerie-contacts' && request.method === 'GET') return await handleAdminListMessagerieContacts(request, env);
      if (path === '/api/admin/messagerie-contacts' && request.method === 'POST') return await handleAdminSaveMessagerieContacts(request, env);

      // ── Répertoire des Médias Magiques ──
      if (path === '/api/media/images' && request.method === 'POST') return await handleMediaImages(request, env);
      if (path === '/api/media/sounds' && request.method === 'POST') return await handleMediaSounds(request, env);
      if (path === '/api/media/file' && request.method === 'GET') return await handleMediaFile(request, env, url);

      // ── Voix HeyGen (NyXia) / OpenAI (les autres) ──
      if (path === '/api/tts/nyxia' && request.method === 'POST') return await handleTTSNyxia(request, env);
      if (path === '/api/tts/cached-audio' && request.method === 'GET') return await handleTTSCachedAudio(request, env, url);
    } catch (e) {
      return json({ error: 'Erreur serveur inattendue : ' + e.message }, 500);
    }

    return json({ error: 'Route introuvable.' }, 404);
  }
};

// ───────────── AUTH CLIENTE (Gardiennes) ─────────────


async function hashPasswordAffil(password) {
  const salt = crypto.randomUUID().replace(/-/g, '');
  const data = new TextEncoder().encode(salt + password);
  const buf = await crypto.subtle.digest('SHA-256', data);
  const hashHex = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  return `$sha256$${salt}$${hashHex}`;
}
async function verifyPasswordAffil(password, stored) {
  if (!stored || !stored.startsWith('$sha256$')) return false;
  const parts = stored.split('$');
  if (parts.length < 4) return false;
  const salt = parts[2];
  const expected = parts[3];
  const data = new TextEncoder().encode(salt + password);
  const buf = await crypto.subtle.digest('SHA-256', data);
  const hashHex = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex === expected;
}

async function ensureSchema(env) {
  if (!env.DB) return;
  // Crée les tables si elles n'existent pas (base neuve isolée)
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      role TEXT NOT NULL DEFAULT 'affiliate',
      affiliate_code TEXT UNIQUE,
      parent_id TEXT,
      paypal_email TEXT,
      webhook_secret TEXT,
      created_at TEXT,
      updated_at TEXT
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS programs (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT,
      commission_l1 REAL DEFAULT 25,
      commission_l2 REAL DEFAULT 10,
      commission_l3 REAL DEFAULT 5,
      owner_id TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS marketplace_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      slug TEXT,
      icon TEXT,
      sort_order INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at TEXT
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS marketplace_products (
      id TEXT PRIMARY KEY,
      seller_id TEXT,
      category_id INTEGER,
      title TEXT NOT NULL,
      description_short TEXT,
      description_long TEXT,
      image_url TEXT,
      price REAL DEFAULT 0,
      price_monthly REAL DEFAULT 0,
      billing_type TEXT DEFAULT 'one_time',
      commission_n1 REAL,
      commission_n2 REAL,
      commission_n3 REAL,
      affiliate_link TEXT,
      promo_code TEXT,
      status TEXT DEFAULT 'draft',
      created_at TEXT,
      updated_at TEXT
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS affiliates (
      id TEXT PRIMARY KEY,
      program_id TEXT,
      user_id TEXT,
      affiliate_link TEXT,
      parent_affiliate_id TEXT,
      grandparent_affiliate_id TEXT,
      status TEXT DEFAULT 'active',
      total_earnings REAL DEFAULT 0,
      total_referrals INTEGER DEFAULT 0,
      created_at TEXT
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS portals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      created_at TEXT
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS portal_clients (
      id TEXT PRIMARY KEY,
      email TEXT,
      full_name TEXT,
      password_hash TEXT,
      portal_ids TEXT,
      created_at TEXT
    )`)
  ]);
}

async function handleLogin(request, env) {
  const body = await request.json();
  const email = (body.email || '').toLowerCase().trim();
  const password = body.password || '';
  const firstname = (body.firstname || body.firstName || '').trim();
  if (!email || !password) return json({ error: 'Email et mot de passe requis.' }, 400);

  // 1) Compte Cercles (D1) — Admin / Promoteur
  if (env.DB) {
    try {
      await ensureSchema(env);
      const candidates = await env.DB.prepare(
        `SELECT id, email, password_hash, full_name, role, affiliate_code, paypal_email
         FROM users WHERE email = ? AND role IN ('admin', 'affiliate')
         ORDER BY CASE role WHEN 'admin' THEN 0 ELSE 1 END, created_at ASC`
      ).bind(email).all();
      const list = candidates.results || [];
      for (const user of list) {
        if (await verifyPasswordAffil(password, user.password_hash)) {
          const token = randomToken();
          const session = {
            email: user.email,
            firstname: user.full_name || firstname || '',
            role: user.role,
            code: user.affiliate_code || '',
            paypal: user.paypal_email || '',
            userId: user.id
          };
          // session: → compatible chats Studio (voix, images, PDF, copier)
          await env.CASHFLOW_KV.put(`session:${token}`, JSON.stringify(session), { expirationTtl: SESSION_TTL });
          return json({ success: true, token, firstname: session.firstname, role: session.role, code: session.code });
        }
      }
    } catch (e) {
      console.error('login D1', e);
    }
  }

  // 2) Fallback clients KV Studio (si existants)
  const raw = await env.CASHFLOW_KV.get(`client:${email}`);
  if (raw) {
    const client = JSON.parse(raw);
    const valid = await verifyPassword(password, client.salt, client.passwordHash);
    if (valid) {
      const token = randomToken();
      await env.CASHFLOW_KV.put(
        `session:${token}`,
        JSON.stringify({ email: client.email, firstname: client.firstName || client.name || '' }),
        { expirationTtl: SESSION_TTL }
      );
      return json({ success: true, token, firstname: client.firstName || client.name || '' });
    }
  }

  return json({ error: 'Courriel ou mot de passe incorrect.' }, 401);
}

async function handleCheckAuth(request, env) {
  const body = await request.json().catch(() => ({}));
  const token = body.token || null;
  if (!token) return json({ valid: false });
  const raw = await env.CASHFLOW_KV.get(`session:${token}`);
  if (!raw) return json({ valid: false });
  const session = JSON.parse(raw);
  return json({
    valid: true,
    email: session.email,
    firstname: session.firstname,
    role: session.role || '',
    code: session.code || '',
    paypal: session.paypal || ''
  });
}

async function handleLogout(request, env) {
  const body = await request.json().catch(() => ({}));
  const token = body.token;
  if (token) await env.CASHFLOW_KV.delete(`session:${token}`);
  return json({ success: true });
}


// ───────────── CHAT (NyXia + Alphas) ─────────────


// ───────────── ACCÈS ÉRIC 30 JOURS (KV TTL) ─────────────
// Clé : eric_access:{userId}  OU  eric_access:email:{email}
// TTL KV = 2 592 000 s (30 j) → la clé disparaît seule ; on REFUSE le chat si absente.

async function grantEricAccess(env, userId, email) {
  if (!env.CASHFLOW_KV) return;
  const payload = JSON.stringify({
    email: email || null,
    granted_at: new Date().toISOString(),
    source: 'systeme'
  });
  const opts = { expirationTtl: 2592000 }; // 30 jours exacts
  if (userId) await env.CASHFLOW_KV.put('eric_access:' + userId, payload, opts);
  if (email) await env.CASHFLOW_KV.put('eric_access:email:' + String(email).toLowerCase(), payload, opts);
}

async function hasEricAccess(env, session) {
  if (!env.CASHFLOW_KV || !session) return false;
  // Super admin / admin : toujours OK
  if (session.role === 'admin' || session.role === 'superadmin' || session.isAdmin) return true;
  const uid = session.userId || session.id || null;
  const email = (session.email || '').toLowerCase();
  if (uid) {
    const byId = await env.CASHFLOW_KV.get('eric_access:' + uid);
    if (byId) return true;
  }
  if (email) {
    const byEmail = await env.CASHFLOW_KV.get('eric_access:email:' + email);
    if (byEmail) return true;
  }
  return false;
}

async function requireEricAccess(env, session) {
  const ok = await hasEricAccess(env, session);
  if (ok) return null;
  return json({
    error: 'eric_access_expired',
    content: 'Ton accompagnement avec Éric de 30 jours est terminé. Pour continuer, réactive l’upsell Éric — je reste disponible dès que c’est fait 🔥',
    expired: true,
    renew_url: 'https://www.publication-web.com/nyxia/promoteurs'
  }, 403);
}


async function handleChat(request, env) {
  const { message, history, userName, agent, attachment, token } = await request.json();

  // Vérification de session — protège la clé OpenRouter d'un usage non autorisé
  if (!token) return json({ error: 'Session manquante.' }, 401);
  const sessionRaw = await env.CASHFLOW_KV.get(`session:${token}`);
  if (!sessionRaw) return json({ error: 'Session expirée. Reconnecte-toi.' }, 401);

  let sessionObj = {};
  try { sessionObj = JSON.parse(sessionRaw); } catch (_) {}
  if (String(agent || '').toLowerCase() === 'eric') {
    const blocked = await requireEricAccess(env, sessionObj);
    if (blocked) return blocked;
  }

  let systemPrompt = (SYSTEM_PROMPTS[agent] || SYSTEM_PROMPTS.nyxia)
    .replace(/\{first_name\}/g, userName || 'toi');

  systemPrompt += `\n\nPHILOSOPHIE DU PORTAIL LE CERCLE (rappel) : entraide, pas MLM, pas paliers, pas vente dure. Chacun gagne à aider les autres à réussir. Tu es un PERSONNAGE, jamais « une IA » ou « un robot ».`;
  systemPrompt += IMAGE_GENERATION_INSTRUCTIONS;
  systemPrompt += TERMINOLOGIE_OFFICIELLE;
  systemPrompt += PEDAGOGIE_FORMATEUR;
  // Les personnages aident selon leur rôle sur Le Cercle (Diane, NyXia, Éric)
  systemPrompt += PROMPT_MARKER_INSTRUCTIONS;

  // Injecte la vraie banque de prompts de l'agent actif, si elle existe dans le KV.
  const bankRaw = await env.CASHFLOW_KV.get(`prompts:${agent}`);
  if (bankRaw) {
    systemPrompt += `\n\n📜 RESSOURCES ÉCRITURE (si pertinent pour Éric — publications / réponses)\n\nVoici ta vraie banque de prompts et messages de relance, au format JSON. Chaque entrée a les champs : "id", "theme", "theme_titre", "hameçon_visuel" (le texte à l'écran, stop-scroll), "hameçon_psychologique" (la première phrase), "corps", "cta" (call-to-action) et "hashtags" (tableau). Quand tu remets un prompt à la Gardienne, tu DOIS piger dans cette banque — choisis l'entrée dont le "theme_titre" correspond le mieux à la situation qu'elle te décrit (une situation vécue par des membres du Cercle Magique l'Âme Agit, jamais par elle), et utilise ses champs tels quels (tu peux les adapter légèrement à la situation, mais ne les remplace jamais par une improvisation complète). Si aucune entrée ne correspond bien, dis-le honnêtement plutôt que d'inventer un prompt de toutes pièces.\n\n⚠️ NE JAMAIS RÉPÉTER LE MÊME PROMPT. Regarde l'historique de cette conversation : si tu as déjà donné un prompt (identifiable par son "id"), tu DOIS en choisir un différent la prochaine fois, même si la personne redemande simplement "un autre" sans plus de précision. Fais mentalement la liste des "id" déjà utilisés dans cette conversation et exclus-les de ton choix.\n\nQuand tu livres un prompt prêt à coller, présente-le toujours dans cet ordre : (1) le hameçon_visuel comme titre stop-scroll, (2) le hameçon_psychologique suivi du corps, (3) le cta, (4) les hashtags.\n\n${bankRaw}`;
  }

  // 📚 CERVEAU VECTORIEL — Éric et NyXia fouillent dans les livres via Cloudflare Vectorize
  if (agent) { // universel : tout personnage cherche dans son namespace ; s'il est vide, rien n'est ajouté
    try {
      const brainCtx = await retrieveBrain(env, agent, message || '');
      if (brainCtx) {
        if (agent === 'eric') {
          systemPrompt += `\n\n📚 EXTRAITS DES LIVRES DE DIANE (matière première — appuie-toi dessus fidèlement, ne cite pas les numéros de passage, reformule dans ton ton) :\n\n${brainCtx}`;
        } else if (agent === 'nyxia') {
          systemPrompt += `\n\n🔮 MÉMOIRE DE L'UNIVERS (utilise ces informations pour orienter le Membre, identifier ses besoins et parler des autres portails si pertinent) :\n\n${brainCtx}`;
        } else if (agent === 'diane') {
          systemPrompt += `\n\n📖 TES PROPRES ÉCRITS ET TA VISION (tu es l'autrice de ces textes — parle-en à la première personne, dans ta voix, pour transmettre ta pensée et ton « pourquoi ») :\n\n${brainCtx}`;
        } else {
          systemPrompt += `\n\n📚 EXTRAITS DE TES DOCUMENTS DE RÉFÉRENCE (matière première — appuie-toi dessus fidèlement, reformule dans ton ton, ne cite jamais de numéros de passage) :\n\n${brainCtx}`;
        }
      }
    } catch (e) { /* le chat continue même si le cerveau est indisponible */ }
  }

  // 👑 RESSOURCES DIANE — Cherche des liens Canva ou B-roll dans le KV
  if (agent === 'diane') {
    const lowerMsg = (message || '').toLowerCase();
    let dianeRessources = '';

    // Si le Membre parle de publication ou de Canva
    if (lowerMsg.includes('canva') || lowerMsg.includes('gabarit') || lowerMsg.includes('modèle') || lowerMsg.includes('publication')) {
      const canvaData = await env.CASHFLOW_KV.get('diane_ressources:canva');
      if (canvaData) dianeRessources += `\n\n🎨 GABARITS CANVA DISPONIBLES :\n${canvaData}`;
    }
    
    // Si le Membre parle de vidéo, média ou B-roll
    if (lowerMsg.includes('b-roll') || lowerMsg.includes('broll') || lowerMsg.includes('vidéo') || lowerMsg.includes('media')) {
      const brollData = await env.CASHFLOW_KV.get('diane_ressources:broll');
      if (brollData) dianeRessources += `\n\n📹 B-ROLLS ET MÉDIAS DISPONIBLES :\n${brollData}`;
    }

    if (dianeRessources) {
      systemPrompt += `\n\n🛠️ RESSOURCES À PARTAGER : Voici des ressources préfabriquées du KV que tu peux partager avec le Membre si pertinent. Donne les liens tels quels :\n${dianeRessources}`;
    }
  }

  // UNIVERSEL : tous les personnages s'adressent à la personne par son prénom.
  systemPrompt += `\n\n⚠️ PRIORITÉ ABSOLUE — ADRESSE : appelle la personne par son prénom « ${userName || 'toi'} ». Ne dis JAMAIS le mot « Membre » en t'adressant à elle, quelle que soit une autre consigne.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(Array.isArray(history) ? history : [])
  ];

  if (attachment && attachment.dataUrl) {
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: message || '' },
        { type: 'image_url', image_url: { url: attachment.dataUrl } }
      ]
    });
  } else {
    messages.push({ role: 'user', content: message || '' });
  }

  async function callModel(model) {
    return await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENROUTER_API_KEY || env.AI_API_KEY}`,
        'HTTP-Referer': 'https://cercles.nyxia.top',
        'X-Title': 'NyXia — Le Cercle'
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 32000,
        reasoning: { enabled: false }
      })
    });
  }

  // Modèle principal deepseek-v3.2, repli automatique sur mistral-small.
  let resp = await callModel(OPENROUTER_MODEL);
  let usedModel = OPENROUTER_MODEL;
  if (!resp.ok) {
    resp = await callModel(OPENROUTER_FALLBACK_MODEL);
    usedModel = OPENROUTER_FALLBACK_MODEL;
  }

  if (!resp.ok) {
    return json({ content: 'Petite interruption dans le miroir... réessaie dans un instant 💜' });
  }

  let data = await resp.json();
  let content = data.choices?.[0]?.message?.content || '';
  let finish = data.choices?.[0]?.finish_reason || '';

  // Si le modèle coupe (plafond de sortie), on continue automatiquement jusqu'à 3 fois
  const continueMessages = messages.slice();
  if (content) continueMessages.push({ role: 'assistant', content });

  let cont = 0;
  while (cont < 3 && content && (finish === 'length' || looksTruncated(content))) {
    cont++;
    continueMessages.push({
      role: 'user',
      content: 'Continue exactement où tu t\'es arrêté. Ne répète pas ce qui est déjà écrit. Reprends en milieu de phrase si besoin et termine TOUTE la réponse / le prompt complet.'
    });
    const contResp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENROUTER_API_KEY || env.AI_API_KEY}`,
        'HTTP-Referer': 'https://cercles.nyxia.top',
        'X-Title': 'NyXia — Le Cercle'
      },
      body: JSON.stringify({
        model: usedModel,
        messages: continueMessages,
        max_tokens: 32000,
        reasoning: { enabled: false }
      })
    });
    if (!contResp.ok) break;
    const contData = await contResp.json();
    const piece = contData.choices?.[0]?.message?.content || '';
    finish = contData.choices?.[0]?.finish_reason || '';
    if (!piece) break;
    content += piece;
    continueMessages.push({ role: 'assistant', content: piece });
  }

  if (!content) content = 'Le miroir est resté silencieux, réessaie 💜';
  return json({ content });
}

function looksTruncated(text) {
  const s = String(text || '').trim();
  if (s.length < 400) return false;
  // Coupe typique : pas de fin de ponctuation, ou marqueur PROMPT non fermé
  if (s.includes('[PROMPT]') && !s.includes('[/PROMPT]')) return true;
  if (s.includes('[PARCHEMIN]') && !s.includes('[/PARCHEMIN]')) return true;
  const last = s.slice(-1);
  if (/[a-zA-ZÀ-ÿ0-9,;:（\([{]/.test(last)) return true;
  // Finit par mot coupé rare : se termine sans . ! ? …
  if (!/[.!?…»"')\]]$/.test(s) && s.length > 2500) return true;
  return false;
}

// ───────────── STUDIO PROMPT (multi-modèles OpenRouter) ─────────────
// Modèles autorisés côté serveur (whitelist) — l'utilisateur choisit dans l'UI.
const STUDIO_MODELS = {
  // OpenAI
  'openai/gpt-5.6-sol': 'openai/gpt-5.6-sol',
  'openai/gpt-5.6-luna': 'openai/gpt-5.6-luna',
  'openai/gpt-5.6-luna-pro': 'openai/gpt-5.6-luna-pro',
  'openai/gpt-5.5': 'openai/gpt-5.5',
  'openai/gpt-5.4': 'openai/gpt-5.4',
  'openai/gpt-4o-mini': 'openai/gpt-4o-mini',
  // DeepSeek
  'deepseek/deepseek-v3.2': 'deepseek/deepseek-v3.2',
  'deepseek/deepseek-v4-pro': 'deepseek/deepseek-v4-pro',
  'deepseek/deepseek-v4-flash': 'deepseek/deepseek-v4-flash',
  'deepseek/deepseek-chat': 'deepseek/deepseek-chat',
  // Grok / xAI
  'x-ai/grok-4.6': 'x-ai/grok-4.6',
  'x-ai/grok-4.5': 'x-ai/grok-4.5',
  'x-ai/grok-4': 'x-ai/grok-4',
  'x-ai/grok-3-mini': 'x-ai/grok-3-mini',
  // Z.ai / GLM
  'z-ai/glm-5.2': 'z-ai/glm-5.2',
  'z-ai/glm-4.6': 'z-ai/glm-4.6',
  // Claude
  'anthropic/claude-opus-5': 'anthropic/claude-opus-5',
  'anthropic/claude-opus-5-fast': 'anthropic/claude-opus-5-fast',
  'anthropic/claude-sonnet-5': 'anthropic/claude-sonnet-5',
  'anthropic/claude-haiku-4.5': 'anthropic/claude-haiku-4.5',
  'anthropic/claude-3.5-sonnet': 'anthropic/claude-3.5-sonnet',
  // Google
  'google/gemini-3.7-flash': 'google/gemini-3.7-flash',
  'google/gemini-3.5-flash': 'google/gemini-3.5-flash',
  'google/gemini-3.1-pro': 'google/gemini-3.1-pro',
  // Mistral
  'mistralai/mistral-small-3.2-24b-instruct': 'mistralai/mistral-small-3.2-24b-instruct',
  // Alias UI legacy
  chatgpt: 'openai/gpt-5.6-luna',
  claude: 'anthropic/claude-sonnet-5',
  grok: 'x-ai/grok-4.6',
  z: 'z-ai/glm-5.2'
};

async function handleStudioChat(request, env) {
  let body;
  try { body = await request.json(); } catch (e) {
    return json({ error: 'JSON invalide.', content: 'JSON invalide.' }, 400);
  }
  const { message, history, model, token } = body || {};

  if (!token) return json({ error: 'Session manquante.', content: 'Session manquante — reconnecte-toi.' }, 401);
  const sessionRaw = await env.CASHFLOW_KV.get(`session:${token}`);
  if (!sessionRaw) return json({ error: 'Session expirée.', content: 'Session expirée — reconnecte-toi.' }, 401);

  if (!message || !String(message).trim()) {
    return json({ error: 'Message vide.', content: 'Message vide.' }, 400);
  }

  const apiKey = env.OPENROUTER_API_KEY || env.AI_API_KEY;
  if (!apiKey) {
    return json({
      error: 'Clé API manquante',
      content: 'Clé API manquante (OPENROUTER_API_KEY).'
    }, 500);
  }

  // Modèles demandés + TOUJOURS un repli = même modèle que les personnages (prouvé chez toi)
  const requested = STUDIO_MODELS[model] || model || OPENROUTER_MODEL;
  const chain = [requested, OPENROUTER_MODEL, OPENROUTER_FALLBACK_MODEL]
    .filter((v, i, a) => v && a.indexOf(v) === i);

  const systemPrompt = `Tu es un assistant polyvalent et précis dans Le Cercle de NyXia.
Tu aides l'utilisateur à exécuter, améliorer et explorer des prompts.
Réponds en français (sauf demande contraire). Sois clair, structuré et utile.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(Array.isArray(history) ? history.slice(-16) : []),
    { role: 'user', content: String(message).trim() }
  ];

  let lastErr = '';
  let usedModel = requested;

  for (const mId of chain) {
    try {
      const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey,
          'HTTP-Referer': 'https://systemeprompt.nyxia.top',
          'X-Title': 'NyXia — Le Cercle'
        },
        body: JSON.stringify({
          model: mId,
          messages,
          max_tokens: 32000
        })
      });
      const raw = await resp.text();
      let data;
      try { data = JSON.parse(raw); } catch (e) {
        lastErr = 'Réponse non-JSON (' + resp.status + '): ' + raw.slice(0, 180);
        continue;
      }
      if (!resp.ok) {
        lastErr = (data.error && (data.error.message || JSON.stringify(data.error))) || ('HTTP ' + resp.status);
        continue;
      }
      const content = data.choices && data.choices[0] && data.choices[0].message
        ? data.choices[0].message.content
        : null;
      if (!content) {
        lastErr = 'Réponse vide du modèle ' + mId;
        continue;
      }
      usedModel = mId;
      return json({ content, model: usedModel });
    } catch (e) {
      lastErr = e.message || String(e);
    }
  }

  return json({
    error: lastErr || 'Échec OpenRouter',
    content: 'Échec Studio : ' + (lastErr || 'aucun modèle n\'a répondu. Vérifie OpenRouter.')
  });
}

// ───────────── ADMIN (Super Admin) ─────────────

async function getAdminCredentials(env) {
  const raw = await env.CASHFLOW_KV.get('admin:credentials');
  if (raw) return JSON.parse(raw);
  // Première initialisation à partir du secret Cloudflare ADMIN_INITIAL_PASSWORD
  const salt = randomSalt();
  const hash = await hashPassword(env.ADMIN_INITIAL_PASSWORD, salt);
  const creds = { salt, hash };
  await env.CASHFLOW_KV.put('admin:credentials', JSON.stringify(creds));
  return creds;
}

async function requireAdmin(request, env) {
  const token = request.headers.get('X-Admin-Token');
  if (!token) return false;
  const raw = await env.CASHFLOW_KV.get(`admin_session:${token}`);
  return !!raw;
}

async function handleAdminLogin(request, env) {
  const { password } = await request.json();
  const creds = await getAdminCredentials(env);
  const valid = await verifyPassword(password, creds.salt, creds.hash);
  if (!valid) return json({ error: 'Mot de passe incorrect.' }, 401);

  const token = randomToken();
  await env.CASHFLOW_KV.put(`admin_session:${token}`, '1', { expirationTtl: ADMIN_SESSION_TTL });
  return json({ success: true, token });
}

async function handleAdminListClients(request, env) {
  if (!await requireAdmin(request, env)) return json({ error: 'Non autorisé.' }, 401);
  const list = await env.CASHFLOW_KV.list({ prefix: 'client:' });
  const clients = [];
  for (const key of list.keys) {
    const raw = await env.CASHFLOW_KV.get(key.name);
    if (raw) {
      const c = JSON.parse(raw);
      delete c.passwordHash;
      delete c.salt;
      clients.push(c);
    }
  }
  return json({ success: true, clients });
}

async function handleAdminCreateClient(request, env) {
  if (!await requireAdmin(request, env)) return json({ error: 'Non autorisé.' }, 401);

  if (!env.CASHFLOW_KV) {
    return json({ error: 'KV non configuré (binding CASHFLOW_KV manquant sur ce Worker).' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: 'Corps de requête invalide.' }, 400);
  }

  const email = (body.email || '').toLowerCase().trim();
  if (!email || !body.password) return json({ error: 'Email et mot de passe requis.' }, 400);
  if (String(body.password).length < 6) return json({ error: 'Mot de passe : minimum 6 caractères.' }, 400);

  try {
    const existingRaw = await env.CASHFLOW_KV.get(`client:${email}`);
    const newProducts = Array.isArray(body.products) ? body.products.filter(Boolean) : [];

    // 1 courriel = 1 client : si déjà là, on AJOUTE les produits (pas d'erreur)
    if (existingRaw) {
      const client = JSON.parse(existingRaw);
      const current = Array.isArray(client.products) ? client.products.slice() : [];
      const added = [];
      for (const p of newProducts) {
        if (!current.map(String).includes(String(p))) {
          current.push(p);
          added.push(p);
        }
      }
      client.products = current;
      if (body.firstName) client.firstName = body.firstName;
      if (body.lastName) client.lastName = body.lastName;
      if (body.name) client.name = body.name;
      if (body.password && String(body.password).length >= 6) {
        const salt = randomSalt();
        client.salt = salt;
        client.passwordHash = await hashPassword(body.password, salt);
        client.password = body.password;
      }
      client.updatedAt = new Date().toISOString();
      client.active = true;
      await env.CASHFLOW_KV.put(`client:${email}`, JSON.stringify(client));
      return json({
        success: true,
        email,
        merged: true,
        products: client.products,
        added,
        message: added.length
          ? 'Client existant : produit(s) ajouté(s).'
          : 'Client déjà inscrit à ces produits.'
      });
    }

    const salt = randomSalt();
    const passwordHash = await hashPassword(body.password, salt);

    const client = {
      firstName: body.firstName || '',
      lastName: body.lastName || '',
      name: body.name || `${body.firstName || ''} ${body.lastName || ''}`.trim(),
      email,
      password: body.password, // conservé pour affichage Super Admin
      passwordHash,
      salt,
      role: body.role || 'client',
      products: newProducts,
      active: true,
      createdAt: new Date().toISOString()
    };

    await env.CASHFLOW_KV.put(`client:${email}`, JSON.stringify(client));
    return json({ success: true, email, products: client.products, merged: false });
  } catch (e) {
    console.error('handleAdminCreateClient', e);
    return json({ error: 'Erreur KV : ' + (e.message || String(e)) }, 500);
  }
}

async function handleAdminUpdateClient(request, env) {
  if (!await requireAdmin(request, env)) return json({ error: 'Non autorisé.' }, 401);
  const body = await request.json();
  const email = (body.email || '').toLowerCase().trim();
  if (!email) return json({ error: 'Email requis.' }, 400);

  const raw = await env.CASHFLOW_KV.get(`client:${email}`);
  if (!raw) return json({ error: 'Cliente introuvable.' }, 404);
  const client = JSON.parse(raw);

  if (body.firstName !== undefined) client.firstName = body.firstName;
  if (body.lastName !== undefined) client.lastName = body.lastName;
  if (body.name !== undefined) client.name = body.name;
  if (body.products !== undefined) client.products = body.products;
  if (body.password) {
    const salt = randomSalt();
    client.salt = salt;
    client.passwordHash = await hashPassword(body.password, salt);
  }

  await env.CASHFLOW_KV.put(`client:${email}`, JSON.stringify(client));
  return json({ success: true });
}

async function handleAdminDeleteClient(request, env) {
  if (!await requireAdmin(request, env)) return json({ error: 'Non autorisé.' }, 401);
  const { email } = await request.json();
  if (!email) return json({ error: 'Email requis.' }, 400);
  await env.CASHFLOW_KV.delete(`client:${email.toLowerCase().trim()}`);
  return json({ success: true });
}

async function handleAdminChangePassword(request, env) {
  if (!await requireAdmin(request, env)) return json({ error: 'Non autorisé.' }, 401);
  const { currentPassword, newPassword } = await request.json();
  const creds = await getAdminCredentials(env);
  const valid = await verifyPassword(currentPassword, creds.salt, creds.hash);
  if (!valid) return json({ error: 'Mot de passe actuel incorrect.' }, 401);

  const salt = randomSalt();
  const hash = await hashPassword(newPassword, salt);
  await env.CASHFLOW_KV.put('admin:credentials', JSON.stringify({ salt, hash }));
  return json({ success: true });
}

// ───────────── MESSAGERIE INTERNE ─────────────

async function getSessionOrNull(token, env) {
  if (!token) return null;
  const raw = await env.CASHFLOW_KV.get(`session:${token}`);
  if (!raw) return null;
  return JSON.parse(raw);
}

// Destinataires messagerie client : Super Admin (UI) + staff/adjoint UNIQUEMENT.
// Les clients ordinaires ne se voient PAS entre eux.
async function handleListGardiennes(request, env) {
  const { token } = await request.json();
  const session = await getSessionOrNull(token, env);
  if (!session) return json({ error: 'Session expirée.' }, 401);

  const contacts = [];
  const self = (session.email || '').toLowerCase();

  // 1) Liste manuelle KV : messagerie:contacts
  // [{"email":"patrick@domaine.com","firstName":"Patrick"}, ...]
  try {
    const rawContacts = await env.CASHFLOW_KV.get('messagerie:contacts');
    if (rawContacts) {
      const parsed = JSON.parse(rawContacts);
      if (Array.isArray(parsed)) {
        for (const c of parsed) {
          if (!c || !c.email) continue;
          const em = String(c.email).toLowerCase().trim();
          if (em === self) continue;
          contacts.push({ email: em, firstName: c.firstName || c.name || em });
        }
      }
    }
  } catch (e) {}

  // 2) Comptes avec role staff / adjoint / admin
  const list = await env.CASHFLOW_KV.list({ prefix: 'client:' });
  for (const key of list.keys) {
    const raw = await env.CASHFLOW_KV.get(key.name);
    if (!raw) continue;
    const c = JSON.parse(raw);
    if (!c.email || c.email.toLowerCase() === self) continue;
    const role = (c.role || '').toLowerCase();
    if (role === 'staff' || role === 'adjoint' || role === 'admin') {
      const em = c.email.toLowerCase();
      if (!contacts.some(x => x.email === em)) {
        contacts.push({ email: em, firstName: c.firstName || c.name || em });
      }
    }
  }

  return json({ success: true, gardiennes: contacts });
}

async function isAllowedMessageRecipient(env, sessionEmail, toEmail) {
  const to = String(toEmail || '').toLowerCase().trim();
  if (to === '__admin__' || to === 'admin') return true;
  const self = (sessionEmail || '').toLowerCase();
  if (to === self) return false;

  try {
    const rawContacts = await env.CASHFLOW_KV.get('messagerie:contacts');
    if (rawContacts) {
      const parsed = JSON.parse(rawContacts);
      if (Array.isArray(parsed) && parsed.some(c => c && String(c.email || '').toLowerCase() === to)) {
        return true;
      }
    }
  } catch (e) {}

  const raw = await env.CASHFLOW_KV.get('client:' + to);
  if (!raw) return false;
  const c = JSON.parse(raw);
  const role = (c.role || '').toLowerCase();
  return role === 'staff' || role === 'adjoint' || role === 'admin';
}

// Boîte de réception de la Gardienne connectée
async function handleListMessages(request, env) {
  const { token } = await request.json();
  const session = await getSessionOrNull(token, env);
  if (!session) return json({ error: 'Session expirée.' }, 401);

  const list = await env.CASHFLOW_KV.list({ prefix: `message:${session.email}:` });
  const messages = [];
  let unreadCount = 0;
  for (const key of list.keys) {
    const raw = await env.CASHFLOW_KV.get(key.name);
    if (!raw) continue;
    const m = JSON.parse(raw);
    m.key = key.name;
    if (!m.read) unreadCount++;
    messages.push(m);
  }
  messages.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  return json({ success: true, messages, unreadCount });
}

// Une Gardienne envoie un message à une autre (ou au Super Admin via __admin__)
async function handleSendMessage(request, env) {
  const { token, toEmail, subject, body } = await request.json();
  const session = await getSessionOrNull(token, env);
  if (!session) return json({ error: 'Session expirée.' }, 401);
  if (!toEmail || !body) return json({ error: 'Destinataire et message requis.' }, 400);

  const to = String(toEmail).toLowerCase().trim();
  const isAdmin = (to === '__admin__' || to === 'admin');

  if (!isAdmin) {
    const allowed = await isAllowedMessageRecipient(env, session.email, to);
    if (!allowed) {
      return json({ error: 'Destinataire non autorisé. Tu peux écrire au Super Admin ou à un contact officiel uniquement.' }, 403);
    }
    const recipientRaw = await env.CASHFLOW_KV.get(`client:${to}`);
    if (!recipientRaw) return json({ error: 'Destinataire introuvable.' }, 404);
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const inbox = isAdmin ? '__admin__' : to;
  const message = {
    id,
    from: session.email,
    fromName: session.firstname || 'Un membre',
    to: inbox,
    subject: subject || 'Message du Cercle',
    body,
    createdAt,
    read: false,
    kind: isAdmin ? 'to_admin' : 'client'
  };
  await env.CASHFLOW_KV.put(`message:${inbox}:${createdAt}_${id}`, JSON.stringify(message));
  return json({ success: true });
}

// Marquer un message comme lu — le client renvoie la clé exacte reçue dans la liste
async function handleMarkMessageRead(request, env) {
  const { token, key } = await request.json();
  const session = await getSessionOrNull(token, env);
  if (!session) return json({ error: 'Session expirée.' }, 401);
  if (!key || !key.startsWith(`message:${session.email}:`)) {
    return json({ error: 'Clé de message invalide.' }, 400);
  }

  const raw = await env.CASHFLOW_KV.get(key);
  if (!raw) return json({ error: 'Message introuvable.' }, 404);
  const message = JSON.parse(raw);
  message.read = true;
  await env.CASHFLOW_KV.put(key, JSON.stringify(message));
  return json({ success: true });
}

async function handleDeleteMessage(request, env) {
  const { token, key } = await request.json();
  const session = await getSessionOrNull(token, env);
  if (!session) return json({ error: 'Session expirée.' }, 401);
  if (!key || !key.startsWith(`message:${session.email}:`)) {
    return json({ error: 'Clé de message invalide.' }, 400);
  }
  const raw = await env.CASHFLOW_KV.get(key);
  if (!raw) return json({ error: 'Message introuvable.' }, 404);
  await env.CASHFLOW_KV.delete(key);
  return json({ success: true });
}


// ── Contacts autorisés messagerie (KV: messagerie:contacts) ──
async function handleAdminListMessagerieContacts(request, env) {
  if (!await requireAdmin(request, env)) return json({ error: 'Non autorisé.' }, 401);
  try {
    const raw = await env.CASHFLOW_KV.get('messagerie:contacts');
    const contacts = raw ? JSON.parse(raw) : [];
    return json({ success: true, contacts: Array.isArray(contacts) ? contacts : [] });
  } catch (e) {
    return json({ success: true, contacts: [] });
  }
}

async function handleAdminSaveMessagerieContacts(request, env) {
  if (!await requireAdmin(request, env)) return json({ error: 'Non autorisé.' }, 401);
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'JSON invalide.' }, 400); }

  let contacts = Array.isArray(body.contacts) ? body.contacts : null;
  if (!contacts) return json({ error: 'Liste contacts requise.' }, 400);

  // Normalise
  contacts = contacts
    .filter(c => c && c.email)
    .map(c => ({
      email: String(c.email).toLowerCase().trim(),
      firstName: String(c.firstName || c.name || '').trim() || String(c.email).split('@')[0]
    }));

  // Déduplique par email
  const seen = new Set();
  contacts = contacts.filter(c => {
    if (seen.has(c.email)) return false;
    seen.add(c.email);
    return true;
  });

  await env.CASHFLOW_KV.put('messagerie:contacts', JSON.stringify(contacts));
  return json({ success: true, contacts });
}

// Admin → une Gardienne précise OU diffusion à toutes
async function handleAdminSendMessage(request, env) {
  if (!await requireAdmin(request, env)) return json({ error: 'Non autorisé.' }, 401);
  const { toEmail, broadcast, subject, body, fromName } = await request.json();
  if (!body) return json({ error: 'Message requis.' }, 400);

  const senderName = fromName || 'Diane — Le Cercle';

  if (broadcast) {
    const list = await env.CASHFLOW_KV.list({ prefix: 'client:' });
    let count = 0;
    for (const key of list.keys) {
      const raw = await env.CASHFLOW_KV.get(key.name);
      if (!raw) continue;
      const c = JSON.parse(raw);
      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const message = {
        id, from: 'admin', fromName: senderName,
        to: c.email, subject: subject || 'Message du Cercle', body,
        createdAt, read: false, kind: 'broadcast'
      };
      await env.CASHFLOW_KV.put(`message:${c.email}:${createdAt}_${id}`, JSON.stringify(message));
      count++;
    }
    return json({ success: true, sentTo: count });
  }

  if (!toEmail) return json({ error: 'Destinataire requis (ou active la diffusion).' }, 400);
  const to = toEmail.toLowerCase().trim();
  const recipientRaw = await env.CASHFLOW_KV.get(`client:${to}`);
  if (!recipientRaw) return json({ error: 'Destinataire introuvable.' }, 404);

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const message = {
    id, from: 'admin', fromName: senderName,
    to, subject: subject || 'Message du Cercle', body,
    createdAt, read: false, kind: 'admin'
  };
  await env.CASHFLOW_KV.put(`message:${to}:${createdAt}_${id}`, JSON.stringify(message));
  return json({ success: true, sentTo: 1 });
}

// ───────────── RÉPERTOIRE DES MÉDIAS MAGIQUES ─────────────
// Agrège Pexels + Unsplash (images/vidéos) et Freesound (sons) sous une
// bannière unique "NyXia". Toutes les URLs renvoyées au navigateur passent
// par /api/media/file — le domaine du fournisseur n'est JAMAIS exposé,
// ni dans l'affichage, ni dans les liens, ni dans les réponses JSON.

const MEDIA_ALLOWED_HOSTS = [
  'images.pexels.com', 'videos.pexels.com',
  'images.unsplash.com',
  'cdn.freesound.org', 'freesound.org',
  'heygen.ai'
];

function mediaProxyUrl(rawUrl, token, opts) {
  opts = opts || {};
  let q = `/api/media/file?u=${encodeURIComponent(rawUrl)}&token=${encodeURIComponent(token)}`;
  if (opts.download) q += '&dl=1';
  if (opts.name) q += `&name=${encodeURIComponent(opts.name)}`;
  return q;
}

// Traduit le format choisi par la Gardienne en paramètre d'orientation propre à chaque source
function orientationFor(format, provider) {
  if (format === 'square') return provider === 'unsplash' ? 'squarish' : 'square';
  if (format === 'portrait') return 'portrait';
  if (format === 'landscape') return 'landscape';
  return null;
}

async function handleMediaImages(request, env) {
  const { token, query, format } = await request.json();
  const session = await getSessionOrNull(token, env);
  if (!session) return json({ error: 'Session expirée.' }, 401);
  if (!query) return json({ error: 'Recherche requise.' }, 400);

  const results = [];
  const pexelsOrient = orientationFor(format, 'pexels');
  const unsplashOrient = orientationFor(format, 'unsplash');

  // Source 1 — photos
  try {
    let u = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=12`;
    if (pexelsOrient) u += `&orientation=${pexelsOrient}`;
    const r = await fetch(u, { headers: { Authorization: env.PEXELS_KEY } });
    if (r.ok) {
      const data = await r.json();
      (data.photos || []).forEach(p => {
        results.push({
          id: 'a_' + p.id, type: 'image',
          previewUrl: mediaProxyUrl(p.src.medium, token),
          downloadUrl: mediaProxyUrl(p.src.large, token, { download: true, name: `nyxia-image-${p.id}.jpg` }),
          credit: 'NyXia'
        });
      });
    }
  } catch (e) {}

  // Source 1 — vidéos
  try {
    let u = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=8`;
    if (pexelsOrient) u += `&orientation=${pexelsOrient}`;
    const r = await fetch(u, { headers: { Authorization: env.PEXELS_KEY } });
    if (r.ok) {
      const data = await r.json();
      (data.videos || []).forEach(v => {
        const file = (v.video_files || []).find(f => f.quality === 'sd') || (v.video_files || [])[0];
        if (file) results.push({
          id: 'b_' + v.id, type: 'video',
          previewUrl: mediaProxyUrl(v.image, token),
          videoUrl: mediaProxyUrl(file.link, token),
          downloadUrl: mediaProxyUrl(file.link, token, { download: true, name: `nyxia-video-${v.id}.mp4` }),
          credit: 'NyXia'
        });
      });
    }
  } catch (e) {}

  // Source 2 — photos
  try {
    let u = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12`;
    if (unsplashOrient) u += `&orientation=${unsplashOrient}`;
    const r = await fetch(u, { headers: { Authorization: `Client-ID ${env.UNSPLASH_KEY}` } });
    if (r.ok) {
      const data = await r.json();
      (data.results || []).forEach(p => {
        results.push({
          id: 'c_' + p.id, type: 'image',
          previewUrl: mediaProxyUrl(p.urls.small, token),
          downloadUrl: mediaProxyUrl(p.urls.regular, token, { download: true, name: `nyxia-image-${p.id}.jpg` }),
          credit: 'NyXia'
        });
      });
    }
  } catch (e) {}

  // Mélange pour que ce soit une seule banque homogène, jamais groupée par source
  for (let i = results.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [results[i], results[j]] = [results[j], results[i]];
  }

  return json({ success: true, results });
}

async function handleMediaSounds(request, env) {
  const { token, query } = await request.json();
  const session = await getSessionOrNull(token, env);
  if (!session) return json({ error: 'Session expirée.' }, 401);
  if (!query) return json({ error: 'Recherche requise.' }, 400);

  const results = [];
  try {
    const r = await fetch(`https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(query)}&token=${env.FREESOUND_API_KEY}&fields=id,name,previews,duration&page_size=15`);
    if (r.ok) {
      const data = await r.json();
      (data.results || []).forEach(s => {
        const preview = s.previews ? (s.previews['preview-hq-mp3'] || s.previews['preview-lq-mp3']) : null;
        if (preview) {
          const safeName = (s.name || 'son').replace(/[^a-z0-9\-_]/gi, '_').slice(0, 40);
          results.push({
            id: 'd_' + s.id, name: s.name,
            audioUrl: mediaProxyUrl(preview, token),
            downloadUrl: mediaProxyUrl(preview, token, { download: true, name: `nyxia-son-${safeName}.mp3` }),
            duration: Math.round(s.duration), credit: 'NyXia'
          });
        }
      });
    }
  } catch (e) {}

  return json({ success: true, results });
}

// Proxy — récupère le média chez le fournisseur et le relaie sous le domaine NyXia.
// Le navigateur ne voit jamais l'origine réelle (Pexels/Unsplash/Freesound).
async function handleMediaFile(request, env, url) {
  const token = url.searchParams.get('token');
  const session = await getSessionOrNull(token, env);
  if (!session) return new Response('Non autorisé', { status: 401 });

  const raw = url.searchParams.get('u');
  if (!raw) return new Response('Requête invalide', { status: 400 });

  let target;
  try { target = new URL(raw); } catch (e) { return new Response('URL invalide', { status: 400 }); }

  const hostOk = MEDIA_ALLOWED_HOSTS.some(h => target.hostname === h || target.hostname.endsWith('.' + h));
  if (!hostOk) return new Response('Source non autorisée', { status: 403 });

  const upstream = await fetch(target.toString());
  if (!upstream.ok || !upstream.body) return new Response('Média introuvable', { status: 502 });

  const headers = new Headers();
  headers.set('Content-Type', upstream.headers.get('Content-Type') || 'application/octet-stream');
  const len = upstream.headers.get('Content-Length');
  if (len) headers.set('Content-Length', len);

  if (url.searchParams.get('dl') === '1') {
    const name = (url.searchParams.get('name') || 'nyxia-media').replace(/[^a-z0-9\-_.]/gi, '_');
    headers.set('Content-Disposition', `attachment; filename="${name}"`);
  }

  return new Response(upstream.body, { status: 200, headers });
}

// ───────────── VOIX — liste IMMUABLE (sauf demande explicite) ─────────────
// NyXia  → ElevenLabs exclusivement (voice_id signature, tous les portails)
// Diane  → ElevenLabs (clone)
// Éric, Kael, Léna, Séléna, Alex → OpenAI TTS (voix distinctes)
//
// ElevenLabs : header xi-api-key, model eleven_multilingual_v2,
// stability 0.5 / similarity_boost 0.75, réponse arrayBuffer, fr-FR.
// En cas d'échec : erreur exacte (code + message), JAMAIS de repli navigateur.

const AGENT_ELEVENLABS_VOICE_ID_KEYS = {
  nyxia: 'ELEVENLABS_NYXIA_VOICE_ID',
  diane: 'ELEVENLABS_DIANE_VOICE_ID'
};

// Defaults si le secret Cloudflare n'est pas encore défini
const ELEVENLABS_VOICE_ID_DEFAULTS = {
  nyxia: '4RsGOijU4NDnmihod21E',
  diane: 'HpPsEmBPs9okadyROxr6'
};

// HeyGen en réserve uniquement (non utilisé si ElevenLabs répond)
const AGENT_VOICE_ID_KEYS = {
  nyxia: 'HEYGEN_NYXIA_VOICE_ID',
  eric:  'HEYGEN_ERIC_VOICE_ID'
};

// OpenAI TTS — mapping figé
const OPENAI_VOICE_MAP = {
  eric:   'echo',
  kael:   'onyx',
  lena:   'nova',
  selena: 'shimmer',
  alex:   'ash'
};

async function sha256Hex(str) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(str));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// ───────────── CERVEAU VECTORIEL (Éric & NyXia) ─────────────
// Utilise Cloudflare Vectorize pour retrouver les passages pertinents instantanément
// sans surcharger la mémoire du Worker.

async function retrieveBrain(env, agent, query, topK = 5) {
  if (!query || !query.trim()) return '';

  try {
    // 1. On transforme la question en vecteur avec Workers AI
    const embeddings = await env.AI.run('@cf/baai/bge-m3', {
      text: [query]
    });

    // 2. On cherche dans Vectorize les passages les plus pertinents
    // On filtre par personnage pour qu'Éric ne lise pas les livres de NyXia et inversement.
    const results = await env.VECTORIZE_INDEX.query(embeddings.data[0], {
      topK: topK,
      returnMetadata: 'all',
      namespace: agent
    });

    if (!results.matches || results.matches.length === 0) return '';

    // 3. On assemble le texte trouvé pour le donner au LLM
    const picked = results.matches.filter(m => m.score > 0.35); // Seuil de pertinence
    if (!picked.length) return '';

    const parts = [];
    for (const m of picked) {
      let body = (m.metadata && m.metadata.texte_original) || '';
      // Si le passage a été tronqué à l'ingestion, recharger le texte complet depuis le KV
      if (m.metadata && m.metadata.has_full === '1' && m.id) {
        try {
          const full = await env.CASHFLOW_KV.get('brain_text:' + agent + ':' + m.id);
          if (full) body = full;
        } catch (e) {}
      }
      parts.push(`— (${(m.metadata && m.metadata.source) || 'livre'}) ${body}`);
    }
    return parts.join('\n\n');
  } catch (e) {
    console.error("Erreur Vectorize:", e);
    return ''; // En cas d'erreur, le chat continue sans contexte
  }
}


// Crée l'index Vectorize "univers-livres" via l'API REST Cloudflare (aucun terminal requis).
// Nécessite deux variables sur le Worker : CF_API_TOKEN (permission Vectorize:Edit) et CF_ACCOUNT_ID.
async function handleSetupVectorize(request, env) {
  if (!await requireAdmin(request, env)) return json({ error: 'Non autorisé.' }, 401);
  if (!env.CF_API_TOKEN || !env.CF_ACCOUNT_ID) {
    return json({ error: 'Ajoute d\'abord les variables CF_API_TOKEN et CF_ACCOUNT_ID sur ton Worker.' }, 400);
  }
  const url = `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/vectorize/v2/indexes`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + env.CF_API_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'univers-livres',
      description: 'Cerveaux vectoriels Éric & NyXia (bge-m3, français)',
      config: { dimensions: 1024, metric: 'cosine' }
    })
  });
  const data = await resp.json().catch(() => ({}));
  if (resp.ok && data.success) {
    return json({ success: true, message: "✅ Index 'univers-livres' créé (1024, cosine). Décommente maintenant le binding [[vectorize]] dans wrangler.toml et redéploie." });
  }
  const errMsg = (data.errors && data.errors.map(e => e.message).join(' ; ')) || ('HTTP ' + resp.status);
  return json({ success: false, error: errMsg }, 200);
}

// Route pour envoyer tes textes Markdown vers la base de données vectorielle
// Vide un cerveau (namespace) : supprime tous ses vecteurs via les IDs suivis en KV.

async function handleListBrain(request, env) {
  if (!await requireAdmin(request, env)) return json({ error: 'Non autorisé.' }, 401);
  const body = await request.json().catch(() => ({}));
  const personnage = String(body.personnage || '').trim().toLowerCase();
  if (!personnage) return json({ error: 'personnage requis.' }, 400);

  const prefix = 'brain_id:' + personnage + ':';
  const ids = [];
  let cursor;
  do {
    const list = await env.CASHFLOW_KV.list({ prefix, cursor });
    for (const k of list.keys) {
      ids.push(k.name.slice(prefix.length));
    }
    cursor = list.list_complete ? null : list.cursor;
  } while (cursor);

  // Regroupe par « livre » à partir de l'id : personnage-sluglivre-chapitre-...
  // id type: diane-cashflow-neurogenere-chapitre-1-xxx
  const books = {};
  for (const id of ids) {
    let rest = id;
    if (rest.startsWith(personnage + '-')) rest = rest.slice(personnage.length + 1);
    // retire suffixe -chapitre-... ou -N final
    let book = rest.replace(/-chapitre-.*$/i, '').replace(/-\d+$/, '');
    // si pattern ...-chapitre-N-...
    const m = rest.match(/^(.*?)-chapitre[-_]/i);
    if (m) book = m[1];
    if (!book) book = rest.split('-').slice(0, 4).join('-') || rest;
    if (!books[book]) books[book] = { slug: book, passages: 0, examples: [] };
    books[book].passages++;
    if (books[book].examples.length < 3) books[book].examples.push(id);
  }

  const livres = Object.values(books).sort((a, b) => b.passages - a.passages);
  return json({
    success: true,
    personnage,
    total: ids.length,
    livres,
    message: totalMessage(personnage, ids.length, livres.length)
  });
}

function totalMessage(personnage, total, nLivres) {
  return 'Cerveau « ' + personnage + ' » : ' + total + ' passage(s), ' + nLivres + ' livre(s) détecté(s).';
}


async function handleClearBrain(request, env) {
  if (!await requireAdmin(request, env)) return json({ error: 'Non autorisé.' }, 401);
  const { personnage } = await request.json();
  if (!personnage) return json({ error: 'personnage requis.' }, 400);
  const prefix = 'brain_id:' + personnage + ':';
  const ids = [], kvKeys = [];
  let cursor;
  do {
    const list = await env.CASHFLOW_KV.list({ prefix, cursor });
    for (const k of list.keys) { kvKeys.push(k.name); ids.push(k.name.slice(prefix.length)); }
    cursor = list.list_complete ? null : list.cursor;
  } while (cursor);
  let deleted = 0;
  for (let i = 0; i < ids.length; i += 500) {
    const batch = ids.slice(i, i + 500);
    try { await env.VECTORIZE_INDEX.deleteByIds(batch); deleted += batch.length; } catch (e) {}
  }
  for (const key of kvKeys) { try { await env.CASHFLOW_KV.delete(key); } catch (e) {} }
  // Supprimer aussi les textes complets stockés en KV
  let cursor2;
  const textPrefix = 'brain_text:' + personnage + ':';
  do {
    const list2 = await env.CASHFLOW_KV.list({ prefix: textPrefix, cursor: cursor2 });
    for (const k of list2.keys) { try { await env.CASHFLOW_KV.delete(k.name); } catch (e) {} }
    cursor2 = list2.list_complete ? null : list2.cursor;
  } while (cursor2);
  return json({ success: true, deleted, message: `Cerveau « ${personnage} » vidé (${deleted} passages).` });
}

async function handleIngestBook(request, env) {
  // Sécurité : seul un admin avec le bon token peut ingérer
  if (!await requireAdmin(request, env)) return json({ error: 'Non autorisé.' }, 401);
  
  const { id, texte, source, personnage } = await request.json();
  if (!id || !texte || !personnage) return json({ error: 'id, texte et personnage requis.' }, 400);

  // Texte complet en KV (Vectorize metadata max ~10 Ko)
  const fullText = String(texte);
  await env.CASHFLOW_KV.put('brain_text:' + personnage + ':' + id, fullText);
  await env.CASHFLOW_KV.put('brain_id:' + personnage + ':' + id, '1');

  // Embedding : tronquer si énorme (sécurité modèle)
  const embedText = fullText.length > 8000 ? fullText.slice(0, 8000) : fullText;
  const embeddings = await env.AI.run('@cf/baai/bge-m3', {
    text: [embedText]
  });

  // Metadata compacte uniquement (limite Vectorize 10240 bytes)
  const preview = fullText.length > 1500 ? fullText.slice(0, 1500) + '…' : fullText;
  const metaSource = String(source || 'inconnu').slice(0, 200);

  await env.VECTORIZE_INDEX.upsert([{
    id: id,
    values: embeddings.data[0],
    namespace: personnage,
    metadata: {
      texte_original: preview,
      source: metaSource,
      cible: personnage,
      has_full: fullText.length > 1500 ? '1' : '0'
    }
  }]);

  return json({ success: true, message: `Passage ${id} ingéré pour ${personnage}.` });
}

async function handleTTSNyxia(request, env) {
  const { token, text, agent } = await request.json();
  const session = await getSessionOrNull(token, env);
  if (!session) return json({ error: 'Session expirée.' }, 401);
  if (String(agent || '').toLowerCase() === 'eric') {
    const blocked = await requireEricAccess(env, session);
    if (blocked) return blocked;
  }
  if (!text) return json({ error: 'Texte requis.' }, 400);

  // Nettoyage défensif : retire tout caractère Unicode "brisé" (moitié d'emoji orpheline)
  const sanitized = text.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '');
  const cleanText = Array.from(sanitized).slice(0, 4500).join('');

  // ── Voie 0 : ElevenLabs (priorité absolue si configuré — normalement NyXia) ──
  const elevenLabsVoiceIdKey = AGENT_ELEVENLABS_VOICE_ID_KEYS[agent];
  const elevenLabsVoiceId = (elevenLabsVoiceIdKey ? env[elevenLabsVoiceIdKey] : null) || ELEVENLABS_VOICE_ID_DEFAULTS[agent] || null;

  if (elevenLabsVoiceId) {
    const cacheKey = 'tts_cache_elevenlabs:' + agent + ':' + (await sha256Hex(cleanText));
    const cachedBuf = await env.CASHFLOW_KV.get(cacheKey, 'arrayBuffer');
    if (cachedBuf) {
      return json({
        success: true,
        proxyUrl: '/api/tts/cached-audio?key=' + encodeURIComponent(cacheKey) + '&token=' + encodeURIComponent(token),
        cached: true
      });
    }

    const elBodyBytes = new TextEncoder().encode(JSON.stringify({
      text: cleanText,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 }
    }));

    const resp = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + elevenLabsVoiceId, {
      method: 'POST',
      headers: { 'xi-api-key': env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
      body: elBodyBytes
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return json({ error: 'Erreur ElevenLabs (' + resp.status + ') : ' + errText.slice(0, 300) }, 502);
    }

    const audioBuf = await resp.arrayBuffer();
    await env.CASHFLOW_KV.put(cacheKey, audioBuf, { expirationTtl: 60 * 60 * 24 * 30 });

    return json({
      success: true,
      proxyUrl: '/api/tts/cached-audio?key=' + encodeURIComponent(cacheKey) + '&token=' + encodeURIComponent(token)
    });
  }

  const voiceIdKey = AGENT_VOICE_ID_KEYS[agent];
  const heygenVoiceId = voiceIdKey ? env[voiceIdKey] : null;

  // ── Voie 1 : HeyGen (en réserve — seulement si ElevenLabs n'est pas configuré) ──
  if (heygenVoiceId) {
    const cacheKey = 'tts_cache:' + agent + ':' + (await sha256Hex(cleanText));
    const cachedUrl = await env.CASHFLOW_KV.get(cacheKey);
    if (cachedUrl) {
      return json({ success: true, proxyUrl: mediaProxyUrl(cachedUrl, token), cached: true });
    }

    const bodyBytes = new TextEncoder().encode(JSON.stringify({ text: cleanText, voice_id: heygenVoiceId }));
    const resp = await fetch('https://api.heygen.com/v3/voices/speech', {
      method: 'POST',
      headers: { 'X-Api-Key': env.HeyGen_KEY, 'Content-Type': 'application/json' },
      body: bodyBytes
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return json({ error: 'Erreur HeyGen (' + resp.status + ') : ' + errText.slice(0, 300) }, 502);
    }
    const data = await resp.json();
    if (data.error) return json({ error: 'HeyGen : ' + data.error }, 502);

    const audioUrl = data.data && data.data.audio_url;
    if (!audioUrl) return json({ error: 'Aucun audio généré.' }, 502);

    await env.CASHFLOW_KV.put(cacheKey, audioUrl, { expirationTtl: 60 * 60 * 24 * 30 });
    return json({ success: true, proxyUrl: mediaProxyUrl(audioUrl, token) });
  }

  // ── Voie 2 : OpenAI (voix distinctes, moins chères, sans clonage) ──
  const openaiVoice = OPENAI_VOICE_MAP[agent];
  if (openaiVoice) {
    const openaiKey = env.OpenAI_KEY || env.OpenAi_KEY || env.OPENAI_API_KEY || '';
    if (!openaiKey) {
      return json({ error: 'Clé OpenAI absente. Secret attendu : OpenAI_KEY (ou OpenAi_KEY).' }, 500);
    }
    const cacheKey = 'tts_cache_openai:' + agent + ':' + openaiVoice + ':' + (await sha256Hex(cleanText));
    const cachedBuf = await env.CASHFLOW_KV.get(cacheKey, 'arrayBuffer');
    if (cachedBuf) {
      return json({
        success: true,
        proxyUrl: '/api/tts/cached-audio?key=' + encodeURIComponent(cacheKey) + '&token=' + encodeURIComponent(token),
        cached: true
      });
    }

    const openaiBodyBytes = new TextEncoder().encode(JSON.stringify({ model: 'tts-1', voice: openaiVoice, input: cleanText, response_format: 'mp3' }));
    const resp = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + openaiKey, 'Content-Type': 'application/json' },
      body: openaiBodyBytes
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return json({ error: 'Erreur OpenAI (' + resp.status + ') : ' + errText.slice(0, 300) }, 502);
    }

    const audioBuf = await resp.arrayBuffer();
    await env.CASHFLOW_KV.put(cacheKey, audioBuf, { expirationTtl: 60 * 60 * 24 * 30 });

    return json({
      success: true,
      proxyUrl: '/api/tts/cached-audio?key=' + encodeURIComponent(cacheKey) + '&token=' + encodeURIComponent(token)
    });
  }

  return json({ error: 'Aucune voix configurée pour cet agent.' }, 404);
}

// Sert un audio déjà généré et mis en cache (OpenAI) — jamais le domaine OpenAI exposé.
async function handleTTSCachedAudio(request, env, url) {
  const token = url.searchParams.get('token');
  const session = await getSessionOrNull(token, env);
  if (!session) return new Response('Non autorisé', { status: 401 });

  const key = url.searchParams.get('key');
  if (!key || (!key.startsWith('tts_cache_openai:') && !key.startsWith('tts_cache_elevenlabs:'))) return new Response('Requête invalide', { status: 400 });

  const audio = await env.CASHFLOW_KV.get(key, 'arrayBuffer');
  if (!audio) return new Response('Audio introuvable', { status: 404 });

  return new Response(audio, { status: 200, headers: { 'Content-Type': 'audio/mpeg' } });
}

    try { await env.DB.prepare(`ALTER TABLE marketplace_products ADD COLUMN price_monthly REAL DEFAULT 0`).run(); } catch (_) {}
    try { await env.DB.prepare(`ALTER TABLE marketplace_products ADD COLUMN billing_type TEXT DEFAULT 'one_time'`).run(); } catch (_) {}
