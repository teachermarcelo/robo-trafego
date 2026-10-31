import React, { useState } from 'react';
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
  Scissors,
  Scale,
} from 'lucide-react';
import { Campaign } from '../types';

interface LeadFinderTabProps {
  campaigns: Campaign[];
}

interface TargetProfile {
  handle: string;
  name: string;
  url: string;
  audience: string;
  focus: string;
  whatToLook: string;
  script: string;
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
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('pedagogia');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedProfileIndex, setSelectedProfileIndex] = useState(0);

  const myWhatsApp = '5541998778348';

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
      badge: 'Material Pronto em PDF',
      iconName: 'heart',
      description: 'Professoras de educação infantil, psicopedagogas e mães atípicas buscando atividades prontas para imprimir.',
      replyRushKeyword: 'EU QUERO',
      replyRushMessage: `Olá, profe/mamãe! 🎨📚 Vi que você comentou querendo as tarefinhas inclusivas para Educação Infantil e Autismo (TEA).\n\nPreparei a página com o material completo pronto para imprimir (+ 100 tarefinhas por apenas R$ 9,90):\n👉 https://robo-trafego.vercel.app/?p=tarefinhas&src=replyrush\n\nSe tiver qualquer dúvida pedagógica ou sobre os arquivos, pode me chamar direto no meu WhatsApp oficial:\n📲 https://wa.me/5541998778348?text=Oi!%20Vim%20pelo%20Instagram%20das%20tarefinhas%20de%20autismo!`,
      pinterestSearchTerms: [
        'atividades autismo educação infantil pdf',
        'tarefinhas autismo para imprimir',
        'atividades coordenação motora fina imprimir',
        'jogos pedagógicos autismo',
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
          script: `Oi profe! Vi que você comentou lá no post procurando atividades adaptadas... se você quiser economizar tempo, eu tenho um pacote com + 100 tarefinhas lúdicas em PDF prontas para imprimir (inclusive autismo/TEA). Deixei a amostra aqui: https://robo-trafego.vercel.app/?p=tarefinhas&src=outreach_direct`,
        },
        {
          handle: '@taiseagostini',
          name: 'Taise Agostini',
          url: 'https://www.instagram.com/taiseagostini/',
          audience: '1.8M seguidoras',
          focus: 'Educação Infantil, recursos lúdicos e alfabetização',
          whatToLook: 'Professoras pedindo moldes e atividades de coordenação motora e vogais.',
          script: `Olá! Vi seu comentário no post da Taise sobre atividades lúdicas. Desenvolvi um kit com mais de 100 tarefinhas em PDF prontas para imprimir para Educação Infantil e crianças atípicas. Dá uma olhada aqui: https://robo-trafego.vercel.app/?p=tarefinhas&src=outreach_direct`,
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
          script: `Oi! Vi seu comentário no post querendo atividades em PDF. Esse material com 100 atividades lúdicas para imprimir tá com promoção hoje: https://robo-trafego.vercel.app/?p=tarefinhas&src=outreach_direct`,
        },
      ],
    },
    milhas: {
      id: 'milhas',
      label: 'Milhas & Viagens Lucrativas',
      badge: 'Renda Extra & Cartões',
      iconName: 'zap',
      description: 'Pessoas com gastos no cartão buscando transformar pontos em dinheiro vivo ou viajar pagando quase nada.',
      replyRushKeyword: 'MILHAS',
      replyRushMessage: `Opa! Vi que você comentou no meu post querendo aprender sobre milhas e renda extra. 🚀\n\nCriei uma página explicando o passo a passo exato para você começar sem precisar gastar nada a mais:\n👉 https://robo-trafego.vercel.app/?p=milhas&src=replyrush\n\nSe você tiver qualquer dúvida ou quiser falar comigo, pode me chamar direto no meu WhatsApp:\n📲 https://wa.me/5541998778348?text=Oi!%20Vim%20pelo%20Instagram%20e%20quero%20começar%20na%20Comunidade%20Milhas!`,
      pinterestSearchTerms: [
        'como acumular milhas no cartão',
        'passagens aéreas baratas',
        'como usar a livelo',
        'salas vip aeroporto gratis',
        'renda extra cartão de crédito',
      ],
      profiles: [
        {
          handle: '@passageirodeprimeira',
          name: 'Passageiro de Primeira',
          url: 'https://www.instagram.com/passageirodeprimeira/',
          audience: '680k seguidores',
          focus: 'Cartões Black, Salas VIP e Emissões de Passagens com Milhas',
          whatToLook: 'Abra os posts sobre "Promoção Livelo/Esfera" e olhe os comentários de pessoas perguntando como funciona ou se vale a pena.',
          script: `Oi! Vi que você comentou lá no post sobre as milhas da Livelo... se você ainda tiver com dúvida, eu tenho um resumo prático mostrando como acumular sem pagar anuidade: https://robo-trafego.vercel.app/?p=milhas&src=outreach_direct`,
        },
        {
          handle: '@melhoresdestinos',
          name: 'Melhores Destinos',
          url: 'https://www.instagram.com/melhoresdestinos/',
          audience: '3.1M seguidores',
          focus: 'Promoções de passagens e dicas de viagem econômica',
          whatToLook: 'Pessoas reclamando nos comentários que passagens aéreas estão caras. Elas são leads perfeitos para a Comunidade de Milhas!',
          script: `Oi! Vi seu comentário no post falando sobre o preço da passagem. Dá para viajar pagando quase nada se usar milhas de gastos do dia a dia: https://robo-trafego.vercel.app/?p=milhas&src=outreach_direct`,
        },
        {
          handle: '@pontos_e_milhas',
          name: 'Pontos e Milhas',
          url: 'https://www.instagram.com/pontos_e_milhas/',
          audience: '420k seguidores',
          focus: 'Dicas práticas de cartões e acúmulo no dia a dia',
          whatToLook: 'Pessoas perguntando qual cartão pedir ou como não pagar anuidade.',
          script: `Fala! Se tiver procurando como pontuar com os gastos da sua fatura sem pagar anuidade, criei esse resumo: https://robo-trafego.vercel.app/?p=milhas&src=outreach_direct`,
        },
        {
          handle: '@estevaopelomundo',
          name: 'Estêvão Pelo Mundo',
          url: 'https://www.instagram.com/estevaopelomundo/',
          audience: '1.4M seguidores',
          focus: 'Viagens e emissões em classe executiva com milhas',
          whatToLook: 'Seguidores maravilhados perguntando como conseguir viajar sem gastar fortuna.',
          script: `Oi! Se você tem vontade de emitir passagens baratas com pontos que já acumula no banco, preparei esse guia: https://robo-trafego.vercel.app/?p=milhas&src=outreach_direct`,
        },
      ],
    },
    emagrecimento: {
      id: 'emagrecimento',
      label: 'Emagrecimento & Bem-Estar',
      badge: 'Saúde & Autoestima',
      iconName: 'flame',
      description: 'Mulheres de 25 a 55 anos buscando desinchar e perder peso sem dietas restritivas malucas.',
      replyRushKeyword: 'DETOX',
      replyRushMessage: `Oi linda! 🥗 Vi que você comentou querendo o protocolo natural para desinchar e secar.\n\nLiberamos o passo a passo com cardápios e chás no valor promocional:\n👉 https://robo-trafego.vercel.app/?niche=emagrecimento&src=replyrush\n\nQualquer dúvida me chama no WhatsApp: 📲 https://wa.me/5541998778348`,
      pinterestSearchTerms: [
        'receitas secar barriga em casa',
        'cardápio detox 21 dias',
        'como desinchar rápido',
        'chás naturais para emagrecer',
        'marmitas saudáveis para a semana',
      ],
      profiles: [
        {
          handle: '@receitasfit.emagrecer',
          name: 'Receitas Fit & Emagrecer',
          url: 'https://www.instagram.com/explore/tags/receitasfit/',
          audience: '950k seguidoras',
          focus: 'Receitas saudáveis e dietas práticas',
          whatToLook: 'Mulheres comentando que não têm tempo para cozinhar ou que não aguentam mais o efeito sanfona.',
          script: `Oi! Vi seu comentário no post sobre a dificuldade de manter a dieta... montei um guia com receitas de 15 minutos e chás naturais para desinchar: https://robo-trafego.vercel.app/?niche=emagrecimento&src=outreach_direct`,
        },
        {
          handle: '@emagrecercomsaude',
          name: 'Emagrecer com Saúde',
          url: 'https://www.instagram.com/explore/tags/emagrecercomsaude/',
          audience: '1.2M seguidoras',
          focus: 'Emagrecimento sem passar fome',
          whatToLook: 'Pessoas perguntando como começar e reclamando de inchaço na barriga.',
          script: `Olá! Vi sua dúvida sobre como queimar gordura sem passar fome... esse protocolo de 21 dias tá ajudando centenas de mulheres: https://robo-trafego.vercel.app/?niche=emagrecimento&src=outreach_direct`,
        },
      ],
    },
    ingles: {
      id: 'ingles',
      label: 'Inglês & Idiomas',
      badge: 'Carreira & Trabalho',
      iconName: 'graduation-cap',
      description: 'Profissionais e adultos que entendem inglês mas travam na fala em reuniões e entrevistas.',
      replyRushKeyword: 'INGLES',
      replyRushMessage: `Hello! 🇬🇧 Vi que você quer destravar sua fala no trabalho sem perder anos em cursinhos.\n\nAqui está o método prático focado em reuniões:\n👉 https://robo-trafego.vercel.app/?niche=ingles&src=replyrush\n\nDúvidas? Pode me chamar no WhatsApp: 📲 https://wa.me/5541998778348`,
      pinterestSearchTerms: [
        'frases em inglês para trabalho e reuniões',
        'como destravar a fala no inglês',
        'vocabulário corporativo inglês',
        'guia de inglês para entrevistas',
      ],
      profiles: [
        {
          handle: '@ingleswinner',
          name: 'Inglês Winner',
          url: 'https://www.instagram.com/explore/tags/inglesparabrasileiros/',
          audience: '850k seguidores',
          focus: 'Dicas de conversação para brasileiros',
          whatToLook: 'Comentários de pessoas dizendo: "Eu entendo tudo lendo, mas na hora de falar dá branco".',
          script: `Oi! Vi seu comentário falando sobre o medo de travar ao falar inglês no trabalho. Preparei um resumo de frases prontas para reuniões: https://robo-trafego.vercel.app/?niche=ingles&src=outreach_direct`,
        },
      ],
    },
    confeitaria: {
      id: 'confeitaria',
      label: 'Confeitaria & Doces Gourmet',
      badge: 'Renda com Doces',
      iconName: 'utensils',
      description: 'Mulheres e empreendedoras buscando fazer doces, bolos e brigadeiros gourmet em casa para vender.',
      replyRushKeyword: 'DOCES',
      replyRushMessage: `Oi doceira! 🍰 Vi que você quer aprender a faturar com doces gourmet da sua cozinha.\n\nLiberei a apostila com receitas testadas e precificação certa:\n👉 https://robo-trafego.vercel.app/?niche=confeitaria&src=replyrush\n\nDúvidas? Me chama: 📲 https://wa.me/5541998778348`,
      pinterestSearchTerms: [
        'receitas de brigadeiro gourmet para vender',
        'como precificar bolos caseiros',
        'doces faça e venda lucrativos',
        'copos da felicidade receitas',
      ],
      profiles: [
        {
          handle: '@confeitaria.brasil',
          name: 'Confeitaria Brasil & Cursos',
          url: 'https://www.instagram.com/explore/tags/confeitariagourmet/',
          audience: '670k seguidoras',
          focus: 'Receitas profissionais e dicas de vendas de doces',
          whatToLook: 'Comentários de pessoas perguntando quanto cobrar ou pedindo o ponto correto do brigadeiro.',
          script: `Olá! Vi seu comentário no post de doces gourmet... preparei uma apostila com receitas que mais vendem e tabela de preço: https://robo-trafego.vercel.app/?niche=confeitaria&src=outreach_direct`,
        },
      ],
    },
    pets: {
      id: 'pets',
      label: 'Pets & Adestramento',
      badge: 'Cães & Filhotes',
      iconName: 'dog',
      description: 'Tutores de cães com problemas de latidos, xixi no lugar errado e destruição de móveis.',
      replyRushKeyword: 'PET',
      replyRushMessage: `Oi! 🐾 Vi que você quer educar seu cãozinho com carinho e sem estresse.\n\nLiberamos o guia de adestramento positivo em 15 minutos por dia:\n👉 https://robo-trafego.vercel.app/?niche=pets&src=replyrush\n\nFale comigo: 📲 https://wa.me/5541998778348`,
      pinterestSearchTerms: [
        'como ensinar cachorro fazer xixi no tapete',
        'adestramento positivo cães filhotes',
        'como fazer o cachorro parar de morder',
      ],
      profiles: [
        {
          handle: '@tudosobrecachorros',
          name: 'Tudo Sobre Cachorros',
          url: 'https://www.instagram.com/explore/tags/adestramentocanino/',
          audience: '890k seguidores',
          focus: 'Comportamento canino e educação de filhotes',
          whatToLook: 'Tutores desesperados comentando que o cachorro rói tudo ou faz xixi pela casa inteira.',
          script: `Oi! Vi seu relato sobre o filhote comendo móveis e fazendo xixi fora... tem um método em 3 passos bem simples que resolve rápido: https://robo-trafego.vercel.app/?niche=pets&src=outreach_direct`,
        },
      ],
    },
  };

  // Check if current selection is one of catalog niches or a custom search
  const currentNicheData: NicheData = catalogNiches[selectedSegmentId] || {
    id: selectedSegmentId,
    label: selectedSegmentId.toUpperCase(),
    badge: 'Segmento Personalizado',
    iconName: 'compass',
    description: `Mineração em tempo real para pessoas interessadas em ${selectedSegmentId}.`,
    replyRushKeyword: 'QUERO',
    replyRushMessage: `Olá! Vi que você comentou querendo saber mais sobre ${selectedSegmentId}.\n\nCriei uma página explicando todos os detalhes:\n👉 https://robo-trafego.vercel.app/?niche=${encodeURIComponent(
      selectedSegmentId
    )}&src=replyrush\n\nSe tiver qualquer dúvida, pode me chamar direto no WhatsApp: 📲 https://wa.me/5541998778348`,
    pinterestSearchTerms: [
      `${selectedSegmentId} passo a passo`,
      `como aprender ${selectedSegmentId}`,
      `dicas ${selectedSegmentId} para iniciantes`,
      `${selectedSegmentId} em pdf para baixar`,
    ],
    profiles: [
      {
        handle: `@comunidade_${selectedSegmentId.toLowerCase().replace(/\s+/g, '')}`,
        name: `Comunidade ${selectedSegmentId}`,
        url: `https://www.instagram.com/explore/tags/${encodeURIComponent(selectedSegmentId.toLowerCase().replace(/\s+/g, ''))}/`,
        audience: '+ 250k pessoas',
        focus: `Público ativo interessado em soluções e compras para ${selectedSegmentId}`,
        whatToLook: `Abra as postagens mais recentes e olhe comentários de dúvidas de iniciantes querendo saber como funciona e quanto custa.`,
        script: `Olá! Vi que você comentou no post procurando ajuda com ${selectedSegmentId}. Preparei um material bem direto ao ponto que pode te ajudar: https://robo-trafego.vercel.app/?niche=${encodeURIComponent(
          selectedSegmentId
        )}&src=outreach_direct`,
      },
      {
        handle: `@dicas_${selectedSegmentId.toLowerCase().replace(/\s+/g, '')}`,
        name: `Dicas de ${selectedSegmentId}`,
        url: `https://www.instagram.com/explore/tags/${encodeURIComponent(selectedSegmentId.toLowerCase().replace(/\s+/g, ''))}/`,
        audience: '+ 180k seguidores',
        focus: `Conteúdo prático e dúvidas diárias sobre ${selectedSegmentId}`,
        whatToLook: `Pessoas pedindo recomendação de materiais, cursos e produtos prontos para usar.`,
        script: `Oi! Vi sua dúvida sobre ${selectedSegmentId}... se ainda precisar de um passo a passo prático, deixei nessa página aqui: https://robo-trafego.vercel.app/?niche=${encodeURIComponent(
          selectedSegmentId
        )}&src=outreach_direct`,
      },
    ],
  };

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // Normalize
    const normalized = query.toLowerCase();
    // Check if matches a catalog niche key
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
    currentNicheData.profiles[selectedProfileIndex] || currentNicheData.profiles[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-800/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>SISTEMA ABERTO DE MINERAÇÃO DE PÚBLICOS</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Onde Achar Pessoas Reais em Qualquer Segmento
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Esta tela é <strong>100% aberta</strong>. Você pode selecionar uma de suas campanhas cadastradas, escolher um dos nichos mais lucrativos do Brasil ou <strong>digitar qualquer segmento que você queira explorar</strong> para o robô mapear os perfis, dúvidas e scripts!
          </p>

          {/* OPEN SEARCH BAR */}
          <form onSubmit={handleCustomSearch} className="pt-3 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Digite qualquer segmento (ex: Confeitaria, Pets, Finanças, Concursos, Artesanato, Emagrecimento...)"
                className="w-full bg-slate-950/90 border border-emerald-700/50 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-500/25 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Buscar Pessoas & Onde Compram</span>
            </button>
          </form>
        </div>
      </div>

      {/* QUICK SELECTION BAR */}
      <div className="space-y-3 bg-slate-900 border border-slate-800 rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Navegar por Segmentos Rápidos & Campanhas Ativas:</span>
          </span>
          <span className="text-[11px] text-slate-500">Clique para alternar o radar</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Quick Pre-set Niches */}
          {[
            { id: 'pedagogia', label: '📚 Pedagogia & Autismo (R$ 9,90)', isFeatured: true },
            { id: 'milhas', label: '✈️ Milhas & Viagens (R$ 385)', isFeatured: true },
            { id: 'emagrecimento', label: '🥗 Emagrecimento & Fitness' },
            { id: 'ingles', label: '🇬🇧 Inglês & Carreiras' },
            { id: 'confeitaria', label: '🍰 Confeitaria & Doces' },
            { id: 'pets', label: '🐾 Pets & Adestramento' },
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

          {/* User's custom added campaigns */}
          {campaigns
            .filter((c) => c.id !== 'camp-tarefinhas-autismo' && c.id !== 'camp-milhas-3')
            .map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedSegmentId(c.niche || c.title);
                  setSelectedProfileIndex(0);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                  selectedSegmentId === (c.niche || c.title)
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                    : 'bg-slate-850 text-indigo-300 border-indigo-900/60 hover:bg-indigo-950/40'
                }`}
              >
                <span>📦 {c.title.slice(0, 22)}...</span>
              </button>
            ))}
        </div>
      </div>

      {/* SEGMENT HIGHLIGHT & REPLYRUSH INTEGRATION */}
      <div className="bg-slate-900 border border-indigo-900/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 text-xs font-semibold border border-indigo-800/60">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>REPLYRUSH (AUTO DM) • SEGMENTO: {currentNicheData.label.toUpperCase()}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Mensagem Automática para o ReplyRush ({currentNicheData.label})
            </h2>
            <p className="text-xs text-slate-400">
              Copie o texto abaixo e cole no campo de resposta automática no seu ReplyRush:
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
              <span className="text-xs font-bold text-slate-300">Palavra-Chave no Post:</span>
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

      {/* SECTION 2: PERFIS ONDE ESTÃO OS COMPRADORES DESTE SEGMENTO */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-semibold border border-emerald-800/60">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>RADAR DE MINERAÇÃO NO INSTAGRAM: {currentNicheData.label.toUpperCase()}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Perfis Líderes Onde Estão Pessoas com Dúvidas Reais
          </h2>
          <p className="text-xs text-slate-400">
            Abra os perfis abaixo, olhe os comentários dos últimos posts e encontre compradores tirando dúvidas:
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profiles List */}
          <div className="space-y-3">
            {currentNicheData.profiles.map((p, idx) => (
              <button
                key={p.handle}
                onClick={() => setSelectedProfileIndex(idx)}
                className={`w-full text-left p-4 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                  selectedProfileIndex === idx
                    ? 'bg-emerald-950/60 border-emerald-600/70 text-white shadow-lg'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div>
                  <div className="font-bold text-sm flex items-center gap-1.5">
                    <Instagram className="w-4 h-4 text-pink-400" />
                    <span>{p.name}</span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">{p.handle}</div>
                </div>

                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800/50">
                  {p.audience}
                </span>
              </button>
            ))}
          </div>

          {/* Selected Profile Detailed Prospecting Guide */}
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{currentProfile.name}</span>
                  <span className="text-xs text-slate-400 font-normal">({currentProfile.handle})</span>
                </h3>
                <p className="text-xs text-emerald-400 mt-0.5">
                  Público: {currentProfile.focus}
                </p>
              </div>

              <a
                href={currentProfile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition"
              >
                <Instagram className="w-4 h-4" />
                <span>Abrir no Instagram</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
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
                    💬 Script de Abordagem Amigável (Anti-Bloqueio / Sem Venda Agressiva):
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

      {/* SECTION 3: TERMOS DE BUSCA NO PINTEREST & TIKTOK DESTE SEGMENTO */}
      <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950 border border-red-900/50 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
          <Pin className="w-4 h-4" />
          <span>MINERAÇÃO PASSIVA: TERMOS QUE O PÚBLICO PESQUISA NO PINTEREST & TIKTOK</span>
        </div>
        <h3 className="text-xl font-bold text-white">
          O Que as Pessoas Desse Segmento Pesquisam Todos os Dias
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Use esses termos exatos como títulos dos seus Pins no Pinterest e nas legendas do TikTok. É assim que os visitantes encontram o seu produto de graça:
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
