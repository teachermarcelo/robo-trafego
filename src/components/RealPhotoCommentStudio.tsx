import React, { useMemo, useRef, useState } from 'react';
import {
  Camera,
  Check,
  Copy,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Link2,
  MessageSquare,
  Rocket,
  Search,
  ShieldAlert,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Upload,
  Users,
} from 'lucide-react';
import {
  REAL_PHOTO_LANG_META,
  REAL_PHOTO_NICHES,
  RealPhotoCommentConfig,
  RealPhotoLang,
  RealPhotoNicheId,
  buildFacebookGroupSearchUrl,
  buildRealPhotoTrackedPresellUrl,
  createDefaultRealPhotoConfig,
  generateNaturalDeskPhotoSync,
  hydrateTemplateText,
  stripAllUrlsFromPostBody,
} from '../utils/realPhotoCommentTemplates';

interface StudioOfferLite {
  id: string;
  productName: string;
  countryName: string;
  languageName: string;
  offerPriceText: string;
  presellUrl: string;
  trackingParamName: string;
  postImageUrl?: string;
  realPhotoCommentConfig?: RealPhotoCommentConfig;
}

interface RealPhotoCommentStudioProps {
  activeOffer: StudioOfferLite;
  allOffers: StudioOfferLite[];
  onSelectOffer: (offerId: string) => void;
  onUpdatePresellUrl: (nextUrl: string) => void;
  onSaveRealPhotoConfig: (
    nextConfig: RealPhotoCommentConfig,
    nextPhotoDataUrl?: string,
    activateInDispatch?: boolean
  ) => void;
  onGoToTriage: () => void;
  onGoToTriggerAutomation: () => void;
  onCopyImageToClipboard: (imageUrl: string) => Promise<void>;
}

const NICHE_ORDER: RealPhotoNicheId[] = [
  'pedagogia_tdah',
  'receitas',
  'artesanato_moldes',
  'planilhas',
];

const LANG_ORDER: RealPhotoLang[] = ['pt', 'en', 'es'];

function inferDefaultLangFromOffer(offer: StudioOfferLite): RealPhotoLang {
  const langLower = `${offer.languageName || ''} ${offer.countryName || ''}`.toLowerCase();
  if (langLower.includes('portug') || langLower.includes('brasil') || langLower.includes('brazil')) {
    return 'pt';
  }
  if (langLower.includes('espan') || langLower.includes('span') || langLower.includes('méx') || langLower.includes('mex') || langLower.includes('colomb') || langLower.includes('españ')) {
    return 'es';
  }
  return 'en';
}

export const RealPhotoCommentStudio: React.FC<RealPhotoCommentStudioProps> = ({
  activeOffer,
  allOffers,
  onSelectOffer,
  onUpdatePresellUrl,
  onSaveRealPhotoConfig,
  onGoToTriage,
  onGoToTriggerAutomation,
  onCopyImageToClipboard,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState<boolean>(false);
  const [copy3ASavedToast, setCopy3ASavedToast] = useState<boolean>(false);
  const [copy3BSavedToast, setCopy3BSavedToast] = useState<boolean>(false);
  const [copyDirty, setCopyDirty] = useState<boolean>(false);

  const resolvedConfig: RealPhotoCommentConfig = useMemo(() => {
    if (activeOffer.realPhotoCommentConfig) {
      return activeOffer.realPhotoCommentConfig;
    }
    return createDefaultRealPhotoConfig(
      'pedagogia_tdah',
      inferDefaultLangFromOffer(activeOffer),
      activeOffer.offerPriceText
    );
  }, [activeOffer]);

  const nicheMeta = REAL_PHOTO_NICHES[resolvedConfig.nicheId] || REAL_PHOTO_NICHES.pedagogia_tdah;
  const pack = nicheMeta.packs[resolvedConfig.lang] || nicheMeta.packs.pt;

  const activePhotoUrl = resolvedConfig.customNaturalPhotoUrl || activeOffer.postImageUrl || '';

  const trackedPresellUrl = useMemo(
    () =>
      buildRealPhotoTrackedPresellUrl(
        activeOffer.presellUrl,
        activeOffer.trackingParamName || 'sub2',
        resolvedConfig.nicheId,
        resolvedConfig.lang
      ),
    [
      activeOffer.presellUrl,
      activeOffer.trackingParamName,
      resolvedConfig.nicheId,
      resolvedConfig.lang,
    ]
  );

  const hydratedReplyPreview = useMemo(() => {
    const raw = resolvedConfig.replyText || pack.replyTemplates[0];
    if (raw.includes('[PRESELL_LINK]')) {
      return raw.replace(/\[PRESELL_LINK\]/g, trackedPresellUrl);
    }
    return `${raw.trim()} ${trackedPresellUrl}`;
  }, [resolvedConfig.replyText, pack.replyTemplates, trackedPresellUrl]);

  const hasUrlInsidePost = /https?:\/\/|www\./i.test(resolvedConfig.postText || '');

  const markCopied = (tag: string, textToCopy: string) => {
    try {
      navigator.clipboard?.writeText(textToCopy);
    } catch {}
    setCopiedTag(tag);
    window.setTimeout(() => setCopiedTag((prev) => (prev === tag ? null : prev)), 2200);
  };

  const commitConfig = (partial: Partial<RealPhotoCommentConfig>, nextPhoto?: string) => {
    const updated: RealPhotoCommentConfig = {
      ...resolvedConfig,
      ...partial,
      updatedAt: Date.now(),
    };
    onSaveRealPhotoConfig(updated, nextPhoto, false);
  };

  const handleExplicitSaveCopy = (which: '3a' | '3b') => {
    const cleanPost =
      which === '3a'
        ? stripAllUrlsFromPostBody(resolvedConfig.postText)
        : resolvedConfig.postText;
    commitConfig({ postText: cleanPost });
    setCopyDirty(false);
    if (which === '3a') {
      setCopy3ASavedToast(true);
      window.setTimeout(() => setCopy3ASavedToast(false), 2600);
    } else {
      setCopy3BSavedToast(true);
      window.setTimeout(() => setCopy3BSavedToast(false), 2600);
    }
  };

  const handleSelectNiche = (nextNiche: RealPhotoNicheId) => {
    const nextPack = REAL_PHOTO_NICHES[nextNiche].packs[resolvedConfig.lang];
    const priceLabel = activeOffer.offerPriceText?.trim() || nextPack.defaultPriceExample;
    commitConfig({
      nicheId: nextNiche,
      keyword: nextPack.defaultKeyword,
      variationIndex: 0,
      replyVariationIndex: 0,
      postText: hydrateTemplateText(nextPack.postTemplates[0], nextPack.defaultKeyword, priceLabel),
      replyText: nextPack.replyTemplates[0],
    });
    setCopyDirty(false);
  };

  const handleSelectLang = (nextLang: RealPhotoLang) => {
    const nextPack = REAL_PHOTO_NICHES[resolvedConfig.nicheId].packs[nextLang];
    const priceLabel = nextLang === 'pt' && /\$|AUD|USD|EUR/i.test(activeOffer.offerPriceText || '')
      ? nextPack.defaultPriceExample
      : activeOffer.offerPriceText?.trim() || nextPack.defaultPriceExample;
    commitConfig({
      lang: nextLang,
      keyword: nextPack.defaultKeyword,
      variationIndex: 0,
      replyVariationIndex: 0,
      postText: hydrateTemplateText(nextPack.postTemplates[0], nextPack.defaultKeyword, priceLabel),
      replyText: nextPack.replyTemplates[0],
    });
    setCopyDirty(false);
  };

  const handleCyclePostVariation = () => {
    const nextIdx = (resolvedConfig.variationIndex + 1) % pack.postTemplates.length;
    const priceLabel = activeOffer.offerPriceText?.trim() || pack.defaultPriceExample;
    commitConfig({
      variationIndex: nextIdx,
      postText: hydrateTemplateText(pack.postTemplates[nextIdx], resolvedConfig.keyword, priceLabel),
    });
  };

  const handleCycleReplyVariation = () => {
    const nextIdx = (resolvedConfig.replyVariationIndex + 1) % pack.replyTemplates.length;
    commitConfig({
      replyVariationIndex: nextIdx,
      replyText: pack.replyTemplates[nextIdx],
    });
  };

  const handleKeywordChange = (nextKeyword: string) => {
    const oldKw = (resolvedConfig.keyword || pack.defaultKeyword).trim();
    const updatedPost = oldKw
      ? resolvedConfig.postText.replace(new RegExp(`"${oldKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'gi'), `"${nextKeyword.toUpperCase()}"`)
      : resolvedConfig.postText;
    setCopyDirty(true);
    commitConfig({
      keyword: nextKeyword.toUpperCase(),
      postText: updatedPost,
    });
  };

  const handleGenerateNaturalPhoto = () => {
    const dataUrl = generateNaturalDeskPhotoSync({
      nicheId: resolvedConfig.nicheId,
      lang: resolvedConfig.lang,
    });
    if (dataUrl) {
      commitConfig({ customNaturalPhotoUrl: dataUrl }, dataUrl);
    }
  };

  const handleUploadRealPhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 1080;
          const scale = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1));
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.88);
            commitConfig({ customNaturalPhotoUrl: compressed }, compressed);
            return;
          }
        } catch {}
        if (typeof reader.result === 'string') {
          commitConfig({ customNaturalPhotoUrl: reader.result }, reader.result);
        }
      };
      if (typeof reader.result === 'string') img.src = reader.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDownloadNaturalPhoto = () => {
    if (!activePhotoUrl) return;
    const link = document.createElement('a');
    link.href = activePhotoUrl;
    link.download = `foto-real-${resolvedConfig.nicheId}-${resolvedConfig.lang}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveAndSendToDispatch = () => {
    const cleanPost = stripAllUrlsFromPostBody(resolvedConfig.postText);
    const finalPhoto =
      activePhotoUrl ||
      generateNaturalDeskPhotoSync({
        nicheId: resolvedConfig.nicheId,
        lang: resolvedConfig.lang,
      });
    const finalConfig: RealPhotoCommentConfig = {
      ...resolvedConfig,
      postText: cleanPost,
      customNaturalPhotoUrl: finalPhoto || resolvedConfig.customNaturalPhotoUrl,
      updatedAt: Date.now(),
    };
    setCopyDirty(false);
    onSaveRealPhotoConfig(finalConfig, finalPhoto || undefined, true);
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 2600);
  };

  return (
    <div className="space-y-5">
      {/* Top Explanation Banner + Active Offer Switcher */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/50 border border-emerald-500/40 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-[11px] font-bold">
              <Camera className="w-3.5 h-3.5" />
              MÉTODO CAMINHO A · ALTA CONVERSÃO ORGÂNICA
            </span>
            <span className="text-[11px] text-cyan-300 font-semibold">
              Brasil (PT) · Exterior (EN &amp; ES) · Presell 100% Rastreada
            </span>
          </div>
          <h3 className="text-base font-bold text-white">
            Estúdio “Foto Real + Comentário” (Post SEM Link → Alcance Máximo + Resposta com Presell)
          </h3>
          <p className="text-xs text-slate-300 max-w-3xl">
            Poste uma <strong>foto natural</strong> + texto curto humano <strong>sem link</strong> em grupos ativos do nicho exato pedindo comentário (ex.: <em>“EU QUERO”</em>). Cada comentário multiplica o alcance orgânico e você responde com seu <strong>link da Presell rastreado</strong>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          <label className="flex flex-col gap-1 text-[11px] text-slate-400">
            <span>Oferta / Presell vinculada:</span>
            <select
              value={activeOffer.id}
              onChange={(e) => onSelectOffer(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-semibold min-w-[210px]"
            >
              {allOffers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.productName} ({o.countryName})
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={handleSaveAndSendToDispatch}
            className="sm:mt-4 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold rounded-lg inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-lg whitespace-nowrap"
          >
            {savedToast ? <Check className="w-4 h-4" /> : <Rocket className="w-4 h-4" />}
            <span>{savedToast ? 'Ativado no Disparo!' : 'Salvar & Usar na Aba de Disparo →'}</span>
          </button>
        </div>
      </div>

      {/* STEP 1: Niche (Path A Digital Products) + Language/Market Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-white">
              1. Escolha o Nicho Digital (Caminho A) e o Idioma/País
            </h4>
            <p className="text-xs text-slate-400">
              Cada nicho já carrega os textos naturais, respostas com sua Presell rastreada e as buscas exatas de grupos compradores.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {LANG_ORDER.map((langCode) => {
              const meta = REAL_PHOTO_LANG_META[langCode];
              const active = resolvedConfig.lang === langCode;
              return (
                <button
                  key={langCode}
                  type="button"
                  onClick={() => handleSelectLang(langCode)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                    active
                      ? 'bg-cyan-600/25 border-cyan-400 text-cyan-100'
                      : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  {meta.flag} {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {NICHE_ORDER.map((nId) => {
            const meta = REAL_PHOTO_NICHES[nId];
            const isSelected = resolvedConfig.nicheId === nId;
            return (
              <button
                key={nId}
                type="button"
                onClick={() => handleSelectNiche(nId)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                  isSelected
                    ? 'bg-emerald-950/45 border-emerald-400/70 ring-1 ring-emerald-400/40'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-white">
                    {meta.emoji} {meta.shortLabel}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/25 text-emerald-200 font-bold">
                      Ativo
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{meta.whyItSells}</p>
                <div className="text-[10px] font-mono text-amber-300 pt-0.5">
                  Ticket ideal: {resolvedConfig.lang === 'pt' ? meta.priceRangeBr : meta.priceRangeGlobal}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2 & 3: Two-Column Workspace — Left: Natural Photo | Right: Short Human Post (No Link) + Tracked Presell Reply */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left: Real / Natural Photo */}
        <div className="xl:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span>2. Foto Real / Natural (Sem cara de anúncio)</span>
            </h4>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            <strong>Regra de ouro:</strong> fotos que parecem folha impressa sobre a mesa, caderno aberto ou print real recebem <strong>5x mais comentários</strong> do que panfletos cheios de selos de desconto. Envie uma foto real do seu PC/celular ou gere uma foto estilo mesa agora:
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUploadRealPhotoFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Enviar Foto Real do PC/Celular</span>
            </button>
            <button
              type="button"
              onClick={handleGenerateNaturalPhoto}
              className="px-3 py-2 bg-emerald-600/25 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-200 text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gerar Foto Natural (Mesa/Folha)</span>
            </button>
          </div>

          {activePhotoUrl ? (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-3">
              <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                <img
                  src={activePhotoUrl}
                  alt="Foto Real da Postagem"
                  className="w-full max-h-72 object-contain mx-auto"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <span className="text-emerald-300 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Foto pronta e vinculada à oferta
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await onCopyImageToClipboard(activePhotoUrl);
                      setCopiedTag('natural-img');
                      window.setTimeout(() => setCopiedTag(null), 2000);
                    }}
                    className="px-2.5 py-1 bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 rounded font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedTag === 'natural-img' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedTag === 'natural-img' ? 'Copiada!' : 'Copiar Foto'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadNaturalPhoto}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Baixar (.jpg)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 border border-dashed border-slate-700 rounded-xl p-6 text-center space-y-2">
              <Camera className="w-7 h-7 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">
                Nenhuma foto selecionada ainda. Clique em <strong>“Gerar Foto Natural”</strong> para criar uma folha impressa realista em 1 segundo, ou envie uma foto tirada do celular!
              </p>
            </div>
          )}
        </div>

        {/* Right: Short Human Post (Zero Link) + Tracked Presell Reply Kit */}
        <div className="xl:col-span-7 space-y-4">
          {/* Box A: Short Human Post (NO LINK) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>3A. Texto do Post no Grupo (SEM Link · Pede Comentário)</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Sugestão de produto para este nicho: <strong className="text-slate-200">{pack.defaultProductHint}</strong>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCyclePostVariation}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-200 text-xs font-semibold rounded-lg inline-flex items-center gap-1 cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Variar Modelo ({resolvedConfig.variationIndex + 1}/{pack.postTemplates.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExplicitSaveCopy('3a')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg inline-flex items-center gap-1 cursor-pointer shadow transition-colors ${
                    copy3ASavedToast
                      ? 'bg-emerald-600 text-white'
                      : copyDirty
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      : 'bg-sky-600 hover:bg-sky-500 text-white'
                  }`}
                  title="Grava suas edições da copy no navegador + nuvem e atualiza o disparador"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{copy3ASavedToast ? 'Copy Salva!' : '💾 Salvar Atualizações'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => markCopied('post-text', stripAllUrlsFromPostBody(resolvedConfig.postText))}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedTag === 'post-text' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTag === 'post-text' ? 'Copiado!' : 'Copiar Post'}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <span className="font-semibold">Palavra do comentário:</span>
                <input
                  type="text"
                  value={resolvedConfig.keyword}
                  onChange={(e) => handleKeywordChange(e.target.value)}
                  className="w-36 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-bold text-amber-300 uppercase"
                  placeholder="EU QUERO"
                />
              </label>
              {hasUrlInsidePost ? (
                <button
                  type="button"
                  onClick={() => commitConfig({ postText: stripAllUrlsFromPostBody(resolvedConfig.postText) })}
                  className="text-[11px] font-bold text-amber-300 hover:text-amber-200 underline cursor-pointer"
                >
                  ⚠️ Link detectado no post — clique para remover e manter alcance máximo
                </button>
              ) : (
                <span className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  0 links no post (alcance máximo + menos bloqueio FB)
                </span>
              )}
            </div>

            <textarea
              rows={5}
              value={resolvedConfig.postText}
              onChange={(e) => {
                setCopyDirty(true);
                commitConfig({ postText: e.target.value });
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 leading-relaxed"
            />
          </div>

          {/* Box B: Tracked Presell Reply Kit */}
          <div className="bg-slate-900 border border-cyan-500/35 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-cyan-400" />
                  <span>3B. Resposta Pronta para Comentários (COM Link Presell Rastreado)</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Quando alguém comentar <strong>“{resolvedConfig.keyword}”</strong>, cole esta resposta — ou automatize na aba <strong>1C. Gatilho → Link</strong>!
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCycleReplyVariation}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-200 text-xs font-semibold rounded-lg inline-flex items-center gap-1 cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Outra Resposta ({resolvedConfig.replyVariationIndex + 1}/{pack.replyTemplates.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExplicitSaveCopy('3b')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg inline-flex items-center gap-1 cursor-pointer ${
                    copy3BSavedToast
                      ? 'bg-emerald-600 text-white'
                      : 'bg-sky-600 hover:bg-sky-500 text-white'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{copy3BSavedToast ? 'Salvo!' : '💾 Salvar'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => markCopied('reply-full', hydratedReplyPreview)}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedTag === 'reply-full' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTag === 'reply-full' ? 'Resposta Copiada!' : 'Copiar Resposta Pronta'}</span>
                </button>
              </div>
            </div>

            {/* Direct Editable Presell / Destination Link Field right here */}
            <div className="bg-slate-950 border border-slate-700/90 rounded-lg p-3 space-y-2">
              <label className="block space-y-1">
                <span className="text-[11px] font-bold text-cyan-300">
                  🔗 Seu Link da Presell / Página de Venda (edite ou cole aqui diretamente):
                </span>
                <input
                  type="url"
                  value={activeOffer.presellUrl || ''}
                  onChange={(e) => onUpdatePresellUrl(e.target.value)}
                  placeholder="https://sua-presell-ou-pagina.vercel.app/produto"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs font-mono text-emerald-300"
                />
              </label>
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="min-w-0 flex-1">
                  <span className="text-slate-400 block text-[10px]">Link final com rastreamento automático:</span>
                  <span className="font-mono text-emerald-300 break-all">{trackedPresellUrl}</span>
                </div>
                <button
                  type="button"
                  onClick={() => markCopied('presell-only', trackedPresellUrl)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-200 rounded font-semibold shrink-0 cursor-pointer"
                >
                  {copiedTag === 'presell-only' ? 'Link Copiado!' : 'Copiar só Link'}
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              value={resolvedConfig.replyText}
              onChange={(e) => {
                setCopyDirty(true);
                commitConfig({ replyText: e.target.value });
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 leading-relaxed"
              placeholder="Use [PRESELL_LINK] onde deseja que o link rastreado apareça..."
            />

            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-100">
              <div className="min-w-0">
                <span className="text-[10px] uppercase tracking-wide text-emerald-400 font-bold block mb-1">
                  Prévia real do comentário que você vai responder:
                </span>
                <span className="break-words">{hydratedReplyPreview}</span>
              </div>
              <button
                type="button"
                onClick={onGoToTriggerAutomation}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-extrabold rounded-lg shrink-0 cursor-pointer whitespace-nowrap shadow"
              >
                ⚡ Automatizar na Aba 1C →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 4: Guided Facebook Groups Finder (Brazil + Abroad) + Quality Metric */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Search className="w-4 h-4 text-amber-400" />
              <span>
                4. Onde Achar os Grupos Certos ({nicheMeta.shortLabel} · {REAL_PHOTO_LANG_META[resolvedConfig.lang].flag} {REAL_PHOTO_LANG_META[resolvedConfig.lang].label})
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Clique em qualquer busca abaixo para abrir direto os grupos no Facebook, mapeie com a Extensão e organize em um Público dedicado do nicho.
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToTriage}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-cyan-500/40 text-cyan-200 text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Ir para 03. Triagem &amp; Criar Público do Nicho →</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {pack.groupSearchQueries.map((item, idx) => (
            <a
              key={idx}
              href={buildFacebookGroupSearchUrl(item.query)}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3 flex flex-col justify-between gap-1.5 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-cyan-200 group-hover:text-cyan-100">
                  🔎 {item.label}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 shrink-0" />
              </div>
              <span className="text-[11px] font-mono text-slate-300">“{item.query}”</span>
              <span className="text-[11px] text-slate-400">{item.tip}</span>
            </a>
          ))}
        </div>

        {/* Group Quality Checklist (Metric) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="bg-emerald-950/25 border border-emerald-600/35 rounded-xl p-3 space-y-1.5">
            <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>✅ Métrica de Grupo Comprador (Entre e Selecione Estes)</span>
            </div>
            <ul className="space-y-1 text-[11px] text-slate-300 list-disc pl-4">
              {pack.goodGroupSignals.map((sig, i) => (
                <li key={i}>{sig}</li>
              ))}
            </ul>
          </div>
          <div className="bg-rose-950/25 border border-rose-600/35 rounded-xl p-3 space-y-1.5">
            <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>❌ Grupos para Evitar (Não Convertem)</span>
            </div>
            <ul className="space-y-1 text-[11px] text-slate-300 list-disc pl-4">
              {pack.avoidGroupSignals.map((sig, i) => (
                <li key={i}>{sig}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
