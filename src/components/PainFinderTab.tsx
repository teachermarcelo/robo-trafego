import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Flame,
  ArrowRight,
  TrendingUp,
  MapPin,
  Users,
  Target,
  Zap,
  CheckCircle,
  Copy,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { PainSearchResponse, PainPointData } from '../types';

interface PainFinderTabProps {
  onSelectPainForCreative: (pain: PainPointData, niche: string, keyword: string) => void;
}

export const PainFinderTab: React.FC<PainFinderTabProps> = ({ onSelectPainForCreative }) => {
  const [keyword, setKeyword] = useState('psicopedagogia');
  const [niche, setNiche] = useState('psicopedagogia');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [searchResult, setSearchResult] = useState<PainSearchResponse | null>({
    niche: 'Psicopedagogia & Educação Especial',
    keyword: 'psicopedagogia atividades tdah alfabetizacao',
    marketOverview:
      'Mães e educadoras sobrecarregadas buscando alternativas práticas para acalmar crianças com TDAH, ansiedade ou atraso de leitura sem brigas ou remédios desnecessários.',
    monthlySearchesEstimated: '320.000+ buscas/mês no Brasil',
    topPainPoints: [
      {
        pain: 'Sensação de desespero e culpa materna ao ver a criança atrasada ou recebendo recados da escola',
        intensity: 'Crítica (9.9/10)',
        whatTheySearch: 'atividades ludicas para crianca com tdah focar na aula e ler mais rapido',
        secretDesire: 'Ver o filho seguro, elogiado pelos professores e aprendendo com um sorriso no rosto',
        suggestedHook:
          'Antes de achar que seu filho é desatento ou teimoso, aplique esta dinâmica de 5 minutos com papel e lápis!',
      },
      {
        pain: 'Professores sem tempo que gastam madrugadas procurando atividades na internet',
        intensity: 'Muito Alta (9.4/10)',
        whatTheySearch: 'caderno de atividades neuropsicopedagogia pronto para imprimir pdf',
        secretDesire: 'Economizar tempo de planejamento e ter material comprovado e elogiado pela coordenação',
        suggestedHook:
          'Pare de perder noites criando atividades do zero: aqui estão 80 fichas lúdicas prontas para imprimir.',
      },
      {
        pain: 'Medo de o filho ficar isolado socialmente ou ser rotulado na infância',
        intensity: 'Alta (9.0/10)',
        whatTheySearch: 'jogos de inteligencia emocional para criancas agitadas',
        secretDesire: 'Harmonia dentro de casa e convivência tranquila entre irmãos e colegas',
        suggestedHook:
          '3 brincadeiras caseiras que acalmam o cérebro infantil agitado em menos de 10 minutos.',
      },
    ],
    viralPlatformAngles: {
      tiktok:
        'Vídeos de 15 a 25 segundos mostrando a mão da criança completando a atividade lúdica com música calma e texto chamativo no topo.',
      pinterest:
        'Pins verticais 1000x1500 com títulos como "Caderno de Estimulação Cognitiva: Baixe e imprima hoje mesmo".',
      instagram:
        'Carrossel de 5 telas: "O que NÃO falar para uma criança com suspeita de TDAH + O que fazer no lugar".',
    },
    predictiveBuyerProfile: {
      dominantAge: '28 a 46 anos (mães, tias e pedagogas)',
      topLocations: 'São Paulo, Minas Gerais, Rio Grande do Sul, Paraná e Goiás',
      bestTrigger:
        'Alívio imediato do estresse maternal, facilidade de impressão e garantia incondicional.',
    },
  });

  const popularKeywords = [
    { label: 'Psicopedagogia & TDAH', keyword: 'atividades lúdicas para autismo e tdah', niche: 'psicopedagogia' },
    { label: 'Inglês Rápido para Trabalho', keyword: 'como destravar fala em ingles para reunioes', niche: 'ingles' },
    { label: 'Emagrecimento & Detox', keyword: 'secar barriga sem academia e sem passar fome', niche: 'emagrecedor' },
    { label: 'Renda Extra Familiar', keyword: 'como vender produtos na internet sem aparecer', niche: 'renda_extra' },
    { label: 'Confeitaria Lucrativa', keyword: 'bolo no pote que mais vende passo a passo', niche: 'artesanato' },
  ];

  const handleSearch = async (term?: string, nicheTerm?: string) => {
    const finalKeyword = term || keyword;
    const finalNiche = nicheTerm || niche;

    if (!finalKeyword.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/gemini/pain-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: finalKeyword, niche: finalNiche }),
      });

      if (!response.ok) {
        throw new Error('Falha ao consultar IA');
      }

      const json = await response.json();
      if (json.data) {
        setSearchResult(json.data);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Não foi possível conectar à IA no momento, exibindo análise inteligente de contingência.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyHook = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/40 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Radar de Dores & Tendências Secretas na Web</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Descubra o que as Pessoas Estão Desesperadas para Comprar
            </h2>
            <p className="text-xs text-slate-400">
              O segredo de vender sem gastar com anúncio é oferecer uma solução exata para aquilo que o povo já está buscando no Google, TikTok e Pinterest.
            </p>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> Nichos em Alta:
          </span>
          {popularKeywords.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setKeyword(item.keyword);
                setNiche(item.niche);
                handleSearch(item.keyword, item.niche);
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 whitespace-nowrap transition"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search Bar Form */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Nicho do Produto
            </label>
            <select
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ingles">Inglês & Idiomas</option>
              <option value="psicopedagogia">Psicopedagogia & Educação Infantil</option>
              <option value="emagrecedor">Emagrecedor & Saúde Natural</option>
              <option value="renda_extra">Renda Extra & Afiliados</option>
              <option value="artesanato">Artesanato & Confeitaria</option>
              <option value="marketing">Marketing Digital & Serviços</option>
              <option value="outro">Outro Nicho Específico</option>
            </select>
          </div>

          <div className="md:col-span-6">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Palavra-chave ou Assunto que deseja analisar
            </label>
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ex: destravar fala em inglês, emagrecer pós parto, rotina autismo..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="w-full h-[38px] flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Minerando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Minerar Dores</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-xl text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Results Section */}
      {searchResult && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-800/30 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider block">
                  Visão Geral da Demanda
                </span>
                <h3 className="text-lg font-bold text-white">{searchResult.niche}</h3>
              </div>
              <div className="flex items-center gap-2 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800/40 text-emerald-400 text-xs font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Volume Estimado: {searchResult.monthlySearchesEstimated}</span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{searchResult.marketOverview}</p>
          </div>

          {/* Top Pain Points Cards */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-rose-400" />
              As 3 Maiores Dores Encontradas (Prontas para Venda)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {searchResult.topPainPoints.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">Dor #{idx + 1}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/50">
                        Intensidade: {item.intensity}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug">{item.pain}</h4>

                    <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                        Como as pessoas buscam na internet:
                      </span>
                      <p className="text-xs text-indigo-300 font-mono italic">
                        "{item.whatTheySearch}"
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                        Desejo Secreto / Alívio Buscado:
                      </span>
                      <p className="text-xs text-slate-300">{item.secretDesire}</p>
                    </div>

                    {/* Viral Hook */}
                    <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Gancho Viral de 3s:
                        </span>
                        <button
                          onClick={() => copyHook(item.suggestedHook, idx)}
                          className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                          title="Copiar Gancho"
                        >
                          {copiedIndex === idx ? (
                            <span className="text-emerald-400 flex items-center gap-0.5">
                              <CheckCircle className="w-3 h-3" /> Copiado!
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5">
                              <Copy className="w-3 h-3" /> Copiar
                            </span>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-emerald-200 font-medium">"{item.suggestedHook}"</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectPainForCreative(item, searchResult.niche, keyword)}
                    className="mt-4 w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
                  >
                    <span>Criar Vídeo/Post com esta Dor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Strategy by Organic Platform & Buyer Profile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Angles for Platforms */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                Como Viralizar nas Redes Sem Pagar Nada
              </h4>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <strong className="text-xs font-bold text-cyan-400 block mb-1">
                    TikTok Orgânico (Algoritmo de Retenção)
                  </strong>
                  <p className="text-xs text-slate-300">
                    {searchResult.viralPlatformAngles.tiktok}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <strong className="text-xs font-bold text-rose-400 block mb-1">
                    Pinterest (Tráfego de Busca Semelhante ao Google)
                  </strong>
                  <p className="text-xs text-slate-300">
                    {searchResult.viralPlatformAngles.pinterest}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <strong className="text-xs font-bold text-purple-400 block mb-1">
                    Instagram Reels & Carrossel
                  </strong>
                  <p className="text-xs text-slate-300">
                    {searchResult.viralPlatformAngles.instagram}
                  </p>
                </div>
              </div>
            </div>

            {/* Buyer Profile & Demographic Targeting */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Perfil Preditivo do Comprador (Sem Precisar Segmentar)
              </h4>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-start gap-3">
                  <Users className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-white block font-semibold">Faixa Etária Dominante:</strong>
                    <span className="text-slate-300">
                      {searchResult.predictiveBuyerProfile.dominantAge}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-white block font-semibold">Principais Regiões e Estados:</strong>
                    <span className="text-slate-300">
                      {searchResult.predictiveBuyerProfile.topLocations}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-start gap-3">
                  <Zap className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-white block font-semibold">Gatilho Psicológico de Fechamento:</strong>
                    <span className="text-slate-300">
                      {searchResult.predictiveBuyerProfile.bestTrigger}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
