import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import MinhaAgenda from './components/MinhaAgenda';
import Relatorios from './components/Relatorios';
import Avaliacao from './components/Avaliacao';
import Intervencao from './components/Intervencao';
import Matriculas from './components/Matriculas';
import ControleFuncionarios from './components/ControleFuncionarios';
import Pagamentos from './components/Pagamentos';
import Configuracoes from './components/Configuracoes';
import ProfessionalLogin from './components/ProfessionalLogin';
import { Appointment, AppointmentStatus } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFuncionario, setIsFuncionario] = useState(false);
  const [activePage, setActivePage] = useState('Dashboard');
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      studentName: 'João Silva',
      sessionType: 'Avaliação',
      dateTime: new Date(2024, 3, 10, 14, 0),
      status: AppointmentStatus.PENDENTE,
      isViewed: false
    },
    {
      id: '2',
      studentName: 'Maria Oliveira',
      sessionType: 'Intervenção',
      dateTime: new Date(2024, 3, 10, 15, 0),
      status: AppointmentStatus.CONFIRMADO,
      isViewed: true
    }
  ]);

  const handleUpdateStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(app => 
      app.id === id ? { ...app, status, isViewed: true } : app
    ));
  };

  // 🔥 TELA DE LOGIN PROFISSIONAL (INICIAL)
  if (!isAuthenticated) {
    return <ProfessionalLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // 🔥 RENDERIZA PÁGINA ATIVA COM OS DADOS NECESSÁRIOS
  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard':
        return <Dashboard appointments={appointments} onUpdateStatus={handleUpdateStatus} />;
      case 'MinhaAgenda':
        return (
          <MinhaAgenda 
            appointments={appointments} 
            onAddAppointment={() => {}} 
            onEditAppointment={() => {}} 
            onDeleteAppointment={() => {}} 
          />
        );
      case 'Relatorios':
        return <Relatorios appointments={appointments} />;
      case 'Avaliacao':
        return <Avaliacao />;
      case 'Intervencao':
        return <Intervencao />;
      case 'Matriculas':
        return <Matriculas />;
      case 'ControleFuncionarios':
        return <ControleFuncionarios />;
      case 'Pagamentos':
        return <Pagamentos />;
      case 'Configuracoes':
        return (
          <Configuracoes 
            userProfile={{ name: 'Dra. Ana Silva', email: 'admin@psicuidar.com', role: 'Administradora' }}
            onUpdateProfile={() => {}}
            currentTheme="dark"
            onUpdateTheme={() => {}}
            onUpdateNotificationSettings={() => {}}
            onSyncGoogleCalendar={() => {}}
          />
        );
      default:
        return <Dashboard appointments={appointments} onUpdateStatus={handleUpdateStatus} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isFuncionario={isFuncionario}
        themeColor="#2563eb"
        isOpen={true}
        onClose={() => {}}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <Header 
          onLogout={() => setIsAuthenticated(false)}
          userProfile={{ name: 'Dra. Ana Silva', email: 'admin@psicuidar.com', role: 'Administradora' }}
          onMenuToggle={() => {}}
          onNavigate={setActivePage}
          currentPage={activePage}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;