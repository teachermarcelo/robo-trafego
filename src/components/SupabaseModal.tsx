import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Zap,
  Download,
  ShieldCheck,
} from 'lucide-react';
import {
  getPrimaryCloudProvider,
  setPrimaryCloudProvider,
  pushLocalSnapshotToSupabase,
  fetchAllAutoViralFromSupabase,
  getEffectiveSupabaseCredentials,
  isSupabaseConnected,
  createResilientSupabaseClient,
  cleanSupabaseCredentialUrl,
  cleanSupabaseCredentialKey,
  validateSupabaseKeyWarning,
  isUsingSupabaseProxy,
} from '../lib/supabaseClient';

import { Campaign, TrackingEvent } from '../types';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  trackingEvents: TrackingEvent[];
  onSyncFromSupabase?: () => Promise<void>;
}

const DEFAULT_FLUENT_URL = 'https://nuyzvpkvawixidotuuio.supabase.co';

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  campaigns,
  onSyncFromSupabase,
}) => {
  const [supabaseUrl, setSupabaseUrl] = useState(() => {
    return getEffectiveSupabaseCredentials().url || DEFAULT_FLUENT_URL;
  });
  const [supabaseKey, setSupabaseKey] = useState(() => {
    return getEffectiveSupabaseCredentials().key;
  });
  const [autoFailover, setAutoFailover] = useState<boolean>(() => {
    try {
      return localStorage.getItem('autoviral_auto_failover') !== 'disabled';
    } catch {
      return true;
    }
  });
  const [isTesting, setIsTesting] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>(() => {
    return isSupabaseConnected() ? 'success' : 'idle';
  });
  const [primaryDb, setPrimaryDb] = useState<'supabase' | 'firebase'>(() => getPrimaryCloudProvider());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const sqlScript = `-- ==============================================================
-- AUTOVIRAL AI: TABELAS EXCLUSIVAS (100% ISOLADAS)
-- Usa apenas o prefixo "autoviral_" com IF NOT EXISTS.
-- NUNCA altera nem conflita com tabelas do fluentimmersion!
-- ==============================================================

-- 1. Tabela de Campanhas & Produtos
CREATE TABLE IF NOT EXISTS autoviral_campaigns (
  id text PRIMARY KEY,
  title text NOT NULL,
  niche text,
  niche_label text,
  target_audience text,
  pain_point text,
  checkout_url text,
  whatsapp_number text,
  price numeric DEFAULT 97.00,
  status text DEFAULT 'active',
  revenue numeric DEFAULT 0,
  conversions int DEFAULT 0,
  clicks int DEFAULT 0,
  impressions int DEFAULT 0,
  extra_json jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE autoviral_campaigns
ADD COLUMN IF NOT EXISTS extra_json jsonb DEFAULT '{}'::jsonb;

-- 2. Tabela de Telemetria e Leads Rastreados em Tempo Real
CREATE TABLE IF NOT EXISTS autoviral_tracking_events (
  id text PRIMARY KEY,
  campaign_id text,
  campaign_title text,
  niche text,
  type text,
  geo_city text,
  geo_state text,
  source text,
  device text,
  age_bracket text,
  lead_score int,
  amount numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 3. Tabela Completa de Públicos, Grupos (Brasil & Global), Copys e Lixeira
CREATE TABLE IF NOT EXISTS autoviral_workspace_store (
  key text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Ativar RLS permissivo apenas nas tabelas autoviral_*
ALTER TABLE autoviral_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE autoviral_tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE autoviral_workspace_store ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso público anônimo de leitura/escrita AutoViral" ON autoviral_campaigns;
CREATE POLICY "Acesso público anônimo de leitura/escrita AutoViral"
ON autoviral_campaigns FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso público anônimo de tracking AutoViral" ON autoviral_tracking_events;
CREATE POLICY "Acesso público anônimo de tracking AutoViral"
ON autoviral_tracking_events FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso público anônimo workspace AutoViral" ON autoviral_workspace_store;
CREATE POLICY "Acesso público anônimo workspace AutoViral"
ON autoviral_workspace_store FOR ALL
USING (true)
WITH CHECK (true);

-- Garantir permissões e atualizar imediatamente o schema cache da API do Supabase
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.autoviral_campaigns TO anon, authenticated;
GRANT ALL ON TABLE public.autoviral_tracking_events TO anon, authenticated;
GRANT ALL ON TABLE public.autoviral_workspace_store TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
`;

  function normalizeSupabaseUrl(input: string): string {
    const preCleaned = cleanSupabaseCredentialUrl(input);
    let cleaned = preCleaned.replace(/[\s"'`<>\u200B-\u200D\uFEFF]+/g, '');
    const dashboardMatch = cleaned.match(/supabase\.com\/dashboard\/project\/([a-zA-Z0-9_-]+)/i);
    if (dashboardMatch && dashboardMatch[1]) {
      return `https://${dashboardMatch[1]}.supabase.co`;
    }
    const supaHostMatch = cleaned.match(/(?:db\.)?([a-zA-Z0-9_-]+)\.supabase\.(co|in)/i);
    if (supaHostMatch && supaHostMatch[1]) {
      return `https://${supaHostMatch[1]}.supabase.${supaHostMatch[2].toLowerCase()}`;
    }
    if (!cleaned.includes('.') && !cleaned.includes('/') && cleaned.length >= 8) {
      return `https://${cleaned}.supabase.co`;
    }
    if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
      cleaned = `https://${cleaned}`;
    }
    try {
      const urlObj = new URL(cleaned);
      let host = urlObj.hostname.replace(/^db\./i, '');
      if (!host.includes('.')) {
        host = `${host}.supabase.co`;
      } else if (!host.endsWith('.supabase.co') && !host.endsWith('.supabase.in') && !host.includes('localhost')) {
        const parts = host.split('.');
        if (parts[0]) {
          host = `${parts[0]}.supabase.co`;
        }
      }
      return `https://${host}`;
    } catch {
      const cleanId = cleaned.replace(/https?:\/\//i, '').replace(/^db\./i, '').split('/')[0];
      return `https://${cleanId.endsWith('.supabase.co') ? cleanId : cleanId + '.supabase.co'}`;
    }
  }

  function sanitizeKey(input: string): string {
    return cleanSupabaseCredentialKey(input);
  }

  const handleCopySql = () => {
    try {
      navigator.clipboard?.writeText(sqlScript);
    } catch {}
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleToggleAutoFailover = () => {
    const next = !autoFailover;
    setAutoFailover(next);
    try {
      localStorage.setItem('autoviral_auto_failover', next ? 'enabled' : 'disabled');
    } catch {}
  };

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawUrl = supabaseUrl.replace(/[\s"'`<>\u200B-\u200D\uFEFF]+/g, '');
    const cleanKey = sanitizeKey(supabaseKey);

    if (!rawUrl || !cleanKey) {
      setStatusMessage('Preencha a URL do Projeto e a chave Anon/Publishable do Supabase.');
      setConnectionStatus('error');
      return;
    }

    if (rawUrl.startsWith('eyJ') || rawUrl.startsWith('sb_') || cleanKey.startsWith('http')) {
      setStatusMessage(
        'Parece que a URL e a Chave Anon foram coladas nos campos invertidos! Coloque "https://...supabase.co" em Project URL e a chave (eyJ... ou sb_publishable_...) em Project API Key.'
      );
      setConnectionStatus('error');
      return;
    }

    const keyWarning = validateSupabaseKeyWarning(cleanKey);
    if (keyWarning) {
      setStatusMessage(keyWarning);
      setConnectionStatus('error');
      return;
    }

    const cleanUrl = normalizeSupabaseUrl(rawUrl);
    setSupabaseUrl(cleanUrl);
    setSupabaseKey(cleanKey);
    setIsTesting(true);
    setStatusMessage(null);

    try {
      const client = createResilientSupabaseClient(cleanUrl, cleanKey);

      let campCheck = await client.from('autoviral_campaigns').select('id').limit(1);
      if (
        campCheck.error &&
        (campCheck.error.code === 'PGRST205' || campCheck.error.message?.includes('schema cache'))
      ) {
        await new Promise((r) => setTimeout(r, 2000));
        campCheck = await client.from('autoviral_campaigns').select('id').limit(1);
      }

      const campErr = campCheck.error;
      if (
        campErr &&
        (campErr.code === '42P01' ||
          campErr.code === 'PGRST205' ||
          campErr.message?.includes('does not exist') ||
          campErr.message?.includes('not exist') ||
          campErr.message?.includes('schema cache'))
      ) {
        localStorage.setItem('autoviral_supabase_url', cleanUrl);
        localStorage.setItem('autoviral_supabase_key', cleanKey);
        localStorage.setItem('autoviral_supabase_connected', 'false');
        setConnectionStatus('error');
        const isSchemaCache = campErr.code === 'PGRST205' || campErr.message?.includes('schema cache');
        setStatusMessage(
          isSchemaCache
            ? `Tabela não encontrada no cache de ${cleanUrl}. Confira se a URL bate com o projeto onde você rodou o SQL, rode "NOTIFY pgrst, 'reload schema';" no SQL Editor e clique em Testar novamente.`
            : `Conexão com ${cleanUrl} OK, mas faltam as tabelas! Copie o Script SQL do Passo 1 acima, cole no SQL Editor (Run) e clique em Testar novamente.`
        );
        return;
      }

      if (campErr && campErr.code !== 'PGRST116') {
        throw campErr;
      }

      // Store credentials and activate Supabase as Primary DB
      localStorage.setItem('autoviral_supabase_url', cleanUrl);
      localStorage.setItem('autoviral_supabase_key', cleanKey);
      localStorage.setItem('autoviral_supabase_connected', 'true');

      // Migrate ALL local campaigns, Global audiences/groups (e.g. oraciones 1), Brazil audiences/groups, copies, trash
      const pushRes = await pushLocalSnapshotToSupabase(campaigns);

      if (pushRes.missingStoreTable) {
        localStorage.setItem('autoviral_supabase_connected', 'false');
        setConnectionStatus('error');
        setStatusMessage(
          'Falta criar a nova tabela "autoviral_workspace_store"! Copie o SQL atualizado no Passo 1, rode no SQL Editor do Supabase (é 100% seguro, não mexe no fluentimmersion) e clique em Testar novamente.'
        );
        return;
      }

      if (!pushRes.ok && pushRes.error) {
        localStorage.setItem('autoviral_supabase_connected', 'false');
        setConnectionStatus('error');
        setStatusMessage(`Erro ao migrar dados para ${cleanUrl}: ${pushRes.error}`);
        return;
      }

      setPrimaryCloudProvider('supabase');
      setPrimaryDb('supabase');
      setConnectionStatus('success');
      if (onSyncFromSupabase) {
        await onSyncFromSupabase().catch(() => {});
      }

      const viaProxyNote = isUsingSupabaseProxy() ? ' (via Proxy Anti-Bloqueio do servidor!)' : '';
      setStatusMessage(
        `✅ Supabase conectado e ativado como BANCO PRINCIPAL${viaProxyNote}! (${pushRes.campaignsSaved} campanhas + Públicos & Grupos Globais/Brasil + Lixeira sincronizados com zero limite diário do Firebase).`
      );
    } catch (err: any) {
      console.error(err);
      setConnectionStatus('error');
      const msg = err?.message || String(err || '');
      if (msg.toLowerCase().includes('failed to fetch')) {
        setStatusMessage(
          `Não foi possível alcançar "${cleanUrl}" neste navegador mesmo pelo Proxy (Failed to fetch). Pause o bloqueador de anúncios para este site, confira se a Project URL é exatamente "https://nuyzvpkvawixidotuuio.supabase.co" e tente novamente.`
        );
      } else {
        setStatusMessage(`Erro ao conectar em ${cleanUrl}: ${msg || 'Verifique sua URL e chave Anon'}`);
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handlePullNow = async () => {
    setIsPulling(true);
    setStatusMessage(null);
    try {
      const snap = await fetchAllAutoViralFromSupabase();
      if (snap.missingStoreTable) {
        setConnectionStatus('error');
        setStatusMessage('Rode o Script SQL do Passo 1 no SQL Editor do Supabase para criar autoviral_workspace_store.');
        return;
      }
      if (onSyncFromSupabase) {
        await onSyncFromSupabase();
      }
      const globalAudCount = Array.isArray(snap.globalWorkspace?.globalAudiences)
        ? snap.globalWorkspace.globalAudiences.length
        : 0;
      const brAudCount = Array.isArray(snap.workspace?.audiences) ? snap.workspace.audiences.length : 0;
      setConnectionStatus('success');
      setStatusMessage(
        `⬇️ Dados baixados do Supabase: ${snap.campaigns.length} campanhas, ${globalAudCount} públicos globais e ${brAudCount} públicos Brasil!`
      );
    } catch (err: any) {
      setConnectionStatus('error');
      setStatusMessage(`Erro ao puxar do Supabase: ${err?.message || String(err)}`);
    } finally {
      setIsPulling(false);
    }
  };

  const handleSwitchProvider = (target: 'supabase' | 'firebase') => {
    setPrimaryCloudProvider(target);
    setPrimaryDb(target);
    setStatusMessage(
      target === 'supabase'
        ? '🟢 Banco Principal alterado para SUPABASE! O Firebase não será mais usado nem exibirá erro de cota.'
        : '🟡 Banco Principal alterado para FIREBASE.'
    );
  };

  const handleDisconnect = () => {
    localStorage.removeItem('autoviral_supabase_url');
    localStorage.removeItem('autoviral_supabase_key');
    localStorage.setItem('autoviral_supabase_connected', 'false');
    setPrimaryCloudProvider('firebase');
    setPrimaryDb('firebase');
    setSupabaseUrl('');
    setSupabaseKey('');
    setConnectionStatus('idle');
    setStatusMessage('Desconectado do Supabase. Voltou para o Firebase.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Trocar Banco para Supabase (ex: fluentimmersion)</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                  100% Isolado
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Cria apenas tabelas <code className="text-emerald-300">autoviral_*</code> — zero conflito com seu projeto{' '}
                <strong className="text-slate-200">fluentimmersion</strong>!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Active DB Provider Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-4 h-4 ${primaryDb === 'supabase' ? 'text-emerald-400' : 'text-amber-400'}`} />
              <div>
                <div className="text-xs font-bold text-white">
                  Banco em uso agora:{' '}
                  <span className={primaryDb === 'supabase' ? 'text-emerald-400' : 'text-amber-300'}>
                    {primaryDb === 'supabase' ? '🟢 SUPABASE (Principal · Sem Cota Spark)' : '🟡 FIREBASE'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {primaryDb === 'supabase'
                    ? 'Campanhas, Públicos Globais/Brasil, Lixeira e Grupos salvam direto no seu Supabase.'
                    : 'Conecte seu projeto Supabase abaixo para substituir o Firebase em 1 clique.'}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleToggleAutoFailover}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer transition ${
                  autoFailover
                    ? 'bg-cyan-950/70 text-cyan-200 border-cyan-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
                title="Quando a cota do Firebase chegar ao limite, ativa o Supabase automaticamente se as chaves estiverem preenchidas"
              >
                {autoFailover ? '⚡ Troca Automática por Cota: ON' : '⚡ Troca Automática por Cota: OFF'}
              </button>
              {connectionStatus === 'success' && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSwitchProvider('supabase')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                      primaryDb === 'supabase'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Usar Supabase
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchProvider('firebase')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                      primaryDb === 'firebase'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Usar Firebase
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Status Alert */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                connectionStatus === 'success'
                  ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
                  : 'bg-rose-950/80 border-rose-700 text-rose-200'
              }`}
            >
              {connectionStatus === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{statusMessage}</span>
            </div>
          )}

          {/* Step 1: SQL Script with 1-click copy */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Script SQL Isolado (Cole 1x no SQL Editor do fluentimmersion)</span>
              </span>
              <button
                type="button"
                onClick={handleCopySql}
                className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition cursor-pointer shrink-0"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar SQL</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              No seu projeto <strong>fluentimmersion</strong> no Supabase: abra{' '}
              <strong>SQL Editor &gt; New Query</strong>, cole o código abaixo e clique em <strong>Run</strong>. Ele
              usa apenas <code>autoviral_campaigns</code>, <code>autoviral_tracking_events</code> e{' '}
              <code>autoviral_workspace_store</code> — nunca mexe em nenhuma tabela do FluentImmersion!
            </p>
            <pre className="p-3 bg-slate-950 rounded-xl text-[10px] font-mono text-slate-300 overflow-x-auto max-h-36 border border-slate-800 scrollbar-thin">
              {sqlScript}
            </pre>
          </div>

          {/* Step 2: Connection Credentials */}
          <form onSubmit={handleSaveAndTest} className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 space-y-3">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Credenciais do Projeto Supabase (Settings &gt; API)</span>
            </span>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <label className="text-[11px] font-semibold text-slate-400">
                  Project URL (fluent-immersion já preenchido)
                </label>
                <button
                  type="button"
                  onClick={() => setSupabaseUrl(DEFAULT_FLUENT_URL)}
                  className="text-[10px] font-semibold text-cyan-300 hover:text-cyan-200 underline cursor-pointer"
                >
                  Usar fluent-immersion (nuyzvpkvawixidotuuio)
                </button>
              </div>
              <input
                type="text"
                required
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://nuyzvpkvawixidotuuio.supabase.co"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <label className="text-[11px] font-semibold text-slate-400">
                  Project API Key (Anon / Publishable — começa com eyJ... ou sb_publishable_...)
                </label>
                <a
                  href="https://supabase.com/dashboard/project/nuyzvpkvawixidotuuio/settings/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-emerald-300 hover:text-emerald-200 underline"
                >
                  Abrir API Keys do fluent-immersion ↗
                </a>
              </div>
              <input
                type="text"
                required
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="Cole aqui sua chave anon public (eyJ...) ou sb_publishable_..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Proxy Anti-Bloqueio ativo: se extensões do Chrome bloquearem *.supabase.co, o sistema conecta automaticamente pelo servidor!
              </span>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {connectionStatus === 'success' && (
                  <>
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
                    >
                      Desconectar
                    </button>
                    <button
                      type="button"
                      onClick={handlePullNow}
                      disabled={isPulling}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-cyan-500/40 text-cyan-200 font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isPulling ? 'Baixando...' : 'Baixar do Supabase'}</span>
                    </button>
                  </>
                )}
              </div>

              <button
                type="submit"
                disabled={isTesting}
                className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg transition active:scale-95 cursor-pointer"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Conectando &amp; Migrando...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Testar, Migrar Tudo &amp; Ativar Supabase</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Tip for robo-trafego.vercel.app & multi-device auto-connect */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-[11px] text-slate-400">
            <p className="font-bold text-cyan-300">
              💡 Quer que o site no Vercel (<code className="text-emerald-300">robo-trafego.vercel.app</code>) e o celular já abram conectados no Supabase automaticamente?
            </p>
            <p className="leading-relaxed">
              1. Exporte este código atualizado para o GitHub (para atualizar o build no Vercel). 2. No painel do Vercel &gt;{' '}
              <strong>Settings &gt; Environment Variables</strong>, adicione{' '}
              <code className="text-slate-200">VITE_SUPABASE_URL</code> e{' '}
              <code className="text-slate-200">VITE_SUPABASE_ANON_KEY</code> com os mesmos valores acima e faça Redeploy. Assim qualquer aparelho entra direto no Supabase!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
