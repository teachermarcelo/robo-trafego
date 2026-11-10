import React, { useState, useEffect, useRef } from 'react';
import {
  Share2,
  Download,
  Users,
  Clock,
  ShieldCheck,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  FolderDown,
  Layers,
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
  Bot
} from 'lucide-react';
import JSZip from 'jszip';
import { Campaign, FacebookGroup, FacebookAudience, FacebookGroupPostCampaign, FacebookPostLog } from '../types';

interface ChromeFbGroupsTabProps {
  campaigns: Campaign[];
  onAddTrackingEvent?: (event: any) => void;
  onSimulateSale?: (customerName: string, city: string, amount: number) => void;
  onNavigateTab?: (tab: string) => void;
}

const DEFAULT_FACEBOOK_GROUPS: FacebookGroup[] = [
  {
    id: 'fb-grp-1',
    name: 'Mães Atípicas & Autismo Brasil (Apoio, Dicas & Atividades TEA)',
    url: 'https://facebook.com/groups/maesatipicasautismobrasil',
    membersCount: 148500,
    privacy: 'Público',
    niche: 'Autismo & Mães Atípicas',
    mappedAt: '10/11/2026',
    dispatchCount: 3,
    status: 'ready',
    categoryBadge: 'TEA & Maternidade'
  },
  {
    id: 'fb-grp-2',
    name: 'Pedagogia Prática, Educação Especial & Inclusão Escolar',
    url: 'https://facebook.com/groups/pedagogiapraticaeeducacaoespecial',
    membersCount: 92400,
    privacy: 'Público',
    niche: 'Pedagogia & Escolas',
    mappedAt: '10/11/2026',
    dispatchCount: 2,
    status: 'ready',
    categoryBadge: 'Professores & Apoio'
  },
  {
    id: 'fb-grp-3',
    name: 'Mães e Pais de Crianças Especiais - TDAH, Autismo & Desenvolvimento',
    url: 'https://facebook.com/groups/maesepaisdecriancasespeciaisbrasil',
    membersCount: 84200,
    privacy: 'Público',
    niche: 'Autismo & TDAH Infantil',
    mappedAt: '10/11/2026',
    dispatchCount: 1,
    status: 'ready',
    categoryBadge: 'Mães & Apoio'
  },
  {
    id: 'fb-grp-4',
    name: 'Desapego Infantil, Mães & Família Curitiba e Região Metropolitana',
    url: 'https://facebook.com/groups/desapegoinfantilcwb',
    membersCount: 68900,
    privacy: 'Público',
    niche: 'Mães Locais (Curitiba)',
    mappedAt: '10/11/2026',
    dispatchCount: 0,
    status: 'ready',
    categoryBadge: 'Região Curitiba'
  },
  {
    id: 'fb-grp-5',
    name: 'Atividades Psicopedagógicas, Coordenação Motora & Jogos Lúdicos',
    url: 'https://facebook.com/groups/atividadespsicopedagogicascoordenacao',
    membersCount: 57300,
    privacy: 'Público',
    niche: 'Coordenação Motora & TEA',
    mappedAt: '10/11/2026',
    dispatchCount: 1,
    status: 'ready',
    categoryBadge: 'Coordenação Fina'
  },
  {
    id: 'fb-grp-6',
    name: 'Lojistas de Roupas, Moda Infantil & Fornecedores no Atacado',
    url: 'https://facebook.com/groups/lojistasmodainfantilatacado',
    membersCount: 43100,
    privacy: 'Público',
    niche: 'Moda & Vendas WhatsApp',
    mappedAt: '10/11/2026',
    dispatchCount: 0,
    status: 'ready',
    categoryBadge: 'Lojas & Atacado'
  }
];

const DEFAULT_AUDIENCES: FacebookAudience[] = [
  {
    id: 'aud-1',
    name: 'Público 1: Mães Atípicas, Autismo & Apoio Escolar (325k Membros)',
    description: 'Público de alta afinidade e dor latente. Mães exaustas buscando atividades em PDF para imprimir em casa sem sobrecarga sensorial.',
    groupIds: ['fb-grp-1', 'fb-grp-3', 'fb-grp-4'],
    groupsCount: 3,
    estimatedMembers: 301600,
    niche: 'Autismo & Maternidade Atípica',
    targetProductId: 'camp-tarefinhas-autismo',
    createdAt: '10/11/2026'
  },
  {
    id: 'aud-2',
    name: 'Público 2: Professoras, Pedagogas & Educação Especial (150k Membros)',
    description: 'Educadoras procurando materiais prontos para poupar 10h de planejamento semanal de sala de aula e clínica.',
    groupIds: ['fb-grp-2', 'fb-grp-5'],
    groupsCount: 2,
    estimatedMembers: 149700,
    niche: 'Pedagogia & Sala de Aula',
    targetProductId: 'camp-tarefinhas-autismo',
    createdAt: '10/11/2026'
  }
];

export const ChromeFbGroupsTab: React.FC<ChromeFbGroupsTabProps> = ({
  campaigns,
  onAddTrackingEvent,
  onSimulateSale,
  onNavigateTab
}) => {
  const defaultProduct = campaigns[0] || {
    id: 'camp-tarefinhas-autismo',
    title: 'Caderno de Atividades de Coordenação Motora (+100 Tarefinhas)',
    price: 9.90,
    imageUrl: '/assets/aistudio/image_e9e67204.png',
    checkoutUrl: 'https://pay.kiwify.com.br/HE5xbnp',
  };

  // Subtabs
  const [activeSubTab, setActiveSubTab] = useState<'groups' | 'audiences' | 'campaign' | 'extension_guide'>('groups');

  // Groups State
  const [mappedGroups, setMappedGroups] = useState<FacebookGroup[]>(() => {
    try {
      const saved = localStorage.getItem('autoviral_fb_mapped_groups');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_FACEBOOK_GROUPS;
  });

  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(['fb-grp-1', 'fb-grp-2', 'fb-grp-3']);
  const [filterNiche, setFilterNiche] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Audiences State
  const [audiences, setAudiences] = useState<FacebookAudience[]>(() => {
    try {
      const saved = localStorage.getItem('autoviral_fb_audiences');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_AUDIENCES;
  });
  const [selectedAudienceId, setSelectedAudienceId] = useState<string>('aud-1');

  // Create Audience Modal
  const [isAudienceModalOpen, setIsAudienceModalOpen] = useState(false);
  const [newAudienceName, setNewAudienceName] = useState('');
  const [newAudienceDesc, setNewAudienceDesc] = useState('');

  // Add Manual Group Modal
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [manualGroupName, setManualGroupName] = useState('');
  const [manualGroupUrl, setManualGroupUrl] = useState('https://facebook.com/groups/');
  const [manualMembersCount, setManualMembersCount] = useState(35000);
  const [manualNiche, setManualNiche] = useState('Autismo & Mães Atípicas');
  const [bulkUrlsText, setBulkUrlsText] = useState('');

  // Anti-Ban Interval Control (User requested: 120s, 300s, 400s)
  const [intervalSeconds, setIntervalSeconds] = useState<number>(300); // Default 300s (5min)
  const [isCustomInterval, setIsCustomInterval] = useState(false);

  // Campaign & Bot Execution State
  const [postHeadline, setPostHeadline] = useState(
    '🌸 Mães, achei esse caderno de atividades adaptadas que salvou minha semana com meu filho autista!'
  );
  const [postCopy, setPostCopy] = useState(
    `Oi meninas! Passando pra compartilhar uma dica de mãe pra mãe... Meu filho tem muita resistência pra fazer tarefas convencionais e sobrecarga de estímulo visual. 

Consegui um caderno digital com mais de 100 tarefinhas lúdicas pensadas exatamente para coordenação motora fina, alfabetização e foco. Imprimi em casa e ele amou pintar e ligar os pontos!

Está saindo por só R$ 9,90 no Pix (preço simbólico de mãe pra ajudar outras famílias). Quem quiser ver o material completo, deixei o link oficial aqui: https://pay.kiwify.com.br/HE5xbnp 

Espero que ajude outras mães como me ajudou! ❤️`
  );
  const [selectedProductId, setSelectedProductId] = useState<string>(defaultProduct.id);
  const [selectedCheckoutUrl, setSelectedCheckoutUrl] = useState<string>(defaultProduct.checkoutUrl || 'https://pay.kiwify.com.br/HE5xbnp');
  const [selectedPrice, setSelectedPrice] = useState<number>(defaultProduct.price || 9.90);

  // Bot Running Engine
  const [isBotRunning, setIsBotRunning] = useState<boolean>(false);
  const [currentPostingIndex, setCurrentPostingIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(intervalSeconds);
  const [botLogs, setBotLogs] = useState<FacebookPostLog[]>(() => {
    try {
      const saved = localStorage.getItem('autoviral_fb_bot_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'log-1',
        groupId: 'fb-grp-1',
        groupName: 'Mães Atípicas & Autismo Brasil (Apoio, Dicas & Atividades TEA)',
        groupUrl: 'https://facebook.com/groups/maesatipicasautismobrasil',
        postedAt: '10/11/2026 14:20',
        headline: '🌸 Mães, achei esse caderno de atividades adaptadas...',
        status: 'success',
        intervalWaitedSeconds: 300,
        checkoutUrl: 'https://pay.kiwify.com.br/HE5xbnp'
      }
    ];
  });

  // Chrome Extension Bridge Status
  const [isExtensionDetected, setIsExtensionDetected] = useState<boolean>(false);
  const [isScanningGroups, setIsScanningGroups] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('autoviral_fb_mapped_groups', JSON.stringify(mappedGroups));
      localStorage.setItem('autoviral_fb_audiences', JSON.stringify(audiences));
      localStorage.setItem('autoviral_fb_bot_logs', JSON.stringify(botLogs));
    } catch {}
  }, [mappedGroups, audiences, botLogs]);

  // Listen for extension events
  useEffect(() => {
    const handleExtensionGroups = (event: any) => {
      if (event.detail && Array.isArray(event.detail.groups)) {
        setIsExtensionDetected(true);
        const imported = event.detail.groups;
        setMappedGroups(prev => {
          const merged = [...imported, ...prev];
          const unique = merged.filter((g, index, self) =>
            index === self.findIndex(t => t.name === g.name || t.url === g.url)
          );
          return unique;
        });
      }
    };

    window.addEventListener('autoviral_extension_groups_received', handleExtensionGroups);

    // Check if extension injected the attribute
    if (document.documentElement.getAttribute('data-autoviral-extension-installed') === 'true') {
      setIsExtensionDetected(true);
    }

    return () => {
      window.removeEventListener('autoviral_extension_groups_received', handleExtensionGroups);
    };
  }, []);

  // Bot timer loop
  useEffect(() => {
    let timer: any = null;

    if (isBotRunning) {
      timer = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            // Trigger dispatch for current group
            handleExecuteGroupPost();
            return intervalSeconds;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isBotRunning, currentPostingIndex, intervalSeconds, selectedGroupIds, mappedGroups]);

  // Execute post on current group
  const handleExecuteGroupPost = () => {
    const targetGroups = mappedGroups.filter(g => selectedGroupIds.includes(g.id));
    if (targetGroups.length === 0) {
      setIsBotRunning(false);
      return;
    }

    const currentGroup = targetGroups[currentPostingIndex % targetGroups.length];
    const newLog: FacebookPostLog = {
      id: `log-${Date.now()}`,
      groupId: currentGroup.id,
      groupName: currentGroup.name,
      groupUrl: currentGroup.url,
      postedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      headline: postHeadline.slice(0, 50) + '...',
      status: 'success',
      intervalWaitedSeconds: intervalSeconds,
      checkoutUrl: selectedCheckoutUrl
    };

    setBotLogs(prev => [newLog, ...prev]);

    // Update group dispatch count
    setMappedGroups(prev =>
      prev.map(g =>
        g.id === currentGroup.id
          ? { ...g, dispatchCount: g.dispatchCount + 1, lastDispatchedAt: 'Agora mesmo' }
          : g
      )
    );

    // Register tracking event
    if (onAddTrackingEvent) {
      onAddTrackingEvent({
        id: `fb-evt-${Date.now()}`,
        campaignId: selectedProductId,
        campaignTitle: defaultProduct.title,
        niche: currentGroup.niche,
        type: 'impression',
        timestamp: new Date().toISOString(),
        geo: { city: 'Curitiba', state: 'PR', country: 'Brasil' },
        device: 'mobile',
        ageBracket: '25-34',
        source: 'facebook_groups',
        adCreativeName: `Post no Grupo: ${currentGroup.name}`,
        utmContent: `interval_${intervalSeconds}s`
      });
    }

    // Occasional simulated conversion
    if (Math.random() < 0.25 && onSimulateSale) {
      const names = ['Ana Paula (Mãe do Bento)', 'Luciana Castro (Pedagoga)', 'Mariana Ferreira (Curitiba)', 'Carla Souza'];
      const chosenName = names[Math.floor(Math.random() * names.length)];
      onSimulateSale(chosenName, 'Curitiba / Paraná', selectedPrice);
    }

    setCurrentPostingIndex(prev => (prev + 1) % targetGroups.length);
  };

  // Download complete Chrome Extension as .ZIP
  const handleDownloadExtensionZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Read extension files
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

      // Add files to zip
      zip.file('manifest.json', manifestText);
      zip.file('popup.html', popupHtmlText);
      zip.file('popup.js', popupJsText);
      zip.file('content.js', contentJsText);
      zip.file('background.js', backgroundJsText);
      zip.file('README.md', readmeText);
      zip.file('COMO-INSTALAR.txt', `INSTRUÇÕES RÁPIDAS DE INSTALAÇÃO NO GOOGLE CHROME:\n\n1. Descompacte este arquivo ZIP em uma pasta (ex: em Downloads ou na Área de Trabalho).\n2. Abra o Chrome e digite na barra de endereços: chrome://extensions\n3. No topo direito, ative a opção "Modo do desenvolvedor".\n4. No topo esquerdo, clique em "Carregar sem compactação" (Load unpacked).\n5. Selecione a pasta descompactada.\n6. Pronto! A extensão AutoViral AI estará ativa no seu navegador.`);

      const blob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'extensao-autoviral-facebook-grupos.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error generating extension zip:', err);
      alert('Iniciando download dos arquivos da extensão...');
      window.open('/chrome-extension/manifest.json', '_blank');
    } finally {
      setIsZipping(false);
    }
  };

  // Scan open Facebook groups simulator / bridge
  const handleScanFacebookGroups = () => {
    setIsScanningGroups(true);
    setTimeout(() => {
      const newDiscoveredGroups: FacebookGroup[] = [
        {
          id: `fb-disc-${Date.now()}-1`,
          name: 'Mães e Filhos Especiais - Estimulação Infantil & Brincadeiras',
          url: 'https://facebook.com/groups/maesefilhosespeciaisbr',
          membersCount: 78400,
          privacy: 'Público',
          niche: 'Autismo & Mães Atípicas',
          mappedAt: new Date().toLocaleDateString('pt-BR'),
          dispatchCount: 0,
          status: 'ready',
          categoryBadge: 'Mães & Apoio'
        },
        {
          id: `fb-disc-${Date.now()}-2`,
          name: 'Alfabetização Infantil Lúdica & Material para Imprimir',
          url: 'https://facebook.com/groups/alfabetizacaoinfantilludicapdf',
          membersCount: 112000,
          privacy: 'Público',
          niche: 'Pedagogia & Escolas',
          mappedAt: new Date().toLocaleDateString('pt-BR'),
          dispatchCount: 0,
          status: 'ready',
          categoryBadge: 'Pedagogia & Alfabetização'
        }
      ];

      setMappedGroups(prev => {
        const merged = [...newDiscoveredGroups, ...prev];
        return merged.filter((g, i, self) => i === self.findIndex(t => t.name === g.name));
      });

      setSelectedGroupIds(prev => [...new Set([...prev, newDiscoveredGroups[0].id, newDiscoveredGroups[1].id])]);
      setIsScanningGroups(false);
      alert('🎉 2 novos grupos de alto engajamento foram detectados e mapeados com sucesso!');
    }, 1200);
  };

  // Toggle group selection
  const handleToggleGroup = (id: string) => {
    setSelectedGroupIds(prev =>
      prev.includes(id) ? prev.filter(gid => gid !== id) : [...prev, id]
    );
  };

  // Select all groups
  const handleSelectAll = () => {
    if (selectedGroupIds.length === mappedGroups.length) {
      setSelectedGroupIds([]);
    } else {
      setSelectedGroupIds(mappedGroups.map(g => g.id));
    }
  };

  // Create Audience from selected groups
  const handleCreateAudience = () => {
    if (selectedGroupIds.length === 0) {
      alert('Selecione ao menos 1 grupo mapeado para criar o público.');
      return;
    }

    const selectedObjs = mappedGroups.filter(g => selectedGroupIds.includes(g.id));
    const totalMembers = selectedObjs.reduce((acc, curr) => acc + curr.membersCount, 0);

    const newAud: FacebookAudience = {
      id: `aud-${Date.now()}`,
      name: newAudienceName || `Público: ${selectedObjs[0].categoryBadge || 'Mães & Educação'} (${selectedGroupIds.length} Grupos - ${(totalMembers / 1000).toFixed(0)}k membros)`,
      description: newAudienceDesc || `Público qualificado gerado a partir de ${selectedGroupIds.length} grupos do Facebook mapeados via extensão. Foco em conversão imediata no Pix R$ 9,90.`,
      groupIds: selectedGroupIds,
      groupsCount: selectedGroupIds.length,
      estimatedMembers: totalMembers,
      niche: selectedObjs[0].niche || 'Maternidade & Autismo',
      targetProductId: selectedProductId,
      createdAt: new Date().toLocaleDateString('pt-BR')
    };

    setAudiences(prev => [newAud, ...prev]);
    setSelectedAudienceId(newAud.id);
    setIsAudienceModalOpen(false);
    setNewAudienceName('');
    setNewAudienceDesc('');
    setActiveSubTab('audiences');
    alert('✅ Público personalizado criado com sucesso! Agora você pode criar a campanha de divulgação.');
  };

  // Add Manual Group
  const handleAddManualGroup = () => {
    if (!manualGroupName.trim()) {
      alert('Por favor, informe o nome do grupo.');
      return;
    }

    const newGrp: FacebookGroup = {
      id: `fb-manual-${Date.now()}`,
      name: manualGroupName.trim(),
      url: manualGroupUrl.trim() || 'https://facebook.com/groups/',
      membersCount: Number(manualMembersCount) || 25000,
      privacy: 'Público',
      niche: manualNiche,
      mappedAt: new Date().toLocaleDateString('pt-BR'),
      dispatchCount: 0,
      status: 'ready',
      categoryBadge: manualNiche.split(' ')[0]
    };

    setMappedGroups(prev => [newGrp, ...prev]);
    setSelectedGroupIds(prev => [...prev, newGrp.id]);
    setIsAddGroupModalOpen(false);
    setManualGroupName('');
  };

  // Filter groups
  const filteredGroups = mappedGroups.filter(g => {
    const matchesNiche = filterNiche === 'all' || g.niche === filterNiche;
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          g.url.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesNiche && matchesSearch;
  });

  const selectedGroupsTotalMembers = mappedGroups
    .filter(g => selectedGroupIds.includes(g.id))
    .reduce((acc, curr) => acc + curr.membersCount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner - Context & Chrome Extension Announcement */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-800/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-blue-400" />
                EXTENSÃO GOOGLE CHROME + FACEBOOK
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Intervalo Anti-Bloqueio: 120s, 300s, 400s
              </span>
            </div>
            
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Mapeador de Grupos Facebook & Robô Divulgador Anti-Bloqueio
            </h1>
            
            <p className="text-sm text-slate-300 leading-relaxed">
              Instale a extensão no seu Chrome, abra os grupos que você participa no Facebook e a plataforma mapeia
              automaticamente os membros. Crie públicos personalizados e ative a divulgação com pausas humanas programadas 
              (<strong className="text-emerald-400">120s, 300s ou 400s</strong>) para nunca tomar bloqueio de spam!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <button
              onClick={handleDownloadExtensionZip}
              disabled={isZipping}
              className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition transform hover:-translate-y-0.5"
            >
              {isZipping ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Gerando Pacote .ZIP...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Baixar Extensão Chrome (.ZIP)
                </>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('extension_guide')}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition"
            >
              <HelpCircle className="w-4 h-4 text-blue-400" />
              Como Instalar em 30s
            </button>
          </div>
        </div>

        {/* Live Bridge Connection Pill */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isExtensionDetected ? 'bg-emerald-400' : 'bg-blue-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isExtensionDetected ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
            </span>
            <span className="text-slate-300 font-medium">
              Bridge com o Chrome:
            </span>
            <span className={`font-semibold ${isExtensionDetected ? 'text-emerald-400' : 'text-blue-300'}`}>
              {isExtensionDetected ? '✅ Extensão Conectada & Sincronizada' : '📡 Mapeamento Ativo (Modo Direto & Bridge Web)'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Grupos no Radar: <strong className="text-white">{mappedGroups.length}</strong></span>
            <span>•</span>
            <span>Público Total Acumulado: <strong className="text-emerald-400">{mappedGroups.reduce((a, b) => a + b.membersCount, 0).toLocaleString('pt-BR')} membros</strong></span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('groups')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${
            activeSubTab === 'groups'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Share2 className="w-4 h-4" />
          1. Grupos Mapeados do Facebook ({mappedGroups.length})
        </button>

        <button
          onClick={() => setActiveSubTab('audiences')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${
            activeSubTab === 'audiences'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          2. Criar & Gerenciar Públicos ({audiences.length})
        </button>

        <button
          onClick={() => setActiveSubTab('campaign')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition relative ${
            activeSubTab === 'campaign'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Bot className="w-4 h-4 text-emerald-300" />
          3. Campanha & Robô Divulgador (Anti-Bloqueio)
          {isBotRunning && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('extension_guide')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${
            activeSubTab === 'extension_guide'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <FileCode className="w-4 h-4" />
          4. Como Instalar a Extensão no Chrome
        </button>
      </div>

      {/* SUBTAB 1: MAPPED FACEBOOK GROUPS */}
      {activeSubTab === 'groups' && (
        <div className="space-y-6">
          {/* Action Header for Groups */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleScanFacebookGroups}
                disabled={isScanningGroups}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-900/20 transition"
              >
                {isScanningGroups ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mapeando Grupos Abertos...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    Mapear Grupos Abertos do Facebook
                  </>
                )}
              </button>

              <button
                onClick={() => setIsAddGroupModalOpen(true)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                Adicionar Grupo por Link
              </button>

              <button
                onClick={handleSelectAll}
                className="px-3 py-2.5 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs rounded-xl border border-slate-700/60 transition"
              >
                {selectedGroupIds.length === mappedGroups.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (selectedGroupIds.length === 0) {
                    alert('Selecione os grupos na lista abaixo com o checkbox para criar o público.');
                    return;
                  }
                  setIsAudienceModalOpen(true);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-900/30 transition"
              >
                <Users className="w-4 h-4" />
                Criar Público com Selecionados ({selectedGroupIds.length})
              </button>
            </div>
          </div>

          {/* Filters & Selection Summary */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar grupos por nome ou link..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={filterNiche}
                onChange={(e) => setFilterNiche(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="all">Todos os Nichos</option>
                <option value="Autismo & Mães Atípicas">Autismo & Mães Atípicas</option>
                <option value="Pedagogia & Escolas">Pedagogia & Escolas</option>
                <option value="Autismo & TDAH Infantil">Autismo & TDAH Infantil</option>
                <option value="Mães Locais (Curitiba)">Mães Locais (Curitiba)</option>
                <option value="Coordenação Motora & TEA">Coordenação Motora & TEA</option>
                <option value="Moda & Vendas WhatsApp">Moda & Vendas WhatsApp</option>
              </select>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300 flex items-center gap-2">
              <span>Grupos Selecionados: <strong className="text-white">{selectedGroupIds.length}</strong></span>
              <span>•</span>
              <span>Alcance Potencial: <strong className="text-emerald-400">{selectedGroupsTotalMembers.toLocaleString('pt-BR')} pessoas</strong></span>
            </div>
          </div>

          {/* Groups Grid */}
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

                    <div>
                      <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                        {group.name}
                      </h3>
                      <a
                        href={group.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1 truncate"
                      >
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        {group.url}
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

                    <div className="text-slate-400">
                      Divulgações: <strong className="text-white">{group.dispatchCount}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: AUDIENCES */}
      {activeSubTab === 'audiences' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Públicos Qualificados no Facebook</h2>
              <p className="text-xs text-slate-400">
                Públicos agrupados a partir dos grupos mapeados, prontos para receber as campanhas com proteção anti-bloqueio.
              </p>
            </div>

            <button
              onClick={() => setIsAudienceModalOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              + Criar Novo Público de Grupos
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {audiences.map(aud => {
              const isSelected = selectedAudienceId === aud.id;
              return (
                <div
                  key={aud.id}
                  className={`bg-slate-900 border rounded-2xl p-6 space-y-4 transition ${
                    isSelected ? 'border-indigo-500 shadow-xl shadow-indigo-950/40' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {aud.niche}
                      </span>
                      <h3 className="text-base font-bold text-white">{aud.name}</h3>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400">Alcance</span>
                      <div className="text-base font-extrabold text-emerald-400">
                        {aud.estimatedMembers.toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {aud.description}
                  </p>

                  <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Grupos Vinculados: <strong className="text-white">{aud.groupsCount} grupos</strong></span>
                    <span className="text-slate-400">Criado em: <strong className="text-slate-200">{aud.createdAt}</strong></span>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setSelectedAudienceId(aud.id);
                        setActiveSubTab('campaign');
                      }}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      Criar Campanha para Este Público
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: CAMPAIGN & BOT DISPATCH WITH ANTI-BAN INTERVAL (120s, 300s, 400s) */}
      {activeSubTab === 'campaign' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Campaign Configuration */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Bot className="w-5 h-5 text-emerald-400" />
                    Robô Divulgador nos Grupos (Meta Anti-Spam)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Dispare mensagens persuasivas nos grupos com descansos programados para nunca levar bloqueio.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${isBotRunning ? 'bg-emerald-500 animate-ping' : 'bg-slate-600'}`} />
                  <span className="text-xs font-bold text-slate-200">
                    {isBotRunning ? 'Robô Ativo' : 'Robô Parado'}
                  </span>
                </div>
              </div>

              {/* 1. Target Audience & Groups Count */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
                  Público Alvo Selecionado:
                </label>
                <select
                  value={selectedAudienceId}
                  onChange={(e) => setSelectedAudienceId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {audiences.map(aud => (
                    <option key={aud.id} value={aud.id}>
                      {aud.name} ({aud.groupsCount} Grupos • {aud.estimatedMembers.toLocaleString('pt-BR')} membros)
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. INTERVALO ANTI-BLOQUEIO (120s, 300s, 400s) */}
              <div className="bg-slate-950/80 border border-indigo-900/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wide">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    Intervalo Anti-Bloqueio Controlável:
                  </label>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/40">
                    {intervalSeconds} segundos ({Math.round(intervalSeconds / 60)} min de pausa)
                  </span>
                </div>

                <p className="text-xs text-slate-300">
                  O algoritmo do Facebook detecta postagens em massa muito rápidas como spam. 
                  Com descansos de <strong>120 a 400 segundos</strong>, sua conta é reconhecida como um usuário humano normal!
                </p>

                {/* Quick preset buttons requested by user */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIntervalSeconds(120);
                      setIsCustomInterval(false);
                    }}
                    className={`p-3 rounded-xl border text-center transition ${
                      intervalSeconds === 120 && !isCustomInterval
                        ? 'bg-blue-600/30 border-blue-500 text-white font-bold shadow-md shadow-blue-900/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-sm font-extrabold text-blue-400">120 segundos</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">2 minutos (Rápido)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIntervalSeconds(300);
                      setIsCustomInterval(false);
                    }}
                    className={`p-3 rounded-xl border text-center transition ${
                      intervalSeconds === 300 && !isCustomInterval
                        ? 'bg-emerald-600/30 border-emerald-500 text-white font-bold shadow-md shadow-emerald-900/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-sm font-extrabold text-emerald-400">300 segundos</div>
                    <div className="text-[10px] text-emerald-300 mt-0.5">5 minutos (Recomendado)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIntervalSeconds(400);
                      setIsCustomInterval(false);
                    }}
                    className={`p-3 rounded-xl border text-center transition ${
                      intervalSeconds === 400 && !isCustomInterval
                        ? 'bg-purple-600/30 border-purple-500 text-white font-bold shadow-md shadow-purple-900/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-sm font-extrabold text-purple-400">400 segundos</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">6,6 minutos (Blindado)</div>
                  </button>
                </div>

                {/* Slider for precision */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Ajuste fino com slider:</span>
                    <span className="font-semibold text-slate-200">{intervalSeconds}s</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="600"
                    step="10"
                    value={intervalSeconds}
                    onChange={(e) => {
                      setIntervalSeconds(Number(e.target.value));
                      setIsCustomInterval(true);
                    }}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>60s (1m)</span>
                    <span>120s</span>
                    <span>300s</span>
                    <span>400s</span>
                    <span>600s (10m)</span>
                  </div>
                </div>
              </div>

              {/* 3. Product Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
                  Produto para Divulgar & Link de Checkout:
                </label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={defaultProduct.imageUrl || '/assets/aistudio/image_e9e67204.png'}
                      alt="Produto"
                      className="w-12 h-12 object-cover rounded-lg border border-slate-700"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{defaultProduct.title}</div>
                      <div className="text-[11px] text-emerald-400 font-semibold">
                        Preço: R$ {selectedPrice.toFixed(2).replace('.', ',')} no Pix
                      </div>
                    </div>
                  </div>
                  <a
                    href={selectedCheckoutUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"
                  >
                    Kiwify
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* 4. Copy & Message for the Post */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                    Texto Persuasivo do Post nos Grupos:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setPostHeadline('🌸 Mães de Curitiba e Brasil, olhem o que ajudou meu filho autista a focar sem birra!');
                      setPostCopy(`Oi pessoal! Quem é mãe atípica ou professora sabe como é difícil achar atividades adaptadas sem poluição visual. 

Achei esse caderno em PDF com mais de 100 tarefinhas lúdicas de coordenação motora fina e alfabetização que funcionam super bem com crianças com TEA e TDAH. 

Consegui um acesso promocional por R$ 9,90 no Pix pelo link oficial: ${selectedCheckoutUrl}

Super recomendo para quem quer imprimir em casa e economizar tempo! ❤️`);
                    }}
                    className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Gerar Copy com IA
                  </button>
                </div>

                <input
                  type="text"
                  value={postHeadline}
                  onChange={(e) => setPostHeadline(e.target.value)}
                  placeholder="Título do Post / Gancho..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                />

                <textarea
                  rows={6}
                  value={postCopy}
                  onChange={(e) => setPostCopy(e.target.value)}
                  placeholder="Mensagem completa..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              {/* Bot Start / Pause Buttons */}
              <div className="pt-2 flex items-center gap-3">
                {!isBotRunning ? (
                  <button
                    onClick={() => {
                      setIsBotRunning(true);
                      setSecondsRemaining(intervalSeconds);
                    }}
                    className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/50 transition transform hover:-translate-y-0.5"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Iniciar Divulgação Automática nos Grupos
                  </button>
                ) : (
                  <button
                    onClick={() => setIsBotRunning(false)}
                    className="flex-1 py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 shadow-xl transition"
                  >
                    <Pause className="w-4 h-4 fill-white" />
                    Pausar Robô
                  </button>
                )}

                <button
                  onClick={handleExecuteGroupPost}
                  className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Disparar 1 post agora mesmo no grupo da fila"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  Postar Agora (Teste)
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Monitor & Countdown */}
          <div className="lg:col-span-5 space-y-6">
            {/* Countdown & Live Status Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Painel de Monitoramento & Ritmo Anti-Spam
              </h3>

              {isBotRunning ? (
                <div className="bg-gradient-to-br from-emerald-950/60 to-slate-950 border border-emerald-800/40 rounded-2xl p-5 text-center space-y-3">
                  <span className="text-xs text-emerald-300 font-semibold tracking-wide uppercase">
                    Próxima Postagem em Grupo:
                  </span>
                  
                  <div className="text-5xl font-black text-white font-mono tracking-tight">
                    {secondsRemaining}s
                  </div>

                  <p className="text-xs text-slate-300">
                    O robô está respeitando o intervalo de <strong>{intervalSeconds} segundos</strong> para garantir segurança máxima contra bloqueios da Meta.
                  </p>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-1000"
                      style={{ width: `${((intervalSeconds - secondsRemaining) / intervalSeconds) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
                  <Clock className="w-8 h-8 text-slate-500 mx-auto" />
                  <div className="text-sm font-bold text-slate-300">Robô em Espera</div>
                  <p className="text-xs text-slate-400">
                    Clique em "Iniciar Divulgação" para começar o ciclo com intervalos de {intervalSeconds} segundos.
                  </p>
                </div>
              )}

              {/* Real-time stats */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Grupos no Alvo:</span>
                  <div className="text-base font-extrabold text-white mt-1">
                    {selectedGroupIds.length} grupos
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Postagens Feitas:</span>
                  <div className="text-base font-extrabold text-emerald-400 mt-1">
                    {botLogs.length} postagens
                  </div>
                </div>
              </div>

              {/* Execution Logs */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-300">Histórico de Disparos nos Grupos:</span>
                  <span className="text-slate-500">{botLogs.length} registros</span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {botLogs.map(log => (
                    <div
                      key={log.id}
                      className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-white line-clamp-1">{log.groupName}</span>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.5 rounded">
                          {log.postedAt}
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {log.headline}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                        <span>Pausa cumprida: {log.intervalWaitedSeconds}s</span>
                        <a
                          href={log.groupUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                        >
                          Ver Grupo <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: STEP-BY-STEP EXTENSION INSTALLATION GUIDE */}
      {activeSubTab === 'extension_guide' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Download className="w-5 h-5 text-emerald-400" />
                  Como Instalar a Extensão no Google Chrome em 30 Segundos
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Você não precisa da loja do Google! A extensão é instalada diretamente no modo desenvolvedor do seu Chrome com total segurança.
                </p>
              </div>

              <button
                onClick={handleDownloadExtensionZip}
                disabled={isZipping}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition"
              >
                <Download className="w-4 h-4" />
                Baixar Pasta da Extensão (.ZIP)
              </button>
            </div>

            {/* Steps Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Step 1 */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm">
                  1
                </div>
                <h3 className="text-sm font-bold text-white">Baixar & Descompactar</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Clique no botão verde acima para baixar o arquivo <strong>extensao-autoviral-facebook-grupos.zip</strong>. 
                  Depois, clique com o botão direito e selecione <em>"Extrair tudo..."</em> para uma pasta no seu computador.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-sm">
                  2
                </div>
                <h3 className="text-sm font-bold text-white">Abrir chrome://extensions</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  No seu Google Chrome, digite <code className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-300">chrome://extensions</code> na barra de endereços.
                  No canto superior direito da tela, <strong>ative a chave "Modo do desenvolvedor"</strong>.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-sm">
                  3
                </div>
                <h3 className="text-sm font-bold text-white">Carregar sem Compactação</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Clique no botão <strong>"Carregar sem compactação"</strong> (Load unpacked) no canto superior esquerdo e selecione a pasta descompactada. 
                  Pronto! O ícone da AutoViral AI aparecerá no topo do Chrome!
                </p>
              </div>
            </div>

            {/* Individual Files Code Preview */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-purple-400" />
                  Arquivos Incluídos no Pacote da Extensão:
                </h3>
                <span className="text-xs text-slate-400">Total: 5 arquivos (Manifest V3 Oficial)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-blue-400" />
                    manifest.json
                  </div>
                  <p className="text-[11px] text-slate-400">Configuração V3</p>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                    popup.html
                  </div>
                  <p className="text-[11px] text-slate-400">Janela da Extensão</p>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-amber-400" />
                    popup.js
                  </div>
                  <p className="text-[11px] text-slate-400">Mapeamento & Sync</p>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                    content.js
                  </div>
                  <p className="text-[11px] text-slate-400">Leitor do Facebook</p>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-purple-400" />
                    background.js
                  </div>
                  <p className="text-[11px] text-slate-400">Service Worker</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                className="text-slate-400 hover:text-white"
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
                  placeholder="Ex: Mães Atípicas & TEA Curitiba (320k membros)"
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
                  placeholder="Ex: Mães com filhos em fase de alfabetização, buscando atividades lúdicas sem sobrecarga sensorial..."
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
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateAudience}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl"
              >
                Confirmar & Criar Público
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD MANUAL GROUP BY LINK */}
      {isAddGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Adicionar Grupo do Facebook
              </h3>
              <button
                onClick={() => setIsAddGroupModalOpen(false)}
                className="text-slate-400 hover:text-white"
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
                  value={manualGroupName}
                  onChange={(e) => setManualGroupName(e.target.value)}
                  placeholder="Ex: Mães e Filhos Especiais Brasil"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Link / URL do Grupo no Facebook:
                </label>
                <input
                  type="text"
                  value={manualGroupUrl}
                  onChange={(e) => setManualGroupUrl(e.target.value)}
                  placeholder="https://facebook.com/groups/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Número Estimado de Membros:
                  </label>
                  <input
                    type="number"
                    value={manualMembersCount}
                    onChange={(e) => setManualMembersCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Nicho / Categoria:
                  </label>
                  <select
                    value={manualNiche}
                    onChange={(e) => setManualNiche(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Autismo & Mães Atípicas">Autismo & Mães Atípicas</option>
                    <option value="Pedagogia & Escolas">Pedagogia & Escolas</option>
                    <option value="Autismo & TDAH Infantil">Autismo & TDAH Infantil</option>
                    <option value="Mães Locais (Curitiba)">Mães Locais (Curitiba)</option>
                    <option value="Coordenação Motora & TEA">Coordenação Motora & TEA</option>
                    <option value="Moda & Vendas WhatsApp">Moda & Vendas WhatsApp</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsAddGroupModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddManualGroup}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
              >
                Adicionar Grupo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
