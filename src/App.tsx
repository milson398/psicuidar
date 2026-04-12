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
import FuncionarioLogin from './components/FuncionarioLogin';
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

  // 🔥 ROTA DE LOGIN (PROFISSIONAL OU FUNCIONÁRIO)
  if (!isAuthenticated) {
    const isFuncRoute = window.location.pathname.includes('/funcionario');
    
    if (isFuncRoute) {
      return (
        <FuncionarioLogin 
          onLoginSuccess={() => {
            setIsAuthenticated(true);
            setIsFuncionario(true);
          }} 
        />
      );
    }
    return <ProfessionalLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // 🔥 RENDERIZA PÁGINA ATIVA COM OS DADOS NECESSÁRIOS
  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard':
        return <Dashboard appointments={appointments} onUpdateStatus={handleUpdateStatus} />;
      case 'Minha Agenda':
        return (
          <MinhaAgenda 
            appointments={appointments} 
            onAddAppointment={() => {}} 
            onEditAppointment={() => {}} 
            onDeleteAppointment={() => {}} 
          />
        );
      case 'Relatórios Gerenciais':
        return <Relatorios appointments={appointments} />;
      case 'Avaliação':
        return <Avaliacao />;
      case 'Intervencao':
      case 'Intervenção':
        return <Intervencao />;
      case 'Matrículas':
        return <Matriculas />;
      case 'Equipe':
        return <ControleFuncionarios />;
      case 'Controle de Pagamentos':
        return <Pagamentos />;
      case 'Configurações':
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
        onLogout={() => setIsAuthenticated(false)}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header 
          onLogout={() => setIsAuthenticated(false)}
          userProfile={{ name: 'Dra. Ana Silva', email: 'admin@psicuidar.com', role: 'Administradora' }}
          onMenuToggle={() => {}}
          onNavigate={setActivePage}
          currentPage={activePage}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 scroll-smooth">
          <div className="min-h-full">
             {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;