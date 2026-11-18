// Vercel Serverless Function: /api/og-image
// Resolves campaign base64/dataURL images into binary HTTP responses for Facebook OpenGraph cards

export default async function handler(req, res) {
  const rawId = String(req.query.id || '').trim();
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'robo-trafego.vercel.app');
  const origin = `${proto}://${host}`;

  let imageRef = '';

  // 1. Check Supabase
  const supaUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const supaKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  if (rawId && supaUrl && supaKey) {
    try {
      const resp = await fetch(
        `${supaUrl}/rest/v1/autoviral_campaigns?id=eq.${encodeURIComponent(rawId)}&select=image_url,data`,
        { headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}` } }
      );
      if (resp.ok) {
        const rows = await resp.json();
        if (Array.isArray(rows) && rows[0]) {
          imageRef = rows[0].image_url || rows[0].data?.imageUrl || '';
        }
      }
    } catch {}
  }

  // 2. Check Firestore REST fallback
  if (!imageRef && rawId) {
    try {
      const projectId = 'gen-lang-client-0776430449';
      const dbId = 'ai-studio-autoviralairobde-9551e851-4450-4016-b099-a8b28b1ace5d';
      const resp = await fetch(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/autoviral_campaigns/${encodeURIComponent(rawId)}`
      );
      if (resp.ok) {
        const doc = await resp.json();
        imageRef = doc?.fields?.imageUrl?.stringValue || '';
      }
    } catch {}
  }

  if (imageRef.startsWith('data:image/')) {
    const match = imageRef.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/);
    if (match) {
      const mime = match[1];
      const buf = Buffer.from(match[2], 'base64');
      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Length', buf.length);
      res.setHeader('Cache-Control', 'public, max-age=300');
      return res.status(200).send(buf);
    }
  }

  if (/^https?:\/\//i.test(imageRef)) {
    return res.redirect(302, imageRef);
  }

  if (imageRef.startsWith('/')) {
    return res.redirect(302, `${origin}${imageRef}`);
  }

  return res.redirect(302, `${origin}/assets/aistudio/image_e9e67204.png`);
}
