import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../services/supabase';

interface Matricula {
    id: string;
    nome: string;
    idade: string;
    atividade: string;
    celular: string;
    endereco: string;
    valor: number;
}

const Matriculas: React.FC<{ isFuncionario?: boolean }> = ({ isFuncionario }) => {
    const [matriculas, setMatriculas] = useState<Matricula[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMatriculas = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('matriculas')
                .select('*')
                .order('nome', { ascending: true });

            if (error) throw error;
            if (data) {
                setMatriculas(data);
            }
        } catch (error) {
            console.error('Erro ao buscar matrículas:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatriculas();
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMatricula, setEditingMatricula] = useState<Matricula | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        nome: '',
        idade: '',
        atividade: '',
        celular: '',
        endereco: '',
        valor: ''
    });

    const stats = useMemo(() => {
        const totalAlunos = matriculas.length;
        const valorTotal = matriculas.reduce((acc, curr) => acc + curr.valor, 0);
        const mediaPorAluno = totalAlunos > 0 ? valorTotal / totalAlunos : 0;

        return { totalAlunos, valorTotal, mediaPorAluno };
    }, [matriculas]);

    const handleOpenModal = (matricula?: Matricula) => {
        if (matricula) {
            setEditingMatricula(matricula);
            setFormData({
                nome: matricula.nome,
                idade: matricula.idade,
                atividade: matricula.atividade,
                celular: matricula.celular,
                endereco: matricula.endereco,
                valor: matricula.valor.toString()
            });
        } else {
            setEditingMatricula(null);
            setFormData({
                nome: '',
                idade: '',
                atividade: '',
                celular: '',
                endereco: '',
                valor: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const valorNum = parseFloat(formData.valor.replace(',', '.')) || 0;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            let user = session?.user;

            if (!user) {
                const { data: userData } = await supabase.auth.getUser();
                user = userData?.user;
            }

            const isLocalAuth = sessionStorage.getItem('psicuidar_auth') === 'true';

            if (!user && !isLocalAuth) {
                sessionStorage.removeItem('psicuidar_auth');
                window.location.reload();
                return;
            }

            const payload: any = {
                nome: formData.nome,
                idade: formData.idade,
                atividade: formData.atividade,
                celular: formData.celular,
                endereco: formData.endereco,
                valor: valorNum
            };

            if (user?.id) {
                payload.user_id = user.id;
            }

            if (editingMatricula) {
                const { error: updateError } = await supabase
                    .from('matriculas')
                    .update(payload)
                    .eq('id', editingMatricula.id);

                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('matriculas')
                    .insert([payload]);

                if (insertError) throw insertError;
            }

            await fetchMatriculas();
            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Erro ao salvar:', error);
            alert('Não foi possível salvar os dados. Se persistir, recarregue a página.');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from('matriculas')
                .delete()
                .eq('id', id);
            if (error) throw error;
            fetchMatriculas();
        } catch (error) {
            console.error('Erro ao excluir matrícula:', error);
        }
        setDeletingId(null);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8 animate-fade-in-up">
            <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4">
                <div className="text-center lg:text-left">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Matrículas</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gerenciamento de alunos e mensalidades.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center py-2 px-6 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all transform active:scale-95 font-bold"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Adicionar Aluno
                </button>
            </div>

            <div className={`grid ${isFuncionario ? 'grid-cols-1 max-w-xs' : 'grid-cols-1 md:grid-cols-3'} gap-6 mb-8`}>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total de Alunos</p>
                    <h3 className="text-3xl font-extrabold text-gray-800 dark:text-white mt-1">{stats.totalAlunos}</h3>
                </div>
                {!isFuncionario && (
                    <>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-green-500">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor Total</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 dark:text-white mt-1">
                                R$ {stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </h3>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-purple-500">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Média por Aluno</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 dark:text-white mt-1">
                                R$ {stats.mediaPorAluno.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </h3>
                        </div>
                    </>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600">Nome do Aluno</th>
                                <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600">Idade</th>
                                <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600">Atividade</th>
                                <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600">Celular</th>
                                <th className="px-6 py-3 text-left text-sm font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600">Valor (R$)</th>
                                <th className="px-6 py-3 text-right text-sm font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {matriculas.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">Nenhum aluno matriculado ainda.</td></tr>
                            ) : (
                                matriculas.map((m) => (
                                    <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap border border-gray-200 dark:border-gray-700">
                                            <div className="text-base font-bold text-gray-900 dark:text-white">{m.nome}</div>
                                            <div className="text-sm text-gray-500 truncate max-w-[200px]">{m.endereco}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{m.idade} anos</td>
                                        <td className="px-6 py-4 whitespace-nowrap border border-gray-200 dark:border-gray-700">
                                            <span className="px-2 py-1 text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 rounded">{m.atividade}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{m.celular}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">R$ {m.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-base font-medium border border-gray-200 dark:border-gray-700">
                                            <div className="flex justify-end items-center space-x-2">
                                                {deletingId === m.id ? (
                                                    <div className="flex items-center bg-red-50 dark:bg-red-900/20 rounded-lg p-1 animate-pulse">
                                                        <span className="text-xs font-bold text-red-600 dark:text-red-400 mr-2 ml-1">Deseja excluir?</span>
                                                        <button onClick={() => handleDelete(m.id)} className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors mr-1">Sim</button>
                                                        <button onClick={() => setDeletingId(null)} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded hover:bg-gray-300 transition-colors">Não</button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleOpenModal(m)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                                        <button onClick={() => setDeletingId(m.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white border-b pb-4 dark:border-gray-700">{editingMatricula ? 'Editar Aluno' : 'Nova Matrícula'}</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Nome do Aluno</label>
                                <input type="text" required value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nome completo" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Idade</label>
                                    <input type="number" required value={formData.idade} onChange={e => setFormData({ ...formData, idade: e.target.value })} className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Valor da Atividade (R$)</label>
                                    <input type="text" required value={formData.valor} onChange={e => setFormData({ ...formData, valor: e.target.value })} className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: 150,00" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Atividade</label>
                                <input type="text" required value={formData.atividade} onChange={e => setFormData({ ...formData, atividade: e.target.value })} className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Reforço Escolar" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Celular</label>
                                <input type="tel" required value={formData.celular} onChange={e => setFormData({ ...formData, celular: e.target.value })} className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="(00) 00000-0000" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Endereço</label>
                                <textarea rows={2} required value={formData.endereco} onChange={e => setFormData({ ...formData, endereco: e.target.value })} className="w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Rua, Número, Bairro" />
                            </div>
                            <div className="flex justify-end space-x-3 mt-8">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-all font-medium">Cancelar</button>
                                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg font-bold transition-all">Salvar Aluno</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Matriculas;
