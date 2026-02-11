import React, { useState, useMemo, useEffect } from 'react';

// Tipagem para os pagamentos
interface Pagamento {
    id: string;
    aluno: string;
    celular?: string; // Para WhatsApp
    valor: number;
    metodo: 'PIX' | 'Cartão de Crédito' | 'Espécie';
    data: string;
    status: 'Pendente' | 'Pago' | 'Cancelado';
    dataConfirmacao?: string;
}

// Tipagem para configurações do administrador
interface AdminConfig {
    chavePix: string;
    linkBanco: string;
    linkCartao: string;
    mensagemWhatsApp?: string;
}

const Pagamentos: React.FC = () => {
    // Carregar configurações do localStorage
    const [config, setConfig] = useState<AdminConfig>(() => {
        const saved = localStorage.getItem('psicuidar_pagamentos_config');
        const defaultConfig = {
            chavePix: '',
            linkBanco: '',
            linkCartao: '',
            mensagemWhatsApp: 'Olá {nome}, segue o link para pagamento da mensalidade no valor de R$ {valor}. Após o pagamento, nos envie o comprovante. {link}'
        };
        return saved ? { ...defaultConfig, ...JSON.parse(saved) } : defaultConfig;
    });

    // Carregar matrículas para busca automática
    const matriculas = useMemo(() => {
        const saved = localStorage.getItem('psicuidar_matriculas');
        return saved ? JSON.parse(saved) : [];
    }, []);

    // Carregar pagamentos do localStorage
    const [pagamentos, setPagamentos] = useState<Pagamento[]>(() => {
        const saved = localStorage.getItem('psicuidar_pagamentos_dados');
        return saved ? JSON.parse(saved) : [];
    });

    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Form States para novo pagamento
    const [formData, setFormData] = useState({
        aluno: '',
        celular: '',
        valor: '',
        metodo: 'PIX' as Pagamento['metodo'],
        status: 'Pendente' as Pagamento['status']
    });

    // Salvar configurações sempre que houver mudança
    useEffect(() => {
        localStorage.setItem('psicuidar_pagamentos_config', JSON.stringify(config));
    }, [config]);

    // Salvar pagamentos sempre que houver mudança
    useEffect(() => {
        localStorage.setItem('psicuidar_pagamentos_dados', JSON.stringify(pagamentos));
    }, [pagamentos]);

    // Lógica de Cadastro de Pagamento
    const handleSavePayment = (e: React.FormEvent) => {
        e.preventDefault();
        const valorNum = parseFloat(formData.valor.replace(',', '.')) || 0;

        const novoPagamento: Pagamento = {
            id: Date.now().toString(),
            aluno: formData.aluno,
            celular: formData.celular,
            valor: valorNum,
            metodo: formData.metodo,
            data: new Date().toISOString().split('T')[0],
            status: formData.status,
            dataConfirmacao: formData.status === 'Pago' ? new Date().toLocaleString('pt-BR') : undefined
        };

        setPagamentos(prev => [novoPagamento, ...prev]);
        setIsModalOpen(false);
        setFormData({ aluno: '', celular: '', valor: '', metodo: 'PIX', status: 'Pendente' });
    };

    // Função para enviar WhatsApp
    const enviarWhatsApp = (p: Pagamento) => {
        if (!p.celular) {
            alert('Este registro não possui número de celular cadastrado.');
            return;
        }

        const link = p.metodo === 'PIX' ? (config.chavePix.startsWith('http') ? config.chavePix : config.linkBanco) : config.linkCartao;

        let mensagem = config.mensagemWhatsApp || '';
        mensagem = mensagem
            .replace('{nome}', p.aluno)
            .replace('{valor}', p.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }))
            .replace('{link}', link || '(Link não configurado)');

        const phone = p.celular.replace(/\D/g, '');
        const url = `https://web.whatsapp.com/send?phone=+55${phone}&text=${encodeURIComponent(mensagem)}`;
        window.open(url, '_blank');
    };

    // Função para confirmar pagamento (Pagar via PIX/Cartão ou Dinheiro)
    const confirmarPagamento = (id: string, metodo: Pagamento['metodo']) => {
        if (metodo === 'PIX') {
            if (config.chavePix) {
                // Tenta copiar a chave e informa ou abre link se for URL
                if (config.chavePix.startsWith('http')) {
                    window.open(config.chavePix, '_blank');
                } else {
                    navigator.clipboard.writeText(config.chavePix);
                    alert('Chave PIX copiada para a área de transferência!');
                }
            } else {
                alert('Configure sua chave PIX nas configurações abaixo.');
            }
        } else if (metodo === 'Cartão de Crédito') {
            if (config.linkCartao) {
                window.open(config.linkCartao, '_blank');
            } else {
                alert('Configure seu link de pagamento de cartão nas configurações abaixo.');
            }
        } else if (metodo === 'Espécie') {
            if (!window.confirm('Confirmar recebimento em dinheiro?')) return;
        }

        // Para PIX e Cartão, o status muda após confirmação manual do usuário no sistema
        // Para Dinheiro, mudamos direto
        if (metodo === 'Espécie') {
            alterarStatus(id, 'Pago');
        }
    };

    const alterarStatus = (id: string, novoStatus: Pagamento['status']) => {
        setPagamentos(prev => prev.map(p =>
            p.id === id
                ? {
                    ...p,
                    status: novoStatus,
                    dataConfirmacao: novoStatus === 'Pago' ? new Date().toLocaleString('pt-BR') : undefined
                }
                : p
        ));
    };

    const handleDelete = (id: string) => {
        setPagamentos(prev => prev.filter(p => p.id !== id));
        setDeletingId(null);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8 animate-fade-in-up">
            <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4">
                <div className="text-center lg:text-left">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Controle de Pagamentos</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gestão financeira e fluxos de recebimento.</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setIsConfigOpen(true)}
                        className="flex items-center py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-bold border border-gray-200 dark:border-gray-600"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Configurações
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center py-2 px-6 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-all transform active:scale-95 font-bold"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Novo Pagamento
                    </button>
                </div>
            </div>

            {/* Configurações Administrativas (Card expansível ou Modal) */}
            {isConfigOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center backdrop-blur-sm p-4" onClick={() => setIsConfigOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Configurações Adm</h2>
                            <button onClick={() => setIsConfigOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Minha Chave PIX</label>
                                <input type="text" value={config.chavePix} onChange={e => setConfig({ ...config, chavePix: e.target.value })} className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="E-mail, CPF ou Link Copia e Cola" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Link Conta Bancária (Link Direto)</label>
                                <input type="text" value={config.linkBanco} onChange={e => setConfig({ ...config, linkBanco: e.target.value })} className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: https://nubank.com.br/pagar/..." />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Link Pagamento Cartão (Stripe/Mercado Pago)</label>
                                <input type="text" value={config.linkCartao} onChange={e => setConfig({ ...config, linkCartao: e.target.value })} className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: https://mpago.la/..." />
                            </div>
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3">Envio de Link de Pagamento via WhatsApp</h3>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Mensagem Padrão personalizada</label>
                                <textarea
                                    value={config.mensagemWhatsApp}
                                    onChange={e => setConfig({ ...config, mensagemWhatsApp: e.target.value })}
                                    className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm h-24"
                                    placeholder="Use {nome}, {valor} e {link} para preenchimento automático."
                                />
                                <p className="text-[10px] text-gray-400 mt-1 italic">Dica: {`{nome}`}, {`{valor}`} e {`{link}`} são substituídos automaticamente.</p>
                            </div>
                            <button onClick={() => setIsConfigOpen(false)} className="w-full py-3 mt-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all font-bold">
                                Salvar Configurações
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabela de Pagamentos */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600">Aluno</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600">Valor / Método</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600">Data Registro / Pagto</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {pagamentos.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        Nenhum registro de pagamento encontrado.
                                    </td>
                                </tr>
                            ) : (
                                pagamentos.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap border border-gray-200 dark:border-gray-700">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{p.aluno}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap border border-gray-200 dark:border-gray-700">
                                            <div className="text-sm font-extrabold text-blue-600 dark:text-blue-400">R$ {p.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase">{p.metodo}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap border border-gray-200 dark:border-gray-700">
                                            {p.status === 'Pago' ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                    Pagamento Efetuado
                                                </span>
                                            ) : p.status === 'Pendente' ? (
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                                                    Pendente
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                                                    Cancelado
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap border border-gray-200 dark:border-gray-700">
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Criado: {new Date(p.data).toLocaleDateString('pt-BR')}</div>
                                            {p.dataConfirmacao && (
                                                <div className="text-[10px] font-bold text-green-600 dark:text-green-500 mt-0.5">✔ {p.dataConfirmacao}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm border border-gray-200 dark:border-gray-700">
                                            <div className="flex justify-end items-center space-x-2">
                                                {deletingId === p.id ? (
                                                    <div className="flex items-center bg-red-50 dark:bg-red-900/20 rounded-lg p-1.5 animate-pulse border border-red-100 dark:border-red-900/30">
                                                        <span className="text-[10px] font-bold text-red-600 dark:text-red-400 mr-2 ml-1">Excluir?</span>
                                                        <button onClick={() => handleDelete(p.id)} className="px-2 py-0.5 bg-red-600 text-white text-[10px] rounded hover:bg-red-700 transition-colors mr-1 font-bold">Sim</button>
                                                        <button onClick={() => setDeletingId(null)} className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] rounded hover:bg-gray-300 transition-colors font-bold">Não</button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {p.status === 'Pendente' && (
                                                            <>
                                                                <button
                                                                    onClick={() => enviarWhatsApp(p)}
                                                                    className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold flex items-center transition-all transform active:scale-95"
                                                                    title="Enviar Cobrança via WhatsApp"
                                                                >
                                                                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                                                    Cobrar
                                                                </button>
                                                                <button
                                                                    onClick={() => confirmarPagamento(p.id, p.metodo)}
                                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all transform active:scale-95 ${p.metodo === 'PIX' ? 'bg-indigo-500 hover:bg-indigo-600' :
                                                                            p.metodo === 'Cartão de Crédito' ? 'bg-blue-500 hover:bg-blue-600' :
                                                                                'bg-green-500 hover:bg-green-600'
                                                                        }`}
                                                                >
                                                                    {p.metodo === 'PIX' ? 'Pagar via PIX' :
                                                                        p.metodo === 'Cartão de Crédito' ? 'Pagar via Cartão' :
                                                                            'Confirmar Dinheiro'}
                                                                </button>

                                                                {p.metodo !== 'Espécie' && (
                                                                    <button
                                                                        onClick={() => alterarStatus(p.id, 'Pago')}
                                                                        className="px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded-lg text-xs font-bold hover:bg-green-200 transition-all"
                                                                        title="Confirmar Manual"
                                                                    >
                                                                        Confirmar
                                                                    </button>
                                                                )}

                                                                <button
                                                                    onClick={() => alterarStatus(p.id, 'Cancelado')}
                                                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                                                                    title="Cancelar"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                </button>
                                                            </>
                                                        )}
                                                        <button onClick={() => setDeletingId(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-all rounded-full" title="Excluir Registro">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Novo Pagamento */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Registrar Pagamento</h2>
                        <form onSubmit={handleSavePayment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Nome do Aluno</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        value={formData.aluno}
                                        onChange={e => setFormData({ ...formData, aluno: e.target.value })}
                                        className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Digite ou selecione aluno..."
                                        list="list-alunos"
                                    />
                                    <datalist id="list-alunos">
                                        {matriculas.map((m: any) => (
                                            <option key={m.id} value={m.nome}>{m.atividade} - R$ {m.valor}</option>
                                        ))}
                                    </datalist>
                                    <button
                                        type="button"
                                        className="absolute right-2 top-2.5 text-blue-500 hover:text-blue-600"
                                        onClick={() => {
                                            const selected = matriculas.find((m: any) => m.nome === formData.aluno);
                                            if (selected) {
                                                setFormData({
                                                    ...formData,
                                                    valor: selected.valor.toString().replace('.', ','),
                                                    celular: selected.celular
                                                });
                                            } else {
                                                alert('Selecione um aluno da lista para puxar os dados automaticamente.');
                                            }
                                        }}
                                        title="Puxar dados da matrícula"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">Digite o nome e clique no raio ⚡ para preencher automaticamente via Matrícula.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Celular (WhatsApp)</label>
                                <input type="text" value={formData.celular} onChange={e => setFormData({ ...formData, celular: e.target.value })} className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="(00) 00000-0000" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Valor (R$)</label>
                                <input type="text" required value={formData.valor} onChange={e => setFormData({ ...formData, valor: e.target.value })} className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: 150,00" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Método de Pagamento</label>
                                <select value={formData.metodo} onChange={e => setFormData({ ...formData, metodo: e.target.value as Pagamento['metodo'] })} className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="PIX">PIX</option>
                                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                                    <option value="Espécie">Espécie (Dinheiro)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Status Inicial</label>
                                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as Pagamento['status'] })} className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="Pendente">Pendente</option>
                                    <option value="Pago">Já Pago</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3 mt-8">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium">Cancelar</button>
                                <button type="submit" className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-lg transition-all">Registrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pagamentos;
