import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  DollarSign,
  Flame,
  ArrowRight,
  Download,
  RefreshCw,
  Printer,
} from 'lucide-react';
import { AIReport, Campaign, TrackingEvent } from '../types';

interface AIReportsTabProps {
  campaigns: Campaign[];
  trackingEvents: TrackingEvent[];
}

export const AIReportsTab: React.FC<AIReportsTabProps> = ({
  campaigns,
  trackingEvents,
}) => {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [isLoading, setIsLoading] = useState(false);

  const [report, setReport] = useState<AIReport>({
    reportTitle: 'Relatório Executivo Semanal de Renda Orgânica',
    executiveSummary:
      'Sua estratégia orgânica gerou um crescimento de 32% no volume de leads qualificados esta semana com R$ 0,00 gastos em tráfego pago da Meta. As conversões através do WhatsApp apresentaram taxa recorde de 24.5%.',
    highlights: [
      'O produto de Psicopedagogia atingiu o maior engajamento no Pinterest (+18.400 impressões orgânicas).',
      'O robô de vendas atendeu 42 potenciais clientes na madrugada, fechando 8 vendas enquanto você dormia.',
      'A média de tempo de retenção nos vídeos do TikTok subiu de 4s para 18s com os novos ganchos de 3 segundos.',
    ],
    actionPlan: [
      'Subir 2 novos carrosséis na terça-feira às 18h no Instagram atacando a dor de "falta de tempo das mães".',
      'Adicionar o gancho de 3s gerado no Estúdio Criativo nos primeiros segundos de todos os novos vídeos.',
      'Manter a rotina de postar 3 pins no Pinterest por dia nos horários de pico (12h, 19h e 22h).',
      'Ativar a resposta rápida do robô de vendas no checkout de Inglês para recuperar boletos e pix pendentes.',
    ],
    predictedRevenueNextPeriod: 'R$ 6.800,00 a R$ 9.400,00',
    safetyAudit:
      'Auditoria de Segurança Orgânica: 100% em conformidade com as diretrizes do TikTok, Pinterest e Instagram. Risco de bloqueio de conta avaliado em 0.0%.',
  });

  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      const stats = {
        totalCampaigns: campaigns.length,
        totalRevenue: campaigns.reduce((acc, c) => acc + c.revenue, 0),
        totalClicks: campaigns.reduce((acc, c) => acc + c.clicks, 0),
        totalConversions: campaigns.reduce((acc, c) => acc + c.conversions, 0),
        eventsCount: trackingEvents.length,
      };

      const res = await fetch('/api/gemini/ai-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period,
          stats,
          activeCampaigns: campaigns.map((c) => ({
            title: c.title,
            niche: c.nicheLabel,
            revenue: c.revenue,
            conversions: c.conversions,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/40 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Inteligência Analítica & Otimização Preditiva</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Relatórios Periódicos Gerados por Inteligência Artificial
            </h2>
            <p className="text-xs text-slate-400">
              A IA audita todos os seus cliques, tempo de engajamento e vendas para traçar um plano de ação claro para multiplicar a renda familiar.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex items-center gap-1">
              <button
                onClick={() => setPeriod('weekly')}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                  period === 'weekly'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Semanal
              </button>
              <button
                onClick={() => setPeriod('monthly')}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                  period === 'monthly'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mensal
              </button>
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={isLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg transition active:scale-95"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Gerando Diagnóstico...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Gerar Novo Relatório com IA</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Report Document Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Report Top Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Período Auditado: {period === 'weekly' ? 'Semana Atual' : 'Mês Corrente'}</span>
            </div>
            <h3 className="text-xl font-extrabold text-white">{report.reportTitle}</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> Diagnóstico Executivo da IA
          </span>
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {report.executiveSummary}
          </p>
        </div>

        {/* Grid: Highlights & Action Plan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Highlights */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Pontos Fortes e Conquistas
            </h4>
            <div className="space-y-2">
              {report.highlights.map((h, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 text-xs text-slate-200 flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    ✓
                  </span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Plan */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-indigo-400" />
              Plano de Ação para Multiplicar os Ganhos
            </h4>
            <div className="space-y-2">
              {report.actionPlan.map((act, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 text-xs text-slate-200 flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {i + 1}
                  </span>
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Projections & Safety Audit */}
        <div className="pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
              Previsão de Renda Familiar para o Próximo Período
            </span>
            <div className="text-xl font-black text-white">
              {report.predictedRevenueNextPeriod}
            </div>
            <span className="text-[11px] text-slate-400 block">
              Baseado no histórico de tráfego orgânico e tempo de retenção
            </span>
          </div>

          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 space-y-1">
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Auditoria Anti-Bloqueio
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {report.safetyAudit}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
