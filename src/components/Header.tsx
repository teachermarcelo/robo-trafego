import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Bell,
  CloudCheck,
  TrendingUp,
  DollarSign,
  Radio,
  ExternalLink,
  Flame,
  Target,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  totalRevenue: number;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpen2FA: () => void;
  is2FAEnabled: boolean;
  onPreviewBridge: () => void;
  onOpenSupabase: () => void;
  onOpenVercel?: () => void;
  onResetAllMetrics?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  totalRevenue,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpen2FA,
  is2FAEnabled,
  onPreviewBridge,
  onOpenSupabase,
  onOpenVercel,
  onResetAllMetrics,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard & Métricas', icon: TrendingUp },
    { id: 'lead_finder', label: 'Achar Pessoas & Leads', icon: Target, badge: 'Prático' },
    { id: 'pain_finder', label: 'Busca de Dores & Tendências', icon: Sparkles, badge: 'IA' },
    { id: 'creatives', label: 'Estúdio de Criativos IA', icon: Flame, badge: 'Viral' },
    { id: 'sales_bot', label: 'Robô de Vendas 24/7', icon: Radio },
    { id: 'tracking', label: 'Radar de Rastreio', icon: Radio, pulse: true },
    { id: 'campaigns', label: 'Minhas Campanhas', icon: DollarSign },
    { id: 'reports', label: 'Relatórios IA', icon: TrendingUp },
    { id: 'security', label: 'Segurança & 2FA', icon: ShieldCheck },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-xl">
      {/* Top Bar for Family Income Highlights & Status */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 px-4 py-2 text-xs border-b border-emerald-900/30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 font-semibold tracking-wide">
            MOTOR ORGÂNICO ANTI-BLOQUEIO ATIVO
          </span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden sm:inline">
            Sem custo de anúncios na Meta • Alcance natural no TikTok, Pinterest & Instagram
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/40">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Renda Familiar:</span>
            <strong className="text-white text-sm">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
            </strong>
            {onResetAllMetrics && totalRevenue > 0 && (
              <button
                onClick={onResetAllMetrics}
                className="ml-1 text-[10px] text-amber-400 hover:text-amber-300 underline font-semibold transition"
                title="Zerar para começar do R$ 0,00 no modo 100% real"
              >
                (Zerar)
              </button>
            )}
          </div>

          <button
            onClick={onOpen2FA}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition border ${
              is2FAEnabled
                ? 'bg-slate-800 text-emerald-400 border-emerald-700/50'
                : 'bg-amber-950/50 text-amber-300 border-amber-700/50 hover:bg-amber-900/50'
            }`}
            title="Autenticação de 2 Fatores"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{is2FAEnabled ? '2FA Ativo' : 'Ativar 2FA'}</span>
          </button>

          <a
            href="https://wa.me/5541998778348"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition border bg-emerald-950/60 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/60"
            title="Seu WhatsApp oficial de conversão configurado"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium">WhatsApp: (41) 99877-8348</span>
          </a>

          <button
            onClick={onOpenSupabase}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition border bg-slate-800 text-cyan-400 border-cyan-800/60 hover:bg-cyan-950/50"
            title="Conectar Banco Supabase"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Supabase</span>
          </button>

          {onOpenVercel && (
            <button
              onClick={onOpenVercel}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition border bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700/80 hover:text-white hover:border-slate-600"
              title="Como Hospedar no Vercel & Ter Link Próprio"
            >
              <span className="font-mono text-[10px] text-white">▲</span>
              <span>Vercel / Link</span>
            </button>
          )}


          <div className="hidden md:flex items-center gap-1 text-slate-400 text-xs">
            <CloudCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Backup Nuvem OK</span>
          </div>

          <button
            onClick={onOpenNotifications}
            className="relative p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-extrabold text-lg">
            AV
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">AutoViral AI</h1>
              <span className="bg-indigo-900/60 text-indigo-300 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-indigo-700/50">
                Robô de Vendas 24/7
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Tráfego orgânico autônomo, busca de dores e conversões para renda familiar
            </p>
          </div>
        </div>

        {/* Action Button: Live Smart Link Preview */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPreviewBridge}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-md shadow-emerald-600/20 transition transform active:scale-95"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver Link do Produto (Página do Lead)</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto scrollbar-none gap-1 border-t border-slate-800/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${tab.pulse ? 'text-rose-400 animate-pulse' : ''}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    tab.badge === 'IA'
                      ? 'bg-indigo-900/80 text-indigo-300'
                      : 'bg-emerald-900/80 text-emerald-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
