import React, { useMemo, useState } from 'react';
import { Appointment, AppointmentStatus } from '../../types';

interface RelatoriosProps {
    appointments: Appointment[];
}

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    color: string;
    icon: React.ReactNode;
    onClick: () => void;
    isActive: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, color, icon, onClick, isActive }) => (
    <button
        onClick={onClick}
        className={`w-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 transition-all duration-200 text-left relative overflow-hidden group hover:-translate-y-1 ${isActive ? 'ring-2 ring-offset-2 dark:ring-offset-gray-900' : 'opacity-80 hover:opacity-100'}`}
        style={{ borderColor: color, '--tw-ring-color': color } as React.CSSProperties}
    >
        <div className="flex justify-between items-start z-10 relative">
            <div>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{title}</p>
                <h3 className="text-3xl font-extrabold text-gray-800 dark:text-white mt-1">{value}</h3>
                <p className="text-xs text-gray-500 mt-2 font-medium">{subtitle}</p>
            </div>
            <div className={`p-3 rounded-full ${isActive ? 'opacity-100' : 'opacity-30'} group-hover:opacity-100 transition-opacity`} style={{ backgroundColor: `${color}20`, color: color }}>
                {icon}
            </div>
        </div>
        {/* Indicador de Seleção */}
        {isActive && (
            <div className="absolute top-0 right-0 w-3 h-3 m-2 rounded-full" style={{ backgroundColor: color }}></div>
        )}
    </button>
);

const Relatorios: React.FC<RelatoriosProps> = ({ appointments }) => {
    const [showAll, setShowAll] = useState(false);

    // Estado para filtro de data (Mês atual como padrão)
    const today = new Date();
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

    // Estado para filtro ativo (Qual card foi clicado)
    // Types: 'ALL', 'CONFIRMED', 'CANCELED', 'REVENUE'
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'CONFIRMED' | 'CANCELED' | 'REVENUE'>('ALL');

    // 1. Filtrar Agendamentos pelo Mês Selecionado
    const monthlyAppointments = useMemo(() => {
        return appointments.filter(app => {
            const appDateStr = `${app.dateTime.getFullYear()}-${String(app.dateTime.getMonth() + 1).padStart(2, '0')}`;
            return appDateStr === selectedMonth;
        });
    }, [appointments, selectedMonth]);

    // 2. Calcular Estatísticas baseadas no Mês
    const stats = useMemo(() => {
        const total = monthlyAppointments.length;

        // Consideramos Confirmado e Realizado como sucesso/receita
        const confirmedOrRealized = monthlyAppointments.filter(a =>
            a.status === AppointmentStatus.CONFIRMADO || a.status === AppointmentStatus.REALIZADO
        );
        const confirmedCount = confirmedOrRealized.length;

        const canceledCount = monthlyAppointments.filter(a => a.status === AppointmentStatus.CANCELADO).length;

        // Simulação de faturamento (Ex: R$ 150,00 por sessão realizada/confirmada)
        const estimatedRevenue = confirmedCount * 150;

        // Taxa de comparecimento
        const attendanceRate = total > 0 ? Math.round((confirmedCount / total) * 100) : 0;

        return { total, confirmedCount, canceledCount, estimatedRevenue, attendanceRate };
    }, [monthlyAppointments]);

    // 3. Filtrar a Lista de Exibição baseada no Card Ativo (Drill-down)
    const filteredList = useMemo(() => {
        switch (activeFilter) {
            case 'CONFIRMED':
            case 'REVENUE': // Receita mostra os confirmados/realizados
                return monthlyAppointments.filter(a => a.status === AppointmentStatus.CONFIRMADO || a.status === AppointmentStatus.REALIZADO);
            case 'CANCELED':
                return monthlyAppointments.filter(a => a.status === AppointmentStatus.CANCELADO);
            case 'ALL':
            default:
                // Se o filtro for 'ALL', o usuário espera ver todos os agendamentos (historico completo)
                // como solicitado na conversa anterior.
                return appointments;
        }
    }, [monthlyAppointments, appointments, activeFilter]);

    const displayedAppointments = showAll ? filteredList : filteredList.slice(0, 5);

    // Formatar mês para exibição
    const getMonthName = (dateStr: string) => {
        const [year, month] = dateStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Relatórios Gerenciais</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Dados referentes a <span className="font-bold text-blue-600 dark:text-blue-400 capitalize">{getMonthName(selectedMonth)}</span>
                    </p>
                </div>

                {/* Seletor de Mês */}
                <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => {
                            setSelectedMonth(e.target.value);
                            setActiveFilter('ALL'); // Reseta filtro ao mudar o mês
                        }}
                        className="bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-200 font-medium text-sm outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Agendado"
                    value={appointments.length}
                    subtitle="Clique para ver todos"
                    color="#3b82f6" // Blue
                    icon={<svg className="w-6 h-6 text-blue-800" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>}
                    onClick={() => setActiveFilter('ALL')}
                    isActive={activeFilter === 'ALL'}
                />
                <StatCard
                    title="Taxa de Confirmação"
                    value={`${stats.attendanceRate}%`}
                    subtitle={`${stats.confirmedCount} efetivados`}
                    color="#10b981" // Green
                    icon={<svg className="w-6 h-6 text-green-800" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                    onClick={() => setActiveFilter('CONFIRMED')}
                    isActive={activeFilter === 'CONFIRMED'}
                />
                <StatCard
                    title="Cancelamentos"
                    value={stats.canceledCount}
                    subtitle="Clique para filtrar"
                    color="#ef4444" // Red
                    icon={<svg className="w-6 h-6 text-red-800" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>}
                    onClick={() => setActiveFilter('CANCELED')}
                    isActive={activeFilter === 'CANCELED'}
                />
                <StatCard
                    title="Receita Estimada"
                    value={`R$ ${stats.estimatedRevenue.toLocaleString('pt-BR')}`}
                    subtitle="Filtrar realizados"
                    color="#f59e0b" // Yellow/Gold
                    icon={<svg className="w-6 h-6 text-yellow-800" fill="currentColor" viewBox="0 0 20 20"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.699c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" /></svg>}
                    onClick={() => setActiveFilter('REVENUE')}
                    isActive={activeFilter === 'REVENUE'}
                />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                        {activeFilter === 'ALL' && 'Todos os Atendimentos'}
                        {activeFilter === 'CONFIRMED' && 'Atendimentos Confirmados / Realizados'}
                        {activeFilter === 'CANCELED' && 'Atendimentos Cancelados'}
                        {activeFilter === 'REVENUE' && 'Atendimentos Faturáveis'}
                    </h2>
                    <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                        {filteredList.length} registro(s)
                    </span>
                </div>

                {filteredList.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600">
                        <p>Nenhum atendimento encontrado para este filtro neste mês.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Aluno</th>
                                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Data</th>
                                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Tipo</th>
                                        <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {displayedAppointments.map((app) => (
                                        <tr key={app.id}>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{app.studentName}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{app.dateTime.toLocaleDateString('pt-BR')}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{app.sessionType}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-center">
                                                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-bold rounded-full 
                                ${app.status === AppointmentStatus.CONFIRMADO ? 'bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-200' :
                                                        app.status === AppointmentStatus.CANCELADO ? 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200' :
                                                            'bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredList.length > 5 && (
                            <div className="mt-4 text-center">
                                <button
                                    onClick={() => setShowAll(!showAll)}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none"
                                >
                                    {showAll ? 'Ver menos' : 'Ver todos os atendimentos'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Relatorios;
