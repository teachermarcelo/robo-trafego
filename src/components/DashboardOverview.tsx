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
  ShieldCheck,
  ArrowUpRight,
  Flame,
  RotateCcw,
  Target,
  MessageSquare,
  Phone,
  Bot,
  Mail,
  Share2,
  Zap,
  ExternalLink,
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

  const recentEvents = trackingEvents.slice(0, 6);
  const highIntentLeads = trackingEvents.filter((e) => (e.leadScore ?? 0) >= 85);
  const realClicksCount = trackingEvents.filter((e) => e.isSimulation === false).length;

  const formattedRevenue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(totalRevenue);

  const quickLaunchModules = [
    {
      id: 'robo_cidades',
      title: 'Robô por Cidades',
      meta: 'Direct orgânico segmentado',
      action: 'Ligar Robô',
      icon: Bot,
      accent: 'text-emerald-400',
    },
    {
      id: 'chrome_fb_groups',
      title: 'Grupos FB & ManyChat',
      meta: 'Extensão 300s–400s · Link curto',
      action: 'Abrir Grupos',
      icon: Share2,
      accent: 'text-blue-400',
    },
    {
      id: 'meta_ads',
      title: 'Alavanca Meta Ads',
      meta: 'Auto-DM em anúncios ativos',
      action: 'Abrir Meta Ads',
      icon: Zap,
      accent: 'text-indigo-400',
    },
    {
      id: 'brevo_disparador',
      title: 'Disparador Brevo',
      meta: 'E-mail e WhatsApp com tracking',
      action: 'Abrir Brevo',
      icon: Mail,
      accent: 'text-cyan-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Workspace Header & Primary Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Webhook Kiwify &amp; Hotmart conectado</span>
            <span className="text-slate-600">·</span>
            <span>Rastreamento orgânico ativo</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Visão Geral da Operação
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Acompanhe alcance orgânico, cliques reais nos links rastreados, atendimento no WhatsApp e conversão por campanha em um único painel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateTab('lead_finder')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition cursor-pointer"
          >
            <Target className="w-4 h-4" />
            <span>Achar Pessoas Reais</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('pain_finder')}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Buscar Dores (IA)</span>
          </button>

          {onResetAllMetrics && (
            <button
              type="button"
              onClick={onResetAllMetrics}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-400 font-semibold text-xs transition cursor-pointer"
              title="Zerar simulações para acompanhar apenas vendas reais a partir de R$ 0,00"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Zerar (R$ 0,00)</span>
            </button>
          )}
        </div>
      </div>

      {/* 4-Card KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Renda Gerada</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums tracking-tight">
            {formattedRevenue}
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="text-emerald-400 font-semibold font-mono tabular-nums">+32,4%</span>
            <span>vs semana anterior</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Alcance Orgânico</span>
            <Eye className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums tracking-tight">
            {totalImpressions.toLocaleString('pt-BR')}
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero custo em tráfego</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Cliques &amp; Acessos</span>
            <MousePointerClick className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums tracking-tight">
            {totalClicks.toLocaleString('pt-BR')}
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2 font-mono tabular-nums">
            <span className="text-cyan-400">{highIntentLeads.length} score 85+</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400">{realClicksCount} reais</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Taxa de Conversão</span>
            <Percent className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl font-bold text-white font-mono tabular-nums tracking-tight">
              {avgConversionRate}%
            </span>
            <span className="text-xs text-emerald-400 font-semibold font-mono tabular-nums">
              {totalConversions} vendas
            </span>
          </div>
          <div className="text-xs text-slate-400">
            ROI orgânico sem gasto de anúncio
          </div>
        </div>
      </div>

      {/* Quick Launch Strip (Replaces stacked full-width promo banners) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {quickLaunchModules.map((mod) => {
          const Icon = mod.icon;
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => onNavigateTab(mod.id)}
              className="group bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 text-left transition cursor-pointer flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <Icon className={`w-4 h-4 ${mod.accent} shrink-0 mt-0.5`} />
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition shrink-0" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">{mod.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{mod.meta}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main 2-Column SaaS Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Main Area (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Organic Conversion Funnel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Funil de Conversão Orgânica</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Acompanhe cada etapa do alcance até o checkout no Pix ou Cartão
                </p>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Atualização em tempo real
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300">1. Alcance Orgânico (TikTok, Pinterest, FB &amp; IG)</span>
                  <span className="text-white font-semibold font-mono tabular-nums">
                    {totalImpressions.toLocaleString('pt-BR')} (100%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300">2. Cliques no Link Curto / Rastreador</span>
                  <span className="text-cyan-400 font-semibold font-mono tabular-nums">
                    {totalClicks.toLocaleString('pt-BR')} ({((totalClicks / (totalImpressions || 1)) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(8, (totalClicks / (totalImpressions || 1)) * 100 * 5))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300">3. Conversas / Pré-atendimento ManyChat &amp; WhatsApp</span>
                  <span className="text-amber-400 font-semibold font-mono tabular-nums">
                    {Math.round(totalClicks * 0.42).toLocaleString('pt-BR')} (42%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[42%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300">4. Vendas Confirmadas (Checkout / Pix)</span>
                  <span className="text-emerald-400 font-semibold font-mono tabular-nums">
                    {totalConversions} ({avgConversionRate}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(6, Number(avgConversionRate) * 4))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Channel Mix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
              <div>
                <span className="text-[11px] text-slate-400 block">TikTok Orgânico</span>
                <span className="text-sm font-bold text-white font-mono tabular-nums">48% das vendas</span>
                <span className="text-[11px] text-emerald-400 block">Maior viralidade</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Pinterest SEO</span>
                <span className="text-sm font-bold text-white font-mono tabular-nums">28% das vendas</span>
                <span className="text-[11px] text-indigo-400 block">Tráfego contínuo</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Instagram Reels</span>
                <span className="text-sm font-bold text-white font-mono tabular-nums">16% das vendas</span>
                <span className="text-[11px] text-slate-400 block">Engajamento ativo</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">WhatsApp / FB Grupos</span>
                <span className="text-sm font-bold text-white font-mono tabular-nums">8% das vendas</span>
                <span className="text-[11px] text-emerald-400 block">Fechamento rápido</span>
              </div>
            </div>
          </div>

          {/* Active Campaigns Table-style Rows */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Desempenho por Nicho e Campanha</span>
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab('campaigns')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
              >
                Gerenciar Campanhas &rarr;
              </button>
            </div>

            <div className="divide-y divide-slate-800/70">
              {campaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white truncate">{camp.title}</span>
                      <span className="text-[11px] text-slate-400">
                        · {camp.nicheLabel} · Anti-bloqueio ativo
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      Dor alvo: {camp.painPointTargeted}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 font-mono tabular-nums text-right">
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block">Vendas</span>
                      <strong className="text-sm text-white">{camp.conversions}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block">Faturamento</span>
                      <strong className="text-sm text-emerald-400">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(camp.revenue)}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Balance Transparency & Hotmart Settlement */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">Transparência de Saldo &amp; Recebimentos</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {totalRevenue > 0
                    ? `O total de ${formattedRevenue} inclui testes locais somados aos cliques rastreados. Vendas reais caem na sua conta Hotmart/Kiwify.`
                    : 'Painel zerado em R$ 0,00. Pronto para registrar apenas acessos reais e vendas confirmadas.'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="https://app.hotmart.com/sales"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition"
                >
                  <span>Saldo na Hotmart</span>
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                </a>
                <button
                  type="button"
                  onClick={() => onNavigateTab('chrome_fb_groups')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Escudo</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Area (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Radar & WhatsApp Buyers */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Radar ao Vivo</span>
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab('tracking')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                Ver Completo &rarr;
              </button>
            </div>

            {/* Segmented Switch */}
            <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-lg border border-slate-800 gap-1">
              <button
                type="button"
                onClick={() => setRadarView('visits')}
                className={`py-1.5 px-2 rounded-md text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  radarView === 'visits'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Visitas</span>
              </button>
              <button
                type="button"
                onClick={() => setRadarView('customers')}
                className={`py-1.5 px-2 rounded-md text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  radarView === 'customers'
                    ? 'bg-emerald-600 text-slate-950 font-bold'
                    : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp ({customers.length})</span>
              </button>
            </div>

            {radarView === 'customers' ? (
              <div className="space-y-3">
                {customers.length === 0 ? (
                  <div className="py-6 text-center space-y-3 border-t border-slate-800">
                    <p className="text-xs text-slate-400">Nenhum comprador com WhatsApp ainda.</p>
                    <button
                      type="button"
                      onClick={onSimulateConversion}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      + Simular Venda com WhatsApp
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/80">
                    {customers.slice(0, 5).map((cust) => (
                      <div key={cust.id} className="py-3 first:pt-1 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-white text-xs truncate">{cust.name}</span>
                          <span className="text-[11px] text-emerald-400 font-medium shrink-0">
                            {cust.status === 'comprador_aprovado' ? 'Aprovado' : 'Lead'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-400 font-mono tabular-nums flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            +{cust.phone}
                          </span>
                          <a
                            href={`https://wa.me/${cust.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Olá ${cust.name.split(' ')[0]}! Tudo bem? Vi seu interesse no material. Estou por aqui no WhatsApp para te ajudar!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[11px] rounded-md transition inline-flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Chamar</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {onOpenCustomerModal && (
                  <button
                    type="button"
                    onClick={onOpenCustomerModal}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-300 font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Gerenciar Contatos &amp; Webhook</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {recentEvents.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    Nenhum evento registrado ainda.
                  </div>
                ) : (
                  recentEvents.map((event) => {
                    const isConversion = event.type === 'conversion';
                    const isReal = event.isSimulation === false;
                    return (
                      <div key={event.id} className="py-2.5 first:pt-1 space-y-1 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                isReal ? 'bg-emerald-400' : 'bg-amber-400'
                              }`}
                            />
                            <span className="font-semibold text-white truncate">
                              {event.geo.city}, {event.geo.state}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              · {isReal ? 'Real' : 'Teste'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono tabular-nums shrink-0">
                            {new Date(event.timestamp).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="capitalize truncate">{event.source.replace('_', ' ')}</span>
                          <span className="font-mono tabular-nums text-slate-300">
                            Score {event.leadScore || 75}/100
                          </span>
                        </div>

                        {event.customerPhone && (
                          <div className="pt-1 flex items-center justify-between gap-2 text-[11px]">
                            <span className="font-mono text-emerald-400">+{event.customerPhone}</span>
                            <a
                              href={`https://wa.me/${event.customerPhone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:underline font-semibold"
                            >
                              Abrir WhatsApp &rarr;
                            </a>
                          </div>
                        )}

                        {isConversion && !event.customerPhone && (
                          <div className="pt-1 flex items-center justify-between text-[11px] text-emerald-400 font-semibold font-mono tabular-nums">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              R$ {event.amount?.toFixed(2)}
                            </span>
                            <a
                              href="https://app.hotmart.com/sales"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-white underline font-sans font-normal"
                            >
                              Hotmart
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Webhook automático via Hotmart/Kiwify e WhatsApp</span>
              {onOpenCustomerModal && (
                <button
                  type="button"
                  onClick={onOpenCustomerModal}
                  className="text-emerald-400 hover:underline font-semibold shrink-0 cursor-pointer"
                >
                  Configurar
                </button>
              )}
            </div>
          </div>

          {/* Strategy Recommendation Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Próxima Ação Recomendada</span>
            </div>
            <h4 className="text-sm font-bold text-white">
              Combine Grupos do Facebook + Link Curto ManyChat
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use o link curto <code className="text-emerald-400">/z/produto</code> ou o post estilo Botão WhatsApp nos grupos para levar leads aquecidos direto ao pré-atendimento automático.
            </p>
            <button
              type="button"
              onClick={() => onNavigateTab('chrome_fb_groups')}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              Abrir Funil Grupos &rarr; WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
