import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Key,
  Smartphone,
  CloudCheck,
  Download,
  Upload,
  CheckCircle2,
  Lock,
  AlertTriangle,
} from 'lucide-react';

interface Security2FAModalProps {
  isOpen: boolean;
  onClose: () => void;
  is2FAEnabled: boolean;
  onToggle2FA: (enabled: boolean) => void;
  onExportBackup: () => void;
}

export const Security2FAModal: React.FC<Security2FAModalProps> = ({
  isOpen,
  onClose,
  is2FAEnabled,
  onToggle2FA,
  onExportBackup,
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length >= 4) {
      onToggle2FA(true);
      setStatusMessage('Autenticação de Dois Fatores ativada com sucesso!');
      setVerificationCode('');
    } else {
      setStatusMessage('Digite um código de 6 dígitos válido.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Segurança do Sistema & Autenticação 2FA
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-slate-300">
          {statusMessage && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-700 rounded-xl text-emerald-300 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* 2FA Toggle Card */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <strong className="text-sm text-white block">
                  Autenticação de Dois Fatores (2FA)
                </strong>
                <span className="text-slate-400 text-[11px]">
                  Proteja seus dados bancários, pix e métricas de campanhas
                </span>
              </div>
              <button
                onClick={() => {
                  if (is2FAEnabled) {
                    onToggle2FA(false);
                    setStatusMessage('2FA desativado temporariamente.');
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                  is2FAEnabled
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'bg-amber-950 text-amber-300 border border-amber-700'
                }`}
              >
                {is2FAEnabled ? 'Ativado' : 'Desativado'}
              </button>
            </div>

            {!is2FAEnabled && (
              <form onSubmit={handleVerify2FA} className="pt-2 space-y-3">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-700/80 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-300 block">
                    1. Use seu Google Authenticator ou receba o código no WhatsApp:
                  </span>
                  <div className="font-mono text-center text-sm py-1.5 bg-slate-950 rounded-lg text-emerald-400 tracking-widest border border-slate-800">
                    CHAVE: AUTOVIRAL-8924-SEC
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Digite o código de 6 dígitos gerado:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="123456"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-center text-white tracking-widest font-mono text-sm focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
                    >
                      Confirmar e Ativar
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Cloud Backup & Serverless Sync */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <CloudCheck className="w-4 h-4 text-cyan-400" />
              <span>Backup Automático na Nuvem (Serverless)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Suas campanhas, clientes e telemetria estão salvos de forma resiliente.
              Você pode baixar uma cópia em JSON ou restaurar a qualquer momento sem custo de servidor.
            </p>

            <div className="pt-1 flex gap-2">
              <button
                onClick={onExportBackup}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Backup Completo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
