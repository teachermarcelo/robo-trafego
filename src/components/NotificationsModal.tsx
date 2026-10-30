import React from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { PushNotification } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotification[];
  onMarkAllAsRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
}) => {
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

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-end p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Central de Notificações Push</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">
            {notifications.filter((n) => !n.read).length} não lidas
          </span>
          <button
            onClick={onMarkAllAsRead}
            className="text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Marcar todas como lidas
          </button>
        </div>

        <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 rounded-xl border text-xs transition space-y-1 ${
                notif.read
                  ? 'bg-slate-800/30 border-slate-800 text-slate-300'
                  : 'bg-slate-800/80 border-slate-700 text-white shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold">
                  {getIcon(notif.type)}
                  <span>{notif.title}</span>
                </div>
                <span className="text-[10px] text-slate-400">{notif.time}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">{notif.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
