import React, { useState, useEffect } from 'react';
import {
  Radio,
  Users,
  MapPin,
  Smartphone,
  Monitor,
  Flame,
  CheckCircle2,
  DollarSign,
  Play,
  Pause,
  Filter,
  Eye,
  MousePointerClick,
  Clock,
  ArrowUpRight,
  MessageSquare,
  Phone,
  Sparkles,
} from 'lucide-react';
import { TrackingEvent, Campaign, CustomerLead } from '../types';

interface RealtimeTrackingTabProps {
  trackingEvents: TrackingEvent[];
  campaigns: Campaign[];
  customers?: CustomerLead[];
  onAddTrackingEvent: (event: Partial<TrackingEvent>) => void;
  onOpenCustomerModal?: () => void;
  onSimulateSale?: () => void;
}

export const RealtimeTrackingTab: React.FC<RealtimeTrackingTabProps> = ({
  trackingEvents,
  campaigns,
  customers = [],
  onAddTrackingEvent,
  onOpenCustomerModal,
  onSimulateSale,
}) => {
  const [selectedNiche, setSelectedNiche] = useState<string>('all');
  const [isSimulatingLive, setIsSimulatingLive] = useState<boolean>(false);

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

  // Filter events
  const filteredEvents = trackingEvents.filter((e) => {
    if (selectedNiche === 'all') return true;
    return e.niche === selectedNiche;
  });

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
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-400">Filtrar por Nicho:</span>
            {['all', 'psicopedagogia', 'ingles', 'emagrecedor'].map((n) => (
              <button
                key={n}
                onClick={() => setSelectedNiche(n)}
                className={`text-xs px-2.5 py-1 rounded-lg capitalize transition font-medium ${
                  selectedNiche === n
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {n === 'all' ? 'Todos os Nichos' : n}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400">
            Total Registrado:{' '}
            <strong className="text-white font-bold">{filteredEvents.length} eventos</strong>
          </div>
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
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium capitalize bg-slate-800 text-indigo-300 border border-slate-700">
                        {evt.source}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300 max-w-[180px] truncate">
                      {evt.campaignTitle}
                    </td>
                    <td className="py-3">
                      {evt.type === 'conversion' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                          Venda Fechada
                        </span>
                      )}
                      {evt.type === 'checkout_click' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800/50">
                          Clicou Checkout
                        </span>
                      )}
                      {evt.type === 'whatsapp_click' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800/50">
                          Chamou WhatsApp
                        </span>
                      )}
                      {evt.type === 'click' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                          Visitou Página
                        </span>
                      )}
                      {evt.type === 'impression' && (
                        <span className="px-2 py-0.5 rounded text-[10px] text-slate-400">
                          Visualização
                        </span>
                      )}
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
