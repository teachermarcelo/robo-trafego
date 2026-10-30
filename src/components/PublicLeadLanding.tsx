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
  TrendingUp,
  Award,
  ChevronDown,
} from 'lucide-react';
import { Campaign, TrackingEvent } from '../types';

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
            leadScore: 92,
            durationSeconds: 12,
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
    const text = encodeURIComponent(
      `Olá! Vi sua página da Comunidade Milhas 3.0 e quero entender como começar a lucrar com milhas ainda essa semana!`
    );
    window.location.href = `https://wa.me/${campaign.whatsappNumber || '5541998778348'}?text=${text}`;
  };

  const handleCheckoutClick = () => {
    onTrackAction('checkout_click');
    window.location.href = campaign.checkoutUrl || 'https://chk.eduzz.com/39ZEGY8198';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Scarcity Bar */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-slate-950 px-4 py-2 text-center text-xs sm:text-sm font-black tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 fill-slate-950 shrink-0" />
        <span>VAGAS PROMOCIONAIS LIBERADAS • SUPORTE DIRETO NO WHATSAPP</span>
      </div>

      {/* Hero Section */}
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-600/40 text-emerald-300 text-xs font-semibold shadow-lg shadow-emerald-950/50">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Método Prático e Testado • Renda Extra no Celular</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
          Como Gerar de <span className="text-emerald-400 underline decoration-emerald-500/50">R$ 500 a R$ 2.000</span> de Renda Extra Todo Mês Com Milhas
        </h1>

        {/* Subtitle */}
        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Sem precisar aparecer, sem precisar viajar e transformando os gastos que você já tem no mercado, farmácia e contas básicas em lucro líquido na sua conta.
        </p>

        {/* Social Proof Star rating */}
        <div className="flex flex-wrap items-center justify-center gap-2 py-2 text-sm">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400" />
            ))}
          </div>
          <span className="font-bold text-white">4.9/5 de Avaliação</span>
          <span className="text-slate-400">• Mais de 1.400 pessoas lucrando</span>
        </div>

        {/* CTA Buttons Box */}
        <div className="p-6 bg-slate-900/90 border border-emerald-900/60 rounded-3xl shadow-2xl space-y-4 max-w-xl mx-auto">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 line-through">De R$ 697,00</span>
            <div className="text-4xl font-black text-emerald-400">
              R$ 385,00
            </div>
            <span className="text-xs text-slate-300">
              ou em até 12x no cartão de crédito / Pix com liberação imediata
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {/* Primary Eduzz Checkout Button */}
            <button
              onClick={handleCheckoutClick}
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-emerald-500/25 transition transform active:scale-98 flex items-center justify-center gap-3 cursor-pointer"
            >
              <Lock className="w-5 h-5 text-slate-950" />
              <span>QUERO ENTRAR NA COMUNIDADE AGORA</span>
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
              Garantia de 7 Dias
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="w-4 h-4 text-emerald-400" />
              Pagamento 100% Criptografado
            </span>
          </div>
        </div>
      </div>

      {/* The 4 Pillars */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <h2 className="text-2xl font-bold text-white text-center">
          O Que Você Vai Aprender na Prática:
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-bold text-white text-base">Multiplicação de Pontos 10x</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Como comprar coisas normais (mercado, combustível, roupas) e ganhar até 10 pontos por real gasto, sem mudar seus hábitos.
            </p>
          </div>

          <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-950/80 text-indigo-400 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-bold text-white text-base">Venda Segura de Milhas</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Onde e como vender suas milhas acumuladas para receber dinheiro direto no Pix na sua conta bancária.
            </p>
          </div>

          <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-950/80 text-amber-400 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-bold text-white text-base">Passagens e Salas VIP Gratuitas</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Como ter acesso a salas VIP com comida e bebida à vontade nos aeroportos sem pagar anuidade em cartões Black.
            </p>
          </div>

          <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-950/80 text-purple-400 flex items-center justify-center font-bold">
              4
            </div>
            <h3 className="font-bold text-white text-base">Comunidade e Alertas Diários</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Você recebe na palma da sua mão os alertas das melhores promoções do dia para só copiar e colar a operação lucrativa.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Final CTA on mobile */}
      <div className="max-w-xl mx-auto px-4 py-8 text-center space-y-4">
        <div className="p-6 bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-900/50 rounded-3xl space-y-4 shadow-xl">
          <Award className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-xl font-bold text-white">Garantia Risco Zero de 7 Dias</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Entre na Comunidade Milhas 3.0, assista às aulas e teste os métodos. Se você achar que não é para você, basta pedir o reembolso com um único clique na Eduzz e seu dinheiro será 100% devolvido.
          </p>

          <button
            onClick={handleWhatsAppClick}
            className="w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base rounded-xl transition flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-5 h-5 text-slate-950" />
            <span>Falar no WhatsApp (41) 99877-8348</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 text-center text-xs text-slate-500 px-4 space-y-3">
        <p>© 2026 Comunidade Milhas 3.0 • Todos os direitos reservados.</p>
        <p className="text-[11px] text-slate-600">
          Suporte: (41) 99877-8348 • Pagamentos processados com segurança via Eduzz.
        </p>

        {/* Secret/Discreet Owner Admin Link */}
        <div className="pt-4">
          <button
            onClick={onGoToDashboard}
            className="text-[11px] text-slate-500 hover:text-emerald-400 underline transition"
          >
            Acessar Painel do Administrador (AutoViral AI)
          </button>
        </div>
      </footer>
    </div>
  );
};
