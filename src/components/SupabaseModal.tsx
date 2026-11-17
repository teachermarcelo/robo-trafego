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
import { createClient } from '@supabase/supabase-js';
import { Campaign, TrackingEvent } from '../types';
import {
  getPrimaryCloudProvider,
  setPrimaryCloudProvider,
  pushLocalSnapshotToSupabase,
  fetchAllAutoViralFromSupabase,
} from '../lib/supabaseClient';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  trackingEvents: TrackingEvent[];
  onSyncFromSupabase?: () => Promise<void>;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  campaigns,
  onSyncFromSupabase,
}) => {
  const [supabaseUrl, setSupabaseUrl] = useState(() => {
    return localStorage.getItem('autoviral_supabase_url') || '';
  });
  const [supabaseKey, setSupabaseKey] = useState(() => {
    return localStorage.getItem('autoviral_supabase_key') || '';
  });
  const [isTesting, setIsTesting] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>(() => {
    return localStorage.getItem('autoviral_supabase_connected') === 'true' ? 'success' : 'idle';
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
`;

  function normalizeSupabaseUrl(input: string): string {
    let cleaned = input.trim();
    const dashboardMatch = cleaned.match(/supabase\.com\/dashboard\/project\/([a-zA-Z0-9_-]+)/);
    if (dashboardMatch && dashboardMatch[1]) {
      return `https://${dashboardMatch[1]}.supabase.co`;
    }
    if (!cleaned.includes('.') && !cleaned.includes('/') && cleaned.length >= 8) {
      return `https://${cleaned}.supabase.co`;
    }
    if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
      cleaned = `https://${cleaned}`;
    }
    try {
      const urlObj = new URL(cleaned);
      let host = urlObj.hostname;
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
      const cleanId = cleaned.replace(/https?:\/\//, '').split('/')[0];
      return `https://${cleanId.endsWith('.supabase.co') ? cleanId : cleanId + '.supabase.co'}`;
    }
  }

  const handleCopySql = () => {
    try {
      navigator.clipboard?.writeText(sqlScript);
    } catch {}
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      setStatusMessage('Preencha a URL do Projeto e a chave Anon do Supabase.');
      setConnectionStatus('error');
      return;
    }

    const cleanUrl = normalizeSupabaseUrl(supabaseUrl);
    setSupabaseUrl(cleanUrl);
    setIsTesting(true);
    setStatusMessage(null);

    try {
      const client = createClient(cleanUrl, supabaseKey.trim(), {
        auth: { persistSession: false },
      });

      const { error: campErr } = await client.from('autoviral_campaigns').select('id').limit(1);
      if (
        campErr &&
        (campErr.code === '42P01' || campErr.message?.includes('does not exist') || campErr.message?.includes('not exist'))
      ) {
        localStorage.setItem('autoviral_supabase_url', cleanUrl);
        localStorage.setItem('autoviral_supabase_key', supabaseKey.trim());
        localStorage.setItem('autoviral_supabase_connected', 'true');
        setConnectionStatus('error');
        setStatusMessage(
          'Conexão OK, mas faltam as tabelas! Copie o Script SQL do Passo 1 acima, cole no SQL Editor do seu projeto no Supabase (Run) e clique em "Testar, Migrar Tudo & Ativar" novamente.'
        );
        return;
      }

      if (campErr && campErr.code !== 'PGRST116') {
        throw campErr;
      }

      // Store credentials and activate Supabase as Primary DB
      localStorage.setItem('autoviral_supabase_url', cleanUrl);
      localStorage.setItem('autoviral_supabase_key', supabaseKey.trim());
      localStorage.setItem('autoviral_supabase_connected', 'true');

      // Migrate ALL local campaigns, Global audiences/groups (e.g. oraciones 1), Brazil audiences/groups, copies, trash
      const pushRes = await pushLocalSnapshotToSupabase(campaigns);

      if (pushRes.missingStoreTable) {
        setConnectionStatus('error');
        setStatusMessage(
          'Falta criar a nova tabela "autoviral_workspace_store"! Copie o SQL atualizado no Passo 1, rode no SQL Editor do Supabase (é 100% seguro, não mexe no fluentimmersion) e clique em Testar novamente.'
        );
        return;
      }

      setPrimaryCloudProvider('supabase');
      setPrimaryDb('supabase');
      setConnectionStatus('success');
      if (onSyncFromSupabase) {
        await onSyncFromSupabase().catch(() => {});
      }

      setStatusMessage(
        `✅ Supabase conectado e ativado como BANCO PRINCIPAL! (${pushRes.campaignsSaved} campanhas + Públicos & Grupos Globais/Brasil + Lixeira sincronizados com zero limite diário do Firebase).`
      );
    } catch (err: any) {
      console.error(err);
      setConnectionStatus('error');
      setStatusMessage(`Erro ao conectar com o Supabase: ${err.message || 'Verifique sua URL e chave Anon'}`);
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
    localStorage.removeItem('autoviral_supabase_connected');
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
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Project URL (Ex: https://abcdefghijklm.supabase.co)
              </label>
              <input
                type="text"
                required
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://seu-projeto.supabase.co"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Project API Key (Anon / Public Key — começa com eyJ... ou sb_publishable_...)
              </label>
              <input
                type="text"
                required
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Supabase &gt; Project Settings &gt; Data API / API Keys &gt; Project URL + anon public key.
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
        </div>
      </div>
    </div>
  );
};
