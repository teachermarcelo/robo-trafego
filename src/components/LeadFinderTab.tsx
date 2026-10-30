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
} from 'lucide-react';
import { Campaign } from '../types';

interface LeadFinderTabProps {
  campaigns: Campaign[];
}

export const LeadFinderTab: React.FC<LeadFinderTabProps> = ({ campaigns }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedProfileIndex, setSelectedProfileIndex] = useState(0);

  const primaryCampaign = campaigns.find((c) => c.id === 'camp-milhas-3') || campaigns[0];
  const myWhatsApp = primaryCampaign?.whatsappNumber || '5541998778348';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Target competitor profiles where thousands of eager buyers ask questions daily
  const targetProfiles = [
    {
      handle: '@passageirodeprimeira',
      name: 'Passageiro de Primeira',
      url: 'https://www.instagram.com/passageirodeprimeira/',
      audience: '680k seguidores',
      focus: 'Cartões Black, Salas VIP e Emissões de Passagens com Milhas',
      whatToLook: 'Abra os posts sobre "Promoção Livelo/Esfera" e olhe os comentários de pessoas perguntando como funciona ou se vale a pena.',
    },
    {
      handle: '@melhoresdestinos',
      name: 'Melhores Destinos',
      url: 'https://www.instagram.com/melhoresdestinos/',
      audience: '3.1M seguidores',
      focus: 'Promoções de passagens e dicas de viagem econômica',
      whatToLook: 'Pessoas reclamando nos comentários que passagens aéreas estão caras. Elas são leads perfeitos para a Comunidade de Milhas!',
    },
    {
      handle: '@pontos_e_milhas',
      name: 'Pontos e Milhas',
      url: 'https://www.instagram.com/pontos_e_milhas/',
      audience: '420k seguidores',
      focus: 'Dicas práticas de cartões e acúmulo no dia a dia',
      whatToLook: 'Pessoas perguntando qual cartão pedir ou como não pagar anuidade.',
    },
    {
      handle: '@estevaopelomundo',
      name: 'Estêvão Pelo Mundo',
      url: 'https://www.instagram.com/estevaopelomundo/',
      audience: '1.4M seguidores',
      focus: 'Estilo de vida, viagens de classe executiva com milhas',
      whatToLook: 'Seguidores maravilhados querendo saber como viajar pagando quase nada de passagem.',
    },
    {
      handle: '@kartao.black',
      name: 'Cartões & Benefícios',
      url: 'https://www.instagram.com/kartao.black/',
      audience: '290k seguidores',
      focus: 'Comparativos de pontuação de cartões de bancos',
      whatToLook: 'Gente com faturas altas querendo transformar pontos em dinheiro.',
    },
  ];

  // Hot tracking links
  const trackedLinks = [
    {
      id: 'link-replyrush',
      label: 'Link para o ReplyRush (Direct Automático do Instagram)',
      url: 'https://robo-trafego.vercel.app/?p=milhas&src=replyrush',
      desc: 'Coloque esta URL dentro da mensagem do ReplyRush que dispara para quem comentar seu post.',
    },
    {
      id: 'link-bio',
      label: 'Link para a Bio do seu Instagram / TikTok',
      url: 'https://robo-trafego.vercel.app/?p=milhas&src=instagram_bio',
      desc: 'Coloque no campo "Site" do seu perfil para quem visitar o seu feed.',
    },
    {
      id: 'link-whatsapp-direct',
      label: 'Link Direto do seu WhatsApp com Mensagem Pronta',
      url: `https://wa.me/${myWhatsApp}?text=${encodeURIComponent(
        'Olá! Vi seu conteúdo sobre milhas e renda extra e quero entender como funciona a Comunidade Milhas 3.0!'
      )}`,
      desc: 'O cliente clica e já abre a conversa no seu telefone (41) 99877-8348 com a mensagem digitada.',
    },
    {
      id: 'link-checkout-eduzz',
      label: 'Link de Checkout Eduzz Direto (R$ 385,00)',
      url: 'https://chk.eduzz.com/39ZEGY8198',
      desc: 'Link de pagamento seguro da Eduzz para quem já está pronto para passar o cartão ou Pix.',
    },
  ];

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
            Como Achar Pessoas Reais e Vender Todos os Dias
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Você não precisa de seguidores para começar. O segredo do tráfego orgânico é ir exatamente onde as pessoas já estão tirando dúvidas sobre milhas e viagens, e usar o <strong className="text-emerald-400">ReplyRush</strong> (Auto-DM) para mandar o seu link no automático!
          </p>
        </div>
      </div>

      {/* 3 Step Workflow Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-800/50">
            1
          </div>
          <h3 className="font-bold text-white text-base">Postar o Gancho Viral</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Pegue um roteiro pronto na aba <strong className="text-emerald-400">Estúdio de Criativos IA</strong> e poste no Reels/TikTok. Termine sempre com: <em>"Comente 'MILHAS' para receber o passo a passo no seu direct"</em>.
          </p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-950 text-indigo-400 font-bold flex items-center justify-center text-sm border border-indigo-800/50">
            2
          </div>
          <h3 className="font-bold text-white text-base">ReplyRush Envia a DM</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            A ferramenta <strong className="text-indigo-400">ReplyRush</strong> (que você favoritou) detecta o comentário e envia imediatamente a sua mensagem com o link da sua página no direct da pessoa.
          </p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-8 h-8 rounded-lg bg-amber-950 text-amber-400 font-bold flex items-center justify-center text-sm border border-amber-800/50">
            3
          </div>
          <h3 className="font-bold text-white text-base">Conversão no WhatsApp</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            A pessoa acessa a página, tira dúvidas no seu WhatsApp <strong className="text-amber-400">(41) 99877-8348</strong> e você fecha a venda de R$ 385,00 na Eduzz com o roteiro do Robô de Vendas!
          </p>
        </div>
      </div>

      {/* SECTION 1: Configuração do ReplyRush (Copy & Paste Ready) */}
      <div className="bg-slate-900 border border-indigo-900/60 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 text-xs font-semibold border border-indigo-800/60">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>INTEGRAÇÃO COM REPLYRUSH (AUTO DM)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Sua Mensagem Automática para o ReplyRush
            </h2>
            <p className="text-xs text-slate-400">
              Copie este texto e cole no campo de resposta automática no seu painel do ReplyRush:
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
              Mensagem que o ReplyRush vai mandar no Direct do cliente:
            </span>
            <button
              onClick={() =>
                copyToClipboard(
                  `Opa! Vi que você comentou no meu post querendo aprender sobre milhas e renda extra. 🚀\n\nCriei uma página explicando o passo a passo exato para você começar sem precisar gastar nada a mais:\n👉 https://robo-trafego.vercel.app/?p=milhas&src=replyrush\n\nSe você tiver qualquer dúvida ou quiser falar comigo, pode me chamar direto no meu WhatsApp oficial:\n📲 https://wa.me/5541998778348?text=Oi!%20Vim%20pelo%20Instagram%20e%20quero%20começar%20na%20Comunidade%20Milhas!`,
                  'copy-replyrush-msg'
                )
              }
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
{`Opa! Vi que você comentou no meu post querendo aprender sobre milhas e renda extra. 🚀

Criei uma página explicando o passo a passo exato para você começar sem precisar gastar nada a mais:
👉 https://robo-trafego.vercel.app/?p=milhas&src=replyrush

Se você tiver qualquer dúvida ou quiser falar comigo, pode me chamar direto no meu WhatsApp oficial:
📲 https://wa.me/5541998778348?text=Oi!%20Vim%20pelo%20Instagram%20e%20quero%20começar%20na%20Comunidade%20Milhas!`}
          </pre>
        </div>
      </div>

      {/* SECTION 2: Onde os Compradores de Milhas Estão AGORA (Radar de Mineração) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-semibold border border-emerald-800/60">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>RADAR DE MINERAÇÃO ATIVA</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Perfis Onde Estão Pessoas com Dúvidas Reais de Milhas
          </h2>
          <p className="text-xs text-slate-400">
            Clique nos perfis abaixo, olhe os comentários dos últimos posts e encontre pessoas perguntando sobre cartões e viagens:
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profiles List */}
          <div className="space-y-3">
            {targetProfiles.map((p, idx) => (
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
              const current = targetProfiles[selectedProfileIndex];
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
                          onClick={() =>
                            copyToClipboard(
                              `Oi! Vi que você comentou lá no post sobre as milhas da Livelo... se você ainda tiver com dúvida, eu tenho um resumo prático de 3 passos mostrando como acumular sem pagar anuidade no cartão. Se você quiser dar uma olhada, tá aqui: https://robo-trafego.vercel.app/?p=milhas&src=outreach_direct`,
                              'copy-script-outreach'
                            )
                          }
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-semibold flex items-center gap-1"
                        >
                          {copiedId === 'copy-script-outreach' ? (
                            <span>✅ Copiado!</span>
                          ) : (
                            <span>Copiar Script</span>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 italic bg-slate-950 p-3 rounded-lg border border-slate-800 leading-relaxed">
                        "Oi! Vi que você comentou lá no post sobre as milhas da Livelo... se você ainda tiver com dúvida, eu tenho um resumo prático de 3 passos mostrando como acumular sem pagar anuidade no cartão. Se você quiser dar uma olhada, tá aqui: https://robo-trafego.vercel.app/?p=milhas&src=outreach_direct"
                      </p>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* SECTION 3: Gerador de Links Rastreados UTM */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950 text-purple-300 text-xs font-semibold border border-purple-800/60">
            <Share2 className="w-3.5 h-3.5 text-purple-400" />
            <span>LINKS RASTREADOS EM TEMPO REAL</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Seus Links Prontos para Usar em Qualquer Lugar
          </h2>
          <p className="text-xs text-slate-400">
            Cada link abaixo tem uma tag para que você veja no <strong className="text-emerald-400">Radar de Rastreio</strong> exatamente de onde a pessoa veio!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trackedLinks.map((item) => (
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

      {/* SECTION 4: Plano de Ação dos Próximos 3 Dias */}
      <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-900/50 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400" />
          <span>Plano de 30 Minutos Diários para Fazer Suas Primeiras Vendas</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
            <span className="font-bold text-emerald-400 text-sm">📅 Dia 1: Ativação</span>
            <p>
              Abra a aba <strong>Estúdio de Criativos</strong>, copie o Roteiro #1 de Milhas e poste no seu Instagram ou TikTok. Ative o ReplyRush para mandar a DM automática com o seu link quando alguém comentar.
            </p>
          </div>

          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
            <span className="font-bold text-emerald-400 text-sm">📅 Dia 2: Mineração</span>
            <p>
              Abra o perfil <code>@passageirodeprimeira</code> ou <code>@melhoresdestinos</code>, encontre 5 pessoas com dúvidas em comentários recentes e envie uma mensagem prestativa com o script anti-bloqueio.
            </p>
          </div>

          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
            <span className="font-bold text-emerald-400 text-sm">📅 Dia 3: Fechamento</span>
            <p>
              Quando a pessoa chamar no seu WhatsApp <code>(41) 99877-8348</code>, use a aba <strong>Robô de Vendas 24/7</strong> para responder as objeções e enviar o link da Eduzz para fechar os R$ 385,00!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
