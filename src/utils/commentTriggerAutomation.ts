import { slugifyTrackingTag } from './realPhotoCommentTemplates';

export type CommentAutomationMode = 'auto' | 'semi_auto';

export interface CommentTriggerRule {
  id: string;
  name: string;
  active: boolean;
  keywords: string[];
  offerId?: string;
  baseLinkUrl: string;
  enablePresellTracking: boolean;
  trackingParamName: string;
  replyTemplates: [string, string, string];
  repliesSentCount: number;
  createdAt: string;
}

export interface MonitoredTriggerPost {
  id: string;
  postUrl: string;
  groupName: string;
  ruleId: string; // 'all' or specific CommentTriggerRule.id
  addedAt: string;
  lastCheckedAt?: string;
  repliesSentCount: number;
}

export interface CommentTriggerReplyLog {
  id: string;
  commentKey: string;
  postUrl: string;
  groupName: string;
  authorName: string;
  commentSnippet: string;
  matchedKeyword: string;
  ruleId: string;
  ruleName: string;
  replySent: string;
  trackedLink: string;
  mode: CommentAutomationMode;
  status: 'replied' | 'prefilled' | 'rate_limited' | 'skipped';
  timestamp: string;
}

export interface CommentTriggerSettings {
  mode: CommentAutomationMode;
  autoRoundEnabled: boolean;
  roundIntervalMinutes: number; // default 15
  minDelaySeconds: number; // default 20
  maxDelaySeconds: number; // default 45
  maxRepliesPerCheck: number; // default 5
}

export const TRIGGER_STORAGE_KEYS = {
  RULES: 'autoviral_global_comment_trigger_rules_v1',
  POSTS: 'autoviral_global_comment_trigger_posts_v1',
  LOGS: 'autoviral_global_comment_trigger_logs_v1',
  SETTINGS: 'autoviral_global_comment_trigger_settings_v1',
};

export const DEFAULT_COMMENT_TRIGGER_SETTINGS: CommentTriggerSettings = {
  mode: 'auto',
  autoRoundEnabled: false,
  roundIntervalMinutes: 15,
  minDelaySeconds: 20,
  maxDelaySeconds: 45,
  maxRepliesPerCheck: 5,
};

export const KEYWORD_PRESET_GROUPS: Array<{ label: string; keywords: string[] }> = [
  {
    label: '🇧🇷 Brasil (Alta Conversão)',
    keywords: ['eu quero', 'quero', 'manda', 'link', 'valor', 'quanto custa', 'tenho interesse', 'me envia', 'pdf'],
  },
  {
    label: '🇺🇸 Inglês (US/AU/CA/UK)',
    keywords: ['send it', 'i want it', 'link please', 'interested', 'how much', 'info', 'recipe', 'pattern', 'sheet'],
  },
  {
    label: '🇪🇸 Espanhol (Latam/ES)',
    keywords: ['yo quiero', 'quiero', 'enlace', 'link', 'precio', 'info', 'me interesa', 'receta', 'moldes'],
  },
];

export function normalizeTriggerText(raw: string): string {
  return String(raw || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseKeywordsCsv(raw: string): string[] {
  const seen = new Set<string>();
  const list: string[] = [];
  String(raw || '')
    .split(/[,;\n]+/)
    .map((k) => k.trim())
    .filter(Boolean)
    .forEach((k) => {
      const norm = normalizeTriggerText(k);
      if (norm && !seen.has(norm)) {
        seen.add(norm);
        list.push(k);
      }
    });
  return list;
}

export function buildCommentTriggerTrackedLink(
  baseLinkUrl: string,
  enableTracking: boolean,
  trackingParamName: string,
  ruleName: string,
  groupNameOrSlug?: string
): string {
  const raw = String(baseLinkUrl || '').trim();
  if (!raw) return '';
  const safeBase = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  if (!enableTracking) return safeBase;

  const ruleTag = slugifyTrackingTag(ruleName || 'gatilho', 20);
  const groupTag = groupNameOrSlug ? `_${slugifyTrackingTag(groupNameOrSlug, 16)}` : '';
  const trackVal = `fb_auto_${ruleTag}${groupTag}`;

  try {
    const parsed = new URL(safeBase);
    parsed.searchParams.set('utm_source', 'facebook_groups');
    parsed.searchParams.set('utm_medium', 'auto_gatilho');
    parsed.searchParams.set('utm_campaign', ruleTag);
    if (trackingParamName && trackingParamName !== 'utm_source') {
      parsed.searchParams.set(trackingParamName, trackVal);
    } else {
      parsed.searchParams.set('sub2', trackVal);
    }
    return parsed.toString();
  } catch {
    const sep = safeBase.includes('?') ? '&' : '?';
    return `${safeBase}${sep}utm_source=facebook_groups&utm_medium=auto_gatilho&sub2=${encodeURIComponent(trackVal)}`;
  }
}

export function renderTriggerReplyText(
  template: string,
  authorName: string,
  trackedLink: string
): string {
  const firstName = String(authorName || '')
    .trim()
    .split(/\s+/)[0] || '';
  let out = String(template || '').trim();
  out = out.replace(/\[NOME\]/gi, firstName || 'olá');
  if (/\[LINK\]|\[PRESELL_LINK\]/i.test(out)) {
    out = out.replace(/\[LINK\]|\[PRESELL_LINK\]/gi, trackedLink);
  } else if (trackedLink) {
    out = `${out} ${trackedLink}`;
  }
  return out.trim();
}

export function matchCommentAgainstRules(
  commentText: string,
  rules: CommentTriggerRule[],
  restrictRuleId?: string
): { rule: CommentTriggerRule; matchedKeyword: string } | null {
  const normComment = normalizeTriggerText(commentText);
  if (!normComment) return null;

  const candidates = rules.filter((r) => {
    if (!r.active) return false;
    if (restrictRuleId && restrictRuleId !== 'all' && r.id !== restrictRuleId) return false;
    return true;
  });

  for (const rule of candidates) {
    for (const kw of rule.keywords) {
      const normKw = normalizeTriggerText(kw);
      if (!normKw) continue;
      if (normComment.includes(normKw)) {
        return { rule, matchedKeyword: kw };
      }
    }
  }
  return null;
}

export function createStarterRuleFromOffer(offer?: {
  id: string;
  productName: string;
  presellUrl: string;
  trackingParamName?: string;
  realPhotoCommentConfig?: { keyword?: string; lang?: string };
}): CommentTriggerRule {
  const lang = offer?.realPhotoCommentConfig?.lang || 'pt';
  const customKw = offer?.realPhotoCommentConfig?.keyword?.toLowerCase() || '';
  const defaultKeywords =
    lang === 'en'
      ? Array.from(new Set([customKw, 'send it', 'i want it', 'link', 'info', 'interested'].filter(Boolean)))
      : lang === 'es'
      ? Array.from(new Set([customKw, 'yo quiero', 'quiero', 'enlace', 'link', 'precio', 'info'].filter(Boolean)))
      : Array.from(new Set([customKw, 'eu quero', 'quero', 'manda', 'link', 'valor', 'pdf'].filter(Boolean)));

  const templates: [string, string, string] =
    lang === 'en'
      ? [
          'Hi [NOME]! 😊 Here is the exact page with everything included: [LINK]',
          'Happy to share, [NOME]! You can check all details right here: [LINK]',
          'Here you go [NOME]! Grabbed the full pack on this page: [LINK] 💛',
        ]
      : lang === 'es'
      ? [
          '¡Hola [NOME]! 😊 Aquí tienes el enlace con todos los detalles: [LINK]',
          '¡Claro [NOME]! En esta página conseguí todo el material completo: [LINK]',
          'Te lo dejo por aquí [NOME] con descarga inmediata: [LINK] 💛',
        ]
      : [
          'Oi [NOME]! 😊 Peguei o material completo nesta página aqui, dá uma olhada: [LINK]',
          'Claro [NOME]! Te passei o link certinho com tudo que vem incluso: [LINK]',
          'Aqui está [NOME]! Foi por esse link que eu peguei com valor promocional: [LINK] 💛',
        ];

  return {
    id: `trule-${Date.now()}`,
    name: offer?.productName ? `Gatilho · ${offer.productName.slice(0, 38)}` : 'Gatilho Principal (EU QUERO → Link)',
    active: true,
    keywords: defaultKeywords,
    offerId: offer?.id,
    baseLinkUrl: offer?.presellUrl || 'https://global-sell-beta.vercel.app/',
    enablePresellTracking: true,
    trackingParamName: offer?.trackingParamName || 'sub2',
    replyTemplates: templates,
    repliesSentCount: 0,
    createdAt: new Date().toLocaleDateString('pt-BR'),
  };
}
