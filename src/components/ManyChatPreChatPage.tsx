import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MessageCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Send,
  ExternalLink,
  ArrowLeft,
  PhoneCall,
  Lock,
  Clock,
} from 'lucide-react';
import { Campaign, CustomerLead, TrackingEvent } from '../types';
import {
  buildProductManyChatPackage,
  loadManyChatOverrides,
  ProductBenefitItem,
} from '../data/productBenefitsEngine';
import { subscribeLandingPageSettings } from '../lib/firebase';

interface ManyChatPreChatPageProps {
  campaign: Campaign;
  onTrackAction: (type: TrackingEvent['type'], amount?: number) => void;
  onCaptureLead?: (lead: Partial<CustomerLead>) => void;
  onGoToDashboard: () => void;
}

interface ChatBubble {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  benefits?: ProductBenefitItem[];
  showCheckoutCta?: boolean;
  showWhatsappCta?: boolean;
  time: string;
}

function nowTime() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export const ManyChatPreChatPage: React.FC<ManyChatPreChatPageProps> = ({
  campaign,
  onTrackAction,
  onCaptureLead,
  onGoToDashboard,
}) => {
  const [liveSettings, setLiveSettings] = useState<any>(null);
  const [hasTrackedClick, setHasTrackedClick] = useState(false);

  // Sync live landing overrides if saved
  useEffect(() => {
    setLiveSettings(null);
    const unsub = subscribeLandingPageSettings((settings) => {
      if (settings && (settings.campaignId === campaign.id || !settings.campaignId)) {
        setLiveSettings(settings);
      }
    }, campaign.id);
    return () => unsub();
  }, [campaign.id]);

  const effectiveCampaign = useMemo<Campaign>(() => {
    if (!liveSettings) return campaign;
    return {
      ...campaign,
      price:
        liveSettings.price != null
          ? parseFloat(String(liveSettings.price).replace(',', '.')) || campaign.price
          : campaign.price,
      oldPrice:
        liveSettings.oldPrice != null
          ? parseFloat(String(liveSettings.oldPrice).replace(',', '.')) || campaign.oldPrice
          : campaign.oldPrice,
      checkoutUrl: liveSettings.checkoutUrl || campaign.checkoutUrl,
      whatsappNumber: liveSettings.whatsappNumber || campaign.whatsappNumber,
      guaranteeDays: liveSettings.guaranteeDays || campaign.guaranteeDays,
      imageUrl: liveSettings.imageUrl || campaign.imageUrl,
    };
  }, [campaign, liveSettings]);

  const pkg = useMemo(() => {
    const overrides = loadManyChatOverrides();
    return buildProductManyChatPackage(
      effectiveCampaign,
      typeof window !== 'undefined' ? window.location.origin : '',
      overrides[effectiveCampaign.id]
    );
  }, [effectiveCampaign]);

  const [messages, setMessages] = useState<ChatBubble[]>(() => [
    {
      id: 'init-1',
      sender: 'bot',
      text: pkg.welcomeText,
      benefits: pkg.benefits,
      showCheckoutCta: true,
      time: nowTime(),
    },
  ]);

  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadSavedNotice, setLeadSavedNotice] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Fire real page click once on mount
  useEffect(() => {
    if (!hasTrackedClick) {
      onTrackAction('click');
      setHasTrackedClick(true);
    }
  }, [hasTrackedClick, onTrackAction]);

  // Reset welcome bubble if campaign changes
  useEffect(() => {
    setMessages([
      {
        id: `init-${effectiveCampaign.id}`,
        sender: 'bot',
        text: pkg.welcomeText,
        benefits: pkg.benefits,
        showCheckoutCta: true,
        time: nowTime(),
      },
    ]);
  }, [effectiveCampaign.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const pushBotReply = (reply: Omit<ChatBubble, 'id' | 'sender' | 'time'>) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          sender: 'bot',
          time: nowTime(),
          ...reply,
        },
      ]);
      setIsTyping(false);
    }, 350);
  };

  const handleQuickOption = (option: 'benefits' | 'price' | 'guarantee' | 'whatsapp') => {
    if (option === 'benefits') {
      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, sender: 'user', text: 'Quero ver os benefícios reais do produto', time: nowTime() },
      ]);
      pushBotReply({
        text: `Aqui estão os principais benefícios do *${effectiveCampaign.title}* na prática:`,
        benefits: pkg.benefits,
        showCheckoutCta: true,
        showWhatsappCta: true,
      });
      return;
    }

    if (option === 'price') {
      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, sender: 'user', text: 'Como recebo e qual o valor hoje?', time: nowTime() },
      ]);
      pushBotReply({
        text: `${pkg.howItWorksText}\n\n${pkg.priceAndCheckoutText}`,
        showCheckoutCta: true,
        showWhatsappCta: true,
      });
      return;
    }

    if (option === 'guarantee') {
      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, sender: 'user', text: 'É seguro comprar? Tem garantia?', time: nowTime() },
      ]);
      pushBotReply({
        text: pkg.safetyAndGuaranteeText,
        showCheckoutCta: true,
        showWhatsappCta: true,
      });
      return;
    }

    if (option === 'whatsapp') {
      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, sender: 'user', text: 'Quero falar com você no WhatsApp', time: nowTime() },
      ]);
      setShowLeadModal(true);
      pushBotReply({
        text: 'Perfeito! Toque no botão abaixo para abrir nosso WhatsApp oficial agora (ou informe seu nome e número para eu te chamar com prioridade):',
        showWhatsappCta: true,
      });
    }
  };

  const handleOpenOfficialCheckout = () => {
    onTrackAction('checkout_click', effectiveCampaign.price);
    window.open(pkg.checkoutUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenDirectWhatsapp = (customMsg?: string) => {
    onTrackAction('whatsapp_click');
    const text = customMsg || pkg.whatsappPrefillText;
    window.open(`https://wa.me/${pkg.whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleSaveLeadAndOpenZap = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = leadPhone.replace(/\D/g, '');
    if (onCaptureLead && (leadName.trim() || digits.length >= 8)) {
      onCaptureLead({
        campaignId: effectiveCampaign.id,
        campaignTitle: effectiveCampaign.title,
        name: leadName.trim() || 'Visitante ManyChat',
        phone: digits || pkg.whatsappNumber,
        status: 'duvida_whatsapp',
        source: 'landing_page_whatsapp',
        isReal: true,
        notes: `Entrou pelo link curto /z/${pkg.shortSlug}`,
      });
      setLeadSavedNotice(true);
    }
    setShowLeadModal(false);
    const greeting = leadName.trim()
      ? `Olá! Sou ${leadName.trim()}. Vi o ${effectiveCampaign.title} (R$ ${pkg.priceFormatted}) e quero saber mais!`
      : pkg.whatsappPrefillText;
    handleOpenDirectWhatsapp(greeting);
  };

  const handleSendCustomQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = userInput.trim();
    if (!q || isTyping) return;
    setUserInput('');
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, sender: 'user', text: q, time: nowTime() },
    ]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/gemini/sales-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: q,
          productContext: {
            title: effectiveCampaign.title,
            niche: effectiveCampaign.nicheLabel,
            description: `${effectiveCampaign.painPointTargeted}. Benefícios: ${pkg.benefits
              .map((b) => `${b.title}: ${b.description}`)
              .join(' | ')}`,
            price: effectiveCampaign.price,
            checkoutUrl: pkg.checkoutUrl,
            whatsapp: pkg.whatsappNumber,
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const replyText =
          data?.reply ||
          data?.response ||
          `${pkg.howItWorksText}\n\nSe preferir falar direto comigo no WhatsApp, é só clicar abaixo!`;
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: replyText,
            showCheckoutCta: true,
            showWhatsappCta: true,
            time: nowTime(),
          },
        ]);
        setIsTyping(false);
        return;
      }
    } catch {}

    // Local smart fallback
    setMessages((prev) => [
      ...prev,
      {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `Excelente pergunta! No *${effectiveCampaign.title}*, você recebe tudo pronto com acesso imediato no e-mail e garantia de ${pkg.guaranteeDays} dias por apenas *R$ ${pkg.priceFormatted}*.\n\nToque abaixo para garantir seu acesso ou chamar direto no nosso WhatsApp:`,
        showCheckoutCta: true,
        showWhatsappCta: true,
        time: nowTime(),
      },
    ]);
    setIsTyping(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Trusted Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {effectiveCampaign.imageUrl ? (
              <img
                src={effectiveCampaign.imageUrl}
                alt={effectiveCampaign.title}
                className="w-10 h-10 rounded-full object-cover border border-emerald-500/60 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold text-white truncate">
                  {effectiveCampaign.title}
                </h1>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </div>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span>Atendimento Oficial · Acesso Imediato</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleOpenOfficialCheckout}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
            >
              R$ {pkg.priceFormatted}
            </button>
          </div>
        </div>
      </header>

      {/* Main ManyChat Conversation Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-3 sm:px-4 py-4 flex flex-col gap-3">
        {/* Trust Strip */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Garantia de {pkg.guaranteeDays} dias</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Envio na hora no Pix ou Cartão</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Compra 100% segura</span>
          </span>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 space-y-3 pb-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-emerald-700 text-white rounded-br-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-sm'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {msg.benefits && msg.benefits.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {msg.benefits.map((b, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-0.5"
                      >
                        <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{b.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">{b.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {(msg.showCheckoutCta || msg.showWhatsappCta) && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {msg.showCheckoutCta && (
                      <button
                        type="button"
                        onClick={handleOpenOfficialCheckout}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <span>Garantir Acesso (R$ {pkg.priceFormatted})</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {msg.showWhatsappCta && (
                      <button
                        type="button"
                        onClick={() => handleOpenDirectWhatsapp()}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-700/60 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Chamar no WhatsApp</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="text-[10px] text-slate-400 text-right">{msg.time}</div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-start">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-400">
                Digitando resposta...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* ManyChat Quick Reply Buttons */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2.5 sticky bottom-2">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Toque em uma pergunta pronta ou digite abaixo:</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickOption('benefits')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-medium transition cursor-pointer"
            >
              ✨ Ver benefícios reais
            </button>
            <button
              type="button"
              onClick={() => handleQuickOption('price')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-medium transition cursor-pointer"
            >
              📦 Como funciona e valor
            </button>
            <button
              type="button"
              onClick={() => handleQuickOption('guarantee')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-medium transition cursor-pointer"
            >
              🛡️ Tem garantia?
            </button>
            <button
              type="button"
              onClick={() => handleQuickOption('whatsapp')}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 text-xs font-semibold transition cursor-pointer"
            >
              💬 Falar no WhatsApp
            </button>
          </div>

          <form onSubmit={handleSendCustomQuestion} className="flex items-center gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Pergunte qualquer dúvida sobre o material..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!userInput.trim() || isTyping}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
            <button
              type="button"
              onClick={onGoToDashboard}
              className="hover:text-slate-300 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Painel do Administrador</span>
            </button>
            <span>Link seguro · /z/{pkg.shortSlug}</span>
          </div>
        </div>
      </main>

      {/* Optional Lead Capture Modal before opening WhatsApp */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <form
            onSubmit={handleSaveLeadAndOpenZap}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Atendimento Rápido no WhatsApp</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLeadModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Informe seu nome e WhatsApp para agilizar seu atendimento (ou toque direto no botão verde):
            </p>
            <div className="space-y-3">
              <input
                type="text"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                placeholder="Seu nome"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <input
                type="tel"
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
                placeholder="Seu WhatsApp com DDD (ex: 41 99999-9999)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            {leadSavedNotice && (
              <p className="text-[11px] text-emerald-400 font-semibold">
                Contato registrado! Abrindo WhatsApp...
              </p>
            )}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowLeadModal(false);
                  handleOpenDirectWhatsapp();
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold cursor-pointer"
              >
                Abrir sem preencher
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-bold cursor-pointer"
              >
                Ir para o WhatsApp
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
