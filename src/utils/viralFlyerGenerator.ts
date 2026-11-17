export type ViralFlyerThemeId = 'purple_gold' | 'emerald_gold' | 'royal_blue';

export interface ViralFlyerInput {
  productName: string;
  headline?: string;
  subheadline?: string;
  nichePain?: string;
  targetAudience?: string;
  priceText?: string;
  oldPriceText?: string;
  discountBadge?: string;
  language?: 'pt' | 'en' | 'es';
  countryLabel?: string;
  linkDomain?: string;
  benefits?: string[];
  audienceItems?: string[];
  theme?: ViralFlyerThemeId;
  embeddedImageUrl?: string;
  aspect?: 'square' | 'og';
}

interface FlyerPalette {
  bgTop: string;
  bgMid: string;
  bgBot: string;
  glow1: string;
  glow2: string;
  bannerStart: string;
  bannerEnd: string;
  pillBg: string;
  pillText: string;
  accentGold: string;
  accentGoldDark: string;
  cardBg: string;
  cardBorder: string;
  primaryText: string;
  bodyText: string;
  mutedText: string;
  checkColor: string;
  priceBgStart: string;
  priceBgEnd: string;
}

const PALETTES: Record<ViralFlyerThemeId, FlyerPalette> = {
  purple_gold: {
    bgTop: '#fbf8ff',
    bgMid: '#f3e8ff',
    bgBot: '#fdf4ff',
    glow1: 'rgba(168, 85, 247, 0.22)',
    glow2: 'rgba(250, 204, 21, 0.20)',
    bannerStart: '#6b21a8',
    bannerEnd: '#3b0764',
    pillBg: '#581c87',
    pillText: '#ffffff',
    accentGold: '#fbbf24',
    accentGoldDark: '#f59e0b',
    cardBg: 'rgba(255, 255, 255, 0.94)',
    cardBorder: '#e9d5ff',
    primaryText: '#3b0764',
    bodyText: '#334155',
    mutedText: '#64748b',
    checkColor: '#7e22ce',
    priceBgStart: '#6b21a8',
    priceBgEnd: '#3b0764',
  },
  emerald_gold: {
    bgTop: '#f6fef9',
    bgMid: '#ecfdf5',
    bgBot: '#fefce8',
    glow1: 'rgba(16, 185, 129, 0.20)',
    glow2: 'rgba(250, 204, 21, 0.20)',
    bannerStart: '#065f46',
    bannerEnd: '#022c22',
    pillBg: '#047857',
    pillText: '#ffffff',
    accentGold: '#fbbf24',
    accentGoldDark: '#d97706',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    cardBorder: '#a7f3d0',
    primaryText: '#064e3b',
    bodyText: '#1e293b',
    mutedText: '#64748b',
    checkColor: '#059669',
    priceBgStart: '#065f46',
    priceBgEnd: '#022c22',
  },
  royal_blue: {
    bgTop: '#f8fbff',
    bgMid: '#eff6ff',
    bgBot: '#fefce8',
    glow1: 'rgba(59, 130, 246, 0.20)',
    glow2: 'rgba(250, 204, 21, 0.20)',
    bannerStart: '#1e40af',
    bannerEnd: '#172554',
    pillBg: '#1d4ed8',
    pillText: '#ffffff',
    accentGold: '#fbbf24',
    accentGoldDark: '#d97706',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    cardBorder: '#bfdbfe',
    primaryText: '#1e3a8a',
    bodyText: '#1e293b',
    mutedText: '#64748b',
    checkColor: '#2563eb',
    priceBgStart: '#1e40af',
    priceBgEnd: '#172554',
  },
};

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length >= maxLines - 1) {
        break;
      }
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  return lines;
}

function detectLang(input: ViralFlyerInput): 'pt' | 'en' | 'es' {
  if (input.language) return input.language;
  const sample = `${input.productName} ${input.headline || ''} ${input.subheadline || ''} ${input.nichePain || ''}`;
  if (/[ãõçáéíóúâêô]/i.test(sample) || /\b(para|crian[cç]a|atividades|com|sem|kit|pdf|curso|apenas|m[eé]todo)\b/i.test(sample)) {
    return 'pt';
  }
  if (/\b(para|con|sin|oferta|descuento|gu[ií]a|garant[ií]a)\b/i.test(sample)) {
    return 'es';
  }
  return 'en';
}

function buildSmartCopyBlocks(input: ViralFlyerInput, lang: 'pt' | 'en' | 'es') {
  const numMatch = `${input.productName} ${input.headline || ''}`.match(/\+?\s*(\d{2,4})/);
  const bigCount = numMatch ? `+${numMatch[1]}` : '100%';

  if (lang === 'pt') {
    const isDigitalKit = /\b(pdf|kit|atividades|tarefinhas|planilha|ebook|apostila|material|curso|psico|autis|tea|tdah|anamnese|checklist|ficha)\b/i.test(
      `${input.productName} ${input.headline || ''} ${input.subheadline || ''}`
    );
    const defaultStats = isDigitalKit
      ? [
          { num: bigCount, label: 'Itens Prontos' },
          { num: 'PDF A4', label: 'Imprimir Fácil' },
          { num: '100%', label: 'Organizado' },
          { num: 'Vitalício', label: 'Acesso na Hora' },
        ]
      : [
          { num: bigCount, label: 'Qualidade Top' },
          { num: '100%', label: 'Verificado' },
          { num: 'Rápido', label: 'Envio Seguro' },
          { num: 'Garantia', label: 'Compra Segura' },
        ];

    const customBenefits =
      input.benefits && input.benefits.length > 0
        ? input.benefits
        : isDigitalKit
        ? [
            'Material estruturado e pronto para aplicar hoje mesmo',
            'Arquivos organizados em PDF de alta resolução (A4)',
            'Sem sobrecarga visual — foco e clareza imediata',
            'Economiza horas de planejamento e preparação semanal',
            'Checklists e roteiros práticos passo a passo',
            'Download imediato logo após a confirmação',
          ]
        : [
            `Solução prática para: ${(input.nichePain || 'melhorar resultados no dia a dia').slice(0, 44)}`,
            'Alta durabilidade e padrão profissional verificado',
            'Economiza tempo e reduz custos com reposições',
            'Aprovado e recomendado por usuários reais',
            'Condição promocional por tempo limitado',
            'Suporte completo e garantia de satisfação',
          ];

    const customAudience =
      input.audienceItems && input.audienceItems.length > 0
        ? input.audienceItems
        : isDigitalKit
        ? [
            'Profissionais que buscam praticidade e organização',
            'Pais, mães e educadores que querem aplicação rápida',
            'Atendimentos clínicos, escolares e domiciliares',
            'Quem precisa de resultados reais sem perder tempo',
          ]
        : [
            input.targetAudience?.slice(0, 46) || 'Quem busca máxima qualidade e praticidade',
            'Uso diário com mais segurança e eficiência',
            'Quem não quer gastar dinheiro com opções frágeis',
            'Pessoas exigentes que valorizam custo-benefício',
          ];

    return {
      topTag: input.discountBadge || 'OFERTA VERIFICADA · ACESSO IMEDIATO',
      subRibbon: input.countryLabel || 'EDIÇÃO ESPECIAL',
      introText:
        (input.subheadline || input.nichePain || '').trim() ||
        'Conjunto completo com alto padrão de qualidade, praticidade imediata e excelente custo-benefício.',
      stats: defaultStats,
      leftHeader: '★ Principais benefícios',
      rightHeader: '👥 Destinado a...',
      idealHeader: '🎯 Ideal para',
      idealText:
        (input.nichePain || '').trim() ||
        'Quem deseja praticidade, organização e resultado rápido desde o primeiro dia.',
      benefits: customBenefits.slice(0, 7),
      audience: customAudience.slice(0, 5),
      trustPills: isDigitalKit
        ? ['Pronto p/ Imprimir (A4)', 'Arquivos Organizados', 'Acesso Imediato']
        : ['Envio Rápido', 'Qualidade Verificada', 'Garantia Protegida'],
      priceCaption: 'POR APENAS',
      priceValue: (input.priceText || 'OFERTA HOJE').trim(),
    };
  }

  if (lang === 'es') {
    return {
      topTag: input.discountBadge || 'OFERTA VERIFICADA · ACCESO INMEDIATO',
      subRibbon: input.countryLabel || 'EDICIÓN ESPECIAL',
      introText:
        (input.subheadline || input.nichePain || '').trim() ||
        'Solución práctica y comprobada con calidad superior y entrega rápida.',
      stats: [
        { num: bigCount, label: 'Calidad Top' },
        { num: '100%', label: 'Verificado' },
        { num: 'Rápido', label: 'Envío Seguro' },
        { num: '30 Días', label: 'Garantía' },
      ],
      leftHeader: '★ Beneficios clave',
      rightHeader: '👥 Ideal para...',
      idealHeader: '🎯 Solución real',
      idealText:
        (input.nichePain || '').trim() ||
        'Diseñado para ahorrar tiempo, evitar desgaste y lograr mejores resultados.',
      benefits: (
        input.benefits || [
          'Material de grado superior pensado para uso diario',
          'Diseño higiénico, duradero y muy fácil de limpiar',
          'Evita gastos repetitivos en opciones comunes',
          'Aprobado por cientos de compradores verificados',
          'Descuento especial disponible por tiempo limitado',
        ]
      ).slice(0, 6),
      audience: (
        input.audienceItems || [
          input.targetAudience?.slice(0, 44) || 'Quienes buscan calidad superior',
          'Uso diario práctico sin complicaciones',
          'Familias que priorizan durabilidad y seguridad',
        ]
      ).slice(0, 4),
      trustPills: ['Envío Rápido', 'Calidad Top', 'Garantía 30 Días'],
      priceCaption: 'DESDE SOLO',
      priceValue: (input.priceText || 'HASTA 75% OFF').trim(),
    };
  }

  // English default (AU, US, CA, UK, Global)
  return {
    topTag: input.discountBadge || `${(input.countryLabel || 'GLOBAL').toUpperCase()} · SPECIAL OFFER`,
    subRibbon: 'VERIFIED QUALITY · LIMITED DEAL',
    introText:
      (input.subheadline || input.nichePain || '').trim() ||
      'High-durability everyday upgrade engineered to solve frustration fast and last for years.',
    stats: [
      { num: bigCount, label: 'Top Grade' },
      { num: '100%', label: 'Verified' },
      { num: 'Fast', label: 'Dispatch' },
      { num: '30-Day', label: 'Guarantee' },
    ],
    leftHeader: '★ Key Benefits Included',
    rightHeader: '👥 Perfect For...',
    idealHeader: '🎯 Why Switch Now',
    idealText:
      (input.nichePain || '').trim() ||
      'Solves everyday wear, hygiene & hassle with effortless performance from day one.',
    benefits: (
      input.benefits || [
        `Solves: ${(input.nichePain || 'everyday frustration & poor quality').slice(0, 44)}`,
        'Built with clean, long-lasting premium materials',
        'Saves money vs replacing worn-out alternatives',
        'Easy maintenance & effortless daily routine',
        'Fast local shipping + tracked customer support',
        'Backed by a risk-free 30-day guarantee',
      ]
    ).slice(0, 6),
    audience: (
      input.audienceItems || [
        input.targetAudience?.slice(0, 44) || 'Homeowners & families upgrading quality',
        'Anyone tired of cheap, short-lived options',
        'Daily users wanting cleaner, faster results',
        'Smart shoppers locking in special promo pricing',
      ]
    ).slice(0, 4),
    trustPills: ['Fast Shipping', 'Verified Quality', '30-Day Guarantee'],
    priceCaption: 'SPECIAL OFFER',
    priceValue: (input.priceText || 'UP TO 75% OFF').trim(),
  };
}

function drawSparkles(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  const rays = [
    [-12, -16, -24, -32],
    [4, -22, 6, -40],
    [22, -12, 36, -24],
  ];
  for (const [x1, y1, x2, y2] of rays) {
    ctx.beginPath();
    ctx.moveTo(cx + x1, cy + y1);
    ctx.lineTo(cx + x2, cy + y2);
    ctx.stroke();
  }
  ctx.restore();
}

function draw3DMockupCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  subLabel: string,
  palette: FlyerPalette,
  embeddedImg?: HTMLImageElement | null
) {
  ctx.save();

  // Drop shadow behind 3D card
  ctx.shadowColor = 'rgba(59, 7, 100, 0.28)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 14;

  // Back page tilt layer
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(-0.045);
  ctx.fillStyle = '#e2e8f0';
  drawRoundedRect(ctx, -w / 2 + 10, -h / 2 + 8, w, h, 18);
  ctx.fill();
  ctx.restore();

  // Main front cover
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(-0.02);

  const coverGrad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  coverGrad.addColorStop(0, '#ffffff');
  coverGrad.addColorStop(1, '#f3e8ff');
  ctx.fillStyle = coverGrad;
  drawRoundedRect(ctx, -w / 2, -h / 2, w, h, 18);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = palette.cardBorder;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Clip interior
  ctx.save();
  drawRoundedRect(ctx, -w / 2, -h / 2, w, h, 18);
  ctx.clip();

  if (embeddedImg && embeddedImg.width > 10 && embeddedImg.height > 10) {
    // Draw uploaded/product image framed cleanly inside the 3D showcase card
    const pad = 12;
    const innerW = w - pad * 2;
    const innerH = h - 86;
    const imgRatio = embeddedImg.width / embeddedImg.height;
    const boxRatio = innerW / innerH;
    let dw = innerW;
    let dh = innerH;
    let dx = -w / 2 + pad;
    let dy = -h / 2 + pad;
    if (imgRatio > boxRatio) {
      dh = innerW / imgRatio;
      dy += (innerH - dh) / 2;
    } else {
      dw = innerH * imgRatio;
      dx += (innerW - dw) / 2;
    }
    ctx.fillStyle = '#ffffff';
    drawRoundedRect(ctx, -w / 2 + pad, -h / 2 + pad, innerW, innerH, 12);
    ctx.fill();
    ctx.drawImage(embeddedImg, dx, dy, dw, dh);

    // Bottom caption strip inside mockup
    const barGrad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    barGrad.addColorStop(0, palette.bannerStart);
    barGrad.addColorStop(1, palette.bannerEnd);
    ctx.fillStyle = barGrad;
    ctx.fillRect(-w / 2, h / 2 - 66, w, 66);

    ctx.fillStyle = palette.accentGold;
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(subLabel.slice(0, 28).toUpperCase(), 0, h / 2 - 39);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 18px system-ui, -apple-system, sans-serif';
    ctx.fillText(title.slice(0, 26), 0, h / 2 - 15);
  } else {
    // Stylized 3D Kit / Product Cover (matching reference image_eb360ff9)
    // Soft decorative diagonal band
    const topBand = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, -h / 2 + 80);
    topBand.addColorStop(0, palette.bannerStart);
    topBand.addColorStop(1, palette.bannerEnd);
    ctx.fillStyle = topBand;
    ctx.fillRect(-w / 2, -h / 2, w, 54);

    ctx.fillStyle = palette.accentGold;
    ctx.font = '900 16px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(subLabel.slice(0, 24).toUpperCase(), 0, -h / 2 + 34);

    // Title on cover
    ctx.fillStyle = palette.primaryText;
    ctx.font = '900 28px system-ui, -apple-system, sans-serif';
    const coverLines = wrapTextLines(ctx, title, w - 42, 3);
    coverLines.forEach((ln, idx) => {
      ctx.fillText(ln, 0, -h / 2 + 104 + idx * 34);
    });

    // Gold accent badge in center
    drawRoundedRect(ctx, -78, -h / 2 + 206, 156, 34, 17);
    ctx.fillStyle = palette.accentGold;
    ctx.fill();
    ctx.fillStyle = palette.primaryText;
    ctx.font = '900 15px system-ui, -apple-system, sans-serif';
    ctx.fillText('100% COMPLETO', 0, -h / 2 + 228);

    // Illustrative bottom mini icons (checklist + folder + star)
    const iconY = h / 2 - 92;
    drawRoundedRect(ctx, -w / 2 + 26, iconY, 74, 76, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = palette.cardBorder;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = palette.checkColor;
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.fillText('✓✓✓', -w / 2 + 63, iconY + 46);

    drawRoundedRect(ctx, 4, iconY + 12, 82, 62, 12);
    ctx.fillStyle = palette.accentGold;
    ctx.fill();
    ctx.fillStyle = palette.primaryText;
    ctx.font = '900 24px system-ui, sans-serif';
    ctx.fillText('★ PRO', 45, iconY + 52);
  }
  ctx.restore();

  // Spiral binding rings on the left edge (only when showing cover mockup)
  if (!embeddedImg) {
    const ringCount = Math.max(8, Math.floor(h / 28));
    for (let i = 0; i < ringCount; i++) {
      const ry = -h / 2 + 22 + i * ((h - 44) / Math.max(1, ringCount - 1));
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(-w / 2 - 2, ry, 10, Math.PI * 0.4, Math.PI * 1.65);
      ctx.stroke();
    }
  }

  ctx.restore();
  ctx.restore();
}

function drawFlyerCore(
  canvas: HTMLCanvasElement,
  input: ViralFlyerInput,
  embeddedImg: HTMLImageElement | null
): string {
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const W = canvas.width;
  const H = canvas.height;
  const isOg = input.aspect === 'og';
  const themeId: ViralFlyerThemeId = input.theme || 'purple_gold';
  const palette = PALETTES[themeId] || PALETTES.purple_gold;
  const lang = detectLang(input);
  const copy = buildSmartCopyBlocks(input, lang);

  // 1. Soft cream-pastel background + radial glow
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, palette.bgTop);
  bg.addColorStop(0.55, palette.bgMid);
  bg.addColorStop(1, palette.bgBot);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const g1 = ctx.createRadialGradient(W * 0.18, H * 0.25, 20, W * 0.18, H * 0.25, W * 0.45);
  g1.addColorStop(0, palette.glow1);
  g1.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);

  const g2 = ctx.createRadialGradient(W * 0.85, H * 0.82, 20, W * 0.85, H * 0.82, W * 0.45);
  g2.addColorStop(0, palette.glow2);
  g2.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, W, H);

  if (isOg) {
    // =========================================================================
    // 1200x630 OPENGRAPH LINK CARD LAYOUT (Wide horizontal high-converting flyer)
    // =========================================================================
    // Top gold tag + deep banner
    const bannerGrad = ctx.createLinearGradient(44, 34, W - 44, 155);
    bannerGrad.addColorStop(0, palette.bannerStart);
    bannerGrad.addColorStop(1, palette.bannerEnd);
    ctx.save();
    ctx.shadowColor = 'rgba(59, 7, 100, 0.24)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
    drawRoundedRect(ctx, 44, 40, W - 88, 122, 46);
    ctx.fillStyle = bannerGrad;
    ctx.fill();
    ctx.restore();

    // Floating gold pill on top center
    ctx.font = '900 20px system-ui, -apple-system, sans-serif';
    const topTagW = Math.min(540, ctx.measureText(copy.topTag).width + 64);
    drawRoundedRect(ctx, (W - topTagW) / 2, 16, topTagW, 40, 14);
    ctx.fillStyle = palette.accentGold;
    ctx.fill();
    ctx.fillStyle = palette.primaryText;
    ctx.textAlign = 'center';
    ctx.fillText(copy.topTag.toUpperCase().slice(0, 44), W / 2, 43);

    // Big white + gold headline inside banner
    const heroTitle = (input.headline || input.productName || 'Oferta Especial').trim().toUpperCase();
    ctx.font = '900 42px system-ui, -apple-system, sans-serif';
    const titleLines = wrapTextLines(ctx, heroTitle, W - 160, 2);
    ctx.fillStyle = '#ffffff';
    if (titleLines.length === 1) {
      ctx.fillText(titleLines[0], W / 2, 118);
    } else {
      ctx.fillText(titleLines[0], W / 2, 98);
      ctx.fillStyle = palette.accentGold;
      ctx.fillText(titleLines[1], W / 2, 143);
    }

    // Sub-ribbon
    const subW = Math.min(440, Math.max(240, copy.subRibbon.length * 12 + 60));
    drawRoundedRect(ctx, (W - subW) / 2, 148, subW, 30, 12);
    ctx.fillStyle = palette.pillBg;
    ctx.fill();
    ctx.strokeStyle = palette.accentGold;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillText(copy.subRibbon.toUpperCase().slice(0, 34), W / 2, 168);

    // Left 3D Mockup / Product Photo Card
    draw3DMockupCard(
      ctx,
      54,
      198,
      290,
      390,
      input.productName || 'Produto',
      copy.subRibbon,
      palette,
      embeddedImg
    );

    // Right Top 4 Mini Stat Cards
    const statsStartX = 376;
    const statsW = 768;
    const cardGap = 14;
    const singleStatW = (statsW - cardGap * 3) / 4;
    copy.stats.forEach((st, idx) => {
      const sx = statsStartX + idx * (singleStatW + cardGap);
      drawRoundedRect(ctx, sx, 198, singleStatW, 92, 16);
      ctx.fillStyle = palette.cardBg;
      ctx.fill();
      ctx.strokeStyle = palette.cardBorder;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = palette.primaryText;
      ctx.font = '900 28px system-ui, -apple-system, sans-serif';
      ctx.fillText(st.num, sx + singleStatW / 2, 240);
      ctx.fillStyle = palette.bodyText;
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      ctx.fillText(st.label, sx + singleStatW / 2, 268);
    });

    // Right Middle Benefit Card
    drawRoundedRect(ctx, 376, 306, 768, 178, 18);
    ctx.fillStyle = palette.cardBg;
    ctx.fill();
    ctx.strokeStyle = palette.cardBorder;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pill header on card
    drawRoundedRect(ctx, 396, 320, 310, 32, 16);
    ctx.fillStyle = palette.pillBg;
    ctx.fill();
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillText(copy.leftHeader, 414, 342);

    ctx.font = '600 17px system-ui, -apple-system, sans-serif';
    copy.benefits.slice(0, 4).forEach((b, idx) => {
      const by = 378 + idx * 27;
      ctx.fillStyle = palette.checkColor;
      ctx.fillText('✔', 398, by);
      ctx.fillStyle = palette.bodyText;
      ctx.fillText(b.slice(0, 66), 426, by);
    });

    // Right Bottom Row: Trust Pills + Huge Price Ribbon
    copy.trustPills.slice(0, 2).forEach((tp, idx) => {
      const px = 376 + idx * 204;
      drawRoundedRect(ctx, px, 502, 192, 86, 16);
      ctx.fillStyle = palette.cardBg;
      ctx.fill();
      ctx.strokeStyle = palette.cardBorder;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillStyle = palette.checkColor;
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillText(idx === 0 ? '⚡' : '🛡️', px + 96, 536);
      ctx.fillStyle = palette.primaryText;
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      ctx.fillText(tp.slice(0, 20), px + 96, 566);
    });

    // Price Callout Ribbon (bottom-right)
    const pGrad = ctx.createLinearGradient(796, 514, 1144, 594);
    pGrad.addColorStop(0, palette.priceBgStart);
    pGrad.addColorStop(1, palette.priceBgEnd);
    ctx.save();
    ctx.shadowColor = 'rgba(59, 7, 100, 0.30)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 6;
    drawRoundedRect(ctx, 792, 516, 352, 74, 24);
    ctx.fillStyle = pGrad;
    ctx.fill();
    ctx.restore();

    drawRoundedRect(ctx, 836, 492, 188, 30, 12);
    ctx.fillStyle = palette.accentGold;
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.fillStyle = palette.primaryText;
    ctx.font = '900 16px system-ui, -apple-system, sans-serif';
    ctx.fillText(copy.priceCaption, 930, 513);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 36px system-ui, -apple-system, sans-serif';
    ctx.fillText(copy.priceValue.slice(0, 16), 968, 568);
    drawSparkles(ctx, 1126, 520, palette.accentGold);

    return canvas.toDataURL('image/jpeg', 0.90);
  }

  // =========================================================================
  // 1080x1080 VIRAL SQUARE FLYER (Exact match to model image_eb360ff9.png!)
  // =========================================================================
  // 2. Curved Purple Hero Banner + Top Floating Gold Pill
  ctx.save();
  ctx.shadowColor = 'rgba(59, 7, 100, 0.28)';
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 10;
  const bannerGrad = ctx.createLinearGradient(48, 58, W - 48, 210);
  bannerGrad.addColorStop(0, palette.bannerStart);
  bannerGrad.addColorStop(1, palette.bannerEnd);
  drawRoundedRect(ctx, 48, 62, W - 96, 152, 62);
  ctx.fillStyle = bannerGrad;
  ctx.fill();
  ctx.restore();

  // Floating Top Gold Pill
  ctx.font = '900 22px system-ui, -apple-system, sans-serif';
  const topPillW = Math.min(540, Math.max(260, ctx.measureText(copy.topTag).width + 72));
  ctx.save();
  ctx.translate(W / 2, 54);
  ctx.rotate(-0.015);
  drawRoundedRect(ctx, -topPillW / 2, -23, topPillW, 46, 14);
  ctx.fillStyle = palette.accentGold;
  ctx.fill();
  ctx.fillStyle = palette.primaryText;
  ctx.textAlign = 'center';
  ctx.fillText(copy.topTag.toUpperCase().slice(0, 38), 0, 8);
  ctx.restore();

  // Big Hero Product Name inside banner (white + gold highlight)
  const heroTitle = (input.headline || input.productName || 'Oferta Especial').trim().toUpperCase();
  ctx.font = '900 46px system-ui, -apple-system, sans-serif';
  const titleLines = wrapTextLines(ctx, heroTitle, W - 180, 2);
  ctx.textAlign = 'center';
  if (titleLines.length === 1) {
    ctx.fillStyle = '#ffffff';
    ctx.fillText(titleLines[0], W / 2, 154);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillText(titleLines[0], W / 2, 132);
    ctx.fillStyle = palette.accentGold;
    ctx.fillText(titleLines[1], W / 2, 184);
  }

  // Bottom Sub-Ribbon Pill on Hero Banner
  ctx.font = '800 18px system-ui, -apple-system, sans-serif';
  const subPillW = Math.min(420, Math.max(220, ctx.measureText(copy.subRibbon).width + 58));
  drawRoundedRect(ctx, (W - subPillW) / 2, 198, subPillW, 34, 12);
  ctx.fillStyle = palette.pillBg;
  ctx.fill();
  ctx.strokeStyle = palette.accentGold;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.fillText(copy.subRibbon.toUpperCase().slice(0, 32), W / 2, 221);

  // 3. Top Content Section: Left 3D Mockup Card + Right Intro + 4 Stat Boxes
  draw3DMockupCard(
    ctx,
    46,
    252,
    310,
    330,
    input.productName || 'Produto',
    copy.subRibbon,
    palette,
    embeddedImg
  );

  // Right Sub-title + Description Paragraph
  ctx.textAlign = 'left';
  ctx.fillStyle = palette.primaryText;
  ctx.font = '900 20px system-ui, -apple-system, sans-serif';
  ctx.fillText(input.productName.toUpperCase().slice(0, 42), 382, 276);

  ctx.fillStyle = palette.bodyText;
  ctx.font = '500 20px system-ui, -apple-system, sans-serif';
  const introLines = wrapTextLines(ctx, copy.introText, 646, 4);
  introLines.forEach((ln, idx) => {
    ctx.fillText(ln, 382, 314 + idx * 28);
  });

  // 4 Clean Metric Cards
  const stX = 382;
  const stW = 650;
  const stGap = 14;
  const eachW = (stW - stGap * 3) / 4;
  const stY = 446;
  copy.stats.forEach((st, idx) => {
    const sx = stX + idx * (eachW + stGap);
    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    drawRoundedRect(ctx, sx, stY, eachW, 122, 18);
    ctx.fillStyle = palette.cardBg;
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = palette.cardBorder;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = palette.primaryText;
    ctx.font = '900 32px system-ui, -apple-system, sans-serif';
    ctx.fillText(st.num, sx + eachW / 2, stY + 58);

    ctx.fillStyle = palette.bodyText;
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillText(st.label, sx + eachW / 2, stY + 94);
  });
  drawSparkles(ctx, 1022, 434, palette.accentGold);

  // 4. Two Middle Content Columns (Benefits + Ideal Audience)
  const colY = 594;
  // Left Card: Benefits
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.07)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 5;
  drawRoundedRect(ctx, 46, colY, 496, 306, 22);
  ctx.fillStyle = palette.cardBg;
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = palette.cardBorder;
  ctx.lineWidth = 2;
  ctx.stroke();

  drawRoundedRect(ctx, 74, colY - 16, 356, 38, 19);
  ctx.fillStyle = palette.pillBg;
  ctx.fill();
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 19px system-ui, -apple-system, sans-serif';
  ctx.fillText(copy.leftHeader, 94, colY + 10);

  ctx.font = '600 18px system-ui, -apple-system, sans-serif';
  copy.benefits.slice(0, 6).forEach((b, idx) => {
    const by = colY + 56 + idx * 40;
    ctx.fillStyle = palette.checkColor;
    ctx.fillText('✔', 68, by);
    ctx.fillStyle = palette.bodyText;
    ctx.fillText(b.slice(0, 44), 96, by);
  });

  // Right Top Card: Destinado a / Perfect For
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.07)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 5;
  drawRoundedRect(ctx, 564, colY, 470, 174, 22);
  ctx.fillStyle = palette.cardBg;
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = palette.cardBorder;
  ctx.lineWidth = 2;
  ctx.stroke();

  drawRoundedRect(ctx, 592, colY - 16, 260, 38, 19);
  ctx.fillStyle = palette.pillBg;
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 19px system-ui, -apple-system, sans-serif';
  ctx.fillText(copy.rightHeader, 612, colY + 10);

  ctx.font = '600 17px system-ui, -apple-system, sans-serif';
  copy.audience.slice(0, 4).forEach((a, idx) => {
    const ay = colY + 52 + idx * 30;
    ctx.fillStyle = palette.checkColor;
    ctx.fillText('✔', 584, ay);
    ctx.fillStyle = palette.bodyText;
    ctx.fillText(a.slice(0, 41), 610, ay);
  });

  // Right Bottom Card: Ideal Para / Why Switch Now
  const idealY = colY + 196;
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.07)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 5;
  drawRoundedRect(ctx, 564, idealY, 470, 110, 22);
  ctx.fillStyle = palette.cardBg;
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = palette.cardBorder;
  ctx.lineWidth = 2;
  ctx.stroke();

  drawRoundedRect(ctx, 592, idealY - 16, 230, 36, 18);
  ctx.fillStyle = palette.pillBg;
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
  ctx.fillText(copy.idealHeader, 612, idealY + 8);

  ctx.fillStyle = palette.bodyText;
  ctx.font = '600 17px system-ui, -apple-system, sans-serif';
  const idealLines = wrapTextLines(ctx, copy.idealText, 424, 3);
  idealLines.forEach((ln, idx) => {
    ctx.fillText(ln, 586, idealY + 46 + idx * 24);
  });

  // 5. Bottom Strip: 3 Trust Icons + Big Eye-Catching Gold/Purple Price Callout!
  const botY = 928;
  const icons = ['🖨️', '📄', '🛡️'];
  copy.trustPills.slice(0, 3).forEach((tp, idx) => {
    const px = 46 + idx * 172;
    drawRoundedRect(ctx, px, botY, 160, 118, 18);
    ctx.fillStyle = palette.cardBg;
    ctx.fill();
    ctx.strokeStyle = palette.cardBorder;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '30px system-ui, sans-serif';
    ctx.fillText(icons[idx], px + 80, botY + 48);
    ctx.fillStyle = palette.primaryText;
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    const tpLines = wrapTextLines(ctx, tp, 140, 2);
    tpLines.forEach((ln, li) => {
      ctx.fillText(ln, px + 80, botY + 78 + li * 20);
    });
  });

  // Big Tilted Price Ribbon (right side)
  ctx.save();
  ctx.translate(806, 996);
  ctx.rotate(-0.025);
  ctx.shadowColor = 'rgba(59, 7, 100, 0.34)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;

  const pGrad = ctx.createLinearGradient(-218, -42, 218, 52);
  pGrad.addColorStop(0, palette.priceBgStart);
  pGrad.addColorStop(1, palette.priceBgEnd);
  drawRoundedRect(ctx, -218, -32, 436, 92, 34);
  ctx.fillStyle = pGrad;
  ctx.fill();
  ctx.restore();

  // Tilted Gold "POR APENAS" pill on top of price ribbon
  ctx.save();
  ctx.translate(790, 944);
  ctx.rotate(-0.035);
  drawRoundedRect(ctx, -124, -20, 248, 38, 14);
  ctx.fillStyle = palette.accentGold;
  ctx.fill();
  ctx.textAlign = 'center';
  ctx.fillStyle = palette.primaryText;
  ctx.font = '900 20px system-ui, -apple-system, sans-serif';
  ctx.fillText(copy.priceCaption, 0, 7);
  ctx.restore();

  // Huge bold Price value
  ctx.save();
  ctx.translate(806, 1012);
  ctx.rotate(-0.025);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  const pv = copy.priceValue.slice(0, 16);
  ctx.font = pv.length > 10 ? '900 44px system-ui, -apple-system, sans-serif' : '900 56px system-ui, -apple-system, sans-serif';
  ctx.fillText(pv, 0, 12);
  ctx.restore();

  drawSparkles(ctx, 610, 954, palette.accentGold);
  drawSparkles(ctx, 1006, 954, palette.accentGold);

  return canvas.toDataURL('image/jpeg', 0.90);
}

export function generateViralFlyerSync(input: ViralFlyerInput): string {
  try {
    const canvas = document.createElement('canvas');
    if (input.aspect === 'og') {
      canvas.width = 1200;
      canvas.height = 630;
    } else {
      canvas.width = 1080;
      canvas.height = 1080;
    }
    return drawFlyerCore(canvas, input, null);
  } catch {
    return '';
  }
}

export function generateViralFlyerAsync(input: ViralFlyerInput): Promise<string> {
  return new Promise((resolve) => {
    const rawPhoto = (input.embeddedImageUrl || '').trim();
    if (!rawPhoto) {
      resolve(generateViralFlyerSync(input));
      return;
    }
    const img = new Image();
    if (!rawPhoto.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    const timer = setTimeout(() => {
      resolve(generateViralFlyerSync(input));
    }, 3500);
    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        if (input.aspect === 'og') {
          canvas.width = 1200;
          canvas.height = 630;
        } else {
          canvas.width = 1080;
          canvas.height = 1080;
        }
        resolve(drawFlyerCore(canvas, input, img));
      } catch {
        resolve(generateViralFlyerSync(input));
      }
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(generateViralFlyerSync(input));
    };
    img.src = rawPhoto;
  });
}
