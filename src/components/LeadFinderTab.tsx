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
} from 'lucide-react';
import { Campaign } from '../types';

interface LeadFinderTabProps {
  campaigns: Campaign[];
}

export const LeadFinderTab: React.FC<LeadFinderTabProps> = ({ campaigns }) => {
  const [activeNicheTab, setActiveNicheTab] = useState<'pedagogia' | 'milhas'>('pedagogia');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedProfileIndex, setSelectedProfileIndex] = useState(0);

  const myWhatsApp = '5541998778348';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Target profiles for Pedagogia / Psicopedagogia / Autismo
  const targetProfilesPedagogia = [
    {
      handle: '@redepedagogica',
      name: 'Rede Pedagógica',
      url: 'https://www.instagram.com/redepedagogica/',
      audience: '1.3M seguidoras',
      focus: 'Maior comunidade de professoras e pedagogas do Brasil',
      whatToLook: 'Abra os posts sobre "atividades para sala de aula" e "inclusão escolar". Os comentários estão cheios de professoras cansadas pedindo ideias prontas.',
      script: `Oi profe! Vi que você comentou lá no post procurando atividades adaptadas... se você quiser economizar tempo, eu tenho um pacote com + 100 tarefinhas lúdicas em PDF prontas para imprimir, inclusive para crianças com autismo/TEA. Deixei a amostra aqui: https://robo-trafego.vercel.app/?p=tarefinhas&src=outreach_direct`,
    },
    {
      handle: '@taiseagostini',
      name: 'Taise Agostini',
      url: 'https://www.instagram.com/taiseagostini/',
      audience: '1.8M seguidoras',
      focus: 'Educação Infantil, recursos lúdicos e alfabetização',
      whatToLook: 'Professoras pedindo moldes e atividades de coordenação motora e vogais.',
      script: `Olá! Vi seu comentário no post da Taise sobre atividades lúdicas. Desenvolvi um kit com mais de 100 tarefinhas em PDF prontas para imprimir para Educação Infantil e crianças atípicas. Dá uma olhada aqui se ajudar: https://robo-trafego.vercel.app/?p=tarefinhas&src=outreach_direct`,
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
      whatToLook: 'Mães desabafando sobre a dificuldade de fazer a criança fazer lição de casa ou prestar atenção.',
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
  ];

  // Target competitor profiles for Milhas
  const targetProfilesMilhas = [
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
  ];

  const currentProfiles =
    activeNicheTab === 'pedagogia' ? targetProfilesPedagogia : targetProfilesMilhas;

  // Tracked Links for Pedagogia
  const trackedLinksPedagogia = [
    {
      id: 'link-tarefas-replyrush',
      label: 'Link para o ReplyRush (Direct Automático do Instagram)',
      url: 'https://robo-trafego.vercel.app/?p=tarefinhas&src=replyrush',
      desc: 'Use esta URL na mensagem automática do ReplyRush para quem comentar "EU QUERO" no seu post.',
    },
    {
      id: 'link-tarefas-pinterest',
      label: 'Link para Pins do Pinterest (Tráfego Orgânico Passivo)',
      url: 'https://robo-trafego.vercel.app/?p=tarefinhas&src=pinterest',
      desc: 'O Pinterest é a maior fonte de pedagogas buscando "atividades autismo para imprimir" do Brasil!',
    },
    {
      id: 'link-tarefas-hotmart',
      label: 'Link Direto de Pagamento Hotmart (R$ 37,00)',
      url: 'https://pay.hotmart.com/U95248783T',
      desc: 'Link seguro do checkout da Hotmart para o cliente passar o Pix ou cartão com download imediato.',
    },
    {
      id: 'link-tarefas-whatsapp',
      label: 'Link do seu WhatsApp com Mensagem de Tarefinhas',
      url: `https://wa.me/${myWhatsApp}?text=${encodeURIComponent(
        'Olá! Vi o material de 100 Tarefinhas de Educação Infantil e Autismo e gostaria de tirar uma dúvida pedagógica!'
      )}`,
      desc: 'Abre a conversa direto no seu WhatsApp (41) 99877-8348.',
    },
  ];

  // Tracked Links for Milhas
  const trackedLinksMilhas = [
    {
      id: 'link-milhas-replyrush',
      label: 'Link para o ReplyRush (Milhas)',
      url: 'https://robo-trafego.vercel.app/?p=milhas&src=replyrush',
      desc: 'Dispara no direct para quem comentar "MILHAS" no seu post.',
    },
    {
      id: 'link-milhas-eduzz',
      label: 'Checkout Eduzz Milhas (R$ 385,00)',
      url: 'https://chk.eduzz.com/39ZEGY8198',
      desc: 'Página de pagamento oficial da Eduzz.',
    },
  ];

  const currentTrackedLinks =
    activeNicheTab === 'pedagogia' ? trackedLinksPedagogia : trackedLinksMilhas;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-800/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>MÁQUINA PRÁTICA DE ATRAÇÃO DE PESSOAS</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Como Achar Pessoas Reais e Fazer Suas Primeiras Vendas
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Selecione a campanha abaixo para ver exatamente onde os compradores estão reunidos agora no Instagram e Pinterest, e use o <strong className="text-emerald-400">ReplyRush</strong> para vender no piloto automático!
          </p>

          {/* Niche Selector Tabs */}
          <div className="pt-2 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setActiveNicheTab('pedagogia');
                setSelectedProfileIndex(0);
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
                activeNicheTab === 'pedagogia'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Heart className="w-4 h-4 fill-current" />
              <span>+ 100 Tarefinhas Educação Infantil & Autismo (Hotmart)</span>
            </button>

            <button
              onClick={() => {
                setActiveNicheTab('milhas');
                setSelectedProfileIndex(0);
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
                activeNicheTab === 'milhas'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Comunidade Milhas 3.0 (Eduzz)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Special Box for Tarefinhas Autismo */}
      {activeNicheTab === 'pedagogia' && (
        <div className="bg-gradient-to-r from-emerald-950/70 to-slate-900 border border-emerald-700/50 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-xl">
          <div className="w-32 shrink-0 rounded-2xl overflow-hidden border border-emerald-500/40 shadow-lg">
            <img
              src="/assets/aistudio/image_e9e67204.png"
              alt="Capa do eBook Tarefinhas"
              className="w-full h-auto"
            />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase">
                Validação Imediata
              </span>
              <span className="text-xs text-slate-400">ID Hotmart: 4464330</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Por que esse produto é o mais fácil de vender para validar o robô hoje?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              O produto custa apenas <strong className="text-emerald-400">R$ 37,00</strong>. É uma compra por impulso! Professoras e mães de crianças com autismo gastam horas no fim de semana criando atividades; pagar R$ 37 para receber 100 tarefinhas prontas em PDF para imprimir é um alívio imediato.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 1: Configuração do ReplyRush (Copy & Paste Ready) */}
      <div className="bg-slate-900 border border-indigo-900/60 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 text-xs font-semibold border border-indigo-800/60">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>INTEGRAÇÃO COM REPLYRUSH (AUTO DM)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Sua Mensagem Pronta para o ReplyRush (Auto-DM)
            </h2>
            <p className="text-xs text-slate-400">
              Cole essa mensagem no campo de resposta automática no seu painel do ReplyRush:
            </p>
          </div>

          <a
            href="https://app.replyrush.com/posts?view=list&status=all&page=1"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition shrink-0"
          >
            <span>Abrir ReplyRush</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* ReplyRush DM Template Box */}
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              {activeNicheTab === 'pedagogia'
                ? 'Mensagem que o robô vai enviar para quem comentar "EU QUERO" no post de Tarefinhas:'
                : 'Mensagem que o robô vai enviar para quem comentar "MILHAS":'}
            </span>
            <button
              onClick={() => {
                const text =
                  activeNicheTab === 'pedagogia'
                    ? `Olá, profe/mamãe! 🎨📚 Vi que você comentou querendo as tarefinhas inclusivas para Educação Infantil e Autismo (TEA).\n\nPreparei a página com o material completo pronto para imprimir (mais de 100 atividades lúdicas):\n👉 https://robo-trafego.vercel.app/?p=tarefinhas&src=replyrush\n\nSe tiver qualquer dúvida pedagógica ou sobre os arquivos, pode me chamar direto no meu WhatsApp oficial:\n📲 https://wa.me/5541998778348?text=Oi!%20Vim%20pelo%20Instagram%20das%20tarefinhas%20de%20autismo!`
                    : `Opa! Vi que você comentou no meu post querendo aprender sobre milhas e renda extra. 🚀\n\nCriei uma página explicando o passo a passo exato para você começar:\n👉 https://robo-trafego.vercel.app/?p=milhas&src=replyrush\n\nSe você tiver qualquer dúvida ou quiser falar comigo, pode me chamar direto no meu WhatsApp:\n📲 https://wa.me/5541998778348?text=Oi!%20Vim%20pelo%20Instagram%20e%20quero%20começar%20na%20Comunidade%20Milhas!`;
                copyToClipboard(text, 'copy-replyrush-msg');
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition"
            >
              {copiedId === 'copy-replyrush-msg' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copiado com Sucesso!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Mensagem Pronta</span>
                </>
              )}
            </button>
          </div>

          <pre className="text-xs text-slate-300 font-mono bg-slate-900/90 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap leading-relaxed">
            {activeNicheTab === 'pedagogia'
              ? `Olá, profe/mamãe! 🎨📚 Vi que você comentou querendo as tarefinhas inclusivas para Educação Infantil e Autismo (TEA).

Preparei a página com o material completo pronto para imprimir (mais de 100 atividades lúdicas):
👉 https://robo-trafego.vercel.app/?p=tarefinhas&src=replyrush

Se tiver qualquer dúvida pedagógica ou sobre os arquivos, pode me chamar direto no meu WhatsApp oficial:
📲 https://wa.me/5541998778348?text=Oi!%20Vim%20pelo%20Instagram%20das%20tarefinhas%20de%20autismo!`
              : `Opa! Vi que você comentou no meu post querendo aprender sobre milhas e renda extra. 🚀

Criei uma página explicando o passo a passo exato para você começar sem precisar gastar nada a mais:
👉 https://robo-trafego.vercel.app/?p=milhas&src=replyrush

Se você tiver qualquer dúvida ou quiser falar comigo, pode me chamar direto no meu WhatsApp oficial:
📲 https://wa.me/5541998778348?text=Oi!%20Vim%20pelo%20Instagram%20e%20quero%20começar%20na%20Comunidade%20Milhas!`}
          </pre>
        </div>
      </div>

      {/* SECTION 2: Perfis Alvo onde as Pedagogas e Psicopedagogas estão AGORA */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-semibold border border-emerald-800/60">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>RADAR DE MINERAÇÃO ATIVA NO INSTAGRAM</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {activeNicheTab === 'pedagogia'
              ? 'Perfis Onde Estão Pedagogas, Psicopedagogas e Mães Atípicas'
              : 'Perfis de Milhas com Comentários Quentes'}
          </h2>
          <p className="text-xs text-slate-400">
            Abra os perfis abaixo, olhe os comentários dos últimos posts e encontre pessoas com dúvidas:
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profiles List */}
          <div className="space-y-3">
            {currentProfiles.map((p, idx) => (
              <button
                key={p.handle}
                onClick={() => setSelectedProfileIndex(idx)}
                className={`w-full text-left p-4 rounded-2xl border transition flex items-center justify-between ${
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
            {(() => {
              const current = currentProfiles[selectedProfileIndex] || currentProfiles[0];
              return (
                <>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>{current.name}</span>
                        <span className="text-xs text-slate-400 font-normal">({current.handle})</span>
                      </h3>
                      <p className="text-xs text-emerald-400 mt-0.5">
                        Público-alvo: {current.focus}
                      </p>
                    </div>

                    <a
                      href={current.url}
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
                        {current.whatToLook}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-emerald-300">
                          💬 Script de Abordagem Amigável (Anti-Bloqueio / Sem Venda Agressiva):
                        </h4>
                        <button
                          onClick={() => copyToClipboard(current.script, `copy-script-${selectedProfileIndex}`)}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-semibold flex items-center gap-1"
                        >
                          {copiedId === `copy-script-${selectedProfileIndex}` ? (
                            <span>✅ Copiado!</span>
                          ) : (
                            <span>Copiar Script</span>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 italic bg-slate-950 p-3 rounded-lg border border-slate-800 leading-relaxed">
                        "{current.script}"
                      </p>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* SECTION 3: Pinterest Estratégia de Ouro (Pedagogia) */}
      {activeNicheTab === 'pedagogia' && (
        <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950 border border-red-900/50 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
            <Pin className="w-4 h-4" />
            <span>ESTRATÉGIA DE OURO: PINTEREST ORGÂNICO (ONDE AS PEDAGOGAS BUSCAM)</span>
          </div>
          <h3 className="text-xl font-bold text-white">
            Como Vender Todo Santo Dia no Pinterest Sem Gastar 1 Centavo
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            O Pinterest não é só rede social, é um buscador. Todos os dias, milhares de professoras pesquisam termos para baixar atividades.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-red-300">1. Termos mais buscados:</span>
              <p className="text-slate-400 font-mono text-[11px]">
                #atividadesautismo #educacaoinfantil #pedagogia #atividadesimprimir #alfabetizacao
              </p>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-red-300">2. Imagem do Pin:</span>
              <p className="text-slate-400">
                Use a própria imagem do eBook <code>image_e9e67204.png</code> como capa do seu Pin.
              </p>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-red-300">3. Link de Destino:</span>
              <p className="text-slate-400 break-all font-mono text-[11px]">
                https://robo-trafego.vercel.app/?p=tarefinhas&src=pinterest
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: Links Rastreados UTM */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950 text-purple-300 text-xs font-semibold border border-purple-800/60">
            <Share2 className="w-3.5 h-3.5 text-purple-400" />
            <span>SEUS LINKS RASTREADOS EM TEMPO REAL</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Links Prontos para Usar nos Seus Canais
          </h2>
          <p className="text-xs text-slate-400">
            Cada link abaixo tem uma tag para você ver no Radar de Rastreio exatamente de onde o visitante veio:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentTrackedLinks.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-white">{item.label}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 break-all">
                  {item.url}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(item.url, item.id)}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Link</span>
                    </>
                  )}
                </button>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition"
                  title="Testar Link no Navegador"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
