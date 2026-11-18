import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Campaign, TrackingEvent, CustomerLead } from '../types';
import { INITIAL_CAMPAIGNS } from '../data/defaultCampaigns';
import {
  isPrimarySupabase,
  isSupabaseConnected,
  saveCampaignToSupabase,
  deleteCampaignFromSupabase,
  saveTrackingEventToSupabase,
  saveWorkspaceJsonToSupabase,
  fetchWorkspaceJsonFromSupabase,
  autoFailoverToSupabaseOnQuota,
} from './supabaseClient';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId to getFirestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Connection test on boot (per Skill specification - skipped when Supabase is primary DB)
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (isQuotaExceededError(error)) {
      firestoreWritesPausedUntil = Date.now() + 15 * 60 * 1000;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('autoviral_firebase_quota_exceeded'));
      }
      autoFailoverToSupabaseOnQuota().catch(() => {});
      return;
    }
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or starting up.');
    }
  }
}
if (!isPrimarySupabase()) {
  testConnection();
}

// Standardized Error Handler (per Skill specification)
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Recursively strips any `undefined` properties (or undefined array items) so
 * Firestore setDoc() never throws "Unsupported field value: undefined".
 */
export function stripUndefinedDeep<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => stripUndefinedDeep(item)) as unknown as T;
  }
  if (typeof value === 'object') {
    // Preserve Date or Firestore special objects if any
    if (value instanceof Date) return value;
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value as Record<string, any>)) {
      if (v !== undefined) {
        out[k] = stripUndefinedDeep(v);
      }
    }
    return out as T;
  }
  return value;
}

// ---------------------------------------------------------------------------
// Quota Exhaustion Circuit Breaker & Write Deduplication
// ---------------------------------------------------------------------------

let firestoreWritesPausedUntil = 0;
let lastQuotaNoticeAt = 0;

export function isQuotaExceededError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error || '');
  const code = (error as any)?.code || '';
  return (
    code === 'resource-exhausted' ||
    msg.includes('resource-exhausted') ||
    msg.includes('Quota exceeded') ||
    msg.includes('Quota limit exceeded')
  );
}

export function isFirestoreWritesPaused(): boolean {
  return Date.now() < firestoreWritesPausedUntil;
}

export function resetFirebaseQuotaPause(): void {
  firestoreWritesPausedUntil = 0;
}

function triggerQuotaExhaustedFailover(note: string) {
  firestoreWritesPausedUntil = Date.now() + 15 * 60 * 1000;
  const now = Date.now();
  if (now - lastQuotaNoticeAt > 30000) {
    lastQuotaNoticeAt = now;
    console.warn(note);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('autoviral_firebase_quota_exceeded'));
    }
  }
  autoFailoverToSupabaseOnQuota().catch(() => {});
}

function handleWriteError(error: unknown, operationType: OperationType, path: string | null): void {
  if (isQuotaExceededError(error)) {
    triggerQuotaExhaustedFailover(
      '[Firebase Quota] Cota diária gratuita de gravações do Firestore atingida. Modo offline/failover ativado automaticamente.'
    );
    return;
  }
  handleFirestoreError(error, operationType, path);
}

const workspaceFieldHashes: Record<string, string> = {};

function recordCloudWorkspaceHashes(data: Record<string, any> | null | undefined) {
  if (!data || typeof data !== 'object') return;
  for (const [k, v] of Object.entries(data)) {
    if (k === 'updatedAt' || v === undefined) continue;
    try {
      workspaceFieldHashes[k] = JSON.stringify(v);
    } catch {}
  }
}

// ---------------------------------------------------------------------------
// Cloud Sync Operations for Multi-Browser Cross-Device Synchronization
// ---------------------------------------------------------------------------

const CAMPAIGNS_COLLECTION = 'autoviral_campaigns';
const SETTINGS_COLLECTION = 'autoviral_settings';
const TRACKING_COLLECTION = 'autoviral_tracking_events';
const PROFILES_COLLECTION = 'autoviral_profiles';

/**
 * Real-time listener for campaigns across all browsers
 */
export function subscribeFirebaseCampaigns(
  onUpdate: (campaigns: Campaign[]) => void,
  onError?: (err: any) => void
): () => void {
  const colRef = collection(db, CAMPAIGNS_COLLECTION);
  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // Bootstrap defaults only if collection is genuinely empty
        console.log('Firebase campaigns collection is empty, bootstrapping initial campaigns...');
        try {
          for (const camp of INITIAL_CAMPAIGNS) {
            await setDoc(doc(db, CAMPAIGNS_COLLECTION, camp.id), camp);
          }
        } catch (e) {
          console.warn('Could not bootstrap campaigns:', e);
        }
        onUpdate(INITIAL_CAMPAIGNS);
        return;
      }

      const list: Campaign[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as any;
        list.push({
          ...data,
          id: d.id,
          title: data.title || data.name || 'Campanha',
        });
      });
      onUpdate(list);
    },
    (error) => {
      console.warn('Firebase campaigns subscription error:', error);
      if (isQuotaExceededError(error)) {
        triggerQuotaExhaustedFailover('[Firebase Quota] Cota diária de leituras do Firestore atingida.');
      }
      if (onError) onError(error);
    }
  );
}

/**
 * Save or update campaign in Firestore (ensures both title and name are populated)
 */
export async function saveCampaignToFirebase(campaign: Campaign): Promise<void> {
  if (isPrimarySupabase()) {
    await saveCampaignToSupabase(campaign).catch(() => {});
    return;
  }
  if (isFirestoreWritesPaused()) return;
  const path = `${CAMPAIGNS_COLLECTION}/${campaign.id}`;
  try {
    const docRef = doc(db, CAMPAIGNS_COLLECTION, campaign.id);
    const titleVal = campaign.title || (campaign as any).name || 'Campanha';
    const payload = stripUndefinedDeep({
      ...campaign,
      id: campaign.id,
      title: titleVal,
      name: titleVal,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleWriteError(error, OperationType.WRITE, path);
  }
}

/**
 * Permanently delete campaign and record in blacklist
 */
export async function deleteCampaignFromFirebase(campaignId: string): Promise<void> {
  if (isPrimarySupabase()) {
    await deleteCampaignFromSupabase(campaignId).catch(() => {});
    try {
      const existing = await fetchWorkspaceJsonFromSupabase('deleted_campaign_ids');
      const list: string[] = Array.isArray(existing) ? existing : ['camp-1', 'camp-2', 'camp-3'];
      if (!list.includes(campaignId)) {
        await saveWorkspaceJsonToSupabase('deleted_campaign_ids', [...list, campaignId], { force: true });
      }
    } catch {}
    return;
  }
  if (isFirestoreWritesPaused()) return;
  const path = `${CAMPAIGNS_COLLECTION}/${campaignId}`;
  try {
    await deleteDoc(doc(db, CAMPAIGNS_COLLECTION, campaignId));
    // Also record in deletedCampaignIds in Firestore settings so other browsers respect it
    const metaRef = doc(db, SETTINGS_COLLECTION, 'meta_config');
    const metaSnap = await getDoc(metaRef);
    const existingDeleted: string[] = metaSnap.exists()
      ? metaSnap.data()?.deletedCampaignIds || []
      : ['camp-1', 'camp-2', 'camp-3'];

    if (!existingDeleted.includes(campaignId)) {
      await setDoc(metaRef, {
        deletedCampaignIds: [...existingDeleted, campaignId],
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }
  } catch (error) {
    handleWriteError(error, OperationType.DELETE, path);
  }
}

/**
 * Subscribe to deleted campaign IDs (to prevent dummy campaigns from returning)
 */
export function subscribeDeletedCampaignIds(onUpdate: (ids: string[]) => void): () => void {
  const docRef = doc(db, SETTINGS_COLLECTION, 'meta_config');
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const ids = snap.data()?.deletedCampaignIds;
        if (Array.isArray(ids)) {
          onUpdate(ids);
          return;
        }
      }
      onUpdate(['camp-1', 'camp-2', 'camp-3']);
    },
    (err) => {
      console.warn('Deleted campaigns subscription error:', err);
    }
  );
}

/**
 * Record a tracking event to Firestore (for cross-browser analytics)
 */
export async function saveTrackingEventToFirebase(event: TrackingEvent): Promise<void> {
  if (isPrimarySupabase()) {
    await saveTrackingEventToSupabase(event).catch(() => {});
    return;
  }
  if (isFirestoreWritesPaused()) return;
  const path = `${TRACKING_COLLECTION}/${event.id}`;
  try {
    const docRef = doc(db, TRACKING_COLLECTION, event.id);
    await setDoc(docRef, stripUndefinedDeep(event));
  } catch (error) {
    handleWriteError(error, OperationType.CREATE, path);
  }
}

/**
 * Subscribe to latest tracking events
 */
export function subscribeTrackingEvents(onUpdate: (events: TrackingEvent[]) => void): () => void {
  const q = query(collection(db, TRACKING_COLLECTION), limit(200));
  return onSnapshot(
    q,
    (snapshot) => {
      const events: TrackingEvent[] = [];
      snapshot.forEach((d) => {
        events.push(d.data() as TrackingEvent);
      });
      // Sort newest first
      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onUpdate(events);
    },
    (err) => {
      console.warn('Tracking events subscription error:', err);
    }
  );
}

/**
 * Save Landing Page override settings (for Public Lead landing page across all devices)
 */
export async function saveLandingPageSettingsToFirebase(
  settings: Record<string, any>,
  campaignId?: string
): Promise<void> {
  const docKey = campaignId ? `landing_page_${campaignId}` : 'landing_page_tarefinhas';
  if (isSupabaseConnected()) {
    await saveWorkspaceJsonToSupabase(docKey, stripUndefinedDeep(settings), { mergeObject: true, force: true }).catch(() => {});
    if (isPrimarySupabase()) return;
  }
  if (isFirestoreWritesPaused()) return;
  const path = `${SETTINGS_COLLECTION}/${docKey}`;
  try {
    const clean = stripUndefinedDeep({
      ...settings,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(doc(db, SETTINGS_COLLECTION, docKey), clean, { merge: true });

    // Also update generic fallback if tarefinhas
    if (!campaignId || campaignId === 'camp-tarefinhas-autismo') {
      await setDoc(doc(db, SETTINGS_COLLECTION, 'landing_page_tarefinhas'), clean, { merge: true });
    }
  } catch (error) {
    handleWriteError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribe to Landing Page override settings
 */
export function subscribeLandingPageSettings(
  onUpdate: (settings: any) => void,
  campaignId?: string
): () => void {
  const docKey = campaignId ? `landing_page_${campaignId}` : 'landing_page_tarefinhas';
  if (isSupabaseConnected()) {
    fetchWorkspaceJsonFromSupabase(docKey)
      .then((data) => {
        if (data) onUpdate(data);
      })
      .catch(() => {});
    if (isPrimarySupabase()) {
      return () => {};
    }
  }
  const docRef = doc(db, SETTINGS_COLLECTION, docKey);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data());
      }
    },
    (err) => {
      console.warn('Landing page settings subscription error:', err);
    }
  );
}

/**
 * Dispatch message template for ReplyRush and direct outreach
 */
export interface DispatchTemplateSettings {
  nicheId: string;
  keyword: string;
  message: string;
  spinTemplates?: string[];
  updatedAt?: string;
}

export async function saveDispatchTemplateToFirebase(template: DispatchTemplateSettings): Promise<void> {
  if (isFirestoreWritesPaused()) return;
  const path = `${SETTINGS_COLLECTION}/dispatch_${template.nicheId}`;
  try {
    await setDoc(
      doc(db, SETTINGS_COLLECTION, `dispatch_${template.nicheId}`),
      stripUndefinedDeep({
        ...template,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );
  } catch (error) {
    handleWriteError(error, OperationType.WRITE, path);
  }
}

export function subscribeDispatchTemplates(
  onUpdate: (templates: Record<string, DispatchTemplateSettings>) => void
): () => void {
  const colRef = collection(db, SETTINGS_COLLECTION);
  return onSnapshot(
    colRef,
    (snap) => {
      const result: Record<string, DispatchTemplateSettings> = {};
      snap.forEach((d) => {
        if (d.id.startsWith('dispatch_')) {
          const nicheId = d.id.replace('dispatch_', '');
          result[nicheId] = d.data() as DispatchTemplateSettings;
        }
      });
      onUpdate(result);
    },
    (err) => {
      console.warn('Dispatch templates subscription error:', err);
    }
  );
}

/**
 * Custom Instagram @ profile leads storage
 */
export interface CustomLeadProfile {
  handle: string;
  name: string;
  url: string;
  audience: string;
  focus: string;
  whatToLook: string;
  script: string;
  isCustom?: boolean;
}

export async function saveCustomProfileToFirebase(profile: CustomLeadProfile): Promise<void> {
  if (isFirestoreWritesPaused()) return;
  const cleanId = profile.handle.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `${PROFILES_COLLECTION}/${cleanId}`;
  try {
    await setDoc(
      doc(db, PROFILES_COLLECTION, cleanId),
      stripUndefinedDeep({
        ...profile,
        id: cleanId,
        updatedAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    handleWriteError(error, OperationType.WRITE, path);
  }
}

export async function deleteCustomProfileFromFirebase(handle: string): Promise<void> {
  if (isFirestoreWritesPaused()) return;
  const cleanId = handle.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `${PROFILES_COLLECTION}/${cleanId}`;
  try {
    await deleteDoc(doc(db, PROFILES_COLLECTION, cleanId));
  } catch (error) {
    handleWriteError(error, OperationType.DELETE, path);
  }
}

export function subscribeCustomProfiles(onUpdate: (profiles: CustomLeadProfile[]) => void): () => void {
  const colRef = collection(db, PROFILES_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: CustomLeadProfile[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as CustomLeadProfile);
      });
      onUpdate(list);
    },
    (err) => {
      console.warn('Custom profiles subscription error:', err);
    }
  );
}

/**
 * Instagram Origin (Sender) Profile configuration
 */
export interface InstagramOriginAccount {
  handle: string;
  name?: string;
  status: 'active' | 'warmup' | 'resting';
  dailyLimit: number;
  sentToday: number;
  lastUsedAt?: string;
  accountsList?: Array<{
    handle: string;
    name?: string;
    status: 'active' | 'warmup' | 'resting';
    dailyLimit: number;
    sentToday: number;
  }>;
}

export async function saveInstagramOriginAccountToFirebase(account: InstagramOriginAccount): Promise<void> {
  if (isFirestoreWritesPaused()) return;
  const path = `${SETTINGS_COLLECTION}/instagram_origin_profile`;
  try {
    await setDoc(
      doc(db, SETTINGS_COLLECTION, 'instagram_origin_profile'),
      stripUndefinedDeep({
        ...account,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );
  } catch (error) {
    handleWriteError(error, OperationType.WRITE, path);
  }
}

export function subscribeInstagramOriginAccount(onUpdate: (account: InstagramOriginAccount | null) => void): () => void {
  const docRef = doc(db, SETTINGS_COLLECTION, 'instagram_origin_profile');
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as InstagramOriginAccount);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.warn('Instagram origin profile subscription error:', err);
    }
  );
}

/**
 * Customers and Leads with WhatsApp and Purchase Details
 */
const CUSTOMERS_COLLECTION = 'autoviral_customers';

export async function saveCustomerLeadToFirebase(customer: CustomerLead): Promise<void> {
  const cleanId = (customer.id || `lead-${Date.now()}`).replace(/\//g, '_');
  if (isSupabaseConnected()) {
    try {
      const existing = await fetchWorkspaceJsonFromSupabase('customer_leads');
      const arr: CustomerLead[] = Array.isArray(existing) ? existing : [];
      const next = [customer, ...arr.filter((c) => c.id !== cleanId && c.id !== customer.id)];
      await saveWorkspaceJsonToSupabase('customer_leads', next, { force: true });
    } catch {}
    if (isPrimarySupabase()) return;
  }
  if (isFirestoreWritesPaused()) return;
  const path = `${CUSTOMERS_COLLECTION}/${cleanId}`;
  try {
    await setDoc(
      doc(db, CUSTOMERS_COLLECTION, cleanId),
      stripUndefinedDeep({
        ...customer,
        id: cleanId,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );
  } catch (error) {
    handleWriteError(error, OperationType.WRITE, path);
  }
}

export async function deleteCustomerLeadFromFirebase(customerId: string): Promise<void> {
  const cleanId = customerId.replace(/\//g, '_');
  if (isSupabaseConnected()) {
    try {
      const existing = await fetchWorkspaceJsonFromSupabase('customer_leads');
      const arr: CustomerLead[] = Array.isArray(existing) ? existing : [];
      await saveWorkspaceJsonToSupabase('customer_leads', arr.filter((c) => c.id !== cleanId && c.id !== customerId), { force: true });
    } catch {}
    if (isPrimarySupabase()) return;
  }
  if (isFirestoreWritesPaused()) return;
  const path = `${CUSTOMERS_COLLECTION}/${cleanId}`;
  try {
    await deleteDoc(doc(db, CUSTOMERS_COLLECTION, cleanId));
  } catch (error) {
    handleWriteError(error, OperationType.DELETE, path);
  }
}

export function subscribeCustomerLeads(
  onUpdate: (customers: CustomerLead[]) => void,
  onError?: (err: any) => void
): () => void {
  const colRef = collection(db, CUSTOMERS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: CustomerLead[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as CustomerLead);
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(list);
    },
    (err) => {
      console.warn('Customer leads subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Meta Ads and ManyChat / Instagram Graph API Configuration
 */
export interface MetaAdsApiConfig {
  adAccountId: string;
  accountName: string;
  accessToken?: string;
  instagramBusinessId?: string;
  webhookSecret?: string;
  isConnected: boolean;
  autoResponderActive: boolean;
  lastSyncAt?: string;
}

export async function saveMetaAdsConfigToFirebase(config: MetaAdsApiConfig): Promise<void> {
  if (isFirestoreWritesPaused()) return;
  const path = `${SETTINGS_COLLECTION}/meta_ads_config`;
  try {
    await setDoc(
      doc(db, SETTINGS_COLLECTION, 'meta_ads_config'),
      stripUndefinedDeep({
        ...config,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );
  } catch (error) {
    handleWriteError(error, OperationType.WRITE, path);
  }
}

export function subscribeMetaAdsConfig(onUpdate: (config: MetaAdsApiConfig | null) => void): () => void {
  const docRef = doc(db, SETTINGS_COLLECTION, 'meta_ads_config');
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as MetaAdsApiConfig);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.warn('Meta Ads config subscription error:', err);
    }
  );
}

/**
 * Unified Workspace Sync (Groups, Audiences, Copies, YouTube, Pinterest, Instagram)
 * Ensures data survives reloads and syncs across browsers/deployments without exceeding Firestore 1MB limit.
 */
export interface WorkspaceSyncData {
  savedCopiesMap?: Record<string, { headline: string; copy: string; savedAt: string }>;
  customCopyPresets?: Array<{ id: string; campaignId: string; name: string; headline: string; copy: string; savedAt: string }>;
  audiences?: any[];
  youtubeVideos?: any[];
  pinterestPins?: any[];
  instaCampaigns?: any[];
  storyQueue?: any[];
  mappedInstaTargets?: any[];
  mappedGroups?: any[];
  whatsappX1Flows?: Record<string, any>;
  updatedAt?: string;
}

export async function saveWorkspaceSyncToFirebase(
  partial: Partial<WorkspaceSyncData>,
  options?: { force?: boolean }
): Promise<{ ok: boolean; skipped?: boolean; quotaExceeded?: boolean; error?: string }> {
  if (isSupabaseConnected()) {
    const supaRes = await saveWorkspaceJsonToSupabase('workspace_sync_v1', stripUndefinedDeep(partial), {
      mergeObject: true,
      force: options?.force,
    });
    if (isPrimarySupabase()) {
      return { ok: supaRes.ok, error: supaRes.error };
    }
  }
  if (isFirestoreWritesPaused() && !options?.force) {
    return { ok: false, quotaExceeded: true, error: 'quota-paused' };
  }
  try {
    const safePayload: Record<string, any> = {};
    let hasChanges = Boolean(options?.force);

    Object.entries(partial).forEach(([key, value]) => {
      if (value === undefined) return;
      let normalizedValue = stripUndefinedDeep(value);
      if (key === 'mappedGroups' && Array.isArray(normalizedValue)) {
        normalizedValue = normalizedValue.slice(0, 450);
      } else if (key === 'mappedInstaTargets' && Array.isArray(normalizedValue)) {
        normalizedValue = normalizedValue.slice(0, 300);
      } else if (Array.isArray(normalizedValue)) {
        normalizedValue = normalizedValue.slice(0, 250);
      }

      const serialized = JSON.stringify(normalizedValue);
      if (workspaceFieldHashes[key] !== serialized) {
        hasChanges = true;
        safePayload[key] = normalizedValue;
      }
    });

    if (!hasChanges || Object.keys(safePayload).length === 0) {
      return { ok: true, skipped: true };
    }

    safePayload.updatedAt = new Date().toISOString();

    // Guard against Firestore 1MB document limit
    const serializedSize = JSON.stringify(safePayload).length;
    if (serializedSize > 850000 && Array.isArray(safePayload.mappedGroups)) {
      safePayload.mappedGroups = safePayload.mappedGroups.slice(0, 200);
    }
    if (JSON.stringify(safePayload).length > 900000) {
      delete safePayload.mappedGroups;
    }

    await setDoc(doc(db, SETTINGS_COLLECTION, 'workspace_sync_v1'), safePayload, { merge: true });
    recordCloudWorkspaceHashes(safePayload);
    return { ok: true };
  } catch (error: any) {
    if (isQuotaExceededError(error)) {
      firestoreWritesPausedUntil = Date.now() + 15 * 60 * 1000;
      const now = Date.now();
      if (now - lastQuotaNoticeAt > 30000) {
        lastQuotaNoticeAt = now;
        console.warn('[Firebase Quota] Cota diária de gravações atingida ao sincronizar workspace.');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('autoviral_firebase_quota_exceeded'));
        }
      }
      return { ok: false, quotaExceeded: true, error: error?.message || String(error) };
    }
    console.warn('Workspace sync write notice:', error);
    return { ok: false, error: error?.message || String(error) };
  }
}

export function subscribeWorkspaceSync(
  onUpdate: (data: WorkspaceSyncData) => void,
  onError?: (err: any) => void
): () => void {
  const docRef = doc(db, SETTINGS_COLLECTION, 'workspace_sync_v1');
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as WorkspaceSyncData;
        recordCloudWorkspaceHashes(data as Record<string, any>);
        onUpdate(data);
      }
    },
    (err) => {
      console.warn('Workspace sync subscription error:', err);
      if (isQuotaExceededError(err)) {
        triggerQuotaExhaustedFailover('[Firebase Quota] Cota atingida ao ler workspace.');
      }
      if (onError) onError(err);
    }
  );
}

/**
 * Fetch latest campaigns and workspace_sync_v1 directly from Firestore server (for manual Force Sync on PC/Mobile)
 */
export async function pullFullCloudSnapshotFromFirebase(): Promise<{
  campaigns: Campaign[];
  workspace: WorkspaceSyncData | null;
  deletedIds: string[];
}> {
  const [campSnap, wsSnap, metaSnap] = await Promise.all([
    getDocs(collection(db, CAMPAIGNS_COLLECTION)).catch(() => null),
    getDocFromServer(doc(db, SETTINGS_COLLECTION, 'workspace_sync_v1'))
      .catch(() => getDoc(doc(db, SETTINGS_COLLECTION, 'workspace_sync_v1')))
      .catch(() => null),
    getDocFromServer(doc(db, SETTINGS_COLLECTION, 'meta_config'))
      .catch(() => getDoc(doc(db, SETTINGS_COLLECTION, 'meta_config')))
      .catch(() => null),
  ]);

  const campaigns: Campaign[] = [];
  if (campSnap) {
    campSnap.forEach((d) => {
      const data = d.data() as any;
      campaigns.push({
        ...data,
        id: d.id,
        title: data.title || data.name || 'Campanha',
      });
    });
  }

  const workspace = wsSnap && wsSnap.exists() ? (wsSnap.data() as WorkspaceSyncData) : null;
  const deletedIds: string[] =
    metaSnap && metaSnap.exists() && Array.isArray(metaSnap.data()?.deletedCampaignIds)
      ? metaSnap.data()!.deletedCampaignIds
      : ['camp-1', 'camp-2', 'camp-3'];

  return { campaigns, workspace, deletedIds };
}

/**
 * Dedicated Cloud Sync for Global Media Scalers Mode (audiences, trash, groups, offers)
 * Stored in autoviral_settings/global_workspace_sync_v1 so Global audiences never get lost across tabs/devices.
 */
export interface GlobalWorkspaceSyncData {
  globalAudiences?: any[];
  globalTrashAudiences?: any[];
  globalGroups?: any[];
  globalOffers?: any[];
  dismissedRecoveryKeys?: string[];
  updatedAt?: string;
}

const globalWorkspaceFieldHashes: Record<string, string> = {};

function recordCloudGlobalHashes(data: Record<string, any> | null | undefined) {
  if (!data || typeof data !== 'object') return;
  for (const [k, v] of Object.entries(data)) {
    if (k === 'updatedAt' || v === undefined) continue;
    try {
      globalWorkspaceFieldHashes[k] = JSON.stringify(v);
    } catch {}
  }
}

export async function saveGlobalWorkspaceSyncToFirebase(
  partial: Partial<GlobalWorkspaceSyncData>,
  options?: { force?: boolean }
): Promise<{ ok: boolean; skipped?: boolean; quotaExceeded?: boolean; error?: string }> {
  if (isSupabaseConnected()) {
    const supaRes = await saveWorkspaceJsonToSupabase('global_workspace_sync_v1', stripUndefinedDeep(partial), {
      mergeObject: true,
      force: options?.force,
    });
    if (isPrimarySupabase()) {
      return { ok: supaRes.ok, error: supaRes.error };
    }
  }
  if (isFirestoreWritesPaused() && !options?.force) {
    return { ok: false, quotaExceeded: true, error: 'quota-paused' };
  }
  try {
    const safePayload: Record<string, any> = {};
    let hasChanges = Boolean(options?.force);

    Object.entries(partial).forEach(([key, value]) => {
      if (value === undefined) return;
      let normalizedValue = stripUndefinedDeep(value);
      if (key === 'globalGroups' && Array.isArray(normalizedValue)) {
        normalizedValue = normalizedValue.slice(0, 600);
      } else if (key === 'globalAudiences' && Array.isArray(normalizedValue)) {
        normalizedValue = normalizedValue.slice(0, 120).map((a: any) => {
          if (!a || typeof a !== 'object') return a;
          const snaps = Array.isArray(a.groupSnapshots) ? a.groupSnapshots.slice(0, 400) : a.groupSnapshots;
          return { ...a, groupSnapshots: snaps };
        });
      } else if (Array.isArray(normalizedValue)) {
        normalizedValue = normalizedValue.slice(0, 200);
      }

      const serialized = JSON.stringify(normalizedValue);
      if (globalWorkspaceFieldHashes[key] !== serialized) {
        hasChanges = true;
        safePayload[key] = normalizedValue;
      }
    });

    if (!hasChanges || Object.keys(safePayload).length === 0) {
      return { ok: true, skipped: true };
    }

    safePayload.updatedAt = new Date().toISOString();

    if (JSON.stringify(safePayload).length > 850000 && Array.isArray(safePayload.globalGroups)) {
      safePayload.globalGroups = safePayload.globalGroups.slice(0, 300);
    }
    if (JSON.stringify(safePayload).length > 900000 && Array.isArray(safePayload.globalAudiences)) {
      safePayload.globalAudiences = safePayload.globalAudiences.map((a: any) => ({
        ...a,
        groupSnapshots: Array.isArray(a?.groupSnapshots) ? a.groupSnapshots.slice(0, 80) : undefined,
      }));
    }
    if (JSON.stringify(safePayload).length > 920000) {
      delete safePayload.globalGroups;
    }

    await setDoc(doc(db, SETTINGS_COLLECTION, 'global_workspace_sync_v1'), safePayload, { merge: true });
    recordCloudGlobalHashes(safePayload);
    return { ok: true };
  } catch (error: any) {
    if (isQuotaExceededError(error)) {
      firestoreWritesPausedUntil = Date.now() + 15 * 60 * 1000;
      const now = Date.now();
      if (now - lastQuotaNoticeAt > 30000) {
        lastQuotaNoticeAt = now;
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('autoviral_firebase_quota_exceeded'));
        }
      }
      return { ok: false, quotaExceeded: true, error: error?.message || String(error) };
    }
    console.warn('Global workspace sync write notice:', error);
    return { ok: false, error: error?.message || String(error) };
  }
}

export function subscribeGlobalWorkspaceSync(
  onUpdate: (data: GlobalWorkspaceSyncData) => void,
  onError?: (err: any) => void
): () => void {
  const docRef = doc(db, SETTINGS_COLLECTION, 'global_workspace_sync_v1');
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as GlobalWorkspaceSyncData;
        recordCloudGlobalHashes(data as Record<string, any>);
        onUpdate(data);
      }
    },
    (err) => {
      console.warn('Global workspace sync subscription error:', err);
      if (isQuotaExceededError(err)) {
        triggerQuotaExhaustedFailover('[Firebase Quota] Cota atingida ao ler workspace global.');
      }
      if (onError) onError(err);
    }
  );
}

export async function pullGlobalWorkspaceSyncFromFirebase(): Promise<GlobalWorkspaceSyncData | null> {
  try {
    const snap = await getDocFromServer(doc(db, SETTINGS_COLLECTION, 'global_workspace_sync_v1')).catch(() =>
      getDoc(doc(db, SETTINGS_COLLECTION, 'global_workspace_sync_v1'))
    );
    return snap.exists() ? (snap.data() as GlobalWorkspaceSyncData) : null;
  } catch (err) {
    console.warn('Pull global workspace error:', err);
    return null;
  }
}

/**
 * Discover archived campaigns stored in autoviral_settings/landing_page_* or INITIAL_CAMPAIGNS
 * that are currently missing from active campaigns (excluding dummy camp-1..camp-3).
 */
export async function fetchRecoverableArchivedCampaigns(activeCampaignIds: string[]): Promise<Campaign[]> {
  const activeSet = new Set(activeCampaignIds);
  const dummyIds = new Set(['camp-1', 'camp-2', 'camp-3']);
  const recoveredMap = new Map<string, Campaign>();

  try {
    const settingsSnap = await getDocs(collection(db, SETTINGS_COLLECTION));
    settingsSnap.forEach((d) => {
      if (!d.id.startsWith('landing_page_')) return;
      const data = d.data() as any;
      const campId = data.campaignId || d.id.replace('landing_page_', '');
      if (!campId || campId === 'tarefinhas' || dummyIds.has(campId) || activeSet.has(campId)) return;
      const title = data.title || data.headline;
      if (!title) return;
      recoveredMap.set(campId, {
        id: campId,
        title,
        niche: (data.niche as any) || 'renda_extra',
        nicheLabel: data.nicheLabel || data.badgeText || 'Campanha Recuperada',
        targetAudience: data.targetAudience || 'Público-alvo da campanha recuperada',
        painPointTargeted: data.subheadline || data.painPointTargeted || 'Dor tratada pelo produto',
        checkoutUrl: data.checkoutUrl || undefined,
        whatsappNumber: data.whatsappNumber || '5541998778348',
        price: Number(data.price) || 9.9,
        oldPrice: data.oldPrice ? Number(data.oldPrice) : undefined,
        headline: data.headline || title,
        subheadline: data.subheadline || '',
        badgeText: data.badgeText || '',
        guaranteeDays: data.guaranteeDays ? Number(data.guaranteeDays) : 7,
        ctaText: data.ctaText || 'QUERO GARANTIR MEU ACESSO AGORA',
        imageUrl: typeof data.imageUrl === 'string' && data.imageUrl.length < 300000 ? data.imageUrl : '',
        status: 'active',
        createdAt: data.updatedAt || new Date().toISOString(),
        antiBanOrganicMode: true,
        platforms: ['facebook', 'instagram', 'whatsapp'],
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
      });
    });
  } catch (err) {
    console.warn('Could not scan landing_page settings for recovery:', err);
  }

  INITIAL_CAMPAIGNS.forEach((initCamp) => {
    if (!activeSet.has(initCamp.id) && !recoveredMap.has(initCamp.id)) {
      recoveredMap.set(initCamp.id, initCamp);
    }
  });

  return Array.from(recoveredMap.values());
}

/**
 * Restore an archived campaign back into autoviral_campaigns and remove from deletedCampaignIds blacklist.
 */
export async function restoreArchivedCampaignToFirebase(campaign: Campaign): Promise<void> {
  await saveCampaignToFirebase(campaign);
  try {
    const metaRef = doc(db, SETTINGS_COLLECTION, 'meta_config');
    const metaSnap = await getDoc(metaRef);
    if (metaSnap.exists()) {
      const existingDeleted: string[] = Array.isArray(metaSnap.data()?.deletedCampaignIds)
        ? metaSnap.data()!.deletedCampaignIds
        : [];
      const filtered = existingDeleted.filter((id) => id !== campaign.id);
      await setDoc(
        metaRef,
        {
          deletedCampaignIds: filtered,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.warn('Could not clear deletedCampaignIds entry:', err);
  }
}

/**
 * Sync extra non-secret workspace settings (Global Kits, Inbox, Bot Logs, Preferences, Multi-channel states)
 * in autoviral_settings/workspace_extras_v1 so fresh/incognito browsers stay 100% identical.
 */
export async function saveExtrasWorkspaceToFirebase(
  extraKeys: Record<string, any>
): Promise<{ ok: boolean; quotaExceeded?: boolean; error?: string }> {
  if (!extraKeys || typeof extraKeys !== 'object' || Object.keys(extraKeys).length === 0) {
    return { ok: true };
  }
  if (isSupabaseConnected()) {
    await saveWorkspaceJsonToSupabase('workspace_extras_v1', stripUndefinedDeep(extraKeys), {
      mergeObject: true,
      force: true,
    }).catch(() => {});
    if (isPrimarySupabase()) {
      return { ok: true };
    }
  }
  if (isFirestoreWritesPaused()) {
    return { ok: false, quotaExceeded: true, error: 'quota-paused' };
  }
  const path = `${SETTINGS_COLLECTION}/workspace_extras_v1`;
  try {
    const clean = stripUndefinedDeep({ ...extraKeys });
    const payload = {
      extraKeys: clean,
      updatedAt: new Date().toISOString(),
    };
    if (JSON.stringify(payload).length > 850000) {
      delete clean.autoviral_fb_bot_logs_v3;
      delete clean.autoviral_global_bot_logs_v1;
      delete clean.autoviral_global_inbox_groups_v1;
    }
    await setDoc(doc(db, SETTINGS_COLLECTION, 'workspace_extras_v1'), payload, { merge: true });
    return { ok: true };
  } catch (error: any) {
    if (isQuotaExceededError(error)) {
      triggerQuotaExhaustedFailover('[Firebase Quota] Cota atingida ao salvar extras do workspace.');
      return { ok: false, quotaExceeded: true, error: error?.message || String(error) };
    }
    console.warn('Extras workspace sync notice:', error);
    return { ok: false, error: error?.message || String(error) };
  }
}

export async function pullExtrasWorkspaceFromFirebase(): Promise<Record<string, any> | null> {
  try {
    const snap = await getDocFromServer(doc(db, SETTINGS_COLLECTION, 'workspace_extras_v1')).catch(() =>
      getDoc(doc(db, SETTINGS_COLLECTION, 'workspace_extras_v1'))
    );
    if (snap.exists()) {
      const data = snap.data() as any;
      return data?.extraKeys && typeof data.extraKeys === 'object' ? data.extraKeys : null;
    }
    return null;
  } catch (err) {
    console.warn('Pull extras workspace error:', err);
    return null;
  }
}

/**
 * Save & Pull a cross-browser / incognito transfer snapshot in Firestore (non-secret data only)
 */
export async function saveTransferVaultToFirebase(
  code: string,
  snapshot: Record<string, any>
): Promise<{ ok: boolean; error?: string }> {
  const cleanCode = code.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase();
  if (!cleanCode || cleanCode.length > 64) return { ok: false, error: 'invalid-code' };
  if (isFirestoreWritesPaused()) return { ok: false, error: 'quota-paused' };

  const docId = `vault_${cleanCode}`;
  const path = `${SETTINGS_COLLECTION}/${docId}`;
  try {
    const cleanSnap = stripUndefinedDeep(snapshot);
    // Guard Firestore 1MB limit while preserving campaigns, offers, kits, audiences, groups
    if (JSON.stringify(cleanSnap).length > 850000 && cleanSnap?.workspace) {
      if (Array.isArray(cleanSnap.workspace.botLogs)) cleanSnap.workspace.botLogs = cleanSnap.workspace.botLogs.slice(0, 20);
      if (Array.isArray(cleanSnap.workspace.globalBotLogs)) cleanSnap.workspace.globalBotLogs = cleanSnap.workspace.globalBotLogs.slice(0, 20);
      if (Array.isArray(cleanSnap.trackingEvents)) cleanSnap.trackingEvents = cleanSnap.trackingEvents.slice(0, 50);
    }
    await setDoc(doc(db, SETTINGS_COLLECTION, docId), {
      code: cleanCode,
      snapshot: cleanSnap,
      updatedAt: new Date().toISOString(),
    });
    return { ok: true };
  } catch (error: any) {
    if (isQuotaExceededError(error)) {
      triggerQuotaExhaustedFailover('[Firebase Quota] Cota atingida ao salvar cofre de transferência.');
      return { ok: false, error: 'quota-exceeded' };
    }
    handleWriteError(error, OperationType.WRITE, path);
    return { ok: false, error: error?.message || String(error) };
  }
}

export async function pullTransferVaultFromFirebase(code: string): Promise<Record<string, any> | null> {
  const cleanCode = code.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase();
  if (!cleanCode) return null;
  try {
    const snap = await getDocFromServer(doc(db, SETTINGS_COLLECTION, `vault_${cleanCode}`)).catch(() =>
      getDoc(doc(db, SETTINGS_COLLECTION, `vault_${cleanCode}`))
    );
    if (snap.exists()) {
      const data = snap.data() as any;
      return data?.snapshot || null;
    }
    return null;
  } catch (err) {
    console.warn('Pull transfer vault from Firebase error:', err);
    return null;
  }
}


