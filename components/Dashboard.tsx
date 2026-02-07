
import React from 'react';
import { Appointment, AppointmentStatus } from '../types';

interface DashboardProps {
  appointments: Appointment[];
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
}

const AppointmentCard: React.FC<{ appointment: Appointment, onUpdateStatus: (id: string, status: AppointmentStatus) => void }> = ({ appointment, onUpdateStatus }) => {
  const getStatusPill = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.CONFIRMADO: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border border-green-200 dark:border-green-700';
      case AppointmentStatus.CANCELADO: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border border-red-200 dark:border-red-700';
      case AppointmentStatus.REMARCAR: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700';
      case AppointmentStatus.REALIZADO: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-700';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getButtonClasses = (status: AppointmentStatus, buttonType: 'confirm' | 'cancel' | 'reschedule', isViewed: boolean) => {
    // Adicionado whitespace-nowrap para impedir quebra de linha do texto do botão
    const baseClasses = "flex-1 py-2 px-1 text-xs sm:text-sm rounded-lg font-bold text-white transition-all duration-300 focus:outline-none shadow-md transform active:scale-95 whitespace-nowrap";

    // O NEON SÓ ATIVA SE O PSICOPEDAGOGO AINDA NÃO VIU A RESPOSTA (isViewed === false)
    if (status === AppointmentStatus.PENDENTE && !isViewed) {
      return `${baseClasses} bg-blue-600 animate-neon-blue`;
    }

    if (buttonType === 'confirm') {
      if (status === AppointmentStatus.CONFIRMADO && !isViewed) {
        return `${baseClasses} animate-neon-green`;
      }
      return `${baseClasses} bg-green-600 hover:bg-green-700 text-white`;
    }

    if (buttonType === 'cancel') {
      if (status === AppointmentStatus.CANCELADO && !isViewed) {
        return `${baseClasses} animate-neon-red`;
      }
      return `${baseClasses} bg-red-600 hover:bg-red-700 text-white`;
    }

    if (buttonType === 'reschedule') {
      if (status === AppointmentStatus.REMARCAR && !isViewed) {
        return `${baseClasses} animate-neon-yellow`;
      }
      return `${baseClasses} bg-yellow-600 hover:bg-yellow-700 text-white`;
    }

    return baseClasses;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col h-full">
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="overflow-hidden">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate" title={appointment.patientName}>
              {appointment.patientName}
            </h3>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
              {appointment.sessionType}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${getStatusPill(appointment.status)}`}>
              {appointment.status}
            </span>
          </div>
        </div>

        <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
          <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide">Data e Horário</span>
            <span className="font-mono text-sm font-medium">
              {appointment.dateTime.toLocaleDateString('pt-BR')} <span className="mx-1">•</span> {appointment.dateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700/20 p-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex gap-2">
          <button
            className={getButtonClasses(appointment.status, 'confirm', !!appointment.isViewed)}
            onClick={() => onUpdateStatus(appointment.id, AppointmentStatus.CONFIRMADO)}
            title="Confirmar"
          >
            {appointment.status === AppointmentStatus.CONFIRMADO ? 'CONFIRMADO' : 'CONFIRMAR'}
          </button>
          <button
            className={getButtonClasses(appointment.status, 'cancel', !!appointment.isViewed)}
            onClick={() => onUpdateStatus(appointment.id, AppointmentStatus.CANCELADO)}
            title="Cancelar"
          >
            {appointment.status === AppointmentStatus.CANCELADO ? 'CANCELADO' : 'CANCELAR'}
          </button>
          <button
            className={getButtonClasses(appointment.status, 'reschedule', !!appointment.isViewed)}
            onClick={() => onUpdateStatus(appointment.id, AppointmentStatus.REMARCAR)}
            title="Remarcar"
          >
            {appointment.status === AppointmentStatus.REMARCAR ? 'REMARCADO' : 'REMARCAR'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ appointments, onUpdateStatus }) => {
  // Ordenar: Pendentes primeiro, depois data mais próxima
  const sortedAppointments = [...appointments].sort((a, b) => {
    if (a.status === AppointmentStatus.PENDENTE && b.status !== AppointmentStatus.PENDENTE) return -1;
    if (a.status !== AppointmentStatus.PENDENTE && b.status === AppointmentStatus.PENDENTE) return 1;
    return a.dateTime.getTime() - b.dateTime.getTime();
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Painel de Controle</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Gerencie os status dos agendamentos em tempo real.</p>
      </div>

      {sortedAppointments.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 text-lg">Nenhum agendamento encontrado.</p>
        </div>
      ) : (
        // Alterado de md:grid-cols-2 para lg:grid-cols-2 para garantir que tablets (md) fiquem com 1 coluna
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedAppointments.map(app => (
            <AppointmentCard key={app.id} appointment={app} onUpdateStatus={onUpdateStatus} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
