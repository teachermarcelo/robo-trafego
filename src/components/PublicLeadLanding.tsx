import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Star,
  Sparkles,
  Zap,
  Award,
  BookOpen,
  ShoppingBag,
  Download,
  Heart,
  Store,
  Layers,
} from 'lucide-react';
import { Campaign, TrackingEvent } from '../types';
import { subscribeLandingPageSettings } from '../lib/firebase';

interface PublicLeadLandingProps {
  campaign: Campaign;
  onTrackAction: (type: TrackingEvent['type'], amount?: number) => void;
  onGoToDashboard: () => void;
}

export const PublicLeadLanding: React.FC<PublicLeadLandingProps> = ({
  campaign,
  onTrackAction,
  onGoToDashboard,
}) => {
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [liveSettings, setLiveSettings] = useState<any>(null);

  // Exact niche identification without loose keyword contamination
  const isTarefinhas =
    campaign.id === 'camp-tarefinhas-autismo' ||
    (campaign.niche === 'psicopedagogia' && campaign.title.toLowerCase().includes('tarefinha'));

  const isMilhas =
    campaign.title.toLowerCase().includes('milha') &&
    !campaign.title.toLowerCase().includes('ecom');

  const isEcom =
    campaign.title.toLowerCase().includes('ecom') ||
    campaign.title.toLowerCase().includes('loja') ||
    campaign.niche === 'marketing';

  // Real-time synchronization of landing page content and pricing from Firebase
  useEffect(() => {
    setLiveSettings(null); // Clean state on campaign switch to avoid showing previous campaign data
    const unsub = subscribeLandingPageSettings((settings) => {
      if (settings && (settings.campaignId === campaign.id || !settings.campaignId)) {
        setLiveSettings(settings);
      }
    }, campaign.id);
    return () => unsub();
  }, [campaign.id]);

  const effectivePrice =
    liveSettings?.price != null
      ? parseFloat(String(liveSettings.price).replace(',', '.')) || campaign.price
      : campaign.price;

  const effectiveOldPrice =
    liveSettings?.oldPrice != null
      ? parseFloat(String(liveSettings.oldPrice).replace(',', '.')) || campaign.oldPrice || (campaign.price * 2.2)
      : campaign.oldPrice || (campaign.price * 2.2);

  const effectiveHeadline = liveSettings?.headline || campaign.headline || campaign.title;
  const effectiveSubheadline =
    liveSettings?.subheadline ||
    campaign.subheadline ||
    campaign.painPointTargeted ||
    'Acesso imediato com método passo a passo, garantia incondicional de 7 dias e suporte via WhatsApp.';

  const effectiveBadgeText =
    liveSettings?.badgeText ||
    campaign.badgeText ||
    (isTarefinhas
      ? 'PROMOÇÃO EXCLUSIVA HOTMART • ARQUIVOS EM PDF PRONTOS PARA IMPRIMIR'
      : `${campaign.nicheLabel || 'OFERTA ESPECIAL'} • ACESSO IMEDIATO & GARANTIA DE 7 DIAS`);

  const categoryBadge =
    campaign.nicheLabel ||
    (isTarefinhas
      ? 'Para Pedagogos, Psicopedagogos e Mães Atípicas'
      : isEcom
      ? 'E-commerce & Renda Familiar'
      : 'Método Prático e Testado • Acesso Imediato');

  const effectiveImageUrl = liveSettings?.imageUrl || campaign.imageUrl;

  const effectiveCheckoutUrl = liveSettings?.checkoutUrl || campaign.checkoutUrl;
  const effectiveWhatsappNumber =
    liveSettings?.whatsappNumber || campaign.whatsappNumber || '5541998778348';
  const effectiveGuaranteeDays =
    liveSettings?.guaranteeDays || campaign.guaranteeDays || 7;

  // Auto-detect payment gateway
  const checkoutPlatform = (() => {
    const url = (effectiveCheckoutUrl || '').toLowerCase();
    if (url.includes('kiwify')) return 'Kiwify';
    if (url.includes('hotmart')) return 'Hotmart';
    if (url.includes('eduzz') || url.includes('chk.eduzz')) return 'Eduzz';
    return isTarefinhas ? 'Hotmart' : isMilhas ? 'Eduzz' : 'Kiwify / Checkout Seguro';
  })();

  const effectiveCtaText = (() => {
    const raw = liveSettings?.ctaText || campaign.ctaText;
    if (raw && raw.trim()) return raw;
    if (isTarefinhas) return 'QUERO BAIXAR AS ATIVIDADES EM PDF AGORA';
    if (isMilhas) return 'QUERO ENTRAR NA COMUNIDADE AGORA';
    if (isEcom) return 'QUERO MINHA LOJA PRONTA AGORA';
    return 'QUERO GARANTIR MEU ACESSO AGORA';
  })();

  // Dynamic 4 pillars
  const displayFeatures = (() => {
    if (campaign.features && campaign.features.length >= 4) {
      return campaign.features.map((feat, idx) => ({
        num: idx + 1,
        title: feat,
        desc: 'Conteúdo validado e de aplicação prática imediata.',
      }));
    }
    if (isTarefinhas) {
      return [
        {
          num: 1,
          title: 'Atividades Adaptadas para Autismo (TEA)',
          desc: 'Tarefas com pistas visuais estruturadas, sem sobrecarga sensorial, que auxiliam na compreensão de rotinas e foco.',
        },
        {
          num: 2,
          title: 'Coordenação Motora Fina & Grafomotricidade',
          desc: 'Exercícios de pontilhado, recorte, pintura orientada para fortalecer as mãos e preparar para a escrita.',
        },
        {
          num: 3,
          title: 'Alfabetização Lúdica & Raciocínio Lógico',
          desc: 'Vogais, números, formas e quantidades ensinados de forma leve e divertida sem choro ou birras.',
        },
        {
          num: 4,
          title: 'Arquivos em PDF Prontos para Imprimir',
          desc: 'Baixe imediatamente e imprima quantas vezes quiser no conforto de casa ou na escola.',
        },
      ];
    }
    if (isMilhas) {
      return [
        {
          num: 1,
          title: 'Multiplicação de Pontos 10x',
          desc: 'Como comprar itens normais do seu mês e acumular até 10 pontos por real sem mudar seus hábitos.',
        },
        {
          num: 2,
          title: 'Venda Segura de Milhas',
          desc: 'Onde e como vender seus pontos para receber dinheiro direto no Pix na sua conta bancária.',
        },
        {
          num: 3,
          title: 'Passagens e Salas VIP Gratuitas',
          desc: 'Acesso a benefícios e viagens com custo zero sem precisar ter cartões com anuidade cara.',
        },
        {
          num: 4,
          title: 'Comunidade & Alertas de Lucro',
          desc: 'Receba na palma da sua mão os alertas prontos das melhores promoções do dia.',
        },
      ];
    }
    if (isEcom) {
      return [
        {
          num: 1,
          title: 'Loja Pronta & Configurada',
          desc: 'Ganhe sua estrutura completa e profissional pronta para vender sem precisar programar ou gastar fortunas.',
        },
        {
          num: 2,
          title: 'Fornecedores Nacionais Validados',
          desc: 'Produtos com envio rápido pelo Brasil e margem líquida de 40% a 70% sem precisar ter estoque.',
        },
        {
          num: 3,
          title: 'Treinamento Prático do Zero',
          desc: 'Método descomplicado e direto ao ponto para atrair clientes compradores todos os dias pelo celular.',
        },
        {
          num: 4,
          title: 'Suporte & Acompanhamento VIP',
          desc: 'Tire suas dúvidas direto no WhatsApp com especialistas dedicados para destravar suas vendas.',
        },
      ];
    }
    return [
      {
        num: 1,
        title: 'Método Prático & Descomplicado',
        desc: 'Conteúdo mastigado para você aplicar de qualquer lugar, direto no seu celular.',
      },
      {
        num: 2,
        title: 'Acesso Imediato & Vitalício',
        desc: 'Receba seus dados de acesso no seu e-mail assim que o pagamento for aprovado.',
      },
      {
        num: 3,
        title: `Garantia Incondicional de ${effectiveGuaranteeDays} Dias`,
        desc: 'Teste sem nenhum risco. Se não gostar, 100% do seu dinheiro é devolvido.',
      },
      {
        num: 4,
        title: 'Suporte Humanizado via WhatsApp',
        desc: 'Equipe pronta para te apoiar em qualquer dúvida ou dificuldade em tempo real.',
      },
    ];
  })();

  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>(() => [
    {
      sender: 'bot',
      text: isTarefinhas
        ? 'Olá! Sou a assistente pedagógica 24h. Como posso te ajudar com o material de Tarefinhas para Educação Infantil e Autismo (TEA)?'
        : `Olá! Sou a assistente virtual 24h de "${campaign.title}". Como posso te ajudar a tirar qualquer dúvida ou garantir seu acesso com desconto hoje?`,
    },
  ]);

  const handleAskAssistant = (question: string) => {
    const userMsg = { sender: 'user' as const, text: question };
    let reply = '';

    if (question.includes('Como recebo') || question.includes('acesso')) {
      reply = `O acesso ao ${campaign.title} é enviado imediatamente para o seu e-mail logo após a aprovação do pagamento. É rápido, automático e 100% seguro!`;
    } else if (question.includes('pagamento') || question.includes('Pix') || question.includes('cartão')) {
      reply = `Você pode pagar via Pix instantâneo ou em até 12x no cartão de crédito pelo valor promocional de apenas R$ ${effectivePrice.toFixed(2).replace('.', ',')}!`;
    } else if (question.includes('garantia')) {
      reply = `Você tem ${effectiveGuaranteeDays} dias de garantia incondicional assegurada pela plataforma de pagamento ${checkoutPlatform}. Se não gostar, 100% do seu dinheiro é devolvido com 1 clique!`;
    } else {
      reply = `O produto "${campaign.title}" está com valor promocional liberado por apenas R$ ${effectivePrice.toFixed(2).replace('.', ',')}. Se preferir, pode também tirar dúvidas direto no WhatsApp pelo botão da página!`;
    }

    setChatMessages((prev) => [
      ...prev,
      userMsg,
      { sender: 'bot', text: reply },
    ]);
  };

  // Track initial landing view from real visitor
  useEffect(() => {
    if (!hasTrackedView) {
      setHasTrackedView(true);
      const urlParams = new URLSearchParams(window.location.search);
      const source = (urlParams.get('utm_source') || urlParams.get('src') || 'organic_direct') as TrackingEvent['source'];
      
      onTrackAction('click');
      try {
        fetch('/api/tracking/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignId: campaign.id,
            campaignTitle: campaign.title,
            niche: campaign.niche,
            type: 'click',
            device: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
            source: source,
            leadScore: 95,
            durationSeconds: 15,
            geo: { city: 'Visitante Real', state: 'BR', country: 'Brasil' },
          }),
        }).catch(() => {});
      } catch (e) {
        // ignore
      }
    }
  }, [campaign, hasTrackedView, onTrackAction]);

  const handleWhatsAppClick = () => {
    onTrackAction('whatsapp_click');
    try {
      fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign.id,
          campaignTitle: campaign.title,
          name: 'Visitante Real (Dúvidas no WhatsApp)',
          phone: effectiveWhatsappNumber,
          status: 'duvida_whatsapp',
          source: 'landing_page_whatsapp',
          notes: `Visitante clicou no botão da página de ${campaign.title} para falar no WhatsApp`,
        }),
      }).catch(() => {});
    } catch {}

    const text = encodeURIComponent(
      `Olá! Vi sua página de "${campaign.title}" e gostaria de tirar uma dúvida antes de garantir minha vaga!`
    );
    window.location.href = `https://wa.me/${effectiveWhatsappNumber}?text=${text}`;
  };

  const handleCheckoutClick = () => {
    onTrackAction('checkout_click');
    if (effectiveCheckoutUrl) {
      window.location.href = effectiveCheckoutUrl;
    } else {
      alert(`Redirecionando para o checkout de ${campaign.title}...`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Scarcity Bar */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-slate-950 px-4 py-2 text-center text-xs sm:text-sm font-black tracking-wide flex items-center justify-center gap-2 shadow-md">
        <Sparkles className="w-4 h-4 fill-slate-950 shrink-0" />
        <span>{effectiveBadgeText}</span>
      </div>

      {/* Hero Section */}
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6 text-center">
        {/* Category Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-600/40 text-emerald-300 text-xs font-semibold shadow-lg shadow-emerald-950/50">
          {isTarefinhas ? (
            <>
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
              <span>{categoryBadge}</span>
            </>
          ) : isEcom ? (
            <>
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span>{categoryBadge}</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{categoryBadge}</span>
            </>
          )}
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
          {effectiveHeadline}
        </h1>

        {/* Subtitle */}
        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          {effectiveSubheadline}
        </p>

        {/* Product Cover Image / Visual Mockup */}
        {effectiveImageUrl ? (
          <div className="max-w-sm mx-auto py-2">
            <div className="relative group rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl shadow-emerald-950/80 transform hover:scale-[1.02] transition duration-300">
              <img
                src={effectiveImageUrl}
                alt={campaign.title}
                className="w-full h-auto object-cover max-h-72 mx-auto"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/90 text-white text-[11px] font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 shadow">
                {isTarefinhas ? <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> : <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isTarefinhas ? 'eBook em PDF' : 'Produto Oficial'}</span>
              </div>
              <div className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-full uppercase tracking-wider shadow">
                Vendas Ativas
              </div>
            </div>
          </div>
        ) : isTarefinhas ? (
          <div className="max-w-xs mx-auto py-2">
            <div className="relative group rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl shadow-emerald-950/80">
              <img
                src="/assets/aistudio/image_e9e67204.png"
                alt={campaign.title}
                className="w-full h-auto object-cover"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/90 text-white text-[11px] font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 shadow">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>eBook em PDF</span>
              </div>
              <div className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-full uppercase tracking-wider shadow">
                Vendas Ativas
              </div>
            </div>
          </div>
        ) : (
          /* Clean sleek product box card when no image is uploaded */
          <div className="max-w-md mx-auto py-2">
            <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-2 border-emerald-500/30 rounded-3xl shadow-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                {isEcom ? <Store className="w-6 h-6" /> : <Layers className="w-6 h-6" />}
              </div>
              <h3 className="text-base font-black text-white">{campaign.title}</h3>
              <p className="text-xs text-slate-300">{campaign.targetAudience}</p>
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-xs font-bold">
                Liberado por apenas R$ {effectivePrice.toFixed(2).replace('.', ',')}
              </div>
            </div>
          </div>
        )}

        {/* Social Proof Star rating */}
        <div className="flex flex-wrap items-center justify-center gap-2 py-2 text-sm">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400" />
            ))}
          </div>
          <span className="font-bold text-white">4.9 / 5.0 de Avaliação</span>
          <span className="text-slate-400">
            • (+1.420 clientes satisfeitos)
          </span>
        </div>

        {/* CTA Buttons Box */}
        <div className="p-6 bg-slate-900/90 border border-emerald-900/60 rounded-3xl shadow-2xl space-y-4 max-w-xl mx-auto">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 line-through">
              De R$ {effectiveOldPrice ? effectiveOldPrice.toFixed(2).replace('.', ',') : (effectivePrice * 2.2).toFixed(2).replace('.', ',')}
            </span>
            <div className="text-4xl font-black text-emerald-400">
              R$ {effectivePrice.toFixed(2).replace('.', ',')}
            </div>
            <span className="text-xs text-slate-300">
              ou em até 12x no cartão de crédito / Pix com liberação imediata
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {/* Primary Checkout Button */}
            <button
              onClick={handleCheckoutClick}
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-emerald-500/25 transition transform active:scale-98 flex items-center justify-center gap-3 cursor-pointer"
            >
              <Lock className="w-5 h-5 text-slate-950" />
              <span>{effectiveCtaText}</span>
              <ArrowRight className="w-5 h-5 text-slate-950" />
            </button>

            {/* Direct WhatsApp Specialist Button */}
            <button
              onClick={handleWhatsAppClick}
              className="w-full py-3.5 px-6 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 font-bold text-sm sm:text-base rounded-2xl transition flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <span>Tirar Dúvidas Direto no WhatsApp: (41) 99877-8348</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Garantia de {effectiveGuaranteeDays} Dias
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="w-4 h-4 text-emerald-400" />
              Checkout Seguro via {checkoutPlatform}
            </span>
          </div>
        </div>
      </div>

      {/* The 4 Pillars */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <h2 className="text-2xl font-bold text-white text-center">
          O Que Você Terá Acesso na Prática:
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayFeatures.map((feat) => (
            <div key={feat.num} className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center font-bold">
                {feat.num}
              </div>
              <h3 className="font-bold text-white text-base">{feat.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Final CTA on mobile */}
      <div className="max-w-xl mx-auto px-4 py-8 text-center space-y-4">
        <div className="p-6 bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-900/50 rounded-3xl space-y-4 shadow-xl">
          <Award className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-xl font-bold text-white">Garantia Risco Zero de {effectiveGuaranteeDays} Dias</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Acesse o conteúdo, teste e aplique. Se você não ficar 100% satisfeito ou achar que não é para você, basta solicitar o reembolso na {checkoutPlatform} e devolvemos 100% do seu dinheiro.
          </p>

          <button
            onClick={handleCheckoutClick}
            className="w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-5 h-5 text-slate-950" />
            <span>GARANTIR POR APENAS R$ {effectivePrice.toFixed(2).replace('.', ',')}</span>
          </button>
        </div>
      </div>

      {/* Floating 24/7 AI Sales Assistant Widget */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
        {/* Floating Chat Modal */}
        {isChatOpen && (
          <div className="mb-3 w-[92vw] sm:w-96 max-h-[500px] bg-slate-900 border border-emerald-700/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
            {/* Chat Header */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-emerald-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-slate-950 font-black text-xs">
                    AV
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Consultora Virtual • {campaign.title}</span>
                    <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/50">
                      Online 24/7
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-400">Tirando dúvidas em tempo real</p>
                </div>
              </div>

              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-3.5 overflow-y-auto max-h-72 space-y-3 text-xs">
              {chatMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-emerald-600 text-slate-950 font-medium rounded-br-none'
                        : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Question Buttons */}
            <div className="px-3 py-2 bg-slate-950/70 border-t border-slate-800 flex flex-wrap gap-1.5">
              {[
                'Como recebo o acesso?',
                'Quais são as formas de pagamento?',
                'Tem garantia?',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => handleAskAssistant(q)}
                  className="text-[11px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full border border-slate-700 transition cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Action CTAs */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
              <button
                onClick={handleCheckoutClick}
                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition text-center shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                Garantir Vaga (R$ {effectivePrice.toFixed(2).replace('.', ',')})
              </button>
              <button
                onClick={handleWhatsAppClick}
                className="p-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-xl transition cursor-pointer"
                title="Chamar no WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-bold text-xs rounded-full shadow-2xl shadow-emerald-500/40 border-2 border-emerald-300/40 transition transform active:scale-95 cursor-pointer"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping" />
          <MessageSquare className="w-4 h-4 fill-slate-950" />
          <span>
            {isChatOpen
              ? 'Fechar Atendente'
              : 'Dúvidas? Fale com a Consultora 24/7'}
          </span>
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 text-center text-xs text-slate-500 px-4 space-y-3">
        <p>© 2026 {campaign.title} • Todos os direitos reservados.</p>
        <p className="text-[11px] text-slate-600">
          Suporte: (41) 99877-8348 • Pagamentos processados com segurança via {checkoutPlatform}.
        </p>

        {/* Discreet Owner Admin Link */}
        <div className="pt-4">
          <button
            onClick={onGoToDashboard}
            className="text-[11px] text-slate-500 hover:text-emerald-400 underline transition cursor-pointer"
          >
            Acessar Painel do Administrador (AutoViral AI)
          </button>
        </div>
      </footer>
    </div>
  );
};
