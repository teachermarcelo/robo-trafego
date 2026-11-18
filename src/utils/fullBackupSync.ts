import { Campaign, CustomerLead, TrackingEvent } from '../types';
import { safeSetLocalStorage, safeSetLocalStorageJson } from './safeStorage';

// Transient runtime lock/timer keys that must NEVER auto-start bots on another browser restore
const TRANSIENT_KEYS = new Set([
  'autoviral_bot_is_running',
  'autoviral_bot_next_ts',
  'autoviral_bot_running',
  'autoviral_global_bot_is_running',
  'autoviral_global_bot_next_ts',
  'autoviral_bot_mutual_pause',
  'autoviral_extension_groups_reset',
]);

// Credential/API-key keys kept out of unauthenticated public Firestore docs,
// included only in local JSON downloads or private Transfer Vault when requested.
export const CREDENTIAL_KEYS = new Set([
  'autoviral_supabase_url',
  'autoviral_supabase_key',
  'autoviral_supabase_connected',
  'autoviral_primary_db',
  'autoviral_auto_failover',
  'autoviral_brevo_api_key',
]);

export interface FullBackupPayload {
  version: string;
  exportedAt: string;
  campaigns: Campaign[];
  trackingEventsCount?: number;
  trackingEvents: TrackingEvent[];
  customerLeads: CustomerLead[];
  totalRevenue?: number;
  deletedCampaignIds?: string[];
  workspace: Record<string, any>;
  localStorageDump?: Record<string, string>;
}

function safeParseKey(key: string): any {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isBrowserStorageBlank(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const hasCamps = Boolean(localStorage.getItem('autoviral_campaigns'));
    const hasBrGroups = Boolean(localStorage.getItem('autoviral_fb_mapped_groups_v5_real'));
    const hasBrAudiences = Boolean(localStorage.getItem('autoviral_fb_audiences_v4'));
    const hasGlobalAudiences = Boolean(localStorage.getItem('autoviral_global_audiences_v1'));
    const hasGlobalGroups = Boolean(localStorage.getItem('autoviral_global_fb_groups_v1'));
    const hasGlobalOffers = Boolean(localStorage.getItem('autoviral_global_offers_v1'));
    return !hasCamps && !hasBrGroups && !hasBrAudiences && !hasGlobalAudiences && !hasGlobalGroups && !hasGlobalOffers;
  } catch {
    return false;
  }
}

export function getWorkspaceInventoryStats(campaigns: Campaign[]): {
  campaigns: number;
  brazilGroups: number;
  brazilAudiences: number;
  globalOffers: number;
  globalAudiences: number;
  globalGroups: number;
  globalKits: number;
  savedCopies: number;
  totalKeys: number;
} {
  if (typeof window === 'undefined') {
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
  const brGroups = safeParseKey('autoviral_fb_mapped_groups_v5_real') || safeParseKey('autoviral_fb_mapped_groups_v3') || [];
  const brAudiences = safeParseKey('autoviral_fb_audiences_v4') || safeParseKey('autoviral_fb_audiences_v3') || [];
  const glOffers = safeParseKey('autoviral_global_offers_v1') || [];
  const glAudiences = safeParseKey('autoviral_global_audiences_v1') || [];
  const glGroups = safeParseKey('autoviral_global_fb_groups_v1') || [];
  const glKits = safeParseKey('autoviral_global_kits_by_offer_v1') || {};
  const copies = safeParseKey('autoviral_saved_copies_v1') || {};

  let totalKeys = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('autoviral_') && !TRANSIENT_KEYS.has(k)) totalKeys++;
    }
  } catch {}

  return {
    campaigns: campaigns.length,
    brazilGroups: Array.isArray(brGroups) ? brGroups.length : 0,
    brazilAudiences: Array.isArray(brAudiences) ? brAudiences.length : 0,
    globalOffers: Array.isArray(glOffers) ? glOffers.length : 0,
    globalAudiences: Array.isArray(glAudiences) ? glAudiences.length : 0,
    globalGroups: Array.isArray(glGroups) ? glGroups.length : 0,
    globalKits: glKits && typeof glKits === 'object' ? Object.keys(glKits).length : 0,
    savedCopies: copies && typeof copies === 'object' ? Object.keys(copies).length : 0,
    totalKeys,
  };
}

/**
 * Captures EVERY autoviral_* key + structured state without losing anything.
 */
export function collectFullWorkspaceBackup(
  campaigns: Campaign[],
  trackingEvents: TrackingEvent[],
  customerLeads: CustomerLead[],
  options?: { includeCredentials?: boolean; totalRevenue?: number }
): FullBackupPayload {
  const includeCredentials = options?.includeCredentials !== false;
  const localStorageDump: Record<string, string> = {};

  if (typeof window !== 'undefined') {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith('autoviral_')) continue;
        if (TRANSIENT_KEYS.has(key)) continue;
        if (!includeCredentials && CREDENTIAL_KEYS.has(key)) continue;
        // Skip heavy legacy duplicate keys when canonical primary key exists
        if (key === 'autoviral_fb_mapped_groups_v3' && localStorage.getItem('autoviral_fb_mapped_groups_v5_real')) continue;
        if (key === 'autoviral_fb_audiences_v3' && localStorage.getItem('autoviral_fb_audiences_v4')) continue;
        if (key === 'autoviral_managed_campaigns_v5' && localStorage.getItem('autoviral_campaigns')) continue;
        if (key === 'autoviral_global_audiences_backup_v1') continue;

        const val = localStorage.getItem(key);
        if (val !== null) {
          localStorageDump[key] = val;
        }
      }
    } catch {}
  }

  const deletedIdsRaw = safeParseKey('autoviral_deleted_campaign_ids');

  return {
    version: '3.0.0',
    exportedAt: new Date().toISOString(),
    campaigns,
    trackingEventsCount: trackingEvents.length,
    trackingEvents: trackingEvents.slice(0, 300),
    customerLeads,
    totalRevenue: options?.totalRevenue ?? campaigns.reduce((acc, c) => acc + (Number(c.revenue) || 0), 0),
    deletedCampaignIds: Array.isArray(deletedIdsRaw) ? deletedIdsRaw : ['camp-1', 'camp-2', 'camp-3'],
    workspace: {
      savedCopiesMap: safeParseKey('autoviral_saved_copies_v1'),
      customCopyPresets: safeParseKey('autoviral_custom_copy_presets_v1'),
      mappedGroups: safeParseKey('autoviral_fb_mapped_groups_v5_real') || safeParseKey('autoviral_fb_mapped_groups_v3'),
      audiences: safeParseKey('autoviral_fb_audiences_v4') || safeParseKey('autoviral_fb_audiences_v3'),
      botLogs: safeParseKey('autoviral_fb_bot_logs_v3'),
      youtubeVideos: safeParseKey('autoviral_yt_videos_v2'),
      pinterestPins: safeParseKey('autoviral_pinterest_pins_v1'),
      instaCampaigns: safeParseKey('autoviral_insta_campaigns_v1'),
      storyQueue: safeParseKey('autoviral_insta_story_queue') || safeParseKey('autoviral_insta_story_queue_v2'),
      mappedInstaTargets: safeParseKey('autoviral_insta_mapped_targets_v2'),
      whatsappX1Flows: safeParseKey('autoviral_whatsapp_x1_flows_v1'),
      globalAudiences: safeParseKey('autoviral_global_audiences_v1'),
      globalTrashAudiences: safeParseKey('autoviral_global_audiences_trash_v1'),
      globalGroups: safeParseKey('autoviral_global_fb_groups_v1'),
      globalOffers: safeParseKey('autoviral_global_offers_v1'),
      globalKitsByOffer: safeParseKey('autoviral_global_kits_by_offer_v1'),
      globalInboxGroups: safeParseKey('autoviral_global_inbox_groups_v1'),
      globalBotLogs: safeParseKey('autoviral_global_bot_logs_v1'),
      globalDismissedRecovery: safeParseKey('autoviral_global_dismissed_recovery_v1'),
    },
    localStorageDump,
  };
}

/**
 * Collects non-secret extra keys from localStorage to persist inside Firebase / Supabase
 * so incognito / other browsers automatically get kits, inbox, preferences & multi-channel state.
 */
export function collectNonSecretExtraKeys(): Record<string, any> {
  if (typeof window === 'undefined') return {};
  const keysToSync = [
    'autoviral_global_kits_by_offer_v1',
    'autoviral_global_selected_offer_v1',
    'autoviral_global_selected_audience_v1',
    'autoviral_global_inbox_groups_v1',
    'autoviral_global_waiting_approvals_v1',
    'autoviral_global_hidden_landing_ids_v1',
    'autoviral_global_pin_items_v1',
    'autoviral_global_yt_videos_v1',
    'autoviral_global_bot_logs_v1',
    'autoviral_global_auto_join_post',
    'autoviral_global_silent_mode',
    'autoviral_global_visual_mode_v1',
    'autoviral_global_bot_interval',
    'autoviral_fb_bot_logs_v3',
    'autoviral_fb_daily_completed_v3',
    'autoviral_br_only_authorized',
    'autoviral_br_silent_mode',
    'autoviral_br_visual_mode',
    'autoviral_fb_auto_join_post',
    'autoviral_bot_interval',
    'autoviral_selected_audience_id',
    'autoviral_selected_group_ids',
    'autoviral_selected_product_id',
    'autoviral_selected_landing_id',
    'autoviral_dispatch_templates',
    'autoviral_spin_templates',
    'autoviral_dispatch_mode_v1',
    'autoviral_active_copy_tpl_idx',
    'autoviral_custom_instagram_profiles',
    'autoviral_custom_real_profiles',
    'autoviral_profile_script_overrides',
    'autoviral_instagram_origin_accounts',
    'autoviral_insta_audiences_v1',
    'autoviral_insta_mapped_groups_v1',
    'autoviral_insta_daily_dispatched_v2',
    'autoviral_insta_growth_stats_v1',
    'autoviral_deleted_insta_camp_ids',
    'autoviral_meta_ig_posts_v1',
    'autoviral_tracked_links_v2',
    'autoviral_target_channels_v1',
    'autoviral_target_cities',
    'autoviral_target_quantity',
    'autoviral_real_mode',
    'autoviral_brevo_contact_lists',
    'autoviral_brevo_contacts',
  ];

  const out: Record<string, any> = {};
  for (const k of keysToSync) {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      // Cap oversized logs before uploading to cloud doc
      if ((k === 'autoviral_fb_bot_logs_v3' || k === 'autoviral_global_bot_logs_v1' || k === 'autoviral_global_inbox_groups_v1') && raw.length > 80000) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          out[k] = parsed.slice(0, 60);
          continue;
        }
      }
      try {
        out[k] = JSON.parse(raw);
      } catch {
        out[k] = raw;
      }
    } catch {}
  }
  return out;
}

export function applyNonSecretExtraKeysToLocalStorage(extraKeys: Record<string, any> | null | undefined, options?: { mergeOnly?: boolean }): number {
  if (!extraKeys || typeof extraKeys !== 'object' || typeof window === 'undefined') return 0;
  let restored = 0;
  for (const [k, val] of Object.entries(extraKeys)) {
    if (!k.startsWith('autoviral_') || CREDENTIAL_KEYS.has(k) || TRANSIENT_KEYS.has(k)) continue;
    if (val === undefined || val === null) continue;
    try {
      const existingRaw = localStorage.getItem(k);
      if (options?.mergeOnly && existingRaw && existingRaw !== '[]' && existingRaw !== '{}') {
        continue;
      }
      if (typeof val === 'string') {
        safeSetLocalStorage(k, val);
      } else {
        safeSetLocalStorageJson(k, val);
      }
      restored++;
    } catch {}
  }
  return restored;
}

/**
 * Restores a full backup JSON/Vault snapshot non-destructively into localStorage.
 */
export function applyFullWorkspaceSnapshotToLocalStorage(
  parsed: Partial<FullBackupPayload> | null | undefined,
  options?: { mergeOnly?: boolean }
): {
  restoredKeys: number;
  hasSupabaseCredentials: boolean;
  campaigns: Campaign[];
  trackingEvents: TrackingEvent[];
  customerLeads: CustomerLead[];
  deletedCampaignIds: string[];
} {
  const result = {
    restoredKeys: 0,
    hasSupabaseCredentials: false,
    campaigns: Array.isArray(parsed?.campaigns) ? parsed!.campaigns : [],
    trackingEvents: Array.isArray(parsed?.trackingEvents) ? parsed!.trackingEvents : [],
    customerLeads: Array.isArray(parsed?.customerLeads) ? parsed!.customerLeads : [],
    deletedCampaignIds: Array.isArray(parsed?.deletedCampaignIds) ? parsed!.deletedCampaignIds : [],
  };

  if (!parsed || typeof parsed !== 'object' || typeof window === 'undefined') return result;

  const mergeArrayIntoKey = (key: string, incoming: any[] | undefined, idKey: string) => {
    if (!Array.isArray(incoming) || incoming.length === 0) return false;
    const existing = safeParseKey(key);
    if (!Array.isArray(existing) || existing.length === 0) {
      safeSetLocalStorageJson(key, incoming);
      return true;
    }
    if (options?.mergeOnly) {
      const seen = new Set(existing.map((it: any) => String(it?.[idKey] || '').toLowerCase()).filter(Boolean));
      const fresh = incoming.filter((it: any) => {
        const id = String(it?.[idKey] || '').toLowerCase();
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
      if (fresh.length > 0) {
        safeSetLocalStorageJson(key, [...fresh, ...existing]);
        return true;
      }
      return false;
    }
    // Full restore still preserves existing items not in backup so user never loses recent work
    const incomingIds = new Set(incoming.map((it: any) => String(it?.[idKey] || '').toLowerCase()).filter(Boolean));
    const localExtra = existing.filter((it: any) => {
      const id = String(it?.[idKey] || '').toLowerCase();
      return id && !incomingIds.has(id);
    });
    safeSetLocalStorageJson(key, [...incoming, ...localExtra]);
    return true;
  };

  // 1. Restore raw localStorageDump first (handles all 50+ autoviral_* keys)
  if (parsed.localStorageDump && typeof parsed.localStorageDump === 'object') {
    for (const [k, rawVal] of Object.entries(parsed.localStorageDump)) {
      if (!k.startsWith('autoviral_') || TRANSIENT_KEYS.has(k) || typeof rawVal !== 'string') continue;
      try {
        const existingRaw = localStorage.getItem(k);
        if (k === 'autoviral_fb_mapped_groups_v5_real') {
          const arr = JSON.parse(rawVal);
          if (mergeArrayIntoKey(k, arr, 'url')) result.restoredKeys++;
          continue;
        }
        if (k === 'autoviral_fb_audiences_v4' || k === 'autoviral_global_audiences_v1' || k === 'autoviral_global_audiences_trash_v1' || k === 'autoviral_global_offers_v1') {
          const arr = JSON.parse(rawVal);
          if (mergeArrayIntoKey(k, arr, 'id')) result.restoredKeys++;
          continue;
        }
        if (k === 'autoviral_global_fb_groups_v1') {
          const arr = JSON.parse(rawVal);
          if (mergeArrayIntoKey(k, arr, 'url')) result.restoredKeys++;
          continue;
        }
        if (k === 'autoviral_global_kits_by_offer_v1' || k === 'autoviral_saved_copies_v1' || k === 'autoviral_whatsapp_x1_flows_v1') {
          const obj = JSON.parse(rawVal);
          const prevObj = safeParseKey(k) || {};
          if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
            safeSetLocalStorageJson(k, { ...obj, ...prevObj });
            result.restoredKeys++;
            continue;
          }
        }
        if (options?.mergeOnly && existingRaw && existingRaw !== '[]' && existingRaw !== '{}') {
          continue;
        }
        safeSetLocalStorage(k, rawVal);
        result.restoredKeys++;
      } catch {
        safeSetLocalStorage(k, rawVal);
        result.restoredKeys++;
      }
    }
  }

  // 2. Also restore structured workspace object (backwards compatibility with v2.0.0 backups)
  if (parsed.workspace && typeof parsed.workspace === 'object') {
    const w = parsed.workspace;
    if (w.savedCopiesMap && typeof w.savedCopiesMap === 'object') {
      const prev = safeParseKey('autoviral_saved_copies_v1') || {};
      safeSetLocalStorageJson('autoviral_saved_copies_v1', { ...w.savedCopiesMap, ...prev });
      result.restoredKeys++;
    }
    if (mergeArrayIntoKey('autoviral_custom_copy_presets_v1', w.customCopyPresets, 'id')) result.restoredKeys++;
    if (mergeArrayIntoKey('autoviral_fb_mapped_groups_v5_real', w.mappedGroups, 'url')) result.restoredKeys++;
    if (mergeArrayIntoKey('autoviral_fb_audiences_v4', w.audiences, 'id')) result.restoredKeys++;
    if (Array.isArray(w.botLogs) && !localStorage.getItem('autoviral_fb_bot_logs_v3')) {
      safeSetLocalStorageJson('autoviral_fb_bot_logs_v3', w.botLogs);
      result.restoredKeys++;
    }
    if (mergeArrayIntoKey('autoviral_yt_videos_v2', w.youtubeVideos, 'url')) result.restoredKeys++;
    if (mergeArrayIntoKey('autoviral_pinterest_pins_v1', w.pinterestPins, 'id')) result.restoredKeys++;
    if (mergeArrayIntoKey('autoviral_insta_campaigns_v1', w.instaCampaigns, 'id')) result.restoredKeys++;
    if (mergeArrayIntoKey('autoviral_insta_story_queue', w.storyQueue, 'id')) result.restoredKeys++;
    if (mergeArrayIntoKey('autoviral_insta_mapped_targets_v2', w.mappedInstaTargets, 'handle')) result.restoredKeys++;
    if (w.whatsappX1Flows && typeof w.whatsappX1Flows === 'object') {
      const prevFlows = safeParseKey('autoviral_whatsapp_x1_flows_v1') || {};
      safeSetLocalStorageJson('autoviral_whatsapp_x1_flows_v1', { ...w.whatsappX1Flows, ...prevFlows });
      result.restoredKeys++;
    }
    if (mergeArrayIntoKey('autoviral_global_audiences_v1', w.globalAudiences, 'id')) result.restoredKeys++;
    if (mergeArrayIntoKey('autoviral_global_audiences_trash_v1', w.globalTrashAudiences, 'id')) result.restoredKeys++;
    if (mergeArrayIntoKey('autoviral_global_fb_groups_v1', w.globalGroups, 'url')) result.restoredKeys++;
    if (mergeArrayIntoKey('autoviral_global_offers_v1', w.globalOffers, 'id')) result.restoredKeys++;
    if (w.globalKitsByOffer && typeof w.globalKitsByOffer === 'object') {
      const prevKits = safeParseKey('autoviral_global_kits_by_offer_v1') || {};
      safeSetLocalStorageJson('autoviral_global_kits_by_offer_v1', { ...w.globalKitsByOffer, ...prevKits });
      result.restoredKeys++;
    }
    if (mergeArrayIntoKey('autoviral_global_inbox_groups_v1', w.globalInboxGroups, 'url')) result.restoredKeys++;
    if (Array.isArray(w.globalBotLogs) && !localStorage.getItem('autoviral_global_bot_logs_v1')) {
      safeSetLocalStorageJson('autoviral_global_bot_logs_v1', w.globalBotLogs);
      result.restoredKeys++;
    }
    if (Array.isArray(w.globalDismissedRecovery)) {
      const prevDis = safeParseKey('autoviral_global_dismissed_recovery_v1') || [];
      const set = new Set([...(Array.isArray(prevDis) ? prevDis : []), ...w.globalDismissedRecovery]);
      safeSetLocalStorageJson('autoviral_global_dismissed_recovery_v1', Array.from(set).slice(-400));
    }
  }

  // Check if Supabase credentials were restored
  try {
    const sUrl = localStorage.getItem('autoviral_supabase_url');
    const sKey = localStorage.getItem('autoviral_supabase_key');
    if (sUrl && sKey) {
      result.hasSupabaseCredentials = true;
    }
  } catch {}

  // Broadcast live refresh events to mounted React tabs
  try {
    window.dispatchEvent(new CustomEvent('autoviral_workspace_synced', { detail: parsed.workspace || {} }));
    window.dispatchEvent(new CustomEvent('autoviral_global_workspace_synced', { detail: parsed.workspace || {} }));
    window.dispatchEvent(new CustomEvent('autoviral_full_state_restored'));
    if (result.hasSupabaseCredentials) {
      window.dispatchEvent(
        new CustomEvent('autoviral_db_provider_changed', {
          detail: { provider: localStorage.getItem('autoviral_primary_db') === 'firebase' ? 'firebase' : 'supabase' },
        })
      );
    }
  } catch {}

  return result;
}
