// ============================================================
// NyXia — Les Cercles (jumelé Marketplace / même D1)
// Reprend le modèle Affiliation Pro (auth + dashboard + produits)
// ============================================================

const SESSION_TTL = 60 * 60 * 24 * 7;
const COOKIE_NAME = 'nyxia_cercle';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function randomToken() {
  return crypto.randomUUID() + crypto.randomUUID();
}

function generateId() {
  return crypto.randomUUID();
}

// === Auth identique à Affiliation Pro (src/lib/auth.ts) ===
async function hashPassword(password) {
  const salt = crypto.randomUUID().replace(/-/g, '');
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashHex = [...new Uint8Array(hashBuffer)].map(b => b.toString(16).padStart(2, '0')).join('');
  return `$sha256$${salt}$${hashHex}`;
}

async function verifyPassword(password, storedHash) {
  try {
    if (!storedHash || typeof storedHash !== 'string') return false;
    // Format Affiliation Pro
    const parts = storedHash.split('$');
    if (parts.length === 4 && parts[1] === 'sha256') {
      const salt = parts[2];
      const encoder = new TextEncoder();
      const data = encoder.encode(salt + password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashHex = [...new Uint8Array(hashBuffer)].map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex === parts[3];
    }
    // Compat comptes créés par erreur en salt:hash PBKDF2 (Univers early)
    if (storedHash.includes(':') && !storedHash.startsWith('$')) {
      const [salt, hash] = storedHash.split(':');
      const enc = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
      const bits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' },
        keyMaterial, 256
      );
      const computed = [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, '0')).join('');
      return computed === hash;
    }
    return false;
  } catch {
    return false;
  }
}

function buildCookie(token, maxAge, requestUrl) {
  const parts = [COOKIE_NAME + '=' + token, 'Path=/', 'Max-Age=' + maxAge, 'HttpOnly', 'Secure', 'SameSite=Lax'];
  try {
    const host = new URL(requestUrl).hostname;
    if (host === 'nyxia.top' || host.endsWith('.nyxia.top')) parts.push('Domain=.nyxia.top');
  } catch (_) {}
  return parts.join('; ');
}

function clearCookie(requestUrl) {
  let domain = '';
  try {
    const host = new URL(requestUrl).hostname;
    if (host === 'nyxia.top' || host.endsWith('.nyxia.top')) domain = '; Domain=.nyxia.top';
  } catch (_) {}
  return COOKIE_NAME + '=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax' + domain;
}

function getToken(request) {
  const h = request.headers.get('X-Cercle-Token');
  if (h) return h;
  const c = request.headers.get('Cookie') || '';
  const m = c.match(/(?:^|;\s*)nyxia_cercle=([^;]+)/);
  return m ? m[1] : null;
}

async function getSession(request, env) {
  const token = getToken(request);
  if (!token) return null;
  const raw = await env.CASHFLOW_KV.get('cercles:session:' + token);
  if (!raw) return null;
  return { token, ...JSON.parse(raw) };
}

async function handleLogin(request, env) {
  const { email, password } = await request.json();
  if (!email || !password) return json({ error: 'Courriel et mot de passe requis.' }, 400);

  const user = await env.DB.prepare(
    `SELECT id, email, password_hash, full_name, role, affiliate_code, parent_id, status, created_at
     FROM users WHERE email = ?`
  ).bind(email.toLowerCase().trim()).first();

  if (!user) return json({ error: 'Identifiants incorrects.' }, 401);
  if (user.status === 'suspended') {
    return json({ error: 'Ce compte est désactivé. Contacte l’équipe pour le réactiver.' }, 403);
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return json({ error: 'Identifiants incorrects.' }, 401);

  const token = randomToken();
  const firstName = (user.full_name || '').trim().split(/\s+/)[0] || '';
  await env.CASHFLOW_KV.put(
    'cercles:session:' + token,
    JSON.stringify({
      userId: user.id,
      email: user.email,
      firstName,
      role: user.role,
      affiliateCode: user.affiliate_code
    }),
    { expirationTtl: SESSION_TTL }
  );

  try {
    await env.DB.prepare(`UPDATE users SET updated_at = datetime('now') WHERE id = ?`).bind(user.id).run();
  } catch (_) {}

  const res = json({
    success: true,
    token,
    firstName,
    affiliateCode: user.affiliate_code,
    role: user.role
  });
  res.headers.append('Set-Cookie', buildCookie(token, SESSION_TTL, request.url));
  return res;
}

async function handleLogout(request, env) {
  const token = getToken(request);
  if (token) await env.CASHFLOW_KV.delete('cercles:session:' + token);
  const res = json({ success: true });
  res.headers.append('Set-Cookie', clearCookie(request.url));
  return res;
}

async function handleCheckAuth(request, env) {
  const session = await getSession(request, env);
  if (!session) return json({ valid: false });
  return json({
    valid: true,
    email: session.email,
    firstName: session.firstName,
    role: session.role,
    affiliateCode: session.affiliateCode
  });
}

// Dashboard = même données que Affiliation Pro /api/dashboard
async function handleDashboard(request, env) {
  const session = await getSession(request, env);
  if (!session) return json({ error: 'Session expirée.' }, 401);

  const userId = session.userId;

  const user = await env.DB.prepare(
    `SELECT id, email, full_name, role, affiliate_code, parent_id, paypal_email, created_at
     FROM users WHERE id = ?`
  ).bind(userId).first();
  if (!user) return json({ error: 'Profil introuvable.' }, 404);

  const firstName = (user.full_name || '').trim().split(/\s+/)[0] || session.firstName || '';

  const affiliate = await env.DB.prepare(
    `SELECT id, affiliate_link, parent_affiliate_id, grandparent_affiliate_id,
            total_earnings, total_referrals, status, created_at, program_id
     FROM affiliates WHERE user_id = ? LIMIT 1`
  ).bind(userId).first();

  // Cercle direct / 2e / 3e via parent_id
  const l1 = await env.DB.prepare(
    `SELECT id, email, full_name, affiliate_code, created_at FROM users WHERE parent_id = ? ORDER BY created_at DESC`
  ).bind(userId).all();
  const l1Rows = l1.results || [];
  const l1Ids = l1Rows.map(r => r.id);

  let l2Rows = [];
  if (l1Ids.length) {
    const ph = l1Ids.map(() => '?').join(',');
    const l2 = await env.DB.prepare(
      `SELECT id, email, full_name, affiliate_code, parent_id, created_at FROM users WHERE parent_id IN (${ph}) ORDER BY created_at DESC`
    ).bind(...l1Ids).all();
    l2Rows = l2.results || [];
  }
  const l2Ids = l2Rows.map(r => r.id);
  let l3Rows = [];
  if (l2Ids.length) {
    const ph = l2Ids.map(() => '?').join(',');
    const l3 = await env.DB.prepare(
      `SELECT id, email, full_name, affiliate_code, parent_id, created_at FROM users WHERE parent_id IN (${ph}) ORDER BY created_at DESC`
    ).bind(...l2Ids).all();
    l3Rows = l3.results || [];
  }

  // Stats ventes / ce qui revient (comme Affil Pro)
  let totalEarnings = affiliate ? Number(affiliate.total_earnings || 0) : 0;
  let pendingTotal = 0;
  let totalClicks = 0;
  let recentSales = [];
  if (affiliate) {
    try {
      const pending = await env.DB.prepare(
        `SELECT COALESCE(SUM(amount),0) as total FROM commissions WHERE affiliate_id = ? AND status = 'pending'`
      ).bind(affiliate.id).first();
      pendingTotal = Number(pending?.total || 0);
    } catch (_) {}
    try {
      const clicks = await env.DB.prepare(
        `SELECT COUNT(*) as total FROM clicks WHERE affiliate_id = ?`
      ).bind(affiliate.id).first();
      totalClicks = Number(clicks?.total || 0);
    } catch (_) {}
    try {
      const sales = await env.DB.prepare(
        `SELECT id, amount, status, created_at, commission_l1, customer_email
         FROM sales WHERE affiliate_id = ? ORDER BY created_at DESC LIMIT 10`
      ).bind(affiliate.id).all();
      recentSales = sales.results || [];
    } catch (_) {}
  }

  // Messages
  let messages = [];
  try {
    const msg = await env.DB.prepare(
      `SELECT id, subject, content, read_at, created_at, sender_id
       FROM messages WHERE recipient_id = ? OR is_broadcast = 1
       ORDER BY created_at DESC LIMIT 30`
    ).bind(userId).all();
    messages = msg.results || [];
  } catch (_) {}

  // Produits Marketplace actifs (lien jumelé — comme Affil Pro)
  let products = [];
  try {
    const mp = await env.DB.prepare(
      `SELECT p.id, p.title, p.description_short, p.price, p.commission_n1, p.commission_n2, p.commission_n3,
              p.affiliate_link, p.image_url, p.status, c.name as category_name
       FROM marketplace_products p
       LEFT JOIN marketplace_categories c ON p.category_id = c.id
       WHERE p.status = 'active'
       ORDER BY p.created_at DESC LIMIT 50`
    ).all();
    products = mp.results || [];
  } catch (_) {}

  const siteUrl = env.SITE_URL || 'https://cercle.nyxia.top';
  const shareLink = user.affiliate_code
    ? (affiliate && affiliate.affiliate_link ? affiliate.affiliate_link : `${siteUrl}/r/${user.affiliate_code}`)
    : null;

  function mapMember(row) {
    return {
      id: row.id,
      prenom: (row.full_name || '').trim().split(/\s+/)[0] || '—',
      code: row.affiliate_code,
      depuis: row.created_at
    };
  }

  // Produits exposés sans jargon technique en labels UI (montants bruts restent pour le calcul)
  const produits = products.map(p => ({
    id: p.id,
    titre: p.title,
    description: p.description_short,
    prix: p.price,
    lien: p.affiliate_link,
    image: p.image_url,
    categorie: p.category_name,
    // niveaux techniques conservés en coulisses pour construction des liens membre
    _n1: p.commission_n1,
    _n2: p.commission_n2,
    _n3: p.commission_n3
  }));

  return json({
    profil: {
      prenom: firstName,
      email: user.email,
      code: user.affiliate_code,
      role: user.role,
      paypal: user.paypal_email || '',
      depuis: user.created_at
    },
    lienPartage: shareLink,
    cercle: {
      direct: l1Rows.map(mapMember),
      deuxieme: l2Rows.map(mapMember),
      troisieme: l3Rows.map(mapMember),
      totaux: {
        direct: l1Rows.length,
        deuxieme: l2Rows.length,
        troisieme: l3Rows.length
      }
    },
    bilan: {
      total: totalEarnings,
      enAttente: pendingTotal,
      partages: affiliate ? Number(affiliate.total_referrals || 0) : 0,
      clics: totalClicks,
      recent: recentSales
    },
    messages,
    produits
  });
}


async function handleUpdatePaypal(request, env) {
  const session = await getSession(request, env);
  if (!session) return json({ error: 'Session expirée.' }, 401);
  const body = await request.json();
  await env.DB.prepare('UPDATE users SET paypal_email = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .bind((body.paypal || '').trim() || null, session.userId).run();
  return json({ success: true });
}

async function handleAdminCreateProduct(request, env) {
  const session = await getSession(request, env);
  if (!session) return json({ error: 'Session expirée.' }, 401);
  if (session.role !== 'admin' && session.role !== 'super_admin') {
    return json({ error: 'Réservé aux Admin commerçants.' }, 403);
  }
  const body = await request.json();
  const title = (body.title || '').trim();
  if (!title) return json({ error: 'Titre requis.' }, 400);
  let cat = await env.DB.prepare('SELECT id FROM marketplace_categories WHERE active = 1 LIMIT 1').first();
  if (!cat) {
    await env.DB.prepare("INSERT INTO marketplace_categories (name, slug, icon, sort_order, active, created_at) VALUES ('Général', 'general', '✨', 0, 1, datetime('now'))").run();
    cat = await env.DB.prepare('SELECT id FROM marketplace_categories ORDER BY id DESC LIMIT 1').first();
  }
  const prog = await env.DB.prepare('SELECT commission_l1, commission_l2, commission_l3 FROM programs WHERE is_active = 1 LIMIT 1').first();
  const n1 = body.n1 != null ? Number(body.n1) : (prog ? Number(prog.commission_l1) : 25);
  const n2 = body.n2 != null ? Number(body.n2) : (prog ? Number(prog.commission_l2) : 10);
  const n3 = body.n3 != null ? Number(body.n3) : (prog ? Number(prog.commission_l3) : 5);
  const id = generateId();
  await env.DB.prepare(
    'INSERT INTO marketplace_products (id, seller_id, category_id, title, description_short, description_long, image_url, price, commission_n1, commission_n2, commission_n3, affiliate_link, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, \'active\', datetime(\'now\'), datetime(\'now\'))'
  ).bind(id, session.userId, cat.id, title, (body.description || '').trim(), (body.descriptionLong || '').trim() || null, (body.imageUrl || '').trim() || null, Number(body.price) || 0, n1, n2, n3, (body.affiliateLink || '').trim() || null).run();
  return json({ success: true, id });
}

async function handleAdminListMyProducts(request, env) {
  const session = await getSession(request, env);
  if (!session) return json({ error: 'Session expirée.' }, 401);
  if (session.role !== 'admin' && session.role !== 'super_admin') return json({ error: 'Accès refusé.' }, 403);
  const rows = await env.DB.prepare('SELECT * FROM marketplace_products WHERE seller_id = ? ORDER BY created_at DESC').bind(session.userId).all();
  return json({ products: rows.results || [] });
}

async function handlePublicMarketplace(request, env) {
  const rows = await env.DB.prepare(
    "SELECT p.id, p.title, p.description_short, p.price, p.image_url, p.affiliate_link, p.commission_n1, p.commission_n2, p.commission_n3, c.name as category_name, u.full_name as seller_name FROM marketplace_products p LEFT JOIN marketplace_categories c ON p.category_id = c.id LEFT JOIN users u ON p.seller_id = u.id WHERE p.status = 'active' ORDER BY p.featured DESC, p.created_at DESC LIMIT 100"
  ).all();
  return json({ products: rows.results || [] });
}


export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === '/api/login' && request.method === 'POST') return await handleLogin(request, env);
      if (path === '/api/logout' && request.method === 'POST') return await handleLogout(request, env);
      if (path === '/api/check-auth' && request.method === 'POST') return await handleCheckAuth(request, env);
      if (path === '/api/dashboard' && request.method === 'POST') return await handleDashboard(request, env);
      if (path === '/api/paypal' && request.method === 'POST') return await handleUpdatePaypal(request, env);
      if (path === '/api/admin/products' && request.method === 'GET') return await handleAdminListMyProducts(request, env);
      if (path === '/api/admin/products' && request.method === 'POST') return await handleAdminCreateProduct(request, env);
      if (path === '/api/public/marketplace' && request.method === 'GET') return await handlePublicMarketplace(request, env);

      if (path.startsWith('/r/')) {
        return Response.redirect(url.origin + '/login.html?ref=' + encodeURIComponent(path.slice(3)), 302);
      }
    } catch (e) {
      console.error('Cercles error', e);
      return json({ error: 'Erreur serveur.', detail: String(e && e.message ? e.message : e) }, 500);
    }

    if (env.ASSETS) {
      if (path === '/' || path === '') {
        return env.ASSETS.fetch(new URL('/login.html', request.url));
      }
      return env.ASSETS.fetch(request);
    }
    return new Response('Not found', { status: 404 });
  }
};
