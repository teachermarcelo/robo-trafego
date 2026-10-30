import React, { useState } from 'react';
import {
  Sparkles,
  Video,
  Layers,
  Image as ImageIcon,
  Copy,
  CheckCircle,
  RefreshCw,
  Share2,
  Flame,
  Zap,
  Play,
  Volume2,
  ExternalLink,
  Smartphone,
} from 'lucide-react';
import { Campaign, CreativePackage, PainPointData } from '../types';

interface CreativeStudioTabProps {
  initialPain?: PainPointData | null;
  initialNiche?: string;
  campaigns?: Campaign[];
  onAddCampaign?: (newCamp: Campaign) => void;
  onSendToCampaign?: (creative: CreativePackage, productTitle: string) => void;
}

export const CreativeStudioTab: React.FC<CreativeStudioTabProps> = ({
  initialPain,
  initialNiche = 'marketing',
  campaigns = [],
  onAddCampaign,
  onSendToCampaign,
}) => {
  // If user has registered campaigns, default to the latest one, else fallback to practical niche
  const defaultProduct = campaigns[0]?.title || 'Renda extra para mães solo';
  const defaultPain = campaigns[0]?.painPointTargeted || initialPain?.pain || 'Falta de dinheiro no fim do mês e sem tempo livre cuidando dos filhos';

  const [productTitle, setProductTitle] = useState(defaultProduct);
  const [niche, setNiche] = useState(campaigns[0]?.niche || initialNiche || 'marketing');
  const [painPoint, setPainPoint] = useState(defaultPain);
  const [targetPlatform, setTargetPlatform] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [generationSource, setGenerationSource] = useState<string | null>(null);
  const [savedAsCampaign, setSavedAsCampaign] = useState(false);

  const [creatives, setCreatives] = useState<CreativePackage>(() => {
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

  const getClientFallback = (title: string, pNiche: string, pain: string): CreativePackage => {
    const lowerTitle = title.toLowerCase();
    const lowerPain = pain.toLowerCase();
    const isMotherOrSolo = lowerTitle.includes('mãe') || lowerPain.includes('mãe') || lowerTitle.includes('mae') || lowerTitle.includes('solo') || lowerPain.includes('solo') || lowerTitle.includes('filh');
    const isMiles = lowerTitle.includes('milha') || lowerTitle.includes('cartão') || lowerTitle.includes('cartao') || lowerPain.includes('milha') || lowerTitle.includes('pontos');
    const isEnglish = lowerTitle.includes('ingl') || lowerPain.includes('ingl');
    const isDiet = lowerTitle.includes('seca') || lowerTitle.includes('emagrec') || lowerPain.includes('peso') || lowerPain.includes('dieta');

    let hook = `"Se você está cansada de ver o dinheiro sumir antes do dia 15 e quer uma fonte de renda honesta, pare o que está fazendo por 30 segundos!"`;
    let retention = `A maioria das pessoas comete o erro fatal de achar que precisa de fortunas para começar ou arriscar o pouco que tem. Mas a verdade é outra: você só precisa de 20 minutos por dia no seu celular atacando a dor exata de: "${pain || 'falta de tempo e dinheiro'}".`;
    let pitch = `É exatamente por isso que o "${title}" foi criado. Um passo a passo prático, validado para o mercado brasileiro, que qualquer pessoa comum consegue aplicar sem precisar aparecer ou ser especialista.`;
    let cta = `Clique no link da minha bio agora ou me mande mensagem no WhatsApp para liberar seu acesso promocional com valor especial para famílias!`;

    if (isMiles) {
      hook = `"Se você paga contas no débito ou boleto e ainda não transforma seus gastos do mês em renda extra com milhas, pare de jogar dinheiro fora!"`;
      retention = `A maioria dos bancos não quer que você descubra isso: qualquer pessoa comum, com os mesmos gastos de supermercado, farmácia e luz, consegue gerar de R$ 400 a R$ 2.500 extras todo mês no Pix aproveitando pontos e milhas bonificadas.`;
      pitch = `Com o "${title}", você tem o passo a passo mastigado, do básico ao avançado, com alertas diários das melhores oportunidades para você nunca perder uma promoção lucrativa.`;
      cta = `Clique no link da bio ou me chame no WhatsApp agora para garantir sua vaga na comunidade com valor promocional de entrada!`;
    } else if (isMotherOrSolo) {
      hook = `"Se você é mãe solo ou cuida dos seus filhos sozinha e não aguenta mais o aperto no fim do mês, assista isso antes de dormir."`;
      retention = `Eu sei exatamente o que é não ter com quem deixar as crianças e mesmo assim precisar colocar comida na mesa e pagar os boletos. Você não precisa sair de casa nem de computador caro: com 30 minutos no seu celular e o foco certo em "${pain || 'renda extra de casa'}", você consegue virar essa chave.`;
      pitch = `Com o "${title}", você tem um roteiro blindado, desenhado de mãe para mãe, para gerar renda sem custos de anúncio e com apoio da nossa comunidade.`;
      cta = `Toque no link da minha bio agora ou comente "EU QUERO" que eu mesma te mando o passo a passo completo no direct!`;
    } else if (isEnglish) {
      hook = `"Se você trava e sente vergonha de falar inglês em reuniões de trabalho, faça este teste prático de 3 minutos hoje!"`;
      retention = `O método tradicional das escolas faz você perder 5 anos decorando regras gramaticais chatas em vez de focar nas frases que realmente destravam o seu salário.`;
      pitch = `O "${title}" vai direto ao ponto: áudios de imersão rápida para você soar confiável e seguro em qualquer call internacional.`;
      cta = `Garanta o valor especial de lançamento tocando no botão da bio ou chamando no WhatsApp!`;
    } else if (isDiet) {
      hook = `"Pare de passar fome e de fazer dietas malucas que só te deixam frustrada: esse segredo natural vai secar sua barriga em 21 dias."`;
      retention = `Não é sobre parar de comer, é sobre destravar o seu metabolismo com ingredientes simples que você já tem na cozinha.`;
      pitch = `O protocolo "${title}" foi desenvolvido para desinchar o corpo sem remédios caros e sem academias pesadas.`;
      cta = `Clique no link da bio e receba o guia completo com receitas e lista de compras agora mesmo!`;
    }

    return {
      platform: targetPlatform || 'all',
      videoScript: {
        title: `Roteiro Viral: ${title}`,
        hook,
        retention,
        pitch,
        cta,
      },
      pinterestPin: {
        headline: `${title}: O Passo a Passo Definitivo para Resolver "${pain || 'a falta de renda'}"`,
        overlayText: `Guia Prático em PDF + Acesso Imediato no Celular`,
        callToAction: `Salvar Este Pin & Acessar Passo a Passo Grátis`,
      },
      instagramCarousel: [
        { slide: 1, text: `Por que tantas pessoas travam tentando resolver: "${pain || 'falta de renda'}"? (O segredo que ninguém revela)` },
        { slide: 2, text: `Erro número 1: Achar que precisa ter milhares de seguidores ou investir rios de dinheiro em anúncios pagos.` },
        { slide: 3, text: `O algoritmo entrega de graça quando você ataca uma dor real que milhares de pessoas sentem todos os dias.` },
        { slide: 4, text: `Com o "${title}", você tem o método validado para aplicar direto do seu celular em minutos.` },
        { slide: 5, text: `Salve este post e comente "EU QUERO" ou clique no link da bio para garantir sua vaga com 7 dias de garantia!` },
      ],
      hashtags: [
        `#${title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15) || 'rendaextra'}`,
        '#rendaextra',
        '#rendafamiliar',
        isMiles ? '#milhas' : isMotherOrSolo ? '#maesolo' : '#empreendedorismo',
        isMiles ? '#milhasaereas' : isMotherOrSolo ? '#maternidadereal' : '#marketingdigital',
        '#trabalharemcasa',
        '#rendaonline',
      ].filter(Boolean),
      imagePrompt: `Clean, modern, high-contrast lifestyle photograph representing ${title}, emotional storytelling, realistic warm lighting, inspiring composition, 8k professional stock photography.`,
    };
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
          painPoint,
          targetPlatform,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.data) {
          setCreatives(json.data);
          setGenerationSource(json.source || 'gemini_ai');
          setSuccessBanner(productTitle);
          return;
        }
      }
      // If server returned an issue, use immediate client-side smart fallback
      const fallback = getClientFallback(productTitle, niche, painPoint);
      setCreatives(fallback);
      setGenerationSource('smart_local_engine');
      setSuccessBanner(productTitle);
    } catch (err) {
      console.warn('Network or server error, using client fallback:', err);
      const fallback = getClientFallback(productTitle, niche, painPoint);
      setCreatives(fallback);
      setGenerationSource('smart_local_engine');
      setSuccessBanner(productTitle);
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
          <div className="md:col-span-4">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Nome do Produto ou Oferta
            </label>
            <input
              type="text"
              value={productTitle}
              onChange={(e) => setProductTitle(e.target.value)}
              placeholder="Ex: Curso de Inglês para Viagem, Chá Detox Seca 21..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="md:col-span-3">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Nicho
            </label>
            <select
              value={niche}
              onChange={(e) => setNiche(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="psicopedagogia">Psicopedagogia & TDAH</option>
              <option value="ingles">Inglês & Idiomas</option>
              <option value="emagrecedor">Emagrecimento & Detox</option>
              <option value="renda_extra">Renda Extra Familiar</option>
              <option value="artesanato">Artesanato & Confeitaria</option>
              <option value="marketing">Marketing & Afiliados</option>
            </select>
          </div>

          <div className="md:col-span-5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Dor que o Criativo Deve Atacar
            </label>
            <input
              type="text"
              value={painPoint}
              onChange={(e) => setPainPoint(e.target.value)}
              placeholder="Ex: Vergonha de falar em reuniões, cansaço de dietas malucas..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
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
