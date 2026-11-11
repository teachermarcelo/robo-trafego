import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Zap, Check } from 'lucide-react';

interface SecurityDefenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResumeAnyway: () => void;
  platformName?: 'Facebook' | 'Instagram' | 'Multi-Canais';
  initialCooldownSeconds?: number;
}

export const SecurityDefenseModal: React.FC<SecurityDefenseModalProps> = ({
  isOpen,
  onClose,
  onResumeAnyway,
  platformName = 'Facebook',
  initialCooldownSeconds = 3590, // 59m 50s as seen in user's image
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(initialCooldownSeconds);

  useEffect(() => {
    if (!isOpen) return;
    setRemainingSeconds(initialCooldownSeconds);

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, initialCooldownSeconds]);

  if (!isOpen) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPercent = Math.max(0, Math.min(100, (remainingSeconds / initialCooldownSeconds) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121622] border border-slate-800 rounded-3xl max-w-md w-full p-7 space-y-6 shadow-2xl relative text-center">
        {/* Blue Shield Icon (Matches user image_031f9bdf.png) */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-blue-500/20 to-blue-600/10 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Shield className="w-9 h-9 text-blue-400 fill-blue-400/20" />
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Campanhas pausadas por segurança
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
            O <strong className="text-white">{platformName}</strong> detectou{' '}
            <strong className="text-amber-400">frequência alta de publicações</strong> e emitiu um aviso.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            As campanhas foram <strong className="text-amber-400">pausadas por 1h</strong> automaticamente para proteger sua conta de bloqueios permanentes.
          </p>
        </div>

        {/* Countdown Box */}
        <div className="bg-[#181d2c] border border-slate-800/80 rounded-2xl p-5 space-y-3">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
            RETOMADA AUTOMÁTICA EM
          </span>
          <div className="text-4xl sm:text-5xl font-black text-rose-500 tracking-wider font-mono">
            {formattedTime}
          </div>

          {/* Progress line */}
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-rose-500 h-full transition-all duration-1000 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer border border-slate-700"
          >
            Entendi, fechar aviso
          </button>

          <button
            type="button"
            onClick={onResumeAnyway}
            className="w-full py-3 px-4 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-600/70 text-emerald-300 hover:text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>Retomar agora mesmo assim</span>
          </button>
        </div>

        {/* Warning text */}
        <div className="flex items-start justify-center gap-1.5 text-[10px] text-amber-400/90 leading-tight pt-1">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
          <span>
            Retomar antes do tempo recomendado aumenta o risco de bloqueio da sua conta no {platformName}.
          </span>
        </div>
      </div>
    </div>
  );
};
