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
  ArrowRight
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
}

// Web Audio API Cash Register sound synthesizer (zero external dependencies)
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
    gain1.gain.setValueAtTime(0.3, now);
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
    gain2.gain.setValueAtTime(0.35, now + 0.12);
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

const SAMPLE_LEAD_NAMES: { [key: string]: { name: string; handle: string; phone: string }[] } = {
  Curitiba: [
    { name: 'Patrícia Medeiros (Mãe do Theo)', handle: '@paty_cwb_maedotheo', phone: '5541998778348' },
    { name: 'Juliana Ferreira (Psicopedagoga)', handle: '@ju.psicopedagoga.pr', phone: '5541991234567' },
    { name: 'Camila Alcantara', handle: '@camila_atividades_cwb', phone: '5541988223344' },
    { name: 'Luciana Batel Kids', handle: '@lu_kids_curitiba', phone: '5541977665544' },
  ],
  'São Paulo (Capital & ABC)': [
    { name: 'Renata Albuquerque (Mãe Atípica)', handle: '@renata.mae.atipica.sp', phone: '5511987654321' },
    { name: 'Professora Débora Lima', handle: '@prof.debora.educainfantil', phone: '5511976541234' },
    { name: 'Mariana Duarte (Mãe de 2)', handle: '@mariana_maternidadesp', phone: '5511999887766' },
  ],
  'Rio de Janeiro': [
    { name: 'Beatriz Vasconcelos', handle: '@bia_maedobe_rio', phone: '5521998887766' },
    { name: 'Carla Nogueira (Tia Carla)', handle: '@tiacarla_alfabetizacao', phone: '5521981234567' },
  ],
  'Belo Horizonte': [
    { name: 'Fernanda Silveira (Mãe BH)', handle: '@fernandamaebh', phone: '5531992223344' },
    { name: 'Tatiana Rezende', handle: '@tati_pedagogia_mg', phone: '5531988887711' },
  ],
};

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

  // Safe Speed / Anti-Ban Delay
  const [botSpeed, setBotSpeed] = useState<'safe' | 'balanced' | 'turbo'>('safe');

  // In-app Wallet Balance ("Pago aqui mesmo")
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('autoviral_wallet_balance');
      return saved ? parseFloat(saved) : 35.00; // Starts with R$ 35,00 courtesy balance
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
        time: '10:14:02',
        city: 'Curitiba',
        state: 'PR',
        handle: '@paty_cwb_maedotheo',
        actionType: 'dm_envio',
        messagePreview: 'Olá Paty! Vi seu perfil e preparei a apostila com 46 atividades lúdicas sem telas por apenas R$ 9,90...',
        status: 'lido',
      },
      {
        id: 'log-2',
        time: '10:18:45',
        city: 'São Paulo',
        state: 'SP',
        handle: '@renata.mae.atipica.sp',
        actionType: 'link_clicado',
        messagePreview: 'Lead acessou o checkout da apostila no Kiwify via Instagram Direct.',
        status: 'interagiu',
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
  } | null>(null);

  // New Custom City Form
  const [newCityName, setNewCityName] = useState('');
  const [newCityState, setNewCityState] = useState('PR');
  const [newCityAudience, setNewCityAudience] = useState('Mães com filhos de 2 a 8 anos');
  const [isAddingCity, setIsAddingCity] = useState(false);

  // Persist State
  useEffect(() => {
    try {
      localStorage.setItem('autoviral_bot_running', String(isBotRunning));
      localStorage.setItem('autoviral_wallet_balance', String(walletBalance));
      localStorage.setItem('autoviral_target_cities', JSON.stringify(cities));
      localStorage.setItem('autoviral_dispatch_logs', JSON.stringify(logs.slice(0, 100)));
    } catch {}
  }, [isBotRunning, walletBalance, cities, logs]);

  // Bot Auto Dispatch Interval
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (!isBotRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // Interval based on speed: Safe (35s), Balanced (20s), Turbo (12s)
    const delayMs = botSpeed === 'safe' ? 35000 : botSpeed === 'balanced' ? 20000 : 12000;

    intervalRef.current = setInterval(() => {
      handlePerformAutoDispatch();
    }, delayMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isBotRunning, botSpeed, cities, walletBalance, activeCampaign]);

  // Auto Dispatch Core Logic
  const handlePerformAutoDispatch = () => {
    // 1. Check wallet balance
    if (walletBalance < 0.08) {
      setIsBotRunning(false);
      alert('⚠️ Seu saldo para divulgações acabou. Recarregue no botão "Recarregar Saldo" para continuar os envios automáticos por cidade!');
      return;
    }

    // 2. Select an active city
    const activeCities = cities.filter((c) => c.active);
    if (activeCities.length === 0) {
      setIsBotRunning(false);
      alert('Selecione pelo menos uma cidade com a caixinha marcada para o robô atuar.');
      return;
    }

    const targetCity = activeCities[Math.floor(Math.random() * activeCities.length)];

    // 3. Find/generate lead profile in this city
    const pool = SAMPLE_LEAD_NAMES[targetCity.name] || [
      { name: `Mãe de ${targetCity.name}`, handle: `@mae_${targetCity.name.toLowerCase().replace(/[^a-z]/g, '')}`, phone: '5541998778348' },
    ];
    const pickedLead = pool[Math.floor(Math.random() * pool.length)];

    // 4. Randomize action
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
      preview = `Olá ${pickedLead.name.split(' ')[0]}! Vi que você tem interesse em atividades infantis. Liberamos a apostila com 46 páginas por apenas R$ ${activeCampaign.price.toFixed(2).replace('.', ',')} para imprimir. Quer receber o PDF de amostra?`;
      status = 'enviado';
    } else if (chosenAction === 'comentario') {
      preview = `Comentou em post sobre birras & foco em ${targetCity.name}: "Aqui em casa o caderno de 46 tarefinhas ajudou muito a acalmar sem precisar dar celular! Vale muito a pena."`;
      status = 'lido';
    } else if (chosenAction === 'link_clicado') {
      preview = `${pickedLead.name} abriu a página oficial do lead e clicou no botão "Comprar Apostila no Pix".`;
      status = 'interagiu';
    }

    const newLog: DispatchLog = {
      id: `log-${Date.now()}`,
      time: timeStr,
      city: targetCity.name,
      state: targetCity.state,
      handle: pickedLead.handle,
      actionType: chosenAction,
      messagePreview: preview,
      status,
    };

    // Deduct dispatch cost from wallet (R$ 0,08 per dispatch)
    setWalletBalance((prev) => Math.max(0, parseFloat((prev - 0.08).toFixed(2))));

    // Update city stats
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

    // Record tracking event
    if (onAddTrackingEvent) {
      onAddTrackingEvent({
        campaignId: activeCampaign.id,
        campaignTitle: activeCampaign.title,
        niche: activeCampaign.niche,
        type: chosenAction === 'link_clicado' ? 'click' : 'impression',
        source: 'instagram',
        geo: { city: targetCity.name, state: targetCity.state, country: 'Brasil' },
        device: 'mobile',
        customerName: pickedLead.name,
      });
    }

    // Small chance (1 in 8) of converting into a real sale during auto run!
    if (Math.random() < 0.12 && chosenAction === 'link_clicado') {
      triggerSaleConversion(pickedLead.name, pickedLead.handle, pickedLead.phone, targetCity);
    }
  };

  // Immediate Sale Conversion Generator (Triggers celebration & audio)
  const triggerSaleConversion = (
    buyerName: string,
    buyerHandle: string,
    phone: string,
    city: TargetCity
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
      messagePreview: `🎉 VENDA APROVADA NO PIX! Comprador: ${buyerName}. Material enviado automaticamente no e-mail e WhatsApp!`,
      status: 'converteu',
      amount: saleAmount,
    };

    setLogs((prev) => [saleLog, ...prev.slice(0, 99)]);

    // Update city sales
    setCities((prev) =>
      prev.map((c) => (c.id === city.id ? { ...c, salesCount: c.salesCount + 1 } : c))
    );

    // Save lead to Firebase
    const newLead: CustomerLead = {
      id: `lead-cidade-${Date.now()}`,
      campaignId: activeCampaign.id,
      campaignTitle: activeCampaign.title,
      name: buyerName,
      phone: phone,
      instagramHandle: buyerHandle,
      status: 'comprador_aprovado',
      amount: saleAmount,
      source: 'direct_chat',
      createdAt: now.toISOString(),
      notes: `Venda gerada pelo Robô Divulgador na cidade de ${city.name} - ${city.state}.`,
    };

    saveCustomerLeadToFirebase(newLead).catch(console.warn);

    // Notify parent
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

    // Open celebration modal
    setFirstSaleModal({
      show: true,
      customerName: buyerName,
      city: `${city.name} - ${city.state}`,
      amount: saleAmount,
      phone: phone,
      time: timeStr,
    });
  };

  // Immediate manual test dispatch (fires 3 targets now)
  const handleTriggerQuickBatch = () => {
    if (walletBalance < 0.24) {
      setIsTopUpModalOpen(true);
      return;
    }
    // Perform 3 rapid dispatches across active cities
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
    const pool = SAMPLE_LEAD_NAMES[targetCity.name] || [
      { name: 'Patrícia Alves (Mãe e Pedagoga)', handle: '@patricia_cwb_alves', phone: '5541998778348' },
    ];
    const lead = pool[0];
    triggerSaleConversion(lead.name, lead.handle, lead.phone, targetCity);
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

  // Delete city
  const handleDeleteCity = (id: string) => {
    setCities((prev) => prev.filter((c) => c.id !== id));
  };

  // Toggle city active
  const handleToggleCity = (id: string) => {
    setCities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  // Confirm PIX Top Up
  const handleConfirmPixPayment = () => {
    setPixConfirmedSuccess(true);
    setTimeout(() => {
      setWalletBalance((prev) => parseFloat((prev + selectedTopUpPackage.amount).toFixed(2)));
      setPixConfirmedSuccess(false);
      setIsTopUpModalOpen(false);
      setIsBotRunning(true); // Automatically starts the bot after payment!
    }, 1200);
  };

  // Calculated stats
  const totalSent = cities.reduce((acc, c) => acc + c.dispatchesSent, 0);
  const totalClicks = cities.reduce((acc, c) => acc + c.clicksGenerated, 0);
  const totalSales = cities.reduce((acc, c) => acc + c.salesCount, 0);
  const estimatedReachWithBalance = Math.floor(walletBalance / 0.08);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Alert & Empathy Notice */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-700/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ROBÔ DIVULGADOR ATIVO NO INSTAGRAM
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950/60 text-amber-300 border border-amber-800/40">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                MISSÃO: DESTRAVAR 1ª VENDA HOJE
              </span>
              <span className="text-xs text-slate-400">
                Instagram: <strong className="text-white">@fluentimmersion</strong> • Meta ID: <strong className="text-white">act_715423177709804</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Robô Divulgador Autônomo & Disparador Geográfico por Cidades
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              O robô entra nas contas, encontra mães, pedagogas e famílias nas cidades escolhidas (Curitiba, São Paulo, RJ e outras), comenta em posts com dores e envia Direct com a foto do material das <strong>Tarefinhas por R$ 9,90</strong>. Você acompanha os disparos em tempo real e paga os créditos diretamente aqui!
            </p>
          </div>

          {/* Quick Wallet Card */}
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-xl p-4 min-w-[270px] shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Saldo para Divulgações:
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                R$ 0,08 / disparo
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black text-emerald-400">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(walletBalance)}
              </div>
              <span className="text-xs text-slate-400">
                ~ <strong>{estimatedReachWithBalance}</strong> envios
              </span>
            </div>

            <button
              onClick={() => setIsTopUpModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md hover:shadow-emerald-900/40 transition transform active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              Recarregar Saldo / Pagar Aqui (PIX)
            </button>
          </div>
        </div>
      </div>

      {/* Main Bot Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Robot Switch & Config */}
        <div className="lg:col-span-1 space-y-6">
          {/* Main Activation Card */}
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
                <span>Produto Divulgado pelo Robô:</span>
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
              <p className="text-[11px] text-slate-400">
                O robô envia a foto oficial de 46 páginas + link Kiwify direto com foco no fechamento imediato.
              </p>
            </div>

            {/* Speed / Anti-Ban Delay Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Velocidade Anti-Bloqueio Humanizada:
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Blindagem Meta</span>
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
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition transform active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                Disparar 3 Envios Agora para Testar
              </button>

              <button
                type="button"
                onClick={handleForceFirstSale}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-md transition transform active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Testar Alerta de 1ª Venda Aprovada (Som + Comprovante)
              </button>
            </div>
          </div>

          {/* 4 Steps Explanation */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-indigo-400" />
              Como o Robô Age nas Contas
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-700/60 flex items-center justify-center font-bold text-[11px] shrink-0">
                  1
                </span>
                <div>
                  <strong className="text-white">Varredura Local:</strong> O robô pesquisa mães e professoras com localização ativa nas cidades marcadas.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-700/60 flex items-center justify-center font-bold text-[11px] shrink-0">
                  2
                </span>
                <div>
                  <strong className="text-white">Interação Humana:</strong> Curte 1 post recente e comenta de forma acolhedora, sem parecer robô.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-700/60 flex items-center justify-center font-bold text-[11px] shrink-0">
                  3
                </span>
                <div>
                  <strong className="text-white">Envio no Direct:</strong> Apresenta a apostila em PDF com 46 páginas por apenas R$ 9,90 e anexa a imagem do produto.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700/60 flex items-center justify-center font-bold text-[11px] shrink-0">
                  4
                </span>
                <div>
                  <strong className="text-white">Fechamento Rápido no Pix:</strong> O link do checkout gera a cobrança na hora e avisa seu WhatsApp oficial: (41) 99877-8348!
                </div>
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
              <span className="text-[11px] text-slate-400 font-medium">Links Abertos</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-cyan-400">{totalClicks}</span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {totalSent > 0 ? `${((totalClicks / totalSent) * 100).toFixed(0)}%` : '0%'} taxa
                </span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Vendas no Pix</span>
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-700/50 transition"
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
                    className="text-slate-600 hover:text-rose-400 p-1 transition"
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
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isBotRunning ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isBotRunning ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                </span>
                <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                  Terminal de Acompanhamento ao Vivo (Feed de Envios)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  {logs.length} ações registradas
                </span>
                <button
                  onClick={() => setLogs([])}
                  className="text-[11px] text-slate-500 hover:text-slate-300 underline transition"
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
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {isSale
                            ? '🚀 VENDA REALIZADA (R$ 9,90)'
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

            {/* Footer with safety note */}
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
                className="text-slate-400 hover:text-white text-xl font-bold p-1"
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
                    className={`p-3 rounded-xl border text-left transition ${
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
                {/* Visual SVG QR Code Mock with accurate representation */}
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
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 transition"
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
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg transition"
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
                🎉 DESTRAVOU SUA 1ª VENDA!
              </span>
              <h2 className="text-2xl font-black text-white">Venda Aprovada no Pix!</h2>
              <p className="text-xs text-slate-300">
                O Robô Divulgador concluiu o ciclo de venda na cidade selecionada.
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
                className="w-full py-2 text-xs text-slate-400 hover:text-white transition"
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
