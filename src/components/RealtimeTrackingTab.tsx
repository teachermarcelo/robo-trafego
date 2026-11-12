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

    const eventTypes: TrackingEvent['type'][] = [
      'impression',
      'click',
      'whatsapp_click',
      'checkout_click',
      'conversion',
    ];

    const interval = setInterval(() => {
      const randomCampaign = campaigns[Math.floor(Math.random() * campaigns.length)];
      const randomLoc = brazilianCities[Math.floor(Math.random() * brazilianCities.length)];
      const randomSource = sources[Math.floor(Math.random() * sources.length)];
      const randomAge = ageBrackets[Math.floor(Math.random() * ageBrackets.length)];
      // Bias towards clicks and impressions
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800/40 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>Radar de Pessoas & Rastreamento em Tempo Real</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Acompanhe Quem Está Olhando Suas Ofertas no Brasil
            </h2>
            <p className="text-xs text-slate-400">
              Identifique idade estimada, localização geográfica, canal de origem (TikTok, Pinterest, Instagram) e intenção de compra.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSimulatingLive(!isSimulatingLive)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                isSimulatingLive
                  ? 'bg-rose-950 text-rose-300 border-rose-700/60 hover:bg-rose-900/60'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isSimulatingLive ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pausar Radar ao Vivo</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Iniciar Radar ao Vivo</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-400">Nicho:</span>
            {['all', 'psicopedagogia', 'ingles', 'emagrecedor', 'renda_extra'].map((n) => (
              <button
                key={n}
                onClick={() => setSelectedNiche(n)}
                className={`text-xs px-2.5 py-1 rounded-lg capitalize transition font-medium cursor-pointer ${
                  selectedNiche === n
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {n === 'all' ? 'Todos' : n.replace('_', ' ')}
              </button>
            ))}

            <select
              value={selectedCityFilter}
              onChange={(e) => setSelectedCityFilter(e.target.value)}
              aria-label="Filtrar por Cidade"
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todas as Cidades ({availableCities.length})</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  📍 {city}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setOnlyRealClicks(!onlyRealClicks)}
              className={`text-xs px-3 py-1 rounded-lg border font-bold transition cursor-pointer flex items-center gap-1.5 ${
                onlyRealClicks
                  ? 'bg-emerald-600 text-slate-950 border-emerald-400'
                  : 'bg-emerald-950/50 text-emerald-300 border-emerald-700/50 hover:bg-emerald-900/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{onlyRealClicks ? '🟢 Mostrando Só Cliques Reais' : 'Filtrar Só Cliques Reais'}</span>
            </button>
          </div>

          <div className="text-xs text-slate-400">
            Total Registrado:{' '}
            <strong className="text-white font-bold">{filteredEvents.length} eventos</strong>
          </div>
        </div>
      </div>

      {/* Real vs Simulated Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-950/30 border border-emerald-700/50 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-emerald-300 block">
              🟢 Cliques Reais Capturados (Links /api/r)
            </span>
            <strong className="text-2xl font-black text-white">{realVsSimStats.totalReal}</strong>
            <span className="text-[11px] text-emerald-300/90 block mt-0.5">
              Facebook: <strong>{realVsSimStats.realFb}</strong> • Instagram: <strong>{realVsSimStats.realInsta}</strong>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400 block">
              🧪 Eventos de Simulação / Teste Local
            </span>
            <strong className="text-2xl font-black text-slate-200">{realVsSimStats.totalSim}</strong>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Separados para você nunca confundir com clique real
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
            <Radio className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-indigo-950/30 border border-indigo-700/50 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-indigo-300 block">
              📍 Cidades Monitoradas &amp; Dores
            </span>
            <strong className="text-2xl font-black text-white">{cityIntelligenceList.length} cidades</strong>
            <span className="text-[11px] text-indigo-200 block mt-0.5 truncate max-w-[240px]">
              {cityIntelligenceList[0]
                ? `Líder: ${cityIntelligenceList[0].city}/${cityIntelligenceList[0].state} (${cityIntelligenceList[0].productsViewed[0] || 'Campanha'})`
                : 'Aguardando acessos nas cidades'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* City Intelligence & Local Pains Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Inteligência por Cidade: O Que Estão Vendo, Cliques Reais &amp; Dores Locais</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Veja exatamente qual cidade está visualizando seus anúncios, qual produto/criativo abriu, quantos cliques reais vieram do Facebook/Instagram e a dor local para criar novos anúncios que vendem.
            </p>
          </div>
          <a
            href={buildTrackedUrlForCity('Curitiba', 'PR', 'facebook_groups', campaigns[0]?.painPointTargeted || 'Teste Real de Clique')}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shrink-0 w-fit"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Testar 1 Clique Real Agora (/api/r)</span>
          </a>
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
                  className="bg-slate-950 border border-slate-800 hover:border-emerald-700/60 rounded-2xl p-4 space-y-3 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-400 flex items-center justify-center text-xs font-black">
                        {cityData.state}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {cityData.city}, {cityData.state}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          Última atividade: {new Date(cityData.lastTimestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                        cityData.realClicks > 0
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-600/60'
                          : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}>
                        🟢 {cityData.realClicks} Cliques Reais (FB: {cityData.fbRealClicks} | IG: {cityData.instaRealClicks})
                      </span>
                      {cityData.simulatedCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900 text-amber-300/90 border border-slate-700">
                          🧪 {cityData.simulatedCount} testes
                        </span>
                      )}
                    </div>
                  </div>

                  {/* O que está sendo visualizado */}
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-indigo-300 block">
                      👁️ O que estão visualizando em {cityData.city}:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cityData.productsViewed.slice(0, 3).map((prod, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-950/70 text-indigo-200 border border-indigo-800/50 font-medium"
                        >
                          {prod}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Dor Local & Solução do Produto */}
                  <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-rose-300 block">
                        🎯 Dor Real Identificada em {cityData.city}:
                      </span>
                      <p className="text-slate-200 leading-relaxed">{localPain.pain}</p>
                    </div>
                    <div className="pt-1 border-t border-rose-900/40">
                      <span className="text-[10px] font-bold uppercase text-emerald-300 block">
                        ✅ Como Seu Produto Resolve &amp; Gera Compra:
                      </span>
                      <p className="text-emerald-200/90 leading-relaxed">{localPain.solution}</p>
                    </div>
                  </div>

                  {/* Ações Reais */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
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
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>Criar Criativo p/ Esta Cidade &amp; Dor</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyCityLink(fbTrackedUrl, `${cityData.key}-fb`)}
                      className="px-2.5 py-1.5 rounded-xl bg-blue-950/70 hover:bg-blue-900/80 text-blue-200 border border-blue-700/60 font-semibold text-[11px] transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCityKey === `${cityData.key}-fb` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Link FB Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Link Real Facebook</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyCityLink(igTrackedUrl, `${cityData.key}-ig`)}
                      className="px-2.5 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900/80 text-purple-200 border border-purple-700/60 font-semibold text-[11px] transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCityKey === `${cityData.key}-ig` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Link Insta Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Link Real Instagram</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Demographics & Geographic Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Faixa Etária */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            Distribuição por Faixa Etária
          </h3>
          <div className="space-y-2.5 pt-1">
            {Object.entries(ageCounts).map(([age, count]) => {
              const total = filteredEvents.length || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={age} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">{age} anos</span>
                    <span className="text-slate-400 font-mono">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Principais Estados Brasileiros */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            Top Estados com Mais Acessos
          </h3>
          <div className="space-y-2 pt-1">
            {topStates.map(([state, count], idx) => (
              <div
                key={state}
                className="p-2 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="text-white font-semibold">Estado de {state}</span>
                </div>
                <span className="text-slate-300 font-mono font-bold">{count} pessoas</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dispositivos */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            Dispositivos Usados pelos Clientes
          </h3>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" /> Celular / Mobile
              </span>
              <strong className="text-emerald-400 font-bold">91%</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-indigo-400" /> Computador / Desktop
              </span>
              <strong className="text-slate-300 font-bold">9%</strong>
            </div>

            <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-700/60 leading-relaxed">
              💡 <strong>Insight da IA:</strong> 91% das conversões acontecem diretamente na tela do celular pelo WhatsApp ou Pix instantâneo.
            </p>
          </div>
        </div>
      </div>

      {/* Buyers and WhatsApp Leads Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Compradores & Leads com WhatsApp</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-bold">
                  {customers.length} contatos
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Pessoas reais que compraram na Hotmart ou pediram contato no WhatsApp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onSimulateSale && (
              <button
                onClick={onSimulateSale}
                className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-xs font-bold rounded-xl border border-emerald-500/40 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+ Testar Venda</span>
              </button>
            )}
            {onOpenCustomerModal && (
              <button
                onClick={onOpenCustomerModal}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Configurar Webhook Hotmart ⚙️</span>
              </button>
            )}
          </div>
        </div>

        {customers.length === 0 ? (
          <div className="p-6 bg-slate-950/60 rounded-xl border border-dashed border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">
              Nenhum contato recebido ainda. Quando alguém comprar na Hotmart ou chamar no WhatsApp, o número e nome aparecem aqui com botão direto para conversar!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customers.map((cust) => (
              <div
                key={cust.id}
                className="p-3.5 bg-slate-950 border border-emerald-900/50 hover:border-emerald-600/70 rounded-2xl transition space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{cust.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                      {cust.status === 'comprador_aprovado' ? 'Compra Aprovada' : 'Lead WhatsApp'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                    <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      +{cust.phone}
                    </span>
                    {cust.amount && (
                      <span className="text-emerald-300 font-bold">
                        R$ {cust.amount.toFixed(2)}
                      </span>
                    )}
                    <span className="text-slate-500 text-[11px]">
                      {new Date(cust.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {cust.notes && (
                    <p className="text-[11px] text-slate-400 italic">{cust.notes}</p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Origem: <strong className="text-slate-300 capitalize">{cust.source.replace('_', ' ')}</strong>
                  </span>
                  <a
                    href={`https://wa.me/${cust.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Olá ${cust.name.split(' ')[0]}! Tudo bem? Vi que você garantiu as 100 Tarefinhas de Educação Infantil e Autismo na Hotmart! O acesso já está no seu e-mail. Se precisar de qualquer suporte, estou por aqui no WhatsApp!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-xs rounded-xl shadow transition flex items-center gap-1.5"
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

      {/* Real-Time Live Feed Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
            <h3 className="text-base font-bold text-white">
              Fluxo ao Vivo de Visitantes & Conversões
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Atualizado automaticamente a cada poucos segundos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Horário</th>
                <th className="pb-3 font-semibold">Localização</th>
                <th className="pb-3 font-semibold">Faixa Etária</th>
                <th className="pb-3 font-semibold">Canal de Origem</th>
                <th className="pb-3 font-semibold">Campanha / Produto</th>
                <th className="pb-3 font-semibold">Ação do Lead</th>
                <th className="pb-3 font-semibold">Score Preditivo</th>
                <th className="pb-3 font-semibold text-right">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEvents.map((evt) => {
                const isConversion = evt.type === 'conversion';
                const isHighIntent = (evt.leadScore ?? 0) >= 85;

                return (
                  <tr
                    key={evt.id}
                    className={`hover:bg-slate-800/40 transition ${
                      isConversion ? 'bg-emerald-950/20' : ''
                    }`}
                  >
                    <td className="py-3 text-slate-400 font-mono">
                      {new Date(evt.timestamp).toLocaleTimeString('pt-BR')}
                    </td>
                    <td className="py-3 font-medium text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {evt.geo?.city}, {evt.geo?.state}
                    </td>
                    <td className="py-3 text-slate-300">{evt.ageBracket} anos</td>
                    <td className="py-3">
                      {evt.source === 'meta_ads' ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-700/80 inline-block w-fit">
                            🔵 Meta Ads (Pago)
                          </span>
                          {evt.adCreativeName && (
                            <span className="text-[9px] text-slate-400 font-mono truncate max-w-[140px]" title={evt.adCreativeName}>
                              {evt.adCreativeName}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium capitalize bg-slate-800 text-indigo-300 border border-slate-700">
                          {evt.source}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-slate-300 max-w-[200px]">
                      <div className="truncate font-medium text-white" title={evt.campaignTitle}>
                        {evt.campaignTitle}
                      </div>
                      {evt.adCreativeName && (
                        <div className="text-[10px] text-slate-400 truncate" title={evt.adCreativeName}>
                          Dor/Criativo: {evt.adCreativeName}
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-col gap-1">
                        {evt.isSimulation === false ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-600/60 w-fit">
                            🟢 CLIQUE REAL
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-amber-300/90 border border-slate-700 w-fit">
                            🧪 TESTE/ROBÔ
                          </span>
                        )}
                        {evt.type === 'conversion' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/50 w-fit">
                            Venda Fechada
                          </span>
                        )}
                        {evt.type === 'checkout_click' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800/50 w-fit">
                            Clicou Checkout / Link
                          </span>
                        )}
                        {evt.type === 'whatsapp_click' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800/50 w-fit">
                            Chamou WhatsApp
                          </span>
                        )}
                        {evt.type === 'click' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 w-fit">
                            Visitou Página
                          </span>
                        )}
                        {evt.type === 'impression' && (
                          <span className="px-2 py-0.5 rounded text-[10px] text-slate-400 w-fit">
                            Visualização
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          isHighIntent
                            ? 'bg-rose-950 text-rose-300 border border-rose-800/50'
                            : 'text-slate-300'
                        }`}
                      >
                        {evt.leadScore}/100
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {isConversion ? (
                        <strong className="text-emerald-400 font-bold">
                          +R$ {evt.amount?.toFixed(2)}
                        </strong>
                      ) : (
                        <span className="text-slate-500">-</span>
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
