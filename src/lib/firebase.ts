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
import { Campaign, TrackingEvent } from '../types';
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
        // Bootstrap defaults if empty
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
        const data = d.data() as Campaign;
        list.push({ ...data, id: d.id });
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
 * Save or update campaign in Firestore
 */
export async function saveCampaignToFirebase(campaign: Campaign): Promise<void> {
  const path = `${CAMPAIGNS_COLLECTION}/${campaign.id}`;
  try {
    const docRef = doc(db, CAMPAIGNS_COLLECTION, campaign.id);
    await setDoc(docRef, {
      ...campaign,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
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
export async function saveLandingPageSettingsToFirebase(settings: Record<string, any>): Promise<void> {
  const path = `${SETTINGS_COLLECTION}/landing_page_tarefinhas`;
  try {
    await setDoc(doc(db, SETTINGS_COLLECTION, 'landing_page_tarefinhas'), {
      ...settings,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribe to Landing Page override settings
 */
export function subscribeLandingPageSettings(onUpdate: (settings: any) => void): () => void {
  const docRef = doc(db, SETTINGS_COLLECTION, 'landing_page_tarefinhas');
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

