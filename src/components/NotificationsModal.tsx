import React, { useState } from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Trash2,
  CheckCheck,
  Radio,
  Zap,
} from 'lucide-react';
import { PushNotification } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotification[];
  onMarkAllAsRead: () => void;
  onClearDemoNotifications?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearDemoNotifications,
  onNavigateTab,
}) => {
  const [filter, setFilter] = useState<'all' | 'real' | 'demo'>('all');

  if (!isOpen) return null;

  const getIcon = (type: PushNotification['type']) => {
    switch (type) {
      case 'sale':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'traffic':
        return <TrendingUp className="w-4 h-4 text-indigo-400" />;
      case 'security':
        return <ShieldCheck className="w-4 h-4 text-cyan-400" />;
      case 'tip':
      default:
        return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'real') return n.isReal === true;
    if (filter === 'demo') return n.isReal !== true;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-end p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Central de Notificações</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter bar: Todas / Reais / Testes */}
        <div className="px-3 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-1 text-[11px]">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-1 rounded-lg font-semibold transition ${
                filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('real')}
              className={`px-2 py-1 rounded-lg font-semibold transition ${
                filter === 'real' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              🟢 Reais Kiwify ({notifications.filter((n) => n.isReal).length})
            </button>
            <button
              onClick={() => setFilter('demo')}
              className={`px-2 py-1 rounded-lg font-semibold transition ${
                filter === 'demo' ? 'bg-amber-600 text-slate-950' : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              Testes ({notifications.filter((n) => !n.isReal).length})
            </button>
          </div>
        </div>

        {/* Quick action bar */}
        <div className="px-3 py-2 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">
            {notifications.filter((n) => !n.read).length} não lidas
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onMarkAllAsRead}
              className="text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Marcar lidas
            </button>
            {onClearDemoNotifications && notifications.some((n) => !n.isReal) && (
              <button
                onClick={onClearDemoNotifications}
                className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
                title="Limpar apenas notificações de demonstração para deixar a tela limpa"
              >
                <Trash2 className="w-3 h-3" />
                Limpar Testes
              </button>
            )}
          </div>
        </div>

        {/* List of notifications */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/50" />
              <p>Nenhuma notificação no filtro selecionado.</p>
              {filter === 'real' && (
                <p className="text-[11px] text-slate-400">
                  Ouvindo Webhook Kiwify em tempo real! Toda compra real no Pix aparecerá aqui com selo verde.
                </p>
              )}
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded-xl border text-xs transition space-y-1.5 ${
                  notif.isReal
                    ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                    : notif.read
                    ? 'bg-slate-800/30 border-slate-800 text-slate-300'
                    : 'bg-slate-800/80 border-slate-700 text-white shadow-md'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    {getIcon(notif.type)}
                    <span>{notif.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{notif.time}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {notif.isReal ? (
                    <span className="bg-emerald-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                      🟢 VENDA REAL KIWIFY / WEBHOOK
                    </span>
                  ) : (
                    <span className="bg-amber-950 text-amber-300 border border-amber-800/80 text-[9px] px-1.5 py-0.5 rounded-full">
                      🧪 SIMULAÇÃO DE DEMO
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">{notif.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Footer with Webhook integration quick button */}
        {onNavigateTab && (
          <div className="p-3 bg-slate-950 border-t border-slate-800">
            <button
              onClick={() => {
                onClose();
                onNavigateTab('robo_cidades');
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow transition"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Ver Webhook Kiwify & Robô Hacker do Bem</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
