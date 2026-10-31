import React, { useState } from 'react';
import {
  X,
  Smartphone,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Star,
  Lock,
  ArrowRight,
  Flame,
  Sparkles,
} from 'lucide-react';
import { Campaign, TrackingEvent } from '../types';

interface BridgePageModalProps {
  campaign: Campaign;
  onClose: () => void;
  onTrackAction: (type: TrackingEvent['type'], amount?: number) => void;
}

export const BridgePageModal: React.FC<BridgePageModalProps> = ({
  campaign,
  onClose,
  onTrackAction,
}) => {
  const [leadName, setLeadName] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleWhatsAppClick = () => {
    onTrackAction('whatsapp_click');
    setFeedbackMsg('✅ Evento Rastreado no Radar! Redirecionando lead para o WhatsApp...');
    setTimeout(() => {
      if (campaign.whatsappNumber) {
        const text = encodeURIComponent(
          `Olá! Tenho interesse no ${campaign.title} e gostaria de tirar uma dúvida!`
        );
        window.open(`https://wa.me/${campaign.whatsappNumber}?text=${text}`, '_blank');
      }
    }, 800);
  };

  const handleCheckoutClick = () => {
    onTrackAction('checkout_click');
    setFeedbackMsg('🛒 Evento Rastreado! Lead iniciando checkout...');
    setTimeout(() => {
      onTrackAction('conversion', campaign.price);
      setFeedbackMsg(`🎉 PARABÉNS! Venda de R$ ${campaign.price.toFixed(2)} convertida e registrada no seu Painel!`);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Simulador do Link da Bio / Página do Lead
              </h3>
              <p className="text-[11px] text-slate-400">
                Esta é exatamente a página que os visitantes do TikTok e Pinterest verão
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 text-xs font-semibold border border-emerald-800/50">
              Rastreamento Ativo
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className="bg-emerald-950 border-b border-emerald-800/60 p-3 text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Content area with phone viewport center */}
        <div className="p-6 overflow-y-auto bg-slate-950/70 flex justify-center">
          {/* Mobile phone frame */}
          <div className="w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-[2.5rem] p-5 shadow-2xl relative space-y-5 text-slate-200">
            {/* Notch */}
            <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto mb-2" />

            {/* Product Badge */}
            <div className="text-center space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/50 text-[10px] font-bold tracking-wider uppercase">
                {campaign.nicheLabel} • ACESSO IMEDIATO
              </span>
              <h1 className="text-lg font-black text-white leading-tight">
                {campaign.title}
              </h1>
              <p className="text-xs text-slate-300">
                {campaign.painPointTargeted}
              </p>
            </div>

            {/* Product Cover Image if available */}
            {campaign.imageUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 shadow-lg max-w-xs mx-auto">
                <img
                  src={campaign.imageUrl}
                  alt={campaign.title}
                  className="w-full h-auto object-cover max-h-56"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Social Proof Star rating */}
            <div className="flex items-center justify-center gap-1.5 py-1">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-white">4.9 / 5.0</span>
              <span className="text-[11px] text-slate-400">(+1.420 famílias atendidas)</span>
            </div>

            {/* Offer Box */}
            <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-4 text-center space-y-2 shadow-inner">
              <span className="text-[11px] text-slate-400 line-through">
                De R$ {(campaign.price * 2.2).toFixed(2)}
              </span>
              <div className="text-3xl font-black text-emerald-400">
                R$ {campaign.price.toFixed(2)}
              </div>
              <span className="text-[11px] text-emerald-300 block font-medium">
                ou em até 12x no cartão de crédito / Pix instantâneo
              </span>
            </div>

            {/* Bullet points of transformation */}
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Método prático e mastigado para aplicar no seu celular</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Garantia incondicional de 7 dias com devolução total</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Suporte humanizado para tirar qualquer dúvida</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleCheckoutClick}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/30 transition transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-slate-950" />
                <span>QUERO GARANTIR COM DESCONTO</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>

              {campaign.whatsappNumber && (
                <button
                  onClick={handleWhatsAppClick}
                  className="w-full py-3 px-4 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Tirar Dúvidas no WhatsApp com Especialista</span>
                </button>
              )}
            </div>

            {/* Security Guarantee badge */}
            <div className="pt-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Compra 100% Segura • Acesso Imediato</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
