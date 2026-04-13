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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('Dashboard');
  const [userName, setUserName] = useState('Dra. Ana Silva');
  const [userEmail, setUserEmail] = useState('admin@psicuidar.com');
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
          onLoginSuccess={(name) => {
            setIsAuthenticated(true);
            setIsFuncionario(true);
            if (name) setUserName(name);
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
        return <Dashboard appointments={appointments} onUpdateStatus={handleUpdateStatus} userName={userName} />;
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
            userProfile={{ name: userName, email: userEmail, role: isFuncionario ? 'Funcionário' : 'Administradora' }}
            onUpdateProfile={() => {}}
            currentTheme="dark"
            onUpdateTheme={() => {}}
            onSyncGoogleCalendar={() => {}}
          />
        );
      default:
        return <Dashboard appointments={appointments} onUpdateStatus={handleUpdateStatus} userName={userName} />;
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsFuncionario(false);
    setUserName('Dra. Ana Silva');
    setUserEmail('admin@psicuidar.com');
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isFuncionario={isFuncionario}
        themeColor="blue"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header 
          onLogout={handleLogout}
          userProfile={{ name: userName, email: userEmail, role: isFuncionario ? 'Funcionário' : 'Administradora' }}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onNavigate={setActivePage}
          currentPage={activePage}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 scroll-smooth custom-scrollbar">
          <div className="min-h-full">
             {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;