import React, { useEffect, useMemo, useState } from 'react';
import {
  Globe,
  Plus,
  Trash2,
  Copy,
  Check,
  Play,
  Pause,
  ExternalLink,
  Sparkles,
  Search,
  Users,
  ShieldAlert,
  ArrowRightLeft,
  CheckSquare,
  Square,
  Youtube,
  Bookmark,
  Megaphone,
  Link2,
  FileText,
  RefreshCw,
  FolderPlus,
  X,
} from 'lucide-react';
import { FacebookGroup, FacebookPostLog } from '../types';
import { globalEnBotRunner } from '../utils/globalEnBotRunner';

export interface GlobalOffer {
  id: string;
  productName: string;
  nichePain: string;
  countryCode: string;
  countryName: string;
  languageName: string;
  currencyCode: string;
  offerPriceText: string;
  discountText: string;
  affiliateUrl: string;
  trackingParamName: 'sub2' | 'sub1' | 'sub3' | 'tid' | 'aff_sub' | 'utm_source';
  presellUrl: string;
  createdAt: string;
}

export interface GlobalAudience {
  id: string;
  name: string;
  countryName: string;
  languageName: string;
  groupIds: string[];
  createdAt: string;
}

export interface GlobalInboxGroup {
  id: string;
  name: string;
  url: string;
  membersCount: number;
  suggestedScope: 'global' | 'brazil';
  detectedCountry: string;
  searchTerm?: string;
  mappedAt: string;
}

export interface GlobalGroupItem extends FacebookGroup {
  countryName?: string;
  languageName?: string;
}

export interface GlobalGeneratedKit {
  source: 'gemini' | 'template';
  generatedAt: string;
  presellStructure: {
    headline: string;
    subheadline: string;
    painBullets: string[];
    comparisonRows: Array<{
      criterion: string;
      traditionalOption: string;
      thisProduct: string;
    }>;
    ctaButtonText: string;
    trustBadges: string[];
    fullPresellDraft: string;
  };
  googleAdsKit: {
    bottomFunnelKeywords: string[];
    negativeKeywords: string[];
    headlines30: string[];
    descriptions90: string[];
    launchChecklist: string[];
  };
  organicSocialKit: {
    fbGroupQueries: string[];
    fbGroupPosts: Array<{
      angle: string;
      headline: string;
      body: string;
    }>;
    youtubeQueries: string[];
    youtubeComments: string[];
    pinterestQueries: string[];
    pinterestPins: Array<{
      title: string;
      description: string;
    }>;
  };
}

export interface GlobalYouTubeItem {
  id: string;
  title: string;
  url: string;
  channelName: string;
  commentText: string;
  status: 'ready' | 'done';
}

export interface GlobalPinterestItem {
  id: string;
  title: string;
  description: string;
  destinationUrl: string;
  boardSuggestion: string;
  status: 'ready' | 'published';
}

const STORAGE_KEYS = {
  OFFERS: 'autoviral_global_offers_v1',
  SELECTED_OFFER: 'autoviral_global_selected_offer_v1',
  INBOX: 'autoviral_global_inbox_groups_v1',
  PENDING_BRIDGE: 'autoviral_universal_inbox_pending_v1',
  GROUPS: 'autoviral_global_fb_groups_v1',
  AUDIENCES: 'autoviral_global_audiences_v1',
  SELECTED_AUDIENCE: 'autoviral_global_selected_audience_v1',
  KITS_BY_OFFER: 'autoviral_global_kits_by_offer_v1',
  LOGS: 'autoviral_global_bot_logs_v1',
  YT_ITEMS: 'autoviral_global_yt_videos_v1',
  PIN_ITEMS: 'autoviral_global_pin_items_v1',
};

const COUNTRY_PRESETS = [
  { code: 'AU', name: 'Australia', language: 'English', currency: 'AUD' },
  { code: 'US', name: 'United States', language: 'English', currency: 'USD' },
  { code: 'UK', name: 'United Kingdom', language: 'English', currency: 'GBP' },
  { code: 'CA', name: 'Canada', language: 'English', currency: 'CAD' },
  { code: 'NZ', name: 'New Zealand', language: 'English', currency: 'NZD' },
  { code: 'ES', name: 'España', language: 'Español', currency: 'EUR' },
  { code: 'PT', name: 'Portugal', language: 'Português', currency: 'EUR' },
  { code: 'DE', name: 'Deutschland', language: 'Deutsch', currency: 'EUR' },
  { code: 'FR', name: 'France', language: 'Français', currency: 'EUR' },
  { code: 'CUSTOM', name: 'Qualquer País (Personalizado)', language: 'English', currency: 'USD' },
];

const INITIAL_OFFERS: GlobalOffer[] = [
  {
    id: 'offer-katori-au',
    productName: 'Katori 100% Pure Titanium Cutting Board',
    nichePain: 'Microplastics, bacteria and dull knives from plastic & wooden cutting boards',
    countryCode: 'AU',
    countryName: 'Australia',
    languageName: 'English',
    currencyCode: 'AUD',
    offerPriceText: 'Up to 75% Off',
    discountText: 'AU Fast Shipping · 30-Day Guarantee',
    affiliateUrl: 'https://get-katori.com/pp/au/?uid=644&oid=67&affid2=52&source_id=12670&sub1=12670',
    trackingParamName: 'sub2',
    presellUrl: 'https://global-sell-beta.vercel.app/',
    createdAt: new Date().toISOString(),
  },
];

function appendTrackingParam(baseUrl: string, paramName: string, paramValue: string): string {
  const cleanBase = (baseUrl || '').trim();
  if (!cleanBase) return '';
  try {
    const withProtocol = /^https?:\/\//i.test(cleanBase) ? cleanBase : `https://${cleanBase}`;
    const urlObj = new URL(withProtocol);
    urlObj.searchParams.set(paramName, paramValue);
    return urlObj.toString();
  } catch {
    const sep = cleanBase.includes('?') ? '&' : '?';
    return `${cleanBase}${sep}${encodeURIComponent(paramName)}=${encodeURIComponent(paramValue)}`;
  }
}

function detectScopeAndCountry(name: string, searchTerm?: string): { scope: 'global' | 'brazil'; country: string } {
  const text = `${name} ${searchTerm || ''}`.toLowerCase();
  if (
    /\b(brasil|brazil|curitiba|são paulo|sao paulo|rio|minas|bahia|renda extra|pedagog|autismo|psicoped|pix|promoções|desapego|vendas)\b/i.test(
      text
    ) ||
    /[ãõçáéíóúâêô]/i.test(name)
  ) {
    return { scope: 'brazil', country: 'Brasil' };
  }
  if (/\b(australia|sydney|melbourne|brisbane|perth|adelaide|aussie|au)\b/i.test(text)) {
    return { scope: 'global', country: 'Australia' };
  }
  if (/\b(uk|london|manchester|britain|england|scotland)\b/i.test(text)) {
    return { scope: 'global', country: 'United Kingdom' };
  }
  if (/\b(canada|toronto|vancouver|ontario|alberta|montreal)\b/i.test(text)) {
    return { scope: 'global', country: 'Canada' };
  }
  if (/\b(deutschland|berlin|münchen|küche|kochen)\b/i.test(text)) {
    return { scope: 'global', country: 'Deutschland' };
  }
  if (/\b(españa|madrid|barcelona|cocina|recetas)\b/i.test(text)) {
    return { scope: 'global', country: 'España' };
  }
  return { scope: 'global', country: 'Global / Internacional' };
}

function buildStructuredTemplateKit(offer: GlobalOffer): GlobalGeneratedKit {
  const isKatori = offer.productName.toLowerCase().includes('katori') || offer.productName.toLowerCase().includes('titanium');
  const isSpanish = offer.languageName.toLowerCase().includes('espa') || offer.languageName.toLowerCase().includes('span');
  const isGerman = offer.languageName.toLowerCase().includes('deut') || offer.languageName.toLowerCase().includes('germ');
  const isFrench = offer.languageName.toLowerCase().includes('fran');
  const isPortuguese = offer.languageName.toLowerCase().includes('portu');

  if (isKatori && !isSpanish && !isGerman && !isFrench && !isPortuguese) {
    return {
      source: 'template',
      generatedAt: new Date().toISOString(),
      presellStructure: {
        headline: `Why Chefs & Families in ${offer.countryName} Are Replacing Plastic & Wood Cutting Boards in 2026`,
        subheadline: `Lab checks show scratched plastic sheds microplastics into every meal — see how ${offer.productName} compares.`,
        painBullets: [
          'Plastic boards trap knife grooves that release microplastics directly into warm food',
          'Wooden boards absorb raw meat juices, harbour odours and crack over time',
          'Pure medical-grade titanium resists bacteria, never rusts, and protects knife edges',
        ],
        comparisonRows: [
          {
            criterion: 'Microplastic Shedding',
            traditionalOption: 'Plastic sheds particles on every cut · Wood splinters',
            thisProduct: 'Zero plastic · 100% Pure Titanium surface',
          },
          {
            criterion: 'Bacteria & Odours',
            traditionalOption: 'Deep knife scars trap moisture & garlic/onion odours',
            thisProduct: 'Non-porous · Rinses clean in seconds & dishwasher safe',
          },
          {
            criterion: 'Knife Blade Care',
            traditionalOption: 'Hard stone/glass dulls blades fast',
            thisProduct: 'Titanium elasticity keeps chef knives sharper longer',
          },
          {
            criterion: 'Lifespan & Guarantee',
            traditionalOption: 'Replaced every 6–12 months',
            thisProduct: `Built for decades · ${offer.discountText || '30-Day Guarantee'}`,
          },
        ],
        ctaButtonText: `Check ${offer.countryName} Availability & ${offer.offerPriceText}`,
        trustBadges: [
          `Verified ${offer.countryName} Stock`,
          'Non-Toxic & Microplastic-Free',
          '30-Day Money-Back Guarantee',
        ],
        fullPresellDraft: `# Why ${offer.countryName} Kitchens Are Switching Away From Plastic Boards\n\nIf your chopping board is covered in grey knife grooves, you are likely eating tiny plastic shavings every week.\n\n## Plastic vs. Wood vs. ${offer.productName}\n- Plastic: Cheap upfront, sheds microplastics and stains fast.\n- Wood: Heavy maintenance, absorbs raw poultry juices, warps.\n- ${offer.productName}: Non-porous, odour-free, gentle on knives, easy rinse.\n\n👉 [${offer.offerPriceText} — Check ${offer.countryName} Offer Here]([PRESELL_CTA_LINK])`,
      },
      googleAdsKit: {
        bottomFunnelKeywords: [
          `"pure titanium cutting board"`,
          `"titanium chopping board ${offer.countryName.toLowerCase()}"`,
          `"non toxic cutting board no microplastics"`,
          `"katori titanium cutting board review"`,
          `"best antibacterial cutting board ${offer.countryName.toLowerCase()}"`,
          `[katori cutting board ${offer.countryName.toLowerCase()}]`,
          `"plastic free chopping board"`,
          `"medical grade titanium cutting board"`,
        ],
        negativeKeywords: [
          'free',
          'diy',
          'homemade',
          'amazon',
          'temu',
          'aliexpress',
          'shein',
          'kmart',
          'ikea',
          'walmart',
          'ebay',
          'wholesale',
          'bulk',
          'used',
          'second hand',
          'scam',
          'reddit complaint',
        ],
        headlines30: [
          '100% Pure Titanium Board',
          'No More Microplastics',
          `${offer.countryCode} Kitchen Upgrade`,
          'Up To 75% Off Today',
          'Antibacterial & Odour-Free',
          '30-Day Money-Back',
        ].map((h) => h.slice(0, 30)),
        descriptions90: [
          'Ditch scratched plastic boards. Pure titanium resists bacteria, odours & dull knives.',
          `Fast ${offer.countryName} shipping. Non-porous, dishwasher safe & built to last for years.`,
          'See why thousands switched from wood & plastic. Claim limited seasonal discount today.',
          'Microplastic-free meal prep for your family. Check stock & 30-day guarantee now.',
        ].map((d) => d.slice(0, 90)),
        launchChecklist: [
          `Use your Global Presell page (${offer.presellUrl || 'global-sell-beta.vercel.app'}) as Google Ads Final URL — avoid direct affiliate domain collision.`,
          'Configure Google Tag (gtag) conversion firing on the Presell CTA button click before using Maximize Conversions.',
          'Start campaign on Maximize Clicks with a manual Max CPC cap for 5–7 days to unlock impressions from zero.',
          `Verify Location targeting is set strictly to "Presence: People in ${offer.countryName}" (not "Presence or interest").`,
          'Add all 17 Negative Keywords on Day 1 so low-budget daily spend only captures ready buyers.',
        ],
      },
      organicSocialKit: {
        fbGroupQueries: [
          `Healthy cooking ${offer.countryName}`,
          `Home cooks ${offer.countryName}`,
          `Non toxic living ${offer.countryName}`,
          `Meal prep recipes ${offer.countryName}`,
          `Kitchen tips and hacks`,
          `Clean eating community ${offer.countryName}`,
        ],
        fbGroupPosts: [
          {
            angle: 'Microplastics Discovery (Review Style)',
            headline: `Switched away from scratched plastic chopping boards in our ${offer.countryName} kitchen`,
            body: `Quick share for anyone meal-prepping this week — I just read how deep grooves on old plastic boards shed microplastics right into veggies and warm meat.\n\nWe swapped to a 100% pure titanium board and the difference in smell and cleanup is huge (no garlic residue after chopping, dishwasher safe, and doesn't wreck knife edges).\n\nI put together a quick comparison (Plastic vs Wood vs Titanium) plus the ${offer.countryName} link where we got the discount:\n[PRESELL_LINK]\n\nCurious if anyone else here switched from wood/plastic yet?`,
          },
          {
            angle: 'Knife & Hygiene Angle',
            headline: 'Honest comparison: Wood vs Plastic vs Pure Titanium chopping boards',
            body: `If you're tired of wooden boards warping or plastic ones staining with tomato/turmeric, worth checking out pure titanium boards.\n\nMain wins for us:\n• Non-porous so raw chicken juices rinse straight off\n• Zero microplastic dust in kids' lunches\n• Keeps chef knives sharp\n\nFull breakdown + current ${offer.offerPriceText} link here: [PRESELL_LINK]`,
          },
          {
            angle: 'Question + Value Hook',
            headline: 'Has anyone else tossed their old plastic chopping boards?',
            body: `After noticing tiny white scratches peeling off our old board, we did a proper side-by-side comparison before buying a replacement.\n\nPure titanium ended up beating both bamboo and plastic for hygiene and cleanup. Saved the notes & ${offer.countryName} offer link here in case it helps someone else upgrading their kitchen: [PRESELL_LINK]`,
          },
        ],
        youtubeQueries: [
          'microplastics cutting board warning',
          'best non toxic cutting board review',
          'titanium cutting board honest review',
          'plastic vs wood cutting board bacteria',
        ],
        youtubeComments: [
          `Totally agree about microplastics from grooved plastic boards! We compared wood vs pure titanium last month and switched — zero lingering odours and super easy to rinse. Wrote up the quick comparison + ${offer.countryName} offer here if anyone is researching: [PRESELL_LINK]`,
          `Great breakdown! If anyone wants a plastic-free option that won't warp like wood or blunt knives like glass, pure titanium has been a game changer in our kitchen. Details & discount link: [PRESELL_LINK]`,
          `This is why we finally threw out all our stained plastic boards. Side-by-side comparison on non-toxic titanium boards here: [PRESELL_LINK]`,
        ],
        pinterestQueries: [
          'non toxic kitchen swaps microplastics',
          'titanium cutting board aesthetic kitchen',
          'healthy meal prep kitchen essentials',
        ],
        pinterestPins: [
          {
            title: `Plastic-Free Kitchen Swap: 100% Pure Titanium Board (${offer.countryCode})`,
            description: `Tired of scratched plastic & warped wood chopping boards? See why ${offer.countryName} home cooks are switching to antibacterial pure titanium. Check ${offer.offerPriceText} here: [PRESELL_LINK]`,
          },
          {
            title: 'Stop Eating Microplastics From Old Chopping Boards',
            description: `Compare Plastic vs Wood vs Titanium in 60 seconds. Non-porous, odour-free & knife-friendly upgrade for healthy kitchens: [PRESELL_LINK]`,
          },
        ],
      },
    };
  }

  // Dynamic multilingual generator for ANY product + ANY country!
  const langLabel = offer.languageName || 'English';
  const ctaVerbs = isSpanish
    ? 'Ver Disponibilidad y Descuento'
    : isGerman
    ? 'Verfügbarkeit & Rabatt Prüfen'
    : isFrench
    ? 'Voir la Disponibilité et Réduction'
    : isPortuguese
    ? 'Ver Disponibilidade e Desconto'
    : 'Check Availability & Claim Offer';

  const comparisonLabel = isSpanish
    ? 'Comparativa'
    : isGerman
    ? 'Vergleich'
    : isFrench
    ? 'Comparatif'
    : isPortuguese
    ? 'Comparativo'
    : 'Comparison';

  return {
    source: 'template',
    generatedAt: new Date().toISOString(),
    presellStructure: {
      headline: isSpanish
        ? `Por qué en ${offer.countryName} están eligiendo ${offer.productName} (${offer.offerPriceText})`
        : isGerman
        ? `Warum Haushalte in ${offer.countryName} auf ${offer.productName} umsteigen`
        : isFrench
        ? `Pourquoi ${offer.countryName} adopte ${offer.productName} (${offer.offerPriceText})`
        : isPortuguese
        ? `Por que em ${offer.countryName} estão escolhendo ${offer.productName}`
        : `Why Smart Buyers in ${offer.countryName} Are Switching to ${offer.productName}`,
      subheadline: `${offer.nichePain} — ${comparisonLabel} (${langLabel}) · ${offer.discountText || offer.offerPriceText}`,
      painBullets: [
        `${offer.nichePain}`,
        `${offer.productName} solves the core problem without recurring subscriptions or hidden fees`,
        `${offer.offerPriceText} · ${offer.discountText || `Available for ${offer.countryName}`}`,
      ],
      comparisonRows: [
        {
          criterion: 'Core Problem',
          traditionalOption: `Leaves "${offer.nichePain}" unresolved`,
          thisProduct: `Engineered specifically to solve ${offer.nichePain}`,
        },
        {
          criterion: 'Value & Cost',
          traditionalOption: 'Overpriced retail alternatives',
          thisProduct: `${offer.offerPriceText} (${offer.currencyCode})`,
        },
        {
          criterion: 'Warranty / Risk',
          traditionalOption: 'Complex return policies',
          thisProduct: offer.discountText || 'Satisfaction Guarantee',
        },
      ],
      ctaButtonText: `${ctaVerbs} (${offer.countryCode})`,
      trustBadges: [`${offer.countryName} Verified Link`, offer.offerPriceText, offer.discountText || 'Fast Access'],
      fullPresellDraft: `# ${offer.productName} — ${offer.countryName} Review (${langLabel})\n\nKey pain solved: ${offer.nichePain}\n\nOffer: ${offer.offerPriceText} (${offer.currencyCode})\n\n👉 [${ctaVerbs}]([PRESELL_CTA_LINK])`,
    },
    googleAdsKit: {
      bottomFunnelKeywords: [
        `"${offer.productName.toLowerCase()}"`,
        `"${offer.productName.toLowerCase()} ${offer.countryName.toLowerCase()}"`,
        `"${offer.productName.toLowerCase()} review"`,
        `"buy ${offer.productName.toLowerCase()} ${offer.countryName.toLowerCase()}"`,
        `"best ${offer.nichePain.split(',')[0].trim().toLowerCase()}"`,
      ],
      negativeKeywords: ['free', 'diy', 'used', 'amazon', 'temu', 'aliexpress', 'ebay', 'cheap', 'wholesale', 'scam'],
      headlines30: [
        offer.productName.slice(0, 30),
        `${offer.offerPriceText}`.slice(0, 30),
        `Official ${offer.countryCode} Offer`.slice(0, 30),
        'Verified Review & Specs',
      ],
      descriptions90: [
        `Looking for ${offer.productName} in ${offer.countryName}? Compare features & claim ${offer.offerPriceText}.`.slice(0, 90),
        `Solve ${offer.nichePain}. Check current ${offer.countryName} availability now.`.slice(0, 90),
      ],
      launchChecklist: [
        `Point Google Ads Final URL to your Global Presell (${offer.presellUrl || 'global-sell-beta.vercel.app'}) — preserve gclid.`,
        `Set campaign Location to Presence only in ${offer.countryName} and language to ${offer.languageName}.`,
        'Use Maximize Clicks with a controlled Max CPC cap until initial conversions record on your Presell.',
      ],
    },
    organicSocialKit: {
      fbGroupQueries: [
        `${offer.productName.split(' ').slice(0, 2).join(' ')} ${offer.countryName}`,
        `${offer.nichePain.split(' ').slice(0, 3).join(' ')} ${offer.countryName}`,
        `${offer.countryName} deals & recommendations`,
      ],
      fbGroupPosts: [
        {
          angle: `Helpful Discovery (${offer.countryName})`,
          headline: `Quick tip for ${offer.countryName} folks dealing with ${offer.nichePain}`,
          body: `Hey everyone — saw several people asking about ${offer.nichePain}.\n\nI put together a short comparison on ${offer.productName} and linked the ${offer.countryName} page (${offer.offerPriceText}) here if anyone wants to check it out:\n[PRESELL_LINK]\n\nHope this saves someone research time!`,
        },
      ],
      youtubeQueries: [
        `${offer.productName} review`,
        `${offer.nichePain.split(',')[0]} solution`,
      ],
      youtubeComments: [
        `Helpful video! For anyone in ${offer.countryName} researching ${offer.productName}, I left a quick comparison and current ${offer.offerPriceText} link here: [PRESELL_LINK]`,
      ],
      pinterestQueries: [
        `${offer.productName} ${offer.countryCode}`,
        `${offer.nichePain.split(',')[0]} tips`,
      ],
      pinterestPins: [
        {
          title: `${offer.productName} — ${offer.countryName} Guide (${offer.offerPriceText})`,
          description: `Solving ${offer.nichePain}. Read the comparison and claim ${offer.offerPriceText} here: [PRESELL_LINK]`,
        },
      ],
    },
  };
}

export const GlobalMediaScalersTab: React.FC = () => {
  const [subTab, setSubTab] = useState<'offers' | 'kit' | 'triage' | 'bot'>('offers');

  // Offers state
  const [offers, setOffers] = useState<GlobalOffer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OFFERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_OFFERS;
  });

  const [selectedOfferId, setSelectedOfferId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SELECTED_OFFER) || INITIAL_OFFERS[0].id;
    } catch {
      return INITIAL_OFFERS[0].id;
    }
  });

  // New Offer Form State
  const [isNewOfferOpen, setIsNewOfferOpen] = useState(false);
  const [newOfferName, setNewOfferName] = useState('');
  const [newOfferPain, setNewOfferPain] = useState('');
  const [newOfferCountryPreset, setNewOfferCountryPreset] = useState('AU');
  const [newOfferCustomCountry, setNewOfferCustomCountry] = useState('');
  const [newOfferLanguage, setNewOfferLanguage] = useState('English');
  const [newOfferCurrency, setNewOfferCurrency] = useState('AUD');
  const [newOfferPrice, setNewOfferPrice] = useState('Up to 70% Off');
  const [newOfferDiscount, setNewOfferDiscount] = useState('Fast Local Shipping · 30-Day Guarantee');
  const [newOfferAffiliateUrl, setNewOfferAffiliateUrl] = useState('');
  const [newOfferTrackingParam, setNewOfferTrackingParam] = useState<GlobalOffer['trackingParamName']>('sub2');
  const [newOfferPresellUrl, setNewOfferPresellUrl] = useState('https://global-sell-beta.vercel.app/');

  // Generated Kits Cache
  const [kitsByOffer, setKitsByOffer] = useState<Record<string, GlobalGeneratedKit>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.KITS_BY_OFFER);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });
  const [isGeneratingKit, setIsGeneratingKit] = useState(false);
  const [kitError, setKitError] = useState<string | null>(null);

  // Universal Triage Inbox (Nome + Nº de Membros + URL + País)
  const [inboxGroups, setInboxGroups] = useState<GlobalInboxGroup[]>(() => {
    try {
      const inboxRaw = localStorage.getItem(STORAGE_KEYS.INBOX);
      const pendingRaw = localStorage.getItem(STORAGE_KEYS.PENDING_BRIDGE);
      const inboxArr: GlobalInboxGroup[] = inboxRaw ? JSON.parse(inboxRaw) : [];
      const pendingArr: any[] = pendingRaw ? JSON.parse(pendingRaw) : [];
      if (pendingArr.length > 0) {
        const mappedPending: GlobalInboxGroup[] = pendingArr.map((g, idx) => {
          const det = detectScopeAndCountry(g.name || '', g.searchTerm);
          return {
            id: g.id || `inbox-${Date.now()}-${idx}`,
            name: g.name || 'Facebook Group',
            url: g.url || '',
            membersCount: Number(g.membersCount) || 0,
            suggestedScope: det.scope,
            detectedCountry: det.country,
            searchTerm: g.searchTerm,
            mappedAt: g.mappedAt || new Date().toLocaleDateString('pt-BR'),
          };
        });
        const merged = [...mappedPending, ...inboxArr].filter(
          (item, i, self) => item.url && i === self.findIndex((t) => t.url.toLowerCase() === item.url.toLowerCase())
        );
        localStorage.removeItem(STORAGE_KEYS.PENDING_BRIDGE);
        return merged;
      }
      return Array.isArray(inboxArr) ? inboxArr : [];
    } catch {
      return [];
    }
  });

  // Global Mapped Groups + Named Audiences
  const [globalGroups, setGlobalGroups] = useState<GlobalGroupItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GROUPS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [globalAudiences, setGlobalAudiences] = useState<GlobalAudience[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIENCES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedAudienceId, setSelectedAudienceId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SELECTED_AUDIENCE) || '';
    } catch {
      return '';
    }
  });

  // Triage UI controls
  const [selectedInboxIds, setSelectedInboxIds] = useState<string[]>([]);
  const [inboxFilterText, setInboxFilterText] = useState('');
  const [inboxScopeFilter, setInboxScopeFilter] = useState<'all' | 'global' | 'brazil'>('all');
  const [routeAudienceName, setRouteAudienceName] = useState('');
  const [routeCountryPreset, setRouteCountryPreset] = useState('Australia');
  const [routeCustomCountry, setRouteCustomCountry] = useState('');
  const [routeLanguage, setRouteLanguage] = useState('English');

  // Manual / Bulk Inbox Add
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  const [manualText, setManualText] = useState('');
  const [manualCountryTag, setManualCountryTag] = useState('Australia');

  // Pull from Brazil groups drawer
  const [isBrazilPullOpen, setIsBrazilPullOpen] = useState(false);
  const [brazilSearchFilter, setBrazilSearchFilter] = useState('');
  const [selectedBrazilIdsToCopy, setSelectedBrazilIdsToCopy] = useState<string[]>([]);

  // Global Bot Dispatcher State
  const [botChannel, setBotChannel] = useState<'facebook' | 'youtube' | 'pinterest'>('facebook');
  const [isBotRunning, setIsBotRunning] = useState<boolean>(() => globalEnBotRunner.getIsRunning());
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => globalEnBotRunner.getRemainingSeconds());
  const [currentPostIndex, setCurrentPostIndex] = useState<number>(0);
  const [customPostHeadline, setCustomPostHeadline] = useState('');
  const [customPostBody, setCustomPostBody] = useState('');
  const [botLogs, setBotLogs] = useState<FacebookPostLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Global YouTube & Pinterest queues
  const [ytItems, setYtItems] = useState<GlobalYouTubeItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.YT_ITEMS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [ytNewTitle, setYtNewTitle] = useState('');
  const [ytNewUrl, setYtNewUrl] = useState('');
  const [pinItems, setPinItems] = useState<GlobalPinterestItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PIN_ITEMS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [banner, setBanner] = useState<{ message: string; tone: 'success' | 'warning' | 'info' } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeOffer = useMemo(
    () => offers.find((o) => o.id === selectedOfferId) || offers[0],
    [offers, selectedOfferId]
  );

  const activeKit = useMemo(() => {
    if (!activeOffer) return null;
    return kitsByOffer[activeOffer.id] || buildStructuredTemplateKit(activeOffer);
  }, [activeOffer, kitsByOffer]);

  // Persist localStorage slices (strictly isolated from Brazil keys)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(offers));
    } catch {}
  }, [offers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_OFFER, selectedOfferId);
    } catch {}
  }, [selectedOfferId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INBOX, JSON.stringify(inboxGroups));
    } catch {}
  }, [inboxGroups]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(globalGroups));
    } catch {}
  }, [globalGroups]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIENCES, JSON.stringify(globalAudiences));
    } catch {}
  }, [globalAudiences]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_AUDIENCE, selectedAudienceId);
    } catch {}
  }, [selectedAudienceId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.KITS_BY_OFFER, JSON.stringify(kitsByOffer));
    } catch {}
  }, [kitsByOffer]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(botLogs.slice(0, 300)));
    } catch {}
  }, [botLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.YT_ITEMS, JSON.stringify(ytItems));
    } catch {}
  }, [ytItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PIN_ITEMS, JSON.stringify(pinItems));
    } catch {}
  }, [pinItems]);

  // Sync default headline/body when activeOffer/kit changes
  useEffect(() => {
    if (!activeKit || !activeOffer) return;
    const firstPost = activeKit.organicSocialKit.fbGroupPosts[0];
    if (firstPost) {
      const presellLink = appendTrackingParam(
        activeOffer.presellUrl || 'https://global-sell-beta.vercel.app/',
        'utm_source',
        'facebook_groups'
      );
      setCustomPostHeadline(firstPost.headline);
      setCustomPostBody(firstPost.body.replace(/\[PRESELL_LINK\]/g, presellLink));
    }
  }, [activeOffer?.id, activeKit?.generatedAt]);

  // Extension listeners (routed cleanly into Universal Inbox / Global YT / Global Post Results while this tab is active)
  useEffect(() => {
    const ingestGroupsToInbox = (incoming: any[], searchQuery?: string) => {
      if (!Array.isArray(incoming) || incoming.length === 0) return;
      const normalized: GlobalInboxGroup[] = incoming
        .filter((g) => g && g.url)
        .map((g, idx) => {
          const det = detectScopeAndCountry(g.name || '', searchQuery || g.searchTerm);
          return {
            id: g.id || `inbox-${Date.now()}-${idx}`,
            name: String(g.name || 'Facebook Group').trim(),
            url: String(g.url).trim(),
            membersCount: Number(g.membersCount) || 0,
            suggestedScope: det.scope,
            detectedCountry: det.country,
            searchTerm: searchQuery || g.searchTerm,
            mappedAt: new Date().toLocaleDateString('pt-BR'),
          };
        });

      setInboxGroups((prev) => {
        const merged = [...normalized, ...prev];
        return merged.filter(
          (item, i, self) => i === self.findIndex((t) => t.url.toLowerCase() === item.url.toLowerCase())
        );
      });
      setSelectedInboxIds(normalized.map((g) => g.id));
      setSubTab('triage');
      setBanner({
        message: `${normalized.length} grupos recebidos na Caixa Geral de Triagem! Dê um Nome ao Público, escolha o País (ou Brasil) e redirecione.`,
        tone: 'success',
      });
    };

    const ingestYtVideos = (videos: any[]) => {
      if (!Array.isArray(videos) || videos.length === 0) return;
      const presellYt = activeOffer
        ? appendTrackingParam(activeOffer.presellUrl || 'https://global-sell-beta.vercel.app/', 'utm_source', 'youtube')
        : 'https://global-sell-beta.vercel.app/';
      const defaultComment = (
        activeKit?.organicSocialKit.youtubeComments[0] ||
        'Helpful breakdown! Comparison & details here: [PRESELL_LINK]'
      ).replace(/\[PRESELL_LINK\]/g, presellYt);

      setYtItems((prev) => {
        const mapped: GlobalYouTubeItem[] = videos
          .filter((v) => v && v.url)
          .map((v, idx) => ({
            id: v.id || `gyt-${Date.now()}-${idx}`,
            title: v.title || 'YouTube Video',
            url: v.url,
            channelName: v.channelName || 'YouTube',
            commentText: defaultComment,
            status: 'ready',
          }));
        const merged = [...mapped, ...prev];
        return merged.filter((item, i, self) => i === self.findIndex((t) => t.url === item.url));
      });
      setBanner({
        message: `${videos.length} vídeos do YouTube importados para a fila do Robô Global!`,
        tone: 'success',
      });
    };

    const applyPostResult = (payload: any) => {
      if (!payload) return;
      const { logId, groupId, groupUrl, groupName, approvalStatus, note } = payload;
      const now = new Date();
      const formattedNow = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })}`;
      const normalizedStatus: FacebookPostLog['approvalStatus'] =
        approvalStatus === 'published' ||
        approvalStatus === 'awaiting_admin' ||
        approvalStatus === 'not_member' ||
        approvalStatus === 'join_requested' ||
        approvalStatus === 'rate_limited' ||
        approvalStatus === 'unavailable'
          ? approvalStatus
          : 'pending_verification';

      const isErr =
        normalizedStatus === 'not_member' ||
        normalizedStatus === 'rate_limited' ||
        normalizedStatus === 'unavailable';

      setBotLogs((prev) => {
        const idx = prev.findIndex(
          (l) => (logId && l.id === logId) || (groupId && l.groupId === groupId) || (groupUrl && l.groupUrl === groupUrl)
        );
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            postedAt: formattedNow,
            status: isErr ? 'error' : 'success',
            approvalStatus: normalizedStatus,
            isVerifiedReal: true,
          };
          return updated;
        }
        return [
          {
            id: logId || `glog-${now.getTime()}`,
            groupId: groupId || `gfb-${now.getTime()}`,
            groupName: groupName || 'Global Facebook Group',
            groupUrl: groupUrl || 'https://www.facebook.com/groups',
            postedAt: formattedNow,
            headline: note || 'Global post verified',
            status: isErr ? 'error' : 'success',
            approvalStatus: normalizedStatus,
            isVerifiedReal: true,
            intervalWaitedSeconds: 0,
            checkoutUrl: activeOffer?.presellUrl || '',
          },
          ...prev,
        ];
      });

      if (normalizedStatus === 'rate_limited') {
        globalEnBotRunner.stop();
        setIsBotRunning(false);
        setBanner({
          message: 'Freio anti-bloqueio ativado: Facebook limitou ações temporariamente. Robô Global pausado por segurança.',
          tone: 'warning',
        });
      } else if (normalizedStatus === 'unavailable' && groupUrl) {
        setGlobalGroups((prev) => prev.filter((g) => g.url !== groupUrl));
      }
    };

    const onGroupsEv = (ev: any) => {
      if (Array.isArray(ev?.detail?.groups)) {
        ingestGroupsToInbox(ev.detail.groups, ev.detail.searchQuery);
      }
    };
    const onYtEv = (ev: any) => {
      if (Array.isArray(ev?.detail?.videos)) ingestYtVideos(ev.detail.videos);
    };
    const onPostResultEv = (ev: any) => applyPostResult(ev?.detail);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('autoviral_bridge_channel');
      bc.onmessage = (ev) => {
        if (!ev?.data) return;
        if (ev.data.action === 'AUTOVIRAL_IMPORT_GROUPS_FROM_EXTENSION') {
          if (Array.isArray(ev.data.groups)) ingestGroupsToInbox(ev.data.groups, ev.data.searchQuery);
          if (Array.isArray(ev.data.ytVideos)) ingestYtVideos(ev.data.ytVideos);
        } else if (ev.data.action === 'AUTOVIRAL_IMPORT_YOUTUBE_VIDEOS_FROM_EXTENSION') {
          ingestYtVideos(ev.data.videos || []);
        } else if (ev.data.action === 'AUTOVIRAL_FB_POST_RESULT') {
          applyPostResult(ev.data);
        }
      };
    } catch {}

    window.addEventListener('autoviral_extension_groups_received', onGroupsEv);
    window.addEventListener('autoviral_extension_youtube_videos_received', onYtEv);
    window.addEventListener('autoviral_fb_post_result', onPostResultEv);

    return () => {
      if (bc) {
        try {
          bc.close();
        } catch {}
      }
      window.removeEventListener('autoviral_extension_groups_received', onGroupsEv);
      window.removeEventListener('autoviral_extension_youtube_videos_received', onYtEv);
      window.removeEventListener('autoviral_fb_post_result', onPostResultEv);
    };
  }, [activeOffer, activeKit]);

  const copyText = (text: string, id: string) => {
    try {
      navigator.clipboard?.writeText(text);
    } catch {}
    setCopiedId(id);
    setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1800);
  };

  // Offer CRUD
  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferName.trim() || !newOfferAffiliateUrl.trim()) return;
    const preset = COUNTRY_PRESETS.find((c) => c.code === newOfferCountryPreset);
    const resolvedCountry =
      newOfferCountryPreset === 'CUSTOM'
        ? newOfferCustomCountry.trim() || 'Global'
        : preset?.name || 'Australia';
    const created: GlobalOffer = {
      id: `offer-${Date.now()}`,
      productName: newOfferName.trim(),
      nichePain: newOfferPain.trim() || 'Buyer problem & product comparison',
      countryCode: newOfferCountryPreset === 'CUSTOM' ? resolvedCountry.slice(0, 3).toUpperCase() : newOfferCountryPreset,
      countryName: resolvedCountry,
      languageName: newOfferLanguage.trim() || 'English',
      currencyCode: newOfferCurrency.trim() || 'USD',
      offerPriceText: newOfferPrice.trim() || 'Special Offer',
      discountText: newOfferDiscount.trim() || 'Limited Offer',
      affiliateUrl: newOfferAffiliateUrl.trim(),
      trackingParamName: newOfferTrackingParam,
      presellUrl: newOfferPresellUrl.trim() || 'https://global-sell-beta.vercel.app/',
      createdAt: new Date().toISOString(),
    };
    setOffers((prev) => [created, ...prev]);
    setSelectedOfferId(created.id);
    setIsNewOfferOpen(false);
    setNewOfferName('');
    setNewOfferPain('');
    setNewOfferAffiliateUrl('');
    setBanner({
      message: `Oferta "${created.productName}" (${created.countryName} · ${created.languageName}) salva no Modo Global!`,
      tone: 'success',
    });
  };

  const handleUpdateOfferField = (field: keyof GlobalOffer, value: string) => {
    if (!activeOffer) return;
    setOffers((prev) => prev.map((o) => (o.id === activeOffer.id ? { ...o, [field]: value } : o)));
  };

  const handleDeleteOffer = (id: string) => {
    if (offers.length <= 1) return;
    const remaining = offers.filter((o) => o.id !== id);
    setOffers(remaining);
    if (selectedOfferId === id && remaining[0]) {
      setSelectedOfferId(remaining[0].id);
    }
  };

  // Generate Kit via Gemini Backend (with explicit local template option if API unavailable)
  const handleGenerateWithGemini = async () => {
    if (!activeOffer) return;
    setIsGeneratingKit(true);
    setKitError(null);
    try {
      const resp = await fetch('/api/global/generate-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activeOffer),
      });
      const data = await resp.json();
      if (!resp.ok || !data?.kit) {
        setKitError(data?.error || 'Não foi possível gerar via Gemini agora.');
        return;
      }
      const kit: GlobalGeneratedKit = {
        source: 'gemini',
        generatedAt: new Date().toISOString(),
        ...data.kit,
      };
      setKitsByOffer((prev) => ({ ...prev, [activeOffer.id]: kit }));
      setBanner({
        message: `Kit completo gerado com IA em ${activeOffer.languageName} (${activeOffer.countryName}) para "${activeOffer.productName}"!`,
        tone: 'success',
      });
    } catch (err: any) {
      setKitError(err?.message || 'Erro de rede ao consultar o servidor.');
    } finally {
      setIsGeneratingKit(false);
    }
  };

  const handleApplyTemplateKit = () => {
    if (!activeOffer) return;
    const tpl = buildStructuredTemplateKit(activeOffer);
    setKitsByOffer((prev) => ({ ...prev, [activeOffer.id]: tpl }));
    setKitError(null);
    setBanner({
      message: `Estrutura base pronta aplicada em ${activeOffer.languageName} para "${activeOffer.productName}".`,
      tone: 'info',
    });
  };

  // Filtered Inbox Groups
  const filteredInbox = useMemo(() => {
    return inboxGroups.filter((g) => {
      if (inboxScopeFilter !== 'all' && g.suggestedScope !== inboxScopeFilter) return false;
      if (inboxFilterText.trim()) {
        const q = inboxFilterText.toLowerCase();
        return (
          g.name.toLowerCase().includes(q) ||
          g.detectedCountry.toLowerCase().includes(q) ||
          g.url.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [inboxGroups, inboxScopeFilter, inboxFilterText]);

  const toggleInboxSelect = (id: string) => {
    setSelectedInboxIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleManualAddToInbox = () => {
    const lines = manualText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    const added: GlobalInboxGroup[] = lines.map((line, idx) => {
      // Accepts: "Name | 42000 | https://facebook.com/groups/..." OR just URL
      const parts = line.split('|').map((p) => p.trim());
      let url = '';
      let name = '';
      let members = 0;

      if (parts.length >= 2) {
        const urlPart = parts.find((p) => p.includes('facebook.com/groups')) || parts[parts.length - 1];
        url = /^https?:\/\//i.test(urlPart) ? urlPart : `https://www.facebook.com/groups/${urlPart}`;
        name = parts[0] && !parts[0].includes('facebook.com') ? parts[0] : 'Facebook Group';
        const numPart = parts.find((p) => /^\d[\d.,]*$/.test(p.replace(/[kKmM]/g, '')));
        if (numPart) {
          members = parseInt(numPart.replace(/[^\d]/g, ''), 10) || 0;
        }
      } else {
        const urlMatch = line.match(/https?:\/\/[^\s]+|facebook\.com\/groups\/[a-zA-Z0-9._-]+/i);
        url = urlMatch
          ? urlMatch[0].startsWith('http')
            ? urlMatch[0]
            : `https://${urlMatch[0]}`
          : `https://www.facebook.com/groups/${line.replace(/[^a-zA-Z0-9._-]/g, '')}`;
        const slug = url.split('/groups/')[1]?.replace(/\/$/, '') || 'Group';
        name = slug.replace(/[-_.]/g, ' ');
      }

      const scope: 'global' | 'brazil' = manualCountryTag.toLowerCase().includes('brasil') ? 'brazil' : 'global';
      return {
        id: `manual-inbox-${Date.now()}-${idx}`,
        name,
        url,
        membersCount: members,
        suggestedScope: scope,
        detectedCountry: manualCountryTag.trim() || 'Global',
        mappedAt: new Date().toLocaleDateString('pt-BR'),
      };
    });

    setInboxGroups((prev) => {
      const merged = [...added, ...prev];
      return merged.filter((item, i, self) => i === self.findIndex((t) => t.url.toLowerCase() === item.url.toLowerCase()));
    });
    setSelectedInboxIds((prev) => [...new Set([...added.map((a) => a.id), ...prev])]);
    setManualText('');
    setIsManualAddOpen(false);
    setBanner({
      message: `${added.length} grupos adicionados à Caixa Geral de Triagem. Agora nomeie um Público e redirecione!`,
      tone: 'success',
    });
  };

  // Read-only view of existing Brazil groups (never modifies Brazil unless user explicitly copies or moves)
  const existingBrazilGroups = useMemo<FacebookGroup[]>(() => {
    try {
      const raw = localStorage.getItem('autoviral_fb_mapped_groups_v5_real');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [isBrazilPullOpen]);

  const filteredBrazilPull = useMemo(() => {
    if (!brazilSearchFilter.trim()) return existingBrazilGroups.slice(0, 80);
    const q = brazilSearchFilter.toLowerCase();
    return existingBrazilGroups
      .filter((g) => g.name.toLowerCase().includes(q) || g.url.toLowerCase().includes(q))
      .slice(0, 80);
  }, [existingBrazilGroups, brazilSearchFilter]);

  const handlePullBrazilGroupsToInbox = (removeFromBrazil: boolean) => {
    if (selectedBrazilIdsToCopy.length === 0) return;
    const chosen = existingBrazilGroups.filter((g) => selectedBrazilIdsToCopy.includes(g.id));
    const pulled: GlobalInboxGroup[] = chosen.map((g) => ({
      id: `pulled-${g.id}`,
      name: g.name,
      url: g.url,
      membersCount: g.membersCount || 0,
      suggestedScope: 'global',
      detectedCountry: 'Global / Redirecionado',
      searchTerm: g.searchTerm,
      mappedAt: g.mappedAt || 'Hoje',
    }));

    setInboxGroups((prev) => {
      const merged = [...pulled, ...prev];
      return merged.filter((item, i, self) => i === self.findIndex((t) => t.url.toLowerCase() === item.url.toLowerCase()));
    });
    setSelectedInboxIds((prev) => [...new Set([...pulled.map((p) => p.id), ...prev])]);

    if (removeFromBrazil) {
      try {
        const remainingBr = existingBrazilGroups.filter((g) => !selectedBrazilIdsToCopy.includes(g.id));
        localStorage.setItem('autoviral_fb_mapped_groups_v5_real', JSON.stringify(remainingBr));
      } catch {}
    }

    setSelectedBrazilIdsToCopy([]);
    setIsBrazilPullOpen(false);
    setBanner({
      message: `${pulled.length} grupos trazidos para a Caixa Geral! Selecione o Público Nomeado e envie para o país desejado.`,
      tone: 'success',
    });
  };

  // Route selected Inbox groups -> Named Global Audience OR Brazil Robot (preserving all Brazil data!)
  const handleRouteSelectedGroups = (destination: 'global' | 'brazil') => {
    const selectedItems = inboxGroups.filter((g) => selectedInboxIds.includes(g.id));
    if (selectedItems.length === 0) {
      setBanner({ message: 'Marque pelo menos 1 grupo na Caixa Geral para redirecionar.', tone: 'warning' });
      return;
    }

    const finalCountry =
      destination === 'brazil'
        ? 'Brasil'
        : routeCountryPreset === 'Qualquer País (Personalizado)'
        ? routeCustomCountry.trim() || 'Global'
        : routeCountryPreset;
    const finalLang = destination === 'brazil' ? 'Português' : routeLanguage.trim() || 'English';
    const audienceLabel =
      routeAudienceName.trim() || `${finalCountry} · Público (${selectedItems.length} grupos)`;

    if (destination === 'global') {
      const newGlobalGroupObjs: GlobalGroupItem[] = selectedItems.map((item) => ({
        id: `gfb-${item.id}`,
        name: item.name,
        url: item.url,
        membersCount: item.membersCount || 0,
        privacy: 'Público',
        niche: audienceLabel,
        mappedAt: item.mappedAt,
        dispatchCount: 0,
        status: 'ready',
        countryName: finalCountry,
        languageName: finalLang,
        isVerifiedReal: true,
        validationStatus: 'verified',
      }));

      let updatedGroupsList: GlobalGroupItem[] = [];
      setGlobalGroups((prev) => {
        const merged = [...newGlobalGroupObjs, ...prev];
        updatedGroupsList = merged.filter(
          (g, i, self) => i === self.findIndex((t) => t.url.toLowerCase() === g.url.toLowerCase())
        );
        return updatedGroupsList;
      });

      const resolvedIds = newGlobalGroupObjs.map((g) => {
        const existing = globalGroups.find((eg) => eg.url.toLowerCase() === g.url.toLowerCase());
        return existing ? existing.id : g.id;
      });

      const newAudId = `gaud-${Date.now()}`;
      setGlobalAudiences((prev) => {
        const existingIdx = prev.findIndex((a) => a.name.toLowerCase() === audienceLabel.toLowerCase());
        if (existingIdx >= 0) {
          const copy = [...prev];
          copy[existingIdx] = {
            ...copy[existingIdx],
            countryName: finalCountry,
            languageName: finalLang,
            groupIds: Array.from(new Set([...copy[existingIdx].groupIds, ...resolvedIds])),
          };
          setSelectedAudienceId(copy[existingIdx].id);
          return copy;
        }
        setSelectedAudienceId(newAudId);
        return [
          {
            id: newAudId,
            name: audienceLabel,
            countryName: finalCountry,
            languageName: finalLang,
            groupIds: resolvedIds,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ];
      });

      setInboxGroups((prev) => prev.filter((g) => !selectedInboxIds.includes(g.id)));
      setSelectedInboxIds([]);
      setRouteAudienceName('');
      setBanner({
        message: `${selectedItems.length} grupos enviados para o Público Global "${audienceLabel}" (${finalCountry})! Agora basta selecioná-lo na aba "04. Robô Global" para publicar.`,
        tone: 'success',
      });
    } else {
      // Safely append into Brazil storage without deleting or overwriting ANY existing Brazil group or audience
      try {
        const rawBr = localStorage.getItem('autoviral_fb_mapped_groups_v5_real');
        const currentBr: FacebookGroup[] = rawBr ? JSON.parse(rawBr) : [];
        const newBrGroups: FacebookGroup[] = selectedItems.map((item) => ({
          id: `br-inbox-${item.id}`,
          name: item.name,
          url: item.url,
          membersCount: item.membersCount || 0,
          privacy: 'Público',
          niche: audienceLabel,
          mappedAt: item.mappedAt,
          dispatchCount: 0,
          status: 'ready',
          searchFolder: 'geral',
          isVerifiedReal: true,
          validationStatus: 'verified',
        }));

        const mergedBr = [...newBrGroups, ...currentBr].filter(
          (g, i, self) => i === self.findIndex((t) => t.url.toLowerCase() === g.url.toLowerCase())
        );
        localStorage.setItem('autoviral_fb_mapped_groups_v5_real', JSON.stringify(mergedBr));

        const rawAudBr = localStorage.getItem('autoviral_fb_audiences_v4');
        const currentAudBr = rawAudBr ? JSON.parse(rawAudBr) : [];
        const addedIds = newBrGroups.map((g) => {
          const found = mergedBr.find((m) => m.url.toLowerCase() === g.url.toLowerCase());
          return found ? found.id : g.id;
        });
        const totalMembers = newBrGroups.reduce((acc, g) => acc + (g.membersCount || 0), 0);
        const newBrAudience = {
          id: `aud-br-${Date.now()}`,
          name: audienceLabel,
          description: `Enviado pela Triagem Geral (${addedIds.length} grupos)`,
          groupIds: addedIds,
          groupsCount: addedIds.length,
          estimatedMembers: totalMembers,
          niche: 'Geral Brasil',
          targetProductId: '',
          createdAt: new Date().toISOString(),
          groupNamesPreview: newBrGroups.slice(0, 3).map((g) => g.name),
        };
        localStorage.setItem('autoviral_fb_audiences_v4', JSON.stringify([newBrAudience, ...currentAudBr]));
      } catch {}

      setInboxGroups((prev) => prev.filter((g) => !selectedInboxIds.includes(g.id)));
      setSelectedInboxIds([]);
      setRouteAudienceName('');
      setBanner({
        message: `${selectedItems.length} grupos enviados para o Robô Brasil no público "${audienceLabel}"! Todos os seus dados anteriores do Brasil foram 100% preservados.`,
        tone: 'success',
      });
    }
  };

  // Active Audience's Groups for Global Bot
  const activeAudience = useMemo(
    () => globalAudiences.find((a) => a.id === selectedAudienceId) || globalAudiences[0] || null,
    [globalAudiences, selectedAudienceId]
  );

  const activeAudienceGroups = useMemo(() => {
    if (!activeAudience) return globalGroups;
    const setIds = new Set(activeAudience.groupIds);
    const list = globalGroups.filter((g) => setIds.has(g.id));
    return list.length > 0 ? list : globalGroups;
  }, [activeAudience, globalGroups]);

  // Global Bot Execution via Extension v1.4.0
  const executeSingleGlobalPost = () => {
    if (activeAudienceGroups.length === 0) {
      globalEnBotRunner.stop();
      setIsBotRunning(false);
      setBanner({
        message: 'Nenhum grupo no Público Global selecionado. Crie um público na aba "03. Triagem & Públicos" primeiro.',
        tone: 'warning',
      });
      return;
    }

    const group = activeAudienceGroups[currentPostIndex % activeAudienceGroups.length];
    const presellLink = activeOffer
      ? appendTrackingParam(activeOffer.presellUrl || 'https://global-sell-beta.vercel.app/', 'utm_source', 'facebook_groups')
      : 'https://global-sell-beta.vercel.app/';

    const headline = customPostHeadline.trim();
    const bodyWithLink = customPostBody.replace(/\[PRESELL_LINK\]/g, presellLink).trim();
    const fullText = headline ? `${headline}\n\n${bodyWithLink}` : bodyWithLink;

    try {
      navigator.clipboard?.writeText(fullText);
    } catch {}

    const now = new Date();
    const logId = `glog-${now.getTime()}`;
    const waited = Math.floor(Math.random() * 101) + 300;
    const newLog: FacebookPostLog = {
      id: logId,
      groupId: group.id,
      groupName: `${group.name} (${(group.membersCount || 0).toLocaleString('en-US')} members)`,
      groupUrl: group.url,
      postedAt: `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })}`,
      headline: (headline || bodyWithLink).slice(0, 55) + '...',
      status: 'success',
      approvalStatus: 'pending_verification',
      isVerifiedReal: false,
      intervalWaitedSeconds: waited,
      checkoutUrl: presellLink,
    };

    setBotLogs((prev) => [newLog, ...prev]);
    setGlobalGroups((prev) =>
      prev.map((g) =>
        g.id === group.id ? { ...g, dispatchCount: (g.dispatchCount || 0) + 1, lastDispatchedAt: 'Sent via Global Bot' } : g
      )
    );

    try {
      window.postMessage(
        {
          type: 'AUTOVIRAL_OPEN_GROUP_FOR_POST',
          logId,
          groupId: group.id,
          groupUrl: group.url,
          groupName: group.name,
          fullText,
          autoJoinAndPost: true,
        },
        '*'
      );
    } catch {}

    setBanner({
      message: `Grupo Global "${group.name}" aberto! Extensão v1.4.0 solicitando entrada/postando em ${activeAudience?.countryName || activeOffer?.countryName}.`,
      tone: 'success',
    });
    setCurrentPostIndex((prev) => (prev + 1) % activeAudienceGroups.length);
  };

  // Re-attach Global runner callbacks on mount/update
  useEffect(() => {
    globalEnBotRunner.setCallbacks(
      () => executeSingleGlobalPost(),
      (rem) => setSecondsRemaining(rem),
      () => {
        setIsBotRunning(false);
        setBanner({
          message: 'Robô Global pausado automaticamente porque você iniciou o Robô Brasil (proteção anti-bloqueio).',
          tone: 'info',
        });
      }
    );
    setIsBotRunning(globalEnBotRunner.getIsRunning());
  });

  const handleToggleGlobalBot = () => {
    if (isBotRunning) {
      globalEnBotRunner.stop();
      setIsBotRunning(false);
    } else {
      globalEnBotRunner.start(
        350,
        true,
        () => executeSingleGlobalPost(),
        (rem) => setSecondsRemaining(rem),
        () => {
          setIsBotRunning(false);
          setBanner({
            message: 'Robô Global pausado automaticamente porque o Robô Brasil foi iniciado.',
            tone: 'info',
          });
        }
      );
      setIsBotRunning(true);
      setBanner({
        message: 'Robô Global ativado (300s–400s)! Se o Robô Brasil estivesse rodando, ele foi pausado automaticamente para proteger sua conta.',
        tone: 'success',
      });
    }
  };

  // Presell CTA Output Link & Channel Links
  const presellOutputCtaLink = useMemo(() => {
    if (!activeOffer) return '';
    const slug = activeOffer.productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 24);
    const val = `presell_${slug}_${activeOffer.countryCode.toLowerCase()}`;
    return appendTrackingParam(activeOffer.affiliateUrl, activeOffer.trackingParamName || 'sub2', val);
  }, [activeOffer]);

  const channelPresellLinks = useMemo(() => {
    const base = activeOffer?.presellUrl || 'https://global-sell-beta.vercel.app/';
    const campSlug = (activeOffer?.productName || 'offer')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .slice(0, 20);
    return [
      {
        id: 'gads',
        label: 'Google Ads (Final URL — preserva gclid)',
        url: appendTrackingParam(appendTrackingParam(base, 'utm_source', 'google_ads'), 'utm_campaign', campSlug),
      },
      {
        id: 'fb',
        label: 'Facebook Groups Global',
        url: appendTrackingParam(appendTrackingParam(base, 'utm_source', 'facebook_groups'), 'utm_campaign', campSlug),
      },
      {
        id: 'yt',
        label: 'YouTube Comments Global',
        url: appendTrackingParam(appendTrackingParam(base, 'utm_source', 'youtube'), 'utm_campaign', campSlug),
      },
      {
        id: 'pin',
        label: 'Pinterest Pins Global',
        url: appendTrackingParam(appendTrackingParam(base, 'utm_source', 'pinterest'), 'utm_campaign', campSlug),
      },
    ];
  }, [activeOffer]);

  const inboxSelectedMembersSum = useMemo(
    () =>
      inboxGroups
        .filter((g) => selectedInboxIds.includes(g.id))
        .reduce((acc, g) => acc + (g.membersCount || 0), 0),
    [inboxGroups, selectedInboxIds]
  );

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Workspace Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Modo Global</span>
            <span aria-hidden="true">·</span>
            <span>Qualquer País & Idioma</span>
            <span aria-hidden="true">·</span>
            <span>Isolado do Robô Brasil</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Central Internacional MediaScalers, Global Presell & Grupos por País
          </h2>
          <p className="text-xs text-slate-400 max-w-3xl">
            Gere kits de Google Ads + Global Presell para qualquer produto, separe grupos mapeados entre Brasil e qualquer outro país em Públicos Nomeados, e publique no automático com trava de segurança mútua.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="text-right text-xs text-slate-400 tabular-nums">
            <div>{inboxGroups.length} na Caixa Geral</div>
            <div>{globalAudiences.length} Públicos Globais · {globalGroups.length} grupos</div>
          </div>
          <button
            type="button"
            onClick={() => setIsNewOfferOpen(true)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Oferta Global</span>
          </button>
        </div>
      </div>

      {/* Contextual Status Banner */}
      {banner && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs flex items-center justify-between gap-3 ${
            banner.tone === 'success'
              ? 'bg-emerald-950/40 border-emerald-800/70 text-emerald-200'
              : banner.tone === 'warning'
              ? 'bg-amber-950/40 border-amber-800/70 text-amber-200'
              : 'bg-slate-900 border-slate-700 text-slate-200'
          }`}
        >
          <span>{banner.message}</span>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="text-slate-400 hover:text-white cursor-pointer shrink-0"
            aria-label="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Segmented Sub-Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-xl">
        {[
          { id: 'offers' as const, label: '01. Ofertas & Links Presell' },
          { id: 'kit' as const, label: '02. Kit Presell & Google Ads' },
          {
            id: 'triage' as const,
            label: `03. Triagem & Públicos (${inboxGroups.length} Caixa · ${globalAudiences.length} Públicos)`,
          },
          { id: 'bot' as const, label: '04. Robô Global (FB · YT · Pin)' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSubTab(item.id)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              subTab === item.id
                ? 'bg-cyan-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: OFFERS & UNIVERSAL PRESELL TRACKING                            */}
      {/* ===================================================================== */}
      {subTab === 'offers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Offers List */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Ofertas Cadastradas ({offers.length})</h3>
              <button
                type="button"
                onClick={() => setIsNewOfferOpen(true)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
              >
                + Adicionar
              </button>
            </div>

            <div className="divide-y divide-slate-800">
              {offers.map((offer) => {
                const isSelected = activeOffer?.id === offer.id;
                return (
                  <div
                    key={offer.id}
                    onClick={() => setSelectedOfferId(offer.id)}
                    className={`py-3 px-2.5 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'bg-slate-800/90' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{offer.productName}</div>
                        <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                          <span>{offer.countryName}</span>
                          <span aria-hidden="true">·</span>
                          <span>{offer.languageName}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{offer.currencyCode}</span>
                        </div>
                      </div>
                      {offers.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOffer(offer.id);
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                          title="Excluir oferta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Offer Editor & Universal Link Tracking Builder */}
          {activeOffer && (
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">{activeOffer.productName}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeOffer.countryName} · {activeOffer.languageName} · {activeOffer.offerPriceText}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSubTab('kit')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Abrir Kit Google Ads & Presell
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-slate-300">Nome do Produto</span>
                  <input
                    type="text"
                    value={activeOffer.productName}
                    onChange={(e) => handleUpdateOfferField('productName', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-slate-300">País Alvo (Qualquer País)</span>
                  <input
                    type="text"
                    value={activeOffer.countryName}
                    onChange={(e) => handleUpdateOfferField('countryName', e.target.value)}
                    placeholder="Ex: Australia, United States, Germany, Portugal..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-slate-300">Idioma das Copies & Buscas</span>
                  <input
                    type="text"
                    value={activeOffer.languageName}
                    onChange={(e) => handleUpdateOfferField('languageName', e.target.value)}
                    placeholder="Ex: English, Español, Deutsch, Français..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-slate-300">Dor Principal / Ângulo de Venda</span>
                  <input
                    type="text"
                    value={activeOffer.nichePain}
                    onChange={(e) => handleUpdateOfferField('nichePain', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </label>

                <label className="block space-y-1.5 md:col-span-2">
                  <span className="text-xs font-medium text-slate-300">
                    Link de Afiliado Final (MediaScalers, ClickBank, BuyGoods ou Qualquer Rede)
                  </span>
                  <input
                    type="url"
                    value={activeOffer.affiliateUrl}
                    onChange={(e) => handleUpdateOfferField('affiliateUrl', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-slate-300">
                    Link da Sua Página na Global Presell (global-sell-beta.vercel.app)
                  </span>
                  <input
                    type="url"
                    value={activeOffer.presellUrl}
                    onChange={(e) => handleUpdateOfferField('presellUrl', e.target.value)}
                    placeholder="https://global-sell-beta.vercel.app/sua-pagina"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none focus:border-cyan-500"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-slate-300">Parâmetro de Rastreio no Link de Afiliado</span>
                  <select
                    value={activeOffer.trackingParamName}
                    onChange={(e) => handleUpdateOfferField('trackingParamName', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="sub2">sub2 (Recomendado MediaScalers — preserva sub1=12670)</option>
                    <option value="sub3">sub3 (MediaScalers secundário)</option>
                    <option value="sub1">sub1 (Apenas se sua rede não exigir sub1 fixo)</option>
                    <option value="tid">tid (ClickBank)</option>
                    <option value="aff_sub">aff_sub (Redes CPA)</option>
                    <option value="utm_source">utm_source (Genérico / Qualquer Site)</option>
                  </select>
                </label>
              </div>

              {/* Universal Tracking Answer & Ready Links */}
              <div className="border-t border-slate-800 pt-4 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-cyan-400" />
                    <span>Links Rastreados Prontos (Qualquer Link Funciona na Global Presell)</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Sim — você pode usar qualquer link na Global Presell. Coloque o <strong>Link de Saída</strong> abaixo no botão CTA dentro da sua página em{' '}
                    <span className="text-slate-200">global-sell-beta.vercel.app</span>, e divulgue os <strong>Links de Entrada</strong> nos canais abaixo para saber exatamente de onde veio cada clique e venda.
                  </p>
                </div>

                {/* Output CTA Link */}
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-emerald-400">
                      1. Link de Saída para colocar no Botão CTA da Global Presell (preserva source_id e sub1)
                    </span>
                    <button
                      type="button"
                      onClick={() => copyText(presellOutputCtaLink, 'cta-out')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-md inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      {copiedId === 'cta-out' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === 'cta-out' ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                  <div className="text-xs font-mono text-slate-300 break-all">{presellOutputCtaLink}</div>
                </div>

                {/* Entry Channel Links */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300">
                    2. Links de Entrada para usar no Google Ads e nos Robôs Orgânicos
                  </div>
                  <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg bg-slate-950">
                    {channelPresellLinks.map((item) => (
                      <div key={item.id} className="p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-white">{item.label}</div>
                          <div className="text-[11px] font-mono text-slate-400 truncate">{item.url}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyText(item.url, `ch-${item.id}`)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-md inline-flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-center"
                        >
                          {copiedId === `ch-${item.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedId === `ch-${item.id}` ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: PRESELL + GOOGLE ADS KIT GENERATOR                             */}
      {/* ===================================================================== */}
      {subTab === 'kit' && activeOffer && activeKit && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400">
                Oferta Ativa · {activeOffer.countryName} · Idioma: {activeOffer.languageName}
              </div>
              <h3 className="text-base font-bold text-white">{activeOffer.productName}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleApplyTemplateKit}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Atualizar Modelo Estruturado
              </button>
              <button
                type="button"
                disabled={isGeneratingKit}
                onClick={handleGenerateWithGemini}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isGeneratingKit ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{isGeneratingKit ? 'Gerando com IA...' : `Gerar Kit Personalizado via IA (${activeOffer.languageName})`}</span>
              </button>
            </div>
          </div>

          {kitError && (
            <div className="bg-rose-950/40 border border-rose-800/70 rounded-xl px-4 py-3 text-xs text-rose-200 flex items-center justify-between gap-3">
              <span>{kitError}</span>
              <button
                type="button"
                onClick={() => setKitError(null)}
                className="text-rose-300 hover:text-white cursor-pointer"
              >
                Fechar
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Global Presell Structure */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Estrutura da Global Presell ({activeOffer.languageName})</span>
                  </h4>
                  <p className="text-xs text-slate-400">Copie e cole direto no seu painel Global Presell</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      activeKit.presellStructure.fullPresellDraft.replace(/\[PRESELL_CTA_LINK\]/g, presellOutputCtaLink),
                      'presell-all'
                    )
                  }
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedId === 'presell-all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'presell-all' ? 'Copiado' : 'Copiar Presell Completa'}</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-slate-400 mb-1">Headline Principal</div>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-semibold">
                    {activeKit.presellStructure.headline}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 mb-1">Subheadline</div>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200">
                    {activeKit.presellStructure.subheadline}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 mb-1.5">Tabela Comparativa</div>
                  <div className="overflow-x-auto border border-slate-800 rounded-lg">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                          <th className="py-2 px-2.5 font-medium">Critério</th>
                          <th className="py-2 px-2.5 font-medium">Comum / Tradicional</th>
                          <th className="py-2 px-2.5 font-medium text-emerald-400">{activeOffer.productName}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {activeKit.presellStructure.comparisonRows.map((row, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-2.5 font-medium text-white">{row.criterion}</td>
                            <td className="py-2 px-2.5 text-slate-400">{row.traditionalOption}</td>
                            <td className="py-2 px-2.5 text-emerald-300">{row.thisProduct}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                  <div>
                    <div className="text-slate-400">Texto do Botão CTA</div>
                    <div className="text-white font-semibold mt-0.5">{activeKit.presellStructure.ctaButtonText}</div>
                  </div>
                  <a
                    href={activeOffer.presellUrl || 'https://global-sell-beta.vercel.app/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-md inline-flex items-center gap-1.5 shrink-0"
                  >
                    <span>Abrir Global Presell</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Google Ads Search Kit */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-cyan-400" />
                    <span>Kit Google Ads Search ({activeOffer.countryName})</span>
                  </h4>
                  <p className="text-xs text-slate-400">Palavras-chave fundo de funil, negativas e anúncios nos limites de caracteres</p>
                </div>
              </div>

              {/* Bottom Funnel Keywords */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">
                    Palavras-Chave Fundo de Funil ({activeKit.googleAdsKit.bottomFunnelKeywords.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText(activeKit.googleAdsKit.bottomFunnelKeywords.join('\n'), 'kw-pos')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer"
                  >
                    {copiedId === 'kw-pos' ? 'Copiado' : 'Copiar Lista'}
                  </button>
                </div>
                <pre className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-emerald-300 whitespace-pre-wrap">
                  {activeKit.googleAdsKit.bottomFunnelKeywords.join('\n')}
                </pre>
              </div>

              {/* Negative Keywords */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-300">
                    Palavras Negativas Obrigatórias ({activeKit.googleAdsKit.negativeKeywords.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText(activeKit.googleAdsKit.negativeKeywords.join('\n'), 'kw-neg')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer"
                  >
                    {copiedId === 'kw-neg' ? 'Copiado' : 'Copiar Negativas'}
                  </button>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-amber-200">
                  {activeKit.googleAdsKit.negativeKeywords.join(', ')}
                </div>
              </div>

              {/* RSA Headlines (<= 30) & Descriptions (<= 90) */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-200 mb-1">Títulos Google Ads (máx. 30 caracteres)</div>
                  <div className="divide-y divide-slate-800 bg-slate-950 border border-slate-800 rounded-lg">
                    {activeKit.googleAdsKit.headlines30.map((h, i) => (
                      <div key={i} className="px-2.5 py-1.5 flex items-center justify-between gap-2 text-xs">
                        <span className="text-white">{h}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`font-mono tabular-nums ${h.length <= 30 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {h.length}/30
                          </span>
                          <button
                            type="button"
                            onClick={() => copyText(h, `hl-${i}`)}
                            className="text-slate-400 hover:text-white cursor-pointer"
                          >
                            {copiedId === `hl-${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-200 mb-1">Descrições Google Ads (máx. 90 caracteres)</div>
                  <div className="divide-y divide-slate-800 bg-slate-950 border border-slate-800 rounded-lg">
                    {activeKit.googleAdsKit.descriptions90.map((d, i) => (
                      <div key={i} className="px-2.5 py-1.5 flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-200">{d}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`font-mono tabular-nums ${d.length <= 90 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {d.length}/90
                          </span>
                          <button
                            type="button"
                            onClick={() => copyText(d, `ds-${i}`)}
                            className="text-slate-400 hover:text-white cursor-pointer"
                          >
                            {copiedId === `ds-${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Auction Unlock Checklist */}
              <div className="border-t border-slate-800 pt-3 space-y-2">
                <div className="text-xs font-semibold text-white">Checklist para Destravar Leilão (0 impressões → cliques)</div>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc pl-4">
                  {activeKit.googleAdsKit.launchChecklist.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: UNIVERSAL GROUP TRIAGE & NAMED AUDIENCES (ANY COUNTRY vs BR)   */}
      {/* ===================================================================== */}
      {subTab === 'triage' && (
        <div className="space-y-6">
          {/* Top Action Strip */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Caixa Geral de Grupos Mapeados & Públicos Nomeados</h3>
              <p className="text-xs text-slate-400">
                Mapeie grupos no Chrome em qualquer idioma/país. Eles chegam aqui com Nome e Nº Geral de Membros para você nomear um Público e enviar para o Brasil ou para qualquer país do mundo.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsManualAddOpen((v) => !v)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Colar Links / Adicionar</span>
              </button>
              <button
                type="button"
                onClick={() => setIsBrazilPullOpen((v) => !v)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-300 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Puxar / Mover do Robô Brasil</span>
              </button>
            </div>
          </div>

          {/* Manual Bulk Add Drawer */}
          {isManualAddOpen && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">Adicionar Grupos à Caixa Geral</h4>
                <button
                  type="button"
                  onClick={() => setIsManualAddOpen(false)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Fechar
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Cole um por linha no formato <code className="text-slate-200">Nome do Grupo | 45000 | https://facebook.com/groups/...</code> ou apenas as URLs.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <textarea
                  rows={4}
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="Healthy Cooking Australia | 52000 | https://www.facebook.com/groups/..."
                  className="md:col-span-3 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <div className="space-y-2">
                  <label className="block text-xs text-slate-300">
                    País inicial sugerido
                    <input
                      type="text"
                      value={manualCountryTag}
                      onChange={(e) => setManualCountryTag(e.target.value)}
                      placeholder="Australia, USA, Germany, Brasil..."
                      className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleManualAddToInbox}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Enviar para Caixa Geral
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pull / Move existing groups from Brazil safely */}
          {isBrazilPullOpen && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Importar / Mover Grupos Existentes ({existingBrazilGroups.length} salvos no Robô Brasil)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Nada no Brasil é alterado até você selecionar os grupos desejados e escolher copiar ou mover.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBrazilPullOpen(false)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Fechar
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={brazilSearchFilter}
                  onChange={(e) => setBrazilSearchFilter(e.target.value)}
                  placeholder="Filtrar por nome ou URL (ex: cooking, australia, usa, kitchen...)"
                  className="flex-1 min-w-[220px] bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => handlePullBrazilGroupsToInbox(false)}
                  disabled={selectedBrazilIdsToCopy.length === 0}
                  className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Copiar ({selectedBrazilIdsToCopy.length}) p/ Caixa Geral
                </button>
                <button
                  type="button"
                  onClick={() => handlePullBrazilGroupsToInbox(true)}
                  disabled={selectedBrazilIdsToCopy.length === 0}
                  className="px-3 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Mover ({selectedBrazilIdsToCopy.length}) p/ Global
                </button>
              </div>
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-800 border border-slate-800 rounded-lg bg-slate-950">
                {filteredBrazilPull.map((g) => {
                  const checked = selectedBrazilIdsToCopy.includes(g.id);
                  return (
                    <label
                      key={g.id}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-xs hover:bg-slate-900 cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setSelectedBrazilIdsToCopy((prev) =>
                              prev.includes(g.id) ? prev.filter((x) => x !== g.id) : [...prev, g.id]
                            )
                          }
                        />
                        <span className="text-white truncate">{g.name}</span>
                      </div>
                      <span className="text-slate-400 tabular-nums shrink-0">
                        {(g.membersCount || 0).toLocaleString('pt-BR')} membros
                      </span>
                    </label>
                  );
                })}
                {filteredBrazilPull.length === 0 && (
                  <div className="p-4 text-xs text-slate-400 text-center">Nenhum grupo encontrado com esse filtro.</div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Universal Triage Inbox */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-white">
                  Grupos Aguardando Triagem ({inboxGroups.length})
                </h4>
                <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
                  {[
                    { id: 'all' as const, label: 'Todos' },
                    { id: 'global' as const, label: 'Fora do Brasil' },
                    { id: 'brazil' as const, label: 'Brasil' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setInboxScopeFilter(f.id)}
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                        inboxScopeFilter === f.id ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={inboxFilterText}
                    onChange={(e) => setInboxFilterText(e.target.value)}
                    placeholder="Buscar por nome do grupo ou país..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const visibleIds = filteredInbox.map((g) => g.id);
                    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedInboxIds.includes(id));
                    setSelectedInboxIds(allSelected ? [] : visibleIds);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-lg cursor-pointer whitespace-nowrap"
                >
                  Selecionar Filtrados ({filteredInbox.length})
                </button>
              </div>

              {/* Inbox Table */}
              {filteredInbox.length === 0 ? (
                <div className="border border-dashed border-slate-800 rounded-lg p-6 text-center space-y-2">
                  <p className="text-xs text-slate-300 font-medium">
                    Nenhum grupo aguardando triagem no momento.
                  </p>
                  <p className="text-xs text-slate-400">
                    Vá na aba "04. Robô Global", clique em uma busca do Facebook para abrir e mapear grupos na extensão v1.4.0 — mantendo esta aba aberta, os grupos mapeados aparecem aqui automaticamente com Nome e Nº de Membros!
                  </p>
                </div>
              ) : (
                <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-800 border border-slate-800 rounded-lg bg-slate-950">
                  {filteredInbox.map((g) => {
                    const isChecked = selectedInboxIds.includes(g.id);
                    return (
                      <div
                        key={g.id}
                        onClick={() => toggleInboxSelect(g.id)}
                        className={`px-3 py-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isChecked ? 'bg-slate-800/70' : 'hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span className="mt-0.5 text-cyan-400 shrink-0">
                            {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-500" />}
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-white truncate">{g.name}</div>
                            <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-1.5 mt-0.5">
                              <span>{g.suggestedScope === 'brazil' ? 'Sugerido: Brasil' : `Sugerido: ${g.detectedCountry}`}</span>
                              <span aria-hidden="true">·</span>
                              <span className="truncate max-w-[220px]">{g.url.replace(/^https?:\/\/(www\.)?/, '')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-mono font-semibold text-emerald-400 tabular-nums">
                            {g.membersCount > 0 ? g.membersCount.toLocaleString('pt-BR') : '—'}
                          </div>
                          <div className="text-[11px] text-slate-500">membros</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Redirect & Name Audience Panel + Existing Named Global Audiences */}
            <div className="lg:col-span-5 space-y-5">
              {/* Redirect Form */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FolderPlus className="w-4 h-4 text-cyan-400" />
                    <span>Nomear Público & Redirecionar</span>
                  </h4>
                  <span className="text-xs text-cyan-300 tabular-nums font-medium">
                    {selectedInboxIds.length} selecionados · {inboxSelectedMembersSum.toLocaleString('pt-BR')} membros
                  </span>
                </div>

                <div className="space-y-3">
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-slate-300">Nome do Público (fácil de escolher ao publicar)</span>
                    <input
                      type="text"
                      value={routeAudienceName}
                      onChange={(e) => setRouteAudienceName(e.target.value)}
                      placeholder="Ex: AU - Cozinha & Sem Microplástico, USA - Non-Toxic Moms"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block space-y-1">
                      <span className="text-xs font-medium text-slate-300">País (Se for para Global)</span>
                      <select
                        value={routeCountryPreset}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRouteCountryPreset(val);
                          const match = COUNTRY_PRESETS.find((c) => c.name === val);
                          if (match) setRouteLanguage(match.language);
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white"
                      >
                        {COUNTRY_PRESETS.map((c) => (
                          <option key={c.code} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block space-y-1">
                      <span className="text-xs font-medium text-slate-300">Idioma do Público</span>
                      <input
                        type="text"
                        value={routeLanguage}
                        onChange={(e) => setRouteLanguage(e.target.value)}
                        placeholder="English, Español, Deutsch..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white"
                      />
                    </label>
                  </div>

                  {routeCountryPreset === 'Qualquer País (Personalizado)' && (
                    <label className="block space-y-1">
                      <span className="text-xs font-medium text-slate-300">Digite o País</span>
                      <input
                        type="text"
                        value={routeCustomCountry}
                        onChange={(e) => setRouteCustomCountry(e.target.value)}
                        placeholder="Ex: Ireland, Switzerland, Japan, Mexico..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </label>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleRouteSelectedGroups('global')}
                      className="py-2.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Enviar p/ Robô Global ({selectedInboxIds.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRouteSelectedGroups('brazil')}
                      className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Enviar p/ Robô Brasil ({selectedInboxIds.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* Saved Global Named Audiences */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Públicos Globais Salvos ({globalAudiences.length})</span>
                  </h4>
                </div>

                {globalAudiences.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    Nenhum Público Global criado ainda. Selecione grupos na Caixa Geral ao lado, dê um nome e clique em "Enviar p/ Robô Global".
                  </p>
                ) : (
                  <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg bg-slate-950">
                    {globalAudiences.map((aud) => {
                      const setIds = new Set(aud.groupIds);
                      const matched = globalGroups.filter((g) => setIds.has(g.id));
                      const totalMembers = matched.reduce((acc, g) => acc + (g.membersCount || 0), 0);
                      const isActive = activeAudience?.id === aud.id;

                      return (
                        <div key={aud.id} className="p-3 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-white truncate">{aud.name}</div>
                            <div className="text-[11px] text-slate-400 tabular-nums mt-0.5">
                              {aud.countryName} · {aud.languageName} · {matched.length} grupos ·{' '}
                              {totalMembers.toLocaleString('pt-BR')} membros
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAudienceId(aud.id);
                                setSubTab('bot');
                              }}
                              className={`px-2.5 py-1 text-xs rounded-md font-medium cursor-pointer ${
                                isActive
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                              }`}
                            >
                              {isActive ? 'Ativo' : 'Publicar'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setGlobalAudiences((prev) => prev.filter((a) => a.id !== aud.id))}
                              className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                              title="Excluir público"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: GLOBAL ORGANIC BOT (FACEBOOK, YOUTUBE, PINTEREST)              */}
      {/* ===================================================================== */}
      {subTab === 'bot' && activeOffer && activeKit && (
        <div className="space-y-6">
          {/* Mutual Safety Notice + Channel Switcher */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 space-y-0.5">
                <div className="font-semibold text-white">Trava Mútua de Segurança Brasil ↔ Global Ativa</div>
                <div>
                  Ao iniciar o Robô Global aqui, o Robô Brasil é pausado automaticamente (e vice-versa) para nunca abrir dois disparos ao mesmo tempo no seu Chrome.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setBotChannel('facebook')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                  botChannel === 'facebook' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Facebook Groups
              </button>
              <button
                type="button"
                onClick={() => setBotChannel('youtube')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer inline-flex items-center gap-1.5 ${
                  botChannel === 'youtube' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Youtube className="w-3.5 h-3.5" />
                <span>YouTube</span>
              </button>
              <button
                type="button"
                onClick={() => setBotChannel('pinterest')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer inline-flex items-center gap-1.5 ${
                  botChannel === 'pinterest' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Pinterest</span>
              </button>
            </div>
          </div>

          {/* FACEBOOK GROUPS GLOBAL */}
          {botChannel === 'facebook' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Search Launchers + Audience + Copy + Start/Pause */}
              <div className="lg:col-span-7 space-y-5">
                {/* 1-Click Search Launchers for Mapping */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-white">
                      1. Buscar & Mapear Grupos no Facebook ({activeOffer.countryName})
                    </h4>
                    <span className="text-xs text-slate-400">Extensão v1.4.0 envia p/ Caixa Geral</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeKit.organicSocialKit.fbGroupQueries.map((q, idx) => (
                      <a
                        key={idx}
                        href={`https://www.facebook.com/search/groups/?q=${encodeURIComponent(q)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-cyan-200 rounded-lg inline-flex items-center gap-1.5"
                      >
                        <Search className="w-3 h-3" />
                        <span>{q}</span>
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Audience & Copy Config */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h4 className="text-sm font-bold text-white">2. Selecionar Público Nomeado & Publicar</h4>
                    <button
                      type="button"
                      onClick={() => setSubTab('triage')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer"
                    >
                      Gerenciar Públicos ({globalAudiences.length})
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block space-y-1">
                      <span className="text-xs text-slate-400">Público Selecionado</span>
                      <select
                        value={activeAudience?.id || ''}
                        onChange={(e) => setSelectedAudienceId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                      >
                        {globalAudiences.length === 0 && (
                          <option value="">Todos os Grupos Globais ({globalGroups.length})</option>
                        )}
                        {globalAudiences.map((aud) => (
                          <option key={aud.id} value={aud.id}>
                            {aud.name} ({aud.countryName} · {aud.groupIds.length} grupos)
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block space-y-1">
                      <span className="text-xs text-slate-400">Ângulo da Copy ({activeOffer.languageName})</span>
                      <select
                        onChange={(e) => {
                          const post = activeKit.organicSocialKit.fbGroupPosts[Number(e.target.value)];
                          if (post) {
                            const presellLink = appendTrackingParam(
                              activeOffer.presellUrl || 'https://global-sell-beta.vercel.app/',
                              'utm_source',
                              'facebook_groups'
                            );
                            setCustomPostHeadline(post.headline);
                            setCustomPostBody(post.body.replace(/\[PRESELL_LINK\]/g, presellLink));
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                      >
                        {activeKit.organicSocialKit.fbGroupPosts.map((p, idx) => (
                          <option key={idx} value={idx}>
                            {p.angle}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="block space-y-1">
                    <span className="text-xs text-slate-400">Título / Abertura do Post</span>
                    <input
                      type="text"
                      value={customPostHeadline}
                      onChange={(e) => setCustomPostHeadline(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-xs text-slate-400">Corpo da Postagem (com link da sua Global Presell rastreado)</span>
                    <textarea
                      rows={6}
                      value={customPostBody}
                      onChange={(e) => setCustomPostBody(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 leading-relaxed"
                    />
                  </label>

                  {/* Bot Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
                    <div className="text-xs text-slate-400 tabular-nums">
                      <div>
                        Grupos na fila atual: <strong className="text-white">{activeAudienceGroups.length}</strong>
                      </div>
                      <div>
                        {isBotRunning
                          ? `Próximo disparo automático em ${secondsRemaining}s (cadência 300s–400s)`
                          : 'Modo seguro 300s–400s · Pronto para iniciar'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={executeSingleGlobalPost}
                        disabled={activeAudienceGroups.length === 0}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-medium text-white rounded-lg cursor-pointer"
                      >
                        Disparar 1 Grupo Agora
                      </button>
                      <button
                        type="button"
                        onClick={handleToggleGlobalBot}
                        disabled={activeAudienceGroups.length === 0 && !isBotRunning}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg inline-flex items-center gap-2 cursor-pointer ${
                          isBotRunning
                            ? 'bg-amber-600 hover:bg-amber-500 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white'
                        }`}
                      >
                        {isBotRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isBotRunning ? 'Pausar Robô Global' : 'Iniciar Robô Global'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Isolated Global Logs */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">Histórico do Robô Global ({botLogs.length})</h4>
                  {botLogs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setBotLogs([])}
                      className="text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {botLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    Nenhuma postagem global registrada ainda. Os resultados reais da extensão aparecerão aqui sem se misturar ao histórico do Brasil.
                  </p>
                ) : (
                  <div className="max-h-[480px] overflow-y-auto divide-y divide-slate-800 border border-slate-800 rounded-lg bg-slate-950">
                    {botLogs.map((log) => (
                      <div key={log.id} className="p-3 space-y-1 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-white truncate">{log.groupName}</span>
                          <span
                            className={`font-medium shrink-0 ${
                              log.approvalStatus === 'published'
                                ? 'text-emerald-400'
                                : log.approvalStatus === 'awaiting_admin' || log.approvalStatus === 'join_requested'
                                ? 'text-amber-300'
                                : log.status === 'error'
                                ? 'text-rose-400'
                                : 'text-cyan-300'
                            }`}
                          >
                            {log.approvalStatus === 'published'
                              ? 'Postagem Feita'
                              : log.approvalStatus === 'awaiting_admin'
                              ? 'Aguardando Admin'
                              : log.approvalStatus === 'join_requested'
                              ? 'Entrada Solicitada'
                              : log.approvalStatus === 'rate_limited'
                              ? 'Limite Temp. FB'
                              : log.approvalStatus === 'unavailable'
                              ? 'Indisponível'
                              : log.approvalStatus === 'not_member'
                              ? 'Precisa Participar'
                              : 'Verificando'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center justify-between">
                          <span className="tabular-nums">{log.postedAt}</span>
                          <a
                            href={log.groupUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                          >
                            <span>Abrir Grupo</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* YOUTUBE GLOBAL */}
          {botChannel === 'youtube' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-white">1. Buscar Vídeos no YouTube ({activeOffer.countryName})</h4>
                <div className="flex flex-wrap gap-2">
                  {activeKit.organicSocialKit.youtubeQueries.map((q, i) => (
                    <a
                      key={i}
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-rose-200 rounded-lg inline-flex items-center gap-1.5"
                    >
                      <Search className="w-3 h-3" />
                      <span>{q}</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  ))}
                </div>

                <div className="border-t border-slate-800 pt-4 space-y-2">
                  <div className="text-xs font-semibold text-white">Comentários Prontos ({activeOffer.languageName})</div>
                  {activeKit.organicSocialKit.youtubeComments.map((cmt, idx) => {
                    const presellYt = appendTrackingParam(
                      activeOffer.presellUrl || 'https://global-sell-beta.vercel.app/',
                      'utm_source',
                      'youtube'
                    );
                    const finalComment = cmt.replace(/\[PRESELL_LINK\]/g, presellYt);
                    return (
                      <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 text-xs">
                        <p className="text-slate-200">{finalComment}</p>
                        <button
                          type="button"
                          onClick={() => copyText(finalComment, `yt-c-${idx}`)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-md inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedId === `yt-c-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === `yt-c-${idx}` ? 'Copiado' : 'Copiar Comentário'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-white">2. Vídeos Globais Mapeados ({ytItems.length})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  <input
                    type="text"
                    value={ytNewTitle}
                    onChange={(e) => setYtNewTitle(e.target.value)}
                    placeholder="Título do vídeo"
                    className="sm:col-span-2 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white"
                  />
                  <input
                    type="url"
                    value={ytNewUrl}
                    onChange={(e) => setYtNewUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="sm:col-span-2 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!ytNewUrl.trim()) return;
                      const presellYt = appendTrackingParam(
                        activeOffer.presellUrl || 'https://global-sell-beta.vercel.app/',
                        'utm_source',
                        'youtube'
                      );
                      const cmt = (
                        activeKit.organicSocialKit.youtubeComments[0] ||
                        'Comparison & link: [PRESELL_LINK]'
                      ).replace(/\[PRESELL_LINK\]/g, presellYt);
                      setYtItems((prev) => [
                        {
                          id: `gyt-${Date.now()}`,
                          title: ytNewTitle.trim() || 'YouTube Target Video',
                          url: ytNewUrl.trim(),
                          channelName: 'YouTube',
                          commentText: cmt,
                          status: 'ready',
                        },
                        ...prev,
                      ]);
                      setYtNewTitle('');
                      setYtNewUrl('');
                    }}
                    className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg py-2 px-3 cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>

                {ytItems.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    Mapeie vídeos pela extensão no YouTube ou adicione URLs acima para comentar com o link da Global Presell.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg bg-slate-950 max-h-96 overflow-y-auto">
                    {ytItems.map((v) => (
                      <div key={v.id} className="p-3 space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-white truncate">{v.title}</span>
                          <span className={v.status === 'done' ? 'text-emerald-400' : 'text-amber-300'}>
                            {v.status === 'done' ? 'Comentado' : 'Pendente'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={v.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => copyText(v.commentText, `yt-go-${v.id}`)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-md inline-flex items-center gap-1.5"
                          >
                            <span>Copiar & Abrir Vídeo</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <button
                            type="button"
                            onClick={() =>
                              setYtItems((prev) =>
                                prev.map((item) =>
                                  item.id === v.id
                                    ? { ...item, status: item.status === 'done' ? 'ready' : 'done' }
                                    : item
                                )
                              )
                            }
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md cursor-pointer"
                          >
                            Marcar {v.status === 'done' ? 'Pendente' : 'Feito'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PINTEREST GLOBAL */}
          {botChannel === 'pinterest' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-white">1. Buscar & Estudar Pins ({activeOffer.countryName})</h4>
                <div className="flex flex-wrap gap-2">
                  {activeKit.organicSocialKit.pinterestQueries.map((q, i) => (
                    <a
                      key={i}
                      href={`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(q)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-amber-200 rounded-lg inline-flex items-center gap-1.5"
                    >
                      <Search className="w-3 h-3" />
                      <span>{q}</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  ))}
                </div>
                <p className="text-xs text-slate-400">
                  Dica de segurança Pinterest: nunca coloque o link direto de afiliado no Pin — use sempre o link da sua <strong>Global Presell</strong> (`utm_source=pinterest`).
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-white">2. Pins Prontos para Publicar ({activeOffer.languageName})</h4>
                  <a
                    href="https://www.pinterest.com/pin-creation-tool/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5"
                  >
                    <span>Criar Pin no Pinterest</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-3">
                  {activeKit.organicSocialKit.pinterestPins.map((pin, idx) => {
                    const presellPin = appendTrackingParam(
                      activeOffer.presellUrl || 'https://global-sell-beta.vercel.app/',
                      'utm_source',
                      'pinterest'
                    );
                    const desc = pin.description.replace(/\[PRESELL_LINK\]/g, presellPin);
                    return (
                      <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 text-xs">
                        <div className="font-semibold text-white">{pin.title}</div>
                        <p className="text-slate-300">{desc}</p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => copyText(pin.title, `pin-t-${idx}`)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-md cursor-pointer"
                          >
                            {copiedId === `pin-t-${idx}` ? 'Título Copiado' : 'Copiar Título'}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyText(desc, `pin-d-${idx}`)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-md cursor-pointer"
                          >
                            {copiedId === `pin-d-${idx}` ? 'Descrição Copiada' : 'Copiar Descrição'}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyText(presellPin, `pin-u-${idx}`)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-md cursor-pointer"
                          >
                            {copiedId === `pin-u-${idx}` ? 'Link Copiado' : 'Copiar Link Presell'}
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {pinItems.length > 0 && (
                    <div className="text-xs text-slate-400">Pins salvos adicionais: {pinItems.length}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: NEW GLOBAL OFFER                                               */}
      {/* ===================================================================== */}
      {isNewOfferOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateOffer}
            className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-xl p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Cadastrar Nova Oferta Global</h3>
              <button
                type="button"
                onClick={() => setIsNewOfferOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="block space-y-1 sm:col-span-2">
                <span className="text-slate-300 font-medium">Nome do Produto (MediaScalers ou outra rede)</span>
                <input
                  required
                  type="text"
                  value={newOfferName}
                  onChange={(e) => setNewOfferName(e.target.value)}
                  placeholder="Ex: Katori Titanium Cutting Board, Ortho Pillow, etc."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </label>

              <label className="block space-y-1 sm:col-span-2">
                <span className="text-slate-300 font-medium">Dor Principal / Benefício</span>
                <input
                  type="text"
                  value={newOfferPain}
                  onChange={(e) => setNewOfferPain(e.target.value)}
                  placeholder="Ex: Microplastics in kitchen boards, neck pain while sleeping..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-slate-300 font-medium">País Alvo (Qualquer País)</span>
                <select
                  value={newOfferCountryPreset}
                  onChange={(e) => {
                    const code = e.target.value;
                    setNewOfferCountryPreset(code);
                    const p = COUNTRY_PRESETS.find((c) => c.code === code);
                    if (p) {
                      setNewOfferLanguage(p.language);
                      setNewOfferCurrency(p.currency);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  {COUNTRY_PRESETS.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              {newOfferCountryPreset === 'CUSTOM' ? (
                <label className="block space-y-1">
                  <span className="text-slate-300 font-medium">Digite o País</span>
                  <input
                    required
                    type="text"
                    value={newOfferCustomCountry}
                    onChange={(e) => setNewOfferCustomCountry(e.target.value)}
                    placeholder="Ex: Ireland, Spain, Mexico..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </label>
              ) : (
                <label className="block space-y-1">
                  <span className="text-slate-300 font-medium">Idioma das Copies</span>
                  <input
                    type="text"
                    value={newOfferLanguage}
                    onChange={(e) => setNewOfferLanguage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </label>
              )}

              <label className="block space-y-1">
                <span className="text-slate-300 font-medium">Oferta / Desconto</span>
                <input
                  type="text"
                  value={newOfferPrice}
                  onChange={(e) => setNewOfferPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-slate-300 font-medium">Moeda Local</span>
                <input
                  type="text"
                  value={newOfferCurrency}
                  onChange={(e) => setNewOfferCurrency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </label>

              <label className="block space-y-1 sm:col-span-2">
                <span className="text-slate-300 font-medium">Seu Link de Afiliado (Qualquer Plataforma)</span>
                <input
                  required
                  type="url"
                  value={newOfferAffiliateUrl}
                  onChange={(e) => setNewOfferAffiliateUrl(e.target.value)}
                  placeholder="https://get-katori.com/pp/au/?uid=...&source_id=..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-slate-300 font-medium">URL da Global Presell</span>
                <input
                  type="url"
                  value={newOfferPresellUrl}
                  onChange={(e) => setNewOfferPresellUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-slate-300 font-medium">Parâmetro de Rastreio</span>
                <select
                  value={newOfferTrackingParam}
                  onChange={(e) => setNewOfferTrackingParam(e.target.value as GlobalOffer['trackingParamName'])}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="sub2">sub2 (MediaScalers)</option>
                  <option value="sub3">sub3 (MediaScalers)</option>
                  <option value="sub1">sub1</option>
                  <option value="tid">tid (ClickBank)</option>
                  <option value="aff_sub">aff_sub</option>
                  <option value="utm_source">utm_source</option>
                </select>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setIsNewOfferOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white rounded-lg cursor-pointer"
              >
                Salvar Oferta Global
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
