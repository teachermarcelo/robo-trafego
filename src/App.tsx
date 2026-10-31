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
import { INITIAL_CAMPAIGNS } from './data/defaultCampaigns';
import { Campaign, TrackingEvent, PainPointData, PushNotification } from './types';
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
} from './lib/firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
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
      const saved = localStorage.getItem('autoviral_campaigns');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const nonDeleted = parsed.filter((c: any) => !delSet.has(c.id));
          const existingIds = new Set(nonDeleted.map((c: any) => c.id));
          const missingDefaults = INITIAL_CAMPAIGNS.filter(
            (d) => !existingIds.has(d.id) && !delSet.has(d.id)
          );
          const merged = [...nonDeleted, ...missingDefaults];
          return merged.map((c) => {
            // Correct tarefinhas price if it had legacy 37 or 3.99
            if (c.id === 'camp-tarefinhas-autismo' && (c.price === 37 || c.price === 3.99 || !c.price)) {
              return { ...c, price: 9.90, oldPrice: 47.0 };
            }
            return c;
          });
        }
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
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isVercelModalOpen, setIsVercelModalOpen] = useState(false);
  const [bridgeModalCampaign, setBridgeModalCampaign] = useState<Campaign | null>(null);
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

  // 1. Subscribe to Firebase deleted campaign IDs (ensures fictitious campaigns stay deleted on all devices)
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
        if (cloudCampaigns && cloudCampaigns.length > 0) {
          const savedDeleted = localStorage.getItem('autoviral_deleted_campaign_ids');
          const delSet = savedDeleted ? new Set(JSON.parse(savedDeleted)) : deletedCampaignIds;
          const valid = cloudCampaigns.filter((c) => !delSet.has(c.id));
          if (valid.length > 0) {
            setCampaigns(valid);
            try {
              localStorage.setItem('autoviral_campaigns', JSON.stringify(valid));
            } catch {}
          }
        }
      },
      (err) => console.warn('Firebase campaigns sync notice:', err)
    );
    return () => unsubCampaigns();
  }, [deletedCampaignIds]);

  // 3. Real-time Firebase Firestore tracking events listener
  useEffect(() => {
    const unsubTracking = subscribeTrackingEvents((cloudEvents) => {
      if (cloudEvents && cloudEvents.length > 0) {
        setTrackingEvents(cloudEvents);
        try {
          localStorage.setItem('autoviral_tracking_events', JSON.stringify(cloudEvents));
        } catch {}
      }
    });
    return () => unsubTracking();
  }, []);

  // 4. Secondary fallback fetch from server backend and Supabase
  useEffect(() => {
    let isMounted = true;

    const syncAllCampaigns = async () => {
      let merged: Campaign[] = [...campaigns];
      const savedDeleted = localStorage.getItem('autoviral_deleted_campaign_ids');
      const delSet = savedDeleted ? new Set(JSON.parse(savedDeleted)) : deletedCampaignIds;

      // Fetch from server endpoint
      try {
        const res = await fetch('/api/campaigns');
        if (res.ok) {
          const json = await res.json();
          if (json.campaigns && Array.isArray(json.campaigns)) {
            json.campaigns.forEach((sc: Campaign) => {
              if (delSet.has(sc.id)) return;
              const idx = merged.findIndex((m) => m.id === sc.id);
              if (idx >= 0) {
                merged[idx] = { ...merged[idx], ...sc };
              } else {
                merged.unshift(sc);
              }
            });
          }
        }
      } catch (err) {
        // Backend server offline/swallowed on Vercel
      }

      // Fetch from Supabase if configured
      try {
        if (isSupabaseConnected()) {
          const supaCampaigns = await fetchSupabaseCampaigns();
          if (supaCampaigns && supaCampaigns.length > 0) {
            supaCampaigns.forEach((sc) => {
              if (delSet.has(sc.id)) return;
              const idx = merged.findIndex((m) => m.id === sc.id);
              if (idx >= 0) {
                merged[idx] = { ...merged[idx], ...sc };
              } else {
                merged.unshift(sc);
              }
            });
          }
        }
      } catch (err) {
        console.warn('Supabase sync notice:', err);
      }

      if (isMounted && merged.length > 0) {
        setCampaigns(merged);
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

  // Simulate a quick manual conversion for instant live feedback
  const handleSimulateQuickConversion = () => {
    const targetCampaign = campaigns[Math.floor(Math.random() * campaigns.length)] || campaigns[0];
    const brazilianCities = [
      { city: 'São Paulo', state: 'SP' },
      { city: 'Rio de Janeiro', state: 'RJ' },
      { city: 'Belo Horizonte', state: 'MG' },
      { city: 'Curitiba', state: 'PR' },
    ];
    const loc = brazilianCities[Math.floor(Math.random() * brazilianCities.length)];

    handleAddTrackingEvent({
      campaignId: targetCampaign.id,
      campaignTitle: targetCampaign.title,
      niche: targetCampaign.niche,
      type: 'conversion',
      amount: targetCampaign.price,
      geo: { city: loc.city, state: loc.state, country: 'Brasil' },
      device: 'mobile',
      ageBracket: '25-34',
      source: 'tiktok',
      leadScore: 98,
      durationSeconds: 154,
    });
  };

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

    const notif: PushNotification = {
      id: `notif-${Date.now()}`,
      title: '🎯 Modo 100% Real Ativado!',
      message: 'Todas as métricas de demonstração foram zeradas (R$ 0,00). Suas campanhas continuam salvas e você acompanhará exclusivamente suas visitas e vendas reais.',
      time: 'Agora mesmo',
      type: 'tip',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };


  // Export full cloud backup
  const handleExportBackup = () => {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      campaigns,
      trackingEventsCount: trackingEvents.length,
      trackingEvents,
      totalRevenue,
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

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  if (isPublicLeadMode) {
    const search = (typeof window !== 'undefined' ? window.location.search : '').toLowerCase();
    let featuredCampaign = campaigns.find((c) => c.id === 'camp-tarefinhas-autismo') || campaigns[0];
    if (search.includes('milha')) {
      featuredCampaign = campaigns.find((c) => c.id === 'camp-milhas-3') || featuredCampaign;
    } else if (search.includes('ingles')) {
      featuredCampaign = campaigns.find((c) => c.id === 'camp-1') || featuredCampaign;
    }
    return (
      <PublicLeadLanding
        campaign={featuredCampaign}
        onTrackAction={(type, amount) => {
          handleAddTrackingEvent({
            campaignId: featuredCampaign.id,
            campaignTitle: featuredCampaign.title,
            niche: featuredCampaign.niche,
            type,
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
        onPreviewBridge={() => setBridgeModalCampaign(campaigns[0])}
        onOpenSupabase={() => setIsSupabaseModalOpen(true)}
        onOpenVercel={() => setIsVercelModalOpen(true)}
        onResetAllMetrics={handleResetToRealMode}
      />


      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            campaigns={campaigns}
            trackingEvents={trackingEvents}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onSimulateConversion={handleSimulateQuickConversion}
            onResetAllMetrics={handleResetToRealMode}
          />
        )}

        {activeTab === 'landing_builder' && (
          <LandingPageBuilderTab
            campaigns={campaigns}
            onUpdateCampaign={handleUpdateCampaign}
            onPreviewBridge={(c) => setBridgeModalCampaign(c)}
          />
        )}

        {activeTab === 'lead_finder' && (
          <LeadFinderTab campaigns={campaigns} />
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
            onAddTrackingEvent={handleAddTrackingEvent}
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
                  Todos os dados de clientes e campanhas podem ser exportados a qualquer momento.
                </p>
                <button
                  onClick={handleExportBackup}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold text-white"
                >
                  Baixar Arquivo de Backup Completo (JSON)
                </button>
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
    </div>
  );
}

