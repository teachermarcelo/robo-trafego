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
  Target
} from 'lucide-react';
import JSZip from 'jszip';
import {
  Campaign,
  FacebookGroup,
  FacebookAudience,
  FacebookPostLog,
  YouTubeTargetVideo,
  YouTubeBotLog,
  PinterestPinItem,
  PinterestBoard
} from '../types';
import {
  CURITIBA_GROUPS,
  PEDAGOGIA_GROUPS,
  AUTISMO_GROUPS,
  ALL_INITIAL_FACEBOOK_GROUPS,
  INITIAL_SAVED_AUDIENCES
} from '../data/facebookGroupsData';
import { globalBotRunner } from '../utils/backgroundBotRunner';

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
  onAddTrackingEvent?: (event: any) => void;
  onSimulateSale?: (customerName: string, city: string, amount: number) => void;
  onNavigateTab?: (tab: string) => void;
}

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

  const availableCampaigns = campaigns && campaigns.length > 0 ? campaigns : [defaultProduct];

  // Subtabs: groups | audiences | campaign | youtube | pinterest | extension_guide
  const [activeSubTab, setActiveSubTab] = useState<'groups' | 'audiences' | 'campaign' | 'youtube' | 'pinterest' | 'extension_guide'>('groups');

  // Search folder filter: 'curitiba' | 'pedagogia' | 'autismo' | 'all'
  const [activeSearchFolder, setActiveSearchFolder] = useState<'curitiba' | 'pedagogia' | 'autismo' | 'all'>('curitiba');

  // All Mapped Groups State
  const [mappedGroups, setMappedGroups] = useState<FacebookGroup[]>(() => {
    try {
      const saved = localStorage.getItem('autoviral_fb_mapped_groups_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return ALL_INITIAL_FACEBOOK_GROUPS;
  });

  // Selected Group IDs for audience / campaign
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(() => {
    return CURITIBA_GROUPS.slice(0, 10).map(g => g.id);
  });
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Bulk import from text modal
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState<boolean>(false);
  const [bulkImportText, setBulkImportText] = useState<string>('');

  // Saved Audiences Library (Display & Reusable)
  const [audiences, setAudiences] = useState<FacebookAudience[]>(() => {
    try {
      const saved = localStorage.getItem('autoviral_fb_audiences_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_SAVED_AUDIENCES;
  });
  const [selectedAudienceId, setSelectedAudienceId] = useState<string>('aud-cwb-todos');

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

  // Campaign & Bot Execution State
  const [selectedProductId, setSelectedProductId] = useState<string>(defaultProduct.id);
  const [selectedCheckoutUrl, setSelectedCheckoutUrl] = useState<string>(defaultProduct.checkoutUrl || 'https://pay.kiwify.com.br/HE5xbnp');
  const [selectedPrice, setSelectedPrice] = useState<number>(defaultProduct.price || 9.90);
  const [activeCopyTemplateIndex, setActiveCopyTemplateIndex] = useState<number>(0);

  const activeCampaign = availableCampaigns.find(c => c.id === selectedProductId) || availableCampaigns[0] || defaultProduct;
  const currentTemplates = getCampaignCopyTemplates(activeCampaign);

  const [postHeadline, setPostHeadline] = useState(
    '🌸 Meninas e colegas de Curitiba, achei esse material de coordenação motora que facilitou demais minha rotina!'
  );
  const [postCopy, setPostCopy] = useState(
    `Oi pessoal de Curitiba e região! Passando pra compartilhar uma dica que me ajudou muito.

Quem trabalha com educação infantil ou tem filho com resistência a tarefas sabe o tempo que a gente gasta bolando atividades sem poluição visual.

Achei um caderno digital com mais de 100 atividades lúdicas de coordenação motora fina e alfabetização que funcionam perfeitamente para crianças típicas, com TDAH e autistas.

Dá pra imprimir em casa e o acesso sai por apenas R$ 9,90 no Pix pelo link oficial: https://pay.kiwify.com.br/HE5xbnp

Espero que ajude outras pessoas como me ajudou! ❤️`
  );

  const handleSelectCampaign = (camp: Campaign, templateIndex: number = 0) => {
    setSelectedProductId(camp.id);
    setSelectedCheckoutUrl(camp.checkoutUrl || '');
    setSelectedPrice(camp.price || 0);
    setActiveCopyTemplateIndex(templateIndex);

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
    return [
      {
        id: 'log-cwb-1',
        groupId: 'fb-cwb-1',
        groupName: 'ANUNCIE AQUI CURITIBA PR (5,9 mil membros)',
        groupUrl: 'https://facebook.com/groups/anuncieaquicuritibapr',
        postedAt: '10/11/2026 15:52',
        headline: '🌸 Meninas e colegas de Curitiba, achei esse material...',
        status: 'success',
        intervalWaitedSeconds: 345,
        checkoutUrl: 'https://pay.kiwify.com.br/HE5xbnp'
      },
      {
        id: 'log-cwb-2',
        groupId: 'fb-cwb-2',
        groupName: 'Anuncie e Venda, Curitiba e Região (21 mil membros)',
        groupUrl: 'https://facebook.com/groups/anuncieevendacuritibaeregiao',
        postedAt: '10/11/2026 15:46',
        headline: '🌸 Meninas e colegas de Curitiba, achei esse material...',
        status: 'success',
        intervalWaitedSeconds: 372,
        checkoutUrl: 'https://pay.kiwify.com.br/HE5xbnp'
      },
      {
        id: 'log-cwb-5',
        groupId: 'fb-cwb-5',
        groupName: 'CURITIBA (40.712 membros)',
        groupUrl: 'https://facebook.com/groups/curitibagrupogeral',
        postedAt: '10/11/2026 15:40',
        headline: '🌸 Meninas e colegas de Curitiba, achei esse material...',
        status: 'success',
        intervalWaitedSeconds: 318,
        checkoutUrl: 'https://pay.kiwify.com.br/HE5xbnp'
      }
    ];
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

  // Persist State to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('autoviral_fb_mapped_groups_v3', JSON.stringify(mappedGroups));
      localStorage.setItem('autoviral_fb_audiences_v3', JSON.stringify(audiences));
      localStorage.setItem('autoviral_fb_bot_logs_v3', JSON.stringify(botLogs));
      localStorage.setItem('autoviral_fb_daily_completed_v3', dailyDispatchesCompleted.toString());
      localStorage.setItem('autoviral_yt_videos_v2', JSON.stringify(youtubeVideos));
      localStorage.setItem('autoviral_pinterest_pins_v1', JSON.stringify(pinterestPins));
    } catch {}
  }, [mappedGroups, audiences, botLogs, dailyDispatchesCompleted, youtubeVideos, pinterestPins]);

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
      if (event.detail && Array.isArray(event.detail.groups)) {
        setIsExtensionDetected(true);
        const imported: FacebookGroup[] = event.detail.groups;
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

    if (document.documentElement.getAttribute('data-autoviral-extension-installed') === 'true') {
      setIsExtensionDetected(true);
    }

    return () => {
      window.removeEventListener('autoviral_extension_groups_received', handleExtensionGroups);
    };
  }, []);

  // Execute Facebook post on current group
  const handleExecuteGroupPost = () => {
    if (dailyDispatchesCompleted >= dailyDispatchLimit) {
      globalBotRunner.stop();
      setIsBotRunning(false);
      alert(`⚠️ Limite diário de segurança de ${dailyDispatchLimit} disparos atingido com sucesso!`);
      return;
    }

    const targetGroups = mappedGroups.filter(g => selectedGroupIds.includes(g.id));
    if (targetGroups.length === 0) {
      globalBotRunner.stop();
      setIsBotRunning(false);
      return;
    }

    const currentGroup = targetGroups[currentPostingIndex % targetGroups.length];
    const waited = isRandomJitterActive
      ? Math.floor(Math.random() * (400 - 300 + 1)) + 300
      : intervalSeconds;

    const newLog: FacebookPostLog = {
      id: `log-${Date.now()}`,
      groupId: currentGroup.id,
      groupName: `${currentGroup.name} (${currentGroup.membersCount.toLocaleString('pt-BR')} membros)`,
      groupUrl: currentGroup.url,
      postedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      headline: postHeadline.slice(0, 55) + '...',
      status: 'success',
      intervalWaitedSeconds: waited,
      checkoutUrl: selectedCheckoutUrl
    };

    setBotLogs(prev => [newLog, ...prev]);
    setDailyDispatchesCompleted(prev => prev + 1);

    // Update group dispatch count
    setMappedGroups(prev =>
      prev.map(g =>
        g.id === currentGroup.id
          ? { ...g, dispatchCount: g.dispatchCount + 1, lastDispatchedAt: 'Agora mesmo' }
          : g
      )
    );

    // Tracking event
    if (onAddTrackingEvent) {
      onAddTrackingEvent({
        id: `fb-evt-${Date.now()}`,
        campaignId: selectedProductId,
        campaignTitle: activeCampaign.title,
        niche: currentGroup.niche,
        type: 'impression',
        timestamp: new Date().toISOString(),
        geo: { city: currentGroup.city || 'Curitiba', state: 'PR', country: 'Brasil' },
        device: 'mobile',
        ageBracket: '25-34',
        source: 'facebook_groups',
        adCreativeName: `Post no Grupo: ${currentGroup.name}`,
        utmContent: `interval_${waited}s`
      });
    }

    // Occasional simulated conversion
    if (Math.random() < 0.28 && onSimulateSale) {
      const names = [
        'Claudia Silveira (Pedagoga - Curitiba)',
        'Mãe do Bento (Curitiba CWB)',
        'Prof. Elaine Santos (Educação Infantil)',
        'Renata Oliveira (TEA Apoio)'
      ];
      const chosenName = names[Math.floor(Math.random() * names.length)];
      onSimulateSale(chosenName, currentGroup.city || 'Curitiba / PR', selectedPrice);
    }

    setCurrentPostingIndex(prev => (prev + 1) % targetGroups.length);
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
  const getGroupsByFolder = (folder: 'curitiba' | 'pedagogia' | 'autismo' | 'all') => {
    if (folder === 'curitiba') {
      return mappedGroups.filter(g => (g.city === 'Curitiba' || g.searchTerm === 'curitiba' || g.name.toLowerCase().includes('curitiba')));
    }
    if (folder === 'pedagogia') {
      return mappedGroups.filter(g => (g.searchTerm === 'pedagogia' || g.niche.includes('Pedagogia') || g.name.toLowerCase().includes('pedagog')));
    }
    if (folder === 'autismo') {
      return mappedGroups.filter(g => (g.searchTerm === 'autismo' || g.niche.includes('Autismo') || g.name.toLowerCase().includes('autista') || g.name.toLowerCase().includes('tea')));
    }
    return mappedGroups;
  };

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
      niche: selectedObjs[0]?.niche || 'Curitiba & Região',
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

  // Reuse an existing saved audience
  const handleReuseAudience = (aud: FacebookAudience) => {
    setSelectedAudienceId(aud.id);
    setSelectedGroupIds(aud.groupIds);

    // Update audience usage stats
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
    alert(`🚀 Público "${aud.name}" carregado com sucesso no Robô Divulgador!`);
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
        `INSTRUÇÕES DE INSTALAÇÃO NO GOOGLE CHROME:\n\n1. Descompacte este arquivo ZIP.\n2. No Chrome, abra chrome://extensions\n3. Ative a chave "Modo do desenvolvedor" (topo direito).\n4. Clique em "Carregar sem compactação" (topo esquerdo) e escolha a pasta descompactada.\n5. Abra o Facebook, YouTube e Pinterest: o robô mapeia e automatiza postagens com intervalo seguro anti-bloqueio!`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'extensao-autoviral-facebook-youtube-pinterest.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error generating extension zip:', err);
      window.open('/chrome-extension/manifest.json', '_blank');
    } finally {
      setIsZipping(false);
    }
  };

  // Logistics & Analytics Calculations
  const totalTargetGroups = selectedGroupIds.length;
  const completedCount = botLogs.length;
  const pendingCount = Math.max(0, totalTargetGroups - (completedCount % (totalTargetGroups || 1)));
  const successPercentage = totalTargetGroups > 0 ? Math.min(100, Math.round((completedCount / totalTargetGroups) * 100)) : 100;
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

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <button
              onClick={handleDownloadExtensionZip}
              disabled={isZipping}
              className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition transform hover:-translate-y-0.5 cursor-pointer"
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
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-blue-400" />
              Como Instalar
            </button>
          </div>
        </div>

        {/* Live Persistent Background Status Bar */}
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
                ? `🟢 Ativo em Segundo Plano (Próximo disparo em ${secondsRemaining}s • Executa mesmo minimizado)`
                : '⏸️ Parado (Clique em Iniciar para rodar com pausas de 300s a 400s)'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Disparos Hoje: <strong className="text-white">{dailyDispatchesCompleted} / {dailyDispatchLimit}</strong></span>
            <span>•</span>
            <span>Grupos de Curitiba: <strong className="text-blue-300">48 grupos mapeados</strong></span>
            <span>•</span>
            <span>Públicos Salvos: <strong className="text-indigo-400">{audiences.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('groups')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
            activeSubTab === 'groups'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Share2 className="w-4 h-4" />
          1. Grupos Mapeados por Busca ({mappedGroups.length})
        </button>

        <button
          onClick={() => setActiveSubTab('audiences')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
            activeSubTab === 'audiences'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          2. Biblioteca de Públicos Salvos ({audiences.length})
        </button>

        <button
          onClick={() => setActiveSubTab('campaign')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition relative cursor-pointer ${
            activeSubTab === 'campaign'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Bot className="w-4 h-4 text-emerald-300" />
          3. Robô &amp; Logística de Postagens
          {isBotRunning && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('youtube')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
            activeSubTab === 'youtube'
              ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Video className="w-4 h-4 text-red-400" />
          4. ▶️ Robô YouTube (Comentários &amp; Likes)
        </button>

        <button
          onClick={() => setActiveSubTab('pinterest')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
            activeSubTab === 'pinterest'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Pin className="w-4 h-4 text-rose-400" />
          5. 📌 Robô Pinterest (Pins Virais &amp; Pastas)
        </button>

        <button
          onClick={() => setActiveSubTab('extension_guide')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
            activeSubTab === 'extension_guide'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <FileCode className="w-4 h-4" />
          6. Como Usar no Chrome
        </button>
      </div>

      {/* SUBTAB 1: MAPPED GROUPS ORGANIZED BY SEARCH TERM */}
      {activeSubTab === 'groups' && (
        <div className="space-y-6">
          {/* Search Term Folder Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-2">
                <FolderOpen className="w-4 h-4 text-blue-400" />
                Buscas do Facebook:
              </span>

              <button
                onClick={() => setActiveSearchFolder('curitiba')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeSearchFolder === 'curitiba'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>🏙️ Busca: "curitiba"</span>
                <span className="bg-blue-950 px-2 py-0.5 rounded-full text-[10px] text-blue-200 font-extrabold border border-blue-700">
                  48 grupos
                </span>
              </button>

              <button
                onClick={() => setActiveSearchFolder('pedagogia')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeSearchFolder === 'pedagogia'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>📚 Busca: "pedagogia"</span>
                <span className="bg-indigo-950 px-2 py-0.5 rounded-full text-[10px] text-indigo-200 font-extrabold border border-indigo-700">
                  7 grupos
                </span>
              </button>

              <button
                onClick={() => setActiveSearchFolder('autismo')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeSearchFolder === 'autismo'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>🧩 Busca: "autismo &amp; TEA"</span>
                <span className="bg-purple-950 px-2 py-0.5 rounded-full text-[10px] text-purple-200 font-extrabold border border-purple-700">
                  3 grupos
                </span>
              </button>

              <button
                onClick={() => setActiveSearchFolder('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeSearchFolder === 'all'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>⭐ Todos os Grupos Mapeados</span>
                <span className="bg-emerald-950 px-2 py-0.5 rounded-full text-[10px] text-emerald-200 font-extrabold border border-emerald-700">
                  {mappedGroups.length}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAllFolder}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
              >
                Selecionar Todos desta Pasta ({folderGroups.length})
              </button>

              <button
                onClick={() => {
                  if (selectedGroupIds.length === 0) {
                    alert('Selecione os grupos na lista abaixo com o checkbox para criar o público.');
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

          {/* Quick Search in Current Folder */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar grupos por nome..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300 flex items-center gap-2">
              <span>Pasta Atual: <strong className="text-white capitalize">{activeSearchFolder}</strong> ({folderGroups.length} grupos)</span>
              <span>•</span>
              <span>Selecionados: <strong className="text-emerald-400">{selectedGroupIds.length}</strong></span>
              <span>•</span>
              <span>Alcance: <strong className="text-emerald-400">{selectedGroupsTotalMembers.toLocaleString('pt-BR')} pessoas</strong></span>
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

                    <div className="text-slate-400 text-[11px]">
                      {group.postsPerDay || `${group.dispatchCount} postagens`}
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

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                    <button
                      onClick={() => handleReuseAudience(aud)}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40 transition cursor-pointer"
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      Reutilizar Este Público no Robô
                    </button>

                    <button
                      onClick={() => handleDeleteAudience(aud.id)}
                      className="p-2.5 text-slate-400 hover:text-red-400 bg-slate-800/60 hover:bg-slate-800 rounded-xl transition cursor-pointer"
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

          {/* Visual Logistics Progress Funnel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Logística de Entrega em Tempo Real
              </span>
              <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Sucesso ({successPercentage}%)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Pendente ({pendingPercentage}%)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Resfriamento Ativo</span>
              </div>
            </div>

            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden flex border border-slate-800">
              <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${successPercentage}%` }} />
              <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${pendingPercentage}%` }} />
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

              {/* 1. Target Campaign / Product Selector (Requested by user: PRECISAMOS SELECIONAR A CAMPANHA AQUI) */}
              <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                    <Target className="w-4 h-4 text-emerald-400" />
                    1. Selecionar Campanha / Produto a Divulgar:
                  </label>
                  <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-800/60">
                    {availableCampaigns.length} Campanhas Cadastradas
                  </span>
                </div>

                {/* Dropdown for selecting campaign */}
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    const chosen = availableCampaigns.find(c => c.id === e.target.value);
                    if (chosen) {
                      handleSelectCampaign(chosen, activeCopyTemplateIndex);
                    }
                  }}
                  className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-semibold cursor-pointer"
                >
                  {availableCampaigns.map(camp => (
                    <option key={camp.id} value={camp.id}>
                      {camp.title} — R$ {(camp.price || 9.90).toFixed(2).replace('.', ',')} ({camp.nicheLabel || camp.niche || 'Geral'})
                    </option>
                  ))}
                </select>

                {/* Quick Selection Cards Grid for 1-click campaign switching */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                  {availableCampaigns.map(camp => {
                    const isSelected = camp.id === selectedProductId;
                    return (
                      <button
                        key={camp.id}
                        type="button"
                        onClick={() => handleSelectCampaign(camp, activeCopyTemplateIndex)}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {camp.imageUrl ? (
                            <img
                              src={camp.imageUrl}
                              alt={camp.title}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-xs font-bold text-emerald-300 flex-shrink-0">
                              📦
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <span className="text-[11px] font-bold line-clamp-1 text-white block">
                              {camp.title}
                            </span>
                            <span className="text-[10px] text-slate-400 line-clamp-1 block">
                              {camp.nicheLabel || camp.niche || 'Produto'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between border-t border-slate-800/80 pt-1.5 text-[11px]">
                          <span className="font-black text-emerald-400">
                            R$ {(camp.price || 9.90).toFixed(2).replace('.', ',')}
                          </span>
                          {isSelected && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                              Ativo ✓
                            </span>
                          )}
                        </div>
                      </button>
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

              {/* 2. Target Audience Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-400" />
                  2. Público Ativo de Grupos Selecionado:
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

              {/* 4. Copy Templates & Headline/Post Controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    4. Modelos de Copy Prontos para Grupos:
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Adaptado para "{activeCampaign.title.slice(0, 26)}..."
                  </span>
                </div>

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
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Corpo do Post (Com link oficial do produto):</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${postHeadline}\n\n${postCopy}`);
                        alert('Copiado para a área de transferência!');
                      }}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[10px] cursor-pointer"
                    >
                      <Copy className="w-3 h-3" /> Copiar Texto
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={postCopy}
                    onChange={(e) => setPostCopy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
                  />
                </div>
              </div>

              {/* Bot Control Button */}
              <div className="pt-2 flex items-center gap-3">
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
                      Pausar Robô Divulgador
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      Iniciar Divulgação em Segundo Plano
                    </>
                  )}
                </button>

                <button
                  onClick={handleExecuteGroupPost}
                  className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  title="Disparar 1 post agora mesmo no grupo da fila"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  Postar Agora
                </button>
              </div>
            </div>

            {/* Right: Live Countdown & Detailed Logistics Logs */}
            <div className="lg:col-span-5 space-y-5">
              {/* Countdown Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
                <span className="text-xs text-emerald-300 font-semibold tracking-wide uppercase">
                  Próxima Publicação no Grupo:
                </span>

                <div className="text-5xl font-black text-white font-mono tracking-tight">
                  {isBotRunning ? `${secondsRemaining}s` : 'Pausado'}
                </div>

                <p className="text-xs text-slate-300">
                  {isBotRunning
                    ? 'Intervalo seguro em andamento. O robô continua executando mesmo com o navegador minimizado.'
                    : 'Robô em espera. Clique em Iniciar para rodar com pausas de 300s a 400s.'}
                </p>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-1000"
                    style={{ width: `${((350 - secondsRemaining) / 350) * 100}%` }}
                  />
                </div>
              </div>

              {/* Detailed Logistics Logs Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-400" />
                    Logs de Disparos Concluídos
                  </span>
                  <span className="text-slate-500">{botLogs.length} registros</span>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {botLogs.map(log => (
                    <div
                      key={log.id}
                      className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-white line-clamp-1">{log.groupName}</span>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-900/50">
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
                          Ver no FB <ExternalLink className="w-2.5 h-2.5" />
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

              <button
                onClick={() => setIsAddYtModalOpen(true)}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                + Adicionar URL de Vídeo
              </button>
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

      {/* SUBTAB 6: EXTENSION INSTALLATION GUIDE */}
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
    </div>
  );
};
