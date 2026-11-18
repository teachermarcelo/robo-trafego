// Vercel Serverless Function: /api/og
// Serves dynamic OpenGraph metadata (og:image, og:title, og:description) for Facebook / WhatsApp crawlers
// so EVERY Landing Page link renders ONLY the product (ZERO mention of AutoViral/Robô) as a Clickable Image Card!

const FALLBACK_CAMPAIGNS = [
  {
    id: 'camp-tarefinhas-autismo',
    title: '+ 100 Tarefinhas Educação Infantil e Criança Autista',
    headline: 'Caderno Digital com + 100 Atividades em PDF Prontas para Imprimir',
    subheadline: 'Atividades lúdicas para estimular coordenação motora, linguagem, foco e cognição infantil.',
    imageUrl: '/assets/aistudio/image_e9e67204.png',
  },
  {
    id: 'camp-milhas-3',
    title: 'Comunidade Milhas 3.0',
    headline: 'Comunidade Milhas 3.0 — Guia Prático de Pontos e Benefícios',
    subheadline: 'Aprenda passo a passo como aproveitar pontos e compras bonificadas no dia a dia.',
    imageUrl: '/assets/aistudio/image_e9e67204.png',
  },
  {
    id: 'camp-ecom-club',
    title: 'Ecom Club — Loja Profissional Pronta',
    headline: 'Loja Nichada Pronta com Produtos Validados e Fornecedores',
    subheadline: 'Estrutura completa pronta para começar com catálogo validado e passo a passo.',
    imageUrl: '/assets/aistudio/image_91befd52.png',
  },
];

function sanitizePublicMetaText(str) {
  return String(str || '')
    .replace(/AutoViral\s*AI(\s*-\s*)?/gi, '')
    .replace(/Rob[ôo]\s+de\s+Vendas\s*&?\s*Tr[áa]fego\s+Org[âa]nico\s+Aut[ôo]nomo/gi, '')
    .replace(/\b(rob[ôo]|autoviral|bot\s+de\s+vendas|tr[áa]fego\s+org[âa]nico\s+aut[ôo]nomo)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugToPrettyTitle(slug) {
  const clean = String(slug || '').trim();
  if (!clean) return 'Material Oficial — Acesso Imediato';
  const words = clean
    .replace(/[-_]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1));
  return words.join(' ') || 'Material Oficial — Acesso Imediato';
}

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function matchesCampaign(c, campId, slug) {
  if (!c) return false;
  if (campId && c.id === campId) return true;
  if (!slug) return false;
  const s = slug.toLowerCase().trim();
  const titleSlug = slugify(c.title);
  if (s === 'tarefinhas' && (c.id === 'camp-tarefinhas-autismo' || titleSlug.includes('tarefinha'))) return true;
  if (s === 'milhas' && (c.id === 'camp-milhas-3' || titleSlug.includes('milha'))) return true;
  if (s === 'ecom-club' && (c.id === 'camp-ecom-club' || titleSlug.includes('ecom'))) return true;
  if (s === 'kit-psico' && titleSlug.includes('psicopedagog')) return true;
  if (s === 'atividades' && titleSlug.includes('cognitiv')) return true;
  return titleSlug === s || titleSlug.startsWith(s) || String(c.id || '').replace(/^camp-/, '') === s;
}

async function fetchCampaignFromCloud(campId, slug) {
  const supaUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const supaKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  // 1. Try Supabase campaigns table if env keys configured
  if (supaUrl && supaKey) {
    try {
      const qUrl = campId
        ? `${supaUrl}/rest/v1/autoviral_campaigns?id=eq.${encodeURIComponent(campId)}&select=*`
        : `${supaUrl}/rest/v1/autoviral_campaigns?select=*&limit=40`;
      const resp = await fetch(qUrl, {
        headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}` },
      });
      if (resp.ok) {
        const rows = await resp.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const hit = rows.find((r) => matchesCampaign({
            id: r.id,
            title: r.title,
            headline: r.headline || r.data?.headline,
            subheadline: r.subheadline || r.data?.subheadline,
            imageUrl: r.image_url || r.imageUrl || r.data?.imageUrl,
          }, campId, slug));
          if (hit) {
            return {
              id: hit.id,
              title: hit.title || hit.data?.title || 'Material Oficial',
              headline: hit.headline || hit.data?.headline || hit.title,
              subheadline: hit.subheadline || hit.data?.subheadline || hit.data?.painPointTargeted || '',
              imageUrl: hit.image_url || hit.imageUrl || hit.data?.imageUrl || '',
            };
          }
        }
      }
    } catch {}
  }

  // 2. Try Firebase Firestore REST
  try {
    const projectId = 'gen-lang-client-0776430449';
    const dbId = 'ai-studio-autoviralairobde-9551e851-4450-4016-b099-a8b28b1ace5d';
    const fsUrl = campId
      ? `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/autoviral_campaigns/${encodeURIComponent(campId)}`
      : `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/autoviral_campaigns?pageSize=30`;
    const resp = await fetch(fsUrl);
    if (resp.ok) {
      const json = await resp.json();
      const docs = campId && json?.fields ? [json] : Array.isArray(json?.documents) ? json.documents : [];
      for (const d of docs) {
        const f = d.fields || {};
        const cand = {
          id: (d.name || '').split('/').pop() || f.id?.stringValue || '',
          title: f.title?.stringValue || '',
          headline: f.headline?.stringValue || f.title?.stringValue || '',
          subheadline: f.subheadline?.stringValue || f.painPointTargeted?.stringValue || '',
          imageUrl: f.imageUrl?.stringValue || '',
        };
        if (matchesCampaign(cand, campId, slug)) {
          return cand;
        }
      }
    }
  } catch {}

  const fallbackMatch = FALLBACK_CAMPAIGNS.find((c) => matchesCampaign(c, campId, slug));
  if (fallbackMatch) return fallbackMatch;

  // Clean product title derived directly from slug (?p=codigo-divino -> "Codigo Divino")
  if (slug) {
    const pretty = slugToPrettyTitle(slug);
    return {
      id: campId || `slug-${slug}`,
      title: pretty,
      headline: pretty,
      subheadline: `${pretty} — Confira todos os detalhes e o conteúdo completo disponível hoje.`,
      imageUrl: '/assets/aistudio/image_e9e67204.png',
    };
  }

  return FALLBACK_CAMPAIGNS[0];
}

export default async function handler(req, res) {
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'robo-trafego.vercel.app');
  const origin = `${proto}://${host}`;

  const campId = typeof req.query.camp === 'string' ? req.query.camp : '';
  const pSlug = typeof req.query.p === 'string' ? req.query.p : '';
  const slugParam = typeof req.query.slug === 'string' ? req.query.slug : pSlug;

  const ua = String(req.headers['user-agent'] || '');
  const isCrawler = /facebookexternalhit|Facebot|meta-externalagent|WhatsApp|Twitterbot|Pinterest|TelegramBot|Slackbot|LinkedInBot|Instagram|Discordbot|crawler|bot/i.test(ua);

  // If a human visitor hits /api/og directly, redirect to the real SPA Landing Page
  if (!isCrawler && req.query.preview !== 'og') {
    const dest = campId
      ? `/?camp=${encodeURIComponent(campId)}${slugParam ? `&p=${encodeURIComponent(slugParam)}` : ''}`
      : slugParam
      ? `/?p=${encodeURIComponent(slugParam)}`
      : '/';
    return res.redirect(302, dest);
  }

  const matched = await fetchCampaignFromCloud(campId, slugParam);
  const rawTitle = sanitizePublicMetaText(matched.headline || matched.title);
  const ogTitle = rawTitle || slugToPrettyTitle(slugParam) || 'Material Oficial — Acesso Imediato';
  const rawDesc = sanitizePublicMetaText(matched.subheadline || '');
  const ogDesc = rawDesc || `${ogTitle} — Confira os detalhes e acesse o material completo.`;

  let ogImage = `${origin}/api/og-image?id=${encodeURIComponent(matched.id)}`;
  const rawImg = String(matched.imageUrl || '').trim();
  if (/^https?:\/\//i.test(rawImg) && !rawImg.startsWith('data:')) {
    ogImage = rawImg;
  } else if (rawImg.startsWith('/')) {
    ogImage = `${origin}${rawImg}`;
  }

  const canonicalUrl = campId
    ? `${origin}/?camp=${encodeURIComponent(campId)}${slugParam ? `&p=${encodeURIComponent(slugParam)}` : ''}`
    : slugParam
    ? `${origin}/z/${encodeURIComponent(slugParam)}`
    : origin;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=120');

  return res.status(200).send(`<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(ogTitle)}</title>
    <meta name="description" content="${escapeHtml(ogDesc)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:title" content="${escapeHtml(ogTitle)}" />
    <meta property="og:description" content="${escapeHtml(ogDesc)}" />
    <meta property="og:image" content="${escapeHtml(ogImage)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(ogImage)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="800" />
    <meta property="og:image:alt" content="${escapeHtml(ogTitle)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(ogDesc)}" />
    <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
  </head>
  <body>
    <h1>${escapeHtml(ogTitle)}</h1>
    <p>${escapeHtml(ogDesc)}</p>
    <img src="${escapeHtml(ogImage)}" alt="${escapeHtml(ogTitle)}" />
  </body>
</html>`);
}
