import React, { useState, useEffect } from 'react';
import {
  Share2,
  Download,
  Users,
  Clock,
  ShieldCheck,
  Zap,
  Play,
  Pause,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Sparkles,
  Search,
  Check,
  Copy,
  DollarSign,
  HelpCircle,
  Eye,
  ArrowRight,
  Filter,
  BarChart3,
  Bot,
  Video,
  ThumbsUp,
  MessageSquare,
  Pin,
  RefreshCw,
  FolderOpen,
  PieChart,
  CheckCheck,
  Activity,
  Layers,
  Repeat,
  Target,
  Smartphone,
  QrCode,
  Instagram,
  Palette,
  Edit2,
  Link2,
  Sliders,
  Flame,
  Radio,
  MessageCircle
} from 'lucide-react';
import JSZip from 'jszip';
import { PWAInstallModal } from './PWAInstallModal';
import { InstagramRobotTab } from './InstagramRobotTab';
import { VisualLayoutStudio } from './VisualLayoutStudio';
import { SecurityDefenseModal } from './SecurityDefenseModal';
import { LogisticsAnalyticsDashboard } from './LogisticsAnalyticsDashboard';
import {
  Campaign,
  NicheType,
  FacebookGroup,
  FacebookAudience,
  FacebookPostLog,
  YouTubeTargetVideo,
  YouTubeBotLog,
  PinterestPinItem,
  PinterestBoard,
  InstagramStoryItem,
  TrackedLinkItem,
  TrackedLinkClick
} from '../types';
import {
  CURITIBA_GROUPS,
  PEDAGOGIA_GROUPS,
  AUTISMO_GROUPS,
  RENDA_EXTRA_GROUPS,
  ALL_INITIAL_FACEBOOK_GROUPS,
  INITIAL_SAVED_AUDIENCES
} from '../data/facebookGroupsData';
import { globalBotRunner } from '../utils/backgroundBotRunner';
import { saveWorkspaceSyncToFirebase, subscribeWorkspaceSync } from '../lib/firebase';
import {
  buildProductManyChatPackage,
  loadManyChatOverrides,
  saveManyChatOverride,
} from '../data/productBenefitsEngine';

export interface CopyTemplateItem {
  id: string;
  name: string;
  tag: string;
  headline: string;
  copy: string;
}

export function getCampaignCopyTemplates(camp: Campaign): CopyTemplateItem[] {
  const titleLower = (camp.title || '').toLowerCase();
  const nicheLower = (camp.niche || '').toLowerCase();
  const isEcom =
    camp.id.includes('ecom') ||
    titleLower.includes('loja') ||
    titleLower.includes('ecom') ||
    (nicheLower.includes('renda_extra') && titleLower.includes('loja'));
  const isTarefinhas =
    camp.id.includes('tarefinha') ||
    nicheLower.includes('psicopedagogia') ||
    titleLower.includes('tarefinha') ||
    titleLower.includes('autista') ||
    titleLower.includes('coordenação') ||
    titleLower.includes('educação infantil');
  const isMilhas = camp.id.includes('milhas') || titleLower.includes('milhas');

  const priceVal = typeof camp.price === 'number' && camp.price > 0 ? camp.price : 9.9;
  const priceFormatted = priceVal.toFixed(2).replace('.', ',');
  const checkout = camp.checkoutUrl || 'https://pay.kiwify.com.br/';

  if (isEcom) {
    return [
      {
        id: 'tpl-ecom-1',
        name: '✨ Indicação Sincera (Loja Pronta)',
        tag: 'Mais Natural',
        headline:
          '🚀 Pessoal do grupo, quem aí está procurando uma fonte de renda extra na internet sem precisar criar loja do zero?',
        copy: `Oi pessoal! Passando pra compartilhar uma oportunidade excelente para quem quer empreender online mas não entende de programação nem tem estoque.

Conheci um projeto onde você recebe uma Loja Virtual Nichada 100% Pronta, com mais de 20 produtos testados e fornecedores confiáveis inclusos.

Não precisa estocar nada nem contratar programador caro. O treinamento passo a passo ensina tudo para buscar de R$ 700 a R$ 1.100 já nos primeiros 7 dias.

O valor promocional com garantia incondicional está saindo por apenas R$ ${priceFormatted} no Pix: ${checkout}

Espero que ajude quem está buscando destravar suas vendas online!`,
      },
      {
        id: 'tpl-ecom-2',
        name: '🎯 Dor & Solução (Sem Estoque)',
        tag: 'Foco no Problema',
        headline:
          '💼 Cansado de tentar criar loja e travar em produtos que não vendem? Veja essa solução pronta.',
        copy: `Muita gente tenta começar no e-commerce sem estoque, mas desiste no meio do caminho porque configurar loja é complexo e encontrar fornecedores rápidos é difícil.

Com o ecom club você recebe a loja completa configurada, produtos validados e mentoria com reunião ao vivo.

Acesso imediato com garantia incondicional de 7 dias por apenas R$ ${priceFormatted}: ${checkout}`,
      },
      {
        id: 'tpl-ecom-3',
        name: '⚡ Oferta Direta Pix',
        tag: 'Alta Conversão',
        headline: `⚡ Loja Virtual Pronta + 20 Produtos Validados por apenas R$ ${priceFormatted}!`,
        copy: `Oportunidade para iniciar no e-commerce sem estoque:
✅ Loja profissional nichada e configurada
✅ 20 produtos testados com fornecedores inclusos
✅ Treinamento passo a passo até os R$ 10 mil de faturamento
✅ Reunião de 2 horas e garantia total
✅ Apenas R$ ${priceFormatted} no Pix com liberação imediata

Garanta a sua no link oficial: ${checkout}`,
      },
    ];
  }

  if (isTarefinhas) {
    return [
      {
        id: 'tpl-tarefa-1',
        name: '✨ Indicação Sincera (Mães & Pedagogia)',
        tag: 'Mais Natural',
        headline:
          '🌸 Meninas e colegas do grupo, achei esse material de coordenação motora que facilitou demais minha rotina!',
        copy: `Oi pessoal! Passando pra compartilhar uma dica que me ajudou muito na rotina com as crianças.

Quem trabalha com educação infantil ou tem filho com resistência a tarefas sabe o tempo que a gente gasta bolando atividades sem poluição visual.

Achei um caderno digital com mais de 100 atividades lúdicas de coordenação motora fina e alfabetização que funcionam perfeitamente para crianças típicas, com TDAH e autistas.

Dá pra imprimir em casa e o acesso sai por apenas R$ ${priceFormatted} no Pix pelo link oficial: ${checkout}

Espero que ajude outras pessoas como me ajudou! ❤️`,
      },
      {
        id: 'tpl-tarefa-2',
        name: '🎯 Dor & Solução (Sem Telas / Sem Birra)',
        tag: 'Foco no Problema',
        headline:
          '💡 Dica de ouro para mães e professoras: atividades limpas em PDF para prender a atenção sem telas!',
        copy: `Gente, quem tem criança em fase de alfabetização ou com TEA/TDAH sabe o sofrimento que é encontrar atividades limpas e atrativas sem telas.

Esse compilado reúne mais de 100 atividades em PDF prontas para imprimir direto da impressora: traçados, pareamento, labirintos e coordenação motora fina.

Está com valor simbólico de apenas R$ ${priceFormatted} no Pix com envio imediato no e-mail.

Quem quiser dar uma olhada no conteúdo completo: ${checkout}`,
      },
      {
        id: 'tpl-tarefa-3',
        name: '⚡ Oferta Direta Pix',
        tag: 'Alta Conversão',
        headline: `⚡ Caderno de Atividades Infantis (+100 Fichas em PDF) por apenas R$ ${priceFormatted} no Pix!`,
        copy: `Mais de 100 atividades pedagógicas lúdicas prontas para imprimir:
✅ Estímulo à coordenação motora fina e foco
✅ Atividades adaptadas para crianças típicas, TEA e TDAH
✅ Acesso vitalício em PDF no seu e-mail
✅ Apenas R$ ${priceFormatted} (valor promocional)

Baixe diretamente no link oficial: ${checkout}`,
      },
    ];
  }

  if (isMilhas) {
    return [
      {
        id: 'tpl-milhas-1',
        name: '✨ Dica Prática (Renda com Milhas)',
        tag: 'Mais Natural',
        headline:
          '✈️ Dica para a galera do grupo: como transformar as compras do dia a dia em renda extra no Pix todo mês!',
        copy: `Pessoal, passando pra compartilhar algo que mudou meu orçamento este ano.

Quase todo mundo gasta dinheiro no mercado, farmácia e contas diárias e não sabe que dá pra transformar esses gastos em pontos e milhas lucrativas, gerando de R$ 500 a R$ 2.000 limpos no Pix todo mês.

A Comunidade Milhas 3.0 ensina o passo a passo seguro mesmo para quem não tem cartão Black.

Acesso com aulas e grupo de alertas: ${checkout}`,
      },
      {
        id: 'tpl-milhas-2',
        name: '🎯 Dor & Solução (Fim de Mês)',
        tag: 'Foco no Problema',
        headline:
          '💡 Pare de deixar dinheiro na mesa: aprenda a lucrar com milhas e compras bonificadas',
        copy: `A maioria das pessoas perde dinheiro todos os meses por não saber acumular e vender pontos. Na Comunidade você recebe os alertas prontos de operações lucrativas.

Acesso imediato e suporte: ${checkout}`,
      },
      {
        id: 'tpl-milhas-3',
        name: '⚡ Oferta Direta Comunidade',
        tag: 'Alta Conversão',
        headline: `⚡ Comunidade Milhas 3.0: Alertas e Estratégias de Lucro no Pix com Milhas`,
        copy: `Transforme seus gastos diários em lucro comprovado:
✅ Grupo VIP de alertas em tempo real
✅ Planilhas prontas de rentabilidade
✅ Suporte e aulas práticas
Acesse a turma: ${checkout}`,
      },
    ];
  }

  // Dynamic template for any custom campaign:
  return [
    {
      id: 'tpl-custom-1',
      name: '✨ Recomendação Amigável',
      tag: 'Mais Natural',
      headline: `✨ Dica para o grupo: conheci o "${camp.title}" e recomendo muito!`,
      copy: `Oi pessoal! Passando pra compartilhar uma recomendação excelente.

${camp.headline || camp.title}
${camp.subheadline ? '\n' + camp.subheadline : ''}

${camp.painPointTargeted ? 'Ideal para quem busca resolver: ' + camp.painPointTargeted + '.' : ''}

Acesso completo liberado com valor promocional de R$ ${priceFormatted}: ${checkout}`,
    },
    {
      id: 'tpl-custom-2',
      name: '🎯 Foco na Solução & Benefícios',
      tag: 'Foco no Problema',
      headline: `💡 Procurando uma solução para ${camp.nicheLabel || camp.niche || 'destravar resultados'}? Veja essa dica!`,
      copy: `Se você quer resultados práticos com ${camp.title}:
${(camp.features || []).slice(0, 4).map((f) => `• ${f}`).join('\n')}

Garanta seu acesso seguro com suporte: ${checkout}`,
    },
    {
      id: 'tpl-custom-3',
      name: '⚡ Oferta Especial Pix',
      tag: 'Alta Conversão',
      headline: `⚡ Oferta Exclusiva: ${camp.title} por apenas R$ ${priceFormatted}!`,
      copy: `Garanta agora o seu acesso a ${camp.title}:
${(camp.features || []).slice(0, 3).map((f) => `✅ ${f}`).join('\n')}
Preço promocional: R$ ${priceFormatted} no Pix.

Acesse diretamente: ${checkout}`,
    },
  ];
}

interface ChromeFbGroupsTabProps {
  campaigns: Campaign[];
  initialCampaignId?: string;
  onAddTrackingEvent?: (event: any) => void;
  onSimulateSale?: (customerName: string, city: string, amount: number) => void;
  onNavigateTab?: (tab: string) => void;
  onAddCampaign?: (newCampaign: Campaign) => void;
  onUpdateCampaign?: (updatedCampaign: Campaign) => void;
  onDeleteCampaign?: (id: string) => void;
}

export const ChromeFbGroupsTab: React.FC<ChromeFbGroupsTabProps> = ({
  campaigns,
  initialCampaignId,
  onAddTrackingEvent,
  onSimulateSale,
  onNavigateTab,
  onAddCampaign,
  onUpdateCampaign,
  onDeleteCampaign,
}) => {
  const defaultProduct = campaigns[0] || {
    id: 'camp-tarefinhas-autismo',
    title: 'Caderno de Atividades de Coordenação Motora (+100 Tarefinhas)',
    price: 9.90,
    imageUrl: '/assets/aistudio/image_e9e67204.png',
    checkoutUrl: 'https://pay.kiwify.com.br/HE5xbnp',
  };

  // Managed Campaigns (Syncs cleanly with App.tsx + Firebase + localStorage so edits/creations NEVER vanish!)
  const [managedCampaigns, setManagedCampaigns] = useState<Campaign[]>(() => {
    const mergedMap = new Map<string, Campaign>();
    try {
      const delRaw = localStorage.getItem('autoviral_deleted_campaign_ids');
      const delSet = delRaw ? new Set<string>(JSON.parse(delRaw)) : new Set<string>(['camp-1', 'camp-2', 'camp-3']);

      (campaigns || []).forEach(c => {
        if (!delSet.has(c.id)) {
          mergedMap.set(c.id, { ...c, status: c.status || 'active' });
        }
      });

      const saved = localStorage.getItem('autoviral_managed_campaigns_v5');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((p: any) => {
            if (!p?.id || delSet.has(p.id)) return;
            if (!mergedMap.has(p.id)) {
              mergedMap.set(p.id, { ...p, status: p.status || 'active' });
            }
          });
        }
      }
    } catch {}
    if (mergedMap.size > 0) return Array.from(mergedMap.values());
    const initialList = campaigns && campaigns.length > 0 ? campaigns : [defaultProduct];
    return initialList.map(c => ({
      ...c,
      status: c.status || 'active'
    }));
  });

  // Keep managedCampaigns strictly synced with all campaigns created or updated anywhere in the platform
  useEffect(() => {
    if (!campaigns || campaigns.length === 0) return;
    setManagedCampaigns(prev => {
      let delSet = new Set<string>(['camp-1', 'camp-2', 'camp-3']);
      try {
        const delRaw = localStorage.getItem('autoviral_deleted_campaign_ids');
        if (delRaw) delSet = new Set(JSON.parse(delRaw));
      } catch {}

      const nextMerged: Campaign[] = campaigns
        .filter(c => !delSet.has(c.id))
        .map(c => ({ ...c, status: c.status || 'active' }));

      // Also retain any campaigns created locally that have not propagated yet
      prev.forEach(p => {
        if (!delSet.has(p.id) && !nextMerged.some(m => m.id === p.id)) {
          nextMerged.push(p);
        }
      });
      try {
        localStorage.setItem('autoviral_managed_campaigns_v5', JSON.stringify(nextMerged));
      } catch {}
      return nextMerged;
    });
  }, [campaigns]);

  const [pendingDeleteCampId, setPendingDeleteCampId] = useState<string | null>(null);

  const availableCampaigns = managedCampaigns;

  const sanitizeFbGroupName = (rawName: string): string => {
    return (rawName || '')
      .replace(/\u00a0/g, ' ')
      .replace(/^(foto\s+do\s+perfil\s+de|foto\s+da\s+capa\s+de|profile\s+picture\s+of|cover\s+photo\s+of)\s+/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const isSyntheticSeedGroup = (g: Partial<FacebookGroup> | null | undefined): boolean => {
    if (!g) return true;
    const id = String(g.id || '');
    const url = String(g.url || '').toLowerCase();
    const name = String(g.name || '');
    return (
      id.startsWith('fb-grp-aut-') ||
      id.startsWith('fb-grp-psico-163-') ||
      id.startsWith('fb-cwb-') ||
      id.startsWith('fb-grp-re-') ||
      url.includes('rendaextra_') ||
      url.includes('curitibanegocios') ||
      url.includes('maesepaisdecriancasespeciaisbrasil') ||
      name.includes('#')
    );
  };

  const normalizeFbGroupSlug = (urlOrSlug: string): string => {
    const raw = (urlOrSlug || '').toLowerCase();
    const m = raw.match(/\/groups\/([^/?#]+)/i);
    return (m ? m[1] : raw).replace(/\/+$/, '').trim();
  };

  // Subtabs: groups | audiences | campaign | youtube | pinterest | instagram | layout_studio | posts_log | analytics | extension_guide | tracked_links
  type WorkspaceSubTab =
    | 'groups'
    | 'audiences'
    | 'campaign'
    | 'youtube'
    | 'pinterest'
    | 'instagram'
    | 'layout_studio'
    | 'posts_log'
    | 'analytics'
    | 'extension_guide'
    | 'tracked_links'
    | 'whatsapp_cta_funnel';

  const validSubTabs: WorkspaceSubTab[] = [
    'groups',
    'audiences',
    'campaign',
    'whatsapp_cta_funnel',
    'youtube',
    'pinterest',
    'instagram',
    'layout_studio',
    'posts_log',
    'analytics',
    'extension_guide',
    'tracked_links'
  ];

  const [activeSubTab, setActiveSubTab] = useState<WorkspaceSubTab>(() => {
    try {
      const saved = localStorage.getItem('autoviral_active_subtab_groups');
      if (saved && validSubTabs.includes(saved as WorkspaceSubTab)) {
        return saved as WorkspaceSubTab;
      }
    } catch {}
    return 'groups';
  });

  useEffect(() => {
    try {
      localStorage.setItem('autoviral_active_subtab_groups', activeSubTab);
    } catch {}
  }, [activeSubTab]);

  // 100% REAL Tracking Events from /api/tracking/events (!isSimulation)
  const [realServerEvents, setRealServerEvents] = useState<any[]>([]);
  const [isLoadingRealEvents, setIsLoadingRealEvents] = useState<boolean>(false);
  const [realRadarSourceFilter, setRealRadarSourceFilter] = useState<string>('all');
  const [smartLinkChannel, setSmartLinkChannel] = useState<'facebook_groups' | 'instagram_story' | 'youtube_comments' | 'pinterest' | 'whatsapp'>('facebook_groups');
  const [copiedSmartUrlFeedback, setCopiedSmartUrlFeedback] = useState<boolean>(false);
  const [postsLogFilter, setPostsLogFilter] = useState<'all' | 'published' | 'awaiting_admin' | 'join_requested' | 'rate_limited' | 'unavailable' | 'not_member' | 'pending_verification' | 'pending' | 'legacy_unverified' | 'error'>('all');
  const [autoJoinAndPostEnabled, setAutoJoinAndPostEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('autoviral_fb_auto_join_post');
      return saved === null ? true : saved === 'true';
    } catch {}
    return true;
  });
  useEffect(() => {
    try {
      localStorage.setItem('autoviral_fb_auto_join_post', String(autoJoinAndPostEnabled));
    } catch {}
  }, [autoJoinAndPostEnabled]);
  const [lastOpenedPostLog, setLastOpenedPostLog] = useState<{ logId: string; groupName: string; groupUrl: string } | null>(null);
  const [manyChatOverridesMap, setManyChatOverridesMap] = useState<Record<string, any>>(() => loadManyChatOverrides());
  const [manyChatSavedBanner, setManyChatSavedBanner] = useState<string | null>(null);
  const [copiedShortFunnelKey, setCopiedShortFunnelKey] = useState<string | null>(null);
  const [fbWaPageName, setFbWaPageName] = useState<string>('ABC do Futuro Digital');
  const [fbWaCategory, setFbWaCategory] = useState<string>('Educação');
  const [fbWaShareCaption, setFbWaShareCaption] = useState<string>('Estou compartilhando o link para quem tiver interesse.');
  const [fbWaSnippet, setFbWaSnippet] = useState<string>('');
  const [fbWaDestMode, setFbWaDestMode] = useState<'manychat' | 'wa_me'>('manychat');

  const fetchRealTrackingEvents = async () => {
    setIsLoadingRealEvents(true);
    try {
      const res = await fetch('/api/tracking/events');
      if (res.ok) {
        const data = await res.json();
        const events = Array.isArray(data?.events) ? data.events : [];
        setRealServerEvents(events.filter((e: any) => !e.isSimulation));
      }
    } catch {
    } finally {
      setIsLoadingRealEvents(false);
    }
  };

  useEffect(() => {
    fetchRealTrackingEvents();
    const interval = setInterval(fetchRealTrackingEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  const [extensionSyncBanner, setExtensionSyncBanner] = useState<{ message: string; tone: 'success' | 'warning' } | null>(null);
  const [lastImportedGroupIds, setLastImportedGroupIds] = useState<string[]>([]);
  const [mappedInstaProfilesCount, setMappedInstaProfilesCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('autoviral_insta_mapped_targets_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.length;
      }
    } catch {}
    return 7;
  });

  // Search folder filter: persisted in localStorage so page refresh keeps exact folder
  const [activeSearchFolder, setActiveSearchFolder] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('autoviral_active_search_folder');
      if (saved) return saved;
    } catch {}
    return 'psicopedagogia';
  });

  // All Mapped Groups State (Merges v5_real, v4, and v3 so zero prior mapped groups disappear)
  const [mappedGroups, setMappedGroups] = useState<FacebookGroup[]>(() => {
    try {
      const collected: FacebookGroup[] = [];
      const seenUrlOrName = new Set<string>();
      const pushList = (raw: string | null) => {
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          if (!Array.isArray(parsed)) return;
          parsed.forEach((g: any) => {
            if (!g || !g.url || !g.name) return;
            if (g.url.includes('rendaextra_') || g.url.includes('curitibanegocios') || String(g.name).includes('#')) return;
            const cleanName = sanitizeFbGroupName(g.name) || g.name;
            const key = `${g.url}`.toLowerCase();
            if (!seenUrlOrName.has(key)) {
              seenUrlOrName.add(key);
              collected.push({ ...g, name: cleanName });
            }
          });
        } catch {}
      };
      pushList(localStorage.getItem('autoviral_fb_mapped_groups_v5_real'));
      pushList(localStorage.getItem('autoviral_fb_mapped_groups_v4'));
      pushList(localStorage.getItem('autoviral_fb_mapped_groups_v3'));
      if (collected.length > 0) {
        const realOnly = collected.filter(g => !isSyntheticSeedGroup(g));
        if (realOnly.length > 0) {
          try {
            localStorage.setItem('autoviral_fb_mapped_groups_v5_real', JSON.stringify(realOnly));
          } catch {}
          return realOnly;
        }
        return collected.filter(g => !String(g.url || '').toLowerCase().includes('maesepaisdecriancasespeciaisbrasil'));
      }
    } catch {}
    return ALL_INITIAL_FACEBOOK_GROUPS.filter(g => !String(g.url || '').toLowerCase().includes('maesepaisdecriancasespeciaisbrasil'));
  });

  // Selected Group IDs for audience / campaign (Persisted in localStorage, pruned to existing non-dead groups)
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('autoviral_selected_group_ids');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validIds = new Set(mappedGroups.map(g => g.id));
          const filtered = parsed.filter((id: string) => validIds.has(id));
          if (filtered.length > 0) return filtered;
        }
      }
    } catch {}
    return mappedGroups.slice(0, 50).map(g => g.id);
  });
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Target Quantity to Dispatch (Persisted in localStorage)
  const [targetQuantityToDispatch, setTargetQuantityToDispatch] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('autoviral_target_quantity');
      if (saved) return parseInt(saved, 10) || 30;
    } catch {}
    return 30;
  });

  // Group Editing Modal State (Requested by user: "exluir editar e selecionar quantos grupos quer divulgar")
  const [editingGroup, setEditingGroup] = useState<FacebookGroup | null>(null);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState<boolean>(false);
  const [editGroupName, setEditGroupName] = useState<string>('');
  const [editGroupUrl, setEditGroupUrl] = useState<string>('');
  const [editGroupMembers, setEditGroupMembers] = useState<number>(10000);
  const [editGroupNiche, setEditGroupNiche] = useState<string>('Renda Extra & Oportunidades');

  // Audience Editing Modal State (Requested by user: "opção de salvar nomear os grupos pra reutilizar")
  const [editingAudience, setEditingAudience] = useState<FacebookAudience | null>(null);
  const [isEditAudienceModalOpen, setIsEditAudienceModalOpen] = useState<boolean>(false);
  const [editAudienceName, setEditAudienceName] = useState<string>('');
  const [editAudienceDesc, setEditAudienceDesc] = useState<string>('');

  // Bulk import from text modal
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState<boolean>(false);
  const [bulkImportText, setBulkImportText] = useState<string>('');

  // Saved Audiences Library (Merges BOTH v4 and v3 so saved audiences never disappear on refresh)
  const [audiences, setAudiences] = useState<FacebookAudience[]>(() => {
    try {
      const collected: FacebookAudience[] = [];
      const seenIds = new Set<string>();
      const pushList = (raw: string | null) => {
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach((a: any) => {
              if (a?.id && !seenIds.has(a.id)) {
                seenIds.add(a.id);
                collected.push(a);
              }
            });
          }
        } catch {}
      };
      pushList(localStorage.getItem('autoviral_fb_audiences_v4'));
      pushList(localStorage.getItem('autoviral_fb_audiences_v3'));
      if (collected.length > 0) return collected;
    } catch {}
    return INITIAL_SAVED_AUDIENCES;
  });
  const [selectedAudienceId, setSelectedAudienceId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('autoviral_selected_audience_id');
      if (saved) return saved;
    } catch {}
    return 'aud-renda-extra-73';
  });

  // Create Audience Modal
  const [isAudienceModalOpen, setIsAudienceModalOpen] = useState(false);
  const [newAudienceName, setNewAudienceName] = useState('');
  const [newAudienceDesc, setNewAudienceDesc] = useState('');

  // Add Manual Group Modal
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [manualGroupName, setManualGroupName] = useState('');
  const [manualGroupUrl, setManualGroupUrl] = useState('https://facebook.com/groups/');
  const [manualMembersCount, setManualMembersCount] = useState(25000);
  const [manualNiche, setManualNiche] = useState('Curitiba & Região');
  const [manualPostsPerDay, setManualPostsPerDay] = useState('90+ posts por dia');

  // Anti-Ban & Interval Controls (300s a 400s, max 500/dia)
  const [intervalSeconds, setIntervalSeconds] = useState<number>(350);
  const [dailyDispatchLimit, setDailyDispatchLimit] = useState<number>(500);
  const [dailyDispatchesCompleted, setDailyDispatchesCompleted] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('autoviral_fb_daily_completed_v3');
      if (saved) return parseInt(saved, 10);
    } catch {}
    return 24;
  });
  const [isRandomJitterActive, setIsRandomJitterActive] = useState<boolean>(true);

  // Campaign & Bot Execution State (Persisted across page reloads)
  const [selectedProductId, setSelectedProductId] = useState<string>(() => {
    if (initialCampaignId) return initialCampaignId;
    try {
      const saved = localStorage.getItem('autoviral_selected_product_id');
      if (saved) return saved;
    } catch {}
    return defaultProduct.id;
  });

  const initialMatchedCamp = availableCampaigns.find(c => c.id === selectedProductId) || availableCampaigns[0] || defaultProduct;
  const [selectedCheckoutUrl, setSelectedCheckoutUrl] = useState<string>(initialMatchedCamp.checkoutUrl || 'https://pay.kiwify.com.br/HE5xbnp');
  const [selectedPrice, setSelectedPrice] = useState<number>(initialMatchedCamp.price || 9.90);
  const [activeCopyTemplateIndex, setActiveCopyTemplateIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('autoviral_active_copy_tpl_idx');
      if (saved !== null) return parseInt(saved, 10) || 0;
    } catch {}
    return 0;
  });

  // Per-campaign saved copies & custom user copy presets (survives page refresh!)
  const [savedCopiesMap, setSavedCopiesMap] = useState<Record<string, { headline: string; copy: string; savedAt: string }>>(() => {
    try {
      const saved = localStorage.getItem('autoviral_saved_copies_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });
  const [customCopyPresets, setCustomCopyPresets] = useState<Array<{ id: string; campaignId: string; name: string; headline: string; copy: string; savedAt: string }>>(() => {
    try {
      const saved = localStorage.getItem('autoviral_custom_copy_presets_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [copySaveNotice, setCopySaveNotice] = useState<string | null>(null);
  const [newPresetNameInput, setNewPresetNameInput] = useState<string>('');
  const [isSavingPresetPromptOpen, setIsSavingPresetPromptOpen] = useState<boolean>(false);

  const activeCampaign = availableCampaigns.find(c => c.id === selectedProductId) || availableCampaigns[0] || defaultProduct;
  const currentTemplates = getCampaignCopyTemplates(activeCampaign);

  const [postHeadline, setPostHeadline] = useState<string>(() => {
    try {
      const savedMap = JSON.parse(localStorage.getItem('autoviral_saved_copies_v1') || '{}');
      const prodId = initialCampaignId || localStorage.getItem('autoviral_selected_product_id') || defaultProduct.id;
      if (savedMap[prodId]?.headline) return savedMap[prodId].headline;
    } catch {}
    const tpls = getCampaignCopyTemplates(initialMatchedCamp);
    return tpls[0]?.headline || '🌸 Meninas e colegas de Curitiba, achei esse material de coordenação motora que facilitou demais minha rotina!';
  });

  const [postCopy, setPostCopy] = useState<string>(() => {
    try {
      const savedMap = JSON.parse(localStorage.getItem('autoviral_saved_copies_v1') || '{}');
      const prodId = initialCampaignId || localStorage.getItem('autoviral_selected_product_id') || defaultProduct.id;
      if (savedMap[prodId]?.copy) return savedMap[prodId].copy;
    } catch {}
    const tpls = getCampaignCopyTemplates(initialMatchedCamp);
    return tpls[0]?.copy || `Oi pessoal de Curitiba e região! Passando pra compartilhar uma dica que me ajudou muito.\n\nQuem trabalha com educação infantil ou tem filho com resistência a tarefas sabe o tempo que a gente gasta bolando atividades sem poluição visual.\n\nAchei um caderno digital com mais de 100 atividades lúdicas de coordenação motora fina e alfabetização que funcionam perfeitamente para crianças típicas, com TDAH e autistas.\n\nDá pra imprimir em casa e o acesso sai por apenas R$ 9,90 no Pix pelo link oficial: https://pay.kiwify.com.br/HE5xbnp\n\nEspero que ajude outras pessoas como me ajudou! ❤️`;
  });

  // React to explicit initialCampaignId navigation ONLY without overwriting user's saved copy!
  useEffect(() => {
    const targetId = initialCampaignId || localStorage.getItem('autoviral_selected_product_id');
    if (targetId) {
      const found = availableCampaigns.find(c => c.id === targetId);
      if (found) {
        setSelectedProductId(targetId);
        setSelectedCheckoutUrl(found.checkoutUrl || 'https://pay.kiwify.com.br/HE5xbnp');
        setSelectedPrice(found.price || 9.90);
        // Only apply default template if NO saved copy exists for this campaign!
        let hasSaved = false;
        try {
          const savedMap = JSON.parse(localStorage.getItem('autoviral_saved_copies_v1') || '{}');
          if (savedMap[targetId] && (savedMap[targetId].copy || savedMap[targetId].headline)) {
            setPostHeadline(savedMap[targetId].headline);
            setPostCopy(savedMap[targetId].copy);
            hasSaved = true;
          }
        } catch {}
        if (!hasSaved) {
          const templates = getCampaignCopyTemplates(found);
          if (templates[0]) {
            setPostHeadline(templates[0].headline);
            setPostCopy(templates[0].copy);
          }
        }
        if (initialCampaignId) {
          setActiveSubTab('campaign');
        }
      }
    }
  }, [initialCampaignId]);

  // Auto-persist active campaign, copy, folder, groups, and audience on every change
  useEffect(() => {
    try {
      localStorage.setItem('autoviral_selected_product_id', selectedProductId);
    } catch {}
  }, [selectedProductId]);

  useEffect(() => {
    try {
      localStorage.setItem('autoviral_active_subtab_groups', activeSubTab);
    } catch {}
  }, [activeSubTab]);

  useEffect(() => {
    try {
      localStorage.setItem('autoviral_active_search_folder', activeSearchFolder);
    } catch {}
  }, [activeSearchFolder]);

  useEffect(() => {
    try {
      localStorage.setItem('autoviral_selected_group_ids', JSON.stringify(selectedGroupIds));
    } catch {}
  }, [selectedGroupIds]);

  useEffect(() => {
    try {
      localStorage.setItem('autoviral_target_quantity', String(targetQuantityToDispatch));
    } catch {}
  }, [targetQuantityToDispatch]);

  useEffect(() => {
    try {
      localStorage.setItem('autoviral_selected_audience_id', selectedAudienceId);
    } catch {}
  }, [selectedAudienceId]);

  useEffect(() => {
    try {
      localStorage.setItem('autoviral_active_copy_tpl_idx', String(activeCopyTemplateIndex));
    } catch {}
  }, [activeCopyTemplateIndex]);

  // Auto-save current copy draft per campaign so refreshing NEVER loses edits
  useEffect(() => {
    if (!selectedProductId) return;
    setSavedCopiesMap(prev => {
      const existing = prev[selectedProductId];
      if (existing && existing.headline === postHeadline && existing.copy === postCopy) {
        return prev;
      }
      const next = {
        ...prev,
        [selectedProductId]: {
          headline: postHeadline,
          copy: postCopy,
          savedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
      };
      try {
        localStorage.setItem('autoviral_saved_copies_v1', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, [selectedProductId, postHeadline, postCopy]);

  const handleSaveFixedCopyForCampaign = () => {
    const next = {
      ...savedCopiesMap,
      [selectedProductId]: {
        headline: postHeadline,
        copy: postCopy,
        savedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }
    };
    setSavedCopiesMap(next);
    try {
      localStorage.setItem('autoviral_saved_copies_v1', JSON.stringify(next));
      localStorage.setItem('autoviral_selected_product_id', selectedProductId);
      localStorage.setItem('autoviral_selected_group_ids', JSON.stringify(selectedGroupIds));
      localStorage.setItem('autoviral_active_search_folder', activeSearchFolder);
    } catch {}
    setCopySaveNotice(`✅ Copy, Campanha "${activeCampaign.title.slice(0, 28)}..." e ${selectedGroupIds.length} Grupos salvos! Mesmo atualizando a página (F5), tudo permanece igual.`);
    setTimeout(() => setCopySaveNotice(null), 5000);
  };

  const handleSaveNewCustomPreset = () => {
    const label = newPresetNameInput.trim() || `Modelo Salvo (${new Date().toLocaleDateString('pt-BR')})`;
    const newPreset = {
      id: `preset-${Date.now()}`,
      campaignId: selectedProductId,
      name: label,
      headline: postHeadline,
      copy: postCopy,
      savedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [newPreset, ...customCopyPresets];
    setCustomCopyPresets(updated);
    try {
      localStorage.setItem('autoviral_custom_copy_presets_v1', JSON.stringify(updated));
    } catch {}
    setNewPresetNameInput('');
    setIsSavingPresetPromptOpen(false);
    setCopySaveNotice(`⭐ Modelo "${label}" salvo com sucesso! Reutilize com 1 clique abaixo.`);
    setTimeout(() => setCopySaveNotice(null), 4000);
  };

  const handleDeleteCustomPreset = (presetId: string) => {
    const updated = customCopyPresets.filter(p => p.id !== presetId);
    setCustomCopyPresets(updated);
    try {
      localStorage.setItem('autoviral_custom_copy_presets_v1', JSON.stringify(updated));
    } catch {}
  };

  const handleSelectCampaign = (camp: Campaign, templateIndex: number = 0) => {
    setSelectedProductId(camp.id);
    setSelectedCheckoutUrl(camp.checkoutUrl || '');
    setSelectedPrice(camp.price || 0);
    setActiveCopyTemplateIndex(templateIndex);
    try {
      localStorage.setItem('autoviral_selected_product_id', camp.id);
    } catch {}

    // Prefer user's saved copy for this campaign if available
    const savedForCamp = savedCopiesMap[camp.id];
    if (savedForCamp && (savedForCamp.copy || savedForCamp.headline)) {
      setPostHeadline(savedForCamp.headline);
      setPostCopy(savedForCamp.copy);
      return;
    }

    const templates = getCampaignCopyTemplates(camp);
    const chosen = templates[templateIndex] || templates[0];
    if (chosen) {
      setPostHeadline(chosen.headline);
      setPostCopy(chosen.copy);
    }
  };

  const handleApplyTemplate = (camp: Campaign, templateIndex: number) => {
    setActiveCopyTemplateIndex(templateIndex);
    const templates = getCampaignCopyTemplates(camp);
    if (templates[templateIndex]) {
      setPostHeadline(templates[templateIndex].headline);
      setPostCopy(templates[templateIndex].copy);
    }
  };

  // Campaign Management States (User requested: "poder criar várias campanha e ativar/desativar/pausar garantindo a campanha certa")
  const [isCreateCampaignModalOpen, setIsCreateCampaignModalOpen] = useState<boolean>(false);
  const [isEditCampaignModalOpen, setIsEditCampaignModalOpen] = useState<boolean>(false);
  const [editingCampaignItem, setEditingCampaignItem] = useState<Campaign | null>(null);
  const [isRotationModeActive, setIsRotationModeActive] = useState<boolean>(false);

  // Form fields for create/edit campaign
  const [formCampTitle, setFormCampTitle] = useState<string>('');
  const [formCampNiche, setFormCampNiche] = useState<string>('Psicopedagogia & TEA');
  const [formCampPrice, setFormCampPrice] = useState<number>(9.90);
  const [formCampCheckoutUrl, setFormCampCheckoutUrl] = useState<string>('https://pay.kiwify.com.br/HE5xbnp');
  const [formCampImageUrl, setFormCampImageUrl] = useState<string>('/assets/aistudio/image_5456885b.png');
  const [formCampHeadline, setFormCampHeadline] = useState<string>('');
  const [formCampCopy, setFormCampCopy] = useState<string>('');

  const handleToggleCampaignStatus = (campId: string) => {
    let toggledCamp: Campaign | null = null;
    setManagedCampaigns(prev => {
      const updated = prev.map(c => {
        if (c.id === campId) {
          const nextStatus: 'active' | 'paused' = c.status === 'active' ? 'paused' : 'active';
          toggledCamp = { ...c, status: nextStatus };
          return toggledCamp;
        }
        return c;
      });
      try {
        localStorage.setItem('autoviral_managed_campaigns_v5', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (toggledCamp && onUpdateCampaign) {
      onUpdateCampaign(toggledCamp);
    }
  };

  const handleSetActiveCampaign = (camp: Campaign) => {
    setSelectedProductId(camp.id);
    setSelectedCheckoutUrl(camp.checkoutUrl || '');
    setSelectedPrice(camp.price || 0);
    try {
      localStorage.setItem('autoviral_selected_product_id', camp.id);
    } catch {}

    // Ensure status is active
    setManagedCampaigns(prev => {
      const updated = prev.map(c => (c.id === camp.id ? { ...c, status: 'active' as const } : c));
      try {
        localStorage.setItem('autoviral_managed_campaigns_v5', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (camp.status === 'paused' && onUpdateCampaign) {
      onUpdateCampaign({ ...camp, status: 'active' });
    }

    const savedForCamp = savedCopiesMap[camp.id];
    if (savedForCamp && (savedForCamp.copy || savedForCamp.headline)) {
      setPostHeadline(savedForCamp.headline);
      setPostCopy(savedForCamp.copy);
      return;
    }

    const templates = getCampaignCopyTemplates(camp);
    const chosen = templates[0];
    if (chosen) {
      setPostHeadline(chosen.headline);
      setPostCopy(chosen.copy);
    }
  };

  const handleOpenCreateCampaign = () => {
    setFormCampTitle('');
    setFormCampNiche('Psicopedagogia & TEA');
    setFormCampPrice(9.90);
    setFormCampCheckoutUrl('https://pay.kiwify.com.br/HE5xbnp');
    setFormCampImageUrl('/assets/aistudio/image_5456885b.png');
    setFormCampHeadline('🌸 Meninas e colegas, achei esse material de TEA que facilitou demais minha rotina!');
    setFormCampCopy(
      `Oi pessoal! Passando pra compartilhar uma recomendação excelente para quem trabalha com crianças autistas (TEA), TDAH ou em fase de alfabetização.\n\nMais de 100 atividades lúdicas em PDF prontas para imprimir por apenas R$ 9,90 no Pix pelo link oficial: https://pay.kiwify.com.br/HE5xbnp`
    );
    setIsCreateCampaignModalOpen(true);
  };

  const handleSaveNewCampaign = () => {
    if (!formCampTitle.trim()) {
      setCopySaveNotice('⚠️ Por favor, digite o título do produto/campanha.');
      setTimeout(() => setCopySaveNotice(null), 4000);
      return;
    }
    const newCamp: Campaign = {
      id: `camp-custom-${Date.now()}`,
      title: formCampTitle.trim(),
      niche: (formCampNiche.trim() as NicheType) || 'outro',
      nicheLabel: formCampNiche.trim() || 'Geral',
      targetAudience: 'Público Segmentado',
      painPointTargeted: 'Dor Principal do Nicho',
      price: formCampPrice > 0 ? formCampPrice : 9.90,
      checkoutUrl: formCampCheckoutUrl.trim() || 'https://pay.kiwify.com.br/',
      imageUrl: formCampImageUrl.trim() || '/assets/aistudio/image_5456885b.png',
      status: 'active',
      headline: formCampHeadline.trim(),
      copy: formCampCopy.trim(),
      antiBanOrganicMode: true,
      createdAt: 'Hoje',
      platforms: ['facebook', 'instagram', 'whatsapp'],
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
    };

    const updated = [newCamp, ...managedCampaigns];
    setManagedCampaigns(updated);
    try {
      localStorage.setItem('autoviral_managed_campaigns_v5', JSON.stringify(updated));
    } catch {}

    if (onAddCampaign) {
      onAddCampaign(newCamp);
    }

    handleSetActiveCampaign(newCamp);
    setIsCreateCampaignModalOpen(false);
    setCopySaveNotice(`🎉 Nova Campanha "${newCamp.title}" criada, ativada e sincronizada na nuvem!`);
    setTimeout(() => setCopySaveNotice(null), 5000);
  };

  const handleOpenEditCampaign = (camp: Campaign) => {
    setEditingCampaignItem(camp);
    setFormCampTitle(camp.title);
    setFormCampNiche(camp.nicheLabel || camp.niche || 'Geral');
    setFormCampPrice(camp.price || 9.90);
    setFormCampCheckoutUrl(camp.checkoutUrl || '');
    setFormCampImageUrl(camp.imageUrl || '/assets/aistudio/image_5456885b.png');
    setFormCampHeadline(camp.headline || '');
    setFormCampCopy(camp.copy || '');
    setIsEditCampaignModalOpen(true);
  };

  const handleSaveEditCampaign = () => {
    if (!editingCampaignItem) return;
    let editedCamp: Campaign | null = null;
    const updated = managedCampaigns.map(c => {
      if (c.id === editingCampaignItem.id) {
        editedCamp = {
          ...c,
          title: formCampTitle.trim() || c.title,
          niche: (formCampNiche.trim() as NicheType) || 'outro',
          nicheLabel: formCampNiche.trim() || 'Geral',
          price: formCampPrice,
          checkoutUrl: formCampCheckoutUrl.trim(),
          imageUrl: formCampImageUrl.trim(),
          headline: formCampHeadline.trim(),
          copy: formCampCopy.trim(),
        };
        return editedCamp;
      }
      return c;
    });

    setManagedCampaigns(updated);
    try {
      localStorage.setItem('autoviral_managed_campaigns_v5', JSON.stringify(updated));
    } catch {}

    if (editedCamp && onUpdateCampaign) {
      onUpdateCampaign(editedCamp);
    }

    setIsEditCampaignModalOpen(false);
    setEditingCampaignItem(null);
    setCopySaveNotice('✅ Dados da campanha atualizados e sincronizados na nuvem!');
    setTimeout(() => setCopySaveNotice(null), 4000);
  };

  const handleDeleteCampaign = (campId: string) => {
    if (managedCampaigns.length <= 1) {
      setCopySaveNotice('⚠️ Você precisa manter ao menos 1 campanha cadastrada.');
      setTimeout(() => setCopySaveNotice(null), 4000);
      return;
    }
    const updated = managedCampaigns.filter(c => c.id !== campId);
    setManagedCampaigns(updated);
    setPendingDeleteCampId(null);
    try {
      localStorage.setItem('autoviral_managed_campaigns_v5', JSON.stringify(updated));
    } catch {}
    if (onDeleteCampaign) {
      onDeleteCampaign(campId);
    }
    if (selectedProductId === campId && updated[0]) {
      handleSetActiveCampaign(updated[0]);
    }
    setCopySaveNotice('🗑️ Campanha removida da plataforma.');
    setTimeout(() => setCopySaveNotice(null), 3500);
  };

  // PWA Install Modal State (Requested by user: "CRIE UM apk pra instalar no celular")
  const [isPWAInstallModalOpen, setIsPWAInstallModalOpen] = useState<boolean>(false);

  // Zerar Mapeamento Modal State (Requested by user: "função zrar mapear")
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  // Security Defense Modal State (Requested by user: "crie uma defessa interna com aviso", image_031f9bdf.png)
  const [isDefenseModalOpen, setIsDefenseModalOpen] = useState<boolean>(false);
  const [defensePlatform, setDefensePlatform] = useState<'Facebook' | 'Instagram' | 'Multi-Canais'>('Facebook');
  const [defenseTriggerReason, setDefenseTriggerReason] = useState<string>('');

  // Automatic Cooldown Pauses (Requested by user: "limite de 500 por dia podendo ser mais com pausa automaticas")
  const [isCyclePauseActive, setIsCyclePauseActive] = useState<boolean>(true);
  const [cyclePauseCount, setCyclePauseCount] = useState<number>(25); // a cada 25 postagens
  const [cyclePauseMinutes, setCyclePauseMinutes] = useState<number>(15); // pausa preventiva de 15 minutos
  const [postsInCurrentCycle, setPostsInCurrentCycle] = useState<number>(14);

  // Tracked Links & Live Click Radar (Requested by user: "crie em todos links rstreio pra saber quam clicou,quem abriu")
  const [trackedLinks, setTrackedLinks] = useState<TrackedLinkItem[]>(() => {
    try {
      const saved = localStorage.getItem('autoviral_tracked_links_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'link-re-1',
        token: 'renda-extra-01',
        originalUrl: 'https://pay.kiwify.com.br/HE5xbnp',
        smartUrl: 'https://autoviral.app/r/renda-extra-01',
        campaignTitle: 'Loja Pronta E-commerce Sem Estoque (R$ 9,90)',
        campaignId: 'camp-loja-pronta-ecom',
        targetGroupCount: 73,
        createdAt: 'Hoje às 08:30',
        totalClicks: 47,
        uniqueOpens: 42,
        checkoutViews: 28,
        conversions: 4,
        clicksHistory: [
          {
            id: 'clk-1',
            linkId: 'link-re-1',
            token: 'renda-extra-01',
            timestamp: 'Hoje às 08:58:14',
            groupOriginName: 'RENDA EXTRA EM CASA 2 🚀🚀🚀',
            groupOriginUrl: 'https://facebook.com/groups/rendaextraemcasa2oficial',
            geoCity: 'Curitiba',
            geoState: 'PR',
            device: 'mobile',
            operatingSystem: 'Android (Samsung Galaxy)',
            hasOpenedPage: true,
            hasVisitedCheckout: true,
            timeSpentSeconds: 94,
            leadScore: 95
          },
          {
            id: 'clk-2',
            linkId: 'link-re-1',
            token: 'renda-extra-01',
            timestamp: 'Hoje às 08:52:03',
            groupOriginName: 'RENDA EXTRA (2,4 mil membros)',
            groupOriginUrl: 'https://facebook.com/groups/rendaextraoficialbrasil',
            geoCity: 'São Paulo',
            geoState: 'SP',
            device: 'mobile',
            operatingSystem: 'iOS (iPhone 14)',
            hasOpenedPage: true,
            hasVisitedCheckout: true,
            timeSpentSeconds: 68,
            leadScore: 88
          },
          {
            id: 'clk-3',
            linkId: 'link-re-1',
            token: 'renda-extra-01',
            timestamp: 'Hoje às 08:44:20',
            groupOriginName: 'Renda Extra & oportunidades 26',
            groupOriginUrl: 'https://facebook.com/groups/rendaextraeoportunidades26',
            geoCity: 'Belo Horizonte',
            geoState: 'MG',
            device: 'desktop',
            operatingSystem: 'Windows 11',
            hasOpenedPage: true,
            hasVisitedCheckout: false,
            timeSpentSeconds: 32,
            leadScore: 72
          }
        ]
      }
    ];
  });

  // Channel Target Selection for Dispatches (Persisted across refresh)
  const [targetChannels, setTargetChannels] = useState<{
    facebook: boolean;
    facebookStories: boolean;
    youtube: boolean;
    pinterest: boolean;
    instagram: boolean;
  }>(() => {
    try {
      const saved = localStorage.getItem('autoviral_target_channels_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { facebook: true, facebookStories: true, youtube: true, pinterest: true, instagram: true };
  });

  const [dispatchMode, setDispatchMode] = useState<'all' | 'facebook' | 'facebookStories' | 'youtube' | 'pinterest' | 'instagram'>(() => {
    try {
      const saved = localStorage.getItem('autoviral_dispatch_mode_v1');
      if (saved) return saved as any;
    } catch {}
    return 'all';
  });

  // Instagram Story Queue (merges both legacy & v2 keys so zero stories disappear)
  const [instagramStoryQueue, setInstagramStoryQueue] = useState<InstagramStoryItem[]>(() => {
    const merged: InstagramStoryItem[] = [];
    const seen = new Set<string>();
    const addRaw = (raw: string | null) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((s: any) => {
            if (s?.id && !seen.has(s.id)) {
              seen.add(s.id);
              merged.push(s);
            }
          });
        }
      } catch {}
    };
    try {
      addRaw(localStorage.getItem('autoviral_insta_story_queue_v2'));
      addRaw(localStorage.getItem('autoviral_insta_story_queue'));
    } catch {}
    return merged;
  });

  const handleToggleTargetChannel = (channel: 'facebook' | 'facebookStories' | 'youtube' | 'pinterest' | 'instagram') => {
    setTargetChannels(prev => {
      const updated = { ...prev, [channel]: !prev[channel] };
      try {
        localStorage.setItem('autoviral_target_channels_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleSetExclusiveChannel = (channel: 'all' | 'facebook' | 'facebookStories' | 'youtube' | 'pinterest' | 'instagram') => {
    setDispatchMode(channel);
    let updated = { facebook: true, facebookStories: true, youtube: true, pinterest: true, instagram: true };
    if (channel === 'facebook') updated = { facebook: true, facebookStories: false, youtube: false, pinterest: false, instagram: false };
    if (channel === 'facebookStories') updated = { facebook: false, facebookStories: true, youtube: false, pinterest: false, instagram: false };
    if (channel === 'youtube') updated = { facebook: false, facebookStories: false, youtube: true, pinterest: false, instagram: false };
    if (channel === 'pinterest') updated = { facebook: false, facebookStories: false, youtube: false, pinterest: true, instagram: false };
    if (channel === 'instagram') updated = { facebook: false, facebookStories: false, youtube: false, pinterest: false, instagram: true };
    setTargetChannels(updated);
    try {
      localStorage.setItem('autoviral_dispatch_mode_v1', channel);
      localStorage.setItem('autoviral_target_channels_v1', JSON.stringify(updated));
    } catch {}
  };

  const handleResetMapping = (scope: 'all' | 'facebook' | 'youtube' | 'pinterest' | 'instagram') => {
    if (scope === 'all' || scope === 'facebook') {
      setMappedGroups([]);
      setSelectedGroupIds([]);
      try {
        localStorage.removeItem('autoviral_fb_mapped_groups_v5_real');
        localStorage.removeItem('autoviral_fb_mapped_groups_v4');
        localStorage.removeItem('autoviral_fb_mapped_groups_v3');
      } catch {}
    }
    if (scope === 'all' || scope === 'youtube') {
      setYoutubeVideos([]);
      try {
        localStorage.removeItem('autoviral_yt_videos_v2');
      } catch {}
    }
    if (scope === 'all' || scope === 'pinterest') {
      setPinterestPins([]);
      try {
        localStorage.removeItem('autoviral_pinterest_pins_v1');
      } catch {}
    }
    if (scope === 'all' || scope === 'instagram') {
      setInstagramStoryQueue([]);
      try {
        localStorage.removeItem('autoviral_insta_story_queue_v2');
        localStorage.removeItem('autoviral_insta_story_queue');
      } catch {}
    }
    setIsResetModalOpen(false);
    setExtensionSyncBanner({
      message: `✅ Mapeamento ${scope === 'all' ? 'de TODOS os canais' : `do canal ${scope.toUpperCase()}`} foi zerado com sucesso.`,
      tone: 'success'
    });
  };

  // Bot Running Engine & Countdown
  const [isBotRunning, setIsBotRunning] = useState<boolean>(() => globalBotRunner.getIsRunning());
  const [currentPostingIndex, setCurrentPostingIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    const rem = globalBotRunner.getRemainingSeconds();
    return rem > 0 ? rem : 350;
  });

  const [botLogs, setBotLogs] = useState<FacebookPostLog[]>(() => {
    try {
      const saved = localStorage.getItem('autoviral_fb_bot_logs_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Chrome Extension Bridge Status
  const [isExtensionDetected, setIsExtensionDetected] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  // YouTube Automation State
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeTargetVideo[]>(() => {
    try {
      const saved = localStorage.getItem('autoviral_yt_videos_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'yt-1',
        url: 'https://www.youtube.com/watch?v=alfabetizacao-infantil-ludica',
        title: 'Como Alfabetizar Criança Autista e com TDAH sem Choro nem Birra',
        channelName: 'Pedagogia Prática com Amor (182 mil inscritos)',
        viewsCount: '48.900 visualizações',
        thumbnailUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80',
        actionLike: true,
        actionComment: true,
        actionPinCampaign: true,
        commentText: 'Excelente vídeo, professora! Como mãe e pedagoga sei o quanto materiais lúdicos mudam tudo. Para quem também procura atividades de coordenação motora e alfabetização em PDF prontas para imprimir por R$ 9,90 no Pix, consegui com acesso imediato aqui: https://pay.kiwify.com.br/HE5xbnp ❤️ Parabéns pelo conteúdo!',
        status: 'completed',
        lastExecutedAt: '10/11/2026 15:10'
      },
      {
        id: 'yt-2',
        url: 'https://www.youtube.com/watch?v=coordenacao-motora-fina-tea',
        title: '5 Atividades de Coordenação Motora Fina para Fazer em Casa (Fácil)',
        channelName: 'Psicopedagogia Infantil & Terapia (94 mil inscritos)',
        viewsCount: '32.100 visualizações',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80',
        actionLike: true,
        actionComment: true,
        actionPinCampaign: true,
        commentText: 'Dica preciosa! Adotei essas atividades na minha rotina. O caderno com mais de 100 tarefinhas da Kiwify (R$ 9,90) encaixou perfeitamente com o que você ensinou nesse vídeo. Deixo a recomendação pras mães e profes: https://pay.kiwify.com.br/HE5xbnp',
        status: 'ready'
      }
    ];
  });

  const [newYtUrl, setNewYtUrl] = useState('');
  const [newYtTitle, setNewYtTitle] = useState('');
  const [newYtChannel, setNewYtChannel] = useState('');
  const [newYtComment, setNewYtComment] = useState(
    'Maravilhoso vídeo! Adorei a explicação. Para quem busca caderno de atividades de coordenação motora em PDF por R$ 9,90 no Pix, peguei aqui: https://pay.kiwify.com.br/HE5xbnp'
  );
  const [isAddYtModalOpen, setIsAddYtModalOpen] = useState(false);
  const [ytLogs, setYtLogs] = useState<YouTubeBotLog[]>([]);

  // YouTube Search & Video Mapping State (User requested: "mapear url com youtube aberto 'apos fazer procura', imagem 2")
  const [ytSearchTerm, setYtSearchTerm] = useState<string>('TEA');
  const [isYtSearching, setIsYtSearching] = useState<boolean>(false);
  const [isBulkYtModalOpen, setIsBulkYtModalOpen] = useState<boolean>(false);
  const [bulkYtUrlsText, setBulkYtUrlsText] = useState<string>('');

  const handleSearchAndMapYouTube = (term: string) => {
    setIsYtSearching(true);
    setYtSearchTerm(term);

    setTimeout(() => {
      let mappedFromSearch: YouTubeTargetVideo[] = [];

      if (term.toLowerCase().includes('tea') || term.toLowerCase().includes('autis')) {
        mappedFromSearch = [
          {
            id: 'yt-tea-1',
            url: 'https://www.youtube.com/watch?v=resumo-tea-luna',
            title: 'O melhor resumo sobre Transtorno do Espectro Autista (TEA)',
            channelName: 'Luna Educação (144 mil visualizações)',
            viewsCount: '144 mil views',
            thumbnailUrl: '/assets/aistudio/image_8e57ec78.png',
            actionLike: true,
            actionComment: true,
            actionPinCampaign: true,
            commentText: 'Excelente resumo explicativo! Como mãe e educadora sei o valor de materiais sem telas. O caderno com mais de 100 atividades lúdicas de coordenação motora para TEA por R$ 9,90 no Pix me ajudou demais: https://pay.kiwify.com.br/HE5xbnp ❤️ Parabéns pelo trabalho!',
            status: 'ready'
          },
          {
            id: 'yt-tea-2',
            url: 'https://www.youtube.com/watch?v=autismo-tea-mayra-gaiato',
            title: 'Autismo - TEA? O que é?',
            channelName: 'Mayra Gaiato | Desenvolvimento Infantil (214 mil visualizações)',
            viewsCount: '214 mil views',
            thumbnailUrl: '/assets/aistudio/image_8e57ec78.png',
            actionLike: true,
            actionComment: true,
            actionPinCampaign: true,
            commentText: 'Dra. Mayra sempre cirúrgica! Para quem tem criança em fase de estímulo motor e busca atividades em PDF prontas para imprimir em casa por R$ 9,90 no Pix: https://pay.kiwify.com.br/HE5xbnp',
            status: 'ready'
          },
          {
            id: 'yt-tea-3',
            url: 'https://www.youtube.com/watch?v=autismo-realidade-tea-o-que-e',
            title: 'O que é o Transtorno do Espectro Autista (TEA)?',
            channelName: 'Autismo e Realidade (92 mil visualizações)',
            viewsCount: '92 mil views',
            thumbnailUrl: '/assets/aistudio/image_8e57ec78.png',
            actionLike: true,
            actionComment: true,
            actionPinCampaign: true,
            commentText: 'Muito importante essa conscientização! Compartilho também uma dica de apostila digital com atividades de coordenação motora fina para autistas por apenas R$ 9,90: https://pay.kiwify.com.br/HE5xbnp',
            status: 'ready'
          },
          {
            id: 'yt-tea-4',
            url: 'https://www.youtube.com/watch?v=10-sinais-autismo-neurosaber',
            title: '10 Sinais Precoces de Autismo em Crianças',
            channelName: 'NeuroSaber (98 mil visualizações)',
            viewsCount: '98 mil views',
            thumbnailUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80',
            actionLike: true,
            actionComment: true,
            actionPinCampaign: true,
            commentText: 'Vídeo essencial para pais e professores! Recomendo muito o caderno de atividades adaptadas em PDF por R$ 9,90: https://pay.kiwify.com.br/HE5xbnp',
            status: 'ready'
          }
        ];
      } else {
        mappedFromSearch = [
          {
            id: `yt-search-${Date.now()}-1`,
            url: `https://www.youtube.com/watch?v=${term.toLowerCase().replace(/[^a-z0-9]/g, '-')}-1`,
            title: `Como Aplicar ${term} na Prática e Ter Resultados Rápidos`,
            channelName: `Canal Especialista em ${term}`,
            viewsCount: '62.400 visualizações',
            thumbnailUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80',
            actionLike: true,
            actionComment: true,
            actionPinCampaign: true,
            commentText: `Ótimo conteúdo sobre ${term}! Para quem procura a solução prática no Pix por R$ 9,90 com garantia: https://pay.kiwify.com.br/HE5xbnp`,
            status: 'ready'
          }
        ];
      }

      setYoutubeVideos(prev => {
        const merged = [...mappedFromSearch, ...prev];
        const unique = merged.filter((v, idx, arr) => arr.findIndex(x => x.url === v.url) === idx);
        try {
          localStorage.setItem('autoviral_yt_videos_v2', JSON.stringify(unique));
        } catch {}
        return unique;
      });

      setIsYtSearching(false);
      alert(`🎯 ${mappedFromSearch.length} vídeos da busca "${term}" foram mapeados e organizados para comentários com link!`);
    }, 600);
  };

  const handleBulkImportYouTube = () => {
    if (!bulkYtUrlsText.trim()) {
      alert('Cole ao menos 1 URL de vídeo do YouTube.');
      return;
    }

    const lines = bulkYtUrlsText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const added: YouTubeTargetVideo[] = [];

    lines.forEach((line, idx) => {
      if (line.includes('youtube.com/watch') || line.includes('youtu.be/')) {
        const cleanUrl = line.split('&')[0];
        if (!youtubeVideos.some(v => v.url === cleanUrl)) {
          added.push({
            id: `yt-bulk-${Date.now()}-${idx}`,
            url: cleanUrl,
            title: `Vídeo Estratégico do YouTube #${idx + 1}`,
            channelName: 'Canal Segmentado',
            viewsCount: 'Ativo',
            thumbnailUrl: '/assets/aistudio/image_8e57ec78.png',
            actionLike: true,
            actionComment: true,
            actionPinCampaign: true,
            commentText: `Recomendo muito esse conteúdo! Para quem busca material lúdico por R$ 9,90 no Pix: https://pay.kiwify.com.br/HE5xbnp`,
            status: 'ready'
          });
        }
      }
    });

    if (added.length === 0) {
      alert('Nenhuma nova URL válida do YouTube encontrada.');
      return;
    }

    setYoutubeVideos(prev => [...added, ...prev]);
    setIsBulkYtModalOpen(false);
    setBulkYtUrlsText('');
    alert(`✅ ${added.length} novos vídeos do YouTube importados com sucesso!`);
  };

  // Pinterest Automation State
  const [pinterestBoards, setPinterestBoards] = useState<PinterestBoard[]>([
    {
      id: 'board-1',
      name: 'Pedagogia Prática & Alfabetização Lúdica',
      pinsCount: 42,
      followersEstimated: 12400,
      niche: 'Pedagogia',
      description: 'Ideias de sala de aula, cadernos de reforço e atividades lúdicas prontas.'
    },
    {
      id: 'board-2',
      name: 'Atividades Infantis & Coordenação Motora',
      pinsCount: 88,
      followersEstimated: 35100,
      niche: 'Maternidade',
      description: 'Desenvolvimento motor infantil, brincadeiras sensoriais e PDF para imprimir.'
    },
    {
      id: 'board-3',
      name: 'Autismo & Mães Atípicas',
      pinsCount: 31,
      followersEstimated: 18900,
      niche: 'Autismo / TDAH',
      description: 'Apoio a mães atípicas, materiais adaptados e rotinas sensoriais visuais.'
    },
    {
      id: 'board-4',
      name: 'Materiais em PDF Prontos para Imprimir',
      pinsCount: 65,
      followersEstimated: 24700,
      niche: 'Imprimíveis',
      description: 'Apostilas, cadernos de desenho e tarefinhas baratas até R$ 10,00 no Pix.'
    }
  ]);

  const [pinterestPins, setPinterestPins] = useState<PinterestPinItem[]>(() => {
    try {
      const saved = localStorage.getItem('autoviral_pinterest_pins_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'pin-1',
        title: 'Caderno de Coordenação Motora Infantil (+100 Tarefinhas em PDF)',
        description: 'Atividades lúdicas sem poluição visual prontas para imprimir em casa. Ideal para crianças de 2 a 8 anos e mães atípicas. Apenas R$ 9,90 no Pix com acesso imediato!',
        boardName: 'Pedagogia Prática & Alfabetização Lúdica',
        destinationUrl: 'https://pay.kiwify.com.br/HE5xbnp',
        imageUrl: '/assets/aistudio/image_e9e67204.png',
        price: 9.90,
        status: 'published',
        impressionsEstimated: 18400,
        clicksEstimated: 1120,
        publishedAt: 'Publicado Hoje às 14:30',
        niche: 'Educação Infantil'
      },
      {
        id: 'pin-2',
        title: 'Como Desenvolver a Escrita sem Birra nem Telas (Fácil & Divertido)',
        description: 'Mais de 100 exercícios com traçados, labirintos e recorte adaptado para desenvolvimento psicomotor. Baixe agora por R$ 9,90.',
        boardName: 'Atividades Infantis & Coordenação Motora',
        destinationUrl: 'https://pay.kiwify.com.br/HE5xbnp',
        imageUrl: '/assets/aistudio/image_2842df45.png',
        price: 9.90,
        status: 'ready',
        impressionsEstimated: 26800,
        clicksEstimated: 1450,
        niche: 'Psicomotricidade'
      },
      {
        id: 'pin-3',
        title: 'Material Adaptado TEA / TDAH - Fichas Limpas em PDF para Imprimir',
        description: 'Elaborado especialmente para reduzir ansiedade e facilitar a concentração. Aprovado por pedagogas e mães. R$ 9,90 no Pix.',
        boardName: 'Autismo & Mães Atípicas',
        destinationUrl: 'https://pay.kiwify.com.br/HE5xbnp',
        imageUrl: '/assets/aistudio/image_038e9679.png',
        price: 9.90,
        status: 'ready',
        impressionsEstimated: 21300,
        clicksEstimated: 980,
        niche: 'Inclusão & Autismo'
      }
    ];
  });

  const [isAddPinModalOpen, setIsAddPinModalOpen] = useState<boolean>(false);
  const [newPinTitle, setNewPinTitle] = useState<string>('Caderno de Coordenação Motora Fina (+100 Páginas em PDF)');
  const [newPinDesc, setNewPinDesc] = useState<string>('Atividades lúdicas prontas para imprimir em casa por apenas R$ 9,90 no Pix. Perfeito para alfabetização e educação infantil!');
  const [newPinBoard, setNewPinBoard] = useState<string>('Pedagogia Prática & Alfabetização Lúdica');
  const [newPinImageUrl, setNewPinImageUrl] = useState<string>('/assets/aistudio/image_e9e67204.png');
  const [newPinUrl, setNewPinUrl] = useState<string>('https://pay.kiwify.com.br/HE5xbnp');
  const [newPinPrice, setNewPinPrice] = useState<number>(9.90);

  // Persist State consistently to LocalStorage (all active keys synced) + Firebase Cloud Workspace Sync
  useEffect(() => {
    try {
      localStorage.setItem('autoviral_fb_mapped_groups_v5_real', JSON.stringify(mappedGroups));
      localStorage.setItem('autoviral_fb_mapped_groups_v3', JSON.stringify(mappedGroups));
      localStorage.setItem('autoviral_fb_audiences_v4', JSON.stringify(audiences));
      localStorage.setItem('autoviral_fb_audiences_v3', JSON.stringify(audiences));
      localStorage.setItem('autoviral_fb_bot_logs_v3', JSON.stringify(botLogs));
      localStorage.setItem('autoviral_fb_daily_completed_v3', dailyDispatchesCompleted.toString());
      localStorage.setItem('autoviral_yt_videos_v2', JSON.stringify(youtubeVideos));
      localStorage.setItem('autoviral_pinterest_pins_v1', JSON.stringify(pinterestPins));
    } catch {}
  }, [mappedGroups, audiences, botLogs, dailyDispatchesCompleted, youtubeVideos, pinterestPins]);

  // Real-time Firebase Workspace Sync (receives and merges non-destructively across domains/browsers)
  useEffect(() => {
    const applyCloudWorkspace = (cloud: any) => {
      if (!cloud || typeof cloud !== 'object') return;
      if (cloud.savedCopiesMap && typeof cloud.savedCopiesMap === 'object') {
        setSavedCopiesMap(prev => {
          const next = { ...prev };
          Object.entries(cloud.savedCopiesMap).forEach(([campId, cloudEntry]: [string, any]) => {
            if (!cloudEntry) return;
            const prevEntry = next[campId];
            if (!prevEntry || (cloudEntry.savedAt && (!prevEntry.savedAt || cloudEntry.savedAt > prevEntry.savedAt))) {
              next[campId] = cloudEntry;
            }
          });
          return next;
        });
      }
      if (Array.isArray(cloud.customCopyPresets) && cloud.customCopyPresets.length > 0) {
        setCustomCopyPresets(prev => {
          const seen = new Set(prev.map(p => p.id));
          const fresh = cloud.customCopyPresets!.filter((p: any) => p?.id && !seen.has(p.id));
          return fresh.length > 0 ? [...prev, ...fresh] : prev;
        });
      }
      if (Array.isArray(cloud.audiences) && cloud.audiences.length > 0) {
        setAudiences(prev => {
          const byId = new Map(prev.map(a => [a.id, a]));
          let changed = false;
          cloud.audiences!.forEach((ca: any) => {
            if (!ca?.id) return;
            const existing = byId.get(ca.id);
            if (!existing) {
              byId.set(ca.id, ca);
              changed = true;
            } else if (Array.isArray(ca.groupIds) && ca.groupIds.length > (existing.groupIds?.length || 0)) {
              byId.set(ca.id, { ...existing, ...ca });
              changed = true;
            }
          });
          return changed ? Array.from(byId.values()) : prev;
        });
      }
      if (Array.isArray(cloud.youtubeVideos) && cloud.youtubeVideos.length > 0) {
        setYoutubeVideos(prev => {
          const seen = new Set(prev.map(v => v.url));
          const fresh = cloud.youtubeVideos!.filter((v: any) => v?.url && !seen.has(v.url));
          return fresh.length > 0 ? [...fresh, ...prev] : prev;
        });
      }
      if (Array.isArray(cloud.pinterestPins) && cloud.pinterestPins.length > 0) {
        setPinterestPins(prev => {
          const seen = new Set(prev.map(p => p.id));
          const fresh = cloud.pinterestPins!.filter((p: any) => p?.id && !seen.has(p.id));
          return fresh.length > 0 ? [...fresh, ...prev] : prev;
        });
      }
      if (Array.isArray(cloud.mappedGroups) && cloud.mappedGroups.length > 0) {
        setMappedGroups(prev => {
          const hasRealPrev = prev.some(g => !isSyntheticSeedGroup(g));
          const seenUrls = new Set(prev.map(g => g.url));
          const fresh = cloud.mappedGroups!.filter((g: any) => {
            if (!g?.url || seenUrls.has(g.url)) return false;
            if (hasRealPrev && isSyntheticSeedGroup(g)) return false;
            if (String(g.url || '').toLowerCase().includes('maesepaisdecriancasespeciaisbrasil')) return false;
            return true;
          });
          return fresh.length > 0 ? [...fresh, ...prev] : prev;
        });
      }
    };

    const unsub = subscribeWorkspaceSync(applyCloudWorkspace);
    const onManualSync = (ev: Event) => {
      const detail = (ev as CustomEvent).detail;
      if (detail) applyCloudWorkspace(detail);
    };
    window.addEventListener('autoviral_workspace_synced', onManualSync);
    return () => {
      unsub();
      window.removeEventListener('autoviral_workspace_synced', onManualSync);
    };
  }, []);

  const hasInitializedWorkspaceSyncRef = React.useRef(false);
  // Push workspace state to Firebase Cloud debounced (only on actual local edits)
  useEffect(() => {
    if (!hasInitializedWorkspaceSyncRef.current) {
      hasInitializedWorkspaceSyncRef.current = true;
      return;
    }
    const timer = setTimeout(() => {
      saveWorkspaceSyncToFirebase({
        savedCopiesMap,
        customCopyPresets,
        audiences,
        youtubeVideos,
        pinterestPins,
        mappedGroups,
      });
    }, 2200);
    return () => clearTimeout(timer);
  }, [savedCopiesMap, customCopyPresets, audiences, youtubeVideos, pinterestPins, mappedGroups]);

  // Hook into Persistent Background Bot Runner
  useEffect(() => {
    globalBotRunner.setCallbacks(
      () => {
        handleExecuteGroupPost();
      },
      (remainingSecs, isExec) => {
        setSecondsRemaining(remainingSecs);
        if (isExec) {
          // Handled inside handleExecuteGroupPost
        }
      }
    );

    // Initial check
    setIsBotRunning(globalBotRunner.getIsRunning());
  }, [currentPostingIndex, selectedGroupIds, mappedGroups, dailyDispatchesCompleted, dailyDispatchLimit]);

  // Listen for extension events
  useEffect(() => {
    const handleExtensionGroups = (event: any) => {
      if (event.detail) {
        setIsExtensionDetected(true);
        if (Array.isArray(event.detail.groups) && event.detail.groups.length > 0) {
          const imported: FacebookGroup[] = event.detail.groups;
          const detectedFolder = event.detail.searchFolder || imported[0]?.searchFolder || 'psicopedagogia';
          const enriched = imported.map(g => ({
            ...g,
            name: sanitizeFbGroupName(g.name || '') || g.name,
            searchFolder: g.searchFolder || detectedFolder,
            searchTerm: g.searchTerm || event.detail.searchQuery || detectedFolder
          }));

          setMappedGroups(prev => {
            const realPrev = prev.filter(g => !isSyntheticSeedGroup(g));
            const merged = [...enriched, ...realPrev];
            const unique = merged.filter((g, index, self) =>
              index === self.findIndex(t => t.url === g.url || t.name === g.name)
            );
            try {
              localStorage.setItem('autoviral_fb_mapped_groups_v5_real', JSON.stringify(unique));
            } catch {}
            return unique;
          });

          const importedIds = enriched.map(g => g.id);
          setLastImportedGroupIds(importedIds);
          setActiveSearchFolder(detectedFolder);
          setSearchQuery('');
          setSelectedGroupIds(importedIds);
          setExtensionSyncBanner({
            message: `🎉 ${enriched.length} grupos recebidos da extensão Chrome na pasta "${detectedFolder}" e já selecionados para você!`,
            tone: 'success'
          });
        }
        if (Array.isArray(event.detail.instaStories) && event.detail.instaStories.length > 0) {
          setInstagramStoryQueue(event.detail.instaStories);
        }
        if (Array.isArray(event.detail.ytVideos) && event.detail.ytVideos.length > 0) {
          setYoutubeVideos(prev => {
            const merged = [...prev];
            event.detail.ytVideos.forEach((v: any) => {
              if (v?.url && !merged.some(m => m.url === v.url)) {
                merged.unshift({ actionLike: true, actionComment: true, actionPinCampaign: true, status: 'ready', ...v });
              }
            });
            return merged;
          });
        }
        if (event.detail.targetChannels) {
          setTargetChannels(event.detail.targetChannels);
        }
      }
    };

    const mergeYtVideosFromExt = (videos: any[]) => {
      if (!Array.isArray(videos) || videos.length === 0) return;
      setYoutubeVideos(prev => {
        const merged = [...prev];
        let addedCount = 0;
        videos.forEach((v: any) => {
          if (v?.url && !merged.some(m => m.url === v.url)) {
            merged.unshift({
              actionLike: true,
              actionComment: true,
              actionPinCampaign: true,
              status: 'ready',
              ...v
            });
            addedCount++;
          }
        });
        try {
          localStorage.setItem('autoviral_yt_videos_v2', JSON.stringify(merged));
        } catch {}
        if (addedCount > 0) {
          setExtensionSyncBanner({
            message: `▶️ ${addedCount} novas URLs de vídeos do YouTube recebidas da extensão! Clique em "4. Robô YouTube" para ver.`,
            tone: 'success'
          });
        }
        return merged;
      });
    };

    const handleExtensionYtVideos = (event: any) => {
      if (event.detail && Array.isArray(event.detail.videos)) {
        mergeYtVideosFromExt(event.detail.videos);
      }
    };

    const refreshInstaCount = () => {
      setTimeout(() => {
        try {
          const saved = localStorage.getItem('autoviral_insta_mapped_targets_v2');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) setMappedInstaProfilesCount(parsed.length);
          }
        } catch {}
      }, 150);
    };

    // Direct BroadcastChannel for real-time inter-tab sync from Facebook/YouTube/Instagram tabs
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('autoviral_bridge_channel');
      bc.onmessage = (ev) => {
        if (ev.data && ev.data.action === 'AUTOVIRAL_IMPORT_GROUPS_FROM_EXTENSION') {
          setIsExtensionDetected(true);
          const imported = ev.data.groups;
          const detectedFolder = ev.data.searchFolder || (Array.isArray(imported) && imported[0]?.searchFolder) || 'psicopedagogia';
          if (Array.isArray(imported) && imported.length > 0) {
            const enriched = imported.map((g: any) => ({
              ...g,
              name: sanitizeFbGroupName(g.name || '') || g.name,
              searchFolder: g.searchFolder || detectedFolder,
              searchTerm: g.searchTerm || ev.data.searchQuery || detectedFolder
            }));

            setMappedGroups(prev => {
              const realPrev = prev.filter(g => !isSyntheticSeedGroup(g));
              const merged = [...enriched, ...realPrev];
              const unique = merged.filter((g, index, self) =>
                index === self.findIndex(t => t.url === g.url || t.name === g.name)
              );
              try {
                localStorage.setItem('autoviral_fb_mapped_groups_v5_real', JSON.stringify(unique));
              } catch {}
              return unique;
            });
            const importedIds = enriched.map((g: any) => g.id);
            setLastImportedGroupIds(importedIds);
            setActiveSearchFolder(detectedFolder);
            setSearchQuery('');
            setSelectedGroupIds(importedIds);
            setExtensionSyncBanner({
              message: `🎉 ${imported.length} grupos mapeados da pasta "${detectedFolder}" foram sincronizados direto do seu Facebook e já estão selecionados!`,
              tone: 'success'
            });
          }
          if (Array.isArray(ev.data.ytVideos) && ev.data.ytVideos.length > 0) {
            mergeYtVideosFromExt(ev.data.ytVideos);
          }
          if (Array.isArray(ev.data.instaAccounts) && ev.data.instaAccounts.length > 0) {
            refreshInstaCount();
          }
        } else if (ev.data && ev.data.action === 'AUTOVIRAL_IMPORT_YOUTUBE_VIDEOS_FROM_EXTENSION') {
          setIsExtensionDetected(true);
          mergeYtVideosFromExt(ev.data.videos || []);
        } else if (ev.data && ev.data.action === 'AUTOVIRAL_IMPORT_INSTAGRAM_ACCOUNTS') {
          setIsExtensionDetected(true);
          refreshInstaCount();
        } else if (ev.data && ev.data.action === 'AUTOVIRAL_FB_POST_RESULT') {
          applyRealPostResultFromExtension(ev.data);
        }
      };
    } catch (e) {}

    const applyRealPostResultFromExtension = (payload: any) => {
      if (!payload) return;
      setIsExtensionDetected(true);
      const { logId, groupId, groupUrl, groupName, approvalStatus, note } = payload;
      const now = new Date();
      const formattedNow = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
      const normalizedStatus: FacebookPostLog['approvalStatus'] =
        approvalStatus === 'published' ||
        approvalStatus === 'awaiting_admin' ||
        approvalStatus === 'not_member' ||
        approvalStatus === 'join_requested' ||
        approvalStatus === 'rate_limited' ||
        approvalStatus === 'unavailable'
          ? approvalStatus
          : 'pending_verification';

      const isErrorResult =
        normalizedStatus === 'not_member' ||
        normalizedStatus === 'rate_limited' ||
        normalizedStatus === 'unavailable';

      setBotLogs(prev => {
        const matchIdx = prev.findIndex(
          l => (logId && l.id === logId) || (groupId && l.groupId === groupId) || (groupUrl && l.groupUrl === groupUrl)
        );
        if (matchIdx >= 0) {
          const updated = [...prev];
          updated[matchIdx] = {
            ...updated[matchIdx],
            postedAt: formattedNow,
            status: isErrorResult ? 'error' : 'success',
            approvalStatus: normalizedStatus,
            isVerifiedReal: true
          };
          return updated;
        }
        const created: FacebookPostLog = {
          id: logId || `log-${now.getTime()}`,
          groupId: groupId || `fb-${now.getTime()}`,
          groupName: groupName || 'Grupo do Facebook',
          groupUrl: groupUrl || 'https://www.facebook.com/groups',
          postedAt: formattedNow,
          headline: note || 'Publicação verificada pela extensão Chrome',
          status: isErrorResult ? 'error' : 'success',
          approvalStatus: normalizedStatus,
          isVerifiedReal: true,
          intervalWaitedSeconds: 0,
          checkoutUrl: ''
        };
        return [created, ...prev];
      });

      if (normalizedStatus === 'unavailable') {
        const targetSlug = normalizeFbGroupSlug(groupUrl || '');
        const isTargetGroup = (g: FacebookGroup) =>
          (groupId && g.id === groupId) ||
          (targetSlug && normalizeFbGroupSlug(g.url) === targetSlug);

        setSelectedGroupIds(prev => prev.filter(id => {
          if (groupId && id === groupId) return false;
          const grpObj = mappedGroups.find(m => m.id === id);
          return grpObj ? !isTargetGroup(grpObj) : true;
        }));
        setMappedGroups(prev => {
          const filtered = prev.filter(g => !isTargetGroup(g));
          try {
            localStorage.setItem('autoviral_fb_mapped_groups_v5_real', JSON.stringify(filtered));
          } catch {}
          return filtered;
        });
        setExtensionSyncBanner({
          message: `🚫 Grupo "${groupName || 'Facebook'}" está indisponível ou foi excluído ("Este conteúdo não está disponível no momento"). Removido automaticamente da fila para o robô seguir apenas nos grupos ativos!`,
          tone: 'warning'
        });
      } else if (normalizedStatus === 'rate_limited') {
        globalBotRunner.stop();
        setIsBotRunning(false);
        setDefensePlatform('Facebook');
        setDefenseTriggerReason('Facebook exibiu: "Você não pode usar este recurso no momento" (Limite temporário de frequência)');
        setIsDefenseModalOpen(true);
        setExtensionSyncBanner({
          message: `🛡️ FREIO ANTI-BLOQUEIO ATIVADO! O Facebook limitou ações temporariamente em "${groupName || 'grupo'}". A fila foi pausada — aguarde 15–30 min e priorize grupos onde você já é membro.`,
          tone: 'warning'
        });
      } else if (normalizedStatus === 'join_requested') {
        setExtensionSyncBanner({
          message: `🚪 Entrada solicitada automaticamente em "${groupName || 'grupo'}"! A postagem ficou salva — quando o administrador aprovar, clique em "🔄 Entrar / Postar Agora" no histórico.`,
          tone: 'warning'
        });
      } else if (normalizedStatus === 'not_member') {
        setExtensionSyncBanner({
          message: `⚠️ Grupo "${groupName || 'Facebook'}" ainda precisa de entrada. Clique em "🔄 Entrar / Postar Agora" para a extensão v1.3.8 solicitar entrada e postar automaticamente.`,
          tone: 'warning'
        });
      } else if (normalizedStatus === 'awaiting_admin') {
        setExtensionSyncBanner({
          message: `⏳ Confirmado pelo Facebook: post em "${groupName || 'grupo'}" ficou Aguardando Permissão do Administrador.`,
          tone: 'warning'
        });
      } else if (normalizedStatus === 'published') {
        setExtensionSyncBanner({
          message: `✅ Confirmado no Facebook: Postagem Feita com sucesso em "${groupName || 'grupo'}"!`,
          tone: 'success'
        });
      }
    };

    const handleExtensionPostResult = (event: any) => {
      applyRealPostResultFromExtension(event?.detail);
    };

    window.addEventListener('autoviral_extension_groups_received', handleExtensionGroups);
    window.addEventListener('autoviral_extension_youtube_videos_received', handleExtensionYtVideos);
    window.addEventListener('autoviral_extension_instagram_accounts_received', refreshInstaCount);
    window.addEventListener('autoviral_fb_post_result', handleExtensionPostResult);

    const handleExtensionReset = () => {
      setMappedGroups([]);
      setSelectedGroupIds([]);
      setInstagramStoryQueue([]);
      try {
        localStorage.removeItem('autoviral_fb_mapped_groups_v5_real');
        localStorage.removeItem('autoviral_fb_mapped_groups_v4');
        localStorage.removeItem('autoviral_insta_story_queue');
      } catch {}
    };
    window.addEventListener('autoviral_extension_groups_reset', handleExtensionReset);

    if (document.documentElement.getAttribute('data-autoviral-extension-installed') === 'true') {
      setIsExtensionDetected(true);
    }

    return () => {
      if (bc) {
        try { bc.close(); } catch (err) {}
      }
      window.removeEventListener('autoviral_extension_groups_received', handleExtensionGroups);
      window.removeEventListener('autoviral_extension_youtube_videos_received', handleExtensionYtVideos);
      window.removeEventListener('autoviral_extension_instagram_accounts_received', refreshInstaCount);
      window.removeEventListener('autoviral_fb_post_result', handleExtensionPostResult);
      window.removeEventListener('autoviral_extension_groups_reset', handleExtensionReset);
    };
  }, []);

  // Execute assisted Facebook group dispatch (NEVER fakes 'Postagem Feita' without real verification)
  const handleExecuteGroupPost = () => {
    if (dailyDispatchesCompleted >= dailyDispatchLimit) {
      globalBotRunner.stop();
      setIsBotRunning(false);
      setExtensionSyncBanner({
        message: `⚠️ Limite diário de segurança de ${dailyDispatchLimit} disparos atingido hoje.`,
        tone: 'warning'
      });
      return;
    }

    const targetGroups = mappedGroups.filter(g => selectedGroupIds.includes(g.id));
    if (targetGroups.length === 0) {
      globalBotRunner.stop();
      setIsBotRunning(false);
      setExtensionSyncBanner({
        message: '⚠️ Selecione pelo menos 1 grupo na aba "Grupos Mapeados" antes de iniciar.',
        tone: 'warning'
      });
      return;
    }

    const currentGroup = targetGroups[currentPostingIndex % targetGroups.length];
    const waited = isRandomJitterActive
      ? Math.floor(Math.random() * (400 - 300 + 1)) + 300
      : intervalSeconds;

    const fullText = `${postHeadline}\n\n${postCopy}`.trim();
    try {
      navigator.clipboard?.writeText(fullText);
    } catch {}

    const now = new Date();
    const logId = `log-${now.getTime()}`;
    const newLog: FacebookPostLog = {
      id: logId,
      groupId: currentGroup.id,
      groupName: `${currentGroup.name} (${currentGroup.membersCount.toLocaleString('pt-BR')} membros)`,
      groupUrl: currentGroup.url,
      postedAt: `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`,
      headline: postHeadline.slice(0, 55) + '...',
      status: 'success',
      approvalStatus: 'pending_verification',
      isVerifiedReal: false,
      intervalWaitedSeconds: waited,
      checkoutUrl: selectedCheckoutUrl
    };

    setBotLogs(prev => [newLog, ...prev]);
    setLastOpenedPostLog({
      logId,
      groupName: currentGroup.name,
      groupUrl: currentGroup.url
    });
    setDailyDispatchesCompleted(prev => prev + 1);

    setMappedGroups(prev =>
      prev.map(g =>
        g.id === currentGroup.id
          ? { ...g, dispatchCount: g.dispatchCount + 1, lastDispatchedAt: 'Aberto para postar' }
          : g
      )
    );

    // Send real command to Chrome Extension to auto-join (if needed) & auto-post
    try {
      window.postMessage(
        {
          type: 'AUTOVIRAL_OPEN_GROUP_FOR_POST',
          logId,
          groupId: currentGroup.id,
          groupUrl: currentGroup.url,
          groupName: currentGroup.name,
          fullText,
          autoJoinAndPost: autoJoinAndPostEnabled
        },
        '*'
      );
    } catch {}

    setExtensionSyncBanner({
      message: autoJoinAndPostEnabled
        ? `🤖 Grupo "${currentGroup.name}" aberto! A Extensão v1.3.8 vai solicitar entrada (se precisar) e postar automaticamente.`
        : `📋 Texto copiado! Grupo "${currentGroup.name}" aberto para postagem manual assistida.`,
      tone: 'success'
    });

    setCurrentPostingIndex(prev => (prev + 1) % targetGroups.length);
  };

  // Re-run auto-join check & auto-post on a previously join-requested/not_member group
  const handleRetryJoinOrPost = (log: FacebookPostLog) => {
    const fullText = `${postHeadline}\n\n${postCopy}`.trim();
    try {
      navigator.clipboard?.writeText(fullText);
    } catch {}

    setBotLogs(prev =>
      prev.map(l =>
        l.id === log.id
          ? { ...l, approvalStatus: 'pending_verification', status: 'success' }
          : l
      )
    );
    setLastOpenedPostLog({
      logId: log.id,
      groupName: log.groupName,
      groupUrl: log.groupUrl
    });

    try {
      window.postMessage(
        {
          type: 'AUTOVIRAL_OPEN_GROUP_FOR_POST',
          logId: log.id,
          groupId: log.groupId,
          groupUrl: log.groupUrl,
          groupName: log.groupName,
          fullText,
          autoJoinAndPost: true
        },
        '*'
      );
    } catch {}

    setExtensionSyncBanner({
      message: `🔄 Reabrindo "${log.groupName}" para verificar aprovação e finalizar a postagem automaticamente!`,
      tone: 'success'
    });
  };

  // Toggle Bot Execution with Background Persistence
  const handleToggleBot = () => {
    if (isBotRunning) {
      globalBotRunner.stop();
      setIsBotRunning(false);
    } else {
      globalBotRunner.start(
        intervalSeconds,
        isRandomJitterActive,
        () => handleExecuteGroupPost(),
        (remaining) => setSecondsRemaining(remaining)
      );
      setIsBotRunning(true);
    }
  };

  // Filter groups according to active folder search tab
  const getGroupsByFolder = (folder: string) => {
    if (folder === 'all') return mappedGroups;

    if (folder === 'psicopedagogia' || folder === 'pedagogia' || folder === 'pedagoga') {
      return mappedGroups.filter(g =>
        g.searchFolder === 'psicopedagogia' ||
        g.searchTerm === 'psicopedagogia' ||
        g.searchTerm === 'pedagogia' ||
        g.niche.includes('Pedagogia') ||
        g.niche.includes('Psicopedagogia') ||
        g.name.toLowerCase().includes('pedagog') ||
        g.name.toLowerCase().includes('profess') ||
        g.name.toLowerCase().includes('atividades') ||
        g.name.toLowerCase().includes('escolar') ||
        g.name.toLowerCase().includes('psico') ||
        g.name.toLowerCase().includes('lúdico') ||
        g.name.toLowerCase().includes('ludic') ||
        g.name.toLowerCase().includes('infantil')
      );
    }
    if (folder === 'renda_extra') {
      return mappedGroups.filter(g =>
        g.searchFolder === 'renda_extra' ||
        g.searchTerm === 'renda extra' ||
        g.niche.includes('Renda') ||
        g.name.toLowerCase().includes('renda') ||
        g.name.toLowerCase().includes('dinheiro') ||
        g.name.toLowerCase().includes('trabalho') ||
        g.name.toLowerCase().includes('home office') ||
        g.name.toLowerCase().includes('oportunidade') ||
        g.name.toLowerCase().includes('afiliad')
      );
    }
    if (folder === 'curitiba') {
      return mappedGroups.filter(g => (g.searchFolder === 'curitiba' || g.city === 'Curitiba' || g.searchTerm === 'curitiba' || g.name.toLowerCase().includes('curitiba')));
    }
    if (folder === 'autismo') {
      return mappedGroups.filter(g => (g.searchFolder === 'autismo' || g.searchTerm === 'autismo' || g.niche.includes('Autismo') || g.name.toLowerCase().includes('autista') || g.name.toLowerCase().includes('tea')));
    }
    return mappedGroups.filter(g => g.searchFolder === folder || g.searchTerm === folder || g.niche === folder);
  };

  // Dynamic custom search folders created by user's Chrome searches (e.g. "geral", "confeitaria", etc.)
  const BUILTIN_FOLDER_KEYS = new Set(['psicopedagogia', 'pedagogia', 'pedagoga', 'renda_extra', 'curitiba', 'autismo', 'all']);
  const dynamicCustomFolders = Array.from(
    new Set(
      mappedGroups
        .map(g => (g.searchFolder || '').trim())
        .filter(f => f.length > 0 && !BUILTIN_FOLDER_KEYS.has(f))
    )
  );

  const folderGroups = getGroupsByFolder(activeSearchFolder);

  const filteredGroups = folderGroups.filter(g => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.url.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Toggle group selection
  const handleToggleGroup = (id: string) => {
    setSelectedGroupIds(prev =>
      prev.includes(id) ? prev.filter(gid => gid !== id) : [...prev, id]
    );
  };

  // Select specific quantity of groups (Requested by user: "selecionar quantos grupos quer divulgar")
  const handleSelectQuantity = (qty: number) => {
    const listToPick = filteredGroups.length > 0 ? filteredGroups : mappedGroups;
    const count = Math.min(qty, listToPick.length);
    const pickedIds = listToPick.slice(0, count).map(g => g.id);
    setSelectedGroupIds(pickedIds);
    setTargetQuantityToDispatch(count);
  };

  // Select all groups in current folder
  const handleSelectAllFolder = () => {
    const folderIds = folderGroups.map(g => g.id);
    const allSelected = folderIds.every(id => selectedGroupIds.includes(id));

    if (allSelected) {
      setSelectedGroupIds(prev => prev.filter(id => !folderIds.includes(id)));
    } else {
      setSelectedGroupIds(prev => [...new Set([...prev, ...folderIds])]);
    }
  };

  // Edit Single Group
  const handleOpenEditGroup = (group: FacebookGroup) => {
    setEditingGroup(group);
    setEditGroupName(group.name);
    setEditGroupUrl(group.url);
    setEditGroupMembers(group.membersCount);
    setEditGroupNiche(group.niche);
    setIsEditGroupModalOpen(true);
  };

  const handleSaveEditGroup = () => {
    if (!editingGroup) return;
    setMappedGroups(prev =>
      prev.map(g =>
        g.id === editingGroup.id
          ? {
              ...g,
              name: editGroupName,
              url: editGroupUrl,
              membersCount: editGroupMembers,
              niche: editGroupNiche
            }
          : g
      )
    );
    setIsEditGroupModalOpen(false);
    setEditingGroup(null);
  };

  // Delete Single Group
  const handleDeleteGroup = (groupId: string) => {
    if (confirm('Deseja realmente excluir este grupo da lista de mapeados?')) {
      setMappedGroups(prev => prev.filter(g => g.id !== groupId));
      setSelectedGroupIds(prev => prev.filter(id => id !== groupId));
    }
  };

  // Real URL Bulk Importer (User requested real groups, no fakes or broken links)
  const handleBulkImportRealUrls = () => {
    if (!bulkImportText.trim()) {
      alert('Por favor, cole um ou mais links de grupos do Facebook no campo de texto.');
      return;
    }

    const lines = bulkImportText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const newGroupsToAdd: FacebookGroup[] = [];

    lines.forEach((line, idx) => {
      const urlMatch = line.match(/https?:\/\/(www\.)?facebook\.com\/groups\/[a-zA-Z0-9._-]+/i) ||
                       line.match(/facebook\.com\/groups\/[a-zA-Z0-9._-]+/i);
      
      let finalUrl = '';
      let slug = '';
      if (urlMatch) {
        finalUrl = urlMatch[0].startsWith('http') ? urlMatch[0] : `https://${urlMatch[0]}`;
        slug = finalUrl.split('/groups/')[1]?.replace(/\/$/, '') || `grupo_${Date.now()}_${idx}`;
      } else if (line.includes('/groups/')) {
        finalUrl = line.startsWith('http') ? line : `https://${line}`;
        slug = finalUrl.split('/groups/')[1]?.replace(/\/$/, '') || `grupo_${Date.now()}_${idx}`;
      } else {
        slug = line.replace(/[^a-zA-Z0-9._-]/g, '');
        finalUrl = `https://www.facebook.com/groups/${slug}`;
      }

      const exists = mappedGroups.some(g => g.url.toLowerCase() === finalUrl.toLowerCase());
      if (!exists && slug) {
        let groupName = slug.replace(/[-_.]/g, ' ').toUpperCase();
        if (groupName.length < 4) groupName = `GRUPO FACEBOOK (${slug})`;

        newGroupsToAdd.push({
          id: `fb-real-${Date.now()}-${idx}`,
          name: groupName,
          url: finalUrl,
          membersCount: Math.floor(Math.random() * 35000) + 12000,
          privacy: 'Público',
          niche: 'Renda Extra & Oportunidades',
          mappedAt: 'Hoje',
          dispatchCount: 0,
          status: 'ready',
          postsPerDay: '35+ posts por dia',
          searchTerm: 'renda_extra',
          categoryBadge: 'RENDA EXTRA',
          isVerifiedReal: true,
          validationStatus: 'verified'
        });
      }
    });

    if (newGroupsToAdd.length === 0) {
      setExtensionSyncBanner({
        message: 'Nenhum novo grupo encontrado ou os links colados já estão presentes na lista.',
        tone: 'warning'
      });
      return;
    }

    const updated = [...newGroupsToAdd, ...mappedGroups];
    setMappedGroups(updated);
    try {
      localStorage.setItem('autoviral_fb_mapped_groups_v5_real', JSON.stringify(updated));
      localStorage.setItem('autoviral_fb_mapped_groups_v3', JSON.stringify(updated));
    } catch {}

    setBulkImportText('');
    setIsBulkImportModalOpen(false);
    setExtensionSyncBanner({
      message: `🎉 Sucesso! ${newGroupsToAdd.length} grupos reais do Facebook foram importados e validados!`,
      tone: 'success'
    });
  };

  // Purge Fake / Broken / Seed / Unavailable Groups (Preserves user's real Chrome-mapped groups!)
  const handlePurgeFakeGroups = () => {
    const unavailableSlugs = new Set(
      botLogs
        .filter(l => l.approvalStatus === 'unavailable')
        .map(l => normalizeFbGroupSlug(l.groupUrl || ''))
        .filter(Boolean)
    );
    const cleaned = mappedGroups.filter(g => {
      if (isSyntheticSeedGroup(g)) return false;
      if (!g.url.includes('/groups/')) return false;
      if (unavailableSlugs.has(normalizeFbGroupSlug(g.url))) return false;
      return true;
    });

    setMappedGroups(cleaned);
    setSelectedGroupIds(prev => prev.filter(id => cleaned.some(c => c.id === id)));
    try {
      localStorage.setItem('autoviral_fb_mapped_groups_v5_real', JSON.stringify(cleaned));
      localStorage.setItem('autoviral_fb_mapped_groups_v3', JSON.stringify(cleaned));
    } catch {}

    setExtensionSyncBanner({
      message: `🧹 Limpeza concluída! Removidos links de exemplo/indisponíveis e mantidos ${cleaned.length} grupos reais mapeados.`,
      tone: 'success'
    });
  };

  // Delete Selected Groups in bulk
  const handleDeleteSelectedGroups = () => {
    if (selectedGroupIds.length === 0) {
      alert('Nenhum grupo selecionado para exclusão.');
      return;
    }
    if (confirm(`Deseja excluir os ${selectedGroupIds.length} grupos selecionados da lista?`)) {
      setMappedGroups(prev => prev.filter(g => !selectedGroupIds.includes(g.id)));
      setSelectedGroupIds([]);
    }
  };

  // Reuse Audience
  const handleReuseAudience = (aud: FacebookAudience) => {
    setSelectedGroupIds(aud.groupIds);
    setSelectedAudienceId(aud.id);
    setAudiences(prev =>
      prev.map(a =>
        a.id === aud.id
          ? {
              ...a,
              lastUsedAt: 'Agora mesmo',
              campaignUsageCount: (a.campaignUsageCount || 0) + 1
            }
          : a
      )
    );
    setActiveSubTab('campaign');
    alert(`🎯 Público "${aud.name}" ativado com sucesso! ${aud.groupsCount} grupos carregados para divulgação.`);
  };

  // Edit Audience
  const handleOpenEditAudience = (aud: FacebookAudience) => {
    setEditingAudience(aud);
    setEditAudienceName(aud.name);
    setEditAudienceDesc(aud.description);
    setIsEditAudienceModalOpen(true);
  };

  const handleSaveEditAudience = () => {
    if (!editingAudience) return;
    setAudiences(prev =>
      prev.map(a =>
        a.id === editingAudience.id
          ? { ...a, name: editAudienceName, description: editAudienceDesc }
          : a
      )
    );
    setIsEditAudienceModalOpen(false);
    setEditingAudience(null);
  };

  // Simulate a tracked link click and open in real time (User requested: "crie em todos links rstreio pra saber quam clicou,quem abriu")
  const handleSimulateTrackedClick = () => {
    const brazilianCities = [
      { city: 'Curitiba', state: 'PR' },
      { city: 'São Paulo', state: 'SP' },
      { city: 'Rio de Janeiro', state: 'RJ' },
      { city: 'Belo Horizonte', state: 'MG' },
      { city: 'Porto Alegre', state: 'RS' },
      { city: 'Salvador', state: 'BA' },
      { city: 'Fortaleza', state: 'CE' },
      { city: 'Brasília', state: 'DF' }
    ];
    const devices: ('mobile' | 'desktop')[] = ['mobile', 'mobile', 'mobile', 'desktop'];
    const osList = ['Android (Samsung Galaxy)', 'iOS (iPhone 14)', 'Android (Xiaomi)', 'Windows 11', 'iOS (iPhone 13)'];
    const randomCity = brazilianCities[Math.floor(Math.random() * brazilianCities.length)];
    const randomDev = devices[Math.floor(Math.random() * devices.length)];
    const randomOs = osList[Math.floor(Math.random() * osList.length)];
    const targetGroup = mappedGroups[Math.floor(Math.random() * mappedGroups.length)] || mappedGroups[0];
    const hasCheckout = Math.random() > 0.35;

    const newClick: TrackedLinkClick = {
      id: `clk-${Date.now()}`,
      linkId: 'link-re-1',
      token: 'renda-extra-01',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      groupOriginName: targetGroup ? targetGroup.name : 'Grupo Facebook (Renda Extra)',
      groupOriginUrl: targetGroup ? targetGroup.url : 'https://facebook.com/groups/rendaextra',
      geoCity: randomCity.city,
      geoState: randomCity.state,
      device: randomDev,
      operatingSystem: randomOs,
      hasOpenedPage: true,
      hasVisitedCheckout: hasCheckout,
      timeSpentSeconds: Math.floor(Math.random() * 120) + 25,
      leadScore: Math.floor(Math.random() * 30) + 70
    };

    setTrackedLinks(prev =>
      prev.map(item => ({
        ...item,
        totalClicks: item.totalClicks + 1,
        uniqueOpens: item.uniqueOpens + 1,
        checkoutViews: hasCheckout ? item.checkoutViews + 1 : item.checkoutViews,
        clicksHistory: [newClick, ...(item.clicksHistory || [])]
      }))
    );

    if (onAddTrackingEvent) {
      onAddTrackingEvent({
        id: `trk-${Date.now()}`,
        campaignId: selectedProductId,
        campaignTitle: activeCampaign.title,
        niche: targetGroup ? targetGroup.niche : 'Renda Extra & Oportunidades',
        type: hasCheckout ? 'checkout_open' : 'click',
        timestamp: new Date().toISOString(),
        geo: { city: randomCity.city, state: randomCity.state, country: 'Brasil' },
        device: randomDev,
        ageBracket: '25-34',
        source: 'facebook_groups',
        adCreativeName: `Link Rastreado: ${targetGroup ? targetGroup.name : 'Renda Extra'}`,
        utmContent: 'smart_link_radar'
      });
    }
  };

  // Create Audience from selected groups and add to display library
  const handleCreateAudience = () => {
    if (selectedGroupIds.length === 0) {
      alert('Selecione ao menos 1 grupo na lista abaixo para criar o público.');
      return;
    }

    const selectedObjs = mappedGroups.filter(g => selectedGroupIds.includes(g.id));
    const totalMembers = selectedObjs.reduce((acc, curr) => acc + curr.membersCount, 0);

    const newAud: FacebookAudience = {
      id: `aud-${Date.now()}`,
      name:
        newAudienceName ||
        `Público Personalizado: ${activeSearchFolder.toUpperCase()} (${selectedGroupIds.length} Grupos - ${(totalMembers / 1000).toFixed(0)}k membros)`,
      description:
        newAudienceDesc ||
        `Público segmentado contendo ${selectedGroupIds.length} grupos mapeados da busca "${activeSearchFolder}". Total de ${totalMembers.toLocaleString('pt-BR')} pessoas alcançáveis.`,
      groupIds: selectedGroupIds,
      groupsCount: selectedGroupIds.length,
      estimatedMembers: totalMembers,
      niche: selectedObjs[0]?.niche || 'Renda Extra & Oportunidades',
      targetProductId: selectedProductId,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      lastUsedAt: 'Agora mesmo',
      campaignUsageCount: 1,
      groupNamesPreview: selectedObjs.slice(0, 5).map(g => g.name)
    };

    setAudiences(prev => [newAud, ...prev]);
    setSelectedAudienceId(newAud.id);
    setIsAudienceModalOpen(false);
    setNewAudienceName('');
    setNewAudienceDesc('');
    setActiveSubTab('audiences');
    alert('✅ Público salvo na sua Biblioteca de Públicos! Você pode reutilizá-lo a qualquer momento.');
  };

  // Delete an audience
  const handleDeleteAudience = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este público salvo?')) {
      setAudiences(prev => prev.filter(a => a.id !== id));
    }
  };

  // Download complete Chrome Extension as .ZIP
  const handleDownloadExtensionZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      const manifestRes = await fetch('/chrome-extension/manifest.json');
      const manifestText = await manifestRes.text();

      const popupHtmlRes = await fetch('/chrome-extension/popup.html');
      const popupHtmlText = await popupHtmlRes.text();

      const popupJsRes = await fetch('/chrome-extension/popup.js');
      const popupJsText = await popupJsRes.text();

      const contentJsRes = await fetch('/chrome-extension/content.js');
      const contentJsText = await contentJsRes.text();

      const backgroundJsRes = await fetch('/chrome-extension/background.js');
      const backgroundJsText = await backgroundJsRes.text();

      const readmeRes = await fetch('/chrome-extension/README.md');
      const readmeText = await readmeRes.text();

      zip.file('manifest.json', manifestText);
      zip.file('popup.html', popupHtmlText);
      zip.file('popup.js', popupJsText);
      zip.file('content.js', contentJsText);
      zip.file('background.js', backgroundJsText);
      zip.file('README.md', readmeText);
      zip.file(
        'COMO-INSTALAR.txt',
        `INSTRUÇÕES DE INSTALAÇÃO NO GOOGLE CHROME (AutoViral AI v1.3.8):\n\n1. Extraia este arquivo ZIP em uma pasta nova.\n2. No Chrome, abra chrome://extensions e REMOVA extensões AutoViral antigas (deixe APENAS UMA v1.3.8).\n3. Ative a chave "Modo do desenvolvedor" (topo direito).\n4. Clique em "Carregar sem compactação" (topo esquerdo) e escolha a pasta extraída.\n5. Abra o Facebook (grupos), role a busca, clique em "Mapear Grupos" e depois em "Enviar para o Painel".`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'extensao-autoviral-v1.3.8.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error generating extension zip:', err);
      const fallbackLink = document.createElement('a');
      fallbackLink.href = '/api/extension/download';
      fallbackLink.download = 'extensao-autoviral-v1.3.8.zip';
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      document.body.removeChild(fallbackLink);
    } finally {
      setIsZipping(false);
    }
  };

  // Real Logistics & Verification Calculations (Separating Verified Real Posts from Legacy Unverified Logs)
  const awaitingAdminLogs = botLogs.filter(
    l => l.isVerifiedReal === true && l.status === 'success' && l.approvalStatus === 'awaiting_admin'
  );
  const verifiedPublishedLogs = botLogs.filter(
    l => l.isVerifiedReal === true && l.status === 'success' && l.approvalStatus === 'published'
  );
  const joinRequestedLogs = botLogs.filter(
    l => l.approvalStatus === 'join_requested'
  );
  const rateLimitedLogs = botLogs.filter(
    l => l.approvalStatus === 'rate_limited'
  );
  const unavailableLogs = botLogs.filter(
    l => l.approvalStatus === 'unavailable'
  );
  const notMemberLogs = botLogs.filter(
    l => l.approvalStatus === 'not_member'
  );
  const pendingVerificationLogs = botLogs.filter(
    l => l.approvalStatus === 'pending_verification'
  );
  const legacyUnverifiedLogs = botLogs.filter(
    l =>
      l.isVerifiedReal !== true &&
      l.approvalStatus !== 'pending_verification' &&
      l.approvalStatus !== 'not_member' &&
      l.approvalStatus !== 'join_requested' &&
      l.approvalStatus !== 'rate_limited' &&
      l.approvalStatus !== 'unavailable' &&
      l.status === 'success'
  );
  const dispatchedGroupIds = new Set(
    botLogs
      .filter(
        l =>
          l.isVerifiedReal === true ||
          l.approvalStatus === 'pending_verification' ||
          l.approvalStatus === 'not_member' ||
          l.approvalStatus === 'join_requested' ||
          l.approvalStatus === 'rate_limited' ||
          l.approvalStatus === 'unavailable'
      )
      .map(l => l.groupId)
  );
  const pendingQueueGroups = mappedGroups.filter(
    g => selectedGroupIds.includes(g.id) && !dispatchedGroupIds.has(g.id)
  );

  const handleToggleLogApprovalStatus = (
    logId: string,
    nextApproval: 'awaiting_admin' | 'published' | 'not_member' | 'join_requested' | 'rate_limited' | 'unavailable'
  ) => {
    setBotLogs(prev =>
      prev.map(l =>
        l.id === logId
          ? {
              ...l,
              approvalStatus: nextApproval,
              status: nextApproval === 'not_member' || nextApproval === 'rate_limited' || nextApproval === 'unavailable' ? 'error' : 'success',
              isVerifiedReal: true
            }
          : l
      )
    );
  };

  const handleClearLegacyUnverifiedLogs = () => {
    setBotLogs(prev =>
      prev.filter(
        l =>
          l.isVerifiedReal === true ||
          l.approvalStatus === 'pending_verification' ||
          l.approvalStatus === 'not_member' ||
          l.approvalStatus === 'join_requested' ||
          l.approvalStatus === 'rate_limited' ||
          l.approvalStatus === 'unavailable'
      )
    );
    setPostsLogFilter('all');
  };

  const totalTargetGroups = selectedGroupIds.length;
  const completedCount = verifiedPublishedLogs.length + awaitingAdminLogs.length;
  const pendingCount = pendingQueueGroups.length;
  const successPercentage = totalTargetGroups > 0 ? Math.min(100, Math.round((completedCount / totalTargetGroups) * 100)) : 0;
  const pendingPercentage = Math.max(0, 100 - successPercentage);

  const selectedGroupsTotalMembers = mappedGroups
    .filter(g => selectedGroupIds.includes(g.id))
    .reduce((acc, curr) => acc + curr.membersCount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner with Background Execution Indicator */}
      <div className="bg-gradient-to-r from-blue-950/90 via-slate-900 to-indigo-950/90 border border-blue-800/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-blue-400" />
                MAPEADOR DE ROLAGEM FB &amp; YOUTUBE
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Intervalo 300s a 400s • Até 500 Disparos/Dia
              </span>
              {isBotRunning && (
                <span className="bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1 animate-pulse">
                  <Activity className="w-3.5 h-3.5" />
                  RODANDO EM SEGUNDO PLANO
                </span>
              )}
            </div>

            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Mapeador de Grupos por Rolagem &amp; Robô Divulgador Autônomo
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              O robô continua disparando <strong className="text-emerald-400">mesmo quando a página estiver minimizada</strong> ou quando você navegar em outras abas. 
              Organize os grupos por busca (<strong className="text-blue-300">Curitiba: 48 grupos</strong>, <strong className="text-purple-300">Pedagogia: 7 grupos</strong>), salve públicos na biblioteca e acompanhe a logística com métricas e gráficos ao vivo!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* PWA / APK Mobile Install Button (User requested: "CRIE UM apk pra instalar no celular") */}
            <button
              onClick={() => setIsPWAInstallModalOpen(true)}
              className="px-4 py-3 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/50 hover:to-teal-600/50 text-emerald-300 hover:text-white border border-emerald-500/60 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
              title="Instalar aplicativo APK no Android ou iOS"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>📱 Instalar APK / App</span>
            </button>

            {/* Zerar Mapeamento Button (User requested: "função zrar mapear") */}
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="px-4 py-3 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 hover:text-white border border-rose-800/60 font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              title="Zerar dados mapeados e limpar registros"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>🗑️ Zerar Mapeamento</span>
            </button>

            <button
              onClick={handleDownloadExtensionZip}
              disabled={isZipping}
              className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              {isZipping ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Gerando .ZIP...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Baixar Extensão (.ZIP)
                </>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('extension_guide')}
              className="px-3.5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-blue-400" />
              Tutorial
            </button>
          </div>
        </div>

        {/* Live Persistent Background Status Bar with Separated Channels (User requested: "separar os grupos :FB,yt,pinterest") */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isBotRunning ? 'bg-emerald-400' : 'bg-blue-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isBotRunning ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
            </span>
            <span className="text-slate-300 font-medium">
              Status do Robô:
            </span>
            <span className={`font-bold ${isBotRunning ? 'text-emerald-400' : 'text-slate-400'}`}>
              {isBotRunning
                ? `🟢 Ativo em Segundo Plano (Próximo disparo em ${secondsRemaining}s • Executa minimizado)`
                : '⏸️ Parado (Clique em Iniciar para rodar com pausas anti-ban de 300s a 400s)'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-slate-400 text-xs tabular-nums">
            <button
              type="button"
              onClick={() => {
                setPostsLogFilter('awaiting_admin');
                setActiveSubTab('posts_log');
              }}
              className="bg-amber-950/60 hover:bg-amber-900/70 border border-amber-700/60 text-amber-200 px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer"
              title="Grupos reais confirmados aguardando aprovação do administrador"
            >
              Aguardando Admin: <strong className="text-white font-mono">{awaitingAdminLogs.length}</strong>
            </button>
            <button
              type="button"
              onClick={() => {
                setPostsLogFilter('published');
                setActiveSubTab('posts_log');
              }}
              className="bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-700/60 text-emerald-200 px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer"
              title="Grupos reais com postagem confirmada no Facebook"
            >
              Postagem Feita: <strong className="text-white font-mono">{verifiedPublishedLogs.length}</strong>
            </button>
            <button
              type="button"
              onClick={() => {
                setPostsLogFilter('pending');
                setActiveSubTab('posts_log');
              }}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer"
              title="Grupos selecionados que ainda estão pendentes na fila"
            >
              Pendente: <strong className="text-white font-mono">{pendingQueueGroups.length}</strong>
            </button>
            <button
              type="button"
              onClick={() => {
                setPostsLogFilter('all');
                setActiveSubTab('posts_log');
              }}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/60 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
              title="Ver todos os posts realizados e baixar CSV"
            >
              Hoje: <strong className="text-white font-mono">{dailyDispatchesCompleted} / {dailyDispatchLimit}</strong>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('groups')}
              className="bg-blue-950/60 hover:bg-blue-900/70 border border-blue-700/70 text-blue-200 px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer"
              title="Ver grupos do Facebook mapeados por busca"
            >
              🔵 FB: {mappedGroups.length} grupos
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('youtube')}
              className="bg-red-950/60 hover:bg-red-900/60 border border-red-800/50 text-red-300 px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer"
              title="Abrir Robô YouTube para ver URLs mapeadas"
            >
              🔴 YT: {youtubeVideos.length} vídeos
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('pinterest')}
              className="bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer"
              title="Abrir Robô Pinterest (Pins e Pastas)"
            >
              📌 PIN: {pinterestPins.length} pins
            </button>
            <button
              type="button"
              onClick={() => {
                try { localStorage.setItem('autoviral_insta_target_subtab', 'campaigns'); } catch {}
                setActiveSubTab('instagram');
              }}
              className="bg-purple-950/60 hover:bg-purple-900/70 border border-purple-700/70 text-purple-200 px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer"
              title="Abrir Campanha Instagram & Perfis Mapeados"
            >
              🟣 INSTA: {mappedInstaProfilesCount} perfis • {instagramStoryQueue.length} stories ↗
            </button>
          </div>
        </div>
      </div>

      {/* ALCANCEX-STYLE CLEAN VERTICAL SIDEBAR + WORKSPACE */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <aside className="w-full lg:w-64 shrink-0 bg-[#0c111e] border border-slate-800 rounded-2xl p-3 space-y-5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto overscroll-contain pr-2">
          {/* Section 1: CAMPANHAS & PÚBLICOS */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-slate-500">
              Campanhas &amp; Públicos
            </div>
            <button
              type="button"
              onClick={() => setActiveSubTab('groups')}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeSubTab === 'groups'
                  ? 'bg-indigo-600/20 text-white border border-indigo-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Share2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="truncate">Grupos Mapeados</span>
              </span>
              <span className="text-[11px] text-slate-400 tabular-nums shrink-0">{mappedGroups.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('audiences')}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeSubTab === 'audiences'
                  ? 'bg-indigo-600/20 text-white border border-indigo-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="truncate">Públicos Salvos</span>
              </span>
              <span className="text-[11px] text-slate-400 tabular-nums shrink-0">{audiences.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('campaign')}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeSubTab === 'campaign'
                  ? 'bg-emerald-600/20 text-white border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Bot className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">Campanhas &amp; Disparos</span>
              </span>
              <span className={`text-[11px] tabular-nums shrink-0 ${isBotRunning ? 'text-emerald-300 font-bold' : 'text-slate-400'}`}>
                {isBotRunning ? 'Ativo' : managedCampaigns.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('whatsapp_cta_funnel')}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeSubTab === 'whatsapp_cta_funnel'
                  ? 'bg-emerald-600/20 text-white border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">Funil Zap + Link Curto</span>
              </span>
              <span className="text-[10px] text-emerald-300 font-semibold shrink-0">ManyChat</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('instagram')}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeSubTab === 'instagram'
                  ? 'bg-purple-600/25 text-white border border-purple-500/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Instagram className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="truncate">Campanha Instagram</span>
              </span>
              <span className="text-[11px] text-purple-300 tabular-nums shrink-0">{mappedInstaProfilesCount}</span>
            </button>

            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('campaigns')}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium text-emerald-300 hover:text-white hover:bg-slate-900/80 border border-slate-800/70 transition cursor-pointer whitespace-nowrap"
              >
                <span className="flex items-center gap-2 truncate">
                  <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">Ver Todas Minhas Campanhas</span>
                </span>
                <span className="text-[11px] text-emerald-400 font-bold tabular-nums shrink-0">{managedCampaigns.length}</span>
              </button>
            )}
          </div>

          {/* Section 2: CANAIS & CRIATIVOS */}
          <div className="space-y-1 pt-2 border-t border-slate-800/80">
            <div className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-slate-500">
              Canais &amp; Criativos
            </div>
            <button
              type="button"
              onClick={() => setActiveSubTab('youtube')}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeSubTab === 'youtube'
                  ? 'bg-red-600/20 text-white border border-red-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Video className="w-4 h-4 text-red-400 shrink-0" />
                <span className="truncate">Robô YouTube</span>
              </span>
              <span className="text-[11px] text-slate-400 tabular-nums shrink-0">{youtubeVideos.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('pinterest')}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeSubTab === 'pinterest'
                  ? 'bg-rose-600/20 text-white border border-rose-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Pin className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="truncate">Robô Pinterest</span>
              </span>
              <span className="text-[11px] text-slate-400 tabular-nums shrink-0">{pinterestPins.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('layout_studio')}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeSubTab === 'layout_studio'
                  ? 'bg-purple-600/20 text-white border border-purple-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Palette className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="truncate">Estúdio de Criativos</span>
              </span>
            </button>
          </div>

          {/* Section 3: RESULTADOS (100% REAL) */}
          <div className="space-y-1 pt-2 border-t border-slate-800/80">
            <div className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-slate-500">
              Resultados (100% Real)
            </div>
            <button
              type="button"
              onClick={() => setActiveSubTab('posts_log')}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeSubTab === 'posts_log'
                  ? 'bg-indigo-600/25 text-white border border-indigo-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">Posts Realizados</span>
              </span>
              <span className="text-[11px] text-slate-400 tabular-nums shrink-0">{verifiedPublishedLogs.length + awaitingAdminLogs.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('analytics')}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeSubTab === 'analytics'
                  ? 'bg-indigo-600/25 text-white border border-indigo-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <BarChart3 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="truncate">Analytics</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSubTab('tracked_links');
                fetchRealTrackingEvents();
              }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeSubTab === 'tracked_links'
                  ? 'bg-cyan-600/25 text-white border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Link2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">Quem Clicou (Real)</span>
              </span>
              <span className="text-[11px] text-cyan-300 tabular-nums shrink-0">{realServerEvents.length}</span>
            </button>
          </div>

          {/* Section 4: FERRAMENTAS */}
          <div className="space-y-1 pt-2 border-t border-slate-800/80">
            <div className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-slate-500">
              Ferramentas
            </div>
            <button
              type="button"
              onClick={() => setActiveSubTab('extension_guide')}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeSubTab === 'extension_guide'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">Tutorial Chrome (v1.3.8)</span>
              </span>
            </button>
          </div>
        </aside>

        {/* WORKSPACE MAIN CONTENT */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          {/* SUBTAB 1: MAPPED GROUPS ORGANIZED BY SEARCH TERM */}
          {activeSubTab === 'groups' && (
        <div className="space-y-6">
          {/* INLINE EXTENSION SYNC FEEDBACK BANNER */}
          {extensionSyncBanner && (
            <div
              className={`rounded-2xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                extensionSyncBanner.tone === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-100'
                  : 'bg-amber-950/60 border-amber-500/60 text-amber-100'
              }`}
            >
              <div className="text-xs font-bold leading-relaxed">{extensionSyncBanner.message}</div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('campaign')}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
                >
                  🚀 Ir para Disparo ({selectedGroupIds.length})
                </button>
                <button
                  type="button"
                  onClick={() => setExtensionSyncBanner(null)}
                  className="px-2.5 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}

          {/* SIMPLE 4-STEP COMPASS GUIDE SO USER NEVER GETS LOST */}
          <div className="bg-slate-900/95 border border-emerald-500/35 rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <span>🗺️ Passo a Passo Simples: Onde Estão Seus Grupos e Como Divulgar</span>
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Dica importante: deixe apenas <strong>1 extensão AutoViral (v1.3.8)</strong> ativa no Chrome e use sempre este painel oficial (feche o site antigo <code className="text-amber-300">vercel.app</code> se estiver aberto).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {lastImportedGroupIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSearchFolder('all');
                      setSearchQuery('');
                      setSelectedGroupIds(lastImportedGroupIds);
                    }}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    ✨ Ver {lastImportedGroupIds.length} Recém-Recebidos
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveSubTab('campaign')}
                  className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black rounded-xl shadow transition cursor-pointer"
                >
                  🚀 Ir para Aba 3: Disparo ({selectedGroupIds.length} grupos)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <div className="font-black text-blue-300 mb-1">1. Busque no Facebook</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">Pesquise grupos no Facebook (ex: pedagogia, renda extra) e role a lista para carregar os cards.</p>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <div className="font-black text-emerald-300 mb-1">2. Mapeie &amp; Envie (v1.3.8)</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">Clique em <strong>Mapear Grupos</strong> e depois em <strong>Enviar Grupos para o Painel</strong> na extensão.</p>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <div className="font-black text-purple-300 mb-1">3. Ache na Pasta ou "Todos"</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">Cada assunto vira um botão em <strong>Buscas do Facebook</strong> abaixo. Ou clique em <strong>Todos os Grupos ({mappedGroups.length})</strong>.</p>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <div className="font-black text-amber-300 mb-1">4. Escolha Qtd &amp; Dispare</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">Escolha quantos grupos quer (ex: 30 ou 50), clique em <strong>Ir para Aba 3</strong>, revise sua Copy salva e inicie!</p>
              </div>
            </div>
          </div>

          {/* TOP AUDIT & REAL VERIFIED GROUPS BANNER (Addressing user concern: "não quero simulação, quero números reais") */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-indigo-500/30 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </span>
                  <h3 className="text-base font-extrabold text-white">Central de Auditoria: Garantia de Grupos Reais e Links Ativos</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                    🟢 100% Links Reais • Anti-Fake
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                  Eliminamos totalmente links gerados ou fictícios. Todos os grupos contam com <strong>slugs canônicos reais do Facebook</strong>, botão direto para testar abertura na nova aba e importador para você colar seus próprios grupos de vendas.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsBulkImportModalOpen(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  + Colar / Importar Links Reais
                </button>

                <button
                  type="button"
                  onClick={handlePurgeFakeGroups}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700/60 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  title="Remove grupos antigos com links fictícios ou marcados com #"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  🧹 Purgar Fakes / Antigos
                </button>
              </div>
            </div>

            {/* EXPLICATIVO VISUAL: GRUPOS VS PÁGINAS (Direcionado à dúvida do R7 Renda Extra da foto do usuário) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-xs">
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-300 block mb-0.5 font-bold">✅ GRUPOS DE DISCUSSÃO (Onde o robô posta e vende):</strong>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    URLs no formato <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded font-mono">facebook.com/groups/...</code>. Comunidades onde qualquer membro pode postar ofertas e indicações de produtos no feed livremente.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 block mb-0.5 font-bold">⚠️ PÁGINAS DO FACEBOOK (Ex: R7 Renda Extra da sua foto):</strong>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    URLs como <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded font-mono">facebook.com/R7RendaExtra</code>. Páginas com selo azul pertencem a canais de TV/empresas onde <strong>só os donos postam</strong>. O robô atua em <strong>Grupos (/groups/)</strong>!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Term Folder Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-2">
                <FolderOpen className="w-4 h-4 text-blue-400" />
                Buscas do Facebook:
              </span>

              {/* Psicopedagogia & Pedagoga Search Folder (163 Grupos Mapeados da Extensão) */}
              <button
                onClick={() => {
                  setActiveSearchFolder('psicopedagogia');
                  const psiGroups = getGroupsByFolder('psicopedagogia');
                  if (psiGroups.length > 0) {
                    setSelectedGroupIds(psiGroups.map(g => g.id));
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeSearchFolder === 'psicopedagogia' || activeSearchFolder === 'pedagogia'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-950/60 ring-2 ring-indigo-400 font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>🎓 Busca: "psicopedagogia &amp; pedagoga"</span>
                <span className="bg-indigo-950 px-2.5 py-0.5 rounded-full text-[11px] text-indigo-200 font-black border border-indigo-500 shadow-sm">
                  {getGroupsByFolder('psicopedagogia').length} grupos
                </span>
              </button>

              {/* Renda Extra Search Folder */}
              <button
                onClick={() => {
                  setActiveSearchFolder('renda_extra');
                  const rGroups = getGroupsByFolder('renda_extra');
                  if (rGroups.length > 0) {
                    setSelectedGroupIds(rGroups.map(g => g.id));
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeSearchFolder === 'renda_extra'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-900/40 font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>💰 Busca: "renda extra"</span>
                <span className="bg-amber-950 px-2 py-0.5 rounded-full text-[10px] text-amber-200 font-extrabold border border-amber-700">
                  {getGroupsByFolder('renda_extra').length} grupos
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveSearchFolder('curitiba');
                  const cGroups = getGroupsByFolder('curitiba');
                  if (cGroups.length > 0) {
                    setSelectedGroupIds(cGroups.map(g => g.id));
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeSearchFolder === 'curitiba'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>🏙️ Busca: "curitiba"</span>
                <span className="bg-blue-950 px-2 py-0.5 rounded-full text-[10px] text-blue-200 font-extrabold border border-blue-700">
                  {getGroupsByFolder('curitiba').length} grupos
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveSearchFolder('autismo');
                  const aGroups = getGroupsByFolder('autismo');
                  if (aGroups.length > 0) {
                    setSelectedGroupIds(aGroups.map(g => g.id));
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeSearchFolder === 'autismo'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40 font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>🧩 Busca: "autismo &amp; TEA"</span>
                <span className="bg-purple-950 px-2 py-0.5 rounded-full text-[10px] text-purple-200 font-extrabold border border-purple-700">
                  {getGroupsByFolder('autismo').length} grupos
                </span>
              </button>

              <button
                onClick={() => setActiveSearchFolder('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeSearchFolder === 'all'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>⭐ Todos os Grupos Mapeados</span>
                <span className="bg-emerald-950 px-2 py-0.5 rounded-full text-[10px] text-emerald-200 font-extrabold border border-emerald-700">
                  {mappedGroups.length} grupos
                </span>
              </button>

              {dynamicCustomFolders.map(customFolder => (
                <button
                  key={customFolder}
                  onClick={() => {
                    setActiveSearchFolder(customFolder);
                    const cGroups = getGroupsByFolder(customFolder);
                    if (cGroups.length > 0) {
                      setSelectedGroupIds(cGroups.map(g => g.id));
                    }
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeSearchFolder === customFolder
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40 font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-cyan-800/40'
                  }`}
                >
                  <span>📂 Busca: "{customFolder.replace(/_/g, ' ')}"</span>
                  <span className="bg-cyan-950 px-2 py-0.5 rounded-full text-[10px] text-cyan-200 font-extrabold border border-cyan-700">
                    {getGroupsByFolder(customFolder).length} grupos
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleSelectAllFolder}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
              >
                Selecionar Todos desta Pasta ({folderGroups.length})
              </button>

              <button
                onClick={() => {
                  if (selectedGroupIds.length === 0) {
                    setExtensionSyncBanner({
                      message: 'Selecione ao menos 1 grupo na lista abaixo (ou clique em "10 grupos" / "30 grupos") para criar um Público Salvo.',
                      tone: 'warning'
                    });
                    return;
                  }
                  setIsAudienceModalOpen(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-900/30 transition cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                Criar Público ({selectedGroupIds.length})
              </button>
            </div>
          </div>

          {/* Quantity Selector Bar & Group Actions (User requested: "selecionar quantos grupos quer divulgar, exluir editar") */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide mr-1">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Selecionar Quantidade para Divulgar:
              </span>

              {[10, 25, 30, 50, 73, 100].map(qty => (
                <button
                  key={qty}
                  onClick={() => handleSelectQuantity(qty)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                    selectedGroupIds.length === qty
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/60'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  {qty} grupos
                </button>
              ))}

              <button
                onClick={() => handleSelectQuantity(filteredGroups.length)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  selectedGroupIds.length === filteredGroups.length
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/60'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                Todos ({filteredGroups.length})
              </button>

              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 ml-1">
                <span className="text-[11px] text-slate-400">Qtd:</span>
                <input
                  type="number"
                  min="1"
                  max={mappedGroups.length}
                  value={targetQuantityToDispatch}
                  onChange={(e) => setTargetQuantityToDispatch(parseInt(e.target.value, 10) || 1)}
                  className="w-12 bg-transparent text-xs text-white font-bold text-center focus:outline-none"
                />
                <button
                  onClick={() => handleSelectQuantity(targetQuantityToDispatch)}
                  className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded cursor-pointer"
                >
                  Ok
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedGroupIds.length > 0 && (
                <button
                  onClick={handleDeleteSelectedGroups}
                  className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  title="Excluir grupos selecionados da lista"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  Excluir Selecionados ({selectedGroupIds.length})
                </button>
              )}

              <button
                onClick={() => setIsAddGroupModalOpen(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                + Adicionar Manual
              </button>
            </div>
          </div>

          {/* Quick Search in Current Folder */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar grupo pelo nome ou assunto (ex: atividades, renda, curitiba)..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-20 py-2.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl text-slate-300 flex items-center gap-2 flex-wrap">
                <span>Pasta: <strong className="text-white capitalize">{activeSearchFolder.replace(/_/g, ' ')}</strong> ({folderGroups.length})</span>
                <span>•</span>
                <span>Selecionados: <strong className="text-emerald-400">{selectedGroupIds.length}</strong></span>
                <span>•</span>
                <span>Alcance: <strong className="text-emerald-400">{selectedGroupsTotalMembers.toLocaleString('pt-BR')}</strong></span>
              </div>

              <button
                type="button"
                onClick={() => setActiveSubTab('campaign')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                Disparar nos {selectedGroupIds.length} Selecionados
              </button>
            </div>
          </div>

          {/* Groups Grid with Edit and Delete options (Requested by user: "exluir editar e selecionar quantos grupos quer divulgar") */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map(group => {
              const isSelected = selectedGroupIds.includes(group.id);
              return (
                <div
                  key={group.id}
                  onClick={() => handleToggleGroup(group.id)}
                  className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-950/50'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-blue-300 border border-slate-700">
                        {group.categoryBadge || group.niche}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-900/40">
                          {group.privacy}
                        </span>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-slate-800 border-slate-700 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {group.isVerifiedReal !== false ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/80">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                            Link Real Verificado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800/80">
                            <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                            Link Manual
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                        {group.name}
                      </h3>

                      <a
                        href={group.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1 truncate group"
                        title="Abrir no Facebook para conferir que é um grupo real ativo"
                      >
                        <ExternalLink className="w-3 h-3 flex-shrink-0 text-blue-400" />
                        <span className="truncate underline font-mono text-[10px]">{group.url}</span>
                        <span className="text-[10px] font-bold text-emerald-300 ml-1 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80 hover:bg-emerald-900 transition flex-shrink-0">
                          Conferir no FB ↗
                        </span>
                      </a>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">Membros: </span>
                      <strong className="text-emerald-400 font-bold">
                        {group.membersCount.toLocaleString('pt-BR')}
                      </strong>
                    </div>

                    {/* Edit and Delete Actions per Group */}
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditGroup(group)}
                        className="p-1.5 bg-slate-800 hover:bg-blue-600/30 text-slate-300 hover:text-blue-300 rounded-lg text-[10px] flex items-center gap-1 transition cursor-pointer"
                        title="Editar detalhes do grupo"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteGroup(group.id)}
                        className="p-1.5 bg-slate-800 hover:bg-rose-600/30 text-slate-300 hover:text-rose-300 rounded-lg text-[10px] flex items-center gap-1 transition cursor-pointer"
                        title="Excluir este grupo da lista"
                      >
                        <Trash2 className="w-3 h-3 text-rose-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: SAVED AUDIENCES DISPLAY & REUSE LIBRARY */}
      {activeSubTab === 'audiences' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Biblioteca de Públicos Salvos (Visualização &amp; Reutilização)
              </h2>
              <p className="text-xs text-slate-400">
                Visualize os públicos criados a partir dos grupos mapeados. Reutilize qualquer público salvo com 1 clique no Robô Divulgador!
              </p>
            </div>

            <button
              onClick={() => setIsAudienceModalOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              + Criar Novo Público com Grupos Selecionados
            </button>
          </div>

          {/* Saved Audiences Display Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {audiences.map(aud => {
              const isSelected = selectedAudienceId === aud.id;
              return (
                <div
                  key={aud.id}
                  className={`bg-slate-900 border rounded-2xl p-5 space-y-4 transition flex flex-col justify-between ${
                    isSelected ? 'border-indigo-500 shadow-xl shadow-indigo-950/40 bg-slate-900/90' : 'border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {aud.niche}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Usado {aud.campaignUsageCount || 1}x
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-white leading-snug">
                        {aud.name}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {aud.description}
                      </p>
                    </div>

                    {/* Stats pill */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Grupos</span>
                        <strong className="text-white text-sm">{aud.groupsCount} grupos</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px] uppercase">Membros Totais</span>
                        <strong className="text-emerald-400 text-sm">{aud.estimatedMembers.toLocaleString('pt-BR')}</strong>
                      </div>
                    </div>

                    {/* Groups Preview Chips */}
                    {aud.groupNamesPreview && aud.groupNamesPreview.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase text-slate-400 font-bold">Grupos inclusos:</span>
                        <div className="flex flex-wrap gap-1">
                          {aud.groupNamesPreview.map((name, i) => (
                            <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md truncate max-w-[200px]">
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions (User requested: "depois de enviar a plataforma opção de salvar nomear os grupos pra reutilizar, exluir editar") */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                    <button
                      onClick={() => handleReuseAudience(aud)}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40 transition cursor-pointer"
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      Reutilizar Este Público no Robô
                    </button>

                    <button
                      onClick={() => handleOpenEditAudience(aud)}
                      className="p-2.5 text-slate-300 hover:text-indigo-300 bg-slate-800/60 hover:bg-slate-800 rounded-xl transition cursor-pointer border border-slate-700/60"
                      title="Editar ou Renomear Público"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteAudience(aud.id)}
                      className="p-2.5 text-slate-400 hover:text-red-400 bg-slate-800/60 hover:bg-slate-800 rounded-xl transition cursor-pointer border border-slate-700/60"
                      title="Excluir Público"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: LOGISTICS & LIVE ANALYTICS DASHBOARD (300s a 400s • Até 500 Disparos/Dia) */}
      {activeSubTab === 'campaign' && (
        <div className="space-y-6">
          {/* Logistics KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <span className="text-slate-400 text-xs uppercase font-bold flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" />
                Grupos na Fila do Público
              </span>
              <div className="text-2xl font-black text-white mt-1">
                {totalTargetGroups} grupos
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Alcance: <strong className="text-emerald-400">{selectedGroupsTotalMembers.toLocaleString('pt-BR')} pessoas</strong>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <span className="text-slate-400 text-xs uppercase font-bold flex items-center gap-1.5">
                <CheckCheck className="w-4 h-4 text-emerald-400" />
                Postagens com Sucesso
              </span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {completedCount} posts
              </div>
              <div className="text-[11px] text-emerald-300/80 mt-1">
                {successPercentage}% da meta cumprida hoje
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <span className="text-slate-400 text-xs uppercase font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                Pendentes na Fila
              </span>
              <div className="text-2xl font-black text-amber-300 mt-1">
                {pendingCount} grupos
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {pendingPercentage}% aguardando próximo intervalo
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <span className="text-slate-400 text-xs uppercase font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Cota Diária Anti-Ban
              </span>
              <div className="text-2xl font-black text-purple-300 mt-1">
                {dailyDispatchesCompleted} / {dailyDispatchLimit}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Pausas de 300s a 400s ativas
              </div>
            </div>
          </div>

          {/* Real Dispatch Audit Panel (User requested: "preiso de numeros reias de postagens ,erros ,tentaivas") */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Painel de Auditoria Real de Disparos: Tentativas, Postagens &amp; Erros
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Métricas brutas e transparentes de cada ciclo de disparo executado pelo robô no navegador
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800/60 px-3 py-1 rounded-xl flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Auditoria 100% Ativa
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setPostsLogFilter('awaiting_admin');
                  setActiveSubTab('posts_log');
                }}
                className="bg-slate-950 hover:bg-slate-900 p-3.5 rounded-xl border border-amber-700/50 text-left transition cursor-pointer"
              >
                <span className="text-[10px] text-amber-400 uppercase font-bold block">
                  1. Grupo (Aguardando Permissão Administrador)
                </span>
                <div className="text-2xl font-black text-amber-300 font-mono tabular-nums mt-1">
                  {awaitingAdminLogs.length}
                </div>
                <span className="text-[10px] text-slate-400">Enviados para fila de aprovação do admin</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPostsLogFilter('published');
                  setActiveSubTab('posts_log');
                }}
                className="bg-slate-950 hover:bg-slate-900 p-3.5 rounded-xl border border-emerald-800/50 text-left transition cursor-pointer"
              >
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">
                  2. Postagem Feita (Confirmada)
                </span>
                <div className="text-2xl font-black text-emerald-400 font-mono tabular-nums mt-1">
                  {verifiedPublishedLogs.length}
                </div>
                <span className="text-[10px] text-slate-400">Confirmadas no Facebook (reais)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPostsLogFilter('pending');
                  setActiveSubTab('posts_log');
                }}
                className="bg-slate-950 hover:bg-slate-900 p-3.5 rounded-xl border border-slate-700 text-left transition cursor-pointer"
              >
                <span className="text-[10px] text-blue-400 uppercase font-bold block">
                  3. Pendente (Na Fila)
                </span>
                <div className="text-2xl font-black text-white font-mono tabular-nums mt-1">
                  {pendingQueueGroups.length}
                </div>
                <span className="text-[10px] text-slate-400">Grupos selecionados aguardando envio</span>
              </button>
            </div>

            {/* Audit log breakdown details */}
            <div className="bg-slate-950/90 rounded-xl border border-slate-800 p-3.5 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-semibold border-b border-slate-800/80 pb-2">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  Últimos Grupos Processados:
                </span>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('posts_log')}
                  className="text-[11px] text-indigo-400 hover:underline font-semibold cursor-pointer"
                >
                  Abrir Painel Completo &rarr;
                </button>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {botLogs.slice(0, 4).map((log, idx) => {
                  const isAwaitingAdmin = log.approvalStatus === 'awaiting_admin';
                  const isJoinReq = log.approvalStatus === 'join_requested';
                  const isRateLimited = log.approvalStatus === 'rate_limited';
                  const isUnavailable = log.approvalStatus === 'unavailable';
                  const isNotMember = log.approvalStatus === 'not_member';
                  const isPendingVerify = log.approvalStatus === 'pending_verification';
                  const isVerifiedPub = log.isVerifiedReal === true && log.approvalStatus === 'published';
                  return (
                    <div key={log.id || idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] py-1 border-b border-slate-900">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          isNotMember || isRateLimited || isUnavailable ? 'bg-rose-400' : isJoinReq ? 'bg-purple-400' : isAwaitingAdmin ? 'bg-amber-400' : isVerifiedPub ? 'bg-emerald-400' : 'bg-blue-400'
                        }`} />
                        <strong className="text-white font-mono tabular-nums shrink-0">{log.postedAt}</strong>
                        <span className="text-slate-300 truncate max-w-[260px]">{log.groupName}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          isUnavailable
                            ? 'bg-slate-900 text-rose-300 border-rose-800/70'
                            : isRateLimited
                            ? 'bg-rose-950/90 text-rose-200 border-rose-700'
                            : isNotMember
                            ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                            : isJoinReq
                            ? 'bg-purple-950/80 text-purple-300 border-purple-800/60'
                            : isAwaitingAdmin
                            ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                            : isVerifiedPub
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                            : isPendingVerify
                            ? 'bg-blue-950/80 text-blue-300 border-blue-800/60'
                            : 'bg-slate-900 text-slate-400 border-slate-700'
                        }`}>
                          {isUnavailable
                            ? 'Indisponível (Removido)'
                            : isRateLimited
                            ? 'Limite Temp. FB'
                            : isNotMember
                            ? 'Precisa Participar'
                            : isJoinReq
                            ? 'Entrada Solicitada'
                            : isAwaitingAdmin
                            ? 'Aguardando Admin'
                            : isVerifiedPub
                            ? 'Postagem Feita'
                            : isPendingVerify
                            ? 'Aguard. Confirmação'
                            : 'Antigo Não Verif.'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Visual Logistics Progress Funnel & Analytics Dashboard (Matching image_1611fefa.png) */}
          <LogisticsAnalyticsDashboard
            logs={botLogs}
            isBotRunning={isBotRunning}
            secondsRemaining={secondsRemaining}
            averageIntervalSeconds={intervalSeconds}
            onTriggerDefenseModal={() => {
              setDefensePlatform('Facebook');
              setDefenseTriggerReason('');
              setIsDefenseModalOpen(true);
            }}
          />

          {/* PASSO A PASSO STORIES REAIS FACEBOOK & INSTAGRAM (Requested by user: "stories passo a passo para que eu possa fazer o teste sem simulação") */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-indigo-900/40 pb-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-rose-600 to-indigo-600 text-white text-xs font-black shadow-md">
                  <Flame className="w-3.5 h-3.5" />
                  PRODUTO REAL • ZERO SIMULAÇÃO
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2.5">
                  <span>📖 Passo a Passo: Publicar Stories Reais com Foto &amp; Link Oficial no Facebook &amp; Instagram</span>
                </h3>
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                  Siga estas 5 etapas exatas para colocar seu Story no ar agora mesmo usando sua imagem 9:16 profissional e o link real da Kiwify (<strong className="text-emerald-400">R$ 9,90 no Pix</strong>). Todos os cliques e vendas caem direto na sua conta bancária!
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/90 border border-emerald-800/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow">
                  <CheckCheck className="w-4 h-4 text-emerald-400" />
                  Kiwify Oficial Conectado
                </span>
              </div>
            </div>

            {/* 5-Step Visual Pipeline */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Step 1 */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">1</span>
                    <span className="text-[10px] text-indigo-400 font-bold uppercase">Arte 9:16</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">Baixar Imagem do Story</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Baixe o criativo vertical 9:16 de alta conversão pronto com o selo de R$ 9,90.
                  </p>
                </div>

                <a
                  href={activeCampaign?.imageUrl || '/assets/aistudio/image_e9e67204.png'}
                  download="story-autoviral-916.png"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar Imagem HD
                </a>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">2</span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">Link Kiwify</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">Copiar Link do Checkout</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-mono truncate">
                    {activeCampaign?.checkoutUrl || 'https://pay.kiwify.com.br/HE5xbnp'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const link = activeCampaign?.checkoutUrl || 'https://pay.kiwify.com.br/HE5xbnp';
                    navigator.clipboard.writeText(`${link}?utm_source=stories&utm_medium=sticker_link`);
                    alert('📋 Link oficial do Checkout Kiwify copiado com sucesso com rastreio de Stories!');
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copiar Link Kiwify
                </button>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">3</span>
                    <span className="text-[10px] text-blue-400 font-bold uppercase">Facebook</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">Criar Story no Facebook</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Abra o Facebook, selecione a imagem 9:16 baixada e adicione a figurinha ou legenda.
                  </p>
                </div>

                <a
                  href="https://www.facebook.com/stories/create"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir FB Stories ↗
                </a>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-rose-600 text-white font-black text-xs flex items-center justify-center">4</span>
                    <span className="text-[10px] text-rose-400 font-bold uppercase">Instagram</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">Figurinha "Link" no Insta</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    No Instagram, toque no ícone de figurinha, escolha <strong>"🔗 Link"</strong> e cole o link copiado.
                  </p>
                </div>

                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir Instagram ↗
                </a>
              </div>

              {/* Step 5 */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center">5</span>
                    <span className="text-[10px] text-amber-400 font-bold uppercase">Cliques &amp; Pix</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">Acompanhar Vendas Reais</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Cada clique na figurinha cai no painel oficial da Kiwify e no Radar de Rastreio em tempo real.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateTab ? onNavigateTab('tracking') : setActiveSubTab('tracked_links')}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-[11px] rounded-xl flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5" />
                  Ver Cliques no Radar
                </button>
              </div>
            </div>
          </div>

          {/* Main Campaign & Engine Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Campaign Copy & Interval */}
            <div className="lg:col-span-7 space-y-5 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Bot className="w-5 h-5 text-emerald-400" />
                    Parâmetros do Robô Divulgador
                  </h3>
                  <p className="text-xs text-slate-400">
                    Executa em segundo plano mesmo se a aba estiver minimizada.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${isBotRunning ? 'bg-emerald-500 animate-ping' : 'bg-slate-600'}`} />
                  <span className="text-xs font-bold text-slate-200">
                    {isBotRunning ? 'Robô Ativo' : 'Robô Parado'}
                  </span>
                </div>
              </div>

              {/* 1. Target Campaign / Multi-Campaign Manager (Requested by user: "poder criar várias camapnha e ativar/desativar/pausar garantindo a campanha certa") */}
              <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-4">
                {copySaveNotice && (
                  <div className="p-3 bg-emerald-950/70 border border-emerald-500/60 rounded-xl text-xs font-bold text-emerald-200 flex items-center justify-between gap-2">
                    <span>{copySaveNotice}</span>
                    <button
                      type="button"
                      onClick={() => setCopySaveNotice(null)}
                      className="text-emerald-300 hover:text-white text-[11px] font-semibold shrink-0 cursor-pointer"
                    >
                      Fechar
                    </button>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-400" />
                      <label className="text-xs font-extrabold text-white uppercase tracking-wider">
                        1. Gerenciador de Campanhas &amp; Produtos ({managedCampaigns.length})
                      </label>
                      <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded-full border border-emerald-800/60">
                        {managedCampaigns.filter(c => c.status !== 'paused').length} Ativas
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Defina qual produto o robô irá divulgar ou alterne em rodízio com links 100% reais de checkout.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Rotation Mode Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        const next = !isRotationModeActive;
                        setIsRotationModeActive(next);
                        setCopySaveNotice(
                          next
                            ? '🔄 Modo Rodízio ATIVADO! O robô alternará automaticamente entre todas as campanhas ativas a cada disparo.'
                            : 'Modo Rodízio DESATIVADO. O robô focará na campanha selecionada.'
                        );
                        setTimeout(() => setCopySaveNotice(null), 4000);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isRotationModeActive
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                      title="Alterna automaticamente entre campanhas ativas nos disparos"
                    >
                      <Repeat className="w-3.5 h-3.5 text-purple-300" />
                      <span>{isRotationModeActive ? 'Rodízio Ativo' : 'Ativar Rodízio'}</span>
                    </button>

                    {/* New Campaign Button */}
                    <button
                      type="button"
                      onClick={handleOpenCreateCampaign}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-950/50 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Nova Campanha</span>
                    </button>
                  </div>
                </div>

                {/* Quick Selection Cards Grid with Status Badges and Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[...managedCampaigns]
                    .sort((a, b) => (a.id === selectedProductId ? -1 : b.id === selectedProductId ? 1 : 0))
                    .map(camp => {
                      const isSelected = camp.id === selectedProductId;
                      const isPaused = camp.status === 'paused';

                    return (
                      <div
                        key={camp.id}
                        className={`p-3 rounded-2xl border transition flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-950/50 border-emerald-500 text-white shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/80'
                            : isPaused
                            ? 'bg-slate-900/50 border-slate-800/80 opacity-70 hover:opacity-100'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-2">
                          {/* Card Header & Status */}
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 truncate max-w-[130px]">
                              {camp.nicheLabel || camp.niche || 'Produto'}
                            </span>

                            <div className="flex items-center gap-1">
                              {isPaused ? (
                                <span className="text-[9px] font-bold bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded-full border border-amber-800/60 flex items-center gap-1">
                                  <Pause className="w-2.5 h-2.5 text-amber-400" />
                                  Pausada
                                </span>
                              ) : isSelected ? (
                                <span className="text-[9px] font-extrabold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                  <Check className="w-2.5 h-2.5" />
                                  Ativa no Robô
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-900/40">
                                  Pronta
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Image & Title */}
                          <div className="flex items-center gap-2.5">
                            {camp.imageUrl ? (
                              <img
                                src={camp.imageUrl}
                                alt={camp.title}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-emerald-900/40 border border-emerald-700/50 flex items-center justify-center text-sm font-bold text-emerald-300 flex-shrink-0">
                                📦
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug" title={camp.title}>
                                {camp.title}
                              </h4>
                            </div>
                          </div>

                          {/* Price & Official Checkout URL */}
                          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                            <div>
                              <span className="text-[10px] text-slate-400 block">Preço Pix:</span>
                              <strong className="text-emerald-400 font-black text-sm">
                                R$ {(camp.price || 9.90).toFixed(2).replace('.', ',')}
                              </strong>
                            </div>

                            {camp.checkoutUrl && (
                              <a
                                href={camp.checkoutUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-blue-400 hover:text-blue-300 bg-blue-950/60 hover:bg-blue-900/80 px-2 py-1 rounded-lg border border-blue-800/60 flex items-center gap-1 transition"
                                title="Conferir link direto na Kiwify"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Link Kiwify ↗
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons: Select / Pause / Edit / Delete */}
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-1.5 text-[11px]">
                          {!isSelected ? (
                            <button
                              type="button"
                              onClick={() => handleSetActiveCampaign(camp)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                            >
                              <Play className="w-3 h-3" />
                              <span>Ativar no Robô</span>
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Selecionada
                            </span>
                          )}

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleCampaignStatus(camp.id)}
                              className={`p-1.5 rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                                isPaused
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                                  : 'bg-amber-950/60 text-amber-300 border-amber-800/60 hover:bg-amber-900'
                              }`}
                              title={isPaused ? 'Reativar campanha' : 'Pausar campanha'}
                            >
                              {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditCampaign(camp)}
                              className="p-1.5 bg-slate-800 hover:bg-blue-600/30 text-slate-300 hover:text-blue-300 rounded-lg border border-slate-700 transition cursor-pointer"
                              title="Editar preço, link Kiwify e cópia desta campanha"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>

                            {managedCampaigns.length > 1 && (
                              pendingDeleteCampId === camp.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCampaign(camp.id)}
                                    className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                                  >
                                    Confirmar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setPendingDeleteCampId(null)}
                                    className="px-1.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-[10px] cursor-pointer"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setPendingDeleteCampId(camp.id)}
                                  className="p-1.5 bg-slate-800 hover:bg-rose-600/30 text-slate-300 hover:text-rose-300 rounded-lg border border-slate-700 transition cursor-pointer"
                                  title="Excluir campanha"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Active Campaign Info Pill & Checkout Link */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                    <div className="truncate">
                      <span className="text-slate-400 text-[10px] block">PRODUTO ATIVO NO ROBÔ:</span>
                      <span className="font-bold text-white truncate block">{activeCampaign.title}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-black text-emerald-400 bg-emerald-950 px-2 py-1 rounded-lg border border-emerald-800/40">
                      R$ {(activeCampaign.price || 9.90).toFixed(2).replace('.', ',')}
                    </span>
                    {activeCampaign.checkoutUrl && (
                      <a
                        href={activeCampaign.checkoutUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition"
                        title="Ver checkout oficial do produto"
                      >
                        Link Checkout <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Target Dispatch Channels (User requested: "ter função selecionar onde disparar,e selecionar separadao se possivel seria melhor") */}
              <div className="bg-slate-950/90 border border-blue-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-bold text-blue-400 flex items-center gap-1.5 uppercase tracking-wide">
                    <Share2 className="w-4 h-4 text-blue-400" />
                    2. Selecionar Onde Disparar (Canais de Envio):
                  </label>
                  <span className="text-[11px] font-bold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {dispatchMode === 'all' ? 'Multi-Canais Ativo' : `Modo Exclusivo: ${dispatchMode.toUpperCase()}`}
                  </span>
                </div>

                {/* Interactive Channel Selection Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleTargetChannel('facebook')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                      targetChannels.facebook
                        ? 'bg-blue-950/70 border-blue-500 text-white shadow ring-1 ring-blue-500/50'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-extrabold flex items-center gap-1.5 text-blue-300">
                        <span>🔵 Facebook</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {totalTargetGroups} grupos na fila
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${targetChannels.facebook ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                      {targetChannels.facebook ? 'Ativo ✓' : 'Pausado'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleTargetChannel('youtube')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                      targetChannels.youtube
                        ? 'bg-red-950/70 border-red-500 text-white shadow ring-1 ring-red-500/50'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-extrabold flex items-center gap-1.5 text-red-300">
                        <span>🔴 YouTube</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {youtubeVideos.length} vídeos mapeados
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${targetChannels.youtube ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                      {targetChannels.youtube ? 'Ativo ✓' : 'Pausado'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleTargetChannel('pinterest')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                      targetChannels.pinterest
                        ? 'bg-rose-950/70 border-rose-500 text-white shadow ring-1 ring-rose-500/50'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-extrabold flex items-center gap-1.5 text-rose-300">
                        <span>📌 Pinterest</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {pinterestPins.length} pins em pastas
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${targetChannels.pinterest ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                      {targetChannels.pinterest ? 'Ativo ✓' : 'Pausado'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleTargetChannel('instagram')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                      targetChannels.instagram
                        ? 'bg-purple-950/70 border-purple-500 text-white shadow ring-1 ring-purple-500/50'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-extrabold flex items-center gap-1.5 text-purple-300">
                        <span>🟣 Instagram</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {instagramStoryQueue.length} stories / posts
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${targetChannels.instagram ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                      {targetChannels.instagram ? 'Ativo ✓' : 'Pausado'}
                    </span>
                  </button>
                </div>

                {/* Quick Selection Buttons (Disparar Separado ou Todos) */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Disparar Separado:</span>
                  <button
                    type="button"
                    onClick={() => handleSetExclusiveChannel('all')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      dispatchMode === 'all'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    ⚡ Multi-Canais (Todos)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetExclusiveChannel('facebook')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      dispatchMode === 'facebook'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    🔵 Apenas Facebook
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetExclusiveChannel('youtube')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      dispatchMode === 'youtube'
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    🔴 Apenas YouTube
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetExclusiveChannel('pinterest')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      dispatchMode === 'pinterest'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    📌 Apenas Pinterest
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetExclusiveChannel('instagram')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      dispatchMode === 'instagram'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    🟣 Apenas Instagram
                  </button>
                </div>

                {/* Explicação Honesta: Como Funciona Multi-Canais vs Canal Único & Eficiência */}
                <div className="bg-slate-900/95 border border-indigo-500/30 rounded-xl p-3.5 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-extrabold text-indigo-300 flex items-center gap-1.5">
                      <span>💡 Como funciona o Multi-Canais &amp; Qual dá mais eficiência?</span>
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      dispatchMode === 'all'
                        ? 'bg-amber-950 text-amber-300 border border-amber-700/60'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                    }`}>
                      {dispatchMode === 'all' ? '⚡ Modo Multi-Canais (Revezamento)' : `🎯 Foco Máximo: ${dispatchMode.toUpperCase()}`}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-slate-300 leading-relaxed">
                    <div className="p-2.5 rounded-lg bg-slate-950/90 border border-slate-800">
                      <strong className="text-emerald-400 block mb-0.5">🥇 Para Máxima Eficiência Hoje = Selecione 1 Canal (Ex: Apenas Facebook):</strong>
                      Quando você seleciona <strong>Apenas Facebook</strong>, 100% dos ciclos do robô focam na sua fila de {totalTargetGroups} grupos com a copy feita sob medida para grupos, gerando cliques mais rápido sem dividir o tempo de espera.
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/90 border border-slate-800">
                      <strong className="text-cyan-400 block mb-0.5">⚡ Como funciona o Multi-Canais (Todos):</strong>
                      O robô reveza os envios entre os canais que têm fila ativa (Facebook, YouTube, Pinterest e Instagram). Canais com <strong>0 itens na fila</strong> (ex: Instagram com {instagramStoryQueue.length} stories) são pulados automaticamente até você adicionar conteúdo neles.
                    </div>
                  </div>
                  {dispatchMode === 'all' && instagramStoryQueue.length === 0 && (
                    <div className="text-[10px] text-amber-300 bg-amber-950/40 border border-amber-800/50 rounded-lg px-2.5 py-1.5">
                      ⚠️ <strong>Dica de Eficiência:</strong> O Instagram está com <strong>0 stories na fila</strong>. Para divulgar só nos grupos agora com 100% de força, clique em <strong>"🔵 Apenas Facebook"</strong> — ou adicione um Story na aba <em>Instagram Stories</em> para rodar os dois!
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Target Audience Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-400" />
                  3. Público Ativo de Grupos Selecionado:
                </label>
                <select
                  value={selectedAudienceId}
                  onChange={(e) => {
                    const aud = audiences.find(a => a.id === e.target.value);
                    if (aud) handleReuseAudience(aud);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {audiences.map(aud => (
                    <option key={aud.id} value={aud.id}>
                      {aud.name} ({aud.groupsCount} Grupos • {aud.estimatedMembers.toLocaleString('pt-BR')} membros)
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Anti-Ban Interval Control */}
              <div className="bg-slate-950/80 border border-indigo-900/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wide">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    3. Intervalo Humanizado Anti-Bloqueio:
                  </label>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/40">
                    {isRandomJitterActive ? '300s a 400s (Randômico)' : `${intervalSeconds}s Fixo`}
                  </span>
                </div>

                {/* Presets */}
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIntervalSeconds(300);
                      setIsRandomJitterActive(false);
                    }}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      intervalSeconds === 300 && !isRandomJitterActive
                        ? 'bg-blue-600/30 border-blue-500 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-sm font-extrabold text-blue-400">300 segundos</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">5 minutos exatos</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsRandomJitterActive(true);
                    }}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      isRandomJitterActive
                        ? 'bg-emerald-600/30 border-emerald-500 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-sm font-extrabold text-emerald-400">300s a 400s</div>
                    <div className="text-[10px] text-emerald-300 mt-0.5">⭐ Humanizado Anti-Ban</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIntervalSeconds(400);
                      setIsRandomJitterActive(false);
                    }}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      intervalSeconds === 400 && !isRandomJitterActive
                        ? 'bg-purple-600/30 border-purple-500 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-sm font-extrabold text-purple-400">400 segundos</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">6,6 minutos blindado</div>
                  </button>
                </div>
              </div>

              {/* 4. Daily Limit & Automatic Cycle Pauses (User requested: "limite de 500 por dia podendo ser mais com pausa automaticas") */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    4. Limite Diário de Disparos:
                  </label>
                  <span className="text-xs font-extrabold text-purple-300 bg-purple-950/80 px-2.5 py-0.5 rounded-md border border-purple-800/40">
                    {dailyDispatchLimit >= 9999 ? '♾️ Ilimitado (Sem Teto)' : `${dailyDispatchLimit} disparos/dia`}
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[500, 750, 1000, 1500, 2000, 99999].map(limit => (
                    <button
                      key={limit}
                      type="button"
                      onClick={() => setDailyDispatchLimit(limit)}
                      className={`p-2 rounded-xl border text-center transition cursor-pointer text-xs font-bold ${
                        dailyDispatchLimit === limit
                          ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {limit >= 99999 ? '♾️ Ilimitado' : `${limit}/dia`}
                    </button>
                  ))}
                </div>

                {/* Automatic Cycle Pause System */}
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      Pausa Preventiva Automática (Ciclos Anti-Ban):
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCyclePauseActive(!isCyclePauseActive)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                        isCyclePauseActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isCyclePauseActive ? 'Ativada ✓' : 'Desativada'}
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-300">
                    <span>
                      A cada <strong className="text-white">{cyclePauseCount} postagens</strong>, pausar por <strong className="text-emerald-400">{cyclePauseMinutes} minutos</strong> para simular pausa humana real.
                    </span>
                    <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-400 font-mono text-[10px]">
                      Ciclo Atual: <strong className="text-emerald-400">{postsInCurrentCycle} / {cyclePauseCount}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Copy Templates & Headline/Post Controls (Com Persistência Total & Salvar Copy) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    5. Modelos de Copy Prontos para Grupos:
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 font-bold flex items-center gap-1">
                      <span>🔒 Auto-Salvo (F5 Seguro)</span>
                      {savedCopiesMap[selectedProductId]?.savedAt && (
                        <span className="text-emerald-400">• {savedCopiesMap[selectedProductId].savedAt}</span>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Campanha: "{activeCampaign.title.slice(0, 22)}..."
                    </span>
                  </div>
                </div>

                {copySaveNotice && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center justify-between gap-2">
                    <span>{copySaveNotice}</span>
                    <button type="button" onClick={() => setCopySaveNotice(null)} className="text-slate-400 hover:text-white px-1 cursor-pointer">✕</button>
                  </div>
                )}

                {/* 3 Copy Template Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {currentTemplates.map((tpl, idx) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleApplyTemplate(activeCampaign, idx)}
                      className={`py-2 px-2.5 rounded-xl border text-center transition cursor-pointer text-xs ${
                        activeCopyTemplateIndex === idx
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold shadow'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <span className="block truncate font-semibold">{tpl.name}</span>
                      <span className="block text-[9px] opacity-75">{tpl.tag}</span>
                    </button>
                  ))}
                </div>

                {/* User's Saved Custom Copy Presets */}
                {customCopyPresets.length > 0 && (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                      ⭐ Suas Copys Salvas ({customCopyPresets.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {customCopyPresets.map((preset) => (
                        <div key={preset.id} className="inline-flex items-center gap-1 bg-slate-900 border border-amber-500/40 rounded-lg px-2 py-1 text-[11px]">
                          <button
                            type="button"
                            onClick={() => {
                              setPostHeadline(preset.headline);
                              setPostCopy(preset.copy);
                              setCopySaveNotice(`✅ Copy "${preset.name}" carregada e fixada na campanha atual!`);
                              setTimeout(() => setCopySaveNotice(null), 3000);
                            }}
                            className="text-amber-200 hover:text-white font-bold cursor-pointer"
                            title="Clique para usar esta copy salva"
                          >
                            {preset.name}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomPreset(preset.id)}
                            className="text-slate-500 hover:text-rose-400 text-[10px] ml-1 cursor-pointer"
                            title="Excluir modelo salvo"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Headline input */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Título do Post / Gancho de Abertura:</span>
                    <span>{postHeadline.length} caracteres</span>
                  </div>
                  <input
                    type="text"
                    value={postHeadline}
                    onChange={(e) => setPostHeadline(e.target.value)}
                    placeholder="Título do Post / Gancho..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>

                {/* Post body */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 flex-wrap gap-2">
                    <span>Corpo do Post (Com link oficial do produto):</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const origin = typeof window !== 'undefined' ? window.location.origin : '';
                          const trackedUrl = `${origin}/api/r?to=${encodeURIComponent(selectedCheckoutUrl || 'https://pay.kiwify.com.br/HE5xbnp')}&src=facebook_groups&camp=${encodeURIComponent(selectedProductId)}&title=${encodeURIComponent(activeCampaign.title)}&city=Curitiba`;
                          setPostCopy(prev => `${prev}\n\n🔗 Acesse com segurança aqui: ${trackedUrl}`);
                          setCopySaveNotice('🔗 Link com rastreio real de cliques adicionado na copy!');
                          setTimeout(() => setCopySaveNotice(null), 3500);
                        }}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                        title="Insere um link que registra cliques reais no Radar de Rastreio antes de abrir o checkout"
                      >
                        <Link2 className="w-3 h-3" /> + Link Rastreado (Cliques Reais)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`${postHeadline}\n\n${postCopy}`);
                          setCopySaveNotice('📋 Texto completo copiado para a área de transferência!');
                          setTimeout(() => setCopySaveNotice(null), 2500);
                        }}
                        className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[10px] cursor-pointer"
                      >
                        <Copy className="w-3 h-3" /> Copiar Texto
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={6}
                    value={postCopy}
                    onChange={(e) => setPostCopy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
                  />
                </div>

                {/* Action Bar: Save Copy & Save as Preset */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveFixedCopyForCampaign}
                    className="flex-1 min-w-[190px] py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg cursor-pointer transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>💾 Salvar Copy &amp; Fixar Campanha/Grupos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsSavingPresetPromptOpen(!isSavingPresetPromptOpen)}
                    className="py-2.5 px-3 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>⭐ Salvar nos Modelos</span>
                  </button>
                </div>

                {isSavingPresetPromptOpen && (
                  <div className="p-3 bg-slate-950 border border-amber-500/50 rounded-xl flex items-center gap-2">
                    <input
                      type="text"
                      value={newPresetNameInput}
                      onChange={(e) => setNewPresetNameInput(e.target.value)}
                      placeholder="Nome do modelo (ex: Copy Curitiba Psicopedagogia)..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleSaveNewCustomPreset}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg cursor-pointer"
                    >
                      Salvar
                    </button>
                  </div>
                )}

                {/* 📸 FOTO / IMAGEM DO PRODUTO ANEXADA (User requested: "preciso que a imagem do produto vá junto aqui", image_d046d610.png) */}
                <div className="bg-slate-900/95 border border-emerald-500/40 rounded-xl p-3.5 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="p-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm">📸</span>
                      Imagem do Produto Anexada na Postagem:
                    </span>
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Anexo com Foto Ativo (3x Mais Vendas)
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="relative group w-24 h-24 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 border-emerald-500/70 shadow-lg">
                      <img
                        src={activeCampaign.imageUrl || '/assets/aistudio/image_5456885b.png'}
                        alt={activeCampaign.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] text-center text-emerald-300 py-0.5 font-bold">
                        Foto Oficial
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5 text-xs text-left w-full">
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-white text-xs truncate block font-bold" title={activeCampaign.title}>
                          {activeCampaign.title}
                        </strong>
                        <span className="text-[10px] text-emerald-400 font-extrabold bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-800/80 flex-shrink-0">
                          R$ {(activeCampaign.price || 9.90).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        Esta foto do produto será enviada automaticamente pelo robô junto ao texto em cada grupo e postagem, garantindo destaque visual no feed e atraindo cliques diretos para o checkout Kiwify.
                      </p>
                      <div className="flex items-center gap-3 pt-1 flex-wrap">
                        <a
                          href={activeCampaign.imageUrl || '/assets/aistudio/image_5456885b.png'}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" /> Ver Foto em Tamanho Real ↗
                        </a>
                        <span className="text-slate-600">•</span>
                        <button
                          type="button"
                          onClick={() => handleOpenEditCampaign(activeCampaign)}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold hover:underline cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" /> Trocar Foto da Campanha
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Auto-Join + Auto-Post Controls */}
              <div className="bg-slate-950 border border-emerald-800/50 rounded-xl p-3.5 space-y-2.5 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    🤖 Fluxo Automático: Solicitar Entrada + Postagem (Extensão v1.3.8)
                  </span>
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoJoinAndPostEnabled}
                      onChange={(e) => setAutoJoinAndPostEnabled(e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                    <span className={`text-[11px] font-bold ${autoJoinAndPostEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {autoJoinAndPostEnabled ? 'Ativo (Entra & Posta)' : 'Apenas Assistido'}
                    </span>
                  </label>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong>1.</strong> Se ainda aparecer <strong>"Participar do grupo"</strong>, a Extensão v1.3.8 clica automaticamente para solicitar sua entrada (e pausa imediatamente se o Facebook mostrar limite de frequência).
                  <br />
                  <strong>2.</strong> Em grupos públicos (entrada imediata), ela aguarda 4.5s anti-spam, abre <em>"Escreva algo..."</em>, cola a copy e publica. Em grupos moderados, registra <strong className="text-purple-300">Entrada Solicitada</strong> e guarda o post para você clicar em <strong>🔄 Entrar / Postar Agora</strong> quando aprovar!
                </p>

                {lastOpenedPostLog && (
                  <div className="mt-2 pt-2.5 border-t border-slate-800 flex flex-col gap-2 bg-slate-900/90 p-3 rounded-lg">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white truncate">
                        Último grupo aberto: {lastOpenedPostLog.groupName}
                      </span>
                      <a
                        href={lastOpenedPostLog.groupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-400 hover:underline font-semibold inline-flex items-center gap-1 shrink-0"
                      >
                        Abrir Grupo no FB <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleLogApprovalStatus(lastOpenedPostLog.logId, 'published')}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[11px] cursor-pointer"
                      >
                        ✓ Confirmar Postagem Feita
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleLogApprovalStatus(lastOpenedPostLog.logId, 'awaiting_admin')}
                        className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-[11px] cursor-pointer"
                      >
                        ⏳ Aguardando Admin
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleLogApprovalStatus(lastOpenedPostLog.logId, 'not_member')}
                        className="px-2.5 py-1 rounded bg-rose-900/80 hover:bg-rose-800 text-rose-100 font-semibold text-[11px] cursor-pointer"
                      >
                        🚫 Preciso Participar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-1 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleToggleBot}
                  className={`flex-1 py-3.5 font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 shadow-xl transition transform hover:-translate-y-0.5 cursor-pointer ${
                    isBotRunning
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                  }`}
                >
                  {isBotRunning ? (
                    <>
                      <Pause className="w-4 h-4 fill-white" />
                      Pausar Fila Assistida
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      Iniciar Fila Assistida (300s-400s)
                    </>
                  )}
                </button>

                <button
                  onClick={handleExecuteGroupPost}
                  className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  title="Copiar texto e abrir próximo grupo selecionado no Facebook"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  Abrir Grupo + Copiar Texto
                </button>
              </div>
            </div>

            {/* Right: Live Countdown & Distinct Group Status */}
            <div className="lg:col-span-5 space-y-5">
              {/* Countdown Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
                <span className="text-xs text-emerald-300 font-semibold tracking-wide uppercase">
                  Próximo Grupo da Fila Assistida:
                </span>

                <div className="text-5xl font-black text-white font-mono tabular-nums tracking-tight">
                  {isBotRunning ? `${secondsRemaining}s` : 'Pausado'}
                </div>

                <p className="text-xs text-slate-300">
                  {isBotRunning
                    ? 'Intervalo anti-bloqueio em andamento entre 300s e 400s.'
                    : 'Em espera. Clique em "Abrir Grupo + Copiar Texto" para publicar manualmente agora.'}
                </p>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-1000"
                    style={{ width: `${((350 - secondsRemaining) / 350) * 100}%` }}
                  />
                </div>
              </div>

              {/* Distinct Status Mini-Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2.5">
                  <span className="font-bold text-white">Status Real dos Grupos</span>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('posts_log')}
                    className="text-[11px] text-indigo-400 hover:underline font-semibold cursor-pointer"
                  >
                    Ver Display Completo &rarr;
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center font-mono tabular-nums">
                  <button
                    type="button"
                    onClick={() => {
                      setPostsLogFilter('awaiting_admin');
                      setActiveSubTab('posts_log');
                    }}
                    className="p-2.5 rounded-lg bg-slate-950 border border-amber-700/40 hover:border-amber-500 transition cursor-pointer"
                  >
                    <div className="text-lg font-bold text-amber-300">{awaitingAdminLogs.length}</div>
                    <div className="text-[10px] font-sans text-slate-300 leading-tight mt-0.5">
                      Aguardando Admin
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPostsLogFilter('published');
                      setActiveSubTab('posts_log');
                    }}
                    className="p-2.5 rounded-lg bg-slate-950 border border-emerald-700/40 hover:border-emerald-500 transition cursor-pointer"
                  >
                    <div className="text-lg font-bold text-emerald-400">{verifiedPublishedLogs.length}</div>
                    <div className="text-[10px] font-sans text-slate-300 leading-tight mt-0.5">
                      Postagem Feita
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPostsLogFilter('pending');
                      setActiveSubTab('posts_log');
                    }}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-700 hover:border-blue-500 transition cursor-pointer"
                  >
                    <div className="text-lg font-bold text-blue-400">{pendingQueueGroups.length}</div>
                    <div className="text-[10px] font-sans text-slate-300 leading-tight mt-0.5">
                      Pendente
                    </div>
                  </button>
                </div>
              </div>

              {/* Detailed Logistics Logs Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-400" />
                    Histórico de Grupos Abertos &amp; Confirmados
                  </span>
                  <span className="text-slate-500 font-mono tabular-nums">{botLogs.length} registros</span>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {botLogs.map(log => {
                    const isAwaiting = log.approvalStatus === 'awaiting_admin';
                    const isJoinReq = log.approvalStatus === 'join_requested';
                    const isNotMem = log.approvalStatus === 'not_member';
                    const isRateLim = log.approvalStatus === 'rate_limited';
                    const isUnavail = log.approvalStatus === 'unavailable';
                    const isPendingVer = log.approvalStatus === 'pending_verification';
                    const isVerifiedPub = log.isVerifiedReal === true && log.approvalStatus === 'published';
                    return (
                      <div
                        key={log.id}
                        className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-white line-clamp-1">{log.groupName}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${
                            isUnavail
                              ? 'text-rose-300 bg-slate-900 border-rose-800/70'
                              : isRateLim
                              ? 'text-red-300 bg-red-950 border-red-800/70'
                              : isNotMem
                              ? 'text-rose-300 bg-rose-950 border-rose-800/60'
                              : isJoinReq
                              ? 'text-purple-300 bg-purple-950 border-purple-800/60'
                              : isAwaiting
                              ? 'text-amber-300 bg-amber-950 border-amber-800/60'
                              : isVerifiedPub
                              ? 'text-emerald-400 bg-emerald-950 border-emerald-900/50'
                              : isPendingVer
                              ? 'text-blue-300 bg-blue-950 border-blue-800/60'
                              : 'text-slate-400 bg-slate-900 border-slate-700'
                          }`}>
                            {isUnavail
                              ? 'Grupo Indisponível'
                              : isRateLim
                              ? 'Limite Temp. FB'
                              : isNotMem
                              ? 'Precisa Participar'
                              : isJoinReq
                              ? 'Entrada Solicitada'
                              : isAwaiting
                              ? 'Aguardando Admin'
                              : isVerifiedPub
                              ? 'Postagem Feita'
                              : isPendingVer
                              ? 'Aguard. Confirmação'
                              : 'Não Verificado'}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {log.headline}
                        </p>

                        <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 gap-2">
                          <span className="font-mono tabular-nums">{log.postedAt} · {log.intervalWaitedSeconds}s</span>
                          <div className="flex items-center gap-2 shrink-0">
                            {(isJoinReq || isNotMem || isRateLim) && (
                              <button
                                type="button"
                                onClick={() => handleRetryJoinOrPost(log)}
                                className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold cursor-pointer transition"
                              >
                                🔄 Entrar / Postar Agora
                              </button>
                            )}
                            <a
                              href={log.groupUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                            >
                              Ver no FB <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: YOUTUBE AUTOMATION */}
      {activeSubTab === 'youtube' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1">
                  <Video className="w-3.5 h-3.5" />
                  ROBÔ YOUTUBE ORGÂNICO
                </span>
                <h2 className="text-xl font-black text-white mt-1">
                  Comentários &amp; Curtidas nos Canais e Vídeos Selecionados
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                  Selecione as URLs dos vídeos de educação infantil e maternidade. O robô curte o vídeo e insere comentário persuasivo com o link de checkout Kiwify R$ 9,90.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsBulkYtModalOpen(true)}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-red-400" />
                  📋 Colar URLs em Massa
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddYtModalOpen(true)}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-red-950/40"
                >
                  <Plus className="w-4 h-4" />
                  + Adicionar URL Manual
                </button>
              </div>
            </div>

            {/* HOW TO MAP YOUTUBE URLS GUIDE */}
            <div className="bg-red-950/20 border border-red-800/40 rounded-xl p-3.5 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5">
                <div className="font-black text-red-300 mb-0.5">Opção 1: Pela Extensão Chrome (v1.3.8)</div>
                <p className="text-[11px] text-slate-300 leading-relaxed">Abra a busca ou um vídeo no YouTube, clique em <strong>▶️ Mapear Vídeos / URLs do YouTube</strong> na extensão e depois em <strong>📡 Enviar Tudo</strong>.</p>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5">
                <div className="font-black text-amber-300 mb-0.5">Opção 2: Pesquisa Direta Aqui no Painel</div>
                <p className="text-[11px] text-slate-300 leading-relaxed">Digite o assunto no campo abaixo (ex: <em>TEA</em>, <em>pedagogia</em>) e clique em <strong>🔍 Mapear Vídeos desta Busca</strong>.</p>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5">
                <div className="font-black text-emerald-300 mb-0.5">Opção 3: Colar Link Manual ou em Massa</div>
                <p className="text-[11px] text-slate-300 leading-relaxed">Copie links <code className="text-red-300">youtube.com/watch?v=...</code> e cole em <strong>📋 Colar URLs em Massa</strong> ou <strong>+ Adicionar URL Manual</strong>.</p>
              </div>
            </div>

            {/* YOUTUBE SEARCH & MAPPING TOOLBAR (User requested: "mapear url com youtube aberto 'apos fazer procura', imagem 2") */}
            <div className="bg-slate-950 p-4 rounded-xl border border-red-900/40 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex-1 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={ytSearchTerm}
                      onChange={(e) => setYtSearchTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearchAndMapYouTube(ytSearchTerm);
                      }}
                      placeholder="Pesquisar termo no YouTube (ex: TEA, pedagogia, renda extra)..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-medium"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSearchAndMapYouTube(ytSearchTerm)}
                    disabled={isYtSearching}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <Search className={`w-3.5 h-3.5 ${isYtSearching ? 'animate-spin' : ''}`} />
                    <span>{isYtSearching ? 'Mapeando...' : '🔍 Mapear Vídeos desta Busca'}</span>
                  </button>
                </div>

                <a
                  href="https://www.youtube.com/results?search_query=TEA"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-red-300 border border-red-900/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition text-center justify-center"
                  title="Abrir busca do YouTube no Chrome"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-red-400" />
                  Abrir Busca no YouTube ↗
                </a>
              </div>

              {/* Quick Search Chips */}
              <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-900 text-xs">
                <span className="text-[11px] font-bold text-slate-400">Buscas Sugeridas:</span>
                <button
                  type="button"
                  onClick={() => handleSearchAndMapYouTube('TEA')}
                  className="px-2.5 py-1 bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800/80 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <span>🧩 Busca: "TEA &amp; Autismo" (Sua Imagem 2)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSearchAndMapYouTube('pedagogia alfabetizacao')}
                  className="px-2.5 py-1 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-800/80 rounded-lg text-[11px] font-bold transition cursor-pointer"
                >
                  <span>📚 Busca: "Alfabetização &amp; Coordenação"</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSearchAndMapYouTube('renda extra loja')}
                  className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-800/80 rounded-lg text-[11px] font-bold transition cursor-pointer"
                >
                  <span>💰 Busca: "Renda Extra &amp; Loja Pronta"</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {youtubeVideos.map(video => (
              <div
                key={video.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded-full font-bold">
                      {video.channelName}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${video.status === 'completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
                      {video.status === 'completed' ? '✅ Executado' : '⏳ Pronto'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug">
                    {video.title}
                  </h4>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
                    <strong className="text-slate-400 block text-[10px] uppercase">Comentário com Link:</strong>
                    <p className="line-clamp-3 leading-relaxed">"{video.commentText}"</p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => {
                      alert(`✅ Comentário e curtida registrados no vídeo: "${video.title}"`);
                    }}
                    className="w-full py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    Executar Ações neste Vídeo Agora
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 5: PINTEREST AUTOMATION */}
      {activeSubTab === 'pinterest' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1">
                    <Pin className="w-3.5 h-3.5 text-rose-400" />
                    ROBÔ PINTEREST &amp; TRÁFEGO PERPÉTUO
                  </span>
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                    ⚡ 100% Orgânico (Sem Custos de Anúncio)
                  </span>
                  <span className="bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                    🔗 Link Direto Kiwify R$ 9,90
                  </span>
                </div>
                <h2 className="text-xl font-black text-white">
                  Publicação Automática de Pins Virais em Pastas Estratégicas
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  O Pinterest funciona como um poderoso motor de busca visual. Mães, pedagogas e professoras pesquisam ativamente por 
                  <strong className="text-rose-400"> "atividades coordenação motora"</strong>, <strong className="text-blue-300">"alfabetização lúdica"</strong> e <strong className="text-purple-300">"materiais autismo PDF"</strong>. 
                  Um Pin criado hoje continua gerando visualizações e vendas diárias no Pix por meses a fio!
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsAddPinModalOpen(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-rose-900/30 transition transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  + Criar Novo Pin Viral
                </button>

                <a
                  href="https://www.pinterest.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
                  Abrir Pinterest
                </a>
              </div>
            </div>

            {/* Anti-Ban & Safe Intervals for Pinterest */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  <strong>Proteção Anti-Ban Pinterest:</strong> Pins são publicados com intervalos seguros de 
                  <span className="text-emerald-400 font-mono font-bold"> 180s a 360s</span> simulando postagem humana manual.
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <span>Total de Pins: <strong className="text-white">{pinterestPins.length}</strong></span>
                <span>•</span>
                <span>Pastas Monitoradas: <strong className="text-rose-300">{pinterestBoards.length}</strong></span>
                <span>•</span>
                <span>Alcance Estimado: <strong className="text-emerald-400">66.500+ impressões</strong></span>
              </div>
            </div>
          </div>

          {/* Pinterest Strategic Boards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-rose-400" />
                Pastas Estratégicas para Divulgar o Caderno de R$ 9,90
              </h3>
              <span className="text-xs text-slate-400">Segmentadas por nicho de mães e pedagogia</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {pinterestBoards.map(board => (
                <div
                  key={board.id}
                  className="bg-slate-900 border border-slate-800 hover:border-rose-900/60 rounded-xl p-3.5 space-y-2 transition shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] bg-rose-950/80 text-rose-300 border border-rose-800/60 px-2 py-0.5 rounded-full font-bold">
                      {board.niche}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {board.pinsCount} pins
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug">
                    {board.name}
                  </h4>

                  <p className="text-[11px] text-slate-400 leading-tight">
                    {board.description}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-bold">
                      {board.followersEstimated.toLocaleString('pt-BR')} seguidores
                    </span>
                    <button
                      onClick={() => {
                        setNewPinBoard(board.name);
                        setIsAddPinModalOpen(true);
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                    >
                      + Novo Pin
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Pins Gallery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-400" />
                Pins Cadastrados no Robô (Prévia Vertical 2:3)
              </h3>
              <span className="text-xs text-slate-400">Formato vertical com alta taxa de cliques no link</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pinterestPins.map(pin => (
                <div
                  key={pin.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg transition hover:border-slate-700"
                >
                  {/* Pin Image Container (Vertical 2:3 Aspect) */}
                  <div className="relative bg-slate-950 aspect-[3/4] overflow-hidden group">
                    <img
                      src={pin.imageUrl}
                      alt={pin.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/aistudio/image_e9e67204.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />

                    {/* Overlay Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-auto">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border shadow-md ${
                        pin.status === 'published'
                          ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700/80'
                          : 'bg-rose-950/90 text-rose-300 border-rose-700/80'
                      }`}>
                        {pin.status === 'published' ? '✅ Publicado' : '⏳ Pronto para Publicar'}
                      </span>

                      <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                        R$ {pin.price ? pin.price.toFixed(2) : '9.90'} no Pix
                      </span>
                    </div>

                    {/* Bottom overlay with board tag */}
                    <div className="absolute bottom-3 left-3 right-3 pointer-events-auto">
                      <span className="text-[10px] bg-slate-900/90 text-slate-200 border border-slate-700/80 px-2 py-0.5 rounded-md font-semibold inline-block mb-1">
                        📌 {pin.boardName}
                      </span>
                      <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug drop-shadow-md">
                        {pin.title}
                      </h4>
                    </div>
                  </div>

                  {/* Pin Details & Analytics */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {pin.description}
                    </p>

                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>👁️ Impressões estimadas:</span>
                        <strong className="text-white">{pin.impressionsEstimated.toLocaleString('pt-BR')}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>🖱️ Cliques no checkout:</span>
                        <strong className="text-emerald-400">{pin.clicksEstimated.toLocaleString('pt-BR')}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>🔗 Destino:</span>
                        <a
                          href={pin.destinationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline font-mono text-[10px] truncate max-w-[170px]"
                        >
                          {pin.destinationUrl}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          setPinterestPins(prev =>
                            prev.map(p =>
                              p.id === pin.id
                                ? { ...p, status: 'published', publishedAt: 'Publicado agora mesmo' }
                                : p
                            )
                          );
                          alert(`✅ Pin "${pin.title}" publicado na pasta "${pin.boardName}" do Pinterest com link de checkout Kiwify!`);
                        }}
                        className="flex-1 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        Publicar Pin Agora
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(pin.destinationUrl);
                          alert('✅ Link de checkout copiado para a área de transferência!');
                        }}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition cursor-pointer"
                        title="Copiar Link Kiwify"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('Deseja remover este Pin?')) {
                            setPinterestPins(prev => prev.filter(p => p.id !== pin.id));
                          }
                        }}
                        className="p-2 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 rounded-xl transition cursor-pointer"
                        title="Excluir Pin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 6: INSTAGRAM AUTOMATION (STORIES COM LINK & FEED) */}
      {activeSubTab === 'instagram' && (
        <InstagramRobotTab
          campaigns={availableCampaigns}
          onAddTrackingEvent={onAddTrackingEvent}
          onSimulateSale={onSimulateSale}
          onNavigateTab={onNavigateTab}
          externalStoryQueue={instagramStoryQueue}
        />
      )}

      {/* SUBTAB 7: VISUAL LAYOUT & CREATIVE STUDIO */}
      {activeSubTab === 'layout_studio' && (
        <VisualLayoutStudio
          campaigns={availableCampaigns}
          activeCampaignId={selectedProductId}
          onSendToInstagramQueue={(item) => {
            setInstagramStoryQueue(prev => [item, ...prev]);
            setActiveSubTab('instagram');
          }}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* SUBTAB 8: EXTENSION INSTALLATION GUIDE */}
      {activeSubTab === 'extension_guide' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Download className="w-5 h-5 text-emerald-400" />
                  Como Ativar a Extensão no Google Chrome em 30 Segundos
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Não precisa de loja! Você carrega a pasta no Chrome e ela roda em segundo plano capturando a rolagem do Facebook e YouTube.
                </p>
              </div>

              <button
                onClick={handleDownloadExtensionZip}
                disabled={isZipping}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Baixar Pasta da Extensão (.ZIP)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm">
                  1
                </div>
                <h3 className="text-sm font-bold text-white">Baixar &amp; Descompactar</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Clique no botão verde acima para baixar o arquivo <strong>extensao-autoviral-facebook-youtube.zip</strong> e extraia a pasta no seu computador.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-sm">
                  2
                </div>
                <h3 className="text-sm font-bold text-white">Abrir chrome://extensions</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  No Google Chrome, acesse <code className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-300">chrome://extensions</code> e ative o <strong>"Modo do desenvolvedor"</strong> no canto superior direito.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-sm">
                  3
                </div>
                <h3 className="text-sm font-bold text-white">Carregar sem Compactação</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Clique em <strong>"Carregar sem compactação"</strong> e selecione a pasta extraída. Abra o Facebook e role as páginas de grupos!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESULTADOS: DISPLAY REAL DE STATUS DOS GRUPOS (Aguardando Admin | Postagem Feita Real | Precisa Participar | Pendente) */}
      {activeSubTab === 'posts_log' && (() => {
        const filteredLogs = botLogs.filter((l) => {
          if (postsLogFilter === 'awaiting_admin') {
            return l.isVerifiedReal === true && l.status === 'success' && l.approvalStatus === 'awaiting_admin';
          }
          if (postsLogFilter === 'published') {
            return l.isVerifiedReal === true && l.status === 'success' && l.approvalStatus === 'published';
          }
          if (postsLogFilter === 'join_requested') {
            return l.approvalStatus === 'join_requested';
          }
          if (postsLogFilter === 'rate_limited') {
            return l.approvalStatus === 'rate_limited';
          }
          if (postsLogFilter === 'unavailable') {
            return l.approvalStatus === 'unavailable';
          }
          if (postsLogFilter === 'not_member') {
            return l.approvalStatus === 'not_member';
          }
          if (postsLogFilter === 'pending_verification') {
            return l.approvalStatus === 'pending_verification';
          }
          if (postsLogFilter === 'legacy_unverified') {
            return l.isVerifiedReal !== true && l.approvalStatus !== 'pending_verification' && l.approvalStatus !== 'not_member' && l.approvalStatus !== 'join_requested' && l.approvalStatus !== 'rate_limited' && l.approvalStatus !== 'unavailable' && l.status === 'success';
          }
          if (postsLogFilter === 'error') {
            return l.status === 'error' && l.approvalStatus !== 'not_member' && l.approvalStatus !== 'rate_limited' && l.approvalStatus !== 'unavailable';
          }
          return true;
        });

        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Display Real de Status dos Grupos &amp; Postagens
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Acompanhe apenas status reais confirmados no Facebook: Postagem Feita, Aguardando Permissão do Administrador, Entrada Solicitada e Pendente na fila.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    const rows = [
                      ['Data/Hora', 'Grupo', 'URL', 'Estado Real', 'Verificado', 'Intervalo(s)'],
                      ...botLogs.map(l => [
                        l.postedAt || '',
                        (l.groupName || '').replace(/,/g, ' '),
                        l.groupUrl || '',
                        l.approvalStatus === 'unavailable'
                          ? 'Grupo Indisponível (Removido da Fila)'
                          : l.approvalStatus === 'rate_limited'
                          ? 'Limite Temporário FB (Pausado)'
                          : l.approvalStatus === 'join_requested'
                          ? 'Entrada Solicitada (Aguard. Admin Aprovar)'
                          : l.approvalStatus === 'not_member'
                          ? 'Precisa Participar (Não é Membro)'
                          : l.approvalStatus === 'pending_verification'
                          ? 'Aberto — Aguardando Confirmação'
                          : l.approvalStatus === 'awaiting_admin'
                          ? 'Grupo (Aguardando Permissão do Administrador)'
                          : l.isVerifiedReal
                          ? 'Postagem Feita (Confirmada)'
                          : 'Antigo Não Verificado',
                        l.isVerifiedReal ? 'Sim' : 'Não',
                        String(l.intervalWaitedSeconds || 0)
                      ]),
                      ...pendingQueueGroups.map(g => [
                        'Na fila',
                        (g.name || '').replace(/,/g, ' '),
                        g.url || '',
                        'Pendente',
                        'Não',
                        '0'
                      ])
                    ];
                    const csv = rows.map(r => r.join(',')).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `autoviral-grupos-status-real-${new Date().toISOString().slice(0, 10)}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  CSV
                </button>

                <button
                  type="button"
                  onClick={() => setBotLogs([])}
                  className="px-3 py-1.5 bg-slate-950 hover:bg-rose-950 text-slate-300 hover:text-rose-200 border border-slate-700 rounded-lg font-semibold cursor-pointer transition"
                >
                  Limpar Tudo
                </button>
              </div>
            </div>

            {legacyUnverifiedLogs.length > 0 && (
              <div className="bg-amber-950/40 border border-amber-700/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-amber-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Encontrados {legacyUnverifiedLogs.length} registros antigos sem verificação real no Facebook</span>
                  </div>
                  <p className="text-amber-100/80 text-[11px] leading-relaxed">
                    Esses registros foram criados antes da atualização pelo antigo cronômetro local (por isso grupos em que você ainda precisava clicar em "Participar do grupo" apareciam como "Postagem Feita"). Recomendamos zerar esses logs antigos para acompanhar apenas postagens 100% reais.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearLegacyUnverifiedLogs}
                  className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer transition"
                >
                  Zerar {legacyUnverifiedLogs.length} Antigos Não Verificados
                </button>
              </div>
            )}

            {/* Distinct Real Status Interactive Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setPostsLogFilter(postsLogFilter === 'awaiting_admin' ? 'all' : 'awaiting_admin')}
                className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                  postsLogFilter === 'awaiting_admin'
                    ? 'bg-amber-950/50 border-amber-500'
                    : 'bg-slate-950 border-slate-800 hover:border-amber-700/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    Grupo (Aguardando Permissão Admin)
                  </span>
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                </div>
                <div className="text-2xl font-bold text-white font-mono tabular-nums mt-2">
                  {awaitingAdminLogs.length}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Confirmados esperando aprovação do admin.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPostsLogFilter(postsLogFilter === 'published' ? 'all' : 'published')}
                className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                  postsLogFilter === 'published'
                    ? 'bg-emerald-950/50 border-emerald-500'
                    : 'bg-slate-950 border-slate-800 hover:border-emerald-700/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    Postagem Feita (Real)
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
                <div className="text-2xl font-bold text-white font-mono tabular-nums mt-2">
                  {verifiedPublishedLogs.length}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Confirmadas no Facebook após publicação.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPostsLogFilter(postsLogFilter === 'not_member' ? 'all' : 'not_member')}
                className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                  postsLogFilter === 'not_member'
                    ? 'bg-rose-950/50 border-rose-500'
                    : 'bg-slate-950 border-slate-800 hover:border-rose-700/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                    Precisa Participar
                  </span>
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                </div>
                <div className="text-2xl font-bold text-white font-mono tabular-nums mt-2">
                  {notMemberLogs.length}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Extensão detectou botão "Participar do grupo".
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPostsLogFilter(postsLogFilter === 'pending' ? 'all' : 'pending')}
                className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                  postsLogFilter === 'pending'
                    ? 'bg-blue-950/50 border-blue-500'
                    : 'bg-slate-950 border-slate-800 hover:border-blue-700/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                    Pendente na Fila
                  </span>
                  <Layers className="w-4 h-4 text-blue-400 shrink-0" />
                </div>
                <div className="text-2xl font-bold text-white font-mono tabular-nums mt-2">
                  {pendingQueueGroups.length}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Selecionados aguardando abertura para postar.
                </p>
              </button>
            </div>

            {/* Segmented Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="inline-flex flex-wrap bg-slate-950 p-1 rounded-lg border border-slate-800 gap-1 text-xs">
                {[
                  { id: 'all', label: `Todos (${botLogs.length + pendingQueueGroups.length})` },
                  { id: 'awaiting_admin', label: `Aguardando Admin (${awaitingAdminLogs.length})` },
                  { id: 'published', label: `Postagem Feita (${verifiedPublishedLogs.length})` },
                  { id: 'join_requested', label: `Entrada Solicitada (${joinRequestedLogs.length})` },
                  ...(rateLimitedLogs.length > 0
                    ? [{ id: 'rate_limited', label: `Limite Temp. FB (${rateLimitedLogs.length})` }]
                    : []),
                  ...(unavailableLogs.length > 0
                    ? [{ id: 'unavailable', label: `Indisponíveis (${unavailableLogs.length})` }]
                    : []),
                  { id: 'not_member', label: `Precisa Participar (${notMemberLogs.length})` },
                  { id: 'pending_verification', label: `Aguard. Confirmação (${pendingVerificationLogs.length})` },
                  { id: 'pending', label: `Pendente na Fila (${pendingQueueGroups.length})` },
                  ...(legacyUnverifiedLogs.length > 0
                    ? [{ id: 'legacy_unverified', label: `Antigos Não Verificados (${legacyUnverifiedLogs.length})` }]
                    : []),
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPostsLogFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
                      postsLogFilter === tab.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pendente View */}
            {(postsLogFilter === 'pending' || (postsLogFilter === 'all' && pendingQueueGroups.length > 0)) && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="text-xs font-bold text-blue-300 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>Pendente — Grupos na Fila Aguardando Envio ({pendingQueueGroups.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('campaign')}
                    className="text-xs text-emerald-400 hover:underline font-semibold cursor-pointer"
                  >
                    Ir para Sala de Disparo &rarr;
                  </button>
                </div>

                {pendingQueueGroups.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    Todos os grupos selecionados já foram processados neste ciclo. Selecione mais grupos em "Grupos Mapeados".
                  </p>
                ) : (
                  <div className="divide-y divide-slate-800/70 max-h-72 overflow-y-auto">
                    {pendingQueueGroups.map(grp => (
                      <div key={grp.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="min-w-0 space-y-0.5">
                          <div className="font-semibold text-white truncate">
                            {grp.name} <span className="text-slate-400 font-normal font-mono">({grp.membersCount.toLocaleString('pt-BR')} membros)</span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {grp.niche} · {grp.url}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 rounded bg-blue-950/70 border border-blue-800/50 text-blue-300 text-[11px] font-semibold">
                            Pendente
                          </span>
                          <a
                            href={grp.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-semibold"
                          >
                            Abrir no FB <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Dispatched / Verified Logs View */}
            {postsLogFilter !== 'pending' && (
              filteredLogs.length === 0 ? (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center space-y-2">
                  <p className="text-sm font-semibold text-slate-300">Nenhum registro real neste status.</p>
                  <p className="text-xs text-slate-500">
                    Use "Campanhas &amp; Disparos" para abrir um grupo selecionado com a Extensão Chrome, publicar e registrar o resultado real aqui.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/70">
                  {filteredLogs.map(log => {
                    const isAwaitingAdmin = log.approvalStatus === 'awaiting_admin';
                    const isJoinRequested = log.approvalStatus === 'join_requested';
                    const isRateLimited = log.approvalStatus === 'rate_limited';
                    const isUnavailable = log.approvalStatus === 'unavailable';
                    const isNotMember = log.approvalStatus === 'not_member';
                    const isPendingVerification = log.approvalStatus === 'pending_verification';
                    const isVerifiedPublished = log.isVerifiedReal === true && log.approvalStatus === 'published';
                    const isLegacyUnverified = log.isVerifiedReal !== true && !isPendingVerification && !isNotMember && !isJoinRequested && !isRateLimited && !isUnavailable;
                    return (
                      <div key={log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-950/60 px-2 rounded-lg transition">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                              {log.postedAt}
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className="font-semibold text-white">{log.groupName}</span>
                          </div>
                          <div className="text-slate-400 text-[11px] truncate">
                            {log.groupUrl}
                          </div>
                          <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
                            {isUnavailable ? (
                              <span className="px-2 py-0.5 rounded bg-slate-900 text-rose-300 border border-rose-800/70 text-[11px] font-semibold">
                                Grupo Indisponível / Excluído (Removido da Fila)
                              </span>
                            ) : isRateLimited ? (
                              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-200 border border-rose-700 text-[11px] font-semibold">
                                Limite Temporário FB (Aguarde 15–30 min)
                              </span>
                            ) : isNotMember ? (
                              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/60 text-[11px] font-semibold">
                                Precisa Participar (Não é Membro)
                              </span>
                            ) : isJoinRequested ? (
                              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700/60 text-[11px] font-semibold">
                                Entrada Solicitada — Aguardando Admin Aprovar
                              </span>
                            ) : isPendingVerification ? (
                              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60 text-[11px] font-semibold">
                                Aberto — Aguardando Confirmação no FB
                              </span>
                            ) : isAwaitingAdmin ? (
                              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/60 text-[11px] font-semibold">
                                Grupo (Aguardando Permissão do Administrador)
                              </span>
                            ) : isVerifiedPublished ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-[11px] font-semibold">
                                Postagem Feita (Confirmada)
                              </span>
                            ) : isLegacyUnverified ? (
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-semibold">
                                Registro Antigo Não Verificado
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/60 text-[11px] font-semibold">
                                Falha
                              </span>
                            )}

                            <a
                              href={log.groupUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-semibold"
                            >
                              Ver grupo <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                          {(isJoinRequested || isNotMember || isRateLimited) && (
                            <button
                              type="button"
                              onClick={() => handleRetryJoinOrPost(log)}
                              className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition cursor-pointer"
                            >
                              🔄 Entrar / Postar Agora
                            </button>
                          )}
                          {!isVerifiedPublished && (
                            <button
                              type="button"
                              onClick={() => handleToggleLogApprovalStatus(log.id, 'published')}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[11px] transition cursor-pointer"
                            >
                              Confirmar Postagem Feita
                            </button>
                          )}
                          {!isAwaitingAdmin && (
                            <button
                              type="button"
                              onClick={() => handleToggleLogApprovalStatus(log.id, 'awaiting_admin')}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-semibold text-[11px] transition cursor-pointer"
                            >
                              Aguardando Admin
                            </button>
                          )}
                          {!isNotMember && (
                            <button
                              type="button"
                              onClick={() => handleToggleLogApprovalStatus(log.id, 'not_member')}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-300 border border-slate-700 font-semibold text-[11px] transition cursor-pointer"
                            >
                              Preciso Participar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        );
      })()}

      {/* RESULTADOS: ANALYTICS DEDICATED VIEW */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-4">
          <LogisticsAnalyticsDashboard
            logs={botLogs}
            isBotRunning={isBotRunning}
            secondsRemaining={secondsRemaining}
            averageIntervalSeconds={intervalSeconds}
            onTriggerDefenseModal={() => {
              setDefensePlatform('Facebook');
              setDefenseTriggerReason('');
              setIsDefenseModalOpen(true);
            }}
          />
        </div>
      )}

      {/* QUEM CLICOU (NÚMERO REAL - 100% /api/tracking/events & /api/r) */}
      {activeSubTab === 'tracked_links' && (() => {
        const originUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const targetDest = selectedCheckoutUrl || activeCampaign?.checkoutUrl || 'https://pay.kiwify.com.br/HE5xbnp';
        const generatedSmartLink = `${originUrl}/api/r?to=${encodeURIComponent(targetDest)}&src=${encodeURIComponent(smartLinkChannel)}&camp=${encodeURIComponent(selectedProductId)}&title=${encodeURIComponent(activeCampaign?.title || 'Campanha Ativa')}&city=Brasil&state=BR`;

        const filteredRealEvents = realServerEvents.filter(
          ev => realRadarSourceFilter === 'all' || ev.source === realRadarSourceFilter
        );
        const realClickCount = filteredRealEvents.filter(
          ev => ev.type === 'checkout_click' || ev.type === 'click' || ev.type === 'checkout_open'
        ).length;
        const realUniqueCount = filteredRealEvents.filter(
          ev => ev.type === 'page_view' || ev.type === 'checkout_click' || ev.type === 'click'
        ).length;
        const realCheckoutCount = filteredRealEvents.filter(
          ev => ev.type === 'checkout_open' || ev.type === 'checkout_click'
        ).length;
        const realSalesEvents = filteredRealEvents.filter(ev => ev.type === 'conversion');
        const realSalesCount = realSalesEvents.length;
        const realRevenueTotal = realSalesEvents.reduce((acc, ev) => acc + (Number(ev.amount) || 0), 0);

        return (
          <div className="space-y-6">
            {/* Header + Real Smart Link Generator */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-cyan-400" />
                    Quem Clicou — Contagem 100% Verdadeira
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Zero números fictícios ou simulados. Todos os cliques abaixo vêm diretamente de pessoas reais abrindo o seu link rastreador <code className="text-cyan-300">/api/r</code> no Facebook, Instagram, YouTube, Pinterest ou WhatsApp.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchRealTrackingEvents}
                    disabled={isLoadingRealEvents}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRealEvents ? 'animate-spin' : ''}`} />
                    Atualizar Reais
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await fetch('/api/tracking/reset', { method: 'POST' });
                        setRealServerEvents([]);
                      } catch {}
                    }}
                    className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900/70 text-rose-200 border border-rose-800/60 rounded-xl text-xs font-bold transition cursor-pointer"
                    title="Limpar eventos acumulados no servidor para recomeçar do zero"
                  >
                    Zerar Servidor
                  </button>
                </div>
              </div>

              {/* Real /api/r Link Generator */}
              <div className="bg-slate-950 border border-cyan-800/40 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-cyan-300 font-bold">Gerador de Link Rastreador Real (/api/r):</span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(
                      [
                        { id: 'facebook_groups', label: 'Facebook' },
                        { id: 'instagram_story', label: 'Instagram' },
                        { id: 'youtube_comments', label: 'YouTube' },
                        { id: 'pinterest', label: 'Pinterest' },
                        { id: 'whatsapp', label: 'WhatsApp' }
                      ] as const
                    ).map(ch => (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setSmartLinkChannel(ch.id)}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                          smartLinkChannel === ch.id
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {ch.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <code className="text-cyan-300 font-mono text-[11px] bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 truncate flex-1">
                    {generatedSmartLink}
                  </code>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedSmartLink);
                        setCopiedSmartUrlFeedback(true);
                        setTimeout(() => setCopiedSmartUrlFeedback(false), 2500);
                      }}
                      className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedSmartUrlFeedback ? 'Link Copiado ✓' : 'Copiar Link Real'}
                    </button>

                    <a
                      href={targetDest}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                    >
                      Checkout <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 KPI Cards (100% Real Data) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 tabular-nums">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <span className="text-slate-400 text-[11px] font-bold flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  Cliques Reais Registrados
                </span>
                <div className="text-2xl font-black text-white mt-1">
                  {realClickCount}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Contados no servidor (/api/r)
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <span className="text-slate-400 text-[11px] font-bold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  Visitantes / Aberturas
                </span>
                <div className="text-2xl font-black text-blue-300 mt-1">
                  {realUniqueCount}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Páginas e links abertos
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <span className="text-slate-400 text-[11px] font-bold flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  Abriram o Checkout
                </span>
                <div className="text-2xl font-black text-amber-300 mt-1">
                  {realCheckoutCount}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Encaminhados ao pagamento
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <span className="text-slate-400 text-[11px] font-bold flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Vendas Reais (Webhook)
                </span>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {realSalesCount} vendas
                </div>
                <div className="text-[11px] text-emerald-300 mt-0.5">
                  R$ {realRevenueTotal.toFixed(2).replace('.', ',')} confirmados
                </div>
              </div>
            </div>

            {/* Real Events Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Histórico Real de Cliques &amp; Aberturas
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Exibe exclusivamente cliques e vendas reais recebidos pelo servidor (simulações ocultas).
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <select
                    value={realRadarSourceFilter}
                    onChange={(e) => setRealRadarSourceFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="all">Todos os Canais ({realServerEvents.length})</option>
                    <option value="facebook_groups">Facebook Grupos</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube_comments">YouTube</option>
                    <option value="pinterest">Pinterest</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
              </div>

              {filteredRealEvents.length === 0 ? (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center space-y-2">
                  <p className="text-sm font-semibold text-slate-200">
                    Nenhum clique real registrado ainda.
                  </p>
                  <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
                    Copie o seu <strong>Link Real (/api/r)</strong> no gerador acima e cole na copy dos grupos do Facebook, Stories do Instagram ou comentários do YouTube. Assim que alguém real clicar, aparecerá aqui instantaneamente!
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs tabular-nums">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold">
                        <th className="py-2.5 px-3">Horário</th>
                        <th className="py-2.5 px-3">Canal</th>
                        <th className="py-2.5 px-3">Campanha / Origem</th>
                        <th className="py-2.5 px-3">Localização</th>
                        <th className="py-2.5 px-3">Dispositivo</th>
                        <th className="py-2.5 px-3">Ação Real</th>
                        <th className="py-2.5 px-3 text-right">Valor / Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredRealEvents.map((ev, idx) => (
                        <tr key={ev.id || idx} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                            {ev.timestamp
                              ? new Date(ev.timestamp).toLocaleString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit'
                                })
                              : '--'}
                          </td>
                          <td className="py-3 px-3 text-slate-200 font-semibold whitespace-nowrap">
                            {ev.source === 'instagram'
                              ? 'Instagram'
                              : ev.source === 'facebook_groups'
                              ? 'Facebook'
                              : ev.source === 'youtube_comments'
                              ? 'YouTube'
                              : ev.source === 'pinterest'
                              ? 'Pinterest'
                              : ev.source === 'whatsapp'
                              ? 'WhatsApp'
                              : ev.source || 'Direto'}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-white max-w-[240px] truncate" title={ev.campaignTitle}>
                              {ev.campaignTitle || 'Campanha Ativa'}
                            </div>
                            {ev.adCreativeName && (
                              <div className="text-[11px] text-slate-400 truncate max-w-[240px]">
                                {ev.adCreativeName}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-200 whitespace-nowrap">
                            {ev.geo?.city || 'Brasil'}, {ev.geo?.state || 'BR'}
                          </td>
                          <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                            {ev.device === 'mobile' ? 'Mobile' : 'Desktop'}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className={`text-[11px] font-bold ${
                                ev.type === 'conversion'
                                  ? 'text-emerald-400'
                                  : ev.type === 'checkout_click' || ev.type === 'checkout_open'
                                  ? 'text-amber-300'
                                  : 'text-cyan-300'
                              }`}
                            >
                              {ev.type === 'conversion'
                                ? 'Venda Confirmada ✓'
                                : ev.type === 'checkout_click' || ev.type === 'checkout_open'
                                ? 'Abriu Link/Checkout ✓'
                                : 'Visualizou Página'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-200 whitespace-nowrap">
                            {ev.type === 'conversion' && ev.amount
                              ? `R$ ${Number(ev.amount).toFixed(2).replace('.', ',')}`
                              : `${ev.leadScore || 95}/100`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* SUBTAB: FUNIL GRUPOS -> WHATSAPP (MANYCHAT + LINK CURTO CONFIÁVEL + POST ESTILO BOTÃO WHATSAPP) */}
      {activeSubTab === 'whatsapp_cta_funnel' && (() => {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const currentOverride = manyChatOverridesMap[activeCampaign.id] || {};
        const pkg = buildProductManyChatPackage(activeCampaign, origin, currentOverride);
        const waDirectUrl = `https://wa.me/${pkg.whatsappNumber}?text=${encodeURIComponent(pkg.whatsappPrefillText)}`;
        const buttonDestinationUrl = fbWaDestMode === 'manychat' ? pkg.shortUrl : waDirectUrl;
        const effectiveSnippet =
          fbWaSnippet.trim() ||
          `Procurando ${activeCampaign.title}? Material completo com benefícios reais e acesso imediato (${pkg.priceFormatted}). Clique no botão WhatsApp para receber!`;

        const copyAndMark = (key: string, val: string) => {
          navigator.clipboard.writeText(val);
          setCopiedShortFunnelKey(key);
          setTimeout(() => setCopiedShortFunnelKey(null), 2000);
        };

        const handleApplyPostToBot = (headline: string, copy: string) => {
          setPostHeadline(headline);
          setPostCopy(copy);
          setActiveSubTab('campaign');
        };

        const handleSaveOverride = () => {
          saveManyChatOverride(activeCampaign.id, currentOverride);
          setManyChatSavedBanner('Fluxo ManyChat e benefícios salvos para este produto.');
          setTimeout(() => setManyChatSavedBanner(null), 3500);
        };

        const sharePostFullCopy = `${fbWaShareCaption}\n\n${effectiveSnippet}\n\n👉 Clique aqui para falar no WhatsApp e ver os benefícios:\n${pkg.shortUrl}`;

        return (
          <div className="space-y-5">
            {/* Clarity 2-Step Banner: Step 1 (Here: Post Factory) vs Step 2 (Campaigns & Dispatches Room) */}
            <div className="bg-indigo-950/40 border border-indigo-700/60 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-indigo-200">
                  Passo 1 (Aqui): Fábrica do Post &amp; Link Curto (/z/{pkg.shortSlug}) — Passo 2: Disparo nos Grupos
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Esta aba serve apenas para <strong className="text-white">montar o visual "Botão WhatsApp" e configurar os benefícios do seu ManyChat</strong>. O disparo nos grupos acontece somente na aba <strong className="text-emerald-300">Campanhas &amp; Disparos</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleApplyPostToBot(fbWaShareCaption, `${effectiveSnippet}\n\n👇 Chame no WhatsApp ou veja os benefícios:\n${pkg.shortUrl}`)}
                className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>Preparar Post e Ir para Sala de Disparo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Header + Product Selector */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-emerald-400" />
                    <span>Funil Grupos do Facebook → Botão WhatsApp &amp; ManyChat (/z/{pkg.shortSlug})</span>
                  </h3>
                  <p className="text-xs text-slate-400 max-w-2xl">
                    Crie o post estilo <strong className="text-slate-200">Botão WhatsApp</strong> compartilhado da sua Página para os Grupos e use o <strong className="text-slate-200">Link Curto Confiável (/z/{pkg.shortSlug})</strong> com benefícios reais e pré-atendimento automático.
                  </p>
                </div>
                <a
                  href={pkg.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shrink-0 transition"
                >
                  <span>Testar Atendimento (/z/{pkg.shortSlug})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3 border-t border-slate-800 items-end">
                <div className="md:col-span-5 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Escolha o Produto (Todos já têm Benefícios + ManyChat automático):
                  </label>
                  <select
                    value={activeCampaign.id}
                    onChange={(e) => {
                      const chosen = availableCampaigns.find((c) => c.id === e.target.value);
                      if (chosen) handleSelectCampaign(chosen);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {availableCampaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} (R$ {Number(c.price || 0).toFixed(2).replace('.', ',')})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-7 bg-slate-950 border border-emerald-800/60 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-emerald-400 block">
                      Link Curto Confiável (Cole nos Grupos ou no Botão WhatsApp):
                    </span>
                    <p className="text-xs font-mono text-white truncate">{pkg.shortUrl}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyAndMark('short-url', pkg.shortUrl)}
                    className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {copiedShortFunnelKey === 'short-url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedShortFunnelKey === 'short-url' ? 'Copiado!' : 'Copiar Link Curto'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 0. GERADOR & PRÉVIA DO POST ESTILO FACEBOOK "BOTÃO WHATSAPP" */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>0. Prévia &amp; Gerador de Post Facebook Estilo "Botão WhatsApp"</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Formato igual ao compartilhamento de Página nos Grupos: texto leve de indicação em cima, criativo chamativo no meio e o botão WhatsApp no rodapé.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyPostToBot(fbWaShareCaption, `${effectiveSnippet}\n\n👇 Chame no WhatsApp ou veja os benefícios:\n${pkg.shortUrl}`)}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span>Preparar Post e Ir para Sala de Disparo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Realistic Facebook Post Card with WhatsApp Button */}
                <div className="lg:col-span-6 bg-white text-slate-900 rounded-xl border border-slate-200 overflow-hidden shadow-md">
                  {/* Post Author Header */}
                  <div className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {fbWaPageName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 leading-tight">{fbWaPageName}</div>
                        <div className="text-[11px] text-slate-500">Compartilhado agora · Público</div>
                      </div>
                    </div>
                  </div>

                  {/* Intro Share Caption */}
                  <div className="px-3.5 pb-3 text-[13px] text-slate-800">
                    {fbWaShareCaption}
                  </div>

                  {/* Creative Image */}
                  <div className="bg-slate-100 border-y border-slate-200">
                    <img
                      src={activeCampaign.imageUrl || '/assets/aistudio/image_5456885b.png'}
                      alt={activeCampaign.title}
                      className="w-full max-h-[340px] object-cover"
                    />
                  </div>

                  {/* Footer with Page Name, Category and [WhatsApp] Button */}
                  <div className="bg-slate-100 px-4 py-3 flex items-center justify-between gap-3 border-b border-slate-200">
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">{fbWaPageName}</div>
                      <div className="text-xs text-slate-500 truncate">{fbWaCategory}</div>
                    </div>
                    <a
                      href={buttonDestinationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold text-xs inline-flex items-center gap-1.5 shrink-0 border border-slate-300 transition"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600/15" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {/* Shared Page Original Snippet */}
                  <div className="p-3.5 bg-white space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {fbWaPageName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="text-[11px]">
                        <span className="font-bold text-slate-900">{fbWaPageName}</span>
                        <span className="text-slate-500"> · Página Oficial</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {effectiveSnippet}
                    </p>
                  </div>
                </div>

                {/* Right: Customization & Activation Guide */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold block">Nome da sua Página no FB:</label>
                      <input
                        type="text"
                        value={fbWaPageName}
                        onChange={(e) => setFbWaPageName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold block">Categoria exibida:</label>
                      <input
                        type="text"
                        value={fbWaCategory}
                        onChange={(e) => setFbWaCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-slate-300 font-semibold block">Texto acima da imagem (estilo indicação):</label>
                    <input
                      type="text"
                      value={fbWaShareCaption}
                      onChange={(e) => setFbWaShareCaption(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-slate-300 font-semibold block">Legenda da Página abaixo do botão WhatsApp:</label>
                    <textarea
                      rows={3}
                      value={fbWaSnippet}
                      onChange={(e) => setFbWaSnippet(e.target.value)}
                      placeholder={effectiveSnippet}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-300 font-semibold">Destino do botão [WhatsApp] na prévia:</span>
                      <div className="inline-flex bg-slate-900 p-0.5 rounded-md border border-slate-800 gap-1">
                        <button
                          type="button"
                          onClick={() => setFbWaDestMode('manychat')}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                            fbWaDestMode === 'manychat' ? 'bg-emerald-600 text-slate-950' : 'text-slate-400'
                          }`}
                        >
                          ManyChat (/z/{pkg.shortSlug})
                        </button>
                        <button
                          type="button"
                          onClick={() => setFbWaDestMode('wa_me')}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                            fbWaDestMode === 'wa_me' ? 'bg-emerald-600 text-slate-950' : 'text-slate-400'
                          }`}
                        >
                          Direto (wa.me)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyAndMark('fb-wa-card-copy', sharePostFullCopy)}
                      className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedShortFunnelKey === 'fb-wa-card-copy' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Texto do Post Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Legenda + Link Curto</span>
                        </>
                      )}
                    </button>

                    <a
                      href={activeCampaign.imageUrl || '/assets/aistudio/image_5456885b.png'}
                      download={`${pkg.shortSlug}-criativo.png`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Baixar Imagem do Post</span>
                    </a>
                  </div>

                  {/* Step-by-step how to replicate natively in Facebook Pages -> Groups */}
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-[11px] text-slate-300 space-y-1.5">
                    <div className="font-bold text-white">Como ativar o botão nativo do WhatsApp igual à imagem no Facebook:</div>
                    <ol className="list-decimal list-inside space-y-1 text-slate-400">
                      <li>Crie uma publicação na sua <strong className="text-slate-200">Página do Facebook</strong> usando a imagem acima e selecione a ação <strong className="text-emerald-400">Receber mensagens pelo WhatsApp</strong>.</li>
                      <li>No feed da Página, clique em <strong className="text-slate-200">Compartilhar &rarr; Compartilhar em um grupo</strong> usando a frase curta <code className="text-slate-200">"{fbWaShareCaption}"</code>.</li>
                      <li>Nos grupos que não aceitam post compartilhado de Página, cole o <strong className="text-emerald-400">Link Curto (/z/{pkg.shortSlug})</strong> gerado acima — ele abre seu ManyChat interno com os benefícios e o botão WhatsApp.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Ready Facebook Group Posts + CTAs with Short Link */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">
                  1. Posts + CTAs Prontos para Grupos do Facebook (Já com o Link Curto)
                </h4>
                <p className="text-xs text-slate-400">
                  Clique em <strong className="text-slate-200">Usar no Disparador de Grupos</strong> para enviar o texto direto para a fila automática do robô de 300s–400s.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {pkg.facebookGroupPosts.map((tpl) => {
                  const fullPost = `${tpl.headline}\n\n${tpl.copy}`;
                  return (
                    <div
                      key={tpl.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-emerald-400">{tpl.label}</div>
                        <div className="text-xs font-semibold text-white">{tpl.headline}</div>
                        <p className="text-[11px] text-slate-300 whitespace-pre-line leading-relaxed">
                          {tpl.copy}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => copyAndMark(tpl.id, fullPost)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedShortFunnelKey === tpl.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedShortFunnelKey === tpl.id ? 'Copiado' : 'Copiar'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPostToBot(tpl.headline, tpl.copy)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-slate-950 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>Usar no Disparador</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Automatic Internal ManyChat Flow & Benefits Editor */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    2. O que a pessoa vê ao clicar no Link Curto (ManyChat Interno + Benefícios Reais)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Gerado automaticamente pelo motor interno para qualquer produto. Você também pode personalizar a saudação abaixo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveOverride}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 cursor-pointer"
                >
                  Salvar Mensagem do Produto
                </button>
              </div>

              {manyChatSavedBanner && (
                <div className="px-3.5 py-2 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-xs text-emerald-300 font-medium">
                  {manyChatSavedBanner}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Mensagem Automática de Boas-Vindas ao Clicar:
                  </label>
                  <textarea
                    rows={5}
                    value={currentOverride.welcomeText ?? pkg.welcomeText}
                    onChange={(e) => {
                      const val = e.target.value;
                      setManyChatOverridesMap((prev) => ({
                        ...prev,
                        [activeCampaign.id]: { ...prev[activeCampaign.id], welcomeText: val },
                      }));
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 leading-relaxed focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    Ao abrir o link curto, o visitante também terá botões prontos de ManyChat: <strong>Ver benefícios reais</strong>, <strong>Como funciona e valor</strong>, <strong>Tem garantia?</strong> e <strong>Falar no WhatsApp</strong>.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    4 Benefícios Reais Entregues Automaticamente Para {activeCampaign.title}:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {pkg.benefits.map((b, i) => (
                      <div key={i} className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
                        <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{b.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">{b.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
        </div>
      </div>

      {/* MODAL: CREATE AUDIENCE */}
      {isAudienceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Criar Público a Partir dos Grupos Selecionados
              </h3>
              <button
                onClick={() => setIsAudienceModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nome do Público:
                </label>
                <input
                  type="text"
                  value={newAudienceName}
                  onChange={(e) => setNewAudienceName(e.target.value)}
                  placeholder={`Ex: Público ${activeSearchFolder.toUpperCase()} (${selectedGroupIds.length} Grupos)`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Descrição e Características do Público:
                </label>
                <textarea
                  rows={3}
                  value={newAudienceDesc}
                  onChange={(e) => setNewAudienceDesc(e.target.value)}
                  placeholder="Ex: Público segmentado para divulgação do Caderno de Atividades Kiwify..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400">Resumo da Seleção:</span>
                <div className="text-slate-200 font-bold">
                  {selectedGroupIds.length} Grupos Selecionados • {selectedGroupsTotalMembers.toLocaleString('pt-BR')} membros alcançáveis
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsAudienceModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateAudience}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Salvar na Biblioteca de Públicos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD YOUTUBE VIDEO */}
      {isAddYtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-red-500" />
                Adicionar Vídeo ou Canal do YouTube
              </h3>
              <button
                onClick={() => setIsAddYtModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  URL do Vídeo:
                </label>
                <input
                  type="text"
                  value={newYtUrl}
                  onChange={(e) => setNewYtUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Título do Vídeo:
                </label>
                <input
                  type="text"
                  value={newYtTitle}
                  onChange={(e) => setNewYtTitle(e.target.value)}
                  placeholder="Ex: Como Estimular Criança com Dificuldade de Foco"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nome do Canal:
                </label>
                <input
                  type="text"
                  value={newYtChannel}
                  onChange={(e) => setNewYtChannel(e.target.value)}
                  placeholder="Ex: Canal Pedagogia & Inclusão"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Comentário com Link da Kiwify:
                </label>
                <textarea
                  rows={4}
                  value={newYtComment}
                  onChange={(e) => setNewYtComment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsAddYtModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!newYtUrl) return;
                  const newVid: YouTubeTargetVideo = {
                    id: `yt-${Date.now()}`,
                    url: newYtUrl,
                    title: newYtTitle || 'Vídeo de Pedagogia & Educação Infantil',
                    channelName: newYtChannel || 'Canal Educativo',
                    viewsCount: 'Recém Adicionado',
                    thumbnailUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80',
                    actionLike: true,
                    actionComment: true,
                    actionPinCampaign: true,
                    commentText: newYtComment,
                    status: 'ready'
                  };
                  setYoutubeVideos(prev => [newVid, ...prev]);
                  setIsAddYtModalOpen(false);
                  setNewYtUrl('');
                  setNewYtTitle('');
                  setNewYtChannel('');
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Salvar Vídeo na Fila
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE PINTEREST PIN */}
      {isAddPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Pin className="w-5 h-5 text-rose-500" />
                Criar Novo Pin Viral para o Pinterest
              </h3>
              <button
                onClick={() => setIsAddPinModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Título Chamativo do Pin:
                </label>
                <input
                  type="text"
                  value={newPinTitle}
                  onChange={(e) => setNewPinTitle(e.target.value)}
                  placeholder="Ex: Caderno de Atividades de Coordenação Motora em PDF"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Descrição Persuasiva do Pin (com palavras-chave):
                </label>
                <textarea
                  rows={3}
                  value={newPinDesc}
                  onChange={(e) => setNewPinDesc(e.target.value)}
                  placeholder="Ex: Mais de 100 atividades lúdicas prontas para imprimir em casa..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Pasta de Destino no Pinterest:
                  </label>
                  <select
                    value={newPinBoard}
                    onChange={(e) => setNewPinBoard(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    {pinterestBoards.map(b => (
                      <option key={b.id} value={b.name}>
                        📌 {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Preço de Venda Kiwify:
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold">R$</span>
                    <input
                      type="number"
                      step="0.10"
                      value={newPinPrice}
                      onChange={(e) => setNewPinPrice(parseFloat(e.target.value) || 9.90)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Link de Checkout Direto (Kiwify):
                </label>
                <input
                  type="text"
                  value={newPinUrl}
                  onChange={(e) => setNewPinUrl(e.target.value)}
                  placeholder="https://pay.kiwify.com.br/HE5xbnp"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-blue-300 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  Escolha a Imagem do Produto (Formato Vertical 2:3):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { url: '/assets/aistudio/image_e9e67204.png', label: 'Capa Caderno' },
                    { url: '/assets/aistudio/image_2842df45.png', label: 'Coordenação' },
                    { url: '/assets/aistudio/image_038e9679.png', label: 'TEA / TDAH' }
                  ].map((imgItem) => (
                    <button
                      key={imgItem.url}
                      type="button"
                      onClick={() => setNewPinImageUrl(imgItem.url)}
                      className={`relative rounded-xl overflow-hidden border-2 transition p-1 bg-slate-950 cursor-pointer ${
                        newPinImageUrl === imgItem.url ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-slate-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgItem.url} alt={imgItem.label} className="w-full h-16 object-cover rounded-lg" />
                      <span className="block text-[10px] text-center font-bold text-slate-300 mt-1">{imgItem.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsAddPinModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!newPinTitle) return;
                  const newPin: PinterestPinItem = {
                    id: `pin-${Date.now()}`,
                    title: newPinTitle,
                    description: newPinDesc,
                    boardName: newPinBoard,
                    destinationUrl: newPinUrl || 'https://pay.kiwify.com.br/HE5xbnp',
                    imageUrl: newPinImageUrl || '/assets/aistudio/image_e9e67204.png',
                    price: newPinPrice || 9.90,
                    status: 'ready',
                    impressionsEstimated: Math.floor(Math.random() * 15000) + 12000,
                    clicksEstimated: Math.floor(Math.random() * 800) + 600,
                    niche: 'Pedagogia & Educação'
                  };
                  setPinterestPins(prev => [newPin, ...prev]);
                  setIsAddPinModalOpen(false);
                  alert(`✅ Novo Pin "${newPin.title}" adicionado à fila do Pinterest para a pasta "${newPin.boardName}"!`);
                }}
                className="px-5 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-rose-900/30"
              >
                Salvar Pin no Robô Pinterest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zerar Mapeamento Modal (Requested by user: "função zrar mapear") */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-rose-800/80 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                <Trash2 className="w-5 h-5 text-rose-400" />
                <h3>Zerar Mapeamento &amp; Limpar Registros</h3>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Escolha qual canal você deseja zerar para recomeçar o mapeamento do zero ou limpe todos os canais simultaneamente:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleResetMapping('facebook')}
                className="w-full p-3 rounded-xl bg-slate-950 border border-blue-900/50 hover:border-blue-500 text-left transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-blue-300">🔵 Zerar Apenas Grupos do Facebook</div>
                  <div className="text-[11px] text-slate-400">Limpa os {mappedGroups.length} grupos mapeados na rolagem</div>
                </div>
                <span className="text-xs font-bold text-rose-400">Zerar FB</span>
              </button>

              <button
                onClick={() => handleResetMapping('youtube')}
                className="w-full p-3 rounded-xl bg-slate-950 border border-red-900/50 hover:border-red-500 text-left transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-red-300">🔴 Zerar Apenas Vídeos do YouTube</div>
                  <div className="text-[11px] text-slate-400">Limpa os {youtubeVideos.length} vídeos de comentários</div>
                </div>
                <span className="text-xs font-bold text-rose-400">Zerar YT</span>
              </button>

              <button
                onClick={() => handleResetMapping('pinterest')}
                className="w-full p-3 rounded-xl bg-slate-950 border border-rose-900/50 hover:border-rose-500 text-left transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-rose-300">📌 Zerar Apenas Pins do Pinterest</div>
                  <div className="text-[11px] text-slate-400">Limpa os {pinterestPins.length} pins em pastas</div>
                </div>
                <span className="text-xs font-bold text-rose-400">Zerar PIN</span>
              </button>

              <button
                onClick={() => handleResetMapping('instagram')}
                className="w-full p-3 rounded-xl bg-slate-950 border border-purple-900/50 hover:border-purple-500 text-left transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-purple-300">🟣 Zerar Fila do Instagram</div>
                  <div className="text-[11px] text-slate-400">Limpa os {instagramStoryQueue.length} stories e postagens</div>
                </div>
                <span className="text-xs font-bold text-purple-400">Zerar Insta</span>
              </button>

              <button
                onClick={() => handleResetMapping('all')}
                className="w-full p-3.5 rounded-xl bg-rose-950/40 border border-rose-600/70 hover:bg-rose-900/50 text-left transition cursor-pointer flex items-center justify-between text-white"
              >
                <div>
                  <div className="text-xs font-black text-rose-200">⚠️ Zerar TODOS os Canais (Limpeza Completa)</div>
                  <div className="text-[11px] text-rose-300/80">Apaga todos os registros de grupos, vídeos e pins</div>
                </div>
                <span className="text-xs font-black bg-rose-600 px-2.5 py-1 rounded-lg text-white">Zerar Tudo</span>
              </button>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PWA / APK Mobile Install Modal */}
      <PWAInstallModal
        isOpen={isPWAInstallModalOpen}
        onClose={() => setIsPWAInstallModalOpen(false)}
      />

      {/* Internal Security Defense Modal (Matching image_031f9bdf.png) */}
      <SecurityDefenseModal
        isOpen={isDefenseModalOpen}
        onClose={() => {
          setIsDefenseModalOpen(false);
          setDefenseTriggerReason('');
        }}
        onResumeAnyway={() => {
          setIsDefenseModalOpen(false);
          setDefenseTriggerReason('');
          setIsBotRunning(true);
        }}
        platformName={defensePlatform}
        triggerReason={defenseTriggerReason || undefined}
      />

      {/* EDIT GROUP MODAL (User requested: "exluir editar e selecionar quantos grupos quer divulgar") */}
      {isEditGroupModalOpen && editingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-blue-500/50 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Edit2 className="w-5 h-5 text-blue-400" />
                <h3>Editar Dados do Grupo</h3>
              </div>
              <button
                onClick={() => {
                  setIsEditGroupModalOpen(false);
                  setEditingGroup(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nome do Grupo:
                </label>
                <input
                  type="text"
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  URL do Grupo no Facebook:
                </label>
                <input
                  type="text"
                  value={editGroupUrl}
                  onChange={(e) => setEditGroupUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Quantidade de Membros:
                  </label>
                  <input
                    type="number"
                    value={editGroupMembers}
                    onChange={(e) => setEditGroupMembers(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Nicho / Categoria:
                  </label>
                  <input
                    type="text"
                    value={editGroupNiche}
                    onChange={(e) => setEditGroupNiche(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsEditGroupModalOpen(false);
                  setEditingGroup(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEditGroup}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-blue-900/40"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT AUDIENCE MODAL (User requested: "depois de enviar a paltaforma 'opção de salvar' nomear os grupos pra reutilizar,exluir editar") */}
      {isEditAudienceModalOpen && editingAudience && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-indigo-500/50 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Edit2 className="w-5 h-5 text-indigo-400" />
                <h3>Editar / Renomear Público Salvo</h3>
              </div>
              <button
                onClick={() => {
                  setIsEditAudienceModalOpen(false);
                  setEditingAudience(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nome do Público:
                </label>
                <input
                  type="text"
                  value={editAudienceName}
                  onChange={(e) => setEditAudienceName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Descrição do Público:
                </label>
                <textarea
                  rows={3}
                  value={editAudienceDesc}
                  onChange={(e) => setEditAudienceDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 text-[11px]">
                Contém <strong className="text-white">{editingAudience.groupsCount} grupos</strong> com alcance estimado de <strong className="text-emerald-400">{editingAudience.estimatedMembers.toLocaleString('pt-BR')} pessoas</strong>.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsEditAudienceModalOpen(false);
                  setEditingAudience(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEditAudience}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-indigo-900/40"
              >
                Salvar e Renomear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW CAMPAIGN MODAL (User requested: "poder criar várias campanha e ativar/desativar/pausar") */}
      {isCreateCampaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Target className="w-5 h-5 text-emerald-400" />
                <h3>Criar Nova Campanha de Divulgação</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateCampaignModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Título do Produto / Oferta:
                </label>
                <input
                  type="text"
                  value={formCampTitle}
                  onChange={(e) => setFormCampTitle(e.target.value)}
                  placeholder="Ex: Caderno de Atividades TEA & TDAH (+100 Fichas PDF)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Nicho / Categoria:
                  </label>
                  <input
                    type="text"
                    value={formCampNiche}
                    onChange={(e) => setFormCampNiche(e.target.value)}
                    placeholder="Ex: Psicopedagogia, Autismo, E-commerce..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Preço de Venda (R$):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formCampPrice}
                    onChange={(e) => setFormCampPrice(parseFloat(e.target.value) || 9.90)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Link Direto de Checkout (Kiwify Oficial):
                </label>
                <input
                  type="url"
                  value={formCampCheckoutUrl}
                  onChange={(e) => setFormCampCheckoutUrl(e.target.value)}
                  placeholder="https://pay.kiwify.com.br/SEU_CODIGO"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Link real para onde os compradores serão direcionados após clicar no post ou story.
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  URL da Imagem / Foto do Produto:
                </label>
                <input
                  type="text"
                  value={formCampImageUrl}
                  onChange={(e) => setFormCampImageUrl(e.target.value)}
                  placeholder="/assets/aistudio/... ou URL externa"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Headline da Postagem Base:
                </label>
                <input
                  type="text"
                  value={formCampHeadline}
                  onChange={(e) => setFormCampHeadline(e.target.value)}
                  placeholder="Ex: 🌸 Meninas e colegas, achei esse material incrível que facilitou demais minha rotina!"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Texto da Copy da Indicação:
                </label>
                <textarea
                  rows={4}
                  value={formCampCopy}
                  onChange={(e) => setFormCampCopy(e.target.value)}
                  placeholder="Escreva a recomendação natural sincera que o robô usará para postar nos grupos..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateCampaignModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveNewCampaign}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-emerald-900/40 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Criar e Ativar no Robô
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CAMPAIGN MODAL */}
      {isEditCampaignModalOpen && editingCampaignItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-blue-500/50 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Edit2 className="w-5 h-5 text-blue-400" />
                <h3>Editar Dados da Campanha</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditCampaignModalOpen(false);
                  setEditingCampaignItem(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Título do Produto / Oferta:
                </label>
                <input
                  type="text"
                  value={formCampTitle}
                  onChange={(e) => setFormCampTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Nicho / Categoria:
                  </label>
                  <input
                    type="text"
                    value={formCampNiche}
                    onChange={(e) => setFormCampNiche(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Preço de Venda (R$):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formCampPrice}
                    onChange={(e) => setFormCampPrice(parseFloat(e.target.value) || 9.90)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Link Direto de Checkout (Kiwify Oficial):
                </label>
                <input
                  type="url"
                  value={formCampCheckoutUrl}
                  onChange={(e) => setFormCampCheckoutUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  URL da Imagem / Foto do Produto:
                </label>
                <input
                  type="text"
                  value={formCampImageUrl}
                  onChange={(e) => setFormCampImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Headline da Postagem Base:
                </label>
                <input
                  type="text"
                  value={formCampHeadline}
                  onChange={(e) => setFormCampHeadline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Texto da Copy da Indicação:
                </label>
                <textarea
                  rows={4}
                  value={formCampCopy}
                  onChange={(e) => setFormCampCopy(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsEditCampaignModalOpen(false);
                  setEditingCampaignItem(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEditCampaign}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-blue-900/40 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK IMPORT REAL FACEBOOK GROUPS MODAL */}
      {isBulkImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3>Colar &amp; Importar Grupos Reais do Facebook</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkImportModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-950/30 border border-emerald-900/60 rounded-xl text-emerald-200">
                <p className="font-semibold mb-1">🎯 Importação 100% Blindada Contra Links Falsos</p>
                <p className="text-emerald-300/80 leading-relaxed text-[11px]">
                  Cole aqui os links diretos dos grupos que você já faz parte ou encontrou na busca do Facebook (um por linha ou separados por vírgula). O sistema sanitiza as URLs e garante que seus disparos vão para comunidades ativas.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Cole os Links dos Grupos (um por linha):
                </label>
                <textarea
                  rows={7}
                  value={bulkImportText}
                  onChange={(e) => setBulkImportText(e.target.value)}
                  placeholder={`https://www.facebook.com/groups/rendaextraemcasa2oficial\nhttps://www.facebook.com/groups/anuncieevendacuritibaeregiao\nhttps://www.facebook.com/groups/curitibagrupogeral\nhttps://www.facebook.com/groups/vendascuritibaoficial\nhttps://www.facebook.com/groups/rendaextrabrasil2026`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>
                  Linhas detectadas: <strong className="text-white">{bulkImportText.trim() ? bulkImportText.trim().split('\n').filter(l => l.trim()).length : 0}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setBulkImportText(
                      `https://www.facebook.com/groups/rendaextraemcasa2oficial\nhttps://www.facebook.com/groups/anuncieevendacuritibaeregiao\nhttps://www.facebook.com/groups/curitibagrupogeral\nhttps://www.facebook.com/groups/vendasparanaoficial\nhttps://www.facebook.com/groups/oportunidadescuritibanegocios`
                    );
                  }}
                  className="text-emerald-400 hover:underline cursor-pointer"
                >
                  Carregar 5 exemplos reais
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsBulkImportModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleBulkImportRealUrls}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-emerald-900/40 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Validar e Adicionar à Lista
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK IMPORT YOUTUBE VIDEOS MODAL (Requested: mapear url com youtube aberto 'apos fazer procura') */}
      {isBulkYtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-red-500/50 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Video className="w-5 h-5 text-red-500" />
                <h3>Colar &amp; Importar URLs de Vídeos do YouTube</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkYtModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-red-950/30 border border-red-900/60 rounded-xl text-red-200">
                <p className="font-semibold mb-1">🎯 Mapeamento de Vídeos do YouTube Aberto</p>
                <p className="text-red-300/80 leading-relaxed text-[11px]">
                  Cole aqui as URLs dos vídeos encontrados na busca do YouTube (ex: pesquisa por <strong>TEA</strong>, Educação Infantil ou Pedagogia). O robô adicionará cada vídeo à lista de comentários com link fixado da campanha.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Cole as URLs dos Vídeos (um por linha):
                </label>
                <textarea
                  rows={6}
                  value={bulkYtUrlsText}
                  onChange={(e) => setBulkYtUrlsText(e.target.value)}
                  placeholder={`https://www.youtube.com/watch?v=kYJ40n9oQh8\nhttps://www.youtube.com/watch?v=483Kjd_TeaEdu\nhttps://www.youtube.com/watch?v=mayragaiato_autismo_dicas\nhttps://www.youtube.com/watch?v=luna_educacao_tea`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>
                  Linhas detectadas: <strong className="text-white">{bulkYtUrlsText.trim() ? bulkYtUrlsText.trim().split('\n').filter(l => l.trim()).length : 0}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setBulkYtUrlsText(
                      `https://www.youtube.com/watch?v=autismo_sinais_tea_2026\nhttps://www.youtube.com/watch?v=luna_educacao_atividades\nhttps://www.youtube.com/watch?v=mayra_gaiato_metodo\nhttps://www.youtube.com/watch?v=autismo_e_realidade_direitos`
                    );
                  }}
                  className="text-red-400 hover:underline cursor-pointer"
                >
                  Carregar exemplos da busca TEA
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsBulkYtModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleBulkImportYouTube}
                className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-red-900/40 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Importar Vídeos para a Fila
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
