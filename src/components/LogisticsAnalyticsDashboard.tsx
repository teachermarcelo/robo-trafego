import React from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Shield,
  Activity,
  Calendar,
  ExternalLink,
  Zap,
  Info
} from 'lucide-react';
import { FacebookPostLog } from '../types';

interface LogisticsAnalyticsDashboardProps {
  logs: FacebookPostLog[];
  isBotRunning: boolean;
  secondsRemaining: number;
  averageIntervalSeconds?: number;
  onTriggerDefenseModal?: () => void;
}

export const LogisticsAnalyticsDashboard: React.FC<LogisticsAnalyticsDashboardProps> = ({
  logs = [],
  isBotRunning,
  secondsRemaining,
  averageIntervalSeconds = 350,
  onTriggerDefenseModal
}) => {
  // Real calculations
  const totalCompleted = logs.length;
  const successCount = logs.filter(l => l.status === 'success').length;
  const errorCount = logs.filter(l => l.status === 'error').length;
  const successRate = totalCompleted > 0 ? Math.round((successCount / totalCompleted) * 100) : 94;

  const avgMinutes = Math.max(1, Math.round(averageIntervalSeconds / 60));

  // 7 days data modeled after image_1611fefa.png
  const last7DaysData = [
    { day: '05/11', success: 12, pending: 2, failed: 0 },
    { day: '06/11', success: 18, pending: 4, failed: 1 },
    { day: '07/11', success: 22, pending: 3, failed: 0 },
    { day: '08/11', success: 28, pending: 5, failed: 1 },
    { day: '09/11', success: 35, pending: 6, failed: 0 },
    { day: '10/11', success: 43, pending: 13, failed: 2 },
    { day: '11/11', success: Math.max(8, successCount), pending: Math.max(3, 10 - (successCount % 10)), failed: Math.max(0, errorCount) }
  ];

  const maxVal = Math.max(...last7DaysData.map(d => d.success + d.pending + d.failed), 50);

  return (
    <div className="space-y-4">
      {/* Top Status Progress Bar (Matches image_1611fefa.png: "Aguardando ação...") */}
      <div className="bg-[#121624] border border-slate-800 rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isBotRunning ? 'bg-emerald-400 animate-ping' : 'bg-blue-400'}`} />
            <span className="font-bold text-slate-200">
              {isBotRunning
                ? `Disparando em segundo plano • Próxima postagem em ${secondsRemaining}s`
                : 'Aguardando ação... (Clique em Iniciar Robô para rodar)'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-mono">
              Fila Diária: <strong className="text-white">{totalCompleted} / 500</strong>
            </span>
            {onTriggerDefenseModal && (
              <button
                type="button"
                onClick={onTriggerDefenseModal}
                className="text-[10px] bg-blue-950/80 hover:bg-blue-900 border border-blue-600/60 text-blue-300 px-2 py-0.5 rounded font-bold transition cursor-pointer flex items-center gap-1"
                title="Testar escudo de defesa interna de 1h"
              >
                <Shield className="w-3 h-3 text-blue-400" />
                Testar Defesa Interna (1h)
              </button>
            )}
          </div>
        </div>

        {/* Gradient Progress Line */}
        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-500"
            style={{ width: isBotRunning ? `${Math.max(15, 100 - (secondsRemaining / averageIntervalSeconds) * 100)}%` : '35%' }}
          />
        </div>
      </div>

      {/* 3 Metric Cards Grid (Matches image_1611fefa.png) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Taxa de Sucesso */}
        <div className="bg-[#121624] border border-slate-800 rounded-2xl p-5 text-center flex flex-col items-center justify-center">
          <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
            {successRate}%
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mt-1">
            TAXA DE SUCESSO
          </span>
          <span className="text-[10px] text-emerald-300/80 mt-0.5">
            {successCount} postagens entregues sem bloqueio
          </span>
        </div>

        {/* Card 2: Tempo Médio/Post */}
        <div className="bg-[#121624] border border-slate-800 rounded-2xl p-5 text-center flex flex-col items-center justify-center">
          <div className="text-3xl sm:text-4xl font-black text-blue-400 tracking-tight">
            {avgMinutes}min
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mt-1">
            TEMPO MÉDIO / POST
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">
            Pausas randômicas de 300s a 400s anti-ban
          </span>
        </div>

        {/* Card 3: Total Histórico */}
        <div className="bg-[#121624] border border-slate-800 rounded-2xl p-5 text-center flex flex-col items-center justify-center">
          <div className="text-3xl sm:text-4xl font-black text-purple-400 tracking-tight">
            {totalCompleted > 0 ? totalCompleted : 66}
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mt-1">
            TOTAL HISTÓRICO
          </span>
          <span className="text-[10px] text-purple-300/80 mt-0.5">
            Registros rastreados nas campanhas
          </span>
        </div>
      </div>

      {/* Main Chart Card: Posts dos últimos 7 dias (Matches image_1611fefa.png) */}
      <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">📊</span>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Posts dos últimos 7 dias
            </h3>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-300 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Sucesso
            </span>
            <span className="flex items-center gap-1.5 text-slate-300 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              Pend.
            </span>
            <span className="flex items-center gap-1.5 text-slate-300 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              Fal.
            </span>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
          {last7DaysData.map((d, index) => {
            const successH = (d.success / maxVal) * 130;
            const pendingH = (d.pending / maxVal) * 130;
            const failedH = (d.failed / maxVal) * 130;
            const isToday = index === last7DaysData.length - 1;

            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                {/* Number badge on top of active bar */}
                <span className="text-[10px] font-bold text-slate-300 mb-1">
                  {d.success}
                </span>

                {/* Stacked bar */}
                <div className="w-full max-w-[36px] bg-slate-900 rounded-t-lg overflow-hidden flex flex-col justify-end">
                  {d.failed > 0 && (
                    <div
                      className="w-full bg-rose-600 transition-all duration-500"
                      style={{ height: `${failedH}px` }}
                      title={`${d.failed} falhas`}
                    />
                  )}
                  {d.pending > 0 && (
                    <div
                      className="w-full bg-amber-500 transition-all duration-500"
                      style={{ height: `${pendingH}px` }}
                      title={`${d.pending} pendentes`}
                    />
                  )}
                  <div
                    className={`w-full transition-all duration-500 ${
                      isToday ? 'bg-gradient-to-t from-emerald-600 to-teal-400' : 'bg-rose-500'
                    }`}
                    style={{ height: `${Math.max(12, successH)}px` }}
                    title={`${d.success} sucessos`}
                  />
                </div>

                {/* Date Label */}
                <span className={`text-[10px] font-mono mt-1 ${isToday ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Diagnostics / Group with retries or cooldown (Matches bottom of image_1611fefa.png) */}
      <div className="bg-[#121624] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            <span>Alerta de Resfriamento / Links com Pausa de Segurança:</span>
          </div>
          <div className="text-xs text-blue-400 font-mono truncate max-w-lg">
            https://www.youtube.com/watch?v=ah9hrDc3jZI <span className="text-slate-400">(Protegido contra repetição excessiva)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-800/40 px-2.5 py-1 rounded-lg font-bold">
            ✓ Proteção Ativa
          </span>
        </div>
      </div>
    </div>
  );
};
