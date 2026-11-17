import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Campaign, CustomerLead, TrackingEvent } from '../types';

export type CloudDbProvider = 'supabase' | 'firebase';

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';
let useSupabaseProxyFallback = false;

const supabaseStoreHashes: Record<string, string> = {};

export function isUsingSupabaseProxy(): boolean {
  return useSupabaseProxyFallback;
}

export function resetSupabaseProxyMode(): void {
  useSupabaseProxyFallback = false;
}

function serializeHeaders(rawHeaders: HeadersInit | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!rawHeaders) return out;
  if (rawHeaders instanceof Headers) {
    rawHeaders.forEach((v, k) => {
      out[k] = v;
    });
  } else if (Array.isArray(rawHeaders)) {
    rawHeaders.forEach(([k, v]) => {
      if (k) out[k] = String(v);
    });
  } else if (typeof rawHeaders === 'object') {
    Object.entries(rawHeaders).forEach(([k, v]) => {
      if (v !== undefined) out[k] = String(v);
    });
  }
  return out;
}

async function callViaSupabaseProxy(targetUrl: string, init?: RequestInit): Promise<Response> {
  const method = (init?.method || 'GET').toUpperCase();
  const headers = serializeHeaders(init?.headers);
  let body: any = undefined;
  if (init?.body !== undefined && init?.body !== null) {
    if (typeof init.body === 'string') {
      body = init.body;
    } else if (init.body instanceof URLSearchParams) {
      body = init.body.toString();
    } else {
      body = String(init.body);
    }
  }

  const proxyRes = await fetch('/api/supabase-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetUrl, method, headers, body }),
    signal: init?.signal,
  });

  if (proxyRes.status === 404) {
    throw new Error(
      'Proxy /api/supabase-proxy não encontrado nesta publicação. Pause o bloqueador de anúncios no Chrome ou atualize o site na Vercel.'
    );
  }

  const text = await proxyRes.text();
  const respHeaders = new Headers();
  const ct = proxyRes.headers.get('content-type');
  const cr = proxyRes.headers.get('content-range');
  if (ct) respHeaders.set('content-type', ct);
  if (cr) respHeaders.set('content-range', cr);

  return new Response(text, {
    status: proxyRes.status,
    statusText: proxyRes.statusText,
    headers: respHeaders,
  });
}

export async function resilientSupabaseFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const targetUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

  if (useSupabaseProxyFallback && typeof window !== 'undefined') {
    return callViaSupabaseProxy(targetUrl, init);
  }

  try {
    return await fetch(input, init);
  } catch (err: any) {
    const msg = String(err?.message || err || '').toLowerCase();
    const isNetworkOrBlock =
      err instanceof TypeError ||
      msg.includes('failed to fetch') ||
      msg.includes('networkerror') ||
      msg.includes('load failed') ||
      msg.includes('fetch');

    if (isNetworkOrBlock && typeof window !== 'undefined' && targetUrl.startsWith('https://')) {
      useSupabaseProxyFallback = true;
      return callViaSupabaseProxy(targetUrl, init);
    }
    throw err;
  }
}

export function createResilientSupabaseClient(url: string, key: string): SupabaseClient {
  return createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: resilientSupabaseFetch },
  });
}

export function cleanSupabaseCredentialUrl(raw: string): string {
  let cleaned = (raw || '').replace(/[\s"'`<>\u200B-\u200D\uFEFF]+/g, '');
  cleaned = cleaned.replace(/^(?:VITE_|NEXT_PUBLIC_|REACT_APP_)?SUPABASE_URL=/i, '');
  if (!cleaned) return '';
  const dashboardMatch = cleaned.match(/supabase\.com\/dashboard\/project\/([a-zA-Z0-9_-]+)/i);
  if (dashboardMatch?.[1]) return `https://${dashboardMatch[1]}.supabase.co`;
  const hostMatch = cleaned.match(/(?:db\.)?([a-zA-Z0-9_-]+)\.supabase\.(co|in)/i);
  if (hostMatch?.[1]) return `https://${hostMatch[1]}.supabase.${hostMatch[2].toLowerCase()}`;
  return cleaned;
}

export function cleanSupabaseCredentialKey(raw: string): string {
  let cleaned = (raw || '').replace(/[\s"'`\u200B-\u200D\uFEFF]+/g, '');
  cleaned = cleaned.replace(
    /^(?:VITE_|NEXT_PUBLIC_|REACT_APP_)?(?:SUPABASE_)?(?:ANON_|PUBLISHABLE_)?(?:DEFAULT_)?KEY=/i,
    ''
  );
  return cleaned;
}

export function validateSupabaseKeyWarning(key: string): string | null {
  if (!key) return null;
  if (key.startsWith('sb_secret_')) {
    return 'Você colou a chave SECRETA (sb_secret_...). Copie a chave PÚBLICA ("Publishable" sb_publishable_... ou "anon public" eyJ...).';
  }
  if (key.startsWith('eyJ')) {
    try {
      const parts = key.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (payload?.role === 'service_role') {
          return 'Você colou a chave "service_role". Por segurança no navegador, use a chave "anon public".';
        }
      }
    } catch {}
  }
  return null;
}

export function getEffectiveSupabaseCredentials(): {
  url: string;
  key: string;
  source: 'local' | 'env' | 'none';
} {
  const localUrl = typeof window !== 'undefined' ? cleanSupabaseCredentialUrl(localStorage.getItem('autoviral_supabase_url') || '') : '';
  const localKey = typeof window !== 'undefined' ? cleanSupabaseCredentialKey(localStorage.getItem('autoviral_supabase_key') || '') : '';
  if (localUrl && localKey) {
    return { url: localUrl, key: localKey, source: 'local' };
  }
  const envUrl = cleanSupabaseCredentialUrl(((import.meta as any).env?.VITE_SUPABASE_URL as string | undefined) || '');
  const envKey = cleanSupabaseCredentialKey(((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined) || '');
  if (envUrl && envKey) {
    return { url: envUrl, key: envKey, source: 'env' };
  }
  return { url: '', key: '', source: 'none' };
}

export function getSupabaseClient(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;
  if (localStorage.getItem('autoviral_supabase_connected') === 'false') {
    cachedClient = null;
    return null;
  }
  const { url, key } = getEffectiveSupabaseCredentials();

  if (!url || !key) {
    cachedClient = null;
    return null;
  }

  if (cachedClient && lastUrl === url && lastKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createResilientSupabaseClient(url, key);
    lastUrl = url;
    lastKey = key;
    return cachedClient;
  } catch (err) {
    console.warn('Erro ao instanciar cliente Supabase:', err);
    return null;
  }
}

export function isSupabaseConnected(): boolean {
  if (typeof window === 'undefined') return false;
  if (localStorage.getItem('autoviral_supabase_connected') === 'false') return false;
  const { url, key, source } = getEffectiveSupabaseCredentials();
  if (!url || !key) return false;
  if (source === 'env') return true;
  return localStorage.getItem('autoviral_supabase_connected') === 'true';
}

export function hasSupabaseCredentials(): boolean {
  const { url, key } = getEffectiveSupabaseCredentials();
  return Boolean(url && key && !validateSupabaseKeyWarning(key));
}

export function getPrimaryCloudProvider(): CloudDbProvider {
  if (typeof window === 'undefined') return 'firebase';
  if (!isSupabaseConnected()) return 'firebase';
  const pref = localStorage.getItem('autoviral_primary_db');
  return pref === 'firebase' ? 'firebase' : 'supabase';
}

export function isPrimarySupabase(): boolean {
  return getPrimaryCloudProvider() === 'supabase';
}

export function setPrimaryCloudProvider(provider: CloudDbProvider): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('autoviral_primary_db', provider);
    window.dispatchEvent(new CustomEvent('autoviral_db_provider_changed', { detail: { provider } }));
  } catch {}
}

let failoverInFlight: Promise<boolean> | null = null;
export async function autoFailoverToSupabaseOnQuota(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (isPrimarySupabase()) return true;
  if (localStorage.getItem('autoviral_auto_failover') === 'disabled') return false;
  if (!hasSupabaseCredentials()) return false;
  if (failoverInFlight) return failoverInFlight;

  failoverInFlight = (async () => {
    try {
      const { url, key } = getEffectiveSupabaseCredentials();
      const client = createResilientSupabaseClient(url, key);
      const { error } = await client.from('autoviral_campaigns').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        return false;
      }
      localStorage.setItem('autoviral_supabase_url', url);
      localStorage.setItem('autoviral_supabase_key', key);
      localStorage.setItem('autoviral_supabase_connected', 'true');
      cachedClient = client;
      lastUrl = url;
      lastKey = key;
      await pushLocalSnapshotToSupabase().catch(() => {});
      setPrimaryCloudProvider('supabase');
      window.dispatchEvent(new CustomEvent('autoviral_auto_failover_activated', { detail: { provider: 'supabase' } }));
      return true;
    } catch {
      return false;
    } finally {
      failoverInFlight = null;
    }
  })();

  return failoverInFlight;
}

// Convert Supabase DB record to Campaign (preserving full extra_json payload)
export function mapRecordToCampaign(record: any): Campaign {
  const extra = record?.extra_json && typeof record.extra_json === 'object' ? record.extra_json : {};
  return {
    ...extra,
    id: record.id,
    title: record.title || extra.title || 'Campanha',
    niche: record.niche || extra.niche || 'geral',
    nicheLabel: record.niche_label || extra.nicheLabel || 'Geral',
    targetAudience: record.target_audience || extra.targetAudience || '',
    painPointTargeted: record.pain_point || extra.painPointTargeted || '',
    checkoutUrl: record.checkout_url ?? extra.checkoutUrl,
    whatsappNumber: record.whatsapp_number ?? extra.whatsappNumber,
    price: Number(record.price ?? extra.price) || 97,
    status: (record.status || extra.status || 'active') as Campaign['status'],
    revenue: Number(record.revenue ?? extra.revenue) || 0,
    conversions: Number(record.conversions ?? extra.conversions) || 0,
    clicks: Number(record.clicks ?? extra.clicks) || 0,
    impressions: Number(record.impressions ?? extra.impressions) || 0,
    createdAt: record.created_at || extra.createdAt || new Date().toISOString(),
    antiBanOrganicMode: extra.antiBanOrganicMode ?? true,
    platforms: Array.isArray(extra.platforms) ? extra.platforms : ['facebook_groups', 'instagram', 'pinterest', 'whatsapp'],
  };
}

// Fetch campaigns directly from user's Supabase project
export async function fetchSupabaseCampaigns(): Promise<Campaign[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('autoviral_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Erro ao buscar campanhas no Supabase:', error.message);
      return null;
    }

    if (data && Array.isArray(data)) {
      return data.map(mapRecordToCampaign);
    }
    return [];
  } catch (err) {
    console.warn('Falha na requisição Supabase:', err);
    return null;
  }
}

// Upsert a campaign to user's Supabase project (retries without extra_json if older table lacks it)
export async function saveCampaignToSupabase(camp: Campaign): Promise<boolean> {
  const res = await saveCampaignToSupabaseDetailed(camp);
  return res.ok;
}

export async function saveCampaignToSupabaseDetailed(camp: Campaign): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'not-connected' };

  const basePayload = {
    id: camp.id,
    title: camp.title,
    niche: camp.niche,
    niche_label: camp.nicheLabel,
    target_audience: camp.targetAudience,
    pain_point: camp.painPointTargeted,
    checkout_url: camp.checkoutUrl || null,
    whatsapp_number: camp.whatsappNumber || null,
    price: camp.price,
    status: camp.status,
    revenue: camp.revenue,
    conversions: camp.conversions,
    clicks: camp.clicks,
    impressions: camp.impressions,
  };

  try {
    const { error } = await client.from('autoviral_campaigns').upsert({
      ...basePayload,
      extra_json: camp,
    });

    if (error) {
      if (error.message?.includes('extra_json')) {
        const retry = await client.from('autoviral_campaigns').upsert(basePayload);
        return retry.error ? { ok: false, error: retry.error.message } : { ok: true };
      }
      console.warn('Erro ao salvar campanha no Supabase:', error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err: any) {
    console.warn('Falha ao salvar campanha no Supabase:', err);
    return { ok: false, error: err?.message || String(err) };
  }
}

// Delete campaign from Supabase
export async function deleteCampaignFromSupabase(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('autoviral_campaigns').delete().eq('id', id);
    if (error) {
      console.warn('Erro ao excluir campanha no Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Falha ao excluir campanha no Supabase:', err);
    return false;
  }
}

// Save JSON workspace slice into isolated table autoviral_workspace_store (merges partial objects cleanly)
export async function saveWorkspaceJsonToSupabase(
  storeKey: string,
  payload: any,
  options?: { mergeObject?: boolean; force?: boolean }
): Promise<{ ok: boolean; missingTable?: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'not-connected' };

  try {
    let finalData = payload;

    if (options?.mergeObject && payload && typeof payload === 'object' && !Array.isArray(payload)) {
      const cleanIncoming: Record<string, any> = {};
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== undefined) cleanIncoming[k] = v;
      });
      const existing = await fetchWorkspaceJsonFromSupabase(storeKey);
      if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
        finalData = { ...existing, ...cleanIncoming, updatedAt: new Date().toISOString() };
      } else {
        finalData = { ...cleanIncoming, updatedAt: new Date().toISOString() };
      }
    }

    const serialized = JSON.stringify(finalData);
    if (!options?.force && supabaseStoreHashes[storeKey] === serialized) {
      return { ok: true };
    }

    const { error } = await client.from('autoviral_workspace_store').upsert({
      key: storeKey,
      data: finalData,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      const missingTable =
        error.code === '42P01' ||
        error.code === 'PGRST205' ||
        error.message?.includes('does not exist') ||
        error.message?.includes('schema cache') ||
        error.message?.includes('autoviral_workspace_store');
      return { ok: false, missingTable, error: error.message };
    }

    supabaseStoreHashes[storeKey] = serialized;
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}

export async function fetchWorkspaceJsonFromSupabase(storeKey: string): Promise<any | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('autoviral_workspace_store')
      .select('data')
      .eq('key', storeKey)
      .maybeSingle();
    if (error) return null;
    if (data && data.data !== undefined) {
      try {
        supabaseStoreHashes[storeKey] = JSON.stringify(data.data);
      } catch {}
      return data.data;
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveTrackingEventToSupabase(ev: TrackingEvent): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client.from('autoviral_tracking_events').upsert({
      id: ev.id,
      campaign_id: ev.campaignId,
      campaign_title: ev.campaignTitle,
      niche: ev.niche,
      type: ev.type,
      geo_city: ev.geo?.city || null,
      geo_state: ev.geo?.state || null,
      source: ev.source || null,
      device: ev.device || null,
      age_bracket: ev.ageBracket || null,
      lead_score: ev.leadScore || null,
      amount: ev.amount || 0,
      created_at: ev.timestamp || new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}

export async function fetchTrackingEventsFromSupabase(): Promise<TrackingEvent[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('autoviral_tracking_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(300);
    if (error || !Array.isArray(data)) return null;
    return data.map((r: any) => ({
      id: r.id,
      campaignId: r.campaign_id,
      campaignTitle: r.campaign_title || 'Campanha',
      niche: r.niche || 'geral',
      type: r.type,
      timestamp: r.created_at || new Date().toISOString(),
      geo: { city: r.geo_city || 'Brasil', state: r.geo_state || 'BR', country: 'Brasil' },
      source: r.source || 'facebook_groups',
      device: r.device || 'Mobile',
      ageBracket: r.age_bracket,
      leadScore: r.lead_score,
      isSimulation: false,
      amount: r.amount ? Number(r.amount) : undefined,
    }));
  } catch {
    return null;
  }
}

export async function fetchAllAutoViralFromSupabase(): Promise<{
  ok: boolean;
  missingStoreTable?: boolean;
  campaigns: Campaign[];
  workspace: any | null;
  globalWorkspace: any | null;
  deletedIds: string[] | null;
  customerLeads: CustomerLead[] | null;
  trackingEvents: TrackingEvent[] | null;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      ok: false,
      campaigns: [],
      workspace: null,
      globalWorkspace: null,
      deletedIds: null,
      customerLeads: null,
      trackingEvents: null,
    };
  }

  const [campaignsRes, storeRes, eventsRes] = await Promise.all([
    fetchSupabaseCampaigns(),
    client.from('autoviral_workspace_store').select('key, data'),
    fetchTrackingEventsFromSupabase(),
  ]);

  let missingStoreTable = false;
  let workspace: any = null;
  let globalWorkspace: any = null;
  let deletedIds: string[] | null = null;
  let customerLeads: CustomerLead[] | null = null;

  if (storeRes.error) {
    if (
      storeRes.error.code === '42P01' ||
      storeRes.error.code === 'PGRST205' ||
      storeRes.error.message?.includes('does not exist') ||
      storeRes.error.message?.includes('schema cache') ||
      storeRes.error.message?.includes('autoviral_workspace_store')
    ) {
      missingStoreTable = true;
    }
  } else if (Array.isArray(storeRes.data)) {
    storeRes.data.forEach((row: any) => {
      try {
        supabaseStoreHashes[row.key] = JSON.stringify(row.data);
      } catch {}
      if (row.key === 'workspace_sync_v1') workspace = row.data;
      if (row.key === 'global_workspace_sync_v1') globalWorkspace = row.data;
      if (row.key === 'deleted_campaign_ids' && Array.isArray(row.data)) deletedIds = row.data;
      if (row.key === 'customer_leads' && Array.isArray(row.data)) customerLeads = row.data;
    });
  }

  return {
    ok: !missingStoreTable,
    missingStoreTable,
    campaigns: campaignsRes || [],
    workspace,
    globalWorkspace,
    deletedIds,
    customerLeads,
    trackingEvents: eventsRes,
  };
}

export async function pushLocalSnapshotToSupabase(extraCampaigns?: Campaign[], extraLeads?: CustomerLead[]): Promise<{
  ok: boolean;
  missingStoreTable?: boolean;
  campaignsSaved: number;
  error?: string;
}> {
  const safeParse = (k: string) => {
    try {
      const raw = localStorage.getItem(k);
      return raw ? JSON.parse(raw) : undefined;
    } catch {
      return undefined;
    }
  };

  const campaignsToSave: Campaign[] = extraCampaigns || safeParse('autoviral_campaigns') || [];
  let campaignsSaved = 0;
  let lastCampaignError: string | undefined;
  for (const camp of campaignsToSave) {
    if (camp?.id) {
      const res = await saveCampaignToSupabaseDetailed(camp);
      if (res.ok) campaignsSaved++;
      else if (res.error && !lastCampaignError) lastCampaignError = res.error;
    }
  }

  const pickNonEmpty = (val: any) => {
    if (val === undefined || val === null) return undefined;
    if (Array.isArray(val)) return val.length > 0 ? val : undefined;
    if (typeof val === 'object') return Object.keys(val).length > 0 ? val : undefined;
    return val;
  };

  const buildDefinedPayload = (entries: Record<string, any>) => {
    const out: Record<string, any> = {};
    Object.entries(entries).forEach(([k, v]) => {
      const cleaned = pickNonEmpty(v);
      if (cleaned !== undefined) out[k] = cleaned;
    });
    return out;
  };

  const workspacePayload = buildDefinedPayload({
    savedCopiesMap: safeParse('autoviral_saved_copies_v1'),
    customCopyPresets: safeParse('autoviral_custom_copy_presets_v1'),
    audiences: safeParse('autoviral_fb_audiences_v4') || safeParse('autoviral_fb_audiences_v3'),
    youtubeVideos: safeParse('autoviral_yt_videos_v2'),
    pinterestPins: safeParse('autoviral_pinterest_pins_v1'),
    instaCampaigns: safeParse('autoviral_insta_campaigns_v1'),
    storyQueue: safeParse('autoviral_insta_story_queue') || safeParse('autoviral_insta_story_queue_v2'),
    mappedInstaTargets: safeParse('autoviral_insta_mapped_targets_v2'),
    mappedGroups: safeParse('autoviral_fb_mapped_groups_v5_real') || safeParse('autoviral_fb_mapped_groups_v3'),
    whatsappX1Flows: safeParse('autoviral_whatsapp_x1_flows_v1'),
  });

  const globalPayload = buildDefinedPayload({
    globalAudiences: safeParse('autoviral_global_audiences_v1'),
    globalTrashAudiences: safeParse('autoviral_global_audiences_trash_v1'),
    globalGroups: safeParse('autoviral_global_fb_groups_v1'),
    globalOffers: safeParse('autoviral_global_offers_v1'),
    dismissedRecoveryKeys: safeParse('autoviral_global_dismissed_recovery_v1'),
  });

  const deletedIds = safeParse('autoviral_deleted_campaign_ids') || ['camp-1', 'camp-2', 'camp-3'];

  const [wsRes, glRes, delRes, leadsRes] = await Promise.all([
    Object.keys(workspacePayload).length > 0
      ? saveWorkspaceJsonToSupabase('workspace_sync_v1', workspacePayload, { mergeObject: true, force: true })
      : Promise.resolve({ ok: true } as { ok: boolean; missingTable?: boolean; error?: string }),
    Object.keys(globalPayload).length > 0
      ? saveWorkspaceJsonToSupabase('global_workspace_sync_v1', globalPayload, { mergeObject: true, force: true })
      : Promise.resolve({ ok: true } as { ok: boolean; missingTable?: boolean; error?: string }),
    saveWorkspaceJsonToSupabase('deleted_campaign_ids', deletedIds, { force: true }),
    extraLeads && extraLeads.length > 0
      ? saveWorkspaceJsonToSupabase('customer_leads', extraLeads, { force: true })
      : Promise.resolve({ ok: true } as { ok: boolean; missingTable?: boolean; error?: string }),
  ]);

  if (wsRes.missingTable || glRes.missingTable || delRes.missingTable || (leadsRes as any).missingTable) {
    return {
      ok: false,
      missingStoreTable: true,
      campaignsSaved,
      error: 'Execute o Script SQL atualizado no SQL Editor do Supabase para criar a tabela autoviral_workspace_store.',
    };
  }

  return {
    ok: wsRes.ok && glRes.ok,
    campaignsSaved,
    error: wsRes.error || glRes.error || lastCampaignError,
  };
}
