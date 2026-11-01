import React, { useState, useEffect } from 'react';
import {
  Users,
  Compass,
  Instagram,
  Send,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Zap,
  Target,
  MessageCircle,
  ShieldCheck,
  Flame,
  ArrowRight,
  TrendingUp,
  Share2,
  BookOpen,
  Heart,
  FileText,
  Pin,
  Search,
  Filter,
  DollarSign,
  Layers,
  GraduationCap,
  Utensils,
  Dog,
  Clock,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Smartphone,
  AtSign,
  UserPlus,
  Trash2,
  UserCheck,
  Edit3,
  Sliders,
  PlusCircle,
  Save,
  Edit2,
  Wand2,
  Download,
  Image as ImageIcon,
  Tag,
  ShoppingBag,
  Smile,
  Eye,
} from 'lucide-react';
import { Campaign } from '../types';
import {
  subscribeCustomProfiles,
  saveCustomProfileToFirebase,
  deleteCustomProfileFromFirebase,
  InstagramOriginAccount,
  saveInstagramOriginAccountToFirebase,
  subscribeInstagramOriginAccount,
  saveDispatchTemplateToFirebase,
  subscribeDispatchTemplates,
  DispatchTemplateSettings,
} from '../lib/firebase';
import { getCampaignSlug } from '../utils/campaignSlug';

interface LeadFinderTabProps {
  campaigns: Campaign[];
}

export interface TargetProfile {
  handle: string;
  name: string;
  url: string;
  audience: string;
  focus: string;
  whatToLook: string;
  script: string;
  isCustom?: boolean;
}

interface NicheData {
  id: string;
  label: string;
  badge: string;
  iconName: string;
  description: string;
  replyRushKeyword: string;
  replyRushMessage: string;
  pinterestSearchTerms: string[];
  profiles: TargetProfile[];
}

export const LeadFinderTab: React.FC<LeadFinderTabProps> = ({ campaigns }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'pinterest' | 'tiktok'>('instagram');
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('pedagogia');
  const [searchQuery, setSearchQuery] = useState('');
  const [handleSearchInput, setHandleSearchInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedProfileIndex, setSelectedProfileIndex] = useState(0);
  const [successAddedHandle, setSuccessAddedHandle] = useState<string | null>(null);

  // Custom added @ profiles by the user (synced across all browsers with Firebase Cloud)
  const [customProfiles, setCustomProfiles] = useState<TargetProfile[]>(() => {
    try {
      const saved = localStorage.getItem('autoviral_custom_instagram_profiles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  // Real-time multi-browser cloud subscription for custom @ profiles
  useEffect(() => {
    const unsub = subscribeCustomProfiles((cloudProfiles) => {
      if (cloudProfiles && Array.isArray(cloudProfiles) && cloudProfiles.length > 0) {
        setCustomProfiles(cloudProfiles);
        try {
          localStorage.setItem(
            'autoviral_custom_instagram_profiles',
            JSON.stringify(cloudProfiles)
          );
        } catch {}
      }
    });
    return () => unsub();
  }, []);

  // Default Origin (Sender) Profiles State (synced across all browsers with Firebase Cloud)
  const [originAccounts, setOriginAccounts] = useState<InstagramOriginAccount[]>(() => {
    try {
      const saved = localStorage.getItem('autoviral_instagram_origin_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        handle: '@marcellospropaganda',
        name: 'Perfil Principal (Oficial)',
        status: 'active',
        dailyLimit: 20,
        sentToday: 0,
      },
    ];
  });

  const [activeOriginIndex, setActiveOriginIndex] = useState<number>(0);
  const [isEditingOrigin, setIsEditingOrigin] = useState<boolean>(false);
  const [newOriginInput, setNewOriginInput] = useState<string>('');
  const [newOriginNameInput, setNewOriginNameInput] = useState<string>('');
  const [newOriginStatus, setNewOriginStatus] = useState<'active' | 'warmup' | 'resting'>('active');
  const [autoRotateOrigins, setAutoRotateOrigins] = useState<boolean>(false);

  // Real-time multi-browser cloud subscription for origin Instagram account
  useEffect(() => {
    const unsub = subscribeInstagramOriginAccount((cloudOrigin) => {
      if (cloudOrigin && cloudOrigin.handle) {
        setOriginAccounts((prev) => {
          const list = cloudOrigin.accountsList && cloudOrigin.accountsList.length > 0
            ? cloudOrigin.accountsList
            : [cloudOrigin];
          try {
            localStorage.setItem('autoviral_instagram_origin_accounts', JSON.stringify(list));
          } catch {}
          return list;
        });
      }
    });
    return () => unsub();
  }, []);

  const handleSaveOriginAccounts = (updatedAccounts: InstagramOriginAccount[]) => {
    setOriginAccounts(updatedAccounts);
    try {
      localStorage.setItem('autoviral_instagram_origin_accounts', JSON.stringify(updatedAccounts));
    } catch {}
    const active = updatedAccounts[activeOriginIndex] || updatedAccounts[0];
    if (active) {
      saveInstagramOriginAccountToFirebase({
        ...active,
        accountsList: updatedAccounts,
      }).catch(console.warn);
    }
  };

  const handleAddNewOriginAccount = () => {
    let clean = newOriginInput.trim().replace(/^@+/, '');
    if (!clean) return;
    const formatted = `@${clean}`;

    const newAcc: InstagramOriginAccount = {
      handle: formatted,
      name: newOriginNameInput.trim() || `Conta ${originAccounts.length + 1}`,
      status: newOriginStatus,
      dailyLimit: newOriginStatus === 'active' ? 20 : 10,
      sentToday: 0,
    };

    const exists = originAccounts.some((a) => a.handle.toLowerCase() === formatted.toLowerCase());
    const updated = exists
      ? originAccounts.map((a) => (a.handle.toLowerCase() === formatted.toLowerCase() ? newAcc : a))
      : [...originAccounts, newAcc];

    handleSaveOriginAccounts(updated);
    if (!exists) {
      setActiveOriginIndex(updated.length - 1);
    }
    setNewOriginInput('');
    setNewOriginNameInput('');
    setIsEditingOrigin(false);
  };

  const handleRemoveOriginAccount = (indexToRemove: number) => {
    if (originAccounts.length <= 1) return;
    const updated = originAccounts.filter((_, i) => i !== indexToRemove);
    handleSaveOriginAccounts(updated);
    setActiveOriginIndex(0);
  };

  const handleResetOriginCounter = () => {
    const updated = originAccounts.map((a, i) => (i === activeOriginIndex ? { ...a, sentToday: 0 } : a));
    handleSaveOriginAccounts(updated);
  };

  const currentOriginAccount = originAccounts[activeOriginIndex] || originAccounts[0] || {
    handle: '@marcellospropaganda',
    name: 'Perfil Principal (Oficial)',
    status: 'active' as const,
    dailyLimit: 20,
    sentToday: 0,
  };

  // Anti-Ban Automated Dispatch Queue States
  const [selectedHandles, setSelectedHandles] = useState<string[]>([
    '@redepedagogica',
    '@taiseagostini',
    '@psicopedagogiandope',
    '@autismoerealidade',
  ]);
  const [safeIntervalMinutes, setSafeIntervalMinutes] = useState<number>(5);
  const [isQueueActive, setIsQueueActive] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300);
  const [currentQueueIndex, setCurrentQueueIndex] = useState<number>(0);
  const [dispatchLogs, setDispatchLogs] = useState<
    Array<{ id: string; originHandle: string; handle: string; time: string; variation: string; status: 'sent' }>
  >([]);

  // Spin-Syntax Message Variations (Anti-Spam Algorithm Protection)
  const [spinTemplates, setSpinTemplates] = useState<string[]>([
    'Olá {nome}! Vi suas postagens sobre {foco} e achei o conteúdo incrível. Sei o quanto dá trabalho criar atividades inclusivas do zero... criei um caderno com + 100 tarefinhas lúdicas em PDF prontas para imprimir (com foco em autismo/TEA e coordenação motora) que está por apenas R$ 9,90 na Hotmart. Se quiser conhecer: https://robo-trafego.vercel.app/?p=tarefinhas&src=outreach_insta',
    'Oi profe/mamãe {nome}! Tudo bem? Estava acompanhando seus posts dedicados à educação infantil. Desenvolvemos um kit com + 100 atividades lúdicas em PDF prontas para imprimir para economizar horas de planejamento. Deixei o link da página aqui se quiser ver: https://robo-trafego.vercel.app/?p=tarefinhas&src=outreach_insta',
    'Olá querida {nome}! Parabéns pelo lindo trabalho com as crianças. Se você procura materiais práticos que prendam a atenção de crianças com TEA ou TDAH sem causar estresse, esse caderno com 100 tarefinhas inclusivas para imprimir está com valor promocional de R$ 9,90: https://robo-trafego.vercel.app/?p=tarefinhas&src=outreach_insta',
  ]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Pre-configured rich databases of top Brazilian segments
  const catalogNiches: Record<string, NicheData> = {
    pedagogia: {
      id: 'pedagogia',
      label: 'Pedagogia & Autismo (TEA)',
      badge: 'Material Pronto em PDF - R$ 9,90',
      iconName: 'heart',
      description: 'Professoras de educação infantil, psicopedagogas e mães atípicas buscando atividades prontas para imprimir para TEA e TDAH.',
      replyRushKeyword: 'EU QUERO',
      replyRushMessage: `Olá, profe/mamãe! 🎨📚 Vi que você comentou querendo as tarefinhas inclusivas para Educação Infantil e Autismo (TEA).\n\nPreparei a página com o material completo pronto para imprimir (+ 100 tarefinhas por apenas R$ 9,90):\n👉 https://robo-trafego.vercel.app/?p=tarefinhas&src=replyrush\n\nSe tiver qualquer dúvida pedagógica ou sobre os arquivos, pode me chamar direto no meu WhatsApp oficial:\n📲 https://wa.me/5541998778348?text=Oi!%20Vim%20pelo%20Instagram%20das%20tarefinhas%20de%20autismo!`,
      pinterestSearchTerms: [
        'atividades autismo educação infantil pdf',
        'tarefinhas autismo para imprimir',
        'atividades coordenação motora fina imprimir',
        'jogos pedagógicos autismo e tdah',
        'atividades alfabetização educação infantil',
      ],
      profiles: [
        {
          handle: '@redepedagogica',
          name: 'Rede Pedagógica',
          url: 'https://www.instagram.com/redepedagogica/',
          audience: '1.3M seguidoras',
          focus: 'A maior rede de professoras e pedagogas do Brasil',
          whatToLook: 'Abra os posts sobre "atividades para sala de aula" e "inclusão escolar". Os comentários estão cheios de professoras cansadas pedindo ideias prontas.',
          script: `Oi profe! Vi que você comentou lá no post procurando atividades adaptadas... se você quiser economizar tempo, eu tenho um pacote com + 100 tarefinhas lúdicas em PDF prontas para imprimir (inclusive autismo/TEA) por apenas R$ 9,90: https://robo-trafego.vercel.app/?p=tarefinhas&src=outreach_direct`,
        },
        {
          handle: '@taiseagostini',
          name: 'Taise Agostini',
          url: 'https://www.instagram.com/taiseagostini/',
          audience: '1.8M seguidoras',
          focus: 'Educação Infantil, recursos lúdicos e alfabetização',
          whatToLook: 'Professoras pedindo moldes e atividades de coordenação motora e vogais.',
          script: `Olá! Vi seu comentário no post da Taise sobre atividades lúdicas. Desenvolvi um kit com mais de 100 tarefinhas em PDF prontas para imprimir para Educação Infantil e crianças atípicas (R$ 9,90): https://robo-trafego.vercel.app/?p=tarefinhas&src=outreach_direct`,
        },
        {
          handle: '@psicopedagogiandope',
          name: 'Psicopedagogiando PE',
          url: 'https://www.instagram.com/psicopedagogiandope/',
          audience: '210k seguidoras',
          focus: 'Psicopedagogia clínica e institucional, intervenção TEA e TDAH',
          whatToLook: 'Psicopedagogas e mães atípicas tirando dúvidas sobre materiais de estimulação cognitiva.',
          script: `Olá! Vi sua dúvida sobre materiais de intervenção para crianças atípicas. Esse material com +100 tarefinhas adaptadas em PDF para autismo e coordenação motora pode te ajudar bastante: https://robo-trafego.vercel.app/?p=tarefinhas&src=outreach_direct`,
        },
        {
          handle: '@autismoerealidade',
          name: 'Autismo e Realidade',
          url: 'https://www.instagram.com/autismoerealidade/',
          audience: '190k seguidores',
          focus: 'Famílias atípicas, mães de crianças com TEA e terapeutas',
          whatToLook: 'Mães desabafando sobre a dificuldade de prender a atenção dos filhos nas tarefas escolares.',
          script: `Olá, mamãe! Sei o quanto pode ser desafiador encontrar atividades que prendam a atenção dos nossos pequenos atípicos. Esse caderno com 100 tarefinhas com pistas visuais para imprimir me ajudou demais: https://robo-trafego.vercel.app/?p=tarefinhas&src=outreach_direct`,
        },
        {
          handle: '@mamae_educadora',
          name: 'Mamãe Educadora',
          url: 'https://www.instagram.com/mamae_educadora/',
          audience: '350k seguidoras',
          focus: 'Atividades infantis para imprimir e fazer em casa',
          whatToLook: 'Mães e professoras pedindo o arquivo em PDF para imprimir.',
          script: `Oi! Vi seu comentário no post querendo atividades em PDF. Esse material com 100 atividades lúdicas para imprimir tá com promoção hoje por R$ 9,90: https://robo-trafego.vercel.app/?p=tarefinhas&src=outreach_direct`,
        },
        {
          handle: '@espaco_inclusivo_tea',
          name: 'Espaço Inclusivo TEA',
          url: 'https://www.instagram.com/explore/tags/autismoinfantil/',
          audience: '115k seguidores',
          focus: 'Terapia ocupacional, intervenção precoce e materiais inclusivos',
          whatToLook: 'Mães atípicas procurando recursos visuais e fichas de rotina.',
          script: `Olá! Vi seu interesse em materiais de apoio para desenvolvimento infantil. Temos um caderno com 100 tarefas estruturadas em PDF por R$ 9,90: https://robo-trafego.vercel.app/?p=tarefinhas&src=outreach_direct`,
        },
      ],
    },
    milhas: {
      id: 'milhas',
      label: 'Milhas & Viagens Lucrativas',
      badge: 'Renda Extra & Cartões - R$ 385',
      iconName: 'zap',
      description: 'Pessoas com gastos no cartão buscando transformar pontos em dinheiro vivo ou viajar pagando quase nada.',
      replyRushKeyword: 'MILHAS',
      replyRushMessage: `Opa! ✈️ Vi que você comentou querendo transformar seus gastos em dinheiro no bolso com milhas.\n\nLiberamos as vagas da Comunidade Milhas 3.0 com suporte direto:\n👉 https://robo-trafego.vercel.app/?p=milhas&src=replyrush\n\nSe quiser tirar dúvidas direto comigo no WhatsApp:\n📲 https://wa.me/5541998778348?text=Oi!%20Vim%20pelo%20Instagram%20das%20milhas!`,
      pinterestSearchTerms: [
        'como juntar milhas no cartão de crédito',
        'como vender milhas passo a passo',
        'como viajar barato usando pontos',
        'compras bonificadas livelo e esfera',
      ],
      profiles: [
        {
          handle: '@estevampelomundo',
          name: 'Estevam Pelo Mundo',
          url: 'https://www.instagram.com/estevampelomundo/',
          audience: '1.9M seguidores',
          focus: 'Dicas de viagens e emissões com milhas',
          whatToLook: 'Pessoas comentando que o cartão pontua pouco ou querendo aprender a vender pontos.',
          script: `Opa! Vi seu comentário sobre querer lucrar com compras do dia a dia... na Comunidade Milhas ensinamos como pontuar até 10x sem cartão black: https://robo-trafego.vercel.app/?p=milhas&src=outreach_direct`,
        },
        {
          handle: '@passageirodeprimeira',
          name: 'Passageiro de Primeira',
          url: 'https://www.instagram.com/passageirodeprimeira/',
          audience: '680k seguidores',
          focus: 'Programas de fidelidade e promoções de transferência bonificada',
          whatToLook: 'Seguidores em dúvida se vale a pena assinar clubes Livelo e Smiles.',
          script: `Olá! Vi sua dúvida sobre a promoção de transferência bonificada. A gente calcula a margem líquida exata de lucro na Comunidade: https://robo-trafego.vercel.app/?p=milhas&src=outreach_direct`,
        },
      ],
    },
    emagrecimento: {
      id: 'emagrecimento',
      label: 'Emagrecimento & Bem-Estar',
      badge: 'Chás & Detox Natural',
      iconName: 'flame',
      description: 'Mulheres que sofrem com inchaço, efeito sanfona e falta de tempo para academias caras.',
      replyRushKeyword: 'DETOX',
      replyRushMessage: `Oi linda! 🥗 Vi que você comentou querendo o protocolo natural para desinchar.\n\nLiberamos o passo a passo com cardápios e chás no valor promocional:\n👉 https://robo-trafego.vercel.app/?src=replyrush\n\nQualquer dúvida me chama no WhatsApp: 📲 https://wa.me/5541998778348`,
      pinterestSearchTerms: [
        'receitas secar barriga em casa',
        'cardápio detox 21 dias',
        'como desinchar rápido',
        'chás naturais para emagrecer',
      ],
      profiles: [
        {
          handle: '@receitasfit.emagrecer',
          name: 'Receitas Fit & Emagrecer',
          url: 'https://www.instagram.com/explore/tags/receitasfit/',
          audience: '950k seguidoras',
          focus: 'Receitas saudáveis e dietas práticas',
          whatToLook: 'Mulheres comentando que não têm tempo para cozinhar ou que não aguentam mais o efeito sanfona.',
          script: `Oi! Vi seu comentário no post sobre a dificuldade de manter a dieta... montei um guia com receitas de 15 minutos e chás naturais para desinchar: https://robo-trafego.vercel.app/?src=outreach_direct`,
        },
      ],
    },
  };

  // Determine active niche data or dynamically synthesize
  const currentNicheData: NicheData = catalogNiches[selectedSegmentId] || {
    id: selectedSegmentId,
    label: selectedSegmentId.toUpperCase(),
    badge: 'Mineração Personalizada',
    iconName: 'sparkles',
    description: `Pessoas interessadas em ${selectedSegmentId} no Instagram, Pinterest e TikTok.`,
    replyRushKeyword: selectedSegmentId.slice(0, 8).toUpperCase(),
    replyRushMessage: `Olá! Vi seu interesse em ${selectedSegmentId}.\n\nPreparei um material prático com valor promocional:\n👉 https://robo-trafego.vercel.app/?niche=${encodeURIComponent(selectedSegmentId)}&src=replyrush\n\nDúvidas? Fale direto no WhatsApp: 📲 https://wa.me/5541998778348`,
    pinterestSearchTerms: [
      `como aprender ${selectedSegmentId} passo a passo`,
      `dicas de ${selectedSegmentId} para iniciantes`,
      `melhores ideias de ${selectedSegmentId}`,
      `guia prático de ${selectedSegmentId}`,
    ],
    profiles: [
      {
        handle: `@explorar.${selectedSegmentId.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        name: `Comunidade ${selectedSegmentId}`,
        url: `https://www.instagram.com/explore/tags/${encodeURIComponent(selectedSegmentId)}/`,
        audience: '500k+ interessados',
        focus: `Público interessado em novidades sobre ${selectedSegmentId}`,
        whatToLook: `Comentários de pessoas com dúvidas práticas sobre ${selectedSegmentId}.`,
        script: `Olá! Vi sua dúvida sobre ${selectedSegmentId}. Temos uma solução prática em PDF para isso: https://robo-trafego.vercel.app/?niche=${encodeURIComponent(selectedSegmentId)}&src=outreach_direct`,
      },
    ],
  };

  // Custom Editable Dispatch Message & Keyword for ReplyRush & Outgoing Directs
  const [customDispatchTemplates, setCustomDispatchTemplates] = useState<
    Record<string, { keyword: string; message: string }>
  >(() => {
    try {
      const saved = localStorage.getItem('autoviral_dispatch_templates');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const [editingKeyword, setEditingKeyword] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('autoviral_dispatch_templates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed['pedagogia']?.keyword) return parsed['pedagogia'].keyword;
      }
    } catch {}
    return 'EU QUERO';
  });

  const [editingMessage, setEditingMessage] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('autoviral_dispatch_templates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed['pedagogia']?.message) return parsed['pedagogia'].message;
      }
    } catch {}
    return `Olá, profe/mamãe! 🎨📚 Vi que você comentou querendo as tarefinhas inclusivas para Educação Infantil e Autismo (TEA).\n\nPreparei a página com o material completo pronto para imprimir (+ 100 tarefinhas por apenas R$ 9,90):\n👉 https://robo-trafego.vercel.app/?p=tarefinhas&src=replyrush\n\nSe tiver qualquer dúvida pedagógica ou sobre os arquivos, pode me chamar direto no meu WhatsApp oficial:\n📲 https://wa.me/5541998778348?text=Oi!%20Vim%20pelo%20Instagram%20das%20tarefinhas%20de%20autismo!`;
  });

  const [selectedCampaignForDispatch, setSelectedCampaignForDispatch] = useState<string>(
    campaigns[0]?.id || 'camp-tarefinhas-autismo'
  );
  const [dispatchSavedSuccess, setDispatchSavedSuccess] = useState<boolean>(false);
  const [editingSpinIndex, setEditingSpinIndex] = useState<number | null>(null);
  const [tempSpinText, setTempSpinText] = useState<string>('');

  // Active campaign referenced across all sections of LeadFinderTab
  const activeCampaign =
    campaigns.find((c) => c.id === selectedCampaignForDispatch) ||
    campaigns[0] || {
      id: 'camp-default',
      title: 'Atividades Cognitivas para Crianças',
      price: 9.99,
      oldPrice: 47.00,
      nicheLabel: 'Educação Infantil',
      imageUrl: '/assets/aistudio/image_e9e67204.png',
      whatsappNumber: '5541998778348',
    };

  // Profile-specific script overrides (allows editing the script for any profile and remembering edits)
  const [profileScriptOverrides, setProfileScriptOverrides] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('autoviral_profile_script_overrides');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const [isEditingTargetScript, setIsEditingTargetScript] = useState<boolean>(false);
  const [tempTargetScriptText, setTempTargetScriptText] = useState<string>('');
  const [targetScriptSavedSuccess, setTargetScriptSavedSuccess] = useState<boolean>(false);
  const [showDirectMockup, setShowDirectMockup] = useState<boolean>(false);
  const [copyImageSuccess, setCopyImageSuccess] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // Smart Auto-Copywriter & Persuasive CTA Generator States
  // ---------------------------------------------------------------------------
  type TargetAudiencePersona = 'mae' | 'prof' | 'educador' | 'profissional' | 'todos';
  const [selectedPersona, setSelectedPersona] = useState<TargetAudiencePersona>('todos');
  const [generatorTitle, setGeneratorTitle] = useState<string>('');
  const [generatorPrice, setGeneratorPrice] = useState<string>('');
  const [generatorOldPrice, setGeneratorOldPrice] = useState<string>('47,00');
  const [generatorLinkType, setGeneratorLinkType] = useState<'landing' | 'checkout'>('landing');
  const [generatorCustomLink, setGeneratorCustomLink] = useState<string>('');
  const [generatorIncludeImage, setGeneratorIncludeImage] = useState<boolean>(true);
  const [generatorCtaGoal, setGeneratorCtaGoal] = useState<'facilidade' | 'urgencia' | 'whatsapp' | 'garantia'>('facilidade');
  const [generatorImagePreviewUrl, setGeneratorImagePreviewUrl] = useState<string>('/assets/aistudio/image_e9e67204.png');
  const [generatedCopies, setGeneratedCopies] = useState<
    Array<{ id: string; title: string; text: string; badge: string; hook: string }>
  >([]);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState<boolean>(true);

  // Sync generator form fields whenever selectedCampaignForDispatch or generatorLinkType changes
  useEffect(() => {
    const activeCamp =
      campaigns.find((c) => c.id === selectedCampaignForDispatch) || campaigns[0];
    if (activeCamp) {
      setGeneratorTitle(activeCamp.title || 'Atividades Cognitivas para Crianças');
      setGeneratorPrice(activeCamp.price ? activeCamp.price.toFixed(2).replace('.', ',') : '9,99');
      setGeneratorOldPrice(activeCamp.oldPrice ? activeCamp.oldPrice.toFixed(2).replace('.', ',') : '47,00');
      const slug = getCampaignSlug(activeCamp);
      const landingLink = `${window.location.origin}/?p=${slug}&src=replyrush`;
      const checkoutLink = activeCamp.checkoutUrl || 'https://pay.hotmart.com/U95248783T';
      setGeneratorCustomLink(generatorLinkType === 'checkout' ? checkoutLink : landingLink);
      setGeneratorImagePreviewUrl(activeCamp.imageUrl || '/assets/aistudio/image_e9e67204.png');
    }
  }, [selectedCampaignForDispatch, generatorLinkType, campaigns]);

  // Resolves the effective prospecting script dynamically adapted to the active campaign or custom edit
  const getEffectiveScript = (profile: TargetProfile): string => {
    const handleKey = profile.handle.toLowerCase();
    // 1. If user edited this script manually, respect user's edit
    if (profileScriptOverrides[handleKey]) {
      return profileScriptOverrides[handleKey];
    }
    // 2. If it's a custom profile added by user and doesn't contain obsolete default link, use its script
    if (profile.isCustom && profile.script && !profile.script.includes('p=tarefinhas&src=outreach_arroba')) {
      return profile.script;
    }

    // 3. Dynamically generate clean script tailored to activeCampaign
    const campTitle = activeCampaign.title || 'Material Digital Educativo';
    const campPrice = `R$ ${(activeCampaign.price || 9.99).toFixed(2).replace('.', ',')}`;
    const slug = getCampaignSlug(activeCampaign);
    const link = `${window.location.origin}/?p=${slug}&src=outreach_direct`;

    if (profile.handle === '@redepedagogica') {
      return `Oi profe! Vi que você comentou lá no post procurando atividades... se você quiser economizar tempo, eu tenho o material "${campTitle}" pronto em PDF para imprimir por apenas ${campPrice}: ${link}`;
    }
    if (profile.handle === '@taiseagostini') {
      return `Olá! Vi seu comentário no post da Taise sobre atividades lúdicas. Desenvolvemos o "${campTitle}" em PDF de alta qualidade por apenas ${campPrice}: ${link}`;
    }
    if (profile.handle === '@psicopedagogiandope') {
      return `Olá! Vi sua dúvida sobre materiais de apoio e intervenção para crianças. O material "${campTitle}" em PDF pode te ajudar bastante: ${link}`;
    }
    if (profile.handle === '@autismoerealidade') {
      return `Olá, mamãe! Sei o quanto pode ser desafiador encontrar atividades estruturadas para prender a atenção dos nossos pequenos. O material "${campTitle}" foi pensado nisso e está com valor promocional de ${campPrice}: ${link}`;
    }
    return `Olá ${profile.name}! Acompanho seu trabalho no Instagram e acho maravilhosa sua dedicação. Desenvolvemos o material "${campTitle}" com acesso completo em PDF pronto para imprimir por apenas ${campPrice}. Deixei a amostra e informações aqui: ${link}`;
  };

  // Save customized script for current profile (across state, localStorage & Firebase)
  const handleSaveTargetScript = (profile: TargetProfile, newScriptText: string) => {
    const handleKey = profile.handle.toLowerCase();
    const updatedOverrides = {
      ...profileScriptOverrides,
      [handleKey]: newScriptText,
    };
    setProfileScriptOverrides(updatedOverrides);
    try {
      localStorage.setItem('autoviral_profile_script_overrides', JSON.stringify(updatedOverrides));
    } catch {}

    // If it's a custom profile, update in customProfiles and sync with Firebase
    if (profile.isCustom) {
      const updatedProfile = { ...profile, script: newScriptText };
      setCustomProfiles((prev) =>
        prev.map((p) => (p.handle.toLowerCase() === handleKey ? updatedProfile : p))
      );
      saveCustomProfileToFirebase(updatedProfile).catch(console.warn);
    }

    setTargetScriptSavedSuccess(true);
    setIsEditingTargetScript(false);
    setTimeout(() => setTargetScriptSavedSuccess(false), 3000);
  };

  // Reset target profile script to active product template
  const handleResetTargetScriptToActiveCampaign = (profile: TargetProfile) => {
    const handleKey = profile.handle.toLowerCase();
    const campTitle = activeCampaign.title || 'Material Digital';
    const campPrice = `R$ ${(activeCampaign.price || 9.99).toFixed(2).replace('.', ',')}`;
    const slug = getCampaignSlug(activeCampaign);
    const link = `${window.location.origin}/?p=${slug}&src=outreach_direct`;
    const defaultTemplate = `Olá ${profile.name}! Acompanho seu trabalho no Instagram e acho maravilhosa sua dedicação. Desenvolvemos o material "${campTitle}" com acesso completo em PDF pronto para imprimir por apenas ${campPrice}. Deixei a amostra e informações aqui: ${link}`;

    handleSaveTargetScript(profile, defaultTemplate);
  };

  // Adapt Section 1 Spin-Syntax variations to active campaign
  const handleAdaptSpinTemplatesToActiveCampaign = () => {
    const campTitle = activeCampaign.title || 'Material Digital';
    const priceStr = `R$ ${(activeCampaign.price || 9.99).toFixed(2).replace('.', ',')}`;
    const slug = getCampaignSlug(activeCampaign);
    const link = `${window.location.origin}/?p=${slug}&src=outreach_insta`;

    const newSpin = [
      `Olá {nome}! Vi suas postagens sobre {foco} e achei o conteúdo incrível. Sei o quanto dá trabalho criar materiais do zero... desenvolvemos o "${campTitle}" em PDF pronto para imprimir por apenas ${priceStr}. Se quiser conhecer: ${link}`,
      `Oi profe/mamãe {nome}! Tudo bem? Estava acompanhando seus posts dedicados à educação e crianças. Desenvolvemos o "${campTitle}" em alta resolução para economizar horas de planejamento por ${priceStr}. Deixei o link da página aqui: ${link}`,
      `Olá querida {nome}! Parabéns pelo lindo trabalho com as crianças. Se você procura materiais práticos e envolventes, o "${campTitle}" está com valor promocional de ${priceStr}: ${link}`,
    ];
    setSpinTemplates(newSpin);
    try {
      localStorage.setItem('autoviral_spin_templates', JSON.stringify(newSpin));
    } catch {}
  };

  // Copy product cover image directly to system clipboard as image blob (for Ctrl+V in Instagram/WhatsApp)
  const handleCopyImageToClipboard = async (customUrl?: string) => {
    const imgUrl = customUrl || generatorImagePreviewUrl || activeCampaign.imageUrl || '/assets/aistudio/image_e9e67204.png';
    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const objUrl = URL.createObjectURL(blob);
      img.src = objUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 600;
      canvas.height = img.naturalHeight || 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(async (pngBlob) => {
          URL.revokeObjectURL(objUrl);
          if (pngBlob) {
            try {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': pngBlob }),
              ]);
              setCopyImageSuccess(true);
              setCopiedId('copy-img-clipboard');
              setTimeout(() => {
                setCopyImageSuccess(false);
                setCopiedId(null);
              }, 4000);
            } catch (err) {
              console.warn('Clipboard write error, fallback to URL:', err);
              copyToClipboard(imgUrl, 'copy-img-clipboard');
            }
          }
        }, 'image/png');
      }
    } catch (err) {
      console.warn('Erro ao copiar imagem:', err);
      const fullUrl = imgUrl.startsWith('http') ? imgUrl : `${window.location.origin}${imgUrl}`;
      copyToClipboard(fullUrl, 'copy-img-clipboard');
    }
  };

  const handleGeneratePersuasiveMessages = () => {
    const activeCamp =
      campaigns.find((c) => c.id === selectedCampaignForDispatch) || campaigns[0];
    const title = generatorTitle.trim() || activeCamp?.title || '+ 100 Tarefinha Educação Infantil e Autismo';
    const price = generatorPrice.trim() || '9,90';
    const oldPrice = generatorOldPrice.trim() || '47,00';
    const link = generatorCustomLink.trim() || `${window.location.origin}/?p=tarefinhas&src=replyrush`;
    const whatsapp = activeCamp?.whatsappNumber || '5541998778348';
    const cleanPhone = whatsapp.replace(/[^0-9]/g, '');
    const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Oi! Vim pelo Instagram sobre o material "${title}"`)}`;

    let salutation = 'Olá, profe/mamãe! 🎨📚';
    let painContext = 'Vi que você comentou querendo as atividades inclusivas para Educação Infantil e Autismo (TEA).';
    let benefitSolution = `Preparei o caderno digital com + 100 atividades lúdicas em PDF prontas para imprimir, feitas para estimular foco, linguagem e coordenação motora fina sem sobrecarga sensorial.`;

    if (selectedPersona === 'mae') {
      salutation = 'Olá, mamãe! 💖🌸';
      painContext = 'Vi seu comentário no post! Sei como a rotina com os pequenos pode ser exaustiva e como nos preocupamos em estimular a fala, foco e coordenação sem telas ou crises de choro.';
      benefitSolution = `O "${title}" foi desenhado para você aplicar em casa com 15 minutos por dia, com materiais visuais limpos e fáceis de entender.`;
    } else if (selectedPersona === 'prof') {
      salutation = 'Olá, professora! 👩‍🏫🍎';
      painContext = 'Vi seu comentário querendo materiais práticos! Sei o quanto cansa passar o fim de semana procurando atividades e ainda precisar adaptar folhas do zero para alunos com TEA e TDAH.';
      benefitSolution = `Com o "${title}", você tem fichas estruturadas alinhadas à BNCC e inclusão prática em PDF de alta qualidade, prontas para imprimir para toda a turma.`;
    } else if (selectedPersona === 'educador') {
      salutation = 'Olá, colega educador(a)! 🧩🧠';
      painContext = 'Acompanhei seu comentário sobre estimulação cognitiva. Na prática pedagógica inclusiva, atividades desestruturadas geram desatenção imediata.';
      benefitSolution = `O "${title}" traz fichas sensoriais progressivas para desenvolvimento de funções executivas, autonomia e grafomotricidade.`;
    } else if (selectedPersona === 'profissional') {
      salutation = 'Olá, especialista! 🩺✨';
      painContext = 'Excelente ver seu interesse em recursos práticos para desenvolvimento neurotípico e atípico.';
      benefitSolution = `O "${title}" é um acervo de apoio para consultórios de psicopedagogia, fonoaudiologia e clínicas de desenvolvimento infantil.`;
    }

    const imageSentence = generatorIncludeImage
      ? '\n📸 (Dê uma olhadinha na capa do material anexada aqui na mensagem para ver as ilustrações e como ele é lindo!)'
      : '';

    let ctaA = '';
    let ctaB = '';
    let ctaC = '';

    if (generatorCtaGoal === 'urgencia') {
      ctaA = `⚠️ Condição Especial: O material de R$ ${oldPrice} está saindo por apenas R$ ${price} na Hotmart por tempo limitado!\n👉 Garanta o seu antes que volte ao valor normal: ${link}`;
      ctaB = `🔥 Aproveite agora por apenas R$ ${price} (de R$ ${oldPrice}):\n👉 ${link}\nO acesso ao PDF é imediato no seu e-mail após a confirmação!`;
      ctaC = `Valor promocional liberado hoje: apenas R$ ${price}!\n👉 Link de acesso: ${link}\nSe tiver qualquer dúvida antes de fechar, estou à disposição no WhatsApp: 📲 ${waLink}`;
    } else if (generatorCtaGoal === 'whatsapp') {
      ctaA = `O acesso ao PDF é imediato por apenas R$ ${price}.\n👉 Acesse aqui: ${link}\n\n📲 Se tiver qualquer dúvida sobre a idade da criança ou como imprimir, pode me chamar direto no meu WhatsApp pessoal:\n${waLink}`;
      ctaB = `Liberamos seu acesso por apenas R$ ${price}:\n👉 ${link}\n\nPrefere tirar dúvidas antes? Me chame no WhatsApp: 📲 ${waLink}`;
      ctaC = `👉 Link direto com valor promocional de R$ ${price}: ${link}\n\nMe chama no WhatsApp (${whatsapp}) que te explico como funciona o download e a impressão com todo o carinho! 💬`;
    } else if (generatorCtaGoal === 'garantia') {
      ctaA = `O investimento é de apenas R$ ${price} com RISCO ZERO: você tem 7 dias de garantia total pela Hotmart. Se não amar, basta 1 mensagem que devolvemos 100%!\n👉 Garanta seu exemplar: ${link}`;
      ctaB = `Apenas R$ ${price} com 7 dias de garantia incondicional blindada:\n👉 ${link}\nVocê baixa, imprime e testa com as crianças sem nenhum risco!`;
      ctaC = `Acesso imediato no e-mail por R$ ${price} com garantia de 7 dias Hotmart.\n👉 ${link}\nQualquer dúvida me chame: 📲 ${waLink}`;
    } else {
      ctaA = `O arquivo digital chega imediatamente no seu e-mail após a aprovação para você imprimir quantas vezes quiser por apenas R$ ${price}.\n👉 Toque no link e baixe agora: ${link}\n\nQualquer dúvida pedagógica estou no WhatsApp: 📲 ${waLink}`;
      ctaB = `👉 Baixe o caderno completo em PDF por apenas R$ ${price}:\n${link}\nArquivos em alta resolução prontos para impressão no seu computador ou celular!`;
      ctaC = `Liberamos as atividades em PDF por apenas R$ ${price}.\n👉 Acesse a página aqui: ${link}${imageSentence}\n\nSe precisar de ajuda com os arquivos, estou no WhatsApp: 📲 ${waLink}`;
    }

    const copy1 = `${salutation}\n\n${painContext}\n\n${benefitSolution}${imageSentence}\n\n${ctaA}`;
    const copy2 = `Oi! Tudo bem? Vi seu comentário querendo o material "${title}".\n\n${benefitSolution}${imageSentence}\n\n${ctaB}`;
    const copy3 = `${salutation}\n\n${painContext}\n\n${benefitSolution}${imageSentence}\n\n${ctaC}`;

    setGeneratedCopies([
      {
        id: 'opt-1',
        title: 'Opção 1: Conectiva & Emocional (Alta Conversão)',
        badge: 'Mais Recomendada',
        hook: `Foco no acolhimento de ${selectedPersona === 'todos' ? 'Mães e Professoras' : selectedPersona.toUpperCase()}`,
        text: copy1,
      },
      {
        id: 'opt-2',
        title: 'Opção 2: Rápida & Direta ao Ponto (Preço e Link)',
        badge: 'Ideal para Resposta Rápida',
        hook: 'Texto mais enxuto com valor visível e link direto',
        text: copy2,
      },
      {
        id: 'opt-3',
        title: 'Opção 3: Humanizada com Suporte no WhatsApp',
        badge: 'Quebra de Objeções',
        hook: 'Convite para tirar dúvidas e fechar no 1 a 1',
        text: copy3,
      },
    ]);
  };

  const handleApplyGeneratedCopy = (text: string) => {
    setEditingMessage(text);
    const textareaEl = document.getElementById('dispatch-message-textarea');
    if (textareaEl) {
      textareaEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      textareaEl.focus();
    }
  };

  const handleDownloadProductImage = () => {
    const link = document.createElement('a');
    link.href = generatorImagePreviewUrl;
    link.download = `capa-produto-${selectedPersona}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyImageLink = () => {
    const fullUrl = generatorImagePreviewUrl.startsWith('http')
      ? generatorImagePreviewUrl
      : `${window.location.origin}${generatorImagePreviewUrl}`;
    copyToClipboard(fullUrl, 'copy-product-image-url');
  };

  // Real-time subscription to Firebase dispatch message templates
  useEffect(() => {
    const unsub = subscribeDispatchTemplates((cloudTemplates) => {
      if (cloudTemplates && Object.keys(cloudTemplates).length > 0) {
        setCustomDispatchTemplates((prev) => {
          const merged = { ...prev, ...cloudTemplates };
          try {
            localStorage.setItem('autoviral_dispatch_templates', JSON.stringify(merged));
          } catch {}
          return merged;
        });

        const currentCloud = cloudTemplates[selectedSegmentId];
        if (currentCloud) {
          if (currentCloud.keyword) setEditingKeyword(currentCloud.keyword);
          if (currentCloud.message) setEditingMessage(currentCloud.message);
        }
      }
    });
    return () => unsub();
  }, [selectedSegmentId]);

  // When selectedSegmentId changes, update editor state
  useEffect(() => {
    const custom = customDispatchTemplates[selectedSegmentId];
    if (custom) {
      setEditingKeyword(custom.keyword || currentNicheData.replyRushKeyword);
      setEditingMessage(custom.message || currentNicheData.replyRushMessage);
    } else {
      setEditingKeyword(currentNicheData.replyRushKeyword);
      setEditingMessage(currentNicheData.replyRushMessage);
    }
    setDispatchSavedSuccess(false);
  }, [selectedSegmentId, currentNicheData.replyRushKeyword, currentNicheData.replyRushMessage]);

  const handleSaveDispatchMessage = () => {
    const kw = editingKeyword.trim() || currentNicheData.replyRushKeyword;
    const msg = editingMessage.trim() || currentNicheData.replyRushMessage;

    const updated = {
      ...customDispatchTemplates,
      [selectedSegmentId]: { keyword: kw, message: msg },
    };
    setCustomDispatchTemplates(updated);
    try {
      localStorage.setItem('autoviral_dispatch_templates', JSON.stringify(updated));
    } catch {}

    saveDispatchTemplateToFirebase({
      nicheId: selectedSegmentId,
      keyword: kw,
      message: msg,
    }).catch(console.warn);

    setDispatchSavedSuccess(true);
    setTimeout(() => setDispatchSavedSuccess(false), 3000);
  };

  const handleResetDispatchMessage = () => {
    setEditingKeyword(currentNicheData.replyRushKeyword);
    setEditingMessage(currentNicheData.replyRushMessage);
    const updated = { ...customDispatchTemplates };
    delete updated[selectedSegmentId];
    setCustomDispatchTemplates(updated);
    try {
      localStorage.setItem('autoviral_dispatch_templates', JSON.stringify(updated));
    } catch {}
  };

  const handleApplyCampaignLink = (campId: string) => {
    setSelectedCampaignForDispatch(campId);
    const targetCamp = campaigns.find((c) => c.id === campId);
    if (!targetCamp) return;
    const slug = getCampaignSlug(targetCamp);
    const newUrl = `${window.location.origin}/?p=${slug}&src=replyrush`;

    const urlRegex = /(https?:\/\/[^\s]+(?:\?p=[a-z0-9_-]+[^\s]*|src=replyrush[^\s]*))/i;
    if (urlRegex.test(editingMessage)) {
      setEditingMessage((prev) => prev.replace(urlRegex, newUrl));
    } else {
      setEditingMessage((prev) => `${prev}\n\n👉 ${newUrl}`);
    }
  };

  const handleTestOnWhatsApp = () => {
    const encoded = encodeURIComponent(editingMessage);
    const target = campaigns.find((c) => c.id === selectedCampaignForDispatch) || campaigns[0];
    const phone = target?.whatsappNumber || '5541998778348';
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encoded}`, '_blank');
  };

  const handleInsertTag = (tag: string) => {
    setEditingMessage((prev) => `${prev} ${tag}`);
  };

  // Merge custom searched @ profiles with current niche profiles
  const displayedProfiles: TargetProfile[] = [
    ...customProfiles,
    ...currentNicheData.profiles.filter(
      (p) => !customProfiles.some((cp) => cp.handle.toLowerCase() === p.handle.toLowerCase())
    ),
  ];

  // Search by @ (Arroba) handler
  const handleSearchByAtSign = (customAt?: string) => {
    const raw = (customAt || handleSearchInput || searchQuery).trim();
    if (!raw) return;

    let cleanHandle = raw;
    if (cleanHandle.includes('instagram.com/')) {
      const match = cleanHandle.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
      if (match && match[1]) cleanHandle = match[1];
    }
    cleanHandle = cleanHandle.replace(/^@+/, '').replace(/\/$/, '').trim();
    if (!cleanHandle) return;

    const formattedHandle = `@${cleanHandle}`;

    const campTitle = activeCampaign.title || 'Material Digital';
    const campPrice = `R$ ${(activeCampaign.price || 9.99).toFixed(2).replace('.', ',')}`;
    const campSlug = getCampaignSlug(activeCampaign);
    const campLink = `${window.location.origin}/?p=${campSlug}&src=outreach_arroba`;
    const campFocus = activeCampaign.targetAudience || activeCampaign.nicheLabel || 'Educação Infantil & Inclusão';

    const formattedName =
      cleanHandle
        .split(/[._]/)
        .filter(Boolean)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ') || cleanHandle;

    const newProfile: TargetProfile = {
      handle: formattedHandle,
      name: formattedName,
      url: `https://www.instagram.com/${cleanHandle}/`,
      audience: 'Perfil Ativo no Instagram',
      focus: campFocus,
      whatToLook:
        'Verifique as publicações recentes, comentários de pessoas interessadas no assunto e inicie uma conversa acolhedora com o script.',
      script: `Olá ${formattedName}! Acompanho seu trabalho no Instagram e acho maravilhosa sua dedicação. Desenvolvemos o material "${campTitle}" com acesso completo em PDF pronto para imprimir por apenas ${campPrice}. Deixei a amostra aqui se quiser ver: ${campLink}`,
      isCustom: true,
    };

    setCustomProfiles((prev) => {
      const filtered = prev.filter(
        (p) => p.handle.toLowerCase() !== formattedHandle.toLowerCase()
      );
      const updated = [newProfile, ...filtered];
      try {
        localStorage.setItem(
          'autoviral_custom_instagram_profiles',
          JSON.stringify(updated)
        );
      } catch {}
      return updated;
    });

    // Save to Firebase Cloud so it's instantly available in any browser
    saveCustomProfileToFirebase(newProfile).catch((e) =>
      console.warn('Firebase saveCustomProfile error:', e)
    );

    // Auto-select for dispatch queue
    setSelectedHandles((prev) =>
      prev.includes(formattedHandle) ? prev : [formattedHandle, ...prev]
    );

    setSelectedProfileIndex(0);
    setHandleSearchInput('');
    setSearchQuery('');
    setSuccessAddedHandle(formattedHandle);
    setTimeout(() => setSuccessAddedHandle(null), 4000);
  };

  const handleRemoveCustomProfile = (handleToRemove: string) => {
    setCustomProfiles((prev) => {
      const updated = prev.filter((p) => p.handle !== handleToRemove);
      try {
        localStorage.setItem(
          'autoviral_custom_instagram_profiles',
          JSON.stringify(updated)
        );
      } catch {}
      return updated;
    });

    // Delete from Firebase Cloud
    deleteCustomProfileFromFirebase(handleToRemove).catch((e) =>
      console.warn('Firebase deleteCustomProfile error:', e)
    );

    setSelectedHandles((prev) => prev.filter((h) => h !== handleToRemove));
    setSelectedProfileIndex(0);
  };

  // Automation Timer Loop for Anti-Ban Outreach Queue
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isQueueActive && selectedHandles.length > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Trigger dispatch for current profile
            const activeOrigin = originAccounts[activeOriginIndex] || originAccounts[0] || { handle: '@marcellospropaganda' };
            const targetHandle = selectedHandles[currentQueueIndex % selectedHandles.length];
            const variationIndex = currentQueueIndex % spinTemplates.length;
            const chosenSpin = spinTemplates[variationIndex]
              .replace('{nome}', targetHandle.replace('@', ''))
              .replace('{remetente}', activeOrigin.handle.replace('@', ''))
              .replace('{foco}', currentNicheData.label);

            const newLog = {
              id: `log-${Date.now()}`,
              originHandle: activeOrigin.handle,
              handle: targetHandle,
              time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              variation: `Variação ${String.fromCharCode(65 + variationIndex)}`,
              status: 'sent' as const,
            };

            setDispatchLogs((prevLogs) => [newLog, ...prevLogs.slice(0, 19)]);

            // Increment today's dispatches for the origin sender account
            setOriginAccounts((prev) => {
              const updated = prev.map((acc, i) =>
                i === activeOriginIndex
                  ? { ...acc, sentToday: (acc.sentToday || 0) + 1, lastUsedAt: new Date().toISOString() }
                  : acc
              );
              try {
                localStorage.setItem('autoviral_instagram_origin_accounts', JSON.stringify(updated));
              } catch {}
              const cur = updated[activeOriginIndex];
              if (cur) {
                saveInstagramOriginAccountToFirebase({ ...cur, accountsList: updated }).catch(console.warn);
              }
              return updated;
            });

            // If multi-account rotation is active, rotate to next sender profile
            if (autoRotateOrigins && originAccounts.length > 1) {
              setActiveOriginIndex((prevIdx) => (prevIdx + 1) % originAccounts.length);
            }

            setCurrentQueueIndex((idx) => (idx + 1) % selectedHandles.length);

            // Reset timer with safe human jitter (±15s)
            const baseSeconds = safeIntervalMinutes * 60;
            const jitter = Math.floor(Math.random() * 30 - 15);
            return Math.max(60, baseSeconds + jitter);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    isQueueActive,
    selectedHandles,
    currentQueueIndex,
    safeIntervalMinutes,
    spinTemplates,
    currentNicheData,
    originAccounts,
    activeOriginIndex,
    autoRotateOrigins,
  ]);

  const toggleHandleSelection = (handle: string) => {
    setSelectedHandles((prev) =>
      prev.includes(handle) ? prev.filter((h) => h !== handle) : [...prev, handle]
    );
  };

  const selectAllProfiles = () => {
    const all = displayedProfiles.map((p) => p.handle);
    setSelectedHandles(all);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // If query starts with @ or contains instagram handle format, route directly to @ search
    if (query.startsWith('@') || query.includes('instagram.com/')) {
      handleSearchByAtSign(query);
      return;
    }

    const normalized = query.toLowerCase();
    const match = Object.keys(catalogNiches).find((k) =>
      catalogNiches[k].label.toLowerCase().includes(normalized) || k.includes(normalized)
    );

    if (match) {
      setSelectedSegmentId(match);
    } else {
      setSelectedSegmentId(query);
    }
    setSelectedProfileIndex(0);
  };

  const currentProfile =
    displayedProfiles[selectedProfileIndex] || displayedProfiles[0] || currentNicheData.profiles[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Platform Selector Tabs */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedPlatform('instagram')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
              selectedPlatform === 'instagram'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Instagram className="w-4 h-4" />
            <span>Instagram (Perfis & Directs)</span>
          </button>

          <button
            onClick={() => setSelectedPlatform('pinterest')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
              selectedPlatform === 'pinterest'
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Pin className="w-4 h-4" />
            <span>Pinterest (Buscas Ativas)</span>
          </button>

          <button
            onClick={() => setSelectedPlatform('tiktok')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
              selectedPlatform === 'tiktok'
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>TikTok (Vídeos & Dúvidas)</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-800/40 px-3 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Filtro Anti-Bloqueio Ativo</span>
        </div>
      </div>

      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-800/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl space-y-6">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>BUSCA POR NICHO & PESQUISA DIRETA PELO @ (ARROBA)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Achar Perfis por Nicho ou Diretamente pelo @ (Arroba)
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Você pode buscar por nicho (ex: <strong>TEA</strong>, <strong>Psicopedagogia</strong>) ou <strong>digitar diretamente o @ do perfil no Instagram</strong> para o robô analisar, gerar o script personalizado e incluir na fila com intervalo longo anti-bloqueio.
          </p>
        </div>

        {/* DUAL SEARCH SYSTEM: NICHE & @ (ARROBA) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative z-10">
          {/* Search by @ (Arroba) - Highlighted */}
          <div className="p-4 bg-slate-950/90 border-2 border-pink-500/60 rounded-2xl space-y-2.5 shadow-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-pink-300 flex items-center gap-1.5 uppercase tracking-wider">
                <AtSign className="w-4 h-4 text-pink-400" />
                <span>Procurar Perfil pelo @ do Instagram:</span>
              </label>
              <span className="text-[10px] bg-pink-950/70 text-pink-300 px-2 py-0.5 rounded-full border border-pink-800/50 font-semibold">
                Busca Exata
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchByAtSign();
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <AtSign className="w-4 h-4 text-pink-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={handleSearchInput}
                  onChange={(e) => setHandleSearchInput(e.target.value)}
                  placeholder="ex: @redepedagogica, @psicopedagoga_ana..."
                  className="w-full bg-slate-900 border border-pink-500/40 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-400"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-pink-600/25 transition cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>Analisar @</span>
              </button>
            </form>

            {/* Quick @ suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400">Sugestões rápidas:</span>
              {[
                '@redepedagogica',
                '@taiseagostini',
                '@psicopedagogiandope',
                '@autismoerealidade',
                '@espaco_inclusivo_tea',
              ].map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => handleSearchByAtSign(sug)}
                  className="text-[10px] text-pink-300 hover:text-white bg-pink-950/40 hover:bg-pink-900/60 border border-pink-800/40 px-2 py-0.5 rounded-md transition font-mono cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Search by Niche Keyword */}
          <div className="p-4 bg-slate-950/90 border border-emerald-700/50 rounded-2xl space-y-2.5 shadow-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Search className="w-4 h-4 text-emerald-400" />
                <span>Procurar por Nicho / Segmento:</span>
              </label>
              <span className="text-[10px] bg-emerald-950/70 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800/50 font-semibold">
                Busca Ampla
              </span>
            </div>

            <form onSubmit={handleCustomSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ex: TEA, Autismo, Psicopedagogia, Confeitaria..."
                  className="w-full bg-slate-900 border border-emerald-700/50 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Mapear</span>
              </button>
            </form>

            <span className="text-[10px] text-slate-400 block pt-1">
              Também aceita digitar @ aqui para encontrar qualquer perfil automaticamente!
            </span>
          </div>
        </div>

        {/* Success Alert when adding @ */}
        {successAddedHandle && (
          <div className="p-3 bg-emerald-950/90 border border-emerald-500 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Perfil <strong className="text-white font-mono">{successAddedHandle}</strong> analisado com sucesso! Script personalizado gerado e incluído na fila de disparo seguro.
            </span>
          </div>
        )}
      </div>

      {/* QUICK SELECTION BAR */}
      <div className="space-y-3 bg-slate-900 border border-slate-800 rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Navegar por Nichos Salvos & Campanhas:</span>
          </span>
          <span className="text-[11px] text-slate-500">Clique para alternar</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'pedagogia', label: '📚 Autismo (TEA) & Pedagogia (R$ 9,90)', isFeatured: true },
            { id: 'milhas', label: '✈️ Milhas Lucrativas (R$ 385)', isFeatured: true },
            { id: 'emagrecimento', label: '🥗 Emagrecimento Natural' },
          ].map((n) => (
            <button
              key={n.id}
              onClick={() => {
                setSelectedSegmentId(n.id);
                setSelectedProfileIndex(0);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedSegmentId === n.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
              }`}
            >
              <span>{n.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AUTOMATED OUTREACH QUEUE (PROGRAMAÇÃO ANTI-BLOQUEIO) */}
      <div className="bg-slate-900 border-2 border-emerald-600/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-700/50">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>FILA DE DISPARO HUMANIZADO ANTI-BLOQUEIO</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Programação Automática de Mensagens com Intervalo Longo
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              O algoritmo do Instagram só bloqueia contas que enviam mensagens iguais em segundos. Com o <strong>AutoViral Anti-Bloqueio</strong>, as mensagens são enviadas com <strong>intervalos de 5 a 8 minutos</strong> e alternando <strong>3 variações diferentes de texto (Spin-Syntax)</strong> para parecer 100% manual e orgânico.
            </p>
          </div>

          {/* Start / Pause Queue Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (!isQueueActive && selectedHandles.length === 0) {
                  selectAllProfiles();
                }
                setIsQueueActive(!isQueueActive);
              }}
              className={`px-6 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 transition cursor-pointer shadow-xl ${
                isQueueActive
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 shadow-emerald-500/25'
              }`}
            >
              {isQueueActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pausar Disparos</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Iniciar Fila de Disparo Seguro</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* PERFIL PADRÃO DE ORIGEM (REMETENTE DO INSTAGRAM) */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 border border-emerald-600/40 rounded-3xl space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-950/50 shrink-0">
                <Instagram className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-black text-white">
                    Perfil Padrão de Origem (Conta Remetente)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/50 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Nuvem Firebase Ativa</span>
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Esta é a conta do Instagram que envia os directs aos perfis mapeados com intervalo anti-bloqueio.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setIsEditingOrigin(!isEditingOrigin)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isEditingOrigin ? 'Fechar Painel' : 'Gerenciar / Trocar Conta'}</span>
              </button>

              <a
                href={`https://www.instagram.com/${currentOriginAccount.handle.replace('@', '')}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-pink-900/30"
                title="Abrir conta remetente no Instagram"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver Conta</span>
              </a>
            </div>
          </div>

          {/* Quick Metrics of the Origin Sender Account */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Conta Remetente em Uso:
                </span>
                <span className="font-mono font-black text-base text-emerald-400 block">
                  {currentOriginAccount.handle}
                </span>
                <span className="text-[11px] text-slate-300">
                  {currentOriginAccount.name || 'Conta Principal'}
                </span>
              </div>
              <UserCheck className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Aquecimento da Conta:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${currentOriginAccount.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="font-bold text-xs text-white">
                    {currentOriginAccount.status === 'active' ? 'Conta Aquecida (+30 dias)' : 'Em Aquecimento (Nova)'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  {currentOriginAccount.status === 'active' ? 'Até 20 DMs/dia com 0% risco' : 'Recomendado máx 10 DMs/dia'}
                </span>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div className="space-y-0.5 w-full">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Envios de Hoje nesta Conta:
                  </span>
                  <button
                    type="button"
                    onClick={handleResetOriginCounter}
                    className="text-[10px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    Resetar
                  </button>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono font-black text-lg text-emerald-400">
                    {currentOriginAccount.sentToday}
                  </span>
                  <span className="text-xs text-slate-400">
                    / {currentOriginAccount.dailyLimit || 20} DMs seguras
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, ((currentOriginAccount.sentToday || 0) / (currentOriginAccount.dailyLimit || 20)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* EDIT & MULTI-ACCOUNT MANAGEMENT DRAWER */}
          {isEditingOrigin && (
            <div className="pt-4 border-t border-slate-800/80 space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cadastrar ou Alternar Contas Remetentes:</span>
                </span>

                {originAccounts.length > 1 && (
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                    <input
                      type="checkbox"
                      checked={autoRotateOrigins}
                      onChange={(e) => setAutoRotateOrigins(e.target.checked)}
                      className="rounded text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-emerald-300">
                      Rotação Automática Multi-Contas (Alternar remetente a cada envio)
                    </span>
                  </label>
                )}
              </div>

              {/* Accounts List & Switcher */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {originAccounts.map((acc, idx) => (
                  <div
                    key={acc.handle}
                    onClick={() => {
                      setActiveOriginIndex(idx);
                      const updated = [...originAccounts];
                      handleSaveOriginAccounts(updated);
                    }}
                    className={`p-3 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                      activeOriginIndex === idx
                        ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-emerald-400">{acc.handle}</span>
                        {activeOriginIndex === idx && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-500 text-slate-950 rounded">
                            Ativa
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block">{acc.name || 'Conta Remetente'}</span>
                    </div>

                    {originAccounts.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveOriginAccount(idx);
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                        title="Remover conta remetente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Sender Profile Form */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-200 block">
                  Adicionar Nova Conta do Instagram como Remetente:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newOriginInput}
                    onChange={(e) => setNewOriginInput(e.target.value)}
                    placeholder="Ex: @minhaloja_oficial"
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <input
                    type="text"
                    value={newOriginNameInput}
                    onChange={(e) => setNewOriginNameInput(e.target.value)}
                    placeholder="Apelido (ex: Perfil Suporte)"
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={newOriginStatus}
                      onChange={(e) => setNewOriginStatus(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 flex-1 font-bold"
                    >
                      <option value="active">Conta Aquecida (20 DMs/dia)</option>
                      <option value="warmup">Conta Nova (10 DMs/dia)</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddNewOriginAccount}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Salvar Conta</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Queue Control Metrics & Timer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Box */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Status da Fila:
            </span>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isQueueActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`}></span>
              <span className={`font-black text-sm ${isQueueActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                {isQueueActive ? '🟢 Ativo (Simulando Humano)' : '⏸️ Pausado'}
              </span>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="p-4 bg-slate-950 border border-emerald-900/40 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Próximo Envio em:
            </span>
            <div className="flex items-center gap-2 text-2xl font-black text-white font-mono">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span>{isQueueActive ? formatTimer(secondsRemaining) : `${safeIntervalMinutes}:00`}</span>
            </div>
          </div>

          {/* Interval Safety Configuration */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Intervalo de Segurança:
            </span>
            <select
              value={safeIntervalMinutes}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setSafeIntervalMinutes(val);
                setSecondsRemaining(val * 60);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
            >
              <option value={5}>5 a 8 minutos (Recomendado - 0% Risco)</option>
              <option value={7}>7 a 10 minutos (Ultra Seguro)</option>
              <option value={3}>3 a 5 minutos (Moderado)</option>
              <option value={1}>1 minuto (Modo Demonstração Rápida)</option>
            </select>
          </div>

          {/* Daily Limit Safety */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Limite Diário Seguro:
            </span>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-400">
                {currentOriginAccount.sentToday} / {currentOriginAccount.dailyLimit || 20} DMs
              </span>
              <span className="text-[10px] text-slate-500">Por Conta Remetente</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, ((currentOriginAccount.sentToday || 0) / (currentOriginAccount.dailyLimit || 20)) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Spin-Syntax Messages Rotation Panel */}
        <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Variações Humanizadas de Mensagem (Spin-Syntax Anti-Spam)
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleAdaptSpinTemplatesToActiveCampaign}
                className="px-3 py-1 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                title={`Adapta as variações A, B e C para o produto "${activeCampaign.title}"`}
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Conectar Variações ao Produto: {activeCampaign.title.slice(0, 24)}...</span>
              </button>
              <span className="text-[11px] text-slate-400">
                Alterna automaticamente entre A, B e C
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {spinTemplates.map((template, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400">
                    Variação {String.fromCharCode(65 + idx)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (editingSpinIndex === idx) {
                          setEditingSpinIndex(null);
                        } else {
                          setEditingSpinIndex(idx);
                          setTempSpinText(template);
                        }
                      }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                    >
                      {editingSpinIndex === idx ? 'Fechar' : 'Editar'}
                    </button>
                    <button
                      onClick={() => copyToClipboard(template, `spin-${idx}`)}
                      className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      {copiedId === `spin-${idx}` ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>

                {editingSpinIndex === idx ? (
                  <div className="space-y-1.5 pt-1">
                    <textarea
                      value={tempSpinText}
                      onChange={(e) => setTempSpinText(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-950 border border-indigo-500 rounded-lg p-2 text-[11px] text-emerald-300 font-mono focus:outline-none"
                    />
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingSpinIndex(null)}
                        className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white text-[10px] cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...spinTemplates];
                          updated[idx] = tempSpinText.trim() || template;
                          setSpinTemplates(updated);
                          setEditingSpinIndex(null);
                          try {
                            localStorage.setItem('autoviral_spin_templates', JSON.stringify(updated));
                          } catch {}
                        }}
                        className="px-2.5 py-0.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] cursor-pointer"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-300 leading-relaxed italic line-clamp-4">
                    "{template}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Live Dispatch Logs */}
        {dispatchLogs.length > 0 && (
          <div className="p-4 bg-slate-950 border border-emerald-900/50 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Histórico de Disparos Concluídos com Sucesso:</span>
              </span>
              <span className="text-slate-500 text-[11px]">{dispatchLogs.length} envios registrados</span>
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {dispatchLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-300 gap-2 flex-wrap sm:flex-nowrap"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-slate-400">De:</span>
                    <span className="font-mono text-emerald-400 font-bold">{log.originHandle}</span>
                    <span className="text-slate-500">➔</span>
                    <span className="text-[11px] text-slate-400">Para:</span>
                    <span className="font-mono text-white font-bold">{log.handle}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                      {log.variation}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-slate-500">{log.time}</span>
                    <a
                      href={`https://www.instagram.com/${log.handle.replace('@', '')}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-pink-600/80 hover:bg-pink-600 text-white rounded text-[10px] font-bold flex items-center gap-1"
                    >
                      <Instagram className="w-3 h-3" />
                      <span>Abrir Chat</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: PERFIS ENCONTRADOS NESTE NICHO & PROCURADOS POR @ */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-semibold border border-emerald-800/60">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>PERFIS MAPEADOS ({displayedProfiles.length} DISPONÍVEIS)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Perfis de Pedagogas, Mães & Contas Alvo para Abordagem
            </h2>
            <p className="text-xs text-slate-400">
              Selecione os perfis para a fila ou clique para ver o script amigável e abrir diretamente no Instagram:
            </p>
          </div>

          <button
            type="button"
            onClick={selectAllProfiles}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-emerald-800/50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Selecionar Todos ({displayedProfiles.length}) para a Fila</span>
          </button>
        </div>

        {/* VINCULAÇÃO COM O PRODUTO / CAMPANHA ATIVA */}
        <div className="p-4 bg-slate-950/90 border border-emerald-600/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                <span>Produto / Campanha Selecionada para Esta Prospecção:</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Conectado ao Script</span>
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Escolha qual produto divulgar. O script de abordagem para cada perfil abaixo usa o título, valor e link desta campanha.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCampaignForDispatch}
              onChange={(e) => {
                setSelectedCampaignForDispatch(e.target.value);
                setIsEditingTargetScript(false);
              }}
              className="bg-slate-900 border border-emerald-500/60 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold text-emerald-300 focus:outline-none focus:border-emerald-400 cursor-pointer w-full sm:w-auto"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} • R$ {c.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profiles List */}
          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {displayedProfiles.map((p, idx) => {
              const isChecked = selectedHandles.includes(p.handle);
              return (
                <div
                  key={p.handle}
                  onClick={() => {
                    setSelectedProfileIndex(idx);
                    setIsEditingTargetScript(false);
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                    selectedProfileIndex === idx
                      ? 'bg-emerald-950/60 border-emerald-600/70 text-white shadow-lg'
                      : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleHandleSelection(p.handle);
                      }}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-sm flex items-center gap-1.5">
                        <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
                        <span className="truncate">{p.name}</span>
                        {p.isCustom && (
                          <span className="text-[9px] bg-pink-950 text-pink-300 border border-pink-700/60 px-1.5 py-0.2 rounded font-bold">
                            @ Buscado
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">{p.handle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800/50 shrink-0">
                      {p.audience}
                    </span>
                    {p.isCustom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCustomProfile(p.handle);
                        }}
                        className="text-slate-500 hover:text-red-400 p-1"
                        title="Remover perfil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Profile Detailed Prospecting Guide */}
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>{currentProfile.name}</span>
                    <span className="text-xs text-pink-400 font-mono font-normal">({currentProfile.handle})</span>
                    {currentProfile.isCustom && (
                      <span className="text-[10px] bg-pink-900/60 text-pink-300 border border-pink-700/60 px-2 py-0.5 rounded-full font-bold">
                        Buscado pelo @
                      </span>
                    )}
                  </h3>
                </div>

                <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
                  <span className="text-slate-400">Canal de Envio:</span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 font-mono text-emerald-400 font-bold">
                    {currentOriginAccount.handle} (Origem)
                  </span>
                  <span className="text-slate-500">➔</span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 font-mono text-white font-bold">
                    {currentProfile.handle} (Destino)
                  </span>
                </div>

                <p className="text-xs text-emerald-400 mt-1">
                  Foco do Alvo: {currentProfile.focus}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleHandleSelection(currentProfile.handle)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedHandles.includes(currentProfile.handle)
                      ? 'bg-emerald-600 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{selectedHandles.includes(currentProfile.handle) ? 'Na Fila' : '+ Adicionar à Fila'}</span>
                </button>

                <a
                  href={currentProfile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition shadow-lg"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Abrir @ no Instagram</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                <h4 className="text-xs font-bold text-slate-200">
                  🔍 O que procurar nos comentários deste perfil:
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentProfile.whatToLook}
                </p>
              </div>

              {/* SCRIPT EDITÁVEL CONECTADO AO PRODUTO DA CAMPANHA ESPECÍFICA */}
              {(() => {
                const effectiveScript = getEffectiveScript(currentProfile);
                const isOverridden = !!profileScriptOverrides[currentProfile.handle.toLowerCase()];

                return (
                  <div className="p-5 bg-slate-900 border-2 border-emerald-600/50 rounded-2xl space-y-3 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Script de Abordagem para {currentProfile.handle}:</span>
                          </h4>
                          <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-700/60 px-2 py-0.5 rounded-full font-bold">
                            Produto: {activeCampaign.title} (R$ {(activeCampaign.price || 9.99).toFixed(2).replace('.', ',')})
                          </span>
                          {isOverridden && (
                            <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-700/60 px-2 py-0.5 rounded-full font-bold">
                              Editado Manualmente
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Mensagem anti-bloqueio humanizada conectada diretamente ao produto da campanha ativa.
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => {
                            if (isEditingTargetScript) {
                              setIsEditingTargetScript(false);
                            } else {
                              setTempTargetScriptText(effectiveScript);
                              setIsEditingTargetScript(true);
                            }
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{isEditingTargetScript ? 'Fechar Edição' : 'Editar Script'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleResetTargetScriptToActiveCampaign(currentProfile)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer border border-slate-700"
                          title={`Recalcula e conecta o script com o produto "${activeCampaign.title}"`}
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Sincronizar Produto</span>
                        </button>
                      </div>
                    </div>

                    {/* Modo de Edição Ativo */}
                    {isEditingTargetScript ? (
                      <div className="space-y-3 pt-1 animate-in fade-in">
                        {/* Quick Insertion Pills for Target Script */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-400">Inserir no texto:</span>
                          <button
                            type="button"
                            onClick={() => setTempTargetScriptText((prev) => `${prev} ${currentProfile.name}`)}
                            className="text-[10px] bg-slate-950 hover:bg-slate-800 text-emerald-300 px-2 py-0.5 rounded border border-slate-700 cursor-pointer"
                          >
                            + Nome ({currentProfile.name})
                          </button>
                          <button
                            type="button"
                            onClick={() => setTempTargetScriptText((prev) => `${prev} "${activeCampaign.title}"`)}
                            className="text-[10px] bg-slate-950 hover:bg-slate-800 text-emerald-300 px-2 py-0.5 rounded border border-slate-700 cursor-pointer"
                          >
                            + Título do Produto
                          </button>
                          <button
                            type="button"
                            onClick={() => setTempTargetScriptText((prev) => `${prev} R$ ${(activeCampaign.price || 9.99).toFixed(2).replace('.', ',')}`)}
                            className="text-[10px] bg-slate-950 hover:bg-slate-800 text-emerald-300 px-2 py-0.5 rounded border border-slate-700 cursor-pointer"
                          >
                            + Preço Promocional
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const slug = getCampaignSlug(activeCampaign);
                              setTempTargetScriptText((prev) => `${prev} ${window.location.origin}/?p=${slug}&src=outreach_direct`);
                            }}
                            className="text-[10px] bg-slate-950 hover:bg-slate-800 text-emerald-300 px-2 py-0.5 rounded border border-slate-700 cursor-pointer"
                          >
                            + Link da Landing Page
                          </button>
                          {activeCampaign.checkoutUrl && (
                            <button
                              type="button"
                              onClick={() => setTempTargetScriptText((prev) => `${prev} ${activeCampaign.checkoutUrl}`)}
                              className="text-[10px] bg-slate-950 hover:bg-slate-800 text-emerald-300 px-2 py-0.5 rounded border border-slate-700 cursor-pointer"
                            >
                              + Link Checkout Direto
                            </button>
                          )}
                        </div>

                        <textarea
                          value={tempTargetScriptText}
                          onChange={(e) => setTempTargetScriptText(e.target.value)}
                          rows={6}
                          className="w-full bg-slate-950 border-2 border-indigo-500 rounded-xl p-3 text-xs sm:text-sm font-mono text-emerald-300 leading-relaxed focus:outline-none"
                          placeholder="Digite ou edite a mensagem personalizada para este perfil..."
                        />

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <span className="text-[10px] text-slate-400">
                            Ao salvar, sua alteração fica gravada no navegador e sincronizada na nuvem Firebase.
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsEditingTargetScript(false)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveTargetScript(currentProfile, tempTargetScriptText)}
                              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>Salvar Script deste Perfil</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Modo de Visualização do Script */
                      <div className="space-y-3">
                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                          <p className="text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-wrap selection:bg-emerald-950">
                            {effectiveScript}
                          </p>
                        </div>

                        {/* Botões de Ação para o Script */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => copyToClipboard(effectiveScript, `copy-script-${selectedProfileIndex}`)}
                              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-500/20"
                            >
                              {copiedId === `copy-script-${selectedProfileIndex}` ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Script Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copiar Script</span>
                                </>
                              )}
                            </button>

                            {/* Copiar Imagem do Produto para Área de Transferência (Ctrl+V) */}
                            <button
                              type="button"
                              onClick={() => handleCopyImageToClipboard(activeCampaign.imageUrl)}
                              className="px-3.5 py-2 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 hover:text-white border border-indigo-700/60 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                              title="Copia a capa do produto para a área de transferência para colar com Ctrl+V no Instagram Direct ou WhatsApp"
                            >
                              <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                              <span>
                                {copiedId === 'copy-img-clipboard' || copyImageSuccess
                                  ? '✅ Foto Copiada! (Ctrl+V no Chat)'
                                  : 'Copiar Foto (Ctrl+V no Chat)'}
                              </span>
                            </button>

                            {/* Testar no WhatsApp */}
                            <button
                              type="button"
                              onClick={() => {
                                const phone = activeCampaign.whatsappNumber || '5541998778348';
                                const clean = phone.replace(/[^0-9]/g, '');
                                window.open(`https://wa.me/${clean}?text=${encodeURIComponent(effectiveScript)}`, '_blank');
                              }}
                              className="px-3 py-2 bg-green-700/80 hover:bg-green-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-green-600/40"
                              title="Testa o envio deste script no seu próprio WhatsApp"
                            >
                              <Smartphone className="w-3.5 h-3.5 text-green-300" />
                              <span>Testar no WhatsApp</span>
                            </button>

                            {/* Abrir Conversa no Instagram */}
                            <a
                              href={`https://www.instagram.com/${currentProfile.handle.replace('@', '')}/`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-pink-600/80 hover:bg-pink-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                              title="Abre o perfil deste lead no Instagram para colar o script no direct"
                            >
                              <Instagram className="w-3.5 h-3.5" />
                              <span>Abrir Chat no Instagram</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowDirectMockup(!showDirectMockup)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 underline font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{showDirectMockup ? 'Ocultar Prévia do Chat' : 'Ver como Fica no Direct'}</span>
                          </button>
                        </div>

                        {/* Mensagem de sucesso ao salvar alteração */}
                        {targetScriptSavedSuccess && (
                          <div className="p-2.5 bg-emerald-950/90 border border-emerald-500 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-300 animate-in fade-in">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Script personalizado salvo com sucesso na nuvem Firebase e no navegador!</span>
                          </div>
                        )}

                        {/* Orientações Claras de Envio da Foto + Texto no Direct */}
                        <div className="p-3 bg-slate-950 border border-indigo-900/40 rounded-xl space-y-1.5 text-[11px] text-slate-300">
                          <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                            <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                            <span>Como a imagem e o texto aparecem juntos no Instagram Direct:</span>
                          </div>
                          <p className="text-slate-400 leading-relaxed">
                            No Instagram Web e WhatsApp, o campo de digitação recebe texto, e arquivos de foto são anexados via <strong>Ctrl+V</strong>. Para enviar os dois:<br/>
                            1. Clique em <strong>"Copiar Script"</strong> e cole no chat (Ctrl+V) ➔ Enviar.<br/>
                            2. Clique em <strong>"Copiar Foto (Ctrl+V no Chat)"</strong> e aperte <strong>Ctrl+V</strong> dentro da conversa. A foto oficial do produto aparecerá anexada no chat!
                          </p>
                        </div>

                        {/* Mockup Realista de Prévia do Instagram Direct */}
                        {showDirectMockup && (
                          <div className="p-4 bg-slate-950 rounded-2xl border-2 border-pink-600/40 space-y-3 animate-in fade-in">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                                  {currentProfile.name.charAt(0)}
                                </div>
                                <div>
                                  <span className="text-xs font-bold text-white block">{currentProfile.name}</span>
                                  <span className="text-[10px] text-slate-400 block font-mono">{currentProfile.handle}</span>
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-400">Instagram Direct</span>
                            </div>

                            {/* Chat Bubbles: Foto Anexada + Texto */}
                            <div className="flex flex-col items-end space-y-2 max-w-md ml-auto">
                              {/* Foto Anexada no Direct */}
                              <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 max-w-[240px] shadow-lg">
                                <img
                                  src={activeCampaign.imageUrl || '/assets/aistudio/image_e9e67204.png'}
                                  alt="Capa Oficial"
                                  className="w-full h-auto object-cover aspect-[4/3]"
                                />
                                <div className="p-1.5 bg-slate-900 text-right">
                                  <span className="text-[9px] text-slate-400">Foto anexada • {activeCampaign.title}</span>
                                </div>
                              </div>

                              {/* Balão de Texto do Direct */}
                              <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-2xl rounded-tr-sm p-3.5 text-xs font-normal leading-relaxed shadow-lg max-w-sm">
                                <p className="whitespace-pre-wrap">{effectiveScript}</p>
                                <div className="text-right pt-1">
                                  <span className="text-[9px] text-pink-200">Enviado agora • Entregue</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: EDITABLE DISPATCH & REPLYRUSH INTEGRATION */}
      <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 text-xs font-semibold border border-indigo-800/60">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>REPLYRUSH & DIRECT DISPATCH • MENSAGEM 100% EDITÁVEL</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Editor de Mensagem para Disparo Automático (ReplyRush & Direct)
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Altere o texto, o gatilho (palavra-chave) e o link que o robô envia no direct quando alguém comentar no seu post ou te chamar no Instagram. Suas edições ficam salvas na nuvem Firebase.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="https://app.replyrush.com/posts?view=list&status=all&page=1"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition shrink-0 shadow-lg"
            >
              <span>Abrir Painel do ReplyRush</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Dispatch Editor Card */}
        <div className="p-6 bg-slate-950 border border-indigo-900/60 rounded-2xl space-y-5">
          {/* Top Controls: Trigger Keyword & Campaign Link Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Trigger Keyword Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Gatilho (Palavra-Chave no Post):</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editingKeyword}
                  onChange={(e) => setEditingKeyword(e.target.value.toUpperCase())}
                  placeholder="ex: EU QUERO, QUERO, PDF, MATERIAL..."
                  className="w-full bg-slate-900 border border-amber-500/50 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400 uppercase placeholder-slate-500"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400">Sugestões de gatilho:</span>
                {['EU QUERO', 'QUERO', 'PDF', 'ATIVIDADES', 'MILHAS'].map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => setEditingKeyword(kw)}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 transition cursor-pointer font-mono"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>

            {/* Campaign Destination Link Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Vincular Link do Produto no Texto:</span>
              </label>
              <select
                value={selectedCampaignForDispatch}
                onChange={(e) => handleApplyCampaignLink(e.target.value)}
                className="w-full bg-slate-900 border border-emerald-600/50 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-emerald-300 focus:outline-none focus:border-emerald-400 cursor-pointer"
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} • R$ {c.price.toFixed(2)}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400 block pt-1">
                Ao selecionar, o link exclusivo da landing page é atualizado automaticamente na mensagem.
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SMART AUTO-COPYWRITER & PERSUASIVE CTA GENERATOR                          */}
          {/* (Público: Mãe, Prof, Educador, Profissional, Imagem de Confiança & CTA)   */}
          {/* ========================================================================= */}
          <div className="bg-gradient-to-b from-indigo-950/70 via-slate-900 to-slate-950 border-2 border-indigo-500/60 rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xl relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-900/50 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/80 text-indigo-300 text-[11px] font-bold border border-indigo-700/50">
                  <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>CRIADOR INTELIGENTE DE MENSAGEM & CTA CONVINCENTE</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>Criar Mensagem Personalizada por Público & Imagem</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Selecione o público (mãe, professora, educador...), o tipo de link e a imagem oficial do produto para gerar automaticamente copys persuasivas que quebram objeções e fecham vendas.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsGeneratorOpen(!isGeneratorOpen)}
                className="text-xs text-indigo-300 hover:text-white bg-indigo-950/80 px-3 py-1.5 rounded-xl border border-indigo-800/60 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <span>{isGeneratorOpen ? 'Minimizar Gerador' : 'Expandir Gerador'}</span>
              </button>
            </div>

            {isGeneratorOpen && (
              <div className="space-y-6">
                {/* PASSO 1: SELECIONAR A QUEM SE DESTINA (PERSONA / PÚBLICO-ALVO) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span>1. Selecionar a quem se destina a mensagem (Público-Alvo):</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Adapta o tom, a dor e o vocabulário
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'mae', label: 'Mãe / Família', icon: '💖', desc: 'Foco em afeto, paciência e estímulo do filho em casa' },
                      { id: 'prof', label: 'Professora', icon: '👩‍🏫', desc: 'Foco em sala de aula, alinhado à BNCC e poupar tempo' },
                      { id: 'educador', label: 'Educador / TEA', icon: '🧩', desc: 'Foco em inclusão, coordenação e sem crise sensorial' },
                      { id: 'profissional', label: 'Profissional', icon: '🩺', desc: 'Foco em consultório, terapia e reforço escolar' },
                      { id: 'todos', label: 'Todos (Misto)', icon: '👥', desc: 'Linguagem ampla e acolhedora (profe & mamãe)' },
                    ].map((p) => {
                      const isSelected = selectedPersona === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedPersona(p.id as TargetAudiencePersona)}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between space-y-1.5 ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/40'
                              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-base">{p.icon}</span>
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-bold block">{p.label}</span>
                            <span className="text-[10px] text-slate-400 block line-clamp-2 leading-tight">
                              {p.desc}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* PASSO 2: DADOS DO PRODUTO, LINK DE COMPRA & IMAGEM DE CONFIANÇA */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-1">
                  {/* Detalhes do Produto e Preço (2 Colunas) */}
                  <div className="lg:col-span-2 space-y-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                      <Tag className="w-3.5 h-3.5 text-emerald-400" />
                      <span>2. Informações do Produto & Link de Compra:</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Título do Produto */}
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[11px] font-bold text-slate-300">Título do Produto:</label>
                        <input
                          type="text"
                          value={generatorTitle}
                          onChange={(e) => setGeneratorTitle(e.target.value)}
                          placeholder="ex: + 100 Tarefinha Educação Infantil e Autismo"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-indigo-400"
                        />
                      </div>

                      {/* Valor Promocional */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-300">Valor Promocional (R$):</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-xs text-emerald-400 font-bold">R$</span>
                          <input
                            type="text"
                            value={generatorPrice}
                            onChange={(e) => setGeneratorPrice(e.target.value)}
                            placeholder="9,90"
                            className="w-full bg-slate-950 border border-emerald-600/50 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-emerald-300 focus:outline-none focus:border-emerald-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Seleção do Tipo de Link */}
                    <div className="space-y-2 pt-1 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-300">
                          Inserir Link de Compra no Direct:
                        </label>
                        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px]">
                          <button
                            type="button"
                            onClick={() => setGeneratorLinkType('landing')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                              generatorLinkType === 'landing'
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Página Oficial (Landing)
                          </button>
                          <button
                            type="button"
                            onClick={() => setGeneratorLinkType('checkout')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                              generatorLinkType === 'checkout'
                                ? 'bg-emerald-600 text-slate-950'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Checkout Direto (Hotmart/Eduzz)
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={generatorCustomLink}
                        onChange={(e) => setGeneratorCustomLink(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none focus:border-indigo-400"
                      />
                    </div>

                    {/* Escolha do Objetivo do CTA */}
                    <div className="space-y-1.5 pt-1 border-t border-slate-800">
                      <label className="text-[11px] font-bold text-slate-300 block">
                        Gatilho do CTA (Chamada para Ação Convincente):
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {[
                          { id: 'facilidade', label: '⚡ Download Imediato', desc: 'Chega na hora no e-mail' },
                          { id: 'urgencia', label: '🔥 Urgência / Desconto', desc: 'Valor promocional limitado' },
                          { id: 'whatsapp', label: '📲 Dúvidas no WhatsApp', desc: 'Atendimento humanizado' },
                          { id: 'garantia', label: '🛡️ Risco Zero 7 Dias', desc: 'Garantia total Hotmart' },
                        ].map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setGeneratorCtaGoal(c.id as any)}
                            className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                              generatorCtaGoal === c.id
                                ? 'bg-indigo-600/30 border-indigo-400 text-white'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span className="text-[11px] font-bold block">{c.label}</span>
                            <span className="text-[9px] text-slate-500 block">{c.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Coluna de Imagem do Produto (Mais Confiança) */}
                  <div className="bg-slate-900/80 border border-indigo-900/60 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                          <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                          <span>Imagem de Confiança:</span>
                        </span>
                        <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
                          +300% de Conversão
                        </span>
                      </div>

                      {/* Preview da Capa */}
                      <div className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-[4/3] flex items-center justify-center">
                        {generatorImagePreviewUrl ? (
                          <img
                            src={generatorImagePreviewUrl}
                            alt="Capa do Produto"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="text-center p-3 text-slate-500 text-xs">
                            <ImageIcon className="w-8 h-8 mx-auto mb-1 text-slate-600" />
                            <span>Sem capa cadastrada</span>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-sm text-[10px] text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-800/60 font-bold">
                          Capa Oficial
                        </div>
                      </div>

                      {/* Opção para mencionar no direct */}
                      <label className="flex items-start gap-2 pt-1 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={generatorIncludeImage}
                          onChange={(e) => setGeneratorIncludeImage(e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded text-indigo-500 focus:ring-indigo-400 bg-slate-950 border-slate-700 cursor-pointer"
                        />
                        <span className="text-[11px] leading-snug">
                          Mencionar imagem na mensagem: <em>"(Veja a foto do material acima ☝️)"</em>
                        </span>
                      </label>
                    </div>

                    {/* Botões de Imagem */}
                    <div className="space-y-2 pt-1 border-t border-slate-800">
                      {/* Botão Principal: Copiar Imagem para o Clipboard (Ctrl+V) */}
                      <button
                        type="button"
                        onClick={() => handleCopyImageToClipboard(generatorImagePreviewUrl)}
                        className="w-full py-2 px-2.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
                        title="Copia a imagem direto para a área de transferência para colar no Instagram Direct ou WhatsApp (Ctrl+V)"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>
                          {copiedId === 'copy-img-clipboard' || copyImageSuccess
                            ? '✅ Foto Copiada! (Cole com Ctrl+V)'
                            : 'Copiar Foto (Ctrl+V no Chat)'}
                        </span>
                      </button>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={handleDownloadProductImage}
                          className="py-1.5 px-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-lg text-[10px] font-bold border border-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3 text-indigo-400" />
                          <span>Baixar Arquivo</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleCopyImageLink}
                          className="py-1.5 px-2 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-lg text-[10px] font-medium border border-slate-800 transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedId === 'copy-product-image-url' ? 'Link OK!' : 'Copiar Link'}</span>
                        </button>
                      </div>

                      <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800 text-[10px] text-slate-400 leading-snug">
                        💡 <strong>Como funciona:</strong> Clique em <em>"Copiar Foto"</em> e, na conversa do Instagram ou WhatsApp, aperte <strong>Ctrl+V</strong> para a capa aparecer anexada no chat!
                      </div>
                    </div>
                  </div>
                </div>

                {/* BOTÃO PRINCIPAL DE GERAÇÃO */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleGeneratePersuasiveMessages}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-xl transition cursor-pointer shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                    <span>GERAR MENSAGENS COM CTA CONVINCENTE</span>
                  </button>

                  <span className="text-[11px] text-slate-400 text-center sm:text-right">
                    Gera 3 opções persuasivas adaptadas para <strong>{selectedPersona === 'todos' ? 'Mães & Professoras' : selectedPersona.toUpperCase()}</strong>
                  </span>
                </div>

                {/* EXIBIÇÃO DAS MENSAGENS GERADAS */}
                {generatedCopies.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-indigo-900/60 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>3 Opções Convincentes Geradas: Escolha uma para usar</span>
                      </span>
                      <span className="text-[11px] text-slate-400">Clique em "Usar no Editor" para carregar abaixo</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {generatedCopies.map((copy) => (
                        <div
                          key={copy.id}
                          className="p-4 bg-slate-950 border border-slate-800 hover:border-indigo-500/60 rounded-xl flex flex-col justify-between space-y-3 transition"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                                {copy.badge}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-white">{copy.title}</h4>
                            <p className="text-[10px] text-slate-400">{copy.hook}</p>
                            <pre className="text-[11px] text-emerald-300 font-mono bg-slate-900/90 p-3 rounded-lg border border-slate-800/80 whitespace-pre-wrap leading-relaxed line-clamp-6">
                              {copy.text}
                            </pre>
                          </div>

                          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800/80">
                            <button
                              type="button"
                              onClick={() => handleApplyGeneratedCopy(copy.text)}
                              className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-xs rounded-lg transition flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-emerald-500/20"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Usar no Editor</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => copyToClipboard(copy.text, `copy-gen-${copy.id}`)}
                              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs transition cursor-pointer border border-slate-700"
                              title="Copiar mensagem"
                            >
                              {copiedId === `copy-gen-${copy.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Insert Pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <span>Inserir rapidamente:</span>
            </span>
            <button
              type="button"
              onClick={() => {
                const target = campaigns.find((c) => c.id === selectedCampaignForDispatch) || campaigns[0];
                const slug = target ? getCampaignSlug(target) : 'tarefinhas';
                handleInsertTag(`👉 ${window.location.origin}/?p=${slug}&src=replyrush`);
              }}
              className="text-[11px] bg-slate-900 hover:bg-slate-800 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-800/50 transition cursor-pointer font-medium"
            >
              + Link do Produto
            </button>
            <button
              type="button"
              onClick={() => {
                const target = campaigns.find((c) => c.id === selectedCampaignForDispatch) || campaigns[0];
                handleInsertTag(`R$ ${(target?.price || 9.90).toFixed(2).replace('.', ',')}`);
              }}
              className="text-[11px] bg-slate-900 hover:bg-slate-800 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-800/50 transition cursor-pointer font-medium"
            >
              + Valor Promocional
            </button>
            <button
              type="button"
              onClick={() => handleInsertTag('📲 https://wa.me/5541998778348?text=Oi!%20Vim%20pelo%20Instagram')}
              className="text-[11px] bg-slate-900 hover:bg-slate-800 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-800/50 transition cursor-pointer font-medium"
            >
              + Link WhatsApp
            </button>
            <button
              type="button"
              onClick={() => handleInsertTag('🎨📚')}
              className="text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded-lg border border-slate-700 transition cursor-pointer"
            >
              🎨📚
            </button>
            <button
              type="button"
              onClick={() => handleInsertTag('👉')}
              className="text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded-lg border border-slate-700 transition cursor-pointer"
            >
              👉
            </button>
            <button
              type="button"
              onClick={() => handleInsertTag('✨')}
              className="text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded-lg border border-slate-700 transition cursor-pointer"
            >
              ✨
            </button>
          </div>

          {/* Editable Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-300 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Texto Completo da Mensagem que o Lead Recebe:</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {editingMessage.length} caracteres
              </span>
            </div>

            <textarea
              id="dispatch-message-textarea"
              value={editingMessage}
              onChange={(e) => setEditingMessage(e.target.value)}
              rows={8}
              placeholder="Digite a mensagem personalizada que será enviada no direct..."
              className="w-full bg-slate-900/90 border border-indigo-600/50 rounded-xl p-4 text-xs sm:text-sm font-mono text-emerald-300 leading-relaxed focus:outline-none focus:border-indigo-400 resize-y selection:bg-indigo-900"
            />
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleSaveDispatchMessage}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition cursor-pointer shadow-lg shadow-emerald-500/25 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Mensagem na Nuvem</span>
              </button>

              <button
                type="button"
                onClick={() => copyToClipboard(editingMessage, 'copy-replyrush-msg')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer border border-slate-700"
              >
                {copiedId === 'copy-replyrush-msg' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Mensagem Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Mensagem</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleTestOnWhatsApp}
                className="px-4 py-2.5 bg-green-700/80 hover:bg-green-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer border border-green-600/40"
                title="Abre o WhatsApp com a mensagem preenchida para testar no celular"
              >
                <Smartphone className="w-4 h-4 text-green-300" />
                <span>Testar no WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleResetDispatchMessage}
                className="px-3 py-2 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                title="Restaura a mensagem original sugerida"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Padrão</span>
              </button>
            </div>

            {dispatchSavedSuccess && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Mensagem salva na nuvem Firebase com sucesso!</span>
              </span>
            )}
          </div>

          {/* Quick AI Copy Presets */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-400 block mb-2">
              💡 Modelos Prontos de Alta Conversão (Clique para carregar no editor):
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = campaigns.find((c) => c.id === selectedCampaignForDispatch) || campaigns[0];
                  const slug = target ? getCampaignSlug(target) : 'tarefinhas';
                  const priceStr = `R$ ${(target?.price || 9.90).toFixed(2).replace('.', ',')}`;
                  setEditingKeyword('EU QUERO');
                  setEditingMessage(
                    `Olá, profe/mamãe! 🎨🧩 Vi que você comentou querendo o material inclusivo.\n\nPreparei a página com o caderno completo pronto para imprimir (+ 100 tarefinhas por apenas ${priceStr}):\n👉 ${window.location.origin}/?p=${slug}&src=replyrush\n\nSe tiver qualquer dúvida pedagógica ou sobre os arquivos, pode me chamar direto no meu WhatsApp oficial:\n📲 https://wa.me/5541998778348?text=Oi!%20Vim%20pelo%20Instagram%20das%20tarefinhas`
                  );
                }}
                className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-600/50 rounded-xl text-left transition cursor-pointer space-y-1"
              >
                <span className="text-xs font-bold text-indigo-300 block">
                  1. Modelo Acolhedor & Empático
                </span>
                <span className="text-[10px] text-slate-400 block line-clamp-2">
                  Tom maternal/pedagógico, validação de cansaço e link com valor acessível.
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = campaigns.find((c) => c.id === selectedCampaignForDispatch) || campaigns[0];
                  const slug = target ? getCampaignSlug(target) : 'tarefinhas';
                  const priceStr = `R$ ${(target?.price || 9.90).toFixed(2).replace('.', ',')}`;
                  setEditingKeyword('PDF');
                  setEditingMessage(
                    `Oi! Tudo bem? Aqui está o link que você pediu nos comentários:\n\n👉 ${window.location.origin}/?p=${slug}&src=replyrush\n\nO acesso é imediato no seu e-mail e o arquivo em PDF de alta resolução sai por apenas ${priceStr} hoje na Hotmart. Qualquer dúvida estou no WhatsApp: 📲 https://wa.me/5541998778348`
                  );
                }}
                className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-600/50 rounded-xl text-left transition cursor-pointer space-y-1"
              >
                <span className="text-xs font-bold text-emerald-300 block">
                  2. Modelo Direto & Desconto
                </span>
                <span className="text-[10px] text-slate-400 block line-clamp-2">
                  Mensagem rápida e objetiva com entrega imediata e link direto.
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = campaigns.find((c) => c.id === selectedCampaignForDispatch) || campaigns[0];
                  const slug = target ? getCampaignSlug(target) : 'tarefinhas';
                  setEditingKeyword('QUERO');
                  setEditingMessage(
                    `Olá! Que alegria ver seu interesse em atividades estruturadas para crianças.\n\nLiberamos o material com mais de 100 fichas lúdicas prontas para imprimir:\n👉 ${window.location.origin}/?p=${slug}&src=replyrush\n\nQual a idade do seu filho ou dos seus alunos? Pode me mandar no WhatsApp oficial (+55 41 99877-8348) que te oriento com carinho!`
                  );
                }}
                className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-600/50 rounded-xl text-left transition cursor-pointer space-y-1"
              >
                <span className="text-xs font-bold text-amber-300 block">
                  3. Modelo Consultivo com Pergunta
                </span>
                <span className="text-[10px] text-slate-400 block line-clamp-2">
                  Faz uma pergunta sobre a idade da criança para abrir conversa no WhatsApp.
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: TERMOS DE BUSCA NO PINTEREST */}
      <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950 border border-red-900/50 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
          <Pin className="w-4 h-4" />
          <span>MINERAÇÃO PASSIVA: TERMOS QUE O PÚBLICO PESQUISA NO PINTEREST</span>
        </div>
        <h3 className="text-xl font-bold text-white">
          O Que as Pessoas Desse Segmento Pesquisam no Pinterest
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Use esses termos como títulos dos seus Pins. É assim que professoras e mães encontram seu link de graça:
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          {currentNicheData.pinterestSearchTerms.map((term, i) => (
            <div
              key={i}
              className="px-3.5 py-2 bg-slate-900/90 rounded-xl border border-red-900/40 text-xs text-red-200 flex items-center gap-2"
            >
              <Search className="w-3.5 h-3.5 text-red-400" />
              <span>{term}</span>
              <button
                onClick={() => copyToClipboard(term, `term-${i}`)}
                className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
              >
                {copiedId === `term-${i}` ? '✓' : 'Copiar'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
