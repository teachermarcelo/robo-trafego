export type RealPhotoNicheId =
  | 'pedagogia_tdah'
  | 'receitas'
  | 'artesanato_moldes'
  | 'planilhas';

export type RealPhotoLang = 'pt' | 'en' | 'es';

export interface RealPhotoCommentConfig {
  nicheId: RealPhotoNicheId;
  lang: RealPhotoLang;
  keyword: string;
  postText: string;
  replyText: string;
  variationIndex: number;
  replyVariationIndex: number;
  customNaturalPhotoUrl?: string;
  updatedAt?: number;
}

export interface NicheSearchQuery {
  label: string;
  query: string;
  tip: string;
}

export interface NicheTemplatePack {
  defaultKeyword: string;
  defaultPriceExample: string;
  defaultProductHint: string;
  postTemplates: string[];
  replyTemplates: string[];
  groupSearchQueries: NicheSearchQuery[];
  goodGroupSignals: string[];
  avoidGroupSignals: string[];
  naturalSheetTitle: string;
  naturalSheetSubtitle: string;
  naturalSheetItems: string[];
  naturalSheetFooter: string;
  naturalDeskStyle: 'paper_worksheet' | 'recipe_card' | 'craft_pattern' | 'spreadsheet_desk';
}

export interface NicheMeta {
  id: RealPhotoNicheId;
  emoji: string;
  label: string;
  shortLabel: string;
  priceRangeBr: string;
  priceRangeGlobal: string;
  whyItSells: string;
  packs: Record<RealPhotoLang, NicheTemplatePack>;
}

export const REAL_PHOTO_LANG_META: Record<
  RealPhotoLang,
  { code: RealPhotoLang; flag: string; label: string; countries: string }
> = {
  pt: {
    code: 'pt',
    flag: '🇧🇷',
    label: 'Brasil (PT-BR)',
    countries: 'Brasil · Portugal',
  },
  en: {
    code: 'en',
    flag: '🇺🇸',
    label: 'Inglês (US · AU · CA · UK)',
    countries: 'EUA · Austrália · Canadá · Reino Unido',
  },
  es: {
    code: 'es',
    flag: '🇪🇸',
    label: 'Espanhol (Latam · Espanha)',
    countries: 'México · Colômbia · Espanha · Argentina · Chile',
  },
};

export const REAL_PHOTO_NICHES: Record<RealPhotoNicheId, NicheMeta> = {
  pedagogia_tdah: {
    id: 'pedagogia_tdah',
    emoji: '📚',
    label: 'Pedagogia, Alfabetização & TDAH/Autismo',
    shortLabel: 'Pedagogia & TDAH',
    priceRangeBr: 'R$ 19,90 – R$ 37',
    priceRangeGlobal: '$9 – $27 USD',
    whyItSells:
      'Professoras, pedagogas e mães atípicas compram toda semana pacotes prontos em PDF para imprimir e economizar horas de preparo.',
    packs: {
      pt: {
        defaultKeyword: 'EU QUERO',
        defaultPriceExample: 'R$ 24,90',
        defaultProductHint: 'Pacotão com +200 Atividades de Alfabetização & TDAH em PDF',
        postTemplates: [
          'Gente, finalmente encontrei um material com +200 atividades prontas de alfabetização e foco (TDAH/Autismo) em PDF só para imprimir (saiu menos de [PRECO] e já salvou minha semana inteira!).\n\nSe alguma prof ou mãe quiser o link de onde peguei, comenta "[PALAVRA]" que eu respondo aqui 👇',
          'Mães e professoras, olha a qualidade dessas folhas que imprimi hoje para trabalhar leitura e concentração sem chororô 😍\n\nVem tudo organizado por nível em PDF (paguei super baratinho, menos de [PRECO]). Quem quiser o link, comenta "[PALAVRA]" que eu mando!',
          'Dica de ouro para quem vive perdendo o fim de semana montando atividade do zero: peguei esse kit pronto em PDF para alfabetização e crianças com TDAH/Autismo e as crianças amaram.\n\nNão vou deixar link aqui para não bagunçar o grupo — quem quiser, comenta "[PALAVRA]" que eu passo 👇',
        ],
        replyTemplates: [
          'Oi! Claro 😊 Peguei por aqui, dá uma olhada nos detalhes e o que vem no PDF: [PRESELL_LINK]',
          'Te mandei aqui! Foi nesta página que encontrei o material completo em PDF para imprimir: [PRESELL_LINK]',
          'Aqui está o link certinho com todas as páginas inclusas e o valor promocional: [PRESELL_LINK] 💛',
        ],
        groupSearchQueries: [
          { label: 'Professoras Educação Infantil', query: 'professoras educação infantil atividades', tip: 'Priorize grupos +10k membros com posts diários.' },
          { label: 'Alfabetização e Letramento', query: 'atividades alfabetização e letramento pdf', tip: 'Altíssima procura de professoras e mães.' },
          { label: 'Mães de Crianças com TDAH', query: 'mães crianças TDAH apoio atividades', tip: 'Dor real imediata — use tom acolhedor.' },
          { label: 'Mães de Autistas / TEA', query: 'mães autismo TEA atividades lúdicas', tip: 'Comunidades muito engajadas em materiais prontos.' },
          { label: 'Pedagogia na Prática', query: 'pedagogia na prática atividades prontas', tip: 'Evite grupos que só vendem — busque onde trocam dicas.' },
          { label: 'Psicopedagogia Clínica', query: 'psicopedagogia atividades imprimir', tip: 'Público comprador recorrente.' },
        ],
        goodGroupSignals: [
          'Pessoas pedindo ajuda real nos comentários ("alguém tem atividade de...?")',
          'Mínimo de 5 a 10 publicações novas por dia com comentários humanos',
          'Grupos específicos de Mães, Professoras, Pedagogas, TDAH ou Autismo',
        ],
        avoidGroupSignals: [
          'Grupos com nome "Renda Extra", "Divulgue seu Link", "Marketing Digital" ou "Vendas"',
          'Grupos onde todos os posts têm 0 comentários e só links de afiliado',
        ],
        naturalSheetTitle: 'ATIVIDADES DE ALFABETIZAÇÃO & FOCO',
        naturalSheetSubtitle: 'Caderno Prático para Imprimir • Nível 1 ao 3',
        naturalSheetItems: [
          '1. Ligue a imagem à sílaba inicial (BA - BE - BI - BO - BU)',
          '2. Encontre e pinte apenas as letras destacadas (Atenção TDAH)',
          '3. Complete a palavra com as vogais que faltam',
          '4. Labirinto visual de concentração e coordenação motora',
          '5. Mini leitura guiada com perguntas de compreensão',
        ],
        naturalSheetFooter: 'Material pronto em PDF • Folha 14 de 200',
        naturalDeskStyle: 'paper_worksheet',
      },
      en: {
        defaultKeyword: 'SEND IT',
        defaultPriceExample: '$17',
        defaultProductHint: '200+ Printable ADHD Focus & Early Reading Worksheets Bundle (PDF)',
        postTemplates: [
          'Honestly wish I found this sooner! Printed these visual focus & early reading worksheets for my kiddo this morning (whole PDF bundle was under [PRECO] and kept them happily focused for 40 minutes).\n\nIf any parent or teacher wants the link, just comment "[PALAVRA]" and I will reply with it 👇',
          'Teachers & homeschool moms — look how clean these printable ADHD & phonics sheets turned out on regular printer paper 😍\n\nSaved me hours of prep this week (under [PRECO] for the whole pack). Comment "[PALAVRA]" if you want me to share where I got it!',
          'Quick share for anyone tired of spending Sunday night making worksheets from scratch: grabbed this ready-to-print PDF bundle for phonics & ADHD focus and it has been a lifesaver.\n\nNot dropping links in the post out of respect for the group — comment "[PALAVRA]" and I will send the page 👇',
        ],
        replyTemplates: [
          'Here you go! 😊 You can see all the printable pages included right here: [PRESELL_LINK]',
          'Happy to share! This is the exact page where I grabbed the printable PDF bundle: [PRESELL_LINK]',
          'Just replied with it here — it shows sample pages and the instant PDF download: [PRESELL_LINK] 💛',
        ],
        groupSearchQueries: [
          { label: 'Homeschooling Moms USA', query: 'homeschooling moms printables worksheets', tip: 'Huge buying power in US/CA/AU.' },
          { label: 'ADHD Parenting Support', query: 'ADHD parenting support kids focus', tip: 'Keep tone empathetic and helpful, zero hard selling.' },
          { label: 'Kindergarten & Pre-K Teachers', query: 'kindergarten preschool teachers ideas worksheets', tip: 'Teachers buy low-ticket PDFs every week.' },
          { label: 'Autism Moms Resources', query: 'autism moms sensory learning printables', tip: 'Visual learning packs convert very well.' },
          { label: 'Early Reading & Phonics', query: 'teaching kids to read phonics activities', tip: 'High daily comment engagement.' },
          { label: 'Australia / UK Homeschool', query: 'homeschooling Australia UK resources', tip: 'Less saturated than US groups.' },
        ],
        goodGroupSignals: [
          'Real moms and teachers asking for printable activity recommendations',
          'Active daily discussions with 10+ human comments per post',
          'Specific niche names (Homeschool, Kindergarten, ADHD Parents, Special Ed)',
        ],
        avoidGroupSignals: [
          'Groups named "Make Money Online", "Promote Your Business", or "Affiliate Links"',
          'Dead groups where every post has zero comments',
        ],
        naturalSheetTitle: 'FOCUS & EARLY READING WORKBOOK',
        naturalSheetSubtitle: 'Ready-to-Print PDF Pack • Ages 4–9 (ADHD Friendly)',
        naturalSheetItems: [
          '1. Circle the matching starting sound (Visual Phonics)',
          '2. Calm Focus Maze — trace the path without lifting pencil',
          '3. Build the 3-letter word using picture clues',
          '4. Spot & count the hidden shapes (Attention Booster)',
          '5. Daily 5-minute confidence checklist for kids',
        ],
        naturalSheetFooter: 'Instant Printable PDF • Page 12 of 200',
        naturalDeskStyle: 'paper_worksheet',
      },
      es: {
        defaultKeyword: 'YO QUIERO',
        defaultPriceExample: '$12 USD',
        defaultProductHint: 'Pack de +200 Actividades Imprimibles de Lectoescritura y TDAH (PDF)',
        postTemplates: [
          'Chicas, por fin encontré un pack con +200 fichas listas para imprimir de lectoescritura y atención (TDAH/Autismo) — me costó menos de [PRECO] y me ahorró todo el fin de semana!\n\nSi alguna maestra o mamá quiere el enlace, comenta "[PALAVRA]" y se lo paso aquí 👇',
          'Mamás y docentes, miren qué bonitas quedaron impresas estas actividades para mejorar la lectura y concentración sin peleas 😍\n\nViene todo ordenado en PDF listo para imprimir (menos de [PRECO]). Quien quiera el link, comenta "[PALAVRA]"!',
          'Dato de oro para quienes pasan horas armando fichas desde cero: descargué este cuadernillo imprimible de lectoescritura y concentración y a los peques les encantó.\n\nNo pongo link en el post para cuidar el grupo — comenta "[PALAVRA]" y te lo paso 👇',
        ],
        replyTemplates: [
          '¡Hola! Claro 😊 Aquí está la página donde conseguí todo el PDF imprimible: [PRESELL_LINK]',
          '¡Aquí tienes! En este enlace puedes ver todo lo que incluye el material: [PRESELL_LINK]',
          'Te lo dejo por aquí con todos los detalles y descarga inmediata: [PRESELL_LINK] 💛',
        ],
        groupSearchQueries: [
          { label: 'Maestras de Preescolar', query: 'maestras preescolar actividades imprimibles', tip: 'Grupos enormes en México, Colombia y España.' },
          { label: 'Lectoescritura y Primaria', query: 'lectoescritura primaria fichas pdf', tip: 'Muy alta interacción diaria.' },
          { label: 'Mamás TDAH y Autismo', query: 'mamás TDAH autismo actividades niños', tip: 'Público con urgencia real.' },
          { label: 'Material Didáctico PDF', query: 'material didáctico educación infantil', tip: 'Excelente para packs de $9–$19.' },
          { label: 'Pedagogía Terapéutica', query: 'pedagogía terapéutica recursos imprimir', tip: 'Fuerte en España y Cono Sur.' },
          { label: 'Educación en Casa', query: 'homeschooling español actividades niños', tip: 'Baja competencia y alta conversión.' },
        ],
        goodGroupSignals: [
          'Docentes y mamás preguntando dónde conseguir fichas listas',
          'Publicaciones diarias con muchos comentarios reales',
          'Grupos enfocados en Preescolar, Primaria, TDAH o Autismo',
        ],
        avoidGroupSignals: [
          'Grupos de "Gana Dinero", "Promociona tu Negocio" o puro spam de enlaces',
          'Grupos inactivos sin respuestas de personas reales',
        ],
        naturalSheetTitle: 'CUADERNO DE LECTOESCRITURA Y ATENCIÓN',
        naturalSheetSubtitle: 'Pack Imprimible en PDF • Nivel Inicial y Primaria',
        naturalSheetItems: [
          '1. Une cada dibujo con su sílaba inicial',
          '2. Encuentra y colorea las letras ocultas (Enfoque TDAH)',
          '3. Completa las palabras con las vocales faltantes',
          '4. Laberinto visual de concentración y motricidad fina',
          '5. Lectura corta guiada con preguntas simples',
        ],
        naturalSheetFooter: 'Archivo PDF Imprimible • Hoja 14 de 200',
        naturalDeskStyle: 'paper_worksheet',
      },
    },
  },

  receitas: {
    id: 'receitas',
    emoji: '🥗',
    label: 'Receitas com Dor Específica (Diabéticos, Fit, Sem Glúten, Marmitas)',
    shortLabel: 'Receitas & Marmitas',
    priceRangeBr: 'R$ 19,90 – R$ 29,90',
    priceRangeGlobal: '$9 – $19 USD',
    whyItSells:
      'Quem tem diabetes, intolerância ou precisa emagrecer/congelar marmitas da semana decide por impulso ao ver receitas simples com ingredientes comuns.',
    packs: {
      pt: {
        defaultKeyword: 'EU QUERO',
        defaultPriceExample: 'R$ 19,90',
        defaultProductHint: 'Guia com +150 Receitas Práticas (Zero Açúcar / Marmitas Fit / Sem Glúten)',
        postTemplates: [
          'Gente, testei essa receita hoje (sem açúcar, sem glúten e feita com ingredientes baratos que já tinha em casa) e ficou maravilhosa! 😍\n\nPeguei num livrinho digital com +150 receitas práticas que saiu menos de [PRECO]. Se alguém quiser o link, comenta "[PALAVRA]" que eu respondo aqui 👇',
          'Para quem cansou de comer sempre a mesma coisa ou gastar fortuna no mercado: esse guia de receitas prontas (com lista de compras e modo de congelar) salvou minha rotina!\n\nCustou menos de [PRECO] em PDF. Quem quiser dar uma olhada, comenta "[PALAVRA]" que eu mando!',
          'Final de semana resolvi organizar as refeições da semana inteira em 2 horas usando esse caderninho de receitas simples e saudáveis.\n\nNão vou jogar link aqui no post para não parecer spam — se quiser o link onde peguei, comenta "[PALAVRA]" 👇',
        ],
        replyTemplates: [
          'Oi! Claro 😊 Foi nesta página que peguei o guia completo com todas as receitas: [PRESELL_LINK]',
          'Aqui está o link certinho para você ver o cardápio e as receitas inclusas: [PRESELL_LINK] 🥗',
          'Te passei aqui! O PDF chega na hora no e-mail/WhatsApp depois que olha os detalhes aqui: [PRESELL_LINK]',
        ],
        groupSearchQueries: [
          { label: 'Receitas para Diabéticos', query: 'receitas para diabéticos sem açúcar', tip: 'Um dos públicos mais compradores do Facebook.' },
          { label: 'Sem Glúten e Sem Lactose', query: 'receitas sem glúten sem lactose fáceis', tip: 'Dor real diária — altíssimo engajamento.' },
          { label: 'Marmitas Fit Congeladas', query: 'marmitas fit congeladas cardápio semana', tip: 'Excelente tanto para uso próprio quanto para vender.' },
          { label: 'Emagrecimento / Low Carb', query: 'receitas low carb fáceis emagrecer', tip: 'Grupos gigantes e super ativos.' },
          { label: 'Receitas na Airfryer', query: 'receitas airfryer rápidas econômicas', tip: 'Gera dezenas de comentários "EU QUERO".' },
          { label: 'Doces e Bolos para Vender', query: 'receitas bolos doces para vender', tip: 'Público que paga rápido para lucrar.' },
        ],
        goodGroupSignals: [
          'Pessoas postando fotos caseiras de pratos e pedindo "passa a receita!"',
          'Grupos específicos (Diabéticos, Sem Glúten, Marmitas Fit, Low Carb)',
          'Comentários ativos nas últimas 24 horas',
        ],
        avoidGroupSignals: [
          'Grupos de "Divulgação Grátis" ou "Renda Extra"',
          'Grupos lotados só de links externos sem fotos de comida',
        ],
        naturalSheetTitle: 'CADERNO DE RECEITAS PRÁTICAS DO DIA A DIA',
        naturalSheetSubtitle: 'Zero Açúcar • Sem Glúten • Ingredientes Simples de Mercado',
        naturalSheetItems: [
          '• Café da Manhã em 5 min (Pão de frigideira fofinho)',
          '• 5 Marmitas Congeladas da Semana (não junta água)',
          '• Sobremesa cremosa que não altera a glicemia',
          '• Lista de compras econômica pronta para imprimir',
          '• Substituições inteligentes sem ingredientes caros',
        ],
        naturalSheetFooter: 'Guia Digital Completo em PDF • 150+ Receitas Testadas',
        naturalDeskStyle: 'recipe_card',
      },
      en: {
        defaultKeyword: 'RECIPE',
        defaultPriceExample: '$14',
        defaultProductHint: '150+ Easy Diabetic / Anti-Inflammatory / Gluten-Free Meal Prep Recipes (PDF)',
        postTemplates: [
          'Tried this 15-minute sugar-free & gluten-free dinner tonight using basic grocery ingredients and my whole family asked for seconds! 😍\n\nGot it from a simple printable recipe guide (under [PRECO] for 150+ recipes + grocery lists). Comment "[PALAVRA]" if you want the link 👇',
          'For anyone tired of eating boring food or spending hours figuring out what to cook every week: this meal-prep & blood-sugar-friendly recipe book has been a total game changer.\n\nIt was under [PRECO] as an instant PDF. Comment "[PALAVRA]" and I will reply with the page!',
          'Prepped all 5 weekday lunches in under 90 minutes today using this printable recipe binder (zero weird expensive ingredients).\n\nKeeping links out of the post to respect group rules — just comment "[PALAVRA]" and I will drop it in the replies 👇',
        ],
        replyTemplates: [
          'Here you go! 😊 You can see the full recipe list and details here: [PRESELL_LINK]',
          'Happy to share! This is where I grabbed the printable PDF recipe guide: [PRESELL_LINK] 🥗',
          'Here is the exact page with sample recipes and instant download: [PRESELL_LINK]',
        ],
        groupSearchQueries: [
          { label: 'Type 2 Diabetic Recipes', query: 'diabetic friendly recipes low carb easy', tip: 'Extremely responsive audience in US/UK/AU.' },
          { label: 'Gluten-Free & Dairy-Free', query: 'gluten free dairy free easy meals', tip: 'Parents & families actively seeking easy recipes.' },
          { label: 'Anti-Inflammatory Meals', query: 'anti inflammatory diet recipes beginners', tip: 'Fast-growing high-converting niche.' },
          { label: 'Weekly Meal Prep Moms', query: 'easy meal prep ideas busy families', tip: 'Loves printable grocery lists.' },
          { label: 'Air Fryer Easy Recipes', query: 'easy air fryer recipes healthy', tip: 'Massive comment engagement.' },
          { label: 'Menopause / Weight Loss 40+', query: 'healthy recipes women over 40', tip: 'High-trust buyer demographic.' },
        ],
        goodGroupSignals: [
          'Members sharing real kitchen photos and asking "recipe please!"',
          'Specific diet/health focus (Diabetic, Gluten-Free, Anti-Inflammatory, Meal Prep)',
          'Active replies within the last few hours',
        ],
        avoidGroupSignals: [
          'Generic spam/promo groups with zero real food discussion',
          'Groups with strict "no sharing resources in comments" warnings',
        ],
        naturalSheetTitle: 'EVERYDAY HEALTHY RECIPE BINDER',
        naturalSheetSubtitle: 'Low-Sugar • Gluten-Free • Budget Grocery Ingredients',
        naturalSheetItems: [
          '• 5-Minute Savory Breakfast Skillet (High Protein)',
          '• 5 Freezer-Friendly Weekday Lunches (Zero Soggy Texture)',
          '• Guilt-Free Dessert That Keeps Blood Sugar Steady',
          '• Printable Weekly Shopping List Included',
          '• Simple Swaps Using Everyday Supermarket Items',
        ],
        naturalSheetFooter: 'Instant Printable PDF Guide • 150+ Tested Recipes',
        naturalDeskStyle: 'recipe_card',
      },
      es: {
        defaultKeyword: 'RECETA',
        defaultPriceExample: '$11 USD',
        defaultProductHint: 'Recetario Digital +150 Recetas Fáciles (Sin Azúcar / Sin Gluten / Viandas)',
        postTemplates: [
          '¡Probé esta receta sin azúcar y sin gluten hoy con ingredientes económicos de casa y quedó deliciosa! 😍\n\nLa saqué de un recetario digital con +150 recetas prácticas (me salió menos de [PRECO]). Si alguien quiere el enlace, comenta "[PALAVRA]" y lo paso aquí 👇',
          'Para quienes ya no saben qué cocinar cada semana sin gastar de más: este recetario con menú semanal y lista de compras me salvó la vida.\n\nCuesta menos de [PRECO] en PDF. Comenta "[PALAVRA]" si quieres que te pase dónde lo conseguí!',
          'Hoy dejé listas las comidas de toda la semana en 2 horas siguiendo este cuadernillo de recetas saludables y fáciles.\n\nNo dejo links aquí por respeto al grupo — comenta "[PALAVRA]" y te respondo con la página 👇',
        ],
        replyTemplates: [
          '¡Claro! 😊 Aquí tienes el enlace con todas las recetas que incluye el PDF: [PRESELL_LINK]',
          '¡Aquí te lo paso! En esta página lo descargué al instante: [PRESELL_LINK] 🥗',
          'Te dejo el link exacto con el menú y los detalles aquí: [PRESELL_LINK]',
        ],
        groupSearchQueries: [
          { label: 'Recetas para Diabéticos', query: 'recetas para diabéticos sin azúcar fáciles', tip: 'Altísima demanda en Latam y España.' },
          { label: 'Sin Gluten / Celíacos', query: 'recetas sin gluten sin lactosa fáciles', tip: 'Comunidad muy activa y agradecida.' },
          { label: 'Viandas Saludables', query: 'viandas saludables semanales recetas', tip: 'Muy popular en Argentina, Uruguay, Chile y México.' },
          { label: 'Recetas Airfryer', query: 'recetas freidora de aire fáciles', tip: 'Muchísimos comentarios diarios.' },
          { label: 'Postres Saludables', query: 'postres sin azúcar fáciles saludables', tip: 'Compra rápida por impulso.' },
          { label: 'Comida Casera Económica', query: 'menú semanal comidas económicas casa', tip: 'Grupos enormes con madres activas.' },
        ],
        goodGroupSignals: [
          'Personas comentando "receta por favor" en fotos caseras',
          'Grupos específicos de Diabéticos, Celíacos, Viandas o Airfryer',
          'Actividad diaria constante',
        ],
        avoidGroupSignals: [
          'Grupos de anuncios o enlaces sin comentarios reales',
          'Grupos inactivos hace semanas',
        ],
        naturalSheetTitle: 'RECETARIO PRÁCTICO DE TODOS LOS DÍAS',
        naturalSheetSubtitle: 'Sin Azúcar • Sin Gluten • Ingredientes Económicos',
        naturalSheetItems: [
          '• Desayuno en 5 minutos (Pan suave de sartén)',
          '• 5 Comidas Semanales para Congelar sin perder sabor',
          '• Postre cremoso apto que no sube la glucosa',
          '• Lista semanal de compras lista para imprimir',
          '• Reemplazos simples con ingredientes comunes',
        ],
        naturalSheetFooter: 'Guía Digital en PDF • +150 Recetas Probadas',
        naturalDeskStyle: 'recipe_card',
      },
    },
  },

  artesanato_moldes: {
    id: 'artesanato_moldes',
    emoji: '✂️',
    label: 'Artesanato, Moldes, Crochê & Papelaria Personalizada',
    shortLabel: 'Artesanato & Moldes',
    priceRangeBr: 'R$ 19,90 – R$ 37',
    priceRangeGlobal: '$9 – $24 USD',
    whyItSells:
      'Artesãs e papelarias recuperam o valor do pacote no primeiro pedido que vendem — compram moldes prontos, receitas de amigurumi e arquivos editáveis toda semana.',
    packs: {
      pt: {
        defaultKeyword: 'EU QUERO',
        defaultPriceExample: 'R$ 27,00',
        defaultProductHint: 'Pacotão de Moldes & Arquivos Prontos (Papelaria / Crochê / Feltro / Costura)',
        postTemplates: [
          'Meninas do artesanato, olha que perfeição esses moldes em tamanho real que peguei hoje (vem pronto para imprimir em folha A4 e já cortar sem dor de cabeça) 😍\n\nO pacote inteiro saiu menos de [PRECO] e já se paga na primeira peça vendida! Quem quiser o link, comenta "[PALAVRA]" que eu passo 👇',
          'Para quem perde horas tentando desenhar molde ou montar arte do zero: achei um kit pronto super organizadinho com passo a passo e arquivos editáveis.\n\nCustou menos de [PRECO]! Se quiser conferir o que vem dentro, comenta "[PALAVRA]" que eu respondo aqui.',
          'Dica de amiga para agilizar as encomendas dessa semana: peguei esse pack de moldes/receitas prontas para imprimir e consegui montar 3 peças no tempo de 1!\n\nNão vou colocar link no post para não dar problema no grupo — comenta "[PALAVRA]" que te envio 👇',
        ],
        replyTemplates: [
          'Oi linda! 😊 Foi aqui que peguei o pacote completo de moldes prontos: [PRESELL_LINK]',
          'Aqui está o link certinho com todos os modelos que vêm no kit: [PRESELL_LINK] ✂️',
          'Te mandei aqui! Dá para baixar na hora e imprimir em folha A4 normal: [PRESELL_LINK]',
        ],
        groupSearchQueries: [
          { label: 'Papelaria Personalizada', query: 'papelaria personalizada moldes prontos', tip: 'Nicho que compra quase todo dia.' },
          { label: 'Crochê e Amigurumi', query: 'amigurumi crochê receitas passo a passo', tip: 'Comentários explodem com foto de peça pronta.' },
          { label: 'Artesanato em Feltro', query: 'artesanato em feltro moldes grátis pagos', tip: 'Artesãs amam moldes em tamanho real A4.' },
          { label: 'Costura Criativa', query: 'costura criativa moldes bolsas necessaire', tip: 'Público fiel e disposto a investir R$ 27–37.' },
          { label: 'Topos de Bolo e Festas', query: 'topo de bolo papelaria arquivos studio canva', tip: 'Alta urgência para encomendas do fim de semana.' },
          { label: 'Laços e Tiaras / EVA', query: 'artesanato em EVA moldes lembrancinhas', tip: 'Ótimo ticket de entrada R$ 19,90.' },
        ],
        goodGroupSignals: [
          'Artesãs mostrando trabalhos prontos e perguntando "onde consigo o molde?"',
          'Grupos específicos (Feltro, Crochê, Costura Criativa, Papelaria Personalizada)',
          'Alto volume de elogios e dúvidas reais nos comentários',
        ],
        avoidGroupSignals: [
          'Grupos de "Anuncie Aqui" ou "Renda Extra"',
          'Grupos onde apenas 1 admin pode postar',
        ],
        naturalSheetTitle: 'MOLDES PRONTOS EM TAMANHO REAL (A4)',
        naturalSheetSubtitle: 'Pronto para Imprimir, Recortar e Lucrar nas Encomendas',
        naturalSheetItems: [
          '• Moldes vetorizados em escala real (folha A4 comum)',
          '• Medidas exatas + margem de costura/corte marcada',
          '• Lista de materiais e sugestão de preço de venda',
          '• Modelos campeões de encomenda o ano inteiro',
          '• Acesso vitalício em PDF + arquivos editáveis',
        ],
        naturalSheetFooter: 'Kit Completo para Artesãs • Download Imediato',
        naturalDeskStyle: 'craft_pattern',
      },
      en: {
        defaultKeyword: 'PATTERN',
        defaultPriceExample: '$12',
        defaultProductHint: 'Printable Sewing / Crochet / Cricut & Craft Pattern Bundle (PDF)',
        postTemplates: [
          'Fellow crafters — look how clean these true-to-size printable patterns came out on regular printer paper! Zero guesswork and super beginner-friendly 😍\n\nThe whole bundle was under [PRECO]. Comment "[PALAVRA]" if you want me to share where I got it 👇',
          'If you hate spending hours drafting patterns from scratch: I grabbed this ready-to-print PDF pattern bundle with step-by-step photos and finished my first piece in one evening.\n\nUnder [PRECO] for the whole set — comment "[PALAVRA]" and I will reply with the link!',
          'Quick craft-room share: found this printable pattern & template pack that pays for itself on your very first Etsy or craft-fair order.\n\nLeaving links out of the post to keep the group tidy — comment "[PALAVRA]" and I will send the page 👇',
        ],
        replyTemplates: [
          'Here you go! 😊 You can see all the patterns included right here: [PRESELL_LINK]',
          'Happy to share! This is the exact bundle I downloaded: [PRESELL_LINK] ✂️',
          'Here is the link with photos of all finished projects included: [PRESELL_LINK]',
        ],
        groupSearchQueries: [
          { label: 'Crochet & Amigurumi Lovers', query: 'crochet amigurumi patterns beginners', tip: 'Enormous engagement on finished-item photos.' },
          { label: 'Sewing & Bag Making', query: 'sewing patterns bags pouches beginners', tip: 'PDF sewing patterns sell all year.' },
          { label: 'Cricut & Paper Crafts', query: 'cricut svg templates paper crafts', tip: 'US/CA/UK craft buyers love bundles.' },
          { label: 'Felt Crafts & Quiet Books', query: 'felt crafts patterns handmade toys', tip: 'Low competition, strong buyer intent.' },
          { label: 'Quilting & Embroidery', query: 'embroidery quilting patterns printable', tip: 'High-trust community.' },
          { label: 'Etsy & Craft Fair Sellers', query: 'craft fair sellers handmade ideas', tip: 'Buyers who view patterns as business investments.' },
        ],
        goodGroupSignals: [
          'Crafters showing WIPs and asking "where is this pattern from?"',
          'Active groups focused on Crochet, Sewing, Cricut, Felt or Paper Crafts',
          'High comment-to-post ratio',
        ],
        avoidGroupSignals: [
          'Generic "Promote Your Etsy Shop" link-dump groups',
          'Groups with zero comments on posts',
        ],
        naturalSheetTitle: 'PRINTABLE CRAFT PATTERN BUNDLE',
        naturalSheetSubtitle: 'True-to-Size A4 / US Letter • Step-by-Step Guide',
        naturalSheetItems: [
          '• Full-size printable templates — tape & cut in minutes',
          '• Clear seam allowances & beginner stitch notes',
          '• Material list & craft-fair pricing cheat sheet',
          '• Best-selling gift & seasonal designs included',
          '• Instant PDF download — keep forever',
        ],
        naturalSheetFooter: 'Ready-to-Print Craft Pack • Instant PDF',
        naturalDeskStyle: 'craft_pattern',
      },
      es: {
        defaultKeyword: 'MOLDES',
        defaultPriceExample: '$12 USD',
        defaultProductHint: 'Pack de Moldes Imprimibles a Tamaño Real (Fieltro / Crochet / Papelería)',
        postTemplates: [
          'Chicas artesanas, miren qué prolijos salen estos moldes a tamaño real impresos en hoja A4 común (listos para recortar sin perder tiempo) 😍\n\nTodo el paquete salió menos de [PRECO] y se paga con el primer pedido. Quien quiera el enlace, comenta "[PALAVRA]" 👇',
          'Para quienes pasan horas dibujando moldes desde cero: conseguí este pack súper ordenado con paso a paso y medidas exactas.\n\nMenos de [PRECO] en PDF descargable. Comenta "[PALAVRA]" y te paso el enlace aquí!',
          'Dato para agilizar los pedidos de esta semana: descargué este kit de moldes/patrones listos y armé 3 piezas en el tiempo de 1!\n\nNo dejo link aquí para cuidar el grupo — comenta "[PALAVRA]" y te respondo con la página 👇',
        ],
        replyTemplates: [
          '¡Hola! 😊 Aquí es donde conseguí el paquete completo de moldes: [PRESELL_LINK]',
          '¡Te lo paso! Aquí puedes ver todos los diseños incluidos en el pack: [PRESELL_LINK] ✂️',
          'Aquí está el enlace con descarga inmediata en PDF tamaño real: [PRESELL_LINK]',
        ],
        groupSearchQueries: [
          { label: 'Papelería Creativa', query: 'papelería creativa moldes cajitas imprimir', tip: 'Súper activo en México, Colombia y Perú.' },
          { label: 'Amigurumi y Crochet', query: 'amigurumi crochet patrones paso a paso', tip: 'Miles de comentarios cuando muestras foto real.' },
          { label: 'Manualidades en Fieltro / Foami', query: 'manualidades foami goma eva moldes', tip: 'Gran demanda escolar y fiestas.' },
          { label: 'Costura Creativa', query: 'costura creativa moldes bolsos neceser', tip: 'Emprendedoras que compran moldes cada mes.' },
          { label: 'Toppers y Fiestas', query: 'toppers torta papelería archivos editables', tip: 'Compra rápida por urgencia de pedidos.' },
          { label: 'Emprendedoras Manualidades', query: 'emprendedoras manualidades artesanías vender', tip: 'Buscan productos que les ahorren horas.' },
        ],
        goodGroupSignals: [
          'Artesanas pidiendo patrones o moldes en los comentarios',
          'Grupos activos de Foami, Crochet, Costura o Papelería Creativa',
          'Fotos reales de trabajos hechos por los miembros',
        ],
        avoidGroupSignals: [
          'Grupos de spam donde nadie comenta',
          'Grupos genéricos de "Gana dinero rápido"',
        ],
        naturalSheetTitle: 'MOLDES LISTOS A TAMAÑO REAL (A4)',
        naturalSheetSubtitle: 'Imprime, Recorta y Acelera tus Pedidos',
        naturalSheetItems: [
          '• Patrones vectorizados listos en hoja A4 / Carta',
          '• Medidas exactas y guía paso a paso visual',
          '• Lista de materiales y cálculo de precio de venta',
          '• Diseños más pedidos durante todo el año',
          '• Descarga inmediata en PDF para usar siempre',
        ],
        naturalSheetFooter: 'Kit Completo para Artesanas • PDF Instantáneo',
        naturalDeskStyle: 'craft_pattern',
      },
    },
  },

  planilhas: {
    id: 'planilhas',
    emoji: '📊',
    label: 'Planilhas Práticas (Finanças, Precificação Confeitaria/Marmita, MEI)',
    shortLabel: 'Planilhas Práticas',
    priceRangeBr: 'R$ 19,90 – R$ 39',
    priceRangeGlobal: '$12 – $29 USD',
    whyItSells:
      'Resolve uma dor chata e urgente (não saber quanto cobrar nem para onde vai o dinheiro) sem pagar mensalidade de aplicativo.',
    packs: {
      pt: {
        defaultKeyword: 'EU QUERO',
        defaultPriceExample: 'R$ 29,90',
        defaultProductHint: 'Planilha Automática Pronta (Precificação / Fluxo de Caixa / Finanças — Sem Mensalidade)',
        postTemplates: [
          'Gente, eu achava que estava tendo lucro nas vendas até colocar meus custos nessa planilha automática — levei um susto e já ajustei meus preços hoje mesmo! 😅\n\nEla calcula tudo sozinha (sem mensalidade, paguei menos de [PRECO] uma única vez). Quem quiser o link, comenta "[PALAVRA]" que eu passo 👇',
          'Para quem cansou de pagar mensalidade de app caro ou anotar tudo no caderninho e nunca fechar a conta: essa planilha pronta funciona no celular e no PC e já mostra lucro real na hora.\n\nSaiu menos de [PRECO]. Se quiser ver como ela funciona, comenta "[PALAVRA]" que eu respondo!',
          'Organizei todo o meu mês financeiro e precificação em 15 minutos com essa planilha simples (até quem não entende nada de Excel consegue usar).\n\nNão vou deixar link no post para não sujar o grupo — comenta "[PALAVRA]" que eu te mando o link 👇',
        ],
        replyTemplates: [
          'Oi! Claro 😊 Peguei a planilha pronta nesta página aqui (sem mensalidade): [PRESELL_LINK]',
          'Aqui está o link para você ver os prints dela por dentro e o vídeo rápido: [PRESELL_LINK] 📊',
          'Te passei aqui! Funciona no Excel e no Google Planilhas no celular: [PRESELL_LINK]',
        ],
        groupSearchQueries: [
          { label: 'Confeiteiras e Bolos', query: 'confeiteiras precificação bolos doces', tip: 'Dor gigante: não saber cobrar certo.' },
          { label: 'Marmitaria / Delivery', query: 'marmitaria delivery dicas gestão vendas', tip: 'Donos precisam controlar custo de ingrediente.' },
          { label: 'MEI e Pequenos Negócios', query: 'MEI empreendedores pequenos negócios dicas', tip: 'Buscam controle simples sem pagar mensalidade.' },
          { label: 'Manicures / Salão / Estética', query: 'manicures cabeleireiras gestão salão agenda', tip: 'Excelente conversão para controle financeiro.' },
          { label: 'Finanças Pessoais e Dívidas', query: 'educação financeira sair das dívidas organização', tip: 'Alta dor mensal no início/fim do mês.' },
          { label: 'Motoristas de App (Uber/99)', query: 'motoristas aplicativo controle ganhos gastos', tip: 'Adoram planilhas prontas de lucro real por km.' },
        ],
        goodGroupSignals: [
          'Empreendedores perguntando "quanto vocês cobram por...?" ou "como controlam o caixa?"',
          'Grupos de nicho real (Confeitaria, Salão, MEI, Motoristas, Finanças)',
          'Discussões reais com comentários humanos',
        ],
        avoidGroupSignals: [
          'Grupos de "Marketing Digital / Renda Extra / Afiliados"',
          'Grupos abandonados sem moderação',
        ],
        naturalSheetTitle: 'CONTROLE FINANCEIRO & PRECIFICAÇÃO AUTOMÁTICA',
        naturalSheetSubtitle: 'Funciona no Excel e no Celular • Pagamento Único (Sem Mensalidade)',
        naturalSheetItems: [
          '• Cadastro de ingredientes/custos → preço ideal calculado na hora',
          '• Entradas x Saídas com alerta automático de lucro real',
          '• Meta diária e mensal com barra visual de progresso',
          '• Fechamento do mês em 1 clique — zero fórmulas para decorar',
          '• Acompanha vídeo rápido de 3 minutos ensinando a usar',
        ],
        naturalSheetFooter: 'Planilha Pronta Editável • Excel & Google Sheets',
        naturalDeskStyle: 'spreadsheet_desk',
      },
      en: {
        defaultKeyword: 'SHEET',
        defaultPriceExample: '$15',
        defaultProductHint: 'Plug-and-Play Pricing & Budget Spreadsheet (Excel + Google Sheets — One-Time)',
        postTemplates: [
          'Honest moment: I thought I was making good profit until I plugged my costs into this automatic spreadsheet and spotted where money was leaking! 😅\n\nWorks in Google Sheets & Excel with zero monthly subscription (under [PRECO] one-time). Comment "[PALAVRA]" if you want the link 👇',
          'For anyone tired of paying $20/month for complicated budgeting or pricing apps: this simple plug-and-play spreadsheet calculates profit margins & monthly cashflow automatically.\n\nWas under [PRECO]. Comment "[PALAVRA]" and I will drop the page in the replies!',
          'Finally organized our monthly budget & side-hustle pricing in 15 minutes using this beginner-friendly spreadsheet (zero Excel skills needed).\n\nKeeping links out of the main post — comment "[PALAVRA]" if you want to check it out 👇',
        ],
        replyTemplates: [
          'Here you go! 😊 You can preview all tabs and grab it here (no monthly fee): [PRESELL_LINK]',
          'Happy to share! Works on both phone (Google Sheets) and laptop: [PRESELL_LINK] 📊',
          'Here is the exact page with screenshots of how it works: [PRESELL_LINK]',
        ],
        groupSearchQueries: [
          { label: 'Home Bakers & Cake Pricing', query: 'home bakers cake pricing business tips', tip: 'Huge daily pain point around pricing.' },
          { label: 'Small Business & Side Hustle', query: 'small business owners bookkeeping tips', tip: 'Hates recurring SaaS subscriptions.' },
          { label: 'Budgeting & Debt-Free Moms', query: 'budgeting debt free family finances', tip: 'Massive engagement every payday.' },
          { label: 'Etsy & Handmade Pricing', query: 'etsy sellers pricing profit calculator', tip: 'Instant buyer fit.' },
          { label: 'Freelancers & Cleaners', query: 'cleaning business owners tips pricing', tip: 'Underserved high-intent niche.' },
          { label: 'Airbnb / Rental Expense', query: 'personal budget spreadsheet google sheets', tip: 'Already searching for templates.' },
        ],
        goodGroupSignals: [
          'Members asking "how much should I charge?" or "what spreadsheet do you use?"',
          'Niche small-business or family-budget groups with active Q&A',
          'Zero-spam moderation where genuine helpful comments stand out',
        ],
        avoidGroupSignals: [
          'Groups full of crypto/affiliate spam',
          'Inactive groups with no recent discussions',
        ],
        naturalSheetTitle: 'AUTOMATIC PROFIT & BUDGET PLANNER',
        naturalSheetSubtitle: 'Google Sheets & Excel • One-Time Download (No Monthly Fee)',
        naturalSheetItems: [
          '• Enter costs once → instant selling price & profit margin',
          '• Monthly income vs. expenses dashboard updated automatically',
          '• Daily & weekly cashflow tracker readable on your phone',
          '• Zero complex formulas — beginner-friendly setup in 5 mins',
          '• Includes quick 3-minute walkthrough guide',
        ],
        naturalSheetFooter: 'Instant Spreadsheet Template • Excel & Google Sheets',
        naturalDeskStyle: 'spreadsheet_desk',
      },
      es: {
        defaultKeyword: 'PLANTILLA',
        defaultPriceExample: '$14 USD',
        defaultProductHint: 'Plantilla Automática de Costos, Precios y Finanzas (Excel + Google Sheets)',
        postTemplates: [
          'Siendo sincero, creía que estaba ganando bien hasta que cargué mis costos en esta plantilla automática y vi dónde se iba la plata 😅\n\nCalcula todo sola (sin mensualidades, cuesta menos de [PRECO] un solo pago). Si alguien quiere el enlace, comenta "[PALAVRA]" 👇',
          'Para quienes están cansados de pagar apps caras cada mes o anotar todo en cuadernos: esta plantilla funciona en el celular y PC y te muestra tu ganancia real al instante.\n\nMenos de [PRECO]. Comenta "[PALAVRA]" y te respondo con la página!',
          'Organicé mis finanzas y precios de venta en 15 minutos con esta hoja lista (sirve aunque no sepas nada de Excel).\n\nNo pongo enlace en el post para respetar el grupo — comenta "[PALAVRA]" y te lo paso 👇',
        ],
        replyTemplates: [
          '¡Claro! 😊 Aquí puedes ver cómo funciona por dentro (pago único sin mensualidad): [PRESELL_LINK]',
          '¡Aquí la tienes! Funciona en Excel y Google Sheets desde el celular: [PRESELL_LINK] 📊',
          'Te dejo el enlace exacto con los detalles y descarga inmediata: [PRESELL_LINK]',
        ],
        groupSearchQueries: [
          { label: 'Repostería y Costos', query: 'repostería pastelería costos precios venta', tip: 'Dolor diario de miles de emprendedoras.' },
          { label: 'Emprendedores y Negocios', query: 'emprendedores pequeños negocios finanzas ventas', tip: 'Buscan orden sin pagar mensualidades.' },
          { label: 'Finanzas Personales', query: 'finanzas personales ahorrar salir de deudas', tip: 'Alta interacción todo el mes.' },
          { label: 'Salones y Estética', query: 'manicuristas peluquería gestión negocio', tip: 'Muy buena conversión para control de caja.' },
          { label: 'Comida / Viandas Venta', query: 'emprendimiento comida viandas costos', tip: 'Necesitan calcular costo por porción.' },
          { label: 'Excel y Plantillas', query: 'plantillas excel emprendedores negocios', tip: 'Intención de compra directa.' },
        ],
        goodGroupSignals: [
          'Emprendedores preguntando cómo calcular costos o controlar ingresos',
          'Comunidades activas de Repostería, Estética, Negocios o Finanzas',
          'Comentarios reales de personas buscando soluciones prácticas',
        ],
        avoidGroupSignals: [
          'Grupos de "Gana dinero sin invertir" o puro spam',
          'Grupos donde nadie responde los posts',
        ],
        naturalSheetTitle: 'CONTROL FINANCIERO Y COSTOS AUTOMÁTICO',
        naturalSheetSubtitle: 'Excel y Google Sheets (Celular) • Pago Único Sin Mensualidad',
        naturalSheetItems: [
          '• Ingresas tus costos → calcula el precio ideal y ganancia real',
          '• Ingresos vs. Gastos con resumen visual automático',
          '• Meta semanal y mensual fácil de ver en el celular',
          '• Sin fórmulas complicadas — lista para usar en 5 minutos',
          '• Incluye guía rápida paso a paso',
        ],
        naturalSheetFooter: 'Plantilla Lista Editable • Descarga Inmediata',
        naturalDeskStyle: 'spreadsheet_desk',
      },
    },
  },
};

export function buildFacebookGroupSearchUrl(query: string): string {
  return `https://www.facebook.com/search/groups/?q=${encodeURIComponent(query)}`;
}

export function slugifyTrackingTag(raw: string, maxLen = 28): string {
  return String(raw || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, maxLen) || 'grupo';
}

export function buildRealPhotoTrackedPresellUrl(
  presellUrl: string,
  trackingParamName: string,
  nicheId: RealPhotoNicheId,
  lang: RealPhotoLang,
  groupNameOrSlug?: string
): string {
  const rawBase = (presellUrl || 'https://global-sell-beta.vercel.app/').trim();
  const safeBase = /^https?:\/\//i.test(rawBase) ? rawBase : `https://${rawBase}`;
  const groupTag = groupNameOrSlug ? `_${slugifyTrackingTag(groupNameOrSlug, 20)}` : '';
  const trackVal = `fb_com_${nicheId}_${lang}${groupTag}`;

  try {
    const parsed = new URL(safeBase);
    parsed.searchParams.set('utm_source', 'facebook_groups');
    parsed.searchParams.set('utm_medium', 'foto_real_comentario');
    parsed.searchParams.set('utm_campaign', `${nicheId}_${lang}`);
    if (trackingParamName && trackingParamName !== 'utm_source') {
      parsed.searchParams.set(trackingParamName, trackVal);
    } else {
      parsed.searchParams.set('sub2', trackVal);
    }
    return parsed.toString();
  } catch {
    const sep = safeBase.includes('?') ? '&' : '?';
    return `${safeBase}${sep}utm_source=facebook_groups&utm_medium=foto_real_comentario&sub2=${encodeURIComponent(trackVal)}`;
  }
}

export function stripAllUrlsFromPostBody(text: string): string {
  return String(text || '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/www\.\S+/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function hydrateTemplateText(
  template: string,
  keyword: string,
  priceText: string
): string {
  return template
    .replace(/\[PALAVRA\]/g, (keyword || 'EU QUERO').trim().toUpperCase())
    .replace(/\[PRECO\]/g, (priceText || 'R$ 24,90').trim());
}

export function createDefaultRealPhotoConfig(
  nicheId: RealPhotoNicheId = 'pedagogia_tdah',
  lang: RealPhotoLang = 'pt',
  offerPriceText?: string
): RealPhotoCommentConfig {
  const pack = REAL_PHOTO_NICHES[nicheId].packs[lang];
  const priceLabel = offerPriceText?.trim() || pack.defaultPriceExample;
  return {
    nicheId,
    lang,
    keyword: pack.defaultKeyword,
    postText: hydrateTemplateText(pack.postTemplates[0], pack.defaultKeyword, priceLabel),
    replyText: pack.replyTemplates[0],
    variationIndex: 0,
    replyVariationIndex: 0,
    updatedAt: Date.now(),
  };
}

export interface AudienceQualityReport {
  score: 'excellent' | 'attention' | 'warning';
  headline: string;
  details: string;
  authorizedCount: number;
  totalCount: number;
  spamNameCount: number;
}

const SPAM_GROUP_REGEX =
  /(renda\s*extra|ganhar\s*dinheiro|divulgue|anuncie|marketing\s*digital|afiliad|make\s*money|work\s*from\s*home|promote\s*your|gana\s*dinero)/i;

export function analyzeAudienceQualityForRealPhoto(
  audienceName: string,
  groups: Array<{ name: string; membershipStatus?: string; membersCount?: number }>
): AudienceQualityReport {
  const totalCount = groups.length;
  const authorizedCount = groups.filter((g) => g.membershipStatus === 'authorized').length;
  const spamNameCount = groups.filter((g) => SPAM_GROUP_REGEX.test(g.name || '')).length;
  const audienceLooksSpam = SPAM_GROUP_REGEX.test(audienceName || '');

  if (totalCount === 0) {
    return {
      score: 'warning',
      headline: 'Nenhum grupo ativo selecionado neste público',
      details: 'Use o Buscador Guiado na subaba "Foto Real + Comentário" e salve grupos reais do nicho em 03. Triagem & Públicos.',
      authorizedCount,
      totalCount,
      spamNameCount,
    };
  }

  if (audienceLooksSpam || spamNameCount > Math.ceil(totalCount * 0.4)) {
    return {
      score: 'warning',
      headline: 'Atenção: Público com cara de "Renda Extra / Divulgação"',
      details: `${spamNameCount} de ${totalCount} grupo(s) parecem de renda extra/spam (onde quase ninguém compra). Para o método Foto Real + Comentário converter, troque para um público do nicho exato (ex.: Mães/TDAH, Receitas, Artesanato ou Planilhas).`,
      authorizedCount,
      totalCount,
      spamNameCount,
    };
  }

  if (authorizedCount < Math.min(3, totalCount)) {
    return {
      score: 'attention',
      headline: `Público do nicho ok, mas só ${authorizedCount} grupo(s) autorizado(s)`,
      details: 'Priorize entrar e verificar aceites em 03. Triagem & Públicos para disparar em "Somente Autorizados" sem risco de bloqueio.',
      authorizedCount,
      totalCount,
      spamNameCount,
    };
  }

  return {
    score: 'excellent',
    headline: `Excelente aderência: ${authorizedCount} grupo(s) autorizado(s) no nicho`,
    details: 'Público limpo e alinhado ao método Foto Real + Comentário. Poste SEM link e responda quem comentar com seu link Presell rastreado!',
    authorizedCount,
    totalCount,
    spamNameCount,
  };
}

/**
 * Generates a natural-looking "printed sheet / desk photo" locally on HTML5 Canvas.
 * Intentionally avoids flashy ad badges or loud promotional gradients so it looks
 * like a genuine person sharing a helpful resource on a desk/table.
 */
export function generateNaturalDeskPhotoSync(params: {
  nicheId: RealPhotoNicheId;
  lang: RealPhotoLang;
  customTitle?: string;
  customSubtitle?: string;
}): string {
  if (typeof document === 'undefined') return '';
  try {
    const pack = REAL_PHOTO_NICHES[params.nicheId].packs[params.lang];
    const width = 1080;
    const height = 1080;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // 1. Warm natural desk surface (wood / linen tone depending on niche)
    const deskGradients: Record<NicheTemplatePack['naturalDeskStyle'], [string, string, string]> = {
      paper_worksheet: ['#e6d5c3', '#d7bfa8', '#c6aa90'],
      recipe_card: ['#e9dfd1', '#dfd0bc', '#cebba3'],
      craft_pattern: ['#ebe3da', '#ddd2c5', '#cfc1b1'],
      spreadsheet_desk: ['#dce2e8', '#cfd7df', '#bfc9d3'],
    };
    const [c1, c2, c3] = deskGradients[pack.naturalDeskStyle];
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, c1);
    bgGrad.addColorStop(0.5, c2);
    bgGrad.addColorStop(1, c3);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle desk wood / linen texture lines
    ctx.save();
    ctx.strokeStyle = 'rgba(90, 68, 48, 0.06)';
    ctx.lineWidth = 2;
    for (let y = 18; y < height; y += 26) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(width * 0.33, y + (y % 52 === 0 ? 5 : -4), width * 0.66, y - 3, width, y + 2);
      ctx.stroke();
    }
    ctx.restore();

    // Soft daylight window glow from top-left
    const lightGrad = ctx.createRadialGradient(180, 140, 40, 260, 220, 760);
    lightGrad.addColorStop(0, 'rgba(255, 252, 245, 0.42)');
    lightGrad.addColorStop(1, 'rgba(255, 252, 245, 0)');
    ctx.fillStyle = lightGrad;
    ctx.fillRect(0, 0, width, height);

    const drawWrappedText = (
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      lineHeight: number,
      maxLines = 3
    ): number => {
      const words = text.split(/\s+/);
      let line = '';
      let currentY = y;
      let linesDrawn = 0;
      for (let i = 0; i < words.length; i++) {
        const testLine = line ? `${line} ${words[i]}` : words[i];
        if (ctx.measureText(testLine).width > maxWidth && line) {
          ctx.fillText(line, x, currentY);
          line = words[i];
          currentY += lineHeight;
          linesDrawn += 1;
          if (linesDrawn >= maxLines - 1) break;
        } else {
          line = testLine;
        }
      }
      if (line) {
        ctx.fillText(line, x, currentY);
        currentY += lineHeight;
      }
      return currentY;
    };

    // 2. Back sheet (slightly tilted left — gives real physical stack feel)
    ctx.save();
    ctx.translate(width * 0.48, height * 0.52);
    ctx.rotate(-0.075);
    ctx.shadowColor = 'rgba(30, 24, 18, 0.20)';
    ctx.shadowBlur = 32;
    ctx.shadowOffsetX = 8;
    ctx.shadowOffsetY = 14;
    ctx.fillStyle = '#f8f6f0';
    ctx.fillRect(-345, -420, 690, 840);
    ctx.restore();

    // Decorative back-sheet ruled lines
    ctx.save();
    ctx.translate(width * 0.48, height * 0.52);
    ctx.rotate(-0.075);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = 2;
    for (let ly = -320; ly <= 360; ly += 42) {
      ctx.beginPath();
      ctx.moveTo(-290, ly);
      ctx.lineTo(290, ly);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Front main sheet (gently tilted right — hero printed page)
    ctx.save();
    ctx.translate(width * 0.52, height * 0.50);
    ctx.rotate(0.025);
    ctx.shadowColor = 'rgba(25, 20, 15, 0.26)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetX = 10;
    ctx.shadowOffsetY = 18;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-360, -430, 720, 860);
    ctx.shadowColor = 'transparent';

    // Subtle paper border & top accent strip (calm editorial color, NOT loud ad banner)
    const accentByStyle: Record<NicheTemplatePack['naturalDeskStyle'], string> = {
      paper_worksheet: '#0f766e',
      recipe_card: '#b45309',
      craft_pattern: '#9d174d',
      spreadsheet_desk: '#1d4ed8',
    };
    const accent = accentByStyle[pack.naturalDeskStyle];

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.strokeRect(-332, -402, 664, 804);

    // Top thin header line
    ctx.fillStyle = accent;
    ctx.fillRect(-332, -402, 664, 14);

    // Subtle hole-punch / binder dots on left margin for authentic printed feel
    ctx.fillStyle = '#e2d7c9';
    [-250, 0, 250].forEach((py) => {
      ctx.beginPath();
      ctx.arc(-346, py, 9, 0, Math.PI * 2);
      ctx.fill();
    });

    // Header Title
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 34px Georgia, "Times New Roman", serif';
    const title = (params.customTitle || pack.naturalSheetTitle).toUpperCase();
    let cursorY = drawWrappedText(title, -295, -330, 590, 42, 2);

    // Subtitle
    ctx.fillStyle = accent;
    ctx.font = '600 22px system-ui, -apple-system, sans-serif';
    cursorY = drawWrappedText(params.customSubtitle || pack.naturalSheetSubtitle, -295, cursorY + 4, 590, 30, 2);

    // Divider
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-295, cursorY + 8);
    ctx.lineTo(295, cursorY + 8);
    ctx.stroke();

    cursorY += 46;

    // Niche-specific authentic visual block inside the printed sheet
    if (pack.naturalDeskStyle === 'spreadsheet_desk') {
      // Draw a crisp clean mini spreadsheet table preview
      const cols = [-295, -20, 125, 295];
      const rowH = 54;
      const rows =
        params.lang === 'pt'
          ? [
              ['Item / Descrição', 'Custo', 'Venda'],
              ['Produto Principal', 'R$ 18,40', 'R$ 54,00'],
              ['Embalagem + Taxas', 'R$ 4,20', 'Margem 58%'],
              ['Lucro Real Líquido', '—', '+ R$ 31,40'],
            ]
          : params.lang === 'es'
          ? [
              ['Concepto', 'Costo', 'Precio'],
              ['Producto Base', '$6.50', '$19.90'],
              ['Empaque + Envío', '$1.80', 'Margen 58%'],
              ['Ganancia Neta', '—', '+ $11.60'],
            ]
          : [
              ['Item / Line', 'Cost', 'Price'],
              ['Core Product', '$7.40', '$24.00'],
              ['Packaging + Fees', '$2.10', 'Margin 60%'],
              ['Net Real Profit', '—', '+ $14.50'],
            ];

      rows.forEach((r, rIdx) => {
        const ry = cursorY + rIdx * rowH;
        ctx.fillStyle = rIdx === 0 ? '#eff6ff' : rIdx === rows.length - 1 ? '#ecfdf5' : '#ffffff';
        ctx.fillRect(cols[0], ry, cols[3] - cols[0], rowH);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cols[0], ry, cols[3] - cols[0], rowH);
        for (let c = 1; c < cols.length - 1; c++) {
          ctx.beginPath();
          ctx.moveTo(cols[c], ry);
          ctx.lineTo(cols[c], ry + rowH);
          ctx.stroke();
        }
        ctx.fillStyle = rIdx === rows.length - 1 ? '#047857' : '#1e293b';
        ctx.font = rIdx === 0 || rIdx === rows.length - 1 ? 'bold 21px system-ui, sans-serif' : '500 20px system-ui, sans-serif';
        ctx.fillText(r[0], cols[0] + 14, ry + 34);
        ctx.fillText(r[1], cols[1] + 14, ry + 34);
        ctx.fillText(r[2], cols[2] + 14, ry + 34);
      });
      cursorY += rows.length * rowH + 34;
    }

    // Printed checklist / activity / recipe lines
    pack.naturalSheetItems.forEach((item, idx) => {
      if (cursorY > 315) return;
      // Clean checkbox / bullet square
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-295, cursorY - 21, 24, 24);
      if (idx === 0 || idx === 1) {
        // Hand-drawn check mark on first two items (makes it feel genuinely used!)
        ctx.beginPath();
        ctx.moveTo(-290, cursorY - 9);
        ctx.lineTo(-283, cursorY - 2);
        ctx.lineTo(-273, cursorY - 17);
        ctx.strokeStyle = '#16a34a';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      ctx.fillStyle = '#334155';
      ctx.font = '500 23px system-ui, -apple-system, sans-serif';
      cursorY = drawWrappedText(item.replace(/^[•\d.]+\s*/, ''), -255, cursorY, 545, 31, 2) + 18;
    });

    // Handwritten-style sticky note in bottom right corner (authentic organic photo touch!)
    ctx.save();
    ctx.translate(185, 295);
    ctx.rotate(-0.06);
    ctx.shadowColor = 'rgba(0,0,0,0.14)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-120, -68, 240, 136);
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#713f12';
    ctx.font = 'bold 22px "Comic Sans MS", cursive, sans-serif';
    const noteLine1 =
      params.lang === 'pt'
        ? 'Pronto p/ usar!'
        : params.lang === 'es'
        ? '¡Listo para usar!'
        : 'Ready to print!';
    const noteLine2 =
      params.lang === 'pt'
        ? 'Salvou minha semana ♥'
        : params.lang === 'es'
        ? '¡Ahorra horas! ♥'
        : 'Saved me hours ♥';
    ctx.fillText(noteLine1, -96, -12);
    ctx.font = '600 19px "Comic Sans MS", cursive, sans-serif';
    ctx.fillText(noteLine2, -96, 26);
    ctx.restore();

    // Footer text on printed sheet
    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 19px Georgia, serif';
    ctx.fillText(pack.naturalSheetFooter, -295, 372);

    ctx.restore();

    // 4. Natural wooden pencil resting along right edge (realism detail)
    ctx.save();
    ctx.translate(935, 620);
    ctx.rotate(0.18);
    ctx.shadowColor = 'rgba(0,0,0,0.22)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetX = 6;
    ctx.shadowOffsetY = 8;
    // Pencil body
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-13, -240, 26, 420);
    // Wood tip
    ctx.beginPath();
    ctx.moveTo(-13, -240);
    ctx.lineTo(13, -240);
    ctx.lineTo(0, -286);
    ctx.closePath();
    ctx.fillStyle = '#f3d5b5';
    ctx.fill();
    // Graphite point
    ctx.beginPath();
    ctx.moveTo(-4, -271);
    ctx.lineTo(4, -271);
    ctx.lineTo(0, -286);
    ctx.closePath();
    ctx.fillStyle = '#334155';
    ctx.fill();
    // Ferrule + pink eraser
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-13, 180, 26, 22);
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(-13, 202, 26, 28);
    ctx.restore();

    return canvas.toDataURL('image/jpeg', 0.9);
  } catch {
    return '';
  }
}
