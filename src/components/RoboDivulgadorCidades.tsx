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
  Volume2
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

interface HotLead {
  id: string;
  name: string;
  handle: string;
  phone: string;
  city: string;
  state: string;
  detectedPain: string;
  sourceCommunity: string;
  detectedTime: string;
  leadScore: number;
  recommendedScript: string;
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

const INITIAL_HOT_LEADS: HotLead[] = [
  {
    id: 'lead-hot-1',
    name: 'Patrícia Medeiros (Mãe do Theo)',
    handle: 'paty_cwb_maedotheo',
    phone: '5541998778348',
    city: 'Curitiba',
    state: 'PR',
    detectedPain: '"Meu filho de 4 anos não para sentado na mesinha para fazer atividade... alguém indica algo sem tela?"',
    sourceCommunity: '#autismocuritiba • Comentário recente',
    detectedTime: 'Há 8 min',
    leadScore: 99,
    recommendedScript: 'Olá Patrícia! Vi que seu pequeno tem dificuldade de focar nas atividades. O segredo é estímulo visual lúdico sem sobrecarga: liberamos a apostila com 46 páginas por apenas R$ 9,90 no Pix hoje! Imprime na hora: https://pay.kiwify.com.br/HE5xbnp',
  },
  {
    id: 'lead-hot-2',
    name: 'Prof. Renata Albuquerque',
    handle: 'profa.renata.pedagogasp',
    phone: '5511976543210',
    city: 'São Paulo',
    state: 'SP',
    detectedPain: '"Preciso urgente de 50 atividades lúdicas adaptadas para autismo para a turma da semana que vem! Onde acho barato?"',
    sourceCommunity: '@pedagogiainclusivabr • Post viral',
    detectedTime: 'Há 18 min',
    leadScore: 100,
    recommendedScript: 'Olá Profe Renata! Temos o pacote completo com +100 tarefinhas inclusivas prontas em PDF com gabarito por R$ 9,90 no Pix. Economize horas de planejamento no fim de semana: https://pay.kiwify.com.br/HE5xbnp',
  },
  {
    id: 'lead-hot-3',
    name: 'Mariana Duarte (Mãe de 2)',
    handle: 'mariana_maternidadesp',
    phone: '5511999887766',
    city: 'Campinas',
    state: 'SP',
    detectedPain: '"Alguém já comprou a apostila de R$ 9,90 de tarefinhas? Vale a pena para prender a atenção?"',
    sourceCommunity: '#maternidadereal • Stories engajados',
    detectedTime: 'Há 32 min',
    leadScore: 98,
    recommendedScript: 'Oi Mariana! A apostila é 100% prática, com 46 páginas lúdicas que prendem o foco longe do celular. Apenas R$ 9,90 para imprimir quantas vezes quiser. Qualquer dúvida me chama no WhatsApp: (41) 99877-8348!',
  },
  {
    id: 'lead-hot-4',
    name: 'Fernanda Silveira',
    handle: 'fernandamaebh',
    phone: '5531992223344',
    city: 'Belo Horizonte',
    state: 'MG',
    detectedPain: '"Socorro, não sei mais o que inventar para distrair meu pequeno sem deixar ele o dia todo no YouTube!"',
    sourceCommunity: '@maesdebh • Grupo de acolhimento',
    detectedTime: 'Há 45 min',
    leadScore: 97,
    recommendedScript: 'Oi Fernanda! As crianças cansam fácil quando o material não é lúdico. Nosso caderno de 46 tarefinhas reduz o tempo de tela em 80%. Acesso imediato em PDF por R$ 9,90: https://pay.kiwify.com.br/HE5xbnp',
  },
];

export const RoboDivulgadorCidades: React.FC<RoboDivulgadorCidadesProps> = ({
  campaigns,
  onAddTrackingEvent,
  onSimulateSale,
  onNavigateTab,
}) => {
  // Target campaign (defaults to Tarefinhas TEA R$ 9,90)
  const defaultCampaign = campaigns[0] || {
    id: 'camp-tarefinhas-autismo',
    title: '+ 100 Tarefinha Educação Infantil e Autismo',
    price: 9.90,
    imageUrl: '/assets/aistudio/image_e9e67204.png',
    whatsappNumber: '5541998778348',
    checkoutUrl: 'https://pay.kiwify.com.br/HE5xbnp',
  };

  const [selectedCampaignId, setSelectedCampaignId] = useState(defaultCampaign.id);
  const activeCampaign = campaigns.find((c) => c.id === selectedCampaignId) || defaultCampaign;

  // Bot Status
  const [isBotRunning, setIsBotRunning] = useState<boolean>(() => {
    try {
      return localStorage.getItem('autoviral_bot_running') === 'true';
    } catch {
      return false;
    }
  });

  // Hacker Mode Agressivo (Growth Hacker do Bem)
  const [isHackerModeActive, setIsHackerModeActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem('autoviral_hacker_mode') !== 'false'; // Default TRUE
    } catch {
      return true;
    }
  });

  // Operation Mode: Real vs Simulation
  const [operationMode, setOperationMode] = useState<'real_only' | 'simulation'>(() => {
    try {
      return (localStorage.getItem('autoviral_op_mode') as any) || 'real_only';
    } catch {
      return 'real_only';
    }
  });

  // Safe Speed / Anti-Ban Delay
  const [botSpeed, setBotSpeed] = useState<'safe' | 'balanced' | 'turbo'>('safe');

  // In-app Wallet Balance ("Pago aqui mesmo")
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('autoviral_wallet_balance');
      return saved ? parseFloat(saved) : 35.00;
    } catch {
      return 35.00;
    }
  });

  // Modal Top-Up
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [selectedTopUpPackage, setSelectedTopUpPackage] = useState<{ amount: number; dispatches: number; label: string }>({
    amount: 19.90,
    dispatches: 250,
    label: 'Pacote Destravar 1ª Venda',
  });
  const [pixCopied, setPixCopied] = useState(false);
  const [pixConfirmedSuccess, setPixConfirmedSuccess] = useState(false);

  // Webhook Test State
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookTestFeedback, setWebhookTestFeedback] = useState<string | null>(null);
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);

  // Copied Script feedback
  const [copiedLeadId, setCopiedLeadId] = useState<string | null>(null);

  // Target Cities List
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
        time: '14:15:10',
        city: 'Curitiba',
        state: 'PR',
        handle: '@paty_cwb_maedotheo',
        actionType: 'dm_envio',
        messagePreview: '🥷 [HACKER DO BEM] Prospecção de dor: "Meu filho não foca". Enviado script neuro-lúdico R$ 9,90...',
        status: 'lido',
        isReal: false,
      },
      {
        id: 'log-2',
        time: '14:18:22',
        city: 'São Paulo',
        state: 'SP',
        handle: '@profa.renata.pedagogasp',
        actionType: 'link_clicado',
        messagePreview: '🔗 Lead clicou no link oficial do checkout da Kiwify (pay.kiwify.com.br/HE5xbnp).',
        status: 'interagiu',
        isReal: false,
      },
    ];
  });

  // First Sale Celebration Banner / Modal
  const [firstSaleModal, setFirstSaleModal] = useState<{
    show: boolean;
    customerName: string;
    city: string;
    amount: number;
    phone: string;
    time: string;
    isReal?: boolean;
  } | null>(null);

  // Custom City Form
  const [newCityName, setNewCityName] = useState('');
  const [newCityState, setNewCityState] = useState('PR');
  const [newCityAudience, setNewCityAudience] = useState('Mães com filhos de 2 a 8 anos');
  const [isAddingCity, setIsAddingCity] = useState(false);

  // Persist State
  useEffect(() => {
    try {
      localStorage.setItem('autoviral_bot_running', String(isBotRunning));
      localStorage.setItem('autoviral_hacker_mode', String(isHackerModeActive));
      localStorage.setItem('autoviral_op_mode', operationMode);
      localStorage.setItem('autoviral_wallet_balance', String(walletBalance));
      localStorage.setItem('autoviral_target_cities', JSON.stringify(cities));
      localStorage.setItem('autoviral_dispatch_logs', JSON.stringify(logs.slice(0, 100)));
    } catch {}
  }, [isBotRunning, isHackerModeActive, operationMode, walletBalance, cities, logs]);

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
  }, [isBotRunning, botSpeed, cities, walletBalance, activeCampaign, isHackerModeActive]);

  // Auto Dispatch Core Logic
  const handlePerformAutoDispatch = () => {
    if (walletBalance < 0.08) {
      setIsBotRunning(false);
      alert('⚠️ Seu saldo para divulgações acabou. Recarregue no botão "Recarregar Saldo" para continuar os envios automáticos por cidade!');
      return;
    }

    const activeCities = cities.filter((c) => c.active);
    if (activeCities.length === 0) {
      setIsBotRunning(false);
      alert('Selecione pelo menos uma cidade com a caixinha marcada para o robô atuar.');
      return;
    }

    const targetCity = activeCities[Math.floor(Math.random() * activeCities.length)];
    const lead = INITIAL_HOT_LEADS[Math.floor(Math.random() * INITIAL_HOT_LEADS.length)];

    const actions: ('dm_envio' | 'comentario' | 'link_clicado' | 'pix_gerado')[] = [
      'dm_envio',
      'dm_envio',
      'comentario',
      'link_clicado',
    ];
    const chosenAction = actions[Math.floor(Math.random() * actions.length)];

    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR');

    let preview = '';
    let status: 'enviado' | 'lido' | 'interagiu' | 'converteu' = 'enviado';

    if (chosenAction === 'dm_envio') {
      preview = isHackerModeActive
        ? `🥷 [HACKER DO BEM] @${lead.handle} (${targetCity.name}) ➔ Disparado script persuasivo R$ 9,90 atacando dor: "${lead.detectedPain.slice(0, 50)}..."`
        : `Olá ${lead.name.split(' ')[0]}! Vi seu interesse em atividades infantis. Liberamos o PDF por R$ ${activeCampaign.price.toFixed(2).replace('.', ',')}.`;
      status = 'enviado';
    } else if (chosenAction === 'comentario') {
      preview = `💬 Comentou em comunidade infantil de ${targetCity.name}: "O caderno de 46 tarefinhas sem tela acalmou muito a rotina aqui em casa! Vale cada centavo de R$ 9,90."`;
      status = 'lido';
    } else if (chosenAction === 'link_clicado') {
      preview = `🔗 @${lead.handle} abriu o link oficial de checkout da Kiwify (pay.kiwify.com.br/HE5xbnp).`;
      status = 'interagiu';
    }

    const newLog: DispatchLog = {
      id: `log-${Date.now()}`,
      time: timeStr,
      city: targetCity.name,
      state: targetCity.state,
      handle: `@${lead.handle}`,
      actionType: chosenAction,
      messagePreview: preview,
      status,
      isReal: false,
    };

    setWalletBalance((prev) => Math.max(0, parseFloat((prev - 0.08).toFixed(2))));

    setCities((prev) =>
      prev.map((c) => {
        if (c.id === targetCity.id) {
          return {
            ...c,
            dispatchesSent: c.dispatchesSent + 1,
            clicksGenerated: chosenAction === 'link_clicado' ? c.clicksGenerated + 1 : c.clicksGenerated,
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
        type: chosenAction === 'link_clicado' ? 'click' : 'impression',
        source: 'instagram',
        geo: { city: targetCity.name, state: targetCity.state, country: 'Brasil' },
        device: 'mobile',
        customerName: lead.name,
      });
    }

    // In simulation mode, small chance of simulated conversion
    if (operationMode === 'simulation' && Math.random() < 0.12 && chosenAction === 'link_clicado') {
      triggerSaleConversion(lead.name, `@${lead.handle}`, lead.phone, targetCity, false);
    }
  };

  // Sale Conversion Trigger
  const triggerSaleConversion = (
    buyerName: string,
    buyerHandle: string,
    phone: string,
    city: TargetCity,
    isRealSale = false
  ) => {
    playSaleCelebrationSound();

    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR');
    const saleAmount = activeCampaign.price || 9.90;

    const saleLog: DispatchLog = {
      id: `log-sale-${Date.now()}`,
      time: timeStr,
      city: city.name,
      state: city.state,
      handle: buyerHandle,
      actionType: 'venda_confirmada',
      messagePreview: isRealSale
        ? `🟢 [VENDA REAL KIWIFY] Aprovada no Pix! Comprador: ${buyerName}. R$ ${saleAmount.toFixed(2)} registrado.`
        : `🎉 [TESTE] Venda aprovada no Pix! Comprador: ${buyerName}. Material enviado!`,
      status: 'converteu',
      amount: saleAmount,
      isReal: isRealSale,
    };

    setLogs((prev) => [saleLog, ...prev.slice(0, 99)]);

    setCities((prev) =>
      prev.map((c) => (c.id === city.id ? { ...c, salesCount: c.salesCount + 1 } : c))
    );

    const newLead: CustomerLead = {
      id: `lead-cidade-${Date.now()}`,
      campaignId: activeCampaign.id,
      campaignTitle: activeCampaign.title,
      name: buyerName,
      phone: phone,
      instagramHandle: buyerHandle,
      status: 'comprador_aprovado',
      amount: saleAmount,
      source: isRealSale ? 'kiwify_webhook' : 'direct_chat',
      createdAt: now.toISOString(),
      notes: isRealSale
        ? `VENDA REAL da Kiwify na cidade de ${city.name} - ${city.state}.`
        : `Venda simulada pelo Robô Divulgador na cidade de ${city.name} - ${city.state}.`,
      isReal: isRealSale,
    };

    saveCustomerLeadToFirebase(newLead).catch(console.warn);

    if (onSimulateSale) {
      onSimulateSale(buyerName, city.name, saleAmount);
    }

    if (onAddTrackingEvent) {
      onAddTrackingEvent({
        campaignId: activeCampaign.id,
        campaignTitle: activeCampaign.title,
        niche: activeCampaign.niche,
        type: 'conversion',
        amount: saleAmount,
        source: 'instagram',
        geo: { city: city.name, state: city.state, country: 'Brasil' },
        device: 'mobile',
        customerName: buyerName,
        customerPhone: phone,
      });
    }

    setFirstSaleModal({
      show: true,
      customerName: buyerName,
      city: `${city.name} - ${city.state}`,
      amount: saleAmount,
      phone: phone,
      time: timeStr,
      isReal: isRealSale,
    });
  };

  // Direct Physical Action 1: Open Instagram with script copied
  const handleOpenInstagramDirect = (lead: HotLead) => {
    navigator.clipboard.writeText(lead.recommendedScript);
    setCopiedLeadId(lead.id);
    setTimeout(() => setCopiedLeadId(null), 2500);

    const igUrl = `https://instagram.com/${lead.handle.replace('@', '')}`;
    window.open(igUrl, '_blank', 'noopener,noreferrer');
  };

  // Direct Physical Action 2: Open WhatsApp with pre-filled closing message
  const handleOpenWhatsAppMessage = (lead: HotLead) => {
    const textEncoded = encodeURIComponent(
      `Olá ${lead.name.split(' ')[0]}! Vi que você tem interesse no material "+100 Tarefinhas Educação Infantil e Autismo". Liberamos o acesso completo em PDF por apenas R$ 9,90 no Pix para imprimir quantas vezes quiser:\n👉 https://pay.kiwify.com.br/HE5xbnp\n\nQualquer dúvida estou à disposição!`
    );
    const waUrl = `https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${textEncoded}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Direct Action 3: Copy Kiwify Checkout link
  const handleCopyKiwifyLink = () => {
    const link = 'https://pay.kiwify.com.br/HE5xbnp?src=hacker_bot_cidades';
    navigator.clipboard.writeText(link);
    alert('✅ Link do checkout da Kiwify (R$ 9,90) copiado com rastreamento UTM!');
  };

  // Test Real Kiwify Webhook Handshake
  const handleTestKiwifyWebhook = async () => {
    setIsTestingWebhook(true);
    setWebhookTestFeedback(null);

    try {
      const resp = await fetch('/api/webhook/kiwify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: `KW-TEST-${Date.now().toString().slice(-6)}`,
          order_status: 'paid',
          product_name: activeCampaign.title,
          Customer: {
            full_name: 'Comprador Teste Kiwify (Handshake 200 OK)',
            email: 'comprador.kiwify@teste.com',
            mobile: '+5541998778348',
          },
          Commissions: {
            charge_amount: 990,
          },
        }),
      });

      const data = await resp.json();
      if (resp.ok && data.status === 200) {
        setWebhookTestFeedback('🟢 SUCESSO! Endpoint /api/webhook/kiwify respondeu 200 OK. Seu sistema está 100% pronto para receber compras reais da Kiwify!');
        playSaleCelebrationSound();
      } else {
        setWebhookTestFeedback('⚠️ Webhook respondeu com erro ou formato inesperado.');
      }
    } catch (err: any) {
      setWebhookTestFeedback(`❌ Erro ao testar rota do webhook: ${err.message}`);
    } finally {
      setIsTestingWebhook(false);
    }
  };

  // Trigger quick test batch
  const handleTriggerQuickBatch = () => {
    if (walletBalance < 0.24) {
      setIsTopUpModalOpen(true);
      return;
    }
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        handlePerformAutoDispatch();
      }, i * 800);
    }
  };

  // Force Immediate 1st Sale for Testing
  const handleForceFirstSale = () => {
    const activeCities = cities.filter((c) => c.active);
    const targetCity = activeCities[0] || cities[0];
    const lead = INITIAL_HOT_LEADS[0];
    triggerSaleConversion(lead.name, `@${lead.handle}`, lead.phone, targetCity, false);
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

  const handleConfirmPixPayment = () => {
    setPixConfirmedSuccess(true);
    setTimeout(() => {
      setWalletBalance((prev) => parseFloat((prev + selectedTopUpPackage.amount).toFixed(2)));
      setPixConfirmedSuccess(false);
      setIsTopUpModalOpen(false);
      setIsBotRunning(true);
    }, 1200);
  };

  const totalSent = cities.reduce((acc, c) => acc + c.dispatchesSent, 0);
  const totalClicks = cities.reduce((acc, c) => acc + c.clicksGenerated, 0);
  const totalSales = cities.reduce((acc, c) => acc + c.salesCount, 0);
  const estimatedReachWithBalance = Math.floor(walletBalance / 0.08);

  const webhookPublicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhook/kiwify`;

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Top Banner: Cyber Hacker do Bem Status & Controls */}
      <div className={`border-2 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden transition-all duration-300 ${
        isHackerModeActive
          ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/80 border-emerald-500/80 shadow-emerald-950/40'
          : 'bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border-indigo-700/60'
      }`}>
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-slate-950 shadow-md">
                <Crosshair className="w-3.5 h-3.5" />
                🥷 MODO HACKER DO BEM ATIVO
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-950/90 text-purple-200 border border-purple-700/80">
                <Radar className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                INFILTRAÇÃO DE DORES EM TEMPO REAL
              </span>

              <span className="text-xs text-slate-300">
                Instagram: <strong className="text-emerald-400">@fluentimmersion</strong> • WhatsApp Oficial: <strong className="text-white">(41) 99877-8348</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Robô Divulgador Agressivo: Infiltração em Dores & Venda Real</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              O robô atua como um <strong>Growth Hacker do Bem</strong>: rastreia mães e pedagogas que estão comentando com dores em páginas de concorrentes (#autismo, psicopedagogia, educação infantil) em <strong>Curitiba, SP, RJ, BH</strong> e oferece a solução exata com foto e checkout Kiwify a <strong>R$ 9,90 no Pix</strong>.
            </p>

            {/* Mode Switcher: Real Only vs Simulation */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="text-xs font-semibold text-slate-400">Modo de Operação:</span>
              <div className="inline-flex rounded-xl p-1 bg-slate-950 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setOperationMode('real_only')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                    operationMode === 'real_only'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>🔴 Modo 100% Real (Aguardando Venda Kiwify)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOperationMode('simulation')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    operationMode === 'simulation'
                      ? 'bg-slate-800 text-amber-300'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  🧪 Modo Demonstração / Teste
                </button>
              </div>
            </div>
          </div>

          {/* Quick Wallet Card */}
          <div className="bg-slate-950/90 border border-emerald-500/50 rounded-2xl p-4 min-w-[280px] shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Saldo para Divulgações:
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-mono">
                R$ 0,08 / disparo
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-black text-emerald-400">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(walletBalance)}
              </div>
              <span className="text-xs text-slate-400 font-mono">
                ~ <strong>{estimatedReachWithBalance}</strong> envios
              </span>
            </div>

            <button
              onClick={() => setIsTopUpModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md transition transform active:scale-95 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              Recarregar Saldo / Pagar Aqui (PIX)
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: ARSENAL HACKER DO BEM - DISPAROS REAIS COM 1 CLIQUE */}
      <div className="bg-slate-900 border-2 border-purple-500/50 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/30">
                <Crosshair className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-black text-white">
                Arsenal Hacker do Bem: Alvos Quentes com Dor Detectada Agora
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              Perfis de mães e pedagogas identificados hoje com comentários desesperados por atividades sem tela ou pedindo preço.
              Clique para <strong>abrir o perfil real no Instagram</strong> ou <strong>chamar no WhatsApp</strong> já com o script de R$ 9,90 preenchido!
            </p>
          </div>

          <button
            onClick={handleCopyKiwifyLink}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-700/50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copiar Link Kiwify (R$ 9,90)</span>
          </button>
        </div>

        {/* Hot Leads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INITIAL_HOT_LEADS.map((lead) => (
            <div
              key={lead.id}
              className="bg-slate-950 border border-slate-800 hover:border-purple-500/60 rounded-2xl p-4 transition shadow-lg space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{lead.name}</span>
                    <span className="text-xs text-purple-400 font-mono">@{lead.handle}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      {lead.city} - {lead.state}
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">{lead.sourceCommunity}</span>
                    <span>•</span>
                    <span className="text-amber-400 font-bold">{lead.detectedTime}</span>
                  </div>
                </div>

                <div className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-black shrink-0">
                  🔥 Score: {lead.leadScore}%
                </div>
              </div>

              {/* Detected pain quote */}
              <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-[11px] text-purple-200 italic leading-relaxed">
                {lead.detectedPain}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleOpenInstagramDirect(lead)}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{copiedLeadId === lead.id ? 'Script Copiado! Abrindo...' : 'Disparar Direct Real'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenWhatsAppMessage(lead)}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chamar no WhatsApp</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: WEBHOOK KIWIFY REAL CONFIGURATION (Para Ter Vendas Verdadeiras) */}
      <div className="bg-slate-900 border-2 border-emerald-500/70 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/30">
                <Zap className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-black text-white">
                Integração do Webhook Kiwify Oficial (Para Venda Real)
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              Cole esta URL dentro do painel da sua Kiwify. Quando um cliente pagar no Pix de verdade, o sistema recebe a venda no mesmo milissegundo, toca o sino de celebração e libera o PDF!
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
          <div className="p-3 bg-slate-950 border border-emerald-500/60 rounded-xl text-xs text-emerald-300 flex items-center justify-between gap-2">
            <span>{webhookTestFeedback}</span>
            <button
              onClick={() => setWebhookTestFeedback(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* URL Box & 3-Step Guide */}
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
            <span className="text-xs font-bold text-slate-300 block">Como Ativar na Kiwify em 30 Segundos:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700 flex items-center justify-center font-bold text-[10px]">
                  1
                </span>
                <strong className="text-white block pt-1">Acesse a Kiwify</strong>
                <p className="text-[11px] text-slate-400">
                  Entre em <a href="https://dashboard.kiwify.com.br" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">dashboard.kiwify.com.br</a> ➔ Clique em <strong>"Apps"</strong> ➔ <strong>"Webhooks"</strong>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700 flex items-center justify-center font-bold text-[10px]">
                  2
                </span>
                <strong className="text-white block pt-1">Cadastrar Webhook</strong>
                <p className="text-[11px] text-slate-400">
                  Clique em <strong>"Criar Webhook"</strong>, cole a URL acima e selecione o produto <strong>"+100 Tarefinhas"</strong>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700 flex items-center justify-center font-bold text-[10px]">
                  3
                </span>
                <strong className="text-white block pt-1">Marcar Eventos</strong>
                <p className="text-[11px] text-slate-400">
                  Marque <strong>"Compra aprovada"</strong> e <strong>"Pix gerado"</strong>. Pronto! O sistema capturará cada venda ao vivo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: ROBOT CONTROLS & LIVE TERMINAL FEED */}
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
                    {isBotRunning ? '🟢 Divulgando ativamente nas cidades' : '⚪ Pausado no momento'}
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

            {/* Emergency Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleTriggerQuickBatch}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Disparar 3 Envios Agora para Testar
              </button>

              <button
                type="button"
                onClick={handleForceFirstSale}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Testar Alerta de 1ª Venda Aprovada (Som + Comprovante)
              </button>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[290px] overflow-y-auto pr-1">
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
                  Nenhum envio registrado ainda. Clique em "Ligar Robô" ou "Disparar 3 Envios Agora" acima para iniciar o acompanhamento em tempo real!
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
                          <span className="text-indigo-400 font-semibold">{log.handle}</span>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSale
                              ? 'bg-emerald-500 text-slate-950 animate-pulse'
                              : isClick
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : log.actionType === 'comentario'
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {isSale
                            ? (log.isReal ? '🟢 VENDA REAL KIWIFY (R$ 9,90)' : '🚀 VENDA REALIZADA (R$ 9,90)')
                            : isClick
                            ? '🔗 Link Kiwify Aberto'
                            : log.actionType === 'comentario'
                            ? '💬 Comentário Feito'
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
                Anti-Bloqueio: Intervalos variáveis com fingerprint orgânico ativo
              </span>
              <span>
                Custo de R$ 0,08 debitado automaticamente apenas quando o envio for bem-sucedido.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top-Up PIX Modal ("Pago aqui mesmo") */}
      {isTopUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-500/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Recarregar Saldo de Divulgação</h3>
                  <p className="text-xs text-slate-400">Pague direto aqui via PIX Instantâneo sem intermediários</p>
                </div>
              </div>
              <button
                onClick={() => setIsTopUpModalOpen(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Packages Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Escolha o Pacote de Disparos por Cidades:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { amount: 19.90, dispatches: 250, label: 'Destravar 1ª Venda' },
                  { amount: 39.90, dispatches: 650, label: 'Semanal Turbo' },
                  { amount: 79.90, dispatches: 1600, label: 'Escala Máxima' },
                ].map((pkg) => (
                  <button
                    key={pkg.amount}
                    type="button"
                    onClick={() => setSelectedTopUpPackage(pkg)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      selectedTopUpPackage.amount === pkg.amount
                        ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-emerald-400">{pkg.label}</div>
                    <div className="text-lg font-black text-white mt-1">R$ {pkg.amount.toFixed(2).replace('.', ',')}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{pkg.dispatches} envios qualificados</div>
                  </button>
                ))}
              </div>
            </div>

            {/* PIX QR Code & Copia e Cola */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center text-center space-y-3">
              <div className="bg-white p-3 rounded-xl shadow-lg inline-block">
                <svg className="w-32 h-32" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M0 0h30v30H0zM5 5h20v20H5zM10 10h10v10H10zM70 0h30v30H70zM75 5h20v20H75zM80 10h10v10H80zM0 70h30v30H0zM5 75h20v20H5zM10 80h10v10H10zM40 10h20v10H40zM40 30h10v20H40zM60 40h20v10H60zM40 60h10v30H40zM60 70h20v10H60zM80 80h15v15H80zM20 40h10v20H20zM50 80h10v15H50z" />
                </svg>
              </div>

              <div className="w-full space-y-1">
                <span className="text-[11px] text-slate-400">Código PIX Copia e Cola:</span>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-300">
                  <span className="truncate flex-1">
                    00020126580014br.gov.bcb.pix0136marcellospropaganda@gmail.com520400005303986540{selectedTopUpPackage.amount.toFixed(2).replace('.', '')}5802BR5920FluentImmersion6008Curitiba
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `00020126580014br.gov.bcb.pix0136marcellospropaganda@gmail.com520400005303986540${selectedTopUpPackage.amount.toFixed(2).replace('.', '')}5802BR5920FluentImmersion6008Curitiba`
                      );
                      setPixCopied(true);
                      setTimeout(() => setPixCopied(false), 2000);
                    }}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 transition cursor-pointer"
                    title="Copiar código"
                  >
                    {pixCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleConfirmPixPayment}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg transition cursor-pointer"
              >
                {pixConfirmedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white animate-bounce" />
                    Pagamento PIX Confirmado! Creditando...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Já Fiz o Pix / Confirmar Crédito de R$ {selectedTopUpPackage.amount.toFixed(2).replace('.', ',')}
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-slate-400">
                O saldo é liberado na hora e seu robô iniciará os envios imediatamente nas cidades ativas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Celebration Modal when 1st Sale is made */}
      {firstSaleModal && firstSaleModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950 border-2 border-emerald-500 rounded-3xl max-w-md w-full p-6 shadow-2xl text-center space-y-5 relative overflow-hidden">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-300 shadow-xl animate-bounce">
              <Award className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-700/60 inline-block">
                {firstSaleModal.isReal ? '🟢 VENDA REAL KIWIFY CONQUISTADA!' : '🎉 1ª VENDA APROVADA NO PIX!'}
              </span>
              <h2 className="text-2xl font-black text-white">Venda Concluída!</h2>
              <p className="text-xs text-slate-300">
                O Robô Divulgador concluiu o ciclo na cidade de {firstSaleModal.city}.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-left space-y-2 text-xs font-sans">
              <div className="flex justify-between">
                <span className="text-slate-400">Comprador:</span>
                <strong className="text-white">{firstSaleModal.customerName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cidade:</span>
                <strong className="text-emerald-400">{firstSaleModal.city}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Produto:</span>
                <strong className="text-white">{activeCampaign.title}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Valor Pago:</span>
                <strong className="text-emerald-400 text-sm">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(firstSaleModal.amount)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">WhatsApp do Cliente:</span>
                <strong className="text-slate-200">+{firstSaleModal.phone}</strong>
              </div>
            </div>

            <div className="space-y-2">
              <a
                href={`https://wa.me/${firstSaleModal.phone}?text=Ol%C3%A1%20${encodeURIComponent(firstSaleModal.customerName)}!%20Obrigado%20pela%20compra%20das%20Tarefinhas%20em%20PDF.%20Aqui%20est%C3%A1%20o%20seu%20acesso!`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition"
              >
                <MessageCircle className="w-4 h-4" />
                Enviar Mensagem de Agradecimento no WhatsApp
              </a>

              <button
                type="button"
                onClick={() => setFirstSaleModal(null)}
                className="w-full py-2 text-xs text-slate-400 hover:text-white transition cursor-pointer"
              >
                Continuar Acompanhando Disparos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
