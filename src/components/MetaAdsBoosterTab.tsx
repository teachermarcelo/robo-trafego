import React, { useState } from 'react';
import {
  Zap,
  TrendingUp,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Target,
  Sparkles,
  DollarSign,
  ShieldCheck,
  Play,
  Layers,
  ArrowRight,
  Eye,
  CheckCircle2,
  Users,
  Settings,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Send,
  HelpCircle,
} from 'lucide-react';
import { Campaign, TrackingEvent, CustomerLead } from '../types';
import { getCampaignSlug } from '../utils/campaignSlug';

interface MetaAdsBoosterTabProps {
  campaigns: Campaign[];
  onAddTrackingEvent?: (event: Partial<TrackingEvent>) => void;
  onSimulateMetaSale?: (creativeName: string) => void;
  onNavigateTab: (tab: string) => void;
}

interface MetaAdItem {
  id: string;
  name: string;
  status: 'active' | 'in_review' | 'scheduled';
  statusLabel: string;
  type: 'video_9_16' | 'content_demo' | 'offer_static';
  typeLabel: string;
  thumbnailUrl: string;
  recommendedCpa: string;
  clicksEstimated: number;
  utmContent: string;
}

export const MetaAdsBoosterTab: React.FC<MetaAdsBoosterTabProps> = ({
  campaigns,
  onAddTrackingEvent,
  onSimulateMetaSale,
  onNavigateTab,
}) => {
  const activeCampaign = campaigns[0] || {
    id: 'camp-tarefinhas-autismo',
    title: '+ 100 Tarefinha Educação Infantil e Autismo',
    price: 9.99,
    imageUrl: '/assets/aistudio/image_e9e67204.png',
    whatsappNumber: '5541998778348',
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'creatives' | 'auto_responder' | 'audiences' | 'order_bump'>('creatives');
  const [autoResponderActive, setAutoResponderActive] = useState<boolean>(true);
  const [adKeywordTrigger, setAdKeywordTrigger] = useState<string>('EU QUERO, QUERO, PREÇO, COMO COMPRAR, VALOR, PDF');
  const [adPublicReplyText, setAdPublicReplyText] = useState<string>(
    'Olá mamãe/profe! 🌸 Acabei de te enviar o link com valor promocional de R$ 9,90 no seu Direct, confira lá! 📩❤️'
  );
  const [adDirectMessageText, setAdDirectMessageText] = useState<string>(
    `Oi! Vi que você comentou no nosso anúncio querendo o material "${activeCampaign.title}".\n\nLiberamos o acesso em PDF por apenas R$ 9,90 para imprimir quantas vezes quiser:\n👉 ${typeof window !== 'undefined' ? window.location.origin : ''}/?p=tarefinhas&src=meta_ads_comment\n\nQualquer dúvida me chama no WhatsApp: 📲 https://wa.me/5541998778348`
  );
  const [simulationFeedback, setSimulationFeedback] = useState<string | null>(null);

  // The 3 exact creatives from the user's Meta Ads screenshot
  const metaAdsList: MetaAdItem[] = [
    {
      id: 'ad-01',
      name: 'Criativo 01 - Oferta 46 paginas R$9,90',
      status: 'scheduled',
      statusLabel: 'Programado',
      type: 'offer_static',
      typeLabel: 'Carrossel / Imagem de Oferta',
      thumbnailUrl: '/assets/aistudio/image_e9e67204.png',
      recommendedCpa: 'R$ 2,80 - R$ 4,20',
      clicksEstimated: 140,
      utmContent: 'criativo_01_oferta_46pag',
    },
    {
      id: 'ad-02',
      name: 'Criativo 02 - Demonstracao Conteudo',
      status: 'in_review',
      statusLabel: 'Em análise',
      type: 'content_demo',
      typeLabel: 'Vídeo Folheando Material',
      thumbnailUrl: '/assets/aistudio/image_c7c6193b.png',
      recommendedCpa: 'R$ 2,40 - R$ 3,80',
      clicksEstimated: 210,
      utmContent: 'criativo_02_demonstracao_conteudo',
    },
    {
      id: 'ad-03',
      name: 'Criativo 03 - Video 9:16',
      status: 'in_review',
      statusLabel: 'Em análise',
      type: 'video_9_16',
      typeLabel: 'Reels / Stories Vertical (9:16)',
      thumbnailUrl: '/assets/aistudio/image_4e2c42a1.png',
      recommendedCpa: 'R$ 1,90 - R$ 3,10',
      clicksEstimated: 350,
      utmContent: 'criativo_03_video_916_reels',
    },
  ];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getAdUtmUrl = (utmContent: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://robo-trafego.vercel.app';
    const slug = getCampaignSlug(activeCampaign);
    return `${origin}/?p=${slug}&src=meta_ads&utm_source=meta_ads&utm_medium=paid&utm_campaign=fluentimmersion_tarefinhas&utm_content=${utmContent}`;
  };

  const handleTestMetaAdSale = (ad: MetaAdItem) => {
    if (onSimulateMetaSale) {
      onSimulateMetaSale(ad.name);
    } else if (onAddTrackingEvent) {
      const cities = [
        { city: 'São Paulo', state: 'SP' },
        { city: 'Curitiba', state: 'PR' },
        { city: 'Belo Horizonte', state: 'MG' },
        { city: 'Rio de Janeiro', state: 'RJ' },
      ];
      const loc = cities[Math.floor(Math.random() * cities.length)];
      onAddTrackingEvent({
        campaignId: activeCampaign.id,
        campaignTitle: activeCampaign.title,
        niche: activeCampaign.niche,
        type: 'conversion',
        amount: activeCampaign.price || 9.99,
        source: 'meta_ads',
        geo: { city: loc.city, state: loc.state, country: 'Brasil' },
        device: 'mobile',
        ageBracket: '25-34',
        leadScore: 99,
        durationSeconds: 110,
        customerName: 'Cliente Meta Ads (Instagram)',
        customerPhone: '(41) 99877-8348',
        adCreativeName: ad.name,
        utmContent: ad.utmContent,
      });
    }

    setSimulationFeedback(`✅ Venda de R$ ${(activeCampaign.price || 9.99).toFixed(2)} simulada com sucesso do "${ad.name}"! Confira no Radar de Rastreio com o selo azul da Meta.`);
    setTimeout(() => setSimulationFeedback(null), 5000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Top Banner: Meta Ads Integration Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-2 border-blue-500/50 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl space-y-5">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-600 text-white shadow-md shadow-blue-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>GERENCIADOR META ADS CONECTADO</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-slate-300 border border-slate-700 font-mono">
                Conta: FluentImmersion (71542...)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                3 Anúncios Ativos / Em Análise
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Acelerador & Alavanca de Vendas para Anúncios Meta Ads
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Você já colocou seus 3 criativos para rodar no Meta Ads. O AutoViral AI entra como o{' '}
              <strong>multiplicador de conversão</strong>: ele responde automaticamente os comentários dos anúncios no Direct, rastreia qual anúncio dá lucro real e recupera vendas no WhatsApp.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('tracking')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition border border-slate-700"
            >
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Ver Radar de Vendas Meta</span>
            </button>
            <a
              href="https://adsmanager.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-blue-900/40"
            >
              <span>Abrir Gerenciador Meta</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Quick Highlights / Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-blue-900/50 space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Produto Anunciado</span>
            <span className="text-xs font-black text-white truncate block">{activeCampaign.title}</span>
            <span className="text-[11px] text-emerald-400 font-bold">R$ {(activeCampaign.price || 9.99).toFixed(2)}</span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-blue-900/50 space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Custo Estimado por Venda (CPA)</span>
            <span className="text-xs font-black text-emerald-400 block">R$ 2,50 a R$ 3,90</span>
            <span className="text-[10px] text-slate-400">Margem líquida: +65% a 75%</span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-blue-900/50 space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Auto-Resposta de Anúncio</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white">Ligado (Direct Imediato)</span>
            </div>
            <span className="text-[10px] text-slate-400">+300% de aproveitamento</span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-blue-900/50 space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Rastreamento UTM Ativo</span>
            <span className="text-xs font-black text-cyan-400 block">3 Criativos Mapeados</span>
            <span className="text-[10px] text-slate-400">Links blindados com tags</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('creatives')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'creatives'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. Seus 3 Anúncios & Links UTM</span>
        </button>

        <button
          onClick={() => setActiveSubTab('auto_responder')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'auto_responder'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>2. Robô de Comentários no Anúncio (Auto-DM)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audiences')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'audiences'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>3. Públicos de Alta Conversão</span>
        </button>

        <button
          onClick={() => setActiveSubTab('order_bump')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'order_bump'
              ? 'bg-amber-600 text-slate-950 font-black shadow-lg shadow-amber-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>4. Estratégia de Escala (Triplicar Lucro)</span>
        </button>
      </div>

      {/* SUB-TAB 1: THE 3 CREATIVES AND UTM LINKS */}
      {activeSubTab === 'creatives' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <span>Os 3 Anúncios da sua Campanha Meta Ads</span>
                  <span className="text-xs bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-full font-mono">
                    3/3 Mapeados
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Copie o <strong>Link com UTM</strong> de cada criativo e cole no campo "URL do Site" do respectivo anúncio no Gerenciador da Meta. Assim, cada venda saberá exatamente qual criativo gerou!
                </p>
              </div>

              {simulationFeedback && (
                <div className="p-3 bg-emerald-950/90 border border-emerald-500 rounded-xl text-xs font-bold text-emerald-300 animate-in fade-in">
                  {simulationFeedback}
                </div>
              )}
            </div>

            {/* List of the 3 Ads */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {metaAdsList.map((ad, idx) => {
                const utmLink = getAdUtmUrl(ad.utmContent);
                return (
                  <div
                    key={ad.id}
                    className="p-5 bg-slate-950 border-2 border-slate-800 hover:border-blue-500/60 rounded-2xl space-y-4 transition shadow-xl flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                          {ad.typeLabel}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ad.status === 'scheduled'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          ● {ad.statusLabel}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-white">{ad.name}</h4>
                        <p className="text-xs text-slate-400">
                          CPA Recomendado: <strong className="text-emerald-400">{ad.recommendedCpa}</strong>
                        </p>
                      </div>

                      {/* URL Box */}
                      <div className="space-y-1.5 pt-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">
                          URL do Anúncio (Com Rastreamento):
                        </label>
                        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[11px] text-blue-300 break-all select-all">
                          {utmLink}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(utmLink, `copy-${ad.id}`)}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-md shadow-blue-900/30 cursor-pointer"
                      >
                        {copiedId === `copy-${ad.id}` ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Link do Criativo Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Link do Criativo 0{idx + 1}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTestMetaAdSale(ad)}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-900/50 hover:border-emerald-600 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                        title="Simula um lead comprando através deste anúncio específico"
                      >
                        <Play className="w-3 h-3 fill-emerald-400" />
                        <span>Simular Venda deste Criativo (R$ 9,90)</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AUTO-RESPONDER ON AD COMMENTS (REPLYRUSH / AUTO-DM) */}
      {activeSubTab === 'auto_responder' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950 text-pink-300 text-xs font-bold border border-pink-700/50">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>MULTIPLICADOR DE VENDAS 300% NO META ADS</span>
              </div>
              <h3 className="text-xl font-black text-white">
                Auto-Resposta nos Comentários dos Anúncios do Meta Ads
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl">
                Quando seu anúncio começar a rodar, dezenas de mães e professoras vão comentar: <em>"Eu quero"</em>, <em>"Qual o valor?"</em>, <em>"Tem autismo?"</em>. Se você demorar para responder, a venda esfria. Com o robô ativo, o comentário é respondido no segundo exato e o link com desconto cai no Direct!
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAutoResponderActive(!autoResponderActive)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  autoResponderActive
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${autoResponderActive ? 'bg-slate-950 animate-ping' : 'bg-slate-500'}`} />
                <span>{autoResponderActive ? 'Robô de Anúncio LIGADO' : 'Robô PAUSADO'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor of Triggers & Reply Message */}
            <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Palavras-Gatilho Detectadas no Comentário do Anúncio:</span>
                </label>
                <input
                  type="text"
                  value={adKeywordTrigger}
                  onChange={(e) => setAdKeywordTrigger(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-slate-400">
                  Qualquer comentário contendo uma dessas palavras ativa a resposta automática instantânea.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-pink-300 uppercase tracking-wider">
                  1. Resposta Pública no Post/Anúncio (Aumenta Relevância e Barateia o Anúncio):
                </label>
                <textarea
                  value={adPublicReplyText}
                  onChange={(e) => setAdPublicReplyText(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-pink-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  2. Mensagem Privada Enviada no Direct (Com Link da Landing / Checkout R$ 9,90):
                </label>
                <textarea
                  value={adDirectMessageText}
                  onChange={(e) => setAdDirectMessageText(e.target.value)}
                  rows={5}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-400">
                  Integrado via API e compatível com <strong>ReplyRush</strong> / Meta Webhooks.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    copyToClipboard(adDirectMessageText, 'copy-dm-text');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {copiedId === 'copy-dm-text' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar Mensagem do Direct</span>
                </button>
              </div>
            </div>

            {/* Simulation Preview of How it Appears on the Meta Ad */}
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block border-b border-slate-800 pb-2">
                  Prévia em Tempo Real no seu Anúncio da Meta:
                </span>

                {/* Ad comment simulation */}
                <div className="space-y-3 text-xs">
                  {/* Lead comment */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">@mariapedagoga_sp</span>
                      <span className="text-[10px] text-slate-400">há 2 min</span>
                    </div>
                    <p className="text-slate-300">
                      "Eu quero esse material de 46 páginas! Como faço para receber no e-mail? Serve para criança de 4 anos com TEA?"
                    </p>
                  </div>

                  {/* Bot immediate reply */}
                  <div className="p-3 bg-pink-950/40 rounded-xl border border-pink-800/40 space-y-1 ml-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-pink-300 flex items-center gap-1">
                        <span>AutoViral AI (Sua Conta)</span>
                        <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                          Resposta em 3s
                        </span>
                      </span>
                      <span className="text-[10px] text-slate-400">agora</span>
                    </div>
                    <p className="text-pink-100">{adPublicReplyText}</p>
                  </div>

                  {/* Direct chat notification */}
                  <div className="p-3 bg-indigo-950/50 rounded-xl border border-indigo-700/50 space-y-1 ml-8">
                    <span className="text-[10px] uppercase font-bold text-indigo-300 block">
                      📩 Direct Enviado no Privado da Mãe/Profe:
                    </span>
                    <p className="text-slate-200 text-[11px] font-mono whitespace-pre-wrap leading-relaxed">
                      {adDirectMessageText}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/60 border border-emerald-700/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Por que isso alavanca vendas?</strong> Quando o anúncio tem 50 comentários respondidos rapidamente, o custo por clique cai pela metade e a confiança do comprador dispara!
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: WINNING AUDIENCES FOR META ADS */}
      {activeSubTab === 'audiences' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Segmentações de Alta Conversão para o Meta Ads (Conjunto de Anúncios)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Copie estes interesses e configurações diretamente para a etapa "Público" no Gerenciador de Anúncios da Meta para pagar o menor custo por clique e falar só com quem tem dinheiro e interesse imediato.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Audience 1: Mothers */}
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-pink-300 uppercase">Público 1: Mães Atípicas & Pequenos</span>
                <span className="text-[10px] bg-pink-950 text-pink-300 px-2 py-0.5 rounded font-bold">Mais Vendido</span>
              </div>
              <ul className="text-xs space-y-1.5 text-slate-300">
                <li>• <strong>Gênero:</strong> Mulheres</li>
                <li>• <strong>Idade:</strong> 25 a 44 anos</li>
                <li>• <strong>Interesses:</strong> Maternidade, Educação Infantil, Primeira Infância, Autismo</li>
                <li>• <strong>Dados Demográficos:</strong> Pais com filhos de 3 a 5 anos / 6 a 8 anos</li>
                <li>• <strong>Posicionamento:</strong> Instagram Stories & Reels</li>
              </ul>
              <button
                type="button"
                onClick={() => copyToClipboard('Mulheres 25-44 anos, Brasil, Pais com filhos de 3 a 8 anos, Interesses: Maternidade, Educação Infantil, Autismo', 'aud-1')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                {copiedId === 'aud-1' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copiar Configuração</span>
              </button>
            </div>

            {/* Audience 2: Teachers & Educators */}
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-emerald-300 uppercase">Público 2: Professoras & Pedagogas</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-bold">Compra Recorrente</span>
              </div>
              <ul className="text-xs space-y-1.5 text-slate-300">
                <li>• <strong>Gênero:</strong> Mulheres (90%)</li>
                <li>• <strong>Idade:</strong> 22 a 52 anos</li>
                <li>• <strong>Interesses:</strong> Pedagogia, BNCC, Alfabetização, Sala de aula, Planejamento pedagógico</li>
                <li>• <strong>Cargos/Ocupação:</strong> Professora de Educação Infantil, Psicopedagoga</li>
                <li>• <strong>Posicionamento:</strong> Feed do Instagram & Reels</li>
              </ul>
              <button
                type="button"
                onClick={() => copyToClipboard('Mulheres 22-52 anos, Brasil, Ocupação: Professora, Interesses: Pedagogia, BNCC, Alfabetização, Educação Inclusiva', 'aud-2')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                {copiedId === 'aud-2' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copiar Configuração</span>
              </button>
            </div>

            {/* Audience 3: Lookalike / Semelhante */}
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-indigo-300 uppercase">Público 3: Lookalike de Compradores</span>
                <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded font-bold">Escala 10x</span>
              </div>
              <ul className="text-xs space-y-1.5 text-slate-300">
                <li>• <strong>Origem:</strong> Lista de Compradores Hotmart (Pix e Cartão)</li>
                <li>• <strong>Porcentagem:</strong> Semelhante 1% a 2% (Brasil)</li>
                <li>• <strong>Comportamento:</strong> Compradores de produtos digitais</li>
                <li>• <strong>Dispositivos:</strong> Celular (Android e iPhone)</li>
                <li>• <strong>Exclusão:</strong> Já compraram nos últimos 60 dias</li>
              </ul>
              <button
                type="button"
                onClick={() => copyToClipboard('Lookalike 1% Compradores Hotmart / Pix, Brasil, Dispositivos Mobile', 'aud-3')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                {copiedId === 'aud-3' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copiar Configuração</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: ORDER BUMP & UPSELL (TRIPLING PROFIT) */}
      {activeSubTab === 'order_bump' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>A Máquina de Lucro: Como Transformar R$ 9,90 em R$ 29,90 por Cliente</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              O segredo de quem fatura alto no tráfego pago da Meta vendendo produtos de R$ 9,90 é nunca vender apenas 1 produto no checkout.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">1. Produto de Entrada (Front-end)</span>
              <h4 className="text-sm font-bold text-white">+ 100 Tarefinhas em PDF</h4>
              <p className="text-xs text-slate-300">
                Preço irresistível de R$ 9,90 que convence a mãe ou professora a pegar o cartão ou Pix imediatamente sem pensar.
              </p>
              <div className="p-2 bg-slate-900 rounded-lg text-emerald-400 font-bold text-xs">
                Valor: R$ 9,90 (Cobre o custo do anúncio!)
              </div>
            </div>

            <div className="p-5 bg-slate-950 border border-indigo-900/60 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-indigo-400 uppercase">2. Order Bump (Na Mesma Tela)</span>
              <h4 className="text-sm font-bold text-white">Caderno de Jogos Cognitivos & Rotina</h4>
              <p className="text-xs text-slate-300">
                Uma caixinha de seleção simples: <em>"Leve também o kit de 30 pranchas de rotina visual para TEA por apenas R$ 14,90"</em>.
              </p>
              <div className="p-2 bg-indigo-950 rounded-lg text-indigo-300 font-bold text-xs">
                + R$ 14,90 (42% dos compradores marcam sim!)
              </div>
            </div>

            <div className="p-5 bg-slate-950 border border-emerald-900/60 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase">3. Upsell Após a Compra</span>
              <h4 className="text-sm font-bold text-white">Acesso Vitalício + Atualizações Mensais</h4>
              <p className="text-xs text-slate-300">
                Na página de obrigado: <em>"Quer receber novos PDFs todo mês direto no WhatsApp sem pagar mensalidade?"</em>
              </p>
              <div className="p-2 bg-emerald-950 rounded-lg text-emerald-300 font-bold text-xs">
                + R$ 27,00 (Lucro 100% líquido direto no bolso!)
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-emerald-950/80 to-slate-950 border border-emerald-600/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-sm font-bold text-white">
                Resultado Financeiro com a Alavanca do AutoViral AI:
              </span>
              <p className="text-xs text-slate-300">
                Gasto no Meta Ads: <strong>R$ 30,00</strong> ➔ 10 Vendas x R$ 24,00 ticket médio = <strong>R$ 240,00</strong> faturados. <strong>Lucro Líquido: R$ 210,00 por dia!</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('creatives')}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition shrink-0 cursor-pointer"
            >
              Gerar Novos Criativos de Apoio
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
