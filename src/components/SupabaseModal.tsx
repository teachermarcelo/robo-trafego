import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { Campaign, TrackingEvent } from '../types';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  trackingEvents: TrackingEvent[];
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  campaigns,
  trackingEvents,
}) => {
  const [supabaseUrl, setSupabaseUrl] = useState(() => {
    return localStorage.getItem('autoviral_supabase_url') || '';
  });
  const [supabaseKey, setSupabaseKey] = useState(() => {
    return localStorage.getItem('autoviral_supabase_key') || '';
  });
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>(() => {
    return localStorage.getItem('autoviral_supabase_connected') === 'true' ? 'success' : 'idle';
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const sqlScript = `-- ==============================================================
-- AUTOVIRAL AI: TABELAS EXCLUSIVAS (ISOLADAS)
-- Todas as tabelas usam o prefixo "autoviral_" e IF NOT EXISTS
-- para NUNCA conflitar com nenhuma tabela que você já tenha no Supabase!
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
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

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

-- Ativar RLS (Row Level Security) permissivo para leitura/escrita rápida
ALTER TABLE autoviral_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE autoviral_tracking_events ENABLE ROW LEVEL SECURITY;

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
`;

// Helper to automatically sanitize and fix any Supabase Project URL format
function normalizeSupabaseUrl(input: string): string {
  let cleaned = input.trim();
  // Case 1: User pasted browser dashboard URL (e.g. https://supabase.com/dashboard/project/abcdefgh)
  const dashboardMatch = cleaned.match(/supabase\.com\/dashboard\/project\/([a-zA-Z0-9_-]+)/);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // Case 2: User pasted only the project ID (e.g. nuyzvpkvawixidot)
  if (!cleaned.includes('.') && !cleaned.includes('/') && cleaned.length >= 8) {
    return `https://${cleaned}.supabase.co`;
  }

  // Ensure protocol
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }

  try {
    const urlObj = new URL(cleaned);
    let host = urlObj.hostname;

    // If host doesn't have .supabase.co, append it
    if (!host.includes('.')) {
      host = `${host}.supabase.co`;
    } else if (!host.endsWith('.supabase.co') && !host.endsWith('.supabase.in') && !host.includes('localhost')) {
      // If user pasted something like nuyzvpkvawixidot.something, check if the first part is project id
      const parts = host.split('.');
      if (parts[0]) {
        host = `${parts[0]}.supabase.co`;
      }
    }

    return `https://${host}`;
  } catch {
    // Fallback: strip any slashes and append .supabase.co
    const cleanId = cleaned.replace(/https?:\/\//, '').split('/')[0];
    return `https://${cleanId.endsWith('.supabase.co') ? cleanId : cleanId + '.supabase.co'}`;
  }
}

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlScript);
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

    // Sanitize URL
    const cleanUrl = normalizeSupabaseUrl(supabaseUrl);
    setSupabaseUrl(cleanUrl); // Update input field so user sees the valid format

    setIsTesting(true);
    setStatusMessage(null);

    try {
      const client = createClient(cleanUrl, supabaseKey.trim(), {
        auth: { persistSession: false },
      });
      // Test querying or inserting into autoviral_campaigns
      const { data, error } = await client.from('autoviral_campaigns').select('id').limit(1);

      if (error && error.code !== 'PGRST116') {
        // Table might not exist yet, explain to run SQL
        if (
          error.message.includes('relation "autoviral_campaigns" does not exist') ||
          error.code === '42P01' ||
          error.message.includes('not exist')
        ) {
          setStatusMessage(
            'Conexão com o Supabase estabelecida! Agora cole o script SQL acima no SQL Editor do seu Supabase para criar as tabelas autoviral_.'
          );
          setConnectionStatus('success');
          localStorage.setItem('autoviral_supabase_url', cleanUrl);
          localStorage.setItem('autoviral_supabase_key', supabaseKey.trim());
          localStorage.setItem('autoviral_supabase_connected', 'true');
          return;
        }
        throw error;
      }

      // Sync campaigns to Supabase
      for (const camp of campaigns) {
        await client.from('autoviral_campaigns').upsert({
          id: camp.id,
          title: camp.title,
          niche: camp.niche,
          niche_label: camp.nicheLabel,
          target_audience: camp.targetAudience,
          pain_point: camp.painPointTargeted,
          checkout_url: camp.checkoutUrl,
          whatsapp_number: camp.whatsappNumber,
          price: camp.price,
          status: camp.status,
          revenue: camp.revenue,
          conversions: camp.conversions,
          clicks: camp.clicks,
          impressions: camp.impressions,
        });
      }

      localStorage.setItem('autoviral_supabase_url', cleanUrl);
      localStorage.setItem('autoviral_supabase_key', supabaseKey.trim());
      localStorage.setItem('autoviral_supabase_connected', 'true');
      setConnectionStatus('success');
      setStatusMessage('Sucesso! Seu projeto Supabase está conectado e sincronizado com as tabelas autoviral_!');
    } catch (err: any) {
      console.error(err);
      setConnectionStatus('error');
      setStatusMessage(`Erro ao conectar com o Supabase: ${err.message || 'Verifique sua URL e chave Anon'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('autoviral_supabase_url');
    localStorage.removeItem('autoviral_supabase_key');
    localStorage.removeItem('autoviral_supabase_connected');
    setSupabaseUrl('');
    setSupabaseKey('');
    setConnectionStatus('idle');
    setStatusMessage('Desconectado do Supabase.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Conectar seu Projeto Supabase</span>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                  100% Gratuito & Sem Conflitos
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Usa apenas tabelas isoladas com prefixo <code className="text-emerald-300">autoviral_</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
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
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Script SQL para Criar as Tabelas no seu Supabase</span>
              </span>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
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
              No painel do seu Supabase, clique em <strong>SQL Editor &gt; New Query</strong>, cole o código abaixo e clique em <strong>Run</strong>. Ele cria apenas as tabelas <code className="text-emerald-300">autoviral_campaigns</code> e <code className="text-emerald-300">autoviral_tracking_events</code> sem tocar nas suas tabelas existentes!
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
              <span>Credenciais do seu Projeto Supabase</span>
            </span>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Project URL (Ex: https://abcdefghijklm.supabase.co)
              </label>
              <input
                type="url"
                required
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://seu-projeto.supabase.co"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Project API Key (Anon / Public Key)
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
                Você encontra isso em: Supabase &gt; Project Settings &gt; API &gt; Project API keys (anon / public).
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {connectionStatus === 'success' && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-xs text-rose-400 hover:text-rose-300"
                >
                  Desconectar Supabase
                </button>
              )}

              <button
                type="submit"
                disabled={isTesting}
                className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg transition active:scale-95"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Conectando...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Testar e Sincronizar Agora</span>
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
