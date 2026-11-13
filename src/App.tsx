/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { PainFinderTab } from './components/PainFinderTab';
import { CreativeStudioTab } from './components/CreativeStudioTab';
import { SalesBotTab } from './components/SalesBotTab';
import { RealtimeTrackingTab } from './components/RealtimeTrackingTab';
import { CampaignManagerTab } from './components/CampaignManagerTab';
import { AIReportsTab } from './components/AIReportsTab';
import { LeadFinderTab } from './components/LeadFinderTab';
import { LandingPageBuilderTab } from './components/LandingPageBuilderTab';
import { PublicLeadLanding } from './components/PublicLeadLanding';
import { BridgePageModal } from './components/BridgePageModal';
import { Security2FAModal } from './components/Security2FAModal';
import { NotificationsModal } from './components/NotificationsModal';
import { SupabaseModal } from './components/SupabaseModal';
import { VercelModal } from './components/VercelModal';
import { CustomerLeadsModal } from './components/CustomerLeadsModal';
import { MetaAdsBoosterTab } from './components/MetaAdsBoosterTab';
import { RoboDivulgadorCidades } from './components/RoboDivulgadorCidades';
import { BrevoEmailWhatsAppTab } from './components/BrevoEmailWhatsAppTab';
import { ChromeFbGroupsTab } from './components/ChromeFbGroupsTab';
import { PWAInstallModal } from './components/PWAInstallModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { getCampaignSlug } from './utils/campaignSlug';
import { INITIAL_CAMPAIGNS } from './data/defaultCampaigns';
import { Campaign, TrackingEvent, PainPointData, PushNotification, CustomerLead } from './types';
import {
  fetchSupabaseCampaigns,
  saveCampaignToSupabase,
  deleteCampaignFromSupabase,
  isSupabaseConnected,
} from './lib/supabaseClient';
import {
  saveCampaignToFirebase,
  deleteCampaignFromFirebase,
  subscribeFirebaseCampaigns,
  subscribeDeletedCampaignIds,
  saveTrackingEventToFirebase,
  subscribeTrackingEvents,
  subscribeCustomerLeads,
  saveCustomerLeadToFirebase,
  deleteCustomerLeadFromFirebase,
  saveWorkspaceSyncToFirebase,
  subscribeWorkspaceSync,
  pullFullCloudSnapshotFromFirebase,
  fetchRecoverableArchivedCampaigns,
  restoreArchivedCampaignToFirebase,
  WorkspaceSyncData,
} from './lib/firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCampaignForDispatches, setSelectedCampaignForDispatches] = useState<string | null>(null);
  const [deletedCampaignIds, setDeletedCampaignIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('autoviral_deleted_campaign_ids');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch {}
    // Pre-blacklist fictitious demo campaigns so they never resurrect
    return new Set(['camp-1', 'camp-2', 'camp-3']);
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      const savedDeleted = localStorage.getItem('autoviral_deleted_campaign_ids');
      const delSet = savedDeleted ? new Set(JSON.parse(savedDeleted)) : new Set(['camp-1', 'camp-2', 'camp-3']);
      const mergedMap = new Map<string, Campaign>();

      const pushList = (raw: string | null) => {
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach((c: any) => {
              if (c?.id && !delSet.has(c.id) && !mergedMap.has(c.id)) {
                mergedMap.set(c.id, c);
              }
            });
          }
        } catch {}
      };

      pushList(localStorage.getItem('autoviral_campaigns'));
      pushList(localStorage.getItem('autoviral_managed_campaigns_v5'));

      if (mergedMap.size > 0) {
        INITIAL_CAMPAIGNS.forEach((d) => {
          if (!mergedMap.has(d.id) && !delSet.has(d.id)) {
            mergedMap.set(d.id, d);
          }
        });
        return Array.from(mergedMap.values()).map((c) => {
          if (c.id === 'camp-tarefinhas-autismo' && (c.price === 37 || c.price === 3.99 || !c.price)) {
            return { ...c, price: 9.90, oldPrice: 47.0 };
          }
          return c;
        });
      }
      return INITIAL_CAMPAIGNS.filter((c) => !delSet.has(c.id));
    } catch {
      return INITIAL_CAMPAIGNS;
    }
  });

  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>(() => {
    try {
      const saved = localStorage.getItem('autoviral_tracking_events');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });
  const [customerLeads, setCustomerLeads] = useState<CustomerLead[]>([]);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isVercelModalOpen, setIsVercelModalOpen] = useState(false);
  const [isPWAInstallModalOpen, setIsPWAInstallModalOpen] = useState(false);
  const [bridgeModalCampaign, setBridgeModalCampaign] = useState<Campaign | null>(null);
  const [firebaseSyncStatus, setFirebaseSyncStatus] = useState<'connecting' | 'synced' | 'error'>('connecting');
  const [cloudCampaignsCount, setCloudCampaignsCount] = useState<number>(0);
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);
  const [recoverableCampaigns, setRecoverableCampaigns] = useState<Campaign[]>([]);
  const [isPublicLeadMode, setIsPublicLeadMode] = useState<boolean>(() => {
    try {
      const search = window.location.search;
      return search.includes('p=') || search.includes('lead=') || search.includes('camp=');
    } catch {
      return false;
    }
  });


  // Selected pain from PainFinder passed to CreativeStudio
  const [selectedPainForCreative, setSelectedPainForCreative] = useState<PainPointData | null>(null);
  const [selectedNicheForCreative, setSelectedNicheForCreative] = useState<string>('psicopedagogia');

  // Push notifications
  const [notifications, setNotifications] = useState<PushNotification[]>([
    {
      id: 'n-1',
      title: '🎉 Nova Venda no Pix Confirmada!',
      message: 'Você recebeu R$ 97,00 referente ao Desafio Detox 21 Dias.',
      time: 'Há 12 min',
      type: 'sale',
      read: false,
    },
    {
      id: 'n-2',
      title: '🚀 Pico de Visualizações no TikTok',
      message: 'Seu vídeo com gancho dos 5 minutos alcançou 4.800 pessoas organicamente.',
      time: 'Há 45 min',
      type: 'traffic',
      read: false,
    },
    {
      id: 'n-3',
      title: '🛡️ Auditoria Anti-Bloqueio Concluída',
      message: 'Todas as suas campanhas estão 100% livres de risco nas diretrizes do algoritmo.',
      time: 'Há 2h',
      type: 'security',
      read: true,
    },
  ]);

  // Save campaigns to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('autoviral_campaigns', JSON.stringify(campaigns));
    } catch (e) {
      console.error('LocalStorage save error:', e);
    }
  }, [campaigns]);

  // 1. Subscribe to Firebase deleted campaign IDs (ensures dummy campaigns stay deleted on all devices)
  useEffect(() => {
    const unsubDeleted = subscribeDeletedCampaignIds((ids) => {
      if (ids && ids.length > 0) {
        setDeletedCampaignIds(new Set(ids));
        try {
          localStorage.setItem('autoviral_deleted_campaign_ids', JSON.stringify(ids));
        } catch {}
      }
    });
    return () => unsubDeleted();
  }, []);

  // 2. Real-time Firebase Firestore campaigns listener (synchronizes all browsers & mobile devices)
  useEffect(() => {
    const unsubCampaigns = subscribeFirebaseCampaigns(
      (cloudCampaigns) => {
        setFirebaseSyncStatus('synced');
        setCloudCampaignsCount(cloudCampaigns?.length || 0);
        if (cloudCampaigns && cloudCampaigns.length > 0) {
          let delSet = deletedCampaignIds;
          try {
            const savedDeleted = localStorage.getItem('autoviral_deleted_campaign_ids');
            if (savedDeleted) delSet = new Set(JSON.parse(savedDeleted));
          } catch {}
          const valid = cloudCampaigns.filter((c) => !delSet.has(c.id));
          if (valid.length > 0) {
            setCampaigns((prev) => {
              const cloudIds = new Set(valid.map((c) => c.id));
              // Preserve any newly created local campaigns not yet in cloud and push them up
              const localUnsynced = prev.filter((p) => !cloudIds.has(p.id) && !delSet.has(p.id));
              localUnsynced.forEach((lu) => {
                saveCampaignToFirebase(lu).catch(console.warn);
              });
              const merged = [...valid, ...localUnsynced];
              try {
                localStorage.setItem('autoviral_campaigns', JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
        }
      },
      (err) => {
        console.warn('Firebase campaigns sync notice:', err);
        setFirebaseSyncStatus('error');
      }
    );
    return () => unsubCampaigns();
  }, [deletedCampaignIds]);

  // 2b. Root-level Firebase Workspace Sync listener (guarantees mobile PWA receives groups/audiences/stories even on Dashboard)
  useEffect(() => {
    const mergeWorkspaceIntoLocalStorage = (cloud: WorkspaceSyncData) => {
      if (!cloud || typeof cloud !== 'object') return;
      const safeRead = (k: string) => {
        try {
          const r = localStorage.getItem(k);
          return r ? JSON.parse(r) : null;
        } catch {
          return null;
        }
      };
      const safeWrite = (k: string, val: any) => {
        try {
          localStorage.setItem(k, JSON.stringify(val));
        } catch {}
      };

      if (cloud.savedCopiesMap && typeof cloud.savedCopiesMap === 'object') {
        const prev = safeRead('autoviral_saved_copies_v1') || {};
        const next = { ...prev };
        Object.entries(cloud.savedCopiesMap).forEach(([id, entry]: [string, any]) => {
          if (!entry) return;
          if (!next[id] || (entry.savedAt && (!next[id].savedAt || entry.savedAt > next[id].savedAt))) {
            next[id] = entry;
          }
        });
        safeWrite('autoviral_saved_copies_v1', next);
      }

      const mergeArrayByKey = (keys: string[], incoming: any[] | undefined, idKey: string) => {
        if (!Array.isArray(incoming) || incoming.length === 0) return;
        const existing: any[] = safeRead(keys[0]) || [];
        const seen = new Set(existing.map((item) => String(item?.[idKey] || '').toLowerCase()).filter(Boolean));
        const fresh = incoming.filter((item) => {
          const k = String(item?.[idKey] || '').toLowerCase();
          if (!k || seen.has(k)) return false;
          seen.add(k);
          return true;
        });
        if (fresh.length > 0) {
          const combined = [...fresh, ...existing];
          keys.forEach((k) => safeWrite(k, combined));
        }
      };

      mergeArrayByKey(['autoviral_fb_audiences_v4', 'autoviral_fb_audiences_v3'], cloud.audiences, 'id');
      mergeArrayByKey(['autoviral_fb_mapped_groups_v5_real', 'autoviral_fb_mapped_groups_v3'], cloud.mappedGroups, 'url');
      mergeArrayByKey(['autoviral_yt_videos_v2'], cloud.youtubeVideos, 'url');
      mergeArrayByKey(['autoviral_pinterest_pins_v1'], cloud.pinterestPins, 'id');
      mergeArrayByKey(['autoviral_insta_campaigns_v1'], cloud.instaCampaigns, 'id');
      mergeArrayByKey(['autoviral_insta_story_queue', 'autoviral_insta_story_queue_v2'], cloud.storyQueue, 'id');
      mergeArrayByKey(['autoviral_insta_mapped_targets_v2'], cloud.mappedInstaTargets, 'handle');
      mergeArrayByKey(['autoviral_custom_copy_presets_v1'], cloud.customCopyPresets, 'id');

      window.dispatchEvent(new CustomEvent('autoviral_workspace_synced', { detail: cloud }));
    };

    const unsubWs = subscribeWorkspaceSync(mergeWorkspaceIntoLocalStorage);
    return () => unsubWs();
  }, []);

  // 2c. Discover archived/previous campaigns in Firebase settings so user can restore in 1 click if needed
  useEffect(() => {
    let active = true;
    const activeIds = campaigns.map((c) => c.id);
    fetchRecoverableArchivedCampaigns(activeIds)
      .then((found) => {
        if (active) setRecoverableCampaigns(found);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [campaigns]);

  // 3. Real-time Firebase Firestore tracking events listener + Server /api/tracking/events sync
  useEffect(() => {
    const unsubTracking = subscribeTrackingEvents((cloudEvents) => {
      if (cloudEvents && cloudEvents.length > 0) {
        setTrackingEvents(cloudEvents);
        try {
          localStorage.setItem('autoviral_tracking_events', JSON.stringify(cloudEvents));
        } catch {}
      }
    });

    const syncServerTrackingEvents = async () => {
      try {
        const res = await fetch('/api/tracking/events');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.events) && data.events.length > 0) {
            setTrackingEvents((prev) => {
              const existingIds = new Set(prev.map((e) => e.id));
              const fresh = data.events.filter((e: TrackingEvent) => !existingIds.has(e.id));
              if (fresh.length === 0) return prev;
              const merged = [...fresh, ...prev].slice(0, 500);
              try {
                localStorage.setItem('autoviral_tracking_events', JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
        }
      } catch {}
    };

    syncServerTrackingEvents();
    const serverPoll = setInterval(syncServerTrackingEvents, 12000);

    return () => {
      unsubTracking();
      clearInterval(serverPoll);
    };
  }, []);

  // 4. Real-time Firebase Firestore customer leads & WhatsApp buyers listener
  useEffect(() => {
    const unsubCustomers = subscribeCustomerLeads(
      (cloudCustomers) => {
        if (cloudCustomers && cloudCustomers.length > 0) {
          setCustomerLeads(cloudCustomers);
        }
      },
      (err) => console.warn('Customer leads sync notice:', err)
    );

    // Initial load from backend API
    fetch('/api/customers')
      .then((r) => r.json())
      .then((data) => {
        if (data.customers && Array.isArray(data.customers)) {
          setCustomerLeads((prev) => {
            if (prev.length === 0) return data.customers;
            const existingIds = new Set(prev.map((c) => c.id));
            const fresh = data.customers.filter((c: CustomerLead) => !existingIds.has(c.id));
            return [...prev, ...fresh];
          });
        }
      })
      .catch(() => {});

    return () => unsubCustomers();
  }, []);

  // 5. Secondary fallback fetch from server backend and Supabase (non-destructive functional merge)
  useEffect(() => {
    let isMounted = true;

    const syncAllCampaigns = async () => {
      const incomingFromSecondary: Campaign[] = [];
      let delSet = deletedCampaignIds;
      try {
        const savedDeleted = localStorage.getItem('autoviral_deleted_campaign_ids');
        if (savedDeleted) delSet = new Set(JSON.parse(savedDeleted));
      } catch {}

      try {
        const res = await fetch('/api/campaigns');
        if (res.ok) {
          const json = await res.json();
          if (json.campaigns && Array.isArray(json.campaigns)) {
            json.campaigns.forEach((sc: Campaign) => {
              if (!delSet.has(sc.id)) incomingFromSecondary.push(sc);
            });
          }
        }
      } catch {}

      try {
        if (isSupabaseConnected()) {
          const supaCampaigns = await fetchSupabaseCampaigns();
          if (supaCampaigns && supaCampaigns.length > 0) {
            supaCampaigns.forEach((sc) => {
              if (!delSet.has(sc.id)) incomingFromSecondary.push(sc);
            });
          }
        }
      } catch (err) {
        console.warn('Supabase sync notice:', err);
      }

      if (isMounted && incomingFromSecondary.length > 0) {
        setCampaigns((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const onlyMissing = incomingFromSecondary.filter((sc) => !existingIds.has(sc.id));
          if (onlyMissing.length === 0) return prev;
          return [...prev, ...onlyMissing];
        });
      }
    };

    syncAllCampaigns();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalRevenue = campaigns.reduce((acc, c) => acc + c.revenue, 0);

  // Handler to record a new tracking event (works online and client-side on Vercel)
  const handleAddTrackingEvent = async (eventData: Partial<TrackingEvent>) => {
    const targetCampaign =
      campaigns.find((c) => c.id === eventData.campaignId) || campaigns[0];

    const localEvent: TrackingEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      campaignId: eventData.campaignId || targetCampaign?.id || 'camp-tarefinhas-autismo',
      campaignTitle: eventData.campaignTitle || targetCampaign?.title || '+ 100 Tarefinha Educação Infantil e Autismo',
      niche: eventData.niche || targetCampaign?.niche || 'psicopedagogia',
      type: eventData.type || 'click',
      timestamp: new Date().toISOString(),
      geo: eventData.geo || { state: 'SP', city: 'Visitante Real', country: 'Brasil' },
      device: eventData.device || (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'),
      ageBracket: eventData.ageBracket || '25-34',
      source: eventData.source || 'instagram',
      amount: eventData.amount,
      leadScore: eventData.leadScore || 85,
      durationSeconds: eventData.durationSeconds || 18,
      isSimulation: eventData.isSimulation ?? false,
    };

    // 1. Immediately update tracking events locally
    setTrackingEvents((prev) => {
      const updated = [localEvent, ...prev.slice(0, 499)];
      try {
        localStorage.setItem('autoviral_tracking_events', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 2. Update campaign metrics (clicks, conversions, revenue)
    setCampaigns((prev) => {
      const updatedCampaigns = prev.map((c) => {
        if (c.id === localEvent.campaignId) {
          const isClick = localEvent.type === 'click' || localEvent.type === 'whatsapp_click' || localEvent.type === 'checkout_click';
          const isConv = localEvent.type === 'conversion';
          const addRevenue = isConv ? (localEvent.amount || c.price) : 0;
          return {
            ...c,
            clicks: isClick ? c.clicks + 1 : c.clicks,
            conversions: isConv ? c.conversions + 1 : c.conversions,
            revenue: c.revenue + addRevenue,
          };
        }
        return c;
      });
      try {
        localStorage.setItem('autoviral_campaigns', JSON.stringify(updatedCampaigns));
      } catch {}
      return updatedCampaigns;
    });

    // 3. Add Push Notification
    if (localEvent.type === 'conversion') {
      const newNotif: PushNotification = {
        id: `notif-${Date.now()}`,
        title: '💰 Nova Venda Fechada!',
        message: `Venda de R$ ${(localEvent.amount || targetCampaign?.price || 9.90).toFixed(2)} confirmada em ${localEvent.campaignTitle}!`,
        time: 'Agora mesmo',
        type: 'sale',
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    } else if (localEvent.type === 'whatsapp_click') {
      const newNotif: PushNotification = {
        id: `notif-${Date.now()}`,
        title: '📲 Lead Chamando no WhatsApp!',
        message: `Um visitante clicou para tirar dúvidas no seu WhatsApp (${localEvent.campaignTitle}).`,
        time: 'Agora mesmo',
        type: 'traffic',
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    } else if (localEvent.type === 'click') {
      const newNotif: PushNotification = {
        id: `notif-${Date.now()}`,
        title: '👀 Novo Acesso Rastreado!',
        message: `Visita registrada na página do lead via ${localEvent.source}.`,
        time: 'Agora mesmo',
        type: 'traffic',
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }

    // 4. Save to Firebase Firestore (syncs live to all devices and dashboard)
    saveTrackingEventToFirebase(localEvent).catch((err) =>
      console.warn('Firebase saveTrackingEvent error:', err)
    );
    if (targetCampaign) {
      const isClick = localEvent.type === 'click' || localEvent.type === 'whatsapp_click' || localEvent.type === 'checkout_click';
      const isConv = localEvent.type === 'conversion';
      const addRevenue = isConv ? (localEvent.amount || targetCampaign.price) : 0;
      saveCampaignToFirebase({
        ...targetCampaign,
        clicks: isClick ? targetCampaign.clicks + 1 : targetCampaign.clicks,
        conversions: isConv ? targetCampaign.conversions + 1 : targetCampaign.conversions,
        revenue: targetCampaign.revenue + addRevenue,
      }).catch(console.warn);
    }

    // 5. Send to Server endpoint if available
    try {
      await fetch('/api/tracking/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localEvent),
      });
    } catch {}
  };

  // Simulate a quick manual conversion with buyer WhatsApp for instant live demonstration
  const handleSimulateQuickConversion = async () => {
    try {
      const res = await fetch('/api/hotmart/simulate-sale', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        if (json.lead) {
          saveCustomerLeadToFirebase(json.lead).catch(console.warn);
          setCustomerLeads((prev) => [json.lead, ...prev.filter((p) => p.id !== json.lead.id)]);
        }
        if (json.event) {
          setTrackingEvents((prev) => [json.event, ...prev]);
        }
        const notif: PushNotification = {
          id: `notif-${Date.now()}`,
          title: '🎉 Nova Venda Hotmart Aprovada!',
          message: `Comprador: ${json.lead?.name} • WhatsApp: +${json.lead?.phone}. Clique para conversar no WhatsApp.`,
          time: 'Agora mesmo',
          type: 'sale',
          read: false,
        };
        setNotifications((prev) => [notif, ...prev]);
        return;
      }
    } catch {}

    // Fallback simulation
    const targetCampaign = campaigns[Math.floor(Math.random() * campaigns.length)] || campaigns[0];
    const sampleBuyers = [
      { name: 'Patrícia Alves (Mãe & Pedagoga)', phone: '5541998778348' },
      { name: 'Mariana Castro (Mãe Atípica SP)', phone: '5511976543210' },
      { name: 'Renata Albuquerque (Psicopedagoga)', phone: '5521991234567' },
    ];
    const b = sampleBuyers[Math.floor(Math.random() * sampleBuyers.length)];
    const newLead: CustomerLead = {
      id: `lead-sim-${Date.now()}`,
      campaignId: targetCampaign.id,
      campaignTitle: targetCampaign.title,
      name: b.name,
      phone: b.phone,
      status: 'comprador_aprovado',
      amount: targetCampaign.price,
      source: 'hotmart_webhook',
      createdAt: new Date().toISOString(),
      notes: 'Compra Aprovada na Hotmart (Pix) • Teste do Webhook',
    };
    saveCustomerLeadToFirebase(newLead).catch(console.warn);
    setCustomerLeads((prev) => [newLead, ...prev]);

    handleAddTrackingEvent({
      campaignId: targetCampaign.id,
      campaignTitle: targetCampaign.title,
      niche: targetCampaign.niche,
      type: 'conversion',
      amount: targetCampaign.price,
      geo: { city: 'São Paulo', state: 'SP', country: 'Brasil' },
      device: 'mobile',
      ageBracket: '25-34',
      source: 'instagram',
      leadScore: 99,
      durationSeconds: 120,
      isSimulation: true,
      customerName: b.name,
      customerPhone: b.phone,
    });
  };

  // Simulate or record conversion specifically originating from Meta Ads (e.g. from the 3 user creatives)
  const handleSimulateMetaAdSale = (creativeName?: string) => {
    const targetCampaign = campaigns[0] || {
      id: 'camp-tarefinhas-autismo',
      title: '+ 100 Tarefinha Educação Infantil e Autismo',
      price: 9.99,
      niche: 'psicopedagogia',
    };

    const sampleMetaBuyers = [
      { name: 'Fernanda Martins (Instagram Ad)', phone: '(11) 98234-5512' },
      { name: 'Juliana Pedagoga (Reels 9:16)', phone: '(41) 99128-4421' },
      { name: 'Patricia Costa (Comentou no Anúncio)', phone: '(31) 97102-9934' },
      { name: 'Camila Rocha (Stories Meta)', phone: '(21) 98877-3310' },
    ];
    const b = sampleMetaBuyers[Math.floor(Math.random() * sampleMetaBuyers.length)];
    const adName = creativeName || 'Criativo 01 - Oferta 46 paginas R$9,90';

    const newLead: CustomerLead = {
      id: `lead-meta-${Date.now()}`,
      campaignId: targetCampaign.id,
      campaignTitle: targetCampaign.title,
      name: b.name,
      phone: b.phone,
      status: 'comprador_aprovado',
      amount: targetCampaign.price,
      source: 'meta_ads',
      createdAt: new Date().toISOString(),
      notes: `Venda gerada pelo Meta Ads • ${adName}`,
      adCreativeName: adName,
    };
    saveCustomerLeadToFirebase(newLead).catch(console.warn);
    setCustomerLeads((prev) => [newLead, ...prev]);

    handleAddTrackingEvent({
      campaignId: targetCampaign.id,
      campaignTitle: targetCampaign.title,
      niche: targetCampaign.niche,
      type: 'conversion',
      amount: targetCampaign.price,
      geo: { city: 'São Paulo', state: 'SP', country: 'Brasil' },
      device: 'mobile',
      ageBracket: '25-34',
      source: 'meta_ads',
      leadScore: 99,
      durationSeconds: 90,
      isSimulation: true,
      customerName: b.name,
      customerPhone: b.phone,
      adCreativeName: adName,
      utmContent: adName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    });

    const notif: PushNotification = {
      id: `notif-meta-${Date.now()}`,
      title: '🎯 Venda Confirmada pelo Meta Ads!',
      message: `${b.name} comprou "${targetCampaign.title}" (R$ ${targetCampaign.price.toFixed(2)}) via "${adName}".`,
      time: 'Agora mesmo',
      type: 'sale',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleDeleteCustomer = (id: string) => {
    deleteCustomerLeadFromFirebase(id).catch(console.warn);
    setCustomerLeads((prev) => prev.filter((c) => c.id !== id));
    fetch(`/api/customers/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  // Global background bridge: persist Instagram profiles & YouTube URLs from Chrome Extension regardless of active tab
  useEffect(() => {
    const persistInstaAccounts = (accounts: any[], connectedHandle?: string, sourceUrl?: string) => {
      if (connectedHandle && connectedHandle !== '@conectado') {
        const cleanOrig = '@' + String(connectedHandle).replace(/^@+/, '').toLowerCase();
        try {
          localStorage.setItem('autoviral_insta_handle', cleanOrig);
        } catch {}
      }
      if (!Array.isArray(accounts) || accounts.length === 0) return;

      // 1. Save into InstagramRobotTab list (autoviral_insta_mapped_targets_v2)
      try {
        const existingRaw = localStorage.getItem('autoviral_insta_mapped_targets_v2');
        const existing: any[] = existingRaw ? JSON.parse(existingRaw) : [];
        const byHandle = new Map<string, any>();
        existing.forEach((item) => {
          if (item?.handle) byHandle.set(String(item.handle).toLowerCase(), item);
        });
        accounts.forEach((acc, i) => {
          const uname = String(acc.username || acc.handle || '').replace(/^@+/, '').trim().toLowerCase();
          if (!uname) return;
          const handle = '@' + uname;
          if (!byHandle.has(handle)) {
            byHandle.set(handle, {
              id: `ext-ig-${uname}-${Date.now()}-${i}`,
              handle,
              name: acc.name || uname,
              followers: acc.followers || 'Conta Real (Chrome)',
              bio: acc.sourceUrl ? `Mapeado no Instagram (${acc.sourceUrl})` : 'Mapeado pela extensão AutoViral',
              category: 'profile_follower',
              sourceQuery: sourceUrl || 'extensao_chrome',
              score: 95,
              city: 'Brasil',
              selected: true,
              status: 'pending'
            });
          }
        });
        const merged = Array.from(byHandle.values());
        localStorage.setItem('autoviral_insta_mapped_targets_v2', JSON.stringify(merged));
      } catch {}
    };

    const persistYtVideos = (videos: any[]) => {
      if (!Array.isArray(videos) || videos.length === 0) return;
      try {
        const existingRaw = localStorage.getItem('autoviral_yt_videos_v2');
        const existing: any[] = existingRaw ? JSON.parse(existingRaw) : [];
        const merged = [...existing];
        videos.forEach((v) => {
          if (v?.url && !merged.some((m) => m.url === v.url)) {
            merged.unshift({
              actionLike: true,
              actionComment: true,
              actionPinCampaign: true,
              status: 'ready',
              ...v
            });
          }
        });
        localStorage.setItem('autoviral_yt_videos_v2', JSON.stringify(merged));
      } catch {}
    };

    const onInstaAccounts = (ev: Event) => {
      const detail = (ev as CustomEvent).detail || {};
      persistInstaAccounts(detail.accounts || [], detail.connectedHandle, detail.sourceUrl);
    };
    const onYtVideos = (ev: Event) => {
      const detail = (ev as CustomEvent).detail || {};
      persistYtVideos(detail.videos || []);
    };

    window.addEventListener('autoviral_extension_instagram_accounts_received', onInstaAccounts);
    window.addEventListener('autoviral_extension_youtube_videos_received', onYtVideos);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('autoviral_bridge_channel');
      bc.onmessage = (msg) => {
        const data = msg.data;
        if (!data) return;
        if (data.action === 'AUTOVIRAL_IMPORT_INSTAGRAM_ACCOUNTS') {
          persistInstaAccounts(data.accounts || [], data.connectedHandle, data.sourceUrl);
        } else if (data.action === 'AUTOVIRAL_IMPORT_YOUTUBE_VIDEOS_FROM_EXTENSION') {
          persistYtVideos(data.videos || []);
        } else if (data.action === 'AUTOVIRAL_IMPORT_GROUPS_FROM_EXTENSION') {
          if (Array.isArray(data.instaAccounts)) {
            persistInstaAccounts(data.instaAccounts, data.connectedHandle, data.sourceUrl);
          }
          if (Array.isArray(data.ytVideos)) {
            persistYtVideos(data.ytVideos);
          }
        }
      };
    } catch {}

    return () => {
      window.removeEventListener('autoviral_extension_instagram_accounts_received', onInstaAccounts);
      window.removeEventListener('autoviral_extension_youtube_videos_received', onYtVideos);
      if (bc) {
        try { bc.close(); } catch {}
      }
    };
  }, []);

  // Bridge from Pain Finder to Creative Studio
  const handleSelectPainForCreative = (pain: PainPointData, nicheName: string) => {
    setSelectedPainForCreative(pain);
    setSelectedNicheForCreative(nicheName);
    setActiveTab('creatives');
  };

  // Add new campaign with multi-layer persistence (Firebase Cloud + LocalStorage + Server + Supabase)
  const handleAddCampaign = async (newCamp: Campaign) => {
    setCampaigns((prev) => [newCamp, ...prev]);

    // 1. Save to Firebase Firestore (multi-browser cloud sync)
    saveCampaignToFirebase(newCamp).catch((e) =>
      console.warn('Firebase saveCampaign error:', e)
    );

    // 2. Post to Server API
    try {
      await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCamp),
      });
    } catch (e) {
      console.warn('Backend server campaign save skipped:', e);
    }

    // 3. Upsert to Supabase if connected
    try {
      if (isSupabaseConnected()) {
        await saveCampaignToSupabase(newCamp);
      }
    } catch (e) {
      console.warn('Supabase campaign save error:', e);
    }

    const notif: PushNotification = {
      id: `notif-${Date.now()}`,
      title: '🎯 Nova Campanha Salva na Nuvem Firebase',
      message: `A campanha "${newCamp.title}" foi sincronizada e está acessível em todos os seus dispositivos!`,
      time: 'Agora mesmo',
      type: 'tip',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Update existing campaign (price, title, pain point, URLs)
  const handleUpdateCampaign = async (updated: Campaign) => {
    setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));

    // 1. Sync to Firebase Firestore
    saveCampaignToFirebase(updated).catch((e) =>
      console.warn('Firebase updateCampaign error:', e)
    );

    // 2. Sync to Server
    try {
      await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.warn('Backend campaign update skipped:', e);
    }

    // 3. Sync to Supabase
    try {
      if (isSupabaseConnected()) {
        await saveCampaignToSupabase(updated);
      }
    } catch (e) {
      console.warn('Supabase campaign update error:', e);
    }

    const notif: PushNotification = {
      id: `notif-${Date.now()}`,
      title: '✏️ Campanha Atualizada na Nuvem!',
      message: `As alterações em "${updated.title}" (R$ ${updated.price.toFixed(2)}) foram salvas e sincronizadas em todos os navegadores.`,
      time: 'Agora mesmo',
      type: 'tip',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Toggle campaign status
  const handleToggleCampaignStatus = async (id: string) => {
    const updated = campaigns.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          status: c.status === 'active' ? ('paused' as const) : ('active' as const),
        };
      }
      return c;
    });
    setCampaigns(updated);

    const target = updated.find((c) => c.id === id);
    if (target) {
      saveCampaignToFirebase(target).catch(console.warn);
      try {
        await fetch('/api/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(target),
        });
      } catch (e) {
        console.warn(e);
      }
      try {
        if (isSupabaseConnected()) {
          await saveCampaignToSupabase(target);
        }
      } catch (e) {
        console.warn(e);
      }
    }
  };

  // Delete campaign
  const handleDeleteCampaign = async (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    setDeletedCampaignIds((prev) => {
      const updated = new Set(prev);
      updated.add(id);
      try {
        localStorage.setItem(
          'autoviral_deleted_campaign_ids',
          JSON.stringify(Array.from(updated))
        );
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    // Permanently delete in Firebase
    deleteCampaignFromFirebase(id).catch((e) =>
      console.warn('Firebase deleteCampaign error:', e)
    );

    try {
      await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn(e);
    }
    try {
      if (isSupabaseConnected()) {
        await deleteCampaignFromSupabase(id);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  // Reset all metrics to 100% Real Mode (R$ 0,00)
  const handleResetToRealMode = async () => {
    try {
      await fetch('/api/tracking/reset', { method: 'POST' });
      await fetch('/api/campaigns/reset-metrics', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    setTrackingEvents([]);
    const resetCampaigns = campaigns.map((c) => ({
      ...c,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0.0,
    }));
    setCampaigns(resetCampaigns);
    localStorage.setItem('autoviral_real_mode', 'true');
    localStorage.setItem('autoviral_campaigns', JSON.stringify(resetCampaigns));

    // Reset campaigns in Firebase
    for (const camp of resetCampaigns) {
      saveCampaignToFirebase(camp).catch(console.warn);
    }

    if (isSupabaseConnected()) {
      for (const camp of resetCampaigns) {
        try {
          await saveCampaignToSupabase(camp);
        } catch (e) {
          console.warn(e);
        }
      }
    }

    // Clear all demo notifications to start completely fresh
    setNotifications([
      {
        id: `notif-${Date.now()}`,
        title: '🎯 Modo 100% Real Ativado!',
        message: 'Todas as notificações de teste foram limpas. Agora o sistema só apitará quando uma VENDA REAL chegar pelo Webhook da Kiwify / Hotmart ou WhatsApp!',
        time: 'Agora mesmo',
        type: 'tip',
        read: false,
        isReal: true,
      },
    ]);
  };


  const [backupRestoreStatus, setBackupRestoreStatus] = useState<string | null>(null);

  // Export full cloud + local workspace backup
  const handleExportBackup = () => {
    const safeParse = (key: string) => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    };
    const backupData = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      campaigns,
      trackingEventsCount: trackingEvents.length,
      trackingEvents,
      customerLeads,
      totalRevenue,
      workspace: {
        managedCampaigns: safeParse('autoviral_managed_campaigns_v5'),
        savedCopiesMap: safeParse('autoviral_saved_copies_v1'),
        customCopyPresets: safeParse('autoviral_custom_copy_presets_v1'),
        mappedGroups: safeParse('autoviral_fb_mapped_groups_v5_real') || safeParse('autoviral_fb_mapped_groups_v3'),
        audiences: safeParse('autoviral_fb_audiences_v4') || safeParse('autoviral_fb_audiences_v3'),
        botLogs: safeParse('autoviral_fb_bot_logs_v3'),
        youtubeVideos: safeParse('autoviral_yt_videos_v2'),
        pinterestPins: safeParse('autoviral_pinterest_pins_v1'),
        instaCampaigns: safeParse('autoviral_insta_campaigns_v1'),
        storyQueue: safeParse('autoviral_insta_story_queue') || safeParse('autoviral_insta_story_queue_v2'),
        mappedInstaTargets: safeParse('autoviral_insta_mapped_targets_v2'),
      },
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autoviral_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Restore full backup from JSON file (merges non-destructively & syncs to Firebase)
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      let restoredCampaignsCount = 0;

      if (Array.isArray(parsed.campaigns) && parsed.campaigns.length > 0) {
        setCampaigns((prev) => {
          const seen = new Set(prev.map((c) => c.id));
          const incoming = parsed.campaigns.filter((c: any) => c?.id && !seen.has(c.id));
          restoredCampaignsCount = incoming.length;
          const merged = [...incoming, ...prev];
          try {
            localStorage.setItem('autoviral_campaigns', JSON.stringify(merged));
          } catch {}
          incoming.forEach((c: Campaign) => saveCampaignToFirebase(c).catch(console.warn));
          return merged;
        });
      }

      if (parsed.workspace && typeof parsed.workspace === 'object') {
        const w = parsed.workspace;
        const putJson = (key: string, val: any) => {
          if (val !== null && val !== undefined) {
            try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
          }
        };
        if (w.savedCopiesMap) putJson('autoviral_saved_copies_v1', w.savedCopiesMap);
        if (w.customCopyPresets) putJson('autoviral_custom_copy_presets_v1', w.customCopyPresets);
        if (w.mappedGroups) {
          putJson('autoviral_fb_mapped_groups_v5_real', w.mappedGroups);
          putJson('autoviral_fb_mapped_groups_v3', w.mappedGroups);
        }
        if (w.audiences) {
          putJson('autoviral_fb_audiences_v4', w.audiences);
          putJson('autoviral_fb_audiences_v3', w.audiences);
        }
        if (w.botLogs) putJson('autoviral_fb_bot_logs_v3', w.botLogs);
        if (w.youtubeVideos) putJson('autoviral_yt_videos_v2', w.youtubeVideos);
        if (w.pinterestPins) putJson('autoviral_pinterest_pins_v1', w.pinterestPins);
        if (w.instaCampaigns) putJson('autoviral_insta_campaigns_v1', w.instaCampaigns);
        if (w.storyQueue) {
          putJson('autoviral_insta_story_queue', w.storyQueue);
          putJson('autoviral_insta_story_queue_v2', w.storyQueue);
        }
        if (w.mappedInstaTargets) putJson('autoviral_insta_mapped_targets_v2', w.mappedInstaTargets);

        saveWorkspaceSyncToFirebase({
          savedCopiesMap: w.savedCopiesMap || undefined,
          customCopyPresets: w.customCopyPresets || undefined,
          audiences: w.audiences || undefined,
          youtubeVideos: w.youtubeVideos || undefined,
          pinterestPins: w.pinterestPins || undefined,
          instaCampaigns: w.instaCampaigns || undefined,
          storyQueue: w.storyQueue || undefined,
          mappedInstaTargets: w.mappedInstaTargets || undefined,
          mappedGroups: w.mappedGroups || undefined,
        }).catch(console.warn);
      }

      setBackupRestoreStatus(
        `✅ Backup restaurado com sucesso! (${restoredCampaignsCount} novas campanhas + grupos, públicos e copys sincronizados na nuvem)`
      );
    } catch {
      setBackupRestoreStatus('⚠️ Arquivo inválido. Selecione um backup .json válido do AutoViral AI.');
    }
    e.target.value = '';
  };

  // Manual 2-way Cloud Sync (Desktop <-> Mobile)
  const handleForceCloudSync = async () => {
    setIsSyncingCloud(true);
    try {
      const safeParse = (k: string) => {
        try {
          const raw = localStorage.getItem(k);
          return raw ? JSON.parse(raw) : undefined;
        } catch {
          return undefined;
        }
      };

      // 1. Push all local non-deleted campaigns to Firebase
      for (const camp of campaigns) {
        if (!deletedCampaignIds.has(camp.id)) {
          await saveCampaignToFirebase(camp).catch(console.warn);
        }
      }

      // 2. Push local workspace state to Firebase
      await saveWorkspaceSyncToFirebase({
        savedCopiesMap: safeParse('autoviral_saved_copies_v1'),
        customCopyPresets: safeParse('autoviral_custom_copy_presets_v1'),
        audiences: safeParse('autoviral_fb_audiences_v4') || safeParse('autoviral_fb_audiences_v3'),
        youtubeVideos: safeParse('autoviral_yt_videos_v2'),
        pinterestPins: safeParse('autoviral_pinterest_pins_v1'),
        instaCampaigns: safeParse('autoviral_insta_campaigns_v1'),
        storyQueue: safeParse('autoviral_insta_story_queue') || safeParse('autoviral_insta_story_queue_v2'),
        mappedInstaTargets: safeParse('autoviral_insta_mapped_targets_v2'),
        mappedGroups: safeParse('autoviral_fb_mapped_groups_v5_real') || safeParse('autoviral_fb_mapped_groups_v3'),
      });

      // 3. Pull fresh snapshot directly from Firestore server
      const snap = await pullFullCloudSnapshotFromFirebase();
      const cloudDelSet = new Set(snap.deletedIds);
      setDeletedCampaignIds(cloudDelSet);
      try {
        localStorage.setItem('autoviral_deleted_campaign_ids', JSON.stringify(snap.deletedIds));
      } catch {}

      const validCloud = snap.campaigns.filter((c) => !cloudDelSet.has(c.id));
      setCloudCampaignsCount(validCloud.length);
      setFirebaseSyncStatus('synced');

      if (validCloud.length > 0) {
        setCampaigns((prev) => {
          const cloudIds = new Set(validCloud.map((c) => c.id));
          const localExtra = prev.filter((p) => !cloudIds.has(p.id) && !cloudDelSet.has(p.id));
          const merged = [...validCloud, ...localExtra];
          try {
            localStorage.setItem('autoviral_campaigns', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }

      if (snap.workspace) {
        window.dispatchEvent(new CustomEvent('autoviral_workspace_synced', { detail: snap.workspace }));
      }
    } catch (err) {
      console.warn('Manual cloud sync error:', err);
      setFirebaseSyncStatus('error');
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Restore single or all archived cloud campaigns
  const handleRestoreArchivedCampaign = async (camp: Campaign) => {
    setDeletedCampaignIds((prev) => {
      const next = new Set(prev);
      next.delete(camp.id);
      try {
        localStorage.setItem('autoviral_deleted_campaign_ids', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
    setCampaigns((prev) => {
      if (prev.some((p) => p.id === camp.id)) return prev;
      return [camp, ...prev];
    });
    setRecoverableCampaigns((prev) => prev.filter((r) => r.id !== camp.id));
    await restoreArchivedCampaignToFirebase(camp).catch(console.warn);
  };

  const handleRestoreAllArchivedCampaigns = async () => {
    const toRestore = [...recoverableCampaigns];
    for (const camp of toRestore) {
      await handleRestoreArchivedCampaign(camp);
    }
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  if (isPublicLeadMode) {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const campParam = (params.get('camp') || params.get('id') || '').trim().toLowerCase();
    const pParam = (params.get('p') || params.get('prod') || '').trim().toLowerCase();

    // 1. Exact campaign ID match (highest priority)
    let featuredCampaign: Campaign | undefined;
    if (campParam) {
      featuredCampaign = campaigns.find(
        (c) =>
          c.id.toLowerCase() === campParam ||
          c.id.toLowerCase() === `camp-${campParam}` ||
          c.id.toLowerCase().replace('camp-', '') === campParam
      );
    }

    // 2. Exact slug match
    if (!featuredCampaign && pParam) {
      featuredCampaign = campaigns.find(
        (c) => getCampaignSlug(c).toLowerCase() === pParam || c.id.toLowerCase() === pParam || c.id.toLowerCase().replace('camp-', '') === pParam
      );
    }

    // 3. Title keyword match
    if (!featuredCampaign && pParam) {
      featuredCampaign = campaigns.find((c) => {
        const normTitle = c.title.toLowerCase();
        const cSlug = getCampaignSlug(c).toLowerCase();
        return normTitle.includes(pParam) || pParam.includes(cSlug) || cSlug.includes(pParam);
      });
    }

    // 4. Fallback to actively selected landing campaign in localStorage
    if (!featuredCampaign) {
      try {
        const savedActiveId = localStorage.getItem('autoviral_selected_landing_id');
        if (savedActiveId) {
          featuredCampaign = campaigns.find((c) => c.id === savedActiveId);
        }
      } catch {}
    }

    // 5. Fallback to first campaign if none matched
    featuredCampaign = featuredCampaign || campaigns[0];

    const srcParam = (params.get('src') || params.get('utm_source') || 'instagram').toLowerCase();
    const mappedSource: TrackingEvent['source'] =
      srcParam.includes('fb') || srcParam.includes('facebook')
        ? 'facebook_groups'
        : srcParam.includes('insta') || srcParam.includes('story')
        ? 'instagram'
        : srcParam.includes('whats')
        ? 'whatsapp'
        : srcParam.includes('pin')
        ? 'pinterest'
        : srcParam.includes('tik')
        ? 'tiktok'
        : 'instagram';
    const cityParam = params.get('city') || 'Curitiba';
    const stateParam = params.get('state') || 'PR';

    return (
      <PublicLeadLanding
        campaign={featuredCampaign}
        onTrackAction={(type, amount) => {
          handleAddTrackingEvent({
            campaignId: featuredCampaign.id,
            campaignTitle: featuredCampaign.title,
            niche: featuredCampaign.niche,
            type,
            source: mappedSource,
            geo: { city: cityParam, state: stateParam, country: 'Brasil' },
            isSimulation: false,
            amount: amount || (type === 'conversion' ? featuredCampaign.price : undefined),
          });
        }}
        onGoToDashboard={() => setIsPublicLeadMode(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalRevenue={totalRevenue}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        onOpen2FA={() => setIs2FAModalOpen(true)}
        is2FAEnabled={is2FAEnabled}
        onPreviewBridge={() => {
          try {
            const activeLandingId = localStorage.getItem('autoviral_selected_landing_id');
            const targetCamp = (activeLandingId && campaigns.find((c) => c.id === activeLandingId)) || campaigns[0];
            setBridgeModalCampaign(targetCamp);
          } catch {
            setBridgeModalCampaign(campaigns[0]);
          }
        }}
        onOpenSupabase={() => setIsSupabaseModalOpen(true)}
        onOpenVercel={() => setIsVercelModalOpen(true)}
        onResetAllMetrics={handleResetToRealMode}
        onOpenPWAInstall={() => setIsPWAInstallModalOpen(true)}
        firebaseSyncStatus={firebaseSyncStatus}
        cloudCampaignsCount={cloudCampaignsCount || campaigns.length}
        isSyncingCloud={isSyncingCloud}
        onForceCloudSync={handleForceCloudSync}
      />


      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            campaigns={campaigns}
            trackingEvents={trackingEvents}
            customers={customerLeads}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onSimulateConversion={handleSimulateQuickConversion}
            onResetAllMetrics={handleResetToRealMode}
            onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
          />
        )}

        {activeTab === 'chrome_fb_groups' && (
          <ChromeFbGroupsTab
            campaigns={campaigns}
            initialCampaignId={selectedCampaignForDispatches || undefined}
            onAddCampaign={handleAddCampaign}
            onUpdateCampaign={handleUpdateCampaign}
            onDeleteCampaign={handleDeleteCampaign}
            onAddTrackingEvent={handleAddTrackingEvent}
            onSimulateSale={(customerName, city, amount) => {
              const notif: PushNotification = {
                id: `notif-${Date.now()}`,
                title: '🎉 Venda em Grupo do Facebook!',
                message: `Comprador: ${customerName} (${city}) • R$ ${amount.toFixed(2).replace('.', ',')}. Link da Kiwify acessado via post!`,
                time: 'Agora mesmo',
                type: 'sale',
                read: false,
              };
              setNotifications((prev) => [notif, ...prev]);
            }}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'robo_cidades' && (
          <RoboDivulgadorCidades
            campaigns={campaigns}
            onAddTrackingEvent={handleAddTrackingEvent}
            onSimulateSale={(customerName, city, amount) => {
              const notif: PushNotification = {
                id: `notif-${Date.now()}`,
                title: '🎉 1ª Venda Aprovada no Pix!',
                message: `Comprador: ${customerName} (${city}) • R$ ${amount.toFixed(2).replace('.', ',')}. Material enviado!`,
                time: 'Agora mesmo',
                type: 'sale',
                read: false,
              };
              setNotifications((prev) => [notif, ...prev]);
            }}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'brevo_disparador' && (
          <BrevoEmailWhatsAppTab
            campaigns={campaigns}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'meta_ads' && (
          <MetaAdsBoosterTab
            campaigns={campaigns}
            onAddTrackingEvent={handleAddTrackingEvent}
            onSimulateMetaSale={handleSimulateMetaAdSale}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'landing_builder' && (
          <LandingPageBuilderTab
            campaigns={campaigns}
            onUpdateCampaign={handleUpdateCampaign}
            onAddCampaign={handleAddCampaign}
            onPreviewBridge={(c) => setBridgeModalCampaign(c)}
          />
        )}

        {activeTab === 'lead_finder' && (
          <LeadFinderTab
            campaigns={campaigns}
            onAddTrackingEvent={handleAddTrackingEvent}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'pain_finder' && (
          <PainFinderTab onSelectPainForCreative={handleSelectPainForCreative} />
        )}

        {activeTab === 'creatives' && (
          <CreativeStudioTab
            initialPain={selectedPainForCreative}
            initialNiche={selectedNicheForCreative}
            campaigns={campaigns}
            onAddCampaign={handleAddCampaign}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'sales_bot' && (
          <SalesBotTab
            campaigns={campaigns}
            onSimulateConversion={handleSimulateQuickConversion}
          />
        )}

        {activeTab === 'tracking' && (
          <RealtimeTrackingTab
            trackingEvents={trackingEvents}
            campaigns={campaigns}
            customers={customerLeads}
            onAddTrackingEvent={handleAddTrackingEvent}
            onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
            onSimulateSale={handleSimulateQuickConversion}
            onSelectPainForCreative={(pain, niche) => {
              handleSelectPainForCreative(pain, niche || 'renda_extra');
            }}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'campaigns' && (
          <CampaignManagerTab
            campaigns={campaigns}
            onAddCampaign={handleAddCampaign}
            onUpdateCampaign={handleUpdateCampaign}
            onToggleStatus={handleToggleCampaignStatus}
            onPreviewBridge={(c) => setBridgeModalCampaign(c)}
            onDeleteCampaign={handleDeleteCampaign}
            onResetAllMetrics={handleResetToRealMode}
            recoverableCampaigns={recoverableCampaigns}
            onRestoreArchivedCampaign={handleRestoreArchivedCampaign}
            onRestoreAllArchivedCampaigns={handleRestoreAllArchivedCampaigns}
            onForceCloudSync={handleForceCloudSync}
            isSyncingCloud={isSyncingCloud}
            onNavigateToDispatches={(camp) => {
              try {
                localStorage.setItem('autoviral_selected_product_id', camp.id);
              } catch {}
              setSelectedCampaignForDispatches(camp.id);
              setActiveTab('chrome_fb_groups');
            }}
          />
        )}

        {activeTab === 'reports' && (
          <AIReportsTab campaigns={campaigns} trackingEvents={trackingEvents} />
        )}

        {activeTab === 'security' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-bold text-white">Painel de Segurança & Infraestrutura</h2>
            <p className="text-xs text-slate-400">
              Arquitetura serverless gratuita e escalável, sem custos de servidor para você começar com lucro total para sua família.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
                <h3 className="text-sm font-bold text-white">Status da Autenticação de 2 Fatores</h3>
                <p className="text-xs text-slate-300">
                  {is2FAEnabled ? '✅ 2FA Ativado com sucesso.' : '⚠️ 2FA Desativado.'}
                </p>
                <button
                  onClick={() => setIs2FAModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white"
                >
                  Configurar 2FA
                </button>
              </div>

              <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
                <h3 className="text-sm font-bold text-white">Backup e Redundância na Nuvem</h3>
                <p className="text-xs text-slate-300">
                  Exporte ou restaure em 1 clique todas as suas campanhas, grupos mapeados, públicos, copys, stories e dados do Instagram/YouTube.
                </p>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={handleExportBackup}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold text-white cursor-pointer"
                  >
                    Baixar Arquivo de Backup Completo (JSON)
                  </button>
                  <label className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-semibold text-white cursor-pointer inline-flex items-center">
                    <span>Restaurar Backup (.JSON)</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>
                </div>
                {backupRestoreStatus && (
                  <p className="text-xs font-semibold text-emerald-300">{backupRestoreStatus}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/80 border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>AutoViral AI © 2026 • Plataforma de Renda Familiar & Tráfego Orgânico Autônomo</span>
          <span className="text-emerald-400 font-medium">
            Seguro • Sem Custos de Anúncios • Anti-Bloqueio
          </span>
        </div>
      </footer>

      {/* Modals */}
      {bridgeModalCampaign && (
        <BridgePageModal
          campaign={bridgeModalCampaign}
          onClose={() => setBridgeModalCampaign(null)}
          onTrackAction={(type, amount) => {
            handleAddTrackingEvent({
              campaignId: bridgeModalCampaign.id,
              campaignTitle: bridgeModalCampaign.title,
              niche: bridgeModalCampaign.niche,
              type,
              amount: amount || (type === 'conversion' ? bridgeModalCampaign.price : 0),
              source: 'tiktok',
              geo: { city: 'São Paulo', state: 'SP', country: 'Brasil' },
              device: 'mobile',
              ageBracket: '25-34',
              leadScore: type === 'conversion' ? 99 : 85,
            });
          }}
        />
      )}

      <Security2FAModal
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
        is2FAEnabled={is2FAEnabled}
        onToggle2FA={(en) => setIs2FAEnabled(en)}
        onExportBackup={handleExportBackup}
      />

      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        }
        onClearDemoNotifications={() => {
          setNotifications((prev) => prev.filter((n) => n.isReal === true));
        }}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        campaigns={campaigns}
        trackingEvents={trackingEvents}
      />

      <VercelModal
        isOpen={isVercelModalOpen}
        onClose={() => setIsVercelModalOpen(false)}
      />

      <CustomerLeadsModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customers={customerLeads}
        onSimulateSale={handleSimulateQuickConversion}
        onDeleteCustomer={handleDeleteCustomer}
      />

      <PWAInstallModal
        isOpen={isPWAInstallModalOpen}
        onClose={() => setIsPWAInstallModalOpen(false)}
        firebaseSyncStatus={firebaseSyncStatus}
        cloudCampaignsCount={cloudCampaignsCount || campaigns.length}
        isSyncingCloud={isSyncingCloud}
        onForceCloudSync={handleForceCloudSync}
      />

      <OfflineIndicator />
    </div>
  );
}

