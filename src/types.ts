export type NicheType = 'ingles' | 'psicopedagogia' | 'emagrecedor' | 'renda_extra' | 'artesanato' | 'marketing' | 'outro';

export interface Campaign {
  id: string;
  title: string;
  niche: NicheType;
  nicheLabel: string;
  targetAudience: string;
  painPointTargeted: string;
  checkoutUrl?: string;
  whatsappNumber?: string;
  price: number;
  oldPrice?: number;
  headline?: string;
  subheadline?: string;
  badgeText?: string;
  guaranteeDays?: number;
  ctaText?: string;
  imageUrl?: string;
  features?: string[];
  status: 'active' | 'paused' | 'draft';
  createdAt: string;
  antiBanOrganicMode: boolean;
  platforms: ('tiktok' | 'pinterest' | 'instagram' | 'whatsapp')[];
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface PainPointData {
  pain: string;
  intensity: string;
  whatTheySearch: string;
  secretDesire: string;
  suggestedHook: string;
}

export interface PainSearchResponse {
  niche: string;
  keyword: string;
  marketOverview: string;
  monthlySearchesEstimated: string;
  topPainPoints: PainPointData[];
  viralPlatformAngles: {
    tiktok: string;
    pinterest: string;
    instagram: string;
  };
  predictiveBuyerProfile: {
    dominantAge: string;
    topLocations: string;
    bestTrigger: string;
  };
}

export interface CreativePackage {
  platform: string;
  videoScript: {
    title: string;
    hook: string;
    retention: string;
    pitch: string;
    cta: string;
  };
  pinterestPin: {
    headline: string;
    overlayText: string;
    callToAction: string;
  };
  instagramCarousel: { slide: number; text: string }[];
  hashtags: string[];
  imagePrompt: string;
}

export interface TrackingEvent {
  id: string;
  campaignId: string;
  campaignTitle: string;
  niche: string;
  type: 'impression' | 'click' | 'whatsapp_click' | 'checkout_click' | 'conversion';
  timestamp: string;
  geo: {
    state: string;
    city: string;
    country: string;
  };
  device: 'mobile' | 'desktop' | 'tablet';
  ageBracket: '18-24' | '25-34' | '35-44' | '45-54' | '55+';
  source: 'tiktok' | 'pinterest' | 'instagram' | 'whatsapp' | 'google_organic';
  amount?: number;
  leadScore?: number;
  durationSeconds?: number;
}

export interface AIReport {
  reportTitle: string;
  executiveSummary: string;
  highlights: string[];
  actionPlan: string[];
  predictedRevenueNextPeriod: string;
  safetyAudit: string;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'sale' | 'traffic' | 'security' | 'tip';
  read: boolean;
}
