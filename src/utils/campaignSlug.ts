import { Campaign } from '../types';

export function getCampaignSlug(campaign: Campaign): string {
  if (!campaign) return 'tarefinhas';

  const titleLower = (campaign.title || '').toLowerCase();

  // Specific default overrides ONLY if title matches the original product
  if (campaign.id === 'camp-tarefinhas-autismo' && (titleLower.includes('tarefinha') || titleLower.includes('autista'))) {
    return 'tarefinhas';
  }
  if (campaign.id === 'camp-milhas-3' && titleLower.includes('milha')) {
    return 'milhas';
  }
  if (campaign.id === 'camp-1' && titleLower.includes('ingles')) {
    return 'ingles';
  }

  // Normalize current title to a clean URL slug (e.g. "ecom club" -> "ecom-club")
  const normalized = (campaign.title || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  if (normalized.length >= 3) {
    // Keep first 3-4 words for nice readable URL
    return normalized.split('-').slice(0, 4).join('-');
  }

  return campaign.id.replace('camp-', '');
}

/**
 * Gera um slug curto (máximo 2-3 palavras, sem caracteres estranhos)
 * para links confiáveis estilo /z/atividades ou /z/ecom-club
 */
export function getShortFunnelSlug(campaign: Campaign): string {
  if (!campaign) return 'oferta';
  const titleLower = (campaign.title || '').toLowerCase();

  if (campaign.id === 'camp-tarefinhas-autismo' || titleLower.includes('tarefinha')) {
    return 'tarefinhas';
  }
  if (titleLower.includes('psicopedagog')) {
    return 'kit-psico';
  }
  if (titleLower.includes('cognitiv')) {
    return 'atividades';
  }
  if (titleLower.includes('ecom') || campaign.id === 'camp-ecom-club') {
    return 'ecom-club';
  }
  if (titleLower.includes('milha')) {
    return 'milhas';
  }

  const normalized = (campaign.title || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const words = normalized.split('-').filter((w) => w.length > 1).slice(0, 2);
  if (words.length > 0) return words.join('-');
  return (campaign.id || 'oferta').replace(/^camp-/, '').slice(0, 14);
}

/**
 * Retorna a URL curta e limpa para postar em Grupos do Facebook sem cara de spam/vírus:
 * Exemplo: https://seu-site.app/z/atividades
 */
export function getShortFunnelUrl(campaign: Campaign, origin?: string): string {
  const base = (origin || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '');
  const slug = getShortFunnelSlug(campaign);
  return `${base}/z/${slug}`;
}

export function getCampaignLandingUrl(campaign: Campaign, origin?: string): string {
  const base = origin || (typeof window !== 'undefined' ? window.location.origin : '');
  const slug = getCampaignSlug(campaign);
  // Include both ?camp= (unique ID) and &p= (friendly slug) to guarantee exact match without ambiguity
  return `${base}/?camp=${campaign.id}&p=${slug}`;
}
