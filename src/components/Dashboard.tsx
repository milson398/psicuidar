import React, { useState } from 'react';
import { Appointment, AppointmentStatus } from '../types';

interface DashboardProps {
  appointments: Appointment[];
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  userName?: string;
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

  const getButtonClasses = (currentStatus: AppointmentStatus, buttonType: 'confirm' | 'cancel' | 'reschedule', isViewed: boolean) => {
    const baseClasses = "flex-1 py-4 px-2 text-sm sm:text-base rounded-lg font-black text-white transition-all duration-300 focus:outline-none shadow-xl transform active:scale-95 whitespace-nowrap border-2";
    if (!isViewed) {
      if (currentStatus === AppointmentStatus.PENDENTE) return `${baseClasses} bg-blue-600 border-blue-400 animate-neon-blue`;
      if (buttonType === 'confirm' && currentStatus === AppointmentStatus.CONFIRMADO) return `${baseClasses} bg-green-700 border-green-400 animate-neon-green`;
      if (buttonType === 'cancel' && currentStatus === AppointmentStatus.CANCELADO) return `${baseClasses} bg-red-700 border-red-400 animate-neon-red`;
      if (buttonType === 'reschedule' && currentStatus === AppointmentStatus.REMARCAR) return `${baseClasses} bg-yellow-700 border-yellow-400 animate-neon-yellow`;
    }
    switch(buttonType) {
      case 'confirm': return `${baseClasses} bg-green-600 border-green-700 hover:bg-green-700 opacity-90`;
      case 'cancel': return `${baseClasses} bg-red-600 border-red-700 hover:bg-red-700 opacity-90`;
      case 'reschedule': return `${baseClasses} bg-yellow-600 border-yellow-700 hover:bg-yellow-700 opacity-90`;
      default: return baseClasses;
    }
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
          <button onClick={() => onUpdateStatus(appointment.id, AppointmentStatus.CONFIRMADO)} className={getButtonClasses(appointment.status, 'confirm', !!appointment.isViewed)}>Confirmar</button>
          <button onClick={() => onUpdateStatus(appointment.id, AppointmentStatus.CANCELADO)} className={getButtonClasses(appointment.status, 'cancel', !!appointment.isViewed)}>Cancelar</button>
          <button onClick={() => onUpdateStatus(appointment.id, AppointmentStatus.REMARCAR)} className={getButtonClasses(appointment.status, 'reschedule', !!appointment.isViewed)}>Remarcar</button>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ appointments, onUpdateStatus, userName = 'Profissional' }) => {
  const [showSecurityNotice, setShowSecurityNotice] = useState(true);

  const sortedAppointments = [...appointments].sort((a, b) => {
    if (a.status === AppointmentStatus.PENDENTE && b.status !== AppointmentStatus.PENDENTE) return -1;
    if (a.status !== AppointmentStatus.PENDENTE && b.status === AppointmentStatus.PENDENTE) return 1;
    return a.dateTime.getTime() - b.dateTime.getTime();
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 pt-16 pb-8 custom-scrollbar">
      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-3xl font-extrabold text-[#11ba82] dark:text-[#11ba82] tracking-tight">Dashboard</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium">Olá, {userName}! Veja seus agendamentos para hoje.</p>
      </div>

      {/* 🛡️ Aviso de Segurança Discreto */}
      {showSecurityNotice && (
        <div className="mb-10 animate-fade-in">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center space-x-4 text-center sm:text-left">
              <div className="bg-blue-500/20 p-2 rounded-lg text-xl">🛡️</div>
              <div>
                <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">Proteja sua conta</h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">Para sua segurança, recomendamos a troca periódica da sua senha de acesso.</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
               <button 
                onClick={() => setShowSecurityNotice(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs font-semibold px-3 py-2 transition-colors"
               >
                 Agora não
               </button>
               <button 
                onClick={() => setShowSecurityNotice(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md transition-all active:scale-95"
               >
                 Trocar Senha
               </button>
            </div>
          </div>
        </div>
      )}

      {sortedAppointments.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 text-gray-500">Nenhum agendamento encontrado.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedAppointments.map(app => <AppointmentCard key={app.id} appointment={app} onUpdateStatus={onUpdateStatus} />)}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
