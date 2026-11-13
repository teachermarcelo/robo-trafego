import { Campaign } from '../types';
import { getShortFunnelSlug, getShortFunnelUrl } from '../utils/campaignSlug';

export interface ProductBenefitItem {
  title: string;
  description: string;
}

export interface FacebookGroupPostTemplate {
  id: string;
  label: string;
  headline: string;
  copy: string;
}

export interface ProductManyChatOverride {
  welcomeText?: string;
  benefits?: ProductBenefitItem[];
  pricePitch?: string;
  guaranteeText?: string;
}

export interface ProductManyChatPackage {
  campaignId: string;
  shortSlug: string;
  shortUrl: string;
  checkoutUrl: string;
  whatsappNumber: string;
  priceFormatted: string;
  oldPriceFormatted: string;
  guaranteeDays: number;
  welcomeText: string;
  benefits: ProductBenefitItem[];
  howItWorksText: string;
  priceAndCheckoutText: string;
  safetyAndGuaranteeText: string;
  whatsappPrefillText: string;
  facebookGroupPosts: FacebookGroupPostTemplate[];
}

const OVERRIDES_STORAGE_KEY = 'autoviral_product_manychat_overrides_v1';

export function loadManyChatOverrides(): Record<string, ProductManyChatOverride> {
  try {
    const raw = localStorage.getItem(OVERRIDES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {}
  return {};
}

export function saveManyChatOverride(campaignId: string, override: ProductManyChatOverride): void {
  try {
    const current = loadManyChatOverrides();
    current[campaignId] = override;
    localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(current));
  } catch {}
}

function detectBenefitsByProduct(camp: Campaign): ProductBenefitItem[] {
  const titleLower = (camp.title || '').toLowerCase();
  const nicheLower = (camp.niche || '').toLowerCase();
  const painLower = (camp.painPointTargeted || '').toLowerCase();

  // Custom features configured by user on campaign take priority if meaningful (4+ chars)
  const validCustomFeatures = Array.isArray(camp.features)
    ? camp.features.filter((f) => typeof f === 'string' && f.trim().length > 6)
    : [];

  // 1. Psicopedagogia / Autismo / Atividades Cognitivas / Pedagogia
  if (
    nicheLower.includes('psico') ||
    titleLower.includes('atividade') ||
    titleLower.includes('cognitiv') ||
    titleLower.includes('psicopedag') ||
    titleLower.includes('tarefinha') ||
    titleLower.includes('autis') ||
    titleLower.includes('alfabetiz')
  ) {
    return [
      {
        title: 'PDF Pronto Para Imprimir Hoje Mesmo',
        description:
          'Chega no seu e-mail e WhatsApp na hora. É só baixar no celular ou computador e imprimir quantas vezes precisar, sem gastar horas criando material do zero.',
      },
      {
        title: 'Prende a Atenção Sem Virar Briga',
        description:
          'Atividades lúdicas e visuais pensadas para crianças com TDAH, Autismo (TEA) ou dificuldade de foco evoluírem brincando.',
      },
      {
        title: 'Uso em Casa, Escola ou Consultório',
        description:
          'Funciona perfeitamente tanto para mães reforçarem em casa quanto para professoras e psicopedagogas aplicarem com alunos e pacientes.',
      },
      {
        title: 'Acesso Vitalício Sem Mensalidade',
        description:
          'Você paga uma única vez o valor promocional de hoje e fica com todo o acervo salvo para sempre.',
      },
    ];
  }

  // 2. Ecom Club / Loja Pronta / E-commerce / Dropshipping
  if (
    titleLower.includes('ecom') ||
    titleLower.includes('loja') ||
    painLower.includes('fornecedor') ||
    painLower.includes('estoque')
  ) {
    return [
      {
        title: 'Loja Profissional Já Estruturada',
        description:
          'Você não precisa saber programação nem contratar designer caro — recebe o modelo pronto com catálogo de produtos validados.',
      },
      {
        title: 'Venda Sem Precisar Comprar Estoque',
        description:
          'Trabalhe com fornecedores confiáveis que enviam direto para o seu cliente, começando com investimento mínimo.',
      },
      {
        title: 'Passo a Passo Simples Para Primeiras Vendas',
        description:
          'Aulas diretas mostrando como divulgar no orgânico ou anúncios e receber no Pix todos os dias.',
      },
      {
        title: 'Suporte + Garantia Total',
        description:
          'Acesso imediato após o pagamento e garantia incondicional para testar tudo sem risco.',
      },
    ];
  }

  // 3. Milhas Lucrativas / Renda Extra
  if (titleLower.includes('milha')) {
    return [
      {
        title: 'Transforme Gastos Comuns em Dinheiro',
        description:
          'Aprenda a acumular pontos nas compras do dia a dia (mercado, combustível, contas) sem gastar nada a mais por isso.',
      },
      {
        title: 'Viaje Pagando Muito Menos ou Lucre',
        description:
          'Descubra como emitir passagens com até 70% de economia ou vender milhas com segurança para gerar renda extra mensal.',
      },
      {
        title: 'Método Para Iniciantes do Zero',
        description:
          'Mesmo que você nunca tenha mexido com cartões ou programas de pontos, o passo a passo mostra cada clique.',
      },
      {
        title: 'Acompanhamento e Alertas de Oportunidade',
        description:
          'Fique por dentro das promoções bonificadas que multiplicam seus pontos em poucas semanas.',
      },
    ];
  }

  // 4. Inglês / Idiomas
  if (nicheLower.includes('ingl') || titleLower.includes('ingl')) {
    return [
      {
        title: 'Destrave a Fala Sem Decoreba Chata',
        description:
          'Foco em situações reais de conversa, viagens e trabalho sem ficar anos preso apenas em regras de gramática.',
      },
      {
        title: 'Estude 15 Minutos Pelo Celular',
        description:
          'Aulas objetivas que cabem na sua rotina mesmo com trabalho e família.',
      },
      {
        title: 'Treino Prático de Escuta e Pronúncia',
        description:
          'Perca a vergonha de errar e ganhe confiança para entender nativos e responder com naturalidade.',
      },
      {
        title: 'Acesso Imediato Com Garantia',
        description:
          'Receba o acesso completo na mesma hora no e-mail com risco zero.',
      },
    ];
  }

  // 5. Fallback Inteligente Universal para QUALQUER outro produto cadastrado
  if (validCustomFeatures.length >= 2) {
    return validCustomFeatures.slice(0, 4).map((feat, idx) => ({
      title: idx === 0 ? 'Benefício Principal Incluso' : `Vantagem ${idx + 1}`,
      description: feat.trim(),
    }));
  }

  return [
    {
      title: 'Resolve o Problema na Prática',
      description:
        camp.painPointTargeted ||
        'Material direto ao ponto para você aplicar hoje mesmo sem perder tempo procurando conteúdo solto.',
    },
    {
      title: 'Entrega Imediata no E-mail e WhatsApp',
      description:
        'Assim que o Pix ou cartão confirma, o acesso oficial chega automaticamente para usar no celular ou computador.',
    },
    {
      title: 'Feito Para Quem Quer Resultado Rápido',
      description: `Pensado sob medida para ${camp.targetAudience || 'quem busca praticidade e economia de tempo'}.`,
    },
    {
      title: `Garantia Incondicional de ${camp.guaranteeDays || 7} Dias`,
      description:
        'Você acessa, testa na prática e conta com garantia total prevista em lei caso não goste.',
    },
  ];
}

export function buildProductManyChatPackage(
  camp: Campaign,
  origin?: string,
  override?: ProductManyChatOverride
): ProductManyChatPackage {
  const shortSlug = getShortFunnelSlug(camp);
  const shortUrl = getShortFunnelUrl(camp, origin);
  const checkoutUrl = camp.checkoutUrl || 'https://pay.kiwify.com.br/HE5xbnp';
  const whatsappNumber = (camp.whatsappNumber || '5541998778348').replace(/\D/g, '') || '5541998778348';

  const priceNum = Number(camp.price || 9.9);
  const oldPriceNum = Number(camp.oldPrice || priceNum * 2.5);
  const priceFormatted = priceNum.toFixed(2).replace('.', ',');
  const oldPriceFormatted = oldPriceNum.toFixed(2).replace('.', ',');
  const guaranteeDays = camp.guaranteeDays || 7;

  const benefits =
    override?.benefits && override.benefits.length > 0
      ? override.benefits
      : detectBenefitsByProduct(camp);

  const welcomeText =
    override?.welcomeText?.trim() ||
    `Oi! Que bom te ver por aqui 😊 Você clicou para conhecer o *${camp.title}*.\n\nToque em uma das opções abaixo para ver os benefícios práticos, tirar dúvidas ou garantir o acesso com valor promocional de *R$ ${priceFormatted}*:`;

  const howItWorksText =
    `Funciona assim:\n\n` +
    `1️⃣ O acesso é *100% imediato* — assim que o pagamento no Pix ou cartão confirma, chega na hora no seu e-mail.\n` +
    `2️⃣ Você pode abrir no *celular, tablet ou computador* (e baixar/imprimir quando quiser).\n` +
    `3️⃣ Hoje o valor está por apenas *R$ ${priceFormatted}* (em vez de R$ ${oldPriceFormatted}) com garantia de ${guaranteeDays} dias.`;

  const priceAndCheckoutText =
    override?.pricePitch?.trim() ||
    `🔥 *Condição Especial Liberada Hoje:*\n` +
      `De ~R$ ${oldPriceFormatted}~ por apenas *R$ ${priceFormatted}* (pagamento único, sem mensalidade!).\n\n` +
      `Você recebe acesso vitalício + garantia incondicional de ${guaranteeDays} dias. É só tocar no botão verde abaixo para finalizar com segurança via Pix ou Cartão:`;

  const safetyAndGuaranteeText =
    override?.guaranteeText?.trim() ||
    `Pode ficar tranquilo(a)! O pagamento é processado em plataforma oficial criptografada com *garantia total de ${guaranteeDays} dias*.\n\n` +
      `Além disso, se tiver qualquer dúvida antes ou depois de comprar, você fala comigo direto aqui no WhatsApp (+${whatsappNumber}).`;

  const whatsappPrefillText = `Olá! Vi os benefícios do *${camp.title}* (R$ ${priceFormatted}) e quero tirar uma dúvida rápida.`;

  const isEdu =
    (camp.niche || '').includes('psico') ||
    (camp.title || '').toLowerCase().includes('atividade') ||
    (camp.title || '').toLowerCase().includes('tarefinha') ||
    (camp.title || '').toLowerCase().includes('psicoped');

  const facebookGroupPosts: FacebookGroupPostTemplate[] = isEdu
    ? [
        {
          id: 'fb-zap-1',
          label: '1. Indicação Natural + Atendimento Automático',
          headline: `📚 Pessoal, quem precisa de material pronto de ${camp.title} para imprimir hoje?`,
          copy: `Passei por aqui para compartilhar um kit completo que economiza horas de preparo em casa ou na sala de aula.\n\n✅ Já vem pronto em PDF para imprimir\n✅ Atividades lúdicas que realmente prendem a atenção\n✅ Acesso vitalício por valor simbólico de R$ ${priceFormatted}\n\nColoquei uma prévia com todos os benefícios e atendimento direto no WhatsApp neste link curto 👇\n${shortUrl}`,
        },
        {
          id: 'fb-zap-2',
          label: '2. Foco em Dor & Praticidade (Zero Spam)',
          headline: `💡 Pare de perder tempo caçando atividades soltas na internet`,
          copy: `Para quem está buscando ajudar a criança a ter mais concentração e evolução sem estresse:\n\nSeparei o *${camp.title}* organizado passo a passo e pronto para usar ainda hoje.\n\nClique no link abaixo para ver o que vem dentro e tirar qualquer dúvida comigo no WhatsApp 👇\n${shortUrl}`,
        },
        {
          id: 'fb-zap-3',
          label: '3. Chamada Direta Curta (Alta Taxa de Clique)',
          headline: `✨ Liberado hoje por R$ ${priceFormatted}: ${camp.title}`,
          copy: `Material completo pronto para baixar no celular e imprimir quando precisar (com garantia de ${guaranteeDays} dias).\n\nVeja os benefícios e peça o acesso direto por aqui 👇\n${shortUrl}`,
        },
      ]
    : [
        {
          id: 'fb-zap-1',
          label: '1. Benefícios Práticos + Link Curto',
          headline: `🚀 Pessoal, veja como funciona o ${camp.title} na prática`,
          copy: `Para quem perguntou como começar de forma simples sem complicação:\n\n✅ ${benefits[0]?.title || 'Método passo a passo validado'}\n✅ ${benefits[1]?.title || 'Pronto para aplicar hoje mesmo'}\n✅ Valor promocional de R$ ${priceFormatted} com garantia de ${guaranteeDays} dias\n\nColoquei todos os benefícios e o botão para falar no WhatsApp neste link curto 👇\n${shortUrl}`,
        },
        {
          id: 'fb-zap-2',
          label: '2. Quebra de Objeção + Atendimento X1',
          headline: `💡 Tem dúvida se o ${camp.title} serve para o seu momento?`,
          copy: `Antes de gastar tempo tentando fazer tudo sozinho(a), dá uma olhada nos benefícios práticos desse material.\n\nSe ficar alguma dúvida, você conversa direto comigo pelo atendimento rápido no link 👇\n${shortUrl}`,
        },
        {
          id: 'fb-zap-3',
          label: '3. Chamada Curta Direta (Grupos)',
          headline: `🔥 Condição especial de hoje (R$ ${priceFormatted}): ${camp.title}`,
          copy: `Acesso liberado na hora no Pix ou cartão com garantia de ${guaranteeDays} dias.\n\nToque no link curto para ver os benefícios ou chamar no WhatsApp 👇\n${shortUrl}`,
        },
      ];

  return {
    campaignId: camp.id,
    shortSlug,
    shortUrl,
    checkoutUrl,
    whatsappNumber,
    priceFormatted,
    oldPriceFormatted,
    guaranteeDays,
    welcomeText,
    benefits,
    howItWorksText,
    priceAndCheckoutText,
    safetyAndGuaranteeText,
    whatsappPrefillText,
    facebookGroupPosts,
  };
}
