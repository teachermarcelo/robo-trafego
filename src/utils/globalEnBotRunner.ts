// AutoViral AI - Isolated Global Bot Runner
// Uses dedicated autoviral_global_bot_* localStorage keys so it never overwrites Brazil state.
// Automatically pauses the Brazil bot via mutual safety event when started.

type GlobalBotTickCallback = (remainingSeconds: number, isExecuting: boolean) => void;

class GlobalBackgroundBotRunner {
  private worker: Worker | null = null;
  private intervalTimer: ReturnType<typeof setInterval> | null = null;
  private isRunning: boolean = false;
  private nextRunTimestamp: number = 0;
  private intervalSeconds: number = 350;
  private isRandomJitter: boolean = true;
  private onTickCallback: GlobalBotTickCallback | null = null;
  private onExecuteCallback: (() => void) | null = null;
  private onExternalStopCallback: (() => void) | null = null;

  constructor() {
    this.initWorker();
    this.restoreState();
    this.bindMutualPauseListener();
  }

  private bindMutualPauseListener() {
    if (typeof window === 'undefined') return;
    window.addEventListener('autoviral_bot_mutual_pause', (ev: Event) => {
      const customEv = ev as CustomEvent<{ origin?: string }>;
      if (customEv.detail?.origin === 'brazil' && this.isRunning) {
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
      const savedRunning = localStorage.getItem('autoviral_global_bot_is_running') === 'true';
      const savedNextTs = parseInt(localStorage.getItem('autoviral_global_bot_next_ts') || '0', 10);
      const savedInterval = parseInt(localStorage.getItem('autoviral_global_bot_interval') || '350', 10);

      this.intervalSeconds = savedInterval > 0 ? savedInterval : 350;

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
    onExternalStop?: () => void
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
    this.isRunning = true;

    try {
      localStorage.setItem('autoviral_global_bot_is_running', 'true');
      localStorage.setItem('autoviral_global_bot_interval', interval.toString());
    } catch {}

    this.scheduleNextRun();
    this.startWorker();
  }

  public stop() {
    this.isRunning = false;
    this.nextRunTimestamp = 0;
    try {
      localStorage.setItem('autoviral_global_bot_is_running', 'false');
      localStorage.removeItem('autoviral_global_bot_next_ts');
    } catch {}

    if (this.worker) {
      this.worker.postMessage('stop');
    }
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  public getRemainingSeconds(): number {
    if (!this.isRunning || this.nextRunTimestamp <= 0) return 0;
    return Math.max(0, Math.round((this.nextRunTimestamp - Date.now()) / 1000));
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

  public setCallbacks(
    onExecute: () => void,
    onTick?: GlobalBotTickCallback,
    onExternalStop?: () => void
  ) {
    this.onExecuteCallback = onExecute;
    this.onTickCallback = onTick || null;
    this.onExternalStopCallback = onExternalStop || null;
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
