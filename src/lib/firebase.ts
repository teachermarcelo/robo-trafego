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

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId to getFirestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Connection test on boot (per Skill specification)
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or starting up.');
    }
  }
}
testConnection();

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
      if (onError) onError(error);
    }
  );
}

/**
 * Save or update campaign in Firestore (ensures both title and name are populated)
 */
export async function saveCampaignToFirebase(campaign: Campaign): Promise<void> {
  const path = `${CAMPAIGNS_COLLECTION}/${campaign.id}`;
  try {
    const docRef = doc(db, CAMPAIGNS_COLLECTION, campaign.id);
    const titleVal = campaign.title || (campaign as any).name || 'Campanha';
    await setDoc(
      docRef,
      {
        ...campaign,
        id: campaign.id,
        title: titleVal,
        name: titleVal,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Permanently delete campaign and record in blacklist
 */
export async function deleteCampaignFromFirebase(campaignId: string): Promise<void> {
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
    handleFirestoreError(error, OperationType.DELETE, path);
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
  const path = `${TRACKING_COLLECTION}/${event.id}`;
  try {
    const docRef = doc(db, TRACKING_COLLECTION, event.id);
    await setDoc(docRef, event);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
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
  const path = `${SETTINGS_COLLECTION}/${docKey}`;
  try {
    await setDoc(doc(db, SETTINGS_COLLECTION, docKey), {
      ...settings,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // Also update generic fallback if tarefinhas
    if (!campaignId || campaignId === 'camp-tarefinhas-autismo') {
      await setDoc(doc(db, SETTINGS_COLLECTION, 'landing_page_tarefinhas'), {
        ...settings,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
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
  const path = `${SETTINGS_COLLECTION}/dispatch_${template.nicheId}`;
  try {
    await setDoc(doc(db, SETTINGS_COLLECTION, `dispatch_${template.nicheId}`), {
      ...template,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
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
  const cleanId = profile.handle.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `${PROFILES_COLLECTION}/${cleanId}`;
  try {
    await setDoc(doc(db, PROFILES_COLLECTION, cleanId), {
      ...profile,
      id: cleanId,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCustomProfileFromFirebase(handle: string): Promise<void> {
  const cleanId = handle.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `${PROFILES_COLLECTION}/${cleanId}`;
  try {
    await deleteDoc(doc(db, PROFILES_COLLECTION, cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
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
  const path = `${SETTINGS_COLLECTION}/instagram_origin_profile`;
  try {
    await setDoc(doc(db, SETTINGS_COLLECTION, 'instagram_origin_profile'), {
      ...account,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
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
  const path = `${CUSTOMERS_COLLECTION}/${cleanId}`;
  try {
    await setDoc(doc(db, CUSTOMERS_COLLECTION, cleanId), {
      ...customer,
      id: cleanId,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCustomerLeadFromFirebase(customerId: string): Promise<void> {
  const cleanId = customerId.replace(/\//g, '_');
  const path = `${CUSTOMERS_COLLECTION}/${cleanId}`;
  try {
    await deleteDoc(doc(db, CUSTOMERS_COLLECTION, cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
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
  const path = `${SETTINGS_COLLECTION}/meta_ads_config`;
  try {
    await setDoc(doc(db, SETTINGS_COLLECTION, 'meta_ads_config'), {
      ...config,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
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
  updatedAt?: string;
}

export async function saveWorkspaceSyncToFirebase(
  partial: Partial<WorkspaceSyncData>
): Promise<{ ok: boolean; error?: string }> {
  try {
    const safePayload: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    Object.entries(partial).forEach(([key, value]) => {
      if (value === undefined) return;
      if (key === 'mappedGroups' && Array.isArray(value)) {
        safePayload[key] = value.slice(0, 450);
      } else if (key === 'mappedInstaTargets' && Array.isArray(value)) {
        safePayload[key] = value.slice(0, 300);
      } else if (Array.isArray(value)) {
        safePayload[key] = value.slice(0, 250);
      } else {
        safePayload[key] = value;
      }
    });

    // Guard against Firestore 1MB document limit
    const serializedSize = JSON.stringify(safePayload).length;
    if (serializedSize > 850000 && Array.isArray(safePayload.mappedGroups)) {
      safePayload.mappedGroups = safePayload.mappedGroups.slice(0, 200);
    }
    if (JSON.stringify(safePayload).length > 900000) {
      delete safePayload.mappedGroups;
    }

    await setDoc(doc(db, SETTINGS_COLLECTION, 'workspace_sync_v1'), safePayload, { merge: true });
    return { ok: true };
  } catch (error: any) {
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
        onUpdate(snap.data() as WorkspaceSyncData);
      }
    },
    (err) => {
      console.warn('Workspace sync subscription error:', err);
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
    getDocs(collection(db, CAMPAIGNS_COLLECTION)),
    getDocFromServer(doc(db, SETTINGS_COLLECTION, 'workspace_sync_v1')).catch(() =>
      getDoc(doc(db, SETTINGS_COLLECTION, 'workspace_sync_v1'))
    ),
    getDocFromServer(doc(db, SETTINGS_COLLECTION, 'meta_config')).catch(() =>
      getDoc(doc(db, SETTINGS_COLLECTION, 'meta_config'))
    ),
  ]);

  const campaigns: Campaign[] = [];
  campSnap.forEach((d) => {
    const data = d.data() as any;
    campaigns.push({
      ...data,
      id: d.id,
      title: data.title || data.name || 'Campanha',
    });
  });

  const workspace = wsSnap.exists() ? (wsSnap.data() as WorkspaceSyncData) : null;
  const deletedIds: string[] = metaSnap.exists() && Array.isArray(metaSnap.data()?.deletedCampaignIds)
    ? metaSnap.data()!.deletedCampaignIds
    : ['camp-1', 'camp-2', 'camp-3'];

  return { campaigns, workspace, deletedIds };
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

