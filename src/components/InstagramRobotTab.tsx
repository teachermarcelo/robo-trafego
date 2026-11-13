import React, { useState, useEffect } from 'react';
import {
  Instagram,
  Sparkles,
  Link as LinkIcon,
  Send,
  Clock,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Flame,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  ExternalLink,
  Plus,
  Trash2,
  Smartphone,
  Eye,
  Check,
  MousePointerClick,
  DollarSign,
  Users,
  Search,
  Moon,
  Sun,
  Shield,
  Filter,
  Layers,
  ArrowRight,
  UserCheck,
  Hash,
  Compass,
  MessageSquare,
  Heart,
  Copy,
  Download
} from 'lucide-react';
import { Campaign, InstagramStoryItem } from '../types';
import { SecurityDefenseModal } from './SecurityDefenseModal';
import { saveWorkspaceSyncToFirebase, subscribeWorkspaceSync } from '../lib/firebase';

export interface InstagramMappedTarget {
  id: string;
  handle: string;
  name: string;
  followers: string;
  bio: string;
  category: 'hashtag' | 'profile_follower' | 'influencer';
  sourceQuery: string;
  score: number;
  city?: string;
  selected: boolean;
  status: 'pending' | 'messaged' | 'story_tagged';
}

interface InstagramRobotTabProps {
  campaigns: Campaign[];
  onAddTrackingEvent?: (event: any) => void;
  onSimulateSale?: (customerName: string, city: string, amount: number) => void;
  onNavigateTab?: (tab: string) => void;
  externalStoryQueue?: InstagramStoryItem[];
}

export interface InstagramCampaignItem {
  id: string;
  name: string;
  baseCampaignId: string;
  price: number;
  checkoutUrl: string;
  trackedUrl: string;
  format: 'stories_sticker' | 'feed_bio' | 'direct_dm';
  headline: string;
  caption: string;
  imageUrl: string;
  targetHandles: string[];
  status: 'active' | 'paused';
  createdAt: string;
}

export const InstagramRobotTab: React.FC<InstagramRobotTabProps> = ({
  campaigns,
  onAddTrackingEvent,
  onNavigateTab,
  externalStoryQueue = []
}) => {
  const defaultCampaign = campaigns[0] || {
    id: 'camp-tarefinhas',
    title: 'Caderno de Atividades de Coordenação Motora (+100 Tarefinhas)',
    price: 9.90,
    checkoutUrl: 'https://pay.kiwify.com.br/HE5xbnp',
    imageUrl: '/assets/aistudio/image_e9e67204.png',
  };

  // Internal Subtabs (0: Campanha Instagram | 1: Stories & Links | 2: Mapeador | 3: Ganhar Seguidor | 4: Anti-Ban)
  const [activeSubTab, setActiveSubTab] = useState<'campaigns' | 'stories' | 'mapper' | 'growth' | 'antiban_defense'>(() => {
    try {
      const target = localStorage.getItem('autoviral_insta_target_subtab');
      if (target && ['campaigns', 'stories', 'mapper', 'growth', 'antiban_defense'].includes(target)) {
        localStorage.removeItem('autoviral_insta_target_subtab');
        return target as any;
      }
    } catch {}
    return 'campaigns';
  });

  // 100% Real Server Tracking Events (/api/tracking/events, filtered !isSimulation)
  const [realInstaEvents, setRealInstaEvents] = useState<any[]>([]);
  const [isLoadingRealMetrics, setIsLoadingRealMetrics] = useState<boolean>(false);

  const fetchRealInstaMetrics = async () => {
    setIsLoadingRealMetrics(true);
    try {
      const res = await fetch('/api/tracking/events');
      if (res.ok) {
        const data = await res.json();
        const events = Array.isArray(data?.events) ? data.events : [];
        setRealInstaEvents(
          events.filter((e: any) => !e.isSimulation && e.source === 'instagram')
        );
      }
    } catch {
    } finally {
      setIsLoadingRealMetrics(false);
    }
  };

  useEffect(() => {
    fetchRealInstaMetrics();
    const timer = setInterval(fetchRealInstaMetrics, 6000);
    return () => clearInterval(timer);
  }, []);

  // Follower Growth Engine State (Persisted real user-executed engagement counters)
  const [isGrowthBotRunning, setIsGrowthBotRunning] = useState<boolean>(false);
  const [growthLikesCount, setGrowthLikesCount] = useState<number>(() => {
    try {
      const raw = localStorage.getItem('autoviral_insta_growth_stats_v1');
      if (raw) return Number(JSON.parse(raw)?.likes) || 0;
    } catch {}
    return 0;
  });
  const [growthCommentsCount, setGrowthCommentsCount] = useState<number>(() => {
    try {
      const raw = localStorage.getItem('autoviral_insta_growth_stats_v1');
      if (raw) return Number(JSON.parse(raw)?.comments) || 0;
    } catch {}
    return 0;
  });
  const [growthFollowsCount, setGrowthFollowsCount] = useState<number>(() => {
    try {
      const raw = localStorage.getItem('autoviral_insta_growth_stats_v1');
      if (raw) return Number(JSON.parse(raw)?.follows) || 0;
    } catch {}
    return 0;
  });
  const [copiedGrowthTargetId, setCopiedGrowthTargetId] = useState<string | null>(null);
  const [growthAutoFollow, setGrowthAutoFollow] = useState<boolean>(true);
  const [growthLikeRecentPosts, setGrowthLikeRecentPosts] = useState<boolean>(true);
  const [growthAutoComment, setGrowthAutoComment] = useState<boolean>(true);
  const [growthCustomCommentText, setGrowthCustomCommentText] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem(
        'autoviral_insta_growth_stats_v1',
        JSON.stringify({
          likes: growthLikesCount,
          comments: growthCommentsCount,
          follows: growthFollowsCount,
        })
      );
    } catch {}
  }, [growthLikesCount, growthCommentsCount, growthFollowsCount]);
  const [growthRotatingComments, setGrowthRotatingComments] = useState<string[]>([
    'Trabalho lindo e muito necessário para tantas mães e professoras! Parabéns! 👏❤️',
    'Conteúdo maravilhoso! A dedicação com essas crianças faz toda a diferença! 🌟',
    'Excelente abordagem pedagógica! Salvando para aplicar aqui! 📚✨',
    'Parabéns pela dedicação e sensibilidade nesse trabalho tão nobre! 💐',
    'Adorei a dica prática! Conteúdo de alto valor para o desenvolvimento infantil! 🎯'
  ]);

  // Connected Instagram Account state (Real session detection & override)
  const [accountHandle, setAccountHandle] = useState<string>(() => {
    const savedHandle = localStorage.getItem('autoviral_insta_handle');
    if (savedHandle) return savedHandle;
    try {
      const originRaw = localStorage.getItem('autoviral_instagram_origin_accounts');
      if (originRaw) {
        const parsed = JSON.parse(originRaw);
        if (Array.isArray(parsed) && parsed[0]?.handle) return parsed[0].handle;
      }
    } catch {}
    return '@divulga_renda_digital';
  });
  const [isEditingHandle, setIsEditingHandle] = useState<boolean>(false);
  const [instaSyncNotice, setInstaSyncNotice] = useState<string | null>(null);

  // Bot running state
  const [isInstagramBotRunning, setIsInstagramBotRunning] = useState<boolean>(false);
  const [intervalSeconds, setIntervalSeconds] = useState<number>(240); // 4 minutes humanized
  const [isRandomJitter, setIsRandomJitter] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(240);

  // Daily quota & stops (Real count from 0)
  const [dailyQuotaLimit, setDailyQuotaLimit] = useState<number>(40);
  const [dailyStoriesDispatched, setDailyStoriesDispatched] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('autoviral_insta_daily_dispatched_v2');
      if (saved) return Number(saved) || 0;
    } catch {}
    return 0;
  });

  useEffect(() => {
    try {
      localStorage.setItem('autoviral_insta_daily_dispatched_v2', String(dailyStoriesDispatched));
    } catch {}
  }, [dailyStoriesDispatched]);

  // Anti-Ban 24h parameters
  const [isNightRestActive, setIsNightRestActive] = useState<boolean>(true);
  const [nightRestStart, setNightRestStart] = useState<string>('23:30');
  const [nightRestEnd, setNightRestEnd] = useState<string>('06:30');
  const [isAutoCooldownActive, setIsAutoCooldownActive] = useState<boolean>(true);
  const [actionsInCurrentCycle, setActionsInCurrentCycle] = useState<number>(0);
  const [cycleCooldownThreshold, setCycleCooldownThreshold] = useState<number>(8); // After 8 stories, pauses 1h
  const [isDefenseModalOpen, setIsDefenseModalOpen] = useState<boolean>(false);
  const [defenseTriggerReason, setDefenseTriggerReason] = useState<string>('Instagram Stories Anti-Ban Shield');

  // Mapped Instagram Targets
  const [mappedTargets, setMappedTargets] = useState<InstagramMappedTarget[]>(() => {
    try {
      const saved = localStorage.getItem('autoviral_insta_mapped_targets_v2');
      if (saved) return JSON.parse(saved);
    } catch {}

    return [
      {
        id: 'tgt-1',
        handle: '@pedagogiapratica.cwb',
        name: 'Pedagogia & Atividades Curitiba',
        followers: '38.4k',
        bio: 'Dicas diárias, fichas e recursos visuais para professoras e mães atípicas de Curitiba e região 🍎',
        category: 'influencer',
        sourceQuery: 'pedagogia curitiba',
        score: 96,
        city: 'Curitiba, PR',
        selected: true,
        status: 'pending'
      },
      {
        id: 'tgt-2',
        handle: '@mamae_atividades_tea',
        name: 'Maternidade Sem Telas',
        followers: '29.1k',
        bio: 'Rotina de coordenação motora fina, pareamento e atividades limpas para autismo e TDAH 🧩',
        category: 'profile_follower',
        sourceQuery: 'autismo infantil',
        score: 94,
        city: 'São Paulo, SP',
        selected: true,
        status: 'pending'
      },
      {
        id: 'tgt-3',
        handle: '#pedagogiainfantil',
        name: 'Hashtag Oficial Pedagogia Infantil',
        followers: '840k posts',
        bio: 'Público quente de educadoras e coordenadoras procurando recursos imprimíveis em PDF',
        category: 'hashtag',
        sourceQuery: '#pedagogiainfantil',
        score: 98,
        selected: true,
        status: 'pending'
      },
      {
        id: 'tgt-4',
        handle: '@professora_ludica',
        name: 'Prof. Marina Silveira',
        followers: '19.8k',
        bio: 'Alfabetização lúdica sem choro. Compartilhando cadernos pedagógicos prontos.',
        category: 'influencer',
        sourceQuery: 'alfabetizacao',
        score: 91,
        city: 'Londrina, PR',
        selected: true,
        status: 'pending'
      },
      {
        id: 'tgt-5',
        handle: '#atividadespedagogicas',
        name: 'Hashtag Atividades Pedagógicas',
        followers: '620k posts',
        bio: 'Tráfego contínuo de pessoas procurando atividades prontas para imprimir',
        category: 'hashtag',
        sourceQuery: '#atividadespedagogicas',
        score: 95,
        selected: true,
        status: 'pending'
      },
      {
        id: 'tgt-6',
        handle: '@rendaextra_curitiba_digital',
        name: 'Empreendedorismo Curitiba',
        followers: '24.2k',
        bio: 'Lojas virtuais prontas, e-commerce sem estoque e negócios digitais em família 💼',
        category: 'profile_follower',
        sourceQuery: 'renda extra curitiba',
        score: 89,
        city: 'Curitiba, PR',
        selected: false,
        status: 'pending'
      },
      {
        id: 'tgt-7',
        handle: '#autismoinfantil',
        name: 'Hashtag Autismo Infantil & TEA',
        followers: '410k posts',
        bio: 'Mães e terapeutas procurando atividades limpas de coordenação motora',
        category: 'hashtag',
        sourceQuery: '#autismoinfantil',
        score: 97,
        selected: true,
        status: 'pending'
      }
    ];
  });

  const [searchTargetQuery, setSearchTargetQuery] = useState<string>('');
  const [targetCategoryFilter, setTargetCategoryFilter] = useState<'all' | 'hashtag' | 'profile_follower' | 'influencer'>('all');
  const [isMappingActive, setIsMappingActive] = useState<boolean>(false);

  // Queue of Stories (Merges legacy 'autoviral_insta_story_queue' + '_v2' so ZERO prior stories are ever lost!)
  const [storyQueue, setStoryQueue] = useState<InstagramStoryItem[]>(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const buildTracked = (rawUrl: string, campId: string, title: string) =>
      `${origin}/api/r?to=${encodeURIComponent(rawUrl)}&src=instagram_story&city=Brasil&state=BR&camp=${encodeURIComponent(campId)}&title=${encodeURIComponent(title)}`;

    const combined: InstagramStoryItem[] = [];
    const seenIds = new Set<string>();
    const addParsedList = (raw: string | null) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: any) => {
            if (!item || !item.id || seenIds.has(item.id)) return;
            seenIds.add(item.id);
            const isLegacyHardcodedMock =
              (item.id === 'story-1' || item.id === 'story-2') &&
              (item.viewsEstimated === 854 || item.viewsEstimated === 1120 || item.linkClicksEstimated === 109 || item.linkClicksEstimated === 142);
            combined.push(
              isLegacyHardcodedMock
                ? {
                    ...item,
                    stickerUrl: item.stickerUrl?.includes('/api/r?')
                      ? item.stickerUrl
                      : buildTracked(item.stickerUrl || defaultCampaign.checkoutUrl || 'https://pay.kiwify.com.br/HE5xbnp', item.targetCampaignId || defaultCampaign.id, item.title || defaultCampaign.title),
                    viewsEstimated: 0,
                    linkClicksEstimated: 0,
                    salesEstimated: 0,
                  }
                : item
            );
          });
        }
      } catch {}
    };

    try {
      addParsedList(localStorage.getItem('autoviral_insta_story_queue_v2'));
      addParsedList(localStorage.getItem('autoviral_insta_story_queue'));
    } catch {}

    if (combined.length > 0) return combined;

    return [
      {
        id: 'story-tpl-1',
        title: 'Caderno de Coordenação Motora • R$ 9,90 no Pix',
        mediaUrl: '/assets/aistudio/image_e9e67204.png',
        mediaType: 'story_9_16',
        stickerText: '🔗 BAIXAR CADERNO (R$ 9,90)',
        stickerUrl: buildTracked(defaultCampaign.checkoutUrl || 'https://pay.kiwify.com.br/HE5xbnp', defaultCampaign.id, defaultCampaign.title),
        caption: 'Material em PDF pronto para imprimir. Pais e pedagogas acessam direto no Pix!',
        status: 'ready',
        viewsEstimated: 0,
        linkClicksEstimated: 0,
        salesEstimated: 0,
        targetCampaignId: defaultCampaign.id,
      },
      {
        id: 'story-tpl-2',
        title: 'Loja Pronta Sem Estoque • Comece Hoje',
        mediaUrl: '/assets/aistudio/image_25d5ade9.png',
        mediaType: 'story_9_16',
        stickerText: '👉 LIBERAR MINHA LOJA',
        stickerUrl: buildTracked(defaultCampaign.checkoutUrl || 'https://pay.kiwify.com.br/HE5xbnp', defaultCampaign.id, defaultCampaign.title),
        caption: 'Produtos validados e acesso imediato com link 100% rastreado via /api/r.',
        status: 'ready',
        viewsEstimated: 0,
        linkClicksEstimated: 0,
        salesEstimated: 0,
        targetCampaignId: defaultCampaign.id,
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('autoviral_insta_story_queue_v2', JSON.stringify(storyQueue));
      localStorage.setItem('autoviral_insta_story_queue', JSON.stringify(storyQueue));
    } catch {}
  }, [storyQueue]);

  // Helper to convert any existing platform Campaign into an InstagramCampaignItem so existing campaigns NEVER vanish
  const buildFromPlatformCampaign = (camp: Campaign): InstagramCampaignItem => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const rawCheckout = (camp.checkoutUrl || 'https://pay.kiwify.com.br/HE5xbnp').trim();
    const igId = `ig-base-${camp.id}`;
    return {
      id: igId,
      name: camp.title,
      baseCampaignId: camp.id,
      price: camp.price || 9.9,
      checkoutUrl: rawCheckout,
      trackedUrl: `${origin}/api/r?to=${encodeURIComponent(rawCheckout)}&src=instagram_story&city=Brasil&state=BR&camp=${encodeURIComponent(camp.id)}&title=${encodeURIComponent(camp.title)}&ig=${encodeURIComponent(accountHandle)}`,
      format: 'stories_sticker',
      headline: camp.headline || `👉 ${camp.title.slice(0, 40)}`,
      caption: camp.copy || camp.subheadline || camp.painPointTargeted || 'Toque no link oficial abaixo e garanta o seu acesso imediato.',
      imageUrl: camp.imageUrl || '/assets/aistudio/image_e9e67204.png',
      targetHandles: mappedTargets.filter(t => t.selected).map(t => t.handle),
      status: camp.status === 'paused' ? 'paused' : 'active',
      createdAt: camp.createdAt || 'Ativa na Plataforma',
    };
  };

  const [deletedInstaCampIds, setDeletedInstaCampIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('autoviral_deleted_insta_camp_ids');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Saved Instagram Campaigns (Auto-hydrated from ALL existing campaigns so it NEVER starts empty!)
  const [instaCampaigns, setInstaCampaigns] = useState<InstagramCampaignItem[]>(() => {
    let savedList: InstagramCampaignItem[] = [];
    let delSet = new Set<string>();
    try {
      const delRaw = localStorage.getItem('autoviral_deleted_insta_camp_ids');
      if (delRaw) delSet = new Set(JSON.parse(delRaw));
      const saved = localStorage.getItem('autoviral_insta_campaigns_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) savedList = parsed;
      }
    } catch {}

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const existingBaseIds = new Set(savedList.map(c => c.baseCampaignId));
    const existingIds = new Set(savedList.map(c => c.id));
    const hydratedFromPlatform = (campaigns || [])
      .filter(c => !delSet.has(`ig-base-${c.id}`) && !existingIds.has(`ig-base-${c.id}`) && !existingBaseIds.has(c.id))
      .map(c => {
        const rawCheckout = (c.checkoutUrl || 'https://pay.kiwify.com.br/HE5xbnp').trim();
        return {
          id: `ig-base-${c.id}`,
          name: c.title,
          baseCampaignId: c.id,
          price: c.price || 9.9,
          checkoutUrl: rawCheckout,
          trackedUrl: `${origin}/api/r?to=${encodeURIComponent(rawCheckout)}&src=instagram_story&city=Brasil&state=BR&camp=${encodeURIComponent(c.id)}&title=${encodeURIComponent(c.title)}`,
          format: 'stories_sticker' as const,
          headline: c.headline || `👉 ${c.title.slice(0, 40)}`,
          caption: c.copy || c.subheadline || c.painPointTargeted || 'Toque no link oficial abaixo e garanta o seu acesso imediato.',
          imageUrl: c.imageUrl || '/assets/aistudio/image_e9e67204.png',
          targetHandles: [],
          status: (c.status === 'paused' ? 'paused' : 'active') as 'active' | 'paused',
          createdAt: c.createdAt || 'Campanha da Plataforma',
        };
      });

    return [...savedList, ...hydratedFromPlatform];
  });

  // Sync newly created/updated platform campaigns into instaCampaigns automatically
  useEffect(() => {
    if (!campaigns || campaigns.length === 0) return;
    const delSet = new Set(deletedInstaCampIds);
    setInstaCampaigns(prev => {
      const next = [...prev];
      let changed = false;
      campaigns.forEach(camp => {
        const autoId = `ig-base-${camp.id}`;
        if (delSet.has(autoId)) return;
        const existsIdx = next.findIndex(item => item.id === autoId || item.baseCampaignId === camp.id);
        if (existsIdx === -1) {
          next.push(buildFromPlatformCampaign(camp));
          changed = true;
        } else if (next[existsIdx].id === autoId && next[existsIdx].name !== camp.title) {
          next[existsIdx] = {
            ...next[existsIdx],
            name: camp.title,
            price: camp.price || next[existsIdx].price,
            checkoutUrl: camp.checkoutUrl || next[existsIdx].checkoutUrl,
            imageUrl: camp.imageUrl || next[existsIdx].imageUrl,
          };
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [campaigns, deletedInstaCampIds]);

  useEffect(() => {
    try {
      localStorage.setItem('autoviral_insta_campaigns_v1', JSON.stringify(instaCampaigns));
    } catch {}
  }, [instaCampaigns]);

  // Firestore Workspace Sync for Instagram Campaigns, Stories, and Mapped Targets
  useEffect(() => {
    const applyCloudInstagram = (cloud: any) => {
      if (!cloud || typeof cloud !== 'object') return;
      if (Array.isArray(cloud.instaCampaigns) && cloud.instaCampaigns.length > 0) {
        setInstaCampaigns(prev => {
          const prevIds = new Set(prev.map(i => i.id));
          const delSet = new Set(deletedInstaCampIds);
          const fresh = cloud.instaCampaigns!.filter((i: any) => i?.id && !prevIds.has(i.id) && !delSet.has(i.id));
          return fresh.length > 0 ? [...prev, ...fresh] : prev;
        });
      }
      if (Array.isArray(cloud.storyQueue) && cloud.storyQueue.length > 0) {
        setStoryQueue(prev => {
          const prevIds = new Set(prev.map(i => i.id));
          const fresh = cloud.storyQueue!.filter((i: any) => i?.id && !prevIds.has(i.id));
          return fresh.length > 0 ? [...prev, ...fresh] : prev;
        });
      }
      if (Array.isArray(cloud.mappedInstaTargets) && cloud.mappedInstaTargets.length > 0) {
        setMappedTargets(prev => {
          const prevHandles = new Set(prev.map(t => (t.handle || '').toLowerCase()));
          const fresh = cloud.mappedInstaTargets!.filter((t: any) => t?.handle && !prevHandles.has(t.handle.toLowerCase()));
          return fresh.length > 0 ? [...fresh, ...prev] : prev;
        });
      }
    };

    const unsub = subscribeWorkspaceSync(applyCloudInstagram);
    const onManualSync = (ev: Event) => {
      const detail = (ev as CustomEvent).detail;
      if (detail) applyCloudInstagram(detail);
    };
    window.addEventListener('autoviral_workspace_synced', onManualSync);
    return () => {
      unsub();
      window.removeEventListener('autoviral_workspace_synced', onManualSync);
    };
  }, [deletedInstaCampIds]);

  const hasInitializedInstaSyncRef = React.useRef(false);
  useEffect(() => {
    if (!hasInitializedInstaSyncRef.current) {
      hasInitializedInstaSyncRef.current = true;
      return;
    }
    const timer = setTimeout(() => {
      saveWorkspaceSyncToFirebase({
        instaCampaigns,
        storyQueue,
        mappedInstaTargets: mappedTargets,
      });
    }, 2200);
    return () => clearTimeout(timer);
  }, [instaCampaigns, storyQueue, mappedTargets]);

  // New Instagram Campaign Builder Form State
  const [campBuilderBaseId, setCampBuilderBaseId] = useState<string>(defaultCampaign.id);
  const [campBuilderName, setCampBuilderName] = useState<string>(defaultCampaign.title || 'Campanha Instagram Orgânica');
  const [campBuilderPrice, setCampBuilderPrice] = useState<number>(defaultCampaign.price || 9.9);
  const [campBuilderCheckoutUrl, setCampBuilderCheckoutUrl] = useState<string>(defaultCampaign.checkoutUrl || 'https://pay.kiwify.com.br/HE5xbnp');
  const [campBuilderFormat, setCampBuilderFormat] = useState<'stories_sticker' | 'feed_bio' | 'direct_dm'>('stories_sticker');
  const [campBuilderHeadline, setCampBuilderHeadline] = useState<string>('👉 Material em PDF pronto para imprimir (Acesso Imediato)');
  const [campBuilderCaption, setCampBuilderCaption] = useState<string>('Toque no link oficial abaixo e garanta o seu acesso hoje mesmo no Pix com envio imediato.');
  const [campBuilderImageUrl, setCampBuilderImageUrl] = useState<string>(defaultCampaign.imageUrl || '/assets/aistudio/image_e9e67204.png');
  const [copiedCampLinkId, setCopiedCampLinkId] = useState<string | null>(null);

  // Modal to add quick story
  const [isAddStoryModalOpen, setIsAddStoryModalOpen] = useState<boolean>(false);
  const [newStoryTitle, setNewStoryTitle] = useState<string>('Nova Oferta Especial nos Stories');
  const [newStoryCampaignId, setNewStoryCampaignId] = useState<string>(defaultCampaign.id);
  const [newStoryStickerText, setNewStoryStickerText] = useState<string>('👉 TOQUE AQUI P/ COMPRAR');
  const [newStoryStickerUrl, setNewStoryStickerUrl] = useState<string>(defaultCampaign.checkoutUrl || 'https://pay.kiwify.com.br/');
  const [newStoryCaption, setNewStoryCaption] = useState<string>('Aproveite a condição exclusiva de hoje no Pix com entrega imediata!');
  const [newStoryMediaType, setNewStoryMediaType] = useState<'story_9_16' | 'feed_1_1'>('story_9_16');

  // Sync external stories sent from VisualLayoutStudio
  useEffect(() => {
    if (externalStoryQueue && externalStoryQueue.length > 0) {
      setStoryQueue(prev => {
        const merged = [...externalStoryQueue, ...prev];
        const unique = merged.filter((item, index, self) =>
          index === self.findIndex(t => t.id === item.id || t.title === item.title)
        );
        return unique;
      });
    }
  }, [externalStoryQueue]);

  // Sync confirmed handle & unlimited mapped accounts from Extension or LeadFinderTab
  useEffect(() => {
    const syncHandle = (rawHandle?: string, silent = false) => {
      if (!rawHandle || rawHandle === '@conectado') return;
      const clean = '@' + String(rawHandle).trim().replace(/^@+/, '').toLowerCase();
      setAccountHandle(clean);
      try {
        localStorage.setItem('autoviral_insta_handle', clean);
      } catch {}
      if (!silent) {
        setInstaSyncNotice(`✅ Conta ${clean} confirmada para Stories Próprio!`);
        setTimeout(() => setInstaSyncNotice(null), 4000);
      }
    };

    const appendMappedAccounts = (accounts: Array<{ handle?: string; username?: string; name?: string }>) => {
      if (!Array.isArray(accounts) || accounts.length === 0) return;
      const mappedItems: InstagramMappedTarget[] = accounts
        .filter((a) => a && (a.handle || a.username))
        .map((a, idx) => {
          const h = '@' + String(a.handle || a.username).replace(/^@+/, '').toLowerCase();
          return {
            id: `tgt-ext-${Date.now()}-${idx}-${h.slice(1, 8)}`,
            handle: h,
            name: a.name || h,
            followers: 'Mapeado Chrome',
            bio: 'Perfil real capturado via rolagem da Extensão Chrome AutoViral AI (ilimitado).',
            category: 'profile_follower',
            sourceQuery: 'chrome_extension_instagram',
            score: 95,
            selected: true,
            status: 'pending',
          };
        });

      setMappedTargets((prev) => {
        const existing = new Set(prev.map((t) => t.handle.toLowerCase()));
        const uniqueNew = mappedItems.filter((m) => !existing.has(m.handle.toLowerCase()));
        return [...uniqueNew, ...prev];
      });
    };

    const syncFromLocalStorage = () => {
      try {
        const savedHandle = localStorage.getItem('autoviral_insta_handle');
        if (savedHandle && savedHandle !== '@conectado') {
          setAccountHandle(savedHandle);
        }
        const savedTargets = localStorage.getItem('autoviral_insta_mapped_targets_v2');
        if (savedTargets) {
          const parsed = JSON.parse(savedTargets);
          if (Array.isArray(parsed)) {
            setMappedTargets((prev) => {
              const prevHandles = new Set(prev.map((t) => t.handle.toLowerCase()));
              const fresh = parsed.filter((t: any) => t?.handle && !prevHandles.has(t.handle.toLowerCase()));
              return fresh.length > 0 ? [...fresh, ...prev] : prev;
            });
          }
        }
      } catch {}
    };

    const onHandleSyncEvent = (ev: Event) => {
      const detail = (ev as CustomEvent).detail;
      if (detail?.handle) syncHandle(detail.handle);
    };
    const onAccountsEvent = (ev: Event) => {
      const detail = (ev as CustomEvent).detail;
      if (detail?.connectedHandle) syncHandle(detail.connectedHandle, true);
      if (Array.isArray(detail?.accounts)) appendMappedAccounts(detail.accounts);
    };
    const onSyncComplete = (ev: Event) => {
      const detail = (ev as CustomEvent).detail;
      syncFromLocalStorage();
      if (detail?.connectedHandle) syncHandle(detail.connectedHandle, true);
    };
    const onStorageEvent = (ev: StorageEvent) => {
      if (ev.key === 'autoviral_insta_handle' && ev.newValue) {
        setAccountHandle(ev.newValue);
      }
      if (ev.key === 'autoviral_insta_mapped_targets_v2' && ev.newValue) {
        syncFromLocalStorage();
      }
      if (ev.key === 'autoviral_insta_story_queue' && ev.newValue) {
        try {
          const parsed = JSON.parse(ev.newValue);
          if (Array.isArray(parsed)) setStoryQueue(parsed);
        } catch {}
      }
    };

    const onOpenMapperSubtab = () => {
      setActiveSubTab('mapper');
      syncFromLocalStorage();
    };

    window.addEventListener('autoviral_extension_insta_account_synced', onHandleSyncEvent);
    window.addEventListener('autoviral_extension_instagram_accounts_received', onAccountsEvent);
    window.addEventListener('autoviral_insta_sync_complete', onSyncComplete);
    window.addEventListener('autoviral_open_insta_mapper_subtab', onOpenMapperSubtab);
    window.addEventListener('storage', onStorageEvent);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('autoviral_bridge_channel');
      bc.onmessage = (msg) => {
        const data = msg.data;
        if (!data) return;
        if (data.action === 'AUTOVIRAL_INSTA_ACCOUNT_SYNC' && data.handle) {
          syncHandle(data.handle);
        } else if (data.action === 'AUTOVIRAL_IMPORT_INSTAGRAM_ACCOUNTS') {
          if (data.connectedHandle) syncHandle(data.connectedHandle, true);
          if (Array.isArray(data.accounts)) appendMappedAccounts(data.accounts);
        }
      };
    } catch {}

    // Pull any Instagram accounts/handle captured while user was in another tab
    syncFromLocalStorage();
    try {
      window.postMessage({ type: 'AUTOVIRAL_REQUEST_INSTA_SYNC' }, '*');
    } catch {}

    return () => {
      window.removeEventListener('autoviral_extension_insta_account_synced', onHandleSyncEvent);
      window.removeEventListener('autoviral_extension_instagram_accounts_received', onAccountsEvent);
      window.removeEventListener('autoviral_insta_sync_complete', onSyncComplete);
      window.removeEventListener('autoviral_open_insta_mapper_subtab', onOpenMapperSubtab);
      window.removeEventListener('storage', onStorageEvent);
      if (bc) bc.close();
    };
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('autoviral_insta_story_queue', JSON.stringify(storyQueue));
    } catch {}
  }, [storyQueue]);

  useEffect(() => {
    try {
      localStorage.setItem('autoviral_insta_mapped_targets_v2', JSON.stringify(mappedTargets));
    } catch {}
  }, [mappedTargets]);

  // Countdown timer when bot is running
  useEffect(() => {
    if (!isInstagramBotRunning) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleExecuteNextStory();
          const nextInterval = isRandomJitter
            ? Math.floor(Math.random() * (360 - 200 + 1)) + 200
            : intervalSeconds;
          return nextInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isInstagramBotRunning, intervalSeconds, isRandomJitter, actionsInCurrentCycle, dailyStoriesDispatched]);

  // Check night rest mode
  const isCurrentlyInNightRest = () => {
    if (!isNightRestActive) return false;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = nightRestStart.split(':').map(Number);
    const [endH, endM] = nightRestEnd.split(':').map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    if (startMin > endMin) {
      // Overnight (e.g. 23:30 to 06:30)
      return currentMinutes >= startMin || currentMinutes < endMin;
    }
    return currentMinutes >= startMin && currentMinutes < endMin;
  };

  // Execute story post with strict Anti-Ban 24h triggers
  const handleExecuteNextStory = () => {
    // 1. Check if daily stop limit reached
    if (dailyStoriesDispatched >= dailyQuotaLimit) {
      setIsInstagramBotRunning(false);
      return;
    }

    // 2. Check if cycle cooldown should trigger
    if (isAutoCooldownActive && actionsInCurrentCycle + 1 >= cycleCooldownThreshold) {
      setIsInstagramBotRunning(false);
      setActionsInCurrentCycle(0);
      setDefenseTriggerReason('Frequência alta de Stories (Ciclo de 8 disparos)');
      setIsDefenseModalOpen(true);
      return;
    }

    const readyIndex = storyQueue.findIndex(s => s.status === 'ready');
    if (readyIndex === -1) {
      setIsInstagramBotRunning(false);
      return;
    }

    const targetItem = storyQueue[readyIndex];
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const updatedQueue = [...storyQueue];
    updatedQueue[readyIndex] = {
      ...targetItem,
      status: 'published',
      publishedAt: `Hoje ${nowTime}`,
      viewsEstimated: 0,
      linkClicksEstimated: 0,
      salesEstimated: 0,
    };

    setStoryQueue(updatedQueue);
    setDailyStoriesDispatched(prev => prev + 1);
    setActionsInCurrentCycle(prev => prev + 1);
    setInstaSyncNotice(`✅ "${targetItem.title}" marcado na lista! Para gerar cliques reais, publique a imagem no Instagram de ${accountHandle} com o sticker de link (/api/r).`);
    setTimeout(() => setInstaSyncNotice(null), 6000);
  };

  // Quick manual checklist confirmation + clipboard copy of /api/r link
  const handlePostNow = (id: string) => {
    const idx = storyQueue.findIndex(s => s.id === id);
    if (idx === -1) return;

    const targetItem = storyQueue[idx];
    try {
      navigator.clipboard?.writeText(targetItem.stickerUrl);
    } catch {}
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const updated = [...storyQueue];
    updated[idx] = {
      ...targetItem,
      status: 'published',
      publishedAt: `Hoje ${nowTime}`,
      viewsEstimated: 0,
      linkClicksEstimated: 0,
      salesEstimated: 0,
    };
    setStoryQueue(updated);
    setDailyStoriesDispatched(prev => prev + 1);
    setActionsInCurrentCycle(prev => prev + 1);
    setInstaSyncNotice(`📋 Link /api/r copiado e Story marcado como publicado no checklist! Cole na Figurinha de Link ao subir no Instagram de ${accountHandle}.`);
    setTimeout(() => setInstaSyncNotice(null), 6000);
  };

  // Request real accounts from Open Instagram Web Tab via Chrome Extension v1.3.5
  const handleMapInstagramOpenTab = () => {
    setIsMappingActive(true);
    let finished = false;

    const cleanup = () => {
      window.removeEventListener('autoviral_insta_sync_complete', handleResult);
    };

    const handleResult = (ev: Event) => {
      if (finished) return;
      finished = true;
      clearTimeout(fallbackTimer);
      cleanup();
      setIsMappingActive(false);

      const detail = (ev as CustomEvent).detail || {};
      const count = Number(detail.count || 0);
      const handle = detail.connectedHandle ? ` (${detail.connectedHandle})` : '';

      if (count > 0) {
        setInstaSyncNotice(`✅ ${count} perfis reais sincronizados da sua aba do Instagram${handle}!`);
      } else {
        setInstaSyncNotice(`ℹ️ Extensão conectada${handle}, mas 0 perfis novos na aba atual do Instagram. Abra a Busca ou Seguidores no Instagram, role a tela e clique em "Mapear Visíveis" no widget flutuante.`);
      }
      setTimeout(() => setInstaSyncNotice(null), 6000);
    };

    const fallbackTimer = setTimeout(() => {
      if (finished) return;
      finished = true;
      cleanup();
      setIsMappingActive(false);
      setInstaSyncNotice('⚠️ Extensão Chrome v1.3.7 não respondeu. Instale/atualize a Extensão v1.3.7 em chrome://extensions, recarregue o Instagram (F5) e este painel.');
      setTimeout(() => setInstaSyncNotice(null), 7000);
    }, 2800);

    window.addEventListener('autoviral_insta_sync_complete', handleResult);
    try {
      window.postMessage({ type: 'AUTOVIRAL_REQUEST_INSTA_SYNC' }, '*');
    } catch {
      clearTimeout(fallbackTimer);
      cleanup();
      setIsMappingActive(false);
    }
  };

  // Filter mapped targets
  const filteredTargets = mappedTargets.filter(t => {
    const matchesSearch =
      t.handle.toLowerCase().includes(searchTargetQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchTargetQuery.toLowerCase()) ||
      t.bio.toLowerCase().includes(searchTargetQuery.toLowerCase());

    const matchesCategory =
      targetCategoryFilter === 'all' || t.category === targetCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  const selectedTargetCount = mappedTargets.filter(t => t.selected).length;

  // Build real tracked link (/api/r) for Stories Próprio
  const wrapWithRealTrackedUrl = (rawUrl: string, camp: Campaign) => {
    if (!rawUrl || rawUrl.includes('/api/r?')) return rawUrl;
    return `${window.location.origin}/api/r?to=${encodeURIComponent(rawUrl)}&src=instagram_story&city=Brasil&state=BR&camp=${encodeURIComponent(camp.id)}&title=${encodeURIComponent(camp.title)}&ig=${encodeURIComponent(accountHandle)}`;
  };

  // Create & Save Instagram Campaign
  const handleSaveInstagramCampaign = (sendToStoryQueue: boolean = true) => {
    const selectedHandles = mappedTargets.filter(t => t.selected).map(t => t.handle);
    const baseCamp = campaigns.find(c => c.id === campBuilderBaseId) || defaultCampaign;
    const rawCheckout = (campBuilderCheckoutUrl || baseCamp.checkoutUrl || 'https://pay.kiwify.com.br/HE5xbnp').trim();
    const campId = `ig-camp-${Date.now()}`;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const trackedUrl = `${origin}/api/r?to=${encodeURIComponent(rawCheckout)}&src=${encodeURIComponent(campBuilderFormat === 'stories_sticker' ? 'instagram_story' : campBuilderFormat === 'direct_dm' ? 'instagram_direct' : 'instagram_bio')}&city=Brasil&state=BR&camp=${encodeURIComponent(campId)}&title=${encodeURIComponent(campBuilderName.trim() || baseCamp.title)}&ig=${encodeURIComponent(accountHandle)}`;

    const newIgCamp: InstagramCampaignItem = {
      id: campId,
      name: campBuilderName.trim() || baseCamp.title,
      baseCampaignId: baseCamp.id,
      price: campBuilderPrice > 0 ? campBuilderPrice : 9.9,
      checkoutUrl: rawCheckout,
      trackedUrl,
      format: campBuilderFormat,
      headline: campBuilderHeadline.trim() || 'Confira agora no link oficial!',
      caption: campBuilderCaption.trim(),
      imageUrl: campBuilderImageUrl || baseCamp.imageUrl || '/assets/aistudio/image_e9e67204.png',
      targetHandles: selectedHandles,
      status: 'active',
      createdAt: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    };

    setInstaCampaigns(prev => [newIgCamp, ...prev]);

    if (sendToStoryQueue) {
      const storyItem: InstagramStoryItem = {
        id: `story-ig-${Date.now()}`,
        title: newIgCamp.name,
        mediaUrl: newIgCamp.imageUrl,
        mediaType: campBuilderFormat === 'feed_bio' ? 'feed_1_1' : 'story_9_16',
        stickerText: newIgCamp.headline.slice(0, 34),
        stickerUrl: trackedUrl,
        caption: newIgCamp.caption,
        status: 'ready',
        viewsEstimated: 0,
        linkClicksEstimated: 0,
        salesEstimated: 0,
        targetCampaignId: newIgCamp.id,
      };
      setStoryQueue(prev => [storyItem, ...prev]);
    }

    setInstaSyncNotice(`✅ Campanha Instagram "${newIgCamp.name}" salva com link real /api/r para ${selectedHandles.length} perfis mapeados!`);
    setTimeout(() => setInstaSyncNotice(null), 5000);
  };

  // Add new story
  const handleAddNewStory = () => {
    const camp = campaigns.find(c => c.id === newStoryCampaignId) || defaultCampaign;
    const trackedStickerUrl = wrapWithRealTrackedUrl(newStoryStickerUrl, camp);
    const newItem: InstagramStoryItem = {
      id: `story-${Date.now()}`,
      title: newStoryTitle,
      mediaUrl: camp.imageUrl || '/assets/aistudio/image_5456885b.png',
      mediaType: newStoryMediaType,
      stickerText: newStoryStickerText,
      stickerUrl: trackedStickerUrl,
      caption: newStoryCaption,
      status: 'ready',
      viewsEstimated: 0,
      linkClicksEstimated: 0,
      salesEstimated: 0,
      targetCampaignId: camp.id,
    };

    setStoryQueue(prev => [newItem, ...prev]);
    setIsAddStoryModalOpen(false);
  };

  // 100% REAL Metrics summary from /api/tracking/events (!isSimulation && source === 'instagram')
  const realInstaClicks = realInstaEvents.filter(
    e => e.type === 'checkout_click' || e.type === 'click' || e.type === 'checkout_open'
  ).length;
  const realInstaCheckoutOpens = realInstaEvents.filter(
    e => e.type === 'checkout_open' || e.type === 'checkout_click'
  ).length;
  const realInstaSalesEvents = realInstaEvents.filter(e => e.type === 'conversion');
  const realInstaSalesCount = realInstaSalesEvents.length;
  const realInstaRevenue = realInstaSalesEvents.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const publishedCount = storyQueue.filter(s => s.status === 'published').length;
  const readyCount = storyQueue.filter(s => s.status === 'ready').length;

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-rose-950 border border-purple-800/40 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-rose-900/40">
              <Instagram className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Robô Instagram • Mapeador, Stories &amp; Defesa 24 Horas
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  Postagem Automática Logada
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Mapeia perfis e hashtags do Instagram, dispara Stories com figurinha de link Kiwify e opera 24h com parada anti-bloqueio.
              </p>
            </div>
          </div>

          {/* Account Status Pill */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 p-0.5 flex-shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-white text-xs font-bold">
                📸
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Instagram Conectado:
              </div>
              {isEditingHandle ? (
                <div className="flex items-center gap-1 mt-0.5">
                  <input
                    type="text"
                    value={accountHandle}
                    onChange={(e) => setAccountHandle(e.target.value)}
                    className="bg-slate-950 text-white font-bold text-xs px-2 py-0.5 rounded border border-purple-500 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      const clean = '@' + accountHandle.trim().replace(/^@+/, '').toLowerCase();
                      setAccountHandle(clean);
                      localStorage.setItem('autoviral_insta_handle', clean);
                      window.dispatchEvent(
                        new CustomEvent('autoviral_extension_insta_account_synced', {
                          detail: { handle: clean },
                        })
                      );
                      setIsEditingHandle(false);
                      setInstaSyncNotice(`✅ Conta ${clean} confirmada para Stories Próprio!`);
                      setTimeout(() => setInstaSyncNotice(null), 4000);
                    }}
                    className="text-[10px] bg-purple-600 px-2 py-0.5 rounded font-bold text-white cursor-pointer"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-extrabold text-white text-xs">{accountHandle}</span>
                  <button
                    onClick={() => setIsEditingHandle(true)}
                    className="text-[10px] text-purple-400 hover:text-purple-300 underline cursor-pointer"
                  >
                    (Alterar)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {instaSyncNotice && (
          <div className="mt-3 p-2.5 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-xs font-bold text-emerald-300">
            {instaSyncNotice}
          </div>
        )}

        {/* Subtabs Controller */}
        <div className="mt-5 pt-4 border-t border-purple-900/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-purple-900/40">
            <button
              type="button"
              onClick={() => setActiveSubTab('campaigns')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeSubTab === 'campaigns'
                  ? 'bg-gradient-to-r from-purple-600 to-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campanha Instagram ({instaCampaigns.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('stories')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeSubTab === 'stories'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Stories &amp; Links ({storyQueue.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('mapper')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeSubTab === 'mapper'
                  ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Mapeador de Perfis ({mappedTargets.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('growth')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeSubTab === 'growth'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-300" />
              <span>Curtir &amp; Comentar</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('antiban_defense')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeSubTab === 'antiban_defense'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-300" />
              <span>Anti-Ban 24h</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveSubTab('campaigns')}
              className="px-3.5 py-2 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Campanha Instagram</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDefenseTriggerReason('Simulação Manual do Escudo Anti-Ban Instagram (59:50)');
                setIsDefenseModalOpen(true);
              }}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-blue-500/40 text-blue-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
              title="Visualizar e testar tela de proteção Anti-Ban de 1 hora"
            >
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Simular Defesa (59:50)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsInstagramBotRunning(!isInstagramBotRunning)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md whitespace-nowrap shrink-0 ${
                isInstagramBotRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
              }`}
            >
              {isInstagramBotRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pausar Fila Assistida
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Iniciar Fila Assistida ({readyCount})
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 100% REAL Metrics Counters Grid (Zero Simulated Numbers) */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs px-1">
          <span className="text-slate-300 flex items-center gap-1.5 font-semibold">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Desempenho Real do Instagram (Sem Simulações)
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-emerald-300 font-medium">
              Contagem auditada via redirecionador /api/r e Webhook
            </span>
            <button
              type="button"
              onClick={fetchRealInstaMetrics}
              disabled={isLoadingRealMetrics}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingRealMetrics ? 'animate-spin' : ''}`} />
              Atualizar Reais
            </button>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-300 leading-relaxed">
          <strong className="text-white">Verificação de Eficiência:</strong> O navegador não publica Stories automaticamente dentro da sua conta do Instagram por segurança. O número em <strong className="text-cyan-300">Cliques Reais (/api/r)</strong> e <strong className="text-amber-300">Abriram o Checkout</strong> é 100% real — ele só sobe quando você baixa a imagem abaixo, posta o Story no Instagram com a <strong>Figurinha de Link (/api/r)</strong> copiada aqui e alguém clica nela.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <span className="text-slate-400 text-xs font-bold flex items-center gap-1.5">
              <Instagram className="w-4 h-4 text-purple-400" />
              Stories Marcados (Checklist)
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {publishedCount} marcados
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Fila pronta: {readyCount} · Requer postagem no IG com link
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <span className="text-slate-400 text-xs font-bold flex items-center gap-1.5">
              <MousePointerClick className="w-4 h-4 text-cyan-400" />
              Cliques Reais (/api/r)
            </span>
            <div className="text-2xl font-black text-cyan-300 mt-1">
              {realInstaClicks} cliques
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Apenas visitantes reais no link do Story/Bio
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <span className="text-slate-400 text-xs font-bold flex items-center gap-1.5">
              <ExternalLink className="w-4 h-4 text-amber-400" />
              Abriram o Checkout
            </span>
            <div className="text-2xl font-black text-amber-300 mt-1">
              {realInstaCheckoutOpens} aberturas
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Redirecionados com sucesso para Kiwify/Hotmart
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <span className="text-slate-400 text-xs font-bold flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Vendas Reais no Pix
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {realInstaSalesCount} vendas
            </div>
            <div className="text-[11px] text-emerald-300 mt-1">
              R$ {realInstaRevenue.toFixed(2).replace('.', ',')} confirmados via Webhook
            </div>
          </div>
        </div>
      </div>

      {/* SUBTAB 0: CAMPANHA INSTAGRAM (User requested: "ultima imagme deveria criar ' campanha instagram'") */}
      {activeSubTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rose-400" />
                  Criar Campanha Instagram (Com Link Rastreado Real /api/r)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure sua campanha para Stories Próprio ({accountHandle}), Feed + Bio ou Direct nos {selectedTargetCount} perfis mapeados.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('mapper')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-purple-200 border border-purple-700/50 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0"
              >
                Selecionar Perfis Mapeados ({selectedTargetCount})
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Produto / Campanha Base:</label>
                    <select
                      value={campBuilderBaseId}
                      onChange={(e) => {
                        const chosen = campaigns.find(c => c.id === e.target.value);
                        setCampBuilderBaseId(e.target.value);
                        if (chosen) {
                          setCampBuilderName(chosen.title);
                          setCampBuilderPrice(chosen.price || 9.9);
                          setCampBuilderCheckoutUrl(chosen.checkoutUrl || 'https://pay.kiwify.com.br/HE5xbnp');
                          setCampBuilderImageUrl(chosen.imageUrl || '/assets/aistudio/image_e9e67204.png');
                          if (chosen.headline) setCampBuilderHeadline(chosen.headline);
                          if (chosen.copy) setCampBuilderCaption(chosen.copy);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                    >
                      {campaigns.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.title} (R$ {(c.price || 9.9).toFixed(2).replace('.', ',')})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Formato no Instagram:</label>
                    <select
                      value={campBuilderFormat}
                      onChange={(e) => setCampBuilderFormat(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="stories_sticker">Stories Próprio (9:16 + Sticker Link)</option>
                      <option value="feed_bio">Feed / Reels + Link na Bio</option>
                      <option value="direct_dm">Direct para Perfis Mapeados</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">Nome da Campanha Instagram:</label>
                    <input
                      type="text"
                      value={campBuilderName}
                      onChange={(e) => setCampBuilderName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                      placeholder="Ex: Stories Tarefinhas TEA Curitiba"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Valor (R$):</label>
                    <input
                      type="number"
                      step="0.10"
                      value={campBuilderPrice}
                      onChange={(e) => setCampBuilderPrice(Number(e.target.value) || 9.9)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white tabular-nums focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Link Oficial do Checkout (Destino):</label>
                  <input
                    type="text"
                    value={campBuilderCheckoutUrl}
                    onChange={(e) => setCampBuilderCheckoutUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                    placeholder="https://pay.kiwify.com.br/HE5xbnp"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Texto da Figurinha / Chamada Principal:</label>
                  <input
                    type="text"
                    value={campBuilderHeadline}
                    onChange={(e) => setCampBuilderHeadline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Legenda / Copy da Campanha:</label>
                  <textarea
                    rows={3}
                    value={campBuilderCaption}
                    onChange={(e) => setCampBuilderCaption(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleSaveInstagramCampaign(true)}
                    className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Salvar Campanha + Enviar p/ Fila de Stories
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveInstagramCampaign(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Apenas Salvar Campanha
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="text-[11px] text-slate-400 font-semibold">Prévia da Conta &amp; Público:</div>
                  <div className="flex items-center gap-3">
                    <img
                      src={campBuilderImageUrl}
                      alt={campBuilderName}
                      referrerPolicy="no-referrer"
                      className="w-16 h-20 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="text-sm font-bold text-white truncate">{campBuilderName}</div>
                      <div className="text-xs text-purple-300 font-mono">{accountHandle}</div>
                      <div className="text-[11px] text-slate-400">
                        {selectedTargetCount} perfis mapeados selecionados · R$ {campBuilderPrice.toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1.5">
                  <div className="text-[11px] text-cyan-300 font-bold">Rastreamento Automático /api/r Ativado</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Ao salvar, é gerado um link real conectado ao servidor. Todo clique real no seu Story, Bio ou Direct aparece na hora em <strong>Quem Clicou (Número Real)</strong> e nos cards acima.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Saved Instagram Campaigns List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                Campanhas Instagram Salvas ({instaCampaigns.length})
              </h3>
              <span className="text-[11px] text-slate-400">Persistência automática garantida</span>
            </div>

            {instaCampaigns.length === 0 ? (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center space-y-2">
                <p className="text-xs text-slate-300 font-semibold">
                  Nenhuma campanha Instagram criada ainda.
                </p>
                <p className="text-[11px] text-slate-500">
                  Preencha o formulário acima e clique em "Salvar Campanha + Enviar p/ Fila de Stories" para gerar seu link real rastreado.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {instaCampaigns.map((camp) => (
                  <div key={camp.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">{camp.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {camp.format === 'stories_sticker' ? 'Stories 9:16' : camp.format === 'feed_bio' ? 'Feed + Bio' : 'Direct'} · {camp.targetHandles.length} perfis · {camp.createdAt}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setInstaCampaigns(prev => prev.filter(item => item.id !== camp.id));
                          if (camp.id.startsWith('ig-base-')) {
                            setDeletedInstaCampIds(prev => {
                              const next = [...prev, camp.id];
                              try {
                                localStorage.setItem('autoviral_deleted_insta_camp_ids', JSON.stringify(next));
                              } catch {}
                              return next;
                            });
                          }
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                        title="Excluir campanha"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between gap-2">
                      <code className="text-[11px] text-cyan-300 font-mono truncate">{camp.trackedUrl}</code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(camp.trackedUrl);
                          setCopiedCampLinkId(camp.id);
                          setTimeout(() => setCopiedCampLinkId(null), 2000);
                        }}
                        className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-800 rounded text-[11px] font-bold shrink-0 cursor-pointer"
                      >
                        {copiedCampLinkId === camp.id ? 'Copiado ✓' : 'Copiar Link'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <a
                        href={camp.trackedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                      >
                        Testar Redirecionamento Real <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setActiveSubTab('stories')}
                        className="text-purple-300 hover:text-purple-200 font-semibold cursor-pointer"
                      >
                        Ver na Fila de Stories →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    {/* SUBTAB 1: Stories Queue & Dispatch */}
      {activeSubTab === 'stories' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                Fila de Stories Próprio • Publicando na Conta{' '}
                <span className="text-purple-300 font-mono bg-purple-950/80 px-2 py-0.5 rounded-lg border border-purple-500/50 text-xs">
                  {accountHandle}
                </span>
                <span>({storyQueue.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Certeza da conta ativa: os Stories com figurinha rastreada de cliques reais serão publicados em <strong>{accountHandle}</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddStoryModalOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                Agendar Novo Story
              </button>
            </div>
          </div>

          {/* Stories List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {storyQueue.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                  item.status === 'published'
                    ? 'bg-slate-950/70 border-emerald-800/40'
                    : 'bg-slate-950 border-purple-900/40 hover:border-purple-600'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.mediaUrl}
                        alt={item.title}
                        className="w-12 h-16 rounded-lg object-cover border border-purple-800/50 flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-purple-900/80 text-purple-300 uppercase">
                            {item.mediaType === 'story_9_16' ? '📱 Story 9:16' : '⏹️ Feed 1:1'}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            item.status === 'published' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40' : 'bg-amber-950 text-amber-300 border border-amber-800/40'
                          }`}>
                            {item.status === 'published' ? '✓ Publicado' : '⏳ Na Fila'}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white line-clamp-2">{item.title}</h4>
                      </div>
                    </div>

                    {item.status === 'ready' && (
                      <button
                        onClick={() => handlePostNow(item.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer flex-shrink-0"
                        title="Copiar link /api/r e marcar este Story como publicado no Instagram"
                      >
                        <Send className="w-3 h-3" />
                        Marcar Publicado
                      </button>
                    )}
                  </div>

                  {/* Sticker Banner */}
                  <div className="mt-3 bg-white/95 text-slate-900 rounded-lg p-2 text-xs font-black flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-blue-600 font-extrabold text-sm">🔗</span>
                      <span className="truncate">{item.stickerText}</span>
                    </div>
                    <a
                      href={item.stickerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-blue-600 hover:text-blue-800 underline ml-2 flex-shrink-0"
                    >
                      Testar Link
                    </a>
                  </div>

                  {/* Real Assisted Publish Tools: Copy /api/r Link + Download Image + Open Instagram */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(item.stickerUrl);
                        setCopiedCampLinkId(item.id);
                        setTimeout(() => setCopiedCampLinkId(null), 2000);
                      }}
                      className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-800 rounded text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCampLinkId === item.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCampLinkId === item.id ? 'Link Copiado!' : 'Copiar Link (/api/r)'}</span>
                    </button>

                    <a
                      href={item.mediaUrl}
                      download={`story-${item.id}.png`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded text-[11px] font-semibold inline-flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Baixar Imagem</span>
                    </a>

                    <a
                      href="https://www.instagram.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-700 rounded text-[11px] font-semibold inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Abrir Instagram</span>
                    </a>
                  </div>

                  {/* Caption preview */}
                  {item.caption && (
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                      {item.caption}
                    </p>
                  )}
                </div>

                {/* Bottom status & real link audit */}
                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Conta: <strong className="text-slate-200">{accountHandle}</strong></span>
                  <span className="text-cyan-300 font-medium">
                    Link rastreado (/api/r) ativo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: Instagram Mapper (Hashtags, Followers & Target Profiles) */}
      {activeSubTab === 'mapper' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Mapeador do Instagram • Rolagem de Busca, Hashtags &amp; Seguidores
                </h3>
                <span className="bg-purple-950 text-purple-300 border border-purple-800/60 text-[10px] font-black px-2 py-0.5 rounded-full">
                  Extensão Bridge Ativa
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Conforme você rola a busca de hashtags ou seguidores no Instagram aberto, o robô captura o perfil, calcula o interesse e guarda para divulgações.
              </p>
            </div>

            <button
              onClick={handleMapInstagramOpenTab}
              disabled={isMappingActive}
              className="px-4 py-2.5 bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-900/40 flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isMappingActive ? 'animate-spin' : ''}`} />
              <span>{isMappingActive ? 'Mapeando Aba do Instagram...' : 'Mapear da Aba Aberta do Instagram'}</span>
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por hashtag (#pedagogia), nome (@usuario) ou cidade..."
                value={searchTargetQuery}
                onChange={(e) => setSearchTargetQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setTargetCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  targetCategoryFilter === 'all'
                    ? 'bg-purple-700 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Todos ({mappedTargets.length})
              </button>
              <button
                type="button"
                onClick={() => setTargetCategoryFilter('hashtag')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  targetCategoryFilter === 'hashtag'
                    ? 'bg-purple-700 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                # Hashtags
              </button>
              <button
                type="button"
                onClick={() => setTargetCategoryFilter('influencer')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  targetCategoryFilter === 'influencer'
                    ? 'bg-purple-700 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Perfis Nichados
              </button>
            </div>
          </div>

          {/* Selection Stats */}
          <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>
                <strong className="text-white">{selectedTargetCount}</strong> de {mappedTargets.length} alvos selecionados para campanhas
              </span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setMappedTargets(prev => prev.map(t => ({ ...t, selected: true })));
                }}
                className="text-[11px] text-purple-400 hover:underline font-semibold"
              >
                Selecionar Todos
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setMappedTargets(prev => prev.map(t => ({ ...t, selected: false })));
                }}
                className="text-[11px] text-slate-400 hover:underline font-semibold"
              >
                Desmarcar
              </button>
            </div>
          </div>

          {/* Target List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTargets.map((target) => (
              <div
                key={target.id}
                onClick={() => {
                  setMappedTargets(prev =>
                    prev.map(t => (t.id === target.id ? { ...t, selected: !t.selected } : t))
                  );
                }}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                  target.selected
                    ? 'bg-purple-950/40 border-purple-500/80 shadow-md ring-1 ring-purple-500/50'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white text-xs font-bold">
                        {target.category === 'hashtag' ? '#' : 'IG'}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block truncate max-w-[150px]">
                          {target.handle}
                        </span>
                        <span className="text-[10px] text-slate-400">{target.name}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {target.followers}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {target.bio}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-bold">
                    Score: {target.score}/100
                  </span>
                  {target.city && (
                    <span className="text-slate-400 font-mono">
                      📍 {target.city}
                    </span>
                  )}
                  <span className={`font-bold ${target.selected ? 'text-purple-300' : 'text-slate-500'}`}>
                    {target.selected ? '✓ Selecionado' : 'Clique p/ Selecionar'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: Follower Growth Engine (User requested: "no instagram: curtir e comentar 'pra ter seguidor'") */}
      {activeSubTab === 'growth' && (
        <div className="space-y-6">
          {/* Growth Strategy Banner */}
          <div className="bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-900 border border-amber-500/40 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-gradient-to-br from-amber-500 to-rose-600 rounded-xl text-white shadow-lg shadow-amber-900/30">
                    <Heart className="w-5 h-5 fill-white" />
                  </span>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Engajamento Assistido: Curtir + Comentar para Atrair Seguidores Reais
                  </h3>
                  <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                    100% Seguro (Sem Spam)
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed">
                  Abra o perfil real capturado abaixo, curta as 3 últimas postagens, cole o comentário humanizado rotativo (pronto para copiar em 1 clique) e marque como concluído. Isso gera notificações reais no celular do lead sem risco de bloqueio do Instagram.
                </p>
              </div>

              {(() => {
                const nextPending = mappedTargets.find(t => t.selected && t.status !== 'messaged') || mappedTargets.find(t => t.status !== 'messaged');
                if (!nextPending) {
                  return (
                    <button
                      type="button"
                      onClick={() => setIsGrowthBotRunning(!isGrowthBotRunning)}
                      className="px-5 py-3 rounded-xl text-xs font-black bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center gap-2 shrink-0 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Todos os Perfis Engajados!
                    </button>
                  );
                }
                const cleanHandle = nextPending.handle.replace(/^[@#]/, '');
                const profileHref = nextPending.handle.startsWith('#')
                  ? `https://www.instagram.com/explore/tags/${encodeURIComponent(cleanHandle)}/`
                  : `https://www.instagram.com/${encodeURIComponent(cleanHandle)}/`;
                const nextComment = growthRotatingComments[0] || '';
                return (
                  <a
                    href={profileHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      try { navigator.clipboard?.writeText(nextComment); } catch {}
                      setCopiedGrowthTargetId(nextPending.id);
                      setInstaSyncNotice(`📋 Comentário copiado! Abrindo ${nextPending.handle} — cole no post e depois clique em "✓ Marcar Interagido".`);
                      setTimeout(() => setCopiedGrowthTargetId(null), 3000);
                    }}
                    className="px-5 py-3 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-xl shrink-0 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white shadow-amber-900/50"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Copiar Comentário &amp; Abrir {nextPending.handle}
                  </a>
                );
              })()}
            </div>

            {/* Growth KPI counters (100% real user-confirmed actions) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80">
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  Curtidas Registradas
                </span>
                <div className="text-xl font-black text-rose-400 mt-1">{growthLikesCount}</div>
                <span className="text-[10px] text-slate-400">3 curtidas por perfil marcado</span>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                  Comentários Feitos
                </span>
                <div className="text-xl font-black text-blue-400 mt-1">{growthCommentsCount}</div>
                <span className="text-[10px] text-slate-400">Rotativos e humanizados</span>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Seguidos Estratégicos
                </span>
                <div className="text-xl font-black text-emerald-400 mt-1">{growthFollowsCount}</div>
                <span className="text-[10px] text-slate-400">Perfis quentes do nicho</span>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-amber-900/60 bg-amber-950/20">
                <span className="text-[10px] text-amber-300 uppercase font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  Perfis Interagidos
                </span>
                <div className="text-xl font-black text-amber-400 mt-1">
                  {mappedTargets.filter(t => t.status === 'messaged').length}
                </div>
                <span className="text-[10px] text-amber-300/80">
                  de {mappedTargets.length} na fila real
                </span>
              </div>
            </div>
          </div>

          {/* Configuration and Rotating Comments */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Engagement Settings */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Checklist de Ação por Perfil
              </h4>

              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 cursor-pointer hover:border-slate-700">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white block">Curtir 3 Últimos Posts (+3 curtidas)</span>
                    <span className="text-[11px] text-slate-400 block">Chama atenção no feed de notificações do lead</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={growthLikeRecentPosts}
                    onChange={(e) => setGrowthLikeRecentPosts(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 cursor-pointer hover:border-slate-700">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white block">Colar Comentário Rotativo (+1 comentário)</span>
                    <span className="text-[11px] text-slate-400 block">Usa uma variação diferente da lista ao lado</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={growthAutoComment}
                    onChange={(e) => setGrowthAutoComment(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 cursor-pointer hover:border-slate-700">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white block">Seguir Perfil (Follow Recíproco)</span>
                    <span className="text-[11px] text-slate-400 block">Acelera visita de volta para o link da sua Bio</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={growthAutoFollow}
                    onChange={(e) => setGrowthAutoFollow(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-300 block">
                      Ritmo Recomendado: 5 a 10 perfis/hora
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      Protege {accountHandle} contra bloqueios da Meta
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setGrowthLikesCount(0);
                      setGrowthCommentsCount(0);
                      setGrowthFollowsCount(0);
                    }}
                    className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Zerar Contadores
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Rotating Comments Bank */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    Banco de Comentários Rotativos Humanizados
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Cada card abaixo sorteia um comentário diferente para copiar em 1 clique
                  </p>
                </div>
                <span className="text-xs bg-slate-950 text-blue-300 border border-slate-800 px-2.5 py-1 rounded-lg font-bold">
                  {growthRotatingComments.length} variações
                </span>
              </div>

              {/* Add new comment */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={growthCustomCommentText}
                  onChange={(e) => setGrowthCustomCommentText(e.target.value)}
                  placeholder="Escreva um novo comentário de engajamento..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (growthCustomCommentText.trim()) {
                      setGrowthRotatingComments(prev => [...prev, growthCustomCommentText.trim()]);
                      setGrowthCustomCommentText('');
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar
                </button>
              </div>

              {/* List of comments */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {growthRotatingComments.map((comment, index) => (
                  <div
                    key={index}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <span className="text-slate-200 leading-relaxed">
                      "{comment}"
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (growthRotatingComments.length > 1) {
                          setGrowthRotatingComments(prev => prev.filter((_, i) => i !== index));
                        }
                      }}
                      className="text-slate-500 hover:text-red-400 transition cursor-pointer p-1"
                      title="Remover variação"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Target Profiles Queue (Unlimited, Scrollable, Actionable) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Fila de Perfis Segmentados Prontos para Interação (Ilimitado)
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Todos os perfis capturados pela Extensão Chrome v1.3.7 com botões diretos para agir
                </p>
              </div>
              <span className="text-xs text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/60 px-3 py-1 rounded-xl">
                {mappedTargets.filter(t => t.selected).length} / {mappedTargets.length} perfis ativos
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto pr-1">
              {mappedTargets.map((target, idx) => {
                const suggestedComment = growthRotatingComments[idx % growthRotatingComments.length] || '';
                const cleanHandle = target.handle.replace(/^[@#]/, '');
                const instaHref = target.handle.startsWith('#')
                  ? `https://www.instagram.com/explore/tags/${encodeURIComponent(cleanHandle)}/`
                  : `https://www.instagram.com/${encodeURIComponent(cleanHandle)}/`;
                const isDone = target.status === 'messaged';

                return (
                  <div
                    key={target.id}
                    className={`bg-slate-950 p-4 rounded-xl border space-y-2.5 transition flex flex-col justify-between ${
                      isDone ? 'border-emerald-700/60 bg-emerald-950/10' : 'border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white font-mono truncate">{target.handle}</span>
                        <span className="text-[10px] text-purple-400 bg-purple-950/70 border border-purple-800/60 px-2 py-0.5 rounded font-bold shrink-0">
                          {target.followers}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{target.bio}</p>
                      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2 text-[10px] text-slate-300 italic line-clamp-2">
                        "{suggestedComment}"
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          try { navigator.clipboard?.writeText(suggestedComment); } catch {}
                          setCopiedGrowthTargetId(target.id);
                          setTimeout(() => setCopiedGrowthTargetId(null), 2000);
                        }}
                        className="flex-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition"
                      >
                        {copiedGrowthTargetId === target.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedGrowthTargetId === target.id ? 'Copiado!' : 'Copiar Comentário'}</span>
                      </button>

                      <a
                        href={instaHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-700/70 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Abrir</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          if (!isDone) {
                            setMappedTargets(prev =>
                              prev.map(t => (t.id === target.id ? { ...t, status: 'messaged' } : t))
                            );
                            if (growthLikeRecentPosts) setGrowthLikesCount(prev => prev + 3);
                            if (growthAutoComment) setGrowthCommentsCount(prev => prev + 1);
                            if (growthAutoFollow) setGrowthFollowsCount(prev => prev + 1);
                          }
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 transition cursor-pointer ${
                          isDone
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isDone ? '✓ Interação Concluída' : '✓ Marcar Interagido (+Likes/Comentário)'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: Anti-Ban Defense & 24h Work Safety Shield */}
      {activeSubTab === 'antiban_defense' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Central de Blindagem Anti-Ban &amp; Defesa 24 Horas do Instagram
              </h3>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-[10px] font-black px-2 py-0.5 rounded-full">
                Algoritmo Humano Meta
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              O robô pode operar 24 horas por dia sem bloqueios aplicando a <strong>Regra de Comportamento Humano</strong>: pausas randômicas, limite diário de parada e descanso noturno para que o Instagram nunca identifique automação.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Rule 1: Modo Descanso Noturno */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-400" />
                  1. Modo Descanso Noturno (Simulação de Sono)
                </span>
                <button
                  type="button"
                  onClick={() => setIsNightRestActive(!isNightRestActive)}
                  className={`w-11 h-6 rounded-full transition-colors cursor-pointer p-0.5 flex items-center ${
                    isNightRestActive ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <span className="w-5 h-5 bg-white rounded-full shadow" />
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Contas que postam de madrugada ininterruptamente são as primeiras a tomar bloqueio da Meta. O robô pausa sozinho no horário configurado e retoma na manhã seguinte.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Início da Pausa:</label>
                  <input
                    type="time"
                    value={nightRestStart}
                    onChange={(e) => setNightRestStart(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Fim da Pausa (Retomada):</label>
                  <input
                    type="time"
                    value={nightRestEnd}
                    onChange={(e) => setNightRestEnd(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Rule 2: Limite Diário de Parada Estrita */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  2. Limite Diário de Parada Anti-Bloqueio
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {dailyStoriesDispatched} / {dailyQuotaLimit} hoje
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Ao atingir a cota estipulada de ações por dia, o robô para imediatamente e aguarda o próximo ciclo para proteger a integridade da sua conta.
              </p>

              <div className="pt-2">
                <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                  <span>Limite Seguro: {dailyQuotaLimit} postagens/dia</span>
                  <span className="text-emerald-400 font-bold">Recomendado Meta: 30 a 50</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={80}
                  step={5}
                  value={dailyQuotaLimit}
                  onChange={(e) => setDailyQuotaLimit(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Rule 3: Resfriamento Automático de 1 Hora */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  3. Escudo de Resfriamento (Cooldown 1h)
                </span>
                <span className="text-xs font-bold text-blue-300 bg-blue-950/70 border border-blue-800/60 px-2 py-0.5 rounded">
                  Ciclo: {actionsInCurrentCycle} de {cycleCooldownThreshold}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                A cada <strong>{cycleCooldownThreshold} publicações consecutivas</strong>, o robô entra em pausa obrigatória de 1 hora disparando o aviso oficial de segurança, simulando o descanso natural do usuário.
              </p>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setDefenseTriggerReason('Teste do Escudo de Defesa de 1h');
                    setIsDefenseModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Ver Modal de Defesa (59:50)</span>
                </button>
                <span className="text-[11px] text-slate-400">Contagem regressiva de segurança</span>
              </div>
            </div>

            {/* Rule 4: Intervalos Randômicos Humanizados */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                4. Intervalo com Variação Randômica (Jitter)
              </span>

              <p className="text-xs text-slate-400 leading-relaxed">
                Robôs amadores postam em intervalos exatos (ex: exatamente a cada 300 segundos). O AutoViral varia entre 200s e 360s com atrasos de clique e tempo de digitação real.
              </p>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Mínimo</span>
                  <span className="font-bold text-white text-sm">200s (3.3m)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40">
                  <span className="text-emerald-400 text-[10px] block">Médio</span>
                  <span className="font-bold text-emerald-300 text-sm">280s (4.6m)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Máximo</span>
                  <span className="font-bold text-white text-sm">360s (6.0m)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Adicionar Novo Story */}
      {isAddStoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Instagram className="w-5 h-5 text-rose-500" />
                Agendar Novo Story com Figurinha de Link
              </h3>
              <button
                onClick={() => setIsAddStoryModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Título do Story:</label>
                <input
                  type="text"
                  value={newStoryTitle}
                  onChange={(e) => setNewStoryTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Campanha / Produto:</label>
                <select
                  value={newStoryCampaignId}
                  onChange={(e) => {
                    setNewStoryCampaignId(e.target.value);
                    const c = campaigns.find(camp => camp.id === e.target.value);
                    if (c && c.checkoutUrl) setNewStoryStickerUrl(c.checkoutUrl);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                >
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title} (R$ {(c.price || 9.90).toFixed(2).replace('.', ',')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Texto da Figurinha de Link (Sticker):</label>
                <input
                  type="text"
                  value={newStoryStickerText}
                  onChange={(e) => setNewStoryStickerText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-rose-500"
                  placeholder="Ex: 👉 TOQUE AQUI P/ COMPRAR"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Link de Destino da Figurinha:</label>
                <input
                  type="text"
                  value={newStoryStickerUrl}
                  onChange={(e) => setNewStoryStickerUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-blue-300 font-mono focus:outline-none focus:border-blue-500"
                  placeholder="https://pay.kiwify.com.br/..."
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Legenda / Texto de Apoio:</label>
                <textarea
                  rows={2}
                  value={newStoryCaption}
                  onChange={(e) => setNewStoryCaption(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddStoryModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddNewStory}
                className="px-4 py-2 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md"
              >
                Agendar Story na Fila
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Internal Security Defense Modal (Faithful to image_031f9bdf.png) */}
      <SecurityDefenseModal
        isOpen={isDefenseModalOpen}
        onClose={() => setIsDefenseModalOpen(false)}
        onResumeAnyway={() => {
          setIsDefenseModalOpen(false);
          setIsInstagramBotRunning(true);
        }}
        platformName="Instagram"
      />
    </div>
  );
};
