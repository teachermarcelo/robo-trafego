// Vercel Serverless Function: /api/supabase-proxy
// Same-origin proxy to prevent browser extensions (AdBlock/Privacy Shields) or CORS from blocking *.supabase.co
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { targetUrl, method = 'GET', headers = {}, body } = req.body || {};
    if (!targetUrl || typeof targetUrl !== 'string') {
      return res.status(400).json({ error: 'Missing targetUrl' });
    }

    let parsed;
    try {
      parsed = new URL(targetUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid targetUrl' });
    }

    // Strict SSRF allowlist: only Supabase REST/Auth/Storage endpoints over HTTPS
    const host = parsed.hostname.toLowerCase();
    if (
      parsed.protocol !== 'https:' ||
      (!host.endsWith('.supabase.co') && !host.endsWith('.supabase.in'))
    ) {
      return res.status(403).json({ error: 'Forbidden target host' });
    }

    const forwardHeaders = {};
    const allowedHeaders = new Set([
      'apikey',
      'authorization',
      'content-type',
      'prefer',
      'accept',
      'range',
      'x-client-info',
      'accept-profile',
      'content-profile',
    ]);
    if (headers && typeof headers === 'object') {
      for (const [k, v] of Object.entries(headers)) {
        if (allowedHeaders.has(k.toLowerCase()) && typeof v === 'string') {
          forwardHeaders[k] = v;
        }
      }
    }

    const upperMethod = String(method || 'GET').toUpperCase();
    const fetchOpts = {
      method: upperMethod,
      headers: forwardHeaders,
    };
    if (body !== undefined && body !== null && upperMethod !== 'GET' && upperMethod !== 'HEAD') {
      fetchOpts.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const upstream = await fetch(parsed.toString(), fetchOpts);
    const respText = await upstream.text();
    const contentType = upstream.headers.get('content-type') || 'application/json';
    const contentRange = upstream.headers.get('content-range');

    res.setHeader('Content-Type', contentType);
    if (contentRange) {
      res.setHeader('Content-Range', contentRange);
    }
    return res.status(upstream.status).send(respText);
  } catch (err) {
    return res.status(502).json({
      error: err?.message || 'Supabase proxy upstream error',
    });
  }
}
