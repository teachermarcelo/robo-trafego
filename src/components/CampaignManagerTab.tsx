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
  Edit3,
  Save,
  X,
} from 'lucide-react';
import { Campaign, NicheType } from '../types';

interface CampaignManagerTabProps {
  campaigns: Campaign[];
  onAddCampaign: (newCampaign: Campaign) => void;
  onUpdateCampaign?: (updatedCampaign: Campaign) => void;
  onToggleStatus: (id: string) => void;
  onPreviewBridge: (campaign: Campaign) => void;
  onDeleteCampaign?: (id: string) => void;
  onResetAllMetrics?: () => void;
}

export const CampaignManagerTab: React.FC<CampaignManagerTabProps> = ({
  campaigns,
  onAddCampaign,
  onUpdateCampaign,
  onToggleStatus,
  onPreviewBridge,
  onDeleteCampaign,
  onResetAllMetrics,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Editing state for modal
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCheckoutUrl, setEditCheckoutUrl] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editPainPoint, setEditPainPoint] = useState('');
  const [editNicheLabel, setEditNicheLabel] = useState('');

  const openEditModal = (camp: Campaign) => {
    setEditingCampaign(camp);
    setEditTitle(camp.title);
    setEditPrice(camp.price.toString());
    setEditCheckoutUrl(camp.checkoutUrl || '');
    setEditWhatsapp(camp.whatsappNumber || '5541998778348');
    setEditPainPoint(camp.painPointTargeted);
    setEditNicheLabel(camp.nicheLabel || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;

    const parsedPrice = parseFloat(editPrice) || editingCampaign.price;
    const updated: Campaign = {
      ...editingCampaign,
      title: editTitle.trim() || editingCampaign.title,
      price: parsedPrice,
      checkoutUrl: editCheckoutUrl.trim() || undefined,
      whatsappNumber: editWhatsapp.trim() || undefined,
      painPointTargeted: editPainPoint.trim() || editingCampaign.painPointTargeted,
      nicheLabel: editNicheLabel.trim() || editingCampaign.nicheLabel,
    };

    if (onUpdateCampaign) {
      onUpdateCampaign(updated);
    }
    setEditingCampaign(null);
  };

  // Form states for creation
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

              <div className="flex items-center justify-between pt-1 gap-2">
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

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(camp)}
                    className="py-1 px-2.5 rounded-lg bg-amber-950/60 border border-amber-800/50 text-[11px] text-amber-300 hover:text-amber-200 hover:bg-amber-900/60 transition flex items-center gap-1.5 font-bold shadow"
                    title="Editar valores, escrita e links desta campanha"
                  >
                    <Edit3 className="w-3 h-3 text-amber-400" />
                    <span>Editar (R$)</span>
                  </button>

                  {onDeleteCampaign && (
                    <button
                      onClick={() => onDeleteCampaign(camp.id)}
                      className="py-1 text-[11px] text-rose-400/80 hover:text-rose-300 transition flex items-center gap-1"
                      title="Excluir esta campanha"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Excluir</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Campaign Modal */}
      {editingCampaign && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-700/50 text-amber-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Editar Campanha & Valores</h3>
                  <p className="text-xs text-slate-400">Altere o preço, escrita e links de checkout</p>
                </div>
              </div>
              <button
                onClick={() => setEditingCampaign(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Product Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Título do Produto / Escrita:</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Price & Niche Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Valor / Preço de Venda (R$):</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="9.90"
                    className="w-full bg-slate-950 border border-amber-800/60 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Ex: 9.90 para R$ 9,90</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Etiqueta do Nicho / Categoria:</label>
                  <input
                    type="text"
                    value={editNicheLabel}
                    onChange={(e) => setEditNicheLabel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Pain Point Target */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Dor Tratada / Subtítulo Promocional:</label>
                <textarea
                  value={editPainPoint}
                  onChange={(e) => setEditPainPoint(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Checkout URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Link da Página de Pagamento (Hotmart ou Eduzz):</span>
                </label>
                <input
                  type="url"
                  value={editCheckoutUrl}
                  onChange={(e) => setEditCheckoutUrl(e.target.value)}
                  placeholder="https://pay.hotmart.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-400"
                />
              </div>

              {/* WhatsApp */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp de Suporte (com DDI e DDD):</span>
                </label>
                <input
                  type="text"
                  value={editWhatsapp}
                  onChange={(e) => setEditWhatsapp(e.target.value)}
                  placeholder="5541998778348"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCampaign(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition cursor-pointer"
                >
                  <Save className="w-4 h-4 text-slate-950" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
