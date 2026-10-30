import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Campaign } from '../types';

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;
  const url = localStorage.getItem('autoviral_supabase_url') || '';
  const key = localStorage.getItem('autoviral_supabase_key') || '';

  if (!url || !key) {
    cachedClient = null;
    return null;
  }

  if (cachedClient && lastUrl === url && lastKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: { persistSession: false },
    });
    lastUrl = url;
    lastKey = key;
    return cachedClient;
  } catch (err) {
    console.warn('Erro ao instanciar cliente Supabase:', err);
    return null;
  }
}

export function isSupabaseConnected(): boolean {
  return Boolean(
    typeof window !== 'undefined' &&
    localStorage.getItem('autoviral_supabase_url') &&
    localStorage.getItem('autoviral_supabase_key') &&
    localStorage.getItem('autoviral_supabase_connected') === 'true'
  );
}

// Convert Supabase DB record to Campaign
export function mapRecordToCampaign(record: any): Campaign {
  return {
    id: record.id,
    title: record.title,
    niche: record.niche || 'geral',
    nicheLabel: record.niche_label || 'Geral',
    targetAudience: record.target_audience || '',
    painPointTargeted: record.pain_point || '',
    checkoutUrl: record.checkout_url || undefined,
    whatsappNumber: record.whatsapp_number || undefined,
    price: Number(record.price) || 97,
    status: record.status || 'active',
    revenue: Number(record.revenue) || 0,
    conversions: Number(record.conversions) || 0,
    clicks: Number(record.clicks) || 0,
    impressions: Number(record.impressions) || 0,
    createdAt: record.created_at || new Date().toISOString(),
    antiBanOrganicMode: true,
    platforms: ['tiktok', 'pinterest', 'instagram', 'whatsapp'],
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

// Upsert a campaign to user's Supabase project
export async function saveCampaignToSupabase(camp: Campaign): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('autoviral_campaigns').upsert({
      id: camp.id,
      title: camp.title,
      niche: camp.niche,
      niche_label: camp.nicheLabel,
      target_audience: camp.targetAudience,
      pain_point: camp.painPointTargeted,
      checkout_url: camp.checkoutUrl,
      whatsapp_number: camp.whatsappNumber,
      price: camp.price,
      status: camp.status,
      revenue: camp.revenue,
      conversions: camp.conversions,
      clicks: camp.clicks,
      impressions: camp.impressions,
    });

    if (error) {
      console.warn('Erro ao salvar campanha no Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Falha ao salvar campanha no Supabase:', err);
    return false;
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
