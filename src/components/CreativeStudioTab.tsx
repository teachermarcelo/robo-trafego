import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Video,
  Layers,
  Image as ImageIcon,
  Copy,
  CheckCircle,
  RefreshCw,
  Flame,
  Zap,
  ExternalLink,
  Smartphone,
  MapPin,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { Campaign, CreativePackage, PainPointData } from '../types';

interface CreativeStudioTabProps {
  initialPain?: PainPointData | null;
  initialNiche?: string;
  campaigns?: Campaign[];
  onAddCampaign?: (newCamp: Campaign) => void;
  onNavigateTab?: (tab: string) => void;
}

const CITY_OPTIONS = [
  'Curitiba - PR',
  'São Paulo - SP',
  'Rio de Janeiro - RJ',
  'Belo Horizonte - MG',
  'Porto Alegre - RS',
  'Salvador - BA',
  'Fortaleza - CE',
  'Brasília - DF',
  'Goiânia - GO',
  'Brasil (Nacional) - BR',
];

export const CreativeStudioTab: React.FC<CreativeStudioTabProps> = ({
  initialPain,
  initialNiche = 'marketing',
  campaigns = [],
  onAddCampaign,
  onNavigateTab,
}) => {
  // If user has registered campaigns, default to the latest one, else fallback to practical niche
  const defaultProduct = campaigns[0]?.title || 'Renda extra para mães solo';
  const defaultPain = initialPain?.pain || campaigns[0]?.painPointTargeted || 'Falta de dinheiro no fim do mês e sem tempo livre cuidando dos filhos';

  const [productTitle, setProductTitle] = useState(defaultProduct);
  const [niche, setNiche] = useState(initialNiche || campaigns[0]?.niche || 'marketing');
  const [painPoint, setPainPoint] = useState(defaultPain);
  const [targetCity, setTargetCity] = useState('Curitiba - PR');
  const [targetPlatform, setTargetPlatform] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [generationSource, setGenerationSource] = useState<string | null>(null);
  const [savedAsCampaign, setSavedAsCampaign] = useState(false);

  useEffect(() => {
    if (initialPain?.pain) {
      setPainPoint(initialPain.pain);
      const cityMatch = initialPain.pain.match(/Cidade foco:\s*([^/)]+)\s*\/\s*([A-Z]{2})/i);
      if (cityMatch) {
        const matchedCity = `${cityMatch[1].trim()} - ${cityMatch[2].trim()}`;
        setTargetCity(matchedCity);
      }
    }
    if (initialNiche) {
      setNiche(initialNiche);
      const matchingCamp = campaigns.find((c) => c.niche === initialNiche);
      if (matchingCamp) {
        setProductTitle(matchingCamp.title);
      }
    }
  }, [initialPain, initialNiche, campaigns]);

  const [creatives, setCreatives] = useState<CreativePackage>(() => {
    const isTarefinhas =
      defaultProduct.toLowerCase().includes('tarefinha') ||
      defaultProduct.toLowerCase().includes('autista') ||
      defaultProduct.toLowerCase().includes('psicopedagog');

    if (isTarefinhas) {
      return {
        platform: 'all',
        videoScript: {
          title: `Roteiro Viral: + 100 Tarefinha Educação Infantil e Autismo`,
          hook: `"Professora ou mãe atípica: você ainda passa horas do seu final de semana na frente do computador procurando ou criando atividades do zero?"`,
          retention: `A verdade é que crianças na Educação Infantil e principalmente no espectro autista precisam de pistas visuais claras e sem poluição sensorial para desenvolverem coordenação motora, foco e linguagem sem crises de frustração.`,
          pitch: `Com o pacote "+ 100 Tarefinhas Educação Infantil e Autismo", você tem um material lúdico e estruturado em PDF de alta resolução, pronto para imprimir quantas vezes quiser para seus alunos ou filhos.`,
          cta: `Comente "EU QUERO" aqui embaixo que o robô te manda o material completo no direct com desconto especial de R$ 37,00!`,
        },
        pinterestPin: {
          headline: `+ 100 Tarefinhas em PDF para Imprimir: Educação Infantil e Autismo (TEA)`,
          overlayText: `Coordenação Motora, Foco e Alfabetização • Arquivo em PDF para Imprimir`,
          callToAction: `Salvar Este Pin & Baixar Atividades Agora`,
        },
        instagramCarousel: [
          { slide: 1, text: `3 erros graves ao planejar atividades para Educação Infantil e crianças com autismo (TEA)` },
          { slide: 2, text: `Erro 1: Folhas poluídas com desenhos desnecessários que causam sobrecarga sensorial e desatenção.` },
          { slide: 3, text: `Erro 2: Cobrar escrita antes de trabalhar o fortalecimento da coordenação motora fina e grafomotricidade.` },
          { slide: 4, text: `A solução: Caderno com + 100 atividades estruturadas e progressivas prontas para imprimir.` },
          { slide: 5, text: `Quer receber as 100 tarefinhas? Toque no link da bio ou comente EU QUERO!` },
        ],
        hashtags: ['#educacaoinfantil', '#pedagogia', '#psicopedagogia', '#atividadesautismo', '#autismobrasil', '#atividadesparaimprimir', '#professora'],
        imagePrompt: `Cute high resolution illustration of smiling diverse Brazilian children with glasses and school supplies, cartoon 3d style for kids educational workbook cover.`,
      };
    }

    const isMiles = defaultProduct.toLowerCase().includes('milha');
    if (isMiles) {
      return {
        platform: 'all',
        videoScript: {
          title: `Roteiro Viral: ${defaultProduct}`,
          hook: `"Se você paga contas no débito ou boleto e ainda não transforma seus gastos do mês em renda extra com milhas, pare de jogar dinheiro fora!"`,
          retention: `A maioria dos bancos não quer que você descubra isso: qualquer pessoa comum, com os mesmos gastos de supermercado, farmácia e luz, consegue gerar de R$ 400 a R$ 2.500 extras todo mês no Pix aproveitando pontos e milhas bonificadas.`,
          pitch: `Com o "${defaultProduct}", você tem o passo a passo mastigado, do básico ao avançado, com alertas diários das melhores oportunidades para você nunca perder uma promoção lucrativa.`,
          cta: `Clique no link da bio ou me chame no WhatsApp agora para garantir sua vaga na comunidade com valor promocional de entrada!`,
        },
        pinterestPin: {
          headline: `${defaultProduct}: O Segredo para Multiplicar Renda com Gastos do Dia a Dia`,
          overlayText: `Guia em PDF + Acesso aos Alertas de Milhas no Celular`,
          callToAction: `Salvar Este Pin & Acessar Passo a Passo Grátis`,
        },
        instagramCarousel: [
          { slide: 1, text: `Você sabia que está perdendo dinheiro todo mês ao pagar contas sem acumular pontos?` },
          { slide: 2, text: `Erro número 1: Achar que milhas servem só para viajar. Milhas são dinheiro vivo no Pix!` },
          { slide: 3, text: `Como funciona: concentre os gastos da casa na estratégia certa e multiplique seus pontos em 100% de bônus.` },
          { slide: 4, text: `Na ${defaultProduct}, você recebe as estratégias prontas mastigadas todo santo dia.` },
          { slide: 5, text: `Quer destravar essa renda extra? Toque no link da bio e entre na comunidade hoje!` },
        ],
        hashtags: ['#milhas', '#milhasaereas', '#rendaextra', '#rendafamiliar', '#cartaodecredito', '#educacaofinanceira'],
        imagePrompt: `High-quality modern photo of a smiling Brazilian holding a smartphone displaying bank balance with credit card on a wooden table, warm ambient lighting, 8k professional stock photography.`,
      };
    }

    return {
      platform: 'all',
      videoScript: {
        title: 'Roteiro Viral: Renda extra para mães solo',
        hook: `"Se você é mãe solo ou cuida dos seus filhos sozinha e não aguenta mais a angústia de ver o dinheiro sumir antes do fim do mês, assista isso antes de dormir."`,
        retention: `Eu sei exatamente o que é não ter com quem deixar as crianças e mesmo assim precisar colocar comida na mesa e pagar os boletos. Você não precisa sair de casa nem de computador caro: com 30 minutos no seu celular e o foco certo, você consegue virar essa chave.`,
        pitch: `Com o "Renda extra para mães solo", você tem um roteiro blindado, desenhado de mãe para mãe, para gerar renda sem custos de anúncio e com apoio da nossa comunidade.`,
        cta: `Toque no link da minha bio agora ou comente "EU QUERO" nos comentários para garantir seu acesso com valor promocional para famílias!`,
      },
      pinterestPin: {
        headline: 'Renda Extra para Mães Solo: Passo a Passo para Trabalhar em Casa pelo Celular',
        overlayText: 'Guia Prático em PDF + Passo a Passo no WhatsApp',
        callToAction: 'Salvar Este Pin & Acessar Passo a Passo Grátis',
      },
      instagramCarousel: [
        { slide: 1, text: 'Como mães solo estão faturando de casa com 30 minutos por dia no celular (sem vender para parentes)' },
        { slide: 2, text: 'O maior obstáculo não é a falta de dinheiro, é a falta de um método simples que respeite a rotina com os filhos.' },
        { slide: 3, text: 'A virada de chave: trabalhar com produtos digitais que resolvem dores urgentes de outras famílias.' },
        { slide: 4, text: 'Você não precisa aparecer nos vídeos se não quiser: o conteúdo orgânico atrai os clientes naturalmente.' },
        { slide: 5, text: 'Toque no link da bio para receber o guia inicial gratuito e começar hoje mesmo!' },
      ],
      hashtags: ['#maesolo', '#maternidadereal', '#rendaextra', '#rendafamiliar', '#trabalharemcasa', '#rendaonline'],
      imagePrompt: 'Warm, emotional photograph of a Brazilian single mother working happily on her smartphone at a cozy kitchen table while her child plays safely nearby, gentle morning natural light, 8k stock.',
    };
  });

  const getClientFallback = (title: string, pNiche: string, pain: string, cityLabel: string): CreativePackage => {
    const lowerTitle = title.toLowerCase();
    const lowerPain = pain.toLowerCase();
    const cityShort = cityLabel.split(' - ')[0].trim() || 'sua cidade';
    const isPsico = pNiche.includes('psico') || lowerTitle.includes('tarefinha') || lowerTitle.includes('autis') || lowerTitle.includes('psicopedag') || lowerPain.includes('tdah') || lowerPain.includes('tea');
    const isMotherOrSolo = lowerTitle.includes('mãe') || lowerPain.includes('mãe') || lowerTitle.includes('mae') || lowerTitle.includes('solo') || lowerPain.includes('solo') || lowerPain.includes('filh');
    const isMiles = lowerTitle.includes('milha') || lowerTitle.includes('cartão') || lowerTitle.includes('cartao') || lowerPain.includes('milha') || lowerTitle.includes('pontos');
    const isEnglish = lowerTitle.includes('ingl') || lowerPain.includes('ingl');
    const isDiet = lowerTitle.includes('seca') || lowerTitle.includes('emagrec') || lowerPain.includes('peso') || lowerPain.includes('dieta');

    let hook = `"Atenção ${cityShort}: se você quer resolver '${pain || 'falta de renda'}' sem gastar com anúncios, pare 30 segundos!"`;
    let retention = `Muita gente em ${cityShort} sofre calada com essa dor todos os dias tentando soluções complicadas. A verdade é que você resolve isso focando diretamente em: "${pain || 'falta de tempo e dinheiro'}".`;
    let pitch = `É exatamente essa dor que o "${title}" sana na prática: um método direto ao ponto, pronto para aplicar hoje mesmo pelo celular ou imprimir em casa.`;
    let cta = `Toque no link rastreado abaixo (ou no Stories/Direct) e garanta seu acesso com condição especial agora!`;

    if (isPsico) {
      hook = `"Mãe ou professora de ${cityShort}: você ainda perde horas do fim de semana tentando montar atividades para crianças com TEA ou TDAH?"`;
      retention = `Crianças com autismo e TDAH precisam de atividades lúdicas visuais, sem poluição sensorial, para desenvolver foco e coordenação sem crises de frustração na rotina.`;
      pitch = `O "${title}" entrega mais de 100 tarefinhas estruturadas em PDF pronto para imprimir e aplicar em 10 minutos, resolvendo exatamente a dor: ${pain}.`;
      cta = `Toque no link oficial abaixo ou responda "EU QUERO" para receber as atividades imediatas no WhatsApp!`;
    } else if (isMiles) {
      hook = `"Moradores de ${cityShort}: se você paga supermercado e contas no débito sem transformar em Pix com milhas, está perdendo dinheiro todo mês!"`;
      retention = `Qualquer pessoa comum consegue transformar os mesmos gastos da casa em renda extra recorrente acumulando pontos bonificados sem viajar.`;
      pitch = `Com o "${title}", você recebe alertas diários mastigados para sanar a falta de renda e faturar direto no Pix.`;
      cta = `Clique no link abaixo ou chame no WhatsApp para garantir sua vaga com valor promocional!`;
    } else if (isMotherOrSolo) {
      hook = `"Mãe solo em ${cityShort}: sei o peso de querer renda extra sem deixar seus filhos — assista isso em 30 segundos."`;
      retention = `Você não precisa sair de casa nem de computador caro: com 30 minutos no celular atacando a dor "${pain || 'renda extra de casa'}", você constrói seu ganho diário.`;
      pitch = `O "${title}" foi criado exatamente para mães que precisam de resultado prático sem investir em anúncios pagos.`;
      cta = `Toque no link abaixo ou comente "EU QUERO" para receber o passo a passo completo!`;
    } else if (isEnglish) {
      hook = `"Trabalha em ${cityShort} e sente frio na barriga quando precisa falar inglês na reunião? Faça esse teste prático de 3 minutos!"`;
      retention = `Escolas tradicionais prendem você em 5 anos de gramática chata em vez de treinar as frases reais que destravam promoções e vagas remotas.`;
      pitch = `O "${title}" sana essa trava com áudios curtos e imersão direta para você falar com segurança.`;
      cta = `Toque no link abaixo para garantir o valor especial de lançamento agora!`;
    } else if (isDiet) {
      hook = `"Correndo o dia todo em ${cityShort}? Pare de passar fome em dietas impossíveis e veja como desinchar em 21 dias!"`;
      retention = `Não é sobre cortar tudo, é sobre ajustar combinações simples que você já tem na cozinha para destravar seu metabolismo.`;
      pitch = `O "${title}" traz cardápio prático e lista de compras barata para sanar inchaço e falta de energia.`;
      cta = `Clique no link abaixo e receba o protocolo completo hoje mesmo!`;
    }

    return {
      platform: targetPlatform || 'all',
      videoScript: {
        title: `Roteiro Local (${cityShort}): ${title}`,
        hook,
        retention,
        pitch,
        cta,
      },
      pinterestPin: {
        headline: `${title} (${cityShort}): Solução Prática para "${pain || 'sua dor urgente'}"`,
        overlayText: `Material Prático + Acesso Imediato no Celular`,
        callToAction: `Toque para Acessar e Resolver Hoje`,
      },
      instagramCarousel: [
        { slide: 1, text: `Atenção ${cityShort}: por que tanta gente sofre com "${pain || 'esse problema'}"?` },
        { slide: 2, text: `Erro nº 1: Tentar improvisar sozinho sem um método testado que poupe seu tempo e dinheiro.` },
        { slide: 3, text: `Quando você ataca a causa raiz dessa dor, o alívio e os primeiros resultados aparecem já na primeira semana.` },
        { slide: 4, text: `Com o "${title}", você aplica a solução passo a passo em poucos minutos direto pelo celular ou PDF.` },
        { slide: 5, text: `Toque no link do Stories ou da Bio (ou chame no Direct) e garanta acesso imediato hoje!` },
      ],
      hashtags: [
        `#${cityShort.toLowerCase().replace(/[^a-z0-9]/g, '') || 'brasil'}`,
        `#${title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15) || 'solucao'}`,
        isPsico ? '#psicopedagogia' : '#rendaextra',
        isPsico ? '#autismobrasil' : '#rendafamiliar',
        isMiles ? '#milhas' : isMotherOrSolo ? '#maesolo' : '#empreendedorismo',
        '#ofertabrasil',
      ].filter(Boolean),
      imagePrompt: `Warm realistic lifestyle scene in ${cityShort}, Brazil representing solution for ${title}, clear positive emotion, high contrast, 8k photography.`,
    };
  };

  const buildCreativeTrackedUrl = (src: 'facebook_groups' | 'instagram_story') => {
    const matchedCamp =
      campaigns.find((c) => c.title.toLowerCase() === productTitle.toLowerCase()) || campaigns[0];
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const dest =
      matchedCamp?.checkoutUrl ||
      (matchedCamp ? `${origin}/?lead=1&camp=${encodeURIComponent(matchedCamp.id)}` : `${origin}/?lead=1`);
    const [cityPart, statePart] = targetCity.split(' - ');
    return `${origin}/api/r?to=${encodeURIComponent(dest)}&src=${src}&city=${encodeURIComponent((cityPart || 'Curitiba').trim())}&state=${encodeURIComponent((statePart || 'PR').trim())}&camp=${encodeURIComponent(matchedCamp?.id || 'camp-ativa')}&title=${encodeURIComponent(productTitle)}&niche=${encodeURIComponent(niche)}&pain=${encodeURIComponent(painPoint.slice(0, 90))}`;
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setSuccessBanner(null);
    try {
      const response = await fetch('/api/gemini/generate-creatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche,
          productTitle,
          painPoint: `${painPoint} — Cidade foco: ${targetCity}`,
          targetPlatform,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.data) {
          setCreatives(json.data);
          setGenerationSource(json.source || 'gemini_ai');
          setSuccessBanner(`${productTitle} • ${targetCity}`);
          return;
        }
      }
      // If server returned an issue, use immediate client-side smart fallback
      const fallback = getClientFallback(productTitle, niche, painPoint, targetCity);
      setCreatives(fallback);
      setGenerationSource('smart_local_engine');
      setSuccessBanner(`${productTitle} • ${targetCity}`);
    } catch (err) {
      console.warn('Network or server error, using client fallback:', err);
      const fallback = getClientFallback(productTitle, niche, painPoint, targetCity);
      setCreatives(fallback);
      setGenerationSource('smart_local_engine');
      setSuccessBanner(`${productTitle} • ${targetCity}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/40 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Estúdio de Criativos Virais Orgânicos</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Gerador de Roteiros, Vídeos e Imagens de Alta Conversão
            </h2>
            <p className="text-xs text-slate-400">
              A IA cria conteúdos estratégicos que prendem o público nos primeiros 3 segundos e direcionam para o seu link ou WhatsApp.
            </p>
          </div>
        </div>

        {/* Banner para o Criador de Layouts & Stories com Sticker de Link */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-rose-950/40 via-purple-950/40 to-slate-900 p-3.5 rounded-xl border border-rose-500/30">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📸</span>
            <div>
              <span className="text-xs font-black text-rose-300 block">
                NOVO: Estúdio de Layouts &amp; Stories com Link Clicável
              </span>
              <span className="text-[11px] text-slate-300 block">
                Crie layouts em 9:16 com a figurinha oficial do Instagram e envie direto para o robô automático!
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('chrome_fb_groups')}
            className="px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-bold text-xs rounded-lg transition cursor-pointer shadow flex-shrink-0"
          >
            Abrir Estúdio Visual &amp; Stories →
          </button>
        </div>

        {/* Quick Campaign & Product Selector */}
        {campaigns.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">Carregar de produto cadastrado:</span>
            {campaigns.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setProductTitle(c.title);
                  setNiche(c.niche || 'marketing');
                  setPainPoint(c.painPointTargeted || `Dificuldade em gerar renda com ${c.title}`);
                  setSuccessBanner(null);
                }}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                  productTitle === c.title
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {c.title}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setProductTitle('Renda extra para mães solo');
                setNiche('marketing');
                setPainPoint('Mãe solo precisando de renda de casa sem deixar os filhos');
                setSuccessBanner(null);
              }}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                productTitle === 'Renda extra para mães solo'
                  ? 'bg-indigo-950 text-indigo-300 border-indigo-600'
                  : 'bg-indigo-950/40 text-indigo-300 border-indigo-800/50 hover:bg-indigo-900/60'
              }`}
            >
              + Renda Mães Solo
            </button>
          </div>
        )}

        {/* Form Inputs */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-3">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Nome do Produto ou Oferta
            </label>
            <input
              type="text"
              value={productTitle}
              onChange={(e) => setProductTitle(e.target.value)}
              placeholder="Ex: Curso de Inglês para Viagem..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Nicho
            </label>
            <select
              value={niche}
              onChange={(e) => setNiche(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="psicopedagogia">Psicopedagogia &amp; TDAH</option>
              <option value="ingles">Inglês &amp; Idiomas</option>
              <option value="emagrecedor">Emagrecimento &amp; Detox</option>
              <option value="renda_extra">Renda Extra Familiar</option>
              <option value="artesanato">Artesanato &amp; Confeitaria</option>
              <option value="marketing">Marketing &amp; Afiliados</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              Cidade Foco (Para o Anúncio &amp; Radar)
            </label>
            <select
              value={CITY_OPTIONS.includes(targetCity) ? targetCity : 'custom'}
              onChange={(e) => {
                if (e.target.value !== 'custom') setTargetCity(e.target.value);
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {CITY_OPTIONS.map((city) => (
                <option key={city} value={city}>
                  📍 {city}
                </option>
              ))}
              {!CITY_OPTIONS.includes(targetCity) && (
                <option value="custom">📍 {targetCity}</option>
              )}
            </select>
          </div>

          <div className="md:col-span-4">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Dor Real que o Criativo Vai Sanar
            </label>
            <input
              type="text"
              value={painPoint}
              onChange={(e) => setPainPoint(e.target.value)}
              placeholder="Ex: Cansaço criando tarefas para TEA, contas atrasadas..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Real Tracked Links Card for Guaranteed Real Clicks */}
        <div className="mt-4 p-4 rounded-xl bg-emerald-950/25 border border-emerald-700/50 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black text-emerald-300">
                Links Rastreados Reais (/api/r) — Garanta Cliques no Facebook &amp; Instagram
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Cole estes links nos seus posts de Grupos do Facebook ou no Sticker de Link do Instagram Stories. Cada clique de uma pessoa real registra na hora no <strong>Radar de Pessoas</strong> com a cidade <strong>{targetCity}</strong> e a dor atacada!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                copyToClipboard(
                  `${creatives.videoScript.hook}\n\n${creatives.videoScript.retention}\n\n${creatives.videoScript.pitch}\n\n👉 Acesse aqui: ${buildCreativeTrackedUrl('facebook_groups')}`,
                  'copy_fb_real'
                )
              }
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              {copiedKey === 'copy_fb_real' ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Roteiro + Link FB Copiados!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Roteiro + Link Real FB</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => copyToClipboard(buildCreativeTrackedUrl('instagram_story'), 'copy_ig_real')}
              className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              {copiedKey === 'copy_ig_real' ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Link Insta Copiado!</span>
                </>
              ) : (
                <>
                  <Target className="w-3.5 h-3.5" />
                  <span>Copiar Link Real Instagram</span>
                </>
              )}
            </button>

            <a
              href={buildCreativeTrackedUrl('facebook_groups')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Testar Clique Real</span>
            </a>

            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('tracking')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                Ver Cliques no Radar →
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Formato Principal:</span>
            {['all', 'tiktok', 'pinterest', 'instagram'].map((plat) => (
              <button
                key={plat}
                onClick={() => setTargetPlatform(plat)}
                className={`text-xs px-2.5 py-1 rounded-lg capitalize font-medium transition ${
                  targetPlatform === plat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {plat === 'all' ? 'Todos os Canais' : plat}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 transition transform active:scale-95"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Gerando Criativos Poderosos...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Gerar Criativos de Alta Conversão</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Criativos gerados e atualizados para:</strong> "{successBanner}"
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onAddCampaign && !campaigns.some((c) => c.title.toLowerCase() === productTitle.toLowerCase()) && (
              <button
                type="button"
                onClick={() => {
                  onAddCampaign({
                    id: `camp-${Date.now()}`,
                    title: productTitle,
                    niche: (niche as any) || 'marketing',
                    nicheLabel: niche === 'marketing' ? 'Marketing & Afiliados' : 'Renda Familiar',
                    targetAudience: 'Pessoas buscando solução e renda extra',
                    painPointTargeted: painPoint,
                    price: 97.00,
                    status: 'active',
                    createdAt: new Date().toISOString(),
                    antiBanOrganicMode: true,
                    platforms: ['tiktok', 'pinterest', 'instagram', 'whatsapp'],
                    impressions: 60,
                    clicks: 5,
                    conversions: 0,
                    revenue: 0,
                  });
                  setSavedAsCampaign(true);
                  setTimeout(() => setSavedAsCampaign(false), 3000);
                }}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1 shadow"
              >
                {savedAsCampaign ? '✓ Campanha Adicionada!' : '+ Salvar em Minhas Campanhas'}
              </button>
            )}
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-700/50 font-semibold">
              {generationSource === 'gemini_ai' ? '🤖 Gerado com Gemini 3.8 Flash' : '⚡ Motor de Alta Conversão Anti-Bloqueio'}
            </span>
          </div>
        </div>
      )}

      {/* Generated Creative Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: TikTok / Reels Viral Script */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-950 text-rose-400 border border-rose-800/40">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Roteiro para TikTok & Reels</h3>
                <span className="text-[11px] text-slate-400">Algoritmo Orgânico Anti-Bloqueio</span>
              </div>
            </div>

            <button
              onClick={() =>
                copyToClipboard(
                  `GANCHO: ${creatives.videoScript.hook}\nRETENÇÃO: ${creatives.videoScript.retention}\nSOLUÇÃO: ${creatives.videoScript.pitch}\nCHAMADA: ${creatives.videoScript.cta}`,
                  'video_script'
                )
              }
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 transition"
            >
              {copiedKey === 'video_script' ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Copiado!
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Copy className="w-3.5 h-3.5" /> Copiar Roteiro
                </span>
              )}
            </button>
          </div>

          <div className="space-y-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3" /> 00:00 - 00:03 (Gancho que Impede Rolar o Feed)
              </span>
              <p className="text-xs text-white font-semibold">"{creatives.videoScript.hook}"</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3 h-3" /> 00:03 - 00:15 (Quebra de Padrão & Retenção Máxima)
              </span>
              <p className="text-xs text-slate-300">{creatives.videoScript.retention}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                00:15 - 00:35 (Apresentação Natural da Solução)
              </span>
              <p className="text-xs text-slate-300">{creatives.videoScript.pitch}</p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                00:35 - 00:45 (Chamada de Ação com Escassez)
              </span>
              <p className="text-xs text-emerald-200 font-medium">{creatives.videoScript.cta}</p>
            </div>
          </div>

          {/* Hashtags Virais */}
          <div className="pt-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
              Hashtags Otimizadas para Alcance no Brasil:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {creatives.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pinterest Pin & Instagram Carousel */}
        <div className="space-y-6">
          {/* Pinterest Pin Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-950 text-red-400 border border-red-800/40">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Pin Vertical para o Pinterest</h3>
                  <span className="text-[11px] text-slate-400">Tráfego Contínuo Sem Expiração</span>
                </div>
              </div>

              <button
                onClick={() =>
                  copyToClipboard(
                    `TÍTULO: ${creatives.pinterestPin.headline}\nTEXTO SOBRE A IMAGEM: ${creatives.pinterestPin.overlayText}\nCTA: ${creatives.pinterestPin.callToAction}`,
                    'pin_copy'
                  )
                }
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 transition"
              >
                {copiedKey === 'pin_copy' ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Copiado!
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Copy className="w-3.5 h-3.5" /> Copiar Pin
                  </span>
                )}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
              <strong className="text-xs font-bold text-white block">
                {creatives.pinterestPin.headline}
              </strong>
              <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-700 text-xs text-amber-300 font-semibold">
                Texto para colocar sobre a foto: "{creatives.pinterestPin.overlayText}"
              </div>
              <div className="text-[11px] text-slate-400">
                Ação do leitor: <span className="text-emerald-400">{creatives.pinterestPin.callToAction}</span>
              </div>
            </div>
          </div>

          {/* Instagram Carousel Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-950 text-purple-400 border border-purple-800/40">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Carrossel de 5 Telas para Instagram</h3>
                  <span className="text-[11px] text-slate-400">Engajamento e Compartilhamentos</span>
                </div>
              </div>

              <button
                onClick={() =>
                  copyToClipboard(
                    creatives.instagramCarousel.map((c) => `Slide ${c.slide}: ${c.text}`).join('\n\n'),
                    'carousel_copy'
                  )
                }
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 transition"
              >
                {copiedKey === 'carousel_copy' ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Copiado!
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Copy className="w-3.5 h-3.5" /> Copiar Carrossel
                  </span>
                )}
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {creatives.instagramCarousel.map((slide) => (
                <div
                  key={slide.slide}
                  className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 text-xs flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {slide.slide}
                  </span>
                  <span className="text-slate-300">{slide.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Creative Mockup & AI Image Prompt */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-800/40 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              Banner Visual de Anúncio Gerado por IA
            </h3>
            <p className="text-xs text-slate-400">
              Você pode usar essa arte para o feed ou como capa dos seus vídeos do TikTok e Pins do Pinterest
            </p>
          </div>

          <button
            onClick={() => copyToClipboard(creatives.imagePrompt, 'image_prompt')}
            className="text-xs text-indigo-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950 border border-indigo-700/60 transition"
          >
            {copiedKey === 'image_prompt' ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Prompt Copiado!
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Copy className="w-3.5 h-3.5" /> Copiar Prompt da Imagem
              </span>
            )}
          </button>
        </div>

        {/* Visual Mockup Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-52 h-52 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-52 h-52 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-400 text-[11px] font-bold tracking-wide uppercase">
                {niche.toUpperCase()} • RESULTADO GARANTIDO
              </div>
              <h4 className="text-xl font-extrabold text-white leading-tight">
                {productTitle}
              </h4>
              <p className="text-xs text-slate-300 max-w-lg">
                "{creatives.videoScript.hook}"
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between relative z-10 border-t border-slate-800/80">
              <span className="text-xs text-slate-400 font-medium">
                Acesso Imediato no Celular ou WhatsApp
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-lg border border-emerald-800/40">
                100% Pronto para Usar
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">
                Prompt de Arte em Alta Resolução (IA):
              </span>
              <p className="text-xs text-slate-300 font-mono italic leading-relaxed line-clamp-5">
                "{creatives.imagePrompt}"
              </p>
            </div>
            <div className="pt-3">
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" /> Testado contra bloqueios nas redes
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
