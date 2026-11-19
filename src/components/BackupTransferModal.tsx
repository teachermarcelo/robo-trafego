import React, { useMemo, useState } from 'react';
import {
  X,
  Download,
  Upload,
  CloudUpload,
  Copy,
  Check,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  HardDrive,
} from 'lucide-react';
import { Campaign, TrackingEvent, CustomerLead } from '../types';
import {
  getWorkspaceInventoryStats,
  collectFullWorkspaceBackup,
} from '../utils/fullBackupSync';
import { isSupabaseConnected } from '../lib/supabaseClient';

interface BackupTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  trackingEvents: TrackingEvent[];
  customerLeads: CustomerLead[];
  onExportBackup: (includeCredentials?: boolean) => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onSaveCloudAndGenerateLink: (includeCredentials: boolean) => Promise<{
    ok: boolean;
    code?: string;
    magicUrl?: string;
    message: string;
  }>;
  onRestoreByCode: (code: string) => Promise<{ ok: boolean; message: string }>;
  backupRestoreStatus: string | null;
}

export const BackupTransferModal: React.FC<BackupTransferModalProps> = ({
  isOpen,
  onClose,
  campaigns,
  trackingEvents,
  customerLeads,
  onExportBackup,
  onImportBackup,
  onSaveCloudAndGenerateLink,
  onRestoreByCode,
  backupRestoreStatus,
}) => {
  const [includeCredentials, setIncludeCredentials] = useState(true);
  const [isGeneratingVault, setIsGeneratingVault] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [vaultFeedback, setVaultFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const [inputCode, setInputCode] = useState('');
  const [isRestoringCode, setIsRestoringCode] = useState(false);

  const stats = useMemo(() => {
    if (!isOpen) {
      return {
        campaigns: campaigns.length,
        brazilGroups: 0,
        brazilAudiences: 0,
        globalOffers: 0,
        globalAudiences: 0,
        globalGroups: 0,
        globalKits: 0,
        savedCopies: 0,
        totalKeys: 0,
      };
    }
    return getWorkspaceInventoryStats(campaigns);
  }, [isOpen, campaigns, trackingEvents, customerLeads]);

  if (!isOpen) return null;

  const handleGenerateMagicLink = async () => {
    setIsGeneratingVault(true);
    setVaultFeedback(null);
    try {
      const res = await onSaveCloudAndGenerateLink(includeCredentials);
      if (res.ok && res.code && res.magicUrl) {
        setGeneratedCode(res.code);
        setGeneratedUrl(res.magicUrl);
      }
      setVaultFeedback({ ok: res.ok, text: res.message });
    } catch (err: any) {
      setVaultFeedback({ ok: false, text: err?.message || 'Erro ao gerar link de transferência.' });
    } finally {
      setIsGeneratingVault(false);
    }
  };

  const handleRestoreCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputCode.trim();
    if (!clean) return;
    setIsRestoringCode(true);
    setVaultFeedback(null);
    try {
      const res = await onRestoreByCode(clean);
      setVaultFeedback({ ok: res.ok, text: res.message });
      if (res.ok) setInputCode('');
    } finally {
      setIsRestoringCode(false);
    }
  };

  const handleCopy = (val: string, type: 'link' | 'code') => {
    try {
      navigator.clipboard?.writeText(val);
    } catch {}
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2200);
    }
  };

  // Preview size for confidence
  const approxBackupKb = useMemo(() => {
    try {
      const snap = collectFullWorkspaceBackup(campaigns, trackingEvents, customerLeads, {
        includeCredentials,
      });
      return Math.max(1, Math.round(JSON.stringify(snap).length / 1024));
    } catch {
      return 0;
    }
  }, [campaigns, trackingEvents, customerLeads, includeCredentials]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Salvar Tudo &amp; Usar em Outro Navegador (Até Aba Anônima)
              </h2>
              <p className="text-xs text-slate-400">
                Preserva 100% das campanhas, grupos Brasil &amp; Global, públicos, kits, copys, leads e configurações.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs">
          {/* Live Inventory Diagnostic */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Tudo que será preservado agora (sem perder nada):
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {stats.totalKeys} chaves • ~{approxBackupKb} KB
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2">
                <span className="text-slate-400 block">Campanhas / Landings</span>
                <strong className="text-white text-sm">{stats.campaigns}</strong>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2">
                <span className="text-slate-400 block">Grupos Brasil</span>
                <strong className="text-emerald-300 text-sm">
                  {stats.brazilGroups} ({stats.brazilAudiences} púb.)
                </strong>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2">
                <span className="text-slate-400 block">Grupos Global</span>
                <strong className="text-cyan-300 text-sm">
                  {stats.globalGroups} ({stats.globalAudiences} púb.)
                </strong>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2">
                <span className="text-slate-400 block">Ofertas, Kits &amp; Copys</span>
                <strong className="text-amber-300 text-sm">
                  {stats.globalOffers} of. • {stats.globalKits} kits • {stats.savedCopies} copys
                </strong>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2 pt-1">
              <span>
                Banco ativo:{' '}
                <strong className="text-white">
                  {isSupabaseConnected() ? 'Supabase + Firebase (Dupla Proteção)' : 'Firebase Nuvem + Servidor Local'}
                </strong>
              </span>
              <label className="inline-flex items-center gap-1.5 text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeCredentials}
                  onChange={(e) => setIncludeCredentials(e.target.checked)}
                  className="accent-emerald-500 rounded"
                />
                <span>Levar conexão Supabase / Brevo junto p/ outro navegador</span>
              </label>
            </div>
          </div>

          {/* Feedback Banners */}
          {vaultFeedback && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2 font-medium ${
                vaultFeedback.ok
                  ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-700/60 text-rose-200'
              }`}
            >
              {vaultFeedback.ok ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              )}
              <span>{vaultFeedback.text}</span>
            </div>
          )}

          {backupRestoreStatus && (
            <div className="p-3 rounded-xl border bg-emerald-950/60 border-emerald-700/60 text-emerald-200 font-medium">
              {backupRestoreStatus}
            </div>
          )}

          {/* Option 1: Magic Link & Sync Code for Incognito / Any Browser */}
          <div className="bg-gradient-to-br from-indigo-950/50 to-slate-950 border border-indigo-700/50 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <CloudUpload className="w-4 h-4 text-indigo-400" />
                  1. Link Mágico &amp; Código p/ Aba Anônima ou Outro Navegador
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Salva tudo na Nuvem + Servidor e gera um link único. Ao abrir esse link na <strong>Aba Anônima</strong>, Edge, Firefox ou celular, tudo reaparece igualzinho!
                </p>
              </div>
              <button
                type="button"
                onClick={handleGenerateMagicLink}
                disabled={isGeneratingVault}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl inline-flex items-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-indigo-950/60"
              >
                {isGeneratingVault ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CloudUpload className="w-4 h-4" />
                )}
                <span>{isGeneratingVault ? 'Salvando Tudo...' : 'Salvar Tudo & Gerar Link'}</span>
              </button>
            </div>

            {generatedUrl && generatedCode && (
              <div className="bg-slate-900/95 border border-emerald-600/50 rounded-xl p-3 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-emerald-300 font-bold">
                    ✅ Tudo salvo! Use este Código ou Link no outro navegador / Aba Anônima:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(generatedCode, 'code')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg font-mono text-xs font-extrabold text-amber-300 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Código: {generatedCode}</span>
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedUrl}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-[11px] text-cyan-300 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(generatedUrl, 'link')}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
                  </button>
                  <a
                    href={generatedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg inline-flex items-center justify-center gap-1 whitespace-nowrap"
                    title="Testar link em nova guia"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Testar</span>
                  </a>
                </div>
              </div>
            )}

            {/* Quick restore by code input */}
            <form onSubmit={handleRestoreCodeSubmit} className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-indigo-900/50">
              <div className="flex items-center gap-2 flex-1">
                <KeyRound className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Já tem um código? Ex: AV-849201 — cole aqui para puxar tudo"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={isRestoringCode || !inputCode.trim()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-600 text-white font-semibold rounded-xl cursor-pointer whitespace-nowrap"
              >
                {isRestoringCode ? 'Restaurando...' : 'Puxar pelo Código'}
              </button>
            </form>
          </div>

          {/* Option 2: Offline 100% File Backup (.JSON) */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-400" />
                2. Arquivo de Backup Completo (.JSON) — Cópia Permanente no PC
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Guarde um arquivo no seu computador/Google Drive. Mesmo se limpar todo o navegador ou abrir em outra janela anônima sem internet local, basta importar esse arquivo para voltar 100% idêntico.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => onExportBackup(includeCredentials)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl inline-flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Backup Completo (.JSON)</span>
              </button>
              <label className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold rounded-xl inline-flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Restaurar de Arquivo (.JSON)</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={onImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Note about Chrome Extension */}
          <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3 text-[11px] text-amber-200/90 leading-relaxed">
            <strong>💡 Dica importante para Aba Anônima no Chrome:</strong> por padrão o Google Chrome desativa extensões na janela anônima. Se quiser que a <strong>extensão v1.5.8</strong> poste no Facebook usando uma aba anônima, acesse{' '}
            <span className="font-mono text-white bg-slate-900 px-1.5 py-0.5 rounded">chrome://extensions</span> → <strong>Detalhes</strong> da extensão AutoViral AI → ative{' '}
            <strong>"Permitir no modo de navegação anônima"</strong>.
          </div>
        </div>
      </div>
    </div>
  );
};
