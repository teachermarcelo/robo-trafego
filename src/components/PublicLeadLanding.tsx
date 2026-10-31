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
  BookOpen,
  FileText,
  Download,
  Heart,
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
  const [isChatOpen, setIsChatOpen] = useState(false);

  const isTarefinhas =
    campaign.id === 'camp-tarefinhas-autismo' ||
    campaign.niche === 'psicopedagogia' ||
    campaign.title.toLowerCase().includes('tarefinha');

  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>(() => [
    {
      sender: 'bot',
      text: isTarefinhas
        ? 'Olá! Sou a assistente pedagógica 24h. Como posso te ajudar com o material de Tarefinhas para Educação Infantil e Autismo (TEA)?'
        : 'Olá! Sou a assistente 24h da Comunidade Milhas 3.0. Como posso te ajudar a destravar sua renda extra com milhas hoje?',
    },
  ]);

  const handleAskAssistant = (question: string) => {
    const userMsg = { sender: 'user' as const, text: question };
    let reply = '';

    if (isTarefinhas) {
      if (question.includes('Como recebo') || question.includes('download')) {
        reply = 'Você recebe o link para baixar o arquivo completo em PDF imediatamente no seu e-mail após a aprovação do pagamento na Hotmart. É rápido e 100% seguro!';
      } else if (question.includes('imprimir') || question.includes('quantas vezes')) {
        reply = 'Sim! O PDF de alta resolução é seu para sempre. Você pode salvar no computador ou celular e imprimir quantas vezes quiser para seus alunos ou pacientes.';
      } else if (question.includes('idade') || question.includes('Serve')) {
        reply = 'O material foi desenvolvido especificamente para crianças de 2 a 8 anos na Educação Infantil e crianças no espectro autista (TEA) ou com TDAH em fase de estimulação motora e cognitiva.';
      } else if (question.includes('garantia')) {
        reply = 'Você tem 7 dias de garantia incondicional assegurada pela Hotmart. Se não amar as atividades, devolvemos 100% do seu dinheiro!';
      } else {
        reply = `O material com mais de 100 tarefinhas está com valor promocional liberado na Hotmart por apenas R$ ${campaign.price.toFixed(2).replace('.', ',')}. Clique no botão verde para garantir o seu!`;
      }
    } else {
      if (question.includes('cartão Black')) {
        reply = 'Não precisa de cartão Black! Você pode começar com qualquer cartão básico ou até pagando seus boletos do dia a dia (luz, mercado, combustível). O método ensina como pontuar 10x sem precisar de renda alta.';
      } else if (question.includes('dinheiro')) {
        reply = 'O dinheiro das milhas é pago diretamente via Pix na sua conta bancária! Você transfere e vende seus pontos acumulados em plataformas autorizadas com total segurança.';
      } else if (question.includes('garantia')) {
        reply = 'Você tem 7 dias de garantia incondicional protegida pela Eduzz. Se não gostar, basta 1 clique para receber 100% do seu dinheiro de volta sem nenhuma complicação.';
      } else {
        reply = 'Comunidade Milhas 3.0 te dá acesso direto às aulas e alertas de promoções. Você pode tirar dúvidas comigo ou falar no WhatsApp com o criador!';
      }
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
    const text = encodeURIComponent(
      isTarefinhas
        ? `Olá! Vi o material de 100 Tarefinhas de Educação Infantil e Autismo e gostaria de tirar uma dúvida!`
        : `Olá! Vi sua página da Comunidade Milhas 3.0 e quero entender como começar a lucrar com milhas ainda essa semana!`
    );
    window.location.href = `https://wa.me/${campaign.whatsappNumber || '5541998778348'}?text=${text}`;
  };

  const handleCheckoutClick = () => {
    onTrackAction('checkout_click');
    window.location.href = campaign.checkoutUrl || (isTarefinhas ? 'https://pay.hotmart.com/U95248783T' : 'https://chk.eduzz.com/39ZEGY8198');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Scarcity Bar */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-slate-950 px-4 py-2 text-center text-xs sm:text-sm font-black tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 fill-slate-950 shrink-0" />
        <span>
          {isTarefinhas
            ? 'PROMOÇÃO EXCLUSIVA HOTMART • ARQUIVOS EM PDF PRONTOS PARA IMPRIMIR'
            : 'VAGAS PROMOCIONAIS LIBERADAS • SUPORTE DIRETO NO WHATSAPP'}
        </span>
      </div>

      {/* Hero Section */}
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-600/40 text-emerald-300 text-xs font-semibold shadow-lg shadow-emerald-950/50">
          {isTarefinhas ? (
            <>
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
              <span>Para Pedagogos, Psicopedagogos e Mães Atípicas</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Método Prático e Testado • Renda Extra no Celular</span>
            </>
          )}
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
          {isTarefinhas ? (
            <>
              + 100 Tarefinhas Prontas para{' '}
              <span className="text-emerald-400 underline decoration-emerald-500/50">
                Educação Infantil e Crianças com Autismo (TEA)
              </span>
            </>
          ) : (
            <>
              Como Gerar de{' '}
              <span className="text-emerald-400 underline decoration-emerald-500/50">
                R$ 500 a R$ 2.000
              </span>{' '}
              de Renda Extra Todo Mês Com Milhas
            </>
          )}
        </h1>

        {/* Subtitle */}
        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          {isTarefinhas
            ? 'Economize dezenas de horas de planejamento com atividades lúdicas, testadas e prontas para imprimir, que estimulam a coordenação motora, foco, linguagem e autonomia das crianças sem causar frustração.'
            : 'Sem precisar aparecer, sem precisar viajar e transformando os gastos que você já tem no mercado, farmácia e contas básicas em lucro líquido na sua conta.'}
        </p>

        {/* Product Cover Image if Tarefinhas */}
        {isTarefinhas && (
          <div className="max-w-xs mx-auto py-2">
            <div className="relative group rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl shadow-emerald-950/80 transform group-hover:scale-105 transition duration-300">
              <img
                src="/assets/aistudio/image_e9e67204.png"
                alt="+ 100 Tarefinha Educação Infantil e Autismo"
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
        )}

        {/* Social Proof Star rating */}
        <div className="flex flex-wrap items-center justify-center gap-2 py-2 text-sm">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400" />
            ))}
          </div>
          <span className="font-bold text-white">4.9/5 de Avaliação</span>
          <span className="text-slate-400">
            {isTarefinhas
              ? '• Mais de 890 professoras e mães aprovando'
              : '• Mais de 1.400 pessoas lucrando'}
          </span>
        </div>

        {/* CTA Buttons Box */}
        <div className="p-6 bg-slate-900/90 border border-emerald-900/60 rounded-3xl shadow-2xl space-y-4 max-w-xl mx-auto">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 line-through">
              {isTarefinhas ? 'De R$ 47,00' : 'De R$ 697,00'}
            </span>
            <div className="text-4xl font-black text-emerald-400">
              R$ {campaign.price.toFixed(2).replace('.', ',')}
            </div>
            <span className="text-xs text-slate-300">
              {isTarefinhas
                ? 'Pagamento único via Pix ou Cartão • Acesso imediato no e-mail'
                : 'ou em até 12x no cartão de crédito / Pix com liberação imediata'}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {/* Primary Checkout Button */}
            <button
              onClick={handleCheckoutClick}
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-emerald-500/25 transition transform active:scale-98 flex items-center justify-center gap-3 cursor-pointer"
            >
              <Lock className="w-5 h-5 text-slate-950" />
              <span>
                {isTarefinhas
                  ? 'QUERO BAIXAR AS 100 TAREFINHAS AGORA'
                  : 'QUERO ENTRAR NA COMUNIDADE AGORA'}
              </span>
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
              Checkout Seguro {isTarefinhas ? 'Hotmart' : 'Eduzz'}
            </span>
          </div>
        </div>
      </div>

      {/* The 4 Pillars */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <h2 className="text-2xl font-bold text-white text-center">
          {isTarefinhas
            ? 'O Que Está Incluído no Seu Pacote de Atividades:'
            : 'O Que Você Vai Aprender na Prática:'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-bold text-white text-base">
              {isTarefinhas ? 'Atividades Adaptadas para Autismo (TEA)' : 'Multiplicação de Pontos 10x'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isTarefinhas
                ? 'Tarefas com pistas visuais estruturadas, sem sobrecarga sensorial, que auxiliam na compreensão de rotinas, comandos simples e foco.'
                : 'Como comprar coisas normais (mercado, combustível, roupas) e ganhar até 10 pontos por real gasto, sem mudar seus hábitos.'}
            </p>
          </div>

          <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-950/80 text-indigo-400 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-bold text-white text-base">
              {isTarefinhas ? 'Coordenação Motora Fina & Grafomotricidade' : 'Venda Segura de Milhas'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isTarefinhas
                ? 'Exercícios de pontilhado, recorte, colagem, pintura orientada e encaixes para fortalecer a musculatura das mãos e preparar para a escrita.'
                : 'Onde e como vender suas milhas acumuladas para receber dinheiro direto no Pix na sua conta bancária.'}
            </p>
          </div>

          <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-950/80 text-amber-400 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-bold text-white text-base">
              {isTarefinhas ? 'Alfabetização Lúdica & Raciocínio Lógico' : 'Passagens e Salas VIP Gratuitas'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isTarefinhas
                ? 'Identificação de vogais, números, formas geométricas, cores e associação de quantidades de forma leve e divertida.'
                : 'Como ter acesso a salas VIP com comida e bebida à vontade nos aeroportos sem pagar anuidade em cartões Black.'}
            </p>
          </div>

          <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-950/80 text-purple-400 flex items-center justify-center font-bold">
              4
            </div>
            <h3 className="font-bold text-white text-base">
              {isTarefinhas ? 'Arquivos em PDF Prontos para Imprimir' : 'Comunidade e Alertas Diários'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isTarefinhas
                ? 'Receba o material organizado em alta resolução para imprimir em casa ou gráfica quantas cópias precisar, sem limite de uso.'
                : 'Você recebe na palma da sua mão os alertas das melhores promoções do dia para só copiar e colar a operação lucrativa.'}
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
            {isTarefinhas
              ? 'Baixe as tarefinhas, imprima e faça com seus alunos ou filhos. Se você não notar a evolução da criança ou não ficar 100% satisfeita, basta solicitar o reembolso na Hotmart.'
              : 'Entre na Comunidade Milhas 3.0, assista às aulas e teste os métodos. Se você achar que não é para você, basta pedir o reembolso com um único clique na Eduzz.'}
          </p>

          <button
            onClick={handleCheckoutClick}
            className="w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-5 h-5 text-slate-950" />
            <span>
              {isTarefinhas
                ? `BAIXAR TAREFINHAS POR APENAS R$ ${campaign.price.toFixed(2).replace('.', ',')}`
                : 'ENTRAR NA COMUNIDADE AGORA'}
            </span>
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
                    {isTarefinhas ? 'EP' : 'AV'}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{isTarefinhas ? 'Consultora Pedagógica' : 'Consultora Virtual Milhas'}</span>
                    <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/50">
                      Online 24/7
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-400">Tirando dúvidas em tempo real</p>
                </div>
              </div>

              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
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
              {(isTarefinhas
                ? [
                    'Como recebo o material?',
                    'Posso imprimir quantas vezes quiser?',
                    'Serve para qual idade?',
                    'Tem garantia?',
                  ]
                : [
                    'Preciso ter cartão Black?',
                    'Como recebo o dinheiro?',
                    'Tem garantia?',
                  ]
              ).map((q) => (
                <button
                  key={q}
                  onClick={() => handleAskAssistant(q)}
                  className="text-[11px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full border border-slate-700 transition"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Action CTAs */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
              <button
                onClick={handleCheckoutClick}
                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition text-center shadow-md shadow-emerald-500/20"
              >
                {isTarefinhas
                  ? `Baixar Agora (R$ ${campaign.price.toFixed(2).replace('.', ',')})`
                  : `Garantir Vaga (R$ ${campaign.price.toFixed(2).replace('.', ',')})`}
              </button>
              <button
                onClick={handleWhatsAppClick}
                className="p-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-xl transition"
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
              : isTarefinhas
              ? 'Dúvidas Pedagógicas? Fale com a Consultora 24/7'
              : 'Dúvidas? Fale com a Consultora 24/7'}
          </span>
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 text-center text-xs text-slate-500 px-4 space-y-3">
        <p>
          © 2026 {isTarefinhas ? '+ 100 Tarefinha Educação Infantil e Autismo' : 'Comunidade Milhas 3.0'} • Todos os direitos reservados.
        </p>
        <p className="text-[11px] text-slate-600">
          Suporte: (41) 99877-8348 • Pagamentos processados com segurança via{' '}
          {isTarefinhas ? 'Hotmart' : 'Eduzz'}.
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
