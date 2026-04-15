import React, { useState } from 'react';

interface AvaliacaoData {
    id: string;
    patientName: string;
    date: string;
    instrument: string;
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
    const [selectedEvaluation, setSelectedEvaluation] = useState<AvaliacaoData | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

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
        setEvaluations(prev => prev.filter(eva => eva.id !== id));
        setDeletingId(null);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 pt-16 pb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                <div className="text-center sm:text-left">
                    <h1 className="text-3xl font-extrabold text-[#11ba82] dark:text-[#11ba82] tracking-tight">Avaliação Psicopedagógica</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Gerencie prontuários e instrumentos avaliativos.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center py-3 px-6 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all font-bold transform active:scale-95"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    Nova Avaliação
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {evaluations.map(eva => (
                    <div key={eva.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 flex flex-col h-full overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white truncate pr-2">{eva.patientName}</h3>
                            <span className="flex-shrink-0 text-[10px] font-black bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 px-2 py-1 rounded-md uppercase tracking-wider">{eva.instrument}</span>
                        </div>
                        <div className="flex-grow mb-6">
                            <div className="max-h-24 overflow-y-auto pr-2 custom-scrollbar">
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{eva.summary}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-400 border-t pt-4 dark:border-gray-700 mt-auto">
                            <span>{new Date(eva.date).toLocaleDateString('pt-BR')}</span>
                            <div className="flex space-x-4 items-center">
                                {deletingId === eva.id ? (
                                    <div className="flex items-center bg-red-50 dark:bg-red-900/20 rounded-lg p-1 animate-pulse border border-red-100 dark:border-red-900/30">
                                        <button onClick={() => handleDelete(eva.id)} className="px-2 py-1 bg-red-600 text-white text-[10px] rounded hover:bg-red-700 font-bold">SIM</button>
                                        <button onClick={() => setDeletingId(null)} className="ml-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] rounded hover:bg-gray-300 font-bold">NÃO</button>
                                    </div>
                                ) : (
                                    <>
                                        <button onClick={() => setDeletingId(eva.id)} className="text-red-500 hover:text-red-700 transition-colors">Excluir</button>
                                        <button onClick={() => setSelectedEvaluation(eva)} className="text-blue-500 hover:text-blue-700 transition-colors">Detalhes</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex justify-center items-center backdrop-blur-md p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in-up border border-white/10" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-black mb-6 text-gray-900 dark:text-white">Registrar Avaliação</h2>
                        <form onSubmit={handleSave} className="space-y-5">
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Aluno</label>
                                <input type="text" required className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome completo" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Instrumento</label>
                                <select className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={newInstrument} onChange={e => setNewInstrument(e.target.value)}>
                                    <option value="Anamnese">Anamnese</option>
                                    <option value="E.O.C.A">E.O.C.A</option>
                                    <option value="Provas Projetivas">Provas Projetivas</option>
                                    <option value="WISC-IV">WISC-IV</option>
                                    <option value="Provas Operatórias">Provas Operatórias</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Resumo / Observações</label>
                                <textarea required rows={5} className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={newSummary} onChange={e => setNewSummary(e.target.value)} placeholder="Relato clínico..." />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">Cancelar</button>
                                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedEvaluation && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex justify-center items-center backdrop-blur-md p-4" onClick={() => setSelectedEvaluation(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in-up border border-white/10" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Detalhes</h2>
                            <button onClick={() => setSelectedEvaluation(null)} className="text-gray-400 hover:text-gray-600"><CloseIcon /></button>
                        </div>
                        <div className="space-y-6">
                            <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Paciente</label><p className="text-lg font-bold text-gray-900 dark:text-white">{selectedEvaluation.patientName}</p></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Data</label><p className="text-gray-700 dark:text-gray-300 font-bold">{new Date(selectedEvaluation.date).toLocaleDateString('pt-BR')}</p></div>
                                <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tipo</label><span className="block mt-1 text-xs font-black bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 px-2 py-1 rounded-md text-center">{selectedEvaluation.instrument}</span></div>
                            </div>
                            <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Resumo</label><div className="mt-2 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700"><p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedEvaluation.summary}</p></div></div>
                        </div>
                        <button onClick={() => setSelectedEvaluation(null)} className="w-full mt-8 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-200 transition-colors">Fechar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const CloseIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
);

export default Avaliacao;
