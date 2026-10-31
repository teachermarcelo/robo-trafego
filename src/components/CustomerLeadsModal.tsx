import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Users,
  CheckCircle2,
  Trash2,
  Phone,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { CustomerLead } from '../types';

interface CustomerLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: CustomerLead[];
  onSimulateSale: () => void;
  onDeleteCustomer?: (id: string) => void;
}

export const CustomerLeadsModal: React.FC<CustomerLeadsModalProps> = ({
  isOpen,
  onClose,
  customers,
  onSimulateSale,
  onDeleteCustomer,
}) => {
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [activeTab, setActiveTab] = useState<'buyers' | 'setup'>('buyers');

  if (!isOpen) return null;

  const webhookUrl = `${window.location.origin}/api/hotmart/webhook`;

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };

  const openWhatsAppChat = (lead: CustomerLead) => {
    const cleanNumber = lead.phone.replace(/\D/g, '');
    const greeting = encodeURIComponent(
      `Olá ${lead.name.split(' ')[0]}! Tudo bem? Vi que você garantiu as 100 Tarefinhas de Educação Infantil e Autismo na Hotmart! O acesso já foi enviado para seu e-mail. Se você precisar de qualquer suporte pedagógico ou tiver alguma dúvida, estou à disposição aqui no WhatsApp!`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${greeting}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Compradores & Leads (WhatsApp e Contatos)</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 font-bold">
                  {customers.length} contatos
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Receba o WhatsApp de quem comprou ou solicitou contato para falar direto com eles
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-5 pt-3 gap-3">
          <button
            onClick={() => setActiveTab('buyers')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'buyers'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Lista de Contatos e Compradores ({customers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'setup'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Como Conectar com a Hotmart (Passo a Passo)</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'buyers' && (
            <div className="space-y-4">
              {/* Quick Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-white">Pronto para conversão:</span> Clique no botão verde para abrir a conversa no WhatsApp do comprador com mensagem personalizada já pronta.
                </div>
                <button
                  onClick={onSimulateSale}
                  className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Simular Venda Real de Teste</span>
                </button>
              </div>

              {/* Customers List */}
              {customers.length === 0 ? (
                <div className="text-center py-12 space-y-3 bg-slate-950/50 rounded-2xl border border-dashed border-slate-800">
                  <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Nenhum comprador registrado ainda</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Assim que as pessoas comprarem na Hotmart ou solicitarem contato na landing page, elas aparecerão aqui com número de WhatsApp e botão de 1 clique.
                  </p>
                  <button
                    onClick={onSimulateSale}
                    className="px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold hover:bg-emerald-500 hover:text-slate-950 transition cursor-pointer"
                  >
                    Fazer Teste de Demonstração Agora
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {customers.map((customer) => {
                    const isHotmart = customer.source === 'hotmart_webhook';
                    const isApproved = customer.status === 'comprador_aprovado';

                    return (
                      <div
                        key={customer.id}
                        className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">
                              {customer.name}
                            </span>
                            {isApproved ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Compra Aprovada Hotmart (R$ {customer.amount?.toFixed(2) || '9,90'})</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-700/60 text-indigo-300">
                                Dúvida / Lead WhatsApp
                              </span>
                            )}
                            <span className="text-[10px] text-slate-500">
                              {new Date(customer.createdAt).toLocaleDateString('pt-BR')} às {new Date(customer.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                            <span className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
                              <Phone className="w-3 h-3" />
                              +{customer.phone}
                            </span>
                            {customer.email && (
                              <span className="text-slate-400 truncate max-w-[220px]">
                                ✉️ {customer.email}
                              </span>
                            )}
                            {customer.instagramHandle && (
                              <span className="text-pink-400">
                                📷 {customer.instagramHandle}
                              </span>
                            )}
                          </div>

                          {customer.notes && (
                            <p className="text-[11px] text-slate-400 italic">
                              {customer.notes}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                          <button
                            onClick={() => openWhatsAppChat(customer)}
                            className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                            title="Abrir WhatsApp com mensagem pronta"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Chamar no WhatsApp</span>
                          </button>

                          {onDeleteCustomer && (
                            <button
                              onClick={() => onDeleteCustomer(customer.id)}
                              className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-xl transition cursor-pointer"
                              title="Remover da lista"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="space-y-4">
              {/* Webhook URL Box */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  Sua URL de Webhook Oficial (Cole na Hotmart):
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={webhookUrl}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-emerald-400 font-mono text-xs focus:outline-none"
                  />
                  <button
                    onClick={copyWebhookUrl}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedWebhook ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedWebhook ? 'Copiado!' : 'Copiar URL'}</span>
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Esta rota recebe automaticamente o Nome, Telefone/WhatsApp e E-mail de quem comprou seu produto na Hotmart.
                </span>
              </div>

              {/* Step by Step Guide */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Passo a Passo de 2 Minutos para Ativar na Hotmart:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 font-bold inline-flex items-center justify-center text-[11px] mb-1">
                      1
                    </span>
                    <strong className="block text-white font-bold">Acesse a Hotmart</strong>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Faça login no painel oficial da Hotmart (<a href="https://app.hotmart.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">app.hotmart.com</a>).
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 font-bold inline-flex items-center justify-center text-[11px] mb-1">
                      2
                    </span>
                    <strong className="block text-white font-bold">Vá em Webhooks</strong>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      No menu lateral esquerdo, clique em <strong>Ferramentas</strong> e selecione <strong>Webhooks (Notificações)</strong>.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 font-bold inline-flex items-center justify-center text-[11px] mb-1">
                      3
                    </span>
                    <strong className="block text-white font-bold">Cadastrar Configuração</strong>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Clique em <strong>Cadastrar Webhook</strong>. Dê o nome "AutoViral Robô" e cole a URL que você copiou acima.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 font-bold inline-flex items-center justify-center text-[11px] mb-1">
                      4
                    </span>
                    <strong className="block text-white font-bold">Marque os Eventos</strong>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Marque <strong>Compra Aprovada</strong>, <strong>Boleto Gerado</strong> e <strong>Pedido de Reembolso</strong>. Depois clique em Salvar!
                    </p>
                  </div>
                </div>
              </div>

              {/* Clarification Box */}
              <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Por que quem apenas clica no link não envia o WhatsApp automaticamente?</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Por regras globais de privacidade (LGPD e segurança do Instagram/TikTok), o navegador do celular não entrega o número de telefone de quem apenas clica para ver a página. <strong>O WhatsApp só é revelado no momento em que a pessoa clica no botão de WhatsApp da página ou quando ela compra na Hotmart</strong> (onde ela digita o WhatsApp para receber o acesso).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Sincronizado na nuvem Google Firebase em tempo real
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
