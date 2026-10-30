import React, { useState } from 'react';
import {
  Plus,
  Flame,
  CheckCircle2,
  DollarSign,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  Pause,
  Play,
  Copy,
  Check,
  TrendingUp,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { Campaign, NicheType } from '../types';

interface CampaignManagerTabProps {
  campaigns: Campaign[];
  onAddCampaign: (newCampaign: Campaign) => void;
  onToggleStatus: (id: string) => void;
  onPreviewBridge: (campaign: Campaign) => void;
  onDeleteCampaign?: (id: string) => void;
  onResetAllMetrics?: () => void;
}

export const CampaignManagerTab: React.FC<CampaignManagerTabProps> = ({
  campaigns,
  onAddCampaign,
  onToggleStatus,
  onPreviewBridge,
  onDeleteCampaign,
  onResetAllMetrics,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [niche, setNiche] = useState<NicheType>('psicopedagogia');
  const [nicheLabel, setNicheLabel] = useState('Psicopedagogia & TDAH');
  const [targetAudience, setTargetAudience] = useState('');
  const [painPointTargeted, setPainPointTargeted] = useState('');
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('5541998778348');
  const [price, setPrice] = useState('97.00');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      title,
      niche,
      nicheLabel: nicheLabel || 'Geral',
      targetAudience: targetAudience || 'Pessoas buscando solução rápida',
      painPointTargeted: painPointTargeted || 'Resolver problema urgente com suporte',
      checkoutUrl: checkoutUrl.trim() || undefined,
      whatsappNumber: whatsappNumber.trim() || '5541998778348',
      price: parseFloat(price) || 97.0,
      status: 'active',
      createdAt: new Date().toISOString(),
      antiBanOrganicMode: true,
      platforms: ['tiktok', 'pinterest', 'instagram', 'whatsapp'],
      impressions: 120,
      clicks: 14,
      conversions: 1,
      revenue: parseFloat(price) || 97.0,
    };

    onAddCampaign(newCamp);
    setIsCreating(false);
    // Reset
    setTitle('');
    setCheckoutUrl('');
    setWhatsappNumber('5541998778348');
    setPainPointTargeted('');
  };

  const copySmartLink = (id: string) => {
    const link = `${window.location.origin}/?camp=${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/40 text-xs font-semibold">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Gerenciador de Campanhas & Produtos</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Divulgue Qualquer Nicho: Inglês, Psicopedagogia, Emagrecedor e Mais
            </h2>
            <p className="text-xs text-slate-400">
              Cadastre produtos digitais ou físicos. O link de checkout e o número de WhatsApp são 100% opcionais e flexíveis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onResetAllMetrics && (
              <button
                onClick={onResetAllMetrics}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition"
                title="Zerar todos os números de exemplo e iniciar no modo 100% real"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Zerar Métricas para Modo Real (R$ 0,00)</span>
              </button>
            )}

            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-lg shadow-emerald-600/30 transition transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Produto / Campanha</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal / Form Create */}
      {isCreating && (
        <div className="bg-slate-900 border border-indigo-800/60 rounded-2xl p-6 shadow-2xl relative">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              Cadastrar Nova Oferta para Venda Orgânica
            </h3>
            <button
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nome do Produto / Oferta *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Curso de Memorização de Inglês em 30 Dias"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nicho de Atuação
                </label>
                <select
                  value={niche}
                  onChange={(e) => {
                    setNiche(e.target.value as NicheType);
                    const labels: Record<string, string> = {
                      ingles: 'Inglês & Idiomas',
                      psicopedagogia: 'Psicopedagogia & TDAH',
                      emagrecedor: 'Emagrecimento & Detox',
                      renda_extra: 'Renda Extra & Afiliados',
                      artesanato: 'Artesanato & Confeitaria',
                      marketing: 'Marketing Digital',
                      outro: 'Outro Nicho',
                    };
                    setNicheLabel(labels[e.target.value] || 'Geral');
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="psicopedagogia">Psicopedagogia & TDAH</option>
                  <option value="ingles">Inglês & Idiomas</option>
                  <option value="emagrecedor">Emagrecedor & Saúde</option>
                  <option value="renda_extra">Renda Extra Familiar</option>
                  <option value="artesanato">Artesanato & Confeitaria</option>
                  <option value="marketing">Marketing Digital</option>
                  <option value="outro">Outro Nicho</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Público Alvo (Quem vai comprar)
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Ex: Mães de crianças de 5 a 10 anos, adultos sem tempo..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Preço do Produto (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Link de Checkout (Opcional)
                </label>
                <input
                  type="url"
                  value={checkoutUrl}
                  onChange={(e) => setCheckoutUrl(e.target.value)}
                  placeholder="Ex: https://pay.hotmart.com/... ou Kiwify, Eduzz, Stripe"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Número de WhatsApp com DDD (Opcional)
                </label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="Ex: 5541998778348"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Maior Dor que o Produto Resolve
                </label>
                <input
                  type="text"
                  value={painPointTargeted}
                  onChange={(e) => setPainPointTargeted(e.target.value)}
                  placeholder="Ex: Não saber como ensinar a criança em casa sem estresse"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
              >
                Salvar e Ativar Robô Orgânico
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                  {camp.nicheLabel}
                </span>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    camp.status === 'active'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {camp.status === 'active' ? 'Ativo 24/7' : 'Pausado'}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white line-clamp-1">{camp.title}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Dor tratada: <em>"{camp.painPointTargeted}"</em>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Cliques</span>
                  <strong className="text-white font-bold">{camp.clicks}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Vendas</span>
                  <strong className="text-emerald-400 font-bold">{camp.conversions}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Renda</span>
                  <strong className="text-white font-bold">R$ {camp.revenue.toFixed(0)}</strong>
                </div>
              </div>

              {/* Integrations summary */}
              <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                {camp.whatsappNumber && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Integrado (+{camp.whatsappNumber})</span>
                  </div>
                )}
                {camp.checkoutUrl && (
                  <div className="flex items-center gap-1.5 text-[11px] text-indigo-300">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Checkout R$ {camp.price.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPreviewBridge(camp)}
                  className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow transition flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver Página do Lead</span>
                </button>

                <button
                  onClick={() => copySmartLink(camp.id)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  title="Copiar Link para Bio do TikTok/Pinterest"
                >
                  {copiedId === camp.id ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => onToggleStatus(camp.id)}
                  className="py-1 text-[11px] text-slate-400 hover:text-slate-200 transition flex items-center gap-1"
                >
                  {camp.status === 'active' ? (
                    <>
                      <Pause className="w-3 h-3" /> Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 text-emerald-400" /> Reativar
                    </>
                  )}
                </button>

                {onDeleteCampaign && (
                  <button
                    onClick={() => onDeleteCampaign(camp.id)}
                    className="py-1 text-[11px] text-rose-400/80 hover:text-rose-300 transition flex items-center gap-1"
                    title="Excluir esta campanha de demonstração"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Excluir</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
