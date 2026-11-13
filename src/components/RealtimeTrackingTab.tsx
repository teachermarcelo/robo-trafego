import React, { useState, useEffect, useMemo } from 'react';
import {
  Radio,
  Users,
  MapPin,
  Smartphone,
  Monitor,
  Play,
  Pause,
  Filter,
  MessageSquare,
  Phone,
  Sparkles,
  Copy,
  Check,
  Target,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { TrackingEvent, Campaign, CustomerLead, PainPointData } from '../types';

interface RealtimeTrackingTabProps {
  trackingEvents: TrackingEvent[];
  campaigns: Campaign[];
  customers?: CustomerLead[];
  onAddTrackingEvent: (event: Partial<TrackingEvent>) => void;
  onOpenCustomerModal?: () => void;
  onSimulateSale?: () => void;
  onSelectPainForCreative?: (pain: PainPointData, niche?: string) => void;
  onNavigateTab?: (tab: string) => void;
}

interface CityIntelligence {
  key: string;
  city: string;
  state: string;
  totalEvents: number;
  realClicks: number;
  fbRealClicks: number;
  instaRealClicks: number;
  otherRealClicks: number;
  simulatedCount: number;
  productsViewed: string[];
  topNiche: string;
  lastTimestamp: string;
}

const getCityPainAndSolution = (niche: string, city: string, activeCampaign?: Campaign): {
  pain: string;
  solution: string;
  whatTheySearch: string;
  secretDesire: string;
  suggestedHook: string;
} => {
  const n = (niche || '').toLowerCase();
  const campTitle = activeCampaign?.title || 'Seu Produto Digital';

  if (n.includes('psico') || n.includes('pedag') || n.includes('tea') || n.includes('tdah')) {
    return {
      pain: `Mães atípicas, pais e professoras em ${city} exaustos tentando encontrar atividades lúdicas estruturadas para TEA/TDAH sem gastar horas criando do zero.`,
      solution: `${campTitle} entrega +100 atividades cognitivas em PDF prontas para imprimir e aplicar em 10 minutos sem poluição sensorial.`,
      whatTheySearch: `atividades autismo tdah pdf imprimir ${city.toLowerCase()}`,
      secretDesire: `Ver a criança concentrada, aprendendo no seu ritmo e devolver paz para a rotina escolar e familiar.`,
      suggestedHook: `Mãe ou professora de ${city}: pare de perder seu domingo criando tarefinhas do zero para crianças com TEA e TDAH!`,
    };
  }
  if (n.includes('ingl')) {
    return {
      pain: `Profissionais e estudantes em ${city} travando em reuniões, entrevistas e viagens por medo de falar inglês errado.`,
      solution: `${campTitle} foca em imersão prática e frases reais de trabalho em 15 minutos por dia, sem gramática engessada.`,
      whatTheySearch: `ingles conversacao rapido trabalho ${city.toLowerCase()}`,
      secretDesire: `Falar inglês com confiança para ganhar promoções, vagas remotas em dólar e viajar sem travar.`,
      suggestedHook: `Trabalha em ${city} e sente frio na barriga quando a reunião pede inglês? Faça esse treino prático hoje!`,
    };
  }
  if (n.includes('emagr') || n.includes('detox') || n.includes('saud')) {
    return {
      pain: `Pessoas em ${city} sofrendo com inchaço, cansaço e efeito sanfona por não conseguirem manter dietas caras e restritivas na rotina corrida.`,
      solution: `${campTitle} mostra um protocolo simples com alimentos acessíveis do supermercado para desinchar em 21 dias.`,
      whatTheySearch: `como desinchar barriga dieta simples ${city.toLowerCase()}`,
      secretDesire: `Recuperar energia, autoestima e voltar a vestir as roupas favoritas sem passar fome.`,
      suggestedHook: `Morando na correria em ${city}? Descubra como destravar o metabolismo em 21 dias com comida simples de casa!`,
    };
  }
  return {
    pain: activeCampaign?.painPointTargeted
      ? `${activeCampaign.painPointTargeted} (público ativo em ${city})`
      : `Famílias e trabalhadores em ${city} precisando de renda extra no fim do mês pelo celular sem investir em tráfego pago.`,
    solution: `${campTitle} oferece um passo a passo direto pelo WhatsApp e redes orgânicas para gerar vendas reais com zero custo de anúncio.`,
    whatTheySearch: `como ganhar renda extra pelo celular ${city.toLowerCase()}`,
    secretDesire: `Aliviar as contas de casa no Pix e conquistar segurança financeira com flexibilidade de horário.`,
    suggestedHook: `Atenção ${city}: veja como pessoas comuns estão gerando renda extra pelo celular usando 30 minutos por dia sem gastar com anúncios!`,
  };
};

export const RealtimeTrackingTab: React.FC<RealtimeTrackingTabProps> = ({
  trackingEvents,
  campaigns,
  customers = [],
  onAddTrackingEvent,
  onOpenCustomerModal,
  onSimulateSale,
  onSelectPainForCreative,
  onNavigateTab,
}) => {
  const [selectedNiche, setSelectedNiche] = useState<string>('all');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('all');
  const [onlyRealClicks, setOnlyRealClicks] = useState<boolean>(false);
  const [isSimulatingLive, setIsSimulatingLive] = useState<boolean>(false);
  const [copiedCityKey, setCopiedCityKey] = useState<string | null>(null);

  // Auto simulation ticker
  useEffect(() => {
    if (!isSimulatingLive) return;

    const brazilianCities = [
      { city: 'São Paulo', state: 'SP' },
      { city: 'Rio de Janeiro', state: 'RJ' },
      { city: 'Belo Horizonte', state: 'MG' },
      { city: 'Curitiba', state: 'PR' },
      { city: 'Porto Alegre', state: 'RS' },
      { city: 'Salvador', state: 'BA' },
      { city: 'Fortaleza', state: 'CE' },
      { city: 'Brasília', state: 'DF' },
      { city: 'Goiânia', state: 'GO' },
      { city: 'Campinas', state: 'SP' },
    ];

    const sources: TrackingEvent['source'][] = [
      'tiktok',
      'pinterest',
      'instagram',
      'whatsapp',
      'google_organic',
    ];

    const ageBrackets: TrackingEvent['ageBracket'][] = [
      '18-24',
      '25-34',
      '35-44',
      '45-54',
    ];

    const interval = setInterval(() => {
      const randomCampaign = campaigns[Math.floor(Math.random() * campaigns.length)];
      const randomLoc = brazilianCities[Math.floor(Math.random() * brazilianCities.length)];
      const randomSource = sources[Math.floor(Math.random() * sources.length)];
      const randomAge = ageBrackets[Math.floor(Math.random() * ageBrackets.length)];
      const typeRoll = Math.random();
      let type: TrackingEvent['type'] = 'impression';
      let amount = 0;
      let leadScore = Math.floor(Math.random() * 30 + 55);

      if (typeRoll > 0.88) {
        type = 'conversion';
        amount = randomCampaign ? randomCampaign.price : 97.0;
        leadScore = Math.floor(Math.random() * 10 + 90);
      } else if (typeRoll > 0.65) {
        type = 'checkout_click';
        leadScore = Math.floor(Math.random() * 15 + 80);
      } else if (typeRoll > 0.45) {
        type = 'whatsapp_click';
        leadScore = Math.floor(Math.random() * 15 + 75);
      } else if (typeRoll > 0.25) {
        type = 'click';
        leadScore = Math.floor(Math.random() * 20 + 65);
      }

      onAddTrackingEvent({
        campaignId: randomCampaign?.id || 'camp-1',
        campaignTitle: randomCampaign?.title || 'Campanha Ativa',
        niche: randomCampaign?.niche || 'geral',
        type,
        geo: {
          city: randomLoc.city,
          state: randomLoc.state,
          country: 'Brasil',
        },
        device: Math.random() > 0.15 ? 'mobile' : 'desktop',
        ageBracket: randomAge,
        source: randomSource,
        amount,
        leadScore,
        durationSeconds: Math.floor(Math.random() * 220 + 25),
      });
    }, 7000);

    return () => clearInterval(interval);
  }, [isSimulatingLive, campaigns, onAddTrackingEvent]);

  // Filter events by niche, city, and real-clicks mode
  const filteredEvents = useMemo(() => {
    return trackingEvents.filter((e) => {
      if (selectedNiche !== 'all' && e.niche !== selectedNiche) return false;
      if (selectedCityFilter !== 'all' && (e.geo?.city || '') !== selectedCityFilter) return false;
      if (onlyRealClicks && e.isSimulation !== false) return false;
      return true;
    });
  }, [trackingEvents, selectedNiche, selectedCityFilter, onlyRealClicks]);

  // Real clicks vs Simulation metrics
  const realVsSimStats = useMemo(() => {
    const base = trackingEvents.filter((e) => selectedNiche === 'all' || e.niche === selectedNiche);
    const realEvents = base.filter((e) => e.isSimulation === false);
    const simEvents = base.filter((e) => e.isSimulation !== false);
    const realFb = realEvents.filter((e) => e.source === 'facebook_groups').length;
    const realInsta = realEvents.filter((e) => e.source === 'instagram').length;
    return {
      totalReal: realEvents.length,
      totalSim: simEvents.length,
      realFb,
      realInsta,
    };
  }, [trackingEvents, selectedNiche]);

  // City Intelligence Aggregation
  const cityIntelligenceList = useMemo<CityIntelligence[]>(() => {
    const cityMap = new Map<string, {
      city: string;
      state: string;
      totalEvents: number;
      realClicks: number;
      fbRealClicks: number;
      instaRealClicks: number;
      otherRealClicks: number;
      simulatedCount: number;
      productsSet: Set<string>;
      nicheCounts: Record<string, number>;
      lastTimestamp: string;
    }>();

    trackingEvents.forEach((evt) => {
      if (selectedNiche !== 'all' && evt.niche !== selectedNiche) return;
      const city = evt.geo?.city || 'São Paulo';
      const state = evt.geo?.state || 'SP';
      const key = `${city}|${state}`;
      const existing = cityMap.get(key) || {
        city,
        state,
        totalEvents: 0,
        realClicks: 0,
        fbRealClicks: 0,
        instaRealClicks: 0,
        otherRealClicks: 0,
        simulatedCount: 0,
        productsSet: new Set<string>(),
        nicheCounts: {},
        lastTimestamp: evt.timestamp,
      };

      existing.totalEvents += 1;
      if (evt.isSimulation === false) {
        existing.realClicks += 1;
        if (evt.source === 'facebook_groups') existing.fbRealClicks += 1;
        else if (evt.source === 'instagram') existing.instaRealClicks += 1;
        else existing.otherRealClicks += 1;
      } else {
        existing.simulatedCount += 1;
      }

      const viewedLabel = evt.adCreativeName
        ? `${evt.campaignTitle} (${evt.adCreativeName})`
        : evt.campaignTitle;
      if (viewedLabel) existing.productsSet.add(viewedLabel);

      const nKey = evt.niche || 'renda_extra';
      existing.nicheCounts[nKey] = (existing.nicheCounts[nKey] || 0) + 1;
      if (new Date(evt.timestamp).getTime() > new Date(existing.lastTimestamp).getTime()) {
        existing.lastTimestamp = evt.timestamp;
      }
      cityMap.set(key, existing);
    });

    return Array.from(cityMap.entries())
      .map(([key, item]) => {
        const topNiche =
          Object.entries(item.nicheCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
          campaigns[0]?.niche ||
          'renda_extra';
        return {
          key,
          city: item.city,
          state: item.state,
          totalEvents: item.totalEvents,
          realClicks: item.realClicks,
          fbRealClicks: item.fbRealClicks,
          instaRealClicks: item.instaRealClicks,
          otherRealClicks: item.otherRealClicks,
          simulatedCount: item.simulatedCount,
          productsViewed: Array.from(item.productsSet),
          topNiche,
          lastTimestamp: item.lastTimestamp,
        };
      })
      .sort((a, b) => {
        if (b.realClicks !== a.realClicks) return b.realClicks - a.realClicks;
        return b.totalEvents - a.totalEvents;
      });
  }, [trackingEvents, selectedNiche, campaigns]);

  const availableCities = useMemo(() => cityIntelligenceList.map((c) => c.city), [cityIntelligenceList]);

  const buildTrackedUrlForCity = (city: string, state: string, src: 'facebook_groups' | 'instagram_story', pain: string) => {
    const camp = campaigns.find((c) => c.status === 'active') || campaigns[0];
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const dest =
      camp?.checkoutUrl ||
      (camp ? `${origin}/?lead=1&camp=${encodeURIComponent(camp.id)}` : `${origin}/?lead=1`);
    return `${origin}/api/r?to=${encodeURIComponent(dest)}&src=${src}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&camp=${encodeURIComponent(camp?.id || 'camp-ativa')}&title=${encodeURIComponent(camp?.title || 'Oferta Ativa')}&niche=${encodeURIComponent(camp?.niche || 'renda_extra')}&pain=${encodeURIComponent(pain.slice(0, 90))}`;
  };

  const handleCopyCityLink = (url: string, copyId: string) => {
    navigator.clipboard.writeText(url);
    setCopiedCityKey(copyId);
    setTimeout(() => setCopiedCityKey(null), 2200);
  };

  // Demographics calculation
  const ageCounts: Record<string, number> = {
    '18-24': 0,
    '25-34': 0,
    '35-44': 0,
    '45-54': 0,
    '55+': 0,
  };

  const stateCounts: Record<string, number> = {};

  filteredEvents.forEach((evt) => {
    if (evt.ageBracket && ageCounts[evt.ageBracket] !== undefined) {
      ageCounts[evt.ageBracket] += 1;
    }
    const state = evt.geo?.state || 'SP';
    stateCounts[state] = (stateCounts[state] || 0) + 1;
  });

  const topStates = Object.entries(stateCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const actionLabel = (type: TrackingEvent['type']) => {
    switch (type) {
      case 'conversion':
        return { text: 'Venda Fechada', cls: 'text-emerald-400 font-semibold' };
      case 'checkout_click':
        return { text: 'Clicou Checkout', cls: 'text-amber-300 font-medium' };
      case 'whatsapp_click':
        return { text: 'Chamou WhatsApp', cls: 'text-teal-300 font-medium' };
      case 'click':
        return { text: 'Visitou Página', cls: 'text-slate-200' };
      default:
        return { text: 'Visualização', cls: 'text-slate-400' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span className={`w-2 h-2 rounded-full ${isSimulatingLive ? 'bg-rose-500' : 'bg-emerald-400'}`} />
              <span>Radar de Visitantes &amp; Rastreamento</span>
              <span className="text-slate-600">·</span>
              <span className="font-mono tabular-nums">{filteredEvents.length} eventos filtrados</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Acompanhe Quem Está Acessando Suas Ofertas
            </h2>
            <p className="text-xs text-slate-400">
              Separação clara entre cliques reais nos seus links e eventos de simulação, com leitura de cidade, dor e dispositivo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href={buildTrackedUrlForCity('Curitiba', 'PR', 'facebook_groups', campaigns[0]?.painPointTargeted || 'Teste Real de Clique')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition inline-flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Testar 1 Clique Real (/api/r)</span>
            </a>

            <button
              type="button"
              onClick={() => setIsSimulatingLive(!isSimulatingLive)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                isSimulatingLive
                  ? 'bg-rose-950 text-rose-200 border-rose-700 hover:bg-rose-900'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isSimulatingLive ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pausar Simulação</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Simular Tráfego</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <div className="inline-flex bg-slate-950 p-1 rounded-lg border border-slate-800 gap-1 flex-wrap">
              {['all', 'psicopedagogia', 'ingles', 'emagrecedor', 'renda_extra'].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSelectedNiche(n)}
                  className={`text-xs px-2.5 py-1 rounded-md capitalize transition font-medium cursor-pointer ${
                    selectedNiche === n
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {n === 'all' ? 'Todos' : n.replace('_', ' ')}
                </button>
              ))}
            </div>

            <select
              value={selectedCityFilter}
              onChange={(e) => setSelectedCityFilter(e.target.value)}
              aria-label="Filtrar por Cidade"
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todas as Cidades ({availableCities.length})</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setOnlyRealClicks(!onlyRealClicks)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition cursor-pointer inline-flex items-center gap-1.5 ${
                onlyRealClicks
                  ? 'bg-emerald-600 text-slate-950 border-emerald-500 font-bold'
                  : 'bg-slate-950 text-emerald-400 border-slate-800 hover:border-emerald-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{onlyRealClicks ? 'Mostrando Só Cliques Reais' : 'Somente Cliques Reais'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-KPI Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 block">
              Cliques Reais (/api/r e /z)
            </span>
            <strong className="text-2xl font-bold text-white font-mono tabular-nums block">
              {realVsSimStats.totalReal}
            </strong>
            <span className="text-xs text-slate-400 font-mono tabular-nums block">
              Facebook: {realVsSimStats.realFb} · Instagram: {realVsSimStats.realInsta}
            </span>
          </div>
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Eventos de Simulação / Teste
            </span>
            <strong className="text-2xl font-bold text-slate-200 font-mono tabular-nums block">
              {realVsSimStats.totalSim}
            </strong>
            <span className="text-xs text-slate-400 block">
              Isolados dos cliques reais
            </span>
          </div>
          <Radio className="w-5 h-5 text-amber-400 shrink-0" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 block">
              Cidades Monitoradas
            </span>
            <strong className="text-2xl font-bold text-white font-mono tabular-nums block">
              {cityIntelligenceList.length}
            </strong>
            <span className="text-xs text-slate-400 block truncate max-w-[230px]">
              {cityIntelligenceList[0]
                ? `Líder: ${cityIntelligenceList[0].city}/${cityIntelligenceList[0].state}`
                : 'Aguardando acessos'}
            </span>
          </div>
          <MapPin className="w-5 h-5 text-indigo-400 shrink-0" />
        </div>
      </div>

      {/* City Intelligence & Local Pains */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Inteligência por Cidade &amp; Dores Locais</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Produtos visualizados por praça, cliques reais recebidos e sugestão de dor local para gerar criativos direcionados.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {cityIntelligenceList
            .filter((c) => selectedCityFilter === 'all' || c.city === selectedCityFilter)
            .slice(0, 6)
            .map((cityData) => {
              const activeCamp =
                campaigns.find((c) => c.niche === cityData.topNiche) || campaigns[0];
              const localPain = getCityPainAndSolution(cityData.topNiche, cityData.city, activeCamp);
              const fbTrackedUrl = buildTrackedUrlForCity(cityData.city, cityData.state, 'facebook_groups', localPain.pain);
              const igTrackedUrl = buildTrackedUrlForCity(cityData.city, cityData.state, 'instagram_story', localPain.pain);

              return (
                <div
                  key={cityData.key}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    {/* City Row Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {cityData.city}, {cityData.state}
                        </h4>
                        <div className="text-[11px] text-slate-400 font-mono tabular-nums mt-0.5">
                          <span className={cityData.realClicks > 0 ? 'text-emerald-400 font-semibold' : ''}>
                            {cityData.realClicks} cliques reais
                          </span>
                          {' · '}
                          FB: {cityData.fbRealClicks}
                          {' · '}
                          IG: {cityData.instaRealClicks}
                          {cityData.simulatedCount > 0 ? ` · ${cityData.simulatedCount} testes` : ''}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono tabular-nums shrink-0">
                        {new Date(cityData.lastTimestamp).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Products viewed */}
                    <div className="pt-2.5 border-t border-slate-800/80 text-xs">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                        Ofertas visualizadas
                      </span>
                      <p className="text-slate-300 text-xs">
                        {cityData.productsViewed.slice(0, 3).join(' · ') || 'Campanha ativa'}
                      </p>
                    </div>

                    {/* Local Pain & Solution */}
                    <div className="pt-2.5 border-t border-slate-800/80 space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-400 block">
                          Dor identificada
                        </span>
                        <p className="text-slate-300 leading-relaxed mt-0.5">{localPain.pain}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 block">
                          Ângulo do produto
                        </span>
                        <p className="text-slate-400 leading-relaxed mt-0.5">{localPain.solution}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectPainForCreative) {
                          onSelectPainForCreative(
                            {
                              pain: `${localPain.pain} (Cidade foco: ${cityData.city}/${cityData.state})`,
                              intensity: 'Alta Urgência Local',
                              whatTheySearch: localPain.whatTheySearch,
                              secretDesire: localPain.secretDesire,
                              suggestedHook: localPain.suggestedHook,
                            },
                            cityData.topNiche
                          );
                        }
                        if (onNavigateTab) onNavigateTab('creatives');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] transition inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>Criar Criativo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyCityLink(fbTrackedUrl, `${cityData.key}-fb`)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium text-[11px] transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCityKey === `${cityData.key}-fb` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>FB Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Link FB</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyCityLink(igTrackedUrl, `${cityData.key}-ig`)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium text-[11px] transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCityKey === `${cityData.key}-ig` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>IG Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Link IG</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Demographics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Faixa Etária</span>
          </h3>
          <div className="space-y-3">
            {Object.entries(ageCounts).map(([age, count]) => {
              const total = filteredEvents.length || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={age} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">{age} anos</span>
                    <span className="text-slate-400 font-mono tabular-nums">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Top Estados</span>
          </h3>
          <div className="divide-y divide-slate-800/70">
            {topStates.map(([state, count], idx) => (
              <div key={state} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] text-slate-500 font-mono tabular-nums w-4">
                    {idx + 1}.
                  </span>
                  <span className="text-white font-medium">Estado de {state}</span>
                </div>
                <span className="text-slate-300 font-mono tabular-nums font-semibold">
                  {count} acessos
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>Dispositivos</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" /> Mobile / Celular
              </span>
              <strong className="text-emerald-400 font-mono tabular-nums">91%</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-indigo-400" /> Desktop
              </span>
              <strong className="text-slate-300 font-mono tabular-nums">9%</strong>
            </div>
            <p className="text-[11px] text-slate-400 pt-3 border-t border-slate-800 leading-relaxed">
              A maioria absoluta das aberturas acontece no celular — por isso o link curto para WhatsApp/Pix converte melhor.
            </p>
          </div>
        </div>
      </div>

      {/* Buyers & WhatsApp Leads */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Compradores &amp; Leads com WhatsApp</span>
              <span className="text-xs text-slate-400 font-mono tabular-nums font-normal">
                ({customers.length})
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Contatos capturados via Hotmart/Kiwify ou página de pré-atendimento ManyChat.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onSimulateSale && (
              <button
                type="button"
                onClick={onSimulateSale}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold rounded-lg border border-slate-700 transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Testar Venda</span>
              </button>
            )}
            {onOpenCustomerModal && (
              <button
                type="button"
                onClick={onOpenCustomerModal}
                className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-800 transition cursor-pointer"
              >
                Configurar Webhook
              </button>
            )}
          </div>
        </div>

        {customers.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Nenhum contato recebido ainda. Quando alguém chamar no link curto ou comprar na Hotmart/Kiwify, aparece aqui com botão direto para o WhatsApp.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customers.map((cust) => (
              <div
                key={cust.id}
                className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-white text-sm truncate">{cust.name}</span>
                    <span className="text-[11px] font-medium text-emerald-400 shrink-0">
                      {cust.status === 'comprador_aprovado' ? 'Compra Aprovada' : 'Lead WhatsApp'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap font-mono tabular-nums">
                    <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      +{cust.phone}
                    </span>
                    {cust.amount && (
                      <span className="text-slate-200 font-semibold">
                        R$ {cust.amount.toFixed(2)}
                      </span>
                    )}
                    <span className="text-slate-500 text-[11px]">
                      {new Date(cust.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {cust.notes && (
                    <p className="text-[11px] text-slate-400 line-clamp-2">{cust.notes}</p>
                  )}
                </div>

                <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400 capitalize">
                    Origem: {cust.source.replace('_', ' ')}
                  </span>
                  <a
                    href={`https://wa.me/${cust.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Olá ${cust.name.split(' ')[0]}! Tudo bem? Vi seu interesse pelo nosso material e estou por aqui no WhatsApp para te atender.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg transition inline-flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chamar no WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Events Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Fluxo de Visitantes &amp; Conversões
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono tabular-nums">
            {filteredEvents.length} registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Horário</th>
                <th className="pb-3 font-semibold">Cidade</th>
                <th className="pb-3 font-semibold">Idade</th>
                <th className="pb-3 font-semibold">Origem</th>
                <th className="pb-3 font-semibold">Campanha / Criativo</th>
                <th className="pb-3 font-semibold">Ação</th>
                <th className="pb-3 font-semibold">Score</th>
                <th className="pb-3 font-semibold text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredEvents.map((evt) => {
                const isConversion = evt.type === 'conversion';
                const isHighIntent = (evt.leadScore ?? 0) >= 85;
                const action = actionLabel(evt.type);

                return (
                  <tr
                    key={evt.id}
                    className={`hover:bg-slate-800/30 transition ${
                      isConversion ? 'bg-emerald-950/15' : ''
                    }`}
                  >
                    <td className="py-3 text-slate-400 font-mono tabular-nums whitespace-nowrap">
                      {new Date(evt.timestamp).toLocaleTimeString('pt-BR')}
                    </td>
                    <td className="py-3 font-medium text-white whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            evt.isSimulation === false ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                        />
                        {evt.geo?.city}, {evt.geo?.state}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300 font-mono tabular-nums whitespace-nowrap">
                      {evt.ageBracket}
                    </td>
                    <td className="py-3 text-slate-300 capitalize whitespace-nowrap">
                      {evt.source === 'meta_ads' ? 'Meta Ads' : evt.source.replace('_', ' ')}
                    </td>
                    <td className="py-3 text-slate-300 max-w-[220px]">
                      <div className="truncate font-medium text-white" title={evt.campaignTitle}>
                        {evt.campaignTitle}
                      </div>
                      {evt.adCreativeName && (
                        <div className="text-[11px] text-slate-400 truncate" title={evt.adCreativeName}>
                          {evt.adCreativeName}
                        </div>
                      )}
                    </td>
                    <td className="py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`text-[11px] ${action.cls}`}>{action.text}</span>
                        <span className="text-[10px] text-slate-500">
                          {evt.isSimulation === false ? 'Clique real' : 'Simulação'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 font-mono tabular-nums whitespace-nowrap">
                      <span className={isHighIntent ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                        {evt.leadScore}/100
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums whitespace-nowrap">
                      {isConversion ? (
                        <strong className="text-emerald-400 font-bold">
                          +R$ {evt.amount?.toFixed(2)}
                        </strong>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
