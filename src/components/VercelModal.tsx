import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Rocket,
  CheckCircle2,
  Github,
  Zap,
  ArrowRight,
} from 'lucide-react';

interface VercelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VercelModal: React.FC<VercelModalProps> = ({ isOpen, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedVercelJson, setCopiedVercelJson] = useState(false);

  if (!isOpen) return null;

  // The active production URL on Google Cloud Run
  const liveProductionUrl = 'https://ais-pre-fdvdpr73jbu2hzpbbibxp5-395073471759.us-west2.run.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(liveProductionUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black border border-slate-700 flex items-center justify-center text-white font-bold">
              ▲
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Hospedar no Vercel & Ter Link Próprio</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                  Pronto para Vercel
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                O arquivo <code className="text-emerald-400 font-mono">vercel.json</code> já foi configurado e está 100% pronto!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Quick Option: Your Live Link Right Now */}
          <div className="bg-gradient-to-r from-emerald-950/60 to-slate-800/80 border border-emerald-800/50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> Link de Produção Ativo Agora (Sem Precisar Fazer Nada!)
              </span>
              <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded font-semibold border border-emerald-700/50">
                Online 24/7
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sua aplicação já está hospedada no Google Cloud com alta disponibilidade! Se você quer apenas um link curto e limpo para colocar na bio do Instagram ou TikTok hoje mesmo, pode encurtar este link no <strong>TinyURL</strong> ou <strong>Bitly</strong>:
            </p>
            <div className="flex items-center gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-200">
              <input
                type="text"
                readOnly
                value={liveProductionUrl}
                className="bg-transparent flex-1 outline-none text-emerald-400 truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
              </button>
              <a
                href={liveProductionUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Abrir em nova aba"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Step by step to deploy on Vercel */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Rocket className="w-4 h-4 text-indigo-400" />
              Passo a Passo para colocar no Vercel (Gratuito)
            </h4>

            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-950 text-indigo-400 font-bold flex items-center justify-center text-xs border border-indigo-800/50">
                  1
                </span>
                <span className="text-xs font-bold text-white">Suba para o seu GitHub</span>
              </div>
              <p className="text-xs text-slate-400 pl-8">
                No menu superior do Google AI Studio, clique em <strong>GitHub</strong> &gt; <strong>Export to GitHub</strong> (ou baixe os arquivos). Isso cria um repositório no seu GitHub com todo o código pronto.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-950 text-indigo-400 font-bold flex items-center justify-center text-xs border border-indigo-800/50">
                  2
                </span>
                <span className="text-xs font-bold text-white">Importe no Vercel</span>
              </div>
              <p className="text-xs text-slate-400 pl-8">
                Acesse <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-semibold">vercel.com</a>, clique em <strong>Add New &gt; Project</strong> e selecione o repositório do seu GitHub.
              </p>
              <div className="ml-8 p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
                <div className="text-slate-400">Framework Preset: <span className="text-white">Vite</span></div>
                <div className="text-slate-400">Build Command: <span className="text-emerald-400">npm run build</span></div>
                <div className="text-slate-400">Output Directory: <span className="text-emerald-400">dist</span></div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-950 text-indigo-400 font-bold flex items-center justify-center text-xs border border-indigo-800/50">
                  3
                </span>
                <span className="text-xs font-bold text-white">Clique em "Deploy"</span>
              </div>
              <p className="text-xs text-slate-400 pl-8">
                Em 30 segundos, o Vercel gera um link limpo como <code className="text-emerald-400 font-mono">https://seunome-autoviral.vercel.app</code> e você também pode adicionar seu próprio domínio (ex: <code className="text-cyan-400 font-mono">seusite.com.br</code>) 100% de graça!
              </p>
            </div>
          </div>

          {/* Vercel.json status */}
          <div className="p-3.5 bg-slate-800/30 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300">
                Arquivo <strong className="text-white">vercel.json</strong> configurado com SPA routing no projeto!
              </span>
            </div>
            <span className="text-emerald-400 font-bold">100% Compatível</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/80 border-t border-slate-700 flex items-center justify-between">
          <a
            href="https://vercel.com/new"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition"
          >
            <span>Abrir Painel do Vercel</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition"
          >
            Entendi, fechar
          </button>
        </div>
      </div>
    </div>
  );
};
