import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  Check,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Hand,
  History,
  Link2,
  MessageSquare,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Zap,
} from 'lucide-react';
import { FacebookPostLog } from '../types';
import {
  CommentAutomationMode,
  CommentTriggerReplyLog,
  CommentTriggerRule,
  CommentTriggerSettings,
  DEFAULT_COMMENT_TRIGGER_SETTINGS,
  KEYWORD_PRESET_GROUPS,
  MonitoredTriggerPost,
  TRIGGER_STORAGE_KEYS,
  buildCommentTriggerTrackedLink,
  createStarterRuleFromOffer,
  matchCommentAgainstRules,
  parseKeywordsCsv,
  renderTriggerReplyText,
} from '../utils/commentTriggerAutomation';
import { safeSetLocalStorageJson } from '../utils/safeStorage';

interface TriggerOfferLite {
  id: string;
  productName: string;
  countryName: string;
  presellUrl: string;
  trackingParamName: string;
  realPhotoCommentConfig?: { keyword?: string; lang?: string };
}

interface CommentTriggerAutomationTabProps {
  activeOffer?: TriggerOfferLite;
  allOffers: TriggerOfferLite[];
  botLogs: FacebookPostLog[];
  isDownloadingExt: boolean;
  onDownloadExtensionZip: () => void;
  onNotifyBanner: (message: string, tone: 'success' | 'warning' | 'info') => void;
}

function formatClockMmSs(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const CommentTriggerAutomationTab: React.FC<CommentTriggerAutomationTabProps> = ({
  activeOffer,
  allOffers,
  botLogs,
  isDownloadingExt,
  onDownloadExtensionZip,
  onNotifyBanner,
}) => {
  // 1. Persisted Rules (bootstraps 1 ready-to-use starter rule linked to activeOffer if empty!)
  const [rules, setRules] = useState<CommentTriggerRule[]>(() => {
    try {
      const saved = localStorage.getItem(TRIGGER_STORAGE_KEYS.RULES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [createStarterRuleFromOffer(activeOffer)];
  });

  // 2. Persisted Monitored Posts
  const [monitoredPosts, setMonitoredPosts] = useState<MonitoredTriggerPost[]>(() => {
    try {
      const saved = localStorage.getItem(TRIGGER_STORAGE_KEYS.POSTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  // 3. Persisted Reply History Logs
  const [replyLogs, setReplyLogs] = useState<CommentTriggerReplyLog[]>(() => {
    try {
      const saved = localStorage.getItem(TRIGGER_STORAGE_KEYS.LOGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  // 4. Persisted Automation Settings
  const [settings, setSettings] = useState<CommentTriggerSettings>(() => {
    try {
      const saved = localStorage.getItem(TRIGGER_STORAGE_KEYS.SETTINGS);
      if (saved) {
        return { ...DEFAULT_COMMENT_TRIGGER_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {}
    return DEFAULT_COMMENT_TRIGGER_SETTINGS;
  });

  // Form State (Create / Edit Rule)
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleName, setRuleName] = useState<string>(() =>
    activeOffer?.productName
      ? `Gatilho · ${activeOffer.productName.slice(0, 38)}`
      : 'Gatilho Principal (EU QUERO → Link)'
  );
  const [keywordsInput, setKeywordsInput] = useState<string>(
    'eu quero, quero, manda, link, valor, pdf'
  );
  const [selectedOfferIdForRule, setSelectedOfferIdForRule] = useState<string>(
    activeOffer?.id || ''
  );
  const [baseLinkUrl, setBaseLinkUrl] = useState<string>(
    activeOffer?.presellUrl || 'https://global-sell-beta.vercel.app/'
  );
  const [enablePresellTracking, setEnablePresellTracking] = useState<boolean>(true);
  const [trackingParamName, setTrackingParamName] = useState<string>(
    activeOffer?.trackingParamName || 'sub2'
  );
  const [replyTpl1, setReplyTpl1] = useState<string>(
    'Oi [NOME]! 😊 Peguei o material completo nesta página aqui, dá uma olhada: [LINK]'
  );
  const [replyTpl2, setReplyTpl2] = useState<string>(
    'Claro [NOME]! Te passei o link certinho com tudo que vem incluso: [LINK]'
  );
  const [replyTpl3, setReplyTpl3] = useState<string>(
    'Aqui está [NOME]! Foi por esse link que eu peguei com valor promocional: [LINK] 💛'
  );

  // Add Monitored Post form state
  const [newPostUrl, setNewPostUrl] = useState<string>('');
  const [newPostLabel, setNewPostLabel] = useState<string>('');
  const [newPostRuleId, setNewPostRuleId] = useState<string>('all');

  // Simulator & UI feedback
  const [simulatorInput, setSimulatorInput] = useState<string>('Eu quero o link por favor!');
  const [ruleSavedToast, setRuleSavedToast] = useState<boolean>(false);
  const [syncedToast, setSyncedToast] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Optional 15-minute Auto Round Timer
  const [roundSecondsLeft, setRoundSecondsLeft] = useState<number>(
    (settings.roundIntervalMinutes || 15) * 60
  );
  const roundIndexRef = useRef<number>(0);

  // Persist to localStorage
  useEffect(() => {
    safeSetLocalStorageJson(TRIGGER_STORAGE_KEYS.RULES, rules);
  }, [rules]);

  useEffect(() => {
    safeSetLocalStorageJson(TRIGGER_STORAGE_KEYS.POSTS, monitoredPosts);
  }, [monitoredPosts]);

  useEffect(() => {
    safeSetLocalStorageJson(TRIGGER_STORAGE_KEYS.LOGS, replyLogs.slice(0, 200));
  }, [replyLogs]);

  useEffect(() => {
    safeSetLocalStorageJson(TRIGGER_STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  // Sync rules + settings to Chrome Extension v1.6.0 automatically whenever they change
  const syncRulesToExtension = (showToast = false) => {
    try {
      const preparedRules = rules.map((r) => ({
        ...r,
        trackedLinkPreview: buildCommentTriggerTrackedLink(
          r.baseLinkUrl,
          r.enablePresellTracking,
          r.trackingParamName || 'sub2',
          r.name
        ),
      }));
      window.postMessage(
        {
          type: 'AUTOVIRAL_SYNC_COMMENT_TRIGGERS',
          rules: preparedRules,
          settings,
          monitoredPosts,
        },
        '*'
      );
      if (showToast) {
        setSyncedToast(true);
        window.setTimeout(() => setSyncedToast(false), 2400);
        onNotifyBanner(
          `✅ ${rules.filter((r) => r.active).length} regra(s) Gatilho → Link sincronizadas com a Extensão v1.6.0 (${settings.mode === 'auto' ? 'Modo Automático Seguro' : 'Modo Semi-Automático'})!`,
          'success'
        );
      }
    } catch {}
  };

  useEffect(() => {
    syncRulesToExtension(false);
  }, [rules, settings]);

  // Listen for real replies reported back from Chrome Extension v1.6.0
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!event.data || event.data.type !== 'AUTOVIRAL_COMMENT_TRIGGER_RESULT') return;
      const d = event.data;
      const nowLabel = new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      if (d.status === 'rate_limited') {
        setSettings((prev) => ({ ...prev, autoRoundEnabled: false }));
        onNotifyBanner(
          '🛡️ Freio anti-bloqueio nos comentários: Facebook limitou ações temporariamente. A Ronda Automática foi pausada por segurança.',
          'warning'
        );
      }

      if (d.status === 'replied' || d.status === 'prefilled' || d.status === 'rate_limited') {
        const entry: CommentTriggerReplyLog = {
          id: `tlog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          commentKey: String(d.commentKey || ''),
          postUrl: String(d.postUrl || ''),
          groupName: String(d.groupName || 'Post Facebook'),
          authorName: String(d.authorName || 'Membro do Grupo'),
          commentSnippet: String(d.commentSnippet || ''),
          matchedKeyword: String(d.matchedKeyword || ''),
          ruleId: String(d.ruleId || ''),
          ruleName: String(d.ruleName || 'Gatilho'),
          replySent: String(d.replySent || ''),
          trackedLink: String(d.trackedLink || ''),
          mode: d.mode === 'semi_auto' ? 'semi_auto' : 'auto',
          status: d.status,
          timestamp: nowLabel,
        };
        setReplyLogs((prev) => [entry, ...prev].slice(0, 200));

        if (d.status === 'replied' || d.status === 'prefilled') {
          if (d.ruleId) {
            setRules((prev) =>
              prev.map((r) =>
                r.id === d.ruleId ? { ...r, repliesSentCount: (r.repliesSentCount || 0) + 1 } : r
              )
            );
          }
          if (d.postUrl) {
            setMonitoredPosts((prev) =>
              prev.map((p) =>
                p.postUrl === d.postUrl
                  ? {
                      ...p,
                      lastCheckedAt: nowLabel,
                      repliesSentCount: (p.repliesSentCount || 0) + 1,
                    }
                  : p
              )
            );
          }
        }
      } else if (d.status === 'scan_complete') {
        if (d.postUrl) {
          setMonitoredPosts((prev) =>
            prev.map((p) => (p.postUrl === d.postUrl ? { ...p, lastCheckedAt: nowLabel } : p))
          );
        }
        onNotifyBanner(
          d.matchedCount > 0
            ? `⚡ Verificação concluída em "${d.groupName || 'post'}": ${d.matchedCount} comentário(s) com gatilho processados!`
            : `🔍 Verificação concluída em "${d.groupName || 'post'}": nenhum novo comentário com gatilho pendente agora.`,
          d.matchedCount > 0 ? 'success' : 'info'
        );
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onNotifyBanner]);

  const triggerCheckPostNow = (post: MonitoredTriggerPost) => {
    const activeRulesCount = rules.filter((r) => r.active).length;
    if (activeRulesCount === 0) {
      onNotifyBanner('⚠️ Ative pelo menos 1 regra Gatilho → Link antes de verificar comentários.', 'warning');
      return;
    }

    // Sync latest rules first, then send check command to Extension
    syncRulesToExtension(false);
    const nowLabel = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setMonitoredPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, lastCheckedAt: `Verificando (${nowLabel})...` } : p))
    );

    try {
      window.postMessage(
        {
          type: 'AUTOVIRAL_CHECK_POST_COMMENTS',
          postId: post.id,
          postUrl: post.postUrl,
          groupName: post.groupName,
          restrictRuleId: post.ruleId || 'all',
          mode: settings.mode,
          minDelaySeconds: settings.minDelaySeconds,
          maxDelaySeconds: settings.maxDelaySeconds,
          maxRepliesPerCheck: settings.maxRepliesPerCheck,
          rules: rules.map((r) => ({
            ...r,
            trackedLinkPreview: buildCommentTriggerTrackedLink(
              r.baseLinkUrl,
              r.enablePresellTracking,
              r.trackingParamName || 'sub2',
              r.name,
              post.groupName
            ),
          })),
        },
        '*'
      );
    } catch {}

    onNotifyBanner(
      `🔍 Abrindo "${post.groupName}" para verificar comentários com gatilho no modo ${settings.mode === 'auto' ? 'Automático Seguro (20–45s)' : 'Semi-Automático (só preenche)'}!`,
      'success'
    );
  };

  // Optional 15-min Auto Round timer
  useEffect(() => {
    if (!settings.autoRoundEnabled) {
      setRoundSecondsLeft((settings.roundIntervalMinutes || 15) * 60);
      return;
    }
    const timer = window.setInterval(() => {
      setRoundSecondsLeft((prev) => {
        if (prev <= 1) {
          if (monitoredPosts.length > 0 && rules.some((r) => r.active)) {
            const target = monitoredPosts[roundIndexRef.current % monitoredPosts.length];
            roundIndexRef.current += 1;
            if (target) triggerCheckPostNow(target);
          }
          return (settings.roundIntervalMinutes || 15) * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [settings.autoRoundEnabled, settings.roundIntervalMinutes, monitoredPosts, rules, settings.mode]);

  const previewFinalLink = useMemo(
    () =>
      buildCommentTriggerTrackedLink(
        baseLinkUrl,
        enablePresellTracking,
        trackingParamName,
        ruleName || 'gatilho'
      ),
    [baseLinkUrl, enablePresellTracking, trackingParamName, ruleName]
  );

  const handleLoadOfferIntoForm = (offerId: string) => {
    setSelectedOfferIdForRule(offerId);
    const found = allOffers.find((o) => o.id === offerId);
    if (!found) return;
    setBaseLinkUrl(found.presellUrl || '');
    setTrackingParamName(found.trackingParamName || 'sub2');
    if (!editingRuleId) {
      setRuleName(`Gatilho · ${found.productName.slice(0, 38)}`);
    }
  };

  const handleSaveRule = () => {
    const parsedKws = parseKeywordsCsv(keywordsInput);
    if (parsedKws.length === 0) {
      onNotifyBanner('⚠️ Informe pelo menos 1 palavra-gatilho (ex.: eu quero, quero, manda, link).', 'warning');
      return;
    }
    if (!baseLinkUrl.trim()) {
      onNotifyBanner('⚠️ Cole o link da sua Presell ou página de venda que será enviado na resposta.', 'warning');
      return;
    }

    const cleanTemplates: [string, string, string] = [
      replyTpl1.trim() || 'Oi [NOME]! 😊 Aqui está o link completo: [LINK]',
      replyTpl2.trim() || 'Claro [NOME]! Veja todos os detalhes aqui: [LINK]',
      replyTpl3.trim() || 'Te enviei aqui [NOME]: [LINK] 💛',
    ];

    if (editingRuleId) {
      setRules((prev) =>
        prev.map((r) =>
          r.id === editingRuleId
            ? {
                ...r,
                name: ruleName.trim() || 'Regra Gatilho → Link',
                keywords: parsedKws,
                offerId: selectedOfferIdForRule || undefined,
                baseLinkUrl: baseLinkUrl.trim(),
                enablePresellTracking,
                trackingParamName: trackingParamName || 'sub2',
                replyTemplates: cleanTemplates,
              }
            : r
        )
      );
      setEditingRuleId(null);
    } else {
      const created: CommentTriggerRule = {
        id: `trule-${Date.now()}`,
        name: ruleName.trim() || `Gatilho · ${parsedKws[0].toUpperCase()}`,
        active: true,
        keywords: parsedKws,
        offerId: selectedOfferIdForRule || undefined,
        baseLinkUrl: baseLinkUrl.trim(),
        enablePresellTracking,
        trackingParamName: trackingParamName || 'sub2',
        replyTemplates: cleanTemplates,
        repliesSentCount: 0,
        createdAt: new Date().toLocaleDateString('pt-BR'),
      };
      setRules((prev) => [created, ...prev]);
    }

    setRuleSavedToast(true);
    window.setTimeout(() => setRuleSavedToast(false), 2400);
    onNotifyBanner(
      '✅ Regra GATILHO → LINK salva e sincronizada com a Extensão! Já pronta para uso na divulgação.',
      'success'
    );
  };

  const handleEditRule = (rule: CommentTriggerRule) => {
    setEditingRuleId(rule.id);
    setRuleName(rule.name);
    setKeywordsInput(rule.keywords.join(', '));
    setSelectedOfferIdForRule(rule.offerId || '');
    setBaseLinkUrl(rule.baseLinkUrl);
    setEnablePresellTracking(rule.enablePresellTracking);
    setTrackingParamName(rule.trackingParamName || 'sub2');
    setReplyTpl1(rule.replyTemplates[0] || '');
    setReplyTpl2(rule.replyTemplates[1] || '');
    setReplyTpl3(rule.replyTemplates[2] || '');
  };

  const handleResetNewRuleForm = () => {
    setEditingRuleId(null);
    setRuleName(
      activeOffer?.productName
        ? `Gatilho · ${activeOffer.productName.slice(0, 38)}`
        : 'Nova Regra Gatilho → Link'
    );
    setKeywordsInput('eu quero, quero, manda, link, valor');
    setSelectedOfferIdForRule(activeOffer?.id || '');
    setBaseLinkUrl(activeOffer?.presellUrl || '');
    setEnablePresellTracking(true);
    setTrackingParamName(activeOffer?.trackingParamName || 'sub2');
  };

  const handleAddMonitoredPost = () => {
    const cleanUrl = newPostUrl.trim();
    if (!cleanUrl || !/facebook\.com/i.test(cleanUrl)) {
      onNotifyBanner('⚠️ Cole um link válido de post ou grupo do Facebook (ex.: https://www.facebook.com/groups/...).', 'warning');
      return;
    }
    if (monitoredPosts.some((p) => p.postUrl === cleanUrl)) {
      onNotifyBanner('ℹ️ Esse post/grupo já está na lista de monitoramento.', 'info');
      return;
    }
    const created: MonitoredTriggerPost = {
      id: `mpost-${Date.now()}`,
      postUrl: cleanUrl,
      groupName: newPostLabel.trim() || cleanUrl.replace(/^https?:\/\/(www\.)?facebook\.com\//i, '').slice(0, 42),
      ruleId: newPostRuleId || 'all',
      addedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      repliesSentCount: 0,
    };
    setMonitoredPosts((prev) => [created, ...prev]);
    setNewPostUrl('');
    setNewPostLabel('');
    onNotifyBanner('✅ Post adicionado! Clique em "🔍 Verificar & Responder Agora" para rodar os gatilhos.', 'success');
  };

  const handleImportRecentPublishedPosts = () => {
    const publishedLogs = botLogs.filter(
      (l) =>
        l.groupUrl &&
        /facebook\.com/i.test(l.groupUrl) &&
        l.approvalStatus !== 'rate_limited' &&
        l.approvalStatus !== 'unavailable'
    );
    if (publishedLogs.length === 0) {
      onNotifyBanner(
        'ℹ️ Ainda não há posts recentes no histórico do Robô Global. Você pode colar qualquer link de post do Facebook manualmente abaixo!',
        'info'
      );
      return;
    }

    const existingUrls = new Set(monitoredPosts.map((p) => p.postUrl));
    const toAdd: MonitoredTriggerPost[] = [];
    for (const log of publishedLogs.slice(0, 12)) {
      if (!log.groupUrl || existingUrls.has(log.groupUrl)) continue;
      existingUrls.add(log.groupUrl);
      toAdd.push({
        id: `mpost-${Date.now()}-${toAdd.length}`,
        postUrl: log.groupUrl,
        groupName: (log.groupName || 'Grupo Facebook').replace(/\s*\([\d.,]+\s*members?\)/i, '').trim(),
        ruleId: 'all',
        addedAt: log.postedAt || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        repliesSentCount: 0,
      });
    }
    if (toAdd.length === 0) {
      onNotifyBanner('ℹ️ Todos os seus posts recentes do histórico já estão na lista de monitoramento!', 'info');
      return;
    }
    setMonitoredPosts((prev) => [...toAdd, ...prev]);
    onNotifyBanner(`📥 ${toAdd.length} grupo(s)/post(s) publicados recentemente foram importados para monitoramento!`, 'success');
  };

  // Live simulator match
  const simulatorResult = useMemo(() => {
    const match = matchCommentAgainstRules(simulatorInput, rules);
    if (!match) return null;
    const link = buildCommentTriggerTrackedLink(
      match.rule.baseLinkUrl,
      match.rule.enablePresellTracking,
      match.rule.trackingParamName || 'sub2',
      match.rule.name,
      'teste'
    );
    const reply = renderTriggerReplyText(match.rule.replyTemplates[0], 'Maria', link);
    return { ...match, link, reply };
  }, [simulatorInput, rules]);

  const activeRulesCount = rules.filter((r) => r.active).length;

  return (
    <div className="space-y-5">
      {/* Top Hero + Mode Switcher + 15-Min Auto Round Bar */}
      <div className="bg-gradient-to-r from-amber-950/50 via-slate-900 to-emerald-950/45 border border-amber-500/40 rounded-xl p-4 space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-200 text-[11px] font-bold">
                <Zap className="w-3.5 h-3.5" />
                FLUXO SIMPLES: GATILHO → LINK PRESELL RASTREADO
              </span>
              <span className="text-[11px] text-emerald-300 font-semibold">
                {activeRulesCount} regra(s) ativa(s) · Conectado à Extensão v1.6.0
              </span>
            </div>
            <h3 className="text-base font-bold text-white">
              Automação de Comentários nos Grupos (Quem comentar “EU QUERO” recebe seu Link!)
            </h3>
            <p className="text-xs text-slate-300 max-w-3xl">
              Cadastre suas palavras-gatilho e o link da sua <strong>Presell / Checkout</strong> abaixo. A Extensão lê os comentários do post no Facebook, <strong>nunca repete a mesma pessoa</strong>, varia a frase com atraso humano (20–45s) e envia seu link rastreado.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => syncRulesToExtension(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer shadow"
            >
              {syncedToast ? <Check className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>{syncedToast ? 'Sincronizado!' : 'Sincronizar com Extensão'}</span>
            </button>
            <button
              type="button"
              onClick={onDownloadExtensionZip}
              disabled={isDownloadingExt}
              className="px-3.5 py-2 bg-cyan-600/25 hover:bg-cyan-600/40 border border-cyan-400/50 text-cyan-100 text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              title="Baixar a Extensão Chrome v1.6.0 com motor de resposta automática nos comentários"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloadingExt ? 'Gerando ZIP...' : 'Baixar Extensão v1.6.0 (.ZIP)'}</span>
            </button>
          </div>
        </div>

        {/* Mode Switcher (Auto vs Semi-Auto) + 15-min Auto Round */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-1">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setSettings((prev) => ({ ...prev, mode: 'auto' }))}
              className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                settings.mode === 'auto'
                  ? 'bg-emerald-950/55 border-emerald-400 ring-1 ring-emerald-400/40'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white inline-flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <span>Automático Seguro (20–45s)</span>
                </span>
                {settings.mode === 'auto' && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/25 text-emerald-200 text-[10px] font-bold">
                    ATIVO
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Extensão encontra quem comentou o gatilho, alterna entre 3 frases, envia o link com intervalo seguro (20–45s) e pula quem já foi respondido.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSettings((prev) => ({ ...prev, mode: 'semi_auto' }))}
              className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                settings.mode === 'semi_auto'
                  ? 'bg-cyan-950/55 border-cyan-400 ring-1 ring-cyan-400/40'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white inline-flex items-center gap-1.5">
                  <Hand className="w-4 h-4 text-cyan-400" />
                  <span>Semi-Automático (Só Preenche)</span>
                </span>
                {settings.mode === 'semi_auto' && (
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/25 text-cyan-200 text-[10px] font-bold">
                    ATIVO
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Extensão abre o comentário da pessoa e já deixa a resposta + link Presell preenchidos na caixa — você apenas aperta Enter para enviar.
              </p>
            </button>
          </div>

          {/* Optional 15-min Auto Round Card */}
          <div
            className={`lg:col-span-5 rounded-xl border p-3 flex flex-col justify-between gap-2 ${
              settings.autoRoundEnabled
                ? 'bg-amber-950/40 border-amber-400/60'
                : 'bg-slate-950 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Clock className={`w-4 h-4 ${settings.autoRoundEnabled ? 'text-amber-300' : 'text-slate-400'}`} />
                <span>Ronda Automática (a cada {settings.roundIntervalMinutes} min)</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSettings((prev) => {
                    const nextEnabled = !prev.autoRoundEnabled;
                    if (nextEnabled && monitoredPosts.length === 0) {
                      onNotifyBanner(
                        'ℹ️ Adicione ou importe pelo menos 1 post na lista abaixo para a Ronda Automática verificar!',
                        'info'
                      );
                    }
                    return { ...prev, autoRoundEnabled: nextEnabled };
                  })
                }
                className={`px-3 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer ${
                  settings.autoRoundEnabled
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {settings.autoRoundEnabled ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{settings.autoRoundEnabled ? 'Pausar Ronda' : 'Ligar Ronda'}</span>
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span>
                {settings.autoRoundEnabled
                  ? `Próxima checagem automática em ${formatClockMmSs(roundSecondsLeft)}`
                  : 'Desligada (use o botão "Verificar Agora" ou ligue a ronda opcional)'}
              </span>
              <span className="font-mono text-[10px] text-emerald-300">
                Máx. {settings.maxRepliesPerCheck} resp./vez
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Builder + Rules List */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left: Simple Visual Rule Creator (GATILHO -> LINK) */}
        <div className="xl:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>
                  {editingRuleId ? 'Editando Regra Gatilho → Link' : '1. Criar / Configurar Regra: GATILHO → LINK'}
                </span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Tudo pronto para usar já na sua divulgação atual — cole seu link da Presell/Checkout e escolha as palavras.
              </p>
            </div>
            {editingRuleId && (
              <button
                type="button"
                onClick={handleResetNewRuleForm}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
              >
                Cancelar edição
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-slate-300">Nome da Regra</span>
              <input
                type="text"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder="Ex.: Atividades Matemática R$ 9,90"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-slate-300">Puxar Link de uma Oferta Salva (Opcional)</span>
              <select
                value={selectedOfferIdForRule}
                onChange={(e) => handleLoadOfferIntoForm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value="">— Inserir link manualmente abaixo —</option>
                {allOffers.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.productName} ({o.countryName})
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Dedicated Prominent Destination / Presell Link Input */}
          <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-3.5 space-y-2.5">
            <label className="block space-y-1">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Link2 className="w-4 h-4" />
                <span>🔗 LINK QUE SERÁ ENVIADO (Cole aqui sua Presell ou Página de Venda):</span>
              </span>
              <input
                type="url"
                value={baseLinkUrl}
                onChange={(e) => setBaseLinkUrl(e.target.value)}
                placeholder="https://sua-presell.vercel.app/produto"
                className="w-full bg-slate-900 border border-emerald-600/50 focus:border-emerald-400 rounded-lg px-3 py-2.5 text-xs font-mono text-emerald-200"
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <label className="inline-flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enablePresellTracking}
                  onChange={(e) => setEnablePresellTracking(e.target.checked)}
                  className="accent-emerald-500"
                />
                <span>Adicionar rastreamento Presell automático (`utm_source` + `{trackingParamName}`)</span>
              </label>
              {previewFinalLink && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        navigator.clipboard?.writeText(previewFinalLink);
                      } catch {}
                      setCopiedKey('rule-link-preview');
                      window.setTimeout(() => setCopiedKey(null), 2000);
                    }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-200 rounded font-semibold cursor-pointer"
                  >
                    {copiedKey === 'rule-link-preview' ? 'Copiado!' : 'Copiar Link'}
                  </button>
                  <a
                    href={previewFinalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-300 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <span>Testar Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
            {previewFinalLink && (
              <div className="text-[11px] font-mono text-slate-400 break-all bg-slate-900/70 rounded px-2.5 py-1.5">
                Link final rastreado: <span className="text-emerald-300">{previewFinalLink}</span>
              </div>
            )}
          </div>

          {/* Keywords (Multi-word triggers) */}
          <div className="space-y-2">
            <label className="block space-y-1">
              <span className="text-xs font-bold text-amber-300">
                ⚡ Palavras-Gatilho (separe por vírgula — ignora acentos e maiúsculas):
              </span>
              <input
                type="text"
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                placeholder="eu quero, quero, manda, link, valor, pdf"
                className="w-full bg-slate-950 border border-amber-500/40 rounded-lg px-3 py-2 text-xs text-white font-semibold"
              />
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Preencher rápido:</span>
              {KEYWORD_PRESET_GROUPS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setKeywordsInput(preset.keywords.join(', '))}
                  className="px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-200 rounded-md cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3 Anti-Spam Reply Variations */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">
                💬 3 Variações de Resposta (alterna sozinho para evitar bloqueio FB):
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Use [NOME] e [LINK]
              </span>
            </div>
            <input
              type="text"
              value={replyTpl1}
              onChange={(e) => setReplyTpl1(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              placeholder="Variação 1..."
            />
            <input
              type="text"
              value={replyTpl2}
              onChange={(e) => setReplyTpl2(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              placeholder="Variação 2..."
            />
            <input
              type="text"
              value={replyTpl3}
              onChange={(e) => setReplyTpl3(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              placeholder="Variação 3..."
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={handleSaveRule}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold rounded-lg inline-flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              {ruleSavedToast ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>
                {ruleSavedToast
                  ? 'Regra Salva e Sincronizada!'
                  : editingRuleId
                  ? '💾 Salvar Alterações da Regra'
                  : '💾 Salvar Nova Regra Gatilho → Link'}
              </span>
            </button>

            <span className="text-[11px] text-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Nunca responde a mesma pessoa 2 vezes
            </span>
          </div>
        </div>

        {/* Right: Active Rules List + Live Simulator */}
        <div className="xl:col-span-5 space-y-4">
          {/* Saved Rules List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">
                2. Regras Ativas ({activeRulesCount}/{rules.length})
              </h4>
              <button
                type="button"
                onClick={handleResetNewRuleForm}
                className="text-[11px] text-cyan-300 hover:underline font-semibold cursor-pointer"
              >
                + Nova Regra
              </button>
            </div>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`rounded-xl border p-3 space-y-2 ${
                    rule.active
                      ? 'bg-slate-950 border-emerald-500/40'
                      : 'bg-slate-950/50 border-slate-800 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{rule.name}</div>
                      <div className="text-[11px] font-mono text-emerald-300 truncate">
                        → {rule.baseLinkUrl}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setRules((prev) =>
                            prev.map((r) => (r.id === rule.id ? { ...r, active: !r.active } : r))
                          )
                        }
                        className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                          rule.active
                            ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {rule.active ? 'Ativa' : 'Pausada'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditRule(rule)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded cursor-pointer"
                        title="Editar regra"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      {rules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setRules((prev) => prev.filter((r) => r.id !== rule.id))}
                          className="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-rose-300 rounded cursor-pointer"
                          title="Excluir regra"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {rule.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/35 text-amber-200 text-[10px] font-bold"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Respostas enviadas: <strong className="text-white">{rule.repliesSentCount || 0}</strong></span>
                    <span>Criada em {rule.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Trigger Simulator */}
          <div className="bg-slate-900 border border-cyan-500/35 rounded-xl p-4 space-y-2.5">
            <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>🧪 Simulador Instantâneo (Teste seu Gatilho Agora)</span>
            </h4>
            <input
              type="text"
              value={simulatorInput}
              onChange={(e) => setSimulatorInput(e.target.value)}
              placeholder='Digite um comentário de teste (ex.: "Eu quero!")'
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
            />
            {simulatorResult ? (
              <div className="bg-emerald-950/35 border border-emerald-500/40 rounded-lg p-2.5 space-y-1 text-xs">
                <div className="text-[11px] font-bold text-emerald-300">
                  ✅ Disparou regra “{simulatorResult.rule.name}” pela palavra “{simulatorResult.matchedKeyword}”
                </div>
                <div className="text-slate-100 break-words">{simulatorResult.reply}</div>
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-400">
                Nenhuma regra ativa dispararia para esse texto. Adicione a palavra desejada na sua regra acima!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STEP 3: Monitored Posts (Ready to use right now on published posts!) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Search className="w-4 h-4 text-emerald-400" />
              <span>3. Posts em Divulgação para Verificar &amp; Responder Comentários ({monitoredPosts.length})</span>
            </h4>
            <p className="text-xs text-slate-400">
              Puxe seus posts já divulgados no histórico ou cole o link de qualquer post/grupo publicado no Facebook para a Extensão ler e responder quem comentou.
            </p>
          </div>
          <button
            type="button"
            onClick={handleImportRecentPublishedPosts}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-emerald-500/45 text-emerald-200 text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>📥 Puxar Posts Já Divulgados ({botLogs.length})</span>
          </button>
        </div>

        {/* Add Post Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 bg-slate-950 border border-slate-800 rounded-xl p-3">
          <input
            type="url"
            value={newPostUrl}
            onChange={(e) => setNewPostUrl(e.target.value)}
            placeholder="Cole o link do post ou grupo no Facebook (https://www.facebook.com/groups/...)"
            className="md:col-span-5 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
          />
          <input
            type="text"
            value={newPostLabel}
            onChange={(e) => setNewPostLabel(e.target.value)}
            placeholder="Nome do grupo (opcional)"
            className="md:col-span-3 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
          />
          <select
            value={newPostRuleId}
            onChange={(e) => setNewPostRuleId(e.target.value)}
            className="md:col-span-2 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white"
          >
            <option value="all">Todas as Regras</option>
            {rules.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddMonitoredPost}
            className="md:col-span-2 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg inline-flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Post</span>
          </button>
        </div>

        {monitoredPosts.length === 0 ? (
          <div className="bg-slate-950 border border-dashed border-slate-700 rounded-xl p-5 text-center text-xs text-slate-400">
            Nenhum post adicionado ainda. Clique em <strong>“📥 Puxar Posts Já Divulgados”</strong> ou cole acima o link de qualquer post seu no Facebook — também funciona clicando em <strong>“⚡ Responder Gatilhos (1C)”</strong> direto no quadrinho da Extensão em qualquer post aberto no Facebook!
          </div>
        ) : (
          <div className="space-y-2">
            {monitoredPosts.map((post) => {
              const linkedRule =
                post.ruleId === 'all' ? null : rules.find((r) => r.id === post.ruleId);
              return (
                <div
                  key={post.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{post.groupName}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-cyan-300 font-semibold">
                        {linkedRule ? linkedRule.name : 'Todas as Regras Ativas'}
                      </span>
                      <span className="text-[10px] text-emerald-300 font-mono">
                        {post.repliesSentCount || 0} resp. enviadas
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 truncate">
                      {post.postUrl}
                    </div>
                    {post.lastCheckedAt && (
                      <div className="text-[10px] text-slate-500">Última checagem: {post.lastCheckedAt}</div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => triggerCheckPostNow(post)}
                      className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>🔍 Verificar &amp; Responder Agora</span>
                    </button>
                    <a
                      href={post.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setMonitoredPosts((prev) => prev.filter((p) => p.id !== post.id))}
                      className="p-2 bg-slate-800 hover:bg-rose-900/60 text-rose-300 rounded-lg cursor-pointer"
                      title="Remover post da lista"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* STEP 4: Real-Time History of Answered Comments */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <History className="w-4 h-4 text-cyan-400" />
            <span>4. Histórico de Comentários Respondidos ({replyLogs.length})</span>
          </h4>
          {replyLogs.length > 0 && (
            <button
              type="button"
              onClick={() => setReplyLogs([])}
              className="text-[11px] text-slate-400 hover:text-rose-300 underline cursor-pointer"
            >
              Limpar histórico visual
            </button>
          )}
        </div>

        {replyLogs.length === 0 ? (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Assim que a Extensão v1.6.0 detectar alguém comentando um dos seus gatilhos (ex.: <strong>“EU QUERO”</strong>), cada resposta enviada com seu link Presell aparecerá registrada aqui em tempo real.
            </span>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {replyLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white">{log.authorName}</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 text-[10px] font-bold">
                      Gatilho: {log.matchedKeyword}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'replied'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : log.status === 'prefilled'
                          ? 'bg-cyan-500/20 text-cyan-200'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {log.status === 'replied'
                        ? 'Respondido ✅'
                        : log.status === 'prefilled'
                        ? 'Preenchido 🖐️'
                        : 'Limite FB 🛡️'}
                    </span>
                    <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    Comentário: “{log.commentSnippet}” · {log.groupName}
                  </div>
                  <div className="text-[11px] text-emerald-300 truncate">{log.replySent}</div>
                </div>
                {log.postUrl && (
                  <a
                    href={log.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-200 text-[11px] font-semibold rounded-md inline-flex items-center gap-1 shrink-0"
                  >
                    <span>Ver Post</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
