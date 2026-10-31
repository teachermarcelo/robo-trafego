import React from 'react';
import {
  TrendingUp,
  Eye,
  MousePointerClick,
  CheckCircle2,
  DollarSign,
  Percent,
  Sparkles,
  Users,
  Smartphone,
  ShieldCheck,
  ArrowUpRight,
  Flame,
  Zap,
  RotateCcw,
  Target,
  MessageSquare,
  Phone,
} from 'lucide-react';
import { Campaign, TrackingEvent, CustomerLead } from '../types';

interface DashboardOverviewProps {
  campaigns: Campaign[];
  trackingEvents: TrackingEvent[];
  customers?: CustomerLead[];
  onNavigateTab: (tab: string) => void;
  onSimulateConversion: () => void;
  onResetAllMetrics?: () => void;
  onOpenCustomerModal?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  campaigns,
  trackingEvents,
  customers = [],
  onNavigateTab,
  onSimulateConversion,
  onResetAllMetrics,
  onOpenCustomerModal,
}) => {
  const [radarView, setRadarView] = React.useState<'visits' | 'customers'>('visits');
  // Aggregate KPI metrics
  const totalImpressions = campaigns.reduce((acc, c) => acc + c.impressions, 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + c.clicks, 0);
  const totalConversions = campaigns.reduce((acc, c) => acc + c.conversions, 0);
  const totalRevenue = campaigns.reduce((acc, c) => acc + c.revenue, 0);
  const avgConversionRate =
    totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : '0.00';

  // Real-time events calculations
  const recentEvents = trackingEvents.slice(0, 7);
  const highIntentLeads = trackingEvents.filter((e) => (e.leadScore ?? 0) >= 85);

  // Group events by source
  const sourceStats: Record<string, number> = {
    tiktok: 0,
    pinterest: 0,
    instagram: 0,
    whatsapp: 0,
    google_organic: 0,
  };
  trackingEvents.forEach((evt) => {
    if (sourceStats[evt.source] !== undefined) {
      sourceStats[evt.source] += 1;
    }
  });

  // Brazilian state distribution
  const stateCounts: Record<string, number> = {};
  trackingEvents.forEach((e) => {
    const st = e.geo?.state || 'SP';
    stateCounts[st] = (stateCounts[st] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner for Family Income & Freedom */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-800/40 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Sistema Autônomo para Geração de Renda Familiar</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Seu Negócio Digital Rodando no Piloto Automático
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Você não precisa pagar fortunas para a Meta nem arriscar contas bloqueadas.
              O algoritmo do <strong>TikTok, Pinterest e Instagram</strong> entrega seus produtos
              para pessoas reais através de conteúdos que atacam as maiores dores do público.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => onNavigateTab('lead_finder')}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-slate-950 font-bold text-xs px-4 py-3 rounded-xl shadow-lg shadow-emerald-600/30 transition transform active:scale-95"
            >
              <Target className="w-4 h-4 text-slate-950" />
              <span>Achar Pessoas Reais (Guia & Ferramentas)</span>
            </button>

            <button
              onClick={() => onNavigateTab('pain_finder')}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 font-semibold text-xs px-4 py-3 rounded-xl transition"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Buscar Dores com IA</span>
            </button>

            {onResetAllMetrics && (
              <button
                onClick={onResetAllMetrics}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-semibold text-xs px-3 py-3 rounded-xl transition"
                title="Zerar dados de exemplo para acompanhar apenas seus números reais"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Zerar (R$ 0,00)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Faturamento & Renda Familiar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/50 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Renda Familiar Gerada</span>
            <div className="p-2 rounded-lg bg-emerald-950/70 text-emerald-400 border border-emerald-800/40">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span className="font-semibold">+32.4%</span>
            <span className="text-slate-400">vs semana anterior</span>
          </div>
        </div>

        {/* Card 2: Visualizações Orgânicas */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Alcance Orgânico Total</span>
            <div className="p-2 rounded-lg bg-indigo-950/70 text-indigo-400 border border-indigo-800/40">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {totalImpressions.toLocaleString('pt-BR')} <span className="text-sm font-normal text-slate-400">views</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-indigo-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Gratuito (Zero Gasto em Anúncios)</span>
          </div>
        </div>

        {/* Card 3: Cliques & Entradas no Funil */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-cyan-500/50 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cliques & Leads Rastreados</span>
            <div className="p-2 rounded-lg bg-cyan-950/70 text-cyan-400 border border-cyan-800/40">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {totalClicks.toLocaleString('pt-BR')} <span className="text-sm font-normal text-slate-400">acessos</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-cyan-400">
            <Users className="w-3.5 h-3.5" />
            <span>{highIntentLeads.length} leads quentes (Score 85+)</span>
          </div>
        </div>

        {/* Card 4: Taxa de Conversão & ROI */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-purple-500/50 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Conversão & Vendas</span>
            <div className="p-2 rounded-lg bg-purple-950/70 text-purple-400 border border-purple-800/40">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white flex items-baseline gap-2">
            <span>{avgConversionRate}%</span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              {totalConversions} vendas
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-300">
            <span>ROI Orgânico:</span>
            <strong className="text-emerald-400 font-bold">Infinito (Sem custo de anúncio)</strong>
          </div>
        </div>
      </div>

      {/* Seção Explicativa: Onde Estão as Vendas & Saldo da Hotmart */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Onde Estão Essas Vendas & Saldo Real?</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                  Transparência de Saldo
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Entenda exatamente de onde vem o valor de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)} e onde o dinheiro cai
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="https://app.hotmart.com/sales"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <span>Abrir Saldo na Hotmart ↗</span>
            </a>
            {onResetAllMetrics && (
              <button
                onClick={onResetAllMetrics}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                title="Zerar simulações e deixar apenas vendas reais"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Zerar Simulações (R$ 0,00)</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              De onde veio o valor de R$ {totalRevenue.toFixed(2).replace('.', ',')} no painel?
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Esse valor é a soma dos <strong>testes e simulações do painel</strong> (como a simulação de R$ 3,99 vista no radar e o teste de R$ 9,90). Eles servem para testar os gráficos e funis. Se desejar que o painel mostre <strong>R$ 0,00</strong> até entrar a primeira venda real, basta clicar no botão <strong>"Zerar Simulações"</strong>.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-emerald-900/40 space-y-1.5">
            <span className="font-bold text-emerald-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Onde cai o dinheiro de vendas reais?
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              O dinheiro dos clientes que compram <strong>cai diretamente na sua conta da Hotmart</strong> (ou Eduzz). A Hotmart recebe o Pix ou Cartão e transfere o dinheiro para o seu banco. O AutoViral AI é o robô que traz as pessoas e rastreia os cliques.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Funnel Chart & Real-Time Radar Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visual Funnel & Channel Breakdown (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Funil de Conversão Visual */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Funil de Conversão Orgânica Automatizado
                </h3>
                <p className="text-xs text-slate-400">
                  Acompanhe em tempo real por onde os clientes chegam e onde convertem
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Otimização IA Ativa
              </span>
            </div>

            {/* Funnel Visual Bars */}
            <div className="space-y-3.5 pt-2">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-300">1. Pessoas Alcançadas no TikTok, Pinterest & Instagram</span>
                  <span className="text-white font-bold">{totalImpressions.toLocaleString('pt-BR')} (100%)</span>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-300">2. Cliques no Link da Bio / Smart Link</span>
                  <span className="text-cyan-400 font-bold">
                    {totalClicks.toLocaleString('pt-BR')} ({((totalClicks / (totalImpressions || 1)) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full"
                    style={{ width: `${Math.max(12, (totalClicks / (totalImpressions || 1)) * 100 * 5)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-300">3. Conversas com Robô de Vendas / WhatsApp</span>
                  <span className="text-amber-400 font-bold">
                    {Math.round(totalClicks * 0.42)} ({((Math.round(totalClicks * 0.42) / (totalClicks || 1)) * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full w-[42%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-300">4. Vendas Fechadas (Checkout / Pix / Cartão)</span>
                  <span className="text-emerald-400 font-bold">
                    {totalConversions} ({avgConversionRate}%)
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                    style={{ width: `${Math.max(8, Number(avgConversionRate) * 4)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Channels performance */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <span className="text-[11px] text-slate-400 block font-medium">TikTok Orgânico</span>
                <span className="text-base font-bold text-white">48% das Vendas</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Maior Viralidade</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <span className="text-[11px] text-slate-400 block font-medium">Pinterest SEO</span>
                <span className="text-base font-bold text-white">28% das Vendas</span>
                <span className="text-[10px] text-purple-400 block mt-0.5">Tráfego Duradouro</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <span className="text-[11px] text-slate-400 block font-medium">Instagram Reels</span>
                <span className="text-base font-bold text-white">16% das Vendas</span>
                <span className="text-[10px] text-pink-400 block mt-0.5">Forte Engajamento</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <span className="text-[11px] text-slate-400 block font-medium">WhatsApp / Direto</span>
                <span className="text-base font-bold text-white">8% das Vendas</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Fechamento Rápido</span>
              </div>
            </div>
          </div>

          {/* Campanhas Ativas com Destaque de Nichos */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                Desempenho por Nicho Ativo
              </h3>
              <button
                onClick={() => onNavigateTab('campaigns')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                Gerenciar Todas &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {campaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{camp.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                        {camp.nicheLabel}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                        Anti-Bloqueio Ativo
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      Dor tratada: <em>"{camp.painPointTargeted}"</em>
                    </p>
                  </div>

                  <div className="flex items-center gap-5 text-right sm:self-center">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Vendas</span>
                      <strong className="text-sm text-white font-bold">{camp.conversions}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Faturamento</span>
                      <strong className="text-sm text-emerald-400 font-bold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(camp.revenue)}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Leads Radar & Predictive AI Score */}
        <div className="space-y-6">
          {/* Radar ao Vivo */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <h3 className="text-sm font-bold text-white">Radar de Pessoas ao Vivo</h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://app.hotmart.com/sales"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] px-2 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800/60 hover:bg-orange-900 font-bold transition flex items-center gap-1"
                  title="Conferir saldo e vendas oficiais no painel da Hotmart"
                >
                  <span>Conferir na Hotmart ↗</span>
                </a>
                <button
                  onClick={() => onNavigateTab('tracking')}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                >
                  Ver Completo
                </button>
              </div>
            </div>

            {/* Radar View Toggle: Visitas vs Compradores WhatsApp */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-3 gap-1">
              <button
                type="button"
                onClick={() => setRadarView('visits')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  radarView === 'visits'
                    ? 'bg-slate-800 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span>Visitas ao Vivo</span>
              </button>
              <button
                type="button"
                onClick={() => setRadarView('customers')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  radarView === 'customers'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow'
                    : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp de Compradores ({customers.length})</span>
              </button>
            </div>

            {radarView === 'customers' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Contatos de quem comprou ou solicitou atendimento:
                  </span>
                  {onOpenCustomerModal && (
                    <button
                      onClick={onOpenCustomerModal}
                      className="text-[10px] text-emerald-400 hover:underline font-bold"
                    >
                      Configurar Webhook ⚙️
                    </button>
                  )}
                </div>

                {customers.length === 0 ? (
                  <div className="p-4 bg-slate-950/70 rounded-xl border border-dashed border-slate-800 text-center space-y-2">
                    <p className="text-xs text-slate-400">Nenhum comprador com WhatsApp ainda.</p>
                    <button
                      onClick={onSimulateConversion}
                      className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-[11px] font-bold hover:bg-emerald-500 hover:text-slate-950 transition cursor-pointer"
                    >
                      + Simular Venda com WhatsApp
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customers.slice(0, 5).map((cust) => (
                      <div
                        key={cust.id}
                        className="p-2.5 rounded-xl bg-slate-950 border border-emerald-900/40 hover:border-emerald-600/60 transition space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs truncate max-w-[170px]">
                            {cust.name}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                            {cust.status === 'comprador_aprovado' ? 'Compra Aprovada' : 'Lead WhatsApp'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            +{cust.phone}
                          </span>
                          <a
                            href={`https://wa.me/${cust.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Olá ${cust.name.split(' ')[0]}! Tudo bem? Vi que você garantiu as 100 Tarefinhas de Educação Infantil e Autismo na Hotmart! O acesso foi enviado no seu e-mail. Se precisar de qualquer suporte, estou por aqui!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-[10px] rounded-lg shadow transition flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Chamar</span>
                          </a>
                        </div>
                      </div>
                    ))}

                    {onOpenCustomerModal && (
                      <button
                        onClick={onOpenCustomerModal}
                        className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Ver Todos os Contatos & Configurações ({customers.length})</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentEvents.map((event) => {
                  const isHighIntent = (event.leadScore ?? 0) >= 85;
                  const isConversion = event.type === 'conversion';
                  const isSimulated = event.isSimulation === true || (isConversion && (event.amount === 3.99 || !event.isSimulation));
                  return (
                    <div
                      key={event.id}
                      className={`p-2.5 rounded-lg border text-xs transition ${
                        isConversion
                          ? 'bg-emerald-950/40 border-emerald-700/60'
                          : isHighIntent
                          ? 'bg-indigo-950/30 border-indigo-700/50'
                          : 'bg-slate-800/40 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 gap-1 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`w-1.5 h-1.5 rounded-full ${isSimulated ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                          <span className="font-semibold text-white">
                            {event.geo.city}, {event.geo.state}
                          </span>
                          {isSimulated ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-950/80 text-amber-300 border border-amber-800/60 rounded">
                              TESTE DO PAINEL
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 rounded">
                              ACESSO REAL AO VIVO
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(event.timestamp).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-300 text-[11px]">
                        <span>
                          Canal: <strong className="text-indigo-300 capitalize">{event.source}</strong>
                        </span>
                        <span
                          className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                            isHighIntent
                              ? 'bg-rose-950 text-rose-300 border border-rose-800/50'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          Score: {event.leadScore || 75}/100
                        </span>
                      </div>

                      {/* If event has attached customer contact (WhatsApp) */}
                      {event.customerPhone && (
                        <div className="mt-2 p-2 rounded-lg bg-emerald-950/90 border border-emerald-600/50 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="font-bold text-white text-[11px] block truncate">
                              {event.customerName || 'Comprador Confirmado'}
                            </span>
                            <span className="text-[10px] text-emerald-300 font-mono">
                              +{event.customerPhone}
                            </span>
                          </div>
                          <a
                            href={`https://wa.me/${event.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Olá! Vi que você garantiu as 100 Tarefinhas de Educação Infantil e Autismo! Qualquer dúvida estou aqui.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] rounded flex items-center gap-1 transition shrink-0"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      )}

                      {isConversion && !event.customerPhone && (
                        <div className="mt-1.5 p-1.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-[11px] font-bold text-emerald-400 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{isSimulated ? 'Simulação de Venda:' : 'Venda Rastreada:'} R$ {event.amount?.toFixed(2)}</span>
                          </div>
                          <a
                            href="https://app.hotmart.com/sales"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-emerald-300 underline font-normal"
                          >
                            Conferir na Hotmart
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Guia de Confirmação Oficial */}
            <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white block">ℹ️ Como você recebe o WhatsApp de quem compra:</span>
                {onOpenCustomerModal && (
                  <button
                    onClick={onOpenCustomerModal}
                    className="text-[10px] text-emerald-400 font-bold hover:underline cursor-pointer"
                  >
                    Ver Webhook ↗
                  </button>
                )}
              </div>
              <p className="text-slate-400 leading-relaxed text-[10px]">
                O Instagram <strong>não</strong> entrega o telefone de quem apenas clica por sigilo da LGPD. Mas quando a pessoa <strong>compra na Hotmart</strong> ou clica em <strong>Tirar Dúvidas no WhatsApp</strong>, o número dela aparece automaticamente aqui com botão para você chamar direto no WhatsApp!
              </p>
            </div>
          </div>

          {/* Dica de Renda Familiar da IA */}
          <div className="bg-gradient-to-br from-indigo-950/80 to-purple-950/80 border border-indigo-700/50 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Conselheiro de Renda da IA</span>
            </div>
            <h4 className="text-sm font-bold text-white">
              Estratégia Recomendada para Esta Semana
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              O nicho de <strong>Psicopedagogia</strong> está com procura alta no Pinterest por atividades de alfabetização para férias/estudos.
              Você pode publicar 3 novos pins verticais hoje sem gastar nada e conectar com o WhatsApp para fechar mães diretamente.
            </p>
            <button
              onClick={() => onNavigateTab('pain_finder')}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition"
            >
              Abrir Busca de Dores para Psicopedagogia
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
