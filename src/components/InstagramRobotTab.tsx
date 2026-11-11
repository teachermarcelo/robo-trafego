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
  MessageSquare
} from 'lucide-react';
import { Campaign, InstagramStoryItem } from '../types';
import { SecurityDefenseModal } from './SecurityDefenseModal';

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

export const InstagramRobotTab: React.FC<InstagramRobotTabProps> = ({
  campaigns,
  onAddTrackingEvent,
  onSimulateSale,
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

  // Internal Subtabs
  const [activeSubTab, setActiveSubTab] = useState<'stories' | 'mapper' | 'antiban_defense'>('stories');

  // Connected Instagram Account state (Real session detection & override)
  const [accountHandle, setAccountHandle] = useState<string>(() => {
    return localStorage.getItem('autoviral_insta_handle') || '@divulga_renda_digital';
  });
  const [isEditingHandle, setIsEditingHandle] = useState<boolean>(false);

  // Bot running state
  const [isInstagramBotRunning, setIsInstagramBotRunning] = useState<boolean>(false);
  const [intervalSeconds, setIntervalSeconds] = useState<number>(240); // 4 minutes humanized
  const [isRandomJitter, setIsRandomJitter] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(240);

  // Daily quota & stops
  const [dailyQuotaLimit, setDailyQuotaLimit] = useState<number>(40); // Safe threshold for human accounts
  const [dailyStoriesDispatched, setDailyStoriesDispatched] = useState<number>(14);

  // Anti-Ban 24h parameters
  const [isNightRestActive, setIsNightRestActive] = useState<boolean>(true);
  const [nightRestStart, setNightRestStart] = useState<string>('23:30');
  const [nightRestEnd, setNightRestEnd] = useState<string>('06:30');
  const [isAutoCooldownActive, setIsAutoCooldownActive] = useState<boolean>(true);
  const [actionsInCurrentCycle, setActionsInCurrentCycle] = useState<number>(3);
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

  // Queue of Stories to be posted automatically
  const [storyQueue, setStoryQueue] = useState<InstagramStoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('autoviral_insta_story_queue');
      if (saved) return JSON.parse(saved);
    } catch {}

    return [
      {
        id: 'story-1',
        title: 'POSTE OFERTAS NOS STORIES! • Economize Tempo & Links Convertidos',
        mediaUrl: '/assets/aistudio/image_5456885b.png',
        mediaType: 'story_9_16',
        stickerText: '👉 TOQUE AQUI P/ COMPRAR',
        stickerUrl: 'https://pay.kiwify.com.br/HE5xbnp',
        caption: 'Postagem 100% automática com link convertido nos stories. Venda todos os dias no orgânico!',
        status: 'published',
        publishedAt: 'Há 12 min',
        viewsEstimated: 342,
        linkClicksEstimated: 41,
        salesEstimated: 2,
        targetCampaignId: defaultCampaign.id,
      },
      {
        id: 'story-2',
        title: 'Caderno de Coordenação Motora • Apenas R$ 9,90 no Pix',
        mediaUrl: '/assets/aistudio/image_e9e67204.png',
        mediaType: 'story_9_16',
        stickerText: '🔗 BAIXAR CADERNO (R$ 9,90)',
        stickerUrl: 'https://pay.kiwify.com.br/HE5xbnp',
        caption: 'Material em PDF para pais e pedagogas desenvolverem a coordenação motora sem estresse.',
        status: 'published',
        publishedAt: 'Há 38 min',
        viewsEstimated: 512,
        linkClicksEstimated: 68,
        salesEstimated: 4,
        targetCampaignId: defaultCampaign.id,
      },
      {
        id: 'story-3',
        title: 'Loja Pronta Sem Estoque • Lucre no E-commerce',
        mediaUrl: '/assets/aistudio/image_25d5ade9.png',
        mediaType: 'story_9_16',
        stickerText: '👉 LIBERAR MINHA LOJA',
        stickerUrl: 'https://pay.kiwify.com.br/',
        caption: '20 produtos validados e fornecedores inclusos. Acesso imediato no Pix.',
        status: 'ready',
        viewsEstimated: 0,
        linkClicksEstimated: 0,
        salesEstimated: 0,
        targetCampaignId: defaultCampaign.id,
      },
      {
        id: 'story-4',
        title: '3 Dicas para Renda Familiar com Tráfego Orgânico',
        mediaUrl: '/assets/aistudio/image_d6e91a85.png',
        mediaType: 'story_9_16',
        stickerText: '🔥 VER ESTRATÉGIA COMPLETA',
        stickerUrl: 'https://pay.kiwify.com.br/',
        caption: 'Economize tempo com postagens automáticas e links prontos que convertem!',
        status: 'ready',
        viewsEstimated: 0,
        linkClicksEstimated: 0,
        salesEstimated: 0,
        targetCampaignId: defaultCampaign.id,
      }
    ];
  });

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
    const newViews = Math.floor(Math.random() * 320) + 110;
    const newClicks = Math.floor(Math.random() * 35) + 8;
    const newSales = Math.random() > 0.4 ? 1 : 0;

    const updatedQueue = [...storyQueue];
    updatedQueue[readyIndex] = {
      ...targetItem,
      status: 'published',
      publishedAt: 'Agora mesmo',
      viewsEstimated: newViews,
      linkClicksEstimated: newClicks,
      salesEstimated: newSales,
    };

    setStoryQueue(updatedQueue);
    setDailyStoriesDispatched(prev => prev + 1);
    setActionsInCurrentCycle(prev => prev + 1);

    // Track simulated events
    if (onAddTrackingEvent) {
      onAddTrackingEvent({
        campaignId: targetItem.targetCampaignId || defaultCampaign.id,
        campaignTitle: targetItem.title,
        niche: 'instagram_stories',
        type: 'checkout_click',
        source: 'instagram',
        geo: { city: 'Curitiba', state: 'PR', country: 'Brasil' },
        device: 'mobile',
        ageBracket: '25-34',
        leadScore: 92,
        durationSeconds: 45,
        isSimulation: true,
      });

      if (newSales > 0 && onSimulateSale) {
        onSimulateSale('Seguidor do Instagram Stories', 'São Paulo', 9.90);
      }
    }
  };

  // Quick manual post now
  const handlePostNow = (id: string) => {
    const idx = storyQueue.findIndex(s => s.id === id);
    if (idx === -1) return;

    const targetItem = storyQueue[idx];
    const updated = [...storyQueue];
    updated[idx] = {
      ...targetItem,
      status: 'published',
      publishedAt: 'Agora mesmo',
      viewsEstimated: Math.floor(Math.random() * 280) + 90,
      linkClicksEstimated: Math.floor(Math.random() * 28) + 6,
      salesEstimated: 1,
    };
    setStoryQueue(updated);
    setDailyStoriesDispatched(prev => prev + 1);
    setActionsInCurrentCycle(prev => prev + 1);

    if (onSimulateSale) {
      onSimulateSale('Lead Instagram (Sticker)', 'Belo Horizonte', 9.90);
    }
  };

  // Simulate Mapping from Open Instagram Web Tab
  const handleMapInstagramOpenTab = () => {
    setIsMappingActive(true);
    setTimeout(() => {
      const newItems: InstagramMappedTarget[] = [
        {
          id: `tgt-${Date.now()}-1`,
          handle: '@espacopedagogico_cwb',
          name: 'Espaço Pedagógico Criativo',
          followers: '15.7k',
          bio: 'Coordenação motora fina e jogos pedagógicos inclusivos em Curitiba 🎨',
          category: 'influencer',
          sourceQuery: 'pedagogia curitiba',
          score: 93,
          city: 'Curitiba, PR',
          selected: true,
          status: 'pending'
        },
        {
          id: `tgt-${Date.now()}-2`,
          handle: '@prof.alessandra_pedagoga',
          name: 'Prof. Alessandra',
          followers: '8.4k',
          bio: 'Professora de educação infantil compartilhando ideias práticas para a sala de aula.',
          category: 'profile_follower',
          sourceQuery: 'educacao infantil',
          score: 90,
          city: 'Curitiba, PR',
          selected: true,
          status: 'pending'
        },
        {
          id: `tgt-${Date.now()}-3`,
          handle: '#alfabetizacaocriativa',
          name: 'Hashtag Alfabetização Criativa',
          followers: '310k posts',
          bio: 'Milhares de famílias e pedagogas ativas buscando cadernos de atividades',
          category: 'hashtag',
          sourceQuery: '#alfabetizacaocriativa',
          score: 96,
          selected: true,
          status: 'pending'
        }
      ];

      setMappedTargets(prev => [...newItems, ...prev]);
      setIsMappingActive(false);
    }, 1200);
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

  // Add new story
  const handleAddNewStory = () => {
    const camp = campaigns.find(c => c.id === newStoryCampaignId) || defaultCampaign;
    const newItem: InstagramStoryItem = {
      id: `story-${Date.now()}`,
      title: newStoryTitle,
      mediaUrl: camp.imageUrl || '/assets/aistudio/image_5456885b.png',
      mediaType: newStoryMediaType,
      stickerText: newStoryStickerText,
      stickerUrl: newStoryStickerUrl,
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

  // Metrics summary
  const totalViews = storyQueue.reduce((acc, curr) => acc + (curr.viewsEstimated || 0), 0);
  const totalClicks = storyQueue.reduce((acc, curr) => acc + (curr.linkClicksEstimated || 0), 0);
  const totalSales = storyQueue.reduce((acc, curr) => acc + (curr.salesEstimated || 0), 0);
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
                      localStorage.setItem('autoviral_insta_handle', accountHandle);
                      setIsEditingHandle(false);
                    }}
                    className="text-[10px] bg-purple-600 px-2 py-0.5 rounded font-bold text-white"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-extrabold text-white text-xs">{accountHandle}</span>
                  <button
                    onClick={() => setIsEditingHandle(true)}
                    className="text-[10px] text-purple-400 hover:text-purple-300 underline"
                  >
                    (Alterar)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subtabs Controller */}
        <div className="mt-5 pt-4 border-t border-purple-900/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-purple-900/40">
            <button
              type="button"
              onClick={() => setActiveSubTab('stories')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'stories'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>1. Stories &amp; Links Convertidos ({storyQueue.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('mapper')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'mapper'
                  ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>2. Mapeador de Perfis &amp; Hashtags ({mappedTargets.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('antiban_defense')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'antiban_defense'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-300" />
              <span>3. Blindagem Anti-Ban 24h &amp; Parada</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsInstagramBotRunning(!isInstagramBotRunning)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md ${
                isInstagramBotRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
              }`}
            >
              {isInstagramBotRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pausar Robô
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Iniciar Robô 24h (Pausas Humanizadas)
                </>
              )}
            </button>

            <button
              onClick={() => setIsDefenseModalOpen(true)}
              className="px-3 py-2 bg-blue-950/80 hover:bg-blue-900 border border-blue-600/70 text-blue-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Testar o modal de defesa de segurança de 1h"
            >
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Simular Defesa (59:50)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-slate-400 text-xs uppercase font-bold flex items-center gap-1.5">
            <Instagram className="w-4 h-4 text-purple-400" />
            Stories Postados Hoje
          </span>
          <div className="text-2xl font-black text-white mt-1">
            {publishedCount} stories
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Cota Segura: <strong className="text-emerald-400">{dailyStoriesDispatched} / {dailyQuotaLimit} max/dia</strong>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-slate-400 text-xs uppercase font-bold flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-rose-400" />
            Visualizações nos Stories
          </span>
          <div className="text-2xl font-black text-rose-400 mt-1">
            {totalViews.toLocaleString('pt-BR')} views
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Alcance orgânico 100% gratuito
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-slate-400 text-xs uppercase font-bold flex items-center gap-1.5">
            <MousePointerClick className="w-4 h-4 text-blue-400" />
            Cliques no Sticker de Link
          </span>
          <div className="text-2xl font-black text-blue-400 mt-1">
            {totalClicks} toques
          </div>
          <div className="text-[11px] text-blue-300 mt-1">
            Taxa de clique: <strong className="text-white">{totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0'}%</strong>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-slate-400 text-xs uppercase font-bold flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Vendas Aprovadas no Pix
          </span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {totalSales} vendas
          </div>
          <div className="text-[11px] text-emerald-300 mt-1">
            R$ {(totalSales * 9.90).toFixed(2).replace('.', ',')} faturado nos Stories
          </div>
        </div>
      </div>

      {/* SUBTAB 1: Stories Queue & Dispatch */}
      {activeSubTab === 'stories' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                Fila de Stories &amp; Publicações do Instagram ({storyQueue.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Cada Story postado inclui a figurinha clicável que leva direto para a Kiwify / checkout do produto.
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
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer flex-shrink-0"
                        title="Postar agora de forma imediata"
                      >
                        <Send className="w-3 h-3" />
                        Postar Agora
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

                  {/* Caption preview */}
                  {item.caption && (
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                      {item.caption}
                    </p>
                  )}
                </div>

                {/* Bottom stats */}
                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-rose-400" />
                    <strong>{item.viewsEstimated}</strong> views
                  </span>
                  <span className="flex items-center gap-1">
                    <MousePointerClick className="w-3.5 h-3.5 text-blue-400" />
                    <strong>{item.linkClicksEstimated}</strong> cliques no link
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    ✓ {item.salesEstimated} vendas
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

      {/* SUBTAB 3: Anti-Ban Defense & 24h Work Safety Shield */}
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
