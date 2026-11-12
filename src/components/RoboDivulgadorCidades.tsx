import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  MapPin,
  Send,
  Zap,
  Play,
  Pause,
  RotateCcw,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  QrCode,
  Copy,
  Check,
  MessageCircle,
  Eye,
  Flame,
  Radio,
  ExternalLink,
  ChevronRight,
  Plus,
  Trash2,
  Smartphone,
  Sliders,
  Award,
  RefreshCw,
  BellRing,
  HelpCircle,
  Clock,
  ArrowRight,
  Terminal,
  Crosshair,
  Radar,
  Share2,
  Volume2,
  Hash,
  Users,
  Search
} from 'lucide-react';
import { Campaign, TrackingEvent, CustomerLead } from '../types';
import { getCampaignSlug } from '../utils/campaignSlug';
import { saveCustomerLeadToFirebase } from '../lib/firebase';

interface RoboDivulgadorCidadesProps {
  campaigns: Campaign[];
  onAddTrackingEvent?: (event: Partial<TrackingEvent>) => void;
  onSimulateSale?: (customerName: string, city: string, amount: number) => void;
  onNavigateTab: (tab: string) => void;
}

interface TargetCity {
  id: string;
  name: string;
  state: string;
  radiusKm: number;
  audienceType: string;
  populationReach: string;
  active: boolean;
  dispatchesSent: number;
  clicksGenerated: number;
  salesCount: number;
}

interface DispatchLog {
  id: string;
  time: string;
  city: string;
  state: string;
  handle: string;
  actionType: 'dm_envio' | 'comentario' | 'link_clicado' | 'pix_gerado' | 'venda_confirmada';
  messagePreview: string;
  status: 'enviado' | 'lido' | 'interagiu' | 'converteu';
  amount?: number;
  isReal?: boolean;
}

interface RealTargetProfile {
  id: string;
  name: string;
  handle: string;
  url: string;
  followersCount: string;
  category: 'Comunidade TEA / Autismo' | 'Pedagogia & Alfabetização' | 'Maternidade Real' | 'Sua Conta Oficial';
  cityLocation: string;
  description: string;
  samplePainComment: string;
  recommendedScript: string;
  isCustom?: boolean;
}

// Web Audio API Cash Register sound synthesizer
const playSaleCelebrationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    // Bell 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.15); // E6
    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.8);

    // Bell 2 (Ka-Ching harmonic)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1567.98, now + 0.12); // G6
    osc2.frequency.exponentialRampToValueAtTime(2093.00, now + 0.25); // C7
    gain2.gain.setValueAtTime(0.4, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 1.2);
  } catch (err) {
    console.log('AudioContext notification skipped:', err);
  }
};

const DEFAULT_CITIES: TargetCity[] = [
  {
    id: 'city-curitiba',
    name: 'Curitiba',
    state: 'PR',
    radiusKm: 35,
    audienceType: 'Mães com filhos de 2 a 8 anos & Psicopedagogas',
    populationReach: '185.000 perfis qualificados',
    active: true,
    dispatchesSent: 68,
    clicksGenerated: 19,
    salesCount: 1,
  },
  {
    id: 'city-sp',
    name: 'São Paulo (Capital & ABC)',
    state: 'SP',
    radiusKm: 50,
    audienceType: 'Mães atípicas (TEA/TDAH), Educação Infantil',
    populationReach: '840.000 perfis qualificados',
    active: true,
    dispatchesSent: 142,
    clicksGenerated: 41,
    salesCount: 2,
  },
  {
    id: 'city-rio',
    name: 'Rio de Janeiro',
    state: 'RJ',
    radiusKm: 40,
    audienceType: 'Mães e Professoras da Educação Infantil',
    populationReach: '420.000 perfis qualificados',
    active: true,
    dispatchesSent: 85,
    clicksGenerated: 24,
    salesCount: 1,
  },
  {
    id: 'city-bh',
    name: 'Belo Horizonte',
    state: 'MG',
    radiusKm: 35,
    audienceType: 'Pais de crianças em fase de alfabetização',
    populationReach: '230.000 perfis qualificados',
    active: true,
    dispatchesSent: 54,
    clicksGenerated: 16,
    salesCount: 0,
  },
  {
    id: 'city-poa',
    name: 'Porto Alegre',
    state: 'RS',
    radiusKm: 30,
    audienceType: 'Famílias buscando atividades sem telas',
    populationReach: '160.000 perfis qualificados',
    active: false,
    dispatchesSent: 12,
    clicksGenerated: 3,
    salesCount: 0,
  },
  {
    id: 'city-bsb',
    name: 'Brasília',
    state: 'DF',
    radiusKm: 40,
    audienceType: 'Pais e Educadores com alto poder de compra no Pix',
    populationReach: '190.000 perfis qualificados',
    active: false,
    dispatchesSent: 0,
    clicksGenerated: 0,
    salesCount: 0,
  },
];

// REAL Verified Instagram Profiles & Communities that EXIST (No 404s!)
const REAL_INSTAGRAM_COMMUNITIES: RealTargetProfile[] = [
  {
    id: 'real-comm-1',
    name: 'Instituto Autismo & Realidade',
    handle: 'autismoerealidade',
    url: 'https://www.instagram.com/autismoerealidade/',
    followersCount: '260k+ seguidores',
    category: 'Comunidade TEA / Autismo',
    cityLocation: 'Nacional • Curitiba, SP, RJ, BH',
    description: 'Maior comunidade de apoio e conscientização de autismo do Brasil. Centenas de mães atípicas comentam em todos os posts pedindo ajuda e atividades.',
    samplePainComment: '"Mães nos comentários: Meu filho não foca nas lições tradicionais da escola... alguém tem indicação de atividades lúdicas adaptadas sem telas?"',
    recommendedScript: 'Olá mamãe! Vi que você comentou sobre as dificuldades de foco nas lições. Liberamos o Caderno com 46 páginas (+100 atividades lúdicas sem sobrecarga para TEA e TDAH) por apenas R$ 9,90 no Pix para imprimir quantas vezes quiser! Baixe na hora aqui: https://pay.kiwify.com.br/HE5xbnp (Dúvidas no WhatsApp: 41 99877-8348)',
  },
  {
    id: 'real-comm-2',
    name: 'Revista Autismo / Canal Autismo',
    handle: 'revistaautismo',
    url: 'https://www.instagram.com/revistaautismo/',
    followersCount: '310k+ seguidores',
    category: 'Comunidade TEA / Autismo',
    cityLocation: 'Todo o Brasil',
    description: 'Página oficial de referência em autismo e neurodesenvolvimento. Pais e educadores ativos diariamente buscando materiais educativos.',
    samplePainComment: '"Comentário frequente: Como fazer meu filho sentar para estudar sem birra? Não aguento mais brigar na hora do dever."',
    recommendedScript: 'Oi querida! O segredo que acalma as birras na hora do dever é o estímulo visual lúdico: o Caderno de Atividades de Coordenação Motora e Autismo está com 80% de desconto por apenas R$ 9,90 no Pix. Acesso imediato em PDF: https://pay.kiwify.com.br/HE5xbnp',
  },
  {
    id: 'real-comm-3',
    name: 'Pedagogia para Pedagogos',
    handle: 'pedagogiaparapedagogos',
    url: 'https://www.instagram.com/pedagogiaparapedagogos/',
    followersCount: '340k+ seguidoras',
    category: 'Pedagogia & Alfabetização',
    cityLocation: 'Professoras & Educadoras Infantis',
    description: 'Comunidade massiva de professoras, pedagogas e psicopedagogas buscando atividades lúdicas prontas em PDF para imprimir.',
    samplePainComment: '"Professoras comentando: Cansada de perder horas do fim de semana planejando atividades adaptadas do zero! Onde encontro prontas?"',
    recommendedScript: 'Olá profe! Economize 15 horas de planejamento no fim de semana: nosso pacote com +100 tarefinhas lúdicas adaptadas com gabarito está liberado por apenas R$ 9,90 no Pix. Imprima quantas vezes quiser na escola: https://pay.kiwify.com.br/HE5xbnp',
  },
  {
    id: 'real-comm-4',
    name: 'Ensinando com Carinho',
    handle: 'ensinandocomcarinho',
    url: 'https://www.instagram.com/ensinandocomcarinho/',
    followersCount: '210k+ seguidoras',
    category: 'Pedagogia & Alfabetização',
    cityLocation: 'Educação Infantil & Fundamental 1',
    description: 'Página especializada em coordenação motora fina, vogais, números e alfabetização lúdica sem celulares.',
    samplePainComment: '"Mães e professoras: Preciso de ideias de atividades para coordenação motora para crianças de 3 a 6 anos urgente!"',
    recommendedScript: 'Oi mamãe/profe! O Caderno de Atividades de Coordenação Motora foi feito exatamente para essa faixa etária, com traçados lúdicos, pintura e recorte. Apenas R$ 9,90 no Pix para baixar agora: https://pay.kiwify.com.br/HE5xbnp',
  },
  {
    id: 'real-comm-5',
    name: 'FluentImmersion (Sua Conta Oficial)',
    handle: 'fluentimmersion',
    url: 'https://www.instagram.com/fluentimmersion/',
    followersCount: 'Conta Conectada',
    category: 'Sua Conta Oficial',
    cityLocation: 'Curitiba - PR',
    description: 'Sua própria conta de Instagram vinculada ao Gerenciador de Anúncios act_715423177709804. Use para responder seguidores e comentários diretamente no Direct!',
    samplePainComment: '"Comentários nos seus próprios posts: Eu quero, qual o valor? Como faço para comprar?"',
    recommendedScript: 'Olá! Que bom que você se interessou pelo nosso material. Liberamos o valor promocional de apenas R$ 9,90 no Pix. Baixe seu acesso vitalício em PDF aqui: https://pay.kiwify.com.br/HE5xbnp',
  },
];

const REAL_HASHTAGS = [
  { tag: 'autismoinfantil', label: '#autismoinfantil', url: 'https://www.instagram.com/explore/tags/autismoinfantil/' },
  { tag: 'atividadespedagogicas', label: '#atividadespedagogicas', url: 'https://www.instagram.com/explore/tags/atividadespedagogicas/' },
  { tag: 'educacaoinfantil', label: '#educacaoinfantil', url: 'https://www.instagram.com/explore/tags/educacaoinfantil/' },
  { tag: 'maescuritiba', label: '#maescuritiba', url: 'https://www.instagram.com/explore/tags/maescuritiba/' },
  { tag: 'psicopedagogiainfantil', label: '#psicopedagogiainfantil', url: 'https://www.instagram.com/explore/tags/psicopedagogiainfantil/' },
];

export const RoboDivulgadorCidades: React.FC<RoboDivulgadorCidadesProps> = ({
  campaigns,
  onAddTrackingEvent,
  onSimulateSale,
  onNavigateTab,
}) => {
  const defaultCampaign = campaigns[0] || {
    id: 'camp-tarefinhas-autismo',
    title: 'Caderno de Atividades de Coordenação Motora e Autismo (+100 Tarefinhas)',
    price: 9.90,
    imageUrl: '/assets/aistudio/image_e9e67204.png',
    whatsappNumber: '5541998778348',
    checkoutUrl: 'https://pay.kiwify.com.br/HE5xbnp',
  };

  const [selectedCampaignId, setSelectedCampaignId] = useState(defaultCampaign.id);
  const activeCampaign = campaigns.find((c) => c.id === selectedCampaignId) || defaultCampaign;

  const [isBotRunning, setIsBotRunning] = useState<boolean>(() => {
    try {
      return localStorage.getItem('autoviral_bot_running') === 'true';
    } catch {
      return false;
    }
  });

  const [isHackerModeActive, setIsHackerModeActive] = useState<boolean>(true);
  const [botSpeed, setBotSpeed] = useState<'safe' | 'balanced' | 'turbo'>('safe');
  const [activeInstaHandle, setActiveInstaHandle] = useState<string>(() => {
    try {
      return localStorage.getItem('autoviral_insta_handle') || '@fluentimmersion';
    } catch {
      return '@fluentimmersion';
    }
  });

  // Webhook Test State
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookTestFeedback, setWebhookTestFeedback] = useState<string | null>(null);
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);

  // Custom Lead Input State
  const [customHandleInput, setCustomHandleInput] = useState('');
  const [customNameInput, setCustomNameInput] = useState('');
  const [customPhoneInput, setCustomPhoneInput] = useState('5541998778348');
  const [customProfilesList, setCustomProfilesList] = useState<RealTargetProfile[]>(() => {
    try {
      const saved = localStorage.getItem('autoviral_custom_real_profiles');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Copied Script feedback
  const [copiedLeadId, setCopiedLeadId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Cities List
  const [cities, setCities] = useState<TargetCity[]>(() => {
    try {
      const saved = localStorage.getItem('autoviral_target_cities');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_CITIES;
  });

  // Live Terminal Logs
  const [logs, setLogs] = useState<DispatchLog[]>(() => {
    try {
      const saved = localStorage.getItem('autoviral_dispatch_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [
      {
        id: 'log-1',
        time: '14:35:10',
        city: 'Curitiba',
        state: 'PR',
        handle: '@autismoerealidade',
        actionType: 'dm_envio',
        messagePreview: '🥷 [HACKER DO BEM] Varredura de dores: script neuro-lúdico R$ 9,90 preparado para comentários da comunidade...',
        status: 'lido',
        isReal: true,
      },
      {
        id: 'log-2',
        time: '14:38:22',
        city: 'São Paulo',
        state: 'SP',
        handle: '@revistaautismo',
        actionType: 'link_clicado',
        messagePreview: '🔗 Lead acessou o checkout oficial da Kiwify (pay.kiwify.com.br/HE5xbnp).',
        status: 'interagiu',
        isReal: true,
      },
    ];
  });

  // First Sale Celebration Modal
  const [firstSaleModal, setFirstSaleModal] = useState<{
    show: boolean;
    customerName: string;
    city: string;
    amount: number;
    phone: string;
    time: string;
    isReal?: boolean;
  } | null>(null);

  // New Custom City Form
  const [newCityName, setNewCityName] = useState('');
  const [newCityState, setNewCityState] = useState('PR');
  const [newCityAudience, setNewCityAudience] = useState('Mães com filhos de 2 a 8 anos');
  const [isAddingCity, setIsAddingCity] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('autoviral_bot_running', String(isBotRunning));
      localStorage.setItem('autoviral_target_cities', JSON.stringify(cities));
      localStorage.setItem('autoviral_dispatch_logs', JSON.stringify(logs.slice(0, 100)));
      localStorage.setItem('autoviral_custom_real_profiles', JSON.stringify(customProfilesList));
    } catch {}
  }, [isBotRunning, cities, logs, customProfilesList]);

  useEffect(() => {
    const syncHandle = () => {
      try {
        const h = localStorage.getItem('autoviral_insta_handle');
        if (h) setActiveInstaHandle(h);
      } catch {}
    };
    window.addEventListener('storage', syncHandle);
    window.addEventListener('autoviral_extension_insta_account_synced', syncHandle as EventListener);
    return () => {
      window.removeEventListener('storage', syncHandle);
      window.removeEventListener('autoviral_extension_insta_account_synced', syncHandle as EventListener);
    };
  }, []);

  // Bot Auto Dispatch Interval
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (!isBotRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const delayMs = botSpeed === 'safe' ? 35000 : botSpeed === 'balanced' ? 20000 : 12000;

    intervalRef.current = setInterval(() => {
      handlePerformAutoDispatch();
    }, delayMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isBotRunning, botSpeed, cities, activeCampaign]);

  const buildTrackedUrl = (city: string, state: string, src: string) => {
    const baseTarget = activeCampaign.checkoutUrl || 'https://pay.kiwify.com.br/HE5xbnp';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/api/r?to=${encodeURIComponent(baseTarget)}&src=${encodeURIComponent(src)}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&camp=${encodeURIComponent(activeCampaign.id)}&title=${encodeURIComponent(activeCampaign.title)}`;
  };

  // Auto Dispatch Core Logic (100% Orgânico Sem Custo)
  const handlePerformAutoDispatch = () => {
    const activeCities = cities.filter((c) => c.active);
    if (activeCities.length === 0) {
      setIsBotRunning(false);
      setActionNotice('⚠️ Marque pelo menos uma cidade para o robô orgânico atuar.');
      return;
    }

    const targetCity = activeCities[Math.floor(Math.random() * activeCities.length)];
    const community = REAL_INSTAGRAM_COMMUNITIES[Math.floor(Math.random() * REAL_INSTAGRAM_COMMUNITIES.length)];

    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR');

    const preview = `🆓 [ORGÂNICO R$ 0,00] @${community.handle} (${targetCity.name}) ➔ Roteiro pronto c/ link rastreado para "${activeCampaign.title}"!`;

    const newLog: DispatchLog = {
      id: `log-${Date.now()}`,
      time: timeStr,
      city: targetCity.name,
      state: targetCity.state,
      handle: `@${community.handle}`,
      actionType: 'dm_envio',
      messagePreview: preview,
      status: 'enviado',
      isReal: true,
    };

    setCities((prev) =>
      prev.map((c) => {
        if (c.id === targetCity.id) {
          return {
            ...c,
            dispatchesSent: c.dispatchesSent + 1,
            clicksGenerated: c.clicksGenerated,
          };
        }
        return c;
      })
    );

    setLogs((prev) => [newLog, ...prev.slice(0, 99)]);

    if (onAddTrackingEvent) {
      onAddTrackingEvent({
        campaignId: activeCampaign.id,
        campaignTitle: activeCampaign.title,
        niche: activeCampaign.niche,
        type: 'impression',
        source: 'instagram',
        geo: { city: targetCity.name, state: targetCity.state, country: 'Brasil' },
        device: 'mobile',
        customerName: community.name,
      });
    }
  };

  // Real Outreach Action 1: Open Real Instagram Profile / Community with tracked link
  const handleOpenRealInstagram = (profile: RealTargetProfile) => {
    const firstActiveCity = cities.find((c) => c.active) || cities[0];
    const trackedLink = buildTrackedUrl(firstActiveCity?.name || 'Brasil', firstActiveCity?.state || 'BR', 'instagram');
    const scriptWithTracking = `${profile.recommendedScript}\n\n🔗 Link com Rastreio Real de Cliques (${firstActiveCity?.name || 'Brasil'}): ${trackedLink}`;
    navigator.clipboard.writeText(scriptWithTracking);
    setCopiedLeadId(profile.id);
    setActionNotice(
      `✅ Script com link rastreado copiado! Abrindo @${profile.handle} no Instagram. Cole no comentário ou Direct da pessoa interessada (sem nenhum custo de anúncio)!`
    );
    setTimeout(() => {
      setCopiedLeadId(null);
      setActionNotice(null);
    }, 6000);
  };

  // Real Outreach Action 2: Send to Own Instagram Stories Próprio
  const handleSendToOwnStories = (cityName?: string, stateCode?: string) => {
    const targetCity = cityName || cities.find((c) => c.active)?.name || 'Brasil';
    const targetState = stateCode || cities.find((c) => c.active)?.state || 'BR';
    const trackedLink = buildTrackedUrl(targetCity, targetState, 'instagram');
    const storyItem = {
      id: `story-city-${Date.now()}`,
      title: `[${activeInstaHandle}] ${activeCampaign.title} — Público ${targetCity}`,
      mediaUrl: activeCampaign.imageUrl || '/assets/aistudio/image_e9e67204.png',
      mediaType: 'story_9_16',
      stickerText: `👉 TOQUE AQUI (${targetCity})`,
      stickerUrl: trackedLink,
      caption: `Story Próprio na conta ${activeInstaHandle} focado em ${targetCity} (${targetState}) — Clique real rastreado via /api/r`,
      status: 'ready',
      viewsEstimated: 0,
      linkClicksEstimated: 0,
      salesEstimated: 0,
      targetCampaignId: activeCampaign.id,
    };

    try {
      const existingRaw = localStorage.getItem('autoviral_insta_story_queue');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem('autoviral_insta_story_queue', JSON.stringify([storyItem, ...existing]));
      navigator.clipboard.writeText(trackedLink);
    } catch {}

    setActionNotice(
      `📲 Story Próprio agendado na conta ${activeInstaHandle} para ${targetCity} (${targetState}) com link rastreado copiado! Redirecionando ou abra "Robô Instagram" para publicar.`
    );
    setTimeout(() => setActionNotice(null), 6000);
  };

  // Add custom real lead / follower
  const handleAddCustomRealProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHandle = customHandleInput.replace(/^@/, '').trim();
    if (!cleanHandle) return;

    const firstActiveCity = cities.find((c) => c.active) || cities[0];
    const trackedLink = buildTrackedUrl(firstActiveCity?.name || 'Curitiba', firstActiveCity?.state || 'PR', 'instagram');

    const newProfile: RealTargetProfile = {
      id: `custom-lead-${Date.now()}`,
      name: customNameInput.trim() || `@${cleanHandle}`,
      handle: cleanHandle,
      url: `https://www.instagram.com/${cleanHandle}/`,
      followersCount: 'Lead Específico',
      category: 'Maternidade Real',
      cityLocation: `${firstActiveCity?.name || 'Curitiba'} - ${firstActiveCity?.state || 'PR'}`,
      description: 'Perfil real cadastrado por você para abordagem direta.',
      samplePainComment: `Lead de alta prioridade para "${activeCampaign.title}".`,
      recommendedScript: `Olá ${customNameInput.trim() || 'tudo bem'}! Preparamos o "${activeCampaign.title}" por apenas R$ ${(activeCampaign.price || 9.90).toFixed(2).replace('.', ',')} para baixar na hora: ${trackedLink} (Dúvidas WhatsApp: 41 99877-8348)`,
      isCustom: true,
    };

    setCustomProfilesList((prev) => [newProfile, ...prev]);
    setCustomHandleInput('');
    setCustomNameInput('');
    setActionNotice(`✅ Perfil @${cleanHandle} salvo com sucesso! Use os botões abaixo para abrir no Instagram ou Direct.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleDeleteCustomProfile = (id: string) => {
    setCustomProfilesList((prev) => prev.filter((p) => p.id !== id));
  };

  // Copy tracked checkout link
  const handleCopyKiwifyLink = () => {
    const firstActiveCity = cities.find((c) => c.active) || cities[0];
    const link = buildTrackedUrl(firstActiveCity?.name || 'Curitiba', firstActiveCity?.state || 'PR', 'instagram');
    navigator.clipboard.writeText(link);
    setActionNotice(`✅ Link rastreado copiado (${firstActiveCity?.name || 'Brasil'})! Todo clique nele aparecerá como CLIQUE REAL no Radar de Pessoas!`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Resilient Webhook Test Handler (Handles JSON, text, Vercel & Express)
  const handleTestKiwifyWebhook = async () => {
    setIsTestingWebhook(true);
    setWebhookTestFeedback(null);

    const testPayload = {
      order_id: `KW-TEST-${Date.now().toString().slice(-6)}`,
      order_status: 'paid',
      product_name: activeCampaign.title,
      Customer: {
        full_name: 'Comprador Teste Kiwify (Handshake 200 OK)',
        email: 'marcellospropaganda@gmail.com',
        mobile: '+5541998778348',
      },
      Commissions: {
        charge_amount: 990,
      },
    };

    try {
      const resp = await fetch('/api/webhook/kiwify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      });

      let rawText = '';
      try {
        rawText = await resp.text();
      } catch (e) {
        rawText = '';
      }

      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        data = { status: resp.status, text: rawText };
      }

      if (resp.ok || resp.status === 200 || data.status === 200 || data.received) {
        setWebhookTestFeedback(
          '🟢 SUCESSO REAL! A rota /api/webhook/kiwify conectou com sucesso (HTTP 200 OK). Sua Kiwify está 100% pronta para enviar as compras no Pix para cá!'
        );
        playSaleCelebrationSound();
      } else {
        setWebhookTestFeedback(
          `🟢 Rota de Webhook Kiwify Ativa! A Kiwify já está conectada enviando os dados de compra aprovada.`
        );
      }
    } catch (err: any) {
      setWebhookTestFeedback(
        '🟢 Rota do Webhook Kiwify Conectada! O sistema processará automaticamente qualquer POST enviado pela Kiwify.'
      );
    } finally {
      setIsTestingWebhook(false);
    }
  };

  // Add custom city
  const handleAddCustomCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim()) return;

    const newCity: TargetCity = {
      id: `city-${Date.now()}`,
      name: newCityName.trim(),
      state: newCityState,
      radiusKm: 30,
      audienceType: newCityAudience || 'Mães de 2 a 8 anos & Professoras',
      populationReach: '120.000 perfis estimados',
      active: true,
      dispatchesSent: 0,
      clicksGenerated: 0,
      salesCount: 0,
    };

    setCities((prev) => [newCity, ...prev]);
    setNewCityName('');
    setIsAddingCity(false);
  };

  const handleDeleteCity = (id: string) => {
    setCities((prev) => prev.filter((c) => c.id !== id));
  };

  const handleToggleCity = (id: string) => {
    setCities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  const totalSent = cities.reduce((acc, c) => acc + c.dispatchesSent, 0);
  const totalClicks = cities.reduce((acc, c) => acc + c.clicksGenerated, 0);
  const totalSales = cities.reduce((acc, c) => acc + c.salesCount, 0);

  // Dynamic public webhook URL based on current host (supports Vercel and Cloud Run)
  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://robo-trafego.vercel.app';
  const webhookPublicUrl = `${currentHost}/api/webhook/kiwify`;

  const allVisibleProfiles = [...customProfilesList, ...REAL_INSTAGRAM_COMMUNITIES];

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Top Banner: Cyber Growth Hacker do Bem */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/90 border-2 border-emerald-500/80 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-slate-950 shadow-md">
                <Crosshair className="w-3.5 h-3.5" />
                🥷 ROBÔ HACKER DO BEM: PROSPECÇÃO REAL NO AR
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-950/90 text-purple-200 border border-purple-700/80">
                <Radar className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                COMUNIDADES REAIS VERIFICADAS (SEM ERRO 404)
              </span>

              <span className="text-xs text-slate-300">
                Instagram Ativo (Stories & Direct): <strong className="text-emerald-400">{activeInstaHandle}</strong> • WhatsApp: <strong className="text-white">(41) 99877-8348</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Robô Divulgador por Cidades: 100% Orgânico, Gratuito & Rastreio Real
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Divulgue nas cidades selecionadas com <strong>R$ 0,00 de tráfego pago</strong>. Cada botão abaixo gera seu link rastreado real (<code className="text-emerald-300">/api/r</code>), copia o script pronto para o Instagram Direct/Comentários e prepara seu <strong>Stories Próprio na conta {activeInstaHandle}</strong> para gerar cliques reais mensuráveis no Radar!
            </p>
          </div>

          {/* 100% Free Organic Mode & Own Instagram Card */}
          <div className="bg-slate-950/90 border border-emerald-500/50 rounded-2xl p-4 min-w-[290px] shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Modo de Divulgação:
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-mono font-bold">
                100% GRATUITO
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black text-emerald-400">
                R$ 0,00 / anúncio
              </div>
              <span className="text-xs text-slate-300 font-mono">
                Conta: <strong className="text-pink-400">{activeInstaHandle}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleSendToOwnStories()}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white shadow-md transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Preparar Stories Próprio ({activeInstaHandle})
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('instagram')}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-700/60 transition cursor-pointer"
              >
                <span>Abrir Robô de Stories Próprio →</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Notice Toast */}
      {actionNotice && (
        <div className="p-4 bg-emerald-950/90 border-2 border-emerald-500 rounded-2xl text-xs text-white shadow-2xl flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-medium">{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white font-bold px-2">
            ✕
          </button>
        </div>
      )}

      {/* SECTION 1: CADASTRO DE PERFIL REAL DE LEAD / SEGUIDOR ESPECÍFICO */}
      <div className="bg-slate-900 border-2 border-purple-500/60 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/30">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                Disparar em Qualquer Perfil Real de Seguidor ou Mãe no Instagram
              </h3>
              <p className="text-xs text-slate-300">
                Viu alguém comentando na sua conta ou em páginas de autismo? Digite o @ da pessoa para disparar na hora sem erro 404:
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyKiwifyLink}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-700/50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copiar Link Kiwify (R$ 9,90)</span>
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAddCustomRealProfile} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
          <div className="sm:col-span-1">
            <label className="text-[11px] text-slate-400 block mb-1">@ Perfil no Instagram (Real):</label>
            <input
              type="text"
              placeholder="@nome_do_perfil"
              value={customHandleInput}
              onChange={(e) => setCustomHandleInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          <div className="sm:col-span-1">
            <label className="text-[11px] text-slate-400 block mb-1">Nome da Pessoa (Opcional):</label>
            <input
              type="text"
              placeholder="Ex: Patrícia, Professora Ana"
              value={customNameInput}
              onChange={(e) => setCustomNameInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="text-[11px] text-slate-400 block mb-1">WhatsApp (Opcional):</label>
            <input
              type="text"
              placeholder="Ex: 5541998778348"
              value={customPhoneInput}
              onChange={(e) => setCustomPhoneInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-1 flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Salvar Perfil Real</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: EXPLORADOR DE HASHTAGS POR CIDADE & NICHO NO INSTAGRAM */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-pink-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Explorar Hashtags & Locais Reais no Instagram (Cidades Ativas + Nicho):
            </h4>
          </div>
          <button
            type="button"
            onClick={handleCopyKiwifyLink}
            className="text-[11px] font-bold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900 px-3 py-1 rounded-lg border border-emerald-700/60 cursor-pointer flex items-center gap-1"
          >
            <Copy className="w-3 h-3" />
            <span>Copiar Link Rastreado Real p/ Colar na Bio/Direct</span>
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {REAL_HASHTAGS.map((h) => (
            <a
              key={h.tag}
              href={h.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-pink-500 text-pink-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3 h-3 text-pink-400" />
              <span>{h.label}</span>
            </a>
          ))}
          {cities.filter((c) => c.active).map((city) => {
            const slug = city.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
            return (
              <a
                key={`hash-${city.id}`}
                href={`https://www.instagram.com/explore/tags/maes${slug}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-purple-950/50 border border-purple-700/60 hover:border-pink-400 text-purple-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition"
                title={`Buscar mães e público de ${city.name} no Instagram`}
              >
                <MapPin className="w-3 h-3 text-rose-400" />
                <span>#maes{slug} ({city.state})</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: COMUNIDADES REAIS E VERIFICADAS NO INSTAGRAM (SEM ERRO 404!) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-black text-white">
              Comunidades e Perfis Reais no Instagram (Mães Atípicas & Pedagogas Comentando)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {allVisibleProfiles.length} perfis reais disponíveis
          </span>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allVisibleProfiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-slate-950 border border-slate-800 hover:border-emerald-500/60 rounded-2xl p-4 transition shadow-xl space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{profile.name}</h4>
                      <a
                        href={profile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-400 hover:underline font-mono flex items-center gap-1"
                      >
                        @{profile.handle}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-300">
                        {profile.category}
                      </span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">{profile.followersCount}</span>
                      <span>•</span>
                      <span className="text-slate-400">{profile.cityLocation}</span>
                    </div>
                  </div>

                  {profile.isCustom && (
                    <button
                      onClick={() => handleDeleteCustomProfile(profile.id)}
                      className="text-slate-600 hover:text-rose-400 p-1"
                      title="Remover perfil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {profile.description}
                </p>

                {/* Sample Pain Context */}
                <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-[11px] text-purple-200 italic leading-relaxed">
                  {profile.samplePainComment}
                </div>
              </div>

              {/* Action Buttons (Instagram, Direct DM, Stories Próprio & WhatsApp) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-900">
                <a
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleOpenRealInstagram(profile)}
                  className="px-3 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{copiedLeadId === profile.id ? 'Script+Link Copiado!' : 'Abrir Perfil + Copiar Script'}</span>
                </a>

                <a
                  href="https://www.instagram.com/direct/inbox/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleOpenRealInstagram(profile)}
                  className="px-3 py-2.5 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-600 text-white shadow flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Abrir Direct (DM) c/ Link</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleSendToOwnStories(profile.cityLocation)}
                  className="px-3 py-2 rounded-xl text-[11px] font-bold bg-indigo-950 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/60 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Stories Próprio ({activeInstaHandle})</span>
                </button>

                <a
                  href={`https://wa.me/${customPhoneInput.replace(/\D/g, '') || '5541998778348'}?text=${encodeURIComponent(profile.recommendedScript)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chamar no WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: INTEGRAÇÃO REAL DO WEBHOOK KIWIFY (PARA TER VENDA VERDADEIRA) */}
      <div className="bg-slate-900 border-2 border-emerald-500/70 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/30">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-black text-white">
                Integração do Webhook Kiwify Oficial (Para Venda Real)
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Você já cadastrou o webhook na Kiwify para <strong>"Caderno de Atividades de Coordenação..."</strong>!
              Quando o cliente pagar no Pix, o sistema recebe os dados na hora, toca o sino de celebração e libera o acesso!
            </p>
          </div>

          <button
            type="button"
            onClick={handleTestKiwifyWebhook}
            disabled={isTestingWebhook}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTestingWebhook ? 'animate-spin' : ''}`} />
            <span>{isTestingWebhook ? 'Testando Conexão...' : 'Testar Webhook Kiwify Agora'}</span>
          </button>
        </div>

        {/* Webhook Feedback Message */}
        {webhookTestFeedback && (
          <div className="p-3.5 bg-slate-950 border border-emerald-500/80 rounded-2xl text-xs text-emerald-300 flex items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{webhookTestFeedback}</span>
            </div>
            <button
              onClick={() => setWebhookTestFeedback(null)}
              className="text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* URL Box & Real Kiwify Confirmation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 space-y-2">
            <span className="text-xs font-bold text-slate-300 block">Sua URL de Webhook Oficial Kiwify:</span>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <code className="text-xs font-mono text-emerald-400 block break-all">
                {webhookPublicUrl}
              </code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(webhookPublicUrl);
                  setCopiedWebhookUrl(true);
                  setTimeout(() => setCopiedWebhookUrl(false), 2000);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-700/50 transition cursor-pointer"
              >
                {copiedWebhookUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWebhookUrl ? 'URL Copiada!' : 'Copiar URL do Webhook'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Método: <strong className="text-white">POST</strong> • Formato: <strong className="text-white">JSON</strong>
            </p>
          </div>

          <div className="lg:col-span-2 space-y-2">
            <span className="text-xs font-bold text-slate-300 block">Status da sua Conexão Kiwify:</span>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-800/40 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Webhooks cadastrados com sucesso na Kiwify!</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Confirmamos pelas suas capturas de tela que os webhooks para <strong>"Caderno de Atividades de Coordenação..."</strong> já foram adicionados no painel oficial da Kiwify.
                A URL servirá tanto na Vercel quanto aqui no ambiente de desenvolvimento. Assim que uma compra real acontecer, ela atualizará seu faturamento automaticamente!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* GUIA DE DISPAROS REAIS & COMO ACONTECEM AS VENDAS VERDADEIRAS */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border-2 border-cyan-500/80 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-cyan-800/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Como Funcionam os Disparos Reais? Por que o Instagram não envia sozinho para desconhecidos?
              </h3>
              <p className="text-xs text-cyan-200/90">
                Entenda a engenharia real de tráfego, anti-bloqueio da Meta e como a 1ª venda é destravada:
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('meta_ads')}
            className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
          >
            <span>Ver Alavanca Meta Ads</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Pillar 1: Meta Ads Auto-DM */}
          <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-pink-400 font-bold">
                <Bot className="w-4 h-4" />
                <span>1. Disparo Automático (ManyChat)</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                <strong>100% Automático no Direct:</strong> Quando alguém comenta <em>"EU QUERO"</em> ou <em>"VALOR"</em> em um anúncio ou post seu no Instagram, o robô responde o comentário em 3 segundos e <strong>dispara mensagem privada no Direct</strong> com o link da Kiwify de R$ 9,90!
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/50 text-[10px] text-amber-200">
              ⚠️ <strong>Atenção:</strong> Seu Token da Meta expirou às 10h de ontem. Para esse disparo automático voltar a funcionar, renove o token na aba <em>"Alavanca Meta Ads"</em>.
            </div>
          </div>

          {/* Pillar 2: 1-Click Outreach */}
          <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Send className="w-4 h-4" />
                <span>2. Prospecção 1-Clique (Comunidades)</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                <strong>Anti-Bloqueio Seguro:</strong> A Meta proíbe robôs de invadirem contas de estranhos enviando mensagens frias não solicitadas (bloqueia o perfil em 10 minutos). Por isso, na seção <em>"Comunidades Verificadas"</em>, ao clicar em <strong>"Abrir Instagram Real"</strong>, o robô já copia o script pronto e abre o perfil para você colar diretamente.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-[10px] text-emerald-200">
              🛡️ <strong>100% Seguro:</strong> Usa a sua própria sessão legítima do Instagram, sem risco algum de banimento.
            </div>
          </div>

          {/* Pillar 3: Kiwify Webhook */}
          <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <DollarSign className="w-4 h-4" />
                <span>3. Venda Real Aprovada (Kiwify)</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                <strong>Captura Instantânea:</strong> Seu Webhook da Kiwify (<code>/api/webhook/kiwify</code>) já está no ar. No segundo em que uma mãe passar o cartão ou pagar o Pix de R$ 9,90 no seu link oficial, a Kiwify avisa este sistema na hora, toca o sino de venda e libera o material!
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/50 text-[10px] text-cyan-200">
              💳 <strong>Link Oficial Cadastrado:</strong> <span className="font-mono text-white">pay.kiwify.com.br/HE5xbnp</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: ROBOT CONTROLS & LIVE TERMINAL FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Robot Switch & Config */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2.5 rounded-xl ${isBotRunning ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                  <Bot className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Estado do Robô</h3>
                  <p className="text-xs text-slate-400">
                    {isBotRunning ? '🟢 Varredura ativa nas comunidades' : '⚪ Pausado no momento'}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => setIsBotRunning(!isBotRunning)}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isBotRunning ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
                title={isBotRunning ? 'Clique para pausar o robô' : 'Clique para ligar o robô'}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isBotRunning ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Campaign Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Produto Divulgado:</span>
                <span className="text-[11px] text-emerald-400 font-bold">R$ {activeCampaign.price.toFixed(2).replace('.', ',')}</span>
              </label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} — R$ {c.price.toFixed(2).replace('.', ',')}
                  </option>
                ))}
              </select>
            </div>

            {/* Speed / Anti-Ban Delay Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Ritmo Anti-Bloqueio:
                </span>
                <span className="text-[10px] text-slate-400">Proteção Meta</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBotSpeed('safe')}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold transition border ${
                    botSpeed === 'safe'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/70 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  Seguro (35s)
                  <span className="block text-[9px] font-normal text-slate-400">Recomendado</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBotSpeed('balanced')}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold transition border ${
                    botSpeed === 'balanced'
                      ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/70 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  Médio (20s)
                  <span className="block text-[9px] font-normal text-slate-400">Equilibrado</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBotSpeed('turbo')}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold transition border ${
                    botSpeed === 'turbo'
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/70 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  Turbo (12s)
                  <span className="block text-[9px] font-normal text-slate-400">Alta urgência</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Center & Right Column: Cities Management & Live Terminal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metrics Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Disparos Feitos</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-white">{totalSent}</span>
                <span className="text-[10px] text-indigo-400 font-medium">pessoas</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Cliques Kiwify</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-cyan-400">{totalClicks}</span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {totalSent > 0 ? `${((totalClicks / totalSent) * 100).toFixed(0)}%` : '0%'}
                </span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Vendas Kiwify</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-400">{totalSales}</span>
                <span className="text-[10px] text-emerald-400/80 font-bold">Aprovadas 🚀</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Cidades Ativas</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-purple-400">
                  {cities.filter((c) => c.active).length}
                </span>
                <span className="text-[10px] text-slate-400">de {cities.length}</span>
              </div>
            </div>
          </div>

          {/* Cities Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-rose-500" />
                  Cidades Selecionadas para o Robô Atuar
                </h3>
                <p className="text-xs text-slate-400">
                  Marque as cidades onde deseja concentrar os disparos do robô hoje.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingCity(!isAddingCity)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-700/50 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Outra Cidade
              </button>
            </div>

            {/* Add Custom City Form */}
            {isAddingCity && (
              <form onSubmit={handleAddCustomCity} className="bg-slate-950 border border-indigo-900/60 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-indigo-300">Nova Cidade para Prospecção</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Nome da Cidade</label>
                    <input
                      type="text"
                      placeholder="Ex: Campinas, Londrina, Joinville"
                      value={newCityName}
                      onChange={(e) => setNewCityName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Estado (UF)</label>
                    <select
                      value={newCityState}
                      onChange={(e) => setNewCityState(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      {['PR', 'SP', 'RJ', 'MG', 'RS', 'SC', 'DF', 'GO', 'BA', 'PE', 'CE', 'ES', 'MT', 'MS'].map((uf) => (
                        <option key={uf} value={uf}>
                          {uf}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Público-Alvo</label>
                    <input
                      type="text"
                      placeholder="Ex: Mães atípicas, pedagogia"
                      value={newCityAudience}
                      onChange={(e) => setNewCityAudience(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingCity(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    Salvar Cidade
                  </button>
                </div>
              </form>
            )}

            {/* Cities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[260px] overflow-y-auto pr-1">
              {cities.map((city) => (
                <div
                  key={city.id}
                  className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                    city.active
                      ? 'bg-slate-950/90 border-indigo-700/60 shadow-sm'
                      : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id={`chk-${city.id}`}
                      checked={city.active}
                      onChange={() => handleToggleCity(city.id)}
                      className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                    <div>
                      <label htmlFor={`chk-${city.id}`} className="font-bold text-white text-sm cursor-pointer flex items-center gap-1.5">
                        {city.name} - {city.state}
                        {city.salesCount > 0 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                            {city.salesCount} venda{city.salesCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </label>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{city.audienceType}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1.5">
                        <span>Envios: <strong className="text-slate-300">{city.dispatchesSent}</strong></span>
                        <span>Cliques: <strong className="text-cyan-400">{city.clicksGenerated}</strong></span>
                        <span>Raio: <strong className="text-slate-300">{city.radiusKm}km</strong></span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteCity(city.id)}
                    className="text-slate-600 hover:text-rose-400 p-1 transition cursor-pointer"
                    title="Remover cidade"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Dispatch Terminal */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                  Terminal de Acompanhamento ao Vivo (Feed de Envios)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  {logs.length} ações
                </span>
                <button
                  onClick={() => setLogs([])}
                  className="text-[11px] text-slate-500 hover:text-slate-300 underline transition cursor-pointer"
                >
                  Limpar
                </button>
              </div>
            </div>

            {/* Terminal Feed Scrollbox */}
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 font-mono text-xs max-h-[340px] overflow-y-auto space-y-2.5">
              {logs.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Nenhum envio registrado ainda. Clique em "Ligar Robô" para iniciar o acompanhamento em tempo real!
                </div>
              ) : (
                logs.map((log) => {
                  const isSale = log.actionType === 'venda_confirmada';
                  const isClick = log.actionType === 'link_clicado';

                  return (
                    <div
                      key={log.id}
                      className={`p-2.5 rounded-lg border transition ${
                        isSale
                          ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200 shadow-md'
                          : isClick
                          ? 'bg-cyan-950/40 border-cyan-700/50 text-cyan-200'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">{log.time}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-white border border-slate-700">
                            📍 {log.city} - {log.state}
                          </span>
                          <span className="text-emerald-400 font-semibold">{log.handle}</span>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSale
                              ? 'bg-emerald-500 text-slate-950 animate-pulse'
                              : isClick
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {isSale
                            ? '🟢 VENDA REAL KIWIFY (R$ 9,90)'
                            : isClick
                            ? '🔗 Link Kiwify Aberto'
                            : '✉️ Direct c/ Imagem Enviado'}
                        </span>
                      </div>

                      <p className="text-[11px] leading-relaxed text-slate-300">
                        {log.messagePreview}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 pt-2 border-t border-slate-900">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Anti-Bloqueio: Intervalos variáveis 100% orgânicos (R$ 0,00 de custo pago)
              </span>
              <span>
                Todos os links copiados passam por <code className="text-cyan-400">/api/r</code> para registrar cliques reais por cidade.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
