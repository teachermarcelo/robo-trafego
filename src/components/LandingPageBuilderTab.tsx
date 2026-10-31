import React, { useState, useRef } from 'react';
import {
  LayoutTemplate,
  Save,
  CheckCircle2,
  ExternalLink,
  Copy,
  Smartphone,
  Monitor,
  Sparkles,
  Eye,
  DollarSign,
  MessageSquare,
  Lock,
  ArrowRight,
  Heart,
  BookOpen,
  Star,
  ShieldCheck,
  Check,
  HelpCircle,
  Plus,
  RefreshCw,
  Image as ImageIcon,
  Upload,
  FolderOpen,
  Trash2,
} from 'lucide-react';
import { Campaign } from '../types';
import { saveLandingPageSettingsToFirebase } from '../lib/firebase';
import { getCampaignSlug } from '../utils/campaignSlug';

interface LandingPageBuilderTabProps {
  campaigns: Campaign[];
  onUpdateCampaign: (updatedCampaign: Campaign) => void;
  onPreviewBridge: (campaign: Campaign) => void;
}

export const LandingPageBuilderTab: React.FC<LandingPageBuilderTabProps> = ({
  campaigns,
  onUpdateCampaign,
  onPreviewBridge,
}) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    campaigns[0]?.id || 'camp-tarefinhas-autismo'
  );
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const activeCamp =
    campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];

  // Editable form state for active campaign
  const [title, setTitle] = useState(activeCamp?.title || '');
  const [headline, setHeadline] = useState(
    activeCamp?.headline ||
      (activeCamp?.id === 'camp-tarefinhas-autismo'
        ? 'Caderno Digital com + 100 Atividades em PDF Prontas para Imprimir'
        : 'Aprenda a Gerar Renda Extra Todos os Meses com Milhas')
  );
  const [subheadline, setSubheadline] = useState(
    activeCamp?.subheadline ||
      activeCamp?.painPointTargeted ||
      'Desenvolvido para estimular a coordenação motora, linguagem, foco e cognição de crianças com TEA ou TDAH.'
  );
  const [price, setPrice] = useState(
    activeCamp?.price?.toString() || '9.90'
  );
  const [oldPrice, setOldPrice] = useState(
    activeCamp?.oldPrice?.toString() || '47.00'
  );
  const [checkoutUrl, setCheckoutUrl] = useState(
    activeCamp?.checkoutUrl || 'https://pay.hotmart.com/U95248783T'
  );
  const [whatsappNumber, setWhatsappNumber] = useState(
    activeCamp?.whatsappNumber || '5541998778348'
  );
  const [badgeText, setBadgeText] = useState(
    activeCamp?.badgeText ||
      'PROMOÇÃO EXCLUSIVA HOTMART • ARQUIVOS EM PDF PRONTOS PARA IMPRIMIR'
  );
  const [ctaText, setCtaText] = useState(
    activeCamp?.ctaText ||
      (activeCamp?.id === 'camp-tarefinhas-autismo'
        ? 'QUERO BAIXAR AS 100 TAREFINHAS AGORA'
        : 'QUERO ENTRAR NA COMUNIDADE AGORA')
  );
  const [guaranteeDays, setGuaranteeDays] = useState(
    activeCamp?.guaranteeDays?.toString() || '7'
  );
  const [imageUrl, setImageUrl] = useState(
    activeCamp?.imageUrl ||
      (activeCamp?.id === 'camp-tarefinhas-autismo'
        ? '/assets/aistudio/image_e9e67204.png'
        : '')
  );

  // File upload state for PC images
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, JPEG ou WEBP).');
      return;
    }

    setUploadLoading(true);
    setUploadFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        // Optimize and compress to keep Firestore document compact and fast
        const maxDim = 900;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setImageUrl(compressedDataUrl);
        } else {
          setImageUrl(rawDataUrl);
        }
        setUploadLoading(false);
      };
      img.onerror = () => {
        setImageUrl(rawDataUrl);
        setUploadLoading(false);
      };
      img.src = rawDataUrl;
    };
    reader.onerror = () => {
      setUploadLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // When switching campaign, reload state
  const handleSelectCampaign = (id: string) => {
    setSelectedCampaignId(id);
    setUploadFileName(null);
    const c = campaigns.find((camp) => camp.id === id);
    if (c) {
      setTitle(c.title);
      setHeadline(
        c.headline ||
          (c.id === 'camp-tarefinhas-autismo'
            ? 'Caderno Digital com + 100 Atividades em PDF Prontas para Imprimir'
            : c.title)
      );
      setSubheadline(c.subheadline || c.painPointTargeted);
      setPrice(c.price.toString());
      setOldPrice(c.oldPrice ? c.oldPrice.toString() : '47.00');
      setCheckoutUrl(c.checkoutUrl || '');
      setWhatsappNumber(c.whatsappNumber || '5541998778348');
      setBadgeText(
        c.badgeText || 'PROMOÇÃO EXCLUSIVA • ACESSO IMEDIATO'
      );
      setCtaText(
        c.ctaText ||
          (c.id === 'camp-tarefinhas-autismo'
            ? 'QUERO BAIXAR AS 100 TAREFINHAS AGORA'
            : 'QUERO COMEÇAR AGORA')
      );
      setGuaranteeDays(c.guaranteeDays ? c.guaranteeDays.toString() : '7');
      setImageUrl(c.imageUrl || (c.id === 'camp-tarefinhas-autismo' ? '/assets/aistudio/image_e9e67204.png' : ''));
    }
  };

  const handleSaveLandingPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCamp) return;

    const parsedPrice = parseFloat(price.replace(',', '.')) || activeCamp.price;
    const parsedOldPrice = parseFloat(oldPrice.replace(',', '.')) || 47.0;
    const parsedGuarantee = parseInt(guaranteeDays, 10) || 7;

    const updated: Campaign = {
      ...activeCamp,
      title: title.trim() || activeCamp.title,
      price: parsedPrice,
      oldPrice: parsedOldPrice,
      headline: headline.trim(),
      subheadline: subheadline.trim(),
      checkoutUrl: checkoutUrl.trim() || undefined,
      whatsappNumber: whatsappNumber.trim() || '5541998778348',
      badgeText: badgeText.trim(),
      ctaText: ctaText.trim(),
      guaranteeDays: parsedGuarantee,
      imageUrl: imageUrl.trim() || undefined,
    };

    onUpdateCampaign(updated);
    saveLandingPageSettingsToFirebase({
      campaignId: updated.id,
      title: updated.title,
      price: updated.price,
      oldPrice: updated.oldPrice,
      headline: updated.headline,
      subheadline: updated.subheadline,
      checkoutUrl: updated.checkoutUrl,
      whatsappNumber: updated.whatsappNumber,
      badgeText: updated.badgeText,
      ctaText: updated.ctaText,
      guaranteeDays: updated.guaranteeDays,
      imageUrl: updated.imageUrl,
    }).catch(console.warn);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const currentSlug = activeCamp ? getCampaignSlug(activeCamp) : 'tarefinhas';
  const publicLandingUrl = `${window.location.origin}/?p=${currentSlug}`;

  const copyLandingLink = () => {
    navigator.clipboard.writeText(publicLandingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const parsedCurrentPrice = parseFloat(price.replace(',', '.')) || 9.9;
  const isTarefinhas =
    activeCamp?.id === 'camp-tarefinhas-autismo' ||
    title.toLowerCase().includes('tarefinha');

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/50 border border-emerald-800/40 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-600/40 text-emerald-300 text-xs font-semibold mb-2">
            <LayoutTemplate className="w-3.5 h-3.5 text-emerald-400" />
            <span>Criador & Editor Visual de Landing Page</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Personalize a Página de Vendas do Seu Produto
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Edite valores, chamadas, promessas, links de checkout (Hotmart/Eduzz) e WhatsApp de suporte em tempo real com pré-visualização ao vivo.
          </p>
        </div>

        {/* Quick Links and Share */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={copyLandingLink}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Link Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copiar Link da Página</span>
              </>
            )}
          </button>

          <a
            href={publicLandingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-emerald-500/20 transition"
          >
            <Eye className="w-4 h-4" />
            <span>Abrir Página Real</span>
          </a>
        </div>
      </div>

      {/* Main Grid: Left Editor Form, Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: 7 Columns */}
        <div className="lg:col-span-7 space-y-6">
          {/* Select Campaign Card */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              1. Selecionar Produto / Campanha para Editar:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {campaigns.map((camp) => (
                <button
                  key={camp.id}
                  type="button"
                  onClick={() => handleSelectCampaign(camp.id)}
                  className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                    selectedCampaignId === camp.id
                      ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-md'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="truncate mr-2">
                    <p className="font-bold text-xs sm:text-sm truncate">
                      {camp.title}
                    </p>
                    <p className="text-[11px] text-emerald-400 font-semibold">
                      Preço Atual: R$ {camp.price.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  {selectedCampaignId === camp.id && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Box: Link Individual do Produto Selecionado */}
            <div className="mt-3 p-3.5 bg-slate-950 border border-emerald-900/60 rounded-xl space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  Link Individual da sua Página ({activeCamp?.title}):
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-mono font-bold">
                  /?p={currentSlug}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicLandingUrl}
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 font-mono text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={copyLandingLink}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
                </button>
                <a
                  href={publicLandingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 shrink-0"
                  title="Abrir página individual em nova aba"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ver Página</span>
                </a>
              </div>
              <p className="text-[11px] text-slate-400">
                🚀 Cada criação tem seu próprio link exclusivo. Quem abrir esse link verá exatamente <strong>{title || activeCamp?.title}</strong>, a capa do produto que você enviou do seu computador e o preço de <strong>R$ {parsedCurrentPrice.toFixed(2).replace('.', ',')}</strong>!
              </p>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSaveLandingPage}
            className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-6"
          >
            {/* Section: Pricing & Checkout */}
            <div className="space-y-4 border-b border-slate-800 pb-6">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <DollarSign className="w-4 h-4" />
                <span>Preços, Pagamento e Checkout</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Preço Final Promocional (R$):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">
                      R$
                    </span>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="9,90"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-emerald-600/60 rounded-xl text-white text-base font-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <span className="text-[11px] text-emerald-400 mt-1 block">
                    Esse é o valor exato que o visitante vê e paga na Hotmart.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Preço Riscado Anterior (De R$):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">
                      R$
                    </span>
                    <input
                      type="text"
                      value={oldPrice}
                      onChange={(e) => setOldPrice(e.target.value)}
                      placeholder="47,00"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-300 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Gera sensação de urgência e ancoragem de desconto.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Link da Página de Pagamento (Hotmart / Eduzz):
                </label>
                <input
                  type="url"
                  value={checkoutUrl}
                  onChange={(e) => setCheckoutUrl(e.target.value)}
                  placeholder="https://pay.hotmart.com/..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    WhatsApp para Tirar Dúvidas dos Leads:
                  </label>
                  <div className="relative">
                    <MessageSquare className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="5541998778348"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Garantia Incondicional (Dias):
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      value={guaranteeDays}
                      onChange={(e) => setGuaranteeDays(e.target.value)}
                      placeholder="7"
                      min={1}
                      max={90}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Headline & Texts */}
            <div className="space-y-4 border-b border-slate-800 pb-6">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Textos da Página & Promessa</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título Principal (Headline de Impacto):
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Caderno Digital com + 100 Atividades em PDF Prontas para Imprimir"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subtítulo / Descrição da Dor que Resolve:
                </label>
                <textarea
                  rows={3}
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value)}
                  placeholder="Explique como o material resolve a dor da cliente de forma rápida e prática..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Faixa de Destaque Superior (Aviso Chamativo):
                </label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="PROMOÇÃO EXCLUSIVA HOTMART • PDF PRONTO PARA IMPRIMIR"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Texto do Botão Principal de Compra:
                </label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="QUERO BAIXAR AS 100 TAREFINHAS AGORA"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-emerald-400 font-black text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Section: Capa e Mídia (Upload Direto do PC) */}
            <div className="space-y-4 border-b border-slate-800 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
                  <ImageIcon className="w-4 h-4" />
                  <span>Imagem de Capa do Produto</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-pink-950/80 border border-pink-700/50 text-pink-300 font-medium">
                  Upload Direto do PC
                </span>
              </div>

              {/* Hidden Native File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Upload Dropzone / Button */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 group ${
                  isDragging
                    ? 'border-emerald-400 bg-emerald-950/40 scale-[1.01]'
                    : 'border-slate-700 hover:border-emerald-500/80 bg-slate-950/70 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
                    {uploadLoading ? (
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm font-bold text-white">
                      {uploadLoading
                        ? 'Otimizando e carregando imagem...'
                        : 'Clique para escolher uma imagem do seu computador'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      ou arraste o arquivo baixado (PNG, JPG, WEBP) para cá
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="mt-1 px-4 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-xs font-bold rounded-lg border border-emerald-500/40 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Procurar Arquivo no PC</span>
                  </button>
                </div>
              </div>

              {/* Active Image Preview & Action Controls */}
              {imageUrl ? (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-emerald-500/40 bg-slate-900 shrink-0 shadow">
                      <img
                        src={imageUrl}
                        alt="Capa Ativa"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-xs font-bold text-emerald-300">
                          {uploadFileName ? 'Foto do Computador Pronta' : 'Capa Ativa na Página'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate font-mono">
                        {uploadFileName || (imageUrl.startsWith('data:') ? 'Imagem carregada localmente' : imageUrl)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white text-[11px] font-medium transition flex items-center gap-1 cursor-pointer"
                      title="Trocar por outro arquivo do computador"
                    >
                      <Upload className="w-3 h-3 text-emerald-400" />
                      <span className="hidden sm:inline">Trocar</span>
                    </button>
                    {isTarefinhas && (
                      <button
                        type="button"
                        onClick={() => {
                          setImageUrl('/assets/aistudio/image_e9e67204.png');
                          setUploadFileName(null);
                        }}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-emerald-300 text-[11px] font-medium transition cursor-pointer"
                        title="Restaurar a capa oficial cadastrada na Hotmart"
                      >
                        Restaurar Padrão
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('');
                        setUploadFileName(null);
                      }}
                      className="p-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 rounded-lg text-red-400 hover:text-red-300 transition cursor-pointer"
                      title="Remover capa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-950/60 border border-dashed border-slate-800 rounded-xl text-center">
                  <span className="text-xs text-slate-400">
                    Nenhuma imagem selecionada no momento.
                  </span>
                  {isTarefinhas && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('/assets/aistudio/image_e9e67204.png')}
                      className="ml-2 text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
                    >
                      Usar Capa Padrão Hotmart
                    </button>
                  )}
                </div>
              )}

              {/* Advanced / Manual URL field (Collapsible) */}
              <details className="group text-xs text-slate-400">
                <summary className="cursor-pointer hover:text-slate-300 list-none flex items-center gap-1 select-none">
                  <span className="text-[10px] text-slate-500 group-open:rotate-90 transition-transform inline-block">▶</span>
                  <span>Opções avançadas (digitar URL ou caminho manualmente)</span>
                </summary>
                <div className="pt-2 pl-3 space-y-1.5">
                  <input
                    type="text"
                    value={imageUrl.startsWith('data:') ? '(Imagem codificada em Base64 do seu computador)' : imageUrl}
                    onChange={(e) => {
                      if (!e.target.value.startsWith('(')) {
                        setImageUrl(e.target.value);
                      }
                    }}
                    placeholder="/assets/aistudio/image_e9e67204.png ou https://..."
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    Capa oficial cadastrada na Hotmart: <code className="text-emerald-400 font-mono">/assets/aistudio/image_e9e67204.png</code>
                  </span>
                </div>
              </details>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-sm rounded-xl shadow-xl shadow-emerald-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Alterações na Landing Page</span>
              </button>

              {savedSuccess && (
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold animate-pulse">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Página atualizada com sucesso! Preço ajustado para R$ {parsedCurrentPrice.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Right: Live Preview Box: 5 Columns */}
        <div className="lg:col-span-5 space-y-4 sticky top-24">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Prévia em Tempo Real
              </span>
            </div>

            {/* Mobile / Desktop Toggle */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                  previewDevice === 'mobile'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Celular</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                  previewDevice === 'desktop'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
            </div>
          </div>

          {/* Preview Device Wrapper */}
          <div
            className={`mx-auto bg-slate-950 border-4 border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all ${
              previewDevice === 'mobile' ? 'max-w-sm' : 'max-w-full'
            }`}
          >
            {/* Mock Browser URL Bar */}
            <div className="bg-slate-900 px-3 py-2 border-b border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
              <div className="ml-2 flex-1 bg-slate-950 px-2 py-0.5 rounded text-[10px] text-slate-300 truncate font-mono">
                robo-trafego.vercel.app/?p={currentSlug}
              </div>
            </div>

            {/* Simulated Landing Page View */}
            <div className="p-4 space-y-4 max-h-[580px] overflow-y-auto text-center font-sans selection:bg-emerald-500">
              {/* Top Banner */}
              <div className="bg-emerald-600 text-slate-950 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider">
                {badgeText || 'PROMOÇÃO EXCLUSIVA'}
              </div>

              {/* Tag */}
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-700/50 text-emerald-300 text-[10px] font-bold">
                <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
                <span>Educação Infantil & Autismo (TEA)</span>
              </div>

              {/* Headline */}
              <h3 className="text-sm sm:text-base font-black text-white leading-snug">
                {headline || title}
              </h3>

              {/* Subheadline */}
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {subheadline}
              </p>

              {/* Product Cover Image Preview */}
              {imageUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 shadow-lg max-w-xs mx-auto">
                  <img
                    src={imageUrl}
                    alt="Capa do Produto"
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/90 text-white text-[10px] font-bold rounded flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-emerald-400" />
                    <span>eBook em PDF</span>
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500 text-slate-950 text-[9px] font-black rounded-full uppercase">
                    Vendas Ativas
                  </div>
                </div>
              )}

              {/* Social Proof */}
              <div className="flex items-center justify-center gap-1 text-[11px] text-amber-400 font-bold">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400" />
                  ))}
                </div>
                <span className="text-white ml-1">4.9/5</span>
                <span className="text-slate-400">• + 890 avaliações</span>
              </div>

              {/* Checkout Offer Card */}
              <div className="p-4 bg-slate-900 border border-emerald-800/60 rounded-2xl space-y-3 shadow-xl">
                <div>
                  <span className="text-[11px] text-slate-400 line-through">
                    De R$ {oldPrice}
                  </span>
                  <div className="text-3xl font-black text-emerald-400">
                    R$ {parsedCurrentPrice.toFixed(2).replace('.', ',')}
                  </div>
                  <span className="text-[10px] text-slate-300 block">
                    Pagamento único via Pix ou Cartão • Acesso imediato no e-mail
                  </span>
                </div>

                {/* Primary CTA */}
                <button
                  type="button"
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-950" />
                  <span className="truncate">{ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                </button>

                {/* WhatsApp button */}
                <button
                  type="button"
                  className="w-full py-2 px-3 bg-emerald-950 border border-emerald-700/60 text-emerald-300 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate">Tirar Dúvidas no WhatsApp: (41) 99877-8348</span>
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Garantia de {guaranteeDays} Dias
                  </span>
                  <span>•</span>
                  <span>Checkout Seguro Hotmart</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
