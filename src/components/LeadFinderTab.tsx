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
  CheckCircle,
} from 'lucide-react';
import { Campaign } from '../types';
import {
  subscribeCustomProfiles,
  saveCustomProfileToFirebase,
  deleteCustomProfileFromFirebase,
  InstagramOriginAccount,
  saveInstagramOriginAccountToFirebase,
  subscribeInstagramOriginAccount,
} from '../lib/firebase';

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

    const isTarefinhas =
      campaigns.some((c) => c.id === 'camp-tarefinhas-autismo') ||
      selectedSegmentId === 'pedagogia';
    const activePrice = isTarefinhas ? 'R$ 9,90' : 'R$ 385,00';
    const activeLink = isTarefinhas
      ? 'https://robo-trafego.vercel.app/?p=tarefinhas&src=outreach_arroba'
      : 'https://robo-trafego.vercel.app/?p=milhas&src=outreach_arroba';

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
      focus: isTarefinhas
        ? 'Pedagogia, Educação Infantil, Apoio Materno & Autismo (TEA)'
        : 'Renda Extra & Milhas Lucrativas',
      whatToLook:
        'Verifique as publicações recentes, comentários de mães ou professoras com dúvidas de materiais e inicie uma conversa acolhedora com o script.',
      script: isTarefinhas
        ? `Olá ${formattedName}! Acompanho seu trabalho no Instagram e acho maravilhosa sua dedicação. Desenvolvemos um caderno com mais de 100 tarefinhas lúdicas adaptadas em PDF para Educação Infantil e crianças com autismo (TEA) por apenas ${activePrice}. Deixei a amostra aqui se quiser ver: ${activeLink}`
        : `Olá ${formattedName}! Vi seu perfil e achei seu conteúdo muito bacana. Desenvolvemos um método prático de renda extra com milhas por ${activePrice}. Dá uma olhada aqui: ${activeLink}`,
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Variações Humanizadas de Mensagem (Spin-Syntax Anti-Spam)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              O robô alterna automaticamente para nunca repetir a mesma mensagem
            </span>
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
                  <button
                    onClick={() => copyToClipboard(template, `spin-${idx}`)}
                    className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    {copiedId === `spin-${idx}` ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed italic line-clamp-4">
                  "{template}"
                </p>
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
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-800/50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Selecionar Todos ({displayedProfiles.length}) para a Fila</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profiles List */}
          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {displayedProfiles.map((p, idx) => {
              const isChecked = selectedHandles.includes(p.handle);
              return (
                <div
                  key={p.handle}
                  onClick={() => setSelectedProfileIndex(idx)}
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

            <div className="space-y-3">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                <h4 className="text-xs font-bold text-slate-200">
                  🔍 O que procurar nos comentários deste perfil:
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentProfile.whatToLook}
                </p>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-300">
                    💬 Script de Abordagem Amigável para {currentProfile.handle} (Anti-Bloqueio / Sem Venda Agressiva):
                  </h4>
                  <button
                    onClick={() => copyToClipboard(currentProfile.script, `copy-script-${selectedProfileIndex}`)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === `copy-script-${selectedProfileIndex}` ? (
                      <span>✅ Copiado!</span>
                    ) : (
                      <span>Copiar Script</span>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-300 italic bg-slate-950 p-3 rounded-lg border border-slate-800 leading-relaxed">
                  "{currentProfile.script}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: REPLYRUSH INTEGRATION (USER HAS REPLYRUSH BOOKMARKED) */}
      <div className="bg-slate-900 border border-indigo-900/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 text-xs font-semibold border border-indigo-800/60">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>REPLYRUSH AUTO DM • NICHO: {currentNicheData.label.toUpperCase()}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Configuração Rápida para o ReplyRush (Comentou no Post ➡️ Recebe Link no Direct)
            </h2>
            <p className="text-xs text-slate-400">
              Você já tem o ReplyRush aberto nos favoritos. Copie a mensagem configurada abaixo para disparar quando alguém comentar no seu post do Instagram:
            </p>
          </div>

          <a
            href="https://app.replyrush.com/posts?view=list&status=all&page=1"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition shrink-0"
          >
            <span>Abrir Painel do ReplyRush</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* ReplyRush DM Template Box */}
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Gatilho (Palavra-Chave no Post):</span>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
                {currentNicheData.replyRushKeyword}
              </span>
            </div>

            <button
              onClick={() => copyToClipboard(currentNicheData.replyRushMessage, 'copy-replyrush-msg')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
            >
              {copiedId === 'copy-replyrush-msg' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Mensagem Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Mensagem do Direct</span>
                </>
              )}
            </button>
          </div>

          <pre className="text-xs text-slate-300 font-mono bg-slate-900/90 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap leading-relaxed">
            {currentNicheData.replyRushMessage}
          </pre>
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
