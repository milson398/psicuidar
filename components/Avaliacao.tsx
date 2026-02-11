
import React, { useState } from 'react';

interface AvaliacaoData {
    id: string;
    patientName: string;
    date: string;
    instrument: string; // e.g., EOCA, WISC-IV, Anamnese
    summary: string;
}

const initialEvaluations: AvaliacaoData[] = [
    { id: '1', patientName: 'João Silva', date: '2023-10-25', instrument: 'Anamnese', summary: 'Pais relatam dificuldade na leitura e escrita. Histórico de atraso na fala e desenvolvimento motor dentro do esperado. Necessário investigar processamento auditivo.' },
    { id: '2', patientName: 'Maria Oliveira', date: '2023-10-26', instrument: 'E.O.C.A', summary: 'Apresentou boa vinculação. Leitura silabada e dificuldade na interpretação de textos simples. Demonstra ansiedade durante tarefas de lógica matemática.' },
    { id: '3', patientName: 'Pedro Santos', date: '2023-10-27', instrument: 'WISC-IV', summary: 'Resultados indicam QI Total na média. Índice de Memória Operacional rebaixado, sugerindo dificuldades em manter informações ativas para processamento complexo.' },
    { id: '4', patientName: 'Ana Clara', date: '2023-10-28', instrument: 'Provas Projetivas', summary: 'Vínculo positivo com a terapeuta. Desenhos indicam insegurança e necessidade de aprovação constante. Família relata mudanças comportamentais recentes na escola.' },
];

const Avaliacao: React.FC = () => {
    const [evaluations, setEvaluations] = useState<AvaliacaoData[]>(initialEvaluations);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Estado para armazenar a avaliação selecionada para visualização
    const [selectedEvaluation, setSelectedEvaluation] = useState<AvaliacaoData | null>(null);

    // Form States
    const [newName, setNewName] = useState('');
    const [newInstrument, setNewInstrument] = useState('Anamnese');
    const [newSummary, setNewSummary] = useState('');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const newEval: AvaliacaoData = {
            id: Date.now().toString(),
            patientName: newName,
            date: new Date().toISOString().split('T')[0],
            instrument: newInstrument,
            summary: newSummary
        };
        setEvaluations([newEval, ...evaluations]);
        setIsModalOpen(false);
        setNewName('');
        setNewInstrument('Anamnese');
        setNewSummary('');
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta avaliação?')) {
            setEvaluations(prev => prev.filter(eva => eva.id !== id));
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Avaliação Psicopedagógica</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie prontuários e instrumentos avaliativos.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center py-2 px-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Nova Avaliação
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {evaluations.map(eva => (
                    <div key={eva.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate pr-2">{eva.patientName}</h3>
                            <span className="flex-shrink-0 text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded whitespace-nowrap">{eva.instrument}</span>
                        </div>
                        {/* Área de resumo com barra de rolagem */}
                        <div className="flex-grow mb-4">
                            <div className="max-h-24 overflow-y-auto pr-2 custom-scrollbar">
                                <p className="text-sm text-gray-600 dark:text-gray-300">{eva.summary}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-400 border-t pt-4 dark:border-gray-700 mt-auto">
                            <span>{new Date(eva.date).toLocaleDateString('pt-BR')}</span>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => handleDelete(eva.id)}
                                    className="text-red-600 hover:text-red-800 font-medium focus:outline-none flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    Excluir
                                </button>
                                <button
                                    onClick={() => setSelectedEvaluation(eva)}
                                    className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none"
                                >
                                    Ver Detalhes
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Nova Avaliação */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
                    <div
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in-up"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Registrar Avaliação</h2>
                        <form onSubmit={handleSave}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Paciente</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white bg-white"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="Nome do paciente"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instrumento</label>
                                <select
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white bg-white"
                                    value={newInstrument}
                                    onChange={e => setNewInstrument(e.target.value)}
                                >
                                    <option value="Anamnese">Anamnese</option>
                                    <option value="E.O.C.A">E.O.C.A</option>
                                    <option value="Provas Projetivas">Provas Projetivas</option>
                                    <option value="WISC-IV">WISC-IV</option>
                                    <option value="Provas Operatórias">Provas Operatórias</option>
                                    <option value="IAR">IAR</option>
                                </select>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resumo / Observações</label>
                                <textarea
                                    required
                                    rows={6}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-white bg-white"
                                    value={newSummary}
                                    onChange={e => setNewSummary(e.target.value)}
                                    placeholder="Descreva os principais pontos observados..."
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Salvar Registro</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Ver Detalhes */}
            {selectedEvaluation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center backdrop-blur-sm p-4" onClick={() => setSelectedEvaluation(null)}>
                    <div
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in-up"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Detalhes da Avaliação</h2>
                            <button onClick={() => setSelectedEvaluation(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Paciente</h3>
                                <p className="text-lg font-medium text-gray-900 dark:text-white">{selectedEvaluation.patientName}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data</h3>
                                    <p className="text-base text-gray-800 dark:text-gray-200">{new Date(selectedEvaluation.date).toLocaleDateString('pt-BR')}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Instrumento</h3>
                                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-sm font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        {selectedEvaluation.instrument}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Resumo / Observações</h3>
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                        {selectedEvaluation.summary}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => setSelectedEvaluation(null)}
                                className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 font-medium transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                /* Estilo simples para scrollbar interna */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #4b5563;
                }
            `}</style>
        </div>
    );
};

export default Avaliacao;
