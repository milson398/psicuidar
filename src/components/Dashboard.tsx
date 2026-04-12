
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
    const baseClasses = "flex-1 py-4 px-2 text-sm sm:text-base rounded-lg font-black text-white transition-all duration-300 focus:outline-none shadow-xl transform active:scale-95 whitespace-nowrap border-2";

    if (status === AppointmentStatus.PENDENTE) {
      if (!isViewed) {
         return `${baseClasses} bg-blue-600 border-blue-400 animate-neon-blue`;
      }
      return `${baseClasses} bg-blue-600 border-blue-700 hover:bg-blue-700 opacity-90`;
    }

    if (buttonType === 'confirm') {
      if (status === AppointmentStatus.CONFIRMADO && !isViewed) {
        return `${baseClasses} bg-green-700 border-green-400 animate-neon-green`;
      }
      return `${baseClasses} bg-green-600 border-green-700 hover:bg-green-700 opacity-90`;
    }

    if (buttonType === 'cancel') {
      if (status === AppointmentStatus.CANCELADO && !isViewed) {
        return `${baseClasses} bg-red-700 border-red-400 animate-neon-red`;
      }
      return `${baseClasses} bg-red-600 border-red-700 hover:bg-red-700 opacity-90`;
    }

    if (buttonType === 'reschedule') {
      if (status === AppointmentStatus.REMARCAR && !isViewed) {
        return `${baseClasses} bg-yellow-700 border-yellow-400 animate-neon-yellow`;
      }
      return `${baseClasses} bg-yellow-600 border-yellow-700 hover:bg-yellow-700 opacity-90`;
    }

    return baseClasses;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden transform hover:-translate-y-1">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{appointment.studentName}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{appointment.sessionType}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusPill(appointment.status)}`}>
            {appointment.status}
          </span>
        </div>

        <div className="flex items-center text-gray-600 dark:text-gray-300 mb-6 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
          <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="font-medium text-sm">
            {appointment.dateTime.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })} às {appointment.dateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onUpdateStatus(appointment.id, AppointmentStatus.CONFIRMADO)}
            className={getButtonClasses(appointment.status, 'confirm', appointment.isViewed || false)}
          >
            Confirmar
          </button>
          <button
            onClick={() => onUpdateStatus(appointment.id, AppointmentStatus.CANCELADO)}
            className={getButtonClasses(appointment.status, 'cancel', appointment.isViewed || false)}
          >
            Cancelar
          </button>
          <button
            onClick={() => onUpdateStatus(appointment.id, AppointmentStatus.REMARCAR)}
            className={getButtonClasses(appointment.status, 'reschedule', appointment.isViewed || false)}
          >
            Remarcar
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
    <div className="container mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-8">
      <div className="mb-10 text-center lg:text-left">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Olá, {appointments.length > 0 ? 'Dra. Ana Silva' : 'bem-vinda'}! Veja seus agendamentos para hoje.</p>
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
