import { Campaign } from '../types';

export function getCampaignSlug(campaign: Campaign): string {
  if (!campaign) return 'tarefinhas';
  if (campaign.id === 'camp-tarefinhas-autismo') return 'tarefinhas';
  if (campaign.id === 'camp-milhas-3') return 'milhas';
  if (campaign.id === 'camp-1') return 'ingles';

  // Normalize title to a clean URL slug (e.g. "Atividades Cognitivas para Crianças" -> "atividades-cognitivas")
  const normalized = campaign.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  if (normalized.length > 3) {
    // Keep first 3-4 words for nice short URL
    return normalized.split('-').slice(0, 4).join('-');
  }

  return campaign.id.replace('camp-', '');
}

export function getCampaignLandingUrl(campaign: Campaign, origin?: string): string {
  const base = origin || (typeof window !== 'undefined' ? window.location.origin : '');
  const slug = getCampaignSlug(campaign);
  return `${base}/?p=${slug}`;
}
