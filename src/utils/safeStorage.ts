// Safe localStorage persistence helper that prevents QuotaExceededError (5MB Chrome limit)
// without ever dropping user campaigns, groups, audiences, or database credentials.

export function pruneExpendableStorage(preserveKey?: string): void {
  if (typeof window === 'undefined') return;
  try {
    // 1. Remove legacy duplicate keys ONLY when the primary v4/v5 key already exists
    if (localStorage.getItem('autoviral_fb_mapped_groups_v5_real')) {
      localStorage.removeItem('autoviral_fb_mapped_groups_v3');
    }
    if (localStorage.getItem('autoviral_fb_audiences_v4')) {
      localStorage.removeItem('autoviral_fb_audiences_v3');
    }
    if (localStorage.getItem('autoviral_campaigns')) {
      localStorage.removeItem('autoviral_managed_campaigns_v5');
    }
    if (localStorage.getItem('autoviral_insta_story_queue')) {
      localStorage.removeItem('autoviral_insta_story_queue_v2');
    }

    // 2. Remove heavy rolling backup cache (real audiences live in autoviral_global_audiences_v1 & cloud)
    if (preserveKey !== 'autoviral_global_audiences_backup_v1') {
      localStorage.removeItem('autoviral_global_audiences_backup_v1');
    }

    // 3. Trim large log arrays & old telemetry caches
    const trimArrayKey = (k: string, maxItems: number) => {
      if (k === preserveKey) return;
      try {
        const raw = localStorage.getItem(k);
        if (!raw || raw.length < 30000) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > maxItems) {
          localStorage.setItem(k, JSON.stringify(parsed.slice(0, maxItems)));
        }
      } catch {}
    };

    trimArrayKey('autoviral_fb_bot_logs_v3', 30);
    trimArrayKey('autoviral_global_bot_logs_v1', 30);
    trimArrayKey('autoviral_dispatch_logs', 30);
    trimArrayKey('autoviral_tracking_events', 100);
  } catch {}
}

export function safeSetLocalStorage(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    // Reclaim redundant/legacy space first and retry
    pruneExpendableStorage(key);
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      // If campaigns contain large base64 data:image strings, store compact local cache (full copy remains in state & cloud)
      if (key === 'autoviral_campaigns') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            const compacted = parsed.map((c: any) => {
              if (c && typeof c.imageUrl === 'string' && c.imageUrl.startsWith('data:image/') && c.imageUrl.length > 60000) {
                return { ...c, imageUrl: '' };
              }
              return c;
            });
            localStorage.setItem(key, JSON.stringify(compacted));
            return true;
          }
        } catch {}
      }

      // Trim tracking events more aggressively if still tight
      if (key === 'autoviral_tracking_events') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            localStorage.setItem(key, JSON.stringify(parsed.slice(0, 40)));
            return true;
          }
        } catch {}
      }

      try {
        sessionStorage.setItem(key, value);
      } catch {}
      console.warn(`[Storage] Quota tight while saving "${key}"; freed caches / fell back to session cache.`);
      return false;
    }
  }
}

export function safeSetLocalStorageJson(key: string, data: any): boolean {
  try {
    return safeSetLocalStorage(key, JSON.stringify(data));
  } catch {
    return false;
  }
}
