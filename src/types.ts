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
  copy?: string;
  badgeText?: string;
  guaranteeDays?: number;
  ctaText?: string;
  imageUrl?: string;
  features?: string[];
  status: 'active' | 'paused' | 'draft';
  createdAt: string;
  antiBanOrganicMode: boolean;
  platforms: ('tiktok' | 'pinterest' | 'instagram' | 'whatsapp' | 'facebook')[];
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
  source: 'tiktok' | 'pinterest' | 'instagram' | 'whatsapp' | 'google_organic' | 'meta_ads' | 'brevo_email' | 'facebook_groups' | 'youtube_comments';
  amount?: number;
  leadScore?: number;
  durationSeconds?: number;
  isSimulation?: boolean;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerHandle?: string;
  adCreativeName?: string;
  utmContent?: string;
}

export interface CustomerLead {
  id: string;
  campaignId: string;
  campaignTitle: string;
  name: string;
  phone: string;
  email?: string;
  instagramHandle?: string;
  status: 'comprador_aprovado' | 'pix_gerado' | 'carrinho_abandonado' | 'duvida_whatsapp' | 'amostra_gratis';
  amount?: number;
  source: 'hotmart_webhook' | 'kiwify_webhook' | 'landing_page_whatsapp' | 'landing_sample' | 'direct_chat' | 'meta_ads';
  createdAt: string;
  notes?: string;
  adCreativeName?: string;
  isReal?: boolean;
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
  isReal?: boolean;
}

export interface FacebookGroup {
  id: string;
  name: string;
  url: string;
  membersCount: number;
  privacy: 'Público' | 'Privado';
  niche: string;
  mappedAt: string;
  lastDispatchedAt?: string;
  dispatchCount: number;
  status: 'ready' | 'cooling_down' | 'posted';
  categoryBadge?: string;
  city?: string;
  searchTerm?: string;
  postsPerDay?: string;
  isVerifiedReal?: boolean;
  validationStatus?: 'verified' | 'pending' | 'needs_update';
}

export interface FacebookAudience {
  id: string;
  name: string;
  description: string;
  groupIds: string[];
  groupsCount: number;
  estimatedMembers: number;
  niche: string;
  targetProductId: string;
  createdAt: string;
  lastUsedAt?: string;
  campaignUsageCount?: number;
  groupNamesPreview?: string[];
}

export interface FacebookPostLog {
  id: string;
  groupId: string;
  groupName: string;
  groupUrl: string;
  postedAt: string;
  headline: string;
  status: 'success' | 'cooling_down' | 'error';
  intervalWaitedSeconds: number;
  checkoutUrl: string;
  trackedToken?: string;
  trackedClicksCount?: number;
}

export interface TrackedLinkClick {
  id: string;
  linkId: string;
  token: string;
  timestamp: string;
  groupOriginName: string;
  groupOriginUrl?: string;
  geoCity: string;
  geoState: string;
  device: 'mobile' | 'desktop' | 'tablet';
  operatingSystem: string;
  hasOpenedPage: boolean;
  hasVisitedCheckout: boolean;
  timeSpentSeconds: number;
  leadScore: number;
}

export interface TrackedLinkItem {
  id: string;
  token: string;
  originalUrl: string;
  smartUrl: string;
  campaignTitle: string;
  campaignId: string;
  targetGroupCount: number;
  createdAt: string;
  totalClicks: number;
  uniqueOpens: number;
  checkoutViews: number;
  conversions: number;
  clicksHistory: TrackedLinkClick[];
}

export interface FacebookGroupPostCampaign {
  id: string;
  name: string;
  audienceId: string;
  audienceName: string;
  productId: string;
  productName: string;
  productPrice: number;
  productCheckoutUrl: string;
  productImageUrl?: string;
  postHeadline: string;
  postCopy: string;
  intervalSeconds: number; // 120, 300, 400
  totalGroupsCount: number;
  completedGroupsCount: number;
  status: 'idle' | 'running' | 'paused' | 'completed';
  currentGroupIndex: number;
  nextDispatchCountdown: number;
  logs: FacebookPostLog[];
  createdAt: string;
}

export interface YouTubeTargetVideo {
  id: string;
  url: string;
  title: string;
  channelName: string;
  viewsCount?: string;
  thumbnailUrl?: string;
  actionLike: boolean;
  actionComment: boolean;
  actionPinCampaign: boolean;
  commentText: string;
  status: 'ready' | 'processing' | 'completed' | 'error';
  lastExecutedAt?: string;
}

export interface YouTubeBotLog {
  id: string;
  videoId: string;
  videoTitle: string;
  videoUrl: string;
  channelName: string;
  executedAt: string;
  actionDone: 'comment_and_like' | 'comment_only' | 'like_only';
  commentExcerpt: string;
  status: 'success' | 'error';
}

export interface PinterestPinItem {
  id: string;
  title: string;
  description: string;
  boardName: string;
  destinationUrl: string;
  imageUrl: string;
  price?: number;
  status: 'ready' | 'published' | 'scheduled';
  impressionsEstimated: number;
  clicksEstimated: number;
  publishedAt?: string;
  niche: string;
}

export interface PinterestBoard {
  id: string;
  name: string;
  pinsCount: number;
  followersEstimated: number;
  niche: string;
  description: string;
}

export interface InstagramStoryItem {
  id: string;
  title: string;
  mediaUrl: string;
  mediaType: 'story_9_16' | 'feed_1_1' | 'feed_4_5' | 'reels_9_16';
  stickerText: string;
  stickerUrl: string; // link convertido / checkout
  caption?: string;
  status: 'ready' | 'published' | 'scheduled';
  scheduledTime?: string;
  publishedAt?: string;
  viewsEstimated: number;
  linkClicksEstimated: number;
  salesEstimated: number;
  targetCampaignId?: string;
}

export interface InstagramLayoutTemplate {
  id: string;
  name: string;
  category: 'story_oferta' | 'dor_solucao' | 'depoimento' | 'destaque_pix' | 'reels_hook';
  aspectRatio: '9:16' | '1:1' | '4:5' | '2:3' | '16:9';
  headline: string;
  subheadline: string;
  badgeText: string;
  priceText: string;
  oldPriceText?: string;
  stickerLinkText: string;
  stickerUrl: string;
  ctaText: string;
  bgGradient: string;
  textColor: string;
  imageUrl?: string;
  features?: string[];
  threePillars?: { title: string; subtitle: string; icon: string }[];
}

