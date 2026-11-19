// AutoViral AI - Isolated Global Bot Runner
// Uses dedicated autoviral_global_bot_* localStorage keys so it never overwrites Brazil state.
// Automatically pauses the Brazil bot via mutual safety event when started.

type GlobalBotTickCallback = (remainingSeconds: number, isExecuting: boolean) => void;
type GlobalBotCooldownTickCallback = (cooldownRemainingSeconds: number, isInCooldown: boolean, reason: string) => void;

const GLOBAL_MAX_COOLDOWN_SECONDS = 3600; // Hard cap: 60 minutes (1 hour max)
const GLOBAL_DEFAULT_COOLDOWN_MINUTES = 60;

class GlobalBackgroundBotRunner {
  private worker: Worker | null = null;
  private intervalTimer: ReturnType<typeof setInterval> | null = null;
  private isRunning: boolean = false;
  private isInCooldown: boolean = false;
  private nextRunTimestamp: number = 0;
  private cooldownUntilTimestamp: number = 0;
  private cooldownReason: string = '';
  private cooldownMaxMinutes: number = GLOBAL_DEFAULT_COOLDOWN_MINUTES;
  private intervalSeconds: number = 350;
  private isRandomJitter: boolean = true;
  private onTickCallback: GlobalBotTickCallback | null = null;
  private onExecuteCallback: (() => void) | null = null;
  private onExternalStopCallback: (() => void) | null = null;
  private onCooldownTickCallback: GlobalBotCooldownTickCallback | null = null;
  private onAutoResumeCallback: (() => void) | null = null;

  constructor() {
    this.initWorker();
    this.restoreState();
    this.bindMutualPauseListener();
  }

  private bindMutualPauseListener() {
    if (typeof window === 'undefined') return;
    window.addEventListener('autoviral_bot_mutual_pause', (ev: Event) => {
      const customEv = ev as CustomEvent<{ origin?: string }>;
      if (customEv.detail?.origin === 'brazil' && (this.isRunning || this.isInCooldown)) {
        this.stop();
        if (this.onExternalStopCallback) {
          this.onExternalStopCallback();
        }
      }
    });
  }

  private initWorker() {
    try {
      const workerCode = `
        let timer = null;
        self.onmessage = function(e) {
          if (e.data === 'start') {
            if (timer) clearInterval(timer);
            timer = setInterval(function() {
              self.postMessage('tick');
            }, 1000);
          } else if (e.data === 'stop') {
            if (timer) clearInterval(timer);
            timer = null;
          }
        };
      `;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.worker = new Worker(URL.createObjectURL(blob));
      this.worker.onmessage = (e) => {
        if (e.data === 'tick') {
          this.handleTick();
        }
      };
    } catch {
      // Fallback to window.setInterval
    }
  }

  private restoreState() {
    try {
      const savedMaxMin = parseInt(localStorage.getItem('autoviral_global_bot_cooldown_max_min') || String(GLOBAL_DEFAULT_COOLDOWN_MINUTES), 10);
      this.cooldownMaxMinutes = Number.isFinite(savedMaxMin)
        ? Math.max(5, Math.min(60, savedMaxMin))
        : GLOBAL_DEFAULT_COOLDOWN_MINUTES;

      const savedRunning = localStorage.getItem('autoviral_global_bot_is_running') === 'true';
      const savedNextTs = parseInt(localStorage.getItem('autoviral_global_bot_next_ts') || '0', 10);
      const savedInterval = parseInt(localStorage.getItem('autoviral_global_bot_interval') || '350', 10);
      const savedCooldownUntil = parseInt(localStorage.getItem('autoviral_global_bot_cooldown_until_ts') || '0', 10);
      const savedCooldownReason = localStorage.getItem('autoviral_global_bot_cooldown_reason') || '';

      this.intervalSeconds = savedInterval > 0 ? savedInterval : 350;

      if (savedCooldownUntil > Date.now()) {
        const cappedUntil = Math.min(savedCooldownUntil, Date.now() + GLOBAL_MAX_COOLDOWN_SECONDS * 1000);
        this.cooldownUntilTimestamp = cappedUntil;
        this.cooldownReason = savedCooldownReason;
        this.isInCooldown = true;
        this.isRunning = false;
        localStorage.setItem('autoviral_global_bot_cooldown_until_ts', String(cappedUntil));
        this.startWorker();
        return;
      } else if (savedCooldownUntil > 0 && savedCooldownUntil <= Date.now()) {
        localStorage.removeItem('autoviral_global_bot_cooldown_until_ts');
        localStorage.removeItem('autoviral_global_bot_cooldown_reason');
        this.isInCooldown = false;
        this.cooldownUntilTimestamp = 0;
        this.cooldownReason = '';
        this.isRunning = true;
        localStorage.setItem('autoviral_global_bot_is_running', 'true');
        this.scheduleNextRun();
        this.startWorker();
        return;
      }

      if (savedRunning && savedNextTs > Date.now()) {
        this.nextRunTimestamp = savedNextTs;
        this.isRunning = true;
        this.startWorker();
      } else if (savedRunning && savedNextTs > 0) {
        this.isRunning = true;
        this.scheduleNextRun();
        this.startWorker();
      }
    } catch {}
  }

  public start(
    interval: number,
    randomJitter: boolean,
    onExecute: () => void,
    onTick?: GlobalBotTickCallback,
    onExternalStop?: () => void,
    onCooldownTick?: GlobalBotCooldownTickCallback,
    onAutoResume?: () => void
  ) {
    // Pause Brazil bot automatically for anti-ban safety on shared Chrome profile
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('autoviral_bot_mutual_pause', { detail: { origin: 'global' } }));
    }

    this.intervalSeconds = interval;
    this.isRandomJitter = randomJitter;
    this.onExecuteCallback = onExecute;
    this.onTickCallback = onTick || null;
    this.onExternalStopCallback = onExternalStop || null;
    if (onCooldownTick) this.onCooldownTickCallback = onCooldownTick;
    if (onAutoResume) this.onAutoResumeCallback = onAutoResume;

    this.clearCooldownStorageOnly();
    this.isInCooldown = false;
    this.cooldownUntilTimestamp = 0;
    this.cooldownReason = '';
    this.isRunning = true;

    try {
      localStorage.setItem('autoviral_global_bot_is_running', 'true');
      localStorage.setItem('autoviral_global_bot_interval', interval.toString());
    } catch {}

    this.scheduleNextRun();
    this.startWorker();
    if (this.onCooldownTickCallback) {
      this.onCooldownTickCallback(0, false, '');
    }
  }

  public pauseForCooldown(cooldownSeconds?: number, reason?: string) {
    const requested = typeof cooldownSeconds === 'number' && cooldownSeconds > 0
      ? cooldownSeconds
      : this.cooldownMaxMinutes * 60;
    const clampedSeconds = Math.max(60, Math.min(GLOBAL_MAX_COOLDOWN_SECONDS, Math.round(requested)));

    this.isRunning = false;
    this.nextRunTimestamp = 0;
    this.isInCooldown = true;
    this.cooldownUntilTimestamp = Date.now() + clampedSeconds * 1000;
    this.cooldownReason = reason || 'Limite temporário do Facebook — retomada automática programada';

    try {
      localStorage.setItem('autoviral_global_bot_is_running', 'false');
      localStorage.removeItem('autoviral_global_bot_next_ts');
      localStorage.setItem('autoviral_global_bot_cooldown_until_ts', String(this.cooldownUntilTimestamp));
      localStorage.setItem('autoviral_global_bot_cooldown_reason', this.cooldownReason);
    } catch {}

    this.startWorker();
    if (this.onCooldownTickCallback) {
      this.onCooldownTickCallback(clampedSeconds, true, this.cooldownReason);
    }
  }

  public cancelCooldownAndResumeNow() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('autoviral_bot_mutual_pause', { detail: { origin: 'global' } }));
    }
    this.clearCooldownStorageOnly();
    this.isInCooldown = false;
    this.cooldownUntilTimestamp = 0;
    this.cooldownReason = '';
    this.isRunning = true;

    try {
      localStorage.setItem('autoviral_global_bot_is_running', 'true');
    } catch {}

    if (this.onCooldownTickCallback) {
      this.onCooldownTickCallback(0, false, '');
    }
    this.scheduleNextRun();
    this.startWorker();
    if (this.onTickCallback) {
      this.onTickCallback(this.getRemainingSeconds(), false);
    }
  }

  public stop() {
    this.isRunning = false;
    this.isInCooldown = false;
    this.nextRunTimestamp = 0;
    this.cooldownUntilTimestamp = 0;
    this.cooldownReason = '';
    try {
      localStorage.setItem('autoviral_global_bot_is_running', 'false');
      localStorage.removeItem('autoviral_global_bot_next_ts');
      this.clearCooldownStorageOnly();
    } catch {}

    if (this.worker) {
      this.worker.postMessage('stop');
    }
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    if (this.onCooldownTickCallback) {
      this.onCooldownTickCallback(0, false, '');
    }
  }

  private clearCooldownStorageOnly() {
    try {
      localStorage.removeItem('autoviral_global_bot_cooldown_until_ts');
      localStorage.removeItem('autoviral_global_bot_cooldown_reason');
    } catch {}
  }

  public getRemainingSeconds(): number {
    if (!this.isRunning || this.nextRunTimestamp <= 0) return 0;
    return Math.max(0, Math.round((this.nextRunTimestamp - Date.now()) / 1000));
  }

  public getCooldownRemainingSeconds(): number {
    if (!this.isInCooldown || this.cooldownUntilTimestamp <= 0) return 0;
    return Math.max(0, Math.round((this.cooldownUntilTimestamp - Date.now()) / 1000));
  }

  public getIntervalSeconds(): number {
    return this.intervalSeconds;
  }

  public setIntervalSeconds(interval: number, rescheduleNow: boolean = false) {
    const clean = Math.max(60, Math.round(interval || 300));
    this.intervalSeconds = clean;
    try {
      localStorage.setItem('autoviral_global_bot_interval', clean.toString());
    } catch {}
    if (rescheduleNow && this.isRunning) {
      this.scheduleNextRun();
      if (this.onTickCallback) {
        this.onTickCallback(this.getRemainingSeconds(), false);
      }
    }
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public getIsInCooldown(): boolean {
    return this.isInCooldown;
  }

  public getCooldownReason(): string {
    return this.cooldownReason;
  }

  public getCooldownMaxMinutes(): number {
    return this.cooldownMaxMinutes;
  }

  public setCooldownMaxMinutes(minutes: number) {
    const clean = Math.max(5, Math.min(60, Math.round(minutes || GLOBAL_DEFAULT_COOLDOWN_MINUTES)));
    this.cooldownMaxMinutes = clean;
    try {
      localStorage.setItem('autoviral_global_bot_cooldown_max_min', String(clean));
    } catch {}
    if (this.isInCooldown && this.cooldownUntilTimestamp > 0) {
      const maxUntil = Date.now() + clean * 60 * 1000;
      if (this.cooldownUntilTimestamp > maxUntil) {
        this.cooldownUntilTimestamp = maxUntil;
        try {
          localStorage.setItem('autoviral_global_bot_cooldown_until_ts', String(maxUntil));
        } catch {}
        if (this.onCooldownTickCallback) {
          this.onCooldownTickCallback(this.getCooldownRemainingSeconds(), true, this.cooldownReason);
        }
      }
    }
  }

  public setCallbacks(
    onExecute: () => void,
    onTick?: GlobalBotTickCallback,
    onExternalStop?: () => void,
    onCooldownTick?: GlobalBotCooldownTickCallback,
    onAutoResume?: () => void
  ) {
    this.onExecuteCallback = onExecute;
    this.onTickCallback = onTick || null;
    this.onExternalStopCallback = onExternalStop || null;
    if (onCooldownTick) this.onCooldownTickCallback = onCooldownTick;
    if (onAutoResume) this.onAutoResumeCallback = onAutoResume;
  }

  private scheduleNextRun() {
    let seconds = this.intervalSeconds;
    if (this.isRandomJitter) {
      if (this.intervalSeconds <= 350) {
        const minSec = Math.max(60, this.intervalSeconds === 350 ? 300 : this.intervalSeconds);
        const maxSec = this.intervalSeconds === 350 ? 400 : Math.round(minSec * 1.25);
        seconds = Math.floor(Math.random() * (maxSec - minSec + 1)) + minSec;
      } else {
        const minSec = this.intervalSeconds;
        const maxSec = Math.round(minSec * 1.25);
        seconds = Math.floor(Math.random() * (maxSec - minSec + 1)) + minSec;
      }
    }

    this.nextRunTimestamp = Date.now() + seconds * 1000;
    try {
      localStorage.setItem('autoviral_global_bot_next_ts', this.nextRunTimestamp.toString());
    } catch {}
  }

  private startWorker() {
    if (this.worker) {
      this.worker.postMessage('start');
    } else {
      if (this.intervalTimer) clearInterval(this.intervalTimer);
      this.intervalTimer = setInterval(() => this.handleTick(), 1000);
    }
  }

  private handleTick() {
    if (this.isInCooldown) {
      const cooldownRem = this.getCooldownRemainingSeconds();
      if (cooldownRem <= 0) {
        this.clearCooldownStorageOnly();
        this.isInCooldown = false;
        this.cooldownUntilTimestamp = 0;
        this.cooldownReason = '';
        this.isRunning = true;
        try {
          localStorage.setItem('autoviral_global_bot_is_running', 'true');
        } catch {}
        if (this.onCooldownTickCallback) {
          this.onCooldownTickCallback(0, false, '');
        }
        if (this.onAutoResumeCallback) {
          this.onAutoResumeCallback();
        }
        if (this.onExecuteCallback) {
          this.onExecuteCallback();
        }
        this.scheduleNextRun();
        if (this.onTickCallback) {
          this.onTickCallback(this.getRemainingSeconds(), true);
        }
      } else if (this.onCooldownTickCallback) {
        this.onCooldownTickCallback(cooldownRem, true, this.cooldownReason);
      }
      return;
    }

    if (!this.isRunning) return;

    const remaining = this.getRemainingSeconds();

    if (remaining <= 0) {
      if (this.onExecuteCallback) {
        this.onExecuteCallback();
      }
      this.scheduleNextRun();
      if (this.onTickCallback) {
        this.onTickCallback(this.getRemainingSeconds(), true);
      }
    } else {
      if (this.onTickCallback) {
        this.onTickCallback(remaining, false);
      }
    }
  }
}

export const globalEnBotRunner = new GlobalBackgroundBotRunner();
