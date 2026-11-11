// AutoViral AI - Persistent Background Bot Runner
// Operates across tab switches, minimizations, and page navigation
// Uses Web Worker fallback + timestamp delta to never freeze when minimized

type BotTickCallback = (remainingSeconds: number, isExecuting: boolean) => void;

class BackgroundBotRunner {
  private worker: Worker | null = null;
  private intervalTimer: any = null;
  private isRunning: boolean = false;
  private nextRunTimestamp: number = 0;
  private intervalSeconds: number = 350;
  private isRandomJitter: boolean = true;
  private onTickCallback: BotTickCallback | null = null;
  private onExecuteCallback: (() => void) | null = null;

  constructor() {
    this.initWorker();
    this.restoreState();
  }

  private initWorker() {
    try {
      // Create inline Web Worker that doesn't get throttled when tab is minimized
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
    } catch (e) {
      console.warn('Web Worker fallback to window.setInterval', e);
    }
  }

  private restoreState() {
    try {
      const savedRunning = localStorage.getItem('autoviral_bot_is_running') === 'true';
      const savedNextTs = parseInt(localStorage.getItem('autoviral_bot_next_ts') || '0', 10);
      const savedInterval = parseInt(localStorage.getItem('autoviral_bot_interval') || '350', 10);

      this.intervalSeconds = savedInterval > 0 ? savedInterval : 350;

      if (savedRunning && savedNextTs > Date.now()) {
        this.nextRunTimestamp = savedNextTs;
        this.isRunning = true;
        this.startWorker();
      } else if (savedRunning && savedNextTs > 0) {
        // Was running and timer already passed while user had it minimized!
        this.isRunning = true;
        this.scheduleNextRun();
        this.startWorker();
      }
    } catch {}
  }

  public start(interval: number, randomJitter: boolean, onExecute: () => void, onTick?: BotTickCallback) {
    this.intervalSeconds = interval;
    this.isRandomJitter = randomJitter;
    this.onExecuteCallback = onExecute;
    this.onTickCallback = onTick || null;
    this.isRunning = true;

    localStorage.setItem('autoviral_bot_is_running', 'true');
    localStorage.setItem('autoviral_bot_interval', interval.toString());

    this.scheduleNextRun();
    this.startWorker();
  }

  public stop() {
    this.isRunning = false;
    this.nextRunTimestamp = 0;
    localStorage.setItem('autoviral_bot_is_running', 'false');
    localStorage.removeItem('autoviral_bot_next_ts');

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

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public setCallbacks(onExecute: () => void, onTick?: BotTickCallback) {
    this.onExecuteCallback = onExecute;
    this.onTickCallback = onTick || null;
  }

  private scheduleNextRun() {
    const seconds = this.isRandomJitter
      ? Math.floor(Math.random() * (400 - 300 + 1)) + 300
      : this.intervalSeconds;

    this.nextRunTimestamp = Date.now() + (seconds * 1000);
    localStorage.setItem('autoviral_bot_next_ts', this.nextRunTimestamp.toString());
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
      // Execute post
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

export const globalBotRunner = new BackgroundBotRunner();
