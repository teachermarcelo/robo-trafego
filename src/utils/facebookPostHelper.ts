// Shared helpers for copying Facebook posts with embedded Landing Page images
// (both OpenGraph Clickable Card links and direct PNG image attachment for Ctrl+V)

export function getDisplayDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./i, '').toUpperCase();
  } catch {
    if (typeof window !== 'undefined' && window.location?.hostname) {
      return window.location.hostname.replace(/^www\./i, '').toUpperCase();
    }
    return 'ROBO-TRAFEGO.VERCEL.APP';
  }
}

export function resolveCampaignVisualImage(imageUrl?: string, campaignId?: string): string {
  const clean = String(imageUrl || '').trim();
  if (clean) return clean;
  if (campaignId === 'camp-ecom-club') return '/assets/aistudio/image_91befd52.png';
  return '/assets/aistudio/image_e9e67204.png';
}

export function stripRobotMentionsFromPost(text: string): string {
  return String(text || '')
    .replace(/\bAutoViral\s*AI\b/gi, '')
    .replace(/\b(rob[ôo]\s+de\s+vendas|rob[ôo]\s+org[âa]nico|rob[ôo]|autoviral)\b/gi, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function ensureLandingUrlInPost(params: {
  headline?: string;
  body: string;
  landingUrl: string;
  ctaLabel?: string;
  priceText?: string;
  stripExistingExternalLinks?: boolean;
}): string {
  const headline = stripRobotMentionsFromPost(params.headline || '');
  let body = stripRobotMentionsFromPost(params.body || '');
  const landingUrl = String(params.landingUrl || '').trim();

  if (params.stripExistingExternalLinks && landingUrl) {
    body = body.replace(/https?:\/\/[^\s<>"']+/gi, landingUrl);
  }

  const hasLandingUrl = landingUrl && body.includes(landingUrl);
  const fullCombined = headline ? `${headline}\n\n${body}` : body;

  if (!landingUrl || hasLandingUrl || fullCombined.includes(landingUrl)) {
    return `${fullCombined.trim()} `;
  }

  const cta = params.ctaLabel || 'Quem quiser dar uma olhada no conteúdo completo e garantir o acesso';
  const priceNote = params.priceText ? ` (${params.priceText})` : '';
  return `${fullCombined.trim()}\n\n👉 ${cta}${priceNote}:\n${landingUrl} `;
}

export function buildFirstCommentWithLink(params: {
  landingUrl: string;
  title?: string;
  priceText?: string;
  lang?: 'pt' | 'es' | 'en';
}): string {
  const url = String(params.landingUrl || '').trim();
  const cleanTitle = stripRobotMentionsFromPost(params.title || '');
  const pricePart = params.priceText ? ` (${params.priceText})` : '';
  const titlePart = cleanTitle ? ` — ${cleanTitle}` : '';
  if (params.lang === 'es') {
    return `👇 Aquí tienes el enlace oficial${titlePart}${pricePart} para ver todos los detalles y acceder ahora:\n${url} `;
  }
  if (params.lang === 'en') {
    return `👇 Here is the official link${titlePart}${pricePart} for instant access:\n${url} `;
  }
  return `👇 Aqui está o link oficial${titlePart}${pricePart} para acessar agora com segurança:\n${url} `;
}

export const ANTI_SPAM_OPENERS_PT = [
  '💡 Dica rápida para quem está precisando disso hoje:',
  '✨ Passei aqui para compartilhar um achado que economiza muito tempo:',
  '📌 Salvando a rotina de quem buscava um material completo e organizado:',
  '🔥 Para quem perguntou nos comentários sobre material pronto:',
  '✅ Compartilhando com vocês o acesso direto que está ajudando muita gente:',
];

export const ANTI_SPAM_OPENERS_ES = [
  '💡 Consejo rápido para quienes están buscando esto hoy:',
  '✨ Comparto este recurso práctico que ahorra muchísimo tiempo:',
  '📌 Guardado especial para quien buscaba una guía clara y completa:',
  '🔥 Para quienes preguntaron en el grupo por el acceso oficial:',
  '✅ Compartiendo el enlace directo que está ayudando a muchas personas:',
];

export const ANTI_SPAM_OPENERS_EN = [
  '💡 Quick tip for everyone looking for this today:',
  '✨ Sharing something practical that saves hours of work:',
  '📌 Must-see resource if you want faster results right away:',
  '🔥 For everyone asking in the group for the official link:',
  '✅ Sharing direct access that has been helping a lot of people:',
];

export function applySpinVariation(
  headline: string,
  spinIndex: number,
  lang: 'pt' | 'es' | 'en' = 'pt'
): string {
  const list =
    lang === 'es'
      ? ANTI_SPAM_OPENERS_ES
      : lang === 'en'
      ? ANTI_SPAM_OPENERS_EN
      : ANTI_SPAM_OPENERS_PT;
  const opener = list[Math.abs(spinIndex) % list.length];
  const cleanHead = stripRobotMentionsFromPost(headline || '');
  if (!cleanHead) return opener;
  // Replace previous opener if it already starts with one of the spin prefixes
  for (const prefix of [...ANTI_SPAM_OPENERS_PT, ...ANTI_SPAM_OPENERS_ES, ...ANTI_SPAM_OPENERS_EN]) {
    if (cleanHead.startsWith(prefix)) {
      const rest = cleanHead.slice(prefix.length).trim();
      return rest ? `${opener} ${rest}` : opener;
    }
  }
  return `${opener} ${cleanHead}`;
}

export async function copyImageToClipboardOrDownload(
  imageUrl: string,
  filenameBase = 'landing-imagem-facebook'
): Promise<'clipboard' | 'downloaded' | 'none'> {
  const targetUrl = String(imageUrl || '').trim();
  if (!targetUrl) return 'none';

  try {
    const img = new Image();
    if (!targetUrl.startsWith('data:') && !targetUrl.startsWith('/')) {
      img.crossOrigin = 'anonymous';
    }
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('img_load_failed'));
      img.src = targetUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || 1200;
    canvas.height = img.naturalHeight || 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no_ctx');
    ctx.drawImage(img, 0, 0);

    const pngBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (pngBlob && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
      return 'clipboard';
    }
  } catch {
    // fallback to direct download below
  }

  try {
    const link = document.createElement('a');
    link.href = targetUrl;
    link.download = `${filenameBase}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return 'downloaded';
  } catch {
    return 'none';
  }
}

const extensionImageDataUrlCache = new Map<string, string>();

export async function resolveImageUrlToDataUrlForExtension(rawUrl: string): Promise<string> {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:image/')) return trimmed;
  if (extensionImageDataUrlCache.has(trimmed)) {
    return extensionImageDataUrlCache.get(trimmed) || '';
  }

  const absoluteUrl =
    trimmed.startsWith('/') && typeof window !== 'undefined'
      ? `${window.location.origin}${trimmed}`
      : trimmed;

  try {
    const resp = await fetch(absoluteUrl);
    if (resp.ok) {
      const blob = await resp.blob();
      if (blob.type.startsWith('image/')) {
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () => resolve('');
          reader.readAsDataURL(blob);
        });
        if (dataUrl.startsWith('data:image/')) {
          extensionImageDataUrlCache.set(trimmed, dataUrl);
          return dataUrl;
        }
      }
    }
  } catch {}

  if (/^https?:\/\//i.test(absoluteUrl)) {
    try {
      const proxyResp = await fetch(`/api/proxy/image-base64?url=${encodeURIComponent(absoluteUrl)}`);
      if (proxyResp.ok) {
        const payload = await proxyResp.json();
        if (payload?.ok && typeof payload.dataUrl === 'string' && payload.dataUrl.startsWith('data:image/')) {
          extensionImageDataUrlCache.set(trimmed, payload.dataUrl);
          return payload.dataUrl;
        }
      }
    } catch {}
  }

  return absoluteUrl;
}

