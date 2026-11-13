import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MessageCircle,
  Copy,
  Check,
  Send,
  ExternalLink,
  RefreshCw,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  PhoneCall,
  Users,
  Link2,
  Save,
} from 'lucide-react';
import { Campaign, CustomerLead, TrackingEvent } from '../types';
import { saveWorkspaceSyncToFirebase, subscribeWorkspaceSync } from '../lib/firebase';
import { getShortFunnelUrl } from '../utils/campaignSlug';

interface WhatsAppFunnelX1TabProps {
  campaigns: Campaign[];
  customers: CustomerLead[];
  trackingEvents: TrackingEvent[];
  onAddTrackingEvent?: (eventData: Partial<TrackingEvent>) => void;
  onNavigateTab?: (tab: string) => void;
}

export interface X1FunnelFlow {
  campaignId: string;
  upsellCampaignId: string;
  entryKeyword: string;
  step1Greeting: string;
  step2ProofAndPain: string;
  step3OfferAndCheckout: string;
  step4Recovery15m: string;
  step4Recovery24h: string;
  step5UpsellPostSale: string;
  updatedAt: string;
}

interface SimMessage {
  id: string;
  sender: 'lead' | 'bot';
  stageLabel: string;
  text: string;
  time: string;
}

const STORAGE_KEY_FLOWS = 'autoviral_whatsapp_x1_flows_v1';

function buildDefaultFlow(camp: Campaign, upsellCamp?: Campaign): X1FunnelFlow {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const priceFormatted = Number(camp.price || 0).toFixed(2).replace('.', ',');
  const checkoutRaw = camp.checkoutUrl || 'https://pay.kiwify.com.br/HE5xbnp';
  const trackedCheckout = `${origin}/api/r?to=${encodeURIComponent(checkoutRaw)}&src=whatsapp&city=Brasil&state=BR&camp=${encodeURIComponent(camp.id)}&title=${encodeURIComponent(camp.title)}`;

  const upsellPrice = upsellCamp ? Number(upsellCamp.price || 0).toFixed(2).replace('.', ',') : '27,90';
  const upsellTracked = upsellCamp
    ? `${origin}/api/r?to=${encodeURIComponent(upsellCamp.checkoutUrl || checkoutRaw)}&src=whatsapp&city=Brasil&state=BR&camp=${encodeURIComponent(upsellCamp.id)}&title=${encodeURIComponent(upsellCamp.title)}`
    : trackedCheckout;

  return {
    campaignId: camp.id,
    upsellCampaignId: upsellCamp?.id || '',
    entryKeyword: `Olá! Quero saber como funciona: ${camp.title}`,
    step1Greeting: `Oi! Tudo bem? Que alegria te receber por aqui 😊\nVi que você clicou para conhecer o *${camp.title}*.\n\nMe diz rapidinho para eu te orientar certo: você quer usar para você mesmo(a)/em casa ou para aplicar profissionalmente com alunos/clientes?`,
    step2ProofAndPain: `Perfeito! Esse material foi feito exatamente para resolver isso: *${camp.painPointTargeted || 'economizar tempo com algo pronto e validado'}*.\n\nO acesso é vitalício, chega direto no seu e-mail e WhatsApp na hora, sem complicação. Posso te mandar uma prévia e o valor promocional de hoje?`,
    step3OfferAndCheckout: `Maravilha! Hoje o *${camp.title}* está com condição especial de *R$ ${priceFormatted}* (pagamento único, com garantia de ${camp.guaranteeDays || 7} dias).\n\nÉ só finalizar pelo link oficial abaixo no Pix ou cartão que o sistema libera na mesma hora:\n👉 ${trackedCheckout}\n\nSe gerar o Pix e tiver qualquer dúvida, me chama aqui mesmo!`,
    step4Recovery15m: `Oi! Vi aqui que você abriu o link do *${camp.title}* mas ainda não concluiu 😊\nFicou alguma dúvida sobre o acesso ou sobre o pagamento no Pix? Se precisar, te ajudo agora por aqui!`,
    step4Recovery24h: `Passando rapidinho para avisar que a condição de *R$ ${priceFormatted}* do *${camp.title}* ainda está disponível hoje.\n\nAqui está seu link direto caso queira garantir antes de encerrar:\n👉 ${trackedCheckout}`,
    step5UpsellPostSale: upsellCamp
      ? `🎉 Parabéns pela compra do *${camp.title}*! Seu acesso já foi liberado.\n\nComo você acabou de garantir esse material, liberei um complemento que combina perfeitamente: *${upsellCamp.title}* por apenas *R$ ${upsellPrice}*.\n\nSe quiser aproveitar junto:\n👉 ${upsellTracked}`
      : `🎉 Parabéns pela compra do *${camp.title}*! Seu acesso já está liberado no seu e-mail.\n\nQualquer dúvida na hora de acessar ou baixar os arquivos, pode contar comigo aqui no WhatsApp!`,
    updatedAt: new Date().toISOString(),
  };
}

export const WhatsAppFunnelX1Tab: React.FC<WhatsAppFunnelX1TabProps> = ({
  campaigns,
  customers,
  trackingEvents,
  onAddTrackingEvent,
  onNavigateTab,
}) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(() => campaigns[0]?.id || '');
  const selectedCampaign = useMemo(
    () => campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0],
    [campaigns, selectedCampaignId]
  );

  const [flowsMap, setFlowsMap] = useState<Record<string, X1FunnelFlow>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FLOWS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return {};
  });

  const [activeStage, setActiveStage] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Simulator conversation state
  const [simMessages, setSimMessages] = useState<SimMessage[]>([]);
  const [simInput, setSimInput] = useState('');
  const [simStageIndex, setSimStageIndex] = useState<number>(0);

  // Keep selectedCampaignId valid
  useEffect(() => {
    if (campaigns.length > 0 && !campaigns.some((c) => c.id === selectedCampaignId)) {
      setSelectedCampaignId(campaigns[0].id);
    }
  }, [campaigns, selectedCampaignId]);

  // Sync flowsMap from Firestore workspace_sync_v1 and manual sync events
  useEffect(() => {
    const mergeCloudFlows = (cloud: any) => {
      if (!cloud?.whatsappX1Flows || typeof cloud.whatsappX1Flows !== 'object') return;
      setFlowsMap((prev) => {
        const next = { ...prev };
        let changed = false;
        Object.entries(cloud.whatsappX1Flows).forEach(([cid, cFlow]: [string, any]) => {
          if (!cFlow) return;
          const prevFlow = next[cid];
          if (!prevFlow || (cFlow.updatedAt && (!prevFlow.updatedAt || cFlow.updatedAt > prevFlow.updatedAt))) {
            next[cid] = cFlow;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    };

    const unsub = subscribeWorkspaceSync(mergeCloudFlows);
    const onManual = (ev: Event) => mergeCloudFlows((ev as CustomEvent).detail);
    window.addEventListener('autoviral_workspace_synced', onManual);
    return () => {
      unsub();
      window.removeEventListener('autoviral_workspace_synced', onManual);
    };
  }, []);

  // Persist flowsMap locally
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FLOWS, JSON.stringify(flowsMap));
    } catch {}
  }, [flowsMap]);

  const currentFlow: X1FunnelFlow | null = useMemo(() => {
    if (!selectedCampaign) return null;
    if (flowsMap[selectedCampaign.id]) return flowsMap[selectedCampaign.id];
    const upsellCandidate = campaigns.find((c) => c.id !== selectedCampaign.id);
    return buildDefaultFlow(selectedCampaign, upsellCandidate);
  }, [selectedCampaign, flowsMap, campaigns]);

  // Reset simulator whenever selected campaign changes
  useEffect(() => {
    if (!selectedCampaign || !currentFlow) return;
    setSimMessages([
      {
        id: 'sim-0',
        sender: 'lead',
        stageLabel: 'Entrada pelo Link X1',
        text: currentFlow.entryKeyword,
        time: '19:02',
      },
      {
        id: 'sim-1',
        sender: 'bot',
        stageLabel: 'Etapa 1 · Saudação',
        text: currentFlow.step1Greeting,
        time: '19:02',
      },
    ]);
    setSimStageIndex(1);
  }, [selectedCampaignId]);

  const syncDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
    };
  }, []);

  const updateCurrentFlow = (patch: Partial<X1FunnelFlow>) => {
    if (!selectedCampaign || !currentFlow) return;
    const updated: X1FunnelFlow = {
      ...currentFlow,
      ...patch,
      campaignId: selectedCampaign.id,
      updatedAt: new Date().toISOString(),
    };
    const nextMap = { ...flowsMap, [selectedCampaign.id]: updated };
    setFlowsMap(nextMap);
    if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
    syncDebounceRef.current = setTimeout(() => {
      saveWorkspaceSyncToFirebase({ whatsappX1Flows: nextMap }).catch(console.warn);
    }, 2000);
  };

  const handleSaveToCloud = async () => {
    if (!selectedCampaign || !currentFlow) return;
    const nextMap = {
      ...flowsMap,
      [selectedCampaign.id]: { ...currentFlow, updatedAt: new Date().toISOString() },
    };
    setFlowsMap(nextMap);
    const res = await saveWorkspaceSyncToFirebase({ whatsappX1Flows: nextMap });
    setSaveNotice(
      res.ok
        ? 'Fluxo WhatsApp X1 salvo e sincronizado na nuvem (PC e Celular).'
        : res.quotaExceeded
        ? 'Salvo localmente no dispositivo (cota diária gratuita do Firestore atingida hoje).'
        : 'Salvo localmente. Verifique conexão Firebase.'
    );
    setTimeout(() => setSaveNotice(null), 4000);
  };

  const handleResetFlowToDefault = () => {
    if (!selectedCampaign) return;
    const upsellCandidate = campaigns.find((c) => c.id !== selectedCampaign.id);
    const fresh = buildDefaultFlow(selectedCampaign, upsellCandidate);
    const nextMap = { ...flowsMap, [selectedCampaign.id]: fresh };
    setFlowsMap(nextMap);
    saveWorkspaceSyncToFirebase({ whatsappX1Flows: nextMap }).catch(console.warn);
    setSaveNotice('Roteiro restaurado para o padrão da campanha.');
    setTimeout(() => setSaveNotice(null), 3500);
  };

  const handleGenerateWithAI = async () => {
    if (!selectedCampaign || !currentFlow || isGeneratingAI) return;
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/gemini/sales-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: `Crie uma mensagem persuasiva e natural de WhatsApp para a etapa ${activeStage} do funil X1 (saudação curta, conexão com dor ou fechamento sem parecer robô frio). Produto: ${selectedCampaign.title}. Preço: R$ ${selectedCampaign.price}. Dor: ${selectedCampaign.painPointTargeted}.`,
          productContext: {
            title: selectedCampaign.title,
            niche: selectedCampaign.nicheLabel,
            description: selectedCampaign.painPointTargeted,
            price: selectedCampaign.price,
            checkoutUrl: selectedCampaign.checkoutUrl,
            whatsapp: selectedCampaign.whatsappNumber,
          },
          chatHistory: [],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const replyText = data?.reply || data?.message;
        if (typeof replyText === 'string' && replyText.trim().length > 15) {
          if (activeStage === 1) updateCurrentFlow({ step1Greeting: replyText.trim() });
          else if (activeStage === 2) updateCurrentFlow({ step2ProofAndPain: replyText.trim() });
          else if (activeStage === 3) updateCurrentFlow({ step3OfferAndCheckout: replyText.trim() });
          else if (activeStage === 4) updateCurrentFlow({ step4Recovery15m: replyText.trim() });
          else if (activeStage === 5) updateCurrentFlow({ step5UpsellPostSale: replyText.trim() });
          setSaveNotice('Texto da etapa atualizado com sugestão gerada pela IA.');
          setTimeout(() => setSaveNotice(null), 3500);
        }
      }
    } catch {
      setSaveNotice('Sem resposta da IA no momento — mantendo seu roteiro atual.');
      setTimeout(() => setSaveNotice(null), 3500);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const copyText = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const cleanPhone = (selectedCampaign?.whatsappNumber || '5541998778348').replace(/\D/g, '');

  const waEntryLink = useMemo(() => {
    if (!currentFlow) return '';
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(currentFlow.entryKeyword)}`;
  }, [cleanPhone, currentFlow]);

  const shortManyChatUrl = useMemo(() => {
    if (!selectedCampaign) return '';
    return getShortFunnelUrl(selectedCampaign, origin);
  }, [origin, selectedCampaign]);

  const trackedCheckoutLink = useMemo(() => {
    if (!selectedCampaign) return '';
    return selectedCampaign.checkoutUrl || 'https://pay.kiwify.com.br/HE5xbnp';
  }, [selectedCampaign]);

  // Real metrics filtered for WhatsApp channel (!isSimulation)
  const whatsappRealStats = useMemo(() => {
    const real = trackingEvents.filter((e) => !e.isSimulation);
    const waEvents = real.filter((e) => e.source === 'whatsapp' || e.type === 'whatsapp_click');
    const clicks = waEvents.filter((e) => e.type === 'click' || e.type === 'whatsapp_click' || e.type === 'checkout_click').length;
    const conversions = waEvents.filter((e) => e.type === 'conversion').length;
    const revenue = waEvents
      .filter((e) => e.type === 'conversion')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    return { clicks, conversions, revenue };
  }, [trackingEvents]);

  const handleAdvanceSimulator = (leadReplyText: string, nextStage?: number) => {
    if (!currentFlow || !leadReplyText.trim()) return;
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const targetStage = nextStage || Math.min(simStageIndex + 1, 5);

    let botResponse = currentFlow.step2ProofAndPain;
    let stageLabel = 'Etapa 2 · Dor e Prova';
    if (targetStage === 1) {
      botResponse = currentFlow.step1Greeting;
      stageLabel = 'Etapa 1 · Saudação';
    } else if (targetStage === 2) {
      botResponse = currentFlow.step2ProofAndPain;
      stageLabel = 'Etapa 2 · Dor e Prova';
    } else if (targetStage === 3) {
      botResponse = currentFlow.step3OfferAndCheckout;
      stageLabel = 'Etapa 3 · Oferta + Checkout';
    } else if (targetStage === 4) {
      botResponse = currentFlow.step4Recovery15m;
      stageLabel = 'Etapa 4 · Recuperação Pix';
    } else if (targetStage >= 5) {
      botResponse = currentFlow.step5UpsellPostSale;
      stageLabel = 'Etapa 5 · Pós-Venda + Upsell';
    }

    setSimMessages((prev) => [
      ...prev,
      { id: `l-${Date.now()}`, sender: 'lead', stageLabel: 'Lead no WhatsApp', text: leadReplyText.trim(), time: nowTime },
      { id: `b-${Date.now() + 1}`, sender: 'bot', stageLabel, text: botResponse, time: nowTime },
    ]);
    setSimStageIndex(targetStage);
    setSimInput('');
  };

  if (!selectedCampaign || !currentFlow) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-white">Nenhuma campanha ativa encontrada.</p>
        <p className="text-xs text-slate-400">Cadastre um produto em Minhas Campanhas para gerar seu funil de WhatsApp X1.</p>
        {onNavigateTab && (
          <button
            type="button"
            onClick={() => onNavigateTab('campaigns')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
          >
            Ir para Minhas Campanhas
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Summary + Product Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-emerald-400 font-semibold">Funil Inbound X1</span>
              <span aria-hidden="true">·</span>
              <span>Qualificação em 5 Etapas</span>
              <span aria-hidden="true">·</span>
              <span>Recuperação de Pix e Upsell</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Robô WhatsApp X1 — Funil Automático de Conversão
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Transforme cliques de Reels, Grupos do Facebook, Stories e Meta Ads em conversas de WhatsApp com roteiro de fechamento, link rastreado e recuperação automática sem risco de spam frio.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleResetFlowToDefault}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrão</span>
            </button>
            <button
              type="button"
              onClick={handleSaveToCloud}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Funil na Nuvem</span>
            </button>
          </div>
        </div>

        {saveNotice && (
          <div className="px-4 py-2.5 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-xs font-medium text-emerald-300">
            {saveNotice}
          </div>
        )}

        {/* Campaign & Upsell Selectors + Real WhatsApp Channel KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2 border-t border-slate-800">
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Produto Principal do Funil
            </label>
            <select
              value={selectedCampaign.id}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} (R$ {Number(c.price || 0).toFixed(2).replace('.', ',')})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Oferta de Upsell (Etapa 5 Pós-Venda)
            </label>
            <select
              value={currentFlow.upsellCampaignId}
              onChange={(e) => {
                const chosen = campaigns.find((c) => c.id === e.target.value);
                const fresh = buildDefaultFlow(selectedCampaign, chosen);
                updateCurrentFlow({
                  upsellCampaignId: e.target.value,
                  step5UpsellPostSale: fresh.step5UpsellPostSale,
                });
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">Sem upsell (apenas suporte pós-compra)</option>
              {campaigns
                .filter((c) => c.id !== selectedCampaign.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} (R$ {Number(c.price || 0).toFixed(2).replace('.', ',')})
                  </option>
                ))}
            </select>
          </div>

          <div className="md:col-span-4 grid grid-cols-3 gap-2">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block">Cliques WhatsApp</span>
              <strong className="text-base font-bold text-white font-mono tabular-nums">
                {whatsappRealStats.clicks}
              </strong>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block">Vendas Reais</span>
              <strong className="text-base font-bold text-emerald-400 font-mono tabular-nums">
                {whatsappRealStats.conversions}
              </strong>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block">Receita WhatsApp</span>
              <strong className="text-base font-bold text-white font-mono tabular-nums">
                R$ {whatsappRealStats.revenue.toFixed(2).replace('.', ',')}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Entry Links & Anti-Ban Rule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Link2 className="w-4 h-4 text-emerald-400" />
              <span>Links Prontos para Atração (Bio, Reels, Grupos e Anúncios)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono tabular-nums">+{cleanPhone}</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Frase automática quando o lead clicar para chamar no WhatsApp:
            </label>
            <input
              type="text"
              value={currentFlow.entryKeyword}
              onChange={(e) => updateCurrentFlow({ entryKeyword: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <span className="text-[11px] font-semibold text-emerald-400 block">
                1. Link Curto Confiável ManyChat (Sem cara de spam)
              </span>
              <p className="text-[11px] font-mono text-emerald-300 truncate">{shortManyChatUrl}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyText('entry', shortManyChatUrl)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'entry' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'entry' ? 'Copiado' : 'Copiar Link Curto'}</span>
                </button>
                <a
                  href={shortManyChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-700/50 text-xs font-semibold text-emerald-300 flex items-center gap-1"
                >
                  <span>Abrir ManyChat</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 block">
                2. Link Direto WhatsApp / Checkout (Etapa 3)
              </span>
              <p className="text-[11px] font-mono text-indigo-300 truncate">{trackedCheckoutLink}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyText('checkout', trackedCheckoutLink)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'checkout' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'checkout' ? 'Copiado' : 'Copiar Checkout'}</span>
                </button>
                <a
                  href={waEntryLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    onAddTrackingEvent?.({
                      campaignId: selectedCampaign.id,
                      campaignTitle: selectedCampaign.title,
                      niche: selectedCampaign.niche,
                      type: 'whatsapp_click',
                      source: 'whatsapp',
                      isSimulation: false,
                    })
                  }
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-300 flex items-center gap-1"
                >
                  <span>wa.me</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Anti-Ban Safety Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Regra Anti-Bloqueio do Funil X1</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            No método X1 seguro, você <strong>nunca faz disparo frio</strong> em listas compradas. O próprio interessado inicia a conversa clicando no seu link de entrada.
          </p>
          <ul className="text-[11px] text-slate-400 space-y-1.5 pt-1">
            <li>• Use o WhatsApp Business com Saudação + Etiquetas (Novo Lead, Pix Gerado, Comprador).</li>
            <li>• Respeite intervalo humano (30s a 2 min) antes de mandar link de pagamento.</li>
            <li>• Para automatizar 24h no celular, conecte estas 5 mensagens em Respostas Rápidas (<code className="text-emerald-300">/1</code> a <code className="text-emerald-300">/5</code>) ou Typebot/BotConversa.</li>
          </ul>
        </div>
      </div>

      {/* Main 2-Column Workspace: Left = 5-Stage Script Builder | Right = Live WhatsApp X1 Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Stage Editor */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-white">Roteiro Editável do Robô WhatsApp (5 Etapas)</h3>
            <button
              type="button"
              onClick={handleGenerateWithAI}
              disabled={isGeneratingAI}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
            >
              {isGeneratingAI ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{isGeneratingAI ? 'Gerando...' : 'Reescrever Etapa com IA'}</span>
            </button>
          </div>

          {/* Segmented Stage Selector */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
            {[
              { id: 1 as const, label: '1. Saudação' },
              { id: 2 as const, label: '2. Dor & Prova' },
              { id: 3 as const, label: '3. Oferta & Link' },
              { id: 4 as const, label: '4. Recuperar Pix' },
              { id: 5 as const, label: '5. Upsell' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setActiveStage(st.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                  activeStage === st.id
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Active Stage Textarea(s) */}
          {activeStage === 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Etapa 1 · Saudação Imediata + Pergunta de Qualificação (Atalho <code className="text-emerald-400">/1</code>)
                </span>
                <button
                  type="button"
                  onClick={() => copyText('s1', currentFlow.step1Greeting)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 's1' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 's1' ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <textarea
                rows={6}
                value={currentFlow.step1Greeting}
                onChange={(e) => updateCurrentFlow({ step1Greeting: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 leading-relaxed focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {activeStage === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Etapa 2 · Quebra de Objeção + Autoridade/Prova (Atalho <code className="text-emerald-400">/2</code>)
                </span>
                <button
                  type="button"
                  onClick={() => copyText('s2', currentFlow.step2ProofAndPain)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 's2' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 's2' ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <textarea
                rows={6}
                value={currentFlow.step2ProofAndPain}
                onChange={(e) => updateCurrentFlow({ step2ProofAndPain: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 leading-relaxed focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {activeStage === 3 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Etapa 3 · Oferta Irresistível + Checkout Rastreado (Atalho <code className="text-emerald-400">/3</code>)
                </span>
                <button
                  type="button"
                  onClick={() => copyText('s3', currentFlow.step3OfferAndCheckout)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 's3' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 's3' ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <textarea
                rows={7}
                value={currentFlow.step3OfferAndCheckout}
                onChange={(e) => updateCurrentFlow({ step3OfferAndCheckout: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 leading-relaxed focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {activeStage === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Recuperação 15 minutos (Pix/Checkout aberto sem pagar — Atalho <code className="text-emerald-400">/4</code>)
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText('s4a', currentFlow.step4Recovery15m)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 's4a' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 's4a' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={currentFlow.step4Recovery15m}
                  onChange={(e) => updateCurrentFlow({ step4Recovery15m: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 leading-relaxed focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Follow-up 24 horas (Última chamada amigável)
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText('s4b', currentFlow.step4Recovery24h)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 's4b' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 's4b' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={currentFlow.step4Recovery24h}
                  onChange={(e) => updateCurrentFlow({ step4Recovery24h: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 leading-relaxed focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {activeStage === 5 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Etapa 5 · Pós-Venda + Oferta de Upsell (Atalho <code className="text-emerald-400">/5</code>)
                </span>
                <button
                  type="button"
                  onClick={() => copyText('s5', currentFlow.step5UpsellPostSale)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 's5' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 's5' ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <textarea
                rows={6}
                value={currentFlow.step5UpsellPostSale}
                onChange={(e) => updateCurrentFlow({ step5UpsellPostSale: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 leading-relaxed focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}
        </div>

        {/* Right: Interactive WhatsApp X1 Simulator */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-emerald-950/60 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Simulador WhatsApp X1</h4>
                <p className="text-[11px] text-emerald-300">
                  Testando Etapa {simStageIndex} de 5
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSimMessages([
                  {
                    id: 'sim-0',
                    sender: 'lead',
                    stageLabel: 'Entrada pelo Link X1',
                    text: currentFlow.entryKeyword,
                    time: 'Agora',
                  },
                  {
                    id: 'sim-1',
                    sender: 'bot',
                    stageLabel: 'Etapa 1 · Saudação',
                    text: currentFlow.step1Greeting,
                    time: 'Agora',
                  },
                ]);
                setSimStageIndex(1);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 cursor-pointer"
            >
              Reiniciar
            </button>
          </div>

          {/* Chat Feed */}
          <div className="p-4 space-y-3 bg-slate-950/80 min-h-[300px] max-h-[380px] overflow-y-auto">
            {simMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'lead' ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-xs whitespace-pre-wrap leading-relaxed ${
                    msg.sender === 'lead'
                      ? 'bg-slate-800 text-slate-100 border border-slate-700'
                      : 'bg-emerald-900/60 text-emerald-50 border border-emerald-700/60'
                  }`}
                >
                  <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                    {msg.stageLabel} · {msg.time}
                  </span>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Lead Replies to Advance Funnel */}
          <div className="p-3.5 bg-slate-900 border-t border-slate-800 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleAdvanceSimulator('Quero usar profissionalmente / com alunos', 2)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 border border-slate-700 cursor-pointer"
              >
                Responder Etapa 2 (Dor)
              </button>
              <button
                type="button"
                onClick={() => handleAdvanceSimulator('Pode mandar o valor e o link!', 3)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 border border-slate-700 cursor-pointer"
              >
                Pedir Link (Etapa 3)
              </button>
              <button
                type="button"
                onClick={() => handleAdvanceSimulator('(Silêncio após abrir o link)', 4)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-amber-300 border border-slate-700 cursor-pointer"
              >
                Simular Recuperação (4)
              </button>
              <button
                type="button"
                onClick={() => handleAdvanceSimulator('Paguei no Pix! Já recebi.', 5)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-emerald-300 border border-slate-700 cursor-pointer"
              >
                Simular Upsell (5)
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAdvanceSimulator(simInput);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                placeholder="Digite uma resposta de cliente para testar..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Real Captured WhatsApp Leads & Buyers List (1-Click Follow-Up / Upsell) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Leads & Compradores Prontos para Atendimento X1 ({customers.length})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Clique em Recuperar Pix ou Enviar Upsell para abrir a conversa direto no WhatsApp com a mensagem preenchida.
            </p>
          </div>
        </div>

        {customers.length === 0 ? (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center space-y-2">
            <p className="text-xs text-slate-300 font-medium">
              Nenhum lead ou comprador capturado ainda.
            </p>
            <p className="text-[11px] text-slate-500">
              Assim que alguém clicar no botão de WhatsApp ou finalizar uma compra via Webhook Hotmart/Kiwify, o contato aparecerá aqui automaticamente.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3 font-semibold">Contato</th>
                  <th className="py-2.5 px-3 font-semibold">WhatsApp</th>
                  <th className="py-2.5 px-3 font-semibold">Campanha / Origem</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Valor</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Ação X1</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {customers.slice(0, 12).map((lead) => {
                  const leadDigits = (lead.phone || '').replace(/\D/g, '');
                  const isApproved = lead.status === 'comprador_aprovado';
                  const msgToSend = isApproved ? currentFlow.step5UpsellPostSale : currentFlow.step4Recovery15m;
                  const waDirect = `https://wa.me/${leadDigits}?text=${encodeURIComponent(msgToSend)}`;
                  return (
                    <tr key={lead.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3 font-medium text-white">{lead.name}</td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-300">+{leadDigits}</td>
                      <td className="py-2.5 px-3 text-slate-400 truncate max-w-[220px]">
                        {lead.campaignTitle || lead.source}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={isApproved ? 'text-emerald-400 font-semibold' : 'text-amber-300 font-semibold'}>
                          {isApproved ? 'Comprador Aprovado' : 'Lead / Aguardando'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-white">
                        {lead.amount ? `R$ ${Number(lead.amount).toFixed(2).replace('.', ',')}` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <a
                          href={waDirect}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>{isApproved ? 'Enviar Upsell' : 'Recuperar no Zap'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
