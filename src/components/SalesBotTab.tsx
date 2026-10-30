import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  MessageSquare,
  Flame,
  ArrowRight,
  ExternalLink,
  Code,
  Check,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import { Campaign } from '../types';

interface SalesBotTabProps {
  campaigns: Campaign[];
  onSimulateConversion: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  quickReplies?: string[];
}

export const SalesBotTab: React.FC<SalesBotTabProps> = ({
  campaigns,
  onSimulateConversion,
}) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || 'camp-1');
  const selectedCampaign =
    campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];

  const [inputMessage, setInputMessage] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [leadScore, setLeadScore] = useState(78);
  const [detectedObjection, setDetectedObjection] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Sync selected campaign if list changes
  useEffect(() => {
    if (campaigns.length > 0 && !campaigns.some((c) => c.id === selectedCampaignId)) {
      setSelectedCampaignId(campaigns[0].id);
    }
  }, [campaigns, selectedCampaignId]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'bot',
      text: `Olá! Seja muito bem-vindo(a)! Vi que você se interessou pelo ${
        selectedCampaign?.title || 'nosso método'
      }. Meu papel aqui é tirar qualquer dúvida com total transparência para te ajudar a tomar a melhor decisão. Você gostaria de entender melhor como funciona ou ver as condições de hoje?`,
      timestamp: 'Agora',
      quickReplies: [
        'Como funciona na prática?',
        'Qual o valor com desconto hoje?',
        'Funciona para quem nunca estudou?',
        'Tem garantia se eu não gostar?',
      ],
    },
  ]);

  // Auto-scroll when messages or typing state changes
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isBotTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    if (isBotTyping) return; // Prevent double sends and race conditions
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsBotTyping(true);

    try {
      // Natural typing delay of 450ms for realistic feel
      await new Promise((res) => setTimeout(res, 450));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2800);

      const response = await fetch('/api/gemini/sales-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          userMessage: text,
          productContext: {
            title: selectedCampaign?.title,
            niche: selectedCampaign?.nicheLabel,
            description: selectedCampaign?.painPointTargeted,
            price: selectedCampaign?.price,
            checkoutUrl: selectedCampaign?.checkoutUrl,
            whatsapp: selectedCampaign?.whatsappNumber,
          },
          chatHistory: messages.map((m) => ({ role: m.sender, content: m.text })),
        }),
      });

      clearTimeout(timeoutId);

      let replyText = '';
      let quickReplies: string[] = [];
      let newScore = leadScore;
      let objection: string | null = null;

      if (response.ok) {
        const data = await response.json();
        replyText = data.reply;
        quickReplies = data.suggestedQuickReplies || [];
        if (data.buyerScoreEstimate) newScore = data.buyerScoreEstimate;
        if (data.detectedObjection) objection = data.detectedObjection;
      }

      // If reply is empty or failed, generate contextual instant reply
      if (!replyText) {
        const lower = text.toLowerCase();
        const pTitle = selectedCampaign?.title || 'nosso produto';
        const pPrice = selectedCampaign?.price ? `R$ ${selectedCampaign.price.toFixed(2)}` : 'R$ 97,00';

        if (lower.includes('caro') || lower.includes('preço') || lower.includes('desconto')) {
          replyText = `Compreendo sua preocupação com o orçamento! Mas o ${pTitle} está com condição especial de apenas ${pPrice} (ou em até 12x no cartão ou Pix). Você tem acesso imediato, sem mensalidades, e o valor se paga logo nas primeiras semanas de aplicação!`;
          quickReplies = ['Como funciona na prática?', 'Quero o link de desconto', 'Tem garantia de 7 dias?'];
          newScore = 84;
          objection = 'Preço / Custo';
        } else if (lower.includes('nunca') || lower.includes('iniciante') || lower.includes('estud') || lower.includes('difícil')) {
          replyText = `Essa é a melhor parte: ele foi desenhado do zero para pessoas comuns que nunca estudaram isso antes! Não tem termos complicados: são passos práticos de apenas 15 minutos por dia direto no celular, com comunidade e suporte para tirar dúvidas.`;
          quickReplies = ['Como funciona na prática?', 'Qual o valor promocional?', 'Quero falar no WhatsApp'];
          newScore = 88;
          objection = 'Insegurança / Iniciante';
        } else if (lower.includes('funciona') || lower.includes('prática') || lower.includes('pratica')) {
          replyText = `Na prática você recebe acesso imediato no seu e-mail e WhatsApp logo após a confirmação. Abre no celular quando quiser, segue o roteiro passo a passo e já começa a aplicar no mesmo dia, com suporte ativo!`;
          quickReplies = ['Tem garantia de 7 dias?', 'Qual o valor com desconto?', 'Quero o link de pagamento'];
          newScore = 86;
        } else {
          replyText = `Com certeza! O ${pTitle} foi desenvolvido exatamente para resolver essa dor com segurança. Se você quiser aproveitar a condição promocional de ${pPrice}, posso te enviar o link de acesso exclusivo agora mesmo!`;
          quickReplies = ['Quero o link com desconto!', 'Como funciona na prática?', 'Falar no WhatsApp'];
          newScore = 82;
        }
      }

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        quickReplies,
      };

      setMessages((prev) => [...prev, botMsg]);
      setLeadScore(newScore);
      if (objection) setDetectedObjection(objection);
    } catch (err) {
      console.warn('Using client instant fallback for sales bot:', err);
      const lower = text.toLowerCase();
      const pTitle = selectedCampaign?.title || 'nosso produto';
      const pPrice = selectedCampaign?.price ? `R$ ${selectedCampaign.price.toFixed(2)}` : 'R$ 97,00';

      let replyText = `Com certeza! O ${pTitle} foi desenhado exatamente para ser prático, rápido e direto ao ponto. Você tem 7 dias de garantia incondicional e suporte ativo pelo WhatsApp!`;
      if (lower.includes('caro') || lower.includes('preço')) {
        replyText = `Entendo perfeitamente! Por isso o valor promocional de hoje é de apenas ${pPrice} em até 12x, o que dá menos de R$ 0,35 ao dia. É um investimento que se paga já no primeiro mês!`;
      } else if (lower.includes('nunca') || lower.includes('iniciante') || lower.includes('estud')) {
        replyText = `Ele foi feito especificamente para quem nunca estudou ou está começando do zero absoluto! Não tem termos difíceis: são passos simples de 15 minutos por dia que qualquer pessoa comum consegue aplicar.`;
      } else if (lower.includes('prática') || lower.includes('pratica') || lower.includes('como funciona')) {
        replyText = `Você recebe o acesso imediatamente no seu celular ou computador assim que o Pix é aprovado. Tem aulas curtas, materiais prontos e alertas para você só copiar e aplicar!`;
      }

      const fallbackMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        quickReplies: ['Quero o link de desconto', 'Como funciona na prática?', 'Falar no WhatsApp'],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setLeadScore(85);
    } finally {
      setIsBotTyping(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'm-1',
        sender: 'bot',
        text: `Olá! Seja muito bem-vindo(a)! Vi que você se interessou pelo ${
          selectedCampaign?.title || 'nosso material'
        }. Gostaria de conhecer os detalhes e garantir o valor promocional de hoje?`,
        timestamp: 'Agora',
        quickReplies: [
          'Como funciona na prática?',
          'Qual o valor com desconto hoje?',
          'Tem garantia se eu não gostar?',
          'Quero falar direto no WhatsApp',
        ],
      },
    ]);
    setLeadScore(75);
    setDetectedObjection(null);
  };

  const embedSnippet = `<!-- AutoViral AI Widget de Vendas 24/7 -->
<script src="https://cdn.autoviral.ia/sales-bot.min.js"
  data-campaign="${selectedCampaign?.id}"
  data-whatsapp="${selectedCampaign?.whatsappNumber || ''}"
  data-checkout="${selectedCampaign?.checkoutUrl || ''}"
  defer></script>`;

  const copyEmbedSnippet = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-xs font-semibold">
              <Bot className="w-3.5 h-3.5" />
              <span>Robô de Vendas & Atendimento Consultivo 24/7</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Seu Vendedor Inteligente que Nunca Dorme
            </h2>
            <p className="text-xs text-slate-400">
              Ele atende quem clica nas suas postagens do TikTok e Pinterest, quebra objeções, responde dúvidas e fecha vendas direto no Pix ou WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-semibold">Campanha Ativa:</label>
            <select
              value={selectedCampaignId}
              onChange={(e) => {
                setSelectedCampaignId(e.target.value);
                resetChat();
              }}
              className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
            >
              {campaigns.map((camp) => (
                <option key={camp.id} value={camp.id}>
                  {camp.title} (R$ {camp.price.toFixed(2)})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Chat Simulator + Predictive Score Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Chat Window (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[560px] overflow-hidden shadow-xl">
          {/* Chat Header */}
          <div className="p-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Atendente Virtual AutoViral</span>
                  <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                    Online 24h
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Fechando vendas para: <strong className="text-slate-200">{selectedCampaign?.title}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={resetChat}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-700/50 hover:bg-slate-700 transition"
              title="Reiniciar Simulação"
            >
              Reiniciar
            </button>
          </div>

          {/* Chat Messages Body */}
          <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 text-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className="max-w-[82%] space-y-2">
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none'
                        : 'bg-slate-800 border border-slate-700/80 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Quick Replies for bot */}
                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.quickReplies.map((reply, rIdx) => (
                        <button
                          key={rIdx}
                          onClick={() => handleSendMessage(reply)}
                          disabled={isBotTyping}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-indigo-900/60 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 hover:text-indigo-200 border border-slate-700 transition active:scale-95 text-left"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-500 block px-1">{msg.timestamp}</span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5 text-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isBotTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic pl-2">
                <Bot className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span>Atendente digitando resposta personalizada...</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-slate-800/80 border-t border-slate-700/80 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Digite como se fosse um cliente testando o robô..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isBotTyping || !inputMessage.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white transition active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Predictive Intent Score & Direct Conversion Buttons (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Temperature & Intent Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Intenção de Compra do Lead
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  leadScore >= 85
                    ? 'bg-rose-950 text-rose-300 border border-rose-800/50'
                    : leadScore >= 60
                    ? 'bg-amber-950 text-amber-300 border border-amber-800/50'
                    : 'bg-blue-950 text-blue-300 border border-blue-800/50'
                }`}
              >
                {leadScore >= 85
                  ? '🔥 Lead Super Quente'
                  : leadScore >= 60
                  ? '⚡ Lead Morno'
                  : '❄️ Lead Frio / Dúvida Inicial'}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">Score Preditivo de Conversão:</span>
                <span className="text-emerald-400">{leadScore} / 100</span>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${leadScore}%` }}
                />
              </div>
            </div>

            {detectedObjection && (
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/50 space-y-1">
                <span className="text-[10px] font-bold uppercase text-indigo-300">
                  Objeção Detectada pela IA:
                </span>
                <p className="text-xs text-white font-medium">{detectedObjection}</p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">
                Canais de Fechamento Integrados:
              </span>

              {selectedCampaign?.whatsappNumber && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-300 font-medium">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp: +{selectedCampaign.whatsappNumber}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-900/80 text-emerald-200 px-2 py-0.5 rounded font-bold">
                    Ativo
                  </span>
                </div>
              )}

              {selectedCampaign?.checkoutUrl && (
                <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300 font-medium truncate max-w-[200px]">
                    <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">{selectedCampaign.checkoutUrl}</span>
                  </div>
                  <span className="text-[10px] bg-slate-700 text-slate-200 px-2 py-0.5 rounded font-bold">
                    Checkout Direto
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={onSimulateConversion}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simular Fechamento desta Venda (Pix/Cartão)</span>
            </button>
          </div>

          {/* Embed Script for external pages */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Code className="w-4 h-4 text-indigo-400" />
                <span>Instalar este Robô em Qualquer Site Gratuito</span>
              </h4>
              <button
                onClick={copyEmbedSnippet}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                {copiedCode ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Copiado!
                  </span>
                ) : (
                  <span>Copiar Código</span>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Cole esta tag no seu Linktree, Canva, Google Sites ou landing page para que o robô atenda os visitantes automaticamente.
            </p>
            <pre className="p-2.5 bg-slate-950 rounded-lg text-[10px] font-mono text-slate-300 overflow-x-auto border border-slate-800">
              {embedSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
