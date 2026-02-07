
import React, { useState } from 'react';

// Definição da interface para tipagem
interface Activity {
    id: number;
    title: string;
    category: string;
    description: string;
    duration: string;
}

const activities: Activity[] = [
    {
        id: 1,
        title: 'Jogo da Memória Fonológico',
        category: 'Alfabetização',
        description: 'Cartas com imagens e palavras para estimular a consciência fonológica e memória visual.',
        duration: '20 min'
    },
    {
        id: 2,
        title: 'Torre de Hanoi',
        category: 'Raciocínio Lógico',
        description: 'Quebra-cabeça matemático que estimula planejamento e resolução de problemas.',
        duration: '30 min'
    },
    {
        id: 3,
        title: 'Leitura Guiada com Fantoches',
        category: 'Leitura',
        description: 'Uso de fantoches para contar histórias, focando na prosódia e compreensão textual.',
        duration: '40 min'
    },
    {
        id: 4,
        title: 'Ábaco Aberto',
        category: 'Matemática',
        description: 'Construção do sistema de numeração decimal posicional.',
        duration: '25 min'
    },
    {
        id: 5,
        title: 'Caixa das Emoções',
        category: 'Socioemocional',
        description: 'Identificação e nomeação de emoções através de situações-problema.',
        duration: '15 min'
    }
];

const Intervencao: React.FC = () => {
    // Estados para gerenciar o planejamento
    const [selectedPatient, setSelectedPatient] = useState('');
    const [planActivities, setPlanActivities] = useState<Activity[]>([]);

    // Função para adicionar atividade ao plano
    const handleAddActivity = (e: React.MouseEvent, activity: Activity) => {
        e.preventDefault();
        e.stopPropagation();

        setPlanActivities(prev => {
            // Verifica duplicidade no estado anterior
            if (prev.some(a => a.id === activity.id)) {
                return prev;
            }
            return [...prev, activity];
        });
    };

    // Função para remover atividade do plano
    const handleRemoveActivity = (e: React.MouseEvent, id: number) => {
        e.preventDefault();
        e.stopPropagation();
        setPlanActivities(prev => prev.filter(a => a.id !== id));
    };

    // Função para gerar o PDF (Janela de Impressão)
    const handleGeneratePDF = (e: React.MouseEvent) => {
        e.preventDefault();
        
        if (!selectedPatient) {
            alert('Por favor, selecione um paciente no menu lateral antes de gerar o plano.');
            return;
        }

        if (planActivities.length === 0) {
            alert('Adicione pelo menos uma atividade ao plano clicando no botão "+" das atividades sugeridas.');
            return;
        }

        const date = new Date().toLocaleDateString('pt-BR');
        
        // Abre a janela
        const printWindow = window.open('', '_blank', 'width=800,height=600');

        if (!printWindow) {
            alert('O navegador bloqueou a abertura da janela de impressão. Por favor, permita pop-ups para este site.');
            return;
        }

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Plano de Intervenção - ${selectedPatient}</title>
                <style>
                    body { font-family: 'Helvetica', Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
                    .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
                    .logo { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 5px; }
                    .subtitle { font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
                    .info-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
                    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                    .info-label { font-weight: bold; color: #475569; }
                    .section-title { font-size: 18px; font-weight: bold; color: #1e293b; margin-top: 30px; margin-bottom: 15px; border-left: 4px solid #2563eb; padding-left: 10px; }
                    .activity-item { margin-bottom: 25px; page-break-inside: avoid; }
                    .activity-header { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 5px; }
                    .activity-name { font-weight: bold; font-size: 16px; color: #0f172a; }
                    .activity-duration { font-size: 12px; font-weight: bold; color: #2563eb; background: #dbeafe; padding: 2px 8px; border-radius: 10px; }
                    .activity-category { font-size: 12px; color: #64748b; font-style: italic; margin-bottom: 5px; }
                    .activity-desc { color: #334155; }
                    .signature-section { margin-top: 80px; display: flex; justify-content: space-between; }
                    .signature-line { border-top: 1px solid #94a3b8; width: 40%; padding-top: 10px; text-align: center; font-size: 12px; color: #64748b; }
                    .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #cbd5e1; border-top: 1px solid #f1f5f9; padding-top: 20px; }
                    @media print {
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">PsiCuidar</div>
                    <div class="subtitle">Plano de Intervenção Psicopedagógica</div>
                </div>

                <div class="info-box">
                    <div class="info-row">
                        <span><span class="info-label">Paciente:</span> ${selectedPatient}</span>
                        <span><span class="info-label">Data:</span> ${date}</span>
                    </div>
                    <div class="info-row">
                        <span><span class="info-label">Profissional:</span> Dra. Ana Silva</span>
                        <span><span class="info-label">Registro:</span> 12345/BR</span>
                    </div>
                </div>

                <div class="section-title">Atividades Planejadas</div>
                
                ${planActivities.map((act, index) => `
                    <div class="activity-item">
                        <div class="activity-header">
                            <span class="activity-name">${index + 1}. ${act.title}</span>
                            <span class="activity-duration">${act.duration}</span>
                        </div>
                        <div class="activity-category">Área: ${act.category}</div>
                        <div class="activity-desc">${act.description}</div>
                    </div>
                `).join('')}

                <div class="section-title">Observações Clínicas</div>
                <div style="border: 1px dashed #cbd5e1; height: 100px; border-radius: 4px; margin-bottom: 20px;"></div>

                <div class="signature-section">
                    <div class="signature-line">Assinatura do Responsável</div>
                    <div class="signature-line">Assinatura do Profissional</div>
                </div>

                <div class="footer">
                    Documento gerado eletronicamente pelo sistema PsiCuidar em ${new Date().toLocaleString('pt-BR')}
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close(); // Importante para terminar o carregamento
        printWindow.focus(); // Necessário para alguns navegadores

        // Pequeno delay para garantir que estilos carreguem antes de imprimir
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
            <div className="mb-8 text-center lg:text-left">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Intervenção e Recursos</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Banco de estratégias para suas sessões.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lista de Atividades */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 text-center lg:text-left">Atividades Sugeridas</h2>
                    {activities.map(activity => {
                        const isAdded = planActivities.some(a => a.id === activity.id);
                        return (
                            <div key={activity.id} className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all flex justify-between items-center group">
                                <div className="flex-1 pr-4">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 uppercase">{activity.category}</span>
                                        <span className="text-xs text-gray-400 flex items-center">
                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {activity.duration}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-blue-600 transition-colors">{activity.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.description}</p>
                                </div>
                                <button 
                                    onClick={(e) => handleAddActivity(e, activity)}
                                    disabled={isAdded}
                                    className={`flex-shrink-0 p-3 rounded-full transition-all duration-200 transform active:scale-95 ${
                                        isAdded 
                                        ? 'bg-green-100 text-green-600 cursor-default ring-2 ring-green-200' 
                                        : 'bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-600'
                                    }`}
                                    title={isAdded ? "Atividade já adicionada" : "Adicionar ao Plano"}
                                >
                                    {isAdded ? (
                                        <svg className="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    ) : (
                                        <svg className="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Painel Lateral - Planejamento Rápido */}
                <div className="lg:col-span-1">
                    <div className="bg-blue-600 rounded-xl shadow-lg p-6 text-white sticky top-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Planejamento</h2>
                            <span className="bg-blue-700 text-xs px-2 py-1 rounded-full">{planActivities.length} atividades</span>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-blue-100 mb-1">Paciente</label>
                                <select 
                                    className="w-full p-2 rounded bg-blue-700 border border-blue-500 text-white focus:ring-2 focus:ring-white outline-none cursor-pointer"
                                    value={selectedPatient}
                                    onChange={(e) => setSelectedPatient(e.target.value)}
                                >
                                    <option value="" className="text-gray-500">Selecione o paciente...</option>
                                    <option value="João Silva">João Silva</option>
                                    <option value="Maria Oliveira">Maria Oliveira</option>
                                    <option value="Pedro Santos">Pedro Santos</option>
                                </select>
                            </div>
                            
                            <div className={`border-2 border-dashed border-blue-400 rounded-lg p-4 min-h-[150px] transition-all ${planActivities.length > 0 ? 'bg-blue-700 border-transparent' : 'bg-blue-700/30 flex items-center justify-center text-center'}`}>
                                {planActivities.length === 0 ? (
                                    <div className="text-blue-200">
                                        <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                        <p className="text-sm">Clique no <span className="font-bold">+</span> nas atividades ao lado para adicionar ao plano</p>
                                    </div>
                                ) : (
                                    <ul className="space-y-2">
                                        {planActivities.map(act => (
                                            <li key={act.id} className="bg-blue-800 rounded p-2 text-sm flex justify-between items-center group animate-fade-in-up">
                                                <span className="truncate pr-2 font-medium">{act.title}</span>
                                                <button 
                                                    onClick={(e) => handleRemoveActivity(e, act.id)}
                                                    className="text-blue-300 hover:text-red-300 p-1 rounded hover:bg-blue-900 transition-colors"
                                                    title="Remover atividade"
                                                >
                                                    <svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <button 
                                onClick={handleGeneratePDF}
                                className={`w-full py-3 font-bold rounded-lg shadow-lg transition-all transform active:scale-95 flex justify-center items-center ${
                                    selectedPatient && planActivities.length > 0 
                                    ? 'bg-white text-blue-600 hover:bg-gray-100' 
                                    : 'bg-blue-800 text-blue-400 cursor-not-allowed opacity-75'
                                }`}
                                disabled={!selectedPatient || planActivities.length === 0}
                                title={!selectedPatient ? "Selecione um paciente" : planActivities.length === 0 ? "Adicione atividades" : "Imprimir Plano"}
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                Gerar PDF do Plano
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Intervencao;
