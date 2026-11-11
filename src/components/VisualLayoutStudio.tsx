import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Smartphone,
  Share2,
  Copy,
  Download,
  Send,
  Check,
  Palette,
  Layers,
  Zap,
  Target,
  Clock,
  Link as LinkIcon,
  Star,
  ShieldCheck,
  CheckCircle2,
  Instagram,
  Eye,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Campaign, InstagramLayoutTemplate, InstagramStoryItem } from '../types';

interface VisualLayoutStudioProps {
  campaigns: Campaign[];
  activeCampaignId?: string;
  onSendToInstagramQueue?: (item: InstagramStoryItem) => void;
  onNavigateTab?: (tab: string) => void;
}

export const VisualLayoutStudio: React.FC<VisualLayoutStudioProps> = ({
  campaigns,
  activeCampaignId,
  onSendToInstagramQueue,
  onNavigateTab,
}) => {
  const currentCampaign = campaigns.find(c => c.id === activeCampaignId) || campaigns[0] || {
    id: 'camp-tarefinhas',
    title: 'Caderno de Atividades de Coordenação Motora (+100 Tarefinhas)',
    price: 9.90,
    oldPrice: 81.40,
    checkoutUrl: 'https://pay.kiwify.com.br/HE5xbnp',
    imageUrl: '/assets/aistudio/image_e9e67204.png',
    nicheLabel: 'Pedagogia & Mães',
  };

  // Selected aspect ratio
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '1:1' | '4:5' | '2:3' | '16:9'>('9:16');

  // Selected Campaign
  const [selectedCampId, setSelectedCampId] = useState<string>(currentCampaign.id);
  const selectedCamp = campaigns.find(c => c.id === selectedCampId) || currentCampaign;

  // Visual Editor State
  const [headline, setHeadline] = useState<string>('POSTE OFERTAS NOS STORIES!');
  const [subheadline, setSubheadline] = useState<string>('O robô posta no automático com link convertido e vende todos os dias sem gastar com anúncios');
  const [badgeText, setBadgeText] = useState<string>('🔥 OFERTA OFICIAL KIWIFY & PIX');
  const [price, setPrice] = useState<number>(selectedCamp.price || 9.90);
  const [oldPrice, setOldPrice] = useState<number>(selectedCamp.oldPrice || 81.40);
  const [stickerText, setStickerText] = useState<string>('👉 TOQUE AQUI P/ COMPRAR');
  const [stickerUrl, setStickerUrl] = useState<string>(selectedCamp.checkoutUrl || 'https://pay.kiwify.com.br/');
  const [ctaText, setCtaText] = useState<string>('QUERO COMEÇAR AGORA');
  const [selectedBgTheme, setSelectedBgTheme] = useState<string>('instagram_gradient');
  const [showPillars, setShowPillars] = useState<boolean>(true);
  const [showBottomBanner, setShowBottomBanner] = useState<boolean>(true);
  const [showTrustBadges, setShowTrustBadges] = useState<boolean>(true);
  const [customImageUrl, setCustomImageUrl] = useState<string>(selectedCamp.imageUrl || '/assets/aistudio/image_e9e67204.png');

  // Copy feedback
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);
  const [dispatchedSuccess, setDispatchedSuccess] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  const previewFrameRef = useRef<HTMLDivElement>(null);

  // Background Theme Presets
  const themes: Record<string, { name: string; bgClass: string; textClass: string; accentColor: string }> = {
    instagram_gradient: {
      name: 'Gradiente Instagram (Oficial)',
      bgClass: 'bg-gradient-to-br from-amber-500 via-rose-600 to-purple-800',
      textClass: 'text-white',
      accentColor: '#f43f5e'
    },
    dark_luxury: {
      name: 'Dark Cyber Luxury (Neon)',
      bgClass: 'bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 border border-indigo-900/60',
      textClass: 'text-white',
      accentColor: '#10b981'
    },
    emerald_conversion: {
      name: 'Verde Conversão Pix (Alta Renda)',
      bgClass: 'bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-900 border border-emerald-500/40',
      textClass: 'text-white',
      accentColor: '#10b981'
    },
    warm_amber: {
      name: 'Sunset Dourado (Ofertas Quentes)',
      bgClass: 'bg-gradient-to-br from-amber-700 via-orange-800 to-stone-900',
      textClass: 'text-white',
      accentColor: '#f59e0b'
    },
    clean_pastel: {
      name: 'Rosa & Lilás (Infantil / Pedagogia)',
      bgClass: 'bg-gradient-to-b from-purple-900 via-slate-900 to-rose-950',
      textClass: 'text-white',
      accentColor: '#ec4899'
    }
  };

  // Pre-configured conversion templates
  const applyTemplate = (tplKey: string) => {
    if (tplKey === 'stories_user_photo') {
      // Inspired directly by the user's uploaded images (image_5456885b & image_d6e91a85)
      setHeadline('POSTE OFERTAS NOS STORIES!');
      setSubheadline('Postagens 100% automáticas com link convertido que vende por você!');
      setBadgeText('🔥 AUTOMAÇÃO INSTAGRAM 24/7');
      setShowPillars(true);
      setShowBottomBanner(true);
      setShowTrustBadges(true);
      setSelectedBgTheme('instagram_gradient');
      setStickerText('👉 TOQUE AQUI P/ COMPRAR');
      setCtaText('QUERO COMEÇAR AGORA');
    } else if (tplKey === 'tarefinhas') {
      const camp = campaigns.find(c => c.id.includes('tarefinhas')) || selectedCamp;
      setHeadline('Caderno de Atividades de Coordenação Motora (+100 Tarefinhas)');
      setSubheadline('Material em PDF pronto para imprimir. Alivia o estresse e desenvolve a escrita da criança sem telas.');
      setBadgeText('⭐ 78 PÁGINAS EM PDF • ARQUIVO DIGITAL');
      setPrice(9.90);
      setOldPrice(81.40);
      setShowPillars(false);
      setShowBottomBanner(true);
      setShowTrustBadges(true);
      setSelectedBgTheme('clean_pastel');
      setStickerText('🔗 BAIXAR CADERNO (R$ 9,90)');
      setCtaText('QUERO BAIXAR O CADERNO');
      if (camp.imageUrl) setCustomImageUrl(camp.imageUrl);
      if (camp.checkoutUrl) setStickerUrl(camp.checkoutUrl);
    } else if (tplKey === 'ecom_club') {
      const camp = campaigns.find(c => c.id.includes('ecom') || c.id.includes('loja')) || selectedCamp;
      setHeadline('Ganhe Uma Loja Profissional Pronta e Lucre de R$ 700 a R$ 1.100');
      setSubheadline('Sem estoque e sem programação. 20 produtos testados e fornecedores inclusos com reunião ao vivo.');
      setBadgeText('🚀 E-COMMERCE NICHADO PRONTO');
      setPrice(37.00);
      setOldPrice(97.00);
      setShowPillars(true);
      setShowBottomBanner(true);
      setShowTrustBadges(true);
      setSelectedBgTheme('dark_luxury');
      setStickerText('👉 LIBERAR MINHA LOJA (R$ 37)');
      setCtaText('QUERO MINHA LOJA PRONTA');
      if (camp.imageUrl) setCustomImageUrl(camp.imageUrl);
      if (camp.checkoutUrl) setStickerUrl(camp.checkoutUrl);
    } else if (tplKey === 'milhas') {
      const camp = campaigns.find(c => c.id.includes('milhas')) || selectedCamp;
      setHeadline('Aprenda a Gerar Renda Extra Todos os Meses com Milhas');
      setSubheadline('Grupo VIP de alertas lucrativos e estratégias práticas de compras bonificadas.');
      setBadgeText('💳 COMUNIDADE MILHAS 3.0');
      setPrice(97.00);
      setOldPrice(197.00);
      setShowPillars(false);
      setShowBottomBanner(true);
      setShowTrustBadges(true);
      setSelectedBgTheme('emerald_conversion');
      setStickerText('🔗 ENTRAR NO GRUPO VIP');
      setCtaText('GARANTIR MINHA VAGA NO PIX');
      if (camp.imageUrl) setCustomImageUrl(camp.imageUrl);
      if (camp.checkoutUrl) setStickerUrl(camp.checkoutUrl);
    }
  };

  // Switch active campaign and auto-fill values
  const handleSelectCampaign = (camp: Campaign) => {
    setSelectedCampId(camp.id);
    setPrice(camp.price || 9.90);
    setOldPrice(camp.oldPrice || (camp.price * 3));
    if (camp.checkoutUrl) setStickerUrl(camp.checkoutUrl);
    if (camp.imageUrl) setCustomImageUrl(camp.imageUrl);
    setHeadline(camp.headline || camp.title);
    if (camp.subheadline) setSubheadline(camp.subheadline);
  };

  // Generate persuasive caption for Instagram
  const generateCaption = () => {
    return `🔥 ${headline}

${subheadline}

✅ Acesso Imediato & 100% Seguro
✅ Preço Especial no Pix: Apenas R$ ${price.toFixed(2).replace('.', ',')} (De R$ ${oldPrice.toFixed(2).replace('.', ',')})
✅ Garantia Incondicional de 7 Dias

👉 TOQUE NO LINK DO STORY OU NO LINK DA BIO PARA ACESSAR AGORA:
${stickerUrl}

#rendaextra #vendasorganicas #instagramstories #kiwify #afiliados #marketingdigital #pedagogia #empreendedorismo`;
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(generateCaption());
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  // Send layout directly to Instagram Queue
  const handleSendToRobot = () => {
    const newItem: InstagramStoryItem = {
      id: `insta-${Date.now()}`,
      title: headline,
      mediaUrl: customImageUrl,
      mediaType: aspectRatio === '9:16' ? 'story_9_16' : 'feed_1_1',
      stickerText: stickerText,
      stickerUrl: stickerUrl,
      caption: generateCaption(),
      status: 'ready',
      viewsEstimated: Math.floor(Math.random() * 450) + 120,
      linkClicksEstimated: Math.floor(Math.random() * 45) + 12,
      salesEstimated: Math.floor(Math.random() * 3) + 1,
      targetCampaignId: selectedCamp.id,
      publishedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    if (onSendToInstagramQueue) {
      onSendToInstagramQueue(newItem);
    }

    setDispatchedSuccess(true);
    setTimeout(() => setDispatchedSuccess(false), 3000);
  };

  // Client-side high-res canvas rendering & PNG download
  const handleDownloadImage = () => {
    setDownloading(true);

    try {
      // Create off-screen canvas to render pristine high-res visual
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      const width = aspectRatio === '9:16' ? 1080 : aspectRatio === '1:1' ? 1080 : aspectRatio === '4:5' ? 1080 : 1200;
      const height = aspectRatio === '9:16' ? 1920 : aspectRatio === '1:1' ? 1080 : aspectRatio === '4:5' ? 1350 : 630;

      canvas.width = width;
      canvas.height = height;

      // Draw background gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      if (selectedBgTheme === 'instagram_gradient') {
        grad.addColorStop(0, '#f59e0b');
        grad.addColorStop(0.4, '#e11d48');
        grad.addColorStop(1, '#4c1d95');
      } else if (selectedBgTheme === 'dark_luxury') {
        grad.addColorStop(0, '#020617');
        grad.addColorStop(0.5, '#0f172a');
        grad.addColorStop(1, '#1e1b4b');
      } else if (selectedBgTheme === 'emerald_conversion') {
        grad.addColorStop(0, '#022c22');
        grad.addColorStop(0.5, '#0f172a');
        grad.addColorStop(1, '#134e4a');
      } else {
        grad.addColorStop(0, '#581c87');
        grad.addColorStop(0.6, '#0f172a');
        grad.addColorStop(1, '#831843');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Top Instagram Story header
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(badgeText, width / 2, 110);

      // Main Headline
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 52px sans-serif';
      const words = headline.split(' ');
      let line = '';
      let y = 220;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > width - 120 && n > 0) {
          ctx.fillText(line, width / 2, y);
          line = words[n] + ' ';
          y += 64;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, width / 2, y);

      // Draw simulated sticker
      y += 80;
      const stickerW = width - 160;
      const stickerH = 110;
      const stickerX = 80;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(stickerX, y, stickerW, stickerH, 32);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 40px sans-serif';
      ctx.fillText(`🔗 ${stickerText}`, width / 2, y + 68);

      // Price Tag Box
      y += stickerH + 60;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(width / 2 - 280, y, 560, 140, 24);
      ctx.fill();

      ctx.fillStyle = '#10b981';
      ctx.font = '900 64px sans-serif';
      ctx.fillText(`R$ ${price.toFixed(2).replace('.', ',')}`, width / 2, y + 80);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '28px sans-serif';
      ctx.fillText(`De R$ ${oldPrice.toFixed(2).replace('.', ',')} no Pix com liberação imediata`, width / 2, y + 120);

      // Bottom banner
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, height - 120, width, 120);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('🚀 POSTA COM LINK CONVERTIDO NO AUTOMÁTICO E VENDE MAIS!', width / 2, height - 50);

      // Trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `criativo-instagram-${selectedCamp.id}-${aspectRatio.replace(':', 'x')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('Seu navegador bloqueou o canvas local. Você pode tirar print ou usar o robô direto!');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-rose-950/70 border border-purple-800/40 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-900/40 text-white font-black text-xl">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Estúdio de Layouts &amp; Criativos Instagram
                </h2>
                <span className="bg-gradient-to-r from-rose-500 to-purple-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                  Stories com Link Clicável
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Crie o layout com link convertido exatamente como nos Stories, Feed e Pinterest e envie direto para o robô automático.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSendToRobot}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {dispatchedSuccess ? '✓ Enviado para Fila do Robô!' : 'Disparar no Instagram Automático'}
            </button>

            <button
              onClick={handleDownloadImage}
              disabled={downloading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-purple-400" />
              {downloading ? 'Gerando...' : 'Baixar Imagem (PNG)'}
            </button>
          </div>
        </div>

        {/* Templates Rápidos Inspirados nas Fotos do Usuário */}
        <div className="mt-5 pt-4 border-t border-purple-900/30 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-extrabold uppercase text-purple-300 flex items-center gap-1 flex-shrink-0 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Templates Prontos:
          </span>

          <button
            onClick={() => applyTemplate('stories_user_photo')}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-900/70 to-purple-900/70 hover:from-rose-800 hover:to-purple-800 text-white text-xs font-bold border border-rose-500/50 flex-shrink-0 transition cursor-pointer shadow-sm"
          >
            📸 Poste Ofertas nos Stories (3 Pilares)
          </button>

          <button
            onClick={() => applyTemplate('tarefinhas')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex-shrink-0 transition cursor-pointer"
          >
            📚 Caderno Tarefinhas (R$ 9,90)
          </button>

          <button
            onClick={() => applyTemplate('ecom_club')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex-shrink-0 transition cursor-pointer"
          >
            💼 Loja Pronta Ecom (R$ 37,00)
          </button>

          <button
            onClick={() => applyTemplate('milhas')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex-shrink-0 transition cursor-pointer"
          >
            💳 Renda com Milhas (R$ 97,00)
          </button>
        </div>
      </div>

      {/* Main Workspace: Left Controls / Right Live Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Layout Customizer */}
        <div className="lg:col-span-5 space-y-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Palette className="w-4 h-4 text-purple-400" />
            Personalizar Elementos do Layout
          </h3>

          {/* Formato / Aspect Ratio */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
              Formato / Proporção:
            </label>
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {[
                { id: '9:16', label: '📱 Story / Reels (9:16)' },
                { id: '1:1', label: '⏹️ Feed (1:1)' },
                { id: '4:5', label: '🖼️ Retrato (4:5)' },
                { id: '2:3', label: '📌 Pinterest (2:3)' },
                { id: '16:9', label: '🔵 Facebook (16:9)' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setAspectRatio(item.id as any)}
                  className={`p-2 rounded-xl text-[10px] font-bold border transition cursor-pointer flex flex-col items-center justify-center ${
                    aspectRatio === item.id
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-950'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Selecionar Produto / Campanha Base */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
              Campanha / Produto Base:
            </label>
            <select
              value={selectedCampId}
              onChange={(e) => {
                const camp = campaigns.find(c => c.id === e.target.value);
                if (camp) handleSelectCampaign(camp);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              {campaigns.map(camp => (
                <option key={camp.id} value={camp.id}>
                  {camp.title} — R$ {(camp.price || 9.90).toFixed(2).replace('.', ',')}
                </option>
              ))}
            </select>
          </div>

          {/* Headline & Subheadline */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
              Título Principal (Headline):
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              placeholder="Ex: POSTE OFERTAS NOS STORIES!"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
              Subtítulo / Descrição de Valor:
            </label>
            <textarea
              rows={2}
              value={subheadline}
              onChange={(e) => setSubheadline(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              placeholder="Explique o que a pessoa vai ganhar..."
            />
          </div>

          {/* Preço e Oferta */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-emerald-400 uppercase mb-1">
                Preço no Pix (R$):
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-emerald-600/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Preço Antigo / Risco (R$):
              </label>
              <input
                type="number"
                step="0.01"
                value={oldPrice}
                onChange={(e) => setOldPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
              />
            </div>
          </div>

          {/* Sticker de Link dos Stories Oficial */}
          <div className="bg-purple-950/40 border border-purple-800/40 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-purple-300 flex items-center gap-1.5 uppercase">
                <LinkIcon className="w-3.5 h-3.5 text-purple-400" />
                Figurinha / Sticker de Link (Stories):
              </label>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded font-extrabold">
                Link Clicável
              </span>
            </div>

            <div>
              <input
                type="text"
                value={stickerText}
                onChange={(e) => setStickerText(e.target.value)}
                placeholder="Texto da Figurinha (Ex: 👉 TOQUE P/ COMPRAR)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold mb-2 focus:outline-none focus:border-rose-500"
              />
              <input
                type="text"
                value={stickerUrl}
                onChange={(e) => setStickerUrl(e.target.value)}
                placeholder="URL de Checkout (Kiwify / Hotmart)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-[11px] text-blue-300 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Escolha do Tema de Fundo */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
              Paleta / Fundo Visual:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(themes).map(([key, t]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedBgTheme(key)}
                  className={`p-2 rounded-xl text-left text-xs font-semibold border transition cursor-pointer flex items-center gap-2 ${
                    selectedBgTheme === key
                      ? 'border-purple-400 bg-slate-800 text-white shadow-sm ring-1 ring-purple-500'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: t.accentColor }} />
                  <span className="truncate text-[11px]">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggles de Elementos Visuais */}
          <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
              <input
                type="checkbox"
                checked={showPillars}
                onChange={(e) => setShowPillars(e.target.checked)}
                className="rounded accent-purple-500"
              />
              <span>3 Pilares de Venda</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
              <input
                type="checkbox"
                checked={showBottomBanner}
                onChange={(e) => setShowBottomBanner(e.target.checked)}
                className="rounded accent-purple-500"
              />
              <span>Faixa Inferior de Conversão</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
              <input
                type="checkbox"
                checked={showTrustBadges}
                onChange={(e) => setShowTrustBadges(e.target.checked)}
                className="rounded accent-purple-500"
              />
              <span>Garantia &amp; Estrelas</span>
            </label>
          </div>

          {/* Copy Persuasiva Gerada com 1-Clique */}
          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-300 uppercase">
                Legenda Pronta com Link &amp; Hashtags:
              </span>
              <button
                onClick={handleCopyCaption}
                className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedCaption ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedCaption ? 'Copiado!' : 'Copiar Legenda'}
              </button>
            </div>
            <textarea
              readOnly
              rows={3}
              value={generateCaption()}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-[11px] text-slate-300 font-sans focus:outline-none select-all"
            />
          </div>
        </div>

        {/* Right Column: Live Mockup Canvas (Phone / Story / Feed Frame) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          {/* Top Canvas Bar */}
          <div className="w-full flex items-center justify-between mb-4 pb-2 border-b border-slate-800 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              <Eye className="w-4 h-4 text-purple-400" />
              Preview em Tempo Real • Proporção {aspectRatio}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400">
                Resolução Alta 1080p
              </span>
            </div>
          </div>

          {/* The Visual Canvas Frame */}
          <div
            ref={previewFrameRef}
            className={`relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between ${
              themes[selectedBgTheme]?.bgClass || themes.instagram_gradient.bgClass
            } ${
              aspectRatio === '9:16'
                ? 'w-[320px] sm:w-[350px] min-h-[580px] sm:min-h-[620px] p-4'
                : aspectRatio === '1:1'
                ? 'w-[320px] sm:w-[380px] h-[320px] sm:h-[380px] p-4'
                : aspectRatio === '4:5'
                ? 'w-[320px] sm:w-[360px] h-[400px] sm:h-[450px] p-4'
                : 'w-[340px] sm:w-[480px] min-h-[270px] p-4'
            }`}
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 25px rgba(225, 29, 72, 0.2)',
            }}
          >
            {/* Top Instagram Header / Story Sticker bar (Inspired by image_5456885b) */}
            <div className="space-y-2">
              <div className="bg-white/95 backdrop-blur-md text-slate-900 rounded-2xl p-3 shadow-lg border border-white/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
                    <Instagram className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[12px] font-black uppercase tracking-wider text-rose-600 block leading-tight">
                      INSTAGRAM
                    </span>
                    <strong className="text-[13px] font-extrabold text-slate-900 leading-tight block">
                      {headline}
                    </strong>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center p-0.5 flex-shrink-0 shadow">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  </div>
                </div>
              </div>

              {/* Subheadline Pill */}
              {subheadline && (
                <div className="bg-black/40 backdrop-blur-sm text-white text-[11px] font-medium p-2.5 rounded-xl border border-white/10 text-center">
                  {subheadline}
                </div>
              )}
            </div>

            {/* Middle Section: 3 Selling Pillars (Inspired by image_d6e91a85) */}
            {showPillars && (
              <div className="grid grid-cols-3 gap-2 my-2">
                <div className="bg-white/95 text-slate-900 rounded-xl p-2 text-center shadow border border-white/60">
                  <Clock className="w-4 h-4 text-orange-600 mx-auto mb-0.5" />
                  <span className="text-[9px] font-black block uppercase tracking-tight text-slate-900">
                    ECONOMIZE TEMPO
                  </span>
                  <span className="text-[8px] text-slate-600 block leading-tight">
                    Mais tempo livre para você!
                  </span>
                </div>

                <div className="bg-white/95 text-slate-900 rounded-xl p-2 text-center shadow border border-white/60">
                  <LinkIcon className="w-4 h-4 text-orange-600 mx-auto mb-0.5" />
                  <span className="text-[9px] font-black block uppercase tracking-tight text-slate-900">
                    LINKS CONVERTIDOS
                  </span>
                  <span className="text-[8px] text-slate-600 block leading-tight">
                    Links prontos que vendem!
                  </span>
                </div>

                <div className="bg-white/95 text-slate-900 rounded-xl p-2 text-center shadow border border-white/60">
                  <Zap className="w-4 h-4 text-orange-600 mx-auto mb-0.5" />
                  <span className="text-[9px] font-black block uppercase tracking-tight text-slate-900">
                    100% AUTOMÁTICO
                  </span>
                  <span className="text-[8px] text-slate-600 block leading-tight">
                    Robô trabalha 24h!
                  </span>
                </div>
              </div>
            )}

            {/* Product Image Mockup (If Available) */}
            {customImageUrl && (
              <div className="my-1.5 flex justify-center">
                <img
                  src={customImageUrl}
                  alt={selectedCamp.title}
                  className="max-h-[140px] rounded-xl object-contain shadow-2xl border-2 border-white/30"
                />
              </div>
            )}

            {/* Official Instagram Story Link Sticker (Interactive Look) */}
            <div className="my-2 flex justify-center">
              <a
                href={stickerUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-white text-slate-900 px-4 py-2 rounded-full shadow-2xl border-2 border-blue-400 font-black text-xs flex items-center gap-2 transform hover:scale-105 transition cursor-pointer select-none"
              >
                <span className="text-blue-500 font-black text-sm">🔗</span>
                <span className="text-slate-900 tracking-wide">{stickerText}</span>
              </a>
            </div>

            {/* Price Box & Stars */}
            <div className="bg-slate-950/80 backdrop-blur-md text-white rounded-2xl p-3 border border-white/20 text-center shadow-xl space-y-1">
              <div className="flex items-center justify-center gap-1 text-amber-400 text-xs">
                {'★'.repeat(5)}
                <span className="text-[10px] text-slate-300 font-bold ml-1">4.9 / 5.0 (+1.420 famílias)</span>
              </div>

              <div className="flex items-baseline justify-center gap-2">
                <span className="text-xs text-slate-400 line-through">
                  De R$ {oldPrice.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400">
                  R$ {price.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <span className="text-[10px] text-slate-300 block">
                ou no cartão de crédito / Pix instantâneo
              </span>
            </div>

            {/* Bottom Conversion Banner (Inspired by image_d6e91a85) */}
            {showBottomBanner && (
              <div className="mt-2 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 rounded-xl p-2.5 text-center shadow-lg border border-amber-300 font-black flex items-center justify-center gap-1.5">
                <Zap className="w-4 h-4 fill-slate-950 text-slate-950 flex-shrink-0" />
                <span className="text-[10px] sm:text-[11px] uppercase tracking-tight leading-tight">
                  POSTA COM LINK CONVERTIDO NO AUTOMÁTICO E VENDE MAIS!
                </span>
              </div>
            )}
          </div>

          {/* Canvas Bottom Helper */}
          <div className="mt-4 text-center text-xs text-slate-400">
            💡 Dica: Quando postado nos Stories do Instagram, a figurinha <strong>"{stickerText}"</strong> leva o seguidor direto para o link da Kiwify.
          </div>
        </div>
      </div>
    </div>
  );
};
