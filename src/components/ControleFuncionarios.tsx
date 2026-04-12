import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

interface Funcionario {
    id: string;
    nome: string;
    email: string;
    status: 'ativo' | 'inativo';
    data_criacao: string;
}

const ControleFuncionarios: React.FC = () => {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<{id: string, action: 'delete' | 'toggle', status?: string} | null>(null);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: ''
    });

    useEffect(() => {
        fetchFuncionarios();
    }, []);

    const fetchFuncionarios = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            let query = supabase.from('funcionarios').select('id, nome, email, status, data_criacao');
            
            // Se tiver usuário logado do Supabase, filtra pelo gestor. Se for fallback admin, pega todos ou sem filtro restrito
            if (user) {
                query = query.eq('gestor_id', user.id);
            }
            
            const { data, error: fetchError } = await query.order('data_criacao', { ascending: false });

            if (fetchError) throw fetchError;
            setFuncionarios(data || []);
        } catch (err: any) {
            console.error('Erro ao buscar funcionários:', err);
            setError(err.message || 'Falha ao carregar a equipe.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateFuncionario = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        setSuccessMsg('');

        try {
            if (editingId) {
                // Usa RPC segura para atualizar — o hash da senha é feito no servidor
                const { error: updateError } = await supabase.rpc('update_funcionario_secure', {
                    p_funcionario_id: editingId,
                    p_nome: formData.nome,
                    p_email: formData.email,
                    p_senha: formData.senha || null
                });

                if (updateError) throw updateError;
                setSuccessMsg('Funcionário atualizado com sucesso!');
            } else {
                // Usa RPC segura para criar — a senha é hashada com bcrypt no servidor
                const { error: insertError } = await supabase.rpc('create_funcionario_secure', {
                    p_nome: formData.nome,
                    p_email: formData.email,
                    p_senha: formData.senha
                });

                if (insertError) throw insertError;
                setSuccessMsg('Funcionário adicionado com sucesso!');
            }

            setShowModal(false);
            setFormData({ nome: '', email: '', senha: '' });
            setEditingId(null);
            fetchFuncionarios();

            // Limpa mensagem de sucesso depois de 3 segundos
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Erro ao salvar funcionário. O email já pode estar em uso.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (func: Funcionario) => {
        setEditingId(func.id);
        setFormData({ nome: func.nome, email: func.email, senha: '' });
        setError('');
        setShowModal(true);
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';
        
        try {
            // Usa RPC segura: garante que apenas o gestor dono do funcionário possa alterar o status
            const { error: updateError } = await supabase.rpc('update_funcionario_status', {
                p_funcionario_id: id,
                p_status: newStatus
            });

            if (updateError) throw updateError;
            setFuncionarios(prev => prev.map(f => f.id === id ? { ...f, status: newStatus as 'ativo' | 'inativo' } : f));
            setConfirmAction(null);
            setSuccessMsg('Status alterado com sucesso!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err: any) {
            alert('Falha ao alterar status. ' + err.message);
            setConfirmAction(null);
        }
    };

    const deleteFuncionario = async (id: string) => {
        try {
            const { error: deleteError } = await supabase
                .from('funcionarios')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;
            setFuncionarios(prev => prev.filter(f => f.id !== id));
            setConfirmAction(null);
            setSuccessMsg('Funcionário excluído!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err: any) {
            console.error('Erro ao excluir funcionário:', err);
            alert('Falha ao excluir o funcionário. ' + err.message);
            setConfirmAction(null);
        }
    };


    return (
        <div className="p-4 md:p-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-400 dark:from-emerald-400 dark:to-teal-200">
                        Minha Equipe
                    </h1>
                    <div className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl text-sm md:text-base">
                        Gerencie os acessos dos seus funcionários. A tela de login deles está localizada isoladamente no link:
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                            <div className="flex items-center font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800 shadow-sm">
                                <span className="mr-2">🔗</span>
                                {window.location.origin}/funcionario
                            </div>
                            <button
                                onClick={() => {
                                    const link = `${window.location.origin}/funcionario`;
                                    
                                    // Cria do arquivo de atalho .url (Padrao Windows)
                                    const fileContent = `[InternetShortcut]\nURL=${link}\nIDList=\n[{000214A0-0000-0000-C000-000000000046}]\nProp3=19,2`;
                                    const blob = new Blob([fileContent], { type: 'text/url' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = 'Login-Equipe-PsiCuidar.url';
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);

                                    // Copia para o clipboard para facilitar
                                    if (navigator.clipboard) {
                                        navigator.clipboard.writeText(link);
                                        setSuccessMsg('✅ Atalho baixado! O link também foi copiado para sua área de transferência.');
                                    } else {
                                        setSuccessMsg('✅ Atalho baixado com sucesso!');
                                    }
                                    
                                    setTimeout(() => setSuccessMsg(''), 5000);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white dark:bg-emerald-500 rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all border border-emerald-500 font-bold shadow-lg transform active:scale-95"
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Baixar Atalho (Acesso Direto)
                            </button>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ nome: '', email: '', senha: '' });
                        setError('');
                        setShowModal(true);
                    }}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Adicionar Funcionário
                </button>
            </div>

            {successMsg && (
                <div className="mb-6 p-4 bg-emerald-100 border-l-4 border-emerald-500 text-emerald-800 rounded shadow-md animate-fade-in-up">
                    <p className="font-bold flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Sucesso
                    </p>
                    <p>{successMsg}</p>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Funcionário</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cadastro</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acesso</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                                        Carregando equipe...
                                    </td>
                                </tr>
                            ) : funcionarios.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        </div>
                                        <p className="text-lg font-medium">Sua equipe está vazia</p>
                                        <p className="mt-1 text-sm text-gray-400">Adicione um novo funcionário para que ele possa acessar o painel isolado.</p>
                                    </td>
                                </tr>
                            ) : (
                                funcionarios.map((func) => (
                                    <tr key={func.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold shadow-md">
                                                    {func.nome.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{func.nome}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{func.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(func.data_criacao).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {func.status === 'ativo' ? (
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 mt-1.5"></span>
                                                    Ativo
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 mt-1.5"></span>
                                                    Bloqueado
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {confirmAction?.id === func.id ? (
                                                <div className="flex items-center justify-end gap-2 animate-fade-in-up">
                                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 mr-2">
                                                        {confirmAction.action === 'delete' ? 'Deseja excluir permanentemente?' : `Mudar acesso para ${confirmAction.status === 'ativo' ? 'Inativo' : 'Ativo'}?`}
                                                    </span>
                                                    <button
                                                        onClick={() => confirmAction.action === 'delete' ? deleteFuncionario(func.id) : toggleStatus(func.id, func.status)}
                                                        className="px-3 py-1.5 rounded-lg text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
                                                    >
                                                        Sim
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmAction(null)}
                                                        className="px-3 py-1.5 rounded-lg text-sm font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 shadow-sm"
                                                    >
                                                        Não
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => setConfirmAction({ id: func.id, action: 'toggle', status: func.status })}
                                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${func.status === 'ativo'
                                                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 dark:border-rose-800'
                                                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 dark:border-emerald-800'
                                                            }`}
                                                    >
                                                        {func.status === 'ativo' ? 'Bloquear Acesso' : 'Desbloquear Acesso'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(func)}
                                                        className="px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-bold transition-all shadow-sm bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-blue-900/30 dark:hover:border-blue-800 dark:hover:text-blue-400"
                                                        title="Editar"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmAction({ id: func.id, action: 'delete' })}
                                                        className="px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-bold transition-all shadow-sm bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700 border border-gray-200 hover:border-red-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-red-900/30 dark:hover:border-red-800 dark:hover:text-red-400"
                                                        title="Excluir"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        Excluir
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Criação */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"></div>
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden animate-fade-in-up border border-gray-100 dark:border-gray-700">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            {editingId ? 'Editar Funcionário' : 'Novo Funcionário'}
                        </h3>
                        
                        {error && (<div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{error}</div>)}

                        <form onSubmit={handleCreateFuncionario} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nome}
                                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all dark:text-white"
                                    placeholder="João da Silva"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail de Acesso</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all dark:text-white"
                                    placeholder="joao@psicuidar.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {editingId ? 'Nova Senha (Opcional)' : 'Senha Inicial'}
                                </label>
                                <input
                                    type="password"
                                    required={!editingId}
                                    value={formData.senha}
                                    onChange={e => setFormData({ ...formData, senha: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all dark:text-white"
                                    placeholder={editingId ? 'Deixe em branco para manter a atual' : '••••••••'}
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className={`px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                                >
                                    {isSaving ? 'Salvando...' : (editingId ? 'Salvar' : 'Adicionar')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ControleFuncionarios;
