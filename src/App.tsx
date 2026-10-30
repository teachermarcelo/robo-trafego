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

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      const saved = localStorage.getItem('autoviral_campaigns');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with INITIAL_CAMPAIGNS so any new defaults (like COMUNIDADE MILHAS 3.0) aren't missing
          const existingIds = new Set(parsed.map((c: any) => c.id));
          const missingDefaults = INITIAL_CAMPAIGNS.filter((d) => !existingIds.has(d.id));
          return [...parsed, ...missingDefaults];
        }
      }
      return INITIAL_CAMPAIGNS;
    } catch {
      return INITIAL_CAMPAIGNS;
    }
  });

  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
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

  // Sync campaigns from server backend AND Supabase on mount
  useEffect(() => {
    let isMounted = true;

    const syncAllCampaigns = async () => {
      let merged: Campaign[] = [...campaigns];

      // 1. Fetch from server endpoint
      try {
        const res = await fetch('/api/campaigns');
        if (res.ok) {
          const json = await res.json();
          if (json.campaigns && Array.isArray(json.campaigns)) {
            json.campaigns.forEach((sc: Campaign) => {
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
        console.warn('Backend server campaigns fetch skipped or offline:', err);
      }

      // 2. Fetch from Supabase if connected
      try {
        if (isSupabaseConnected()) {
          const supaCampaigns = await fetchSupabaseCampaigns();
          if (supaCampaigns && supaCampaigns.length > 0) {
            supaCampaigns.forEach((sc) => {
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
        console.warn('Supabase auto-sync error on mount:', err);
      }

      if (isMounted && merged.length > 0) {
        setCampaigns(merged);
        localStorage.setItem('autoviral_campaigns', JSON.stringify(merged));
      }
    };

    syncAllCampaigns();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch initial tracking events from server
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/tracking/events');
        if (res.ok) {
          const data = await res.json();
          if (data.events && Array.isArray(data.events)) {
            setTrackingEvents(data.events);
          }
        }
      } catch (err) {
        console.error('Failed to load tracking events from server:', err);
      }
    };
    fetchEvents();
  }, []);

  const totalRevenue = campaigns.reduce((acc, c) => acc + c.revenue, 0);

  // Handler to record a new tracking event
  const handleAddTrackingEvent = async (eventData: Partial<TrackingEvent>) => {
    try {
      const res = await fetch('/api/tracking/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.event) {
          setTrackingEvents((prev) => [json.event, ...prev.slice(0, 499)]);

          // If conversion, update campaign metrics
          if (json.event.type === 'conversion' && json.event.amount) {
            setCampaigns((prev) =>
              prev.map((c) => {
                if (c.id === json.event.campaignId) {
                  return {
                    ...c,
                    conversions: c.conversions + 1,
                    revenue: c.revenue + json.event.amount,
                  };
                }
                return c;
              })
            );

            // Add notification
            const newNotif: PushNotification = {
              id: `notif-${Date.now()}`,
              title: '💰 Nova Venda Fechada!',
              message: `Venda de R$ ${json.event.amount.toFixed(2)} convertida em ${json.event.campaignTitle}!`,
              time: 'Agora mesmo',
              type: 'sale',
              read: false,
            };
            setNotifications((prev) => [newNotif, ...prev]);
          }
        }
      }
    } catch (err) {
      console.error('Error logging event:', err);
    }
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

  // Add new campaign with multi-layer persistence (State + LocalStorage + Server + Supabase)
  const handleAddCampaign = async (newCamp: Campaign) => {
    setCampaigns((prev) => [newCamp, ...prev]);

    // 1. Post to Server API
    try {
      await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCamp),
      });
    } catch (e) {
      console.warn('Backend server campaign save skipped:', e);
    }

    // 2. Upsert to Supabase if connected
    try {
      if (isSupabaseConnected()) {
        await saveCampaignToSupabase(newCamp);
      }
    } catch (e) {
      console.warn('Supabase campaign save error:', e);
    }

    const notif: PushNotification = {
      id: `notif-${Date.now()}`,
      title: '🎯 Nova Campanha Salva & Sincronizada',
      message: `A campanha "${newCamp.title}" foi gravada e protegida contra perda!`,
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
    const featuredCampaign = campaigns.find((c) => c.id === 'camp-milhas-3') || campaigns[0];
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

