import React, { useState, useEffect, useRef } from 'react';
import { Shield, AlertTriangle, Zap } from 'lucide-react';

interface SecurityDefenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResumeAnyway: () => void;
  onAutoResume?: () => void;
  platformName?: 'Facebook' | 'Instagram' | 'Multi-Canais';
  initialCooldownSeconds?: number;
  controlledRemainingSeconds?: number;
  maxCooldownMinutes?: number;
  onChangeMaxCooldownMinutes?: (minutes: number) => void;
  triggerReason?: string;
}

export const SecurityDefenseModal: React.FC<SecurityDefenseModalProps> = ({
  isOpen,
  onClose,
  onResumeAnyway,
  onAutoResume,
  platformName = 'Facebook',
  initialCooldownSeconds = 3600, // Max 60m (1 hour)
  controlledRemainingSeconds,
  maxCooldownMinutes = 60,
  onChangeMaxCooldownMinutes,
  triggerReason,
}) => {
  const cappedInitial = Math.min(3600, Math.max(60, initialCooldownSeconds));
  const [localRemainingSeconds, setLocalRemainingSeconds] = useState<number>(cappedInitial);
  const autoResumedRef = useRef<boolean>(false);

  const isControlled = typeof controlledRemainingSeconds === 'number';
  const remainingSeconds = isControlled
    ? Math.max(0, Math.min(3600, controlledRemainingSeconds))
    : localRemainingSeconds;

  useEffect(() => {
    if (!isOpen) {
      autoResumedRef.current = false;
      return;
    }
    if (isControlled) return;

    setLocalRemainingSeconds(cappedInitial);
    const timer = setInterval(() => {
      setLocalRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!autoResumedRef.current) {
            autoResumedRef.current = true;
            setTimeout(() => {
              if (onAutoResume) onAutoResume();
              else onResumeAnyway();
            }, 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, cappedInitial, isControlled, onAutoResume, onResumeAnyway]);

  if (!isOpen) return null;

  const totalBase = Math.max(60, Math.min(3600, maxCooldownMinutes * 60));
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPercent = Math.max(0, Math.min(100, (remainingSeconds / totalBase) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121622] border border-slate-800 rounded-3xl max-w-md w-full p-7 space-y-5 shadow-2xl relative text-center">
        {/* Blue Shield Icon */}
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
          {triggerReason && (
            <div className="text-[11px] font-semibold text-red-200 bg-red-950/60 border border-red-700/60 rounded-xl px-3 py-2 text-left">
              {triggerReason}
            </div>
          )}
          <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
            O <strong className="text-white">{platformName}</strong> detectou{' '}
            <strong className="text-amber-400">frequência alta de publicações</strong> e emitiu um aviso temporário.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            A fila foi pausada por no máximo <strong className="text-amber-400">{maxCooldownMinutes} min</strong> e vai{' '}
            <strong className="text-emerald-400">voltar ao normal automaticamente</strong> assim que o relógio zerar (mesmo em 2º plano).
          </p>
        </div>

        {/* Countdown Box */}
        <div className="bg-[#181d2c] border border-slate-800/80 rounded-2xl p-5 space-y-3">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
            RETOMADA AUTOMÁTICA AO NORMAL EM
          </span>
          <div className="text-4xl sm:text-5xl font-black text-rose-500 tracking-wider font-mono tabular-nums">
            {formattedTime}
          </div>

          {/* Progress line */}
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-rose-500 h-full transition-all duration-1000 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {onChangeMaxCooldownMinutes && (
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-semibold mr-1">Tempo máx.:</span>
              {[15, 30, 45, 60].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onChangeMaxCooldownMinutes(m)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer transition ${
                    maxCooldownMinutes === m
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {m === 60 ? '60m (1h máx)' : `${m}m`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer border border-slate-700"
          >
            Minimizar (continua em 2º plano)
          </button>

          <button
            type="button"
            onClick={onResumeAnyway}
            className="w-full py-3 px-3 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-600/70 text-emerald-300 hover:text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>Retomar agora mesmo assim</span>
          </button>
        </div>

        {/* Warning text */}
        <div className="flex items-start justify-center gap-1.5 text-[10px] text-amber-400/90 leading-tight pt-1">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
          <span>
            Ao concluir o tempo (máx. 1 hora), o robô libera os grupos em espera e retoma os disparos normalmente.
          </span>
        </div>
      </div>
    </div>
  );
};
